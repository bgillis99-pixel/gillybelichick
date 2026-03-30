import React, { useState, useRef, useEffect } from 'react';

interface Props {
  onSend: (message: string) => void;
  isLoading: boolean;
}

const InputBar: React.FC<Props> = ({ onSend, isLoading }) => {
  const [text, setText] = useState('');
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const handleSend = () => {
    const trimmed = text.trim();
    if (!trimmed || isLoading) return;
    onSend(trimmed);
    setText('');
    if (inputRef.current) {
      inputRef.current.style.height = 'auto';
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.style.height = 'auto';
      inputRef.current.style.height = Math.min(inputRef.current.scrollHeight, 120) + 'px';
    }
  }, [text]);

  return (
    <div className="border-t border-gray-100 bg-white/90 backdrop-blur-md px-4 pt-2 pb-safe">
      <div className="max-w-lg mx-auto flex items-end gap-2 pb-2">
        <div className="flex-1 relative">
          <textarea
            ref={inputRef}
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Message Samantha..."
            rows={1}
            className="w-full resize-none rounded-2xl border border-gray-200 bg-sam-cream/50 px-4 py-2.5 text-[15px] text-sam-text placeholder:text-sam-muted/60 focus:outline-none focus:border-sam-coral/40 focus:ring-1 focus:ring-sam-coral/20 transition-colors"
            style={{ maxHeight: '120px' }}
          />
        </div>

        <button
          onClick={handleSend}
          disabled={!text.trim() || isLoading}
          className="w-10 h-10 rounded-full bg-gradient-to-br from-sam-coral to-sam-amber flex items-center justify-center shadow-md disabled:opacity-40 disabled:shadow-none active:scale-95 transition-all flex-shrink-0"
        >
          <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19V5m0 0l-7 7m7-7l7 7" />
          </svg>
        </button>
      </div>
    </div>
  );
};

export default InputBar;
