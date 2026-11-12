import React from 'react';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ElementType;
  trend?: {
    value: string;
    isPositive?: boolean;
    isNeutral?: boolean;
    label?: string;
  };
  colorTheme?: 'blue' | 'sky' | 'emerald' | 'amber' | 'rose' | 'indigo' | 'violet' | 'teal';
  subtitle?: string;
  onClick?: () => void;
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  icon: Icon,
  trend,
  colorTheme = 'blue',
  subtitle,
  onClick,
}) => {
  const colorMap = {
    blue: {
      bg: 'bg-blue-50 text-blue-600 border-blue-100',
      accent: 'border-l-blue-600',
    },
    sky: {
      bg: 'bg-sky-50 text-sky-600 border-sky-100',
      accent: 'border-l-sky-500',
    },
    emerald: {
      bg: 'bg-emerald-50 text-emerald-600 border-emerald-100',
      accent: 'border-l-emerald-600',
    },
    amber: {
      bg: 'bg-amber-50 text-amber-600 border-amber-100',
      accent: 'border-l-amber-500',
    },
    rose: {
      bg: 'bg-rose-50 text-rose-600 border-rose-100',
      accent: 'border-l-rose-500',
    },
    indigo: {
      bg: 'bg-indigo-50 text-indigo-600 border-indigo-100',
      accent: 'border-l-indigo-600',
    },
    violet: {
      bg: 'bg-purple-50 text-purple-600 border-purple-100',
      accent: 'border-l-purple-600',
    },
    teal: {
      bg: 'bg-teal-50 text-teal-600 border-teal-100',
      accent: 'border-l-teal-600',
    },
  };

  const theme = colorMap[colorTheme];

  return (
    <div
      onClick={onClick}
      className={`bg-white border border-slate-200/90 rounded-xl p-4 sm:p-5 shadow-xs transition-all duration-200 hover:shadow-md hover:-translate-y-0.5 border-l-4 ${theme.accent} ${onClick ? 'cursor-pointer' : ''}`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <p className="text-xs font-medium text-slate-500 uppercase tracking-wider truncate">{title}</p>
          <div className="mt-2 flex items-baseline gap-2">
            <h4 className="text-2xl font-bold text-[#172554] tracking-tight truncate">{value}</h4>
          </div>
          {subtitle && <p className="text-xs text-slate-400 mt-0.5 truncate">{subtitle}</p>}
        </div>

        <div className={`p-2.5 rounded-xl border shrink-0 ${theme.bg}`}>
          <Icon className="w-5 h-5" />
        </div>
      </div>

      {trend && (
        <div className="mt-3 pt-3 border-t border-slate-100 flex items-center gap-1.5 text-xs">
          {trend.isNeutral ? (
            <Minus className="w-3.5 h-3.5 text-slate-400 shrink-0" />
          ) : trend.isPositive ? (
            <TrendingUp className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
          ) : (
            <TrendingDown className="w-3.5 h-3.5 text-rose-500 shrink-0" />
          )}
          <span
            className={`font-semibold ${
              trend.isNeutral ? 'text-slate-500' : trend.isPositive ? 'text-emerald-700' : 'text-rose-600'
            }`}
          >
            {trend.value}
          </span>
          {trend.label && <span className="text-slate-400 truncate">{trend.label}</span>}
        </div>
      )}
    </div>
  );
};
