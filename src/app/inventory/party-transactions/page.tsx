"use client";

import { useState } from "react";
import { 
  ChevronRight, 
  ChevronDown,
  Download,
  Calendar,
  Search,
  Columns
} from "lucide-react";
import Link from "next/link";
import { clsx } from "clsx";

export default function PartyTransactionReport() {
  const [activeTab, setActiveTab] = useState("Reports & More");

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
            <span className="text-[#666]">Party Transaction Report</span>
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
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-black text-[#1A1A1A] dark:text-white">Party Transaction Report</h2>
          <button className="flex items-center gap-2 px-4 py-2 border border-[#F0EAF0] dark:border-slate-800 rounded-lg text-[12px] font-bold text-[#666] hover:bg-slate-50 transition-colors bg-white dark:bg-slate-900 shadow-sm">
             <Download size={14} />
             Download CSV
          </button>
        </div>

        {/* Filters Section */}
        <div className="bg-white dark:bg-slate-900 border border-[#F0EAF0] dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-4">
           <button className="flex items-center gap-2 text-[12px] font-black text-[#1A1A1A] dark:text-white uppercase tracking-wider">
              <ChevronDown size={14} strokeWidth={3} />
              Filters
           </button>
           
           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 items-end">
              <div className="space-y-2">
                 <label className="text-[11px] font-bold text-[#666] uppercase">Time Period<span className="text-red-500 ml-1">*</span></label>
                 <div className="relative">
                    <input 
                      type="text" 
                      defaultValue="Feb 16, 2026 - Apr 17, 2026"
                      className="w-full pl-3 pr-10 py-2.5 border border-[#F0EAF0] dark:border-slate-800 rounded-lg text-[13px] font-medium outline-none focus:border-[#7C3AED] bg-[#FAF9FA] dark:bg-slate-800"
                    />
                    <Calendar size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#999]" />
                 </div>
              </div>

              <div className="space-y-2">
                 <label className="text-[11px] font-bold text-[#666] uppercase">Client/Vendor<span className="text-red-500 ml-1">*</span></label>
                 <div className="relative">
                    <select className="w-full pl-3 pr-10 py-2.5 border border-[#F0EAF0] dark:border-slate-800 rounded-lg text-[13px] font-medium outline-none focus:border-[#7C3AED] bg-white dark:bg-slate-900 appearance-none">
                       <option>Select Client</option>
                    </select>
                    <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#999] pointer-events-none" />
                 </div>
              </div>

              <button className="px-6 py-2.5 bg-[#D81159] hover:bg-[#B00E4A] text-white rounded-lg font-bold text-[13px] transition-all active:scale-95 shadow-md">
                 Apply Filters
              </button>
           </div>
        </div>

        {/* Action Header */}
        <div className="flex items-center justify-between">
           <span className="text-[12px] font-bold text-[#666]">No item Found</span>
           <button className="flex items-center gap-2 px-3 py-1.5 border border-[#F0EAF0] dark:border-slate-800 rounded-md text-[11px] font-bold text-[#666] hover:bg-slate-50 transition-colors">
              <Columns size={14} />
              Show/Hide Columns
           </button>
        </div>

        {/* Reporting Table */}
        <div className="bg-white dark:bg-slate-900 border border-[#F0EAF0] dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto min-h-[400px]">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#FAF9FA] dark:bg-slate-800/50 border-b border-[#F0EAF0] dark:border-slate-800">
                  <th className="p-4 w-10">
                     <div className="w-4 h-4 rounded border border-[#DDD] dark:border-slate-600" />
                  </th>
                  {[
                    "Item Name", "SKU", "Trade Type", "Total Quantity", "Avg. Unit Price", "Total Amount"
                  ].map((head) => (
                    <th key={head} className="p-4 text-[11px] font-bold text-[#999] dark:text-slate-500 uppercase tracking-wider">
                      <div className="flex items-center gap-2 italic">
                        {head} <ChevronDown size={10} className="opacity-40" />
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                <tr>
                   <td colSpan={7} className="py-32">
                      <div className="flex flex-col items-center justify-center space-y-4 opacity-30">
                         <div className="w-16 h-12 bg-slate-200 dark:bg-slate-700 rounded-lg" />
                         <p className="text-[12px] font-black uppercase tracking-widest text-slate-400">No Records</p>
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
