"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import {
  Wallet, Plus, RefreshCw, ChevronDown, X, Search,
  Calendar, Check, Printer
} from "lucide-react";
import { clsx } from "clsx";
import { customersApi } from "@/lib/api";
import { useToast } from "@/context/ToastContext";
import api from "@/lib/api/base";

// ── Constants ─────────────────────────────────────────────────────────────────

const PAYMENT_MODES = ["Cash", "Cheque", "Online Transfer", "UPI", "Card", "Bank Transfer"];

const PERIOD_OPTIONS = [
  { label: "This Month", value: "this_month" },
  { label: "Last Month", value: "last_month" },
  { label: "This Quarter", value: "this_quarter" },
  { label: "This Year", value: "this_year" },
  { label: "Custom", value: "custom" },
];

function formatDate(dateStr: string) {
  if (!dateStr) return "";
  const d = new Date(dateStr + "T00:00:00");
  return `${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")}/${d.getFullYear()}`;
}

function getPeriodDates(period: string): { start: string; end: string } {
  const now = new Date();
  const y = now.getFullYear();
  const m = now.getMonth();
  const pad = (n: number) => String(n).padStart(2, "0");
  const iso = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;

  if (period === "this_month") {
    return { start: iso(new Date(y, m, 1)), end: iso(new Date(y, m + 1, 0)) };
  }
  if (period === "last_month") {
    return { start: iso(new Date(y, m - 1, 1)), end: iso(new Date(y, m, 0)) };
  }
  if (period === "this_quarter") {
    const q = Math.floor(m / 3);
    return { start: iso(new Date(y, q * 3, 1)), end: iso(new Date(y, q * 3 + 3, 0)) };
  }
  if (period === "this_year") {
    return { start: iso(new Date(y, 0, 1)), end: iso(new Date(y, 11, 31)) };
  }
  return { start: iso(new Date(y, m, 1)), end: iso(new Date(y, m + 1, 0)) };
}

// ── Empty state illustration ──────────────────────────────────────────────────

function EmptyIllustration() {
  return (
    <div className="w-28 h-28 mx-auto mb-4 relative">
      <div className="absolute inset-0 rounded-full bg-orange-50 flex items-center justify-center">
        <div className="w-20 h-16 rounded-lg bg-white border-2 border-blue-100 flex flex-col gap-1.5 items-start justify-center px-3 shadow-sm">
          <div className="w-10 h-1.5 rounded bg-orange-200" />
          <div className="w-6 h-1.5 rounded bg-orange-100" />
          <div className="w-8 h-1.5 rounded bg-orange-100" />
        </div>
        <div className="absolute -top-2 -right-2 w-7 h-7 rounded-full bg-orange-100 border-2 border-orange-200 flex items-center justify-center">
          <Wallet size={12} className="text-blue-400" />
        </div>
      </div>
    </div>
  );
}

// ── Main ──────────────────────────────────────────────────────────────────────

