"use client";

import { useState } from "react";
import { 
  Plus, 
  Search, 
  ChevronRight, 
  ArrowRight,
  Filter,
  X,
  Columns
} from "lucide-react";
import Link from "next/link";
import { clsx } from "clsx";

export default function CRMFormsPage() {
  const [activeTab, setActiveTab] = useState("Forms");
  const [subTab, setSubTab] = useState("All Forms");
  const [showFilters, setShowFilters] = useState(true);

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
            <span className="text-[#666]">All Forms</span>
          </div>
          
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-black text-[#1A1A1A] dark:text-white flex items-center gap-2">
              All Forms <span className="text-xl">✨</span>
            </h1>
            
            <button className="flex items-center gap-2 px-6 py-2.5 bg-[#D81159] hover:bg-[#B00E4A] text-white rounded-lg font-bold text-[13px] transition-all active:scale-95 shadow-lg shadow-pink-200/50">
              <Plus size={18} strokeWidth={3} />
              Create Form
            </button>
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

        {/* Secondary Sub-tabs */}
        <div className="flex items-center gap-6">
           {["All Forms", "Active Forms", "Inactive Forms", "Deleted Forms"].map((tab) => (
             <button
                key={tab}
                onClick={() => setSubTab(tab)}
                className={clsx(
                  "text-[12px] font-bold transition-all relative",
                  subTab === tab 
                   ? "text-[#1A1A1A] dark:text-white border-b-2 border-[#1A1A1A] dark:border-white pb-1" 
                   : "text-[#999] dark:text-slate-500 hover:text-[#1A1A1A] dark:hover:text-white pb-1"
                )}
             >
               {tab}
             </button>
           ))}
        </div>

        {/* Action Bar */}
        <div className="pt-4 flex flex-col gap-4">
           <div className="flex items-center justify-between">
              <button 
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center gap-2 text-[13px] font-bold text-[#333] dark:text-white hover:text-[#7C3AED] transition-colors"
              >
                <ChevronRight size={16} className={clsx("transition-transform", showFilters && "rotate-90")} />
                <Filter size={16} /> Filters
                <span className="text-[11px] text-[#999] font-medium ml-2">❌ Clear All Filters</span>
              </button>

              <div className="relative group w-80">
                <input 
                  type="text" 
                  placeholder="Search Forms" 
                  className="w-full pl-4 pr-10 py-2 bg-white dark:bg-slate-900 border border-[#F0EAF0] dark:border-slate-800 rounded-lg text-[13px] font-medium outline-none focus:border-[#7C3AED] transition-all"
                />
                <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-2 text-[#999]">
                   <Search size={14} />
                   <ArrowRightIcon size={14} className="opacity-0 group-focus-within:opacity-100 transition-opacity" />
                </div>
              </div>
           </div>

           {showFilters && (
             <div className="bg-[#FAF9FA] dark:bg-slate-900/50 p-6 rounded-xl border border-[#F0EAF0] dark:border-slate-800 space-y-4">
                <p className="text-[11px] font-bold text-[#999] uppercase tracking-widest">Applied Filters</p>
                <div className="flex items-center gap-2">
                   <div className="flex items-center gap-2 px-3 py-1 bg-white dark:bg-slate-800 border border-[#F0EAF0] dark:border-slate-800 rounded-md shadow-sm">
                      <X size={12} className="text-[#999] cursor-pointer" />
                      <span className="text-[11px] font-bold text-[#666] dark:text-slate-400">Status: All</span>
                      <ChevronDown size={12} className="text-[#999]" />
                   </div>
                </div>
             </div>
           )}
        </div>

        {/* Data Table / Empty State */}
        <div className="bg-white dark:bg-slate-900 border border-[#F0EAF0] dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm">
          <div className="flex items-center justify-between p-4 border-b border-[#F0EAF0] dark:border-slate-800 bg-[#FAF9FA] dark:bg-slate-800/50">
             <span className="text-[12px] font-bold text-[#666]">No Forms Found</span>
             <button className="flex items-center gap-2 px-3 py-1.5 border border-[#F0EAF0] dark:border-slate-800 rounded-md text-[11px] font-bold text-[#666] hover:bg-slate-50 transition-colors">
                <Columns size={14} />
                Show/Hide Columns
             </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-white dark:bg-slate-900 border-b border-[#F0EAF0] dark:border-slate-800">
                  <th className="p-4 w-10">
                     <div className="w-4 h-4 rounded border border-[#DDD] dark:border-slate-600" />
                  </th>
                  {[
                    "Form Name", "Sales Pipeline", "Status", "Last Modified", "Captured Leads", "Created At", "Creator"
                  ].map((head) => (
                    <th key={head} className="p-4 text-[11px] font-bold text-[#999] dark:text-slate-500 uppercase tracking-wider">
                      <div className="flex items-center gap-2">
                        {head} <ArrowUp size={10} className="opacity-40" />
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td colSpan={8} className="py-40">
                    <div className="flex flex-col items-center justify-center space-y-6 animate-in fade-in zoom-in duration-500">
                      <div className="w-24 h-24 rounded-full bg-purple-50 dark:bg-slate-800 flex items-center justify-center">
                         <div className="w-12 h-8 bg-purple-200 dark:bg-slate-700 rounded-lg relative">
                            <div className="absolute -top-1 -right-1 w-4 h-4 bg-purple-400 rounded-full" />
                         </div>
                      </div>
                      <div className="text-center space-y-1">
                         <p className="text-sm font-black text-[#1A1A1A] dark:text-white uppercase tracking-widest">No Forms Found</p>
                      </div>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

function ArrowRightIcon({ size, className }: { size: number, className: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M5 12h14" /><path d="m12 5 7 7-7 7" /></svg>
  );
}

function ArrowUp({ size, className }: { size: number, className: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="m12 19 0-14" /><path d="m5 12 7-7 7 7" /></svg>
  );
}

function ChevronDown({ size, className }: { size: number, className: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="m6 9 6 6 6-6" /></svg>
  );
}
