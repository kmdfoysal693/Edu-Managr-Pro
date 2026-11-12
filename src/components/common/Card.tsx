import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  title?: string;
  subtitle?: string;
  icon?: React.ElementType;
  action?: React.ReactNode;
  footer?: React.ReactNode;
  noPadding?: boolean;
  onClick?: () => void;
  style?: React.CSSProperties;
}

export const Card: React.FC<CardProps> = ({
  children,
  className = '',
  title,
  subtitle,
  icon: Icon,
  action,
  footer,
  noPadding = false,
  onClick,
  style,
}) => {
  const hasHeader = Boolean(title || subtitle || Icon || action);

  return (
    <div
      onClick={onClick}
      style={style}
      className={`bg-white border border-slate-200/90 rounded-xl shadow-xs transition-shadow duration-200 hover:shadow-md/50 flex flex-col ${onClick ? 'cursor-pointer' : ''} ${className}`}
    >

      {hasHeader && (
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2.5 min-w-0">
            {Icon && (
              <div className="w-8 h-8 rounded-lg bg-blue-50 text-[#2563EB] flex items-center justify-center shrink-0">
                <Icon className="w-4 h-4" />
              </div>
            )}
            <div className="min-w-0">
              {title && <h3 className="text-base font-semibold text-[#172554] truncate">{title}</h3>}
              {subtitle && <p className="text-xs text-slate-500 truncate mt-0.5">{subtitle}</p>}
            </div>
          </div>
          {action && <div className="shrink-0">{action}</div>}
        </div>
      )}
      <div className={`flex-1 ${noPadding ? '' : 'p-5'}`}>{children}</div>
      {footer && <div className="px-5 py-3.5 border-t border-slate-100 bg-slate-50/50 rounded-b-xl text-xs text-slate-500">{footer}</div>}
    </div>
  );
};
