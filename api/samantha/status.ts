import { google } from 'googleapis';

// 30s gives Slack 3s for ack + ~25s for Anthropic call + Slack postMessage.
// Hobby caps at 60s; we stay well under.
export const config = { maxDuration: 30 };

// ── Status dashboard ──

// Bryan names his secrets in plain language ("SAMANTHA", "CLAUDE") rather
// than engineering ALL_CAPS. Look under any reasonable name so he doesn't
// have to rename things in the Vercel dashboard.
const ANTHROPIC_KEY_NAMES = [
  'ANTHROPIC_API_KEY',
  'CLAUDE_API_KEY',
  'SAMANTHA_API_KEY',
  'SAMANTHA',
  'CLAUDE',
  'ANTHROPIC_KEY',
];

function getAnthropicKeySource(): { name: string; value: string } | undefined {
  for (const n of ANTHROPIC_KEY_NAMES) {
    const v = process.env[n];
    if (v && v.trim()) return { name: n, value: v.trim() };
  }
  return undefined;
}

function mask(v: string | undefined): string {
  if (!v) return 'NOT SET';
  if (v.length < 8) return 'SET (short)';
  return `SET (${v.length} chars, starts with "${v.slice(0, 5)}...")`;
}

// ── Google OAuth (merged from auth.ts to stay within Vercel function limit) ──

const SCOPES = [
  'https://www.googleapis.com/auth/calendar.events',
  'https://www.googleapis.com/auth/gmail.readonly',
  'https://www.googleapis.com/auth/gmail.compose',
  'https://www.googleapis.com/auth/gmail.send',
  'https://www.googleapis.com/auth/drive.readonly',
];

function getBaseUrl(req: any): string {
  // SAMANTHA_BASE_URL pins the OAuth redirect URI to a single canonical
  // host (e.g. https://bryanoneillgillis.com) so it always matches whatever
  // Bryan registered in Google Cloud Console. Without it, redirect URI
  // is computed from the request host -- which means visits from
  // gillybelichick.vercel.app vs bryanoneillgillis.com vs www. subdomains
  // each produce a different URI, and only one can be registered.
  const pinned = process.env.SAMANTHA_BASE_URL;
  if (pinned) return pinned.replace(/\/$/, '');
  const proto = req.headers['x-forwarded-proto'] || 'https';
  const host = req.headers['x-forwarded-host'] || req.headers.host;
  return `${proto}://${host}`;
}

function getRedirectUri(req: any): string {
  return `${getBaseUrl(req)}/api/samantha/auth`;
}

// Detect when the incoming request is NOT on the pinned canonical host.
// Returns the canonical URL to redirect to, or null if we're already
// canonical (or SAMANTHA_BASE_URL isn't set, so dynamic host is fine).
function nonCanonicalRedirect(req: any): string | null {
  const pinned = process.env.SAMANTHA_BASE_URL;
  if (!pinned) return null;
  const proto = req.headers['x-forwarded-proto'] || 'https';
  const host = req.headers['x-forwarded-host'] || req.headers.host;
  const current = `${proto}://${host}`;
  const canonical = pinned.replace(/\/$/, '');
  if (current === canonical) return null;
  const path = req.url || '/api/samantha/status';
  return `${canonical}${path}`;
}

function authPage(title: string, body: string): string {
  return `<!DOCTYPE html>
<html><head><title>${title}</title><meta name="viewport" content="width=device-width,initial-scale=1">
<style>
body { font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif; background:#FFF8F0; color:#2D2D2D; margin:0; padding:20px; }
.wrap { max-width:560px; margin:0 auto; }
h1 { font-size:22px; margin:0 0 8px; }
.sub { color:#8B8B8B; font-size:13px; margin-bottom:24px; }
.card { background:#fff; padding:20px; border-radius:12px; box-shadow:0 1px 3px rgba(0,0,0,.06); margin-bottom:16px; }
.card h2 { font-size:16px; margin:0 0 12px; color:#E8725A; }
.card p, .card li { font-size:14px; line-height:1.6; margin:6px 0; }
.card ol { padding-left:20px; }
code { background:#f5f0e8; padding:2px 6px; border-radius:4px; font-size:13px; font-family:"SF Mono",Monaco,monospace; }
.big-code { background:#1a1a2e; color:#e0e0e0; padding:12px 16px; border-radius:8px; font-size:13px; word-break:break-all; margin:12px 0; font-family:"SF Mono",Monaco,monospace; line-height:1.5; }
.btn { display:inline-block; background:#E8725A; color:#fff; padding:14px 28px; border-radius:10px; text-decoration:none; font-weight:600; font-size:16px; margin:8px 4px 8px 0; }
.btn:hover { opacity:.9; }
.btn.secondary { background:#f3f4f6; color:#2D2D2D; }
.warn { background:#FEF3CD; padding:12px 16px; border-radius:8px; font-size:13px; color:#856404; margin:12px 0; }
.success { background:#D4EDDA; padding:16px; border-radius:10px; color:#155724; font-weight:600; font-size:15px; margin-bottom:16px; }
.error { background:#F8D7DA; padding:16px; border-radius:10px; color:#721C24; font-weight:600; font-size:15px; margin-bottom:16px; }
a { color:#E8725A; }
</style></head><body><div class="wrap">
<h1>Samantha · Google Setup</h1>
<div class="sub">Connect your Google account so Samantha can manage calendar &amp; email</div>
${body}
</div></body></html>`;
}

