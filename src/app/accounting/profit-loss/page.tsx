"use client";

import {
  TrendingUp,
  TrendingDown,
  Download,
  RefreshCw,
  ChevronDown,
  ArrowUpRight,
  ArrowDownRight,
  Printer,
  Calendar,
  Info,
} from "lucide-react";
import { useState, useMemo } from "react";
import { clsx } from "clsx";
import { exportToExcel, exportToPDF } from "@/lib/exportUtils";

/* ─── Types ─────────────────────────────────────────────────── */
type Period = "this_month" | "last_month" | "this_quarter" | "this_year" | "custom";

interface LineItem {
  label: string;
  current: number;
  previous: number;
}

interface Section {
  title: string;
  items: LineItem[];
}

/* ─── Mock Data ─────────────────────────────────────────────── */
const INCOME_DATA: Section = {
  title: "Income",
  items: [
    { label: "Sales Revenue",        current: 1_842_500, previous: 1_620_000 },
    { label: "Service Income",        current:   310_000, previous:   280_000 },
    { label: "Interest Income",       current:    24_750, previous:    18_500 },
    { label: "Other Income",          current:    15_200, previous:    12_000 },
  ],
};

const EXPENSE_DATA: Section = {
  title: "Expenses",
  items: [
    { label: "Cost of Goods Sold",    current:   920_000, previous:   810_000 },
    { label: "Salaries & Wages",      current:   385_000, previous:   360_000 },
    { label: "Rent & Utilities",      current:    78_000, previous:    75_000 },
    { label: "Marketing & Ads",       current:    62_000, previous:    45_000 },
    { label: "Depreciation",          current:    34_500, previous:    34_500 },
    { label: "Office Supplies",       current:    12_800, previous:    11_200 },
    { label: "Professional Fees",     current:    28_000, previous:    25_000 },
    { label: "Miscellaneous",         current:     9_400, previous:     8_800 },
  ],
};

const PERIOD_OPTIONS: { label: string; value: Period }[] = [
  { label: "This Month",    value: "this_month" },
  { label: "Last Month",    value: "last_month" },
  { label: "This Quarter",  value: "this_quarter" },
  { label: "This Year",     value: "this_year" },
  { label: "Custom Range",  value: "custom" },
];

/* ─── Helpers ───────────────────────────────────────────────── */
const fmt = (n: number) =>
  new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(n);

const pct = (cur: number, prev: number) => {
  if (prev === 0) return null;
  return (((cur - prev) / prev) * 100).toFixed(1);
};

/* ─── Sub-components ────────────────────────────────────────── */
function SummaryCard({
  label, value, change, positive, icon: Icon, color,
}: {
  label: string;
  value: number;
  change: string | null;
  positive: boolean;
  icon: React.ElementType;
  color: string;
}) {
  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-100 dark:border-slate-800 p-5 card-hover">
      <div className="flex items-start justify-between mb-4">
        <div className={clsx("w-10 h-10 rounded-xl flex items-center justify-center", color)}>
          <Icon size={18} strokeWidth={2} />
        </div>
        {change !== null && (
          <span
            className={clsx(
              "flex items-center gap-0.5 text-[12px] font-semibold px-2 py-0.5 rounded-full",
              positive
                ? "bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400"
                : "bg-red-50 dark:bg-red-900/20 text-red-500 dark:text-red-400"
            )}
          >
            {positive ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
            {Math.abs(Number(change))}%
          </span>
        )}
      </div>
      <p className="text-[13px] text-gray-500 dark:text-slate-400 font-medium mb-1">{label}</p>
      <p className="text-2xl font-black text-gray-900 dark:text-white tracking-tight">{fmt(value)}</p>
    </div>
  );
}

function DataRow({ item, isLast }: { item: LineItem; isLast: boolean }) {
  const change = pct(item.current, item.previous);
  const isPositive = item.current >= item.previous;

  return (
    <tr
      className={clsx(
        "group transition-colors",
        !isLast && "border-b border-gray-50 dark:border-slate-800/60"
      )}
    >
      <td className="py-3 px-4 text-[13px] text-gray-700 dark:text-slate-300 group-hover:text-gray-900 dark:group-hover:text-white transition-colors">
        {item.label}
      </td>
      <td className="py-3 px-4 text-[13px] font-semibold text-gray-900 dark:text-white text-right tabular-nums">
        {fmt(item.current)}
      </td>
      <td className="py-3 px-4 text-[13px] text-gray-500 dark:text-slate-400 text-right tabular-nums">
        {fmt(item.previous)}
      </td>
      <td className="py-3 px-4 text-right">
        {change !== null && (
          <span
            className={clsx(
              "inline-flex items-center gap-0.5 text-[11px] font-bold px-2 py-0.5 rounded-full",
              isPositive
                ? "bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400"
                : "bg-red-50 dark:bg-red-900/20 text-red-500 dark:text-red-400"
            )}
          >
            {isPositive ? <ArrowUpRight size={10} /> : <ArrowDownRight size={10} />}
            {Math.abs(Number(change))}%
          </span>
        )}
      </td>
    </tr>
  );
}

