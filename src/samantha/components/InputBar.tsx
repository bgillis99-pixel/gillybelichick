import React, { useState, useRef, useEffect } from 'react';

interface Props {
  onSend: (message: string) => void;
  isLoading: boolean;
}

const InputBar: React.FC<Props> = ({ onSend, isLoading }) => {
  const [text, setText] = useState('');
  const [isListening, setIsListening] = useState(false);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const recognitionRef = useRef<any>(null);

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

  const toggleVoice = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) return;

    if (isListening && recognitionRef.current) {
      recognitionRef.current.stop();
      setIsListening(false);
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.lang = 'en-US';

    recognition.onresult = (event: any) => {
      let transcript = '';
      for (let i = 0; i < event.results.length; i++) {
        transcript += event.results[i][0].transcript;
      }
      setText(transcript);

      // Auto-send on final result
      if (event.results[event.results.length - 1].isFinal) {
        const final = transcript.trim();
        if (final) {
          setTimeout(() => {
            onSend(final);
            setText('');
            setIsListening(false);
          }, 300);
        }
      }
    };

    recognition.onerror = () => setIsListening(false);
    recognition.onend = () => setIsListening(false);

    recognitionRef.current = recognition;
    recognition.start();
    setIsListening(true);
  };

  const hasSpeechAPI = typeof window !== 'undefined' &&
    ((window as any).SpeechRecognition || (window as any).webkitSpeechRecognition);

  return (
    <div className="border-t border-gray-100 bg-white/90 backdrop-blur-md px-4 pt-2 pb-safe">
      <div className="max-w-lg mx-auto flex items-end gap-2 pb-2">
        {hasSpeechAPI && (
          <button
            onClick={toggleVoice}
            className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 active:scale-95 transition-all ${
              isListening
                ? 'bg-red-500 text-white shadow-md animate-pulse'
                : 'bg-gray-100 text-sam-muted hover:bg-gray-200'
            }`}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
            </svg>
          </button>
        )}

        <div className="flex-1 relative">
          <textarea
            ref={inputRef}
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={isListening ? 'Listening...' : 'Message Samantha...'}
            rows={1}
            className={`w-full resize-none rounded-2xl border bg-sam-cream/50 px-4 py-2.5 text-[15px] text-sam-text placeholder:text-sam-muted/60 focus:outline-none focus:border-sam-coral/40 focus:ring-1 focus:ring-sam-coral/20 transition-colors ${
              isListening ? 'border-red-300 bg-red-50/30' : 'border-gray-200'
            }`}
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
