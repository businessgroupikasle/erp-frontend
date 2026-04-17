"use client";

import { useState } from "react";
import SettingsLayout from "@/components/modules/settings/SettingsLayout";
import { ChevronDown, ChevronUp } from "lucide-react";
import { clsx } from "clsx";

export default function GeneralSettingsPage() {
  const [expandedSections, setExpandedSections] = useState<string[]>([
    "Refrens Premium Subscription", "PDF & Reports Configurations", "Time and Currency", "Security"
  ]);

  const toggleSection = (section: string) => {
    setExpandedSections(prev => 
      prev.includes(section) ? prev.filter(s => s !== section) : [...prev, section]
    );
  };

  const SectionHeader = ({ title }: { title: string }) => {
    const isExpanded = expandedSections.includes(title);
    return (
      <button 
        onClick={() => toggleSection(title)}
        className="w-full flex items-center justify-between py-4 group"
      >
        <div className="flex items-center gap-3">
           {isExpanded ? <ChevronUp size={18} className="text-[#1A1A1A] dark:text-white" /> : <ChevronDown size={18} className="text-[#999]" />}
           <h3 className={clsx(
             "text-[15px] font-black transition-colors",
             isExpanded ? "text-[#1A1A1A] dark:text-white" : "text-[#666] dark:text-slate-400 group-hover:text-[#1A1A1A] dark:hover:text-white"
           )}>{title}</h3>
        </div>
      </button>
    );
  };

  return (
    <SettingsLayout>
      <div className="space-y-4">
        <h2 className="text-[17px] font-black text-[#1A1A1A] dark:text-white mb-6">General Settings</h2>

        {/* Subscription */}
        <div className="border-b border-[#F0EAF0] dark:border-slate-800 last:border-0">
           <SectionHeader title="Refrens Premium Subscription" />
           {expandedSections.includes("Refrens Premium Subscription") && (
             <div className="pb-8 space-y-6 pt-2">
                <div className="flex items-center gap-4">
                   <button className="px-4 py-2 border border-[#F0EAF0] dark:border-slate-800 rounded-lg text-[12px] font-bold text-[#7C3AED] bg-[#F3E8FF] transition-all">Active Subscription</button>
                   <button className="px-4 py-2 border border-[#F0EAF0] dark:border-slate-800 rounded-lg text-[12px] font-bold text-[#666] hover:bg-slate-50 transition-all">Billing History</button>
                </div>
                
                <div className="w-full h-40 bg-[#1A1A1A] dark:bg-black rounded-xl relative overflow-hidden flex flex-col items-center justify-center space-y-3">
                   <div className="flex items-center gap-3">
                      <div className="w-6 h-6 bg-orange-400 rounded-sm rotate-45 flex items-center justify-center">
                         <div className="w-3 h-3 border-2 border-white rounded-full opacity-50" />
                      </div>
                      <span className="text-xl font-black text-white tracking-widest uppercase italic">Refrens Premium</span>
                   </div>
                   <div className="absolute inset-0 bg-gradient-to-r from-orange-400/5 to-transparent pointer-events-none" />
                </div>

                <div className="flex items-center gap-20 px-4">
                   <span className="text-[12px] font-bold text-[#666]">Status</span>
                   <span className="px-3 py-1 bg-emerald-50 text-emerald-600 text-[11px] font-black rounded-md uppercase tracking-wide">Trial</span>
                </div>
             </div>
           )}
        </div>

        {/* PDF & Reports */}
        <div className="border-b border-[#F0EAF0] dark:border-slate-800 last:border-0">
           <SectionHeader title="PDF & Reports Configurations" />
           {expandedSections.includes("PDF & Reports Configurations") && (
             <div className="pb-8 space-y-8 pt-2">
                <div className="flex items-start justify-between max-w-3xl">
                   <div className="space-y-1">
                      <p className="text-[13px] font-bold text-[#1A1A1A] dark:text-white">Select Script for PDF Reports</p>
                      <p className="text-[11px] font-medium text-[#999]">Important if you are using language other than English in Statement and Report PDFs.</p>
                   </div>
                   <select className="w-64 px-4 py-2 bg-white dark:bg-slate-800 border border-[#F0EAF0] dark:border-slate-800 rounded-lg text-[13px] font-medium appearance-none">
                      <option>English (Latin)</option>
                   </select>
                </div>

                <div className="flex items-start justify-between max-w-3xl">
                   <div className="space-y-1">
                      <p className="text-[13px] font-bold text-[#1A1A1A] dark:text-white">Select Font for PDF Reports</p>
                      <p className="text-[11px] font-medium text-[#999]">Important if you are using language other than English in Statement and Report PDFs.</p>
                   </div>
                   <select className="w-64 px-4 py-2 bg-white dark:bg-slate-800 border border-[#F0EAF0] dark:border-slate-800 rounded-lg text-[13px] font-medium appearance-none">
                      <option>Noto Sans</option>
                   </select>
                </div>
             </div>
           )}
        </div>

        {/* Time and Currency */}
        <div className="border-b border-[#F0EAF0] dark:border-slate-800 last:border-0">
           <SectionHeader title="Time and Currency" />
           {expandedSections.includes("Time and Currency") && (
             <div className="pb-8 space-y-8 pt-2">
                <div className="flex items-start justify-between max-w-3xl">
                   <div className="space-y-1">
                      <p className="text-[13px] font-bold text-[#1A1A1A] dark:text-white">Business Time Zone</p>
                      <p className="text-[11px] font-medium text-[#999]">Set a time zone for your business.</p>
                   </div>
                   <select className="w-64 px-4 py-2 bg-white dark:bg-slate-800 border border-[#F0EAF0] dark:border-slate-800 rounded-lg text-[13px] font-medium appearance-none">
                      <option>(GMT+05:30) India Standard Time</option>
                   </select>
                </div>

                <div className="flex items-start justify-between max-w-3xl">
                   <div className="space-y-1">
                      <p className="text-[13px] font-bold text-[#1A1A1A] dark:text-white">Business Currency</p>
                      <p className="text-[11px] font-medium text-[#999]">Set a base currency in you do business.</p>
                   </div>
                   <select className="w-64 px-4 py-2 bg-white dark:bg-slate-800 border border-[#F0EAF0] dark:border-slate-800 rounded-lg text-[13px] font-medium appearance-none">
                      <option>Indian Rupee (INR, ₹)</option>
                   </select>
                </div>

                <div className="flex items-start justify-between max-w-3xl">
                   <div className="space-y-1">
                      <p className="text-[13px] font-bold text-[#1A1A1A] dark:text-white">Business Currency Locale</p>
                      <p className="text-[11px] font-medium text-[#999]">Set locale currency where you are located at.</p>
                   </div>
                   <select className="w-64 px-4 py-2 bg-white dark:bg-slate-800 border border-[#F0EAF0] dark:border-slate-800 rounded-lg text-[13px] font-medium appearance-none">
                      <option>India - English (Lakhs)</option>
                   </select>
                </div>
             </div>
           )}
        </div>

        {/* Security */}
        <div className="border-b border-[#F0EAF0] dark:border-slate-800 last:border-0">
           <SectionHeader title="Security" />
           {expandedSections.includes("Security") && (
             <div className="pb-8 space-y-8 pt-4 px-2">
                <div className="flex items-center justify-between max-w-3xl">
                   <div className="space-y-1">
                      <p className="text-[13px] font-bold text-[#1A1A1A] dark:text-white">Change Profile to Public</p>
                      <p className="text-[11px] font-medium text-[#999]">Enable to ensure that your Business Profile is visible and discoverable to everyone.</p>
                   </div>
                   <div className="w-10 h-5 bg-slate-200 dark:bg-slate-700 rounded-full cursor-pointer relative">
                      <div className="absolute left-0.5 top-0.5 w-4 h-4 bg-white rounded-full shadow-sm" />
                   </div>
                </div>

                <div className="flex items-center justify-between max-w-3xl">
                   <div className="space-y-1">
                      <p className="text-[13px] font-bold text-[#1A1A1A] dark:text-white">Change Password</p>
                      <p className="text-[11px] font-medium text-[#999]">Update your password frequently to stay secure.</p>
                   </div>
                   <button className="px-6 py-2 border border-[#F0EAF0] dark:border-slate-800 rounded-lg text-[12px] font-bold hover:bg-slate-50 dark:hover:bg-slate-800 transition-all text-[#444] dark:text-white shadow-sm">
                      Change Password
                   </button>
                </div>

                <div className="flex items-center justify-between max-w-3xl">
                   <div className="space-y-1">
                      <p className="text-[13px] font-bold text-[#1A1A1A] dark:text-white">Remove Current Business</p>
                   </div>
                   <button className="px-8 py-2 border border-[#F0EAF0] dark:border-slate-800 rounded-lg text-[11px] font-black hover:bg-red-50 transition-all text-red-500 uppercase tracking-widest shadow-sm">
                      REMOVE
                   </button>
                </div>
             </div>
           )}
        </div>
      </div>
    </SettingsLayout>
  );
}
