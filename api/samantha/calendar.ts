import { google } from 'googleapis';

// Samantha authenticates as samantha@norcalcarbmobile.com. By default she
// manages Bryan's calendar (he's her boss, that's her job). His calendar
// is shared with her at the Workspace level, so this works with her own
// OAuth creds. Override per-tool via `calendar_id` param.
const DEFAULT_CALENDAR_ID = process.env.DEFAULT_CALENDAR_ID || 'bryan@norcalcarbmobile.com';

function getOAuth2Client() {
  const client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET
  );
  client.setCredentials({
    refresh_token: process.env.GOOGLE_REFRESH_TOKEN,
  });
  return client;
}

export const config = {
  maxDuration: 15,
};

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { action, params } = req.body;

    // Pure-logic followup actions don't need Google creds -- they just
    // compute dates and return event objects for the client to render.
    // Handle them before the OAuth check so they work even pre-OAuth.
    if (action === 'schedule_17_week_followup' || action === 'get_upcoming_retests' || action === 'retest_sweep') {
      // Skip the credentials check; jump to the followup branch below.
    } else if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_REFRESH_TOKEN) {
      return res.status(500).json({ error: 'Google Calendar credentials not configured' });
    }

    const calendarId = params?.calendar_id || DEFAULT_CALENDAR_ID;

    if (action === 'get_calendar_events') {
      const auth = getOAuth2Client();
      const calendar = google.calendar({ version: 'v3', auth });
      const now = new Date();
      const startDate = params?.start_date || now.toISOString();
      const endDate = params?.end_date || new Date(now.getTime() + 24 * 60 * 60 * 1000).toISOString();

      const response = await calendar.events.list({
        calendarId,
        timeMin: startDate,
        timeMax: endDate,
        maxResults: 10,
        singleEvents: true,
        orderBy: 'startTime',
        q: params?.query || undefined,
      });

      const events = (response.data.items || []).map((event) => ({
        id: event.id,
        title: event.summary || 'Untitled',
        start: event.start?.dateTime || event.start?.date || '',
        end: event.end?.dateTime || event.end?.date || '',
        location: event.location || null,
        description: event.description || null,
      }));

      return res.status(200).json({ events, count: events.length, calendar_id: calendarId });
    }

    if (action === 'create_calendar_event') {
      const auth = getOAuth2Client();
      const calendar = google.calendar({ version: 'v3', auth });
      const { title, start, end, description, location, recurrence } = params;

      const response = await calendar.events.insert({
        calendarId,
        requestBody: {
          summary: title,
          start: { dateTime: start, timeZone: 'America/Los_Angeles' },
          end: { dateTime: end, timeZone: 'America/Los_Angeles' },
          description: description || undefined,
          recurrence: recurrence ? [recurrence] : undefined,
          location: location || undefined,
        },
      });

      return res.status(200).json({
        event: {
          id: response.data.id,
          title: response.data.summary,
          start: response.data.start?.dateTime || response.data.start?.date,
          end: response.data.end?.dateTime || response.data.end?.date,
          location: response.data.location,
          description: response.data.description,
        },
        calendar_id: calendarId,
        message: 'Event created successfully',
      });
    }

    // Folded from followup.ts to keep us under the 12-function Hobby cap.
    // 17-week retest engine -- the #1 business logic in the system.
    if (action === 'schedule_17_week_followup') {
      const {
        customer_name,
        test_date,
        customer_phone,
        service_type,
        location,
        has_bluetooth_device,
      } = params;

      const addWeeks = (date: string, weeks: number) => {
        const d = new Date(date);
        d.setDate(d.getDate() + weeks * 7);
        return d.toISOString();
      };
      const fmt = (iso: string) => new Date(iso).toLocaleDateString('en-US', {
        weekday: 'long', month: 'long', day: 'numeric', year: 'numeric',
      });

      const reminderDate = addWeeks(test_date, 15);
      const retestDate = addWeeks(test_date, 17);

      const events = [
        {
          title: `${customer_name} — Reach Out for Retest (15-week reminder)`,
          start: reminderDate,
          end: addWeeks(test_date, 15),
          description: [
            `17-week cycle reminder for ${customer_name}`,
            customer_phone ? `Phone: ${customer_phone}` : '',
            service_type ? `Previous test: ${service_type}` : '',
            location ? `Location: ${location}` : '',
            has_bluetooth_device ? 'Has Bluetooth OBD device' : 'No Bluetooth device — good upsell opportunity',
            '',
            `Original test date: ${fmt(test_date)}`,
            `Retest due: ${fmt(retestDate)}`,
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
            `Original test date: ${fmt(test_date)}`,
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
        message: `17-week chain created for ${customer_name}. Reminder on ${fmt(reminderDate)}, retest due ${fmt(retestDate)}.`,
      });
    }

    if (action === 'get_upcoming_retests') {
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
    console.error('Calendar API error:', error);
    return res.status(500).json({
      error: 'Failed to access calendar',
      details: error.message,
    });
  }
}
