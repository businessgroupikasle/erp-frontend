"use client";

import DocumentHeader from "@/components/documents/DocumentHeader";
import BillingSection from "@/components/documents/BillingSection";
import LineItemsTable from "@/components/documents/LineItemsTable";
import DocumentSummary from "@/components/documents/DocumentSummary";
import DocumentOptions from "@/components/documents/DocumentOptions";
import { ChevronDown, Edit3, Settings, Calendar, Plus } from "lucide-react";

import { PurchaseOrderProvider } from "@/context/PurchaseOrderContext";

export default function NewPurchasePage() {
  return (
    <PurchaseOrderProvider>
      <div className="min-h-screen bg-[#FDFCFD] dark:bg-[#020617] -m-8">
        {/* Header Progress Tracker */}
        <DocumentHeader 
          activeStep={1} 
          steps={["Purchase Details", "Design & Share (optional)"]} 
        />

        <main className="max-w-[1400px] mx-auto p-10 space-y-8 pb-32">
          <div className="bg-white dark:bg-[#0A0D14] rounded-3xl border border-[#F0EAF0] dark:border-slate-800 shadow-2xl shadow-purple-100/20 p-10 space-y-12">
            
            {/* Top Purchase Title Section */}
            <div className="flex flex-col items-center justify-center gap-2 text-center pb-6 border-b border-[#F0EAF0] dark:border-slate-800">
              <h1 className="text-4xl font-black text-[#1A1A1A] dark:text-white flex items-center gap-3">
                 New Purchase Order
              </h1>
              <p className="text-sm font-medium text-[#666] dark:text-slate-400">
                 Create and manage vendor purchase orders with real-time tracking
              </p>
            </div>

          {/* Basic Controls Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
             <div className="space-y-6">
                <div className="flex items-center gap-8">
                   <label className="text-[13px] font-bold text-[#1A1A1A] w-32">Expense No<span className="text-red-500">*</span></label>
                   <span className="text-sm font-bold text-[#1A1A1A]">A00001</span>
                </div>
                <div className="flex items-center gap-8">
                   <label className="text-[13px] font-bold text-[#1A1A1A] w-32">Invoice No</label>
                   <div className="flex-1">
                      <input 
                        type="text" 
                        placeholder="Enter Invoice Number" 
                        className="w-full text-sm font-medium p-2 border-b border-[#F0EAF0] outline-none focus:border-[#7C3AED] transition-colors placeholder:text-[#BBB]"
                      />
                   </div>
                </div>
                <div className="flex items-center gap-8">
                   <label className="text-[13px] font-bold text-[#1A1A1A] w-32">Purchase Date<span className="text-red-500">*</span></label>
                   <div className="flex-1 flex items-center justify-between p-2 border-b border-[#F0EAF0] group hover:border-[#7C3AED] cursor-pointer transition-colors">
                      <span className="text-sm font-medium">Apr 16, 2026</span>
                      <Calendar size={16} className="text-[#999]" />
                   </div>
                </div>
                <div className="flex items-center gap-8">
                   <label className="text-[13px] font-bold text-[#1A1A1A] w-32">Due Date</label>
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
            fromLabel="Billed To"
            fromSubLabel="Your Details"
            toLabel="Billed By"
            toSubLabel="Vendor's Details"
            targetType="vendor"
          />

          {/* Configuration toolbar */}
          <div className="flex flex-wrap items-center gap-4 pt-8 border-t border-[#F0EAF0] dark:border-slate-800">
             <div className="flex items-center gap-4">
                <button className="px-4 py-2 bg-[#F9F7F9] text-[#7C3AED] rounded-lg text-xs font-bold hover:bg-purple-100 transition-all">% Configure GST</button>
             </div>
             <div className="flex-1" />
             <div className="flex items-center gap-4">
                <div className="space-y-1">
                   <label className="text-[10px] font-bold text-[#999] uppercase">Currency<span className="text-red-500">*</span></label>
                   <div className="w-48 flex items-center justify-between p-2 border border-[#F0EAF0] rounded-lg text-sm bg-white cursor-pointer hover:border-[#7C3AED]">
                      <span className="font-medium text-[#1A1A1A]">Indian Rupee (INR, ₹)</span>
                      <ChevronDown size={14} className="text-[#999]" />
                   </div>
                </div>
                <button className="flex items-center gap-2 px-4 py-2 border border-[#F0EAF0] rounded-lg text-xs font-bold text-[#666] hover:bg-slate-50 transition-all">
                   <span className="text-[#7C3AED]">123</span> Number and Currency Format
                </button>
                <button className="flex items-center gap-2 px-4 py-2 border border-[#F0EAF0] rounded-lg text-xs font-bold text-[#666] hover:bg-slate-50 transition-all">
                   <Plus size={14} /> Edit Columns/Formulas
                </button>
             </div>
          </div>

          <LineItemsTable />

          <DocumentSummary />

          <DocumentOptions type="purchase" />
        </div>
      </main>
    </div>
    </PurchaseOrderProvider>
  );
}