function redirectUriBox(redirectUri: string, pinned: boolean): string {
  const note = pinned
    ? 'Pinned via <code>SAMANTHA_BASE_URL</code> -- register this ONE URL in Google Cloud and you\'re covered.'
    : 'Dynamic (based on current host). Set <code>SAMANTHA_BASE_URL</code> in Vercel to pin it to one canonical URL so OAuth never trips on mismatch.';
  return `
<div class="warn"><b>Google Cloud requires an EXACT match</b> -- same scheme, host, path. No trailing slash. No <code>www.</code> mismatch. Copy this string and paste it verbatim.</div>
<div class="big-code" id="redirectUri">${redirectUri}</div>
<button onclick="navigator.clipboard.writeText(document.getElementById('redirectUri').textContent.trim()).then(()=>this.textContent='Copied!')" style="background:#E8725A;color:#fff;border:none;padding:10px 20px;border-radius:8px;font-size:14px;font-weight:600;cursor:pointer">Copy redirect URI</button>
<p style="font-size:12px;color:#8B8B8B;margin-top:10px">${note}</p>`;
}

function setupPage(redirectUri: string): string {
  const pinned = Boolean(process.env.SAMANTHA_BASE_URL);
  return authPage('Samantha · Google Setup', `
<div class="card" style="background:#E8F5E9;border-left:4px solid #2E7D32">
  <h2 style="color:#2E7D32">RECOMMENDED: Service Account + Domain-Wide Delegation</h2>
  <p><b>Skip OAuth entirely.</b> Service-account auth doesn't expire weekly, doesn't need a consent screen, and can impersonate any user in your Workspace silently. Setup is 10 minutes of clicks, one time, forever.</p>
  <ol>
    <li><b>Google Cloud Console</b> → IAM & Admin → Service Accounts → <b>Create Service Account</b><br>
      &bull; Name: <code>samantha-impersonator</code><br>
      &bull; Description: "Samantha Gillis -- Workspace impersonation"<br>
      &bull; Skip the optional role grant, click Done.</li>
    <li>Open the new service account → <b>Keys</b> tab → <b>Add Key → JSON</b> → download the file.</li>
    <li>Same service account page → <b>Show advanced settings</b> → copy the <b>Unique ID</b> (long number).</li>
    <li><b>APIs & Services → Library</b>, enable all three:<br>
      &bull; <b>Gmail API</b><br>
      &bull; <b>Google Calendar API</b><br>
      &bull; <b>Google Drive API</b></li>
    <li><b>Google Workspace Admin Console</b> (admin.google.com, sign in as the Workspace admin) → Security → Access and data control → <b>API controls</b> → <b>Domain-wide Delegation</b> → <b>Add new</b>:<br>
      &bull; Client ID: paste the Unique ID from step 3<br>
      &bull; OAuth scopes (comma-separated):<br>
      <code style="white-space:nowrap;font-size:11px">https://www.googleapis.com/auth/gmail.readonly,https://www.googleapis.com/auth/gmail.compose,https://www.googleapis.com/auth/gmail.send,https://www.googleapis.com/auth/calendar.events,https://www.googleapis.com/auth/drive.readonly</code><br>
      &bull; Authorize.</li>
    <li><b>Vercel env vars</b> → add:<br>
      &bull; <code>GOOGLE_SERVICE_ACCOUNT_KEY</code> = (paste the entire JSON file contents, including the curly braces)<br>
      &bull; <code>DEFAULT_IMPERSONATE_USER</code> = <code>samantha@norcalcarbmobile.com</code><br>
      &bull; Select all 3 environments. Save.</li>
  </ol>
  <p style="font-size:13px;color:#558B2F"><b>That's it.</b> No "Authorize" button needed. Redeploy, ask Samantha "what's on my calendar?", you're done.</p>
</div>

<div class="card" style="opacity:0.75">
  <h2 style="color:#8B8B8B">Alternative (legacy): OAuth refresh-token flow</h2>
  <p style="font-size:13px">Use this only if you can't get Workspace admin access to set up domain-wide delegation. Refresh tokens expire every 7 days unless you publish the OAuth app, and require an "Authorize" click in a browser.</p>
  <h3 style="font-size:14px">Step 1: Create Google Cloud credentials</h3>
  <ol>
    <li>Go to <a href="https://console.cloud.google.com/projectcreate" target="_blank">console.cloud.google.com</a> and create a project named "Samantha".</li>
    <li><b>APIs & Services → Library</b>, enable all three:<br>
      &bull; <b>Gmail API</b><br>
      &bull; <b>Google Calendar API</b><br>
      &bull; <b>Google Drive API</b></li>
    <li><b>APIs & Services → OAuth consent screen</b>:<br>
      &bull; User type: <b>Internal</b> (since <code>samantha@norcalcarbmobile.com</code> is in your own Workspace org — no test-user approval needed). Otherwise <b>External</b> + add Test users <code>samantha@norcalcarbmobile.com</code> and <code>bryan@norcalcarbmobile.com</code>.<br>
      &bull; App name: "Samantha", support email: <code>bryan@norcalcarbmobile.com</code><br>
      &bull; Scopes: <code>calendar.events</code>, <code>gmail.readonly</code>, <code>gmail.compose</code>, <code>gmail.send</code>, <code>drive.readonly</code><br>
      &bull; Save</li>
    <li><b>Credentials → Create Credentials → OAuth 2.0 Client ID</b>:<br>
      &bull; Application type: <b>Web application</b><br>
      &bull; Name: "Samantha"<br>
      &bull; Authorized redirect URI -- copy from the box below:<br>
      ${redirectUriBox(redirectUri, pinned)}
      &bull; Click Create, copy <b>Client ID</b> and <b>Client Secret</b></li>
  </ol>
</div>
<div class="card" style="opacity:0.75">
  <h2 style="color:#8B8B8B">Step 2: Add to Vercel</h2>
  <p>Go to <a href="https://vercel.com/carbcleantruckcheckapp/gillybelichick/settings/environment-variables" target="_blank">Vercel env var settings</a> and add:</p>
  <p><code>GOOGLE_CLIENT_ID</code> = (the client ID you just copied)<br>
  <code>GOOGLE_CLIENT_SECRET</code> = (the client secret you just copied)</p>
  <p>Select all 3 environments, save. Wait ~45s for redeploy.</p>
</div>
<div class="card" style="opacity:0.75">
  <h2 style="color:#8B8B8B">Step 3: Come back here</h2>
  <p>After the redeploy, refresh this page. You'll see an "Authorize Samantha" button.</p>
</div>`);
}

