"use client";

import { useState } from "react";
import { clsx } from "clsx";

interface ReportData {
  kpiValue: string;
  kpiSubText: string;
  kpiTrend?: string;
  rows: Record<string, any>[];
  revenue?: number;
  cogs?: number;
  grossProfit?: number;
  expenses?: number;
  netProfit?: number;
  totalSales?: number;
  totalProfit?: number;
  cashIn?: number;
  cashOut?: number;
  totalDebit?: number;
  totalCredit?: number;
}

export default function CentralBillWiseProfitReport({
  reportData,
  loading
}: {
  reportData: ReportData | null;
  loading: boolean;
}) {
  const [filterParty, setFilterParty] = useState("");

  if (loading) {
    return (
      <div className="py-20 text-center space-y-3">
        <div className="w-10 h-10 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-sm font-semibold text-slate-500 dark:text-slate-400 animate-pulse">
          Analyzing bills and calculating net invoice margins...
        </p>
      </div>
    );
  }

  const formatPrice = (amount: number) => {
    return `₹ ${amount.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const rows = reportData?.rows || [];
  const filteredRows = rows.filter(r => 
    String(r.partyName || "").toLowerCase().includes(filterParty.toLowerCase())
  );

  const totalSale = filteredRows.reduce((acc, r) => acc + (r.rawSale || 0), 0);
  const totalProfit = filteredRows.reduce((acc, r) => acc + (r.rawProfit || 0), 0);

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-[#12141c] border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm overflow-hidden p-5">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-5 pb-4 border-b border-slate-100 dark:border-slate-800">
          <div>
            <h3 className="text-sm font-black uppercase tracking-widest text-slate-800 dark:text-white">
              PROFIT ON SALE INVOICES
            </h3>
          </div>
          <div className="relative w-64 max-w-full">
            <input 
              type="text" 
              placeholder="Party filter" 
              value={filterParty}
              onChange={(e) => setFilterParty(e.target.value)}
              className="w-full px-3 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-semibold text-slate-700 dark:text-slate-200 outline-none focus:border-orange-500"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-900/50 border-y border-slate-200 dark:border-slate-800">
                <th className="px-4 py-2.5 text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">
                  DATE
                </th>
                <th className="px-4 py-2.5 text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">
                  INVOICE NO
                </th>
                <th className="px-4 py-2.5 text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">
                  PARTY
                </th>
                <th className="px-4 py-2.5 text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest text-right">
                  TOTAL SALE AMOUNT
                </th>
                <th className="px-4 py-2.5 text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest text-right">
                  PROFIT (+) / LOSS (-)
                </th>
                <th className="px-4 py-2.5 text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest text-right no-print">
                  DETAILS
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/30">
              {filteredRows.length > 0 ? (
                filteredRows.map((row, idx) => (
                  <tr key={idx} className="odd:bg-white even:bg-slate-50/30 dark:odd:bg-transparent dark:even:bg-slate-800/10 hover:bg-slate-50/50 dark:hover:bg-slate-800/20 transition-colors">
                    <td className="px-4 py-3 text-xs font-semibold text-slate-600 dark:text-slate-350">{row.date}</td>
                    <td className="px-4 py-3 text-xs font-semibold text-slate-700 dark:text-slate-200">{row.invoiceNo}</td>
                    <td className="px-4 py-3 text-xs font-bold text-slate-800 dark:text-slate-100">{row.partyName}</td>
                    <td className="px-4 py-3 text-xs font-bold text-right text-slate-700 dark:text-slate-200">{row.saleAmount}</td>
                    <td className={clsx(
                       "px-4 py-3 text-xs font-black text-right",
                       row.rawProfit >= 0 ? "text-emerald-600 dark:text-emerald-400" : "text-rose-500 dark:text-rose-400"
                    )}>
                      {row.rawProfit >= 0 ? `+${row.profit}` : `-${row.profit}`}
                    </td>
                    <td className="px-4 py-3 text-xs font-bold text-right no-print">
                      <a href={`/sales/invoices`} className="text-blue-500 hover:text-blue-600 transition-colors cursor-pointer select-none">
                        Show &gt;
                      </a>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="px-5 py-12 text-center text-slate-400 dark:text-slate-500">
                    No matching records found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Bottom Summary Panel */}
        <div className="mt-6 pt-5 border-t border-slate-200 dark:border-slate-800 space-y-1.5 text-xs select-text">
          <h4 className="font-black text-slate-800 dark:text-slate-200 uppercase tracking-widest text-[11px]">
            Summary
          </h4>
          <div className="flex flex-col gap-1 font-bold text-slate-600 dark:text-slate-400">
            <div>
              Total Sale Amount: <span className="text-slate-800 dark:text-slate-200">{formatPrice(totalSale)}</span>
            </div>
            <div>
              Total Profit(+)/Loss(-):{" "}
              <span className={clsx(
                "font-black text-sm",
                totalProfit >= 0 ? "text-emerald-600 dark:text-emerald-400" : "text-rose-500 dark:text-rose-455"
              )}>
                {formatPrice(totalProfit)}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
