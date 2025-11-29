# 📱 iOS App Specification - Mobile Carb Check

**Built for mobile testers who run their business from a truck**

---

## App Philosophy

**You're testing trucks in parking lots, not sitting at a desk.**

Every feature is designed for:
- ⚡ Speed (capture data in seconds)
- 👍 One-handed use (other hand holding tools)
- 🔔 Smart interruptions (only when it matters)
- 📡 Offline-first (cell coverage is spotty)
- 🎙️ Voice-driven (dictate while working)

---

## Core User Flow

### The Happy Path (One Test)
```
8:00 AM - Arrive at customer location
  ↓
8:01 AM - Open app → "Start Test" button
  ↓
8:02 AM - Point camera at VIN (auto-scans)
  ↓
8:03 AM - Gemini fetches compliance data
  ↓
8:05 AM - Take 3 photos (exhaust, engine, side view)
  ↓
8:08 AM - Dictate notes: "Clean burn, no visible smoke"
  ↓
8:10 AM - Tap "Pass" → Tap "Complete Test"
  ↓
8:11 AM - SMS + Email sent to customer with report
  ↓
8:12 AM - Drive to next job
```

**Total time in app: 10 minutes**
**Time saved vs. manual process: 15-20 minutes**

---

## Screen Architecture

### 1. Dashboard (Home Screen)
```
┌───────────────────────────────────────┐
│  🔔 2 Notifications                    │
│  • Lead: Mike Johnson (tap to view)  │
│  • Blog draft ready                   │
├───────────────────────────────────────┤
│  TODAY                                │
│  6 tests scheduled                    │
│                                       │
│  NEXT                                 │
│  2:00 PM - Joe's Trucking             │
│  123 Oak St, Sacramento              │
│  [Get Directions]                    │
├───────────────────────────────────────┤
│  THIS WEEK                            │
│  • 23 tests completed                 │
│  • $10,350 revenue                    │
│  • 4 pending invoices                 │
├───────────────────────────────────────┤
│  [START NEW TEST]  (big green button) │
│                                       │
│  Quick Actions:                       │
│  📅 Schedule    💬 Messages    📊 Stats│
└───────────────────────────────────────┘
```

**Key Features:**
- Notifications at top (swipe to dismiss)
- Next appointment always visible
- Big "Start Test" button (80% of app usage)
- Quick stats (motivation + tracking)

---

### 2. Test Flow (5-step wizard)

#### Step 1: VIN Entry
```
┌───────────────────────────────────────┐
│  ← Back           VIN CHECK      (1/5)│
├───────────────────────────────────────┤
│                                       │
│  [■■■■■■■■■■ Camera Viewfinder ■■■■■] │
│  [■■■■■■■■■■                   ■■■■■] │
│  [■■■■■■■■■■  Point at VIN     ■■■■■] │
│  [■■■■■■■■■■                   ■■■■■] │
│  [■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■] │
│                                       │
│  Detected: 1FUJGLDR12LM12345          │
│  [✓] Correct  [✗] Retry               │
│                                       │
│  Or enter manually:                   │
│  [________________]  [Next →]         │
└───────────────────────────────────────┘
```

**Tech:**
- iOS Vision framework (on-device OCR)
- Gemini Vision API (if on-device fails)
- Large tap targets (gloves, dirty hands)

---

#### Step 2: Vehicle Info
```
┌───────────────────────────────────────┐
│  ← Back       VEHICLE INFO       (2/5)│
├───────────────────────────────────────┤
│  VIN: 1FUJGLDR12LM12345               │
│                                       │
│  ⏳ Checking CARB compliance...       │
│  [━━━━━━━━━━━━━━━━] 80%              │
│                                       │
│  ✓ Vehicle Found                      │
│  2018 Freightliner Cascadia           │
│  Heavy-Duty Class 8                   │
│  Diesel Engine: DD15                  │
│                                       │
│  CARB Status:                         │
│  ⚠️ INSPECTION REQUIRED               │
│                                       │
│  Last Test: Never                     │
│  Next Due: ASAP                       │
│                                       │
│  [Continue to Photos →]               │
└───────────────────────────────────────┘
```

**Data Sources:**
- Gemini API (VIN decode)
- CARB public database (if available)
- Your own historical records (Google Sheets)

---

