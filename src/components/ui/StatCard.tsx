import React from 'react';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  change?: number;
  changeLabel?: string;
  iconBg?: string;
  className?: string;
}

export function StatCard({ title, value, icon, change, changeLabel, iconBg = 'bg-blue-50', className = '' }: StatCardProps) {
  const isPositive = change !== undefined && change > 0;
  const isNeutral = change === undefined || change === 0;

  return (
    <div className={`card card-hover p-5 ${className}`}>
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <p className="text-xs font-medium text-slate-500 uppercase tracking-wider truncate">{title}</p>
          <p className="mt-1.5 text-2xl font-bold text-slate-900">{typeof value === 'number' ? value.toLocaleString() : value}</p>
          {change !== undefined && (
            <div className="mt-2 flex items-center gap-1">
              {isNeutral ? (
                <Minus className="w-3.5 h-3.5 text-slate-400" />
              ) : isPositive ? (
                <TrendingUp className="w-3.5 h-3.5 text-emerald-500" />
              ) : (
                <TrendingDown className="w-3.5 h-3.5 text-red-500" />
              )}
              <span className={`text-xs font-medium ${isNeutral ? 'text-slate-500' : isPositive ? 'text-emerald-600' : 'text-red-500'}`}>
                {change > 0 ? '+' : ''}{change}% {changeLabel || 'vs last week'}
              </span>
            </div>
          )}
        </div>
        <div className={`flex-shrink-0 w-11 h-11 rounded-xl ${iconBg} flex items-center justify-center ml-3`}>
          {icon}
        </div>
      </div>
    </div>
  );
}
