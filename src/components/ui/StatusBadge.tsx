"use client";

import React, { memo } from 'react';
import { clsx } from 'clsx';

type StatusType = 'success' | 'warning' | 'error' | 'info' | 'neutral';

interface StatusBadgeProps {
  label: string;
  type?: StatusType;
  className?: string;
}

const styles: Record<StatusType, string> = {
  success: "bg-green-50 text-green-700 border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800",
  warning: "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-900/20 dark:text-amber-400 dark:border-amber-800",
  error: "bg-red-50 text-red-700 border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800",
  info: "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-800",
  neutral: "bg-slate-50 text-slate-700 border-slate-200 dark:bg-slate-900/50 dark:text-slate-400 dark:border-slate-800",
};

export const StatusBadge = memo(function StatusBadge({ label, type = 'neutral', className }: StatusBadgeProps) {
  return (
    <span className={clsx(
      "px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border shadow-sm",
      styles[type],
      className
    )}>
      {label}
    </span>
  );
});

StatusBadge.displayName = 'StatusBadge';
