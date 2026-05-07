"use client";

import { useState, useEffect, useCallback } from "react";
import {
  TrendingDown,
  Home,
  Briefcase,
  Truck,
  Zap,
  PackageMinus,
  Plus,
  Calendar,
  ChevronDown,
  BarChart2,
  RefreshCw,
  CheckCircle2,
  Loader2,
  AlertCircle,
} from "lucide-react";
import { clsx } from "clsx";
import { accountingApi } from "@/lib/api";

type ExpenseCategory = "RENT" | "SALARY" | "TRANSPORT" | "UTILITIES" | "OTHER";

interface Expense {
  id: string;
  date: string;
  category: string;
  amount: number;
  note: string;
  recordedBy?: string;
}

const CATEGORY_CONFIG: Record<ExpenseCategory, { icon: any; label: string; color: string; bg: string }> = {
  RENT:      { icon: Home,         label: "Rent & Leases",        color: "text-indigo-500", bg: "bg-indigo-50" },
  SALARY:    { icon: Briefcase,    label: "Payroll & Wages",      color: "text-blue-500",   bg: "bg-blue-50" },
  TRANSPORT: { icon: Truck,        label: "Transport & Logistics", color: "text-orange-500", bg: "bg-orange-50" },
  UTILITIES: { icon: Zap,          label: "Electricity & Bills",   color: "text-yellow-500", bg: "bg-yellow-50" },
  OTHER:     { icon: PackageMinus, label: "Miscellaneous",         color: "text-slate-500",  bg: "bg-slate-100" },
};

const EMPTY_FORM = {
  category: "RENT" as ExpenseCategory,
  amount: "",
  note: "",
  date: new Date().toISOString().split("T")[0],
};

