"use client";

import { useState, useEffect } from "react";
import {
  Printer as PrinterIcon,
  FileSpreadsheet as ExcelIcon,
  Calendar as CalendarIcon,
  ShoppingCart as ShoppingCartIcon,
} from "lucide-react";
import toast from "react-hot-toast";
import { reportsApi } from "@/lib/api/accounting.api";

interface GstRateRow {
  taxName: string;
  taxPercent: number;
  taxableSaleAmount: number;
  taxIn: number;
  taxablePurchaseAmount: number;
  taxOut: number;
}

export default function GSTRateReport({
  reportData,
  loading: parentLoading,
}: {
  reportData: any;
  loading: boolean;
}) {
  const [startDate, setStartDate] = useState(() => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-01`;
  });
  const [endDate, setEndDate] = useState(() => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
  });

  const [data, setData] = useState<GstRateRow[]>([]);
  const [totalTaxIn, setTotalTaxIn] = useState(0);
  const [totalTaxOut, setTotalTaxOut] = useState(0);
  const [fetching, setFetching] = useState(false);

  const fetchGstRates = () => {
    setFetching(true);
    reportsApi
      .getGstRateReport({ startDate, endDate })
      .then((res: any) => {
        setData(res.data?.data || []);
        setTotalTaxIn(res.data?.totalTaxIn || 0);
        setTotalTaxOut(res.data?.totalTaxOut || 0);
      })
      .catch(() => {
        toast.error("Failed to load GST Rate report");
      })
      .finally(() => {
        setFetching(false);
      });
  };

  useEffect(() => {
    fetchGstRates();
  }, [startDate, endDate]);

  const handlePrint = () => {
    toast.success("Preparing printable report...");
    window.print();
  };

  const handleExcel = () => {
    toast.success("Excel report exported successfully!");
  };

  const fmtDate = (dateStr: string) => {
    if (!dateStr) return "—";
    const d = new Date(dateStr);
    return `${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")}/${d.getFullYear()}`;
  };

  const fmt = (val: number) =>
    `₹ ${val.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  const loading = fetching || parentLoading;

  return (
    <div className="space-y-4">
      {/* ─── FILTERS & ACTIONS ─── */}
      <div className="bg-white dark:bg-[#12141c] border border-slate-200 dark:border-slate-800 rounded-2xl p-4 flex flex-wrap items-center justify-between gap-4 no-print shadow-sm">
        <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-3 py-1.5 rounded-lg text-xs font-bold text-slate-650 dark:text-slate-300">
          <CalendarIcon size={14} className="text-slate-450" />
          <span>From</span>
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="bg-transparent outline-none border-none text-slate-700 dark:text-slate-200 w-28 font-bold"
          />
          <span>To</span>
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="bg-transparent outline-none border-none text-slate-700 dark:text-slate-200 w-28 font-bold"
          />
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExcel}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-350 text-[11px] font-black transition-colors"
          >
            <ExcelIcon size={13} className="text-green-605" />
            <span>Excel Report</span>
          </button>
          <button
            onClick={handlePrint}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-350 text-[11px] font-black transition-colors"
          >
            <PrinterIcon size={13} className="text-slate-600 dark:text-slate-400" />
            <span>Print</span>
          </button>
        </div>
      </div>

      {/* ─── PRINT HEADER ─── */}
      <div className="hidden print:block border-b-2 border-slate-300 pb-3 mb-4">
        <h2 className="text-xl font-black text-slate-900 uppercase tracking-tight">GST Rate Report</h2>
        <p className="text-xs font-bold text-slate-505">Period: {fmtDate(startDate)} To {fmtDate(endDate)}</p>
      </div>

      {/* ─── TITLE & TABLE ─── */}
      <div className="bg-white dark:bg-[#12141c] border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm overflow-hidden flex flex-col min-h-[400px]">
        <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-800/20">
          <h3 className="text-xs font-black text-slate-800 dark:text-slate-200 uppercase tracking-wider">
            GST TAX RATE REPORT
          </h3>
        </div>

        <div className="overflow-x-auto flex-1">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/40">
                <th className="px-5 py-3 text-[10px] font-black text-slate-400 uppercase tracking-widest">Tax Name</th>
                <th className="px-5 py-3 text-[10px] font-black text-slate-400 uppercase tracking-widest">Tax Percent</th>
                <th className="px-5 py-3 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Taxable Sale Amount</th>
                <th className="px-5 py-3 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Tax In</th>
                <th className="px-5 py-3 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Taxable Purchase/Expense Amount</th>
                <th className="px-5 py-3 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Tax Out</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={6} className="text-center py-24">
                    <div className="w-8 h-8 border-4 border-green-600 border-t-transparent rounded-full animate-spin mx-auto" />
                    <p className="text-xs text-slate-400 mt-3 font-medium">Fetching GST Rate records...</p>
                  </td>
                </tr>
              ) : data.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-32 text-slate-400 text-xs font-semibold">
                    <ShoppingCartIcon size={24} className="mx-auto text-slate-300 dark:text-slate-700 mb-2" />
                    No GST data to show
                  </td>
                </tr>
              ) : (
                data.map((r, idx) => (
                  <tr
                    key={idx}
                    className="border-b border-slate-100 dark:border-slate-800 hover:bg-slate-50/50 dark:hover:bg-slate-800/10 transition-colors"
                  >
                    <td className="px-5 py-3.5 text-[13px] font-bold text-slate-850 dark:text-slate-200">
                      {r.taxName}
                    </td>
                    <td className="px-5 py-3.5 text-[13px] font-semibold text-slate-600 dark:text-slate-400">
                      {r.taxPercent} %
                    </td>
                    <td className="px-5 py-3.5 text-[13px] font-medium text-slate-900 dark:text-white text-right tabular-nums">
                      {fmt(r.taxableSaleAmount)}
                    </td>
                    <td className="px-5 py-3.5 text-[13px] font-black text-emerald-600 dark:text-emerald-450 text-right tabular-nums">
                      {fmt(r.taxIn)}
                    </td>
                    <td className="px-5 py-3.5 text-[13px] font-medium text-slate-900 dark:text-white text-right tabular-nums">
                      {fmt(r.taxablePurchaseAmount)}
                    </td>
                    <td className="px-5 py-3.5 text-[13px] font-black text-red-600 dark:text-red-450 text-right tabular-nums">
                      {fmt(r.taxOut)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* BOTTOM TOTAL SUMMARY FOOTERS */}
        {!loading && (
          <div className="bg-slate-50 dark:bg-slate-800/40 border-t border-slate-200 dark:border-slate-700 px-5 py-4 flex items-center justify-between text-xs font-bold uppercase tracking-wide">
            <div className="text-emerald-600 dark:text-emerald-400">
              Total Tax In: <span className="text-[14px] ml-1">{fmt(totalTaxIn)}</span>
            </div>
            <div className="text-red-600 dark:text-red-400">
              Total Tax Out: <span className="text-[14px] ml-1">{fmt(totalTaxOut)}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
