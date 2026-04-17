"use client";

import { Plus, Edit3 } from "lucide-react";

interface ProfileSectionHeaderProps {
  title: string;
  buttonLabel: string;
  onAction?: () => void;
  variant?: "add" | "edit";
}

export default function ProfileSectionHeader({ 
  title, 
  buttonLabel, 
  onAction, 
  variant = "add" 
}: ProfileSectionHeaderProps) {
  return (
    <div className="flex items-center justify-center relative py-6 border-b border-dashed border-slate-200 dark:border-slate-800">
      <h2 className="text-2xl font-black text-[#1A1A1A] dark:text-white uppercase tracking-tight">{title}</h2>
      <button 
        onClick={onAction}
        className="absolute right-0 flex items-center gap-2 px-4 py-2 border border-[#7C3AED] text-[#7C3AED] rounded-lg text-xs font-bold hover:bg-purple-50 transition-all active:scale-95"
      >
        {variant === "add" ? <Plus size={14} /> : <Edit3 size={14} />} {buttonLabel}
      </button>
    </div>
  );
}
