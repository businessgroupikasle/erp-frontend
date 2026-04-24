"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft, Loader2, DollarSign, CheckCircle2, Clock,
  ChevronRight, Plus, Search, CreditCard, Building2
} from "lucide-react";
import { vendorsApi, vendorInvoicesApi } from "@/lib/api";

interface Vendor {
  id: string;
  name: string;
  contact: string;
  email?: string;
  balance?: number;
  advanceBalance?: number;
  totalPurchases?: number;
}

interface Invoice {
  id: string;
  invoiceNumber: string;
  amount: number;
  status: string;
  createdAt: string;
  procurementOrder?: { totalAmount: number };
}

type PaymentMode = "CASH" | "UPI" | "BANK_TRANSFER" | "CHEQUE";

const PAYMENT_MODES: { key: PaymentMode; label: string; icon: string }[] = [
  { key: "CASH",          label: "Cash",          icon: "💵" },
  { key: "UPI",           label: "UPI",           icon: "📱" },
  { key: "BANK_TRANSFER", label: "Bank Transfer", icon: "🏦" },
  { key: "CHEQUE",        label: "Cheque",        icon: "📄" },
];

export default function VendorPaymentPage() {
  const router = useRouter();
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [selectedVendor, setSelectedVendor] = useState<Vendor | null>(null);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [loadingVendors, setLoadingVendors] = useState(true);
  const [loadingInvoices, setLoadingInvoices] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [search, setSearch] = useState("");
  const [success, setSuccess] = useState(false);
  const [form, setForm] = useState({
    amount: "",
    mode: "CASH" as PaymentMode,
    note: "",
    reference: "",
  });

  useEffect(() => {
    vendorsApi.getAll()
      .then(r => setVendors(r.data?.vendors || r.data || []))
      .finally(() => setLoadingVendors(false));
  }, []);

  const selectVendor = async (vendor: Vendor) => {
    setSelectedVendor(vendor);
    setSelectedInvoice(null);
    setLoadingInvoices(true);
    try {
      const res = await vendorInvoicesApi.getAll({ vendorId: vendor.id });
      const all = res.data?.invoices || res.data || [];
      setInvoices(all.filter((i: Invoice) => i.status !== "PAID"));
    } catch {
      setInvoices([]);
    } finally {
      setLoadingInvoices(false);
    }
  };

  const handlePay = async () => {
    if (!selectedVendor || !form.amount || parseFloat(form.amount) <= 0) {
      alert("Enter a valid amount");
      return;
    }
    setSubmitting(true);
    try {
      await vendorsApi.recordPayment(selectedVendor.id, {
        amount: parseFloat(form.amount),
        note: `${PAYMENT_MODES.find(m => m.key === form.mode)?.label} Payment${form.reference ? ` — Ref: ${form.reference}` : ""}${form.note ? `. ${form.note}` : ""}`,
      });
      setSuccess(true);
    } catch {
      alert("Payment failed. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const formatCurrency = (n: number) =>
    new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", minimumFractionDigits: 2 }).format(n);

  const filteredVendors = vendors.filter(v =>
    v.name.toLowerCase().includes(search.toLowerCase())
  );

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-50 flex items-center justify-center p-8">
        <div className="bg-white rounded-3xl p-12 shadow-2xl shadow-green-100 text-center space-y-6 max-w-md w-full">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto">
            <CheckCircle2 className="text-green-600" size={40} />
          </div>
          <h1 className="text-2xl font-black text-[#1A1A1A]">Payment Recorded!</h1>
          <p className="text-[#666] text-sm font-medium leading-relaxed">
            {formatCurrency(parseFloat(form.amount))} paid to <strong>{selectedVendor?.name}</strong> via {PAYMENT_MODES.find(m => m.key === form.mode)?.label}.
            The vendor ledger has been updated.
          </p>
          <div className="flex gap-3">
            <button
              onClick={() => { setSuccess(false); setForm({ amount: "", mode: "CASH", note: "", reference: "" }); setSelectedVendor(null); }}
              className="flex-1 px-6 py-3 border-2 border-[#F0EAF0] rounded-xl font-bold text-sm text-[#666] hover:bg-slate-50"
            >
              New Payment
            </button>
            <button
              onClick={() => router.push("/vendors")}
              className="flex-1 px-6 py-3 bg-[#7C3AED] text-white rounded-xl font-bold text-sm shadow-lg shadow-purple-200 hover:bg-[#6D28D9]"
            >
              View Ledger
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAFAF9] p-6 md:p-10">
      <div className="max-w-5xl mx-auto">
        <button onClick={() => router.back()} className="flex items-center gap-2 text-[#999] hover:text-[#1A1A1A] text-sm font-medium mb-8">
          <ArrowLeft size={16} /> Back
        </button>

        <div className="flex items-start gap-4 mb-10">
          <div className="w-10 h-10 bg-[#7C3AED]/10 rounded-xl flex items-center justify-center">
            <DollarSign className="text-[#7C3AED]" size={20} />
          </div>
          <div>
            <h1 className="text-3xl font-black text-[#1A1A1A] tracking-tight">Vendor Payment</h1>
            <p className="text-sm text-[#666] font-medium mt-1">
              Record payments — ledger updates automatically
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* LEFT: Vendor Selection */}
          <div className="space-y-4">
            <h2 className="text-sm font-black text-[#1A1A1A] uppercase tracking-tight">1. Select Vendor</h2>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#999]" size={14} />
              <input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search vendors..."
                className="w-full pl-9 pr-4 py-3 bg-white border border-[#F0EAF0] rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#7C3AED]/20 focus:border-[#7C3AED]"
              />
            </div>

            {loadingVendors ? (
              <div className="flex justify-center py-10">
                <Loader2 className="animate-spin text-[#7C3AED]" size={28} />
              </div>
            ) : (
              <div className="space-y-2 max-h-[400px] overflow-y-auto pr-1">
                {filteredVendors.map(vendor => {
                  const isSelected = selectedVendor?.id === vendor.id;
                  const hasDue = (vendor.balance || 0) > 0;
                  return (
                    <button
                      key={vendor.id}
                      onClick={() => selectVendor(vendor)}
                      className={`w-full p-4 rounded-2xl border transition-all text-left flex items-center justify-between ${
                        isSelected
                          ? "border-[#7C3AED] bg-purple-50 shadow-lg shadow-purple-50"
                          : "border-[#F0EAF0] bg-white hover:border-[#7C3AED]/30 hover:shadow-sm"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${isSelected ? "bg-[#7C3AED]" : "bg-slate-100"}`}>
                          <Building2 className={isSelected ? "text-white" : "text-[#999]"} size={16} />
                        </div>
                        <div>
                          <p className="font-bold text-sm text-[#1A1A1A]">{vendor.name}</p>
                          {hasDue && (
                            <p className="text-[11px] text-red-600 font-bold">{formatCurrency(vendor.balance || 0)} due</p>
                          )}
                        </div>
                      </div>
                      <ChevronRight className={`${isSelected ? "text-[#7C3AED]" : "text-[#CCC]"}`} size={16} />
                    </button>
                  );
                })}
              </div>
            )}

            {/* Outstanding Invoices */}
            {selectedVendor && (
              <div className="mt-4 space-y-3">
                <h3 className="text-[11px] font-bold text-[#999] uppercase tracking-widest">Pending Invoices</h3>
                {loadingInvoices ? (
                  <Loader2 className="animate-spin text-[#7C3AED] mx-auto" size={20} />
                ) : invoices.length === 0 ? (
                  <p className="text-xs text-[#999] font-medium py-3 text-center">No pending invoices</p>
                ) : (
                  invoices.map(inv => (
                    <button
                      key={inv.id}
                      onClick={() => {
                        setSelectedInvoice(inv);
                        setForm(f => ({ ...f, amount: inv.amount.toString() }));
                      }}
                      className={`w-full p-4 rounded-xl border text-left transition-all ${
                        selectedInvoice?.id === inv.id
                          ? "border-[#7C3AED] bg-purple-50"
                          : "border-[#F0EAF0] bg-white hover:border-[#7C3AED]/30"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-xs font-black text-[#1A1A1A]">{inv.invoiceNumber}</p>
                          <p className="text-[10px] text-[#999] font-medium">{new Date(inv.createdAt).toLocaleDateString("en-IN")}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-black text-[#1A1A1A]">{formatCurrency(inv.amount)}</p>
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                            inv.status === "MATCHED" ? "bg-green-50 text-green-700" : "bg-amber-50 text-amber-700"
                          }`}>{inv.status}</span>
                        </div>
                      </div>
                    </button>
                  ))
                )}
              </div>
            )}
          </div>

          {/* RIGHT: Payment Form */}
          <div className="space-y-6">
            <h2 className="text-sm font-black text-[#1A1A1A] uppercase tracking-tight">2. Payment Details</h2>

            {!selectedVendor ? (
              <div className="flex flex-col items-center justify-center h-64 text-[#999] bg-white rounded-2xl border border-dashed border-[#F0EAF0]">
                <Building2 size={36} className="mb-3 opacity-30" />
                <p className="text-sm font-bold">Select a vendor first</p>
              </div>
            ) : (
              <div className="space-y-5">
                {/* Vendor context */}
                <div className="bg-[#1A1A1A] rounded-2xl p-6 text-white">
                  <p className="text-white/50 text-[10px] font-bold uppercase tracking-widest mb-1">Paying To</p>
                  <p className="text-xl font-black">{selectedVendor.name}</p>
                  {selectedInvoice && (
                    <p className="text-white/60 text-xs font-medium mt-1">
                      Invoice: {selectedInvoice.invoiceNumber}
                    </p>
                  )}
                </div>

                {/* Amount */}
                <div className="space-y-2">
                  <label className="text-[11px] font-bold text-[#666] uppercase tracking-widest">Amount (₹) *</label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[#999] font-bold">₹</span>
                    <input
                      type="number"
                      value={form.amount}
                      onChange={e => setForm(f => ({ ...f, amount: e.target.value }))}
                      placeholder="0.00"
                      className="w-full pl-8 pr-4 py-4 border-2 border-[#F0EAF0] rounded-xl text-lg font-black focus:outline-none focus:border-[#7C3AED] focus:ring-2 focus:ring-[#7C3AED]/10"
                    />
                  </div>
                </div>

                {/* Payment Mode */}
                <div className="space-y-2">
                  <label className="text-[11px] font-bold text-[#666] uppercase tracking-widest">Payment Mode</label>
                  <div className="grid grid-cols-4 gap-2">
                    {PAYMENT_MODES.map(mode => (
                      <button
                        key={mode.key}
                        onClick={() => setForm(f => ({ ...f, mode: mode.key }))}
                        className={`py-3 rounded-xl border-2 text-center transition-all ${
                          form.mode === mode.key
                            ? "border-[#7C3AED] bg-purple-50"
                            : "border-[#F0EAF0] bg-white hover:border-[#7C3AED]/30"
                        }`}
                      >
                        <div className="text-xl mb-0.5">{mode.icon}</div>
                        <p className="text-[10px] font-bold text-[#666]">{mode.label}</p>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Reference (optional) */}
                {(form.mode === "UPI" || form.mode === "BANK_TRANSFER" || form.mode === "CHEQUE") && (
                  <div className="space-y-2">
                    <label className="text-[11px] font-bold text-[#666] uppercase tracking-widest">
                      {form.mode === "CHEQUE" ? "Cheque No." : "Transaction Reference"}
                    </label>
                    <input
                      value={form.reference}
                      onChange={e => setForm(f => ({ ...f, reference: e.target.value }))}
                      placeholder={form.mode === "CHEQUE" ? "e.g. CHQ-00123" : "e.g. UPI-TXNID"}
                      className="w-full px-4 py-3 border border-[#F0EAF0] rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#7C3AED]/20 focus:border-[#7C3AED]"
                    />
                  </div>
                )}

                {/* Note */}
                <div className="space-y-2">
                  <label className="text-[11px] font-bold text-[#666] uppercase tracking-widest">Remarks (Optional)</label>
                  <textarea
                    value={form.note}
                    onChange={e => setForm(f => ({ ...f, note: e.target.value }))}
                    placeholder="e.g. Payment for March PO"
                    rows={2}
                    className="w-full px-4 py-3 border border-[#F0EAF0] rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#7C3AED]/20 focus:border-[#7C3AED] resize-none"
                  />
                </div>

                {/* Submit */}
                <button
                  onClick={handlePay}
                  disabled={submitting || !form.amount}
                  className={`w-full py-4 rounded-2xl font-black text-sm tracking-widest flex items-center justify-center gap-3 transition-all shadow-2xl ${
                    form.amount && !submitting
                      ? "bg-[#7C3AED] text-white shadow-purple-200 hover:bg-[#6D28D9] hover:-translate-y-0.5 active:scale-95"
                      : "bg-slate-100 text-[#CCC] shadow-none cursor-not-allowed"
                  }`}
                >
                  {submitting ? (
                    <><Loader2 size={18} className="animate-spin" /> Processing...</>
                  ) : (
                    <><CreditCard size={18} /> Record Payment</>
                  )}
                </button>

                <p className="text-center text-[10px] text-[#999] font-medium">
                  This will be recorded in the vendor ledger instantly
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
