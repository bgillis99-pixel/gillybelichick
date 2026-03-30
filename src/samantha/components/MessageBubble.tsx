import React from 'react';
import { Message } from '../types';
import CalendarCard from './CalendarCard';
import EmailCard from './EmailCard';
import CompanyCard from './CompanyCard';
import { CalendarEvent, EmailSummary, CompanyInfo } from '../types';

interface Props {
  message: Message;
}

const MessageBubble: React.FC<Props> = ({ message }) => {
  const isUser = message.role === 'user';
  const time = new Date(message.timestamp).toLocaleTimeString([], {
    hour: 'numeric',
    minute: '2-digit',
  });

  return (
    <div className={`message-enter flex flex-col ${isUser ? 'items-end' : 'items-start'}`}>
      <div
        className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-[15px] leading-relaxed ${
          isUser
            ? 'bg-gradient-to-br from-sam-coral to-sam-amber text-white rounded-br-md'
            : 'bg-white text-sam-text shadow-sm border border-gray-100 rounded-bl-md'
        }`}
      >
        <p className="whitespace-pre-wrap break-words">{message.content}</p>
      </div>

      {message.toolResults && message.toolResults.length > 0 && (
        <div className="mt-2 space-y-2 max-w-[85%]">
          {message.toolResults.map((result, idx) => {
            if (result.type === 'calendar') {
              return <CalendarCard key={idx} event={result.data as CalendarEvent} />;
            }
            if (result.type === 'email') {
              return <EmailCard key={idx} email={result.data as EmailSummary} />;
            }
            if (result.type === 'company') {
              return <CompanyCard key={idx} company={result.data as CompanyInfo} />;
            }
            return null;
          })}
        </div>
      )}

      <span className="text-[11px] text-sam-muted mt-1 px-1">{time}</span>
    </div>
  );
};

export default MessageBubble;
