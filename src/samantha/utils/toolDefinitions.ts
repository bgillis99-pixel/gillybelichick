export const SAMANTHA_TOOLS = [
  {
    name: 'get_current_datetime',
    description: 'Get the current date and time so you know what "today" and "now" mean.',
    input_schema: {
      type: 'object' as const,
      properties: {},
      required: [],
    },
  },
  // Calendar
  {
    name: 'get_calendar_events',
    description: "List Bryan's upcoming calendar events within a date range.",
    input_schema: {
      type: 'object' as const,
      properties: {
        start_date: { type: 'string', description: 'Start date ISO 8601. Defaults to today.' },
        end_date: { type: 'string', description: 'End date ISO 8601. Defaults to end of start_date.' },
        query: { type: 'string', description: 'Filter events by title.' },
      },
      required: [],
    },
  },
  {
    name: 'create_calendar_event',
    description: "Create an event on Bryan's calendar.",
    input_schema: {
      type: 'object' as const,
      properties: {
        title: { type: 'string', description: 'Event title.' },
        start: { type: 'string', description: 'Start time ISO 8601.' },
        end: { type: 'string', description: 'End time ISO 8601.' },
        description: { type: 'string', description: 'Event description.' },
        location: { type: 'string', description: 'Event location.' },
      },
      required: ['title', 'start', 'end'],
    },
  },
  // Email
  {
    name: 'search_emails',
    description: "Search Bryan's Gmail inbox.",
    input_schema: {
      type: 'object' as const,
      properties: {
        query: { type: 'string', description: 'Gmail search query (e.g., "from:carb.ca.gov", "is:unread").' },
        max_results: { type: 'number', description: 'Max results. Default 5.' },
      },
      required: ['query'],
    },
  },
  {
    name: 'read_email',
    description: 'Read full content of a specific email.',
    input_schema: {
      type: 'object' as const,
      properties: {
        message_id: { type: 'string', description: 'The email message ID.' },
      },
      required: ['message_id'],
    },
  },
  {
    name: 'draft_email',
    description: "Create an email draft in Bryan's Gmail.",
    input_schema: {
      type: 'object' as const,
      properties: {
        to: { type: 'string', description: 'Recipient email.' },
        subject: { type: 'string', description: 'Subject line.' },
        body: { type: 'string', description: 'Email body.' },
      },
      required: ['to', 'subject', 'body'],
    },
  },
  // Company lookup
  {
    name: 'lookup_company',
    description: 'Look up a trucking company by name, DOT number, or MC number via FMCSA. Returns company details, fleet size, safety rating, contact info.',
    input_schema: {
      type: 'object' as const,
      properties: {
        query: { type: 'string', description: 'Company name, DOT#, or MC#.' },
      },
      required: ['query'],
    },
  },
  // Maps & Directions
  {
    name: 'get_directions',
    description: 'Get driving directions between two locations. Returns distance, drive time, and a Google Maps link.',
    input_schema: {
      type: 'object' as const,
      properties: {
        origin: { type: 'string', description: 'Starting location (address or place name).' },
        destination: { type: 'string', description: 'Destination (address or place name).' },
      },
      required: ['origin', 'destination'],
    },
  },
  {
    name: 'find_places',
    description: 'Search for nearby businesses or places (diesel shops, truck stops, parts stores, restaurants, etc.).',
    input_schema: {
      type: 'object' as const,
      properties: {
        query: { type: 'string', description: 'What to search for (e.g., "diesel mechanic", "truck stop", "parts store").' },
        near: { type: 'string', description: 'Location to search near (city, address, or area).' },
      },
      required: ['query'],
    },
  },
  // SMS
  {
    name: 'send_sms',
    description: 'Send a text message to a phone number. Used for customer communication, appointment confirmations, quotes.',
    input_schema: {
      type: 'object' as const,
      properties: {
        to: { type: 'string', description: 'Phone number to text (e.g., "+15551234567").' },
        body: { type: 'string', description: 'The text message content. Keep it short and professional.' },
      },
      required: ['to', 'body'],
    },
  },
];
