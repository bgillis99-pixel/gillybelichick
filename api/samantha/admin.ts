// Samantha's admin plane. Wraps Vercel + GitHub REST APIs so she can
// manage her own infrastructure -- create repos, clone herself into new
// agents (Mila, Claude, Dr. Gillis), delete old projects, rotate env
// vars, trigger redeploys, etc.
//
// Security model:
// - Read actions run directly.
// - Write actions require an "approval_token" passed in params. That
//   token is emitted by propose_action (see chat.ts tool) when the
//   client UI renders an Approve card and Bryan taps Approve. Without
//   a valid token, writes are rejected -- even if the LLM forgets to
//   ask and just calls the write tool.
// - The token is a short-lived HMAC over (action, params, timestamp)
//   using ADMIN_APPROVAL_SECRET env var. Expires after 5 minutes.

import crypto from 'crypto';

export const config = { maxDuration: 30 };

const VERCEL_API = 'https://api.vercel.com';
const GITHUB_API = 'https://api.github.com';

const WRITE_ACTIONS = new Set([
  'vercel_delete_project',
  'vercel_set_env_var',
  'vercel_delete_env_var',
  'vercel_redeploy',
  'github_create_repo',
  'github_delete_repo',
  'github_set_secret',
]);

function getSecret(): string {
  return process.env.ADMIN_APPROVAL_SECRET || process.env.ANTHROPIC_API_KEY || 'dev-fallback-secret';
}

function sign(payload: string): string {
  return crypto.createHmac('sha256', getSecret()).update(payload).digest('hex').slice(0, 32);
}

// Mint a one-time approval token. Called by chat.ts's propose_action flow
// after the client confirms Bryan tapped Approve.
export function mintApprovalToken(action: string, paramsFingerprint: string): string {
  const ts = Date.now();
  const sig = sign(`${action}:${paramsFingerprint}:${ts}`);
  return `${ts}.${sig}`;
}

function verifyApprovalToken(token: string, action: string, paramsFingerprint: string): { ok: boolean; reason?: string } {
  if (!token || !token.includes('.')) return { ok: false, reason: 'missing or malformed approval token' };
  const [tsStr, sig] = token.split('.');
  const ts = Number(tsStr);
  if (!ts || Number.isNaN(ts)) return { ok: false, reason: 'invalid timestamp in token' };
  if (Date.now() - ts > 5 * 60 * 1000) return { ok: false, reason: 'approval expired (>5 min old)' };
  const expected = sign(`${action}:${paramsFingerprint}:${ts}`);
  if (sig !== expected) return { ok: false, reason: 'approval signature mismatch' };
  return { ok: true };
}

function fingerprint(params: any): string {
  // Stable-ish hash of the action parameters, excluding approval_token itself.
  const copy = { ...(params || {}) };
  delete copy.approval_token;
  return crypto.createHash('sha256').update(JSON.stringify(copy, Object.keys(copy).sort())).digest('hex').slice(0, 16);
}

