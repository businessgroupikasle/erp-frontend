"use client";

import React, { useState, useEffect } from "react";
import { 
  FileTextIcon, PrinterIcon
} from "lucide-react";
import { reportsApi } from "@/lib/api/accounting.api";

export default function GSTR3BReport() {
  const [loading, setLoading] = useState(true);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [considerNonTax, setConsiderNonTax] = useState(false);

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        await reportsApi.getGSTR3B({ startDate, endDate });
        // Assume empty for now to match screenshot
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [startDate, endDate]);

  const handlePrint = () => window.print();
  const handleExportCSV = () => {};

  return (
    <div className="flex flex-col h-full bg-[#f1f5f9] dark:bg-[#090a0f] p-6 space-y-6 overflow-y-auto">
      {/* Top Filters */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white dark:bg-[#12141c] p-4 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 shrink-0">
        <div className="flex flex-wrap items-center gap-6">
          <div className="flex items-center gap-3">
            <div className="flex flex-col gap-1">
              <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">From Month/Year</span>
              <input 
                type="month"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="px-3 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200/60 dark:border-slate-700 rounded-xl text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">To Month/Year</span>
              <input 
                type="month"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="px-3 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200/60 dark:border-slate-700 rounded-xl text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <label className="flex items-center gap-2 cursor-pointer mt-4 md:mt-0">
            <input 
              type="checkbox" 
              checked={considerNonTax}
              onChange={(e) => setConsiderNonTax(e.target.checked)}
              className="w-4 h-4 rounded text-blue-600 border-slate-300 focus:ring-blue-500"
            />
            <span className="text-[10px] font-black text-slate-600 dark:text-slate-400 uppercase tracking-wider">CONSIDER NON-TAX AS EXEMPTED</span>
          </label>
          <div className="flex items-center gap-2.5">
            <button onClick={handleExportCSV} className="p-2 bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 rounded-full border border-emerald-100 dark:border-emerald-900/50 hover:bg-emerald-100 transition-colors">
              <FileTextIcon size={16} />
            </button>
            <button onClick={handlePrint} className="p-2 bg-blue-50 dark:bg-blue-950/20 text-blue-600 rounded-full border border-blue-100 dark:border-blue-900/50 hover:bg-blue-100 transition-colors">
              <PrinterIcon size={16} />
            </button>
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-[#12141c] rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-800 shrink-0">
          <h3 className="text-xs font-black text-slate-800 dark:text-white uppercase tracking-wider">GSTR3 REPORT</h3>
        </div>

        <div className="p-6 space-y-12">
          
          {/* Table 1 */}
          <div className="space-y-4">
            <h4 className="text-sm font-semibold text-slate-700 dark:text-slate-300">1. Details of outward supplies and inward supplies liable to reverse charge</h4>
            <div className="overflow-x-auto border border-slate-200 dark:border-slate-800 rounded-lg">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-200/50 dark:bg-slate-800/40 text-[10px] font-black text-slate-500 uppercase tracking-widest border-b border-slate-200 dark:border-slate-800">
                    <th className="px-4 py-3 w-1/3">Nature Of Supplies</th>
                    <th className="px-4 py-3 text-right">Total Taxable Value</th>
                    <th className="px-4 py-3 text-right">Integrated Tax</th>
                    <th className="px-4 py-3 text-right">Central Tax</th>
                    <th className="px-4 py-3 text-right">State/UT Tax</th>
                    <th className="px-4 py-3 text-right">Cess</th>
                  </tr>
                </thead>
                <tbody className="text-xs font-semibold text-slate-600 dark:text-slate-400">
                  {[
                    "Outward taxable supplies (other than zero rated, nil rated and exempted)",
                    "Outward taxable supplies (zero rated)",
                    "Other outward supplies (nil rated, exempted)",
                    "Inward supplies (liable to reverse charge)",
                    "Non-GST outward supplies"
                  ].map((label, idx) => (
                    <tr key={idx} className="border-b border-slate-100 dark:border-slate-800/50 hover:bg-slate-50 dark:hover:bg-slate-800/20">
                      <td className="px-4 py-3">{label}</td>
                      <td className="px-4 py-3 text-right text-slate-800 dark:text-slate-300">0</td>
                      <td className="px-4 py-3 text-right text-slate-800 dark:text-slate-300">0</td>
                      <td className="px-4 py-3 text-right text-slate-800 dark:text-slate-300">0</td>
                      <td className="px-4 py-3 text-right text-slate-800 dark:text-slate-300">0</td>
                      <td className="px-4 py-3 text-right text-slate-800 dark:text-slate-300">0</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Table 2 */}
          <div className="space-y-4">
            <h4 className="text-sm font-semibold text-slate-700 dark:text-slate-300">2. Details of inter-State supplies made to unregistered persons, composition dealer and UIN holders</h4>
            <div className="overflow-x-auto border border-slate-200 dark:border-slate-800 rounded-lg">
              <table className="w-full text-left border-collapse min-w-[1000px]">
                <thead>
                  <tr className="bg-slate-200/50 dark:bg-slate-800/40 text-[10px] font-black text-slate-500 uppercase tracking-widest border-b border-slate-200 dark:border-slate-800">
                    <th rowSpan={2} className="px-4 py-3 border-r border-slate-200 dark:border-slate-800 w-1/4">Place Of Supply (State/UT)</th>
                    <th colSpan={2} className="px-4 py-2 border-r border-slate-200 dark:border-slate-800 text-center">Supplies Made To Unregistered Persons</th>
                    <th colSpan={2} className="px-4 py-2 border-r border-slate-200 dark:border-slate-800 text-center">Supplies Made To Composition Taxable Persons</th>
                    <th colSpan={2} className="px-4 py-2 text-center">Supplies Made To UIN Holders</th>
                  </tr>
                  <tr className="bg-slate-200/50 dark:bg-slate-800/40 text-[10px] font-black text-slate-500 uppercase tracking-widest border-b border-slate-200 dark:border-slate-800">
                    <th className="px-4 py-2 border-r border-slate-200 dark:border-slate-800 text-center">Total Taxable Value</th>
                    <th className="px-4 py-2 border-r border-slate-200 dark:border-slate-800 text-center">Amount Of Integrated Tax</th>
                    <th className="px-4 py-2 border-r border-slate-200 dark:border-slate-800 text-center">Total Taxable Value</th>
                    <th className="px-4 py-2 border-r border-slate-200 dark:border-slate-800 text-center">Amount Of Integrated Tax</th>
                    <th className="px-4 py-2 border-r border-slate-200 dark:border-slate-800 text-center">Total Taxable Value</th>
                    <th className="px-4 py-2 text-center">Amount Of Integrated Tax</th>
                  </tr>
                </thead>
                <tbody className="text-xs font-semibold text-slate-600 dark:text-slate-400">
                  <tr className="border-b border-slate-100 dark:border-slate-800/50 hover:bg-slate-50 dark:hover:bg-slate-800/20">
                    <td className="px-4 py-6 border-r border-slate-200 dark:border-slate-800"></td>
                    <td className="px-4 py-6 border-r border-slate-200 dark:border-slate-800"></td>
                    <td className="px-4 py-6 border-r border-slate-200 dark:border-slate-800"></td>
                    <td className="px-4 py-6 border-r border-slate-200 dark:border-slate-800"></td>
                    <td className="px-4 py-6 border-r border-slate-200 dark:border-slate-800"></td>
                    <td className="px-4 py-6 border-r border-slate-200 dark:border-slate-800"></td>
                    <td className="px-4 py-6"></td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Table 3 */}
          <div className="space-y-4">
            <h4 className="text-sm font-semibold text-slate-700 dark:text-slate-300">3. Details of eligible Input Tax Credit</h4>
            <div className="overflow-x-auto border border-slate-200 dark:border-slate-800 rounded-lg">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-200/50 dark:bg-slate-800/40 text-[10px] font-black text-slate-500 uppercase tracking-widest border-b border-slate-200 dark:border-slate-800">
                    <th className="px-4 py-3 w-1/3">Details</th>
                    <th className="px-4 py-3 text-right">Integrated Tax</th>
                    <th className="px-4 py-3 text-right">Central Tax</th>
                    <th className="px-4 py-3 text-right">State/UT Tax</th>
                    <th className="px-4 py-3 text-right">Cess</th>
                  </tr>
                </thead>
                <tbody className="text-xs font-semibold text-slate-600 dark:text-slate-400">
                  <tr className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800">
                    <td colSpan={5} className="px-4 py-3 font-bold text-slate-800 dark:text-slate-200">(A) ITC Available (whether in full or part)</td>
                  </tr>
                  {[
                    "(1) Import of goods",
                    "(2) Import of services",
                    "(3) Inward supplies liable to reverse charge (other than 1 & 2 above)",
                    "(4) Inward supplies from ISD",
                    "(5) All other ITC"
                  ].map((label, idx) => (
                    <tr key={`a-${idx}`} className="border-b border-slate-100 dark:border-slate-800/50 hover:bg-slate-50 dark:hover:bg-slate-800/20">
                      <td className="px-4 py-3 pl-8">{label}</td>
                      <td className="px-4 py-3 text-right text-slate-800 dark:text-slate-300">0</td>
                      <td className="px-4 py-3 text-right text-slate-800 dark:text-slate-300">0</td>
                      <td className="px-4 py-3 text-right text-slate-800 dark:text-slate-300">0</td>
                      <td className="px-4 py-3 text-right text-slate-800 dark:text-slate-300">0</td>
                    </tr>
                  ))}
                  <tr className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 border-t border-slate-200 dark:border-slate-800">
                    <td colSpan={5} className="px-4 py-3 font-bold text-slate-800 dark:text-slate-200">(D) Ineligible ITC</td>
                  </tr>
                  {[
                    "(1) As per section 17(5)",
                    "(2) Others"
                  ].map((label, idx) => (
                    <tr key={`d-${idx}`} className="border-b border-slate-100 dark:border-slate-800/50 hover:bg-slate-50 dark:hover:bg-slate-800/20">
                      <td className="px-4 py-3 pl-8">{label}</td>
                      <td className="px-4 py-3 text-right text-slate-800 dark:text-slate-300">0</td>
                      <td className="px-4 py-3 text-right text-slate-800 dark:text-slate-300">0</td>
                      <td className="px-4 py-3 text-right text-slate-800 dark:text-slate-300">0</td>
                      <td className="px-4 py-3 text-right text-slate-800 dark:text-slate-300">0</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Table 4 */}
          <div className="space-y-4">
            <h4 className="text-sm font-semibold text-slate-700 dark:text-slate-300">4. Details of exempt, nil-rated and non-GST inward supplies</h4>
            <div className="overflow-x-auto border border-slate-200 dark:border-slate-800 rounded-lg">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-200/50 dark:bg-slate-800/40 text-[10px] font-black text-slate-500 uppercase tracking-widest border-b border-slate-200 dark:border-slate-800">
                    <th className="px-4 py-3 w-1/2">Nature Of Supplies</th>
                    <th className="px-4 py-3 text-right">Inter-State Supplies</th>
                    <th className="px-4 py-3 text-right">Intra-State Supplies</th>
                  </tr>
                </thead>
                <tbody className="text-xs font-semibold text-slate-600 dark:text-slate-400">
                  {[
                    "From a supplier under composition scheme, Exempt and Nil rated supply",
                    "Non GST supply"
                  ].map((label, idx) => (
                    <tr key={idx} className="border-b border-slate-100 dark:border-slate-800/50 hover:bg-slate-50 dark:hover:bg-slate-800/20">
                      <td className="px-4 py-3">{label}</td>
                      <td className="px-4 py-3 text-right text-slate-800 dark:text-slate-300">0</td>
                      <td className="px-4 py-3 text-right text-slate-800 dark:text-slate-300">0</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
