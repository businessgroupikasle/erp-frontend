"use client";

import { useState } from "react";
import SettingsLayout from "@/components/modules/settings/SettingsLayout";
import { ChevronDown, ChevronUp, Settings, Plus, X } from "lucide-react";
import { clsx } from "clsx";

export default function InventorySettingsPage() {
  const [expandedSections, setExpandedSections] = useState<string[]>([
    "Manage Inventory & Behavior", "Inventory Configuration", "Warehouses"
  ]);

  // Inventory Behavior State
  const [manageInventory, setManageInventory] = useState(true);
  const [autoExpand, setAutoExpand] = useState(true);

  // Configuration State
  const [priceType, setPriceType] = useState("Last Used Price");
  const [batchAlloc, setBatchAlloc] = useState("Both Block & Ignore");
  const [itemType, setItemType] = useState("Product");

  // Warehouses State
  const [warehouses, setWarehouses] = useState([{ id: "1", name: "Main HQ Warehouse" }]);
  const [newWarehouse, setNewWarehouse] = useState("");

  // Generic Modal State
  const [modalConfig, setModalConfig] = useState<{ title: string; type: "coming_soon" | "warehouse" } | null>(null);

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
                   <button 
                     onClick={() => setManageInventory(!manageInventory)}
                     className={clsx("w-10 h-5 rounded-full relative transition-colors duration-200 focus:outline-none", manageInventory ? "bg-[#7C3AED]" : "bg-slate-300 dark:bg-slate-700")}
                   >
                      <div className={clsx("absolute top-0.5 w-4 h-4 bg-white rounded-full transition-all duration-200 shadow-sm", manageInventory ? "right-0.5" : "left-0.5")} />
                   </button>
                </div>

                <div className="flex items-start justify-between">
                   <div className="space-y-1">
                      <p className="text-[13px] font-black text-[#1A1A1A] dark:text-white">Inventory Auto-update Settings</p>
                      <p className="text-[11px] font-medium text-[#999]">Configure how each document type will update or affect your inventory stock.</p>
                   </div>
                   <button 
                     onClick={() => setModalConfig({ title: "Inventory Auto-update Settings", type: "coming_soon" })}
                     className="flex items-center gap-2 px-5 py-2 border border-[#F0EAF0] dark:border-slate-800 rounded-lg text-[12px] font-bold text-[#666] dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all"
                   >
                      <Settings size={14} /> Configure
                   </button>
                </div>

                <div className="flex items-start justify-between">
                   <div className="space-y-1">
                      <p className="text-[13px] font-black text-[#1A1A1A] dark:text-white">Update Past Inventory</p>
                      <p className="text-[11px] font-medium text-[#999]">Update your present inventory based on past sales and purchase transactions recorded.</p>
                   </div>
                   <button 
                     onClick={() => setModalConfig({ title: "Update Past Inventory", type: "coming_soon" })}
                     className="px-5 py-2 border border-[#F0EAF0] dark:border-slate-800 rounded-lg text-[12px] font-bold text-[#666] dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all"
                   >
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
                   <button 
                     onClick={() => setModalConfig({ title: "Configure Units", type: "coming_soon" })}
                     className="flex items-center gap-2 px-5 py-2 border border-[#F0EAF0] dark:border-slate-800 rounded-lg text-[12px] font-bold text-[#666] dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all"
                   >
                      <Settings size={14} /> Configure
                   </button>
                </div>

                <div className="flex items-start justify-between">
                   <div className="space-y-1">
                      <p className="text-[13px] font-black text-[#1A1A1A] dark:text-white">Configure prices for selling and purchasing items</p>
                      <p className="text-[11px] font-bold text-[#7C3AED] underline cursor-pointer">Learn More &gt;</p>
                   </div>
                   <select 
                     value={priceType}
                     onChange={(e) => setPriceType(e.target.value)}
                     className="w-64 px-4 py-2 bg-white dark:bg-slate-800 border border-[#F0EAF0] dark:border-slate-800 rounded-lg text-[13px] font-medium appearance-none focus:outline-none focus:ring-2 focus:ring-purple-500/20"
                   >
                      <option value="Last Used Price">Last Used Price</option>
                      <option value="Standard Price">Standard Price</option>
                      <option value="Average Cost">Average Cost</option>
                   </select>
                </div>

                <div className="flex items-start justify-between">
                   <div className="space-y-1">
                      <p className="text-[13px] font-black text-[#1A1A1A] dark:text-white">Keep Batch Allocations Optional on Documents</p>
                      <p className="text-[11px] font-medium text-[#999]">Applies only to documents configured as Block or Ignore in Inventory Auto-update Settings</p>
                   </div>
                   <select 
                     value={batchAlloc}
                     onChange={(e) => setBatchAlloc(e.target.value)}
                     className="w-64 px-4 py-2 bg-white dark:bg-slate-800 border border-[#F0EAF0] dark:border-slate-800 rounded-lg text-[13px] font-medium appearance-none focus:outline-none focus:ring-2 focus:ring-purple-500/20"
                   >
                      <option value="Both Block & Ignore">Both Block & Ignore</option>
                      <option value="Block Only">Block Only</option>
                      <option value="Ignore Only">Ignore Only</option>
                   </select>
                </div>

                <div className="flex items-start justify-between">
                   <div className="space-y-1">
                      <p className="text-[13px] font-black text-[#1A1A1A] dark:text-white">Choose Default Value of Item Type</p>
                      <p className="text-[11px] font-medium text-[#999]">Choose whether new items added directly from the documents are product, service or one time items</p>
                   </div>
                   <select 
                     value={itemType}
                     onChange={(e) => setItemType(e.target.value)}
                     className="w-64 px-4 py-2 bg-white dark:bg-slate-800 border border-[#F0EAF0] dark:border-slate-800 rounded-lg text-[13px] font-black appearance-none focus:outline-none focus:ring-2 focus:ring-purple-500/20"
                   >
                      <option value="Product">Product</option>
                      <option value="Service">Service</option>
                      <option value="One Time Item">One Time Item</option>
                   </select>
                </div>

                <div className="flex items-center justify-between">
                   <div className="space-y-1">
                      <p className="text-[13px] font-black text-[#1A1A1A] dark:text-white">Auto-expand Package Items in documents</p>
                      <p className="text-[11px] font-medium text-[#999]">Automatically fetch individual items from a Package when added to a group.</p>
                   </div>
                   <button 
                     onClick={() => setAutoExpand(!autoExpand)}
                     className={clsx("w-10 h-5 rounded-full relative transition-colors duration-200 focus:outline-none", autoExpand ? "bg-[#7C3AED]" : "bg-slate-300 dark:bg-slate-700")}
                   >
                      <div className={clsx("absolute top-0.5 w-4 h-4 bg-white rounded-full transition-all duration-200 shadow-sm", autoExpand ? "right-0.5" : "left-0.5")} />
                   </button>
                </div>

                <div className="flex items-start justify-between">
                   <div className="space-y-1">
                      <p className="text-[13px] font-black text-[#1A1A1A] dark:text-white">Configure Stock Thresholds</p>
                      <p className="text-[11px] font-medium text-[#999]">Set Re-order and Overstock points for your Items and Warehouses</p>
                   </div>
                   <button 
                     onClick={() => setModalConfig({ title: "Configure Stock Thresholds", type: "coming_soon" })}
                     className="flex items-center gap-2 px-5 py-2 border border-[#F0EAF0] dark:border-slate-800 rounded-lg text-[12px] font-bold text-[#666] dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all"
                   >
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
                    <button 
                      onClick={() => setModalConfig({ title: "Add Warehouse", type: "warehouse" })}
                      className="px-4 py-2 border border-[#7C3AED] rounded-lg text-[13px] font-bold text-[#7C3AED] flex items-center gap-2 hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-all"
                    >
                       <Plus size={16} /> Add Warehouse
                    </button>
                 </div>
                 
                 {warehouses.length > 0 ? (
                   <div className="space-y-3 pt-4">
                     {warehouses.map(w => (
                       <div key={w.id} className="p-4 bg-white dark:bg-slate-800 border border-[#F0EAF0] dark:border-slate-800 rounded-xl flex items-center justify-between group shadow-sm hover:border-[#7C3AED]/30 transition-all">
                          <span className="text-[13px] font-black text-[#1A1A1A] dark:text-white flex items-center gap-2">
                             <div className="w-8 h-8 rounded-lg bg-[#F5F1F5] dark:bg-slate-700 flex items-center justify-center text-[#999]">WH</div>
                             {w.name}
                          </span>
                          <button 
                            onClick={() => setWarehouses(warehouses.filter(x => x.id !== w.id))} 
                            className="text-[#999] hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
                          >
                             <X size={16} />
                          </button>
                       </div>
                     ))}
                   </div>
                 ) : (
                   <div className="py-10 text-center text-[#999] text-[13px] font-bold border border-dashed border-[#F0EAF0] dark:border-slate-800 rounded-2xl bg-slate-50 dark:bg-slate-800/30">
                      No warehouses configured.
                   </div>
                 )}
             </div>
           )}
        </div>
      </div>
      {/* Dynamic Modal */}
      {modalConfig && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/40 backdrop-blur-sm" onClick={() => setModalConfig(null)}>
          <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-gray-100 dark:border-slate-800 p-6" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-black text-gray-900 dark:text-white">{modalConfig.title}</h3>
              <button onClick={() => setModalConfig(null)} className="text-gray-400 hover:text-gray-600 transition-colors">
                <X size={20} />
              </button>
            </div>
            
            {modalConfig.type === "coming_soon" ? (
               <div className="py-8 text-center space-y-3">
                  <div className="w-16 h-16 bg-purple-50 dark:bg-purple-900/20 rounded-full flex items-center justify-center mx-auto mb-4 text-[#7C3AED]">
                     <Settings size={28} />
                  </div>
                  <p className="text-[14px] font-bold text-[#1A1A1A] dark:text-white">Feature in Development</p>
                  <p className="text-[13px] font-medium text-[#999]">This configuration module will be available in the next release.</p>
               </div>
            ) : (
               <div className="space-y-6">
                 <div>
                   <label className="block text-[12px] font-bold text-gray-700 dark:text-slate-300 mb-1.5 uppercase tracking-wide">Warehouse Name</label>
                   <input 
                     type="text" 
                     value={newWarehouse}
                     onChange={(e) => setNewWarehouse(e.target.value)}
                     className="w-full px-4 py-3 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/20 font-medium"
                     placeholder="e.g. Central Supply Hub"
                     autoFocus
                   />
                 </div>
                 
                 <div className="flex gap-3 pt-2">
                   <button 
                     onClick={() => setModalConfig(null)}
                     className="flex-1 py-3 border border-gray-200 dark:border-slate-700 rounded-xl text-sm font-bold text-gray-600 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors"
                   >
                     Cancel
                   </button>
                   <button 
                     onClick={() => {
                        if (newWarehouse.trim()) {
                           setWarehouses([...warehouses, { id: Date.now().toString(), name: newWarehouse }]);
                           setModalConfig(null);
                           setNewWarehouse("");
                        }
                     }}
                     disabled={!newWarehouse.trim()}
                     className="flex-1 py-3 bg-[#7C3AED] hover:bg-[#6D28D9] disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl text-sm font-bold transition-all"
                   >
                     Save Warehouse
                   </button>
                 </div>
               </div>
            )}
          </div>
        </div>
      )}
    </SettingsLayout>
  );
}
