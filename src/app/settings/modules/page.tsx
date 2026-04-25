"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import SettingsLayout from "@/components/modules/settings/SettingsLayout";
import { Power, Package, Users, Calculator, Clock, ShoppingCart, Factory, Boxes, LayoutDashboard, History, CheckCircle2, ChevronRight } from "lucide-react";

export default function ModuleManagementPage() {
  const router = useRouter();
  const [modules, setModules] = useState([
    { id: "inventory", name: "Inventory", description: "Manage stock, warehouses, and transfers", icon: Package, enabled: true, href: "/products" },
    { id: "crm", name: "CRM", description: "Customer relationship management and sales", icon: Users, enabled: true, href: "/customers" },
    { id: "accounting", name: "Accounting", description: "Financial tracking and reporting", icon: Calculator, enabled: true, href: "/hr/payroll" },
    { id: "attendance", name: "Attendance", description: "Employee time tracking and shifts", icon: Clock, enabled: true, href: "/hr/attendance" },
    { id: "pos", name: "POS & Invoicing", description: "Point of sale and billing", icon: ShoppingCart, enabled: true, href: "/pos" },
    { id: "manufacturing", name: "Manufacturing", description: "Production planning and execution", icon: Factory, enabled: true, href: "/production" },
    { id: "raw-material", name: "Raw Material Inventory", description: "Track raw materials separately", icon: Boxes, enabled: true, href: "/inventory/stock" },
    { id: "production", name: "Production", description: "Manage production orders", icon: LayoutDashboard, enabled: true, href: "/production" },
  ]);

  const [saveStatus, setSaveStatus] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("erp_modules_config");
    if (saved) {
      const config = JSON.parse(saved);
      setModules(prev => prev.map(mod => ({
        ...mod,
        enabled: config[mod.id] !== undefined ? config[mod.id] : mod.enabled
      })));
    }
  }, []);

  const toggleModule = (id: string) => {
    const updatedModules = modules.map(mod => 
      mod.id === id ? { ...mod, enabled: !mod.enabled } : mod
    );
    setModules(updatedModules);
    
    // Persist to localStorage
    const config = updatedModules.reduce((acc, curr) => ({
      ...acc,
      [curr.id]: curr.enabled
    }), {});
    localStorage.setItem("erp_modules_config", JSON.stringify(config));
    
    // Show save status
    setSaveStatus(true);
    setTimeout(() => setSaveStatus(false), 2000);
    
    // Trigger sidebar update (dispatch custom event)
    window.dispatchEvent(new Event('erp_modules_updated'));
  };

  return (
    <SettingsLayout categoryTitle="Module Management">
      <div className="space-y-8">
        <div className="flex items-center justify-between">
           <h2 className="text-[17px] font-black text-[#1A1A1A] dark:text-white flex items-center gap-2">
              ERP Modules <span className="text-sm opacity-60">✨</span>
           </h2>
           {saveStatus && (
              <div className="flex items-center gap-2 text-[#10B981] animate-in fade-in slide-in-from-right-4 duration-300">
                 <CheckCircle2 size={16} />
                 <span className="text-[12px] font-black uppercase">Configuration Synced</span>
              </div>
           )}
        </div>

        <p className="text-[13px] text-[#666] dark:text-slate-400">
          Enable or disable core ERP features based on your business needs. Turning off a module hides it from the sidebar and restricts access.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {modules.map((mod) => (
            <div 
              key={mod.id} 
              onClick={() => mod.enabled && router.push(mod.href)}
              className={`p-5 rounded-2xl border transition-all duration-300 flex items-start gap-4 group/card cursor-pointer ${
                mod.enabled 
                  ? "bg-white dark:bg-slate-900 border-[#7C3AED]/10 hover:border-[#7C3AED]/40 shadow-sm hover:shadow-md hover:shadow-purple-500/10 active:scale-[0.98]" 
                  : "bg-slate-50 dark:bg-slate-800/30 border-[#F0EAF0] dark:border-slate-800 opacity-70 grayscale cursor-not-allowed"
              }`}
            >
               <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 transition-transform group-hover/card:scale-110 ${
                  mod.enabled ? "bg-[#F3E8FF] text-[#7C3AED]" : "bg-gray-100 dark:bg-slate-800 text-gray-400"
               }`}>
                  <mod.icon size={24} strokeWidth={2} />
               </div>
               
               <div className="flex-1">
                  <div className="flex items-center justify-between">
                     <div className="flex items-center gap-2">
                        <h3 className={`text-[15px] font-black ${mod.enabled ? "text-[#1A1A1A] dark:text-white" : "text-gray-500 dark:text-slate-400"}`}>
                           {mod.name}
                        </h3>
                        {mod.enabled && <ChevronRight size={14} className="text-[#7C3AED] opacity-0 group-hover/card:opacity-100 transition-all translate-x-[-10px] group-hover/card:translate-x-0" />}
                     </div>
                     
                     <button 
                        onClick={(e) => { e.stopPropagation(); toggleModule(mod.id); }}
                        className={`relative w-11 h-6 rounded-full transition-colors duration-300 ${
                           mod.enabled ? "bg-[#10B981]" : "bg-gray-200 dark:bg-slate-700"
                        }`}
                     >
                        <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform duration-300 ${
                           mod.enabled ? "left-6" : "left-1"
                        }`} />
                     </button>
                  </div>
                  <p className="text-[12px] font-medium text-[#666] dark:text-slate-500 mt-1">
                     {mod.description}
                  </p>
               </div>
            </div>
          ))}
        </div>
      </div>
    </SettingsLayout>
  );
}
