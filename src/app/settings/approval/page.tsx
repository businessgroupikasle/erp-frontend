"use client";

import { useState } from "react";
import SettingsLayout from "@/components/modules/settings/SettingsLayout";
import { 
  Plus, 
  Trash2, 
  Users, 
  Settings2, 
  CheckCircle2, 
  AlertCircle, 
  ArrowRight,
  ShieldCheck,
  ShoppingBag,
  CircleDollarSign,
  Package,
  Layers,
  ChevronRight,
  Settings,
  MoreVertical
} from "lucide-react";
import { clsx } from "clsx";

export default function ApprovalSettingsPage() {
  const [activeModule, setActiveModule] = useState("Purchase");
  const [workflows, setWorkflows] = useState<any>({
    Purchase: {
      enabled: true,
      mode: 'Manual',
      steps: [
        { id: 1, role: 'Manager', level: 'Level 1', condition: 'All amounts' },
        { id: 2, role: 'Admin', level: 'Level 2', condition: 'Amount > 50,000' }
      ]
    },
    Sales: {
      enabled: true,
      mode: 'Auto',
      steps: [
        { id: 1, role: 'Sales Head', level: 'Level 1', condition: 'All deals' }
      ]
    },
    Inventory: {
      enabled: false,
      mode: 'Manual',
      steps: []
    }
  });

  const [showAddStep, setShowAddStep] = useState(false);

  const modules = [
    { name: "Purchase", icon: ShoppingBag, color: "text-blue-500", bg: "bg-blue-50" },
    { name: "Sales", icon: CircleDollarSign, color: "text-emerald-500", bg: "bg-emerald-50" },
    { name: "Inventory", icon: Package, color: "text-orange-500", bg: "bg-orange-50" }
  ];

  const toggleWorkflow = (mod: string) => {
    setWorkflows({
      ...workflows,
      [mod]: { ...workflows[mod], enabled: !workflows[mod].enabled }
    });
  };

  const currentWorkflow = workflows[activeModule];

  return (
    <SettingsLayout categoryTitle="Approval Workflows">
      <div className="space-y-8 animate-in fade-in duration-500">
        <div className="flex items-center justify-between">
           <div>
              <h2 className="text-[17px] font-black text-[#1A1A1A] dark:text-white">Approval Workflow Settings</h2>
              <p className="text-[12px] font-medium text-[#999] mt-1">Configure multi-level approval rules and assign authorized approvers.</p>
           </div>
           <button className="px-5 py-2.5 bg-[#7C3AED] hover:bg-[#6D28D9] text-white rounded-xl font-bold text-[13px] flex items-center gap-2 transition-all active:scale-95 shadow-lg shadow-purple-200/50">
              <Plus size={16} /> Create New Workflow
           </button>
        </div>

        {/* Module Selection Tabs */}
        <div className="flex items-center gap-3 p-1.5 bg-slate-50 dark:bg-slate-800/50 rounded-2xl w-fit">
           {modules.map((mod) => (
              <button 
                key={mod.name}
                onClick={() => setActiveModule(mod.name)}
                className={clsx(
                  "px-6 py-2.5 rounded-xl text-[13px] font-black transition-all flex items-center gap-2.5",
                  activeModule === mod.name 
                    ? "bg-white dark:bg-slate-900 text-[#7C3AED] shadow-sm" 
                    : "text-[#666] hover:text-[#1A1A1A] dark:hover:text-white"
                )}
              >
                 <mod.icon size={16} className={activeModule === mod.name ? "text-[#7C3AED]" : "text-[#999]"} />
                 {mod.name}
              </button>
           ))}
        </div>

        {/* Main Workflow Area */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
           
           {/* Left: Configuration Summary */}
           <div className="lg:col-span-1 space-y-6">
              <div className="p-6 bg-white dark:bg-slate-900 border border-[#F0EAF0] dark:border-slate-800 rounded-3xl space-y-6 shadow-sm">
                 <div className="flex items-center justify-between">
                    <h3 className="text-[14px] font-black text-[#1A1A1A] dark:text-white uppercase tracking-wider">Status & Mode</h3>
                    <div 
                      onClick={() => toggleWorkflow(activeModule)}
                      className={clsx(
                        "w-10 h-5 rounded-full relative cursor-pointer transition-colors",
                        currentWorkflow.enabled ? "bg-[#10B981]" : "bg-gray-200 dark:bg-slate-700"
                      )}
                    >
                       <div className={clsx(
                         "absolute top-0.5 w-4 h-4 bg-white rounded-full shadow-sm transition-all",
                         currentWorkflow.enabled ? "left-5.5" : "left-0.5"
                       )} />
                    </div>
                 </div>

                 <div className="space-y-4">
                    <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl space-y-3">
                       <label className="text-[11px] font-black text-[#999] uppercase">Approval Method</label>
                       <div className="flex gap-2">
                          {['Manual', 'Auto'].map((mode) => (
                             <button 
                               key={mode}
                               className={clsx(
                                 "flex-1 py-2 rounded-lg text-[12px] font-bold transition-all",
                                 currentWorkflow.mode === mode 
                                   ? "bg-[#7C3AED] text-white" 
                                   : "bg-white dark:bg-slate-900 border border-[#F0EAF0] dark:border-slate-800 text-[#666]"
                               )}
                             >
                                {mode}
                             </button>
                          ))}
                       </div>
                    </div>

                    <div className="p-4 bg-[#F3E8FF]/30 dark:bg-purple-900/10 rounded-2xl space-y-2">
                       <div className="flex items-center gap-2 text-[#7C3AED]">
                          <AlertCircle size={14} />
                          <span className="text-[12px] font-black uppercase">Conditions</span>
                       </div>
                       <p className="text-[11px] font-medium text-[#666] leading-relaxed">
                          Applying {currentWorkflow.steps.length} levels of authorization for all {activeModule} documents.
                       </p>
                    </div>
                 </div>
              </div>

              <div className="p-5 border border-[#F0EAF0] dark:border-slate-800 rounded-2xl flex items-center gap-4">
                 <div className="w-10 h-10 rounded-xl bg-orange-50 text-orange-500 flex items-center justify-center">
                    <ShieldCheck size={20} />
                 </div>
                 <div>
                    <p className="text-[13px] font-black text-[#1A1A1A] dark:text-white">Security Override</p>
                    <p className="text-[11px] font-medium text-[#999]">Allow Super Admin to bypass workflows</p>
                 </div>
                 <div className="ml-auto w-8 h-4 bg-slate-100 rounded-full"></div>
              </div>
           </div>

           {/* Right: Steps Visualizer */}
           <div className="lg:col-span-2">
              <div className="bg-white dark:bg-slate-900 border border-[#F0EAF0] dark:border-slate-800 rounded-3xl p-8 space-y-8 relative overflow-hidden">
                 <div className="flex items-center justify-between mb-2">
                    <h3 className="text-[15px] font-black text-[#1A1A1A] dark:text-white">Approval Steps Sequence</h3>
                    <span className="px-3 py-1 bg-slate-100 dark:bg-slate-800 rounded-lg text-[11px] font-black text-[#666]">{currentWorkflow.steps.length} Levels Defined</span>
                 </div>

                 {currentWorkflow.steps.length === 0 ? (
                    <div className="py-20 flex flex-col items-center justify-center text-center space-y-4">
                       <div className="w-16 h-16 rounded-3xl bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-[#999]">
                          <Settings2 size={32} />
                       </div>
                       <div className="space-y-1">
                          <p className="text-[14px] font-black text-[#1A1A1A] dark:text-white">No Approval Steps Defined</p>
                          <p className="text-[12px] font-medium text-[#999]">Start by adding the first level of authority.</p>
                       </div>
                       <button className="mt-4 px-6 py-2.5 border border-[#7C3AED] text-[#7C3AED] rounded-xl font-bold text-[13px] hover:bg-purple-50 transition-all">
                          Add First Step
                       </button>
                    </div>
                 ) : (
                    <div className="space-y-6 relative">
                       {/* Connector Line */}
                       <div className="absolute left-6 top-8 bottom-8 w-0.5 bg-[#F0EAF0] dark:bg-slate-800 hidden md:block" />

                       {currentWorkflow.steps.map((step: any, index: number) => (
                          <div key={step.id} className="relative flex flex-col md:flex-row gap-6 group">
                             {/* Step Marker */}
                             <div className="w-12 h-12 rounded-2xl bg-white dark:bg-slate-900 border-4 border-[#F3E8FF] dark:border-purple-900/30 flex items-center justify-center text-[#7C3AED] font-black text-[15px] z-10 shrink-0 shadow-sm group-hover:scale-110 transition-transform">
                                {index + 1}
                             </div>

                             {/* Step Card */}
                             <div className="flex-1 p-5 bg-white dark:bg-slate-900 border border-[#F0EAF0] dark:border-slate-800 rounded-2xl flex items-center justify-between group-hover:border-[#7C3AED]/30 transition-all">
                                <div className="flex items-center gap-4">
                                   <div className="w-10 h-10 rounded-xl bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-[#666]">
                                      <Users size={18} />
                                   </div>
                                   <div>
                                      <div className="flex items-center gap-2">
                                         <p className="text-[14px] font-black text-[#1A1A1A] dark:text-white">{step.role}</p>
                                         <span className="text-[10px] font-black px-1.5 py-0.5 bg-blue-50 text-blue-500 rounded uppercase tracking-wider">{step.level}</span>
                                      </div>
                                      <p className="text-[11px] font-medium text-[#999] mt-0.5">Condition: <span className="text-[#666] font-bold">{step.condition}</span></p>
                                   </div>
                                </div>

                                <div className="flex items-center gap-3">
                                   <button className="p-2 text-[#999] hover:text-[#7C3AED] hover:bg-purple-50 dark:hover:bg-slate-800 rounded-lg transition-all">
                                      <Settings size={16} />
                                   </button>
                                   <button className="p-2 text-[#999] hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10 rounded-lg transition-all">
                                      <Trash2 size={16} />
                                   </button>
                                </div>
                             </div>

                             {/* Connector Arrow (Desktop) */}
                             {index < currentWorkflow.steps.length - 1 && (
                                <div className="absolute left-[22px] bottom-[-20px] text-[#F0EAF0] dark:text-slate-800 hidden md:block">
                                   <ArrowRight size={12} className="rotate-90" />
                                </div>
                             )}
                          </div>
                       ))}

                       <button className="w-full py-4 border-2 border-dashed border-[#F0EAF0] dark:border-slate-800 rounded-2xl text-[13px] font-bold text-[#999] hover:text-[#7C3AED] hover:border-[#7C3AED]/30 hover:bg-purple-50/30 transition-all flex items-center justify-center gap-2 group">
                          <Plus size={16} className="group-hover:scale-125 transition-transform" /> Add Approval Level
                       </button>
                    </div>
                 )}
              </div>
           </div>

        </div>
      </div>
    </SettingsLayout>
  );
}
