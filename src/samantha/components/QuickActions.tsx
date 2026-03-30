import React from 'react';

interface Props {
  onAction: (action: string) => void;
}

const actions = [
  { label: "What's on my calendar today?", icon: '📅' },
  { label: 'Check my latest emails', icon: '📧' },
  { label: 'Look up a truck company', icon: '🚛' },
  { label: 'Directions to my next job', icon: '🗺️' },
  { label: 'Find diesel shops near me', icon: '🔧' },
  { label: 'Text a customer', icon: '💬' },
  { label: 'Help me draft an invoice', icon: '💰' },
  { label: 'CARB compliance question', icon: '📋' },
];

const QuickActions: React.FC<Props> = ({ onAction }) => {
  return (
    <div className="quick-actions-scroll flex flex-wrap justify-center gap-2 px-1 py-2">
      {actions.map((action) => (
        <button
          key={action.label}
          onClick={() => onAction(action.label)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-full bg-white border border-gray-100 shadow-sm text-sm text-sam-text hover:border-sam-coral/30 hover:shadow-md active:scale-95 transition-all"
        >
          <span>{action.icon}</span>
          <span className="whitespace-nowrap">{action.label}</span>
        </button>
      ))}
    </div>
  );
};

export default QuickActions;