export default function ExpensesPage() {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Form state
  const [form, setForm] = useState(EMPTY_FORM);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  const fetchExpenses = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await accountingApi.getExpenses();
      const data: Expense[] = res.data?.expenses ?? res.data ?? [];
      setExpenses(data);
    } catch (err) {
      console.error("Fetch error:", err);
      setExpenses([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchExpenses();
  }, [fetchExpenses]);

  const totalThisMonth = expenses.reduce((sum, e) => sum + e.amount, 0);

  // Calculate top category
  const grouped = expenses.reduce((acc, curr) => {
    acc[curr.category] = (acc[curr.category] || 0) + curr.amount;
    return acc;
  }, {} as Record<string, number>);
  const topCategoryStr = Object.entries(grouped).sort((a, b) => b[1] - a[1])[0]?.[0] as ExpenseCategory | undefined;
  const TopIcon = topCategoryStr && CATEGORY_CONFIG[topCategoryStr] ? CATEGORY_CONFIG[topCategoryStr].icon : BarChart2;

  const handleSubmit = async () => {
    if (!form.amount || parseFloat(form.amount) <= 0) {
      setSubmitError("Enter a valid amount.");
      return;
    }
    setSubmitting(true);
    setSubmitError(null);
    try {
      await accountingApi.recordExpense({
        category: form.category,
        amount: parseFloat(form.amount),
        note: form.note.trim() || undefined,
        date: form.date || undefined,
      });
      setSubmitSuccess(true);
      setForm(EMPTY_FORM);
      await fetchExpenses();
      setTimeout(() => setSubmitSuccess(false), 2000);
    } catch (err: any) {
      setSubmitError(err?.response?.data?.message || "Failed to save expense.");
    } finally {
      setSubmitting(false);
    }
  };

  const getCategoryConf = (cat: string) =>
    CATEGORY_CONFIG[cat as ExpenseCategory] ?? CATEGORY_CONFIG.OTHER;

  return (
    <div className="max-w-6xl mx-auto space-y-12 py-4 animate-in fade-in duration-700">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 border-b border-gray-100 pb-10">
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <div className="w-2 h-8 bg-orange-500 rounded-full" />
            <h1 className="text-4xl font-black text-slate-900 tracking-tight">Expenses</h1>
          </div>
          <p className="text-sm font-medium text-slate-400 max-w-md leading-relaxed">
            Direct money out that is not linked to vendor inventory purchases.
          </p>
        </div>
        
        <div className="flex items-center gap-4">
          <button
            onClick={fetchExpenses}
            className="w-12 h-12 flex items-center justify-center rounded-2xl bg-slate-50 text-slate-400 hover:text-orange-500 hover:bg-orange-50 transition-all active:scale-90"
          >
            <RefreshCw size={18} className={clsx(loading && "animate-spin")} />
          </button>
        </div>
      </div>

      {/* Elegant Metrics Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-12 px-2">
        <div className="space-y-1">
          <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Total Expenses This Month</p>
          <p className="text-2xl font-black transition-all tabular-nums text-slate-900">
            ₹{totalThisMonth.toLocaleString()}
          </p>
        </div>
        <div className="space-y-1">
          <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Highest Spend Category</p>
          <p className="text-2xl font-black transition-all tabular-nums text-orange-500 truncate mt-0.5">
            {topCategoryStr && CATEGORY_CONFIG[topCategoryStr] ? CATEGORY_CONFIG[topCategoryStr].label : "None"}
          </p>
        </div>
        <div className="space-y-1">
          <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Total Entries</p>
          <p className="text-2xl font-black transition-all tabular-nums text-slate-900">
            {expenses.length}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* ADD EXPENSE FORM */}
        <div className="lg:col-span-1 border border-slate-100 bg-white rounded-[2rem] overflow-hidden flex flex-col p-6">
          <div className="mb-6 flex items-center gap-3 border-b border-slate-50 pb-4">
            <div className="w-8 h-8 rounded-xl bg-orange-50 flex items-center justify-center">
              <Plus size={16} className="text-orange-500" />
            </div>
            <h3 className="text-sm font-black uppercase tracking-widest text-slate-900">
              Record Expense
            </h3>
          </div>

          <div className="space-y-5 flex-1">
            {/* Category */}
            <div className="space-y-2.5">
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
                Expense Category <span className="text-red-400">*</span>
              </label>
              <div className="relative">
                <select
                  value={form.category}
                  onChange={(e) => setForm((f) => ({ ...f, category: e.target.value as ExpenseCategory }))}
                  className="w-full appearance-none bg-slate-50 border-none rounded-2xl px-5 py-4 text-sm font-bold focus:outline-none focus:bg-white focus:ring-4 focus:ring-slate-100 text-slate-900 transition-all cursor-pointer"
                >
                  {Object.entries(CATEGORY_CONFIG).map(([key, conf]) => (
                    <option key={key} value={key}>{conf.label}</option>
                  ))}
                </select>
                <ChevronDown size={16} className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
              </div>
            </div>

            {/* Amount */}
            <div className="space-y-2.5">
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
                Amount (₹) <span className="text-red-400">*</span>
              </label>
              <div className="relative">
                <span className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-sm">₹</span>
                <input
                  type="number"
                  min="0"
                  value={form.amount}
                  onChange={(e) => setForm((f) => ({ ...f, amount: e.target.value }))}
                  placeholder="0.00"
                  className="w-full pl-9 pr-5 py-4 bg-slate-50 border-none rounded-2xl text-sm font-black text-slate-900 placeholder:text-slate-300 focus:outline-none focus:bg-white focus:ring-4 focus:ring-slate-100 transition-all tabular-nums"
                />
              </div>
            </div>

            {/* Date */}
            <div className="space-y-2.5">
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
                Date
              </label>
              <input
                type="date"
                value={form.date}
                onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))}
                className="w-full bg-slate-50 border-none rounded-2xl px-5 py-4 text-sm font-bold text-slate-900 focus:outline-none focus:bg-white focus:ring-4 focus:ring-slate-100 transition-all"
              />
            </div>

            {/* Note */}
            <div className="space-y-2.5">
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
                Note / Reference
              </label>
              <textarea
                value={form.note}
                onChange={(e) => setForm((f) => ({ ...f, note: e.target.value }))}
                placeholder="Brief description of this expense..."
                className="w-full bg-slate-50 border-none rounded-2xl px-5 py-4 text-sm font-medium text-slate-900 placeholder:text-slate-300 focus:outline-none focus:bg-white focus:ring-4 focus:ring-slate-100 transition-all min-h-[100px] resize-none"
              />
            </div>

            {/* Error & Success States */}
            {submitError && (
              <div className="flex items-center gap-2 p-4 bg-red-50 rounded-2xl text-red-600 text-[11px] font-black uppercase tracking-widest">
                <AlertCircle size={14} className="shrink-0" /> {submitError}
              </div>
            )}
            {submitSuccess && (
              <div className="flex items-center gap-2 p-4 bg-emerald-50 rounded-2xl text-emerald-600 text-[11px] font-black uppercase tracking-widest">
                <CheckCircle2 size={14} className="shrink-0" /> Expense saved successfully!
              </div>
            )}
          </div>

          <div className="pt-6 mt-6 border-t border-slate-50">
            <button
              onClick={handleSubmit}
              disabled={submitting || !form.amount}
              className="w-full py-4 bg-slate-900 hover:bg-black text-white rounded-2xl text-[11px] font-black uppercase tracking-[0.15em] shadow-lg shadow-slate-900/10 transition-all active:translate-y-0.5 disabled:opacity-50 disabled:shadow-none flex items-center justify-center gap-2"
            >
              {submitting ? (
                <><Loader2 size={16} className="animate-spin" /> Saving...</>
              ) : (
                <><Plus size={16} /> Save Expense Entry</>
              )}
            </button>
          </div>
        </div>

        {/* EXPENSE LEDGER */}
        <div className="lg:col-span-2 border border-slate-100 bg-white rounded-[2rem] overflow-hidden flex flex-col">
          <div className="px-8 py-6 border-b border-slate-100 bg-slate-50/50">
            <h2 className="text-sm font-black text-slate-900 uppercase tracking-widest">
              Recent Expense Logs
            </h2>
          </div>

          <div className="divide-y divide-slate-50 overflow-y-auto max-h-[700px]">
            {/* Loading */}
            {loading &&
              Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="p-6 flex items-center gap-4 animate-pulse">
                  <div className="w-14 h-14 rounded-2xl bg-slate-100 shrink-0" />
                  <div className="flex-1 space-y-3">
                    <div className="h-4 bg-slate-100 rounded-md w-1/2" />
                    <div className="h-3 bg-slate-50 rounded-md w-1/3" />
                  </div>
                  <div className="h-6 w-24 bg-slate-100 rounded-md" />
                </div>
              ))}

            {/* Error state */}
            {!loading && error && (
              <div className="p-20 text-center space-y-6">
                <div className="p-8 bg-red-50 w-fit mx-auto rounded-[2.5rem]">
                  <AlertCircle size={48} className="text-red-200" strokeWidth={1} />
                </div>
                <div className="space-y-2">
                  <p className="text-red-400 font-medium">{error}</p>
                  <button onClick={fetchExpenses} className="text-xs text-orange-500 hover:underline font-bold">Retry connection</button>
                </div>
              </div>
            )}

            {/* Empty state */}
            {!loading && !error && expenses.length === 0 && (
              <div className="p-20 text-center space-y-6">
                <div className="p-8 bg-slate-50 w-fit mx-auto rounded-[2.5rem]">
                  <TrendingDown size={48} className="text-slate-200" strokeWidth={1} />
                </div>
                <p className="text-slate-400 font-medium">Use the form to record your first expense.</p>
              </div>
            )}

            {/* Data rows */}
            {!loading &&
              !error &&
              expenses.map((expense) => {
                const conf = getCategoryConf(expense.category);
                const Icon = conf.icon;
                return (
                  <div key={expense.id} className="p-6 flex flex-col sm:flex-row sm:items-center gap-5 hover:bg-slate-50/50 transition-colors group">
                    <div className={clsx("w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 transition-transform group-hover:scale-105", conf.bg)}>
                      <Icon className={conf.color} size={24} strokeWidth={1.5} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-2 mb-2">
                        <h3 className="text-base font-black text-slate-900 truncate">
                          {expense.note || "Untitled Expense"}
                        </h3>
                        <span className="text-xl font-black text-slate-900 shrink-0 tabular-nums">
                          ₹{expense.amount.toLocaleString()}
                        </span>
                      </div>
                      <div className="flex flex-wrap items-center gap-3">
                        <span className={clsx("px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-[0.1em]", conf.bg, conf.color)}>
                          {conf.label}
                        </span>
                        <span className="flex items-center gap-1.5 text-[10px] text-slate-400 font-bold uppercase tracking-widest">
                          <Calendar size={12} className="text-slate-300" />
                          {new Date(expense.date).toLocaleDateString("en-IN", {
                            day: "2-digit",
                            month: "short",
                            year: "numeric",
                          })}
                        </span>
                        {expense.recordedBy && (
                          <span className="text-[10px] text-slate-400 font-bold border-l border-slate-200 pl-3">
                            Added by <span className="text-slate-600">{expense.recordedBy}</span>
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
          </div>
        </div>
      </div>
    </div>
  );
}
