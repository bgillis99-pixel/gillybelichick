import { useState, useCallback, useEffect } from 'react';
import { Message, ToolResultCard, CalendarEvent, EmailSummary, CompanyInfo, DirectionsResult, PlaceResult, SMSResult } from '../types';

const STORAGE_KEY = 'samantha_messages';
const API_BASE = '/api/samantha';

function loadMessages(): Message[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

function saveMessages(messages: Message[]) {
  try {
    const toSave = messages.slice(-100);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(toSave));
  } catch {
    localStorage.removeItem(STORAGE_KEY);
  }
}

// Text-to-speech for Samantha's voice
function speak(text: string) {
  if (!window.speechSynthesis) return;

  // Cancel any ongoing speech
  window.speechSynthesis.cancel();

  const utterance = new SpeechSynthesisUtterance(text);
  // Pick a warm female voice if available
  const voices = window.speechSynthesis.getVoices();
  const preferred = voices.find(v =>
    v.name.includes('Samantha') || // macOS/iOS has a "Samantha" voice!
    v.name.includes('Karen') ||
    v.name.includes('Moira') ||
    (v.lang.startsWith('en') && v.name.toLowerCase().includes('female'))
  ) || voices.find(v => v.lang.startsWith('en-'));

  if (preferred) utterance.voice = preferred;
  utterance.rate = 0.95;
  utterance.pitch = 1.05;

  window.speechSynthesis.speak(utterance);
}