function authorizePage(authUrl: string, redirectUri: string): string {
  const pinned = Boolean(process.env.SAMANTHA_BASE_URL);
  return authPage('Samantha · Authorize Google', `
<div class="card">
  <h2>Connect your Google account</h2>
  <p>Sign in as <b>samantha@norcalcarbmobile.com</b> (not bryan@) so she's the one who holds the refresh token.</p>
  <p>
    <a class="btn" href="${authUrl}&login_hint=samantha@norcalcarbmobile.com">Authorize samantha@norcalcarbmobile.com</a>
  </p>
  <p>
    <a class="btn secondary" href="${authUrl}&login_hint=bryan@norcalcarbmobile.com">Authorize bryan@norcalcarbmobile.com</a>
  </p>
  <div class="warn">Google will show a "This app isn't verified" warning since it's your personal project. Click <b>Advanced → Go to Samantha (unsafe)</b> to continue. This is normal for personal-use apps.</div>
</div>
<div class="card">
  <h2>Redirect URI (must match Google Cloud exactly)</h2>
  ${redirectUriBox(redirectUri, pinned)}
  <p style="font-size:13px;margin-top:10px">If you hit <b>"redirect_uri_mismatch"</b>, it means the URI above isn't registered verbatim in Google Cloud Console → Credentials → OAuth 2.0 Client → Authorized redirect URIs. Copy it there exactly.</p>
</div>`);
}

