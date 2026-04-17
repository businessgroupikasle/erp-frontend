"use client";

import { CheckCircle2, ChevronRight } from "lucide-react";
import Link from "next/link";

export default function GSTR2BReport() {
  return (
    <div className="min-h-screen bg-[#FDFCFD] dark:bg-[#020617] -m-8 font-sans">
      <div className="p-8 space-y-6">
        {/* Breadcrumbs */}
        <div className="flex items-center gap-2 text-[10px] font-bold text-[#999] uppercase tracking-widest">
           <Link href="/" className="hover:text-[#7C3AED]">Azeez</Link>
           <ChevronRight size={10} />
           <Link href="/reports" className="hover:text-[#7C3AED]">Accounting Reports</Link>
           <ChevronRight size={10} />
           <span className="text-[#666]">GSTR-2B Purchase Report</span>
        </div>

        <div className="flex items-center justify-center pt-8">
          <div className="max-w-6xl w-full bg-white dark:bg-slate-900 rounded-[32px] border border-[#F0EAF0] dark:border-slate-800 shadow-xl overflow-hidden grid grid-cols-1 lg:grid-cols-2">
             <div className="p-16 flex flex-col justify-center space-y-8">
                <h1 className="text-4xl font-black text-[#1A1A1A] dark:text-white leading-tight">
                   GSTR-2B Reports and <br/>Automated Reconciliation.
                </h1>
                <div className="space-y-4">
                   {[
                     "View and Download your GSTR-2B reports",
                     "Auto-reconcile your Purchases with GSTR-2B Report",
                     "Maximise your ITC Claims",
                     "Email and WhatsApp your Vendors for missing invoices"
                   ].map((feat, i) => (
                     <div key={i} className="flex items-center gap-3">
                        <CheckCircle2 className="text-[#10B981]" size={20} />
                        <span className="text-sm font-bold text-[#444] dark:text-slate-300">{feat}</span>
                     </div>
                   ))}
                </div>
                <div className="pt-4 flex flex-col gap-4 max-w-sm">
                   <button className="w-full py-4 bg-[#D81159] hover:bg-[#B00E4A] text-white rounded-xl font-bold text-sm shadow-xl shadow-pink-200/50 transition-all active:scale-95">
                     Get Your GSTR-2B Report
                   </button>
                   <button className="w-full py-4 border border-[#F0EAF0] dark:border-slate-800 hover:bg-slate-50 text-[13px] font-bold text-[#666] dark:text-slate-400 rounded-xl transition-all">
                     Learn how it works ↗
                   </button>
                </div>
             </div>
             <div className="bg-[#F8F7FF] dark:bg-slate-800/50 p-12 flex items-center justify-center">
                <div className="relative w-full aspect-[4/3] bg-white dark:bg-slate-900 rounded-xl shadow-2xl overflow-hidden border border-[#F0EAF0] dark:border-slate-800 p-6 space-y-4">
                   <div className="flex items-center justify-between border-b pb-4">
                      <div className="flex items-center gap-2">
                         <span className="w-6 h-6 bg-purple-100 rounded flex items-center justify-center font-bold text-[10px] text-purple-600">G</span>
                         <span className="text-[12px] font-black italic">GSTR-2B Purchase Report</span>
                      </div>
                      <div className="w-16 h-6 bg-slate-100 dark:bg-slate-800 rounded" />
                   </div>
                   <div className="space-y-4">
                      <div className="grid grid-cols-3 gap-4">
                         <div className="h-20 bg-slate-50 dark:bg-slate-800 rounded-lg" />
                         <div className="h-20 bg-slate-50 dark:bg-slate-800 rounded-lg" />
                         <div className="h-20 bg-slate-50 dark:bg-slate-800 rounded-lg" />
                      </div>
                      <div className="space-y-2">
                         <div className="h-4 bg-slate-100 dark:bg-slate-800 rounded w-1/3" />
                         <div className="h-24 bg-slate-50 dark:bg-slate-800 rounded-lg shadow-inner" />
                      </div>
                   </div>
                </div>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
}
