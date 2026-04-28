"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  FileText, CheckCircle2, XCircle, AlertTriangle, Plus,
  ArrowLeft, Loader2, TrendingUp, Search, Zap
} from "lucide-react";
import { purchaseOrdersApi, grnApi, vendorInvoicesApi } from "@/lib/api";

interface PO { id: string; vendor: { id: string; name: string }; totalAmount: number; status: string; }
interface GRN { id: string; poId: string; status: string; createdAt: string; items?: any[]; }

type MatchStatus = "MATCHED" | "MISMATCH" | "PENDING";

export default function VendorInvoicesPage() {
  const router = useRouter();
  const [invoices, setInvoices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [pos, setPOs] = useState<PO[]>([]);
  const [grns, setGrns] = useState<GRN[]>([]);
  const [form, setForm] = useState({ vendorId: "", poId: "", grnId: "", invoiceNumber: "", amount: "" });
  const [submitting, setSubmitting] = useState(false);
  const [matchingId, setMatchingId] = useState<string | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [invRes, poRes, grnRes] = await Promise.all([
        vendorInvoicesApi.getAll(),
        purchaseOrdersApi.getAll(),
        grnApi.getAll(),
      ]);
      setInvoices(invRes.data?.invoices || invRes.data || []);
      setPOs(poRes.data?.orders || poRes.data || []);
      setGrns(grnRes.data?.grns || grnRes.data || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const selectedPO = pos.find(p => p.id === form.poId);
  const selectedGRN = grns.find(g => g.id === form.grnId);

  const handleCreate = async () => {
    if (!form.invoiceNumber || !form.poId || !form.amount) {
      alert("Fill all required fields");
      return;
    }
    setSubmitting(true);
    try {
      await vendorInvoicesApi.create({
        vendorId: selectedPO?.vendor.id || form.vendorId,
        poId: form.poId,
        grnId: form.grnId || undefined,
        invoiceNumber: form.invoiceNumber,
        amount: parseFloat(form.amount),
      });
      setShowCreate(false);
      setForm({ vendorId: "", poId: "", grnId: "", invoiceNumber: "", amount: "" });
      fetchData();
    } catch {
      alert("Failed to create invoice");
    } finally {
      setSubmitting(false);
    }
  };

  const handleMatch = async (invoiceId: string) => {
    setMatchingId(invoiceId);
    try {
      await vendorInvoicesApi.match(invoiceId);
      fetchData();
    } catch {
      alert("Matching failed");
    } finally {
      setMatchingId(null);
    }
  };

  const formatCurrency = (n: number) =>
    new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", minimumFractionDigits: 2 }).format(n);

  const statusConfig: Record<MatchStatus, { bg: string; text: string; icon: any; label: string }> = {
    MATCHED:  { bg: "bg-green-50 border-green-100",  text: "text-green-700",  icon: CheckCircle2, label: "Matched"  },
    MISMATCH: { bg: "bg-red-50 border-red-100",      text: "text-red-700",    icon: XCircle,      label: "Mismatch" },
    PENDING:  { bg: "bg-amber-50 border-amber-100",  text: "text-amber-700",  icon: AlertTriangle, label: "Pending" },
  };

  const filteredGRNs = grns.filter(g => g.poId === form.poId);

  return (
    <div className="min-h-screen bg-[#FAFAF9] p-6 md:p-10">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <button onClick={() => router.back()} className="flex items-center gap-2 text-[#999] hover:text-[#1A1A1A] text-sm font-medium mb-8">
          <ArrowLeft size={16} /> Back
        </button>

        <div className="flex items-start justify-between mb-10">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-[#7C3AED]/10 rounded-xl flex items-center justify-center">
                <FileText className="text-[#7C3AED]" size={20} />
              </div>
            </div>
            <h1 className="text-3xl font-black text-[#1A1A1A] tracking-tight">Vendor Invoices</h1>
            <p className="text-sm text-[#666] font-medium mt-1">
              3-way matching: PO vs GRN vs Invoice — detect and approve discrepancies
            </p>
          </div>
          <button
            onClick={() => setShowCreate(true)}
            className="px-6 py-3 bg-[#7C3AED] text-white rounded-xl font-bold text-sm flex items-center gap-2 shadow-lg shadow-purple-200 hover:bg-[#6D28D9] transition-all"
          >
            <Plus size={16} /> Add Invoice
          </button>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          {[
            { label: "Total Invoices",  value: invoices.length,                                              color: "text-[#1A1A1A]", bg: "bg-white" },
            { label: "Matched",         value: invoices.filter(i => i.status === "MATCHED").length,          color: "text-green-700", bg: "bg-green-50" },
            { label: "Mismatches",      value: invoices.filter(i => i.status === "MISMATCH").length,         color: "text-red-700",   bg: "bg-red-50" },
          ].map(s => (
            <div key={s.label} className={`${s.bg} rounded-2xl p-5 border border-[#F0EAF0]`}>
              <p className="text-[10px] font-bold text-[#999] uppercase tracking-widest mb-1">{s.label}</p>
              <p className={`text-3xl font-black ${s.color}`}>{s.value}</p>
            </div>
          ))}
        </div>

        {/* Create Invoice Panel */}
        {showCreate && (
          <div className="bg-white rounded-3xl border border-[#F0EAF0] shadow-xl p-8 mb-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-black text-[#1A1A1A]">Add Vendor Invoice</h2>
              <button onClick={() => setShowCreate(false)} className="text-[#999] hover:text-[#1A1A1A]">
                <XCircle size={20} />
              </button>
            </div>
            <div className="grid grid-cols-2 gap-6">
              <div className="col-span-2 space-y-2">
                <label className="text-[11px] font-bold text-[#666] uppercase tracking-widest">Purchase Order *</label>
                <select
                  value={form.poId}
                  onChange={e => setForm(f => ({ ...f, poId: e.target.value, grnId: "" }))}
                  className="w-full px-4 py-3 border border-[#F0EAF0] rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#7C3AED]/20 focus:border-[#7C3AED] bg-white"
                >
                  <option value="">Select PO...</option>
                  {pos.map(p => (
                    <option key={p.id} value={p.id}>
                      PO-{p.id.slice(-6).toUpperCase()} — {p.vendor.name} ({formatCurrency(p.totalAmount)})
                    </option>
                  ))}
                </select>
              </div>

              {form.poId && (
                <div className="col-span-2 space-y-2">
                  <label className="text-[11px] font-bold text-[#666] uppercase tracking-widest">GRN (Optional — for 3-way match)</label>
                  <select
                    value={form.grnId}
                    onChange={e => setForm(f => ({ ...f, grnId: e.target.value }))}
                    className="w-full px-4 py-3 border border-[#F0EAF0] rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#7C3AED]/20 focus:border-[#7C3AED] bg-white"
                  >
                    <option value="">No GRN (2-way match only)</option>
                    {filteredGRNs.map(g => (
                      <option key={g.id} value={g.id}>
                        GRN-{g.id.slice(-6).toUpperCase()} — {g.status}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div className="space-y-2">
                <label className="text-[11px] font-bold text-[#666] uppercase tracking-widest">Invoice Number *</label>
                <input
                  value={form.invoiceNumber}
                  onChange={e => setForm(f => ({ ...f, invoiceNumber: e.target.value }))}
                  placeholder="e.g. INV-2024-001"
                  className="w-full px-4 py-3 border border-[#F0EAF0] rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#7C3AED]/20 focus:border-[#7C3AED]"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[11px] font-bold text-[#666] uppercase tracking-widest">Invoice Amount (₹) *</label>
                <input
                  type="number"
                  value={form.amount}
                  onChange={e => setForm(f => ({ ...f, amount: e.target.value }))}
                  placeholder="0.00"
                  className="w-full px-4 py-3 border border-[#F0EAF0] rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#7C3AED]/20 focus:border-[#7C3AED]"
                />
              </div>
            </div>

            {/* 3-way comparison preview */}
            {selectedPO && form.amount && (
              <div className="mt-6 p-5 bg-slate-50 rounded-2xl">
                <p className="text-[10px] font-bold text-[#999] uppercase tracking-widest mb-4">Pre-Match Preview</p>
                <div className="grid grid-cols-3 gap-4 text-center">
                  {[
                    { label: "PO Value",      amount: selectedPO.totalAmount, color: "text-[#1A1A1A]" },
                    { label: "GRN Total",     amount: selectedGRN ? null : null,    color: "text-blue-700" },
                    { label: "Invoice",       amount: parseFloat(form.amount || "0"), color: parseFloat(form.amount) === selectedPO.totalAmount ? "text-green-700" : "text-red-700" },
                  ].map(col => (
                    <div key={col.label}>
                      <p className="text-[10px] font-bold text-[#999] uppercase tracking-widest mb-1">{col.label}</p>
                      <p className={`text-lg font-black ${col.color}`}>
                        {col.amount != null ? formatCurrency(col.amount) : <span className="text-[#CCC]">—</span>}
                      </p>
                    </div>
                  ))}
                </div>
                <div className={`mt-4 text-center text-xs font-bold py-2 rounded-lg ${
                  parseFloat(form.amount) === selectedPO.totalAmount ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                }`}>
                  {parseFloat(form.amount) === selectedPO.totalAmount ? "✅ Amounts match — likely MATCHED" : "⚠️ Amounts differ — likely MISMATCH"}
                </div>
              </div>
            )}

            <div className="flex justify-end gap-3 mt-6">
              <button onClick={() => setShowCreate(false)} className="px-6 py-3 border-2 border-[#F0EAF0] rounded-xl font-bold text-sm text-[#666] hover:bg-slate-50">
                Cancel
              </button>
              <button
                onClick={handleCreate}
                disabled={submitting}
                className="px-8 py-3 bg-[#7C3AED] text-white rounded-xl font-bold text-sm shadow-lg shadow-purple-200 hover:bg-[#6D28D9] flex items-center gap-2 disabled:opacity-60"
              >
                {submitting ? <Loader2 size={16} className="animate-spin" /> : <Plus size={16} />}
                Add Invoice
              </button>
            </div>
          </div>
        )}

        {/* Invoices List */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="animate-spin text-[#7C3AED]" size={32} />
          </div>
        ) : invoices.length === 0 ? (
          <div className="text-center py-20 text-[#999]">
            <FileText size={48} className="mx-auto mb-4 opacity-30" />
            <p className="font-bold">No vendor invoices yet</p>
            <p className="text-sm mt-1">Add your first invoice to start 3-way matching</p>
          </div>
        ) : (
          <div className="space-y-4">
            {invoices.map(inv => {
              const cfg = statusConfig[inv.status as MatchStatus] || statusConfig.PENDING;
              const Icon = cfg.icon;
              return (
                <div key={inv.id} className={`bg-white rounded-2xl border p-6 ${cfg.bg}`}>
                  <div className="flex items-start justify-between">
                    <div className="space-y-2">
                      <div className="flex items-center gap-3">
                        <span className="text-xs font-bold text-[#7C3AED] bg-purple-50 px-2 py-0.5 rounded">
                          {inv.invoiceNumber}
                        </span>
                        <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full border text-[11px] font-bold ${cfg.bg} ${cfg.text}`}>
                          <Icon size={12} /> {cfg.label}
                        </div>
                      </div>
                      <p className="font-black text-[#1A1A1A] text-base">{inv.vendor?.name || "—"}</p>
                      <div className="flex items-center gap-6 text-xs text-[#999] font-medium">
                        <span>PO: {inv.procurementOrder?.totalAmount ? formatCurrency(inv.procurementOrder.totalAmount) : "—"}</span>
                        <span>Invoice: <span className="text-[#1A1A1A] font-bold">{formatCurrency(inv.amount)}</span></span>
                        {inv.grn && <span>GRN: #{inv.grn.id.slice(-6).toUpperCase()}</span>}
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      {inv.status === "PENDING" && (
                        <button
                          onClick={() => handleMatch(inv.id)}
                          disabled={matchingId === inv.id}
                          className="px-5 py-2.5 bg-[#1A1A1A] text-white rounded-xl font-bold text-xs flex items-center gap-2 hover:bg-[#333] transition-all disabled:opacity-50"
                        >
                          {matchingId === inv.id ? <Loader2 size={14} className="animate-spin" /> : <Zap size={14} />}
                          Run Match
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Mismatch details */}
                  {inv.status === "MISMATCH" && inv.procurementOrder && (
                    <div className="mt-4 p-4 bg-red-50 rounded-xl border border-red-100">
                      <p className="text-[10px] font-bold text-red-900 uppercase tracking-widest mb-3">Mismatch Details</p>
                      <div className="grid grid-cols-3 gap-4 text-center">
                        {[
                          { label: "PO Value", amount: inv.procurementOrder.totalAmount },
                          { label: "Invoice",  amount: inv.amount },
                          { label: "Variance", amount: Math.abs(inv.amount - inv.procurementOrder.totalAmount) },
                        ].map(col => (
                          <div key={col.label}>
                            <p className="text-[10px] text-red-700 font-bold uppercase mb-1">{col.label}</p>
                            <p className="text-sm font-black text-red-900">{formatCurrency(col.amount)}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
