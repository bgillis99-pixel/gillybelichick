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
  {
    name: 'get_calendar_events',
    description: "List Bryan's upcoming calendar events within a date range.",
    input_schema: {
      type: 'object' as const,
      properties: {
        start_date: {
          type: 'string',
          description: 'Start date in ISO 8601 format (e.g., 2026-03-30T00:00:00Z). Defaults to today.',
        },
        end_date: {
          type: 'string',
          description: 'End date in ISO 8601 format. Defaults to end of start_date.',
        },
        query: {
          type: 'string',
          description: 'Optional search query to filter events by title.',
        },
      },
      required: [],
    },
  },
  {
    name: 'create_calendar_event',
    description: 'Create a new event on Bryan\'s calendar.',
    input_schema: {
      type: 'object' as const,
      properties: {
        title: { type: 'string', description: 'Event title.' },
        start: { type: 'string', description: 'Start time in ISO 8601 format.' },
        end: { type: 'string', description: 'End time in ISO 8601 format.' },
        description: { type: 'string', description: 'Event description (optional).' },
        location: { type: 'string', description: 'Event location (optional).' },
      },
      required: ['title', 'start', 'end'],
    },
  },
  {
    name: 'search_emails',
    description: "Search Bryan's Gmail inbox.",
    input_schema: {
      type: 'object' as const,
      properties: {
        query: {
          type: 'string',
          description: 'Gmail search query (e.g., "from:carb.ca.gov", "is:unread", "subject:invoice").',
        },
        max_results: {
          type: 'number',
          description: 'Maximum number of results to return. Default 5.',
        },
      },
      required: ['query'],
    },
  },
  {
    name: 'read_email',
    description: 'Read the full content of a specific email.',
    input_schema: {
      type: 'object' as const,
      properties: {
        message_id: {
          type: 'string',
          description: 'The ID of the email message to read.',
        },
      },
      required: ['message_id'],
    },
  },
  {
    name: 'draft_email',
    description: 'Create an email draft in Bryan\'s Gmail.',
    input_schema: {
      type: 'object' as const,
      properties: {
        to: { type: 'string', description: 'Recipient email address.' },
        subject: { type: 'string', description: 'Email subject line.' },
        body: { type: 'string', description: 'Email body text.' },
      },
      required: ['to', 'subject', 'body'],
    },
  },
  {
    name: 'lookup_company',
    description: 'Look up a trucking company by name, DOT number, or MC number. Returns company details, fleet size, safety rating, and contact info.',
    input_schema: {
      type: 'object' as const,
      properties: {
        query: {
          type: 'string',
          description: 'Company name, DOT number, or MC number to search for.',
        },
      },
      required: ['query'],
    },
  },
];
