"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Receipt, Plus, Search, RefreshCw, X, FileText,
  ChevronDown, User, CheckCircle2, AlertCircle,
  Send, Download, Printer, IndianRupee, Calendar
} from "lucide-react";
import { clsx } from "clsx";
import { customersApi, productsFullApi } from "@/lib/api";
import { useToast } from "@/context/ToastContext";
import api from "@/lib/api/base";

const STATUS_STYLES: Record<string, { label: string; color: string; bg: string; border: string }> = {
  DRAFT:    { label: "Draft",    color: "text-slate-600",   bg: "bg-slate-50",   border: "border-slate-200" },
  SENT:     { label: "Sent",     color: "text-blue-600",    bg: "bg-blue-50",    border: "border-blue-200" },
  PAID:     { label: "Paid",     color: "text-emerald-600", bg: "bg-emerald-50", border: "border-emerald-200" },
  PARTIAL:  { label: "Partial",  color: "text-amber-600",   bg: "bg-amber-50",   border: "border-amber-200" },
  OVERDUE:  { label: "Overdue",  color: "text-rose-600",    bg: "bg-rose-50",    border: "border-rose-200" },
  CANCELLED:{ label: "Cancelled",color: "text-slate-400",   bg: "bg-slate-100",  border: "border-slate-200" },
};

interface LineItem { productId: string; description: string; qty: number; unit: string; rate: number; gst: number; }
const EMPTY_ITEM: LineItem = { productId: "", description: "", qty: 1, unit: "pc", rate: 0, gst: 18 };