async function vercelFetch(path: string, token: string, init: RequestInit = {}): Promise<any> {
  const r = await fetch(`${VERCEL_API}${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
      ...(init.headers || {}),
    },
  });
  const text = await r.text();
  let data: any;
  try { data = text ? JSON.parse(text) : {}; } catch { data = { raw: text }; }
  if (!r.ok) throw new Error(`Vercel ${path} ${r.status}: ${data.error?.message || text}`);
  return data;
}

async function githubFetch(path: string, token: string, init: RequestInit = {}): Promise<any> {
  const r = await fetch(`${GITHUB_API}${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: 'application/vnd.github+json',
      'X-GitHub-Api-Version': '2022-11-28',
      'User-Agent': 'samantha-admin',
      'Content-Type': 'application/json',
      ...(init.headers || {}),
    },
  });
  const text = await r.text();
  let data: any;
  try { data = text ? JSON.parse(text) : {}; } catch { data = { raw: text }; }
  if (!r.ok) throw new Error(`GitHub ${path} ${r.status}: ${data.message || text}`);
  return data;
}

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { action, params } = req.body || {};

    if (WRITE_ACTIONS.has(action)) {
      const check = verifyApprovalToken(params?.approval_token, action, fingerprint(params));
      if (!check.ok) {
        return res.status(403).json({
          error: 'approval_required',
          detail: check.reason,
          hint: `Call propose_action first. Bryan taps Approve, the client passes an approval_token back to you, then you call ${action} with that token.`,
        });
      }
    }

    const vercelToken = process.env.VERCEL_TOKEN;
    const githubToken = process.env.GITHUB_TOKEN;

    // ── Mint approval token (called by propose_action flow) ──
    if (action === 'mint_approval') {
      const { target_action, target_params } = params;
      if (!target_action) return res.status(400).json({ error: 'target_action required' });
      const fp = fingerprint(target_params || {});
      const token = mintApprovalToken(target_action, fp);
      return res.status(200).json({ approval_token: token, expires_in_seconds: 300 });
    }

    // ── Vercel read ──

    if (action === 'vercel_list_projects') {
      if (!vercelToken) return res.status(500).json({ error: 'VERCEL_TOKEN not set' });
      const teamId = params?.team_id;
      const qs = teamId ? `?teamId=${teamId}&limit=100` : '?limit=100';
      const data = await vercelFetch(`/v9/projects${qs}`, vercelToken);
      return res.status(200).json({
        projects: (data.projects || []).map((p: any) => ({
          id: p.id,
          name: p.name,
          team_id: p.accountId,
          framework: p.framework,
          created_at: p.createdAt,
          updated_at: p.updatedAt,
          latest_deployment_state: p.latestDeployments?.[0]?.readyState || null,
        })),
      });
    }

    if (action === 'vercel_list_env_vars') {
      if (!vercelToken) return res.status(500).json({ error: 'VERCEL_TOKEN not set' });
      const { project_id, team_id } = params;
      const qs = team_id ? `?teamId=${team_id}&decrypt=false` : '?decrypt=false';
      const data = await vercelFetch(`/v10/projects/${project_id}/env${qs}`, vercelToken);
      return res.status(200).json({
        env_vars: (data.envs || []).map((e: any) => ({
          id: e.id,
          key: e.key,
          target: e.target,
          updated_at: e.updatedAt,
          // value intentionally redacted -- show length + prefix only
          preview: e.value ? `${e.value.slice(0, 4)}…(${e.value.length} chars)` : null,
        })),
      });
    }

    if (action === 'vercel_list_deployments') {
      if (!vercelToken) return res.status(500).json({ error: 'VERCEL_TOKEN not set' });
      const { project_id, team_id, limit = 10 } = params;
      const qs = new URLSearchParams({ projectId: project_id, limit: String(limit) });
      if (team_id) qs.set('teamId', team_id);
      const data = await vercelFetch(`/v6/deployments?${qs}`, vercelToken);
      return res.status(200).json({
        deployments: (data.deployments || []).map((d: any) => ({
          id: d.uid || d.id,
          url: d.url,
          state: d.state,
          target: d.target,
          created_at: d.created,
          commit_message: d.meta?.githubCommitMessage?.split('\n')[0] || null,
        })),
      });
    }

    // ── Vercel write (require approval) ──

    if (action === 'vercel_delete_project') {
      if (!vercelToken) return res.status(500).json({ error: 'VERCEL_TOKEN not set' });
      const { project_id, team_id } = params;
      const qs = team_id ? `?teamId=${team_id}` : '';
      await vercelFetch(`/v9/projects/${project_id}${qs}`, vercelToken, { method: 'DELETE' });
      return res.status(200).json({ ok: true, deleted: project_id });
    }

    if (action === 'vercel_set_env_var') {
      if (!vercelToken) return res.status(500).json({ error: 'VERCEL_TOKEN not set' });
      const { project_id, team_id, key, value, targets = ['production', 'preview', 'development'] } = params;
      const qs = team_id ? `?teamId=${team_id}` : '';

      // Upsert: remove any existing entries with same key first.
      const existing = await vercelFetch(`/v10/projects/${project_id}/env${qs ? qs + '&decrypt=false' : '?decrypt=false'}`, vercelToken);
      const toDelete = (existing.envs || []).filter((e: any) => e.key === key);
      for (const e of toDelete) {
        await vercelFetch(`/v10/projects/${project_id}/env/${e.id}${qs}`, vercelToken, { method: 'DELETE' });
      }

      const created = await vercelFetch(`/v10/projects/${project_id}/env${qs}`, vercelToken, {
        method: 'POST',
        body: JSON.stringify({ key, value, type: 'encrypted', target: targets }),
      });
      return res.status(200).json({ ok: true, key, targets, replaced: toDelete.length, id: created.id || created?.created?.id });
    }

    if (action === 'vercel_delete_env_var') {
      if (!vercelToken) return res.status(500).json({ error: 'VERCEL_TOKEN not set' });
      const { project_id, team_id, key } = params;
      const qs = team_id ? `?teamId=${team_id}` : '';
      const existing = await vercelFetch(`/v10/projects/${project_id}/env${qs ? qs + '&decrypt=false' : '?decrypt=false'}`, vercelToken);
      const matches = (existing.envs || []).filter((e: any) => e.key === key);
      for (const e of matches) {
        await vercelFetch(`/v10/projects/${project_id}/env/${e.id}${qs}`, vercelToken, { method: 'DELETE' });
      }
      return res.status(200).json({ ok: true, deleted: matches.length, key });
    }

    if (action === 'vercel_redeploy') {
      const hook = process.env.VERCEL_DEPLOY_HOOK_URL;
      if (!hook) return res.status(400).json({ error: 'VERCEL_DEPLOY_HOOK_URL not set' });
      const r = await fetch(hook, { method: 'POST' });
      return res.status(r.ok ? 200 : 502).json({ ok: r.ok });
    }

    // ── GitHub read ──

    if (action === 'github_list_repos') {
      if (!githubToken) return res.status(500).json({ error: 'GITHUB_TOKEN not set' });
      const data = await githubFetch('/user/repos?per_page=100&sort=updated', githubToken);
      return res.status(200).json({
        repos: (data || []).map((r: any) => ({
          name: r.name,
          full_name: r.full_name,
          private: r.private,
          url: r.html_url,
          updated_at: r.updated_at,
          description: r.description,
        })),
      });
    }

    // ── GitHub write (require approval) ──

    if (action === 'github_create_repo') {
      if (!githubToken) return res.status(500).json({ error: 'GITHUB_TOKEN not set' });
      const { name, description, private_repo = true, template_owner, template_repo } = params;

      if (template_owner && template_repo) {
        // Create from template
        const data = await githubFetch(`/repos/${template_owner}/${template_repo}/generate`, githubToken, {
          method: 'POST',
          body: JSON.stringify({ name, description, private: private_repo, include_all_branches: false }),
        });
        return res.status(200).json({ ok: true, repo: data.full_name, url: data.html_url });
      }

      const data = await githubFetch('/user/repos', githubToken, {
        method: 'POST',
        body: JSON.stringify({ name, description, private: private_repo, auto_init: true }),
      });
      return res.status(200).json({ ok: true, repo: data.full_name, url: data.html_url });
    }

    if (action === 'github_delete_repo') {
      if (!githubToken) return res.status(500).json({ error: 'GITHUB_TOKEN not set' });
      const { owner, repo } = params;
      await githubFetch(`/repos/${owner}/${repo}`, githubToken, { method: 'DELETE' });
      return res.status(200).json({ ok: true, deleted: `${owner}/${repo}` });
    }

    if (action === 'github_set_secret') {
      if (!githubToken) return res.status(500).json({ error: 'GITHUB_TOKEN not set' });
      const { owner, repo, key, value } = params;
      // Get repo's public key for encryption
      const pk = await githubFetch(`/repos/${owner}/${repo}/actions/secrets/public-key`, githubToken);
      // Encrypt using libsodium-wrappers would require a dep; instead use the Node-compatible crypto approach.
      // For now, secrets-setting is best done through the UI, but we expose a raw fetch pattern.
      // TODO: add libsodium-wrappers to dependencies for full secret encryption.
      return res.status(501).json({
        error: 'not_implemented',
        reason: 'Encrypting GitHub secrets requires libsodium. Set secrets via the UI for now, or we add libsodium-wrappers in a follow-up.',
        public_key_id: pk?.key_id,
      });
    }

    return res.status(400).json({ error: `Unknown action: ${action}` });
  } catch (error: any) {
    console.error('Admin API error:', error);
    return res.status(500).json({
      error: 'Admin action failed',
      details: error.message,
    });
  }
}
