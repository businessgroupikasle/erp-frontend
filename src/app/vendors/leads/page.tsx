"use client";

import { Plus, Download, Columns, Search, ChevronRight } from "lucide-react";
import { useState } from "react";
import Link from "next/link";

export default function VendorLeadsPage() {
  const [leads] = useState([]);

  return (
    <div className="min-h-screen bg-[#FDFCFD] dark:bg-[#020617] -m-8">
      <div className="p-8 space-y-6">
        {/* Breadcrumbs & Header */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-[10px] font-bold text-[#999] uppercase tracking-widest">
            <Link href="/" className="hover:text-[#7C3AED]">Azeez</Link>
            <ChevronRight size={10} />
            <span className="text-[#666]">Vendor Leads Dashboard</span>
          </div>
          
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-black text-[#1A1A1A] dark:text-white flex items-center gap-2">
              Your Vendor Leads <span>✨</span>
            </h1>
            
            <div className="flex items-center gap-3">
               <button className="flex items-center gap-2 px-4 py-2 bg-[#D81159] hover:bg-[#B00E4A] text-white rounded-lg font-bold text-[13px] transition-all active:scale-95 shadow-lg shadow-pink-200/50">
                  <Plus size={16} />
                  Create Vendor Leads
               </button>
               <button className="p-2 border border-[#F0EAF0] dark:border-slate-800 rounded-lg hover:bg-[#F5F1F5] dark:hover:bg-slate-900 transition-colors">
                  <ChevronRight size={16} className="rotate-90" />
               </button>
            </div>
          </div>
        </div>

        {/* Action Bar */}
        <div className="flex items-center justify-end gap-3 pt-6 border-t border-[#F0EAF0] dark:border-slate-800">
           <button className="flex items-center gap-2 px-3 py-1.5 border border-[#F0EAF0] dark:border-slate-800 rounded-md text-[11px] font-bold text-[#666] hover:bg-slate-50 transition-colors">
              <Download size={14} />
              Download CSV
           </button>
           <button className="flex items-center gap-2 px-3 py-1.5 border border-[#F0EAF0] dark:border-slate-800 rounded-md text-[11px] font-bold text-[#666] hover:bg-slate-50 transition-colors">
              <Columns size={14} />
              Show/Hide Columns
           </button>
        </div>

        {/* Table / Empty State */}
        <div className="bg-white dark:bg-slate-900 border border-[#F0EAF0] dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#FAF9FA] dark:bg-slate-800/50 border-b border-[#F0EAF0] dark:border-slate-800">
                  <th className="p-4 w-10">
                     <div className="w-4 h-4 rounded border border-[#DDD] dark:border-slate-600" />
                  </th>
                  {["Name", "Phone", "Email", "Country", "Workflow Name", "Current Assignee", "Current Stage", "Current Status"].map((head) => (
                    <th key={head} className="p-4 text-[11px] font-bold text-[#666] dark:text-slate-400 uppercase tracking-wider">
                      <div className="flex items-center gap-2">
                        {head} <Search size={10} className="opacity-40" />
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {leads.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="py-32">
                      <div className="flex flex-col items-center justify-center space-y-6">
                        <div className="w-20 h-20 rounded-3xl bg-purple-50 dark:bg-slate-800 flex items-center justify-center animate-pulse">
                           <div className="w-10 h-6 bg-purple-200 dark:bg-slate-700 rounded-lg" />
                        </div>
                        <div className="text-center space-y-1">
                           <p className="text-sm font-bold text-[#1A1A1A] dark:text-white">No Data</p>
                           <p className="text-[11px] text-[#999]">No vendor lead Found</p>
                        </div>
                      </div>
                    </td>
                  </tr>
                ) : (
                  leads.map((lead, i) => (
                    <tr key={i} className="border-b border-[#F0EAF0] dark:border-slate-800 last:border-0 hover:bg-[#FDFCFD] dark:hover:bg-slate-900/50 transition-colors">
                      {/* lead data rows would go here */}
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          
          <div className="p-4 bg-[#FAF9FA] dark:bg-slate-800/50 flex items-center justify-between border-t border-[#F0EAF0] dark:border-slate-800">
             <span className="text-[11px] text-[#999] font-medium">No vendor lead Found</span>
             <button className="flex items-center gap-2 px-3 py-1.5 border border-[#F0EAF0] dark:border-slate-800 rounded-md text-[11px] font-bold text-[#666] hover:bg-slate-50 transition-colors">
                <Columns size={14} />
                Show/Hide Columns
             </button>
          </div>
        </div>
      </div>
    </div>
  );
}
