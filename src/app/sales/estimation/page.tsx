"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Calculator, Plus, Search, RefreshCw, Trash2, X,
  FileText, ArrowRight, CheckCircle2, AlertCircle,
  ChevronDown, IndianRupee, Package, User, Calendar,
  Send, Eye, Download, FileClock
} from "lucide-react";
import { clsx } from "clsx";
import { customersApi, productsFullApi } from "@/lib/api";
import { useToast } from "@/context/ToastContext";
import api from "@/lib/api/base";

const STATUS_STYLES: Record<string, { label: string; color: string; bg: string; border: string }> = {
  DRAFT:    { label: "Draft",    color: "text-slate-600",   bg: "bg-slate-50 dark:bg-slate-500/10",   border: "border-slate-200" },
  SENT:     { label: "Sent",     color: "text-blue-600",    bg: "bg-blue-50 dark:bg-blue-500/10",     border: "border-blue-200" },
  ACCEPTED: { label: "Accepted", color: "text-emerald-600", bg: "bg-emerald-50 dark:bg-emerald-500/10", border: "border-emerald-200" },
  REJECTED: { label: "Rejected", color: "text-rose-600",    bg: "bg-rose-50 dark:bg-rose-500/10",    border: "border-rose-200" },
  CONVERTED:{ label: "Converted",color: "text-orange-600",  bg: "bg-orange-50 dark:bg-orange-500/10", border: "border-orange-200" },
};

interface LineItem { productId: string; description: string; qty: number; unit: string; rate: number; gst: number; }

const EMPTY_ITEM: LineItem = { productId: "", description: "", qty: 1, unit: "pc", rate: 0, gst: 18 };

