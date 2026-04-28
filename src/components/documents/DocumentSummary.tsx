import { ChevronDown, Plus, Info, CheckCircle2, AlertCircle } from "lucide-react";
import { usePurchaseOrder } from "@/context/PurchaseOrderContext";

export default function DocumentSummary() {
  const { totals, selectedVendor, useAdvance, setUseAdvance } = usePurchaseOrder();

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount).replace("₹", "₹ ");
  };

  return (
    <div className="flex flex-col md:flex-row justify-between py-12 gap-12 border-t border-[#F0EAF0] dark:border-slate-800">
      {/* Left Side: Hints & Info */}
      <div className="flex-1 space-y-6">
         {selectedVendor && selectedVendor.advanceBalance > 0 && (
           <div className={`p-6 rounded-2xl border transition-all duration-500 ${useAdvance ? 'bg-purple-50 border-purple-200' : 'bg-white border-[#F0EAF0]'}`}>
              <div className="flex items-start gap-4">
                 <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${useAdvance ? 'bg-[#7C3AED] text-white' : 'bg-slate-100 text-[#999]'}`}>
                    <CheckCircle2 size={20} />
                 </div>
                 <div className="flex-1">
                    <h4 className="text-sm font-black text-[#1A1A1A] dark:text-white leading-none mb-1">Apply Available Advance</h4>
                    <p className="text-xs text-[#666] font-medium">Vendor has {formatCurrency(selectedVendor.advanceBalance)} available as advance.</p>
                    
                    <div className="mt-4 flex items-center gap-4">
                       <button 
                         onClick={() => setUseAdvance(!useAdvance)}
                         className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${useAdvance ? 'bg-[#7C3AED] text-white shadow-lg shadow-purple-200' : 'bg-white border border-[#E8DEE8] text-[#666] hover:bg-slate-50'}`}
                       >
                         {useAdvance ? 'Applied' : 'Use Advance'}
                       </button>
                       {useAdvance && (
                         <div className="text-[11px] font-bold text-[#7C3AED] animate-in fade-in slide-in-from-left-2">
                           Using {formatCurrency(totals.appliedAdvance)}
                         </div>
                       )}
                    </div>
                 </div>
              </div>
           </div>
         )}

         <div className="p-6 bg-slate-50/50 dark:bg-slate-900 rounded-2xl border border-dashed border-[#F0EAF0] dark:border-slate-800">
            <div className="flex items-center gap-3 text-[#999] mb-4">
               <Info size={16} />
               <span className="text-[10px] font-bold uppercase tracking-widest">Financial Summary Hint</span>
            </div>
            <p className="text-xs text-[#666] font-medium leading-relaxed">
               Total amount includes all item subtotals and taxes. If you apply advance, it will be deducted from the total to show the final balance due.
            </p>
         </div>
      </div>

      {/* Right Side: Summary Card */}
      <div className="w-full md:w-[400px]">
        <div className="bg-[#1A1A1A] dark:bg-slate-950 rounded-3xl p-8 shadow-2xl shadow-slate-200/50 space-y-6">
           <h3 className="text-[10px] font-bold text-white/40 uppercase tracking-[0.2em]">Payment Summary</h3>
           
           <div className="space-y-4">
              <div className="flex justify-between items-center text-sm">
                <span className="text-white/60 font-medium">Subtotal</span>
                <span className="font-bold text-white tracking-tight">{formatCurrency(totals.subtotal)}</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-white/60 font-medium">Aggregate GST</span>
                <span className="font-bold text-white tracking-tight">{formatCurrency(totals.totalGst)}</span>
              </div>
              <div className="h-px bg-white/10 w-full" />
              <div className="flex justify-between items-center">
                <span className="text-sm font-black text-white uppercase tracking-tighter">Total Amount</span>
                <span className="text-2xl font-black text-white tracking-tighter">{formatCurrency(totals.total)}</span>
              </div>
           </div>

           <div className="pt-6 mt-6 border-t border-white/10 space-y-4">
              <div className="flex justify-between items-center text-sm">
                <span className="text-white/60 font-medium">Advance Paid</span>
                <span className="font-bold text-green-400">
                  {formatCurrency(totals.appliedAdvance)}
                </span>
              </div>
              <div className="flex justify-between items-center py-4 px-6 bg-white/5 rounded-2xl border border-white/5">
                <span className="text-sm font-black text-white uppercase tracking-tighter">Balance Due</span>
                <span className="text-xl font-black text-red-500 tracking-tight">
                  {formatCurrency(totals.balanceDue)}
                </span>
              </div>
           </div>
        </div>

        <div className="mt-8 space-y-4 px-4">
           <button className="flex items-center gap-2 text-[10px] font-bold text-[#7C3AED] uppercase tracking-widest hover:underline group">
              <Plus size={12} className="group-hover:rotate-90 transition-transform" /> Add Notes (Optional)
           </button>
           <button className="flex items-center gap-2 text-[10px] font-bold text-[#7C3AED] uppercase tracking-widest hover:underline group">
              <Plus size={12} className="group-hover:rotate-90 transition-transform" /> Add Terms & Conditions
           </button>
        </div>
      </div>
    </div>
  );
}