#### Step 3: Photo Capture
```
┌───────────────────────────────────────┐
│  ← Back          PHOTOS          (3/5)│
├───────────────────────────────────────┤
│  Tap to capture each photo:           │
│                                       │
│  [✓] Exhaust Pipe (during test)       │
│      [View] [Retake]                  │
│                                       │
│  [📷] Engine Compartment               │
│       [Capture Photo]                 │
│                                       │
│  [ ] Vehicle Side View                │
│      [Capture Photo]                  │
│                                       │
│  Optional:                            │
│  [ ] Odometer                         │
│  [ ] Engine Label                     │
│  [+ Add More Photos]                  │
│                                       │
│  [Continue to Analysis →]             │
└───────────────────────────────────────┘
```

**Features:**
- Photos saved to device immediately (offline)
- Thumbnails show what was captured
- Can retake any photo
- AI analyzes in background while you move to next step

---

#### Step 4: Smoke Analysis & Notes
```
┌───────────────────────────────────────┐
│  ← Back      ANALYSIS & NOTES    (4/5)│
├───────────────────────────────────────┤
│  🤖 AI Analysis:                      │
│                                       │
│  Smoke Opacity: 15% (Good)            │
│  Color: Light gray                    │
│  Density: Minimal                     │
│  Concerns: None detected              │
│                                       │
│  Recommendation: ✅ PASS              │
├───────────────────────────────────────┤
│  Your Notes:                          │
│  [🎤 Tap to Dictate]                  │
│                                       │
│  "Clean burn, no visible smoke,       │
│   engine sounds good, no leaks"       │
│                                       │
│  [Clear] [Edit]                       │
│                                       │
│  Customer Name:                       │
│  [John Smith___________]              │
│                                       │
│  Customer Phone:                      │
│  [+1 (415) 555-1234___]              │
│                                       │
│  [Continue to Result →]               │
└───────────────────────────────────────┘
```

**Features:**
- AI analysis runs while you're capturing photos (ready by this step)
- Voice dictation (hands-free)
- Auto-format phone numbers
- Optional: Pull customer info from contacts

---

#### Step 5: Test Result
```
┌───────────────────────────────────────┐
│  ← Back       TEST RESULT        (5/5)│
├───────────────────────────────────────┤
│  Select Result:                       │
│                                       │
│  [✓ PASS]  (green, selected)          │
│                                       │
│  [ CONDITIONAL PASS]                  │
│  (requires follow-up)                 │
│                                       │
│  [ FAIL]                              │
│  (specify reason)                     │
│                                       │
│  Invoice Amount:                      │
│  [$450.00_____]                       │
│                                       │
│  ☑️ Send report via SMS & Email       │
│  ☑️ Send invoice (Stripe link)        │
│  ☑️ Log to spreadsheet                │
│  ☐ Schedule follow-up test            │
│                                       │
│  [COMPLETE TEST]  (big green)         │
└───────────────────────────────────────┘
```

**What Happens When You Tap "Complete":**
1. Generate PDF report (Claude API)
2. Upload photos to Google Drive
3. Trigger Make.com webhook (Blueprint 2)
4. SMS sent to customer
5. Email sent with PDF
6. Invoice SMS sent (Stripe link)
7. Log to Google Sheets
8. Success screen with confetti animation 🎉
9. Return to dashboard (ready for next test)

**Time: 3-5 seconds**

---

### 3. Notifications Center
```
┌───────────────────────────────────────┐
│  ← Back       NOTIFICATIONS            │
├───────────────────────────────────────┤
│  TODAY                                │
│                                       │
│  🚨 NEW LEAD (5 min ago)              │
│  Mike Johnson - 2020 Kenworth         │
│  [View] [Call] [Dismiss]              │
│                                       │
│  💰 PAYMENT RECEIVED (23 min ago)     │
│  $450 from Joe's Trucking             │
│  [View Receipt]                       │
│                                       │
│  📝 BLOG READY (2 hours ago)          │
│  "Understanding CARB DPF Rules"       │
│  [Review & Publish]                   │
├───────────────────────────────────────┤
│  YESTERDAY                            │
│                                       │
│  ✅ REPORT DELIVERED                  │
│  John Smith - VIN ...2345             │
│                                       │
│  📧 NEWSLETTER SENT                   │
│  47 opens, 12 clicks                  │
└───────────────────────────────────────┘
```

**Notification Types:**