function successPage(refreshToken: string): string {
  if (!refreshToken) {
    return authPage('Samantha · Token Missing', `
<div class="error">No refresh token returned.</div>
<div class="card">
  <p>Google didn't return a refresh token. This usually means you've authorized before. Try:</p>
  <ol>
    <li>Go to <a href="https://myaccount.google.com/permissions" target="_blank">myaccount.google.com/permissions</a></li>
    <li>Find "Samantha" and click <b>Remove Access</b></li>
    <li>Come back here and authorize again</li>
  </ol>
</div>`);
  }

  return authPage('Samantha · Connected!', `
<div class="success">Authorization successful! Copy the refresh token below.</div>
<div class="card">
  <h2>Your refresh token</h2>
  <div class="big-code" id="token">${refreshToken}</div>
  <button onclick="navigator.clipboard.writeText(document.getElementById('token').textContent).then(()=>this.textContent='Copied!')" style="background:#E8725A;color:#fff;border:none;padding:10px 20px;border-radius:8px;font-size:14px;font-weight:600;cursor:pointer">Copy to clipboard</button>
</div>
<div class="card">
  <h2>Paste into Vercel</h2>
  <ol>
    <li>Go to <a href="https://vercel.com/carbcleantruckcheckapp/gillybelichick/settings/environment-variables" target="_blank">Vercel env var settings</a></li>
    <li>Add: <code>GOOGLE_REFRESH_TOKEN</code> = (paste the token above)</li>
    <li>Select all 3 environments, save</li>
    <li>Vercel auto-redeploys in ~45s</li>
  </ol>
  <p>After that, Samantha can read your calendar and email. Try saying: <i>"What's on my calendar today?"</i></p>
</div>
<div class="warn">This token is sensitive — treat it like a password. Don't share it. It's safe in Vercel's encrypted env vars.</div>`);
}

function errorPage(message: string): string {
  return authPage('Samantha · Error', `
<div class="error">Authorization failed</div>
<div class="card">
  <p><b>Error:</b> ${message}</p>
  <p>Common fixes:</p>
  <ol>
    <li>Make sure the redirect URI in Google Cloud Console matches: the URL of this page exactly</li>
    <li>Make sure your email is added as a Test User in the OAuth consent screen</li>
    <li>Try revoking access at <a href="https://myaccount.google.com/permissions" target="_blank">myaccount.google.com/permissions</a> and authorizing again</li>
  </ol>
  <p><a class="btn" href="/api/samantha/auth">Try again</a></p>
</div>`);
}

async function handleAuth(req: any, res: any) {
  // If SAMANTHA_BASE_URL is set and we're on a non-canonical host, bounce
  // to the canonical one BEFORE we start the OAuth dance. Otherwise
  // Google's redirect_uri_mismatch error eats the attempt.
  const canonical = nonCanonicalRedirect(req);
  if (canonical) {
    res.setHeader('Location', canonical);
    return res.status(302).end();
  }

  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  const redirectUri = getRedirectUri(req);

  if (!clientId || !clientSecret) {
    return res.status(200).send(setupPage(redirectUri));
  }

  const oauth2Client = new google.auth.OAuth2(clientId, clientSecret, redirectUri);

  if (req.query?.code) {
    try {
      const { tokens } = await oauth2Client.getToken(req.query.code as string);
      return res.status(200).send(successPage(tokens.refresh_token || ''));
    } catch (err: any) {
      return res.status(200).send(errorPage(err.message));
    }
  }

  const authUrl = oauth2Client.generateAuthUrl({
    access_type: 'offline',
    prompt: 'consent',
    scope: SCOPES,
    login_hint: req.query?.account || '',
  });

  return res.status(200).send(authorizePage(authUrl, redirectUri));
}

// ── Deploy hook trigger (one-tap redeploy from the status page) ──

async function triggerRedeploy(res: any) {
  const hook = process.env.VERCEL_DEPLOY_HOOK_URL;
  if (!hook) {
    return res.status(400).json({
      ok: false,
      error: 'VERCEL_DEPLOY_HOOK_URL not set. Create a Deploy Hook in Vercel → Settings → Git → Deploy Hooks, then paste the URL as an env var.',
    });
  }
  try {
    const r = await fetch(hook, { method: 'POST' });
    const body = await r.text();
    return res.status(r.ok ? 200 : 502).json({ ok: r.ok, status: r.status, response: body.slice(0, 500) });
  } catch (err: any) {
    return res.status(502).json({ ok: false, error: err.message });
  }
}

// ── Morning digest cron (folded in to keep us under the 12-function cap) ──

function fmtTime(iso: string | null | undefined): string {
  if (!iso) return 'all-day';
  const d = new Date(iso);
  return d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', timeZone: 'America/Los_Angeles' });
}

function getCronOAuth2Client() {
  const saJson = process.env.GOOGLE_SERVICE_ACCOUNT_KEY;
  if (saJson) {
    const credentials = JSON.parse(saJson);
    return new google.auth.JWT({
      email: credentials.client_email,
      key: credentials.private_key,
      scopes: ['https://www.googleapis.com/auth/calendar.events'],
      subject: process.env.DEFAULT_IMPERSONATE_USER || 'samantha@norcalcarbmobile.com',
    });
  }
  const client = new google.auth.OAuth2(process.env.GOOGLE_CLIENT_ID, process.env.GOOGLE_CLIENT_SECRET);
  client.setCredentials({ refresh_token: process.env.GOOGLE_REFRESH_TOKEN });
  return client;
}

