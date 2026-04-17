"use client";

import DocumentHeader from "@/components/documents/DocumentHeader";
import BillingSection from "@/components/documents/BillingSection";
import LineItemsTable from "@/components/documents/LineItemsTable";
import DocumentSummary from "@/components/documents/DocumentSummary";
import DocumentOptions from "@/components/documents/DocumentOptions";
import { ChevronDown, Edit3, Settings, Calendar, Plus } from "lucide-react";

export default function NewQuotationPage() {
  return (
    <div className="min-h-screen bg-[#FDFCFD] dark:bg-[#020617] -m-8">
      {/* Header Progress Tracker */}
      <DocumentHeader 
        activeStep={1} 
        steps={["Add Quotation Details", "Design & Share (optional)"]} 
      />

      <main className="max-w-[1400px] mx-auto p-10 space-y-8 pb-32">
        <div className="bg-white dark:bg-[#0A0D14] rounded-3xl border border-[#F0EAF0] dark:border-slate-800 shadow-2xl shadow-purple-100/20 p-10 space-y-12">
          
          {/* Top Quotation Title Section */}
          <div className="flex flex-col items-center justify-center gap-4 text-center">
            <h1 className="text-4xl font-black text-[#1A1A1A] dark:text-white flex items-center gap-3">
               Quotation <Edit3 size={24} className="text-[#CCC] cursor-pointer hover:text-[#7C3AED] transition-colors" />
            </h1>
            <button className="text-[11px] font-bold text-[#7C3AED] uppercase tracking-widest flex items-center gap-2 hover:underline">
               <Plus size={14} /> Add Subtitle <span className="p-1 px-1.5 rounded bg-orange-100 text-orange-600 text-[8px]">Trial</span>
            </button>
          </div>

          {/* Basic Controls Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
             <div className="space-y-6">
                <div className="flex items-center gap-8">
                   <label className="text-[13px] font-bold text-[#1A1A1A] w-32">Quotation No<span className="text-red-500">*</span></label>
                   <span className="text-sm font-bold text-[#1A1A1A]">A00001</span>
                </div>
                <div className="flex items-center gap-8">
                   <label className="text-[13px] font-bold text-[#1A1A1A] w-32">Quotation Date<span className="text-red-500">*</span></label>
                   <div className="flex-1 flex items-center justify-between p-2 border-b border-[#F0EAF0] group hover:border-[#7C3AED] cursor-pointer transition-colors">
                      <span className="text-sm font-medium">Apr 16, 2026</span>
                      <Calendar size={16} className="text-[#999]" />
                   </div>
                </div>
                <div className="flex items-center gap-8">
                   <label className="text-[13px] font-bold text-[#1A1A1A] w-32">Valid Till Date</label>
                   <div className="flex-1 flex items-center gap-4">
                      <div className="flex-1 flex items-center justify-between p-2 border-b border-[#F0EAF0] group hover:border-[#7C3AED] cursor-pointer transition-colors">
                         <span className="text-sm font-medium">May 01, 2026</span>
                         <Calendar size={16} className="text-[#999]" />
                      </div>
                      <Settings size={16} className="text-[#999] cursor-pointer hover:text-[#7C3AED]" />
                      <span className="text-xl text-[#EEE] font-thin">|</span>
                      <Plus size={16} className="text-[#999] cursor-pointer hover:text-[#7C3AED]" />
                   </div>
                </div>
                <button className="text-[11px] font-bold text-[#7C3AED] uppercase tracking-widest flex items-center gap-2 hover:underline pt-4">
                   <Plus size={14} /> Add Custom Fields
                </button>
             </div>

             <div className="flex justify-end">
                <div className="w-64 h-32 border-2 border-dashed border-[#F0EAF0] dark:border-slate-800 rounded-xl flex flex-col items-center justify-center gap-3 cursor-pointer hover:bg-slate-50 transition-all text-center group">
                   <div className="p-2 rounded-lg bg-slate-100 group-hover:bg-[#7C3AED]/10 transition-colors">
                      <Plus size={24} className="text-[#CCC] group-hover:text-[#7C3AED]" />
                   </div>
                   <div className="flex flex-col">
                      <span className="text-[13px] font-bold text-[#666]">Add Business Logo</span>
                      <span className="text-[10px] text-[#999] leading-tight">Resolution up to 1080x1080px.<br/>PNG or JPEG file.</span>
                   </div>
                </div>
             </div>
          </div>

          <BillingSection 
            fromLabel="Quotation From"
            fromSubLabel="Your Details"
            toLabel="Quotation For"
            toSubLabel="Client's Details"
            targetType="client"
          />

          {/* Configuration toolbar */}
          <div className="flex flex-wrap items-center gap-4 pt-8">
             <label className="flex items-center gap-3 cursor-pointer">
                <div className="w-5 h-5 border-2 border-[#F0EAF0] rounded bg-white" />
                <span className="text-sm font-bold text-[#1A1A1A]">Add Shipping Details</span>
             </label>
             <div className="flex-1" />
             <div className="flex items-center gap-4">
                <div className="space-y-1">
                   <label className="text-[10px] font-bold text-[#999] uppercase">Currency<span className="text-red-500">*</span></label>
                   <div className="w-48 flex items-center justify-between p-2 border border-[#F0EAF0] rounded-lg text-sm bg-white cursor-pointer hover:border-[#7C3AED]">
                      <span className="font-medium text-[#1A1A1A]">Indian Rupee (INR, ₹)</span>
                      <ChevronDown size={14} className="text-[#999]" />
                   </div>
                </div>
             </div>
          </div>

          <LineItemsTable />

          <DocumentSummary />

          <DocumentOptions type="quotation" />
        </div>
      </main>
    </div>
  );
}
