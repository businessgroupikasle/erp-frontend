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

export default function WarehouseDashboard() {
  const [activeTab, setActiveTab] = useState("Warehouses");

  const headers = [
    "SKU", "Item Name", "Item Type", "Tracking Method", 
    "Total Stock", "Stock in Hand", "Stock Status", 
    "Reorder Point", "Overstock Point"
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
            <span className="text-[#666]">Warehouses</span>
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

        {/* Section Title & Search */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pt-4">
          <h2 className="text-lg font-black text-[#1A1A1A] dark:text-white">Inventory Items in Warehouses</h2>
          
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
                <ChevronRight size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-[#999]" />
             </div>
          </div>
        </div>

        {/* Warehouse Item Table */}
        <div className="bg-white dark:bg-slate-900 border border-[#F0EAF0] dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm">
          <div className="flex items-center justify-between p-4 border-b border-[#F0EAF0] dark:border-slate-800 bg-[#FAF9FA] dark:bg-slate-800/50">
             <span className="text-[12px] font-bold text-[#666]">No item Found</span>
             <button className="flex items-center gap-2 px-3 py-1.5 border border-[#F0EAF0] dark:border-slate-800 rounded-md text-[11px] font-bold text-[#666] hover:bg-slate-50 transition-colors">
                <Columns size={14} />
                Show/Hide Columns
             </button>
          </div>

          <div className="overflow-x-auto min-h-[400px]">
            <table className="w-full text-left border-collapse min-w-[1500px]">
              <thead>
                <tr className="bg-white dark:bg-slate-900 border-b border-[#F0EAF0] dark:border-slate-800">
                  <th className="p-4 w-10 sticky left-0 bg-white dark:bg-slate-900 z-10">
                     <div className="w-4 h-4 rounded border border-[#DDD] dark:border-slate-600" />
                  </th>
                  {headers.map((head) => (
                    <th key={head} className="p-4 text-[11px] font-bold text-[#999] dark:text-slate-500 uppercase tracking-wider">
                      <div className="flex items-center gap-2 italic">
                        {head} <ChevronDown size={10} className="inline opacity-40 ml-1" />
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                <tr>
                   <td colSpan={10} className="py-40">
                      <div className="flex flex-col items-center justify-center space-y-4">
                        <div className="w-20 h-20 rounded-full bg-slate-50 dark:bg-slate-800 flex items-center justify-center opacity-30">
                           <div className="w-10 h-8 bg-slate-400 rounded-md" />
                        </div>
                        <p className="text-[12px] font-black uppercase tracking-widest text-[#999]">No Data</p>
                      </div>
                   </td>
                </tr>
              </tbody>
            </table>
          </div>
          
          <div className="p-4 bg-[#FAF9FA] dark:bg-slate-800/50 border-t border-[#F0EAF0] dark:border-slate-800 text-[12px] font-bold text-[#666]">
             <span>No item Found</span>
          </div>
        </div>
      </div>
    </div>
  );
}
