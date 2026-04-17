"use client";

import { Eye, Settings2 } from "lucide-react";
import Link from "next/link";

export default function ProfileTopBar() {
  return (
    <div className="w-full bg-white dark:bg-slate-900 border-b border-[#F0EAF0] dark:border-slate-800 px-6 py-3 flex items-center justify-between sticky top-0 z-[60] shadow-sm">
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-[#2D3748] flex items-center justify-center">
          <span className="text-white font-bold text-sm">A</span>
        </div>
        <span className="text-sm font-black text-[#1A1A1A] dark:text-white">Azeez</span>
      </div>

      <div className="flex items-center gap-4">
        <button className="flex items-center gap-2 px-6 py-2 border-2 border-[#F0EAF0] text-[#1A1A1A] dark:text-white rounded-xl text-xs font-bold hover:bg-slate-50 transition-all active:scale-95">
          <Settings2 size={14} /> Customise Layout
        </button>
        <button className="flex items-center gap-2 px-6 py-2 bg-[#7C3AED] text-white rounded-xl text-xs font-bold hover:bg-purple-700 transition-all active:scale-95 shadow-lg shadow-purple-100">
          <Eye size={14} /> Publish Profile
        </button>
      </div>
    </div>
  );
}
