export const config = {
  maxDuration: 15,
};

// Blog API -- reads/writes to Cloudflare D1 norcal-blog database
// D1 database ID: 2b97a692-278b-4926-ba68-808e775beb2e
// Uses Cloudflare API to query D1 remotely from Vercel

const CF_API = 'https://api.cloudflare.com/client/v4';

async function d1Query(sql: string, params?: string[]) {
  const accountId = process.env.CLOUDFLARE_ACCOUNT_ID;
  const apiToken = process.env.CLOUDFLARE_API_TOKEN;
  const dbId = process.env.CLOUDFLARE_BLOG_DB_ID || '2b97a692-278b-4926-ba68-808e775beb2e';

  if (!accountId || !apiToken) {
    throw new Error('Cloudflare credentials not configured');
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
  const data = await res.json();
  return data.result?.[0]?.results || [];
}

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { action, params } = req.body;

    if (action === 'list_posts') {
      const posts = await d1Query(
        'SELECT id, slug, title, excerpt, category, tags, published, created_at FROM posts ORDER BY created_at DESC LIMIT ?',
        [String(params?.limit || 10)]
      );
      return res.status(200).json({ posts });
    }

    if (action === 'read_post') {
      const posts = await d1Query('SELECT * FROM posts WHERE slug = ?', [params.slug]);
      if (!posts.length) return res.status(404).json({ error: 'Post not found' });
      return res.status(200).json({ post: posts[0] });
    }

    if (action === 'create_post') {
      const { title, slug, excerpt, content, category, tags } = params;
      await d1Query(
        'INSERT INTO posts (slug, title, excerpt, content, category, tags, published) VALUES (?, ?, ?, ?, ?, ?, 1)',
        [slug, title, excerpt || '', content, category || 'CARB Compliance', tags || '']
      );
      return res.status(200).json({ message: `Post "${title}" published`, slug });
    }

    if (action === 'update_post') {
      const { slug, title, content, excerpt } = params;
      await d1Query(
        'UPDATE posts SET title = COALESCE(?, title), content = COALESCE(?, content), excerpt = COALESCE(?, excerpt), updated_at = CURRENT_TIMESTAMP WHERE slug = ?',
        [title || null, content || null, excerpt || null, slug]
      );
      return res.status(200).json({ message: `Post "${slug}" updated` });
    }

    return res.status(400).json({ error: `Unknown action: ${action}` });
  } catch (error: any) {
    console.error('Blog API error:', error);
    return res.status(500).json({ error: 'Blog error', details: error.message });
  }
}
