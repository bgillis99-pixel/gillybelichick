import { useState, useCallback, useEffect } from 'react';
import { Message, ToolResultCard, CalendarEvent, EmailSummary, CompanyInfo } from '../types';

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
    // Keep last 100 messages to avoid storage bloat
    const toSave = messages.slice(-100);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(toSave));
  } catch {
    // Storage full, clear old messages
    localStorage.removeItem(STORAGE_KEY);
  }
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
  // Route tool calls to appropriate endpoints
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

  if (toolName === 'get_calendar_events' || toolName === 'create_calendar_event') {
    const res = await fetch(`${API_BASE}/calendar`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: toolName, params: toolInput }),
    });
    const data = await res.json();

    const cards: ToolResultCard[] = [];
    if (toolName === 'get_calendar_events' && data.events) {
      for (const evt of data.events) {
        cards.push({ type: 'calendar', data: evt as CalendarEvent });
      }
    } else if (toolName === 'create_calendar_event' && data.event) {
      cards.push({ type: 'calendar', data: data.event as CalendarEvent });
    }

    return { result: JSON.stringify(data), cards };
  }

  if (toolName === 'search_emails' || toolName === 'read_email' || toolName === 'draft_email') {
    const res = await fetch(`${API_BASE}/email`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: toolName, params: toolInput }),
    });
    const data = await res.json();

    const cards: ToolResultCard[] = [];
    if (toolName === 'search_emails' && data.emails) {
      for (const email of data.emails) {
        cards.push({ type: 'email', data: email as EmailSummary });
      }
    }

    return { result: JSON.stringify(data), cards };
  }

  if (toolName === 'lookup_company') {
    const res = await fetch(`${API_BASE}/company`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ params: toolInput }),
    });
    const data = await res.json();

    const cards: ToolResultCard[] = [];
    if (data.company) {
      cards.push({ type: 'company', data: data.company as CompanyInfo });
    }

    return { result: JSON.stringify(data), cards };
  }

  return { result: JSON.stringify({ error: 'Unknown tool' }) };
}

export function useChat() {
  const [messages, setMessages] = useState<Message[]>(loadMessages);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    saveMessages(messages);
  }, [messages]);

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
      // Build conversation history for the API
      const conversationHistory = [...messages, userMessage].slice(-20).map((m) => ({
        role: m.role,
        content: m.content,
      }));

      // Call Claude API -- may need multiple rounds for tool use
      let response = await callChatAPI(conversationHistory);
      let allCards: ToolResultCard[] = [];

      // Handle tool-use loop (max 5 rounds to prevent infinite loops)
      let rounds = 0;
      while (response.tool_calls && response.tool_calls.length > 0 && rounds < 5) {
        rounds++;

        // Process each tool call
        const toolResults = [];
        for (const toolCall of response.tool_calls) {
          const { result, cards } = await callToolAPI(toolCall.name, toolCall.input);
          if (cards) allCards.push(...cards);
          toolResults.push({
            tool_use_id: toolCall.id,
            content: result,
          });
        }

        // Send tool results back to Claude
        response = await callChatAPI([
          ...conversationHistory,
          { role: 'assistant', content: response.raw_content },
          { role: 'user', content: JSON.stringify(toolResults) },
        ]);
      }

      const assistantMessage: Message = {
        id: `sam-${Date.now()}`,
        role: 'assistant',
        content: response.text || "Hmm, I couldn't process that. Try again?",
        timestamp: Date.now(),
        toolResults: allCards.length > 0 ? allCards : undefined,
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      const errorMessage: Message = {
        id: `err-${Date.now()}`,
        role: 'assistant',
        content: error instanceof Error && error.message.includes('API error')
          ? "I'm having trouble connecting right now. Check your internet and try again."
          : "Something went wrong on my end. Give me a sec and try again.",
        timestamp: Date.now(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  }, [messages]);

  const clearMessages = useCallback(() => {
    setMessages([]);
    localStorage.removeItem(STORAGE_KEY);
  }, []);

  return { messages, isLoading, sendMessage, clearMessages };
}