function googleCredsConfigured(): boolean {
  return Boolean(
    process.env.GOOGLE_SERVICE_ACCOUNT_KEY ||
    (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_REFRESH_TOKEN),
  );
}

async function fetchTodaysCalendar(): Promise<Array<{ summary: string; start: string }>> {
  if (!googleCredsConfigured()) return [];
  const calendar = google.calendar({ version: 'v3', auth: getCronOAuth2Client() });
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
  if (!googleCredsConfigured()) return [];
  const calendar = google.calendar({ version: 'v3', auth: getCronOAuth2Client() });
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

async function sendTwilioSms(text: string): Promise<void> {
  const sid = process.env.TWILIO_ACCOUNT_SID;
  const token = process.env.TWILIO_AUTH_TOKEN;
  const from = process.env.TWILIO_FROM_NUMBER;
  const to = process.env.SAMANTHA_OWNER_PHONE;
  if (!sid || !token || !from || !to) {
    throw new Error('Twilio not fully configured');
  }
  const body = new URLSearchParams({ From: from, To: to, Body: text });
  const auth = Buffer.from(`${sid}:${token}`).toString('base64');
  const resp = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${sid}/Messages.json`, {
    method: 'POST',
    headers: { 'Authorization': `Basic ${auth}`, 'Content-Type': 'application/x-www-form-urlencoded' },
    body: body.toString(),
  });
  if (!resp.ok) throw new Error(`Twilio API ${resp.status}: ${await resp.text()}`);
}

async function handleCronMorning(req: any, res: any) {
  const cronSecret = process.env.CRON_SECRET;
  if (cronSecret) {
    const auth = req.headers.authorization || '';
    if (auth !== `Bearer ${cronSecret}`) return res.status(401).json({ error: 'Unauthorized' });
  }
  try {
    const [today, retests] = await Promise.all([
      fetchTodaysCalendar().catch((e) => { console.warn('Calendar fetch failed:', e.message); return []; }),
      fetchRetestsThisWeek().catch((e) => { console.warn('Retest fetch failed:', e.message); return []; }),
    ]);
    const dayName = new Date().toLocaleDateString('en-US', { weekday: 'long', timeZone: 'America/Los_Angeles' });
    const lines: string[] = [`Morning, Bryan -- ${dayName}.`];
    if (today.length === 0) {
      lines.push('No appointments on the calendar.');
    } else {
      lines.push(`${today.length} on the calendar:`);
      for (const e of today.slice(0, 5)) lines.push(`- ${fmtTime(e.start)}: ${e.summary}`);
    }
    if (retests.length > 0) {
      lines.push(`${retests.length} RETEST DUE this week. First: ${retests[0].summary.replace(' — RETEST DUE (17-week cycle)', '')}.`);
    }
    const digest = lines.join('\n');

    if (process.env.SAMANTHA_OWNER_PHONE && process.env.TWILIO_ACCOUNT_SID) {
      await sendTwilioSms(digest);
      return res.status(200).json({ sent: true, digest });
    }
    return res.status(200).json({ sent: false, digest, note: 'Twilio not configured. Set TWILIO_* + SAMANTHA_OWNER_PHONE env vars.' });
  } catch (err: any) {
    console.error('cron-morning error:', err);
    return res.status(500).json({ error: err.message });
  }
}

// ── Slack events handler (folded in to keep us under 12-function cap) ──

const SLACK_SYSTEM_PROMPT = `You are Samantha Gillis replying inside Slack. Constraints:
- Brevity over polish. One short paragraph or 2-3 bullets max.
- If you'd normally use ask_bryan to present tap-options, instead write the options as a numbered list in plain text -- Slack message buttons aren't wired yet.
- Don't claim to send SMS via Google Voice/Messages (no API). Twilio SMS works if SAMANTHA_OWNER_PHONE + TWILIO_* are set.
- Use Slack markdown sparingly: *bold*, _italic_, \`code\`. No tables (Slack doesn't render them well).`;

function getRawBodyForSlack(req: any): Promise<string> {
  return new Promise((resolve, reject) => {
    if (typeof req.body === 'string') return resolve(req.body);
    if (Buffer.isBuffer(req.body)) return resolve(req.body.toString('utf8'));
    if (req.body && typeof req.body === 'object') return resolve(JSON.stringify(req.body));
    let data = '';
    req.on('data', (chunk: Buffer) => (data += chunk.toString('utf8')));
    req.on('end', () => resolve(data));
    req.on('error', reject);
  });
}

async function verifySlackSignature(req: any, rawBody: string): Promise<boolean> {
  const secret = process.env.SLACK_SIGNING_SECRET;
  if (!secret) return false;
  if (process.env.SLACK_SKIP_SIG_VERIFY === '1') return true;
  const ts = req.headers['x-slack-request-timestamp'] as string | undefined;
  const sig = req.headers['x-slack-signature'] as string | undefined;
  if (!ts || !sig) return false;
  // Reject anything older than 5 minutes (replay protection)
  if (Math.abs(Date.now() / 1000 - Number(ts)) > 300) return false;
  const crypto = await import('crypto');
  const expected =
    'v0=' +
    crypto.createHmac('sha256', secret).update(`v0:${ts}:${rawBody}`).digest('hex');
  try {
    return crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(sig));
  } catch {
    return false;
  }
}

async function postSlackMessage(channel: string, text: string, threadTs?: string): Promise<void> {
  const token = process.env.SLACK_BOT_TOKEN;
  if (!token) throw new Error('SLACK_BOT_TOKEN not set');
  const body: any = { channel, text };
  if (threadTs) body.thread_ts = threadTs;
  const resp = await fetch('https://slack.com/api/chat.postMessage', {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json; charset=utf-8' },
    body: JSON.stringify(body),
  });
  const data: any = await resp.json();
  if (!data.ok) throw new Error(`Slack API: ${data.error || resp.status}`);
}

async function callAnthropicForSlack(userText: string): Promise<string> {
  const key = getAnthropicKeySource();
  if (!key) return "My brain isn't connected. Open bryanoneillgillis.com/api/samantha/status.";
  const Anthropic = (await import('@anthropic-ai/sdk')).default;
  const anthropic = new Anthropic({ apiKey: key.value });
  const response = await anthropic.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 600,
    system: SLACK_SYSTEM_PROMPT,
    messages: [{ role: 'user', content: userText }],
  });
  let text = '';
  for (const block of response.content) {
    if (block.type === 'text') text += block.text;
  }
  return text.trim() || "Got it. (No reply text returned.)";
}

