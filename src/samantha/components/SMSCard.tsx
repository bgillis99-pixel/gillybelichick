import React from 'react';
import { SMSResult } from '../types';

interface Props {
  sms: SMSResult;
}

const SMSCard: React.FC<Props> = ({ sms }) => {
  // Generate links for sending
  const cleanNumber = sms.to.replace(/[^\d+]/g, '');
  const smsLink = `sms:${cleanNumber}?body=${encodeURIComponent(sms.body)}`;
  const googleVoiceLink = `https://voice.google.com/u/0/messages?phoneNumber=${encodeURIComponent(cleanNumber)}`;

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
            <p className="font-medium text-sm text-sam-text">To: {sms.to}</p>
            <p className="text-xs text-sam-text/80 mt-1 line-clamp-3">{sms.body}</p>
            <div className="flex gap-2 mt-2">
              <a
                href={smsLink}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-teal-500 text-white text-xs font-medium hover:bg-teal-600 active:scale-95 transition-all no-underline"
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
                Send via Messages
              </a>
              <a
                href={googleVoiceLink}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gray-100 text-sam-text text-xs font-medium hover:bg-gray-200 active:scale-95 transition-all no-underline"
              >
                Google Voice
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SMSCard;
