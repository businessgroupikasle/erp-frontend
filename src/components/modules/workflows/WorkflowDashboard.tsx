/* Refactored Workflow Dashboard Component */
// File: src/components/modules/workflows/WorkflowDashboard.tsx
"use client";

import { useState } from "react";
import { 
  ChevronRight, 
  Plus,
  ArrowRight
} from "lucide-react";
import Link from "next/link";
import { clsx } from "clsx";

interface WorkflowDashboardProps {
  initialTab?: string;
  breadcrumbContext?: string;
}

export default function WorkflowDashboard({ 
  initialTab = "All Workflows",
  breadcrumbContext = "Workflows Management" 
}: WorkflowDashboardProps) {
  const [activeTab, setActiveTab] = useState(initialTab);

  const tabs = [
    "All Workflows", "Vendor Leads Workflows", "Expenditure Workflows", 
    "Invoice Workflows", "Quotation Workflows", "Purchase Order Workflows", 
    "Proforma Invoice Workflows"
  ];

  const getDocType = () => {
    if (activeTab === "All Workflows") return "Document";
    return activeTab.replace(" Workflows", "");
  };

  const currentBreadcrumb = activeTab === "All Workflows" ? breadcrumbContext : `${activeTab} Management`;

  return (
    <div className="min-h-screen bg-[#FDFCFD] dark:bg-[#020617] -m-8 font-sans">
      <div className="p-8 space-y-6">
        {/* Breadcrumbs & Header */}
        <div className="flex items-center justify-between">
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-[10px] font-bold text-[#999] uppercase tracking-widest transition-all">
              <Link href="/" className="hover:text-[#7C3AED]">Dashboard</Link>
              <ChevronRight size={10} />
              <span className="text-[#666]">{currentBreadcrumb}</span>
              <ChevronRight size={10} />
            </div>
            <h1 className="text-2xl font-black text-[#1A1A1A] dark:text-white flex items-center gap-2">
               Workflows Management {activeTab !== "All Workflows" && <span className="text-sm">✨</span>}
            </h1>
          </div>
          <button className="px-6 py-2.5 bg-[#D81159] hover:bg-[#B00E4A] text-white rounded-lg font-bold text-[13px] flex items-center gap-2 transition-all active:scale-95 shadow-lg shadow-pink-200/50">
             <Plus size={18} /> Create New
          </button>
        </div>

        {/* Tab System */}
        <div className="flex items-center gap-6 border-b border-[#F0EAF0] dark:border-slate-800 pb-px overflow-x-auto scrollbar-hide">
          {tabs.map((tab) => (
            <button
               key={tab}
               onClick={() => setActiveTab(tab)}
               className={clsx(
                 "pb-3 text-[13px] font-bold transition-all relative whitespace-nowrap",
                 activeTab === tab 
                  ? "text-[#7C3AED]" 
                  : "text-[#666] dark:text-slate-500 hover:text-[#1A1A1A] dark:hover:text-white"
               )}
            >
              {tab}
              {activeTab === tab && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#7C3AED]" />
              )}
            </button>
          ))}
        </div>

        {/* Promo Landing State */}
        <div className="flex items-center justify-center pt-20">
           <div className="max-w-md w-full bg-white dark:bg-slate-900 rounded-2xl border border-[#F0EAF0] dark:border-slate-800 shadow-xl p-10 flex flex-col items-center text-center space-y-6">
              <h2 className="text-xl font-black text-[#1A1A1A] dark:text-white">
                 Automate Approvals for your <br/> {getDocType()}
              </h2>
              <p className="text-[13px] font-medium text-[#666] dark:text-slate-400 leading-relaxed px-4">
                 Create customised multi-stage workflows to set up your Approval process for Quotations, Vendors, Reimbursements and more.
              </p>
              
              <div className="w-full h-48 bg-purple-50 dark:bg-slate-800 rounded-xl border border-purple-100 dark:border-slate-700 overflow-hidden relative group">
                 <div className="absolute inset-0 bg-gradient-to-br from-purple-100/50 to-transparent" />
                 <div className="absolute top-4 left-4 right-4 h-full bg-white dark:bg-slate-900 rounded-t-lg shadow-2xl p-4 border border-[#F0EAF0] dark:border-slate-800">
                    <div className="flex items-center gap-2 border-b pb-2 mb-2">
                       <span className="w-2 h-2 rounded-full bg-red-400" />
                       <span className="w-2 h-2 rounded-full bg-yellow-400" />
                       <span className="w-2 h-2 rounded-full bg-green-400" />
                       <div className="h-1.5 w-16 bg-slate-100 rounded ml-2" />
                    </div>
                    <div className="space-y-2">
                       <div className="h-2 bg-slate-50 rounded w-1/2" />
                       <div className="h-8 bg-purple-50 rounded" />
                       <div className="grid grid-cols-2 gap-2">
                          <div className="h-10 bg-slate-50 rounded" />
                          <div className="h-10 bg-slate-50 rounded" />
                       </div>
                    </div>
                 </div>
              </div>

              <div className="w-full pt-4 space-y-4 px-4">
                 <button className="w-full py-4 bg-[#7C3AED] hover:bg-[#6D28D9] text-white rounded-xl font-black text-sm shadow-xl shadow-purple-200/50 transition-all active:scale-95 uppercase tracking-wider">
                    Create Workflow
                 </button>
                 <Link href="#" className="flex items-center justify-center gap-2 text-[12px] font-black text-[#666] dark:text-slate-400 hover:text-[#7C3AED] transition-colors uppercase tracking-widest">
                    Learn More <ArrowRight size={14} />
                 </Link>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
}
