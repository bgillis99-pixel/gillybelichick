import React, { useState, useEffect } from 'react';
import SamanthaHeader from './components/SamanthaHeader';
import ChatView from './components/ChatView';
import InputBar from './components/InputBar';
import QuickActions from './components/QuickActions';
import { useChat } from './hooks/useChat';

const SamanthaApp: React.FC = () => {
  const { messages, isLoading, sendMessage, clearMessages, voiceEnabled, toggleVoice } = useChat();
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
      <SamanthaHeader
        isOnline={isOnline}
        voiceEnabled={voiceEnabled}
        onToggleVoice={toggleVoice}
        onClearChat={clearMessages}
      />

      <div className="flex-1 flex flex-col min-h-0">
        {messages.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center px-6">
            {/* Samantha's avatar -- the command center identity */}
            <div className="relative mb-6">
              <div className="w-24 h-24 rounded-full bg-gradient-to-br from-sam-coral via-sam-amber to-orange-300 flex items-center justify-center shadow-xl">
                <div className="w-20 h-20 rounded-full bg-sam-cream/20 backdrop-blur-sm flex items-center justify-center">
                  <span className="text-white text-4xl font-extralight">S</span>
                </div>
              </div>
              {/* Pulse ring -- she's alive */}
              <div className="absolute inset-0 rounded-full border-2 border-sam-coral/30 animate-ping" style={{ animationDuration: '3s' }} />
              {/* Status indicator */}
              <div className="absolute bottom-1 right-1 w-4 h-4 rounded-full bg-green-400 border-2 border-sam-cream shadow-sm" />
            </div>

            <h2 className="text-2xl font-semibold text-sam-text mb-1">Command Center</h2>
            <p className="text-sam-coral text-sm font-medium mb-3">Samantha is online</p>
            <p className="text-sam-muted text-center text-sm leading-relaxed max-w-xs">
              Calendar, email, directions, company lookups, texts, invoicing, CARB rules -- I've got it all. What's the mission?
            </p>
            <div className="mt-8 w-full max-w-md">
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
