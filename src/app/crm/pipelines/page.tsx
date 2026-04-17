"use client";

import { useState } from "react";
import { 
  Plus, 
  ChevronRight, 
  ChevronDown,
  MoreVertical,
  Edit2,
  Eye
} from "lucide-react";
import Link from "next/link";
import { clsx } from "clsx";

export default function CRMPipelinesPage() {
  const [activeTab, setActiveTab] = useState("All Sales Pipelines");

  const pipelines = [
    {
      id: 1,
      name: "Sales Pipeline",
      description: "This is a sample description of your Sales Pipeline - A way to track your potential leads as they progress through different statuses.",
      stages: [
        { label: "Open", count: 0 },
        { label: "Contacted", count: 0 },
        { label: "Proposal Sent", count: 0 },
        { label: "Deal Done", count: 0 },
        { label: "Lost", count: 0 },
        { label: "Not Serviceable", count: 0 },
      ]
    }
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
            <span className="text-[#666]">All Sales Pipelines</span>
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

        {/* Pipelines Grid */}
        <div className="grid grid-cols-1 gap-6">
           {pipelines.map((pipeline) => (
             <div key={pipeline.id} className="bg-white dark:bg-slate-900 border border-[#F0EAF0] dark:border-slate-800 rounded-2xl shadow-sm overflow-hidden animate-in slide-in-from-bottom-4 duration-500">
                <div className="p-6 space-y-6">
                   <div className="flex items-start justify-between">
                      <div className="space-y-4">
                         <h3 className="text-base font-black text-[#1A1A1A] dark:text-white">{pipeline.name}</h3>
                         <p className="max-w-2xl text-[12px] leading-relaxed text-[#666] dark:text-slate-400 font-medium">
                            {pipeline.description}
                         </p>
                      </div>
                      
                      <div className="flex items-center gap-3">
                         <button className="flex items-center gap-2 px-3 py-1.5 border border-[#F0EAF0] dark:border-slate-800 rounded-md text-[11px] font-bold text-[#333] dark:text-white hover:bg-slate-50 transition-colors">
                            <Eye size={14} />
                            View Leads
                         </button>
                         <button className="flex items-center gap-2 px-3 py-1.5 border border-[#F0EAF0] dark:border-slate-800 rounded-md text-[11px] font-bold text-[#333] dark:text-white hover:bg-slate-50 transition-colors">
                            <Edit2 size={14} />
                            Edit Pipeline
                         </button>
                         <button className="p-1.5 border border-[#F0EAF0] dark:border-slate-800 rounded-md text-[#999] hover:bg-slate-50 transition-colors">
                            <MoreVertical size={14} />
                         </button>
                      </div>
                   </div>

                   <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-x-8 gap-y-4 pt-4 border-t border-[#F0EAF0] dark:border-slate-800/50">
                      {pipeline.stages.map((stage) => (
                        <div key={stage.label} className="space-y-1">
                           <p className="text-[10px] font-bold text-[#999] uppercase tracking-widest">{stage.label}</p>
                           <p className="text-lg font-black text-[#1A1A1A] dark:text-white tabular-nums">{stage.count}</p>
                        </div>
                      ))}
                   </div>
                </div>
             </div>
           ))}
        </div>
      </div>
    </div>
  );
}
