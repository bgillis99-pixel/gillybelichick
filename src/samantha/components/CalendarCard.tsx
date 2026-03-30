import React from 'react';
import { CalendarEvent } from '../types';

interface Props {
  event: CalendarEvent;
}

const CalendarCard: React.FC<Props> = ({ event }) => {
  const startTime = new Date(event.start).toLocaleTimeString([], {
    hour: 'numeric',
    minute: '2-digit',
  });
  const endTime = new Date(event.end).toLocaleTimeString([], {
    hour: 'numeric',
    minute: '2-digit',
  });
  const dateStr = new Date(event.start).toLocaleDateString([], {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });

  return (
    <div className="bg-white rounded-xl border border-sam-coral/15 shadow-sm overflow-hidden animate-fade-in">
      <div className="h-1 bg-gradient-to-r from-sam-coral to-sam-amber" />
      <div className="p-3">
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-sam-coral/10 flex items-center justify-center">
            <svg className="w-5 h-5 text-sam-coral" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-medium text-sm text-sam-text truncate">{event.title}</p>
            <p className="text-xs text-sam-muted mt-0.5">{dateStr} &middot; {startTime} - {endTime}</p>
            {event.location && (
              <p className="text-xs text-sam-muted mt-0.5 truncate">📍 {event.location}</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CalendarCard;
