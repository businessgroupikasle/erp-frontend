"use client";

import { ChevronDown, Search, X, Download } from "lucide-react";

export default function ContactsFilters() {
  return (
    <div className="space-y-6 bg-white dark:bg-slate-900 rounded-2xl border border-[#F0EAF0] dark:border-slate-800 p-8 shadow-sm">
      <div className="flex items-center justify-between">
         <div className="flex items-center gap-6">
            <button className="flex items-center gap-2 text-sm font-bold text-[#1A1A1A] group">
               <ChevronDown size={18} className="text-[#999] group-hover:text-[#7C3AED] transition-all" />
               Filters
            </button>
            <button className="flex items-center gap-2 text-sm font-bold text-[#999] hover:text-[#7C3AED] transition-all">
               <X size={16} /> Clear All Filters
            </button>
         </div>
         <button className="flex items-center gap-2 px-4 py-2 border border-[#F0EAF0] rounded-lg text-xs font-bold text-[#666] hover:bg-slate-50 transition-all">
            <Download size={14} /> Download CSV
         </button>
      </div>

      <div className="space-y-4">
         <span className="text-xs font-bold text-[#CCC] uppercase tracking-widest">Applied Filters</span>
         <div className="flex flex-wrap gap-3 min-h-[40px] items-center">
            {/* Filter tags would go here */}
            <span className="text-[11px] text-[#BBB] italic">No filters applied</span>
         </div>
      </div>
    </div>
  );
}
