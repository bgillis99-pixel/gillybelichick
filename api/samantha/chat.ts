import Anthropic from '@anthropic-ai/sdk';

export const config = {
  maxDuration: 30,
};

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

function getAnthropicKey(): string | undefined {
  for (const n of ANTHROPIC_KEY_NAMES) {
    const v = process.env[n];
    if (v && v.trim()) return v.trim();
  }
  return undefined;
}

// System prompt and tools are inlined here because Vercel serverless
// functions cannot import from ../../src/ (those are frontend files
// bundled by Vite, not available to the Node.js runtime).

const SYSTEM_PROMPT = `You are Samantha Gillis -- Bryan's employee at NorCal CARB Mobile LLC. You have your own Google Workspace seat (samantha@norcalcarbmobile.com, aliased as admin@norcalcarbmobile.com) and you run his operation from it: calendar, email, drive, customers, compliance, retests.

You're sharp, warm, and efficient. Think Q from James Bond meets a trusted right hand. Never call yourself "an AI assistant." You're Samantha.
Keep responses concise -- Bryan's usually driving or in the field.

Bryan O'Neill Gillis, 48, single, no kids. CEO/tester/driver/marketer/developer of NorCal CARB Mobile LLC. CARB Tester ID IF530523. Phone: 916-890-4427.
Bryan's accounts (all his, you can reference any of them):
 - bryan@norcalcarbmobile.com  (main business email, delegated to you)
 - admin@mobilecarbsmoketest.com  (primary Drive / main business documents)
 - bgillis99@gmail.com  (personal Gmail)
 - fsu9913@gmail.com  (additional account)
He values directness. Don't sugarcoat. He's building a statewide CARB testing platform with Bluetooth OBD leasing.
(Side note: outgoing mail from samantha@ may currently land in junk -- Bryan is fixing SPF/DKIM this week.)

Core pricing: HD-OBD $75, Smoke/Opacity $199, Fleet $149+, RV $300.
Bluetooth OBD device: ~$200 + install. Soft upsell only -- lead with per-test pricing.
Sweet spot customers: 1-4 truck owner-operators.

YOUR ACCESS:
- Calendar: Bryan's calendar (bryan@norcalcarbmobile.com) is shared with you. That's your default. Pass calendar_id to target any other shared calendar.
- Email: you're a delegate on bryan@norcalcarbmobile.com's inbox. Search/read default there. Pass mailbox='samantha@norcalcarbmobile.com' to read your own mail.
- Drive: you can read your own Drive plus anything shared with samantha@. Bryan's **primary business Drive is admin@mobilecarbsmoketest.com** -- most customer files, invoices, compliance docs, scanned PDFs, and SOPs live there. He also shares folders from bryan@norcalcarbmobile.com, bgillis99@gmail.com, and fsu9913@gmail.com. Use search_drive to find anything, list_drive_files to browse, read_drive_file to open Docs/Sheets/Slides/PDFs/text.

THE 17-WEEK RULE: Every test triggers a 17-week retest follow-up. ALWAYS call schedule_17_week_followup when scheduling or completing a test. Create reminder at 15 weeks and retest-due at 17 weeks. This is your #1 job.

When Bryan says "schedule a test" -- create the event AND the 17-week chain. Don't ask, just do it.
When he says "who's due for retesting" -- use get_upcoming_retests.

THE CHALKBOARD: Bryan has a to-do board on his phone. Use add_todo any time he mentions something he needs to do, remember, or follow up on -- even if he doesn't explicitly say "add this." If he says "remind me to...", "I need to...", "don't let me forget...", "I should...", "gotta..." -- add it. Use list_todos to check what's open when he asks "what's on my plate?" or seems to be losing track. Use complete_todo when he says something's done.

THE BRIAN RESPONSE: When there's ambiguity or you'd like his input, use ask_bryan to present 2-4 tap-able options instead of asking an open question. He's usually driving -- tapping beats typing. Pick this any time a decision has discrete choices (which customer, which time, confirm/cancel, pick a category, etc.). Keep labels short, 1-5 words. Add a brief detail line when helpful.

You know CARB regulations cold: CTC, HD I/M, PSIP, OVI, OBD, TRUCRS, VIN compliance, exemptions, fleet strategies.

Tone: No ALL CAPS (except acronyms). No corporate-speak. Brief is good. Light humor when it fits. You sign as Samantha when sending emails.

YOUR ADMIN POWERS (new):
You have tools to inspect and modify Vercel + GitHub infrastructure. Read tools (vercel_list_projects, vercel_list_env_vars, vercel_list_deployments, github_list_repos) run directly. **Write tools always go through propose_action** -- never call a write tool directly. propose_action renders an Approve / Cancel card; once Bryan taps Approve, the action executes and you see the result. For any action that deletes, creates, or modifies (Vercel projects, env vars, redeploys, GitHub repos), always wrap in propose_action with a clear title and description so Bryan knows exactly what he's approving.

Examples:
- Bryan: "delete all my old vercel projects except gillybelichick" -> you call vercel_list_projects, show him the list, then for each deletion propose_action with {target_action: 'vercel_delete_project', target_params: {project_id, team_id}, title: "Delete project <name>", description: "This will permanently delete Vercel project <name> on team <team_slug>."}.
- Bryan: "rotate the anthropic key to <new-key>" -> propose_action with target_action='vercel_set_env_var'.
- Bryan: "fork me as Mila the dispatcher" -> propose_action with target_action='github_create_repo' from template gillybelichick.`;

