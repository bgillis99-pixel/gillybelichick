import { google } from 'googleapis';

export const config = { maxDuration: 10 };

const SCOPES = [
  'https://www.googleapis.com/auth/gmail.readonly',
  'https://www.googleapis.com/auth/gmail.compose',
  'https://www.googleapis.com/auth/calendar',
];

function getRedirectUri(req: any): string {
  const proto = req.headers['x-forwarded-proto'] || 'https';
  const host = req.headers['x-forwarded-host'] || req.headers.host;
  return `${proto}://${host}/api/samantha/auth`;
}

export default async function handler(req: any, res: any) {
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
      return res.status(200).send(successPage(tokens.refresh_token || '', tokens.access_token || ''));
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

function page(title: string, body: string): string {
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

function setupPage(redirectUri: string): string {
  return page('Samantha · Google Setup', `
<div class="card">
  <h2>Step 1: Create Google Cloud credentials</h2>
  <ol>
    <li>Go to <a href="https://console.cloud.google.com/projectcreate" target="_blank">console.cloud.google.com</a> and create a project (name it anything, e.g. "Samantha")</li>
    <li>In that project, go to <b>APIs & Services → Library</b>:<br>
      &bull; Search and enable <b>Gmail API</b><br>
      &bull; Search and enable <b>Google Calendar API</b></li>
    <li>Go to <b>APIs & Services → OAuth consent screen</b>:<br>
      &bull; User type: <b>External</b>, click Create<br>
      &bull; App name: "Samantha", your email for support<br>
      &bull; Add scopes: <code>gmail.readonly</code>, <code>gmail.compose</code>, <code>calendar</code><br>
      &bull; Add <b>Test users</b>: <code>admin@mobilecarbsmoketest.com</code> and <code>bryan@norcalcarbmobile.com</code><br>
      &bull; Save</li>
    <li>Go to <b>APIs & Services → Credentials → Create Credentials → OAuth 2.0 Client ID</b>:<br>
      &bull; Application type: <b>Web application</b><br>
      &bull; Name: "Samantha"<br>
      &bull; Authorized redirect URI: <code>${redirectUri}</code><br>
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
  <p>After the redeploy, refresh this page. You'll see an "Authorize" button to connect your Google account.</p>
</div>`);
}

function authorizePage(authUrl: string, redirectUri: string): string {
  return page('Samantha · Authorize Google', `
<div class="card">
  <h2>Connect your Google account</h2>
  <p>Click below to authorize Samantha to access your calendar and email. You'll be asked to sign into Google and grant permissions.</p>
  <p>
    <a class="btn" href="${authUrl}&login_hint=bryan@norcalcarbmobile.com">Authorize bryan@norcalcarbmobile.com</a>
  </p>
  <p>
    <a class="btn secondary" href="${authUrl}&login_hint=admin@mobilecarbsmoketest.com">Authorize admin@mobilecarbsmoketest.com</a>
  </p>
  <div class="warn">Google will show a "This app isn't verified" warning since it's your personal project. Click <b>Advanced → Go to Samantha (unsafe)</b> to continue. This is normal for personal-use apps.</div>
</div>
<div class="card">
  <h2>Redirect URI (for reference)</h2>
  <p><code>${redirectUri}</code></p>
  <p>Make sure this matches exactly in your Google Cloud Console → Credentials → OAuth 2.0 Client → Authorized redirect URIs.</p>
</div>`);
}

function successPage(refreshToken: string, _accessToken: string): string {
  if (!refreshToken) {
    return page('Samantha · Token Missing', `
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

  return page('Samantha · Connected!', `
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
  return page('Samantha · Error', `
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
