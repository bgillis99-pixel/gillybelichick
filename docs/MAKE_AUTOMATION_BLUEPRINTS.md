# 🔧 Make.com Automation Blueprints

**Copy-paste ready scenarios for your mobile testing business**

## Setup Requirements

1. **Make.com account** (free tier fine to start)
2. **API Keys:**
   - Claude (Anthropic): https://console.anthropic.com
   - Gemini (Google AI): Already have this
   - Twilio: https://twilio.com
3. **Connected Services:**
   - Google Drive
   - Google Sheets
   - Google Calendar
   - Gmail

---

## Blueprint 1: Morning Blog Generator

### Trigger: Schedule (6:00 AM daily)

### Flow:
```
1. Google Drive: List files in folder
   Folder: /CARB Tests/Yesterday
   File type: Images

2. Gemini API: Analyze images (HTTP Request)
   Endpoint: https://generativelanguage.googleapis.com/v1/models/gemini-pro-vision:generateContent
   Method: POST
   Body:
   {
     "contents": [{
       "parts": [
         {"text": "Describe what you see in this diesel truck test photo. Focus on compliance-related details."},
         {"inline_data": {"mime_type": "image/jpeg", "data": "{{1.data}}"}}
       ]
     }]
   }

3. Claude API: Generate blog post (HTTP Request)
   Endpoint: https://api.anthropic.com/v1/messages
   Method: POST
   Headers:
     x-api-key: YOUR_CLAUDE_KEY
     anthropic-version: 2023-06-01
     content-type: application/json
   Body:
   {
     "model": "claude-3-5-sonnet-20241022",
     "max_tokens": 1024,
     "messages": [{
       "role": "user",
       "content": "Write a 400-word blog post about CARB compliance for truck owners. Use these observations from yesterday's tests: {{2.text}}. Make it educational and include a call-to-action to schedule testing. Write in first-person as a mobile tester."
     }]
   }

4. Google Docs: Create document
   Title: Blog Draft - {{formatDate(now, 'YYYY-MM-DD')}}
   Content: {{3.content[0].text}}

5. Gmail: Send notification to yourself
   To: your-email@carbcleantruckcheck.app
   Subject: ✍️ Your blog is ready to review
   Body: "Click here to review: {{4.url}}"
```

### Result:
- Wakes up to blog draft in Docs
- Review on phone in 2 minutes
- Copy-paste to WordPress/Squarespace

---

## Blueprint 2: Test Complete → Report + Invoice

### Trigger: Webhook (from your app or manual form)

### Webhook URL Format:
```
https://hook.us1.make.com/YOUR_WEBHOOK_ID

POST data:
{
  "customer_name": "John Smith",
  "customer_phone": "+14155551234",
  "customer_email": "john@trucking.com",
  "vin": "1FUJGLDR12LM12345",
  "test_result": "PASS",
  "photos": ["url1", "url2"],
  "notes": "Clean burn, no visible smoke"
}
```

### Flow:
```
1. Webhook: Receive test data
   (Triggered when you tap "Complete Test" in app)

2. Gemini API: Analyze smoke photos
   {
     "contents": [{
       "parts": [
         {"text": "Analyze this diesel exhaust smoke. Rate opacity 0-100% and flag any concerns."},
         {"inline_data": {"mime_type": "image/jpeg", "data": "{{1.photos[1]}}"}}
       ]
     }]
   }

3. Claude API: Generate compliance report
   {
     "model": "claude-3-5-sonnet-20241022",
     "max_tokens": 2048,
     "messages": [{
       "role": "user",
       "content": "Generate a professional CARB compliance report for:\nCustomer: {{1.customer_name}}\nVIN: {{1.vin}}\nTest Result: {{1.test_result}}\nSmoke Analysis: {{2.text}}\nTester Notes: {{1.notes}}\n\nInclude: Executive Summary, Test Details, Compliance Status, Recommendations, Next Steps. Format as formal report."
     }]
   }

4. Google Docs: Create PDF
   Title: CARB Report - {{1.vin}}
   Content: {{3.content[0].text}}
   Export as: PDF

5. Twilio: Send SMS to customer
   To: {{1.customer_phone}}
   Body: "{{1.customer_name}}, your CARB test is complete! Result: {{1.test_result}}. Report: {{4.pdf_url}} - Mobile Carb Check"

6. Gmail: Email report
   To: {{1.customer_email}}
   Subject: CARB Compliance Report - {{1.vin}}
   Attachments: {{4.pdf}}
   Body: "Thank you for choosing Mobile Carb Check. Your full report is attached."

7. Stripe: Create payment link
   Amount: $450.00 (or from webhook)
   Description: CARB Compliance Test - {{1.vin}}

8. Twilio: Send invoice SMS
   To: {{1.customer_phone}}
   Body: "Invoice for $450 - Pay here: {{7.payment_url}}"

9. Google Sheets: Log test
   Spreadsheet: CARB Tests 2025
   New row:
     - Date: {{formatDate(now)}}
     - Customer: {{1.customer_name}}
     - VIN: {{1.vin}}
     - Result: {{1.test_result}}
     - Amount: $450
     - Paid: No (will update when paid)
```

