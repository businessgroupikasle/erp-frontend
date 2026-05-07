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
  CreditCard,
  History,
  X,
  Trash2,
  AlertTriangle,
  Receipt,
  Wallet,
  Building,
  User,
  Clock,
} from "lucide-react";
import { clsx } from "clsx";
import { accountingApi, accountsApi } from "@/lib/api";

type ExpenseCategory = "RENT" | "SALARY" | "TRANSPORT" | "UTILITIES" | "OTHER";

interface Expense {
  id: string;
  expenseNumber: string;
  date: string;
  dueDate?: string;
  category: string;
  payee?: string;
  amount: number;
  paidAmount: number;
  note: string;
  status: "UNPAID" | "PARTIAL" | "PAID" | "CANCELLED";
  recordedBy?: string;
  accountId?: string;
  account?: { name: string };
  isCancelled: boolean;
}

interface PaymentRecord {
  id: string;
  createdAt: string;
  paidAmount: number;
  paymentMode: string;
  transactionRef?: string;
  account?: { name: string };
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
  payee: "",
  amount: "",
  note: "",
  date: new Date().toISOString().split("T")[0],
  dueDate: "",
  isPaidImmediately: true,
  accountId: "",
  paymentMode: "CASH",
};

export default function ExpensesPage() {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [accounts, setAccounts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Form state
  const [form, setForm] = useState(EMPTY_FORM);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  // Modal states
  const [payingExpense, setPayingExpense] = useState<Expense | null>(null);
  const [payAmount, setPayAmount] = useState("");
  const [payAccountId, setPayAccountId] = useState("");
  const [payMode, setPayMode] = useState("CASH");
  const [isPaying, setIsPaying] = useState(false);

  const [viewingHistory, setViewingHistory] = useState<Expense | null>(null);
  const [history, setHistory] = useState<PaymentRecord[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [expRes, accRes] = await Promise.all([
        accountingApi.getExpenses(),
        accountsApi.getAll(),
      ]);
      setExpenses(expRes.data?.expenses ?? expRes.data ?? []);
      setAccounts(accRes.data ?? []);
      
      // Pre-select first account if empty
      if (accRes.data?.length > 0 && !form.accountId) {
        setForm(f => ({ ...f, accountId: accRes.data[0].id }));
      }
    } catch (err) {
      console.error("Fetch error:", err);
      setError("Failed to load dashboard data.");
    } finally {
      setLoading(false);
    }
  }, [form.accountId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const totalThisMonth = expenses.reduce((sum, e) => sum + e.amount, 0);
  const totalPaid = expenses.reduce((sum, e) => sum + e.paidAmount, 0);
  const totalDue = Math.max(0, totalThisMonth - totalPaid);

  const handleSubmit = async () => {
    if (!form.amount || parseFloat(form.amount) <= 0) {
      setSubmitError("Enter a valid amount.");
      return;
    }
    if (!form.payee.trim()) {
      setSubmitError("Payee/Vendor name is required.");
      return;
    }
    if (form.isPaidImmediately && !form.accountId) {
      setSubmitError("Select an account for immediate payment.");
      return;
    }

    setSubmitting(true);
    setSubmitError(null);
    try {
      await accountingApi.recordExpense({
        category: form.category,
        payee: form.payee.trim(),
        amount: parseFloat(form.amount),
        note: form.note.trim() || undefined,
        date: form.date || undefined,
        dueDate: form.dueDate || undefined,
        isPaidImmediately: form.isPaidImmediately,
        accountId: form.isPaidImmediately ? form.accountId : undefined,
        paymentMode: form.isPaidImmediately ? form.paymentMode : undefined,
      });
      setSubmitSuccess(true);
      setForm({ ...EMPTY_FORM, accountId: accounts[0]?.id || "" });
      await fetchData();
      setTimeout(() => setSubmitSuccess(false), 2000);
    } catch (err: any) {
      setSubmitError(err?.response?.data?.error || err?.response?.data?.message || "Failed to save expense.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleRecordPayment = async () => {
    if (!payingExpense || !payAmount || parseFloat(payAmount) <= 0) return;
    
    setIsPaying(true);
    try {
      await accountingApi.recordExpensePayment(payingExpense.id, {
        amount: parseFloat(payAmount),
        accountId: payAccountId,
        paymentMode: payMode,
      });
      setPayingExpense(null);
      setPayAmount("");
      await fetchData();
    } catch (err: any) {
      alert(err?.response?.data?.error || "Payment failed");
    } finally {
      setIsPaying(false);
    }
  };

  const fetchHistory = async (expense: Expense) => {
    setViewingHistory(expense);
    setLoadingHistory(true);
    try {
      const res = await accountingApi.getExpenseById(expense.id);
      setHistory(res.data.payments || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingHistory(false);
    }
  };

  const handleCancel = async (id: string) => {
    if (!confirm("Are you sure you want to cancel this expense? This is an audit action.")) return;
    try {
      await accountingApi.deleteExpense(id);
      await fetchData();
    } catch (err: any) {
      alert(err?.response?.data?.error || "Failed to cancel");
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "PAID":
        return <span className="px-2 py-0.5 bg-emerald-50 text-emerald-600 text-[9px] font-black uppercase rounded-md flex items-center gap-1"><CheckCircle2 size={10} /> Paid</span>;
      case "PARTIAL":
        return <span className="px-2 py-0.5 bg-orange-50 text-orange-600 text-[9px] font-black uppercase rounded-md flex items-center gap-1"><RefreshCw size={10} className="animate-spin-slow" /> Partial</span>;
      case "UNPAID":
        return <span className="px-2 py-0.5 bg-red-50 text-red-600 text-[9px] font-black uppercase rounded-md flex items-center gap-1"><AlertCircle size={10} /> Unpaid</span>;
      case "CANCELLED":
        return <span className="px-2 py-0.5 bg-slate-100 text-slate-500 text-[9px] font-black uppercase rounded-md flex items-center gap-1"><X size={10} /> Cancelled</span>;
      default:
        return null;
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
            <h1 className="text-4xl font-black text-slate-900 tracking-tight">Expense Workflow</h1>
          </div>
          <p className="text-sm font-medium text-slate-400 max-w-md leading-relaxed">
            Manage operational spending, utilities, and bills. Record payables and track payment history.
          </p>
        </div>
        
        <div className="flex items-center gap-4">
          <button
            onClick={fetchData}
            className="w-12 h-12 flex items-center justify-center rounded-2xl bg-slate-50 text-slate-400 hover:text-orange-500 hover:bg-orange-50 transition-all active:scale-90"
          >
            <RefreshCw size={18} className={clsx(loading && "animate-spin")} />
          </button>
        </div>
      </div>

      {/* Enterprise Metrics Row */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-8 px-2">
        <div className="p-6 bg-slate-50/50 rounded-3xl border border-slate-100 space-y-2">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Total Monthly Bill</p>
          <p className="text-2xl font-black text-slate-900">₹{totalThisMonth.toLocaleString()}</p>
        </div>
        <div className="p-6 bg-emerald-50/30 rounded-3xl border border-emerald-100 space-y-2">
          <p className="text-[10px] font-black text-emerald-500 uppercase tracking-widest">Amount Paid</p>
          <p className="text-2xl font-black text-emerald-600">₹{totalPaid.toLocaleString()}</p>
        </div>
        <div className="p-6 bg-orange-50/30 rounded-3xl border border-orange-100 space-y-2">
          <p className="text-[10px] font-black text-orange-500 uppercase tracking-widest">Outstanding Due</p>
          <p className="text-2xl font-black text-orange-600">₹{totalDue.toLocaleString()}</p>
        </div>
        <div className="p-6 bg-slate-900 rounded-3xl space-y-2">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Active Bills</p>
          <p className="text-2xl font-black text-white">{expenses.filter(e => e.status !== "PAID" && !e.isCancelled).length}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* ADD EXPENSE FORM */}
        <div className="lg:col-span-1 border border-slate-100 bg-white rounded-[2rem] overflow-hidden flex flex-col p-6 shadow-sm">
          <div className="mb-6 flex items-center gap-3 border-b border-slate-50 pb-4">
            <div className="w-8 h-8 rounded-xl bg-orange-50 flex items-center justify-center">
              <Plus size={16} className="text-orange-500" />
            </div>
            <h3 className="text-sm font-black uppercase tracking-widest text-slate-900">
              Create Expense Bill
            </h3>
          </div>

          <div className="space-y-5 flex-1">
            {/* Category */}
            <div className="space-y-2.5">
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
                Category <span className="text-red-400">*</span>
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

            {/* Payee */}
            <div className="space-y-2.5">
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
                Payee / Vendor <span className="text-red-400">*</span>
              </label>
              <div className="relative">
                <span className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400">
                  <User size={16} />
                </span>
                <input
                  type="text"
                  value={form.payee}
                  onChange={(e) => setForm((f) => ({ ...f, payee: e.target.value }))}
                  placeholder="e.g. Airtel Office, EB Department"
                  className="w-full pl-12 pr-5 py-4 bg-slate-50 border-none rounded-2xl text-sm font-bold text-slate-900 placeholder:text-slate-300 focus:outline-none focus:bg-white focus:ring-4 focus:ring-slate-100 transition-all"
                />
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

            {/* Dates */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2.5">
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
                  Bill Date
                </label>
                <input
                  type="date"
                  value={form.date}
                  onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))}
                  className="w-full bg-slate-50 border-none rounded-2xl px-5 py-4 text-[11px] font-bold text-slate-900 focus:outline-none transition-all"
                />
              </div>
              <div className="space-y-2.5">
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
                  Due Date
                </label>
                <input
                  type="date"
                  value={form.dueDate}
                  onChange={(e) => setForm((f) => ({ ...f, dueDate: e.target.value }))}
                  className="w-full bg-slate-50 border-none rounded-2xl px-5 py-4 text-[11px] font-bold text-slate-900 focus:outline-none transition-all"
                />
              </div>
            </div>

            {/* Immediate Payment Toggle */}
            <div className="p-4 bg-slate-50/50 rounded-2xl space-y-4">
              <label className="flex items-center gap-3 cursor-pointer group">
                <div className="relative">
                  <input
                    type="checkbox"
                    checked={form.isPaidImmediately}
                    onChange={(e) => setForm(f => ({ ...f, isPaidImmediately: e.target.checked }))}
                    className="sr-only"
                  />
                  <div className={clsx("w-10 h-6 rounded-full transition-colors", form.isPaidImmediately ? "bg-emerald-500" : "bg-slate-300")} />
                  <div className={clsx("absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform", form.isPaidImmediately && "translate-x-4")} />
                </div>
                <span className="text-xs font-black uppercase tracking-widest text-slate-600">Mark as Paid Now</span>
              </label>

              {form.isPaidImmediately && (
                <div className="space-y-3 animate-in slide-in-from-top-2 duration-300">
                   <div className="space-y-1.5">
                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Paid From Account</label>
                    <select
                      value={form.accountId}
                      onChange={(e) => setForm(f => ({ ...f, accountId: e.target.value }))}
                      className="w-full bg-white border border-slate-100 rounded-xl px-4 py-2.5 text-xs font-bold text-slate-900 focus:outline-none"
                    >
                      <option value="">Select Account</option>
                      {accounts.map(acc => (
                        <option key={acc.id} value={acc.id}>{acc.name} (₹{acc.balance})</option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Payment Method</label>
                    <select
                      value={form.paymentMode}
                      onChange={(e) => setForm(f => ({ ...f, paymentMode: e.target.value }))}
                      className="w-full bg-white border border-slate-100 rounded-xl px-4 py-2.5 text-xs font-bold text-slate-900 focus:outline-none"
                    >
                      {["CASH", "UPI", "BANK_TRANSFER", "CARD", "CHEQUE"].map(m => (
                        <option key={m} value={m}>{m.replace("_", " ")}</option>
                      ))}
                    </select>
                  </div>
                </div>
              )}
            </div>

            {/* Note */}
            <div className="space-y-2.5">
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
                Note / Reference
              </label>
              <textarea
                value={form.note}
                onChange={(e) => setForm((f) => ({ ...f, note: e.target.value }))}
                placeholder="Electricity bill Jan 2026..."
                className="w-full bg-slate-50 border-none rounded-2xl px-5 py-4 text-sm font-medium text-slate-900 placeholder:text-slate-300 focus:outline-none focus:bg-white focus:ring-4 focus:ring-slate-100 transition-all min-h-[80px] resize-none"
              />
            </div>

            {/* Error & Success States */}
            {submitError && (
              <div className="flex items-center gap-2 p-4 bg-red-50 rounded-2xl text-red-600 text-[11px] font-black uppercase tracking-widest animate-in shake duration-300">
                <AlertCircle size={14} className="shrink-0" /> {submitError}
              </div>
            )}
            {submitSuccess && (
              <div className="flex items-center gap-2 p-4 bg-emerald-50 rounded-2xl text-emerald-600 text-[11px] font-black uppercase tracking-widest">
                <CheckCircle2 size={14} className="shrink-0" /> Expense bill recorded!
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
                <><Loader2 size={16} className="animate-spin" /> Processing...</>
              ) : (
                <><Plus size={16} /> Save Expense Entry</>
              )}
            </button>
          </div>
        </div>

        {/* EXPENSE LEDGER */}
        <div className="lg:col-span-2 border border-slate-100 bg-white rounded-[2rem] overflow-hidden flex flex-col shadow-sm">
          <div className="px-8 py-6 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
            <h2 className="text-sm font-black text-slate-900 uppercase tracking-widest">
              Audit Logs & Ledger
            </h2>
            <div className="flex items-center gap-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">
              <span className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-emerald-500" /> Paid</span>
              <span className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-orange-500" /> Partial</span>
              <span className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-red-500" /> Unpaid</span>
            </div>
          </div>

          <div className="divide-y divide-slate-50 overflow-y-auto max-h-[850px]">
            {/* Loading */}
            {loading && Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="p-6 flex items-center gap-4 animate-pulse">
                <div className="w-14 h-14 rounded-2xl bg-slate-100 shrink-0" />
                <div className="flex-1 space-y-3">
                  <div className="h-4 bg-slate-100 rounded-md w-1/2" />
                  <div className="h-3 bg-slate-50 rounded-md w-1/3" />
                </div>
              </div>
            ))}

            {/* Empty state */}
            {!loading && expenses.length === 0 && (
              <div className="p-32 text-center space-y-6">
                <div className="p-8 bg-slate-50 w-fit mx-auto rounded-[2.5rem]">
                  <Receipt size={48} className="text-slate-200" strokeWidth={1} />
                </div>
                <div className="space-y-1">
                  <p className="text-slate-900 font-black uppercase tracking-widest text-xs">No expense bills created yet.</p>
                  <p className="text-slate-400 font-medium tracking-tight text-sm">Create your first operational expense to begin tracking payables.</p>
                </div>
              </div>
            )}

            {/* Data rows */}
            {!loading && expenses.map((expense) => {
              const conf = getCategoryConf(expense.category);
              const Icon = conf.icon;
              const balance = Math.max(0, expense.amount - expense.paidAmount);
              const isOverdue = expense.dueDate && new Date(expense.dueDate) < new Date() && expense.status !== "PAID";

              return (
                <div key={expense.id} className="p-6 flex flex-col group hover:bg-slate-50/30 transition-colors">
                  <div className="flex items-start gap-5">
                    <div className={clsx("w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 transition-transform group-hover:scale-105", conf.bg)}>
                      <Icon className={conf.color} size={24} strokeWidth={1.5} />
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">{expense.expenseNumber || "UNTITLED"}</span>
                          {getStatusBadge(expense.status)}
                          {isOverdue && <span className="px-1.5 py-0.5 bg-red-100 text-red-600 text-[8px] font-black uppercase rounded">Overdue</span>}
                        </div>
                        <span className="text-xl font-black text-slate-900 tabular-nums">₹{expense.amount.toLocaleString()}</span>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <h3 className="text-base font-black text-slate-900 truncate">
                          {expense.payee || expense.category.replace("_", " ")}
                        </h3>
                        <div className="flex items-center gap-6">
                           <div className="text-right">
                            <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest">Paid</p>
                            <p className="text-sm font-black text-emerald-500 tabular-nums">₹{expense.paidAmount.toLocaleString()}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest">Remaining</p>
                            <p className={clsx("text-sm font-black tabular-nums", balance > 0 ? "text-orange-600" : "text-slate-300")}>
                              ₹{balance.toLocaleString()}
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="mt-4 flex items-center justify-between border-t border-slate-50 pt-4">
                        <div className="flex items-center gap-4">
                          <span className="flex items-center gap-1.5 text-[9px] text-slate-400 font-bold uppercase tracking-widest">
                            <Calendar size={12} className="text-slate-300" />
                            {new Date(expense.date).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}
                          </span>
                          {expense.dueDate && (
                             <span className={clsx("flex items-center gap-1.5 text-[9px] font-bold uppercase tracking-widest", isOverdue ? "text-red-500" : "text-slate-400")}>
                              <Clock size={12} className={isOverdue ? "text-red-400" : "text-slate-300"} />
                              Due: {new Date(expense.dueDate).toLocaleDateString("en-IN", { day: "2-digit", month: "short" })}
                            </span>
                          )}
                          <button 
                            onClick={() => fetchHistory(expense)}
                            className="text-[9px] text-slate-400 hover:text-slate-900 font-black uppercase tracking-widest flex items-center gap-1.5 transition-colors"
                          >
                            <History size={12} /> View History
                          </button>
                        </div>
                        
                        <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          {!expense.isCancelled && expense.status !== "PAID" && (
                            <button 
                              onClick={() => {
                                setPayingExpense(expense);
                                setPayAmount(balance.toString());
                                setPayAccountId(expense.accountId || accounts[0]?.id || "");
                                setPayMode(expense.paymentMode || "CASH");
                              }}
                              className="px-4 py-2 bg-slate-900 text-white rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-black transition-all active:scale-95 shadow-lg shadow-slate-900/10"
                            >
                              Record Payment
                            </button>
                          )}
                          {expense.status !== "PAID" && !expense.isCancelled && (
                            <button 
                              onClick={() => handleCancel(expense.id)}
                              className="p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                            >
                              <Trash2 size={14} />
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* RECORD PAYMENT MODAL */}
      {payingExpense && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4 animate-in fade-in duration-300">
          <div className="bg-white rounded-[2.5rem] w-full max-w-md overflow-hidden shadow-2xl animate-in zoom-in-95 duration-300">
            <div className="px-8 py-6 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-orange-50 flex items-center justify-center">
                  <CreditCard className="text-orange-500" size={20} />
                </div>
                <div>
                  <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest">Record Payment</h3>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Ref: {payingExpense.expenseNumber}</p>
                </div>
              </div>
              <button onClick={() => setPayingExpense(null)} className="p-2 hover:bg-slate-200 rounded-xl transition-colors"><X size={20} /></button>
            </div>

            <div className="p-8 space-y-6">
              <div className="p-4 bg-orange-50 rounded-2xl border border-orange-100 flex items-center justify-between">
                <div className="space-y-0.5">
                  <p className="text-[10px] font-black text-orange-400 uppercase tracking-widest">Remaining Balance</p>
                  <p className="text-xl font-black text-orange-600 tabular-nums">₹{(payingExpense.amount - payingExpense.paidAmount).toLocaleString()}</p>
                </div>
                <CreditCard size={24} className="text-orange-200" />
              </div>

              <div className="space-y-5">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Payment Amount (₹)</label>
                  <input
                    type="number"
                    value={payAmount}
                    onChange={(e) => setPayAmount(e.target.value)}
                    className="w-full bg-slate-50 border-none rounded-2xl px-5 py-4 text-sm font-black text-slate-900 focus:ring-4 focus:ring-slate-100 transition-all tabular-nums"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Pay From Account</label>
                  <select
                    value={payAccountId}
                    onChange={(e) => setPayAccountId(e.target.value)}
                    className="w-full bg-slate-50 border-none rounded-2xl px-5 py-4 text-sm font-bold text-slate-900 focus:ring-4 focus:ring-slate-100 transition-all cursor-pointer"
                  >
                    <option value="">Select Account</option>
                    {accounts.map(acc => (
                      <option key={acc.id} value={acc.id}>{acc.name} (₹{acc.balance.toLocaleString()})</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Payment Method</label>
                  <select
                    value={payMode}
                    onChange={(e) => setPayMode(e.target.value)}
                    className="w-full bg-slate-50 border-none rounded-2xl px-5 py-4 text-sm font-bold text-slate-900 focus:ring-4 focus:ring-slate-100 transition-all cursor-pointer"
                  >
                    {["CASH", "UPI", "BANK_TRANSFER", "CARD", "CHEQUE"].map(m => (
                      <option key={m} value={m}>{m.replace("_", " ")}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="pt-4">
                <button
                  onClick={handleRecordPayment}
                  disabled={isPaying || !payAmount || parseFloat(payAmount) <= 0}
                  className="w-full py-4 bg-slate-900 hover:bg-black text-white rounded-2xl text-[11px] font-black uppercase tracking-[0.2em] shadow-xl shadow-slate-900/20 transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {isPaying ? <><Loader2 size={16} className="animate-spin" /> Processing...</> : <>Confirm Payment Out</>}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* HISTORY MODAL */}
      {viewingHistory && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4 animate-in fade-in duration-300">
          <div className="bg-white rounded-[2.5rem] w-full max-w-lg overflow-hidden shadow-2xl animate-in zoom-in-95 duration-300">
             <div className="px-8 py-6 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-indigo-50 flex items-center justify-center">
                  <History className="text-indigo-500" size={20} />
                </div>
                <div>
                  <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest">Payment History</h3>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{viewingHistory.expenseNumber}</p>
                </div>
              </div>
              <button onClick={() => setViewingHistory(null)} className="p-2 hover:bg-slate-200 rounded-xl transition-colors"><X size={20} /></button>
            </div>

            <div className="p-8">
              {loadingHistory ? (
                <div className="py-20 flex flex-col items-center gap-4">
                  <Loader2 className="animate-spin text-slate-200" size={48} />
                  <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Loading Ledger Entries...</p>
                </div>
              ) : history.length === 0 ? (
                <div className="py-20 text-center space-y-4">
                   <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto">
                    <Receipt className="text-slate-200" size={32} />
                  </div>
                  <p className="text-slate-400 font-medium tracking-tight">No payments recorded yet for this bill.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {history.map(pay => (
                    <div key={pay.id} className="p-4 bg-slate-50 rounded-2xl flex items-center justify-between border border-slate-100 group">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center shadow-sm">
                          <CreditCard size={18} className="text-emerald-500" />
                        </div>
                        <div>
                          <p className="text-sm font-black text-slate-900 tabular-nums">₹{pay.paidAmount.toLocaleString()}</p>
                          <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">
                            {new Date(pay.createdAt).toLocaleDateString()} • {pay.paymentMode} • {pay.account?.name || "N/A"}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-[9px] font-black text-emerald-500 uppercase tracking-widest">Settled</p>
                        {pay.transactionRef && <p className="text-[8px] font-medium text-slate-400 truncate max-w-[100px]">{pay.transactionRef}</p>}
                      </div>
                    </div>
                  ))}
                  
                  <div className="mt-8 p-6 bg-slate-900 rounded-[2rem] flex items-center justify-between">
                    <div>
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Total Settled</p>
                      <p className="text-2xl font-black text-white tabular-nums">₹{history.reduce((s, p) => s + p.paidAmount, 0).toLocaleString()}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Pending Balance</p>
                      <p className="text-2xl font-black text-orange-500 tabular-nums">₹{Math.max(0, viewingHistory.amount - viewingHistory.paidAmount).toLocaleString()}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
