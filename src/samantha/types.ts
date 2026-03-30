export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
  toolResults?: ToolResultCard[];
}

export interface ToolResultCard {
  type: 'calendar' | 'email' | 'company' | 'directions' | 'places' | 'sms';
  data: CalendarEvent | EmailSummary | CompanyInfo | DirectionsResult | PlaceResult | SMSResult;
}

export interface CalendarEvent {
  id: string;
  title: string;
  start: string;
  end: string;
  location?: string;
  description?: string;
}

export interface EmailSummary {
  id: string;
  from: string;
  subject: string;
  snippet: string;
  date: string;
  unread: boolean;
}

export interface CompanyInfo {
  name: string;
  dotNumber?: string;
  mcNumber?: string;
  address?: string;
  phone?: string;
  vehicles?: number;
  safetyRating?: string;
}

export interface DirectionsResult {
  origin: string;
  destination: string;
  distance: string;
  duration: string;
  steps?: string[];
  mapUrl?: string;
}

export interface PlaceResult {
  name: string;
  address: string;
  rating?: number;
  phone?: string;
  distance?: string;
  placeType?: string;
  mapUrl?: string;
}

export interface SMSResult {
  to: string;
  body: string;
  status: 'sent' | 'drafted' | 'failed';
  timestamp?: string;
}

export interface ChatState {
  messages: Message[];
  isLoading: boolean;
  error: string | null;
}
