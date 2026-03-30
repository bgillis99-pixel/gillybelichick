import React, { useState, useEffect } from 'react';
import SamanthaHeader from './components/SamanthaHeader';
import ChatView from './components/ChatView';
import InputBar from './components/InputBar';
import QuickActions from './components/QuickActions';
import { useChat } from './hooks/useChat';

const SamanthaApp: React.FC = () => {
  const { messages, isLoading, sendMessage } = useChat();
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    const onOnline = () => setIsOnline(true);
    const onOffline = () => setIsOnline(false);
    window.addEventListener('online', onOnline);
    window.addEventListener('offline', onOffline);
    return () => {
      window.removeEventListener('online', onOnline);
      window.removeEventListener('offline', onOffline);
    };
  }, []);

  const handleQuickAction = (action: string) => {
    sendMessage(action);
  };

  return (
    <div className="flex flex-col h-full bg-sam-cream">
      <SamanthaHeader isOnline={isOnline} />

      <div className="flex-1 flex flex-col min-h-0">
        {messages.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center px-6">
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-sam-coral to-sam-amber flex items-center justify-center mb-6 shadow-lg">
              <span className="text-white text-3xl font-light">S</span>
            </div>
            <h2 className="text-xl font-medium text-sam-text mb-2">Hey Bryan</h2>
            <p className="text-sam-muted text-center text-sm leading-relaxed max-w-xs">
              I'm Samantha. I can check your calendar, read your emails, look up truck companies, and keep you posted on your projects. What do you need?
            </p>
            <div className="mt-8 w-full">
              <QuickActions onAction={handleQuickAction} />
            </div>
          </div>
        ) : (
          <ChatView messages={messages} isLoading={isLoading} />
        )}
      </div>

      <InputBar onSend={sendMessage} isLoading={isLoading} />
    </div>
  );
};

export default SamanthaApp;