export default function EstimationPage() {
  const { showToast } = useToast();
  const [estimations, setEstimations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [customers, setCustomers] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [converting, setConverting] = useState<string | null>(null);

  // Form state
  const [form, setForm] = useState({
    customerId: "",
    subject: "",
    validUntil: "",
    notes: "",
    termsConditions: "",
  });
  const [items, setItems] = useState<LineItem[]>([{ ...EMPTY_ITEM }]);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [eRes, cRes, pRes] = await Promise.allSettled([
        api.get("/api/estimations").catch(() => ({ data: [] })),
        customersApi.getAll(),
        productsFullApi.getAll(),
      ]);
      if (eRes.status === "fulfilled") setEstimations((eRes.value as any).data || []);
      if (cRes.status === "fulfilled") setCustomers((cRes.value as any).data || []);
      if (pRes.status === "fulfilled") setProducts((pRes.value as any).data || []);
    } finally {
      setLoading(false);
    }
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

  const handleSave = async (asDraft = true) => {
    if (!form.customerId || items.some(i => !i.description || i.qty <= 0 || i.rate <= 0)) {
      showToast("Fill customer and all line items", "error"); return;
    }
    setSaving(true);
    try {
      await api.post("/api/estimations", {
        ...form,
        status: asDraft ? "DRAFT" : "SENT",
        items: items.map(i => ({ ...i, amount: i.qty * i.rate, gstAmount: (i.qty * i.rate * i.gst) / 100 })),
        subtotal, totalGst, grandTotal,
      });
      showToast(asDraft ? "Estimation saved as draft" : "Estimation sent to customer", "success");
      setShowForm(false);
      setItems([{ ...EMPTY_ITEM }]);
      setForm({ customerId: "", subject: "", validUntil: "", notes: "", termsConditions: "" });
      fetchData();
    } catch (e: any) {
      showToast(e?.response?.data?.error || "Failed to save estimation", "error");
    } finally { setSaving(false); }
  };

  const handleConvertToProforma = async (id: string) => {
    setConverting(id);
    try {
      await api.post(`/api/estimations/${id}/convert-proforma`);
      showToast("Converted to Pro Forma Invoice", "success");
      fetchData();
    } catch (e: any) {
      showToast(e?.response?.data?.error || "Conversion failed", "error");
    } finally { setConverting(null); }
  };

  const handleConvertToInvoice = async (id: string) => {
    setConverting(id);
    try {
      await api.post(`/api/estimations/${id}/convert-invoice`);
      showToast("Converted to Sales Invoice", "success");
      fetchData();
    } catch (e: any) {
      showToast(e?.response?.data?.error || "Conversion failed", "error");
    } finally { setConverting(null); }
  };

  const filtered = estimations.filter(e =>
    !search ||
    e.estimationNumber?.toLowerCase().includes(search.toLowerCase()) ||
    e.customer?.name?.toLowerCase().includes(search.toLowerCase()) ||
    e.subject?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto space-y-6 p-4 md:p-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-orange-500 rounded-2xl shadow-lg shadow-orange-500/20">
            <Calculator size={22} className="text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tight">Estimations</h1>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-0.5">Create quotes → Pro Forma Invoice → Sales Invoice</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={fetchData} className="p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-xl hover:border-slate-300 transition-all shadow-sm">
            <RefreshCw size={16} className={clsx("text-slate-400", loading && "animate-spin")} />
          </button>
          <button
            onClick={() => setShowForm(true)}
            className="flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white px-6 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-lg shadow-orange-500/20 transition-all"
          >
            <Plus size={16} strokeWidth={3} /> New Estimation
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Total", value: estimations.length, color: "text-slate-700" },
          { label: "Sent", value: estimations.filter(e => e.status === "SENT").length, color: "text-blue-600" },
          { label: "Accepted", value: estimations.filter(e => e.status === "ACCEPTED").length, color: "text-emerald-600" },
          { label: "Converted", value: estimations.filter(e => e.status === "CONVERTED").length, color: "text-orange-600" },
        ].map(s => (
          <div key={s.label} className="bg-white dark:bg-slate-900/40 p-5 rounded-2xl border border-slate-100 dark:border-white/5 shadow-sm">
            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{s.label}</p>
            <p className={clsx("text-3xl font-black mt-1", s.color)}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Conversion flow banner */}
      <div className="flex items-center gap-3 p-4 bg-orange-50 dark:bg-orange-500/5 border border-orange-100 dark:border-orange-500/20 rounded-2xl text-[10px] font-black text-orange-700 dark:text-orange-400 uppercase tracking-widest">
        <Calculator size={14} /> Estimation
        <ArrowRight size={12} className="opacity-50" />
        <FileClock size={14} /> Pro Forma Invoice
        <ArrowRight size={12} className="opacity-50" />
        <FileText size={14} /> Sales Invoice
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-slate-900/40 rounded-3xl border border-slate-100 dark:border-white/5 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-slate-50 dark:border-white/5 flex items-center gap-4">
          <div className="relative flex-1 max-w-sm">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search estimations..." className="w-full pl-9 pr-4 py-2.5 text-sm bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/10 rounded-xl outline-none" />
          </div>
        </div>

        {loading ? (
          <div className="py-20 text-center"><RefreshCw size={28} className="mx-auto text-orange-500 animate-spin opacity-20" /></div>
        ) : filtered.length === 0 ? (
          <div className="py-20 text-center">
            <Calculator size={44} strokeWidth={1} className="mx-auto text-slate-200 mb-3" />
            <p className="text-sm font-black text-slate-400">No estimations yet. Create your first one.</p>
          </div>
        ) : (
          <table className="w-full text-left">
            <thead className="bg-slate-50/50 dark:bg-white/[0.02] text-[9px] font-black text-slate-400 uppercase tracking-widest">
              <tr>
                <th className="px-6 py-4">Est. No.</th>
                <th className="px-6 py-4">Customer</th>
                <th className="px-6 py-4">Subject</th>
                <th className="px-6 py-4">Valid Until</th>
                <th className="px-6 py-4 text-right">Amount</th>
                <th className="px-6 py-4 text-center">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 dark:divide-white/5">
              {filtered.map(est => {
                const st = STATUS_STYLES[est.status] || STATUS_STYLES.DRAFT;
                return (
                  <tr key={est.id} className="hover:bg-slate-50/50 dark:hover:bg-white/[0.02] transition-all">
                    <td className="px-6 py-4 font-black text-orange-600 text-sm">{est.estimationNumber || est.id?.substring(0,8).toUpperCase()}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-lg bg-slate-100 dark:bg-white/5 flex items-center justify-center text-slate-400"><User size={12} /></div>
                        <span className="text-sm font-bold text-slate-700 dark:text-slate-200">{est.customer?.name || "—"}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm font-medium text-slate-500 max-w-[180px] truncate">{est.subject || "—"}</td>
                    <td className="px-6 py-4 text-sm font-bold text-slate-500">{est.validUntil ? new Date(est.validUntil).toLocaleDateString() : "—"}</td>
                    <td className="px-6 py-4 text-right font-black text-slate-900 dark:text-white">₹{(est.grandTotal || 0).toLocaleString()}</td>
                    <td className="px-6 py-4 text-center">
                      <span className={clsx("px-2.5 py-1 rounded-full text-[8px] font-black uppercase tracking-wider border", st.color, st.bg, st.border)}>
                        {st.label}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-1.5">
                        {["DRAFT", "SENT", "ACCEPTED"].includes(est.status) && (
                          <>
                            <button
                              onClick={() => handleConvertToProforma(est.id)}
                              disabled={!!converting}
                              className="px-3 py-1.5 bg-blue-50 dark:bg-blue-500/10 text-blue-600 rounded-lg text-[8px] font-black uppercase tracking-widest hover:bg-blue-100 transition-all flex items-center gap-1"
                              title="Convert to Pro Forma Invoice"
                            >
                              <FileClock size={10} /> Pro Forma
                            </button>
                            <button
                              onClick={() => handleConvertToInvoice(est.id)}
                              disabled={!!converting}
                              className="px-3 py-1.5 bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 rounded-lg text-[8px] font-black uppercase tracking-widest hover:bg-emerald-100 transition-all flex items-center gap-1"
                              title="Convert to Sales Invoice"
                            >
                              <FileText size={10} /> Invoice
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* New Estimation Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-start justify-center p-4 bg-black/50 backdrop-blur-sm overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 rounded-[2rem] shadow-2xl w-full max-w-3xl my-8 border border-slate-100 dark:border-white/10 overflow-hidden">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-8 py-6 border-b border-slate-100 dark:border-white/5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-orange-500 flex items-center justify-center text-white shadow-lg shadow-orange-500/20">
                  <Calculator size={18} />
                </div>
                <div>
                  <h2 className="text-lg font-black text-slate-900 dark:text-white uppercase tracking-tight">New Estimation</h2>
                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Create a quote for your customer</p>
                </div>
              </div>
              <button onClick={() => setShowForm(false)} className="p-2 hover:bg-slate-100 dark:hover:bg-white/5 rounded-xl text-slate-400">
                <X size={18} />
              </button>
            </div>

            <div className="p-8 space-y-6">
              {/* Customer & Meta */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5 col-span-2 md:col-span-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Customer *</label>
                  <div className="relative">
                    <select
                      value={form.customerId}
                      onChange={e => setForm({ ...form, customerId: e.target.value })}
                      className="w-full h-11 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl px-4 font-bold text-sm outline-none appearance-none cursor-pointer"
                    >
                      <option value="">Select customer...</option>
                      {customers.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                    <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Valid Until</label>
                  <input
                    type="date"
                    value={form.validUntil}
                    onChange={e => setForm({ ...form, validUntil: e.target.value })}
                    min={new Date().toISOString().split("T")[0]}
                    className="w-full h-11 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl px-4 font-bold text-sm outline-none"
                  />
                </div>
                <div className="space-y-1.5 col-span-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Subject / Title</label>
                  <input
                    value={form.subject}
                    onChange={e => setForm({ ...form, subject: e.target.value })}
                    placeholder="e.g. Supply of Idly Batter - May 2026"
                    className="w-full h-11 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl px-4 font-bold text-sm outline-none"
                  />
                </div>
              </div>

              {/* Line Items */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Line Items</label>
                  <button
                    onClick={() => setItems(prev => [...prev, { ...EMPTY_ITEM }])}
                    className="flex items-center gap-1 text-[9px] font-black text-orange-600 uppercase hover:bg-orange-50 px-3 py-1.5 rounded-lg transition-all"
                  >
                    <Plus size={12} /> Add Item
                  </button>
                </div>

                <div className="rounded-2xl border border-slate-100 dark:border-white/5 overflow-hidden">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 dark:bg-white/5 text-[9px] font-black text-slate-400 uppercase tracking-widest">
                      <tr>
                        <th className="px-4 py-3 w-[35%]">Item / Description</th>
                        <th className="px-4 py-3 w-[8%]">Qty</th>
                        <th className="px-4 py-3 w-[8%]">Unit</th>
                        <th className="px-4 py-3 w-[15%]">Rate (₹)</th>
                        <th className="px-4 py-3 w-[8%]">GST %</th>
                        <th className="px-4 py-3 w-[15%] text-right">Amount</th>
                        <th className="px-4 py-3 w-[6%]"></th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50 dark:divide-white/5">
                      {items.map((item, idx) => (
                        <tr key={idx}>
                          <td className="px-4 py-2">
                            <select
                              value={item.productId}
                              onChange={e => handleProductSelect(idx, e.target.value)}
                              className="w-full bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/5 rounded-lg px-2 py-1.5 text-xs font-bold outline-none appearance-none"
                            >
                              <option value="">Custom item...</option>
                              {products.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                            </select>
                            <input
                              value={item.description}
                              onChange={e => setItems(prev => prev.map((it, i) => i === idx ? { ...it, description: e.target.value } : it))}
                              placeholder="Description..."
                              className="mt-1 w-full bg-transparent border-none outline-none text-xs font-medium text-slate-500 placeholder:text-slate-300"
                            />
                          </td>
                          <td className="px-4 py-2">
                            <input type="number" value={item.qty} min={1} onChange={e => setItems(prev => prev.map((it, i) => i === idx ? { ...it, qty: Number(e.target.value) } : it))}
                              className="w-full bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/5 rounded-lg px-2 py-1.5 text-xs font-black text-center outline-none" />
                          </td>
                          <td className="px-4 py-2">
                            <input value={item.unit} onChange={e => setItems(prev => prev.map((it, i) => i === idx ? { ...it, unit: e.target.value } : it))}
                              className="w-full bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/5 rounded-lg px-2 py-1.5 text-xs font-black text-center outline-none" />
                          </td>
                          <td className="px-4 py-2">
                            <input type="number" value={item.rate} min={0} onChange={e => setItems(prev => prev.map((it, i) => i === idx ? { ...it, rate: Number(e.target.value) } : it))}
                              className="w-full bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/5 rounded-lg px-2 py-1.5 text-xs font-black outline-none" />
                          </td>
                          <td className="px-4 py-2">
                            <select value={item.gst} onChange={e => setItems(prev => prev.map((it, i) => i === idx ? { ...it, gst: Number(e.target.value) } : it))}
                              className="w-full bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/5 rounded-lg px-1 py-1.5 text-xs font-black outline-none">
                              {[0, 5, 12, 18, 28].map(r => <option key={r} value={r}>{r}%</option>)}
                            </select>
                          </td>
                          <td className="px-4 py-2 text-right font-black text-slate-900 dark:text-white">
                            ₹{(item.qty * item.rate * (1 + item.gst / 100)).toFixed(2)}
                          </td>
                          <td className="px-4 py-2 text-center">
                            {items.length > 1 && (
                              <button onClick={() => setItems(prev => prev.filter((_, i) => i !== idx))} className="p-1 text-slate-300 hover:text-red-500 transition-all">
                                <X size={12} />
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
              <div className="flex justify-end">
                <div className="w-72 space-y-2 p-4 bg-slate-50 dark:bg-white/5 rounded-2xl border border-slate-100 dark:border-white/5">
                  <div className="flex justify-between text-xs font-bold text-slate-500">
                    <span>Subtotal</span><span>₹{subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-xs font-bold text-slate-500">
                    <span>GST</span><span>₹{totalGst.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm font-black text-slate-900 dark:text-white pt-2 border-t border-slate-200 dark:border-white/10">
                    <span>Grand Total</span><span className="text-orange-600">₹{grandTotal.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              {/* Notes */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Notes</label>
                  <textarea value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} rows={3} placeholder="Internal notes..." className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl px-4 py-3 text-sm font-medium outline-none resize-none" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Terms & Conditions</label>
                  <textarea value={form.termsConditions} onChange={e => setForm({ ...form, termsConditions: e.target.value })} rows={3} placeholder="Payment terms, validity..." className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl px-4 py-3 text-sm font-medium outline-none resize-none" />
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between px-8 py-5 border-t border-slate-100 dark:border-white/5 bg-slate-50/50 dark:bg-transparent">
              <button onClick={() => setShowForm(false)} className="px-6 py-2.5 text-xs font-black text-slate-500 hover:bg-slate-100 dark:hover:bg-white/5 rounded-xl transition-all">
                Cancel
              </button>
              <div className="flex gap-3">
                <button onClick={() => handleSave(true)} disabled={saving} className="px-6 py-2.5 bg-slate-100 dark:bg-white/10 text-slate-700 dark:text-white rounded-xl text-xs font-black uppercase tracking-widest hover:bg-slate-200 transition-all">
                  Save Draft
                </button>
                <button onClick={() => handleSave(false)} disabled={saving} className="px-8 py-2.5 bg-orange-500 text-white rounded-xl text-xs font-black uppercase tracking-widest shadow-lg shadow-orange-500/20 hover:bg-orange-600 transition-all flex items-center gap-2">
                  <Send size={12} /> {saving ? "Saving..." : "Send to Customer"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
