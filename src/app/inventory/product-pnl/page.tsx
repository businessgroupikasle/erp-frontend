"use client";

import { useState } from "react";
import { 
  ChevronRight, 
  ChevronDown,
  Download,
  Calendar,
  Columns
} from "lucide-react";
import Link from "next/link";
import { clsx } from "clsx";

export default function ProductProfitabilityReport() {
  const [activeTab, setActiveTab] = useState("Reports & More");

  const headers = [
    "Item", "SKU", "HSN/SAC", "Buying Price", "Selling Price", 
    "Total Sold Quantity", "Total Purchase Quantity", "Current Stock", 
    "Average Selling Price", "Average Buying Price", "Average Landed Cost", 
    "Gross Profit Margin(%)"
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
            <span className="text-[#666]">Product-wise Profitability Report</span>
          </div>
          
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-black text-[#1A1A1A] dark:text-white flex items-center gap-2">
              Inventory <span className="text-xl">✨</span>
            </h1>
            
            <div className="flex items-center gap-2">
               <div className="flex items-center bg-white dark:bg-slate-900 border border-[#F0EAF0] dark:border-slate-800 rounded-lg shadow-sm">
                  <div className="px-4 py-2 text-[13px] font-medium border-r border-[#F0EAF0] dark:border-slate-800">
                     Jan 17, 2026 - Apr 17, 2026
                  </div>
                  <button className="p-2 text-[#999] hover:text-[#7C3AED]">
                     <Calendar size={18} />
                  </button>
               </div>
            </div>
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

        {/* Section Title & Export */}
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-black text-[#1A1A1A] dark:text-white flex items-center gap-2">
            Product-wise Profitability Report <span className="text-sm">✨</span>
          </h2>
          <button className="flex items-center gap-2 px-4 py-2 border border-[#F0EAF0] dark:border-slate-800 rounded-lg text-[12px] font-bold text-[#666] hover:bg-slate-50 transition-colors bg-white dark:bg-slate-900 shadow-sm">
             <Download size={14} />
             Download CSV
          </button>
        </div>

        {/* Reporting Bar */}
        <div className="flex items-center justify-between pt-2">
           <span className="text-[12px] font-bold text-[#666]">No Record Found</span>
           <button className="flex items-center gap-2 px-3 py-1.5 border border-[#F0EAF0] dark:border-slate-800 rounded-md text-[11px] font-bold text-[#666] hover:bg-slate-50 transition-colors">
              <Columns size={14} />
              Show/Hide Columns
           </button>
        </div>

        {/* Profitability Table */}
        <div className="bg-white dark:bg-slate-900 border border-[#F0EAF0] dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto min-h-[400px]">
            <table className="w-full text-left border-collapse min-w-[2000px]">
              <thead>
                <tr className="bg-[#FAF9FA] dark:bg-slate-800/50 border-b border-[#F0EAF0] dark:border-slate-800">
                  <th className="p-4 w-10">
                     <div className="w-4 h-4 rounded border border-[#DDD] dark:border-slate-600" />
                  </th>
                  {headers.map((head) => (
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
                   <td colSpan={13} className="py-40">
                      <div className="flex flex-col items-center justify-center space-y-6">
                        <div className="w-20 h-20 rounded-full bg-purple-50 dark:bg-slate-800 flex items-center justify-center">
                           <div className="w-10 h-10 bg-purple-100 dark:bg-slate-700 rounded-xl" />
                        </div>
                        <p className="text-[12px] font-black uppercase tracking-widest text-[#999]">No Data</p>
                      </div>
                   </td>
                </tr>
              </tbody>
            </table>
          </div>
          
          <div className="p-4 bg-[#FAF9FA] dark:bg-slate-800/50 flex items-center justify-between border-t border-[#F0EAF0] dark:border-slate-800 text-[12px] font-bold text-[#666]">
             <span>No Record Found</span>
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
