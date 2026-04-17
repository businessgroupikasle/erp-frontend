"use client";

import { useState } from "react";
import { 
  ChevronRight, 
  Plus,
  ChevronDown,
  Columns,
  X,
  Filter
} from "lucide-react";
import Link from "next/link";
import { clsx } from "clsx";

export default function WorkflowFormsDashboard() {
  const [activeTab, setActiveTab] = useState("All Forms");

  return (
    <div className="min-h-screen bg-[#FDFCFD] dark:bg-[#020617] -m-8 font-sans">
      <div className="p-8 space-y-6">
        {/* Breadcrumbs & Header */}
        <div className="flex items-center justify-between">
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-[10px] font-bold text-[#999] uppercase tracking-widest">
              <Link href="/" className="hover:text-[#7C3AED]">Dashboard</Link>
              <ChevronRight size={10} />
              <Link href="/vendors" className="hover:text-[#7C3AED]">Vendor Lead Management</Link>
              <ChevronRight size={10} />
              <span className="text-[#666]">All Workflow Forms</span>
              <ChevronRight size={10} />
            </div>
            <h1 className="text-2xl font-black text-[#1A1A1A] dark:text-white">All Workflow Forms</h1>
          </div>
          <button className="px-6 py-2.5 bg-[#D81159] hover:bg-[#B00E4A] text-white rounded-lg font-bold text-[13px] flex items-center gap-2 transition-all active:scale-95 shadow-lg shadow-pink-200/50">
             <Plus size={18} /> Create Form
          </button>
        </div>

        {/* Form Tabs */}
        <div className="flex items-center gap-6 border-b border-[#F0EAF0] dark:border-slate-800 pb-px">
          {["All Forms", "Active Forms", "Inactive Forms", "Deleted Forms"].map((tab) => (
            <button
               key={tab}
               onClick={() => setActiveTab(tab)}
               className={clsx(
                 "pb-3 text-[13px] font-bold transition-all relative whitespace-nowrap",
                 activeTab === tab 
                  ? "text-[#7C3AED]" 
                  : "text-[#666] dark:text-slate-500 hover:text-[#1A1A1A] dark:hover:text-white"
               )}
            >
              {tab}
              {activeTab === tab && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#7C3AED]" />
              )}
            </button>
          ))}
        </div>

        {/* Filter Bar */}
        <div className="bg-[#FAF9FA] dark:bg-slate-800/50 border border-[#F0EAF0] dark:border-slate-800 rounded-2xl p-6 space-y-6 shadow-sm">
           <div className="flex items-center justify-between">
              <button className="flex items-center gap-2 text-[12px] font-black text-[#1A1A1A] dark:text-white uppercase tracking-wider">
                 <ChevronDown size={14} className="stroke-[3]" /> Filters
              </button>
              <button className="flex items-center gap-1.5 text-[11px] font-bold text-red-500 hover:text-red-600 uppercase transition-colors">
                 <X size={14} /> Clear All Filters
              </button>
           </div>
           
           <div className="pt-6 border-t border-[#F0EAF0] dark:border-slate-800 space-y-4">
              <p className="text-[11px] font-bold text-[#666] uppercase tracking-wider">Applied Filters</p>
              <div className="flex flex-wrap gap-2">
                 <div className="flex items-center gap-2 px-3 py-1.5 bg-white dark:bg-slate-900 border border-[#F0EAF0] dark:border-slate-800 rounded-lg text-[12px] font-medium text-[#444] dark:text-slate-300 shadow-sm">
                    <span className="opacity-50">Status: All</span>
                    <button className="hover:text-red-500 transition-colors">
                       <X size={12} strokeWidth={3} />
                    </button>
                 </div>
              </div>
           </div>
        </div>

        {/* Action Table Header */}
        <div className="flex items-center justify-between">
           <p className="text-[12px] font-bold text-[#666]">No Forms Found</p>
           <button className="flex items-center gap-2 px-3 py-1.5 border border-[#F0EAF0] dark:border-slate-800 rounded-md text-[11px] font-bold text-[#666] hover:bg-slate-50 transition-colors bg-white dark:bg-slate-900">
              <Columns size={14} /> Show/Hide Columns
           </button>
        </div>

        {/* Forms Table */}
        <div className="bg-white dark:bg-slate-900 border border-[#F0EAF0] dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm overflow-x-auto min-h-[400px]">
          <table className="w-full text-left border-collapse min-w-[1200px]">
            <thead>
              <tr className="bg-[#FAF9FA] dark:bg-slate-800/50 border-b border-[#F0EAF0] dark:border-slate-800">
                {[
                  "Form Name", "Workflow", "Current Stage", "Current Assignee", 
                  "Workflow Type", "Status", "Last Modified", "Captured Leads", 
                  "Created At", "Creator"
                ].map((head) => (
                  <th key={head} className="p-4 text-[11px] font-bold text-[#999] uppercase tracking-wider whitespace-nowrap">
                    <div className="flex items-center gap-2">
                       {head} <ChevronDown size={12} className="opacity-40" />
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              <tr>
                 <td colSpan={10} className="py-40">
                    <div className="flex flex-col items-center justify-center space-y-6">
                       <div className="w-20 h-20 rounded-full bg-slate-50 dark:bg-slate-800 flex items-center justify-center opacity-30 text-slate-400">
                          <Filter size={40} />
                       </div>
                       <p className="text-[12px] font-black uppercase tracking-widest text-[#999]">No Data Found</p>
                    </div>
                 </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
