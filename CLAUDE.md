# Claude Code Session Memory - gillybelichick repo

**This file is read automatically by Claude Code at session start. Keep it current.**

---

## What this repo is

This is **Samantha** — a personal AI command center / PWA for Bryan O'Neill Gillis, owner of NorCal CARB Mobile LLC. She runs on his phone as a web app (Vercel-deployed), is powered by Claude Sonnet 4 via the Anthropic API, and manages his whole operation: calendar, email, customers, invoicing, compliance, projects, and a live to-do chalkboard.

**Bryan is 48, single, no kids, builds everything himself. CEO/tester/driver/marketer/developer in one. Values directness. Spends most of his day driving, so the app is voice-first, tap-first.**

Repo: `bgillis99-pixel/gillybelichick`
Live at: `gillybelichick.vercel.app`
Future domain: `bryanoneillgillis.com` (purchased on Vercel, not yet added to the project)

---

## Architecture (important — don't break this)

- **Frontend**: pure HTML/CSS/JS with inline SVG. **NO React. NO Vite. NO build step.** Bryan explicitly pushed us off React because build errors were blocking deploys. Do not re-introduce any bundler.
- **Static files** are served from `/public` per `vercel.json` (`outputDirectory: "public"`). The root `index.html` is kept as a duplicate for safety — when you edit one, sync both.
- **Backend**: Vercel serverless functions in `/api/samantha/`:
  - `chat.ts` — THE core. Inlines the system prompt AND all tool definitions. Do NOT try to import these from `/src/` — Vercel's Node runtime can't resolve that path and it will 500.
  - `calendar.ts`, `email.ts`, `maps.ts`, `sms.ts`, `company.ts`, `asana.ts`, `blog.ts`, `invoice.ts`, `followup.ts` — one file per tool category.
- **AI**: Claude Sonnet 4 (`claude-sonnet-4-20250514`) via `@anthropic-ai/sdk`. Single `ANTHROPIC_API_KEY` env var.

## Key files

| File | Purpose |
|---|---|
| `public/index.html` | The whole Samantha UI — HTML, CSS, SVG office scene, JS tool routing, voice, chalkboard, options picker. ~1000 lines. |
| `index.html` | Duplicate of the above for safety. Keep identical. |
| `api/samantha/chat.ts` | Claude proxy + system prompt + all 25 tool definitions inlined. |
| `api/samantha/*.ts` | One serverless function per tool category. |
| `SAMANTHA-CAPABILITIES.txt` | Printable capability sheet (v1.1). The spec-of-record for what she can do. Update when features land. |
| `.github/workflows/sync-vercel-secrets.yml` | GitHub Action that syncs `ANTHROPIC_API_KEY` from GitHub secrets -> Vercel env vars. |
| `vercel.json` | Minimal. Just `outputDirectory: "public"` + API rewrites. |
| `package.json` | Only 2 deps: `@anthropic-ai/sdk`, `googleapis`. Keep it lean. |

## What's built (current state, v1.1)

- **25 tools**: calendar (4), email (3), FMCSA (1), maps (2), SMS (1), Asana (4), blog (3), invoicing (2), datetime (1), chalkboard (4), ask_bryan (1), 17-week followup (2), pricing (1).
- **17-week retest engine**: every test scheduled auto-creates reminders at week 15 + retest-due event at week 17. This is the #1 business-critical feature.
- **Voice**: Web Speech API input, browser TTS output.
- **Chalkboard** (v1.1): Clipboard button in header with live count badge. Slide-up panel with open to-dos. Samantha adds proactively when Bryan mentions anything he needs to remember. localStorage-backed (300-item cap).
- **Brian Response** (v1.1): `ask_bryan` tool presents 2-4 tap-able option cards in the chat. Tapping sends that label as the next message. Use for any decision instead of open questions.
- **Office scene** (v1.1): Inline SVG of Samantha as a blonde businesswoman at a conference table across from Bryan, sunset window behind her, papers + laptop + coffee mug on the desk. Full 180px on welcome, auto-collapses to 72px during chat.
- **Workload signal** (v1.1): Hair-up (bun + pencil + glasses) when 6+ open to-dos OR currently processing. Hair-down when calm. Plus a status pill ("heads down · focused" / "a lot on the plate" / "drowning · pick top 3?").

## Long-term vision

**Multi-agent SaaS product.** Bryan plans to spin up other agents as he grows (solar business next — "Ray"), and eventually sell this pattern to other verticals: Vin Diesel–style shop agent, Wall Street trader agent, flooring industry agent, etc. Each agent = fork + new prompt + new SVG scene + new tool set. ~2-4 hours per new agent.

Each agent inherits the visual state pattern (hair up/down for Samantha → hard hat on/off for Ray → headset on/off for Mia). Bryan should be able to glance at a dashboard and read everyone's workload.

**Desktop/big-screen mode**: Not built yet. Bryan has a 65" office TV and wants a command-center view for it — agent roster in one panel, live chalkboard, calendar, scene centered. Build when asked.

## Communication style with Bryan

- Direct. No sugarcoating. Short when possible.
- He's usually driving. Prefer bullet points and clear actions.
- He thinks visually and in analogies (James Bond's Q, the movie "Her", chalkboards, conference tables).
- When there's friction (deploy failures, env var issues, secret naming mismatches), give him EXACTLY ONE clear next step — don't make him pick between options.
- He likes when agents feel like people. Lean into it.

## Known blockers / things to check at session start

1. **Is `ANTHROPIC_API_KEY` set in Vercel?** If Samantha says "check your connection," that's the cause. Check via runtime logs (`mcp__357fd93c...__get_runtime_logs`). Fix: push a change to `.github/workflows/sync-vercel-secrets.yml` to re-trigger the sync workflow, OR set it manually in Vercel env vars.
2. **Is the latest deploy READY in Vercel?** `mcp__357fd93c...__list_deployments` for `prj_GHhK2uoD9LbGCqpEL7OW9Sq5Rkg6` on team `team_KJwr5XAGPJ1qBHmDdkSPZ6pp`.
3. **Has `bryanoneillgillis.com` been added to the Vercel project?** Currently only `gillybelichick.vercel.app` works. Bryan needs to add the domain in Vercel dashboard.

## Useful IDs

- Vercel project: `prj_GHhK2uoD9LbGCqpEL7OW9Sq5Rkg6`
- Vercel team: `team_KJwr5XAGPJ1qBHmDdkSPZ6pp` (slug: `carbcleantruckcheckapp`)
- GitHub repo ID: `1106334589`
- Cloudflare D1 blog DB: `norcal-blog` (ID: `2b97a692-278b-4926-ba68-808e775beb2e`)

## Workflow for edits to Samantha's UI

1. Edit `public/index.html`.
2. Copy to root: `cp public/index.html index.html`.
3. Commit + push. Vercel auto-deploys in ~45s.

## Workflow for edits to her tools / brain

1. Edit `api/samantha/chat.ts` (update `TOOLS` array + system prompt).
2. If adding a new tool category, also add client-side routing in `public/index.html` inside the `callTool()` function.
3. If the tool needs a backend, add a new file in `api/samantha/`.
4. Commit + push. Vercel redeploys.
