/* BATCH GSTR PAGES IMPLEMENTATION */

/* 1. GSTR-1 Summary */
// File: src/app/gst/gstr-1/page.tsx
"use client";
import { ChevronRight, Calendar, Download, ShieldCheck, RefreshCcw, Columns, ChevronDown } from "lucide-react";
import Link from "next/link";

export default function GSTR1Summary() {
  const gstr1Rows = [
    "Taxable outward supplies made to registered persons (including UIN-holders)",
    "Taxable outward inter-State supplies to un-registered persons where the invoice value is more than Rs 1 lakh",
    "Taxable outward supplies to consumer",
    "Zero rated supplies and Deemed Exports",
    "Nil rated, Exempted and non GST outward supplies",
    "HSN-wise summary for B2B supplies",
    "HSN-wise summary for B2C supplies",
    "Details of Credit Notes/Debit Notes and Refund Vouchers",
    "Details of Credit Notes/Debit Notes and Refund Vouchers (Unregistered)"
  ];

  return (
    <div className="min-h-screen bg-[#FDFCFD] dark:bg-[#020617] -m-8 font-sans">
      <div className="p-8 space-y-6">
        <div className="flex items-center justify-between">
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-[10px] font-bold text-[#999] uppercase tracking-widest">
              <span>Azeez</span> <ChevronRight size={10} /> <span>Accounting Reports</span> <ChevronRight size={10} />
            </div>
            <h1 className="text-2xl font-black text-[#1A1A1A] dark:text-white flex items-center gap-2">GSTR-1 Summary <span className="text-sm">✨</span></h1>
          </div>
          <div className="flex items-center gap-3">
             <button className="px-4 py-2 border-2 border-[#F0EAF0] dark:border-slate-800 rounded-lg text-[13px] font-bold text-[#666] hover:bg-slate-50 transition-colors bg-white dark:bg-slate-900 flex items-center gap-2">
                <ShieldCheck size={16} /> Validate Report
             </button>
             <div className="flex">
                <button className="px-4 py-2 bg-[#7C3AED] hover:bg-[#6D28D9] text-white rounded-l-lg text-[13px] font-bold flex items-center gap-2 transition-all">
                   <Download size={16} /> Download Excel
                </button>
                <button className="px-2 py-2 bg-[#7C3AED] hover:bg-[#6D28D9] text-white rounded-r-lg border-l border-white/20 transition-all">
                   <ChevronDown size={18} />
                </button>
             </div>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-[#F0EAF0] dark:border-slate-800 rounded-2xl p-6 shadow-sm flex items-center justify-between">
           <div className="space-y-2">
              <label className="text-[11px] font-bold text-[#999] uppercase tracking-wider">Reporting Period</label>
              <div className="flex items-center gap-2 bg-[#FAF9FA] dark:bg-slate-800 border border-[#F0EAF0] dark:border-slate-800 rounded-lg px-3 py-2">
                 <span className="text-[13px] font-medium">Mar 01, 26 - Mar 31, 26</span>
                 <Calendar size={14} className="text-[#999]" />
              </div>
           </div>
           <div className="text-right space-y-2">
              <p className="text-[11px] font-bold text-[#999]">Last Updated on: <span className="text-[#1A1A1A] dark:text-white">17 Apr, 2026 01:17 AM</span></p>
              <button className="flex items-center gap-2 px-4 py-1.5 border border-[#F0EAF0] dark:border-slate-800 rounded-lg text-[12px] font-bold text-[#7C3AED] hover:bg-purple-50 transition-colors">
                 <RefreshCcw size={14} /> Refresh Report
              </button>
           </div>
        </div>

        <div className="flex items-center justify-between pt-4">
           <p className="text-[12px] font-bold text-[#666]">Showing <span className="text-[#1A1A1A] dark:text-white">1 to 9</span> of <span className="text-[#1A1A1A] dark:text-white">9</span> Records</p>
           <button className="flex items-center gap-2 px-3 py-1.5 border border-[#F0EAF0] dark:border-slate-800 rounded-md text-[11px] font-bold text-[#666] hover:bg-slate-50 transition-colors">
              <Columns size={14} /> Show/Hide Columns
           </button>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-[#F0EAF0] dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[1000px]">
            <thead>
              <tr className="bg-[#FAF9FA] dark:bg-slate-800/50 border-b border-[#F0EAF0] dark:border-slate-800">
                <th className="p-4 text-[11px] font-bold text-[#666] uppercase tracking-wider">Description</th>
                <th className="p-4 text-[11px] font-bold text-[#666] uppercase tracking-wider">IGST Amount</th>
                <th className="p-4 text-[11px] font-bold text-[#666] uppercase tracking-wider">CGST Amount</th>
                <th className="p-4 text-[11px] font-bold text-[#666] uppercase tracking-wider">SGST Amount</th>
                <th className="p-4 text-[11px] font-bold text-[#666] uppercase tracking-wider">Taxable Amount <ChevronDown size={10} className="inline ml-1" /></th>
              </tr>
            </thead>
            <tbody>
              {gstr1Rows.map((row, idx) => (
                <tr key={idx} className="border-b border-[#F0EAF0] dark:border-slate-800 last:border-0 hover:bg-slate-50/50 dark:hover:bg-slate-800/50">
                   <td className="p-4 text-[12px] font-medium text-[#444] dark:text-slate-300">{row}</td>
                   <td className="p-4 text-[12px] font-medium text-[#444] dark:text-slate-300">0.00</td>
                   <td className="p-4 text-[12px] font-medium text-[#444] dark:text-slate-300">0.00</td>
                   <td className="p-4 text-[12px] font-medium text-[#444] dark:text-slate-300">0.00</td>
                   <td className="p-4 text-[12px] font-black text-[#1A1A1A] dark:text-white">₹0</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function TaxTable({ title, headers, rows }: { title: string, headers: string[], rows: string[] }) {
  return (
    <div className="space-y-4">
       <h2 className="text-sm font-black text-[#1A1A1A] dark:text-white leading-tight">{title}</h2>
       <div className="bg-white dark:bg-slate-900 border border-[#F0EAF0] dark:border-slate-800 rounded-xl overflow-hidden shadow-sm overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[800px]">
            <thead>
               <tr className="bg-[#FAF9FA] dark:bg-slate-800/50 border-b border-[#F0EAF0] dark:border-slate-800">
                  {headers.map((h, i) => (
                    <th key={i} className="p-3 text-[10px] font-bold text-[#999] uppercase tracking-wider">{h}</th>
                  ))}
               </tr>
            </thead>
            <tbody>
               {rows.map((row, i) => (
                 <tr key={i} className="border-b border-[#F0EAF0] dark:border-slate-800 last:border-0">
                    <td className="p-3 text-[11px] font-medium text-[#666] dark:text-slate-400 max-w-sm">{row}</td>
                    <td className="p-3 text-[12px] font-bold text-[#1A1A1A] dark:text-white">0</td>
                    <td className="p-3 text-[12px] font-bold text-[#1A1A1A] dark:text-white">0</td>
                    <td className="p-3 text-[12px] font-bold text-[#1A1A1A] dark:text-white">0</td>
                    <td className="p-3 text-[12px] font-bold text-[#1A1A1A] dark:text-white">0</td>
                    <td className="p-3 text-[12px] font-bold text-[#1A1A1A] dark:text-white">-</td>
                 </tr>
               ))}
            </tbody>
          </table>
       </div>
    </div>
  );
}
