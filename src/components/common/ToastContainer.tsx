import React from 'react';
import { useSchool } from '../../context/SchoolContext';
import { CheckCircle2, AlertCircle, Info, AlertTriangle, X } from 'lucide-react';

export const ToastContainer: React.FC = () => {
  const { toasts, removeToast } = useSchool();

  if (toasts.length === 0) return null;

  return (
    <div className="toast-container fixed bottom-[calc(0.75rem+env(safe-area-inset-bottom))] left-3 right-3 sm:left-auto sm:right-5 sm:bottom-5 z-50 flex flex-col gap-2 sm:max-w-sm sm:w-full pointer-events-none">
      {toasts.map((toast) => {
        const icons = {
          success: <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />,
          error: <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />,
          warning: <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" />,
          info: <Info className="w-5 h-5 text-blue-600 shrink-0" />,
        };

        const borderColors = {
          success: 'border-l-4 border-l-emerald-600',
          error: 'border-l-4 border-l-rose-600',
          warning: 'border-l-4 border-l-amber-600',
          info: 'border-l-4 border-l-blue-600',
        };

        return (
          <div
            key={toast.id}
            className={`pointer-events-auto bg-white rounded-xl shadow-lg border border-slate-200/90 p-3.5 flex items-start gap-3 transition-all transform animate-in slide-in-from-bottom-5 duration-200 ${borderColors[toast.type]}`}
          >
            {icons[toast.type]}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-[#172554] truncate">{toast.message}</p>
              {toast.description && <p className="text-xs text-slate-500 mt-0.5 leading-snug">{toast.description}</p>}
            </div>
            <button
              onClick={() => removeToast(toast.id)}
              className="text-slate-400 hover:text-slate-600 p-1 rounded-md hover:bg-slate-100 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
};
