export const SAMANTHA_TOOLS = [
  // ===== TIME =====
  {
    name: 'get_current_datetime',
    description: 'Get the current date and time.',
    input_schema: { type: 'object' as const, properties: {}, required: [] },
  },

  // ===== CALENDAR =====
  {
    name: 'get_calendar_events',
    description: "List Bryan's upcoming calendar events.",
    input_schema: {
      type: 'object' as const,
      properties: {
        start_date: { type: 'string', description: 'Start date ISO 8601. Defaults to today.' },
        end_date: { type: 'string', description: 'End date ISO 8601.' },
        query: { type: 'string', description: 'Filter by title.' },
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
        title: { type: 'string' },
        start: { type: 'string' },
        end: { type: 'string' },
        description: { type: 'string' },
        location: { type: 'string' },
      },
      required: ['title', 'start', 'end'],
    },
  },

  // ===== EMAIL =====
  {
    name: 'search_emails',
    description: "Search Bryan's Gmail.",
    input_schema: {
      type: 'object' as const,
      properties: {
        query: { type: 'string', description: 'Gmail search query.' },
        max_results: { type: 'number', description: 'Max results. Default 5.' },
      },
      required: ['query'],
    },
  },
  {
    name: 'read_email',
    description: 'Read full content of an email.',
    input_schema: {
      type: 'object' as const,
      properties: { message_id: { type: 'string' } },
      required: ['message_id'],
    },
  },
  {
    name: 'draft_email',
    description: "Create an email draft in Bryan's Gmail.",
    input_schema: {
      type: 'object' as const,
      properties: {
        to: { type: 'string' },
        subject: { type: 'string' },
        body: { type: 'string' },
      },
      required: ['to', 'subject', 'body'],
    },
  },

  // ===== COMPANY LOOKUP =====
  {
    name: 'lookup_company',
    description: 'Look up a trucking company via FMCSA by name, DOT#, or MC#.',
    input_schema: {
      type: 'object' as const,
      properties: { query: { type: 'string' } },
      required: ['query'],
    },
  },

  // ===== MAPS & DIRECTIONS =====
  {
    name: 'get_directions',
    description: 'Get driving directions. Returns distance, time, and Google Maps link.',
    input_schema: {
      type: 'object' as const,
      properties: {
        origin: { type: 'string', description: 'Starting location.' },
        destination: { type: 'string', description: 'Destination.' },
      },
      required: ['origin', 'destination'],
    },
  },
  {
    name: 'find_places',
    description: 'Search for nearby businesses (diesel shops, truck stops, parts stores, etc.).',
    input_schema: {
      type: 'object' as const,
      properties: {
        query: { type: 'string', description: 'What to search for.' },
        near: { type: 'string', description: 'Location to search near.' },
      },
      required: ['query'],
    },
  },

  // ===== SMS =====
  {
    name: 'send_sms',
    description: 'Compose a text message. Opens Google Messages with message pre-filled.',
    input_schema: {
      type: 'object' as const,
      properties: {
        to: { type: 'string', description: 'Phone number.' },
        body: { type: 'string', description: 'Message text.' },
      },
      required: ['to', 'body'],
    },
  },

  // ===== ASANA (Project Management) =====
  {
    name: 'list_projects',
    description: "List Bryan's Asana projects with status. Shows the Digital Growth Roadmap, Weekly Cron Jobs, Onboarding, and other active projects.",
    input_schema: { type: 'object' as const, properties: {}, required: [] },
  },
  {
    name: 'list_tasks',
    description: 'List tasks in a specific Asana project.',
    input_schema: {
      type: 'object' as const,
      properties: {
        project_id: { type: 'string', description: 'Asana project GID.' },
      },
      required: ['project_id'],
    },
  },
  {
    name: 'search_tasks',
    description: 'Search for tasks across all Asana projects.',
    input_schema: {
      type: 'object' as const,
      properties: {
        query: { type: 'string', description: 'Search text.' },
      },
      required: ['query'],
    },
  },
  {
    name: 'create_task',
    description: 'Create a new task in Asana.',
    input_schema: {
      type: 'object' as const,
      properties: {
        name: { type: 'string', description: 'Task name.' },
        project_id: { type: 'string', description: 'Project to add it to (optional).' },
        notes: { type: 'string', description: 'Task description.' },
        due_on: { type: 'string', description: 'Due date YYYY-MM-DD.' },
      },
      required: ['name'],
    },
  },

  // ===== BLOG =====
  {
    name: 'list_blog_posts',
    description: 'List published blog posts on the NorCal CARB Mobile blog.',
    input_schema: {
      type: 'object' as const,
      properties: {
        limit: { type: 'number', description: 'Max posts. Default 10.' },
      },
      required: [],
    },
  },
  {
    name: 'read_blog_post',
    description: 'Read a specific blog post by slug.',
    input_schema: {
      type: 'object' as const,
      properties: {
        slug: { type: 'string', description: 'Post URL slug.' },
      },
      required: ['slug'],
    },
  },
  {
    name: 'create_blog_post',
    description: 'Write and publish a new blog post. Great for SEO content about CARB compliance, testing tips, industry news.',
    input_schema: {
      type: 'object' as const,
      properties: {
        title: { type: 'string', description: 'Post title.' },
        slug: { type: 'string', description: 'URL slug (lowercase-with-dashes).' },
        content: { type: 'string', description: 'Post content in Markdown.' },
        excerpt: { type: 'string', description: 'Short summary for previews.' },
        category: { type: 'string', description: 'Category (CARB Compliance, Business, Industry News).' },
        tags: { type: 'string', description: 'Comma-separated tags.' },
      },
      required: ['title', 'slug', 'content'],
    },
  },

  // ===== INVOICING =====
  {
    name: 'create_invoice',
    description: 'Create an invoice for a customer. Generates invoice number, line items, and totals.',
    input_schema: {
      type: 'object' as const,
      properties: {
        customer_name: { type: 'string', description: 'Customer or company name.' },
        customer_email: { type: 'string', description: 'Customer email.' },
        customer_phone: { type: 'string', description: 'Customer phone.' },
        services: {
          type: 'array' as const,
          description: 'Array of services. Each: {type: "hd-obd"|"smoke-opacity"|"fleet-opacity"|"rv-motorhome", quantity: number}',
          items: {
            type: 'object' as const,
            properties: {
              type: { type: 'string' },
              quantity: { type: 'number' },
            },
          },
        },
        notes: { type: 'string', description: 'Invoice notes.' },
      },
      required: ['customer_name', 'services'],
    },
  },
  {
    name: 'get_pricing',
    description: 'Get current service pricing for NorCal CARB Mobile.',
    input_schema: { type: 'object' as const, properties: {}, required: [] },
  },
];
