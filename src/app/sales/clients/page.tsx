"use client";

import { useState } from "react";
import { 
  ChevronRight, 
  Plus, 
  Download, 
  Search, 
  Settings2,
  ChevronDown,
  Layout
} from "lucide-react";
import Link from "next/link";
import { clsx } from "clsx";

export default function ClientsPage() {
  const [activeTab, setActiveTab] = useState("Active Clients");

  return (
    <div className="min-h-screen bg-[#FDFCFD] dark:bg-[#020617] -m-8">
      <div className="p-10 space-y-6">
        {/* Breadcrumbs & Header */}
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <nav className="flex items-center gap-2 text-[10px] font-bold text-[#999] uppercase tracking-[0.2em]">
              <Link href="/" className="hover:text-[#7C3AED]">Azeez</Link>
              <ChevronRight size={10} />
              <span className="text-[#1A1A1A] dark:text-white">Your Clients</span>
            </nav>
            <h1 className="text-2xl font-black text-[#1A1A1A] dark:text-white">Your Clients</h1>
          </div>
          
          <div className="flex items-center gap-2">
            <Link 
              href="/sales/clients/new"
              className="px-6 py-2.5 bg-[#E91E63] text-white rounded-lg font-bold text-sm shadow-lg shadow-pink-200 hover:shadow-pink-300 transition-all active:scale-95 flex items-center gap-2"
            >
              <Plus size={18} /> Add Client
            </Link>
            <button className="p-2.5 bg-[#E91E63] text-white rounded-lg hover:bg-[#d81b60] transition-colors">
              <ChevronDown size={18} />
            </button>
          </div>
        </div>

        {/* Tab View */}
        <div className="border-b border-[#F0EAF0] dark:border-slate-800">
           <div className="flex items-center gap-8">
              {["All Clients", "Reports & More"].map(tab => (
                 <button 
                  key={tab}
                  className={clsx(
                    "pb-3 text-xs font-bold uppercase tracking-widest transition-all relative",
                    tab === "All Clients" ? "text-[#7C3AED]" : "text-[#999] hover:text-[#666]"
                  )}
                 >
                    {tab === "All Clients" && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-[#7C3AED]" />}
                    {tab} {tab === "Reports & More" && " >"}
                 </button>
              ))}
           </div>
        </div>

        {/* Table Controls */}
        <div className="bg-white dark:bg-slate-900 border border-[#F0EAF0] dark:border-slate-800 rounded-2xl p-6 space-y-6">
           <div className="flex items-center justify-between border-b border-[#F0EAF0] dark:border-slate-800 pb-4">
              <div className="flex items-center gap-6">
                 {["Active Clients", "Archived Clients"].map(subTab => (
                    <button 
                      key={subTab}
                      onClick={() => setActiveTab(subTab)}
                      className={clsx(
                        "text-[11px] font-bold uppercase tracking-widest transition-all",
                        activeTab === subTab ? "text-[#1A1A1A] dark:text-white underline underline-offset-8 decoration-2 decoration-[#7C3AED]" : "text-[#999] hover:text-[#666]"
                      )}
                    >
                       {subTab}
                    </button>
                 ))}
              </div>

              <div className="flex items-center gap-3">
                 <button className="flex items-center gap-2 px-4 py-2 border border-[#F0EAF0] dark:border-slate-800 rounded-lg text-xs font-bold text-[#666] hover:bg-slate-50 transition-all">
                    <Download size={14} /> Download CSV
                 </button>
                 <div className="relative">
                    <input 
                      type="text" 
                      placeholder="Search Clients" 
                      className="pl-4 pr-10 py-2 border border-[#F0EAF0] dark:border-slate-800 rounded-lg text-xs font-bold outline-none focus:border-[#7C3AED] min-w-[200px]"
                    />
                    <ChevronRight size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#999]" />
                 </div>
              </div>
           </div>

           {/* Table */}
           <div className="space-y-4">
              <div className="flex items-center justify-between text-[10px] font-black text-[#999] uppercase tracking-widest border-b border-[#F0EAF0] pb-4 px-4 overflow-x-auto gap-12 whitespace-nowrap">
                 <div className="flex items-center gap-4 min-w-[40px]"><input type="checkbox" className="rounded" /></div>
                 <div className="min-w-[100px]">Logo</div>
                 <div className="min-w-[150px] flex items-center gap-1">Name <ChevronDown size={10} /></div>
                 <div className="min-w-[180px] flex items-center gap-1">Select Clients/Prospects <ChevronDown size={10} /></div>
                 <div className="min-w-[150px] flex items-center gap-1">Industry <ChevronDown size={10} /></div>
                 <div className="min-w-[150px]">Added to Portfolio</div>
                 <div className="min-w-[120px] flex items-center gap-1">Phone <ChevronDown size={10} /></div>
                 <div className="min-w-[180px] flex items-center gap-1">Email <ChevronDown size={10} /></div>
                 <div className="min-w-[120px] flex items-center gap-1">Country <ChevronDown size={10} /></div>
                 <div className="min-w-[100px] flex items-center gap-1">Status <ChevronDown size={10} /></div>
                 <div className="min-w-[200px] flex items-center gap-1 text-slate-400">Last Communication Date <span>↑↓</span> <ChevronDown size={10} /></div>
              </div>

              {/* No Data State */}
              <div className="py-32 flex flex-col items-center justify-center space-y-6">
                 <div className="w-24 h-24 rounded-full bg-purple-50 dark:bg-slate-800 flex items-center justify-center">
                    <Layout size={40} className="text-purple-200 dark:text-slate-700" />
                 </div>
                 <h3 className="text-lg font-black text-[#1A1A1A] dark:text-white uppercase tracking-tight">No Data</h3>
              </div>
           </div>

           {/* Show/Hide Columns Footer */}
           <div className="flex justify-end pt-6">
              <button className="flex items-center gap-2 px-4 py-2 border border-[#F0EAF0] dark:border-slate-800 rounded-lg text-[10px] font-black text-[#666] uppercase tracking-widest hover:bg-slate-50">
                 <Settings2 size={14} /> Show/Hide Columns
              </button>
           </div>
        </div>
      </div>
    </div>
  );
}