### Result:
- Customer gets report + invoice in under 2 minutes
- You drive to next job
- Everything logged automatically

---

## Blueprint 3: Lead Capture + Auto-Response

### Trigger: Webhook (from website form)

### Website Form Setup:
Add this to your Squarespace site:
```html
<form id="carbLeadForm">
  <input name="name" placeholder="Your Name" required>
  <input name="phone" placeholder="Phone" required>
  <input name="vehicle" placeholder="Truck Year/Make" required>
  <button type="submit">Request Test</button>
</form>

<script>
document.getElementById('carbLeadForm').addEventListener('submit', function(e) {
  e.preventDefault();
  fetch('https://hook.us1.make.com/YOUR_WEBHOOK_ID', {
    method: 'POST',
    body: JSON.stringify({
      name: e.target.name.value,
      phone: e.target.phone.value,
      vehicle: e.target.vehicle.value,
      source: 'website'
    })
  });
  alert('Thanks! We will text you within 10 minutes.');
});
</script>
```

### Flow:
```
1. Webhook: Receive lead data

2. Google Sheets: Add row
   Spreadsheet: Leads 2025
   New row:
     - Timestamp: {{now}}
     - Name: {{1.name}}
     - Phone: {{1.phone}}
     - Vehicle: {{1.vehicle}}
     - Source: {{1.source}}
     - Status: New

3. Twilio: Send instant SMS
   To: {{1.phone}}
   Body: "Hi {{1.name}}! Thanks for reaching out. We'll call you within the hour to schedule your CARB test for the {{1.vehicle}}. - Mobile Carb Check"

4. Claude API: Draft personalized email
   {
     "messages": [{
       "role": "user",
       "content": "Write a friendly 2-paragraph email response to a potential customer named {{1.name}} who needs a CARB test for their {{1.vehicle}}. Explain our mobile testing service, mention we serve all of California, and ask when they're available this week. Sign as Mobile Carb Check team."
     }]
   }

5. Gmail: Save draft (don't send yet)
   To: (you'll add this manually after calling)
   Subject: CARB Testing for Your {{1.vehicle}}
   Body: {{4.content[0].text}}

6. HTTP Request: Send push notification to YOUR phone
   (Using service like Pushover or ntfy.sh)
   URL: https://ntfy.sh/YOUR_TOPIC
   Method: POST
   Body: "🚨 NEW LEAD: {{1.name}} - {{1.vehicle}} - {{1.phone}}"

7. Twilio: SMS to YOUR phone
   To: YOUR_PHONE_NUMBER
   Body: "NEW LEAD\nName: {{1.name}}\nPhone: {{1.phone}}\nVehicle: {{1.vehicle}}\nDraft email ready in Gmail."
```

### Result:
- Lead gets instant response (feels valued)
- You get push notification + SMS (never miss a lead)
- Email draft ready when you have time to call

---

## Blueprint 4: Social Media Content Multiplier

### Trigger: Google Drive (new file in folder)

