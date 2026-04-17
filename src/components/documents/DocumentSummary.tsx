"use client";

import { ChevronDown, Plus } from "lucide-react";

export default function InvoiceSummary() {
  return (
    <div className="flex flex-col md:flex-row justify-end py-12 gap-12">
      <div className="w-full md:w-80 space-y-6">
        <div className="flex items-center justify-between text-sm font-bold text-[#1A1A1A] uppercase tracking-tight">
           <span>Show Total in PDF</span>
           <span className="text-[#CCC] cursor-pointer">👁</span>
        </div>

        <div className="space-y-3">
           <div className="flex justify-between items-center text-sm">
             <span className="text-[#666] font-medium">Amount</span>
             <span className="font-bold text-[#1A1A1A]">₹1,050.00</span>
           </div>
           <div className="flex justify-between items-center text-sm">
             <span className="text-[#666] font-medium">SGST</span>
             <span className="font-bold text-[#1A1A1A]">₹25.00</span>
           </div>
           <div className="flex justify-between items-center text-sm">
             <span className="text-[#666] font-medium">CGST</span>
             <span className="font-bold text-[#1A1A1A]">₹25.00</span>
           </div>
        </div>

        <div className="pt-4 border-t border-[#F0EAF0] space-y-4">
           <button className="flex items-center gap-2 text-[11px] font-bold text-[#7C3AED] uppercase tracking-widest hover:underline">
              Add Discounts <ChevronDown size={12} />
           </button>
           <button className="flex items-center gap-2 text-[11px] font-bold text-[#7C3AED] uppercase tracking-widest hover:underline">
              <Plus size={12} /> Add Additional Charges <ChevronDown size={12} />
           </button>
        </div>

        <div className="py-6 bg-[#F9F7F9] px-6 rounded-xl flex justify-between items-center">
           <span className="text-sm font-black text-[#1A1A1A] uppercase tracking-tighter">Total (INR)</span>
           <span className="text-xl font-black text-[#1A1A1A]">₹1,100.00</span>
        </div>

        <button className="text-[11px] font-bold text-[#7C3AED] uppercase tracking-widest hover:underline flex items-center gap-2">
           <Plus size={12} /> Add Custom Fields
        </button>

        <div className="pt-10 space-y-4">
           <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-[#1A1A1A] uppercase tracking-widest">Show Total In Words</span>
              <span className="text-[#CCC]">👁</span>
           </div>
           <div className="p-4 bg-[#F9F7F9] rounded-lg border border-dashed border-[#F0EAF0] text-[11px] font-medium text-[#999] leading-relaxed italic">
              Total (in words) <br/>
              One Thousand One Hundred Rupees Only
           </div>
        </div>
      </div>
    </div>
  );
}
