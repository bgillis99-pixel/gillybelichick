import React from 'react';

const TypingIndicator: React.FC = () => {
  return (
    <div className="flex items-start message-enter">
      <div className="bg-white shadow-sm border border-gray-100 rounded-2xl rounded-bl-md px-4 py-3 flex items-center gap-1.5">
        <div className="w-2 h-2 rounded-full bg-sam-coral breathing-dot" />
        <div className="w-2 h-2 rounded-full bg-sam-coral breathing-dot" />
        <div className="w-2 h-2 rounded-full bg-sam-coral breathing-dot" />
      </div>
    </div>
  );
};

export default TypingIndicator;
