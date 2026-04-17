"use client";

import { useState } from "react";
import { 
  Plus, 
  ChevronRight, 
  ChevronDown,
  Calendar,
  X,
  RotateCcw
} from "lucide-react";
import Link from "next/link";
import { clsx } from "clsx";

export default function CRMLeadSummary() {
  const [activeTab, setActiveTab] = useState("All Leads");

  const summaryCards = [
    { label: "New Leads", count: 0 },
    { label: "Scheduled Leads", count: 0 },
    { label: "Overdue Leads", count: 0, red: true },
    { label: "Leads Closed", count: 0 },
  ];

  const pipelineSummary = [
    { label: "Open", count: 0 },
    { label: "Contacted", count: 0 },
    { label: "Proposal Sent", count: 0 },
    { label: "Deal Done", count: 0 },
    { label: "Lost", count: 0 },
    { label: "Not Serviceable", count: 0 },
  ];

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
            <span className="text-[#666]">Summary</span>
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
        <h2 className="text-lg font-black text-[#1A1A1A] dark:text-white">Summary</h2>

        {/* Top Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
           {summaryCards.map((card) => (
             <div key={card.label} className="bg-white dark:bg-slate-900 border border-[#F0EAF0] dark:border-slate-800 rounded-xl p-8 text-center space-y-2 shadow-sm">
                <p className="text-3xl font-black text-[#1A1A1A] dark:text-white tabular-nums">{card.count}</p>
                <p className={clsx("text-[11px] font-bold uppercase tracking-widest", card.red ? "text-[#D81159]" : "text-[#777]")}>
                   {card.label}
                </p>
             </div>
           ))}
        </div>

        {/* Advanced Filters */}
        <div className="bg-[#FAF9FA] dark:bg-slate-900/50 border border-[#F0EAF0] dark:border-slate-800 rounded-2xl p-8 space-y-8">
           <h3 className="text-sm font-black text-[#1A1A1A] dark:text-white uppercase tracking-widest">Filters</h3>
           
           <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* Row 1 */}
              <div className="space-y-6">
                 <div className="space-y-2">
                    <label className="text-[11px] font-bold text-[#333] dark:text-white uppercase tracking-wider">Sales Pipeline</label>
                    <select className="w-full px-4 py-2.5 bg-white dark:bg-slate-800 border border-[#F0EAF0] dark:border-slate-800 rounded-lg text-[13px] font-medium outline-none">
                       <option>Sales Pipeline</option>
                    </select>
                 </div>
                 <div className="space-y-2">
                    <label className="text-[11px] font-bold text-[#333] dark:text-white uppercase tracking-wider">Lead created date</label>
                    <div className="relative">
                       <input type="text" defaultValue="Apr 12, 2026 - Apr 17, 2026" className="w-full pl-4 pr-10 py-2.5 bg-white dark:bg-slate-800 border border-[#F0EAF0] dark:border-slate-800 rounded-lg text-[13px] font-medium" />
                       <Calendar size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-[#999]" />
                    </div>
                 </div>
              </div>

              {/* Row 2 */}
              <div className="space-y-6">
                 <div className="space-y-2">
                    <label className="text-[11px] font-bold text-[#333] dark:text-white uppercase tracking-wider">Lead Source</label>
                    <select className="w-full px-4 py-2.5 bg-white dark:bg-slate-800 border border-[#F0EAF0] dark:border-slate-800 rounded-lg text-[13px] font-medium outline-none">
                       <option>Select</option>
                    </select>
                 </div>
                 <div className="space-y-2">
                    <label className="text-[11px] font-bold text-[#333] dark:text-white uppercase tracking-wider">Lead updated date</label>
                    <div className="relative">
                       <input type="text" placeholder="Start Date - End date" className="w-full pl-4 pr-10 py-2.5 bg-white dark:bg-slate-800 border border-[#F0EAF0] dark:border-slate-800 rounded-lg text-[13px] font-medium" />
                       <Calendar size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-[#999]" />
                    </div>
                 </div>
              </div>

              {/* Row 3 */}
              <div className="space-y-6">
                 <div className="space-y-2">
                    <label className="text-[11px] font-bold text-[#333] dark:text-white uppercase tracking-wider">Assigned To</label>
                    <div className="relative group">
                       <div className="w-full px-4 py-1.5 bg-white dark:bg-slate-800 border border-[#F0EAF0] dark:border-slate-800 rounded-lg text-[13px] font-medium flex items-center flex-wrap gap-2">
                          <span className="px-2 py-0.5 bg-slate-100 dark:bg-slate-700 rounded text-[11px] flex items-center gap-1">
                             🏢 Ikasle Business Group <X size={10} className="cursor-pointer" />
                          </span>
                       </div>
                       <X size={14} className="absolute right-4 top-1/2 -translate-y-1/2 text-[#999] cursor-pointer" />
                    </div>
                 </div>
                 <div className="space-y-2">
                    <label className="text-[11px] font-bold text-[#333] dark:text-white uppercase tracking-wider">Lead closed date</label>
                    <div className="relative">
                       <input type="text" placeholder="Start Date - End date" className="w-full pl-4 pr-10 py-2.5 bg-white dark:bg-slate-800 border border-[#F0EAF0] dark:border-slate-800 rounded-lg text-[13px] font-medium" />
                       <Calendar size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-[#999]" />
                    </div>
                 </div>
              </div>
           </div>

           <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-4">
              <div className="space-y-2">
                 <label className="text-[11px] font-bold text-[#333] dark:text-white uppercase tracking-wider">Current Lead Stages</label>
                 <select className="w-full px-4 py-2.5 bg-white dark:bg-slate-800 border border-[#F0EAF0] dark:border-slate-800 rounded-lg text-[13px] font-medium outline-none">
                    <option>Select</option>
                 </select>
              </div>
              <div className="space-y-2">
                 <label className="text-[11px] font-bold text-[#333] dark:text-white uppercase tracking-wider">Labels</label>
                 <select className="w-full px-4 py-2.5 bg-white dark:bg-slate-800 border border-[#F0EAF0] dark:border-slate-800 rounded-lg text-[13px] font-medium outline-none">
                    <option>Select</option>
                 </select>
              </div>
           </div>
        </div>

        {/* Applied Filters Summary */}
        <div className="bg-[#FAF9FA] dark:bg-slate-900/50 p-6 rounded-xl border border-[#F0EAF0] dark:border-slate-800 space-y-4">
           <div className="flex items-center justify-between">
              <p className="text-[11px] font-bold text-[#999] uppercase tracking-widest">Applied Filters</p>
              <button className="text-[11px] font-bold text-[#999] hover:text-[#D81159] flex items-center gap-1 transition-colors">
                 Reset all filters
              </button>
           </div>
           <div className="flex items-center flex-wrap gap-2">
              <div className="flex items-center gap-2 px-3 py-1 bg-white dark:bg-slate-800 border border-[#F0EAF0] dark:border-slate-800 rounded-full">
                 <X size={12} className="text-[#D81159]" />
                 <span className="text-[11px] font-medium text-[#666] dark:text-slate-400">Pipeline: <span className="font-bold">Sales Pipeline</span></span>
              </div>
              <div className="flex items-center gap-2 px-3 py-1 bg-white dark:bg-slate-800 border border-[#F0EAF0] dark:border-slate-800 rounded-full">
                 <X size={12} className="text-[#D81159]" />
                 <span className="text-[11px] font-medium text-[#666] dark:text-slate-400">Assignee: <span className="font-bold">Ikasle Business Group</span></span>
              </div>
              <div className="flex items-center gap-2 px-3 py-1 bg-white dark:bg-slate-800 border border-[#F0EAF0] dark:border-slate-800 rounded-full">
                 <X size={12} className="text-[#D81159]" />
                 <span className="text-[11px] font-medium text-[#666] dark:text-slate-400">Created At: <span className="font-bold">Apr 12, 2026 - Apr 17, 2026</span></span>
              </div>
           </div>
        </div>

        {/* Graph Section */}
        <div className="bg-white dark:bg-slate-900 border border-[#F0EAF0] dark:border-slate-800 rounded-2xl p-8 space-y-12">
           <h3 className="text-sm font-black text-[#1A1A1A] dark:text-white uppercase tracking-widest">Graph</h3>
           
           <div className="relative h-80 w-full border-l-2 border-b-2 border-[#F0EAF0] dark:border-slate-800 ml-4">
              {/* Grid Lines */}
              {[4, 3, 2, 1, 0].map((v) => (
                <div key={v} className="absolute left-0 right-0 border-t border-dashed border-[#F0EAF0] dark:border-slate-800" style={{ bottom: `${v * 25}%` }}>
                   <span className="absolute -left-6 top-1/2 -translate-y-1/2 text-[10px] font-bold text-[#999]">{v}</span>
                </div>
              ))}
              
              {/* X Axis Labels */}
              <div className="absolute left-0 right-0 -bottom-8 flex justify-between px-10">
                 {["Open", "Contacted", "Proposal Sent", "Deal Done", "Lost", "Not Serviceable"].map((label) => (
                   <span key={label} className="text-[10px] font-bold text-[#999]">{label}</span>
                 ))}
              </div>

              {/* Data Visualization Placeholder */}
              <div className="absolute inset-0 flex items-center justify-center opacity-20">
                 <div className="w-full h-0.5 bg-blue-400 relative">
                    <div className="absolute inset-0 flex justify-between px-10">
                       {[1, 2, 3, 4, 5, 6].map((i) => <div key={i} className="w-2 h-2 rounded-full bg-blue-500 -mt-[3px]" />)}
                    </div>
                 </div>
              </div>
           </div>

           <div className="flex items-center justify-center gap-8">
              <div className="flex items-center gap-2">
                 <div className="w-3 h-3 bg-orange-400 rounded-sm" />
                 <span className="text-[11px] font-bold text-[#666]">Weighted Value</span>
              </div>
              <div className="flex items-center gap-2">
                 <div className="w-3 h-3 bg-purple-600 rounded-sm" />
                 <span className="text-[11px] font-bold text-[#666]">Total Value</span>
              </div>
              <div className="flex items-center gap-2">
                 <div className="w-4 h-0.5 bg-blue-400 relative"><div className="w-1.5 h-1.5 rounded-full bg-blue-500 absolute left-1/2 -translate-x-1/2 -translate-y-1/2" /></div>
                 <span className="text-[11px] font-bold text-[#666]">Lead Count</span>
              </div>
           </div>
        </div>

        {/* Pipeline Summary Section */}
        <div className="space-y-6">
           <h3 className="text-sm font-black text-[#1A1A1A] dark:text-white uppercase tracking-widest">Sales Pipeline Summary</h3>
           
           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {pipelineSummary.map((stage) => (
                <div key={stage.label} className="bg-white dark:bg-slate-900 border border-[#F0EAF0] dark:border-slate-800 rounded-xl p-8 space-y-6 shadow-sm">
                   <p className="text-[11px] font-bold text-[#999] text-center uppercase tracking-widest">{stage.label}</p>
                   <div className="text-center space-y-1">
                      <p className="text-2xl font-black text-[#1A1A1A] dark:text-white tabular-nums">{stage.count}</p>
                      <p className="text-[11px] font-bold text-[#999] uppercase tracking-widest">Leads</p>
                   </div>
                   <div className="space-y-2 pt-4 border-t border-dashed border-[#F0EAF0] dark:border-slate-800">
                      <p className="text-[10px] font-bold text-[#777] flex justify-between">Total Value: <span>₹0</span></p>
                      <p className="text-[10px] font-bold text-[#777] flex justify-between">Weighted Value: <span>₹0</span></p>
                   </div>
                </div>
              ))}
           </div>
        </div>
      </div>
    </div>
  );
}
