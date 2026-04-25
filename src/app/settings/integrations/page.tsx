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
              <SectionHeader title="Payment Gateways" />
              {expandedSections.includes("Payment Gateways") && (
                <div className="py-8 space-y-10">
                   <div className="flex items-start justify-between gap-6 group">
                      <div className="space-y-1 max-w-xl">
                         <h4 className="text-[14px] font-black text-[#1A1A1A] dark:text-white">Enable Online Payments on your Invoices</h4>
                         <p className="text-[11px] font-medium text-[#999]">Integrate with Razorpay, Stripe, or PayPal to allow clients to pay directly from invoices.</p>
                      </div>
                      <button className="px-8 py-2.5 bg-white border border-[#F0EAF0] dark:border-slate-800 rounded-xl text-[12px] font-black text-[#1A1A1A] dark:text-white hover:bg-slate-50 transition-all shadow-sm">
                         Configure
                      </button>
                   </div>
                </div>
              )}
           </div>

           <div>
              <SectionHeader title="Email/SMS Services" />
              {expandedSections.includes("Email/SMS Services") && (
                <div className="py-8 space-y-10">
                   <div className="flex items-start justify-between gap-6 group">
                      <div className="space-y-1 max-w-xl">
                         <h4 className="text-[14px] font-black text-[#1A1A1A] dark:text-white">Automated Notifications (SendGrid / Twilio)</h4>
                         <p className="text-[11px] font-medium text-[#999]">Auto-send invoice via email/SMS after sales or notify users on status changes.</p>
                      </div>
                      <button className="px-6 py-2.5 bg-white border border-[#F0EAF0] dark:border-slate-800 rounded-xl text-[12px] font-black text-[#1A1A1A] dark:text-white hover:bg-slate-50 transition-all shadow-sm">
                         Manage Templates
                      </button>
                   </div>
                </div>
              )}
           </div>

           <div>
              <SectionHeader title="Accounting Tools" />
              {expandedSections.includes("Accounting Tools") && (
                <div className="py-8 space-y-10">
                   <div className="flex items-start justify-between gap-6 group">
                      <div className="space-y-1 max-w-xl">
                         <h4 className="text-[14px] font-black text-[#1A1A1A] dark:text-white">QuickBooks / Tally Integration</h4>
                         <p className="text-[11px] font-medium text-[#999]">Sync your invoices, payments, and expenses automatically with your external accounting software.</p>
                      </div>
                      <button className="px-8 py-2.5 bg-white border border-[#F0EAF0] dark:border-slate-800 rounded-xl text-[12px] font-black text-[#1A1A1A] dark:text-white hover:bg-slate-50 transition-all shadow-sm">
                         Connect
                      </button>
                   </div>
                </div>
              )}
           </div>
        </div>
      </div>
    </SettingsLayout>
  );
}
