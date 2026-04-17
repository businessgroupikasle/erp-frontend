"use client";

import { ChevronDown, FileText, Paperclip, MessageSquare, Phone, UserPlus } from "lucide-react";

interface DocumentOptionsProps {
  type: "invoice" | "quotation" | "purchase";
}

export default function DocumentOptions({ type }: DocumentOptionsProps) {
  const typeLabelMap = {
    invoice: "Invoice",
    quotation: "Quotation",
    purchase: "Purchase"
  };
  const typeLabel = typeLabelMap[type];

  return (
    <div className="space-y-12 pb-20">
      {/* Additional Fields */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
         {[
           { icon: Plus, label: "Add Terms & Conditions" },
           { icon: MessageSquare, label: "Add Notes" },
           { icon: Paperclip, label: "Add Attachments" },
           { icon: FileText, label: "Add Additional Info" },
           { icon: Phone, label: "Add Contact Details" }
         ].map((field, idx) => (
           <button key={idx} className="flex items-center gap-3 px-6 py-4 border border-[#E8DEE8] dark:border-slate-800 border-dashed rounded-xl text-xs font-bold text-[#666] hover:bg-slate-50 transition-all">
              <field.icon size={16} className="text-[#999]" />
              {field.label}
           </button>
         ))}
         <button className="flex items-center gap-3 px-6 py-4 border border-[#E8DEE8] dark:border-slate-800 border-dashed rounded-xl text-xs font-bold text-[#666] hover:bg-slate-50 transition-all">
            <UserPlus size={16} className="text-[#999]" />
            Add Signature
         </button>
      </div>

      {/* Recurring Document Toggle */}
      <div className="p-6 bg-slate-50/50 dark:bg-slate-900 rounded-2xl border border-[#F0EAF0] dark:border-slate-800 flex items-center gap-6">
         <div className="relative w-12 h-6 bg-[#CCC] rounded-full cursor-pointer transition-colors p-1">
            <div className="w-4 h-4 bg-white rounded-full transition-transform" />
         </div>
         <div className="flex flex-col">
            <span className="text-sm font-bold text-[#1A1A1A] dark:text-white leading-none mb-1">This is a Recurring {type}</span>
            <span className="text-[11px] text-[#999] font-medium leading-none">A draft {type} will be created with the same details every next period.</span>
         </div>
      </div>

      {/* Advanced Options */}
      <div className="space-y-6">
         <h3 className="text-sm font-bold text-[#1A1A1A] dark:text-white uppercase tracking-tight">Advanced options</h3>
         
         <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-6">
               <div className="space-y-2">
                  <label className="text-[11px] font-bold text-[#666] uppercase tracking-widest">Select HSN column view</label>
                  <div className="flex items-center justify-between p-3 border border-[#F0EAF0] rounded-lg bg-white cursor-pointer group hover:border-[#7C3AED]">
                     <span className="text-sm font-medium">Default</span>
                     <ChevronDown size={14} className="text-[#999]" />
                  </div>
               </div>
               <div className="space-y-2">
                  <label className="text-[11px] font-bold text-[#666] uppercase tracking-widest">Display unit as</label>
                  <div className="flex items-center justify-between p-3 border border-[#F0EAF0] rounded-lg bg-white cursor-pointer group hover:border-[#7C3AED]">
                     <span className="text-sm font-medium">Merge with quantity</span>
                     <ChevronDown size={14} className="text-[#999]" />
                  </div>
               </div>
               <div className="space-y-2">
                  <label className="text-[11px] font-bold text-[#666] uppercase tracking-widest">Show tax summary in {type}</label>
                  <div className="flex items-center justify-between p-3 border border-[#F0EAF0] rounded-lg bg-white cursor-pointer group hover:border-[#7C3AED]">
                     <span className="text-sm font-medium">Do not show</span>
                     <ChevronDown size={14} className="text-[#999]" />
                  </div>
               </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
               {[
                 "Hide place/country of supply",
                 `Show HSN summary in ${type}`,
                 "Add original images in line items",
                 "Show thumbnails in separate column",
                 "Show description in full width",
                 "Hide subtotal for group items",
                 `Show SKU in ${typeLabel}`,
                 `Show Serial Numbers in ${typeLabel}`,
                 "Display Batch Details in columns"
               ].map((option, idx) => (
                 <label key={idx} className="flex items-center gap-3 cursor-pointer group">
                    <div className="w-4 h-4 border-2 border-[#E8DEE8] rounded bg-white group-hover:border-[#7C3AED] transition-colors" />
                    <span className="text-[13px] text-[#666] font-medium group-hover:text-[#1A1A1A] transition-colors">{option}</span>
                 </label>
               ))}
            </div>
         </div>
      </div>

      {/* Footer Actions */}
      <div className="flex flex-col md:flex-row items-center gap-4 border-t border-[#F0EAF0] dark:border-slate-800 pt-10">
         <button className="w-full md:w-auto px-10 py-3 bg-[#E91E63] text-white rounded-lg font-bold text-sm tracking-wide shadow-lg shadow-pink-200 active:scale-95 transition-all">
            Save & Continue
         </button>
         <button className="w-full md:w-auto px-10 py-3 bg-white border-2 border-[#E91E63] text-[#E91E63] rounded-lg font-bold text-sm tracking-wide hover:bg-pink-50 transition-all active:scale-95">
            Save & Create New
         </button>
         <button className="w-full md:w-auto px-10 py-3 bg-white border-2 border-[#F0EAF0] text-[#1A1A1A] rounded-lg font-bold text-sm tracking-wide hover:bg-slate-50 transition-all active:scale-95">
            Save As Draft
         </button>
      </div>

      {/* Support Footer */}
      <div className="flex flex-col md:flex-row items-center justify-center gap-8 text-[11px] font-bold text-[#999] pt-20 uppercase tracking-widest">
         <div className="flex items-center gap-2">Download our app <span className="text-[#7C3AED]">PLAY</span></div>
         <div className="flex items-center gap-2">Reach out to us for any help <span className="text-[#7C3AED]">+91 91040 43036</span></div>
         <div className="flex items-center gap-2 hover:text-[#7C3AED] transition-colors cursor-pointer">Help and Support</div>
         <div className="flex items-center gap-2 hover:text-[#7C3AED] transition-colors cursor-pointer">FAQs</div>
      </div>
    </div>
  );
}

function Plus({ size, className }: { size: number, className: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <line x1="12" y1="5" x2="12" y2="19"></line>
      <line x1="5" y1="12" x2="19" y2="12"></line>
    </svg>
  );
}

