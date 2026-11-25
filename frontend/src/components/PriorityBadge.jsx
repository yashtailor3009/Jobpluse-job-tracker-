import React from 'react';

const priorityConfig = {
  HIGH: {
    label: 'High Priority',
    bg: 'bg-rose-500/10',
    text: 'text-rose-400',
    border: 'border-rose-500/20',
  },
  MEDIUM: {
    label: 'Medium Priority',
    bg: 'bg-amber-500/10',
    text: 'text-amber-400',
    border: 'border-amber-500/20',
  },
  LOW: {
    label: 'Low Priority',
    bg: 'bg-slate-500/10',
    text: 'text-slate-400',
    border: 'border-slate-500/20',
  },
};

export const PriorityBadge = ({ priority }) => {
  const config = priorityConfig[priority] || priorityConfig.MEDIUM;

  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 text-[11px] font-medium rounded border ${config.bg} ${config.text} ${config.border}`}
    >
      {config.label}
    </span>
  );
};
