import React, { useState } from 'react';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
}

const ChatAssistant: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: 'Hello! I\'m your CARB compliance assistant. Ask me anything about:\n\n• VIN compliance checks\n• Smoke testing requirements\n• TRUCRS registration\n• Heavy-duty diesel regulations\n• Finding certified testers',
      timestamp: Date.now()
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      timestamp: Date.now()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    // Simulate AI response
    setTimeout(() => {
      const responses = [
        'Heavy-duty diesel vehicles over 14,000 lbs GVWR must comply with CARB regulations. Would you like me to check a specific VIN?',
        'Smoke tests must be performed by CARB-certified facilities. Call 844-685-8922 to schedule a mobile test anywhere in California.',
        'TRUCRS (Truck Regulation Upload, Compliance and Reporting System) registration is required for all commercial diesel vehicles operating in California.',
        'The Periodic Smoke Inspection Program (PSIP) requires regular testing based on your vehicle class and age. I can help you determine your requirements.'
      ];

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: responses[Math.floor(Math.random() * responses.length)],
        timestamp: Date.now()
      };

      setMessages(prev => [...prev, assistantMessage]);
      setLoading(false);
    }, 1000);
  };

  return (
    <div className="flex flex-col h-full max-h-[calc(100vh-300px)]">
      <div className="bg-gradient-to-r from-[#003366] to-[#004488] text-white rounded-t-2xl p-4 shadow-lg">
        <h2 className="text-xl font-black">AI COMPLIANCE ASSISTANT</h2>
        <p className="text-sm text-gray-200">Powered by Google Gemini</p>
      </div>

      <div className="flex-1 bg-white rounded-b-2xl shadow-lg overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[80%] rounded-2xl p-4 ${
                message.role === 'user'
                  ? 'bg-[#00C853] text-white'
                  : 'bg-gray-100 text-gray-900'
              }`}
            >
              <p className="text-sm whitespace-pre-wrap">{message.content}</p>
              <p className="text-xs mt-2 opacity-70">
                {new Date(message.timestamp).toLocaleTimeString()}
              </p>
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex justify-start">
            <div className="bg-gray-100 rounded-2xl p-4">
              <div className="flex space-x-2">
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.4s'}}></div>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="bg-white rounded-b-2xl shadow-lg p-4 border-t">
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Ask about CARB compliance..."
            className="flex-1 px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-[#00C853] focus:outline-none"
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || loading}
            className="px-6 py-3 bg-[#00C853] text-white font-bold rounded-xl hover:bg-[#00a844] disabled:bg-gray-300 disabled:cursor-not-allowed active:scale-95 transition-transform"
          >
            📤
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatAssistant;