### Flow:
```
1. Google Drive: Watch folder
   Folder: /CARB Tests/Share to Social

2. Gemini API: Describe photo
   {
     "contents": [{
       "parts": [
         {"text": "Describe this diesel truck or test scenario in 1-2 sentences. Focus on interesting details."},
         {"inline_data": {"mime_type": "image/jpeg", "data": "{{1.data}}"}}
       ]
     }]
   }

3. Claude API: Generate social posts
   {
     "messages": [{
       "role": "user",
       "content": "Create 3 social media captions for this photo: {{2.text}}\n\n1. Instagram (use emojis, casual tone)\n2. Facebook (educational, helpful)\n3. LinkedIn (professional, industry-focused)\n\nInclude relevant hashtags. Keep each under 150 chars. Topic: Mobile CARB testing in California."
     }]
   }

4. Google Docs: Save captions
   Title: Social Posts - {{formatDate(now, 'MM-DD')}}
   Content:
     Photo: {{1.url}}

     INSTAGRAM:
     {{3.content[0].text}}

5. HTTP Push: Notify you
   Message: "📱 3 social posts ready to review"
```

### Result:
- Drop photo in folder while driving (voice command: "Hey Google, save to Drive")
- AI writes captions
- Review + post in 30 seconds

---

## Blueprint 5: Weekly Newsletter Automation

### Trigger: Schedule (Monday 6:00 AM)

### Flow:
```
1. Google Sheets: Get last week's data
   Spreadsheet: CARB Tests 2025
   Filter: Date >= {{addDays(now, -7)}}

2. Router: Calculate stats
   Total tests: {{length(1.rows)}}
   Pass rate: {{count(1.rows, "result", "PASS") / length(1.rows) * 100}}%
   Revenue: {{sum(1.rows, "amount")}}

3. Claude API: Write newsletter
   {
     "messages": [{
       "role": "user",
       "content": "Write a friendly 250-word email newsletter for truck owners and fleet managers. Last week we:\n- Tested {{2.total_tests}} vehicles\n- {{2.pass_rate}} passed\n- Most common issue: [you'll add this]\n\nInclude a compliance tip, a customer success story (make it generic), and CTA to schedule testing. Tone: Helpful expert, not salesy."
     }]
   }

4. Gmail: Create draft
   To: (your email list - or integrate Mailchimp)
   Subject: This Week in CARB Compliance - {{formatDate(now, 'MMM D')}}
   Body: {{3.content[0].text}}

5. SMS to you:
   "📧 Newsletter draft ready. Review and send?"
```

### Result:
- Consistent weekly communication
- You just review and hit send
- Keeps you top-of-mind for customers

---

## Blueprint 6: Payment Received → Thank You Flow

### Trigger: Stripe Webhook (payment succeeded)

### Stripe Setup:
In Stripe Dashboard:
- Go to Developers → Webhooks
- Add endpoint: https://hook.us1.make.com/YOUR_WEBHOOK_ID
- Select event: payment_intent.succeeded

### Flow:
```
1. Webhook: Receive payment data
   {
     "amount": 45000,  // cents
     "customer_email": "john@example.com",
     "metadata": {
       "customer_name": "John Smith",
       "vin": "1FUJGLDR12LM12345"
     }
   }

2. Google Sheets: Update payment status
   Spreadsheet: CARB Tests 2025
   Find row where VIN = {{1.metadata.vin}}
   Update: Paid = Yes, Payment Date = {{now}}

3. Twilio: Thank you SMS
   To: (extract from Sheets or Stripe)
   Body: "✅ Payment received! Thanks for your business, {{1.metadata.customer_name}}. Save this for records: CARB Test ${{1.amount/100}} - Mobile Carb Check"

4. Claude API: Generate review request
   {
     "messages": [{
       "role": "user",
       "content": "Write a warm 1-paragraph text message asking {{1.metadata.customer_name}} if they'd leave a Google review. Mention the test went well for their {{extract vehicle from somewhere}}. Include link: https://g.page/r/YOUR_GOOGLE_BUSINESS_ID/review. Keep it humble and appreciative."
     }]
   }

5. Twilio: Send review request (delay 2 hours)
   To: (customer phone)
   Body: {{4.content[0].text}}

6. HTTP Push: Notify you
   Message: "💰 Payment received: ${{1.amount/100}} from {{1.metadata.customer_name}}"
```

