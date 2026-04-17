"use client";

import { useState } from "react";
import SettingsLayout from "@/components/modules/settings/SettingsLayout";
import { ChevronDown, ChevronUp } from "lucide-react";

export default function IntegrationsSettingsPage() {
  const [expandedSections, setExpandedSections] = useState<string[]>([
    "Accounting Integrations", "CRM Integrations"
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
        className="w-full flex items-center gap-4 py-6 border-b border-[#FDFCFD] dark:border-slate-800 group"
      >
        {isExpanded ? <ChevronUp size={20} className="text-[#1A1A1A] dark:text-white" /> : <ChevronDown size={20} className="text-[#999]" />}
        <h3 className="text-[15px] font-black text-[#1A1A1A] dark:text-white">{title}</h3>
      </button>
    );
  };

  return (
    <SettingsLayout>
      <div className="space-y-6">
        <h2 className="text-[17px] font-black text-[#1A1A1A] dark:text-white mb-8">Integrations</h2>

        <div className="space-y-4 max-w-4xl">
           <div>
              <SectionHeader title="Accounting Integrations" />
              {expandedSections.includes("Accounting Integrations") && (
                <div className="py-8 space-y-10">
                   {/* Invoices API */}
                   <div className="flex items-start justify-between gap-6 group">
                      <div className="space-y-1 max-w-xl">
                         <h4 className="text-[14px] font-black text-[#1A1A1A] dark:text-white">Enable Refrens Invoices API</h4>
                         <p className="text-[11px] font-medium text-[#999]">Create, edit, and share invoices and other documents via an API linked to your Website or App.</p>
                         <p className="text-[10px] font-bold text-[#7C3AED] underline cursor-pointer">View Documentation &gt;</p>
                      </div>
                      <button className="px-6 py-2.5 bg-white border border-[#F0EAF0] dark:border-slate-800 rounded-xl text-[12px] font-black text-[#1A1A1A] dark:text-white flex items-center gap-2 hover:bg-slate-50 transition-all shadow-sm">
                         <span className="opacity-40">✨</span>
                         Generate API Keys
                      </button>
                   </div>

                   {/* Shopify */}
                   <div className="flex items-start justify-between gap-6 group">
                      <div className="space-y-1 max-w-xl">
                         <h4 className="text-[14px] font-black text-[#1A1A1A] dark:text-white">Integrate Refrens with your Shopify store</h4>
                         <p className="text-[11px] font-medium text-[#999]">Install the Refrens app on Shopify store to automate and share invoices at checkout using API keys.</p>
                      </div>
                      <button className="px-6 py-2.5 bg-white border border-[#F0EAF0] dark:border-slate-800 rounded-xl text-[12px] font-black text-[#1A1A1A] dark:text-white hover:bg-slate-50 transition-all shadow-sm">
                         View Shopify App
                      </button>
                   </div>

                   {/* Third Party */}
                   <div className="flex items-start justify-between gap-6 group">
                      <div className="space-y-1 max-w-xl">
                         <h4 className="text-[14px] font-black text-[#1A1A1A] dark:text-white">Integrate Refrens with Third-party Applications</h4>
                         <p className="text-[11px] font-medium text-[#999]">Integrated with Stripe, Razorpay, WooCommerce, and many other third-party platforms using Pabbly Connect.</p>
                      </div>
                      <button className="px-8 py-2.5 bg-white border border-[#F0EAF0] dark:border-slate-800 rounded-xl text-[12px] font-black text-[#1A1A1A] dark:text-white hover:bg-slate-50 transition-all shadow-sm">
                         Learn More
                      </button>
                   </div>

                   {/* Online Payments */}
                   <div className="flex items-start justify-between gap-6 group">
                      <div className="space-y-1 max-w-xl">
                         <h4 className="text-[14px] font-black text-[#1A1A1A] dark:text-white">Enable Online Payments on your Invoices</h4>
                         <p className="text-[11px] font-medium text-[#999]">Generate Payment Links to allow your clients to pay directly from your invoices</p>
                      </div>
                      <button className="px-8 py-2.5 bg-white border border-[#F0EAF0] dark:border-slate-800 rounded-xl text-[12px] font-black text-[#1A1A1A] dark:text-white hover:bg-slate-50 transition-all shadow-sm">
                         Enable Now
                      </button>
                   </div>
                </div>
              )}
           </div>

           <div>
              <SectionHeader title="CRM Integrations" />
              {expandedSections.includes("CRM Integrations") && (
                <div className="py-12 text-center text-[#999] text-[13px] font-medium italic opacity-60">
                   Connect with WhatsApp, Email and other CRM tools.
                </div>
              )}
           </div>
        </div>
      </div>
    </SettingsLayout>
  );
}
