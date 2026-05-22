"use client";

import { usePurchaseOrder } from "@/context/PurchaseOrderContext";
import { Info, Tag, Truck, ArrowRight, ShieldCheck, Banknote } from "lucide-react";
import { clsx } from "clsx";

export default function DocumentSummary() {
  const { 
    totals, 
    useAdvance, 
    setUseAdvance, 
    selectedVendor,
    discountAmount, setDiscountAmount,
    freightCost, setFreightCost
  } = usePurchaseOrder();

  return (
    <div className="bg-white dark:bg-[#0A0D14] rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xl shadow-slate-100 overflow-hidden">
      {/* Financial Header */}
      <div className="bg-slate-50 dark:bg-slate-900/50 px-6 py-4 border-b border-slate-100 dark:border-slate-800">
        <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2">
          <ShieldCheck size={12} className="text-green-500" /> Financial Summary
        </h3>
      </div>

      <div className="p-6 space-y-6">
        {/* Core Totals */}
        <div className="space-y-3">
          <div className="flex justify-between items-center text-xs font-bold text-slate-500">
            <span className="flex items-center gap-2">Subtotal</span>
            <span className="text-slate-700 dark:text-slate-300 font-black">₹{totals.subtotal.toLocaleString()}</span>
          </div>
          
          <div className="flex justify-between items-center text-xs font-bold text-slate-500">
            <span className="flex items-center gap-2">Tax Amount (GST)</span>
            <span className="text-slate-700 dark:text-slate-300 font-black">₹{totals.totalGst.toLocaleString()}</span>
          </div>

          {/* Dynamic Adjustments */}
          <div className="flex justify-between items-center text-xs font-bold text-slate-500 group">
             <div className="flex items-center gap-2">
                <Tag size={12} className="text-slate-300 group-hover:text-orange-500 transition-colors" />
                <span>Discount</span>
             </div>
             <input 
               type="number"
               value={discountAmount || ""}
               onChange={(e) => setDiscountAmount(parseFloat(e.target.value) || 0)}
               placeholder="0.00"
               className="w-24 text-right bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg p-1.5 outline-none font-black text-slate-900 dark:text-white focus:border-orange-500 transition-colors shadow-sm"
             />
          </div>

          <div className="flex justify-between items-center text-xs font-bold text-slate-500 group">
             <div className="flex items-center gap-2">
                <Truck size={12} className="text-slate-300 group-hover:text-blue-500 transition-colors" />
                <span>Freight / Shipping</span>
             </div>
             <input 
               type="number"
               value={freightCost || ""}
               onChange={(e) => setFreightCost(parseFloat(e.target.value) || 0)}
               placeholder="0.00"
               className="w-24 text-right bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg p-1.5 outline-none font-black text-slate-900 dark:text-white focus:border-blue-500 transition-colors shadow-sm"
             />
          </div>

          <div className="flex justify-between items-center text-xs font-bold text-slate-400 italic">
            <span>Roundoff</span>
            <span>{totals.roundoff >= 0 ? "+" : ""}{totals.roundoff.toFixed(2)}</span>
          </div>
        </div>

        {/* Tax Breakdown Accordion-like list */}
        <div className="bg-slate-50/50 dark:bg-slate-900/50 rounded-xl p-4 border border-slate-100 dark:border-slate-800 space-y-2">
           <div className="flex justify-between text-[9px] font-black text-slate-400 uppercase tracking-widest">
              <span>GST Split</span>
              <Info size={10} />
           </div>
           <div className="flex justify-between text-[10px] font-bold text-slate-500">
              <span>CGST (Central Tax)</span>
              <span>₹{totals.cgst.toLocaleString()}</span>
           </div>
           <div className="flex justify-between text-[10px] font-bold text-slate-500">
              <span>SGST (State Tax)</span>
              <span>₹{totals.sgst.toLocaleString()}</span>
           </div>
        </div>

        {/* Settlement Selection */}
        <div className="space-y-3 pt-4 border-t border-slate-100 dark:border-slate-800">
          <div className="flex items-center justify-between">
             <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
               <Banknote size={12} /> Settlement
             </h4>
             {selectedVendor && selectedVendor.advanceBalance > 0 && (
               <span className="text-[9px] font-black text-green-600 bg-green-50 px-2 py-0.5 rounded border border-green-100">
                  ₹{selectedVendor.advanceBalance.toLocaleString()} Available
               </span>
             )}
          </div>

          <label 
            className={clsx(
              "flex items-center justify-between p-3 rounded-xl border-2 transition-all cursor-pointer group",
              useAdvance 
                ? "bg-orange-50 border-orange-200" 
                : "bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800 hover:border-slate-200"
            )}
          >
            <div className="flex items-center gap-3">
              <input 
                type="checkbox"
                checked={useAdvance}
                onChange={(e) => setUseAdvance(e.target.checked)}
                className="w-4 h-4 rounded text-orange-500 focus:ring-orange-400 cursor-pointer"
              />
              <div className="flex flex-col">
                <span className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-tight">Apply Advance</span>
                <span className="text-[10px] font-bold text-slate-400">Deduct from vendor credit</span>
              </div>
            </div>
            {useAdvance && (
              <span className="text-xs font-black text-orange-600">-₹{totals.appliedAdvance.toLocaleString()}</span>
            )}
          </label>
        </div>

        {/* Grand Total */}
        <div className="pt-6 border-t border-slate-100 dark:border-slate-800 space-y-1">
           <div className="flex justify-between items-center">
              <span className="text-sm font-black text-slate-400 uppercase tracking-widest">Grand Total</span>
              <span className="text-2xl font-black text-slate-900 dark:text-white">₹{totals.total.toLocaleString()}</span>
           </div>
           {useAdvance && (
             <div className="flex justify-between items-center text-sm font-black text-orange-600 pt-2">
               <span className="uppercase tracking-widest">Balance Due</span>
               <span className="flex items-center gap-1">
                  ₹{totals.balanceDue.toLocaleString()} <ArrowRight size={14} />
               </span>
             </div>
           )}
        </div>
      </div>

      {/* Trust Badge */}
      <div className="bg-slate-900 px-6 py-4 flex items-center justify-between">
         <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
            <span className="text-[10px] font-black text-white/50 uppercase tracking-widest">Accounting Ready</span>
         </div>
         <span className="text-[10px] font-black text-white uppercase tracking-widest">v2.0</span>
      </div>
    </div>
  );
}