/* ─── Page ──────────────────────────────────────────────────── */
export default function ProfitLossPage() {
  const [period, setPeriod] = useState<Period>("this_month");
  const [showPeriodMenu, setShowPeriodMenu] = useState(false);
  const [customFrom, setCustomFrom] = useState("");
  const [customTo, setCustomTo] = useState("");
  const [dateError, setDateError] = useState("");
  const [compareEnabled, setCompareEnabled] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const selectedPeriodLabel =
    PERIOD_OPTIONS.find((o) => o.value === period)?.label ?? "Select Period";

  /* Date validation */
  const validateDates = () => {
    if (period !== "custom") return true;
    if (!customFrom) { setDateError("Please select a start date."); return false; }
    if (!customTo)   { setDateError("Please select an end date.");   return false; }
    if (new Date(customFrom) > new Date(customTo)) {
      setDateError("Start date must be before end date.");
      return false;
    }
    setDateError("");
    return true;
  };

  /* Derived totals */
  const totalIncome   = useMemo(() => INCOME_DATA.items.reduce((s, i) => s + i.current, 0),   []);
  const totalExpenses = useMemo(() => EXPENSE_DATA.items.reduce((s, i) => s + i.current, 0),  []);
  const netProfit     = totalIncome - totalExpenses;
  const profitMargin  = totalIncome > 0 ? ((netProfit / totalIncome) * 100).toFixed(1) : "0";

  const prevIncome   = useMemo(() => INCOME_DATA.items.reduce((s, i) => s + i.previous, 0),  []);
  const prevExpenses = useMemo(() => EXPENSE_DATA.items.reduce((s, i) => s + i.previous, 0), []);
  const prevProfit   = prevIncome - prevExpenses;

  const handleRefresh = () => {
    if (!validateDates()) return;
    setIsRefreshing(true);
    setTimeout(() => setIsRefreshing(false), 1200);
  };

  const handleExport = async (type: "pdf" | "excel") => {
    if (!validateDates()) return;
    
    // Prepare data
    const exportData: any[] = [];
    
    exportData.push({ Account: "--- INCOME ---", Current: "", Previous: "", Change: "" });
    INCOME_DATA.items.forEach(item => {
      exportData.push({
        Account: item.label,
        Current: item.current,
        Previous: compareEnabled ? item.previous : "-",
        Change: compareEnabled && item.previous > 0 ? (((item.current - item.previous) / item.previous) * 100).toFixed(1) + "%" : "-"
      });
    });
    exportData.push({ Account: "Total Income", Current: totalIncome, Previous: compareEnabled ? prevIncome : "-", Change: "" });
    
    exportData.push({ Account: "", Current: "", Previous: "", Change: "" });
    exportData.push({ Account: "--- EXPENSES ---", Current: "", Previous: "", Change: "" });
    EXPENSE_DATA.items.forEach(item => {
      exportData.push({
        Account: item.label,
        Current: item.current,
        Previous: compareEnabled ? item.previous : "-",
        Change: compareEnabled && item.previous > 0 ? (((item.current - item.previous) / item.previous) * 100).toFixed(1) + "%" : "-"
      });
    });
    exportData.push({ Account: "Total Expenses", Current: totalExpenses, Previous: compareEnabled ? prevExpenses : "-", Change: "" });
    
    exportData.push({ Account: "", Current: "", Previous: "", Change: "" });
    exportData.push({ Account: "NET PROFIT", Current: netProfit, Previous: compareEnabled ? prevProfit : "-", Change: "" });

    if (type === "excel") {
      await exportToExcel(exportData, `Profit_Loss_${period}`);
    } else {
      const columns = ["Account", "Current", "Previous", "Change"];
      const rows = exportData.map(d => [String(d.Account), String(d.Current), String(d.Previous), String(d.Change)]);
      await exportToPDF("Profit & Loss Report", columns, rows, `Profit_Loss_${period}`);
    }
  };

  return (
    <div className="min-h-screen bg-background -m-0">

      <div className="p-6 max-w-6xl mx-auto space-y-6">

        {/* ── Page Header ───────────────────────────── */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <p className="text-sm text-gray-500 dark:text-slate-400 mt-0.5">
              Monitor income, expenses, and net profit over time.
            </p>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={handleRefresh}
              className="flex items-center gap-2 px-3 py-2 rounded-xl border border-gray-200 dark:border-slate-700 text-gray-600 dark:text-slate-400 hover:bg-gray-50 dark:hover:bg-slate-800 text-[13px] font-medium transition-all"
            >
              <RefreshCw
                size={14}
                className={clsx("transition-transform", isRefreshing && "animate-spin")}
              />
              Refresh
            </button>
            <button
              onClick={() => handleExport("pdf")}
              className="flex items-center gap-2 px-3 py-2 rounded-xl border border-gray-200 dark:border-slate-700 text-gray-600 dark:text-slate-400 hover:bg-gray-50 dark:hover:bg-slate-800 text-[13px] font-medium transition-all"
            >
              <Printer size={14} />
              Print
            </button>
            <div className="relative group">
              <button
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-violet-600 hover:bg-violet-700 text-white text-[13px] font-semibold shadow-md shadow-violet-500/20 transition-all active:scale-[0.98]"
              >
                <Download size={14} />
                Export
                <ChevronDown size={14} className="opacity-70" />
              </button>
              
              <div className="absolute right-0 top-full mt-2 w-36 bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 rounded-xl shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50">
                <button onClick={() => handleExport("excel")} className="w-full text-left px-4 py-2.5 text-[13px] font-medium text-gray-700 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-800 hover:text-violet-600 dark:hover:text-violet-400 rounded-t-xl transition-colors">
                  Export as Excel
                </button>
                <button onClick={() => handleExport("pdf")} className="w-full text-left px-4 py-2.5 text-[13px] font-medium text-gray-700 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-800 hover:text-violet-600 dark:hover:text-violet-400 rounded-b-xl transition-colors">
                  Export as PDF
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* ── Filters Bar ───────────────────────────── */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-100 dark:border-slate-800 p-4 flex flex-wrap items-end gap-4">
          {/* Period picker */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[11px] font-semibold text-gray-400 dark:text-slate-500 uppercase tracking-wider">
              Period
            </label>
            <div className="relative">
              <button
                onClick={() => setShowPeriodMenu((v) => !v)}
                className="flex items-center gap-2 px-3 py-2 rounded-xl border border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-800 text-[13px] font-semibold text-gray-800 dark:text-slate-200 hover:border-violet-400 dark:hover:border-violet-500 transition-all min-w-[160px]"
              >
                <Calendar size={14} className="text-violet-500 shrink-0" />
                {selectedPeriodLabel}
                <ChevronDown size={13} className="ml-auto text-gray-400 dark:text-slate-500" />
              </button>

              {showPeriodMenu && (
                <div className="absolute top-full left-0 mt-1.5 w-44 bg-white dark:bg-slate-900 rounded-xl border border-gray-100 dark:border-slate-700 shadow-xl z-30 overflow-hidden">
                  {PERIOD_OPTIONS.map((opt) => (
                    <button
                      key={opt.value}
                      onClick={() => { setPeriod(opt.value); setShowPeriodMenu(false); setDateError(""); }}
                      className={clsx(
                        "w-full px-4 py-2.5 text-left text-[13px] font-medium transition-colors",
                        period === opt.value
                          ? "bg-violet-50 dark:bg-violet-900/20 text-violet-700 dark:text-violet-300"
                          : "text-gray-700 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-800"
                      )}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Custom date range */}
          {period === "custom" && (
            <>
              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-semibold text-gray-400 dark:text-slate-500 uppercase tracking-wider">
                  From
                </label>
                <input
                  type="date"
                  value={customFrom}
                  onChange={(e) => { setCustomFrom(e.target.value); setDateError(""); }}
                  className="px-3 py-2 rounded-xl border border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-800 text-[13px] text-gray-800 dark:text-slate-200 outline-none focus:border-violet-400 dark:focus:border-violet-500 transition-all"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-semibold text-gray-400 dark:text-slate-500 uppercase tracking-wider">
                  To
                </label>
                <input
                  type="date"
                  value={customTo}
                  min={customFrom}
                  onChange={(e) => { setCustomTo(e.target.value); setDateError(""); }}
                  className="px-3 py-2 rounded-xl border border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-800 text-[13px] text-gray-800 dark:text-slate-200 outline-none focus:border-violet-400 dark:focus:border-violet-500 transition-all"
                />
              </div>
            </>
          )}

          {/* Compare toggle */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[11px] font-semibold text-gray-400 dark:text-slate-500 uppercase tracking-wider">
              Compare
            </label>
            <button
              onClick={() => setCompareEnabled((v) => !v)}
              className={clsx(
                "flex items-center gap-2 px-3 py-2 rounded-xl border text-[13px] font-semibold transition-all",
                compareEnabled
                  ? "border-violet-300 dark:border-violet-700 bg-violet-50 dark:bg-violet-900/20 text-violet-700 dark:text-violet-300"
                  : "border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-800 text-gray-600 dark:text-slate-400"
              )}
            >
              <span
                className={clsx(
                  "w-8 h-4 rounded-full relative transition-colors",
                  compareEnabled ? "bg-violet-600" : "bg-gray-300 dark:bg-slate-600"
                )}
              >
                <span
                  className={clsx(
                    "absolute top-0.5 w-3 h-3 rounded-full bg-white shadow transition-transform",
                    compareEnabled ? "translate-x-4" : "translate-x-0.5"
                  )}
                />
              </span>
              vs Prior Period
            </button>
          </div>

          {/* Apply button (custom range) */}
          {period === "custom" && (
            <button
              onClick={handleRefresh}
              className="px-4 py-2 rounded-xl bg-violet-600 hover:bg-violet-700 text-white text-[13px] font-semibold shadow-md shadow-violet-500/20 transition-all active:scale-[0.98]"
            >
              Apply
            </button>
          )}

          {/* Validation error */}
          {dateError && (
            <div className="flex items-center gap-2 px-3 py-2 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/30 rounded-xl text-[12px] text-red-600 dark:text-red-400 font-medium">
              <Info size={13} className="shrink-0" />
              {dateError}
            </div>
          )}
        </div>

        {/* ── Summary Cards ─────────────────────────── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <SummaryCard
            label="Total Income"
            value={totalIncome}
            change={pct(totalIncome, prevIncome)}
            positive={totalIncome >= prevIncome}
            icon={TrendingUp}
            color="bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400"
          />
          <SummaryCard
            label="Total Expenses"
            value={totalExpenses}
            change={pct(totalExpenses, prevExpenses)}
            positive={totalExpenses <= prevExpenses}
            icon={TrendingDown}
            color="bg-red-100 dark:bg-red-900/30 text-red-500 dark:text-red-400"
          />
          <SummaryCard
            label="Net Profit"
            value={Math.abs(netProfit)}
            change={pct(netProfit, prevProfit)}
            positive={netProfit >= prevProfit}
            icon={netProfit >= 0 ? TrendingUp : TrendingDown}
            color={
              netProfit >= 0
                ? "bg-violet-100 dark:bg-violet-900/30 text-violet-600 dark:text-violet-400"
                : "bg-red-100 dark:bg-red-900/30 text-red-500 dark:text-red-400"
            }
          />
          <SummaryCard
            label="Profit Margin"
            value={parseFloat(profitMargin)}
            change={null}
            positive={parseFloat(profitMargin) >= 0}
            icon={TrendingUp}
            color="bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400"
          />
        </div>

        {/* ── Income Table ──────────────────────────── */}
        <Section
          section={INCOME_DATA}
          total={totalIncome}
          prevTotal={prevIncome}
          compare={compareEnabled}
          accent="emerald"
        />

        {/* ── Expenses Table ────────────────────────── */}
        <Section
          section={EXPENSE_DATA}
          total={totalExpenses}
          prevTotal={prevExpenses}
          compare={compareEnabled}
          accent="red"
        />

        {/* ── Net Profit Row ────────────────────────── */}
        <div
          className={clsx(
            "rounded-2xl border-2 p-5 flex flex-wrap items-center justify-between gap-4",
            netProfit >= 0
              ? "bg-emerald-50 dark:bg-emerald-900/10 border-emerald-200 dark:border-emerald-800/30"
              : "bg-red-50 dark:bg-red-900/10 border-red-200 dark:border-red-800/30"
          )}
        >
          <div>
            <p className="text-[11px] font-bold uppercase tracking-widest text-gray-500 dark:text-slate-400">
              Net {netProfit >= 0 ? "Profit" : "Loss"}
            </p>
            <p
              className={clsx(
                "text-3xl font-black mt-1 tracking-tight",
                netProfit >= 0
                  ? "text-emerald-700 dark:text-emerald-400"
                  : "text-red-600 dark:text-red-400"
              )}
            >
              {fmt(Math.abs(netProfit))}
            </p>
          </div>
          <div className="text-right">
            <p className="text-[11px] font-bold uppercase tracking-widest text-gray-400 dark:text-slate-500 mb-1">
              Profit Margin
            </p>
            <span
              className={clsx(
                "text-2xl font-black",
                parseFloat(profitMargin) >= 0
                  ? "text-emerald-600 dark:text-emerald-400"
                  : "text-red-500 dark:text-red-400"
              )}
            >
              {profitMargin}%
            </span>
          </div>
        </div>

      </div>
    </div>
  );
}

/* ─── Section Table ─────────────────────────────────────────── */
function Section({
  section, total, prevTotal, compare, accent,
}: {
  section: { title: string; items: LineItem[] };
  total: number;
  prevTotal: number;
  compare: boolean;
  accent: "emerald" | "red";
}) {
  const [expanded, setExpanded] = useState(true);

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-100 dark:border-slate-800 overflow-hidden">
      {/* Header */}
      <button
        onClick={() => setExpanded((v) => !v)}
        className="w-full flex items-center justify-between px-5 py-4 hover:bg-gray-50 dark:hover:bg-slate-800/50 transition-colors"
      >
        <div className="flex items-center gap-3">
          <span
            className={clsx(
              "w-2.5 h-2.5 rounded-full shrink-0",
              accent === "emerald" ? "bg-emerald-500" : "bg-red-500"
            )}
          />
          <span className="text-[14px] font-bold text-gray-900 dark:text-white">
            {section.title}
          </span>
          <span
            className={clsx(
              "text-[13px] font-black ml-2",
              accent === "emerald"
                ? "text-emerald-600 dark:text-emerald-400"
                : "text-red-500 dark:text-red-400"
            )}
          >
            {fmt(total)}
          </span>
        </div>
        <ChevronDown
          size={16}
          strokeWidth={2.5}
          className={clsx(
            "text-gray-400 dark:text-slate-500 transition-transform duration-200",
            !expanded && "-rotate-90"
          )}
        />
      </button>

      {/* Table */}
      {expanded && (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-y border-gray-50 dark:border-slate-800 bg-gray-50/60 dark:bg-slate-800/30">
                <th className="py-2.5 px-4 text-left text-[11px] font-bold text-gray-400 dark:text-slate-500 uppercase tracking-wider">
                  Account
                </th>
                <th className="py-2.5 px-4 text-right text-[11px] font-bold text-gray-400 dark:text-slate-500 uppercase tracking-wider">
                  Current
                </th>
                {compare && (
                  <th className="py-2.5 px-4 text-right text-[11px] font-bold text-gray-400 dark:text-slate-500 uppercase tracking-wider">
                    Previous
                  </th>
                )}
                {compare && (
                  <th className="py-2.5 px-4 text-right text-[11px] font-bold text-gray-400 dark:text-slate-500 uppercase tracking-wider">
                    Change
                  </th>
                )}
              </tr>
            </thead>
            <tbody>
              {section.items.map((item, idx) => (
                <DataRow
                  key={item.label}
                  item={compare ? item : { ...item, previous: 0 }}
                  isLast={idx === section.items.length - 1}
                />
              ))}
            </tbody>
            <tfoot>
              <tr className="border-t-2 border-gray-100 dark:border-slate-700 bg-gray-50/80 dark:bg-slate-800/40">
                <td className="py-3 px-4 text-[13px] font-bold text-gray-900 dark:text-white">
                  Total {section.title}
                </td>
                <td
                  className={clsx(
                    "py-3 px-4 text-[13px] font-black text-right tabular-nums",
                    accent === "emerald"
                      ? "text-emerald-700 dark:text-emerald-400"
                      : "text-red-600 dark:text-red-400"
                  )}
                >
                  {fmt(total)}
                </td>
                {compare && (
                  <td className="py-3 px-4 text-[13px] font-semibold text-gray-500 dark:text-slate-400 text-right tabular-nums">
                    {fmt(prevTotal)}
                  </td>
                )}
                {compare && <td />}
              </tr>
            </tfoot>
          </table>
        </div>
      )}
    </div>
  );
}
