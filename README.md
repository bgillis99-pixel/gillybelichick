# Samantha

Personal AI command center for Bryan O'Neill Gillis (NorCal CARB Mobile LLC). Voice-first, tap-first PWA running on Vercel, powered by Claude Sonnet 4.

- **Live**: https://gillybelichick.vercel.app · https://bryanoneillgillis.com
- **Status / self-diagnose**: https://gillybelichick.vercel.app/api/samantha/status

## Architecture (don't break)

- Frontend: pure HTML/CSS/JS/SVG in `public/index.html`. **No React, no bundler, no build step.**
- Backend: Vercel serverless functions under `api/samantha/*.ts`. `chat.ts` is the Claude proxy with the system prompt + all tool definitions inlined.
- Deps: `@anthropic-ai/sdk`, `googleapis`. That's it.

See `CLAUDE.md` for the full architecture + workflow notes.

## Environment variables

Copy `.env.example` for the full list. Set everything in the Vercel dashboard (this repo has no dev server — there's nothing to run locally):

https://vercel.com/carbcleantruckcheckapp/gillybelichick/settings/environment-variables

Required to make Samantha's brain work:
- One of `ANTHROPIC_API_KEY`, `CLAUDE_API_KEY`, `SAMANTHA_API_KEY`, `SAMANTHA`, `CLAUDE`, or `ANTHROPIC_KEY`.

Required for Gmail + Calendar tools:
- `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `GOOGLE_REFRESH_TOKEN`.

Hit `/api/samantha/status` any time to see which env vars are set, which name Samantha picked up her key from, and how to fix anything that's not.

## Enable one-tap redeploy

The status page has a "Redeploy production now" button that only renders when `VERCEL_DEPLOY_HOOK_URL` is set.

1. https://vercel.com/carbcleantruckcheckapp/gillybelichick/settings/git → **Deploy Hooks** → name `samantha-redeploy`, branch `main` → **Create Hook**.
2. Copy the URL.
3. https://vercel.com/carbcleantruckcheckapp/gillybelichick/settings/environment-variables → add `VERCEL_DEPLOY_HOOK_URL` (all 3 environments) → paste → save.
4. Vercel auto-redeploys in ~45s. Refresh the status page — the button should be there.

## Connect Google (Gmail + Calendar)

Visit https://gillybelichick.vercel.app/api/samantha/status?auth — the page walks through the whole flow end-to-end:
1. Create a Google Cloud project, enable Gmail API + Calendar API.
2. Configure OAuth consent screen (External; add Bryan's emails as Test users).
3. Create a Web OAuth Client with the redirect URI the page prints on screen.
4. Paste `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` into Vercel env vars (link on the page).
5. Refresh the wizard, click Authorize, complete Google consent.
6. Copy the refresh token the page returns into `GOOGLE_REFRESH_TOKEN`.

Smoke test: "What's on my calendar today?"

## Deploying

`main` is auto-deployed to production via Vercel's GitHub integration. Push to `main`, wait ~45s, reload. Or use the one-tap redeploy button above.

## Contact

- Phone: 844-685-8922
- Email: info@carbcleantruckcheck.app