| Priority | Type | Sound | Badge | Example |
|----------|------|-------|-------|---------|
| 🚨 Critical | New lead | Loud | Yes | "Mike wants test today" |
| 💰 High | Payment | Cha-ching | Yes | "$450 received" |
| ⏰ High | Appointment | Alert | Yes | "Next test in 30 min" |
| 📝 Medium | Content ready | Soft ping | No | "Blog draft ready" |
| ✅ Low | Task complete | Silent | No | "Report delivered" |

**Smart Notification Logic:**
- **9am-6pm:** All notifications allowed
- **6pm-9am:** Only critical (leads, payments, emergencies)
- **Do Not Disturb while driving:** Queue non-critical, send when parked
- **Batching:** Group similar notifications ("3 new items" vs. 3 separate pings)

---

### 4. Messages (SMS Integration)
```
┌───────────────────────────────────────┐
│  ← Back         MESSAGES               │
├───────────────────────────────────────┤
│  🔍 Search conversations...           │
├───────────────────────────────────────┤
│  Mike Johnson                    2:34PM│
│  "Can you come tomorrow?"             │
│  ────────────────────────────────────│
│  Joe's Trucking                  11:20AM│
│  "Thanks for the report!"             │
│  ────────────────────────────────────│
│  Sarah @ Fleet Ops              Yesterday│
│  "Quote for 5 trucks?"                │
│  ────────────────────────────────────│
│  [+ New Message]                      │
└───────────────────────────────────────┘
```

**Tap into conversation:**
```
┌───────────────────────────────────────┐
│  ← Messages   Mike Johnson       Call│
├───────────────────────────────────────┤
│                                       │
│         Can you come tomorrow?    2:34│
│                                       │
│  Sure! How about 10am?            2:35│
│         ← (you)                       │
│                                       │
│         Perfect, see you then!    2:36│
│                                       │
│  ┌─────────────────────────────────┐ │
│  │ 💡 AI Suggested Responses:      │ │
│  │ "Great! I'll text when I'm on   │ │
│  │  my way."                       │ │
│  │ [Send]                          │ │
│  │                                 │ │
│  │ "Can you send me your address?" │ │
│  │ [Send]                          │ │
│  └─────────────────────────────────┘ │
│                                       │
│  [________________] [🎤] [Send]       │
└───────────────────────────────────────┘
```

**Features:**
- Two-way SMS via Twilio
- AI suggests responses (Claude)
- One-tap replies for common questions
- Voice dictation
- Auto-save customer to CRM

---

### 5. Schedule/Calendar
```
┌───────────────────────────────────────┐
│  ← Back        THIS WEEK               │
├───────────────────────────────────────┤
│  MON 27                               │
│  10:00 AM - Joe's Trucking            │
│  2:00 PM  - Mike Johnson              │
│  4:30 PM  - Fleet Ops (5 trucks)      │
│                                       │
│  TUE 28                               │
│  9:00 AM  - Sarah's RV                │
│  1:00 PM  - [OPEN]                    │
│                                       │
│  WED 29                               │
│  [OPEN ALL DAY]                       │
│                                       │
│  [+ Add Appointment]                  │
└───────────────────────────────────────┘
```

**Tap on appointment:**
```
┌───────────────────────────────────────┐
│  ← Schedule                           │
├───────────────────────────────────────┤
│  Monday, Nov 27 at 10:00 AM           │
│                                       │
│  Joe's Trucking                       │
│  123 Oak St, Sacramento CA            │
│  [Get Directions] [Call]              │
│                                       │
│  Vehicle: 2018 Freightliner           │
│  VIN: 1FUJGLDR12LM12345               │
│                                       │
│  Notes:                               │
│  "Fleet manager said engine light on" │
│                                       │
│  [Start Test]  [Edit]  [Cancel]       │
└───────────────────────────────────────┘
```

**Integration:**
- Syncs with Google Calendar (two-way)
- Route optimization (order stops by location)
- Travel time estimates
- Reminder notifications (30 min before)

---

### 6. Stats/Dashboard
```
┌───────────────────────────────────────┐
│  ← Back           STATS                │
├───────────────────────────────────────┤
│  THIS MONTH                           │
│                                       │
│  💰 Revenue: $18,450                  │
│  📊 Tests: 41                         │
│  ✅ Pass Rate: 87%                    │
│  ⏱️  Avg. Time: 28 min/test          │
│                                       │
│  TOP CUSTOMERS                        │
│  1. Fleet Ops - $4,500 (10 tests)    │
│  2. Joe's Trucking - $1,350 (3)      │
│  3. Sarah's RV - $900 (2)             │
│                                       │
│  TRENDS                               │
│  [📈 Revenue graph - up 23%]          │
│                                       │
│  [Export Report (PDF)]                │
└───────────────────────────────────────┘
```

