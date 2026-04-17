"use client";

import { useState } from "react";
import { 
  Plus, 
  ChevronRight, 
  Calendar,
  ChevronDown,
  Download,
  Columns
} from "lucide-react";
import Link from "next/link";
import { clsx } from "clsx";

export default function LeadSourceReport() {
  const [activeTab, setActiveTab] = useState("Reports & More");

  return (
    <div className="min-h-screen bg-[#FDFCFD] dark:bg-[#020617] -m-8 font-sans">
      <div className="p-8 space-y-6">
        {/* Breadcrumbs & Header */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-[10px] font-bold text-[#999] uppercase tracking-widest">
            <Link href="/" className="hover:text-[#7C3AED]">Dashboard</Link>
            <ChevronRight size={10} />
            <Link href="/crm" className="hover:text-[#7C3AED]">Lead Management</Link>
            <ChevronRight size={10} />
            <span className="text-[#666]">Lead Source Report</span>
          </div>
          
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-black text-[#1A1A1A] dark:text-white flex items-center gap-2">
              Lead Management <span className="text-xl">✨</span>
            </h1>
            
            <div className="flex items-center gap-2">
               <button className="flex items-center gap-2 px-6 py-2.5 bg-[#D81159] hover:bg-[#B00E4A] text-white rounded-lg font-bold text-[13px] transition-all active:scale-95 shadow-lg shadow-pink-200/50">
                <Plus size={18} strokeWidth={3} />
                Add New
              </button>
              <button className="p-2.5 bg-[#D81159] hover:bg-[#B00E4A] text-white rounded-lg transition-all active:scale-95 shadow-lg shadow-pink-200/50">
                 <ChevronDown size={18} strokeWidth={3} />
              </button>
            </div>
          </div>
        </div>

        {/* Primary Tabs */}
        <div className="flex items-center gap-8 border-b border-[#F0EAF0] dark:border-slate-800">
          {["All Sales Pipelines", "Forms", "All Leads", "Reports & More"].map((tab) => (
            <button
               key={tab}
               onClick={() => setActiveTab(tab)}
               className={clsx(
                 "pb-3 text-[13px] font-bold transition-all relative flex items-center gap-2",
                 activeTab === tab 
                  ? "text-[#7C3AED]" 
                  : "text-[#666] dark:text-slate-500 hover:text-[#1A1A1A] dark:hover:text-white"
               )}
            >
              {tab}
              {tab === "Reports & More" && <ChevronRight size={12} />}
              {activeTab === tab && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#7C3AED]" />
              )}
            </button>
          ))}
        </div>

        {/* Section Title */}
        <div className="space-y-1">
           <h2 className="text-lg font-black text-[#1A1A1A] dark:text-white">Lead Source Report</h2>
           <p className="text-[11px] font-bold text-[#999] uppercase tabular-nums">Last Updated at: 4/17/2026, 12:02:42 AM</p>
        </div>

        {/* Filters Box */}
        <div className="bg-white dark:bg-slate-900 border border-[#F0EAF0] dark:border-slate-800 rounded-2xl p-8 space-y-6 shadow-sm">
           <h3 className="text-sm font-black text-[#1A1A1A] dark:text-white">Filters</h3>
           
           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Lead Created At */}
              <div className="space-y-2">
                 <label className="text-[11px] font-bold text-[#333] dark:text-white uppercase tracking-wider flex items-center gap-1">
                    Lead Created At <span className="text-pink-500">*</span>
                 </label>
                 <div className="relative group">
                    <input 
                      type="text" 
                      defaultValue="Jan 17, 2026 - Apr 17, 2026"
                      className="w-full pl-4 pr-10 py-2.5 bg-[#FAF9FA] dark:bg-slate-800/50 border border-[#F0EAF0] dark:border-slate-800 rounded-lg text-[13px] font-medium transition-all"
                    />
                    <Calendar size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-[#999]" />
                 </div>
              </div>

              {/* Lead Closed At */}
              <div className="space-y-2">
                 <label className="text-[11px] font-bold text-[#333] dark:text-white uppercase tracking-wider">
                    Lead Closed At
                 </label>
                 <div className="relative group">
                    <input 
                      type="text" 
                      placeholder="Start Date - End date"
                      className="w-full pl-4 pr-10 py-2.5 bg-white dark:bg-slate-900 border border-[#F0EAF0] dark:border-slate-800 rounded-lg text-[13px] font-medium transition-all"
                    />
                    <Calendar size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-[#999]" />
                 </div>
              </div>

              {/* Pipeline */}
              <div className="space-y-2">
                 <label className="text-[11px] font-bold text-[#333] dark:text-white uppercase tracking-wider flex items-center gap-1">
                    Pipeline <span className="text-pink-500">*</span>
                 </label>
                 <div className="relative">
                    <select className="w-full pl-4 pr-10 py-2.5 bg-[#FAF9FA] dark:bg-slate-800/50 border border-[#F0EAF0] dark:border-slate-800 rounded-lg text-[13px] font-medium appearance-none outline-none">
                       <option>Sales Pipeline</option>
                    </select>
                    <ChevronDown size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-[#999] pointer-events-none" />
                 </div>
              </div>

              {/* Assigned To */}
              <div className="space-y-2">
                 <label className="text-[11px] font-bold text-[#333] dark:text-white uppercase tracking-wider">
                    Assigned To
                 </label>
                 <div className="relative">
                    <select className="w-full pl-4 pr-10 py-2.5 bg-white dark:bg-slate-900 border border-[#F0EAF0] dark:border-slate-800 rounded-lg text-[13px] font-medium appearance-none outline-none">
                       <option>Select</option>
                    </select>
                    <ChevronDown size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-[#999] pointer-events-none" />
                 </div>
              </div>
           </div>

           <button className="px-8 py-2.5 bg-[#D81159] hover:bg-[#B00E4A] text-white rounded-lg font-bold text-[13px] transition-all active:scale-95 shadow-lg shadow-pink-200/50">
              Apply Filters
           </button>
        </div>

        {/* Metrics View Controls */}
        <div className="flex items-center justify-end gap-3 pt-4">
           <button className="flex items-center gap-2 px-3 py-1.5 border border-[#F0EAF0] dark:border-slate-800 rounded-md text-[11px] font-bold text-[#666] hover:bg-slate-50 transition-colors bg-white dark:bg-slate-900 shadow-sm">
              <Download size={14} />
              Download CSV
           </button>
        </div>

        {/* Data Table */}
        <div className="bg-white dark:bg-slate-900 border border-[#F0EAF0] dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm">
          <div className="flex items-center justify-between p-4 border-b border-[#F0EAF0] dark:border-slate-800 bg-[#FAF9FA] dark:bg-slate-800/50">
             <span className="text-[12px] font-bold text-[#666]">No Source Found</span>
             <button className="flex items-center gap-2 px-3 py-1.5 border border-[#F0EAF0] dark:border-slate-800 rounded-md text-[11px] font-bold text-[#666] hover:bg-slate-50 transition-colors">
                <Columns size={14} />
                Show/Hide Columns
             </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[1600px]">
              <thead>
                <tr className="bg-white dark:bg-slate-900 border-b border-[#F0EAF0] dark:border-slate-800">
                  <th className="p-4 w-10">
                     <div className="w-4 h-4 rounded border border-[#DDD] dark:border-slate-600" />
                  </th>
                  {[
                    "Lead Source", "Total Revenue", "Lead Conversion Rate (%)", "Leads Generated", 
                    "Open Leads", "Closed Leads", "Lost Leads", "Not Serviceable", 
                    "Avg. Deal Value", "Avg Lead Closure Time (Days)"
                  ].map((head) => (
                    <th key={head} className="p-4 text-[11px] font-bold text-[#999] dark:text-slate-500 uppercase tracking-wider">
                      <div className="flex items-center gap-2">
                        {head} <ChevronDown size={10} className="opacity-40" />
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td colSpan={11} className="py-40">
                    <div className="flex flex-col items-center justify-center space-y-6 animate-in fade-in zoom-in duration-500">
                      <div className="w-24 h-24 rounded-full bg-purple-50 dark:bg-slate-800 flex items-center justify-center">
                         <div className="w-12 h-8 bg-purple-200 dark:bg-slate-700 rounded-lg relative">
                            <div className="absolute -top-1 -right-1 w-4 h-4 bg-purple-400 rounded-full" />
                         </div>
                      </div>
                      <div className="text-center space-y-1">
                         <p className="text-sm font-black text-[#1A1A1A] dark:text-white uppercase tracking-widest">No Data</p>
                      </div>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          
          <div className="p-4 bg-[#FAF9FA] dark:bg-slate-800/50 flex items-center justify-between border-t border-[#F0EAF0] dark:border-slate-800 text-[12px] font-bold text-[#666]">
             <span>No Source Found</span>
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
