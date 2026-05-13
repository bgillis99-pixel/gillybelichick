import { google } from 'googleapis';

// Samantha's Drive access. She authenticates as samantha@norcalcarbmobile.com
// and can read anything in her own Drive OR anything shared with her (Bryan
// shares business folders with her when she needs them).
//
// Handles: Google Docs, Sheets, Slides via native Drive export, real PDFs
// via pdf-parse, plain text straight through.

const DRIVE_SCOPES = ['https://www.googleapis.com/auth/drive.readonly'];

// Service account + DWD preferred. Subject = the user whose Drive view we
// want (default samantha@). Drive returns the subject's files + anything
// shared with them.
function getOAuth2Client() {
  const saJson = process.env.GOOGLE_SERVICE_ACCOUNT_KEY;
  if (saJson) {
    const credentials = JSON.parse(saJson);
    return new google.auth.JWT({
      email: credentials.client_email,
      key: credentials.private_key,
      scopes: DRIVE_SCOPES,
      subject: process.env.DEFAULT_IMPERSONATE_USER || 'samantha@norcalcarbmobile.com',
    });
  }
  const client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
  );
  client.setCredentials({ refresh_token: process.env.GOOGLE_REFRESH_TOKEN });
  return client;
}

export const config = {
  maxDuration: 30,
};

const TEXT_EXPORT: Record<string, string> = {
  'application/vnd.google-apps.document': 'text/plain',
  'application/vnd.google-apps.spreadsheet': 'text/csv',
  'application/vnd.google-apps.presentation': 'text/plain',
};

async function extractText(drive: any, fileId: string, mimeType: string): Promise<string> {
  if (TEXT_EXPORT[mimeType]) {
    const r = await drive.files.export(
      { fileId, mimeType: TEXT_EXPORT[mimeType] },
      { responseType: 'text' }
    );
    return String(r.data || '');
  }

  if (mimeType === 'application/pdf') {
    const r = await drive.files.get(
      { fileId, alt: 'media' },
      { responseType: 'arraybuffer' }
    );
    const buf = Buffer.from(r.data as ArrayBuffer);
    // Import from the lib path, not the package index -- the index does
    // a debug read of a bundled test PDF at require time which fails in
    // some serverless bundlers. pdf-parse ships no types.
    // @ts-expect-error pdf-parse has no bundled type declarations
    const pdfParse = (await import('pdf-parse/lib/pdf-parse.js')).default;
    const parsed = await pdfParse(buf);
    return parsed.text;
  }

  if (mimeType.startsWith('text/') || mimeType === 'application/json') {
    const r = await drive.files.get(
      { fileId, alt: 'media' },
      { responseType: 'text' }
    );
    return String(r.data || '');
  }

  throw new Error(`Unsupported mime type: ${mimeType}. I can read Google Docs, Sheets, Slides, PDFs, and plain text files.`);
}

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { action, params } = req.body;

    if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_REFRESH_TOKEN) {
      return res.status(500).json({ error: 'Google Drive credentials not configured' });
    }

    const auth = getOAuth2Client();
    const drive = google.drive({ version: 'v3', auth });

    if (action === 'search_drive') {
      const { query, max_results = 10 } = params;
      // Build a Drive query: name/fulltext contains, not trashed.
      const q = `(name contains '${query.replace(/'/g, "\\'")}' or fullText contains '${query.replace(/'/g, "\\'")}') and trashed = false`;

      const response = await drive.files.list({
        q,
        pageSize: Math.min(max_results, 20),
        fields: 'files(id, name, mimeType, modifiedTime, owners(emailAddress), webViewLink)',
        orderBy: 'modifiedTime desc',
      });

      const files = (response.data.files || []).map((f: any) => ({
        id: f.id,
        name: f.name,
        mime_type: f.mimeType,
        modified: f.modifiedTime,
        owner: f.owners?.[0]?.emailAddress || null,
        link: f.webViewLink,
      }));

      return res.status(200).json({ files, count: files.length });
    }

    if (action === 'list_drive_files') {
      const { folder_id, shared_only, max_results = 20 } = params || {};
      let q: string;
      if (shared_only) {
        q = `sharedWithMe and trashed = false`;
      } else if (folder_id) {
        q = `'${folder_id}' in parents and trashed = false`;
      } else {
        // Default: her own root + anything shared with her (e.g. Bryan's
        // personal-Gmail Drive folders shared to samantha@).
        q = `('root' in parents or sharedWithMe) and trashed = false`;
      }

      const response = await drive.files.list({
        q,
        pageSize: Math.min(max_results, 50),
        fields: 'files(id, name, mimeType, modifiedTime, webViewLink, owners(emailAddress))',
        orderBy: 'modifiedTime desc',
      });

      const files = (response.data.files || []).map((f: any) => ({
        id: f.id,
        name: f.name,
        mime_type: f.mimeType,
        modified: f.modifiedTime,
        owner: f.owners?.[0]?.emailAddress || null,
        link: f.webViewLink,
      }));

      return res.status(200).json({ files, count: files.length });
    }

    if (action === 'read_drive_file') {
      const { file_id, max_chars = 6000 } = params;

      const meta = await drive.files.get({
        fileId: file_id,
        fields: 'id, name, mimeType, webViewLink',
      });

      const name = meta.data.name || 'Untitled';
      const mimeType = meta.data.mimeType || 'application/octet-stream';
      const link = meta.data.webViewLink || null;

      const text = await extractText(drive, file_id, mimeType);
      const truncated = text.length > max_chars;

      return res.status(200).json({
        id: file_id,
        name,
        mime_type: mimeType,
        link,
        content: text.slice(0, max_chars),
        truncated,
        total_chars: text.length,
      });
    }

    return res.status(400).json({ error: `Unknown action: ${action}` });
  } catch (error: any) {
    console.error('Drive API error:', error);
    return res.status(500).json({
      error: 'Failed to access Drive',
      details: error.message,
    });
  }
}
