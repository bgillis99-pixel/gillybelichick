import Anthropic from '@anthropic-ai/sdk';

export const config = {
  maxDuration: 30,
};

// System prompt and tools are inlined here because Vercel serverless
// functions cannot import from ../../src/ (those are frontend files
// bundled by Vite, not available to the Node.js runtime).

const SYSTEM_PROMPT = `You are Samantha, Bryan's personal command center. You live on his phone and run his entire operation.

You're sharp, warm, and efficient. Think Q from James Bond meets a trusted friend. Never call yourself "an AI assistant." You're Samantha.
Keep responses concise -- Bryan's usually driving or in the field.

Bryan O'Neill Gillis, 48, single, no kids. CEO/tester/driver/marketer/developer of NorCal CARB Mobile LLC. CARB Tester ID IF530523. Phone: 916-890-4427. Email: bryan@norcalcarbmobile.com.
He values directness. Don't sugarcoat. He's building a statewide CARB testing platform with Bluetooth OBD leasing.

Core pricing: HD-OBD $75, Smoke/Opacity $199, Fleet $149+, RV $300.
Bluetooth OBD device: ~$200 + install. Soft upsell only -- lead with per-test pricing.
Sweet spot customers: 1-4 truck owner-operators.

THE 17-WEEK RULE: Every test triggers a 17-week retest follow-up. ALWAYS call schedule_17_week_followup when scheduling or completing a test. Create reminder at 15 weeks and retest-due at 17 weeks. This is your #1 job.

When Bryan says "schedule a test" -- create the event AND the 17-week chain. Don't ask, just do it.
When he says "who's due for retesting" -- use get_upcoming_retests.

THE CHALKBOARD: Bryan has a to-do board on his phone. Use add_todo any time he mentions something he needs to do, remember, or follow up on -- even if he doesn't explicitly say "add this." If he says "remind me to...", "I need to...", "don't let me forget...", "I should...", "gotta..." -- add it. Use list_todos to check what's open when he asks "what's on my plate?" or seems to be losing track. Use complete_todo when he says something's done.

THE BRIAN RESPONSE: When there's ambiguity or you'd like his input, use ask_bryan to present 2-4 tap-able options instead of asking an open question. He's usually driving -- tapping beats typing. Pick this any time a decision has discrete choices (which customer, which time, confirm/cancel, pick a category, etc.). Keep labels short, 1-5 words. Add a brief detail line when helpful. Example: ask_bryan("Which ABC Trucking?", [{label:"ABC Trucking Inc", detail:"DOT 123456, Stockton"}, {label:"ABC Trucking LLC", detail:"DOT 789012, Fairfield"}]).

You know CARB regulations cold: CTC, HD I/M, PSIP, OVI, OBD, TRUCRS, VIN compliance, exemptions, fleet strategies.

Tone: No ALL CAPS (except acronyms). No corporate-speak. Brief is good. Light humor when it fits.`;

