import React from 'react';

interface Props {
  onAction: (action: string) => void;
}

const actions = [
  { label: "What's on my calendar today?", icon: '📅' },
  { label: 'Check my latest emails', icon: '📧' },
  { label: 'Look up a truck company', icon: '🚛' },
  { label: 'Update me on my projects', icon: '📋' },
  { label: "What's the weather like?", icon: '☀️' },
  { label: 'Help me draft an email', icon: '✍️' },
];

const QuickActions: React.FC<Props> = ({ onAction }) => {
  return (
    <div className="quick-actions-scroll flex gap-2 px-1 py-2">
      {actions.map((action) => (
        <button
          key={action.label}
          onClick={() => onAction(action.label)}
          className="flex-shrink-0 flex items-center gap-2 px-4 py-2.5 rounded-full bg-white border border-gray-100 shadow-sm text-sm text-sam-text hover:border-sam-coral/30 hover:shadow-md active:scale-95 transition-all"
        >
          <span>{action.icon}</span>
          <span className="whitespace-nowrap">{action.label}</span>
        </button>
      ))}
    </div>
  );
};

export default QuickActions;
