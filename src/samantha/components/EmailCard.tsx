import React from 'react';
import { EmailSummary } from '../types';

interface Props {
  email: EmailSummary;
}

const EmailCard: React.FC<Props> = ({ email }) => {
  const dateStr = new Date(email.date).toLocaleDateString([], {
    month: 'short',
    day: 'numeric',
  });

  return (
    <div className="bg-white rounded-xl border border-sam-amber/15 shadow-sm overflow-hidden animate-fade-in">
      <div className="h-1 bg-gradient-to-r from-sam-amber to-yellow-300" />
      <div className="p-3">
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-sam-amber/10 flex items-center justify-center">
            <svg className="w-5 h-5 text-sam-amber" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <p className={`text-sm truncate ${email.unread ? 'font-semibold text-sam-text' : 'font-medium text-sam-text/80'}`}>
                {email.from}
              </p>
              {email.unread && <div className="w-2 h-2 rounded-full bg-sam-coral flex-shrink-0" />}
            </div>
            <p className="text-sm text-sam-text/90 truncate mt-0.5">{email.subject}</p>
            <p className="text-xs text-sam-muted mt-0.5 line-clamp-2">{email.snippet}</p>
            <p className="text-[11px] text-sam-muted mt-1">{dateStr}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmailCard;