export default function SalesInvoicesPage() {
  const { showToast } = useToast();
  const [invoices, setInvoices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [customers, setCustomers] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);

  // Form
  const [form, setForm] = useState({
    customerId: "",
    invoiceDate: new Date().toISOString().split("T")[0],
    dueDate: "",
    notes: "",
    paymentTerms: "IMMEDIATE",
  });
  const [items, setItems] = useState<LineItem[]>([{ ...EMPTY_ITEM }]);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [iRes, cRes, pRes] = await Promise.allSettled([
        api.get("/api/sales/invoices").catch(() => ({ data: [] })),
        customersApi.getAll(),
        productsFullApi.getAll(),
      ]);
      if (iRes.status === "fulfilled") setInvoices((iRes.value as any).data || []);
      if (cRes.status === "fulfilled") setCustomers((cRes.value as any).data || []);
      if (pRes.status === "fulfilled") setProducts((pRes.value as any).data || []);
    } finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const subtotal = items.reduce((s, i) => s + i.qty * i.rate, 0);
  const totalGst = items.reduce((s, i) => s + (i.qty * i.rate * i.gst) / 100, 0);
  const grandTotal = subtotal + totalGst;

  const handleProductSelect = (idx: number, productId: string) => {
    const p = products.find(x => x.id === productId);
    setItems(prev => prev.map((it, i) =>
      i === idx ? { ...it, productId, description: p?.name || "", rate: p?.basePrice || 0, unit: p?.unit || "pc" } : it
    ));
  };

  const handleSave = async () => {
    if (!form.customerId || items.some(i => !i.description || i.qty <= 0 || i.rate <= 0)) {
      showToast("Fill customer and all line items", "error"); return;
    }
    setSaving(true);
    try {
      await api.post("/api/sales/invoices", {
        ...form,
        items: items.map(i => ({ ...i, amount: i.qty * i.rate, gstAmount: (i.qty * i.rate * i.gst) / 100 })),
        subtotal, totalGst, grandTotal,
      });
      showToast("Invoice created successfully", "success");
      setShowForm(false);
      setItems([{ ...EMPTY_ITEM }]);
      setForm({ customerId: "", invoiceDate: new Date().toISOString().split("T")[0], dueDate: "", notes: "", paymentTerms: "IMMEDIATE" });
      fetchData();
    } catch (e: any) {
      showToast(e?.response?.data?.error || "Failed to create invoice", "error");
    } finally { setSaving(false); }
  };

  const handlePrint = (inv: any) => {
    const w = window.open("", "_blank");
    if (!w) return;
    w.document.write(`<html><head><title>Invoice ${inv.invoiceNumber}</title>
    <style>body{font-family:sans-serif;padding:40px;color:#1e293b}h1{font-size:24px;font-weight:900;text-transform:uppercase;border-bottom:3px solid #f97316;padding-bottom:12px;margin-bottom:24px}
    .meta{display:grid;grid-template-columns:1fr 1fr;gap:20px;margin-bottom:24px}.label{font-size:10px;font-weight:700;text-transform:uppercase;color:#64748b;margin-bottom:4px}
    .value{font-size:14px;font-weight:700;color:#0f172a}table{width:100%;border-collapse:collapse;margin-top:20px}
    th{background:#f8fafc;text-align:left;padding:10px 14px;font-size:10px;font-weight:800;text-transform:uppercase;color:#475569;border-bottom:1px solid #e2e8f0}
    td{padding:10px 14px;border-bottom:1px solid #f1f5f9;font-size:13px;font-weight:600}
    .total-row{font-weight:900;font-size:15px;color:#f97316}@media print{button{display:none}}</style></head>
    <body><h1>Tax Invoice</h1>
    <div class="meta"><div><div class="label">Invoice No.</div><div class="value">${inv.invoiceNumber || inv.id?.substring(0,8).toUpperCase()}</div></div>
    <div><div class="label">Date</div><div class="value">${new Date(inv.invoiceDate || inv.createdAt).toLocaleDateString()}</div></div>
    <div><div class="label">Customer</div><div class="value">${inv.customer?.name || "—"}</div></div>
    <div><div class="label">Due Date</div><div class="value">${inv.dueDate ? new Date(inv.dueDate).toLocaleDateString() : "Immediate"}</div></div></div>
    <table><thead><tr><th>Description</th><th>Qty</th><th>Unit</th><th>Rate</th><th>GST</th><th style="text-align:right">Amount</th></tr></thead>
    <tbody>${(inv.items || []).map((it: any) => `<tr><td>${it.description}</td><td>${it.qty}</td><td>${it.unit}</td><td>₹${it.rate}</td><td>${it.gst}%</td><td style="text-align:right">₹${(it.qty * it.rate * (1 + it.gst / 100)).toFixed(2)}</td></tr>`).join("")}
    </tbody></table>
    <div style="text-align:right;margin-top:20px"><div style="display:inline-block;min-width:200px">
    <div style="display:flex;justify-content:space-between;padding:6px 0;border-bottom:1px solid #e2e8f0"><span>Subtotal</span><span>₹${(inv.subtotal || 0).toFixed(2)}</span></div>
    <div style="display:flex;justify-content:space-between;padding:6px 0;border-bottom:1px solid #e2e8f0"><span>GST</span><span>₹${(inv.totalGst || 0).toFixed(2)}</span></div>
    <div class="total-row" style="display:flex;justify-content:space-between;padding:10px 0"><span>Grand Total</span><span>₹${(inv.grandTotal || 0).toFixed(2)}</span></div>
    </div></div>
    <script>window.onload=()=>{window.print();window.onafterprint=()=>window.close()}</script></body></html>`);
    w.document.close();
  };

  const filtered = invoices.filter(inv => {
    const matchSearch = !search || inv.invoiceNumber?.toLowerCase().includes(search.toLowerCase()) || inv.customer?.name?.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === "ALL" || inv.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const totalRevenue = filtered.reduce((s, i) => s + (i.grandTotal || 0), 0);
  const totalPaid = filtered.filter(i => i.status === "PAID").reduce((s, i) => s + (i.grandTotal || 0), 0);
  const totalOutstanding = filtered.filter(i => ["SENT", "PARTIAL", "OVERDUE"].includes(i.status)).reduce((s, i) => s + (i.grandTotal || 0), 0);

  return (
    <div className="max-w-7xl mx-auto space-y-6 p-4 md:p-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-emerald-500 rounded-2xl shadow-lg shadow-emerald-500/20">
            <Receipt size={22} className="text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tight">Sales Invoices</h1>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-0.5">GST-compliant tax invoices for customers</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={fetchData} className="p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-xl hover:border-slate-300 transition-all shadow-sm">
            <RefreshCw size={16} className={clsx("text-slate-400", loading && "animate-spin")} />
          </button>
          <button onClick={() => setShowForm(true)} className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white px-6 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-lg shadow-emerald-500/20 transition-all">
            <Plus size={16} strokeWidth={3} /> New Invoice
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Total Revenue", value: `₹${(totalRevenue / 1000).toFixed(1)}K`, color: "text-slate-700" },
          { label: "Collected", value: `₹${(totalPaid / 1000).toFixed(1)}K`, color: "text-emerald-600" },
          { label: "Outstanding", value: `₹${(totalOutstanding / 1000).toFixed(1)}K`, color: "text-rose-600" },
          { label: "Total Invoices", value: invoices.length, color: "text-blue-600" },
        ].map(s => (
          <div key={s.label} className="bg-white dark:bg-slate-900/40 p-5 rounded-2xl border border-slate-100 dark:border-white/5 shadow-sm">
            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{s.label}</p>
            <p className={clsx("text-2xl font-black mt-1", s.color)}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Filters & Table */}
      <div className="bg-white dark:bg-slate-900/40 rounded-3xl border border-slate-100 dark:border-white/5 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-slate-50 dark:border-white/5 flex flex-col md:flex-row items-start md:items-center gap-4">
          <div className="relative flex-1 max-w-sm">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search invoices..." className="w-full pl-9 pr-4 py-2.5 text-sm bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/10 rounded-xl outline-none" />
          </div>
          <div className="flex gap-1 p-1 bg-slate-100 dark:bg-white/5 rounded-xl border border-slate-200 dark:border-white/10">
            {["ALL", "SENT", "PAID", "PARTIAL", "OVERDUE"].map(s => (
              <button key={s} onClick={() => setStatusFilter(s)} className={clsx("px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all", statusFilter === s ? "bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm" : "text-slate-400")}>
                {s}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="py-20 text-center"><RefreshCw size={28} className="mx-auto text-emerald-500 animate-spin opacity-20" /></div>
        ) : filtered.length === 0 ? (
          <div className="py-20 text-center">
            <Receipt size={44} strokeWidth={1} className="mx-auto text-slate-200 mb-3" />
            <p className="text-sm font-black text-slate-400">No invoices found.</p>
          </div>
        ) : (
          <table className="w-full text-left">
            <thead className="bg-slate-50/50 dark:bg-white/[0.02] text-[9px] font-black text-slate-400 uppercase tracking-widest">
              <tr>
                <th className="px-6 py-4">Invoice No.</th>
                <th className="px-6 py-4">Customer</th>
                <th className="px-6 py-4">Date</th>
                <th className="px-6 py-4">Due Date</th>
                <th className="px-6 py-4 text-right">Amount</th>
                <th className="px-6 py-4 text-center">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 dark:divide-white/5">
              {filtered.map(inv => {
                const st = STATUS_STYLES[inv.status] || STATUS_STYLES.DRAFT;
                return (
                  <tr key={inv.id} className="hover:bg-slate-50/50 dark:hover:bg-white/[0.02] transition-all">
                    <td className="px-6 py-4 font-black text-emerald-600 text-sm">{inv.invoiceNumber || inv.id?.substring(0,8).toUpperCase()}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-lg bg-slate-100 dark:bg-white/5 flex items-center justify-center text-slate-400"><User size={12} /></div>
                        <span className="text-sm font-bold text-slate-700 dark:text-slate-200">{inv.customer?.name || "—"}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm font-bold text-slate-500">{inv.invoiceDate ? new Date(inv.invoiceDate).toLocaleDateString() : new Date(inv.createdAt).toLocaleDateString()}</td>
                    <td className="px-6 py-4 text-sm font-bold text-slate-500">{inv.dueDate ? new Date(inv.dueDate).toLocaleDateString() : "Immediate"}</td>
                    <td className="px-6 py-4 text-right font-black text-slate-900 dark:text-white">₹{(inv.grandTotal || 0).toLocaleString()}</td>
                    <td className="px-6 py-4 text-center">
                      <span className={clsx("px-2.5 py-1 rounded-full text-[8px] font-black uppercase tracking-wider border", st.color, st.bg, st.border)}>
                        {st.label}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-1.5">
                        <button onClick={() => handlePrint(inv)} className="p-2 bg-slate-50 dark:bg-white/5 text-slate-400 hover:text-slate-700 rounded-lg border border-slate-100 dark:border-white/5 transition-all" title="Print Invoice">
                          <Printer size={12} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* New Invoice Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-start justify-center p-4 bg-black/50 backdrop-blur-sm overflow-y-auto animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-4xl my-8 border border-slate-100 dark:border-white/10 overflow-hidden">
            <div className="flex items-center justify-between px-8 py-6 border-b border-slate-100 dark:border-white/5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-500 flex items-center justify-center text-white shadow-lg shadow-emerald-500/20">
                  <Receipt size={18} />
                </div>
                <div>
                  <h2 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">New Tax Invoice</h2>
                  <p className="text-[10px] text-slate-400">GST-compliant sales invoice creator</p>
                </div>
              </div>
              <button onClick={() => setShowForm(false)} className="p-2 hover:bg-slate-100 dark:hover:bg-white/5 rounded-xl text-slate-400"><X size={18} /></button>
            </div>
 
            <div className="p-8 space-y-6">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="space-y-1.5 col-span-2">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Customer *</label>
                  <div className="relative">
                    <select value={form.customerId} onChange={e => setForm({ ...form, customerId: e.target.value })} className="w-full h-10 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 font-semibold text-xs outline-none focus:border-emerald-500 cursor-pointer">
                      <option value="">Select customer...</option>
                      {customers.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                  </div>
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Payment Terms</label>
                  <select value={form.paymentTerms} onChange={e => setForm({ ...form, paymentTerms: e.target.value })} className="w-full h-10 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 font-semibold text-xs outline-none focus:border-emerald-500 cursor-pointer">
                    <option value="IMMEDIATE">Immediate</option>
                    <option value="NET_7">Net 7 Days</option>
                    <option value="NET_15">Net 15 Days</option>
                    <option value="NET_30">Net 30 Days</option>
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Invoice Date</label>
                  <input type="date" value={form.invoiceDate} onChange={e => setForm({ ...form, invoiceDate: e.target.value })} className="w-full h-10 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 font-semibold text-xs outline-none focus:border-emerald-500" />
                </div>
                <div className="space-y-1.5 md:col-start-4">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Due Date</label>
                  <input type="date" value={form.dueDate} onChange={e => setForm({ ...form, dueDate: e.target.value })} className="w-full h-10 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 font-semibold text-xs outline-none focus:border-emerald-500" />
                </div>
              </div>
 
              {/* Line Items */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Line Items</label>
                  <button onClick={() => setItems(prev => [...prev, { ...EMPTY_ITEM }])} className="flex items-center gap-1 text-[9px] font-bold text-emerald-600 uppercase hover:bg-emerald-50 dark:hover:bg-emerald-500/10 px-3 py-1.5 rounded-lg transition-all border border-emerald-100 dark:border-emerald-500/20">
                    <Plus size={12} /> Add Item
                  </button>
                </div>
                
                <div className="rounded-xl border border-slate-100 dark:border-white/5 overflow-hidden shadow-sm">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 dark:bg-white/5 text-[9px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100 dark:border-white/5">
                      <tr>
                        <th className="px-4 py-3 w-[36%]">Item / Description</th>
                        <th className="px-3 py-3 w-[10%] text-center">Qty</th>
                        <th className="px-3 py-3 w-[10%] text-center">Unit</th>
                        <th className="px-3 py-3 w-[16%]">Rate (₹)</th>
                        <th className="px-3 py-3 w-[12%]">GST %</th>
                        <th className="px-4 py-3 w-[14%] text-right">Amount</th>
                        <th className="px-2 py-3 w-[2%]"></th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-white/5 bg-white dark:bg-slate-900/10">
                      {items.map((item, idx) => (
                        <tr key={idx} className="hover:bg-slate-50/50 dark:hover:bg-white/[0.01]">
                          <td className="px-4 py-3">
                            <select value={item.productId} onChange={e => handleProductSelect(idx, e.target.value)} className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg px-2.5 py-1.5 text-xs font-semibold outline-none focus:border-emerald-500 cursor-pointer">
                              <option value="">Custom item...</option>
                              {products.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                            </select>
                            <input value={item.description} onChange={e => setItems(prev => prev.map((it, i) => i === idx ? { ...it, description: e.target.value } : it))} placeholder="Description details..." className="mt-1.5 w-full bg-transparent border-none outline-none text-[11px] font-medium text-slate-400 placeholder:text-slate-300" />
                          </td>
                          <td className="px-3 py-3">
                            <input type="number" value={item.qty} min={1} onChange={e => setItems(prev => prev.map((it, i) => i === idx ? { ...it, qty: Number(e.target.value) } : it))} className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg px-2 py-1.5 text-xs font-semibold text-center outline-none focus:border-emerald-500" />
                          </td>
                          <td className="px-3 py-3">
                            <input value={item.unit} onChange={e => setItems(prev => prev.map((it, i) => i === idx ? { ...it, unit: e.target.value } : it))} className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg px-2 py-1.5 text-xs font-semibold text-center outline-none focus:border-emerald-500" />
                          </td>
                          <td className="px-3 py-3">
                            <input type="number" value={item.rate} min={0} onChange={e => setItems(prev => prev.map((it, i) => i === idx ? { ...it, rate: Number(e.target.value) } : it))} className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg px-2.5 py-1.5 text-xs font-semibold outline-none focus:border-emerald-500" />
                          </td>
                          <td className="px-3 py-3">
                            <select value={item.gst} onChange={e => setItems(prev => prev.map((it, i) => i === idx ? { ...it, gst: Number(e.target.value) } : it))} className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg px-2 py-1.5 text-xs font-semibold outline-none focus:border-emerald-500 cursor-pointer">
                              {[0, 5, 12, 18, 28].map(r => <option key={r} value={r}>{r}%</option>)}
                            </select>
                          </td>
                          <td className="px-4 py-3 text-right font-semibold text-slate-800 dark:text-slate-200 text-xs">
                            ₹{(item.qty * item.rate * (1 + item.gst / 100)).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          </td>
                          <td className="px-2 py-3 text-center">
                            {items.length > 1 && (
                              <button onClick={() => setItems(prev => prev.filter((_, i) => i !== idx))} className="p-1 text-slate-300 hover:text-red-500 transition-all">
                                <X size={14} />
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
 
              {/* Totals */}
              <div className="flex justify-end pt-2">
                <div className="w-72 space-y-2.5 p-4 bg-slate-50 dark:bg-slate-900/50 rounded-xl border border-slate-100 dark:border-white/5">
                  <div className="flex justify-between text-xs font-semibold text-slate-500"><span>Subtotal</span><span className="text-slate-800 dark:text-slate-200">₹{subtotal.toFixed(2)}</span></div>
                  <div className="flex justify-between text-xs font-semibold text-slate-500"><span>GST Tax Amount</span><span className="text-slate-800 dark:text-slate-200">₹{totalGst.toFixed(2)}</span></div>
                  <div className="flex justify-between text-xs font-bold text-slate-900 dark:text-white pt-2.5 border-t border-slate-200 dark:border-white/10"><span>Grand Total</span><span className="text-emerald-500 font-extrabold">₹{grandTotal.toFixed(2)}</span></div>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Notes</label>
                <textarea value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} rows={2} placeholder="Payment instructions or notes..." className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl px-4 py-3 text-sm font-medium outline-none resize-none" />
              </div>
            </div>

            <div className="flex items-center justify-between px-8 py-5 border-t border-slate-100 dark:border-white/5 bg-slate-50/50 dark:bg-transparent">
              <button onClick={() => setShowForm(false)} className="px-6 py-2.5 text-xs font-black text-slate-500 hover:bg-slate-100 dark:hover:bg-white/5 rounded-xl transition-all">Cancel</button>
              <button onClick={handleSave} disabled={saving} className="px-8 py-2.5 bg-emerald-500 text-white rounded-xl text-xs font-black uppercase tracking-widest shadow-lg shadow-emerald-500/20 hover:bg-emerald-600 transition-all flex items-center gap-2">
                <Receipt size={12} /> {saving ? "Creating..." : "Create Invoice"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
