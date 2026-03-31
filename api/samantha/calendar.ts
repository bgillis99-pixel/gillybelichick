import { google } from 'googleapis';

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

    if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_REFRESH_TOKEN) {
      return res.status(500).json({ error: 'Google Calendar credentials not configured' });
    }

    const auth = getOAuth2Client();
    const calendar = google.calendar({ version: 'v3', auth });

    if (action === 'get_calendar_events') {
      const now = new Date();
      const startDate = params?.start_date || now.toISOString();
      const endDate = params?.end_date || new Date(now.getTime() + 24 * 60 * 60 * 1000).toISOString();

      const response = await calendar.events.list({
        calendarId: 'primary',
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

      return res.status(200).json({ events, count: events.length });
    }

    if (action === 'create_calendar_event') {
      const { title, start, end, description, location, recurrence } = params;

      const response = await calendar.events.insert({
        calendarId: 'primary',
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
        message: 'Event created successfully',
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