---

## Push Notification System

### Critical (Interrupt Immediately)
**Sound:** Loud alert, vibrate, banner
- 🚨 New lead (potential customer)
- 💰 Payment received
- 📞 Customer replied to SMS
- ⏰ Appointment in 30 minutes

### Important (Show, Don't Interrupt)
**Sound:** Soft ping, badge only
- 📝 Blog draft ready
- 📧 Email campaign ready
- 💬 AI-generated response ready

### Background (Badge Only)
**Sound:** Silent
- ✅ Report delivered
- 📊 Weekly stats ready
- 🔄 Backup complete

### Implementation (iOS)
```swift
// In AppDelegate.swift
import UserNotifications

func application(_ application: UIApplication, didFinishLaunchingWithOptions...) {
    UNUserNotificationCenter.current().requestAuthorization(options: [.alert, .badge, .sound]) { granted, error in
        if granted {
            DispatchQueue.main.async {
                application.registerForRemoteNotifications()
            }
        }
    }
}

// Receive notification from Make.com webhook
func userNotificationCenter(_ center: UNUserNotificationCenter, didReceive response: UNNotificationResponse) {
    let userInfo = response.notification.request.content.userInfo

    if let type = userInfo["type"] as? String {
        switch type {
        case "new_lead":
            // Navigate to lead details
            navigateToScreen(.leads)
        case "payment_received":
            // Show success animation
            showPaymentConfirmation()
        case "blog_ready":
            // Open blog review screen
            navigateToScreen(.content)
        default:
            break
        }
    }
}
```

### Notification Payload (from Make.com)
```json
{
  "aps": {
    "alert": {
      "title": "🚨 New Lead",
      "body": "Mike Johnson - 2020 Kenworth"
    },
    "badge": 1,
    "sound": "critical_alert.wav",
    "category": "NEW_LEAD",
    "thread-id": "leads"
  },
  "type": "new_lead",
  "lead_id": "abc123",
  "customer_name": "Mike Johnson",
  "vehicle": "2020 Kenworth",
  "phone": "+14155551234"
}
```

---

## Offline Mode

### What Works Offline:
- ✅ Start new test
- ✅ Capture VIN (on-device OCR)
- ✅ Take photos (saved locally)
- ✅ Dictate notes (on-device speech-to-text)
- ✅ View past tests (cached)
- ✅ View schedule (synced from Google Calendar)

### What Requires Internet:
- ❌ VIN compliance lookup (Gemini API)
- ❌ AI smoke analysis (Gemini API)
- ❌ Report generation (Claude API)
- ❌ Send SMS/email
- ❌ Process payment

### Offline Strategy:
```
1. User completes test offline
   ↓
2. App saves to local database (Core Data)
   ↓
3. Shows "Queued for upload" badge
   ↓
4. When internet returns, auto-uploads
   ↓
5. Make.com webhook triggers
   ↓
6. Customer receives report (5 min delayed, but fine)
```

---

## Tech Stack

### Frontend (iOS App)
- **Language:** Swift + SwiftUI
- **Architecture:** MVVM
- **Storage:** Core Data (offline tests)
- **Networking:** URLSession (or Alamofire)
- **Camera:** AVFoundation
- **OCR:** Vision framework
- **Speech:** Speech framework
- **Push:** UserNotifications + APNs

### Backend (Serverless)
- **Hosting:** Vercel (existing web app)
- **APIs:** Direct calls to Claude, Gemini, Twilio
- **Orchestration:** Make.com webhooks
- **Storage:** Google Drive (photos), Google Sheets (data)
- **Payments:** Stripe

### Why This Stack:
- ✅ No backend server to maintain (serverless)
- ✅ Reuse existing web app APIs
- ✅ Make.com handles complexity
- ✅ Low cost (<$100/mo even at scale)

---

## App Store Requirements

### Screenshots Needed (6.5" iPhone)
1. Dashboard with notifications
2. VIN scanner in action
3. AI analysis results
4. Report preview
5. Payment confirmation
6. Stats dashboard

### App Store Copy
**Title:** Mobile Carb Check - Diesel Testing
**Subtitle:** CARB Compliance for Heavy-Duty Trucks

