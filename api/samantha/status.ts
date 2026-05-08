import { google } from 'googleapis';

export const config = { maxDuration: 10 };

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
  'https://www.googleapis.com/auth/gmail.readonly',
  'https://www.googleapis.com/auth/gmail.compose',
  'https://www.googleapis.com/auth/calendar',
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
<div class="card">
  <h2>Step 1: Create Google Cloud credentials</h2>
  <ol>
    <li>Go to <a href="https://console.cloud.google.com/projectcreate" target="_blank">console.cloud.google.com</a> and create a project named "Samantha".</li>
    <li><b>APIs & Services → Library</b>, enable all three:<br>
      &bull; <b>Gmail API</b><br>
      &bull; <b>Google Calendar API</b><br>
      &bull; <b>Google Drive API</b></li>
    <li><b>APIs & Services → OAuth consent screen</b>:<br>
      &bull; User type: <b>Internal</b> (since <code>samantha@norcalcarbmobile.com</code> is in your own Workspace org — no test-user approval needed). Otherwise External.<br>
      &bull; App name: "Samantha", support email: <code>bryan@norcalcarbmobile.com</code><br>
      &bull; Scopes: <code>gmail.readonly</code>, <code>gmail.compose</code>, <code>calendar</code>, <code>drive.readonly</code><br>
      &bull; Save</li>
    <li><b>Credentials → Create Credentials → OAuth 2.0 Client ID</b>:<br>
      &bull; Application type: <b>Web application</b><br>
      &bull; Name: "Samantha"<br>
      &bull; Authorized redirect URI -- copy from the box below:<br>
      ${redirectUriBox(redirectUri, pinned)}
      &bull; Click Create, copy <b>Client ID</b> and <b>Client Secret</b></li>
  </ol>
</div>
<div class="card">
  <h2>Step 2: Add to Vercel</h2>
  <p>Go to <a href="https://vercel.com/carbcleantruckcheckapp/gillybelichick/settings/environment-variables" target="_blank">Vercel env var settings</a> and add:</p>
  <p><code>GOOGLE_CLIENT_ID</code> = (the client ID you just copied)<br>
  <code>GOOGLE_CLIENT_SECRET</code> = (the client secret you just copied)</p>
  <p>Select all 3 environments, save. Wait ~45s for redeploy.</p>
</div>
<div class="card">
  <h2>Step 3: Come back here</h2>
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
  <div class="warn">Google will show a "This app isn't verified" warning since it's your personal project. Click <b>Advanced → Go to Samantha (unsafe)</b> to continue. This is normal.</div>
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

// ── Main handler ──

export default async function handler(req: any, res: any) {
  if (req.query?.auth !== undefined || req.query?.code) {
    return handleAuth(req, res);
  }

  if (req.query?.action === 'redeploy') {
    return triggerRedeploy(res);
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
      GOOGLE_CLIENT_ID: mask(process.env.GOOGLE_CLIENT_ID),
      GOOGLE_CLIENT_SECRET: mask(process.env.GOOGLE_CLIENT_SECRET),
      GOOGLE_REFRESH_TOKEN: mask(process.env.GOOGLE_REFRESH_TOKEN),
      GOOGLE_MAPS_API_KEY: mask(process.env.GOOGLE_MAPS_API_KEY),
      FMCSA_API_KEY: mask(process.env.FMCSA_API_KEY),
      CLOUDFLARE_ACCOUNT_ID: mask(process.env.CLOUDFLARE_ACCOUNT_ID),
      CLOUDFLARE_API_TOKEN: mask(process.env.CLOUDFLARE_API_TOKEN),
      CLOUDFLARE_D1_TOKEN: mask(process.env.CLOUDFLARE_D1_TOKEN),
      ELEVENLABS_API_KEY: mask(process.env.ELEVENLABS_API_KEY),
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
