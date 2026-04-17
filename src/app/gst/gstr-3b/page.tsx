"use client";

import { ChevronRight, Calendar, Download } from "lucide-react";
import Link from "next/link";

export default function GSTR3BSummary() {
  return (
    <div className="min-h-screen bg-[#FDFCFD] dark:bg-[#020617] -m-8 font-sans">
      <div className="p-8 space-y-6">
        {/* Header Section */}
        <div className="flex items-center justify-between">
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-[10px] font-bold text-[#999] uppercase tracking-widest">
              <Link href="/" className="hover:text-[#7C3AED]">Azeez</Link>
              <ChevronRight size={10} />
              <span className="text-[#666]">GSTR-3B Summary</span>
            </div>
            <h1 className="text-2xl font-black text-[#1A1A1A] dark:text-white">GSTR-3B Summary</h1>
          </div>
          <button className="px-4 py-2 border border-[#F0EAF0] dark:border-slate-800 rounded-lg text-[13px] font-bold text-[#666] hover:bg-slate-50 transition-colors bg-white dark:bg-slate-900 flex items-center gap-2 shadow-sm">
             <Download size={16} /> Download PDF
          </button>
        </div>

        {/* Reporting Period */}
        <div className="bg-[#FAF9FA] dark:bg-slate-800/30 border border-[#F0EAF0] dark:border-slate-800 rounded-2xl p-6 shadow-sm">
           <div className="space-y-2 max-w-xs">
              <label className="text-[11px] font-bold text-[#999] uppercase tracking-wider">Reporting Period</label>
              <div className="flex items-center gap-2 bg-white dark:bg-slate-800 border border-[#F0EAF0] dark:border-slate-800 rounded-lg px-3 py-2 shadow-inner">
                 <span className="text-[13px] font-medium text-[#1A1A1A] dark:text-white">Mar 01, 26 - Mar 31, 26</span>
                 <Calendar size={14} className="text-[#999]" />
              </div>
           </div>
        </div>

        {/* Statutory Tables */}
        <div className="space-y-10">
           <TaxTable 
             section="3.1"
             title="Details of outward supplies & inward supplies liable to reverse charge"
             headers={["Nature of Supplies", "Total Taxable Value", "Integrated Tax", "Central Tax", "State/UT Tax", "CESS"]}
             rows={[
               "(a) Outward taxable supplies (other than zero rated, nil rated and exempted)",
               "(b) Outward taxable supplies (zero rated)",
               "(c) Other outward supplies (Nil rated, exempted)",
               "(d) Inward supplies (liable to reverse charge)",
               "(e) Non-GST outward supplies"
             ]}
           />
           
           <TaxTable 
             section="3.1.1"
             title="Details of supplies notified under sub-section (5) of section 9 of Central Tax Act"
             headers={["Description", "Total Taxable Value", "Integrated Tax", "Central Tax", "State/UT Tax", "CESS"]}
             rows={[
               "(i) Taxable supplies on which electronic commerce operator pays tax u/s 9(5) [to be furnished by electronic commerce operator]",
               "(ii) Taxable supplies made by registered person through electronic commerce operator, on which electronic commerce operator is required to pay tax u/s 9(5) [to be furnished by registered person making supplies through electronic commerce operator]"
             ]}
           />

           <TaxTable 
             section="3.2"
             title="Of the supplies shown in 3.1 (a) above and 3.1.1(i), details of inter-state supplies made to unregistered person, composition taxable persons and UIN holders"
             headers={["Place of Supply", "Total Taxable Value", "Integrated Tax", "Integrated Tax"]}
             rows={["Supplies made to Unregistered Persons"]}
             showEmptyCell={false}
           />
        </div>
      </div>
    </div>
  );
}

function TaxTable({ section, title, headers, rows, showEmptyCell = true }: { section: string, title: string, headers: string[], rows: string[], showEmptyCell?: boolean }) {
  return (
    <div className="space-y-4">
       <h2 className="text-[13.5px] font-black text-[#1A1A1A] dark:text-white leading-tight flex gap-2">
         <span className="text-[#7C3AED] min-w-[30px]">{section}</span>
         {title}
       </h2>
       <div className="bg-white dark:bg-slate-900 border border-[#F0EAF0] dark:border-slate-800 rounded-xl overflow-hidden shadow-sm overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[900px]">
            <thead>
               <tr className="bg-[#FAF9FA] dark:bg-slate-800/50 border-b border-[#F0EAF0] dark:border-slate-800">
                  {headers.map((h, i) => (
                    <th key={i} className="p-3.5 text-[10px] font-bold text-[#999] uppercase tracking-wider border-r border-[#F0EAF0] dark:border-slate-800 last:border-0">{h}</th>
                  ))}
               </tr>
            </thead>
            <tbody>
               {rows.map((row, i) => (
                 <tr key={i} className="border-b border-[#F0EAF0] dark:border-slate-800 last:border-0 hover:bg-slate-50/50 dark:hover:bg-slate-800/50">
                    <td className="p-4 text-[11.5px] font-medium text-[#444] dark:text-slate-400 max-w-[400px] border-r border-[#F0EAF0] dark:border-slate-800">{row}</td>
                    <td className="p-4 text-[13px] font-black text-[#1A1A1A] dark:text-white border-r border-[#F0EAF0] dark:border-slate-800 text-center">0</td>
                    <td className="p-4 text-[13px] font-black text-[#1A1A1A] dark:text-white border-r border-[#F0EAF0] dark:border-slate-800 text-center">0</td>
                    <td className="p-4 text-[13px] font-black text-[#1A1A1A] dark:text-white border-r border-[#F0EAF0] dark:border-slate-800 text-center">0</td>
                    <td className="p-4 text-[13px] font-black text-[#1A1A1A] dark:text-white border-r border-[#F0EAF0] dark:border-slate-800 text-center">-</td>
                    {headers.length > 5 && (
                      <td className="p-4 text-[13px] font-black text-[#1A1A1A] dark:text-white text-center">-</td>
                    )}
                 </tr>
               ))}
            </tbody>
          </table>
       </div>
    </div>
  );
}
