"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/context/ToastContext";
import {
  Package, ChevronDown, CheckCircle2, XCircle, AlertTriangle,
  Truck, ClipboardCheck, ArrowLeft, Loader2, Search
} from "lucide-react";
import { purchaseOrdersApi, grnApi } from "@/lib/api";

interface POItem {
  id: string;
  inventoryItem: { id: string; name: string; unit: string };
  quantity: number;
  price: number;
}

interface PO {
  id: string;
  vendor: { name: string };
  status: string;
  totalAmount: number;
  createdAt: string;
  poItems: POItem[];
}

interface GRNItem {
  materialId: string;
  quantity: number;       // ordered
  receivedQty: number;
  acceptedQty: number;
  rejectedQty: number;
  price: number;
}

export default function GRNPage() {
  const router = useRouter();
  const { showToast } = useToast();
  const [step, setStep] = useState<1 | 2>(1);
  const [pos, setPOs] = useState<PO[]>([]);
  const [loadingPOs, setLoadingPOs] = useState(true);
  const [selectedPO, setSelectedPO] = useState<PO | null>(null);
  const [grnItems, setGrnItems] = useState<GRNItem[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [approvedId, setApprovedId] = useState<string | null>(null);
  const [poSearch, setPoSearch] = useState("");

  useEffect(() => {
    purchaseOrdersApi.getAll().then(r => {
      const pending = (r.data.orders || r.data || []).filter(
        (p: PO) => p.status === "PENDING" || p.status === "APPROVED"
      );
      setPOs(pending);
    }).finally(() => setLoadingPOs(false));
  }, []);

  const selectPO = (po: PO) => {
    setSelectedPO(po);
    setGrnItems(
      (po.poItems || []).map(item => ({
        materialId: item.inventoryItem.id,
        quantity: item.quantity,
        receivedQty: item.quantity,
        acceptedQty: item.quantity,
        rejectedQty: 0,
        price: item.price,
      }))
    );
    setStep(2);
  };

  const updateItem = (idx: number, field: keyof GRNItem, val: number) => {
    setGrnItems(prev => {
      const next = [...prev];
      next[idx] = { ...next[idx], [field]: val };
      if (field === "acceptedQty" || field === "rejectedQty") {
        const accepted = field === "acceptedQty" ? val : next[idx].acceptedQty;
        const rejected = field === "rejectedQty" ? val : next[idx].rejectedQty;
        next[idx].receivedQty = accepted + rejected;
      }
      if (field === "receivedQty") {
        next[idx].acceptedQty = val - next[idx].rejectedQty;
      }
      return next;
    });
  };

  const handleCreateAndApprove = async () => {
    if (!selectedPO) return;
    setSubmitting(true);
    try {
      const res = await grnApi.createFromPO(selectedPO.id, { items: grnItems });
      const grnId = res.data.id;
      await grnApi.approve(grnId);
      setApprovedId(grnId);
      showToast("GRN Approved successfully! Stock levels updated.", "success");
    } catch (e: any) {
      console.error(e);
      showToast(e.response?.data?.error || "Failed to create or approve GRN. Please verify quantities.", "error");
    } finally {
      setSubmitting(false);
    }
  };

  const formatCurrency = (n: number) =>
    new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR" }).format(n);

  const filteredPOs = pos.filter(
    p =>
      p.vendor.name.toLowerCase().includes(poSearch.toLowerCase()) ||
      p.id.slice(-6).toLowerCase().includes(poSearch.toLowerCase())
  );

  if (approvedId) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-50 flex items-center justify-center p-8">
        <div className="bg-white rounded-3xl p-12 shadow-2xl shadow-green-100 text-center space-y-6 max-w-md w-full">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto">
            <CheckCircle2 className="text-green-600" size={40} />
          </div>
          <h1 className="text-2xl font-black text-[#1A1A1A]">GRN Approved!</h1>
          <p className="text-[#666] text-sm font-medium leading-relaxed">
            Inventory has been updated with accepted quantities. The stock movement has been recorded.
          </p>
          <div className="bg-green-50 p-4 rounded-xl text-sm font-bold text-green-700">
            GRN ID: #{approvedId.slice(-8).toUpperCase()}
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => router.push("/purchases/orders")}
              className="flex-1 px-6 py-3 border-2 border-[#F0EAF0] rounded-xl font-bold text-sm text-[#666] hover:bg-slate-50 transition-all"
            >
              View Orders
            </button>
            <button
              onClick={() => router.push("/inventory")}
              className="flex-1 px-6 py-3 bg-[#7C3AED] text-white rounded-xl font-bold text-sm shadow-lg shadow-purple-200 hover:bg-[#6D28D9] transition-all"
            >
              Check Inventory
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAFAF9] p-6 md:p-10">
      {/* Header */}
      <div className="max-w-5xl mx-auto">
        <button
          onClick={() => step === 2 ? setStep(1) : router.back()}
          className="flex items-center gap-2 text-[#999] hover:text-[#1A1A1A] transition-colors text-sm font-medium mb-8"
        >
          <ArrowLeft size={16} /> {step === 2 ? "Back to PO Selection" : "Back"}
        </button>

        <div className="flex items-start justify-between mb-10">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-[#7C3AED]/10 rounded-xl flex items-center justify-center">
                <Truck className="text-[#7C3AED]" size={20} />
              </div>
              <span className="text-[10px] font-bold text-[#999] uppercase tracking-[0.2em]">
                {step === 1 ? "Step 1 of 2" : "Step 2 of 2"}
              </span>
            </div>
            <h1 className="text-3xl font-black text-[#1A1A1A] tracking-tight">
              {step === 1 ? "Select Purchase Order" : "Record Goods Received"}
            </h1>
            <p className="text-sm text-[#666] font-medium mt-1">
              {step === 1
                ? "Choose a pending PO to create a Goods Receipt Note (GRN)"
                : `PO from ${selectedPO?.vendor.name} — enter quantities received`}
            </p>
          </div>
          {/* Step indicators */}
          <div className="hidden md:flex items-center gap-2">
            <div className={`px-4 py-2 rounded-full text-xs font-bold ${step >= 1 ? "bg-[#7C3AED] text-white" : "bg-slate-100 text-[#999]"}`}>
              1 Select PO
            </div>
            <div className="w-8 h-px bg-[#E8DEE8]" />
            <div className={`px-4 py-2 rounded-full text-xs font-bold ${step >= 2 ? "bg-[#7C3AED] text-white" : "bg-slate-100 text-[#999]"}`}>
              2 Record GRN
            </div>
          </div>
        </div>

        {/* ── STEP 1: PO Selection ── */}
        {step === 1 && (
          <div className="space-y-4">
            <div className="relative mb-6">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[#999]" size={16} />
              <input
                value={poSearch}
                onChange={e => setPoSearch(e.target.value)}
                placeholder="Search by vendor name or PO ID..."
                className="w-full pl-11 pr-4 py-3.5 bg-white border border-[#F0EAF0] rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#7C3AED]/20 focus:border-[#7C3AED]"
              />
            </div>

            {loadingPOs ? (
              <div className="flex items-center justify-center py-20">
                <Loader2 className="animate-spin text-[#7C3AED]" size={32} />
              </div>
            ) : filteredPOs.length === 0 ? (
              <div className="text-center py-20 text-[#999]">
                <Package size={48} className="mx-auto mb-4 opacity-30" />
                <p className="font-bold">No pending purchase orders found</p>
                <p className="text-sm mt-1">Create a PO first before recording a GRN</p>
              </div>
            ) : (
              filteredPOs.map(po => (
                <button
                  key={po.id}
                  onClick={() => selectPO(po)}
                  className="w-full bg-white border border-[#F0EAF0] rounded-2xl p-6 flex items-center justify-between hover:border-[#7C3AED] hover:shadow-lg hover:shadow-purple-50 transition-all group text-left"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-3">
                      <span className="text-xs font-bold text-[#7C3AED] bg-purple-50 px-2 py-0.5 rounded">
                        PO-{po.id.slice(-6).toUpperCase()}
                      </span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider ${
                        po.status === "APPROVED" ? "bg-blue-50 text-blue-600" : "bg-amber-50 text-amber-600"
                      }`}>
                        {po.status}
                      </span>
                    </div>
                    <p className="font-black text-[#1A1A1A] text-base">{po.vendor.name}</p>
                    <p className="text-xs text-[#999] font-medium">
                      {po.poItems?.length ?? 0} items · {formatCurrency(po.totalAmount)} · {new Date(po.createdAt).toLocaleDateString("en-IN")}
                    </p>
                  </div>
                  <ChevronDown className="text-[#999] group-hover:text-[#7C3AED] -rotate-90 transition-all" size={20} />
                </button>
              ))
            )}
          </div>
        )}

        {/* ── STEP 2: GRN Items ── */}
        {step === 2 && selectedPO && (
          <div className="space-y-6">
            {/* PO Context Card */}
            <div className="bg-[#7C3AED] rounded-2xl p-6 text-white flex justify-between items-center">
              <div>
                <p className="text-white/60 text-[10px] font-bold uppercase tracking-widest mb-1">Purchase Order</p>
                <p className="text-xl font-black">PO-{selectedPO.id.slice(-6).toUpperCase()}</p>
                <p className="text-white/80 font-medium text-sm mt-0.5">{selectedPO.vendor.name}</p>
              </div>
              <div className="text-right">
                <p className="text-white/60 text-[10px] font-bold uppercase tracking-widest mb-1">PO Value</p>
                <p className="text-xl font-black">{formatCurrency(selectedPO.totalAmount)}</p>
              </div>
            </div>

            {/* Items Table */}
            <div className="bg-white rounded-2xl border border-[#F0EAF0] overflow-hidden">
              <div className="grid grid-cols-12 gap-4 px-6 py-4 bg-slate-50 border-b border-[#F0EAF0]">
                <div className="col-span-3 text-[10px] font-bold text-[#999] uppercase tracking-widest">Material</div>
                <div className="col-span-2 text-[10px] font-bold text-[#999] uppercase tracking-widest text-center">Ordered</div>
                <div className="col-span-2 text-[10px] font-bold text-[#999] uppercase tracking-widest text-center">Received</div>
                <div className="col-span-2 text-[10px] font-bold text-[#999] uppercase tracking-widest text-center">✅ Accepted</div>
                <div className="col-span-2 text-[10px] font-bold text-[#999] uppercase tracking-widest text-center">❌ Rejected</div>
                <div className="col-span-1 text-[10px] font-bold text-[#999] uppercase tracking-widest text-center">Status</div>
              </div>

              {grnItems.map((item, idx) => {
                const po_item = selectedPO.poItems[idx];
                const hasShortage = item.receivedQty < item.quantity;
                const hasRejection = item.rejectedQty > 0;
                return (
                  <div
                    key={idx}
                    className={`grid grid-cols-12 gap-4 px-6 py-5 border-b border-[#F0EAF0] last:border-0 transition-colors ${
                      hasRejection ? "bg-red-50/30" : hasShortage ? "bg-amber-50/30" : ""
                    }`}
                  >
                    <div className="col-span-3 flex items-center">
                      <div>
                        <p className="text-sm font-bold text-[#1A1A1A]">{po_item.inventoryItem.name}</p>
                        <p className="text-[11px] text-[#999] font-medium">{po_item.inventoryItem.unit}</p>
                      </div>
                    </div>
                    <div className="col-span-2 flex items-center justify-center">
                      <span className="text-sm font-black text-[#1A1A1A]">{item.quantity}</span>
                    </div>
                    <div className="col-span-2 flex items-center justify-center">
                      <span className={`text-sm font-black ${hasShortage ? "text-amber-600" : "text-green-600"}`}>
                        {item.receivedQty}
                      </span>
                    </div>
                    <div className="col-span-2 flex items-center justify-center">
                      <input
                        type="number"
                        min={0}
                        max={item.quantity}
                        value={item.acceptedQty}
                        onChange={e => updateItem(idx, "acceptedQty", Number(e.target.value))}
                        className="w-20 text-center px-2 py-2 border-2 border-green-200 rounded-lg text-sm font-bold text-green-700 bg-green-50 focus:outline-none focus:border-green-400"
                      />
                    </div>
                    <div className="col-span-2 flex items-center justify-center">
                      <input
                        type="number"
                        min={0}
                        max={item.quantity - item.acceptedQty}
                        value={item.rejectedQty}
                        onChange={e => updateItem(idx, "rejectedQty", Number(e.target.value))}
                        className="w-20 text-center px-2 py-2 border-2 border-red-200 rounded-lg text-sm font-bold text-red-700 bg-red-50 focus:outline-none focus:border-red-400"
                      />
                    </div>
                    <div className="col-span-1 flex items-center justify-center">
                      {hasRejection ? (
                        <XCircle className="text-red-500" size={18} />
                      ) : hasShortage ? (
                        <AlertTriangle className="text-amber-500" size={18} />
                      ) : (
                        <CheckCircle2 className="text-green-500" size={18} />
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Summary */}
            <div className="grid grid-cols-3 gap-4">
              {[
                { label: "Total Ordered", value: grnItems.reduce((s, i) => s + i.quantity, 0), color: "text-[#1A1A1A]", bg: "bg-slate-50" },
                { label: "Total Accepted", value: grnItems.reduce((s, i) => s + i.acceptedQty, 0), color: "text-green-700", bg: "bg-green-50" },
                { label: "Total Rejected", value: grnItems.reduce((s, i) => s + i.rejectedQty, 0), color: "text-red-700", bg: "bg-red-50" },
              ].map(stat => (
                <div key={stat.label} className={`${stat.bg} rounded-2xl p-5 text-center`}>
                  <p className="text-[10px] font-bold text-[#999] uppercase tracking-widest mb-1">{stat.label}</p>
                  <p className={`text-3xl font-black ${stat.color}`}>{stat.value}</p>
                </div>
              ))}
            </div>

            {/* Warning if rejections exist */}
            {grnItems.some(i => i.rejectedQty > 0) && (
              <div className="flex items-start gap-3 p-4 bg-amber-50 border border-amber-200 rounded-2xl">
                <AlertTriangle className="text-amber-600 shrink-0 mt-0.5" size={18} />
                <div>
                  <p className="text-sm font-bold text-amber-900">Rejections Detected</p>
                  <p className="text-xs text-amber-700 font-medium mt-0.5">
                    Only accepted quantities will be added to inventory. Rejected items should be returned to vendor.
                  </p>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex items-center justify-between pt-4 border-t border-[#F0EAF0]">
              <button
                onClick={() => setStep(1)}
                className="px-8 py-3 border-2 border-[#F0EAF0] rounded-xl font-bold text-sm text-[#666] hover:bg-slate-50 transition-all flex items-center gap-2"
              >
                <ArrowLeft size={16} /> Change PO
              </button>
              <button
                onClick={handleCreateAndApprove}
                disabled={submitting}
                className="px-12 py-4 bg-[#7C3AED] text-white rounded-2xl font-black text-sm tracking-widest shadow-2xl shadow-purple-200 hover:bg-[#6D28D9] hover:-translate-y-0.5 transition-all flex items-center gap-3 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {submitting ? <Loader2 size={18} className="animate-spin" /> : <ClipboardCheck size={18} />}
                {submitting ? "Processing..." : "Approve GRN & Update Stock"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
