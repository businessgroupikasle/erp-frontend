"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Truck, Plus, Search, RefreshCw, X, FileText,
  User, CheckCircle2, Package, Printer, Calendar,
  MapPin, Hash, ArrowRight, ClipboardList
} from "lucide-react";
import { clsx } from "clsx";
import { customersApi, productsFullApi } from "@/lib/api";
import { useToast } from "@/context/ToastContext";
import api from "@/lib/api/base";

const STATUS_STYLES: Record<string, { label: string; color: string; bg: string; border: string }> = {
  DRAFT:      { label: "Draft",      color: "text-slate-600",   bg: "bg-slate-50",   border: "border-slate-200" },
  DISPATCHED: { label: "Dispatched", color: "text-blue-600",    bg: "bg-blue-50",    border: "border-blue-200" },
  DELIVERED:  { label: "Delivered",  color: "text-emerald-600", bg: "bg-emerald-50", border: "border-emerald-200" },
  CANCELLED:  { label: "Cancelled",  color: "text-slate-400",   bg: "bg-slate-100",  border: "border-slate-200" },
};

interface LineItem {
  productId: string;
  description: string;
  qty: number;
  unit: string;
  remarks: string;
}
const EMPTY_ITEM: LineItem = { productId: "", description: "", qty: 1, unit: "pc", remarks: "" };

