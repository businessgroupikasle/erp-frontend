"use client";

import { useState } from "react";
import { 
  ChevronRight, 
  ChevronDown,
  Download,
  Info,
  Package,
  CircleDollarSign,
  Columns
} from "lucide-react";
import Link from "next/link";
import { clsx } from "clsx";

export default function StockValueReport() {
  const [activeTab, setActiveTab] = useState("Reports & More");
  const [hideZeroStock, setHideZeroStock] = useState(true);

  const headers = [
    "Item Name", "SKU", "HSN", "Unit", "Stock in Hand", 
    "Unit Cost", "Stock Value", "Share of Total Value(%)"
  ];

  return (
    <div className="min-h-full bg-[#FAF9FA]/50 dark:bg-[#020617] rounded-3xl overflow-hidden border border-orange-100 dark:border-white/5 shadow-sm font-sans">
      
      <div className="p-8 space-y-6">

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


        {/* Filter Section */}
        <div className="bg-[#FAF9FA] dark:bg-slate-800/30 border border-[#F0EAF0] dark:border-slate-800 rounded-2xl p-6 space-y-4">
           <h3 className="text-[12px] font-black text-[#1A1A1A] dark:text-white uppercase tracking-wider">Filters</h3>
           <div className="flex items-center gap-2">
              <input 
                type="checkbox" 
                id="hideZero"
                checked={hideZeroStock}
                onChange={() => setHideZeroStock(!hideZeroStock)}
                className="w-4 h-4 accent-[#7C3AED] rounded"
              />
              <label htmlFor="hideZero" className="text-[13px] font-medium text-[#444] dark:text-slate-300">Hide Zero - stock Products</label>
           </div>
        </div>

        {/* Summary Cards */}
        <div className="bg-[#FAF9FA] dark:bg-slate-800/30 border border-[#F0EAF0] dark:border-slate-800 rounded-2xl p-6 space-y-4">
           <h3 className="text-[12px] font-black text-[#1A1A1A] dark:text-white uppercase tracking-wider">Summary</h3>
           <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="flex items-center gap-4">
                 <div className="w-12 h-12 bg-blue-50 dark:bg-blue-900/20 rounded-full flex items-center justify-center text-blue-500">
                    <Package size={24} />
                 </div>
                 <div>
                    <div className="flex items-center gap-1.5 text-[12px] font-bold text-[#666]">
                       No. of items <Info size={14} className="opacity-40" />
                    </div>
                    <p className="text-xl font-black text-[#1A1A1A] dark:text-white">0</p>
                 </div>
              </div>
              <div className="flex items-center gap-4">
                 <div className="w-12 h-12 bg-blue-50 dark:bg-blue-900/20 rounded-full flex items-center justify-center text-blue-500">
                    <CircleDollarSign size={24} />
                 </div>
                 <div>
                    <div className="flex items-center gap-1.5 text-[12px] font-bold text-[#666]">
                       Total Stock Value <Info size={14} className="opacity-40" />
                    </div>
                    <p className="text-xl font-black text-[#1A1A1A] dark:text-white">₹0</p>
                 </div>
              </div>
           </div>
        </div>

        {/* Action Header */}
        <div className="flex items-center justify-between">
           <span className="text-[12px] font-bold text-[#666]">No Item Found</span>
           <div className="flex items-center gap-3">
              <button className="flex items-center gap-2 px-4 py-2 border border-[#F0EAF0] dark:border-slate-800 rounded-lg text-[12px] font-bold text-[#666] hover:bg-slate-50 transition-colors bg-white dark:bg-slate-900 shadow-sm">
                 <Download size={14} />
                 Download CSV
              </button>
              <button className="flex items-center gap-2 px-3 py-1.5 border border-[#F0EAF0] dark:border-slate-800 rounded-md text-[11px] font-bold text-[#666] hover:bg-slate-50 transition-colors bg-white dark:bg-slate-900 shadow-sm">
                 <Columns size={14} />
                 Show/Hide Columns
              </button>
           </div>
        </div>

        {/* Valuation Table */}
        <div className="bg-white dark:bg-slate-900 border border-[#F0EAF0] dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto min-h-[400px]">
            <table className="w-full text-left border-collapse min-w-[1200px]">
              <thead>
                <tr className="bg-[#FAF9FA] dark:bg-slate-800/50 border-b border-[#F0EAF0] dark:border-slate-800">
                  <th className="p-4 w-10 sticky left-0 bg-[#FAF9FA] dark:bg-slate-800 z-10">
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
                   <td colSpan={9} className="py-32">
                      <div className="flex flex-col items-center justify-center space-y-6">
                        <div className="w-20 h-20 rounded-full bg-slate-50 dark:bg-slate-800 flex items-center justify-center opacity-30">
                           <Package size={40} className="text-slate-400" />
                        </div>
                        <p className="text-[12px] font-black uppercase tracking-widest text-[#999]">No Data</p>
                      </div>
                   </td>
                </tr>
              </tbody>
            </table>
          </div>
          
          <div className="p-4 bg-[#FAF9FA] dark:bg-slate-800/50 border-t border-[#F0EAF0] dark:border-slate-800 text-[12px] font-bold text-[#666]">
             <span>No Item Found</span>
          </div>
        </div>
      </div>
    </div>
  );
}
