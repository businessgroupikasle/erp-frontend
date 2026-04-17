"use client";

import { useState } from "react";
import SettingsLayout from "@/components/modules/settings/SettingsLayout";
import { ChevronDown, ChevronUp, Search } from "lucide-react";
import { clsx } from "clsx";

export default function LeadManagementSettingsPage() {
  const [expandedSections, setExpandedSections] = useState<string[]>([
    "Lead Labels", "Lead Duplication", "Lead Configurations"
  ]);

  const toggleSection = (section: string) => {
    setExpandedSections(prev => 
      prev.includes(section) ? prev.filter(s => s !== section) : [...prev, section]
    );
  };

  const labels = [
    { name: "Hot", color: "#FFF5F5", border: "#FEE2E2" },
    { name: "Warm", color: "#FFFBEB", border: "#FEF3C7" },
    { name: "Cold", color: "#EFF6FF", border: "#DBEAFE" },
    { name: "Customer", color: "#F0FDFA", border: "#CCFBF1" },
    { name: "Not Qualified", color: "#FFF1F2", border: "#FFE4E6" },
    { name: "Qualified", color: "#F0FDF4", border: "#DCFCE7" },
  ];

  const duplicationFields = [
    { name: "Contact Email", enabled: false },
    { name: "Contact Phone", enabled: false },
    { name: "Contact Name", enabled: false },
    { name: "Customer Name", enabled: false },
    { name: "Client Email", enabled: false },
    { name: "IndiaMart Query ID", enabled: false },
    { name: "FaceBook Query ID", enabled: false },
    { name: "TradeIndia Query ID", enabled: false },
  ];

  const SectionHeader = ({ title, beta }: { title: string, beta?: boolean }) => {
    const isExpanded = expandedSections.includes(title);
    return (
      <button 
        onClick={() => toggleSection(title)}
        className="w-full flex items-center justify-between p-5 border-b border-[#FDFCFD] dark:border-slate-800 bg-[#FAF9FA] dark:bg-slate-800/20 group"
      >
        <div className="flex items-center gap-3">
           {isExpanded ? <ChevronUp size={18} className="text-[#1A1A1A] dark:text-white" /> : <ChevronDown size={18} className="text-[#999]" />}
           <div className="space-y-0.5 text-left text-[14px] font-black text-[#1A1A1A] dark:text-white">
              {title} {beta && <span className="ml-2 px-2 py-0.5 bg-blue-50 text-blue-500 text-[9px] uppercase tracking-wider rounded font-black">BETA</span>}
           </div>
        </div>
      </button>
    );
  };

  return (
    <SettingsLayout>
      <div className="space-y-6">
        <h2 className="text-[17px] font-black text-[#1A1A1A] dark:text-white mb-6">Lead Management System (CRM)</h2>

        <div className="border border-[#FDFCFD] dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm mt-8">
           <SectionHeader title="Lead Labels" />
           {expandedSections.includes("Lead Labels") && (
             <div className="p-6 bg-white dark:bg-slate-900 space-y-6">
                <p className="text-[11px] font-medium text-[#999] -mt-4">Labels are used in your Lead Management System to tag your leads appropriately.</p>
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                   <div className="relative w-full md:w-96">
                      <Search className="absolute left-3 top-2.5 text-[#999]" size={14} />
                      <input 
                        type="text" 
                        placeholder="Find labels..." 
                        className="w-full pl-9 pr-4 py-2 bg-white dark:bg-slate-800 border border-[#F6F4F6] dark:border-slate-800 rounded-lg text-[13px] font-medium focus:ring-1 focus:ring-pink-500 transition-all" 
                      />
                   </div>
                   <button className="px-6 py-2 bg-[#D81159] text-white rounded-lg font-black text-[12px] hover:bg-[#C01050] transition-colors">
                      Add New Label
                   </button>
                </div>

                <div className="overflow-x-auto border border-slate-50 dark:border-slate-800 rounded-xl">
                   <table className="w-full text-left">
                     <thead>
                       <tr className="bg-[#FAF9FA]/30 text-[11px] text-[#999] uppercase font-bold tracking-wider">
                         <th className="p-4">Label Name</th>
                         <th className="p-4">Color</th>
                         <th className="p-4">Action</th>
                       </tr>
                     </thead>
                     <tbody className="text-[13px] font-bold text-[#444] dark:text-slate-200">
                       {labels.map((label, i) => (
                         <tr key={i} className="border-b border-slate-50 last:border-0 hover:bg-slate-50/50 transition-colors">
                           <td className="p-4">{label.name}</td>
                           <td className="p-4">
                              <div 
                                className="w-5 h-5 rounded border" 
                                style={{ backgroundColor: label.color, borderColor: label.border }} 
                              />
                           </td>
                           <td className="p-4 flex items-center gap-4">
                              <button className="text-[#7C3AED] hover:underline">Edit</button>
                              <button className="text-[#7C3AED] hover:underline">Mark as Inactive</button>
                           </td>
                         </tr>
                       ))}
                     </tbody>
                   </table>
                </div>
             </div>
           )}
        </div>

        {/* Lead Duplication */}
        <div className="border border-[#FDFCFD] dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm">
           <SectionHeader title="Lead Duplication" beta />
           {expandedSections.includes("Lead Duplication") && (
             <div className="p-6 bg-white dark:bg-slate-900 space-y-8">
                <div className="space-y-6">
                   <p className="text-[12px] font-medium text-[#666] leading-relaxed">
                      Enable this to find out duplicate leads in the lead management system. <span className="text-[#7C3AED] underline cursor-pointer font-bold">Learn More &gt;</span>
                   </p>

                   <div className="space-y-8 max-w-4xl">
                      <div className="flex items-center justify-between">
                         <p className="text-[13px] font-black text-[#1A1A1A] dark:text-white">Enable searching for duplicates across multiple pipelines</p>
                         <div className="w-10 h-5 bg-slate-200 rounded-full relative cursor-pointer">
                            <div className="absolute left-0.5 top-0.5 w-4 h-4 bg-white rounded-full shadow-sm" />
                         </div>
                      </div>

                      <div className="flex items-center justify-between">
                         <p className="text-[13px] font-black text-[#1A1A1A] dark:text-white">Enable Lead Duplicate</p>
                         <div className="w-10 h-5 bg-slate-200 rounded-full relative cursor-pointer">
                            <div className="absolute left-0.5 top-0.5 w-4 h-4 bg-white rounded-full shadow-sm" />
                         </div>
                      </div>
                   </div>

                   <div className="bg-white dark:bg-slate-900 border border-slate-50 dark:border-slate-800 rounded-xl overflow-hidden mt-6">
                      <table className="w-full text-left">
                        <thead>
                          <tr className="bg-[#FAF9FA]/30 border-b border-slate-50 text-[11px] text-[#999] uppercase font-bold tracking-wider">
                            <th className="p-4">Duplication Fields</th>
                            <th className="p-4">Enabled</th>
                          </tr>
                        </thead>
                        <tbody className="text-[13px] font-bold text-[#444] dark:text-slate-200">
                          {duplicationFields.map((field, i) => (
                            <tr key={i} className="border-b border-slate-50 last:border-0 hover:bg-slate-50/50 transition-colors">
                               <td className="p-4">{field.name}</td>
                               <td className="p-4">
                                  <div className="w-4 h-4 rounded border-2 border-slate-100 bg-white opacity-40 shadow-sm" />
                               </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                   </div>
                </div>
             </div>
           )}
        </div>

        {/* Lead Configurations */}
        <div className="border border-[#FDFCFD] dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm">
           <SectionHeader title="Lead Configurations" />
           {expandedSections.includes("Lead Configurations") && (
             <div className="p-6 bg-white dark:bg-slate-900 space-y-10 py-10">
                <div className="flex items-center justify-between max-w-4xl">
                   <div className="space-y-1">
                      <p className="text-[14px] font-black text-[#1A1A1A] dark:text-white">Auto Lead Generation from Quotation</p>
                      <p className="text-[11px] font-medium text-[#999]">Enable this to generate lead automatically when creating quotations.</p>
                   </div>
                   <div className="w-10 h-5 bg-[#7C3AED] rounded-full relative cursor-pointer">
                      <div className="absolute right-0.5 top-0.5 w-4 h-4 bg-white rounded-full shadow-sm" />
                   </div>
                </div>

                <div className="flex items-center justify-between max-w-4xl">
                   <div className="space-y-1">
                      <p className="text-[14px] font-black text-[#1A1A1A] dark:text-white">Configure Default Pipeline & Stage</p>
                      <p className="text-[11px] font-medium text-[#999]">Select the pipeline & stage where auto-generated leads will be captured.</p>
                   </div>
                   <button className="flex items-center gap-2 px-6 py-2.5 bg-white border border-[#E9D5FF] dark:border-slate-700 rounded-xl text-[12px] font-black text-[#7C3AED] hover:bg-slate-50 transition-all">
                      <Search size={14} className="opacity-0 group-hover:opacity-100" />
                      Configure
                   </button>
                </div>
             </div>
           )}
        </div>
      </div>
    </SettingsLayout>
  );
}