async function handleSlackEvents(req: any, res: any) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'POST only' });

  const rawBody = await getRawBodyForSlack(req);

  // Verify signature first (unless explicitly skipped for local testing).
  if (!(await verifySlackSignature(req, rawBody))) {
    return res.status(403).json({ error: 'Bad signature' });
  }

  let payload: any;
  try { payload = JSON.parse(rawBody); } catch { return res.status(400).json({ error: 'Bad JSON' }); }

  // url_verification: Slack's initial setup challenge
  if (payload.type === 'url_verification') {
    return res.status(200).json({ challenge: payload.challenge });
  }

  if (payload.type !== 'event_callback') {
    return res.status(200).json({ ok: true });
  }

  const event = payload.event || {};

  // Only handle direct messages and app mentions. Ignore everything else (typing
  // indicators, channel joins, bot's own messages, etc.).
  const isDM = event.type === 'message' && event.channel_type === 'im' && !event.bot_id && !event.subtype;
  const isMention = event.type === 'app_mention';
  if (!isDM && !isMention) return res.status(200).json({ ok: true });

  // Acknowledge fast so Slack doesn't retry. We do the LLM call after the
  // response is sent. Vercel keeps the function running until maxDuration.
  res.status(200).json({ ok: true });

  try {
    const text = (event.text || '').replace(/<@[A-Z0-9]+>\s*/g, '').trim();
    if (!text) return;
    const reply = await callAnthropicForSlack(text);
    await postSlackMessage(event.channel, reply, event.thread_ts || event.ts);
  } catch (err: any) {
    console.error('Slack event handler error:', err);
    try {
      await postSlackMessage(event.channel, `Hit an error: ${err.message}`, event.thread_ts || event.ts);
    } catch {}
  }
}

// ── Main handler ──