export default function DeliveryChallanPage() {
  const { showToast } = useToast();
  const [challans, setChallans] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [customers, setCustomers] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [draftId, setDraftId] = useState<string | null>(null);

  const [form, setForm] = useState({
    customerId: "",
    deliveryAddress: "",
    dispatchDate: new Date().toISOString().split("T")[0],
    expectedDelivery: "",
    vehicleNo: "",
    driverName: "",
    transportMode: "ROAD",
    linkedInvoiceNo: "",
    notes: "",
  });
  const [items, setItems] = useState<LineItem[]>([{ ...EMPTY_ITEM }]);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [cRes, pRes, dcRes] = await Promise.allSettled([
        customersApi.getAll(),
        productsFullApi.getAll(),
        api.get("/api/sales/delivery-challans").catch(() => ({ data: [] })),
      ]);
      
      let apiChallans = dcRes.status === "fulfilled" ? (dcRes.value as any).data || [] : [];
      
      // Merge local drafts
      try {
        const draftsStr = localStorage.getItem("sale_delivery_challans_drafts");
        if (draftsStr) {
          const drafts = JSON.parse(draftsStr);
          apiChallans = [...drafts, ...apiChallans];
        }
      } catch (e) {
        console.error("Error loading drafts", e);
      }
      
      if (cRes.status === "fulfilled") setCustomers((cRes.value as any).data || []);
      if (pRes.status === "fulfilled") setProducts((pRes.value as any).data || []);
      setChallans(apiChallans);
    } finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleProductSelect = (idx: number, productId: string) => {
    const p = products.find(x => x.id === productId);
    setItems(prev => prev.map((it, i) =>
      i === idx ? { ...it, productId, description: p?.name || "", unit: p?.unit || "pc" } : it
    ));
  };

  const handleSave = async (status: "DRAFT" | "DISPATCHED") => {
    const isLocalDraft = status === "DRAFT";
    if (!form.customerId && !isLocalDraft) {
      showToast("Please select customer", "error"); return;
    }
    const validItems = items.filter(it => it.description && it.qty > 0);
    if (validItems.length === 0 && !isLocalDraft) {
      showToast("Add at least one line item", "error"); return;
    }

    if (isLocalDraft && !form.customerId && validItems.length === 0) {
      setShowForm(false);
      resetForm();
      return;
    }

    const draftPayload = {
      id: draftId || `draft_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      status: "DRAFT",
      createdAt: new Date().toISOString(),
      challanNo: "DRAFT",
      customerId: form.customerId,
      dispatchDate: form.dispatchDate,
      vehicleNo: form.vehicleNo,
      items: validItems,
      _rawState: {
        form,
        items
      }
    };

    if (isLocalDraft) {
      try {
        const draftsStr = localStorage.getItem("sale_delivery_challans_drafts");
        let drafts = draftsStr ? JSON.parse(draftsStr) : [];
        if (draftId) {
          drafts = drafts.filter((d: any) => d.id !== draftId);
        }
        drafts.unshift(draftPayload);
        localStorage.setItem("sale_delivery_challans_drafts", JSON.stringify(drafts));
        showToast("Draft saved locally", "success");
        fetchData();
        setShowForm(false);
        resetForm();
      } catch (e) {
        console.error("Failed to save draft locally", e);
      }
      return;
    }

    setSaving(true);
    try {
      await api.post("/api/sales/delivery-challans", {
        ...form,
        status,
        items: items.map(it => ({
          productId: it.productId || undefined,
          description: it.description,
          qty: it.qty,
          unit: it.unit,
          remarks: it.remarks,
        })),
      });

      // If we saved a challan that was previously a draft, remove the draft
      if (draftId) {
        try {
          const draftsStr = localStorage.getItem("sale_delivery_challans_drafts");
          if (draftsStr) {
            const drafts = JSON.parse(draftsStr);
            const newDrafts = drafts.filter((d: any) => d.id !== draftId);
            localStorage.setItem("sale_delivery_challans_drafts", JSON.stringify(newDrafts));
          }
        } catch (e) {
          console.error("Failed to clear draft", e);
        }
      }

      showToast(status === "DRAFT" ? "Challan saved as draft" : "Challan dispatched", "success");
      setShowForm(false);
      resetForm();
      fetchData();
    } catch {
      showToast("Failed to save delivery challan", "error");
    } finally { setSaving(false); }
  };

  const resetForm = () => {
    setDraftId(null);
    setForm({
      customerId: "",
      deliveryAddress: "",
      dispatchDate: new Date().toISOString().split("T")[0],
      expectedDelivery: "",
      vehicleNo: "",
      driverName: "",
      transportMode: "ROAD",
      linkedInvoiceNo: "",
      notes: "",
    });
    setItems([{ ...EMPTY_ITEM }]);
  };

  const loadDraft = (draft: any) => {
    setDraftId(draft.id);
    const raw = draft._rawState || {};
    setForm(raw.form || {
      customerId: "",
      deliveryAddress: "",
      dispatchDate: new Date().toISOString().split("T")[0],
      expectedDelivery: "",
      vehicleNo: "",
      driverName: "",
      transportMode: "ROAD",
      linkedInvoiceNo: "",
      notes: "",
    });
    setItems(raw.items && raw.items.length > 0 ? raw.items : [{ ...EMPTY_ITEM }]);
    setShowForm(true);
  };

  const handlePrint = (dc: any) => {
    const customer = customers.find(c => c.id === dc.customerId);
    const win = window.open("", "_blank", "width=900,height=700");
    if (!win) return;
    win.document.write(`<!DOCTYPE html><html><head><title>Delivery Challan ${dc.challanNo || dc.id}</title>
    <style>
      body { font-family: Arial, sans-serif; margin: 0; padding: 24px; color: #111; }
      h1 { font-size: 22px; margin: 0; }
      .header { display: flex; justify-content: space-between; border-bottom: 2px solid #111; padding-bottom: 12px; margin-bottom: 16px; }
      .badge { display: inline-block; padding: 2px 10px; border-radius: 12px; font-size: 11px; font-weight: 700;
               background: #dbeafe; color: #1d4ed8; border: 1px solid #93c5fd; }
      table { width: 100%; border-collapse: collapse; margin: 16px 0; }
      th { background: #f3f4f6; text-align: left; padding: 8px; font-size: 12px; border: 1px solid #d1d5db; }
      td { padding: 8px; font-size: 12px; border: 1px solid #d1d5db; }
      .meta { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 16px; font-size: 13px; }
      .meta-box { background: #f9fafb; padding: 10px; border-radius: 6px; border: 1px solid #e5e7eb; }
      .meta-box strong { display: block; font-size: 11px; color: #6b7280; margin-bottom: 4px; text-transform: uppercase; }
      .footer { margin-top: 40px; display: flex; justify-content: space-between; }
      .sign-box { border-top: 1px solid #111; padding-top: 6px; font-size: 11px; text-align: center; width: 160px; }
      @media print { button { display: none; } }
    </style></head><body>
    <div class="header">
      <div>
        <h1>Delivery Challan</h1>
        <div style="font-size:13px;color:#6b7280;margin-top:4px">
          Challan No: <strong style="color:#111">${dc.challanNo || dc.id?.slice(0, 8).toUpperCase()}</strong>
          &nbsp;&nbsp;|&nbsp;&nbsp;
          <span class="badge">${dc.status}</span>
        </div>
      </div>
      <div style="text-align:right;font-size:13px">
        <strong>Dispatch Date:</strong> ${dc.dispatchDate || ""}<br/>
        ${dc.expectedDelivery ? `<strong>Expected Delivery:</strong> ${dc.expectedDelivery}` : ""}
        ${dc.linkedInvoiceNo ? `<br/><strong>Invoice Ref:</strong> ${dc.linkedInvoiceNo}` : ""}
      </div>
    </div>
    <div class="meta">
      <div class="meta-box">
        <strong>Deliver To</strong>
        ${customer?.name || "—"}<br/>
        ${dc.deliveryAddress || customer?.address || ""}
      </div>
      <div class="meta-box">
        <strong>Transport Details</strong>
        Mode: ${dc.transportMode || "ROAD"}<br/>
        ${dc.vehicleNo ? `Vehicle No: ${dc.vehicleNo}<br/>` : ""}
        ${dc.driverName ? `Driver: ${dc.driverName}` : ""}
      </div>
    </div>
    <table>
      <thead><tr><th>#</th><th>Description</th><th>Qty</th><th>Unit</th><th>Remarks</th></tr></thead>
      <tbody>
        ${(dc.items || []).map((it: any, i: number) =>
          `<tr><td>${i + 1}</td><td>${it.description}</td><td>${it.qty}</td><td>${it.unit}</td><td>${it.remarks || ""}</td></tr>`
        ).join("")}
      </tbody>
    </table>
    ${dc.notes ? `<p style="font-size:12px;color:#374151"><strong>Notes:</strong> ${dc.notes}</p>` : ""}
    <div class="footer">
      <div class="sign-box">Prepared By</div>
      <div class="sign-box">Received By</div>
      <div class="sign-box">Authorized Signatory</div>
    </div>
    <script>window.onload = () => { window.print(); }</script>
    </body></html>`);
    win.document.close();
  };

  const filtered = challans.filter(dc => {
    const customer = customers.find(c => c.id === dc.customerId);
    const matchSearch = !search || (dc.challanNo || "").toLowerCase().includes(search.toLowerCase()) ||
      (customer?.name || "").toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === "ALL" || dc.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const stats = {
    total: challans.length,
    dispatched: challans.filter(d => d.status === "DISPATCHED").length,
    delivered: challans.filter(d => d.status === "DELIVERED").length,
    draft: challans.filter(d => d.status === "DRAFT").length,
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50/30 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-gradient-to-br from-indigo-500 to-violet-600 rounded-2xl shadow-lg">
              <Truck className="h-7 w-7 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-800">Delivery Challan</h1>
              <p className="text-sm text-slate-500">Dispatch & delivery tracking</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={fetchData} className="p-2 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors">
              <RefreshCw className="h-4 w-4" />
            </button>
            <button
              onClick={() => { resetForm(); setShowForm(true); }}
              className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-indigo-600 to-violet-600 text-white rounded-xl font-medium shadow-lg hover:shadow-indigo-200 transition-all text-sm"
            >
              <Plus className="h-4 w-4" /> New Challan
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { label: "Total Challans", value: stats.total, icon: ClipboardList, color: "text-slate-600", bg: "bg-slate-100" },
            { label: "Dispatched",     value: stats.dispatched, icon: Truck,          color: "text-blue-600",  bg: "bg-blue-50" },
            { label: "Delivered",      value: stats.delivered,  icon: CheckCircle2,   color: "text-emerald-600", bg: "bg-emerald-50" },
            { label: "Draft",          value: stats.draft,      icon: FileText,       color: "text-amber-600", bg: "bg-amber-50" },
          ].map(s => (
            <div key={s.label} className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 flex items-center gap-3">
              <div className={clsx("p-2 rounded-xl", s.bg)}>
                <s.icon className={clsx("h-5 w-5", s.color)} />
              </div>
              <div>
                <p className="text-xs text-slate-500">{s.label}</p>
                <p className="text-xl font-bold text-slate-800">{s.value}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Search by challan no. or customer..."
              className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
            />
          </div>
          <div className="flex gap-2 flex-wrap">
            {["ALL", "DRAFT", "DISPATCHED", "DELIVERED", "CANCELLED"].map(s => (
              <button
                key={s}
                onClick={() => setStatusFilter(s)}
                className={clsx("px-3 py-2 rounded-xl text-xs font-medium border transition-all",
                  statusFilter === s
                    ? "bg-indigo-600 text-white border-indigo-600 shadow"
                    : "bg-white text-slate-600 border-slate-200 hover:border-indigo-300"
                )}
              >
                {s === "ALL" ? "All" : STATUS_STYLES[s]?.label || s}
              </button>
            ))}
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          {loading ? (
            <div className="p-12 text-center text-slate-400">
              <RefreshCw className="h-8 w-8 mx-auto animate-spin mb-2" />
              <p className="text-sm">Loading challans...</p>
            </div>
          ) : filtered.length === 0 ? (
            <div className="p-12 text-center text-slate-400">
              <Truck className="h-12 w-12 mx-auto mb-3 opacity-30" />
              <p className="font-medium text-slate-500">No delivery challans found</p>
              <p className="text-sm mt-1">Create your first challan to start dispatching goods</p>
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100">
                  {["Challan No.", "Customer", "Dispatch Date", "Vehicle", "Status", "Items", "Actions"].map(h => (
                    <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filtered.map(dc => {
                  const customer = customers.find(c => c.id === dc.customerId);
                  const st = STATUS_STYLES[dc.status] || STATUS_STYLES.DRAFT;
                  const isDraft = dc.status === "DRAFT";
                  return (
                    <tr 
                      key={dc.id} 
                      className={clsx(
                        "hover:bg-slate-50/60 transition-colors",
                        isDraft ? "hover:bg-yellow-50/50 cursor-pointer font-medium" : ""
                      )}
                      onClick={() => {
                        if (isDraft) loadDraft(dc);
                      }}
                    >
                      <td className="px-4 py-3 font-mono text-xs text-slate-600">
                        {dc.challanNo || dc.id?.slice(0, 8).toUpperCase()}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-full bg-indigo-100 flex items-center justify-center">
                            <User className="h-3.5 w-3.5 text-indigo-600" />
                          </div>
                          <span className="font-medium text-slate-700">{customer?.name || "—"}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-slate-600">{dc.dispatchDate || "—"}</td>
                      <td className="px-4 py-3 text-slate-600">{dc.vehicleNo || "—"}</td>
                      <td className="px-4 py-3">
                        <span className={clsx("inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold border", st.color, st.bg, st.border)}>
                          {st.label}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-slate-600">{(dc.items || []).length} item(s)</td>
                      <td className="px-4 py-3">
                        <button
                          onClick={() => handlePrint(dc)}
                          className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition-colors"
                        >
                          <Printer className="h-3.5 w-3.5" /> Print
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Create Challan Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-start justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl my-6">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Truck className="h-5 w-5 text-indigo-600" />
                <h2 className="text-lg font-semibold text-slate-800">New Delivery Challan</h2>
              </div>
              <button onClick={() => setShowForm(false)} className="p-1.5 hover:bg-slate-100 rounded-lg transition-colors">
                <X className="h-5 w-5 text-slate-500" />
              </button>
            </div>

            <div className="p-6 space-y-5">
              {/* Customer & Address */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5">Customer *</label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <select
                      value={form.customerId}
                      onChange={e => {
                        const c = customers.find(x => x.id === e.target.value);
                        setForm(f => ({ ...f, customerId: e.target.value, deliveryAddress: c?.address || "" }));
                      }}
                      className="w-full pl-9 pr-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none bg-white"
                    >
                      <option value="">Select customer</option>
                      {customers.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5">Linked Invoice No.</label>
                  <div className="relative">
                    <Hash className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <input
                      value={form.linkedInvoiceNo}
                      onChange={e => setForm(f => ({ ...f, linkedInvoiceNo: e.target.value }))}
                      placeholder="INV-2024-001 (optional)"
                      className="w-full pl-9 pr-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5">Delivery Address</label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                  <textarea
                    value={form.deliveryAddress}
                    onChange={e => setForm(f => ({ ...f, deliveryAddress: e.target.value }))}
                    placeholder="Full delivery address..."
                    rows={2}
                    className="w-full pl-9 pr-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none resize-none"
                  />
                </div>
              </div>

              {/* Dates */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5">Dispatch Date *</label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <input
                      type="date"
                      value={form.dispatchDate}
                      onChange={e => setForm(f => ({ ...f, dispatchDate: e.target.value }))}
                      className="w-full pl-9 pr-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5">Expected Delivery</label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <input
                      type="date"
                      value={form.expectedDelivery}
                      onChange={e => setForm(f => ({ ...f, expectedDelivery: e.target.value }))}
                      className="w-full pl-9 pr-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Transport */}
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5">Transport Mode</label>
                  <select
                    value={form.transportMode}
                    onChange={e => setForm(f => ({ ...f, transportMode: e.target.value }))}
                    className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none bg-white"
                  >
                    {["ROAD", "RAIL", "AIR", "SEA", "HAND_DELIVERY"].map(m => (
                      <option key={m} value={m}>{m.replace("_", " ")}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5">Vehicle No.</label>
                  <div className="relative">
                    <Truck className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <input
                      value={form.vehicleNo}
                      onChange={e => setForm(f => ({ ...f, vehicleNo: e.target.value.toUpperCase() }))}
                      placeholder="TN 01 AB 1234"
                      className="w-full pl-9 pr-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5">Driver Name</label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <input
                      value={form.driverName}
                      onChange={e => setForm(f => ({ ...f, driverName: e.target.value }))}
                      placeholder="Driver name"
                      className="w-full pl-9 pr-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Line Items */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-semibold text-slate-600">Items *</label>
                  <button
                    onClick={() => setItems(prev => [...prev, { ...EMPTY_ITEM }])}
                    className="flex items-center gap-1 text-xs text-indigo-600 hover:text-indigo-700 font-medium"
                  >
                    <Plus className="h-3.5 w-3.5" /> Add Row
                  </button>
                </div>
                <div className="border border-slate-200 rounded-xl overflow-hidden">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-200">
                        <th className="text-left px-3 py-2.5 text-xs font-semibold text-slate-500 w-8">#</th>
                        <th className="text-left px-3 py-2.5 text-xs font-semibold text-slate-500">Product / Description</th>
                        <th className="text-left px-3 py-2.5 text-xs font-semibold text-slate-500 w-20">Qty</th>
                        <th className="text-left px-3 py-2.5 text-xs font-semibold text-slate-500 w-20">Unit</th>
                        <th className="text-left px-3 py-2.5 text-xs font-semibold text-slate-500">Remarks</th>
                        <th className="w-8"></th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {items.map((it, idx) => (
                        <tr key={idx}>
                          <td className="px-3 py-2 text-slate-400 text-xs">{idx + 1}</td>
                          <td className="px-3 py-2">
                            <select
                              value={it.productId}
                              onChange={e => handleProductSelect(idx, e.target.value)}
                              className="w-full px-2 py-1.5 border border-slate-200 rounded-lg text-xs focus:ring-2 focus:ring-indigo-500 outline-none bg-white mb-1"
                            >
                              <option value="">Select product</option>
                              {products.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                            </select>
                            <input
                              value={it.description}
                              onChange={e => setItems(prev => prev.map((x, i) => i === idx ? { ...x, description: e.target.value } : x))}
                              placeholder="Or type description..."
                              className="w-full px-2 py-1.5 border border-slate-200 rounded-lg text-xs focus:ring-2 focus:ring-indigo-500 outline-none"
                            />
                          </td>
                          <td className="px-3 py-2">
                            <input
                              type="number" min={1} value={it.qty}
                              onChange={e => setItems(prev => prev.map((x, i) => i === idx ? { ...x, qty: Number(e.target.value) } : x))}
                              className="w-full px-2 py-1.5 border border-slate-200 rounded-lg text-xs focus:ring-2 focus:ring-indigo-500 outline-none text-center"
                            />
                          </td>
                          <td className="px-3 py-2">
                            <select
                              value={it.unit}
                              onChange={e => setItems(prev => prev.map((x, i) => i === idx ? { ...x, unit: e.target.value } : x))}
                              className="w-full px-2 py-1.5 border border-slate-200 rounded-lg text-xs focus:ring-2 focus:ring-indigo-500 outline-none bg-white"
                            >
                              {["pc", "kg", "g", "L", "mL", "box", "ctn", "set"].map(u => <option key={u}>{u}</option>)}
                            </select>
                          </td>
                          <td className="px-3 py-2">
                            <input
                              value={it.remarks}
                              onChange={e => setItems(prev => prev.map((x, i) => i === idx ? { ...x, remarks: e.target.value } : x))}
                              placeholder="e.g. Handle with care"
                              className="w-full px-2 py-1.5 border border-slate-200 rounded-lg text-xs focus:ring-2 focus:ring-indigo-500 outline-none"
                            />
                          </td>
                          <td className="px-3 py-2">
                            {items.length > 1 && (
                              <button
                                onClick={() => setItems(prev => prev.filter((_, i) => i !== idx))}
                                className="text-slate-300 hover:text-rose-400 transition-colors"
                              >
                                <X className="h-4 w-4" />
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Notes */}
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5">Notes / Instructions</label>
                <textarea
                  value={form.notes}
                  onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
                  placeholder="Special delivery instructions, handling notes..."
                  rows={2}
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none resize-none"
                />
              </div>

              {/* Flow Banner */}
              <div className="bg-indigo-50 border border-indigo-100 rounded-xl px-4 py-3 flex items-center gap-3 text-sm text-indigo-700">
                <FileText className="h-4 w-4 shrink-0" />
                <span className="font-medium">Estimation</span>
                <ArrowRight className="h-4 w-4 opacity-50" />
                <span className="font-medium">Invoice</span>
                <ArrowRight className="h-4 w-4 opacity-50" />
                <span className="font-semibold text-indigo-800 underline underline-offset-2">Delivery Challan</span>
                <span className="ml-auto text-xs text-indigo-500">Link this challan to an invoice above</span>
              </div>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between px-6 py-4 border-t border-slate-100 bg-slate-50/60 rounded-b-2xl">
              <button
                onClick={() => setShowForm(false)}
                className="px-4 py-2 text-sm text-slate-600 hover:text-slate-800 transition-colors"
              >
                Cancel
              </button>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleSave("DRAFT")}
                  disabled={saving}
                  className="px-4 py-2.5 text-sm font-medium border border-slate-200 text-slate-700 bg-white hover:bg-slate-50 rounded-xl transition-colors disabled:opacity-50"
                >
                  Save as Draft
                </button>
                <button
                  onClick={() => handleSave("DISPATCHED")}
                  disabled={saving}
                  className="flex items-center gap-2 px-5 py-2.5 text-sm font-semibold bg-gradient-to-r from-indigo-600 to-violet-600 text-white rounded-xl shadow-lg hover:shadow-indigo-200 transition-all disabled:opacity-50"
                >
                  <Truck className="h-4 w-4" />
                  {saving ? "Dispatching..." : "Dispatch Now"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
