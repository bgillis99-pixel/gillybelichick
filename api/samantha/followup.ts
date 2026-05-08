export const config = {
  maxDuration: 15,
};

// 17-Week Follow-Up Engine
// The most important business logic in the entire system.
// When a test is completed, this creates:
// 1. A reminder at 15 weeks ("Reach out to customer")
// 2. A retest-due event at 17 weeks ("Retest due")

function addWeeks(date: string, weeks: number): string {
  const d = new Date(date);
  d.setDate(d.getDate() + weeks * 7);
  return d.toISOString();
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });
}

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { action, params } = req.body;

    if (action === 'schedule_17_week_followup') {
      const {
        customer_name,
        test_date,
        customer_phone,
        service_type,
        location,
        has_bluetooth_device,
      } = params;

      const reminderDate = addWeeks(test_date, 15);
      const retestDate = addWeeks(test_date, 17);

      // Build calendar events to create
      const events = [
        {
          title: `${customer_name} — Reach Out for Retest (15-week reminder)`,
          start: reminderDate,
          end: addWeeks(test_date, 15), // all-day style
          description: [
            `17-week cycle reminder for ${customer_name}`,
            customer_phone ? `Phone: ${customer_phone}` : '',
            service_type ? `Previous test: ${service_type}` : '',
            location ? `Location: ${location}` : '',
            has_bluetooth_device ? 'Has Bluetooth OBD device' : 'No Bluetooth device — good upsell opportunity',
            '',
            `Original test date: ${formatDate(test_date)}`,
            `Retest due: ${formatDate(retestDate)}`,
            '',
            'ACTION: Text or call the customer to schedule their retest.',
          ].filter(Boolean).join('\n'),
          location: location || '',
        },
        {
          title: `${customer_name} — RETEST DUE (17-week cycle)`,
          start: retestDate,
          end: addWeeks(test_date, 17),
          description: [
            `17-week retest is DUE for ${customer_name}`,
            customer_phone ? `Phone: ${customer_phone}` : '',
            service_type ? `Service needed: ${service_type}` : '',
            location ? `Location: ${location}` : '',
            has_bluetooth_device ? 'Has Bluetooth OBD device' : '',
            '',
            `Original test date: ${formatDate(test_date)}`,
            '',
            'If not yet scheduled, contact the customer ASAP.',
            'After this retest, schedule the next 17-week cycle.',
          ].filter(Boolean).join('\n'),
          location: location || '',
        },
      ];

      return res.status(200).json({
        events,
        reminder_date: reminderDate,
        retest_date: retestDate,
        customer_name,
        message: `17-week chain created for ${customer_name}. Reminder on ${formatDate(reminderDate)}, retest due ${formatDate(retestDate)}.`,
      });
    }

    if (action === 'get_upcoming_retests') {
      // This returns search parameters for the calendar -- the actual
      // search happens via the calendar API with query "RETEST DUE"
      const weeksAhead = params?.weeks_ahead || 4;
      const now = new Date();
      const endDate = new Date(now.getTime() + weeksAhead * 7 * 24 * 60 * 60 * 1000);

      return res.status(200).json({
        search_params: {
          start_date: now.toISOString(),
          end_date: endDate.toISOString(),
          query: 'RETEST DUE',
        },
        message: `Search calendar for "RETEST DUE" events in the next ${weeksAhead} weeks.`,
      });
    }

    if (action === 'retest_sweep') {
      // Returns the calendar window + outreach template for a given month.
      // Samantha calls this, then loops over the matching calendar events
      // and drafts one email per customer using the template.
      const monthsByName: Record<string, number> = {
        january: 0, february: 1, march: 2, april: 3, may: 4, june: 5,
        july: 6, august: 7, september: 8, october: 9, november: 10, december: 11,
      };
      const rawMonth = (params?.month || '').toString().toLowerCase().trim();
      const monthIdx = monthsByName[rawMonth];
      if (monthIdx === undefined) {
        return res.status(400).json({ error: `Unknown month: "${params?.month}". Use full names like "October".` });
      }
      const year = Number(params?.year) || new Date().getFullYear();
      const start = new Date(year, monthIdx, 1);
      const end = new Date(year, monthIdx + 1, 1);

      const emailTemplate = (
        `Hi {{customer_name}},\n\n` +
        `This is Samantha at NorCal CARB Mobile -- a quick heads up that your CARB Clean Truck Check 17-week retest is coming due around {{retest_due}}.\n\n` +
        `If you'd like to keep your fleet in compliance without a CHP visit, I can swing by your yard. Reply with a couple of dates that work, or just call Bryan at 916-890-4427.\n\n` +
        `If you've already retested elsewhere, no action needed -- just let me know so I can update our records.\n\n` +
        `Thanks,\nSamantha Gillis\nNorCal CARB Mobile LLC`
      );

      return res.status(200).json({
        search_params: {
          start_date: start.toISOString(),
          end_date: end.toISOString(),
          query: 'RETEST DUE',
        },
        email_template: emailTemplate,
        instructions: [
          `1. Call get_calendar_events with the search_params above to pull all RETEST DUE events for ${rawMonth} ${year}.`,
          '2. For each event, parse the customer name from the title (everything before " — RETEST DUE").',
          '3. For each customer, call draft_email with the email_template (substitute {{customer_name}} and {{retest_due}}).',
          '4. Once all drafts are queued, ask Bryan to review them via ask_bryan: "All N drafts ready -- send all? / Review one by one / Cancel".',
          '5. On approval, send via send_email (when Twilio is wired) or have Bryan tap-send each from Gmail.',
        ],
        message: `Pulling retest-due window for ${rawMonth} ${year}: ${start.toDateString()} - ${end.toDateString()}.`,
      });
    }

    return res.status(400).json({ error: `Unknown action: ${action}` });
  } catch (error: any) {
    console.error('Follow-up API error:', error);
    return res.status(500).json({ error: 'Follow-up error', details: error.message });
  }
}
