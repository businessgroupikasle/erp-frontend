"use client";

import { useState, useEffect, useCallback } from "react";
import {
  ArrowUpRight,
  ArrowDownRight,
  Filter,
  Search,
  CheckCircle2,
  Clock,
  XCircle,
  Plus,
  RefreshCw,
  Landmark,
  X,
  CreditCard,
  Banknote,
  Smartphone,
  Building2,
  FileText,
} from "lucide-react";
import { clsx } from "clsx";
import { accountingApi } from "@/lib/api";

type FlowType = "ALL" | "IN" | "OUT";
type PaymentMethod = "CASH" | "UPI" | "BANK_TRANSFER" | "CHEQUE" | "CARD" | "NEFT";
type PaymentStatus = "PAID" | "PENDING" | "FAILED";

interface Payment {
  id: string;
  date: string;
  entity: string;
  flow: "IN" | "OUT";
  method: string;
  amount: number;
  status: PaymentStatus;
  reference: string;
  type: string;
}

const METHOD_OPTIONS: { key: PaymentMethod; label: string; icon: React.ReactNode }[] = [
  { key: "CASH",          label: "Cash",          icon: <Banknote size={15} /> },
  { key: "UPI",           label: "UPI",           icon: <Smartphone size={15} /> },
  { key: "BANK_TRANSFER", label: "Bank Transfer", icon: <Building2 size={15} /> },
  { key: "CHEQUE",        label: "Cheque",        icon: <FileText size={15} /> },
  { key: "CARD",          label: "Card",          icon: <CreditCard size={15} /> },
  { key: "NEFT",          label: "NEFT",          icon: <ArrowUpRight size={15} /> },
];

// Words that indicate an outflow/expense — should NEVER be recorded as Inflow
const EXPENSE_KEYWORDS = [
  "expense", "rent", "salary", "wages", "bill", "utility", "electricity",
  "water", "gas", "fuel", "maintenance", "repair", "purchase", "vendor",
  "supplier", "payable", "outflow", "cost", "fee", "charge", "toll",
];

const EMPTY_FORM = {
  entity: "",
  flow: "IN" as "IN" | "OUT",
  amount: "",
  method: "CASH" as PaymentMethod,
  sourceAccount: "CASH_ACCOUNT" as "CASH_ACCOUNT" | "BANK_ACCOUNT" | "UPI_WALLET",
  linkedToType: "DIRECT" as "INVOICE" | "PO" | "DIRECT",
  linkedToId: "",
  date: new Date().toISOString().split("T")[0],
  reference: "",
  note: "",
  status: "PAID" as PaymentStatus,
};

