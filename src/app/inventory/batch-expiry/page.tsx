"use client";

import { useState } from "react";
import { 
  ChevronRight, 
  ChevronDown,
  Download,
  Search,
  Columns
} from "lucide-react";
import Link from "next/link";
import { clsx } from "clsx";

export default function BatchExpiryReport() {
  const [activeTab, setActiveTab] = useState("Reports & More");

  const expiryColumns = [
    "Expiring in 0-15 days", "Expiring in 16-30 days", "Expiring in 31-60 days", 
    "Expiring in 61-90 days", "Expiring in 90+ days", "Expired 0-15 days ago",
    "Expired 16-30 days ago", "Expired 31-60 days ago", "Expired 61-90 days ago",
    "Expired 90+ days ago"
  ];

  return (
    <div className="min-h-screen bg-[#FDFCFD] dark:bg-[#020617] -m-8 font-sans">
      <div className="p-8 space-y-6">
        {/* Breadcrumbs & Header */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-[10px] font-bold text-[#999] uppercase tracking-widest">
            <Link href="/" className="hover:text-[#7C3AED]">Azeez</Link>
            <ChevronRight size={10} />
            <Link href="/inventory" className="hover:text-[#7C3AED]">Inventory</Link>
            <ChevronRight size={10} />
            <span className="text-[#666]">Batch Expiry Report</span>
          </div>
          
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-black text-[#1A1A1A] dark:text-white flex items-center gap-2">
              Inventory <span className="text-xl">✨</span>
            </h1>
          </div>
        </div>

        {/* Primary Tabs */}
        <div className="flex items-center gap-8 border-b border-[#F0EAF0] dark:border-slate-800">
          {["All Items", "Warehouses", "Reports & More"].map((tab) => (
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
        <h2 className="text-lg font-black text-[#1A1A1A] dark:text-white">Batch Expiry Report</h2>

        {/* Search & Export Actions */}
        <div className="flex items-center justify-between gap-4 pt-4 pb-2">
           <span className="text-[12px] font-bold text-[#666]">No item Found</span>
           <div className="flex items-center gap-3">
              <button className="flex items-center gap-2 px-4 py-2 border border-[#F0EAF0] dark:border-slate-800 rounded-lg text-[12px] font-bold text-[#666] hover:bg-slate-50 transition-colors bg-white dark:bg-slate-900 shadow-sm">
                 <Download size={14} />
                 Download CSV
              </button>
              <div className="relative group min-w-[300px]">
                 <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#999]" />
                 <input 
                   type="text" 
                   placeholder="Search Items"
                   className="w-full pl-10 pr-10 py-2 border border-[#F0EAF0] dark:border-slate-800 rounded-lg text-[13px] font-medium outline-none focus:border-[#7C3AED] transition-colors bg-white dark:bg-slate-900 shadow-sm"
                 />
              </div>
              <button className="flex items-center gap-2 px-4 py-2 border border-[#7C3AED] dark:border-slate-800 rounded-lg text-[12px] font-bold text-[#7C3AED] hover:bg-purple-50 transition-colors bg-white dark:bg-slate-900 shadow-sm">
                 <Columns size={14} />
                 Show/Hide Columns
              </button>
           </div>
        </div>

        {/* Expiry Report Table */}
        <div className="bg-white dark:bg-slate-900 border border-[#F0EAF0] dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto min-h-[500px]">
            <table className="w-full text-left border-collapse min-w-[2500px]">
              <thead>
                {/* Level 1 Header */}
                <tr className="bg-[#FAF9FA] dark:bg-slate-800/50 border-b border-[#F0EAF0] dark:border-slate-800">
                  <th rowSpan={2} className="p-4 w-10 sticky left-0 bg-[#FAF9FA] dark:bg-slate-800 z-10">
                     <div className="w-4 h-4 rounded border border-[#DDD] dark:border-slate-600" />
                  </th>
                  <th rowSpan={2} className="p-4 text-[11px] font-bold text-[#666] dark:text-slate-500 uppercase tracking-wider border-r border-[#F0EAF0] dark:border-slate-800">
                    Item Name
                  </th>
                  <th rowSpan={2} className="p-4 text-[11px] font-bold text-[#666] dark:text-slate-500 uppercase tracking-wider border-r border-[#F0EAF0] dark:border-slate-800">
                    Stock In Hand <ChevronDown size={10} className="inline opacity-40 ml-1" />
                  </th>
                  <th rowSpan={2} className="p-4 text-[11px] font-bold text-[#666] dark:text-slate-500 uppercase tracking-wider border-r border-[#F0EAF0] dark:border-slate-800">
                    Expired <ChevronDown size={10} className="inline opacity-40 ml-1" />
                  </th>
                  {expiryColumns.map((col) => (
                    <th key={col} colSpan={2} className="p-4 text-[11px] font-bold text-[#666] dark:text-slate-500 text-center uppercase tracking-wider border-r border-[#F0EAF0] dark:border-slate-800 border-b border-[#F0EAF0] dark:border-slate-800">
                      {col}
                    </th>
                  ))}
                </tr>
                {/* Level 2 Header */}
                <tr className="bg-white dark:bg-slate-900 border-b border-[#F0EAF0] dark:border-slate-800">
                  {expiryColumns.map((col, idx) => (
                    <div key={`sub-${idx}`} className="contents">
                       <th className="p-3 text-[10px] font-bold text-[#999] dark:text-slate-600 uppercase tracking-wider border-r border-[#F0EAF0] dark:border-slate-800">Qty (% of total)</th>
                       <th className="p-3 text-[10px] font-bold text-[#999] dark:text-slate-600 uppercase tracking-wider border-r border-[#F0EAF0] dark:border-slate-800">Value</th>
                    </div>
                  ))}
                </tr>
              </thead>
              <tbody>
                <tr>
                   <td colSpan={24} className="py-40">
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
             <span>No item Found</span>
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