### Result:
- Customer feels appreciated
- You get reviews automatically
- Cash flow tracked in real-time

---

## Quick Start: Which Blueprint First?

### If you want TIME back:
→ **Blueprint 1** (Morning Blog) - Content writes itself

### If you want REVENUE boost:
→ **Blueprint 3** (Lead Capture) - Never miss a lead again

### If you want EFFICIENCY:
→ **Blueprint 2** (Test Complete) - Save 15 min per test

### My recommendation:
**Start with Blueprint 3** (Lead Capture)
- Easiest to test (just submit your own form)
- Immediate ROI (capture leads you're currently missing)
- Proves the automation concept
- Takes 30 minutes to set up

Then add Blueprint 2, then 1, then others.

---

## Testing Your Automations

### Test Mode (Before Going Live)

1. **Use your own phone number** for all SMS tests
2. **Use test Stripe account** (don't process real payments yet)
3. **Create "Test" folder** in Google Drive (don't mess up real data)
4. **Send to yourself** for all email tests

### Validation Checklist
- [ ] Webhook receives data correctly
- [ ] APIs return expected responses
- [ ] SMS sends within 10 seconds
- [ ] Email draft looks professional
- [ ] Google Sheets updates accurately
- [ ] Error handling works (what if phone number invalid?)

---

## Error Handling

### Add these modules after each API call:

```
Error Handler:
  IF {{HTTP Status}} != 200
  THEN:
    - Twilio SMS to you: "⚠️ Make automation failed: {{module name}}"
    - Gmail: Send error details to yourself
    - Google Sheets: Log error with timestamp
```

### Common Issues:
| Error | Cause | Fix |
|-------|-------|-----|
| 401 Unauthorized | Wrong API key | Check .env vars |
| 429 Rate limit | Too many requests | Add delay between calls |
| Timeout | API slow | Increase timeout to 60s |
| Invalid phone | Wrong format | Add phone validator module |

---

## Cost Estimates

### Free Tier (1,000 operations/month)
- ~30 tests/month (Blueprint 2)
- ~30 blog posts/month (Blueprint 1)
- Should stay under 1,000 ops

### Paid Tier ($9/mo for 10,000 ops)
- ~300 tests/month
- Daily content
- All 6 blueprints running
- Still under 10K ops

### When to Upgrade:
If you're doing >10 tests/day consistently, upgrade to $29/mo tier

---

## Next Steps

1. **TODAY: Sign up for Make.com**
   - Use this link: https://make.com
   - Select free plan

2. **TOMORROW: Set up Blueprint 3**
   - Create webhook
   - Connect Twilio
   - Test with your own form submission

3. **THIS WEEK: Add Blueprint 2**
   - Create webhook for test completion
   - For now, trigger it manually (send POST request from Postman)
   - Next month, trigger it from your iOS app

4. **NEXT WEEK: Deploy Blueprint 1**
   - Upload test photos to Drive folder
   - Let AI write blog
   - Publish first automated content

**By end of month: All 6 blueprints running, saving you 10+ hours/week**

---

## Questions?

**Q: Can I see examples of the actual Make scenarios?**
A: Yes! I can export JSON blueprints you can import. Want me to create those?

**Q: What if I don't code and need help setting up webhooks?**
A: Use Zapier instead of Make - same concept, more beginner-friendly (but more expensive). Or I can create step-by-step screenshots.

**Q: How do I trigger these from my iOS app later?**
A: In Swift, just make HTTP POST requests to the webhook URLs. Example:
```swift
let url = URL(string: "https://hook.us1.make.com/abc123")!
var request = URLRequest(url: url)
request.httpMethod = "POST"
request.setValue("application/json", forHTTPHeaderField: "Content-Type")
let body = ["customer_name": name, "vin": vin]
request.httpBody = try? JSONEncoder().encode(body)
URLSession.shared.dataTask(with: request).resume()
```

**Ready to build these? Let's start with Blueprint 3 - I can walk you through it step-by-step if you want.**