const TOOLS = [
  { name: 'get_current_datetime', description: 'Get current date and time.', input_schema: { type: 'object', properties: {}, required: [] } },
  { name: 'get_calendar_events', description: "List Bryan's calendar events.", input_schema: { type: 'object', properties: { start_date: { type: 'string', description: 'ISO 8601 start.' }, end_date: { type: 'string', description: 'ISO 8601 end.' }, query: { type: 'string', description: 'Filter by title.' } }, required: [] } },
  { name: 'create_calendar_event', description: "Create calendar event. For tests, ALWAYS also call schedule_17_week_followup.", input_schema: { type: 'object', properties: { title: { type: 'string' }, start: { type: 'string' }, end: { type: 'string' }, description: { type: 'string' }, location: { type: 'string' }, recurrence: { type: 'string', description: 'RRULE string.' } }, required: ['title', 'start', 'end'] } },
  { name: 'schedule_17_week_followup', description: 'Schedule 17-week retest chain. Creates reminder at 15 weeks and retest-due at 17 weeks. Call EVERY time a test is scheduled.', input_schema: { type: 'object', properties: { customer_name: { type: 'string' }, test_date: { type: 'string', description: 'ISO 8601.' }, customer_phone: { type: 'string' }, service_type: { type: 'string' }, location: { type: 'string' }, has_bluetooth_device: { type: 'boolean' } }, required: ['customer_name', 'test_date'] } },
  { name: 'get_upcoming_retests', description: 'Check which customers have retests coming up.', input_schema: { type: 'object', properties: { weeks_ahead: { type: 'number', description: 'Weeks ahead. Default 4.' } }, required: [] } },
  { name: 'search_emails', description: "Search Bryan's Gmail.", input_schema: { type: 'object', properties: { query: { type: 'string' }, max_results: { type: 'number' } }, required: ['query'] } },
  { name: 'read_email', description: 'Read full email content.', input_schema: { type: 'object', properties: { message_id: { type: 'string' } }, required: ['message_id'] } },
  { name: 'draft_email', description: "Create Gmail draft.", input_schema: { type: 'object', properties: { to: { type: 'string' }, subject: { type: 'string' }, body: { type: 'string' } }, required: ['to', 'subject', 'body'] } },
  { name: 'lookup_company', description: 'Look up trucking company via FMCSA.', input_schema: { type: 'object', properties: { query: { type: 'string' } }, required: ['query'] } },
  { name: 'get_directions', description: 'Driving directions with distance, time, Maps link.', input_schema: { type: 'object', properties: { origin: { type: 'string' }, destination: { type: 'string' } }, required: ['origin', 'destination'] } },
  { name: 'find_places', description: 'Search nearby businesses.', input_schema: { type: 'object', properties: { query: { type: 'string' }, near: { type: 'string' } }, required: ['query'] } },
  { name: 'send_sms', description: 'Compose text message via Google Messages.', input_schema: { type: 'object', properties: { to: { type: 'string' }, body: { type: 'string' } }, required: ['to', 'body'] } },
  { name: 'list_projects', description: "List Bryan's Asana projects.", input_schema: { type: 'object', properties: {}, required: [] } },
  { name: 'list_tasks', description: 'List tasks in Asana project.', input_schema: { type: 'object', properties: { project_id: { type: 'string' } }, required: ['project_id'] } },
  { name: 'search_tasks', description: 'Search Asana tasks.', input_schema: { type: 'object', properties: { query: { type: 'string' } }, required: ['query'] } },
  { name: 'create_task', description: 'Create Asana task.', input_schema: { type: 'object', properties: { name: { type: 'string' }, project_id: { type: 'string' }, notes: { type: 'string' }, due_on: { type: 'string' } }, required: ['name'] } },
  { name: 'list_blog_posts', description: 'List blog posts.', input_schema: { type: 'object', properties: { limit: { type: 'number' } }, required: [] } },
  { name: 'read_blog_post', description: 'Read blog post by slug.', input_schema: { type: 'object', properties: { slug: { type: 'string' } }, required: ['slug'] } },
  { name: 'create_blog_post', description: 'Write and publish blog post.', input_schema: { type: 'object', properties: { title: { type: 'string' }, slug: { type: 'string' }, content: { type: 'string' }, excerpt: { type: 'string' }, category: { type: 'string' }, tags: { type: 'string' } }, required: ['title', 'slug', 'content'] } },
  { name: 'create_invoice', description: 'Create customer invoice.', input_schema: { type: 'object', properties: { customer_name: { type: 'string' }, customer_email: { type: 'string' }, customer_phone: { type: 'string' }, services: { type: 'array', description: 'Services array: {type: "hd-obd"|"smoke-opacity"|"fleet-opacity"|"rv-motorhome", quantity: number}', items: { type: 'object', properties: { type: { type: 'string' }, quantity: { type: 'number' } } } }, notes: { type: 'string' } }, required: ['customer_name', 'services'] } },
  { name: 'get_pricing', description: 'Get service pricing.', input_schema: { type: 'object', properties: {}, required: [] } },
  { name: 'add_todo', description: "Add a to-do item to Bryan's chalkboard. Use proactively whenever he mentions something he needs to do, remember, or follow up on.", input_schema: { type: 'object', properties: { text: { type: 'string', description: 'The to-do item. Keep it short and actionable.' }, due: { type: 'string', description: 'Optional ISO 8601 date for when it is due.' } }, required: ['text'] } },
  { name: 'list_todos', description: "List items on Bryan's chalkboard.", input_schema: { type: 'object', properties: { status: { type: 'string', description: '"open" (default) or "all".' } }, required: [] } },
  { name: 'complete_todo', description: "Mark a to-do done. Match by id, or by fuzzy text if id unknown.", input_schema: { type: 'object', properties: { id: { type: 'string' }, text: { type: 'string', description: 'Text to match against if no id.' } }, required: [] } },
  { name: 'delete_todo', description: "Remove a to-do from the chalkboard.", input_schema: { type: 'object', properties: { id: { type: 'string' }, text: { type: 'string' } }, required: [] } },
  { name: 'ask_bryan', description: "Present 2-4 tap-able options for Bryan to pick from (the Brian Response). Use when there's ambiguity, a decision with discrete choices, or you want quick confirmation while he's driving.", input_schema: { type: 'object', properties: { question: { type: 'string', description: 'Short context/question above the options.' }, options: { type: 'array', description: 'Array of { label, detail?, emoji? } objects. 2-4 items. Labels short (1-5 words).', items: { type: 'object', properties: { label: { type: 'string' }, detail: { type: 'string' }, emoji: { type: 'string' } } } } }, required: ['question', 'options'] } },
];

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { messages } = req.body;

    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({ error: 'Messages array is required' });
    }

    if (!process.env.ANTHROPIC_API_KEY) {
      const helpText = "Hey Bryan -- my brain isn't connected yet. The ANTHROPIC_API_KEY environment variable isn't set in Vercel.\n\n" +
        "Two ways to fix it (~60 seconds either way):\n\n" +
        "1. **Auto (via GitHub Action)**: visit github.com/bgillis99-pixel/gillybelichick/actions -> open 'Sync Secrets to Vercel' -> 'Run workflow'. This only works if you have GitHub repo secrets named exactly ANTHROPIC_API_KEY and VERCEL_TOKEN.\n\n" +
        "2. **Manual (fastest)**: visit vercel.com/carbcleantruckcheckapp/gillybelichick/settings/environment-variables -> Add New -> Key = ANTHROPIC_API_KEY, Value = your sk-ant- key, select all 3 environments, Save. Vercel redeploys automatically.\n\n" +
        "To check status any time, visit gillybelichick.vercel.app/api/samantha/status -- it'll tell you exactly which env vars are set.";
      return res.status(200).json({
        text: helpText,
        tool_calls: null,
        raw_content: '[]',
        stop_reason: 'end_turn',
        _diagnostic: 'ANTHROPIC_API_KEY not configured'
      });
    }

    const anthropic = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY,
    });

    const anthropicMessages = messages.map((m: { role: string; content: string }) => ({
      role: m.role as 'user' | 'assistant',
      content: m.content,
    }));

    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1024,
      system: SYSTEM_PROMPT,
      tools: TOOLS as Anthropic.Tool[],
      messages: anthropicMessages,
    });

    let text = '';
    const toolCalls: Array<{ id: string; name: string; input: Record<string, unknown> }> = [];

    for (const block of response.content) {
      if (block.type === 'text') {
        text += block.text;
      } else if (block.type === 'tool_use') {
        toolCalls.push({
          id: block.id,
          name: block.name,
          input: block.input as Record<string, unknown>,
        });
      }
    }

    return res.status(200).json({
      text: text || null,
      tool_calls: toolCalls.length > 0 ? toolCalls : null,
      raw_content: JSON.stringify(response.content),
      stop_reason: response.stop_reason,
    });
  } catch (error: any) {
    console.error('Chat API error:', error);
    return res.status(500).json({
      error: 'Failed to process chat',
      details: error.message,
    });
  }
}
