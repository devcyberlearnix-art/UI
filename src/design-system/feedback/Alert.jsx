import React from 'react';
import { CheckCircle2, AlertTriangle, AlertCircle, Info, X } from 'lucide-react';

const VARIANTS = {
  info: {
    container:
      'bg-[#EDF3F7] dark:bg-[#365D75]/15 border-[#B2CCE0] dark:border-[#365D75]/30 text-[#365D75] dark:text-[#6499BE]',
    icon: Info,
  },
  success: {
    container:
      'bg-[#EBF3EE] dark:bg-[#2B6747]/15 border-[#B7D9C5] dark:border-[#2B6747]/30 text-[#2B6747] dark:text-[#529E73]',
    icon: CheckCircle2,
  },
  warning: {
    container:
      'bg-[#F9F2E7] dark:bg-[#935E1E]/15 border-[#E5CDA8] dark:border-[#935E1E]/30 text-[#935E1E] dark:text-[#D19447]',
    icon: AlertTriangle,
  },
  danger: {
    container:
      'bg-[#FAECEB] dark:bg-[#9B3835]/15 border-[#E8B4B2] dark:border-[#9B3835]/30 text-[#9B3835] dark:text-[#D66B67]',
    icon: AlertCircle,
  },
};

export const Alert = ({
  variant = 'info',
  title,
  children,
  onClose,
  className = '',
}) => {
  const config = VARIANTS[variant] || VARIANTS.info;
  const Icon = config.icon;

  return (
    <div
      role="alert"
      className={`relative flex items-start gap-3.5 p-4 rounded-2xl border text-sm transition-all ${config.container} ${className}`}
    >
      <Icon className="w-5 h-5 shrink-0 mt-0.5" />
      <div className="flex-1">
        {title && <h5 className="font-bold mb-0.5 tracking-tight">{title}</h5>}
        <div className="text-xs leading-relaxed opacity-95">{children}</div>
      </div>
      {onClose && (
        <button
          onClick={onClose}
          aria-label="Dismiss alert"
          className="p-1 rounded-lg hover:bg-black/5 dark:hover:bg-white/5 opacity-70 hover:opacity-100 transition-opacity"
        >
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  );
};

export default Alert;

