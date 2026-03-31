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

    return res.status(400).json({ error: `Unknown action: ${action}` });
  } catch (error: any) {
    console.error('Follow-up API error:', error);
    return res.status(500).json({ error: 'Follow-up error', details: error.message });
  }
}
