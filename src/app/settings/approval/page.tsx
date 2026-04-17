"use client";

import SettingsLayout from "@/components/modules/settings/SettingsLayout";
import { ChevronDown, ChevronUp } from "lucide-react";
import { useState } from "react";
import { clsx } from "clsx";

export default function ApprovalSettingsPage() {
  const [isExpanded, setIsExpanded] = useState(true);

  const approvalItems = [
    { type: "Vendor Leads", enabled: false },
    { type: "Expenditures", enabled: false },
    { type: "Quotations", enabled: false },
    { type: "Invoices", enabled: false },
    { type: "Purchase Order", enabled: false },
    { type: "Proforma Invoice", enabled: false },
  ];

  return (
    <SettingsLayout>
      <div className="space-y-6">
        <h2 className="text-[17px] font-black text-[#1A1A1A] dark:text-white mb-6">Approval Workflow Settings</h2>

        <div className="border-b border-[#F0EAF0] dark:border-slate-800 last:border-0 pb-4">
           <button 
             onClick={() => setIsExpanded(!isExpanded)}
             className="w-full flex items-center justify-between py-4 group"
           >
             <div className="flex items-center gap-3">
                {isExpanded ? <ChevronUp size={18} className="text-[#1A1A1A] dark:text-white" /> : <ChevronDown size={18} className="text-[#999]" />}
                <h3 className={clsx(
                  "text-[15px] font-black transition-colors",
                  isExpanded ? "text-[#1A1A1A] dark:text-white" : "text-[#666] dark:text-slate-400 group-hover:text-[#1A1A1A] dark:hover:text-white"
                )}>Document Approval Configurations</h3>
             </div>
           </button>

           {isExpanded && (
             <div className="pb-8 space-y-6 pt-2">
                <div className="space-y-1">
                   <p className="text-[14px] font-black text-[#1A1A1A] dark:text-white tracking-tight">Automate your Document Approvals</p>
                   <p className="text-[12px] font-medium text-[#999]">Configure if new documents should be added for Approvals automatically</p>
                </div>

                <div className="bg-white dark:bg-slate-900 border border-[#FDFCFD] dark:border-slate-800 rounded-xl overflow-hidden mt-6">
                   <table className="w-full text-left">
                     <thead>
                       <tr className="bg-[#FAF9FA] dark:bg-slate-800/30 text-[11px] text-[#999] uppercase font-bold">
                         <th className="p-4 flex-1">Document Type</th>
                         <th className="p-4 text-right w-32">Enable Auto-Add</th>
                       </tr>
                     </thead>
                     <tbody className="text-[13px] font-bold text-[#444] dark:text-slate-200">
                       {approvalItems.map((item, i) => (
                         <tr key={i} className="border-b border-[#FAF9FA] dark:border-slate-800 last:border-0 hover:bg-slate-50/50 transition-colors">
                           <td className="p-4">{item.type}</td>
                           <td className="p-4 text-right">
                              <div className="flex justify-end">
                                 <div className="w-9 h-4 bg-slate-200 dark:bg-slate-700 rounded-full relative cursor-pointer group">
                                    <div className="absolute left-0.5 top-0.5 w-3 h-3 bg-white rounded-full shadow-sm" />
                                 </div>
                              </div>
                           </td>
                         </tr>
                       ))}
                     </tbody>
                   </table>
                </div>
             </div>
           )}
        </div>
      </div>
    </SettingsLayout>
  );
}
