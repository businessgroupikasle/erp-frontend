"use client";

import { useState } from "react";
import { 
  Plus, 
  Download, 
  Columns, 
  Search, 
  ChevronRight, 
  MoreHorizontal,
  ChevronDown
} from "lucide-react";
import Link from "next/link";
import { clsx } from "clsx";

export default function VendorsPage() {
  const [activeTab, setActiveTab] = useState("All Vendors");
  const [subTab, setSubTab] = useState("Active Vendors");
  const [vendors] = useState([]);

  return (
    <div className="min-h-screen bg-[#FDFCFD] dark:bg-[#020617] -m-8 font-sans">
      <div className="p-8 space-y-6">
        {/* Breadcrumbs & Header */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-[10px] font-bold text-[#999] uppercase tracking-widest">
            <Link href="/" className="hover:text-[#7C3AED]">Azeez</Link>
            <ChevronRight size={10} />
            <span className="text-[#666]">Manage Vendors</span>
          </div>
          
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-black text-[#1A1A1A] dark:text-white">
              Manage Vendors
            </h1>
            
            <div className="flex items-center gap-3">
               <div className="flex items-center">
                  <button className="flex items-center gap-2 px-4 py-2 bg-[#D81159] hover:bg-[#B00E4A] text-white rounded-l-lg font-bold text-[13px] transition-all active:scale-95 shadow-lg shadow-pink-200/50">
                    <Plus size={16} />
                    Add Vendor
                  </button>
                  <button className="px-2 py-2 bg-[#D81159] hover:bg-[#B00E4A] text-white rounded-r-lg border-l border-white/20 transition-all active:scale-95 shadow-lg shadow-pink-200/50">
                    <ChevronDown size={16} />
                  </button>
               </div>
            </div>
          </div>
        </div>

        {/* Primary Tabs */}
        <div className="flex items-center gap-8 border-b border-[#F0EAF0] dark:border-slate-800">
          {["All Vendors", "Reports and More"].map((tab) => (
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
              {tab === "Reports and More" && <ChevronRight size={12} />}
              {activeTab === tab && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#7C3AED]" />
              )}
            </button>
          ))}
        </div>

        {/* Secondary Sub-tabs */}
        <div className="flex items-center gap-6">
           {["Active Vendors", "Archived Vendors"].map((tab) => (
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
        <div className="flex items-center justify-between pt-4">
           {/* Search Bar */}
           <div className="relative group w-80">
              <input 
                type="text" 
                placeholder="Search Vendors" 
                className="w-full pl-4 pr-10 py-2 bg-white dark:bg-slate-900 border border-[#F0EAF0] dark:border-slate-800 rounded-lg text-[13px] font-medium outline-none focus:border-[#7C3AED] transition-all"
              />
              <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-2 text-[#999]">
                 <Search size={14} />
                 <ArrowRight size={14} className="opacity-0 group-focus-within:opacity-100 transition-opacity" />
              </div>
           </div>

           <div className="flex items-center gap-3">
              <button className="flex items-center gap-2 px-3 py-1.5 border border-[#F0EAF0] dark:border-slate-800 rounded-md text-[11px] font-bold text-[#666] hover:bg-slate-50 transition-colors">
                <Download size={14} />
                Download CSV
              </button>
              <button className="flex items-center gap-2 px-3 py-1.5 border border-[#F0EAF0] dark:border-slate-800 rounded-md text-[11px] font-bold text-[#666] hover:bg-slate-50 transition-colors">
                <Columns size={14} />
                Show/Hide Columns
              </button>
           </div>
        </div>

        {/* Data Table / Empty State */}
        <div className="bg-white dark:bg-slate-900 border border-[#F0EAF0] dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#FAF9FA] dark:bg-slate-800/50 border-b border-[#F0EAF0] dark:border-slate-800">
                  <th className="p-4 w-10">
                     <div className="w-4 h-4 rounded border border-[#DDD] dark:border-slate-600" />
                  </th>
                  {[
                    "Logo", "Name", "Industry", "Phone", "Email", "Country", "Status", "Last Communication Date"
                  ].map((head) => (
                    <th key={head} className="p-4 text-[11px] font-bold text-[#666] dark:text-slate-400 uppercase tracking-wider">
                      <div className="flex items-center gap-2">
                        {head} {head !== "Logo" && <Search size={10} className="opacity-40" />}
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {vendors.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="py-32">
                      <div className="flex flex-col items-center justify-center space-y-6 animate-in fade-in zoom-in duration-500">
                        <div className="w-20 h-20 rounded-3xl bg-purple-50 dark:bg-slate-800 flex items-center justify-center">
                           <div className="w-10 h-6 bg-purple-200 dark:bg-slate-700 rounded-lg relative">
                              <div className="absolute -top-1 -right-1 w-3 h-3 bg-purple-400 rounded-full" />
                           </div>
                        </div>
                        <div className="text-center space-y-1">
                           <p className="text-sm font-bold text-[#1A1A1A] dark:text-white">No Data</p>
                           <p className="text-[11px] text-[#999]">No Vendor Found</p>
                        </div>
                        <button className="flex items-center gap-2 text-[11px] font-black text-[#7C3AED] uppercase tracking-widest hover:underline">
                           + Add First Vendor
                        </button>
                      </div>
                    </td>
                  </tr>
                ) : (
                  vendors.map((v, i) => (
                    <tr key={i} className="border-b border-[#F0EAF0] dark:border-slate-800 last:border-0 hover:bg-[#FDFCFD] dark:hover:bg-slate-900/50 transition-colors cursor-pointer group">
                       {/* Row data would go here */}
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          
          <div className="p-4 bg-[#FAF9FA] dark:bg-slate-800/50 flex items-center justify-between border-t border-[#F0EAF0] dark:border-slate-800">
             <span className="text-[11px] text-[#999] font-medium">No Vendor Found</span>
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

function ArrowRight({ size, className }: { size: number, className: string }) {
  return (
    <svg 
      width={size} 
      height={size} 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      className={className}
    >
      <path d="M5 12h14" />
      <path d="m12 5 7 7-7 7" />
    </svg>
  );
}
