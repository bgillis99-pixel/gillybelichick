// Diagnostic endpoint for Bryan: shows which env vars are set without revealing values.
// Visit directly in a browser: https://gillybelichick.vercel.app/api/samantha/status

export const config = { maxDuration: 5 };

function mask(v: string | undefined): string {
  if (!v) return 'NOT SET';
  if (v.length < 8) return 'SET (short)';
  return `SET (${v.length} chars, starts with "${v.slice(0, 5)}...")`;
}

export default async function handler(req: any, res: any) {
  const state = {
    timestamp: new Date().toISOString(),
    environment: process.env.VERCEL_ENV || 'unknown',
    region: process.env.VERCEL_REGION || 'unknown',
    env_vars: {
      ANTHROPIC_API_KEY: mask(process.env.ANTHROPIC_API_KEY),
      GOOGLE_CLIENT_ID: mask(process.env.GOOGLE_CLIENT_ID),
      GOOGLE_CLIENT_SECRET: mask(process.env.GOOGLE_CLIENT_SECRET),
      GOOGLE_REFRESH_TOKEN: mask(process.env.GOOGLE_REFRESH_TOKEN),
      GOOGLE_MAPS_API_KEY: mask(process.env.GOOGLE_MAPS_API_KEY),
      FMCSA_API_KEY: mask(process.env.FMCSA_API_KEY),
      ASANA_ACCESS_TOKEN: mask(process.env.ASANA_ACCESS_TOKEN),
      CLOUDFLARE_D1_TOKEN: mask(process.env.CLOUDFLARE_D1_TOKEN),
    },
    samantha_ready: Boolean(process.env.ANTHROPIC_API_KEY),
    next_step: process.env.ANTHROPIC_API_KEY
      ? 'Ready. Open gillybelichick.vercel.app and chat with Samantha.'
      : 'Add ANTHROPIC_API_KEY in Vercel: vercel.com/carbcleantruckcheckapp/gillybelichick/settings/environment-variables',
  };

  // Return HTML for easy mobile viewing, JSON on ?format=json
  if (req.query?.format === 'json') {
    return res.status(200).json(state);
  }

  const row = (k: string, v: string) => {
    const ok = !v.startsWith('NOT');
    const color = ok ? '#4ade80' : '#ef4444';
    const icon = ok ? '✓' : '✗';
    return `<tr><td style="padding:8px 12px;border-bottom:1px solid #f0e6d5"><code>${k}</code></td><td style="padding:8px 12px;border-bottom:1px solid #f0e6d5;color:${color}"><b>${icon}</b> ${v}</td></tr>`;
  };

  const ready = state.samantha_ready;
  const bannerBg = ready ? '#dcfce7' : '#fee2e2';
  const bannerColor = ready ? '#166534' : '#991b1b';
  const bannerText = ready ? '✓ Samantha is ready' : '✗ Samantha needs ANTHROPIC_API_KEY';

  const html = `<!DOCTYPE html>
<html><head><title>Samantha Status</title><meta name="viewport" content="width=device-width,initial-scale=1">
<style>
body { font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif; background:#FFF8F0; color:#2D2D2D; margin:0; padding:20px; }
.wrap { max-width:600px; margin:0 auto; }
h1 { font-size:22px; margin:0 0 4px; }
.sub { color:#8B8B8B; font-size:13px; margin-bottom:20px; }
.banner { padding:16px; border-radius:12px; margin-bottom:20px; background:${bannerBg}; color:${bannerColor}; font-weight:600; }
table { width:100%; background:#fff; border-radius:12px; overflow:hidden; box-shadow:0 1px 3px rgba(0,0,0,.06); font-size:14px; border-collapse:collapse; }
td:first-child { color:#E8725A; font-weight:500; width:40%; }
code { font-family:"SF Mono",Monaco,monospace; font-size:13px; }
.next { background:#fff; padding:16px; border-radius:12px; margin-top:20px; border-left:4px solid #E8725A; }
.next h3 { margin:0 0 8px; font-size:14px; }
.next p { margin:0; font-size:14px; line-height:1.5; }
a { color:#E8725A; word-break:break-all; }
.meta { margin-top:20px; color:#8B8B8B; font-size:12px; }
</style></head><body><div class="wrap">
<h1>Samantha · Status</h1>
<div class="sub">Environment: ${state.environment} · Region: ${state.region}</div>
<div class="banner">${bannerText}</div>
<table>${Object.entries(state.env_vars).map(([k, v]) => row(k, v)).join('')}</table>
<div class="next"><h3>Next step</h3><p>${ready ? state.next_step : `Go to <a href="https://vercel.com/carbcleantruckcheckapp/gillybelichick/settings/environment-variables">Vercel env var settings</a>, add <code>ANTHROPIC_API_KEY</code> = your sk-ant- key across all 3 environments, save. Redeploy happens automatically.`}</p></div>
<div class="meta">Checked at ${state.timestamp}<br>For JSON: <a href="?format=json">?format=json</a></div>
</div></body></html>`;

  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  return res.status(200).send(html);
}