async function callChatAPI(messages: Array<{ role: string; content: string }>) {
  const res = await fetch(`${API_BASE}/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ messages }),
  });

  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`API error: ${res.status} - ${errorText}`);
  }

  return res.json();
}

async function callToolAPI(toolName: string, toolInput: Record<string, unknown>): Promise<{ result: string; cards?: ToolResultCard[] }> {
  // Time -- handled client-side
  if (toolName === 'get_current_datetime') {
    const now = new Date();
    return {
      result: JSON.stringify({
        datetime: now.toISOString(),
        date: now.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }),
        time: now.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }),
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      }),
    };
  }

  // Calendar
  if (toolName === 'get_calendar_events' || toolName === 'create_calendar_event') {
    const res = await fetch(`${API_BASE}/calendar`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: toolName, params: toolInput }),
    });
    const data = await res.json();
    const cards: ToolResultCard[] = [];
    if (toolName === 'get_calendar_events' && data.events) {
      for (const evt of data.events) cards.push({ type: 'calendar', data: evt as CalendarEvent });
    } else if (toolName === 'create_calendar_event' && data.event) {
      cards.push({ type: 'calendar', data: data.event as CalendarEvent });
    }
    return { result: JSON.stringify(data), cards };
  }

  // Email
  if (toolName === 'search_emails' || toolName === 'read_email' || toolName === 'draft_email') {
    const res = await fetch(`${API_BASE}/email`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: toolName, params: toolInput }),
    });
    const data = await res.json();
    const cards: ToolResultCard[] = [];
    if (toolName === 'search_emails' && data.emails) {
      for (const email of data.emails) cards.push({ type: 'email', data: email as EmailSummary });
    }
    return { result: JSON.stringify(data), cards };
  }

  // Company lookup
  if (toolName === 'lookup_company') {
    const res = await fetch(`${API_BASE}/company`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ params: toolInput }),
    });
    const data = await res.json();
    const cards: ToolResultCard[] = [];
    if (data.company) cards.push({ type: 'company', data: data.company as CompanyInfo });
    return { result: JSON.stringify(data), cards };
  }

  // Directions
  if (toolName === 'get_directions') {
    const res = await fetch(`${API_BASE}/maps`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'get_directions', params: toolInput }),
    });
    const data = await res.json();
    const cards: ToolResultCard[] = [];
    if (data.origin) cards.push({ type: 'directions', data: data as DirectionsResult });
    return { result: JSON.stringify(data), cards };
  }

  // Find places
  if (toolName === 'find_places') {
    const res = await fetch(`${API_BASE}/maps`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'find_places', params: toolInput }),
    });
    const data = await res.json();
    const cards: ToolResultCard[] = [];
    if (data.places) {
      for (const place of data.places) cards.push({ type: 'places', data: place as PlaceResult });
    }
    return { result: JSON.stringify(data), cards };
  }

  // SMS
  if (toolName === 'send_sms') {
    const res = await fetch(`${API_BASE}/sms`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'send_sms', params: toolInput }),
    });
    const data = await res.json();
    const cards: ToolResultCard[] = [];
    cards.push({
      type: 'sms',
      data: {
        to: toolInput.to as string,
        body: toolInput.body as string,
        status: data.status || 'drafted',
      } as SMSResult,
    });
    return { result: JSON.stringify(data), cards };
  }

  return { result: JSON.stringify({ error: 'Unknown tool' }) };
}

export function useChat() {
  const [messages, setMessages] = useState<Message[]>(loadMessages);
  const [isLoading, setIsLoading] = useState(false);
  const [voiceEnabled, setVoiceEnabled] = useState(() => {
    return localStorage.getItem('samantha_voice') === 'true';
  });

  useEffect(() => {
    saveMessages(messages);
  }, [messages]);

  useEffect(() => {
    localStorage.setItem('samantha_voice', String(voiceEnabled));
  }, [voiceEnabled]);

  // Pre-load voices
  useEffect(() => {
    if (window.speechSynthesis) {
      window.speechSynthesis.getVoices();
      window.speechSynthesis.onvoiceschanged = () => window.speechSynthesis.getVoices();
    }
  }, []);

  const sendMessage = useCallback(async (text: string) => {
    const userMessage: Message = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: text,
      timestamp: Date.now(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setIsLoading(true);

    try {
      const conversationHistory = [...messages, userMessage].slice(-20).map((m) => ({
        role: m.role,
        content: m.content,
      }));

      let response = await callChatAPI(conversationHistory);
      let allCards: ToolResultCard[] = [];

      // Tool-use loop (max 5 rounds)
      let rounds = 0;
      while (response.tool_calls && response.tool_calls.length > 0 && rounds < 5) {
        rounds++;
        const toolResults = [];
        for (const toolCall of response.tool_calls) {
          const { result, cards } = await callToolAPI(toolCall.name, toolCall.input);
          if (cards) allCards.push(...cards);
          toolResults.push({ tool_use_id: toolCall.id, content: result });
        }
        response = await callChatAPI([
          ...conversationHistory,
          { role: 'assistant', content: response.raw_content },
          { role: 'user', content: JSON.stringify(toolResults) },
        ]);
      }

      const responseText = response.text || "Hmm, I couldn't process that. Try again?";

      const assistantMessage: Message = {
        id: `sam-${Date.now()}`,
        role: 'assistant',
        content: responseText,
        timestamp: Date.now(),
        toolResults: allCards.length > 0 ? allCards : undefined,
      };

      setMessages((prev) => [...prev, assistantMessage]);

      // Speak the response if voice is enabled
      if (voiceEnabled) {
        speak(responseText);
      }
    } catch (error) {
      const errorMessage: Message = {
        id: `err-${Date.now()}`,
        role: 'assistant',
        content: error instanceof Error && error.message.includes('API error')
          ? "Having trouble connecting. Check your signal and try again."
          : "Something went sideways. Give me a sec.",
        timestamp: Date.now(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  }, [messages, voiceEnabled]);

  const clearMessages = useCallback(() => {
    setMessages([]);
    localStorage.removeItem(STORAGE_KEY);
  }, []);

  const toggleVoice = useCallback(() => {
    setVoiceEnabled((prev) => !prev);
  }, []);

  return { messages, isLoading, sendMessage, clearMessages, voiceEnabled, toggleVoice };
}
