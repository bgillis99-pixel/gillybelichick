export const config = {
  maxDuration: 15,
};

// Project board backed by Cloudflare D1 (replaces Asana)
// Uses the same norcal-blog D1 database with projects + tasks tables

const CF_API = 'https://api.cloudflare.com/client/v4';

async function d1Query(sql: string, params?: (string | null)[]) {
  const accountId = process.env.CLOUDFLARE_ACCOUNT_ID;
  const apiToken = process.env.CLOUDFLARE_API_TOKEN;
  const dbId = process.env.CLOUDFLARE_BLOG_DB_ID || '2b97a692-278b-4926-ba68-808e775beb2e';

  if (!accountId || !apiToken) {
    throw new Error('Cloudflare credentials not configured (CLOUDFLARE_ACCOUNT_ID + CLOUDFLARE_API_TOKEN)');
  }

  const res = await fetch(`${CF_API}/accounts/${accountId}/d1/database/${dbId}/query`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ sql, params: params || [] }),
  });

  if (!res.ok) throw new Error(`D1 API error: ${res.status}`);
  const data: any = await res.json();
  return data.result?.[0]?.results || [];
}

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { action, params } = req.body;

    if (action === 'list_projects') {
      const projects = await d1Query(
        'SELECT id, name, status, due_on, created_at FROM projects WHERE status = ? ORDER BY created_at DESC',
        ['active']
      );
      return res.status(200).json({
        projects: projects.map((p: any) => ({
          id: String(p.id),
          name: p.name,
          status: p.status,
          dueOn: p.due_on,
        })),
      });
    }

    if (action === 'list_tasks') {
      const projectId = params?.project_id;
      const sql = projectId
        ? 'SELECT t.id, t.name, t.completed, t.due_on, t.notes, p.name as project FROM tasks t LEFT JOIN projects p ON t.project_id = p.id WHERE t.project_id = ? ORDER BY t.completed ASC, t.created_at DESC'
        : 'SELECT t.id, t.name, t.completed, t.due_on, t.notes, p.name as project FROM tasks t LEFT JOIN projects p ON t.project_id = p.id ORDER BY t.completed ASC, t.created_at DESC LIMIT 50';
      const tasks = await d1Query(sql, projectId ? [String(projectId)] : []);
      return res.status(200).json({
        tasks: tasks.map((t: any) => ({
          id: String(t.id),
          name: t.name,
          completed: Boolean(t.completed),
          dueOn: t.due_on,
          project: t.project || null,
        })),
      });
    }

    if (action === 'search_tasks') {
      const query = params?.query || '';
      const tasks = await d1Query(
        "SELECT t.id, t.name, t.completed, t.due_on, t.notes, p.name as project FROM tasks t LEFT JOIN projects p ON t.project_id = p.id WHERE t.name LIKE '%' || ? || '%' OR t.notes LIKE '%' || ? || '%' ORDER BY t.created_at DESC LIMIT 20",
        [query, query]
      );
      return res.status(200).json({
        tasks: tasks.map((t: any) => ({
          id: String(t.id),
          name: t.name,
          completed: Boolean(t.completed),
          dueOn: t.due_on,
          project: t.project || null,
        })),
      });
    }

    if (action === 'create_task') {
      const { name, project_id, notes, due_on } = params;
      await d1Query(
        'INSERT INTO tasks (name, project_id, notes, due_on) VALUES (?, ?, ?, ?)',
        [name, project_id || null, notes || '', due_on || null]
      );
      return res.status(200).json({
        task: { name },
        message: `Task "${name}" created`,
      });
    }

    if (action === 'create_project') {
      const { name, due_on } = params;
      await d1Query(
        'INSERT INTO projects (name, due_on) VALUES (?, ?)',
        [name, due_on || null]
      );
      return res.status(200).json({
        project: { name },
        message: `Project "${name}" created`,
      });
    }

    return res.status(400).json({ error: `Unknown action: ${action}` });
  } catch (error: any) {
    console.error('Project board error:', error);
    return res.status(500).json({ error: 'Project board error', details: error.message });
  }
}