export default function PaymentsPage() {
  const [activeTab, setActiveTab] = useState<FlowType>("ALL");
  const [search, setSearch] = useState("");
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Modal state
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  const fetchPayments = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await accountingApi.getPayments();
      const data: Payment[] = res.data?.payments ?? res.data ?? [];
      setPayments(data);
    } catch (err) {
      console.error("Fetch error:", err);
      setPayments([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchPayments(); }, [fetchPayments]);

  const filtered = payments.filter((p) => {
    if (activeTab !== "ALL" && p.flow !== activeTab) return false;
    if (search && !p.entity?.toLowerCase().includes(search.toLowerCase()) && !p.id?.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const totalIn  = payments.filter(p => p.flow === "IN"  && p.status === "PAID").reduce((s, p) => s + p.amount, 0);
  const totalOut = payments.filter(p => p.flow === "OUT" && p.status === "PAID").reduce((s, p) => s + p.amount, 0);

  const openModal = () => {
    setForm(EMPTY_FORM);
    setSubmitError(null);
    setSubmitSuccess(false);
    setShowModal(true);
  };

  const closeModal = () => {
    if (submitting) return;
    setShowModal(false);
  };

  const handleSubmit = async () => {
    if (!form.entity.trim()) { setSubmitError("Customer/Vendor Entity is required."); return; }
    if (!form.amount || parseFloat(form.amount) <= 0) { setSubmitError("Enter a valid amount."); return; }
    if (!form.date) { setSubmitError("Payment Date is strictly required."); return; }
    if (form.linkedToType !== "DIRECT" && !form.linkedToId.trim()) { setSubmitError(`Please provide the ${form.linkedToType} reference ID.`); return; }

    // 🚨 Guard: Block expense-type entities from being logged as Inflow
    if (form.flow === "IN") {
      const entityLower = form.entity.trim().toLowerCase();
      const matchedKeyword = EXPENSE_KEYWORDS.find(kw => entityLower.includes(kw));
      if (matchedKeyword) {
        setSubmitError(
          `"${form.entity}" looks like an expense/outflow. ` +
          `Inflow is only for money received from customers. ` +
          `Please switch direction to "Vendor / Expense (OUT)" or use the Expenses module.`
        );
        return;
      }
    }

    setSubmitting(true);
    setSubmitError(null);
    try {
      await accountingApi.recordPayment({
        entity: form.entity.trim(),
        flow: form.flow,
        amount: parseFloat(form.amount),
        method: form.method,
        sourceAccount: form.sourceAccount,
        linkedToType: form.linkedToType,
        linkedToId: form.linkedToType !== "DIRECT" ? form.linkedToId.trim() : undefined,
        date: form.date,
        reference: form.reference.trim() || undefined,
        note: form.note.trim() || undefined,
        status: form.status,
      });
      setSubmitSuccess(true);
      await fetchPayments();
      setTimeout(() => {
        setShowModal(false);
        setSubmitSuccess(false);
      }, 1400);
    } catch (err: any) {
      setSubmitError(err?.response?.data?.error || err?.response?.data?.message || err.message || "Failed to record payment. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-12 py-4 animate-in fade-in duration-700">
      {/* Refined Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 border-b border-gray-100 pb-10">
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <div className="w-2 h-8 bg-orange-500 rounded-full" />
            <h1 className="text-4xl font-black text-slate-900 tracking-tight">Payments</h1>
          </div>
          <p className="text-sm font-medium text-slate-400 max-w-md leading-relaxed">
            Unified money control centre tracing all income and accounts payable.
          </p>
        </div>
        
        <div className="flex items-center gap-4">
          <button
            onClick={fetchPayments}
            className="w-12 h-12 flex items-center justify-center rounded-2xl bg-slate-50 text-slate-400 hover:text-orange-500 hover:bg-orange-50 transition-all active:scale-90"
          >
            <RefreshCw size={18} className={clsx(loading && "animate-spin")} />
          </button>
          <button
            onClick={openModal}
            className="flex items-center gap-3 bg-slate-900 text-white pl-6 pr-8 py-4 rounded-2xl text-xs font-black uppercase tracking-[0.15em] transition-all hover:bg-black hover:-translate-y-0.5 active:translate-y-0 shadow-lg shadow-slate-900/10"
          >
            <Plus size={16} strokeWidth={3} /> Record Payment
          </button>
        </div>
      </div>

      {/* Elegant Metrics Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-12 px-2">
        <div className="space-y-1">
          <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Total Inflow</p>
          <p className="text-2xl font-black transition-all tabular-nums text-emerald-500">
            ₹{totalIn.toLocaleString()}
          </p>
        </div>
        <div className="space-y-1">
          <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Total Outflow</p>
          <p className="text-2xl font-black transition-all tabular-nums text-orange-500">
            ₹{totalOut.toLocaleString()}
          </p>
        </div>
        <div className="space-y-1">
          <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Total Transactions</p>
          <p className="text-2xl font-black transition-all tabular-nums text-slate-900">
            {payments.length}
          </p>
        </div>
      </div>

      {/* Minimalist Search & Filter */}
      <div className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-center">
        <div className="flex p-1 bg-slate-50 rounded-2xl">
          {(["ALL", "IN", "OUT"] as FlowType[]).map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)}
              className={clsx("px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-[0.15em] transition-all",
                activeTab === tab ? "bg-white text-orange-500 shadow-sm" : "text-slate-400 hover:text-slate-900"
              )}>
              {tab === "ALL" ? "All History" : tab === "IN" ? "Customer (IN)" : "Vendor (OUT)"}
            </button>
          ))}
        </div>

        <div className="relative group w-full md:w-auto md:min-w-[320px]">
          <Search size={16} className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-orange-500 transition-colors" />
          <input 
            type="text" 
            placeholder="Search tx or entity..." 
            value={search} 
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-14 pr-6 py-4 bg-slate-50/50 border-none rounded-2xl font-bold text-slate-900 placeholder:text-slate-300 focus:bg-white focus:ring-4 focus:ring-slate-100 outline-none transition-all" 
          />
        </div>
      </div>

      {/* Elegant Table Area */}
      {loading ? (
        <div className="py-40 flex flex-col items-center justify-center gap-6">
          <div className="flex gap-1.5">
            {[1, 2, 3].map((i) => (
              <div key={i} className="w-2 h-2 rounded-full bg-slate-200 animate-bounce" style={{ animationDelay: `${i * 150}ms` }} />
            ))}
          </div>
          <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Loading Payments</p>
        </div>
      ) : error ? (
        <div className="py-40 text-center space-y-6">
          <div className="p-8 bg-red-50 w-fit mx-auto rounded-[2.5rem]">
            <XCircle size={48} className="text-red-200" strokeWidth={1} />
          </div>
          <div className="space-y-2">
            <p className="text-red-400 font-medium">{error}</p>
            <button onClick={fetchPayments} className="text-xs text-orange-500 hover:underline font-bold">Retry connection</button>
          </div>
        </div>
      ) : filtered.length === 0 ? (
        <div className="py-40 text-center space-y-6">
          <div className="p-8 bg-slate-50 w-fit mx-auto rounded-[2.5rem]">
            <CreditCard size={48} className="text-slate-200" strokeWidth={1} />
          </div>
          <p className="text-slate-400 font-medium">No payment history matches your filters.</p>
        </div>
      ) : (
        <div className="border border-slate-100 rounded-[2rem] overflow-hidden bg-white">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/50">
                  <th className="px-6 py-5 text-[10px] uppercase font-black tracking-widest text-slate-400">Date</th>
                  <th className="px-6 py-5 text-[10px] uppercase font-black tracking-widest text-slate-400">Tx ID &amp; Ref</th>
                  <th className="px-6 py-5 text-[10px] uppercase font-black tracking-widest text-slate-400">Entity</th>
                  <th className="px-6 py-5 text-[10px] uppercase font-black tracking-widest text-slate-400">Flow Type</th>
                  <th className="px-6 py-5 text-[10px] uppercase font-black tracking-widest text-slate-400">Method</th>
                  <th className="px-6 py-5 text-[10px] uppercase font-black tracking-widest text-slate-400">Status</th>
                  <th className="px-6 py-5 text-[10px] uppercase font-black tracking-widest text-slate-400 text-right">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filtered.map(payment => (
                  <tr key={payment.id} className="hover:bg-slate-50/50 transition-colors group">
                    <td className="px-6 py-4">
                      <p className="text-xs font-bold text-slate-900 uppercase">
                        {new Date(payment.date).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}
                      </p>
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">
                        {new Date(payment.date).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}
                      </p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-xs font-black text-slate-700 group-hover:text-orange-500 transition-colors">{payment.id}</p>
                      <div className="flex items-center gap-1.5 mt-1">
                        {payment.type && <span className="px-1.5 py-0.5 rounded text-[8px] font-black uppercase tracking-widest bg-slate-100 text-slate-500">{payment.type}</span>}
                        {payment.reference && <span className="text-[10px] text-slate-400 font-bold">Ref: {payment.reference}</span>}
                      </div>
                    </td>
                    <td className="px-6 py-4"><p className="text-sm font-bold text-slate-900">{payment.entity || "—"}</p></td>
                    <td className="px-6 py-4">
                      {payment.flow === "IN" ? (
                        <div className="flex items-center gap-1.5 text-emerald-500"><ArrowDownRight size={14} strokeWidth={3} /><span className="text-[10px] font-black uppercase tracking-widest">Inflow</span></div>
                      ) : (
                        <div className="flex items-center gap-1.5 text-orange-500"><ArrowUpRight size={14} strokeWidth={3} /><span className="text-[10px] font-black uppercase tracking-widest">Outflow</span></div>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-2 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest bg-slate-50 text-slate-500">{payment.method || "—"}</span>
                    </td>
                    <td className="px-6 py-4">
                      {payment.status === "PAID" ? (
                        <div className="flex items-center gap-1.5 text-emerald-500"><CheckCircle2 size={14} /><span className="text-[10px] font-black uppercase tracking-widest">Paid</span></div>
                      ) : payment.status === "PENDING" ? (
                        <div className="flex items-center gap-1.5 text-amber-500"><Clock size={14} /><span className="text-[10px] font-black uppercase tracking-widest">Pending</span></div>
                      ) : (
                        <div className="flex items-center gap-1.5 text-red-500"><XCircle size={14} /><span className="text-[10px] font-black uppercase tracking-widest">Failed</span></div>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <p className={clsx("text-sm font-black tabular-nums", payment.flow === "IN" ? "text-emerald-500" : "text-slate-900")}>
                        {payment.flow === "IN" ? "+" : "-"}₹{payment.amount.toLocaleString()}
                      </p>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── Manual Payment Modal ── */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-end">
          {/* Backdrop */}
          <div className="absolute inset-0 bg-slate-900/20 backdrop-blur-sm" onClick={closeModal} />

          {/* Drawer */}
          <div className="relative z-10 w-full max-w-md h-full bg-white shadow-[0_0_40px_rgba(0,0,0,0.05)] flex flex-col overflow-y-auto animate-in slide-in-from-right duration-500">
            {/* Drawer Header */}
            <div className="flex items-center justify-between px-8 py-6 border-b border-slate-100 sticky top-0 bg-white/80 backdrop-blur-md z-10">
              <div>
                <h2 className="text-lg font-black text-slate-900">Record Payment</h2>
                <p className="text-[11px] font-medium text-slate-400 mt-0.5">This will be logged in the payment ledger instantly</p>
              </div>
              <button onClick={closeModal} className="p-2 rounded-xl hover:bg-slate-50 text-slate-400 transition-colors">
                <X size={18} />
              </button>
            </div>

            {/* Drawer Body */}
            <div className="flex-1 px-8 py-6 space-y-6">

              {/* Flow Direction */}
              <div className="space-y-3">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Direction <span className="text-red-400">*</span></label>
                <div className="grid grid-cols-2 gap-3">
                  <button onClick={() => setForm(p => ({ ...p, flow: "IN" }))}
                    className={clsx("py-4 rounded-2xl border-2 flex flex-col items-center justify-center gap-1 transition-all",
                      form.flow === "IN"
                        ? "border-emerald-500 bg-emerald-50 text-emerald-600"
                        : "border-slate-100 text-slate-400 hover:border-slate-200 bg-white"
                    )}>
                    <ArrowDownRight size={20} strokeWidth={2.5} />
                    <span className="text-[10px] font-black uppercase tracking-widest">Customer Receipt</span>
                    <span className="text-[9px] font-medium opacity-60">Money comes IN</span>
                  </button>
                  <button onClick={() => setForm(p => ({ ...p, flow: "OUT" }))}
                    className={clsx("py-4 rounded-2xl border-2 flex flex-col items-center justify-center gap-1 transition-all",
                      form.flow === "OUT"
                        ? "border-orange-500 bg-orange-50 text-orange-600"
                        : "border-slate-100 text-slate-400 hover:border-slate-200 bg-white"
                    )}>
                    <ArrowUpRight size={20} strokeWidth={2.5} />
                    <span className="text-[10px] font-black uppercase tracking-widest">Vendor / Expense</span>
                    <span className="text-[9px] font-medium opacity-60">Money goes OUT</span>
                  </button>
                </div>
                {/* Contextual hint */}
                <div className={clsx(
                  "px-4 py-2.5 rounded-xl text-[10px] font-bold flex items-start gap-2 leading-relaxed transition-all",
                  form.flow === "IN"
                    ? "bg-emerald-50 text-emerald-700"
                    : "bg-orange-50 text-orange-700"
                )}>
                  {form.flow === "IN" ? (
                    <><ArrowDownRight size={12} className="mt-0.5 shrink-0" />
                    Use this when a <strong>customer pays you</strong> — e.g. sale receipt, advance payment.
                    </>
                  ) : (
                    <><ArrowUpRight size={12} className="mt-0.5 shrink-0" />
                    Use this when <strong>you pay someone</strong> — vendor, rent, salary, utilities, etc.
                    </>
                  )}
                </div>
              </div>

              {/* Entity — context-aware for IN vs OUT */}
              <div className="space-y-3">
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
                  {form.flow === "IN" ? "Customer Name" : "Vendor / Payee Name"} <span className="text-red-400">*</span>
                </label>
                <input
                  value={form.entity}
                  onChange={e => setForm(p => ({ ...p, entity: e.target.value }))}
                  placeholder={
                    form.flow === "IN"
                      ? "e.g. Rahul Sharma, Walk-in Customer"
                      : "e.g. Spice Valley, Electricity Board, Landlord"
                  }
                  className={clsx(
                    "w-full px-4 py-4 bg-slate-50 border-2 rounded-2xl text-sm font-bold text-slate-900 placeholder:text-slate-300 focus:outline-none focus:bg-white focus:ring-4 transition-all",
                    // Warn in real-time if user types an expense keyword while direction is IN
                    form.flow === "IN" && EXPENSE_KEYWORDS.some(kw => form.entity.toLowerCase().includes(kw))
                      ? "border-red-300 focus:ring-red-100 bg-red-50"
                      : "border-transparent focus:ring-slate-100"
                  )}
                />
                {/* Real-time expense-in-inflow warning */}
                {form.flow === "IN" && EXPENSE_KEYWORDS.some(kw => form.entity.toLowerCase().includes(kw)) && (
                  <div className="flex items-start gap-2 px-3 py-2.5 bg-red-50 border border-red-200 rounded-xl animate-in fade-in duration-200">
                    <XCircle size={13} className="text-red-500 shrink-0 mt-0.5" />
                    <p className="text-[10px] font-bold text-red-600 leading-relaxed">
                      This looks like an <strong>expense/outflow</strong>. Switch direction to <strong>&ldquo;Vendor / Expense (OUT)&rdquo;</strong>, or use the <strong>Expenses</strong> module.
                    </p>
                  </div>
                )}
              </div>

              {/* Linked To */}
              <div className="space-y-3 p-4 bg-slate-50 border border-slate-100 rounded-2xl">
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
                  Linked To Document
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {(["DIRECT", "INVOICE", "PO"] as const).map(t => (
                    <button key={t} onClick={() => setForm(p => ({ ...p, linkedToType: t, linkedToId: t === "DIRECT" ? "" : p.linkedToId }))}
                      className={clsx("py-2.5 rounded-xl border text-[10px] font-black uppercase tracking-widest transition-all",
                        form.linkedToType === t
                          ? "border-slate-900 bg-slate-900 text-white"
                          : "border-slate-200 text-slate-400 bg-white hover:bg-slate-50"
                      )}>
                      {t}
                    </button>
                  ))}
                </div>
                {form.linkedToType !== "DIRECT" && (
                  <div className="pt-2">
                    <input
                      value={form.linkedToId}
                      onChange={e => setForm(p => ({ ...p, linkedToId: e.target.value }))}
                      placeholder={`Enter ${form.linkedToType} ID (e.g. ${form.linkedToType}-102)`}
                      className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-900 placeholder:text-slate-300 focus:outline-none focus:border-slate-900 focus:ring-2 focus:ring-slate-900/10 transition-all"
                    />
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                {/* Amount */}
                <div className="space-y-3">
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Amount (₹) <span className="text-red-400">*</span></label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-sm">₹</span>
                    <input
                      type="number"
                      min="0"
                      value={form.amount}
                      onChange={e => setForm(p => ({ ...p, amount: e.target.value }))}
                      placeholder="0.00"
                      className="w-full pl-8 pr-4 py-4 bg-slate-50 border-none rounded-2xl text-sm font-black text-slate-900 placeholder:text-slate-300 focus:outline-none focus:bg-white focus:ring-4 focus:ring-slate-100 transition-all"
                    />
                  </div>
                </div>

                {/* Date */}
                <div className="space-y-3">
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Payment Date <span className="text-red-400">*</span></label>
                  <input
                    type="date"
                    value={form.date}
                    onChange={e => setForm(p => ({ ...p, date: e.target.value }))}
                    className="w-full px-4 py-4 bg-slate-50 border-none rounded-2xl text-sm font-black text-slate-900 focus:outline-none focus:bg-white focus:ring-4 focus:ring-slate-100 transition-all"
                  />
                </div>
              </div>

              {/* Source Account */}
              <div className="space-y-3">
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Source Account <span className="text-red-400">*</span></label>
                <div className="grid grid-cols-3 gap-2">
                  {(["CASH_ACCOUNT", "BANK_ACCOUNT", "UPI_WALLET"] as const).map(acc => (
                    <button key={acc} onClick={() => setForm(p => ({ ...p, sourceAccount: acc }))}
                      className={clsx("py-3 rounded-2xl border-2 text-[9px] font-black uppercase tracking-[0.1em] transition-all flex flex-col items-center justify-center gap-1",
                        form.sourceAccount === acc
                          ? "border-blue-500 bg-blue-50 text-blue-600"
                          : "border-slate-100 text-slate-400 hover:border-slate-200 bg-white"
                      )}>
                      {acc === "CASH_ACCOUNT" ? <Banknote size={16} /> : acc === "BANK_ACCOUNT" ? <Building2 size={16} /> : <Smartphone size={16} />}
                      <span className="text-center">{acc.replace("_", " ")}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Payment Method */}
              <div className="space-y-3">
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Payment Method</label>
                <div className="grid grid-cols-3 gap-2">
                  {METHOD_OPTIONS.map(m => (
                    <button key={m.key} onClick={() => setForm(p => ({ ...p, method: m.key }))}
                      className={clsx("py-3 rounded-2xl border-2 flex flex-col items-center gap-1.5 transition-all text-[9px] font-black uppercase tracking-widest",
                        form.method === m.key
                          ? "border-slate-900 bg-slate-900 text-white"
                          : "border-slate-100 text-slate-400 hover:border-slate-200 bg-white"
                      )}>
                      {m.icon}
                      <span>{m.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Status */}
              <div className="space-y-3">
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Status (Controls Balance Update)</label>
                <div className="grid grid-cols-3 gap-2">
                  {(["PAID", "PENDING", "FAILED"] as PaymentStatus[]).map(s => (
                    <button key={s} onClick={() => setForm(p => ({ ...p, status: s }))}
                      className={clsx("py-3 rounded-2xl border-2 text-[10px] font-black uppercase tracking-widest transition-all text-center",
                        form.status === s
                          ? s === "PAID" ? "border-emerald-500 bg-emerald-50 text-emerald-600"
                            : s === "PENDING" ? "border-amber-500 bg-amber-50 text-amber-600"
                            : "border-red-500 bg-red-50 text-red-600"
                          : "border-slate-100 text-slate-400 hover:bg-slate-50/50 bg-white"
                      )}>
                      {s}
                      {form.status === s && s === "PAID" && <span className="block text-[7px] text-emerald-400 mt-0.5">Adjusts ledger</span>}
                      {form.status === s && s === "PENDING" && <span className="block text-[7px] text-amber-400 mt-0.5">No change</span>}
                    </button>
                  ))}
                </div>
              </div>

              {/* Reference */}
              <div className="space-y-3">
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Reference / Tx ID <span className="text-slate-300 font-medium normal-case tracking-normal">(optional)</span></label>
                <input
                  value={form.reference}
                  onChange={e => setForm(p => ({ ...p, reference: e.target.value }))}
                  placeholder="e.g. UPI-TXNID, CHQ-00123"
                  className="w-full px-4 py-4 bg-slate-50 border-none rounded-2xl text-sm font-bold text-slate-900 placeholder:text-slate-300 focus:outline-none focus:bg-white focus:ring-4 focus:ring-slate-100 transition-all"
                />
              </div>

              {/* Note */}
              <div className="space-y-3">
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Remarks <span className="text-slate-300 font-medium normal-case tracking-normal">(optional)</span></label>
                <textarea
                  value={form.note}
                  onChange={e => setForm(p => ({ ...p, note: e.target.value }))}
                  placeholder="e.g. Payment for March invoice"
                  rows={2}
                  className="w-full px-4 py-4 bg-slate-50 border-none rounded-2xl text-sm font-bold text-slate-900 placeholder:text-slate-300 focus:outline-none focus:bg-white focus:ring-4 focus:ring-slate-100 transition-all resize-none"
                />
              </div>

            </div>

            {/* Drawer Footer */}
            <div className="px-8 py-6 border-t border-slate-100 sticky bottom-0 bg-white shadow-[0_-10px_40px_rgba(0,0,0,0.05)] z-20">
              {/* Error */}
              {submitError && (
                <div className="flex items-center gap-2 p-4 mb-4 bg-red-50 rounded-2xl text-red-600 text-[11px] font-black uppercase tracking-widest animate-in slide-in-from-bottom-2 fade-in duration-300">
                  <XCircle size={16} className="shrink-0" /> {submitError}
                </div>
              )}

              {/* Success */}
              {submitSuccess && (
                <div className="flex items-center gap-2 p-4 mb-4 bg-emerald-50 rounded-2xl text-emerald-600 text-[11px] font-black uppercase tracking-widest animate-in slide-in-from-bottom-2 fade-in duration-300">
                  <CheckCircle2 size={16} className="shrink-0" /> Payment recorded successfully!
                </div>
              )}

              <div className="flex gap-4">
                <button onClick={closeModal} disabled={submitting}
                  className="flex-1 py-4 bg-slate-50 hover:bg-slate-100 rounded-2xl text-[11px] font-black text-slate-400 uppercase tracking-[0.15em] transition-colors disabled:opacity-50">
                  Cancel
                </button>
                <button onClick={handleSubmit} disabled={submitting || submitSuccess}
                  className={clsx("flex-[2] py-4 rounded-2xl text-[11px] font-black uppercase tracking-[0.15em] text-white transition-all flex items-center justify-center gap-2 shadow-lg",
                    submitting || submitSuccess ? "bg-slate-300 cursor-not-allowed shadow-none" : "bg-slate-900 hover:bg-black active:translate-y-0.5 shadow-slate-900/20"
                  )}>
                  {submitting ? (
                    <><RefreshCw size={16} className="animate-spin" /> Saving...</>
                  ) : submitSuccess ? (
                    <><CheckCircle2 size={16} /> Saved!</>
                  ) : (
                    <><Plus size={16} /> Record Payment</>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
