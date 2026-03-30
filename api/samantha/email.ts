import { google } from 'googleapis';

function getOAuth2Client() {
  const client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET
  );
  client.setCredentials({
    refresh_token: process.env.GOOGLE_REFRESH_TOKEN,
  });
  return client;
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

    if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_REFRESH_TOKEN) {
      return res.status(500).json({ error: 'Gmail credentials not configured' });
    }

    const auth = getOAuth2Client();
    const gmail = google.gmail({ version: 'v1', auth });

    if (action === 'search_emails') {
      const { query, max_results = 5 } = params;

      const listResponse = await gmail.users.messages.list({
        userId: 'me',
        q: query,
        maxResults: Math.min(max_results, 10),
      });

      const messageIds = listResponse.data.messages || [];
      const emails = [];

      for (const msg of messageIds) {
        const detail = await gmail.users.messages.get({
          userId: 'me',
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

      return res.status(200).json({ emails, count: emails.length });
    }

    if (action === 'read_email') {
      const { message_id } = params;

      const detail = await gmail.users.messages.get({
        userId: 'me',
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
        userId: 'me',
        requestBody: {
          message: { raw },
        },
      });

      return res.status(200).json({
        draft_id: response.data.id,
        message: `Draft created: "${subject}" to ${to}`,
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