**Description:**
```
Run your mobile CARB testing business from your phone.

INSTANT VIN CHECKS
Point your camera at any VIN - get compliance status in seconds powered by AI.

AI-POWERED ANALYSIS
Snap photos of exhaust smoke - our AI analyzes opacity and flags issues automatically.

PROFESSIONAL REPORTS
Generate PDF reports with your findings. SMS and email directly to customers.

SMART AUTOMATION
- Auto-send invoices (Stripe integration)
- AI writes your marketing content
- Never miss a lead with instant notifications
- Schedule tests via SMS (no phone tag)

Built by a mobile tester, for mobile testers.

PERFECT FOR:
• Independent CARB testers
• Mobile diesel mechanics
• Fleet inspection services
• Heavy-duty truck owners

PRICING:
Free tier: 3 tests/month
Pro: $49/month unlimited

Download now and test your first truck in under 2 minutes.
```

### Keywords
CARB, diesel, compliance, smoke test, heavy duty, truck, testing, inspection, VIN, California

### Category
Business > Productivity

### Age Rating
4+ (no objectionable content)

---

## Privacy & Security

### Data Collection
- VIN numbers (hashed, not stored in plain text)
- Customer names & phones (encrypted at rest)
- Photos (stored in your Google Drive, not our servers)
- Location (only during active test, for route optimization)

### Privacy Policy (Required for App Store)
```
Mobile Carb Check Privacy Policy

We collect:
- VINs and vehicle data (for compliance lookups)
- Customer contact info (for invoicing & reports)
- Photos (stored in YOUR Google Drive)
- Location (only during tests, for navigation)

We DO NOT:
- Sell your data
- Share with third parties (except Stripe for payments)
- Track you outside the app

You can delete all data anytime from Settings > Privacy.

Questions? info@carbcleantruckcheck.app
```

---

## Development Timeline

### Week 1-2: UI Design
- [ ] Figma mockups (or sketch on paper)
- [ ] User flow validation
- [ ] Icon & branding

### Week 3-6: Core Features
- [ ] VIN scanner (camera + OCR)
- [ ] Photo capture
- [ ] Voice dictation
- [ ] Test flow (5 steps)
- [ ] Local storage (Core Data)

### Week 7-8: API Integration
- [ ] Gemini API (VIN decode, smoke analysis)
- [ ] Claude API (report generation)
- [ ] Twilio API (SMS)
- [ ] Make.com webhooks

### Week 9-10: Push Notifications
- [ ] APNs setup (Apple Push Notification service)
- [ ] Notification handling
- [ ] Badge management
- [ ] Smart notification logic

### Week 11-12: Polish & Testing
- [ ] Offline mode
- [ ] Error handling
- [ ] Loading states
- [ ] Animations
- [ ] Beta test with 5 testers

### Week 13: App Store Submission
- [ ] Screenshots
- [ ] App Store description
- [ ] Privacy policy
- [ ] Submit for review

### Week 14-15: Wait for Approval
(Apple takes 2-4 weeks typically)

### Week 16: Launch! 🚀

---

## Cost to Build

### DIY (You Build It)
- **Time:** 3-4 months (part-time)
- **Cost:** $99 (Apple Developer) + $57/mo (APIs)
- **Learning:** React Native or Swift

### Hire Developer
- **Time:** 2-3 months
- **Cost:** $10,000-$15,000 (Upwork contractor)
- **Risk:** Need to manage, review code

### Development Agency
- **Time:** 3-4 months
- **Cost:** $30,000-$50,000
- **Quality:** High, but expensive

### My Recommendation
**Start with React Native + Expo**
- Cross-platform (iOS + Android with same code)
- Faster development (reuse web app code)
- Huge community (easy to find help)
- Can hire cheaper devs ($30-50/hr vs. $100+ for Swift)

---

## Next Steps

1. **Test Make.com automations first** (this week)
   - Prove the workflow works
   - Identify what you REALLY need in app

2. **Sketch UI on paper** (next week)
   - Draw the 5 screens
   - Walk through user flow
   - Find gaps/issues

3. **Decide: Build or hire?** (week after)
   - Budget: <$5K → DIY with React Native
   - Budget: $5-15K → Hire contractor
   - Budget: >$15K → Agency

4. **Start development** (Month 2)
   - Set up Xcode + Expo
   - Build VIN scanner first (most complex)
   - Test on your actual phone

**Want me to help with step 1? I can create the Make.com scenarios RIGHT NOW so you can test the automation before building the app.**