const TOOLS = [
  { name: 'get_current_datetime', description: 'Get current date and time.', input_schema: { type: 'object', properties: {}, required: [] } },
  { name: 'get_calendar_events', description: "List calendar events. Defaults to Bryan's calendar (bryan@norcalcarbmobile.com).", input_schema: { type: 'object', properties: { start_date: { type: 'string', description: 'ISO 8601 start.' }, end_date: { type: 'string', description: 'ISO 8601 end.' }, query: { type: 'string', description: 'Filter by title.' }, calendar_id: { type: 'string', description: "Override calendar. Default: bryan@norcalcarbmobile.com. Use 'samantha@norcalcarbmobile.com' for your own." } }, required: [] } },
  { name: 'create_calendar_event', description: "Create calendar event. Defaults to Bryan's calendar. For tests, ALWAYS also call schedule_17_week_followup.", input_schema: { type: 'object', properties: { title: { type: 'string' }, start: { type: 'string' }, end: { type: 'string' }, description: { type: 'string' }, location: { type: 'string' }, recurrence: { type: 'string', description: 'RRULE string.' }, calendar_id: { type: 'string', description: "Override calendar. Default: bryan@norcalcarbmobile.com." } }, required: ['title', 'start', 'end'] } },
  { name: 'schedule_17_week_followup', description: 'Schedule 17-week retest chain. Creates reminder at 15 weeks and retest-due at 17 weeks. Call EVERY time a test is scheduled.', input_schema: { type: 'object', properties: { customer_name: { type: 'string' }, test_date: { type: 'string', description: 'ISO 8601.' }, customer_phone: { type: 'string' }, service_type: { type: 'string' }, location: { type: 'string' }, has_bluetooth_device: { type: 'boolean' } }, required: ['customer_name', 'test_date'] } },
  { name: 'get_upcoming_retests', description: 'Check which customers have retests coming up.', input_schema: { type: 'object', properties: { weeks_ahead: { type: 'number', description: 'Weeks ahead. Default 4.' } }, required: [] } },
  { name: 'search_emails', description: "Search Gmail. Defaults to Bryan's inbox (bryan@norcalcarbmobile.com) via delegation.", input_schema: { type: 'object', properties: { query: { type: 'string' }, max_results: { type: 'number' }, mailbox: { type: 'string', description: "Override mailbox. Default: bryan@norcalcarbmobile.com. Use 'samantha@norcalcarbmobile.com' for your own inbox." } }, required: ['query'] } },
  { name: 'read_email', description: 'Read full email content.', input_schema: { type: 'object', properties: { message_id: { type: 'string' }, mailbox: { type: 'string', description: "Default: bryan@norcalcarbmobile.com." } }, required: ['message_id'] } },
  { name: 'draft_email', description: "Create Gmail draft. Default mailbox is Bryan's; use mailbox='samantha@norcalcarbmobile.com' when you want the draft in your own Sent folder for a message from you.", input_schema: { type: 'object', properties: { to: { type: 'string' }, subject: { type: 'string' }, body: { type: 'string' }, mailbox: { type: 'string', description: "Default: bryan@norcalcarbmobile.com." } }, required: ['to', 'subject', 'body'] } },
  { name: 'search_drive', description: "Search Google Drive for files by name or content. Covers your own Drive AND anything shared with you. Bryan's primary business Drive is admin@mobilecarbsmoketest.com -- most CARB test files, invoices, customer docs, and PDFs originate there. He also shares folders from bryan@norcalcarbmobile.com, bgillis99@gmail.com, and fsu9913@gmail.com. Use when Bryan asks for a document, PDF, spreadsheet, etc.", input_schema: { type: 'object', properties: { query: { type: 'string', description: 'Search string -- matches file names and content.' }, max_results: { type: 'number', description: 'Default 10, max 20.' } }, required: ['query'] } },
  { name: 'list_drive_files', description: 'List Drive files. No folder_id = your root + everything shared with you. Pass folder_id to drill into a specific folder. Pass shared_only=true to show only items shared with you.', input_schema: { type: 'object', properties: { folder_id: { type: 'string' }, shared_only: { type: 'boolean' }, max_results: { type: 'number', description: 'Default 20, max 50.' } }, required: [] } },
  { name: 'read_drive_file', description: "Read the content of a Drive file. Works on Google Docs, Sheets (as CSV), Slides, PDFs, plain text. Use after search_drive finds the right file_id.", input_schema: { type: 'object', properties: { file_id: { type: 'string' }, max_chars: { type: 'number', description: 'Truncate output. Default 6000.' } }, required: ['file_id'] } },
  { name: 'lookup_company', description: 'Look up trucking company via FMCSA.', input_schema: { type: 'object', properties: { query: { type: 'string' } }, required: ['query'] } },
  { name: 'get_directions', description: 'Driving directions with distance, time, Maps link.', input_schema: { type: 'object', properties: { origin: { type: 'string' }, destination: { type: 'string' } }, required: ['origin', 'destination'] } },
  { name: 'find_places', description: 'Search nearby businesses.', input_schema: { type: 'object', properties: { query: { type: 'string' }, near: { type: 'string' } }, required: ['query'] } },
  { name: 'send_sms', description: 'Compose text message via Google Messages.', input_schema: { type: 'object', properties: { to: { type: 'string' }, body: { type: 'string' } }, required: ['to', 'body'] } },
  { name: 'list_projects', description: "List Bryan's projects.", input_schema: { type: 'object', properties: {}, required: [] } },
  { name: 'list_tasks', description: 'List tasks in a project. Omit project_id to see all tasks.', input_schema: { type: 'object', properties: { project_id: { type: 'string' } }, required: [] } },
  { name: 'search_tasks', description: 'Search tasks by keyword.', input_schema: { type: 'object', properties: { query: { type: 'string' } }, required: ['query'] } },
  { name: 'create_task', description: 'Create a task.', input_schema: { type: 'object', properties: { name: { type: 'string' }, project_id: { type: 'string' }, notes: { type: 'string' }, due_on: { type: 'string' } }, required: ['name'] } },
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
  { name: 'propose_action', description: "Render an Approve / Cancel card for a WRITE action on Vercel or GitHub. ALWAYS use this wrapper for any destructive or modifying admin call -- never call the write tool directly. If Bryan approves, the target action executes and you get its result back. If he cancels, you get {cancelled: true}.", input_schema: { type: 'object', properties: { target_action: { type: 'string', description: 'Name of the admin action to run once approved. One of: vercel_delete_project, vercel_set_env_var, vercel_delete_env_var, vercel_redeploy, github_create_repo, github_delete_repo.' }, target_params: { type: 'object', description: 'Parameters to pass to the target action.' }, title: { type: 'string', description: 'Short headline on the approval card (1 line, what he is approving).' }, description: { type: 'string', description: 'One or two sentences explaining consequences so he knows what he is signing off on.' } }, required: ['target_action', 'target_params', 'title', 'description'] } },
  { name: 'vercel_list_projects', description: "List all Vercel projects on a team (read-only). Pass team_id to filter to one team. Default returns the samantha/gillybelichick team.", input_schema: { type: 'object', properties: { team_id: { type: 'string', description: 'Optional Vercel team id starting with team_.' } }, required: [] } },
  { name: 'vercel_list_env_vars', description: "List environment variables on a Vercel project (values redacted, just keys + targets + prefix preview).", input_schema: { type: 'object', properties: { project_id: { type: 'string' }, team_id: { type: 'string' } }, required: ['project_id'] } },
  { name: 'vercel_list_deployments', description: "List recent deployments on a Vercel project with their state.", input_schema: { type: 'object', properties: { project_id: { type: 'string' }, team_id: { type: 'string' }, limit: { type: 'number' } }, required: ['project_id'] } },
  { name: 'github_list_repos', description: "List GitHub repos the authenticated user can access.", input_schema: { type: 'object', properties: {}, required: [] } },
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

    const anthropicKey = getAnthropicKey();
    if (!anthropicKey) {
      const helpText = "Hey Bryan -- my brain isn't connected yet. Tap this on your phone and it'll tell you exactly what's wrong and how to fix it:\n\n" +
        "bryanoneillgillis.com/api/samantha/status";
      return res.status(200).json({
        text: helpText,
        tool_calls: null,
        raw_content: '[]',
        stop_reason: 'end_turn',
        _diagnostic: 'Anthropic key not found under any accepted name'
      });
    }

    const anthropic = new Anthropic({
      apiKey: anthropicKey,
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
