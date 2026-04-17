"use client";

import { useState } from "react";
import SettingsLayout from "@/components/modules/settings/SettingsLayout";
import { ChevronDown, ChevronUp, AlertCircle, Zap } from "lucide-react";
import { clsx } from "clsx";

export default function AdvancedAccountingSettingsPage() {
  const [expandedSections, setExpandedSections] = useState<string[]>([
    "Sync Documents", "Reversal record configuration"
  ]);

  const toggleSection = (section: string) => {
    setExpandedSections(prev => 
      prev.includes(section) ? prev.filter(s => s !== section) : [...prev, section]
    );
  };

  const syncItems = [
    { id: 1, name: "Invoice", comingSoon: false },
    { id: 2, name: "Purchases and Expenses", comingSoon: false },
    { id: 3, name: "Credit Note", comingSoon: false },
    { id: 4, name: "Debit Note", comingSoon: false },
    { id: 5, name: "Payment Records (Invoices)", comingSoon: false },
    { id: 6, name: "Payment Records (Expenses)", comingSoon: false },
    { id: 7, name: "Payment Records (Debit Notes)", comingSoon: false },
    { id: 8, name: "Payment Receipt", comingSoon: true },
  ];

  const SectionHeader = ({ title, icon }: { title: string, icon?: boolean }) => {
    const isExpanded = expandedSections.includes(title);
    return (
      <button 
        onClick={() => toggleSection(title)}
        className="w-full flex items-center justify-between py-5 border-b border-[#F0EAF0] dark:border-slate-800 last:border-0 group"
      >
        <div className="flex items-center gap-3">
           {isExpanded ? <ChevronUp size={18} className="text-[#1A1A1A] dark:text-white" /> : <ChevronDown size={18} className="text-[#999]" />}
           <h3 className={clsx(
             "text-[15px] font-black transition-colors flex items-center gap-2",
             isExpanded ? "text-[#1A1A1A] dark:text-white" : "text-[#666] dark:text-slate-400 group-hover:text-[#1A1A1A] dark:hover:text-white"
           )}>
             {title} {icon && <Zap size={14} className="text-orange-400 fill-orange-400" />}
           </h3>
        </div>
      </button>
    );
  };

  return (
    <SettingsLayout>
      <div className="space-y-6">
        <h2 className="text-[17px] font-black text-[#1A1A1A] dark:text-white mb-6">Advanced Accounting</h2>

        {/* Financial Year Warning */}
        <div className="p-4 bg-[#FFF5F5] border border-[#FEE2E2] rounded-lg flex items-center gap-3 text-[#B91C1C] text-[12px] font-bold">
           <AlertCircle size={16} />
           <p>Please update Financial Year range for your business before syncing. <span className="text-[#7C3AED] underline cursor-pointer">Click here to update Financial Year details.</span></p>
        </div>

        <div className="space-y-10 pt-4">
           {/* Primary Toggles */}
           <div className="space-y-8 max-w-4xl">
              <div className="flex items-center justify-between">
                 <div className="space-y-1">
                    <p className="text-[13px] font-black text-[#1A1A1A] dark:text-white">Enable Advanced Accounting</p>
                    <p className="text-[11px] font-medium text-[#999]">Start recording your financial transactions with manual ledgers and voucher entries.</p>
                 </div>
                 <div className="w-10 h-5 bg-slate-200 dark:bg-slate-700 rounded-full relative cursor-pointer">
                    <div className="absolute left-0.5 top-0.5 w-4 h-4 bg-white rounded-full shadow-sm" />
                 </div>
              </div>

              <div className="flex items-center justify-between">
                 <div className="space-y-1">
                    <p className="text-[13px] font-black text-[#1A1A1A] dark:text-white">Create Ledgers for Prospects</p>
                    <p className="text-[11px] font-medium text-[#999]">Automatically create ledgers while adding a new prospects.</p>
                 </div>
                 <div className="w-10 h-5 bg-[#7C3AED] rounded-full relative cursor-pointer">
                    <div className="absolute right-0.5 top-0.5 w-4 h-4 bg-white rounded-full shadow-sm" />
                 </div>
              </div>
           </div>

           {/* Sync Documents Section */}
           <div>
              <SectionHeader title="Sync Documents" icon />
              {expandedSections.includes("Sync Documents") && (
                <div className="py-6 space-y-6 max-w-4xl">
                   <p className="text-[12px] font-medium text-[#666] dark:text-slate-400 leading-relaxed">
                      Automatically generate voucher entries and create respective ledgers as you continue to create invoices and other documents.
                   </p>

                   <div className="bg-white dark:bg-slate-900 border border-[#FDFCFD] dark:border-slate-800 rounded-xl overflow-hidden mt-6">
                      <table className="w-full text-left">
                        <tbody className="text-[13px] font-bold text-[#1A1A1A] dark:text-slate-200">
                          {/* Sync All Row */}
                          <tr className="border-b border-slate-50 dark:border-slate-800 bg-slate-50/30">
                             <td className="p-4">Sync all Documents (Recommended)</td>
                             <td className="p-4 text-right">
                                <div className="flex items-center justify-end gap-3">
                                   <span className="text-[11px] text-[#999] uppercase font-black">Sync All</span>
                                   <div className="w-4 h-4 rounded border-2 border-slate-200 bg-white" />
                                </div>
                             </td>
                          </tr>
                          {/* Individual Rows */}
                          {syncItems.map((item) => (
                            <tr key={item.id} className="border-b border-slate-50 dark:border-slate-800 last:border-0 hover:bg-slate-50/50 transition-colors">
                               <td className="p-4">
                                  {item.id}. {item.name} 
                                  {item.comingSoon && <span className="ml-3 px-2 py-0.5 bg-blue-50 text-blue-500 text-[9px] uppercase tracking-wider rounded font-black">Coming Soon</span>}
                               </td>
                               <td className="p-4 text-right">
                                  <div className="flex items-center justify-end gap-3">
                                     <span className="text-[11px] text-[#999] uppercase font-black">Sync</span>
                                     <div className="w-4 h-4 rounded border-2 border-slate-100 bg-white opacity-50" />
                                  </div>
                               </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                   </div>

                   <div className="p-5 bg-slate-50/50 border border-[#F6F4F6] rounded-xl text-center text-[#666] text-[12px] font-medium">
                      Syncing documents will take some time. We will notify you via email.
                   </div>

                   <div className="flex justify-start">
                      <button className="px-6 py-2.5 bg-[#E9D5FF] text-[#7C3AED] rounded-lg font-black text-[11px] uppercase tracking-widest hover:bg-[#D8B4FE] transition-all">
                         Sync Selected
                      </button>
                   </div>
                </div>
              )}
           </div>

           {/* Reversal record configuration */}
           <div>
              <SectionHeader title="Reversal record configuration" />
              {expandedSections.includes("Reversal record configuration") && (
                <div className="py-8 space-y-8 max-w-4xl">
                   <div className="flex items-center justify-between">
                      <div className="space-y-1">
                         <p className="text-[13px] font-black text-[#1A1A1A] dark:text-white">Show Reverse Entries in the voucher list</p>
                         <p className="text-[11px] font-medium text-[#999]">Enable to show Reversed entries in the voucher entry dashboard.</p>
                      </div>
                      <div className="w-10 h-5 bg-slate-200 dark:bg-slate-700 rounded-full relative cursor-pointer">
                         <div className="absolute left-0.5 top-0.5 w-4 h-4 bg-white rounded-full shadow-sm" />
                      </div>
                   </div>

                   <div className="flex items-center justify-between">
                      <div className="space-y-1">
                         <p className="text-[13px] font-black text-[#1A1A1A] dark:text-white">Strike through Reverse Entries</p>
                         <p className="text-[11px] font-medium text-[#999]">Add a strike through on reversed voucher entries to easily differentiate them.</p>
                      </div>
                      <div className="w-10 h-5 bg-slate-200 dark:bg-slate-700 rounded-full relative cursor-pointer">
                         <div className="absolute left-0.5 top-0.5 w-4 h-4 bg-white rounded-full shadow-sm" />
                      </div>
                   </div>
                </div>
              )}
           </div>
        </div>
      </div>
    </SettingsLayout>
  );
}
