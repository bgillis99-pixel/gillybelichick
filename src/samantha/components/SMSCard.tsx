import React from 'react';
import { SMSResult } from '../types';

interface Props {
  sms: SMSResult;
}

const SMSCard: React.FC<Props> = ({ sms }) => {
  const statusColors = {
    sent: 'bg-green-100 text-green-700',
    drafted: 'bg-yellow-100 text-yellow-700',
    failed: 'bg-red-100 text-red-700',
  };

  return (
    <div className="bg-white rounded-xl border border-teal-200/50 shadow-sm overflow-hidden animate-fade-in">
      <div className="h-1 bg-gradient-to-r from-teal-400 to-cyan-500" />
      <div className="p-3">
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-teal-50 flex items-center justify-center">
            <svg className="w-5 h-5 text-teal-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <p className="font-medium text-sm text-sam-text">To: {sms.to}</p>
              <span className={`text-[11px] font-medium px-2 py-0.5 rounded-full ${statusColors[sms.status]}`}>
                {sms.status}
              </span>
            </div>
            <p className="text-xs text-sam-text/80 mt-1 line-clamp-2">{sms.body}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SMSCard;
