import React from 'react';

interface Props {
  isOnline: boolean;
}

const SamanthaHeader: React.FC<Props> = ({ isOnline }) => {
  return (
    <header className="flex items-center gap-3 px-4 py-3 bg-white/80 backdrop-blur-md border-b border-sam-coral/10 sticky top-0 z-10">
      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-sam-coral to-sam-amber flex items-center justify-center shadow-md">
        <span className="text-white text-lg font-light">S</span>
      </div>
      <div className="flex-1">
        <h1 className="text-base font-semibold text-sam-text leading-tight">Samantha</h1>
        <p className="text-xs text-sam-muted leading-tight">
          {isOnline ? 'here for you' : 'offline'}
        </p>
      </div>
      <div className={`w-2 h-2 rounded-full ${isOnline ? 'bg-green-400' : 'bg-gray-300'}`} />
    </header>
  );
};

export default SamanthaHeader;