export default async function handler(req: any, res: any) {
  if (req.query?.auth !== undefined || req.query?.code) {
    return handleAuth(req, res);
  }

  if (req.query?.action === 'redeploy') {
    return triggerRedeploy(res);
  }

  if (req.query?.action === 'cron-morning' || req.query?.cron === 'morning') {
    return handleCronMorning(req, res);
  }

  if (req.query?.action === 'slack' || req.headers['x-slack-signature']) {
    return handleSlackEvents(req, res);
  }

  const keyInfo = getAnthropicKeySource();
  const keyLooksValid = keyInfo ? keyInfo.value.startsWith('sk-ant-') : false;
  const deployHookSet = Boolean(process.env.VERCEL_DEPLOY_HOOK_URL);

  // Show every Anthropic-key name we'll accept so Bryan can see his own
  // naming is covered.
  const anthropicRows: Record<string, string> = {};
  for (const n of ANTHROPIC_KEY_NAMES) {
    anthropicRows[n] = mask(process.env[n]);
  }

  const state = {
    timestamp: new Date().toISOString(),
    environment: process.env.VERCEL_ENV || 'unknown',
    region: process.env.VERCEL_REGION || 'unknown',
    commit: (process.env.VERCEL_GIT_COMMIT_SHA || '').slice(0, 7) || 'unknown',
    commit_message: process.env.VERCEL_GIT_COMMIT_MESSAGE || '',
    anthropic_key_source: keyInfo?.name || null,
    anthropic_key_looks_valid: keyLooksValid,
    env_vars: {
      ...anthropicRows,
      GOOGLE_SERVICE_ACCOUNT_KEY: mask(process.env.GOOGLE_SERVICE_ACCOUNT_KEY),
      DEFAULT_IMPERSONATE_USER: process.env.DEFAULT_IMPERSONATE_USER || 'NOT SET',
      GOOGLE_CLIENT_ID: mask(process.env.GOOGLE_CLIENT_ID),
      GOOGLE_CLIENT_SECRET: mask(process.env.GOOGLE_CLIENT_SECRET),
      GOOGLE_REFRESH_TOKEN: mask(process.env.GOOGLE_REFRESH_TOKEN),
      GOOGLE_MAPS_API_KEY: mask(process.env.GOOGLE_MAPS_API_KEY),
      FMCSA_API_KEY: mask(process.env.FMCSA_API_KEY),
      CLOUDFLARE_ACCOUNT_ID: mask(process.env.CLOUDFLARE_ACCOUNT_ID),
      CLOUDFLARE_API_TOKEN: mask(process.env.CLOUDFLARE_API_TOKEN),
      CLOUDFLARE_D1_TOKEN: mask(process.env.CLOUDFLARE_D1_TOKEN),
      ELEVENLABS_API_KEY: mask(process.env.ELEVENLABS_API_KEY),
      TWILIO_ACCOUNT_SID: mask(process.env.TWILIO_ACCOUNT_SID),
      TWILIO_AUTH_TOKEN: mask(process.env.TWILIO_AUTH_TOKEN),
      TWILIO_FROM_NUMBER: process.env.TWILIO_FROM_NUMBER || 'NOT SET',
      SAMANTHA_OWNER_PHONE: process.env.SAMANTHA_OWNER_PHONE || 'NOT SET',
      SLACK_SIGNING_SECRET: mask(process.env.SLACK_SIGNING_SECRET),
      SLACK_BOT_TOKEN: mask(process.env.SLACK_BOT_TOKEN),
      VERCEL_TOKEN: mask(process.env.VERCEL_TOKEN),
      GITHUB_TOKEN: mask(process.env.GITHUB_TOKEN),
      VERCEL_DEPLOY_HOOK_URL: mask(process.env.VERCEL_DEPLOY_HOOK_URL),
      SAMANTHA_BASE_URL: process.env.SAMANTHA_BASE_URL || 'NOT SET',
    },
    samantha_ready: Boolean(keyInfo),
  };

  if (req.query?.format === 'json') {
    return res.status(200).json(state);
  }

  const row = (k: string, v: string, highlight: boolean = false) => {
    const ok = !v.startsWith('NOT');
    const color = ok ? '#4ade80' : '#ef4444';
    const icon = ok ? '✓' : '✗';
    const bg = highlight ? 'background:#FFF3D6;' : '';
    return `<tr><td style="padding:8px 12px;border-bottom:1px solid #f0e6d5;${bg}"><code>${k}</code></td><td style="padding:8px 12px;border-bottom:1px solid #f0e6d5;color:${color};${bg}"><b>${icon}</b> ${v}</td></tr>`;
  };

  const ready = state.samantha_ready;
  const formatWarn = keyInfo && !keyLooksValid;

  let bannerBg = '#dcfce7';
  let bannerColor = '#166534';
  let bannerText = `✓ Samantha is ready · key found under <code>${keyInfo?.name}</code>`;
  if (!ready) {
    bannerBg = '#fee2e2';
    bannerColor = '#991b1b';
    bannerText = '✗ Samantha has no Anthropic key in any accepted env var';
  } else if (formatWarn) {
    bannerBg = '#FEF3CD';
    bannerColor = '#856404';
    bannerText = `⚠ Key found under <code>${keyInfo?.name}</code> but doesn't start with <code>sk-ant-</code> — likely wrong key pasted`;
  }

  const tableRows = Object.entries(state.env_vars)
    .map(([k, v]) => row(k, v, k === keyInfo?.name))
    .join('');

  const howToFix = ready ? '' : `
<div class="fix">
  <h3>How to fix (~60 seconds)</h3>
  <ol>
    <li>Tap <a class="btn" href="https://vercel.com/carbcleantruckcheckapp/gillybelichick/settings/environment-variables" target="_blank">Open Vercel env vars →</a></li>
    <li><b>Add New</b>. Key name: any of <code>ANTHROPIC_API_KEY</code>, <code>CLAUDE</code>, <code>SAMANTHA</code>, <code>CLAUDE_API_KEY</code>, <code>SAMANTHA_API_KEY</code>. Samantha will find it under any of these.</li>
    <li>Value: your key that starts with <code>sk-ant-</code> (get one at <a href="https://console.anthropic.com/" target="_blank">console.anthropic.com</a>).</li>
    <li>Check <b>all three</b> environments (Production, Preview, Development). Save.</li>
    <li>Redeploy — ${deployHookSet ? 'tap the button below' : 'Vercel → Deployments → latest → ⋯ → Redeploy. Or push any commit. (Tip: set <code>VERCEL_DEPLOY_HOOK_URL</code> to enable one-tap redeploy from this page.)'}</li>
  </ol>
</div>`;

  const redeployButton = deployHookSet
    ? `<button class="btn redeploy" onclick="redeploy()">Redeploy production now</button>
       <div id="redeploy-status"></div>
       <script>
       async function redeploy() {
         const s = document.getElementById('redeploy-status');
         s.textContent = 'Triggering redeploy...';
         try {
           const r = await fetch('?action=redeploy', { method: 'POST' });
           const j = await r.json();
           s.textContent = j.ok ? '✓ Redeploy triggered. Refresh in ~45s to verify.' : '✗ ' + (j.error || 'Failed');
         } catch (e) { s.textContent = '✗ Network error'; }
       }
       </script>`
    : `<div class="hint">Set <code>VERCEL_DEPLOY_HOOK_URL</code> in Vercel env vars to enable one-tap redeploy. Create the URL at Vercel → Settings → Git → Deploy Hooks.</div>`;

  const html = `<!DOCTYPE html>
<html><head><title>Samantha Status</title><meta name="viewport" content="width=device-width,initial-scale=1">
<style>
body { font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif; background:#FFF8F0; color:#2D2D2D; margin:0; padding:20px; }
.wrap { max-width:600px; margin:0 auto; }
h1 { font-size:22px; margin:0 0 4px; }
.sub { color:#8B8B8B; font-size:13px; margin-bottom:20px; }
.banner { padding:16px; border-radius:12px; margin-bottom:20px; background:${bannerBg}; color:${bannerColor}; font-weight:600; font-size:14px; line-height:1.5; }
.banner code { background:rgba(0,0,0,.08); padding:1px 5px; border-radius:4px; }
table { width:100%; background:#fff; border-radius:12px; overflow:hidden; box-shadow:0 1px 3px rgba(0,0,0,.06); font-size:14px; border-collapse:collapse; }
td:first-child { color:#E8725A; font-weight:500; width:50%; }
code { font-family:"SF Mono",Monaco,monospace; font-size:13px; }
.fix { background:#fff; padding:16px 20px; border-radius:12px; margin-top:20px; border-left:4px solid #E8725A; }
.fix h3 { margin:0 0 10px; font-size:15px; }
.fix ol { padding-left:20px; margin:0; }
.fix li { font-size:14px; line-height:1.7; margin:6px 0; }
.btn { display:inline-block; background:#E8725A; color:#fff; padding:10px 18px; border-radius:8px; text-decoration:none; font-weight:600; font-size:14px; border:none; cursor:pointer; margin:8px 0; }
.btn:hover { opacity:.9; }
.btn.redeploy { background:#2D2D2D; margin-top:16px; }
.hint { margin-top:12px; font-size:13px; color:#8B8B8B; line-height:1.5; }
#redeploy-status { margin-top:8px; font-size:13px; }
a { color:#E8725A; word-break:break-all; }
.meta { margin-top:20px; color:#8B8B8B; font-size:12px; line-height:1.6; }
</style></head><body><div class="wrap">
<h1>Samantha · Status</h1>
<div class="sub">Environment: ${state.environment} · Region: ${state.region}</div>
<div class="banner">${bannerText}</div>
<table>${tableRows}</table>
${howToFix}
<div class="fix"><h3>Redeploy</h3>${redeployButton}</div>
<div class="meta">
Commit: <code>${state.commit}</code>${state.commit_message ? ' · ' + state.commit_message.split('\n')[0].slice(0, 80) : ''}<br>
Checked at ${state.timestamp}<br>
JSON: <a href="?format=json">?format=json</a> · <a href="?auth">Google Auth Setup</a>
</div>
</div></body></html>`;

  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  return res.status(200).send(html);
}
