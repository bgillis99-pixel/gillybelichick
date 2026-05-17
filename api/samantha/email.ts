import { google } from 'googleapis';

// Samantha authenticates as samantha@norcalcarbmobile.com and has been
// granted Gmail delegation to bryan@norcalcarbmobile.com at the Workspace
// level. That means she can call the Gmail API with `userId: 'bryan@...'`
// using her own OAuth creds. Default to Bryan's inbox since that's what
// she's usually being asked about; override per-tool via `mailbox` param.
const DEFAULT_MAILBOX = process.env.DEFAULT_MAILBOX || 'bryan@norcalcarbmobile.com';

const GMAIL_SCOPES = [
  'https://www.googleapis.com/auth/gmail.readonly',
  'https://www.googleapis.com/auth/gmail.compose',
  'https://www.googleapis.com/auth/gmail.send',
];

// Returns the right auth client plus the right userId for the Gmail API.
//   - Service account + DWD: subject = the mailbox owner, userId = 'me'.
//   - OAuth refresh token: single user, userId = mailbox (delegation).
// Set GOOGLE_SERVICE_ACCOUNT_KEY to the full JSON key (as a string) in
// Vercel env vars to flip to service-account mode. One-time Workspace
// Admin grant of GMAIL_SCOPES against this SA's client ID required.
function getMailboxAuth(mailbox: string) {
  const saJson = process.env.GOOGLE_SERVICE_ACCOUNT_KEY;
  if (saJson) {
    const credentials = JSON.parse(saJson);
    const auth = new google.auth.JWT({
      email: credentials.client_email,
      key: credentials.private_key,
      scopes: GMAIL_SCOPES,
      subject: mailbox,
    });
    return { auth, userId: 'me' as const };
  }
  const client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
  );
  client.setCredentials({ refresh_token: process.env.GOOGLE_REFRESH_TOKEN });
  return { auth: client, userId: mailbox };
}

function credsConfigured(): boolean {
  return Boolean(
    process.env.GOOGLE_SERVICE_ACCOUNT_KEY ||
    (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_REFRESH_TOKEN),
  );
}

function decodeBase64(data: string): string {
  return Buffer.from(data.replace(/-/g, '+').replace(/_/g, '/'), 'base64').toString('utf-8');
}

function getHeader(headers: any[], name: string): string {
  const header = headers?.find((h: any) => h.name.toLowerCase() === name.toLowerCase());
  return header?.value || '';
}

export const config = {
  maxDuration: 15,
};

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { action, params } = req.body;

    if (!credsConfigured()) {
      return res.status(500).json({ error: 'Gmail credentials not configured. Set GOOGLE_SERVICE_ACCOUNT_KEY (preferred) or GOOGLE_CLIENT_ID + GOOGLE_REFRESH_TOKEN.' });
    }

    const mailbox = params?.mailbox || DEFAULT_MAILBOX;
    const { auth, userId } = getMailboxAuth(mailbox);
    const gmail = google.gmail({ version: 'v1', auth });

    if (action === 'search_emails') {
      const { query, max_results = 5 } = params;

      const listResponse = await gmail.users.messages.list({
        userId,
        q: query,
        maxResults: Math.min(max_results, 10),
      });

      const messageIds = listResponse.data.messages || [];
      const emails = [];

      for (const msg of messageIds) {
        const detail = await gmail.users.messages.get({
          userId,
          id: msg.id!,
          format: 'metadata',
          metadataHeaders: ['From', 'Subject', 'Date'],
        });

        emails.push({
          id: detail.data.id,
          from: getHeader(detail.data.payload?.headers || [], 'From'),
          subject: getHeader(detail.data.payload?.headers || [], 'Subject'),
          snippet: detail.data.snippet || '',
          date: getHeader(detail.data.payload?.headers || [], 'Date'),
          unread: (detail.data.labelIds || []).includes('UNREAD'),
        });
      }

      return res.status(200).json({ emails, count: emails.length, mailbox });
    }

    if (action === 'read_email') {
      const { message_id } = params;

      const detail = await gmail.users.messages.get({
        userId,
        id: message_id,
        format: 'full',
      });

      const headers = detail.data.payload?.headers || [];
      let body = '';

      // Try to get plain text body
      if (detail.data.payload?.body?.data) {
        body = decodeBase64(detail.data.payload.body.data);
      } else if (detail.data.payload?.parts) {
        const textPart = detail.data.payload.parts.find(
          (p) => p.mimeType === 'text/plain'
        );
        if (textPart?.body?.data) {
          body = decodeBase64(textPart.body.data);
        } else {
          const htmlPart = detail.data.payload.parts.find(
            (p) => p.mimeType === 'text/html'
          );
          if (htmlPart?.body?.data) {
            body = decodeBase64(htmlPart.body.data)
              .replace(/<[^>]*>/g, ' ')
              .replace(/\s+/g, ' ')
              .trim();
          }
        }
      }

      return res.status(200).json({
        id: detail.data.id,
        from: getHeader(headers, 'From'),
        to: getHeader(headers, 'To'),
        subject: getHeader(headers, 'Subject'),
        date: getHeader(headers, 'Date'),
        body: body.substring(0, 3000), // Limit body length
      });
    }

    if (action === 'draft_email') {
      const { to, subject, body } = params;

      const raw = Buffer.from(
        `To: ${to}\r\nSubject: ${subject}\r\nContent-Type: text/plain; charset=utf-8\r\n\r\n${body}`
      ).toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');

      const response = await gmail.users.drafts.create({
        userId,
        requestBody: {
          message: { raw },
        },
      });

      return res.status(200).json({
        draft_id: response.data.id,
        mailbox,
        message: `Draft created in ${mailbox}: "${subject}" to ${to}`,
      });
    }

    return res.status(400).json({ error: `Unknown action: ${action}` });
  } catch (error: any) {
    console.error('Email API error:', error);
    return res.status(500).json({
      error: 'Failed to access email',
      details: error.message,
    });
  }
}
