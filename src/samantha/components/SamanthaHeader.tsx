import React, { useState } from 'react';

interface Props {
  isOnline: boolean;
  voiceEnabled: boolean;
  onToggleVoice: () => void;
  onClearChat: () => void;
}

const SamanthaHeader: React.FC<Props> = ({ isOnline, voiceEnabled, onToggleVoice, onClearChat }) => {
  const [showMenu, setShowMenu] = useState(false);

  return (
    <header className="flex items-center gap-3 px-4 py-3 bg-white/80 backdrop-blur-md border-b border-sam-coral/10 sticky top-0 z-10">
      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-sam-coral to-sam-amber flex items-center justify-center shadow-md relative">
        <span className="text-white text-lg font-light">S</span>
        <div className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-white ${isOnline ? 'bg-green-400' : 'bg-gray-300'}`} />
      </div>
      <div className="flex-1">
        <h1 className="text-base font-semibold text-sam-text leading-tight">Samantha</h1>
        <p className="text-[11px] text-sam-muted leading-tight">
          {isOnline ? 'command center active' : 'offline -- limited mode'}
        </p>
      </div>

      {/* Voice toggle */}
      <button
        onClick={onToggleVoice}
        className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${
          voiceEnabled ? 'bg-sam-coral/10 text-sam-coral' : 'bg-gray-100 text-sam-muted'
        }`}
        title={voiceEnabled ? 'Voice on' : 'Voice off'}
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          {voiceEnabled ? (
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
          ) : (
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2" />
          )}
        </svg>
      </button>

      {/* Menu */}
      <div className="relative">
        <button
          onClick={() => setShowMenu(!showMenu)}
          className="w-8 h-8 rounded-full flex items-center justify-center bg-gray-100 text-sam-muted hover:bg-gray-200 transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
          </svg>
        </button>

        {showMenu && (
          <>
            <div className="fixed inset-0 z-40" onClick={() => setShowMenu(false)} />
            <div className="absolute right-0 top-full mt-1 w-48 bg-white rounded-xl shadow-lg border border-gray-100 py-1 z-50 animate-fade-in">
              <button
                onClick={() => { onClearChat(); setShowMenu(false); }}
                className="w-full px-4 py-2.5 text-left text-sm text-sam-text hover:bg-sam-cream transition-colors flex items-center gap-2"
              >
                <svg className="w-4 h-4 text-sam-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
                Clear conversation
              </button>
            </div>
          </>
        )}
      </div>
    </header>
  );
};

export default SamanthaHeader;
