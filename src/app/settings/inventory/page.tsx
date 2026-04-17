"use client";

import { useState } from "react";
import SettingsLayout from "@/components/modules/settings/SettingsLayout";
import { ChevronDown, ChevronUp, Settings, Plus } from "lucide-react";
import { clsx } from "clsx";

export default function InventorySettingsPage() {
  const [expandedSections, setExpandedSections] = useState<string[]>([
    "Manage Inventory & Behavior", "Inventory Configuration", "Warehouses"
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
        className="w-full flex items-center justify-between py-5 border-b border-[#F0EAF0] dark:border-slate-800 last:border-0 group"
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
      <div className="space-y-2">
        <h2 className="text-[17px] font-black text-[#1A1A1A] dark:text-white mb-6">Inventory</h2>

        {/* Manage Inventory & Behavior */}
        <div>
           <SectionHeader title="Manage Inventory & Behavior" />
           {expandedSections.includes("Manage Inventory & Behavior") && (
             <div className="py-8 space-y-8 max-w-4xl">
                <div className="flex items-center justify-between">
                   <div className="space-y-1">
                      <p className="text-[13px] font-black text-[#1A1A1A] dark:text-white">Manage Inventory</p>
                      <p className="text-[11px] font-medium text-[#999]">Enable to track stocks based on sales and purchase transactions recorded.</p>
                   </div>
                   <div className="w-10 h-5 bg-[#7C3AED] rounded-full relative">
                      <div className="absolute right-0.5 top-0.5 w-4 h-4 bg-white rounded-full" />
                   </div>
                </div>

                <div className="flex items-start justify-between">
                   <div className="space-y-1">
                      <p className="text-[13px] font-black text-[#1A1A1A] dark:text-white">Inventory Auto-update Settings</p>
                      <p className="text-[11px] font-medium text-[#999]">Configure how each document type will update or affect your inventory stock.</p>
                   </div>
                   <button className="flex items-center gap-2 px-5 py-2 border border-[#F0EAF0] dark:border-slate-800 rounded-lg text-[12px] font-bold text-[#666] hover:bg-slate-50 transition-all">
                      <Settings size={14} /> Configure
                   </button>
                </div>

                <div className="flex items-start justify-between">
                   <div className="space-y-1">
                      <p className="text-[13px] font-black text-[#1A1A1A] dark:text-white">Update Past Inventory</p>
                      <p className="text-[11px] font-medium text-[#999]">Update your present inventory based on past sales and purchase transactions recorded.</p>
                   </div>
                   <button className="px-5 py-2 border border-[#F0EAF0] dark:border-slate-800 rounded-lg text-[12px] font-bold text-[#666] hover:bg-slate-50 transition-all">
                      Update
                   </button>
                </div>
             </div>
           )}
        </div>

        {/* Inventory Configuration */}
        <div>
           <SectionHeader title="Inventory Configuration" />
           {expandedSections.includes("Inventory Configuration") && (
             <div className="py-8 space-y-8 max-w-4xl">
                <div className="flex items-start justify-between">
                   <div className="space-y-1">
                      <p className="text-[13px] font-black text-[#1A1A1A] dark:text-white">Configure Units</p>
                      <p className="text-[11px] font-medium text-[#999]">Create and manage unit quantities in your Inventory and Documents</p>
                   </div>
                   <button className="flex items-center gap-2 px-5 py-2 border border-[#F0EAF0] dark:border-slate-800 rounded-lg text-[12px] font-bold text-[#666] hover:bg-slate-50 transition-all">
                      <Settings size={14} /> Configure
                   </button>
                </div>

                <div className="flex items-start justify-between">
                   <div className="space-y-1">
                      <p className="text-[13px] font-black text-[#1A1A1A] dark:text-white">Configure prices for selling and purchasing items</p>
                      <p className="text-[11px] font-bold text-[#7C3AED] underline cursor-pointer">Learn More &gt;</p>
                   </div>
                   <select className="w-64 px-4 py-2 bg-white dark:bg-slate-800 border border-[#F0EAF0] dark:border-slate-800 rounded-lg text-[13px] font-medium appearance-none">
                      <option>Last Used Price</option>
                   </select>
                </div>

                <div className="flex items-start justify-between">
                   <div className="space-y-1">
                      <p className="text-[13px] font-black text-[#1A1A1A] dark:text-white">Keep Batch Allocations Optional on Documents</p>
                      <p className="text-[11px] font-medium text-[#999]">Applies only to documents configured as Block or Ignore in Inventory Auto-update Settings</p>
                   </div>
                   <select className="w-64 px-4 py-2 bg-white dark:bg-slate-800 border border-[#F0EAF0] dark:border-slate-800 rounded-lg text-[13px] font-medium appearance-none">
                      <option>Both Block & Ignore</option>
                   </select>
                </div>

                <div className="flex items-start justify-between">
                   <div className="space-y-1">
                      <p className="text-[13px] font-black text-[#1A1A1A] dark:text-white">Choose Default Value of Item Type</p>
                      <p className="text-[11px] font-medium text-[#999]">Choose whether new items added directly from the documents are product, service or one time items</p>
                   </div>
                   <select className="w-64 px-4 py-2 bg-white dark:bg-slate-800 border border-[#F0EAF0] dark:border-slate-800 rounded-lg text-[13px] font-black appearance-none">
                      <option>Product</option>
                   </select>
                </div>

                <div className="flex items-center justify-between">
                   <div className="space-y-1">
                      <p className="text-[13px] font-black text-[#1A1A1A] dark:text-white">Auto-expand Package Items in documents</p>
                      <p className="text-[11px] font-medium text-[#999]">Automatically fetch individual items from a Package when added to a group.</p>
                   </div>
                   <div className="w-10 h-5 bg-[#7C3AED] rounded-full relative">
                      <div className="absolute right-0.5 top-0.5 w-4 h-4 bg-white rounded-full" />
                   </div>
                </div>

                <div className="flex items-start justify-between">
                   <div className="space-y-1">
                      <p className="text-[13px] font-black text-[#1A1A1A] dark:text-white">Configure Stock Thresholds</p>
                      <p className="text-[11px] font-medium text-[#999]">Set Re-order and Overstock points for your Items and Warehouses</p>
                   </div>
                   <button className="flex items-center gap-2 px-5 py-2 border border-[#F0EAF0] dark:border-slate-800 rounded-lg text-[12px] font-bold text-[#666] hover:bg-slate-50 transition-all">
                      <Settings size={14} /> Configure
                   </button>
                </div>
             </div>
           )}
        </div>

        {/* Warehouses */}
        <div>
           <SectionHeader title="Warehouses" />
           {expandedSections.includes("Warehouses") && (
             <div className="py-8 space-y-6">
                <div className="flex items-center justify-end">
                   <button className="px-4 py-2 border border-[#7C3AED] rounded-lg text-[13px] font-bold text-[#7C3AED] flex items-center gap-2 hover:bg-purple-50 transition-all">
                      <Plus size={16} /> Add Warehouse
                   </button>
                </div>
                <div className="py-10 text-center text-[#999] text-[13px] font-bold border border-dashed border-slate-200 rounded-2xl">
                   No warehouses configured.
                </div>
             </div>
           )}
        </div>
      </div>
    </SettingsLayout>
  );
}
