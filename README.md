# 🤖 Samantha - Personal AI Command Center

**Your AI-powered business assistant for CARB compliance testing**

Built with Claude (Anthropic) | Deployed on Vercel & Cloudflare | v1.0 (April 2026)

---

## 🚀 Quick Links

- **Live App**: Coming soon (bryanoneillgillis.com)
- **Claude Code**: [https://claude.ai/code/session_01Lxe8T75sM7Z35gUqZUS8Yw](https://claude.ai/code/session_01Lxe8T75sM7Z35gUqZUS8Yw)
- **GitHub**: [bgillis99-pixel/gillybelichick](https://github.com/bgillis99-pixel/gillybelichick)

---

## 📱 What is Samantha?

Samantha is a personal AI assistant that runs as a Progressive Web App (PWA). She acts as your command center for managing schedules, emails, customers, invoicing, and business operations through natural conversation.

Think: **Q from James Bond meets a smart business partner who knows your entire operation, your codebase, your customers, and CARB regulations cold.**

---

## ✨ 20 Core Capabilities

### 📅 Category 1: Schedule & Calendar
1. **get_calendar_events** - Check your schedule for any date range
2. **create_calendar_event** - Book appointments, tests, meetings
3. **schedule_17_week_followup** - Auto-creates the 17-week retest chain
4. **get_upcoming_retests** - Shows all upcoming retest events

**Example**: "Schedule a smoke test for ABC Trucking next Thursday"  
→ Creates the appointment + 15-week reminder + 17-week retest event

### 📧 Category 2: Email (Gmail)
5. **search_emails** - Search your inbox by keyword
6. **read_email** - Read full email content
7. **draft_email** - Compose emails in your voice

**Example**: "Check my emails from CARB" → Shows email cards inline

### 🏢 Category 3: Company Lookup (FMCSA)
8. **lookup_company** - Look up trucking companies by name, DOT#, or MC#
   - Returns: company name, DOT/MC numbers, fleet size, safety rating, address, phone

**Example**: "Look up DOT 1234567" → Shows company card with fleet details

### 🗺️ Category 4: Maps & Directions (Google Maps)
9. **get_directions** - Drive time, distance, turn-by-turn
10. **find_places** - Find diesel shops, truck stops, parts stores

**Example**: "How far is Stockton?" → "45 min, 52 miles"

### 💬 Category 5: SMS / Texting (Google Messages)
11. **send_sms** - Compose and send text messages via Google Messages

**Example**: "Text that customer to confirm Thursday"

### 📊 Category 6: Project Management (Asana)
12. **list_projects** - See all your Asana projects
13. **list_tasks** - Tasks in a specific project
14. **search_tasks** - Search across all projects
15. **create_task** - Create new tasks with due dates

### 📝 Category 7: Blog (Cloudflare D1 Database)
16. **list_blog_posts** - See all published posts
17. **read_blog_post** - Read a specific post
18. **create_blog_post** - Write and publish new SEO content

**Current Posts**:
- "2026 CARB Biannual Testing: What Every Truck Owner Needs to Know"
- "Mobile vs. Shop Emissions Testing: Why Fleet Operators Are Switching"
- "Understanding HD-OBD Testing: A Complete Guide for Truck Owners"

### 💰 Category 8: Invoicing
19. **create_invoice** - Generate professional invoices with line items
20. **get_pricing** - Current service pricing

**Built-in Pricing**:
- HD-OBD Testing: $75/truck
- Smoke/Opacity Testing: $199/truck
- Fleet Opacity: $149+/truck
- RV/Motorhome: $300/vehicle

### 🎤 Voice Interaction
- **Voice INPUT**: Tap mic button, speak, auto-sends (Web Speech API)
- **Voice OUTPUT**: Samantha speaks responses aloud (Text-to-Speech with "Samantha" voice)

---

## 🧠 CARB Expertise (Built-in)

Samantha knows CARB regulations at expert level:
- Clean Truck Check (CTC) program
- Heavy-Duty Inspection & Maintenance (HD I/M)
- Periodic Smoke Inspection Program (PSIP)
- Opacity/Visual Inspection (OVI) procedures
- On-Board Diagnostics (OBD) testing
- TRUCRS reporting system
- VIN compliance, exemptions, deadlines, penalties
- Fleet compliance strategies

---

## ⏰ The 17-Week Rule (Most Important)

Every customer test triggers an automatic 17-week follow-up chain:

```
Week 0:  Test performed, calendar event created
Week 15: Reminder -- "Reach out to [Customer] for retest"
Week 17: Event -- "[Customer] RETEST DUE"
```

This repeats forever. **No customer falls through the cracks.**

Why it matters:
- 2-4 truck operators WILL forget without automated reminders
- It's the difference between one-time and recurring revenue
- Samantha is the reminder engine — her #1 job

---

## 💼 Business Context

**Owner**: Bryan O'Neill Gillis  
**Company**: NorCal CARB Mobile LLC  
**Tester ID**: IF530523  
**Phone**: 916-890-4427  
**Email**: bryan@norcalcarbmobile.com  
**Hours**: Mon-Fri 6am-5pm, Sat 8am-4pm  
**Rating**: 4.9/5 (47+ reviews)  
**Service Areas**: Hayward, Stockton, Roseville, Fairfield + all NorCal  

**Strategy**: 
- Lead with $75/$199 mobile testing
- Bluetooth OBD device (~$200 + install) is soft upsell
- Target: 1-4 truck owner-operators
- Expanding statewide

---

## 🛠️ Tech Stack

| Component | Technology |
|-----------|-----------|
| **Frontend** | Pure HTML/CSS/JS (no React, no build step) |
| **Backend** | Vercel serverless functions (10 API endpoints) |
| **AI Brain** | Claude Sonnet (Anthropic API) |
| **Calendar** | Google Calendar API |
| **Email** | Gmail API |
| **Maps** | Google Maps Directions + Places API |
| **Companies** | FMCSA QC API |
| **Projects** | Asana API |
| **Blog** | Cloudflare D1 database |
| **SMS** | Google Messages deep links |
| **Voice** | Web Speech API (input) + TTS (output) |
| **Infrastructure** | Cloudflare Workers + D1 + KV (19 namespaces) |

---

## 📦 Local Development

```bash
# Clone the repository
git clone https://github.com/bgillis99-pixel/gillybelichick.git
cd gillybelichick

# Install dependencies
npm install

# Configure environment variables
cp .env.example .env
# Add your API keys:
# - ANTHROPIC_API_KEY (Claude)
# - GOOGLE_CALENDAR_API_KEY
# - GMAIL_API_KEY
# - GOOGLE_MAPS_API_KEY
# - ASANA_API_KEY
# - etc.

# Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## 🚀 Deployment

### Deploy to Vercel

```bash
# Push to GitHub
git push origin main

# Connect to Vercel
vercel
```

### Environment Variables (Vercel)

Add these to your Vercel dashboard:
- `ANTHROPIC_API_KEY` - Claude API key
- `GOOGLE_CALENDAR_API_KEY` - Google Calendar
- `GMAIL_API_KEY` - Gmail
- `GOOGLE_MAPS_API_KEY` - Google Maps
- `ASANA_API_KEY` - Asana
- `FMCSA_API_KEY` - FMCSA lookup

---

## 📈 Growth Roadmap

### Month 1 (Now - April 2026)
- ✅ Samantha working on Vercel/Cloudflare
- ✅ Calendar + email + company lookups live
- ✅ 17-week engine running
- ✅ Blog with 3+ posts

### Month 2 (May 2026)
- Google Maps fully connected
- FMCSA company lookups live
- 10+ blog posts (Samantha writes them)
- Statewide landing page started

### Month 3 (June 2026)
- Bluetooth OBD info page
- Customer portal started
- Asana fully integrated
- Invoice generation + email delivery

### Month 4 (July 2026)
- Vertex AI Agent Builder integration
- Fine-tune Samantha on your business data
- Custom voice/style training

### Month 5 (August 2026)
- Statewide site live
- Blog generating organic traffic
- Customer portal with Stripe payments
- Bluetooth OBD customer onboarding

### Month 6 (September 2026)
- Samantha handles first-contact customer inquiries
- 17-week engine has full customer database
- Recurring revenue from retest cycles visible
- Evaluate: own domain, scale up

---

## 🤖 Sample Conversations with Samantha

```
"What's on my calendar today?"
"Schedule a smoke test for [company] on Thursday at 2"
"Check my emails from CARB"
"Look up DOT 1234567"
"How far is Stockton?"
"Find diesel shops near Fresno"
"Text [customer] to confirm Thursday"
"Who's due for retesting?"
"Invoice [company] for 2 HD-OBD tests"
"What's the penalty for missing a CARB test?"
"Write a blog post about fleet compliance tips"
"What are my Asana tasks this week?"
"Help me draft a response to that email"
"What's our pricing?"
```

---

## 📄 Project Structure

```
gillybelichick/
├── samantha.html           # Main Samantha app (PWA)
├── index.html              # Public-facing landing page
├── marketing.html          # Marketing site
├── api/                    # Vercel API functions
├── public/                 # Static assets
├── SAMANTHA-CAPABILITIES.txt  # Detailed capability sheet
├── docs/                   # Documentation
├── src/                    # Source files
├── package.json            # Dependencies
├── vite.config.ts          # Build config
└── vercel.json             # Vercel deployment config
```

---

## 📚 Documentation

- **Full Capabilities**: See `SAMANTHA-CAPABILITIES.txt`
- **API Docs**: See `api/` directory
- **Development Guide**: See `docs/README.md`

---

## 🔗 Useful Links

- **Live App**: [bryanoneillgillis.com](https://bryanoneillgillis.com) (coming soon)
- **Claude Code Session**: [claude.ai/code/session_01Lxe8T75sM7Z35gUqZUS8Yw](https://claude.ai/code/session_01Lxe8T75sM7Z35gUqZUS8Yw)
- **GitHub**: [github.com/bgillis99-pixel/gillybelichick](https://github.com/bgillis99-pixel/gillybelichick)
- **Contact**: bryan@norcalcarbmobile.com | 916-890-4427

---

## 📄 License

MIT License © 2026 NorCal CARB Mobile LLC

**Built with HTML/CSS/JS + Vercel + Cloudflare + Claude Sonnet**

---

**Version**: 1.0 | **Built**: April 2026 | **Last Updated**: April 13, 2026
