import { google } from 'googleapis';

export const config = { maxDuration: 60 };

// Daily 6am Pacific morning digest.
// Pulls today's calendar + this week's retest-due events,
// formats a short text, sends via Twilio to Bryan.
//
// Triggered by Vercel cron (see vercel.json).
//
// Required env vars (degrades gracefully if missing):
//   GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, GOOGLE_REFRESH_TOKEN
//   TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_FROM_NUMBER, SAMANTHA_OWNER_PHONE
//
// Optional:
//   CRON_SECRET -- if set, requires "authorization: Bearer <CRON_SECRET>" header.
//                  Vercel automatically attaches this when you set the env var.
//   DEFAULT_CALENDAR_ID -- which calendar to read. Default: bryan@norcalcarbmobile.com.

function getOAuth2Client() {
  const client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
  );
  client.setCredentials({
    refresh_token: process.env.GOOGLE_REFRESH_TOKEN,
  });
  return client;
}

function fmtTime(iso: string | null | undefined): string {
  if (!iso) return 'all-day';
  const d = new Date(iso);
  return d.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    timeZone: 'America/Los_Angeles',
  });
}

async function fetchTodaysCalendar(): Promise<Array<{ summary: string; start: string }>> {
  if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_REFRESH_TOKEN) return [];
  const auth = getOAuth2Client();
  const calendar = google.calendar({ version: 'v3', auth });

  const now = new Date();
  const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const endOfDay = new Date(startOfDay.getTime() + 24 * 60 * 60 * 1000);

  const calendarId = process.env.DEFAULT_CALENDAR_ID || 'bryan@norcalcarbmobile.com';
  const resp = await calendar.events.list({
    calendarId,
    timeMin: startOfDay.toISOString(),
    timeMax: endOfDay.toISOString(),
    singleEvents: true,
    orderBy: 'startTime',
    maxResults: 20,
  });

  return (resp.data.items || []).map((e) => ({
    summary: e.summary || '(no title)',
    start: e.start?.dateTime || e.start?.date || '',
  }));
}

async function fetchRetestsThisWeek(): Promise<Array<{ summary: string; start: string }>> {
  if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_REFRESH_TOKEN) return [];
  const auth = getOAuth2Client();
  const calendar = google.calendar({ version: 'v3', auth });

  const now = new Date();
  const weekFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

  const calendarId = process.env.DEFAULT_CALENDAR_ID || 'bryan@norcalcarbmobile.com';
  const resp = await calendar.events.list({
    calendarId,
    timeMin: now.toISOString(),
    timeMax: weekFromNow.toISOString(),
    q: 'RETEST DUE',
    singleEvents: true,
    orderBy: 'startTime',
    maxResults: 20,
  });

  return (resp.data.items || []).map((e) => ({
    summary: e.summary || '(no title)',
    start: e.start?.dateTime || e.start?.date || '',
  }));
}

function buildDigest(
  today: Array<{ summary: string; start: string }>,
  retests: Array<{ summary: string; start: string }>,
): string {
  const dayName = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    timeZone: 'America/Los_Angeles',
  });
  const lines: string[] = [`Morning, Bryan -- ${dayName}.`];

  if (today.length === 0) {
    lines.push('No appointments on the calendar.');
  } else {
    lines.push(`${today.length} on the calendar:`);
    for (const e of today.slice(0, 5)) {
      lines.push(`- ${fmtTime(e.start)}: ${e.summary}`);
    }
  }

  if (retests.length > 0) {
    lines.push(`${retests.length} RETEST DUE this week. First: ${retests[0].summary.replace(' — RETEST DUE (17-week cycle)', '')}.`);
  }

  return lines.join('\n');
}

async function sendTwilio(text: string): Promise<void> {
  const sid = process.env.TWILIO_ACCOUNT_SID;
  const token = process.env.TWILIO_AUTH_TOKEN;
  const from = process.env.TWILIO_FROM_NUMBER;
  const to = process.env.SAMANTHA_OWNER_PHONE;
  if (!sid || !token || !from || !to) {
    throw new Error('Twilio not fully configured (need TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_FROM_NUMBER, SAMANTHA_OWNER_PHONE)');
  }
  const body = new URLSearchParams({ From: from, To: to, Body: text });
  const auth = Buffer.from(`${sid}:${token}`).toString('base64');
  const resp = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${sid}/Messages.json`, {
    method: 'POST',
    headers: {
      'Authorization': `Basic ${auth}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: body.toString(),
  });
  if (!resp.ok) {
    throw new Error(`Twilio API ${resp.status}: ${await resp.text()}`);
  }
}

export default async function handler(req: any, res: any) {
  // Cron secret check (Vercel sets this header automatically when CRON_SECRET is configured)
  const cronSecret = process.env.CRON_SECRET;
  if (cronSecret) {
    const auth = req.headers.authorization || '';
    if (auth !== `Bearer ${cronSecret}`) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
  }

  try {
    const [today, retests] = await Promise.all([
      fetchTodaysCalendar().catch((e) => { console.warn('Calendar fetch failed:', e.message); return []; }),
      fetchRetestsThisWeek().catch((e) => { console.warn('Retest fetch failed:', e.message); return []; }),
    ]);

    const digest = buildDigest(today, retests);

    if (process.env.SAMANTHA_OWNER_PHONE && process.env.TWILIO_ACCOUNT_SID) {
      await sendTwilio(digest);
      return res.status(200).json({ sent: true, digest });
    } else {
      // Twilio not wired yet -- return the digest so Bryan can see it via curl
      return res.status(200).json({ sent: false, digest, note: 'Twilio not configured. Set TWILIO_* + SAMANTHA_OWNER_PHONE env vars.' });
    }
  } catch (err: any) {
    console.error('cron-morning error:', err);
    return res.status(500).json({ error: err.message });
  }
}
