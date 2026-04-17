"use client";

import { useState } from "react";
import UserAccountLayout from "@/components/modules/settings/UserAccountLayout";
import { ChevronDown, ChevronUp } from "lucide-react";
import { clsx } from "clsx";

export default function UserNotificationSettingsPage() {
  const [expandedSections, setExpandedSections] = useState<string[]>([
    "General Notifications", "Accounting Notifications"
  ]);

  const toggleSection = (section: string) => {
    setExpandedSections(prev => 
      prev.includes(section) ? prev.filter(s => s !== section) : [...prev, section]
    );
  };

  const notificationSections = [
    { title: "General Notifications", desc: "Get Updates & alerts regarding general mails", enabledAll: true },
    { title: "Accounting Notifications", desc: "Get Updates & alerts regarding accounting emails", enabledAll: true },
    { title: "Leads Notifications", desc: "Get Updates & alerts regarding lead mails", enabledAll: true },
    { title: "Project & Escrow Notifications", desc: "Get important updates on projects including milestones & payments.", enabledAll: true },
    { title: "Payments & Verification Notifications", desc: "Get important updates on payments and verification.", enabledAll: true },
    { title: "Inventory Notifications", desc: "Get updates and alerts regarding inventory activities", enabledAll: true },
  ];

  const SectionHeader = ({ title, desc, enabledAll }: { title: string, desc: string, enabledAll: boolean }) => {
    const isExpanded = expandedSections.includes(title);
    return (
      <div className="border-b border-[#FDFCFD] dark:border-slate-800 last:border-0 group">
        <div className="flex items-center justify-between py-6 group-hover:bg-[#FAF9FA]/30 transition-colors cursor-pointer" onClick={() => toggleSection(title)}>
           <div className="flex items-center gap-4">
              {isExpanded ? <ChevronUp size={18} className="text-[#1A1A1A] dark:text-white" /> : <ChevronDown size={18} className="text-[#999]" />}
              <div className="space-y-0.5">
                 <h3 className="text-[14px] font-black text-[#1A1A1A] dark:text-white">{title}</h3>
                 <p className="text-[11px] font-medium text-[#999]">{desc}</p>
              </div>
           </div>
           
           <div className="flex items-center gap-4 mr-4">
              <span className="text-[11px] font-black text-[#666] uppercase">Enable All</span>
              <div className={clsx(
                "w-10 h-5 rounded-full relative cursor-pointer flex items-center transition-all",
                enabledAll ? "bg-[#7C3AED]" : "bg-slate-200"
              )}>
                 <div className={clsx(
                   "w-4 h-4 bg-white rounded-full transition-all shadow-sm",
                   enabledAll ? "ml-5.5" : "ml-0.5"
                 )} />
              </div>
           </div>
        </div>
        
        {isExpanded && (
           <div className="pb-8 pl-12 space-y-4">
              <div className="p-10 border-2 border-dashed border-slate-50 rounded-3xl text-center text-[#999] text-[12px] font-medium italic">
                 Standard notification controls for {title.toLowerCase()}...
              </div>
           </div>
        )}
      </div>
    );
  };

  return (
    <UserAccountLayout>
      <div className="space-y-8">
        <div className="space-y-1">
           <h2 className="text-[17px] font-black text-[#1A1A1A] dark:text-white">Notifications & Alerts</h2>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-[#FDFCFD] dark:border-slate-800 rounded-3xl overflow-hidden shadow-sm">
           {notificationSections.map((section, i) => (
              <SectionHeader 
                key={i}
                title={section.title}
                desc={section.desc}
                enabledAll={section.enabledAll}
              />
           ))}
        </div>
      </div>
    </UserAccountLayout>
  );
}
