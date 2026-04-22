"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Send, Clock, CheckCircle2, XCircle, Package, Plus,
  X, ChevronDown, RefreshCw, Building2, Trash2, PackageCheck,
} from "lucide-react";
import { clsx } from "clsx";
import {
  franchiseProductRequestsApi,
  productsFullApi,
  franchiseManagementApi,
} from "@/lib/api";
import { useAuth } from "@/context/AuthContext";

type ReqStatus = "PENDING" | "APPROVED" | "REJECTED" | "FULFILLED";

const STATUS_STYLES: Record<ReqStatus, string> = {
  PENDING:   "bg-amber-100 text-amber-700 dark:bg-amber-900/20 dark:text-amber-400",
  APPROVED:  "bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400",
  REJECTED:  "bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-400",
  FULFILLED: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400",
};

interface RequestProduct {
  productId: string;
  productName: string;
  quantity: number;
  unit: string;
}

export default function FranchiseRequestsPage() {
  const { user } = useAuth();
  const isAdmin = ["SUPER_ADMIN", "ADMIN", "MANAGER"].includes((user?.role as any)?.name ?? user?.role ?? "");

  const [requests, setRequests]     = useState<any[]>([]);
  const [products, setProducts]     = useState<any[]>([]);
  const [franchises, setFranchises] = useState<any[]>([]);
  const [loading, setLoading]       = useState(true);
  const [filter, setFilter]         = useState<"ALL" | ReqStatus>("ALL");
  const [showForm, setShowForm]     = useState(false);
  const [saving, setSaving]         = useState(false);
  const [responseModal, setResponseModal] = useState<{ id: string; action: "APPROVED" | "REJECTED" } | null>(null);
  const [adminNote, setAdminNote]   = useState("");

  // New request form
  const [franchiseId, setFranchiseId] = useState(user?.franchiseId ?? "");
  const [items, setItems] = useState<RequestProduct[]>([
    { productId: "", productName: "", quantity: 1, unit: "kg" },
  ]);

  const fetchAll = useCallback(async () => {
    setLoading(true);
    try {
      const [rRes, pRes] = await Promise.all([
        franchiseProductRequestsApi.getAll(),
        productsFullApi.getAll(),
      ]);
      setRequests(rRes.data ?? []);
      setProducts(pRes.data ?? []);

      if (isAdmin) {
        const fRes = await franchiseManagementApi.getAll();
        setFranchises(fRes.data ?? []);
      }
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }, [isAdmin]);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const addItem = () =>
    setItems((prev) => [...prev, { productId: "", productName: "", quantity: 1, unit: "kg" }]);

  const removeItem = (i: number) =>
    setItems((prev) => prev.filter((_, idx) => idx !== i));

  const updateItem = (i: number, field: keyof RequestProduct, value: any) =>
    setItems((prev) => prev.map((it, idx) => {
      if (idx !== i) return it;
      if (field === "productId") {
        const prod = products.find((p: any) => p.id === value);
        return { ...it, productId: value, productName: prod?.name ?? "", unit: "kg" };
      }
      return { ...it, [field]: value };
    }));

  const handleCreate = async () => {
    const fid = franchiseId || user?.franchiseId;
    if (!fid || items.some((it) => !it.productId || it.quantity <= 0)) return;
    setSaving(true);
    try {
      await franchiseProductRequestsApi.create({
        franchiseId: fid,
        products: items.map(({ productId, productName, quantity, unit }) => ({
          productId, productName, quantity, unit,
        })),
      });
      setShowForm(false);
      setItems([{ productId: "", productName: "", quantity: 1, unit: "kg" }]);
      fetchAll();
    } catch (e) { console.error(e); }
    finally { setSaving(false); }
  };

  const handleFulfill = async (id: string) => {
    try {
      await franchiseProductRequestsApi.update(id, { status: "FULFILLED" });
      fetchAll();
    } catch (e) { console.error(e); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this request?")) return;
    try {
      await franchiseProductRequestsApi.delete(id);
      fetchAll();
    } catch (e: any) {
      alert(e?.response?.data?.error ?? "Failed to delete request");
    }
  };

  const handleRespond = async () => {
    if (!responseModal) return;
    try {
      await franchiseProductRequestsApi.update(responseModal.id, {
        status: responseModal.action,
        adminResponse: adminNote,
      });
      setResponseModal(null);
      setAdminNote("");
      fetchAll();
    } catch (e) { console.error(e); }
  };

  const filtered = filter === "ALL" ? requests : requests.filter((r) => r.status === filter);
  const pendingCount = requests.filter((r) => r.status === "PENDING").length;

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-gray-900 dark:text-white flex items-center gap-2">
            <Send size={22} className="text-orange-500" />
            {isAdmin ? "Franchise Product Requests" : "Request Products from Home House"}
          </h1>
          <p className="text-sm text-gray-500 dark:text-slate-400 mt-1">
            {isAdmin
              ? "Review and approve product requests from franchise branches"
              : "Request finished products from the home house production unit"}
          </p>
        </div>
        <div className="flex gap-2">
          <button onClick={fetchAll} className="p-2 rounded-xl border border-gray-200 dark:border-white/10 hover:bg-gray-50 dark:hover:bg-white/5 transition-all">
            <RefreshCw size={16} className="text-gray-400" />
          </button>
          <button
            onClick={() => setShowForm(true)}
            className="flex items-center gap-2 bg-orange-500 hover:bg-orange-400 text-white px-4 py-2 rounded-xl text-sm font-bold transition-all"
          >
            <Plus size={16} /> New Request
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {(["ALL", "PENDING", "APPROVED", "FULFILLED"] as const).map((s) => (
          <div key={s} className="bg-white dark:bg-card rounded-2xl border border-gray-100 dark:border-white/5 p-4">
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
              {s === "ALL" ? "Total" : s}
            </p>
            <p className="text-2xl font-black text-gray-900 dark:text-white mt-1">
              {s === "ALL" ? requests.length : requests.filter((r) => r.status === s).length}
            </p>
          </div>
        ))}
      </div>

      {/* Pending alert */}
      {isAdmin && pendingCount > 0 && (
        <div className="flex items-center gap-2 px-4 py-3 bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-800/30 rounded-2xl">
          <div className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
          <span className="text-sm font-bold text-amber-600 dark:text-amber-400">
            {pendingCount} request{pendingCount > 1 ? "s" : ""} pending your approval
          </span>
        </div>
      )}

      {/* Filter tabs */}
      <div className="flex items-center gap-2 flex-wrap bg-white dark:bg-card rounded-2xl border border-gray-100 dark:border-white/5 p-3">
        {(["ALL", "PENDING", "APPROVED", "REJECTED", "FULFILLED"] as const).map((s) => (
          <button key={s} onClick={() => setFilter(s)}
            className={clsx("px-3 py-1.5 rounded-xl text-[11px] font-bold capitalize transition-all",
              filter === s ? "bg-orange-500 text-white" : "bg-gray-100 dark:bg-white/5 text-gray-500 hover:bg-orange-50 hover:text-orange-600")}>
            {s === "ALL" ? "All" : s.charAt(0) + s.slice(1).toLowerCase()}
          </button>
        ))}
      </div>

      {/* Request List */}
      {loading ? (
        <div className="py-20 text-center text-gray-400 text-sm">Loading requests...</div>
      ) : filtered.length === 0 ? (
        <div className="py-20 text-center text-gray-300 dark:text-slate-600 space-y-2">
          <CheckCircle2 size={48} strokeWidth={1} className="mx-auto" />
          <p className="text-sm font-semibold">No requests found</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((req) => {
            const prods: RequestProduct[] = (req.details as any)?.products ?? [];
            return (
              <div key={req.id} className="bg-white dark:bg-card rounded-2xl border border-gray-100 dark:border-white/5 p-5 hover:shadow-sm transition-all">
                <div className="flex items-start justify-between gap-4 flex-wrap">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-xl bg-orange-50 dark:bg-orange-900/20 flex items-center justify-center shrink-0">
                      <Building2 size={18} className="text-orange-500" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-gray-900 dark:text-white">{req.franchise?.name ?? "Unknown Franchise"}</h3>
                      <p className="text-[11px] text-gray-400 mt-0.5 flex items-center gap-1">
                        <Clock size={10} />
                        REQ-{req.id?.slice(0, 8).toUpperCase()} · {new Date(req.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                      </p>
                    </div>
                  </div>
                  <span className={clsx("px-3 py-1 rounded-xl text-[10px] font-black uppercase tracking-wider shrink-0", STATUS_STYLES[req.status as ReqStatus] ?? STATUS_STYLES.PENDING)}>
                    {req.status}
                  </span>
                </div>

                {/* Products requested */}
                {prods.length > 0 && (
                  <div className="mt-4 space-y-1.5">
                    {prods.map((item, i) => (
                      <div key={i} className="flex items-center justify-between text-[12px] bg-gray-50 dark:bg-white/5 rounded-lg px-3 py-2">
                        <div className="flex items-center gap-2">
                          <Package size={11} className="text-gray-400" />
                          <span className="font-medium text-gray-700 dark:text-slate-300">{item.productName}</span>
                        </div>
                        <span className="font-bold text-gray-900 dark:text-white">{item.quantity} {item.unit}</span>
                      </div>
                    ))}
                  </div>
                )}

                {/* Admin response */}
                {req.adminResponse && (
                  <div className="mt-3 px-3 py-2 bg-blue-50 dark:bg-blue-900/10 rounded-xl text-[11px] text-blue-700 dark:text-blue-400">
                    Admin note: {req.adminResponse}
                  </div>
                )}

                {/* Actions */}
                {isAdmin && (
                  <div className="mt-4 flex gap-2 flex-wrap">
                    {req.status === "PENDING" && (
                      <>
                        <button
                          onClick={() => { setResponseModal({ id: req.id, action: "APPROVED" }); setAdminNote(""); }}
                          className="flex items-center gap-1.5 px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-white rounded-xl text-[12px] font-bold transition-all"
                        >
                          <CheckCircle2 size={13} /> Approve
                        </button>
                        <button
                          onClick={() => { setResponseModal({ id: req.id, action: "REJECTED" }); setAdminNote(""); }}
                          className="flex items-center gap-1.5 px-4 py-2 border border-red-200 dark:border-red-800/30 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10 rounded-xl text-[12px] font-bold transition-all"
                        >
                          <XCircle size={13} /> Reject
                        </button>
                      </>
                    )}
                    {req.status === "APPROVED" && (
                      <button
                        onClick={() => handleFulfill(req.id)}
                        className="flex items-center gap-1.5 px-4 py-2 bg-blue-500 hover:bg-blue-400 text-white rounded-xl text-[12px] font-bold transition-all"
                      >
                        <PackageCheck size={13} /> Mark Fulfilled
                      </button>
                    )}
                    {(req.status === "REJECTED" || req.status === "PENDING") && (
                      <button
                        onClick={() => handleDelete(req.id)}
                        className="flex items-center gap-1.5 px-3 py-2 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10 rounded-xl text-[12px] font-bold transition-all ml-auto"
                      >
                        <Trash2 size={13} />
                      </button>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* New Request Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-[#12141c] rounded-3xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-100 dark:border-white/5 flex items-center justify-between">
              <h2 className="text-lg font-black text-gray-900 dark:text-white">New Product Request</h2>
              <button onClick={() => setShowForm(false)} className="p-1.5 hover:bg-gray-100 dark:hover:bg-white/10 rounded-lg"><X size={18} className="text-gray-500" /></button>
            </div>
            <div className="p-6 space-y-5">
              {/* Franchise selector (admin) */}
              {isAdmin && (
                <div>
                  <label className="block text-xs font-bold text-gray-600 dark:text-slate-400 mb-1.5">Franchise *</label>
                  <div className="relative">
                    <select value={franchiseId} onChange={(e) => setFranchiseId(e.target.value)}
                      className="w-full appearance-none bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl px-4 py-2.5 pr-9 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/20">
                      <option value="">Select franchise...</option>
                      {franchises.map((f: any) => <option key={f.id} value={f.id}>{f.name}</option>)}
                    </select>
                    <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                  </div>
                </div>
              )}

              {/* Products */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-bold text-gray-600 dark:text-slate-400">Products Requested *</label>
                  <button onClick={addItem} className="flex items-center gap-1 text-[11px] font-bold text-orange-500 hover:text-orange-400">
                    <Plus size={12} /> Add Product
                  </button>
                </div>
                <div className="space-y-2">
                  {items.map((item, i) => (
                    <div key={i} className="grid grid-cols-12 gap-2 items-center">
                      <div className="col-span-6">
                        <select value={item.productId} onChange={(e) => updateItem(i, "productId", e.target.value)}
                          className="w-full appearance-none bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl px-3 py-2 text-[12px] focus:outline-none focus:ring-2 focus:ring-orange-500/20">
                          <option value="">Select product...</option>
                          {products.map((p: any) => (
                            <option key={p.id} value={p.id}>{p.name}</option>
                          ))}
                        </select>
                      </div>
                      <div className="col-span-3">
                        <input type="number" min={1} placeholder="Qty" value={item.quantity}
                          onChange={(e) => updateItem(i, "quantity", Number(e.target.value))}
                          className="w-full bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl px-3 py-2 text-[12px] focus:outline-none focus:ring-2 focus:ring-orange-500/20" />
                      </div>
                      <div className="col-span-2">
                        <select value={item.unit} onChange={(e) => updateItem(i, "unit", e.target.value)}
                          className="w-full bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl px-2 py-2 text-[11px] focus:outline-none">
                          {["kg", "g", "litre", "pc", "box"].map((u) => <option key={u}>{u}</option>)}
                        </select>
                      </div>
                      <div className="col-span-1 flex justify-end">
                        {items.length > 1 && (
                          <button onClick={() => removeItem(i)} className="text-red-400 hover:text-red-500"><X size={14} /></button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Preview */}
              {items.some((it) => it.productId) && (
                <div className="bg-orange-50 dark:bg-orange-900/10 border border-orange-200 dark:border-orange-800/30 rounded-2xl p-4">
                  <p className="text-[10px] font-black text-orange-600 uppercase tracking-widest mb-2">Request Summary</p>
                  {items.filter((it) => it.productId).map((it, i) => {
                    const prod = products.find((p: any) => p.id === it.productId);
                    return (
                      <p key={i} className="text-sm text-gray-700 dark:text-slate-300">
                        {it.quantity} {it.unit} × <strong>{it.productName || prod?.name}</strong>
                        {prod?.basePrice ? <span className="text-gray-400"> = ₹{(prod.basePrice * it.quantity).toLocaleString("en-IN")}</span> : null}
                      </p>
                    );
                  })}
                </div>
              )}
            </div>
            <div className="p-6 pt-0 flex gap-3 justify-end">
              <button onClick={() => setShowForm(false)} className="px-5 py-2.5 rounded-xl border border-gray-200 dark:border-white/10 text-sm font-bold text-gray-600 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-white/5 transition-all">Cancel</button>
              <button onClick={handleCreate} disabled={saving || items.every((it) => !it.productId)}
                className="px-6 py-2.5 bg-orange-500 hover:bg-orange-400 disabled:opacity-50 text-white rounded-xl text-sm font-bold transition-all">
                {saving ? "Submitting..." : "Submit Request"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Approve / Reject Modal */}
      {responseModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-[#12141c] rounded-3xl shadow-2xl w-full max-w-sm p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className={clsx("text-base font-black", responseModal.action === "APPROVED" ? "text-emerald-600" : "text-red-500")}>
                {responseModal.action === "APPROVED" ? "Approve Request" : "Reject Request"}
              </h2>
              <button onClick={() => setResponseModal(null)} className="p-1.5 hover:bg-gray-100 dark:hover:bg-white/10 rounded-lg"><X size={16} className="text-gray-400" /></button>
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-600 dark:text-slate-400 mb-1.5">Admin Note (optional)</label>
              <textarea value={adminNote} onChange={(e) => setAdminNote(e.target.value)} rows={3} placeholder="Add a note for the franchise..."
                className="w-full px-3 py-2.5 text-sm bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500/20 resize-none" />
            </div>
            <div className="flex gap-3 justify-end">
              <button onClick={() => setResponseModal(null)} className="px-4 py-2 rounded-xl border border-gray-200 dark:border-white/10 text-sm font-bold text-gray-600 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-white/5">Cancel</button>
              <button onClick={handleRespond}
                className={clsx("px-5 py-2 text-white rounded-xl text-sm font-bold transition-all", responseModal.action === "APPROVED" ? "bg-emerald-500 hover:bg-emerald-400" : "bg-red-500 hover:bg-red-400")}>
                Confirm {responseModal.action === "APPROVED" ? "Approval" : "Rejection"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
