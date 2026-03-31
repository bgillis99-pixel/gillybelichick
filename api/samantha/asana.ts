export const config = {
  maxDuration: 15,
};

// Asana API proxy for Samantha
// Workspace: norcalcarbmobile.com (gid: 1212983048364238)

const ASANA_BASE = 'https://app.asana.com/api/1.0';

async function asanaFetch(path: string, token: string, method = 'GET', body?: any) {
  const res = await fetch(`${ASANA_BASE}${path}`, {
    method,
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  if (!res.ok) throw new Error(`Asana API error: ${res.status}`);
  return res.json();
}

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const token = process.env.ASANA_ACCESS_TOKEN;
  if (!token) {
    return res.status(500).json({ error: 'ASANA_ACCESS_TOKEN not configured' });
  }

  try {
    const { action, params } = req.body;
    const workspaceId = '1212983048364238';

    if (action === 'list_projects') {
      const data = await asanaFetch(`/workspaces/${workspaceId}/projects?opt_fields=name,current_status,due_on`, token);
      return res.status(200).json({
        projects: data.data.map((p: any) => ({
          id: p.gid,
          name: p.name,
          status: p.current_status?.color || 'none',
          dueOn: p.due_on,
        })),
      });
    }

    if (action === 'list_tasks') {
      const projectId = params?.project_id;
      if (!projectId) return res.status(400).json({ error: 'project_id required' });
      const data = await asanaFetch(`/projects/${projectId}/tasks?opt_fields=name,completed,due_on,assignee.name`, token);
      return res.status(200).json({
        tasks: data.data.map((t: any) => ({
          id: t.gid,
          name: t.name,
          completed: t.completed,
          dueOn: t.due_on,
          assignee: t.assignee?.name || null,
        })),
      });
    }

    if (action === 'search_tasks') {
      const query = params?.query || '';
      const data = await asanaFetch(
        `/workspaces/${workspaceId}/tasks/search?text=${encodeURIComponent(query)}&opt_fields=name,completed,due_on,projects.name`,
        token
      );
      return res.status(200).json({
        tasks: data.data.map((t: any) => ({
          id: t.gid,
          name: t.name,
          completed: t.completed,
          dueOn: t.due_on,
          project: t.projects?.[0]?.name || null,
        })),
      });
    }

    if (action === 'create_task') {
      const { name, project_id, notes, due_on } = params;
      const data = await asanaFetch('/tasks', token, 'POST', {
        data: {
          name,
          workspace: workspaceId,
          projects: project_id ? [project_id] : undefined,
          notes: notes || '',
          due_on: due_on || undefined,
        },
      });
      return res.status(200).json({
        task: { id: data.data.gid, name: data.data.name },
        message: `Task "${name}" created`,
      });
    }

    return res.status(400).json({ error: `Unknown action: ${action}` });
  } catch (error: any) {
    console.error('Asana API error:', error);
    return res.status(500).json({ error: 'Asana error', details: error.message });
  }
}
