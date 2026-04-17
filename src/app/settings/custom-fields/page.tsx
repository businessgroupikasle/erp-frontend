"use client";

import { useState } from "react";
import SettingsLayout from "@/components/modules/settings/SettingsLayout";
import { ChevronDown, ChevronUp } from "lucide-react";
import { clsx } from "clsx";

export default function CustomFieldsSettingsPage() {
  const [expandedSections, setExpandedSections] = useState<string[]>([
    "Custom Tags", "Available Custom Fields In Your Plan"
  ]);

  const toggleSection = (section: string) => {
    setExpandedSections(prev => 
      prev.includes(section) ? prev.filter(s => s !== section) : [...prev, section]
    );
  };

  const fieldSections = [
    { title: "Available Custom Fields In Your Plan", desc: "This is the list of custom fields available in your plan and usage across the system." },
    { title: "Private Custom Fields", desc: "Add additional custom fields to your documents dashboard. They are private and hidden from your clients." },
    { title: "Lead Custom Fields", desc: "Add additional custom fields to your leads dashboard. They are private and hidden from your clients." },
    { title: "Vendor Lead Custom Fields", desc: "Define custom fields to your Vendor leads." },
    { title: "Contact Relations Custom Fields", desc: "Define custom fields to your Contact Relations." },
    { title: "Clients Custom Fields", desc: "Custom fields for the Clients Dashboard. These are private and hidden from your clients." },
    { title: "Inventory Management", desc: "Custom fields in the Inventory table. These are private and hidden from your clients." },
    { title: "Inventory Transactions", desc: "Custom fields for your Inventory transactions. These are private and hidden from your clients." },
    { title: "Accounting Documents", desc: "Add or edit new custom fields in accounting documents." },
    { title: "Batches Custom Fields", desc: "Define custom fields to your Batches." },
  ];

  const SectionHeader = ({ title, desc, isTag }: { title: string, desc: string, isTag?: boolean }) => {
    const isExpanded = expandedSections.includes(title);
    return (
      <div className="border border-[#FDFCFD] dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm mb-6">
        <button 
          onClick={() => toggleSection(title)}
          className="w-full flex items-center justify-between p-5 border-b border-[#FDFCFD] dark:border-slate-800 bg-[#FAF9FA]/50 dark:bg-slate-800/10 group"
        >
          <div className="flex items-center gap-4">
             {isExpanded ? <ChevronUp size={18} className="text-[#1A1A1A] dark:text-white" /> : <ChevronDown size={18} className="text-[#999]" />}
             <div className="space-y-1 text-left">
                <h3 className="text-[14px] font-black text-[#1A1A1A] dark:text-white">{title}</h3>
                <p className="text-[11px] font-medium text-[#999]">{desc}</p>
             </div>
          </div>
        </button>
        {isExpanded && (
          <div className="p-10 text-center text-[#999] text-[12px] font-medium bg-white dark:bg-slate-900 border-t border-slate-50 dark:border-slate-800">
             No {title.toLowerCase()} added yet.
          </div>
        )}
      </div>
    );
  };

  return (
    <SettingsLayout>
      <div className="space-y-6">
        <h2 className="text-[17px] font-black text-[#1A1A1A] dark:text-white mb-8">Custom Fields & Tags</h2>

        <div className="space-y-10">
           {/* Tags & Labels Section */}
           <div>
              <p className="text-[12px] font-black text-[#666] uppercase tracking-widest mb-4">Tags & Labels</p>
              <SectionHeader 
                title="Custom Tags" 
                desc="Custom tags are used across documents and inventory to filter your reports easily." 
              />
           </div>

           {/* Custom Fields Section */}
           <div>
              <p className="text-[12px] font-black text-[#666] uppercase tracking-widest mb-4">Custom Fields</p>
              <div className="space-y-4">
                 {fieldSections.map((section, i) => (
                    <SectionHeader key={i} title={section.title} desc={section.desc} />
                 ))}
              </div>
           </div>
        </div>
      </div>
    </SettingsLayout>
  );
}