export default function PaymentInPage() {
  const { showToast } = useToast();

  // list state
  const [payments, setPayments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState("this_month");
  const [showPeriodDrop, setShowPeriodDrop] = useState(false);
  const [dateRange, setDateRange] = useState(getPeriodDates("this_month"));
  const [customers, setCustomers] = useState<any[]>([]);

  // form state
  const [view, setView] = useState<"list" | "create">("list");
  const [saving, setSaving] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<any>(null);
  const [customerSearch, setCustomerSearch] = useState("");
  const [showCustomerDrop, setShowCustomerDrop] = useState(false);
  const [receiptDate, setReceiptDate] = useState(new Date().toISOString().split("T")[0]);
  const [amount, setAmount] = useState<string>("");
  const [paymentMode, setPaymentMode] = useState("Cash");
  const [description, setDescription] = useState("");
  const [chequeNo, setChequeNo] = useState("");
  const [showShareDrop, setShowShareDrop] = useState(false);
  const [draftId, setDraftId] = useState<string | null>(null);

  const periodDropRef = useRef<HTMLDivElement>(null);
  const customerDropRef = useRef<HTMLDivElement>(null);
  const shareDropRef = useRef<HTMLDivElement>(null);

  const fetchPayments = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get("/api/accounting/payments", {
        params: { type: "INFLOW", startDate: dateRange.start, endDate: dateRange.end }
      }).catch(() => ({ data: [] }));
      
      let apiPayments = (res as any).data?.payments || (res as any).data || [];
      
      // Filter out and merge local drafts
      try {
        const draftsStr = localStorage.getItem("sale_payments_in_drafts");
        if (draftsStr) {
          const drafts = JSON.parse(draftsStr);
          apiPayments = [...drafts, ...apiPayments];
        }
      } catch (e) {
        console.error("Error loading drafts", e);
      }
      
      setPayments(apiPayments);
    } finally {
      setLoading(false);
    }
  }, [dateRange]);

  const fetchCustomers = useCallback(async () => {
    try {
      const res = await customersApi.getAll();
      setCustomers((res as any).data || []);
    } catch {}
  }, []);

  useEffect(() => { fetchPayments(); fetchCustomers(); }, [fetchPayments, fetchCustomers]);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (periodDropRef.current && !periodDropRef.current.contains(e.target as Node))
        setShowPeriodDrop(false);
      if (customerDropRef.current && !customerDropRef.current.contains(e.target as Node))
        setShowCustomerDrop(false);
      if (shareDropRef.current && !shareDropRef.current.contains(e.target as Node))
        setShowShareDrop(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handlePeriodSelect = (val: string) => {
    setPeriod(val);
    if (val !== "custom") setDateRange(getPeriodDates(val));
    setShowPeriodDrop(false);
  };

  const handleSave = async (isDraft = false) => {
    if (!selectedCustomer && !isDraft) { showToast("Please select a party", "error"); return; }
    if ((!amount || Number(amount) <= 0) && !isDraft) { showToast("Enter a valid amount", "error"); return; }

    if (isDraft && !selectedCustomer && (!amount || Number(amount) <= 0)) {
      setView("list");
      resetForm();
      return;
    }

    const draftPayload = {
      id: draftId || `draft_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      status: "DRAFT",
      createdAt: new Date().toISOString(),
      entity: selectedCustomer || { name: "Unknown Customer" },
      paymentNumber: "DRAFT",
      paymentMode: paymentMode,
      paidAmount: Number(amount) || 0,
      _rawState: {
        selectedCustomer,
        customerSearch,
        amount,
        paymentMode,
        description,
        chequeNo,
        receiptDate
      }
    };

    if (isDraft) {
      try {
        const draftsStr = localStorage.getItem("sale_payments_in_drafts");
        let drafts = draftsStr ? JSON.parse(draftsStr) : [];
        if (draftId) {
          drafts = drafts.filter((d: any) => d.id !== draftId);
        }
        drafts.unshift(draftPayload);
        localStorage.setItem("sale_payments_in_drafts", JSON.stringify(drafts));
        showToast("Draft saved locally", "success");
        fetchPayments();
        setView("list");
        resetForm();
      } catch (e) {
        console.error("Failed to save draft locally", e);
      }
      return;
    }

    setSaving(true);
    try {
      await api.post("/api/accounting/payments", {
        entityId: selectedCustomer.id,
        entityType: "CUSTOMER",
        paidAmount: Number(amount),
        paymentMode: paymentMode.toUpperCase().replace(" ", "_"),
        type: "CUSTOMER_PAYMENT",
        sourceModule: "MANUAL",
        linkedDocType: "CUSTOMER_RECEIPT",
        transactionRef: chequeNo || undefined,
        createdBy: "SYSTEM",
      });

      // If we saved a payment that was previously a draft, remove the draft
      if (draftId) {
        try {
          const draftsStr = localStorage.getItem("sale_payments_in_drafts");
          if (draftsStr) {
            const drafts = JSON.parse(draftsStr);
            const newDrafts = drafts.filter((d: any) => d.id !== draftId);
            localStorage.setItem("sale_payments_in_drafts", JSON.stringify(newDrafts));
          }
        } catch (e) {
          console.error("Failed to clear draft", e);
        }
      }

      showToast("Payment recorded successfully", "success");
      resetForm();
      fetchPayments();
      setView("list");
    } catch (e: any) {
      showToast(e?.response?.data?.error || "Failed to record payment", "error");
    } finally {
      setSaving(false);
    }
  };

  const resetForm = () => {
    setDraftId(null);
    setSelectedCustomer(null);
    setCustomerSearch("");
    setAmount("");
    setPaymentMode("Cash");
    setDescription("");
    setChequeNo("");
    setReceiptDate(new Date().toISOString().split("T")[0]);
  };

  const loadDraft = (draft: any) => {
    setDraftId(draft.id);
    const raw = draft._rawState || {};
    setSelectedCustomer(raw.selectedCustomer || null);
    setCustomerSearch(raw.customerSearch || "");
    setAmount(raw.amount || "");
    setPaymentMode(raw.paymentMode || "Cash");
    setDescription(raw.description || "");
    setChequeNo(raw.chequeNo || "");
    setReceiptDate(raw.receiptDate || new Date().toISOString().split("T")[0]);
    setView("create");
  };

  const filteredCustomers = customers.filter(c =>
    !customerSearch ||
    c.name?.toLowerCase().includes(customerSearch.toLowerCase()) ||
    c.phone?.includes(customerSearch)
  );

  const totalAmount = payments.reduce((s: number, p: any) => s + (p.paidAmount || 0), 0);
  const totalReceived = payments.filter((p: any) => p.status === "PAID" || p.status === "SUCCESS")
    .reduce((s: number, p: any) => s + (p.paidAmount || 0), 0);

  const periodLabel = PERIOD_OPTIONS.find(o => o.value === period)?.label || "This Month";

  // ── CREATE VIEW ────────────────────────────────────────────────────────────
  if (view === "create") {
    return (
      <div className="flex flex-col h-screen bg-[#f0f0f0] overflow-hidden">

        {/* Top bar */}
        <div className="bg-white border-b border-gray-200 px-5 py-2.5 flex items-center gap-4 shrink-0">
          <span className="text-base font-semibold text-gray-800">Payment-In</span>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">

          {/* Party + Date row */}
          <div className="flex flex-wrap gap-4 items-start">

            {/* Party dropdown */}
            <div className="relative" ref={customerDropRef}>
              <div
                className={clsx(
                  "flex items-center gap-1 min-w-[220px] bg-white border rounded px-3 py-2 cursor-pointer",
                  showCustomerDrop ? "border-blue-500" : "border-gray-300"
                )}
                onClick={() => setShowCustomerDrop(v => !v)}
              >
                <div className="flex-1">
                  <div className="text-[10px] text-[#f58220] font-medium leading-none mb-0.5">Party *</div>
                  <input
                    className="w-full text-sm text-gray-700 outline-none bg-transparent placeholder-gray-400"
                    placeholder="Search by Name/Phone"
                    value={customerSearch}
                    onChange={e => { setCustomerSearch(e.target.value); setShowCustomerDrop(true); }}
                    onClick={e => { e.stopPropagation(); setShowCustomerDrop(true); }}
                  />
                </div>
                <ChevronDown size={14} className="text-gray-400 shrink-0" />
              </div>

              {showCustomerDrop && (
                <div className="absolute top-full left-0 z-50 mt-1 w-72 bg-white border border-gray-200 rounded shadow-lg max-h-56 overflow-y-auto">
                  <button
                    className="w-full flex items-center gap-2 px-3 py-2 text-sm text-[#f58220] hover:bg-orange-50 border-b border-gray-100"
                    onClick={() => setShowCustomerDrop(false)}
                  >
                    <Plus size={14} /> Add Party
                  </button>
                  {filteredCustomers.length === 0 ? (
                    <div className="px-3 py-4 text-sm text-gray-400 text-center">No customers found</div>
                  ) : filteredCustomers.map(c => (
                    <button
                      key={c.id}
                      className="w-full flex items-center justify-between px-3 py-2 hover:bg-gray-50 border-b border-gray-50 last:border-0"
                      onClick={() => { setSelectedCustomer(c); setCustomerSearch(c.name); setShowCustomerDrop(false); }}
                    >
                      <div className="text-left">
                        <div className="text-sm font-medium text-gray-800">{c.name}</div>
                        <div className="text-xs text-gray-400">{c.phone || "—"}</div>
                      </div>
                      {c.balance > 0 && (
                        <div className="flex items-center gap-1 bg-green-100 text-green-700 text-xs font-semibold px-2 py-0.5 rounded">
                          {c.balance} <Check size={10} />
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Receipt No (auto) */}
            <div className="flex flex-col">
              <div className="text-[10px] text-gray-500 mb-1">Receipt No</div>
              <div className="bg-white border border-gray-300 rounded px-3 py-2 text-sm text-gray-400 min-w-[120px]">Auto</div>
            </div>

            {/* Spacer */}
            <div className="flex-1" />

            {/* Date */}
            <div className="flex flex-col items-end">
              <div className="text-[10px] text-gray-500 mb-1">Receipt Date</div>
              <div className="flex items-center gap-1 border border-gray-300 rounded px-3 py-2 bg-white">
                <input
                  type="date"
                  value={receiptDate}
                  onChange={e => setReceiptDate(e.target.value)}
                  className="text-sm text-gray-700 outline-none bg-transparent"
                />
                <Calendar size={13} className="text-blue-500 shrink-0" />
              </div>
            </div>
          </div>

          {/* Amount + Mode */}
          <div className="bg-white border border-gray-200 rounded-lg p-4 space-y-4">
            <div className="text-sm font-semibold text-gray-700 border-b border-gray-100 pb-2">Payment Details</div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Amount */}
              <div>
                <label className="text-xs text-gray-500 mb-1 block">Amount Received (₹) *</label>
                <div className="flex items-center border border-gray-300 rounded bg-white overflow-hidden focus-within:border-blue-500">
                  <span className="px-3 py-2 text-gray-400 text-sm border-r border-gray-200 bg-gray-50">₹</span>
                  <input
                    type="number"
                    min={0}
                    placeholder="0.00"
                    value={amount}
                    onChange={e => setAmount(e.target.value)}
                    className="flex-1 px-3 py-2 text-sm text-gray-800 outline-none font-semibold"
                  />
                </div>
              </div>

              {/* Payment Mode */}
              <div>
                <label className="text-xs text-gray-500 mb-1 block">Payment Mode</label>
                <select
                  value={paymentMode}
                  onChange={e => setPaymentMode(e.target.value)}
                  className="w-full border border-gray-300 rounded px-3 py-2 text-sm text-gray-700 outline-none bg-white focus:border-blue-500"
                >
                  {PAYMENT_MODES.map(m => <option key={m} value={m}>{m}</option>)}
                </select>
              </div>

              {/* Cheque No (shown if Cheque mode) */}
              {paymentMode === "Cheque" && (
                <div>
                  <label className="text-xs text-gray-500 mb-1 block">Cheque No.</label>
                  <input
                    type="text"
                    placeholder="Enter cheque number"
                    value={chequeNo}
                    onChange={e => setChequeNo(e.target.value)}
                    className="w-full border border-gray-300 rounded px-3 py-2 text-sm text-gray-700 outline-none focus:border-blue-500"
                  />
                </div>
              )}

              {/* Description */}
              <div className={paymentMode === "Cheque" ? "md:col-span-2" : ""}>
                <label className="text-xs text-gray-500 mb-1 block">Description / Narration</label>
                <input
                  type="text"
                  placeholder="Optional note..."
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  className="w-full border border-gray-300 rounded px-3 py-2 text-sm text-gray-700 outline-none focus:border-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Total display */}
          {amount && Number(amount) > 0 && (
            <div className="bg-orange-50 border border-orange-200 rounded-lg px-5 py-3 flex items-center justify-between">
              <span className="text-sm font-semibold text-blue-700">Amount to be Received</span>
              <span className="text-lg font-bold text-blue-800">₹{Number(amount).toFixed(2)}</span>
            </div>
          )}
        </div>

        {/* Bottom action bar */}
        <div className="bg-white border-t border-gray-200 px-6 py-2.5 flex items-center justify-end gap-3 shrink-0">
          <button onClick={() => { resetForm(); setView("list"); }} className="px-4 py-1.5 text-sm text-gray-500 hover:text-gray-700">
            Cancel
          </button>

          {/* Share dropdown */}
          <div className="relative" ref={shareDropRef}>
            <div className="flex">
              <button
                onClick={() => showToast("Share feature coming soon", "info")}
                className="px-4 py-1.5 text-sm font-medium text-white bg-[#f58220] hover:bg-[#e8740e] rounded-l border-r border-[#e8740e]"
              >
                Share
              </button>
              <button onClick={() => setShowShareDrop(v => !v)} className="px-2 py-1.5 text-white bg-[#f58220] hover:bg-[#e8740e] rounded-r">
                <ChevronDown size={14} />
              </button>
            </div>
            {showShareDrop && (
              <div className="absolute bottom-full right-0 mb-1 bg-white border border-gray-200 rounded shadow-lg text-sm min-w-[140px] z-50">
                <button className="w-full px-4 py-2 text-left hover:bg-gray-50 text-gray-700 flex items-center gap-2">
                  <Printer size={13} /> Print
                </button>
                <button
                  className="w-full px-4 py-2 text-left hover:bg-gray-50 text-gray-700"
                  onClick={async () => { setShowShareDrop(false); await handleSave(); }}
                >
                  Save &amp; New
                </button>
              </div>
            )}
          </div>

          <button
            onClick={() => handleSave(true)}
            disabled={saving}
            className="px-4 py-1.5 text-sm font-semibold text-gray-600 hover:text-gray-800 bg-white border border-gray-200 rounded disabled:opacity-60"
          >
            Save Draft
          </button>
          <button
            onClick={() => handleSave(false)}
            disabled={saving}
            className="px-6 py-1.5 text-sm font-semibold text-white bg-[#f58220] hover:bg-[#e8740e] rounded disabled:opacity-60"
          >
            {saving ? "Saving..." : "Save"}
          </button>
        </div>
      </div>
    );
  }

  // ── LIST VIEW ──────────────────────────────────────────────────────────────
  return (
    <div className="flex flex-col min-h-screen bg-white">

      {/* Header */}
      <div className="flex items-center justify-between px-5 py-3 border-b border-gray-200">
        <div className="flex items-center gap-2">
          <span className="text-base font-semibold text-gray-800">Payment-In</span>
          <ChevronDown size={16} className="text-gray-400" />
        </div>
        <button
          onClick={() => setView("create")}
          className="flex items-center gap-1.5 bg-[#f58220] hover:bg-[#e8740e] text-white text-sm font-semibold px-4 py-2 rounded transition-colors"
        >
          <Plus size={15} strokeWidth={2.5} />
          Add Payment-In
        </button>
      </div>

      {/* Filter bar */}
      <div className="flex items-center gap-3 px-5 py-3 border-b border-gray-100 flex-wrap">
        <span className="text-sm text-gray-500">Filter by :</span>

        {/* Period picker */}
        <div className="relative" ref={periodDropRef}>
          <button
            onClick={() => setShowPeriodDrop(v => !v)}
            className="flex items-center gap-1.5 text-sm text-gray-700 border border-gray-300 rounded px-3 py-1.5 bg-white hover:border-gray-400"
          >
            {periodLabel}
            <ChevronDown size={13} />
          </button>
          {showPeriodDrop && (
            <div className="absolute top-full left-0 z-50 mt-1 bg-white border border-gray-200 rounded shadow-lg min-w-[140px] text-sm">
              {PERIOD_OPTIONS.map(o => (
                <button
                  key={o.value}
                  onClick={() => handlePeriodSelect(o.value)}
                  className={clsx("w-full px-4 py-2 text-left hover:bg-gray-50", period === o.value && "text-[#f58220] font-medium")}
                >
                  {o.label}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Date range */}
        <div className="flex items-center gap-1.5 border border-gray-300 rounded px-3 py-1.5 bg-white text-sm text-gray-700">
          <Calendar size={13} className="text-gray-400" />
          <span>{formatDate(dateRange.start)}</span>
          <span className="text-gray-400">To</span>
          <span>{formatDate(dateRange.end)}</span>
        </div>

        {/* All Firms */}
        <button className="flex items-center gap-1.5 text-sm text-gray-700 border border-gray-300 rounded px-3 py-1.5 bg-white hover:border-gray-400">
          All Firms <ChevronDown size={13} />
        </button>

        <div className="ml-auto">
          <button onClick={fetchPayments} className="p-2 hover:bg-gray-100 rounded-lg text-gray-400">
            <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
          </button>
        </div>
      </div>

      {/* Stats card */}
      <div className="px-5 py-4">
        <div className="border border-gray-200 rounded-lg p-4 w-64 bg-white shadow-sm">
          <div className="flex items-center justify-between mb-1">
            <span className="text-sm text-gray-500">Total Amount</span>
            <span className="text-xs text-gray-400 flex items-center gap-0.5">0% ↗ <span className="text-[10px]">vs last month</span></span>
          </div>
          <div className="text-2xl font-bold text-gray-800 mb-1">₹{totalAmount.toFixed(2)}</div>
          <div className="text-xs text-gray-500">Received: ₹{totalReceived.toFixed(2)}</div>
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex-1 flex items-center justify-center">
          <RefreshCw size={24} className="text-[#f58220] animate-spin" />
        </div>
      ) : payments.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center pb-16">
          <EmptyIllustration />
          <p className="text-base font-semibold text-gray-700 mb-1">No Transactions to show</p>
          <p className="text-sm text-gray-400 mb-5">You haven&apos;t added any transactions yet.</p>
          <button
            onClick={() => setView("create")}
            className="flex items-center gap-1.5 bg-[#f58220] hover:bg-[#e8740e] text-white text-sm font-semibold px-6 py-2.5 rounded transition-colors"
          >
            <Plus size={15} strokeWidth={2.5} />
            Add Payment-In
          </button>
        </div>
      ) : (
        <div className="flex-1 overflow-auto px-5">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="border-b border-gray-200 text-xs font-semibold text-gray-500 uppercase">
                <th className="py-3 text-left">Date</th>
                <th className="py-3 text-left">Party</th>
                <th className="py-3 text-left">Receipt No.</th>
                <th className="py-3 text-left">Mode</th>
                <th className="py-3 text-right">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {payments.map((p: any) => {
                const isDraft = p.status === "DRAFT";
                return (
                  <tr 
                    key={p.id} 
                    className={clsx(
                      "hover:bg-gray-50",
                      isDraft ? "hover:bg-yellow-50/50 cursor-pointer font-medium" : ""
                    )}
                    onClick={() => {
                      if (isDraft) loadDraft(p);
                    }}
                  >
                    <td className="py-3 text-gray-500">{p.createdAt ? new Date(p.createdAt).toLocaleDateString() : "—"}</td>
                    <td className="py-3 font-medium text-gray-800 flex items-center gap-2">
                      {p.entity?.name || p.entityId || "—"}
                      {isDraft && (
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold border bg-yellow-50 text-yellow-700 border-yellow-200 uppercase">
                          Draft
                        </span>
                      )}
                    </td>
                    <td className="py-3 text-[#f58220]">{p.paymentNumber || "—"}</td>
                    <td className="py-3 text-gray-500">{p.paymentMode || "—"}</td>
                    <td className="py-3 text-right font-semibold text-gray-800">₹{(p.paidAmount || 0).toFixed(2)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
