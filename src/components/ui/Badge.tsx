import React from 'react';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'blue' | 'gold' | 'green' | 'red' | 'yellow' | 'gray' | 'purple';
  className?: string;
}

const variantClasses = {
  blue: 'bg-blue-50 text-blue-700',
  gold: 'bg-amber-50 text-amber-700',
  green: 'bg-emerald-50 text-emerald-700',
  red: 'bg-red-50 text-red-600',
  yellow: 'bg-yellow-50 text-yellow-700',
  gray: 'bg-slate-100 text-slate-600',
  purple: 'bg-purple-50 text-purple-700',
};

export function Badge({ children, variant = 'gray', className = '' }: BadgeProps) {
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${variantClasses[variant]} ${className}`}>
      {children}
    </span>
  );
}

export function LeadStatusBadge({ status }: { status: string }) {
  const map: Record<string, 'blue' | 'gold' | 'green' | 'red' | 'yellow' | 'gray'> = {
    New: 'blue',
    Contacted: 'gold',
    Interested: 'yellow',
    'Follow-Up': 'purple' as any,
    Converted: 'green',
  };
  return <Badge variant={map[status] || 'gray'}>{status}</Badge>;
}

export function CallStatusBadge({ status }: { status: string }) {
  const map: Record<string, 'green' | 'red' | 'yellow'> = {
    Completed: 'green',
    Missed: 'red',
    Voicemail: 'yellow',
  };
  return <Badge variant={map[status] || 'gray'}>{status}</Badge>;
}

export function DocStatusBadge({ status }: { status: string }) {
  const map: Record<string, 'green' | 'yellow' | 'gray'> = {
    Processed: 'green',
    Processing: 'yellow',
    Queued: 'gray',
  };
  return <Badge variant={map[status] || 'gray'}>{status}</Badge>;
}
