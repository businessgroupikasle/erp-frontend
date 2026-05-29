"use client";

import React, { useEffect, useState } from 'react';
import { X, CheckCircle2, AlertCircle, AlertTriangle, Info } from 'lucide-react';
import { clsx } from 'clsx';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

interface ToastProps {
  message: string;
  type?: ToastType;
  onClose: () => void;
}

const ICONS = {
  success: <CheckCircle2 size={18} className="text-emerald-500" />,
  error: <AlertCircle size={18} className="text-rose-500" />,
  warning: <AlertTriangle size={18} className="text-amber-500" />,
  info: <Info size={18} className="text-blue-500" />,
};

const COLORS = {
  success: "bg-emerald-50/90 dark:bg-emerald-500/10 border-emerald-200 dark:border-emerald-500/20 text-emerald-900 dark:text-emerald-300",
  error: "bg-rose-50/90 dark:bg-rose-500/10 border-rose-200 dark:border-rose-500/20 text-rose-900 dark:text-rose-300",
  warning: "bg-amber-50/90 dark:bg-amber-500/10 border-amber-200 dark:border-amber-500/20 text-amber-900 dark:text-amber-300",
  info: "bg-blue-50/90 dark:bg-blue-500/10 border-blue-200 dark:border-blue-500/20 text-blue-900 dark:text-blue-300",
};

export const Toast: React.FC<ToastProps> = ({ message, type = 'info', onClose }) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Small delay to trigger enter animation
    const timer = setTimeout(() => setIsVisible(true), 10);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div
      className={clsx(
        "pointer-events-auto flex items-center gap-4 px-6 py-4 rounded-xl border backdrop-blur-xl shadow-[0_20px_50px_rgba(0,0,0,0.2)] transition-all duration-500 ease-out transform max-w-[800px] min-w-[400px]",
        COLORS[type],
        isVisible ? "translate-y-0 opacity-100 scale-100" : "-translate-y-4 opacity-0 scale-95"
      )}
      role="alert"
    >
      <div className="shrink-0 scale-125">{ICONS[type]}</div>
      <div className="flex-1 min-w-0">
        <p className="text-[11px] font-bold leading-relaxed break-words">
          {message}
        </p>
      </div>
      <button
        onClick={() => {
          setIsVisible(false);
          setTimeout(onClose, 500); 
        }}
        className="shrink-0 p-2 hover:bg-black/5 dark:hover:bg-white/5 rounded-xl transition-all active:scale-90"
      >
        <X size={16} className="opacity-40" />
      </button>
    </div>
  );
};
