"use client";

import { ChevronRight } from "lucide-react";
import { clsx } from "clsx";

export default function InvoiceHeader() {
  return (
    <div className="flex items-center justify-center gap-6 py-8 border-b border-[#F0EAF0] dark:border-slate-800 bg-white dark:bg-[#020617]">
      <div className="flex items-center gap-3">
        <div className="w-6 h-6 rounded-full bg-[#7C3AED] text-white flex items-center justify-center text-xs font-bold">
          1
        </div>
        <span className="text-sm font-bold text-[#1A1A1A] dark:text-white">Add Invoice Details</span>
      </div>
      
      <ChevronRight size={16} className="text-[#999]" />

      <div className="flex items-center gap-3 opacity-50">
        <div className="w-6 h-6 rounded-full border-2 border-[#999] text-[#999] flex items-center justify-center text-xs font-bold">
          2
        </div>
        <span className="text-sm font-bold text-[#999]">Design & Share (optional)</span>
      </div>
    </div>
  );
}
