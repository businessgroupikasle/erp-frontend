"use client";

import { useState, useEffect, useCallback } from "react";
import {
  ShoppingCart, Plus, X, CheckCircle2, Clock, Truck,
  Store, Package, IndianRupee, Search, ChevronDown,
  Wallet, AlertCircle, RefreshCw, Ban, Trash2,
} from "lucide-react";
import { clsx } from "clsx";
import { purchaseOrdersApi, vendorsApi, rawMaterialsApi } from "@/lib/api";

const STATUS_STYLES: Record<string, string> = {
  PENDING:   "bg-amber-100 text-amber-700 dark:bg-amber-900/20 dark:text-amber-400",
  APPROVED:  "bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400",
  RECEIVED:  "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400",
  CANCELLED: "bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-400",
};

const STATUS_ICONS: Record<string, any> = {
  PENDING:   Clock,
  APPROVED:  CheckCircle2,
  RECEIVED:  Truck,
  CANCELLED: X,
};

function fmt(n: number) {
  return "₹" + n.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

interface POItem {
  inventoryItemId: string;
  itemName: string;
  unit: string;
  quantity: number;
  price: number;
}

export default function PurchaseOrdersPage() {
  const [orders, setOrders]       = useState<any[]>([]);
  const [vendors, setVendors]     = useState<any[]>([]);
  const [materials, setMaterials] = useState<any[]>([]);
  const [loading, setLoading]     = useState(true);
  const [showForm, setShowForm]   = useState(false);
  const [search, setSearch]       = useState("");

  const [vendorId, setVendorId]         = useState("");
  const [expectedDate, setExpectedDate] = useState("");
  const [notes, setNotes]               = useState("");
  const [items, setItems]               = useState<POItem[]>([
    { inventoryItemId: "", itemName: "", unit: "kg", quantity: 1, price: 0 },
  ]);
  const [saving, setSaving] = useState(false);

  // Quick Add Material State
  const [showMaterialForm, setShowMaterialForm] = useState(false);
  const [newMat, setNewMat] = useState({ name: "", unit: "kg" });
  const [matSaving, setMatSaving] = useState(false);

  const fetchAll = useCallback(async () => {
    setLoading(true);
    try {
      const [poRes, vRes, rmRes] = await Promise.all([
        purchaseOrdersApi.getAll(),
        vendorsApi.getAll(),
        rawMaterialsApi.getAll(),
      ]);
      setOrders(poRes.data ?? []);
      setVendors(vRes.data ?? []);
      setMaterials(rmRes.data ?? []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const addItem = () =>
    setItems((prev) => [...prev, { inventoryItemId: "", itemName: "", unit: "kg", quantity: 1, price: 0 }]);

  const removeItem = (i: number) =>
    setItems((prev) => prev.filter((_, idx) => idx !== i));

  const updateItem = (i: number, field: keyof POItem, value: any) =>
    setItems((prev) => prev.map((it, idx) => {
      if (idx !== i) return it;
      if (field === "inventoryItemId") {
        const mat = materials.find((m: any) => m.id === value);
        // Auto-fill price from vendor's linked material rate (if available)
        const vendorRate = selectedVendor?.suppliedMaterials?.find(
          (sm: any) => sm.materialId === value
        )?.price ?? 0;
        return {
          ...it,
          inventoryItemId: value,
          itemName: mat?.name ?? "",
          unit: mat?.unit ?? "kg",
          price: vendorRate > 0 ? vendorRate : it.price,
        };
      }
      return { ...it, [field]: value };
    }));

  const total = items.reduce((s, it) => s + it.quantity * it.price, 0);

  // Auto-advance: pull the selected vendor's ledger balance and apply it to this PO
  const selectedVendor = vendors.find((v: any) => v.id === vendorId);
  const availableAdvance = Math.max(0, selectedVendor?.balance ?? 0);
  const autoApplied = Math.min(availableAdvance, total);
  const balanceDue = Math.max(0, total - autoApplied);

  const handleCreate = async () => {
    if (!vendorId || items.some((it) => !it.inventoryItemId || it.quantity <= 0 || it.price <= 0)) return;
    setSaving(true);
    try {
      await purchaseOrdersApi.create({
        vendorId,
        advancePaid: autoApplied,   // auto-applied from vendor ledger balance
        expectedDeliveryDate: expectedDate,
        notes,
        items: items.map(({ inventoryItemId, quantity, price }) => ({ inventoryItemId, quantity, price })),
      });
      setShowForm(false);
      setVendorId(""); setExpectedDate(""); setNotes("");
      setItems([{ inventoryItemId: "", itemName: "", unit: "kg", quantity: 1, price: 0 }]);
      fetchAll();
    } catch (e: any) { 
      console.error(e);
      const serverError = e?.response?.data?.error;
      alert(serverError || "Failed to create Purchase Order. Please check the information and try again.");
    }
    finally { setSaving(false); }
  };

  const handleQuickAddMaterial = async () => {
    if (!newMat.name) return;
    setMatSaving(true);
    try {
      const res = await rawMaterialsApi.create({ 
        ...newMat, 
        sku: "RM-" + Math.random().toString(36).substring(2, 8).toUpperCase()
      });
      setMaterials(prev => [...prev, res.data]);
      setShowMaterialForm(false);
      setNewMat({ name: "", unit: "kg" });

      // Automatically select this material in the last empty row or add a new row
      setItems((prev) => {
        const lastIdx = prev.length - 1;
        const lastItem = prev[lastIdx];
        const newItem = { 
          inventoryItemId: res.data.id, 
          itemName: res.data.name, 
          unit: res.data.unit, 
          quantity: 1, 
          price: 0 
        };

        if (!lastItem.inventoryItemId) {
          const next = [...prev];
          next[lastIdx] = newItem;
          return next;
        }
        return [...prev, newItem];
      });

    } catch (e: any) { 
      console.error("Material creation failed:", e);
      const msg = e.response?.data?.error || e.message || "Unknown error";
      alert("Failed to add material: " + msg);
    }
    finally { setMatSaving(false); }
  };

  const handleReceive = async (id: string) => {
    try {
      await purchaseOrdersApi.receive(id);
      fetchAll();
    } catch (e) { console.error(e); }
  };

  const handleCancel = async (id: string) => {
    if (!confirm("Cancel this purchase order?")) return;
    try {
      await purchaseOrdersApi.cancel(id);
      fetchAll();
    } catch (e: any) {
      alert(e?.response?.data?.error ?? "Failed to cancel PO");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this purchase order? This cannot be undone.")) return;
    try {
      await purchaseOrdersApi.delete(id);
      fetchAll();
    } catch (e: any) {
      alert(e?.response?.data?.error ?? "Failed to delete PO");
    }
  };


  const filtered = orders.filter((o) =>
    !search ||
    o.vendor?.name?.toLowerCase().includes(search.toLowerCase()) ||
    o.id?.toLowerCase().includes(search.toLowerCase())
  );

  const totalSpend   = orders.reduce((s, o) => s + (o.totalAmount ?? 0), 0);
  const totalAdvance = orders.reduce((s, o) => s + (o.advancePaid ?? 0), 0);
  const totalBalance = totalSpend - totalAdvance;
  const pendingCount = orders.filter((o) => o.status === "PENDING").length;

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-gray-900 dark:text-white flex items-center gap-2">
            <ShoppingCart size={22} className="text-orange-500" />
            Purchase Orders
          </h1>
          <p className="text-sm text-gray-500 dark:text-slate-400 mt-1">
            Buy raw materials from vendors — track advance payments and balance due
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={fetchAll}
            className="p-2 rounded-xl border border-gray-200 dark:border-white/10 hover:bg-gray-50 dark:hover:bg-white/5 transition-all"
          >
            <RefreshCw size={16} className="text-gray-400" />
          </button>
          <button
            onClick={() => setShowForm(true)}
            className="flex items-center gap-2 bg-orange-500 hover:bg-orange-400 text-white px-4 py-2 rounded-xl text-sm font-bold transition-all"
          >
            <Plus size={16} /> New Purchase Order
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Total Spend",    value: fmt(totalSpend),   icon: ShoppingCart, color: "text-indigo-500",  bg: "bg-indigo-50 dark:bg-indigo-500/10" },
          { label: "Advance Paid",   value: fmt(totalAdvance), icon: Wallet,        color: "text-emerald-500", bg: "bg-emerald-50 dark:bg-emerald-500/10" },
          { label: "Balance Due",    value: fmt(totalBalance), icon: AlertCircle,   color: "text-red-500",     bg: "bg-red-50 dark:bg-red-500/10" },
          { label: "Pending Orders", value: String(pendingCount), icon: Clock,     color: "text-amber-500",   bg: "bg-amber-50 dark:bg-amber-500/10" },
        ].map((card) => (
          <div key={card.label} className="bg-white dark:bg-card rounded-2xl border border-gray-100 dark:border-white/5 p-4 flex items-center gap-3">
            <div className={clsx("w-10 h-10 rounded-xl flex items-center justify-center shrink-0", card.bg)}>
              <card.icon size={18} className={card.color} />
            </div>
            <div>
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{card.label}</p>
              <p className="text-lg font-black text-gray-900 dark:text-white">{card.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Search */}
      <div className="relative">
        <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by vendor or order ID..."
          className="w-full pl-9 pr-4 py-2.5 text-sm bg-white dark:bg-card border border-gray-200 dark:border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500/20"
        />
      </div>

      {/* Orders List */}
      {loading ? (
        <div className="py-20 text-center text-gray-400 text-sm">Loading purchase orders...</div>
      ) : filtered.length === 0 ? (
        <div className="py-20 text-center text-gray-300 dark:text-slate-600 space-y-2">
          <ShoppingCart size={48} strokeWidth={1} className="mx-auto" />
          <p className="text-sm font-semibold">No purchase orders yet</p>
          <p className="text-xs">Create your first PO to start buying raw materials from vendors.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((po) => {
            const balance = (po.totalAmount ?? 0) - (po.advancePaid ?? 0);
            const StatusIcon = STATUS_ICONS[po.status] ?? Clock;
            return (
              <div key={po.id} className="bg-white dark:bg-card rounded-2xl border border-gray-100 dark:border-white/5 p-5">
                {/* PO Header */}
                <div className="flex items-start justify-between gap-4 flex-wrap">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-orange-50 dark:bg-orange-900/20 flex items-center justify-center shrink-0">
                      <Store size={18} className="text-orange-500" />
                    </div>
                    <div>
                      <p className="font-bold text-gray-900 dark:text-white text-sm">{po.vendor?.name ?? "Unknown Vendor"}</p>
                      <p className="text-[11px] text-gray-400 mt-0.5">PO-{po.id?.slice(0, 8).toUpperCase()} · {new Date(po.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</p>
                    </div>
                  </div>
                  <span className={clsx("flex items-center gap-1 px-3 py-1 rounded-xl text-[10px] font-black uppercase tracking-wider", STATUS_STYLES[po.status] ?? STATUS_STYLES.PENDING)}>
                    <StatusIcon size={11} />
                    {po.status}
                  </span>
                </div>

                {/* Items */}
                {po.poItems?.length > 0 && (
                  <div className="mt-4 space-y-1.5">
                    {po.poItems.map((item: any, i: number) => (
                      <div key={i} className="flex items-center justify-between text-[12px] bg-gray-50 dark:bg-white/5 rounded-lg px-3 py-2">
                        <div className="flex items-center gap-2">
                          <Package size={12} className="text-gray-400" />
                          <span className="font-medium text-gray-700 dark:text-slate-300">
                            {item.inventoryItem?.name ?? item.inventoryItemId}
                          </span>
                          <span className="text-gray-400">{item.quantity} {item.inventoryItem?.unit ?? "kg"}</span>
                        </div>
                        <span className="font-bold text-gray-900 dark:text-white">{fmt(item.quantity * item.price)}</span>
                      </div>
                    ))}
                  </div>
                )}

                {/* Financial Summary */}
                <div className="mt-4 grid grid-cols-3 gap-3">
                  <div className="bg-gray-50 dark:bg-white/5 rounded-xl p-3 text-center">
                    <p className="text-[10px] text-gray-400 uppercase font-bold tracking-wider">Total</p>
                    <p className="text-sm font-black text-gray-900 dark:text-white mt-1">{fmt(po.totalAmount ?? 0)}</p>
                  </div>
                  <div className="bg-emerald-50 dark:bg-emerald-500/10 rounded-xl p-3 text-center">
                    <p className="text-[10px] text-emerald-600 uppercase font-bold tracking-wider">Advance Paid</p>
                    <p className="text-sm font-black text-emerald-700 dark:text-emerald-400 mt-1">{fmt(po.advancePaid ?? 0)}</p>
                  </div>
                  <div className={clsx("rounded-xl p-3 text-center", balance > 0 ? "bg-red-50 dark:bg-red-500/10" : "bg-gray-50 dark:bg-white/5")}>
                    <p className={clsx("text-[10px] uppercase font-bold tracking-wider", balance > 0 ? "text-red-500" : "text-gray-400")}>Balance Due</p>
                    <p className={clsx("text-sm font-black mt-1", balance > 0 ? "text-red-600 dark:text-red-400" : "text-gray-500")}>{fmt(balance)}</p>
                  </div>
                </div>

                {/* Actions */}
                <div className="mt-4 flex gap-2 flex-wrap">
                  {po.status === "PENDING" && (
                    <>
                      <button
                        onClick={() => handleReceive(po.id)}
                        className="flex items-center gap-1.5 px-4 py-2 bg-orange-500 hover:bg-orange-400 text-white rounded-xl text-[12px] font-bold transition-all"
                      >
                        <Truck size={13} /> Mark Received (GRN)
                      </button>
                      <button
                        onClick={() => handleCancel(po.id)}
                        className="flex items-center gap-1.5 px-4 py-2 bg-gray-100 dark:bg-white/5 hover:bg-red-50 dark:hover:bg-red-900/10 text-gray-600 dark:text-slate-300 hover:text-red-600 rounded-xl text-[12px] font-bold transition-all"
                      >
                        <Ban size={13} /> Cancel
                      </button>
                    </>
                  )}
                  {(po.status === "PENDING" || po.status === "CANCELLED") && (
                    <button
                      onClick={() => handleDelete(po.id)}
                      className="flex items-center gap-1.5 px-4 py-2 bg-gray-100 dark:bg-white/5 hover:bg-red-50 dark:hover:bg-red-900/10 text-gray-400 hover:text-red-500 rounded-xl text-[12px] font-bold transition-all ml-auto"
                    >
                      <Trash2 size={13} /> Delete
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ── New PO Modal ── */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-[#12141c] rounded-3xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-100 dark:border-white/5 flex items-center justify-between">
              <h2 className="text-lg font-black text-gray-900 dark:text-white">New Purchase Order</h2>
              <button onClick={() => setShowForm(false)} className="p-1.5 hover:bg-gray-100 dark:hover:bg-white/10 rounded-lg transition-all">
                <X size={18} className="text-gray-500" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Section 1: Vendor & Delivery */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-1.5">Vendor *</label>
                  <div className="relative">
                    <select
                      value={vendorId}
                      onChange={(e) => setVendorId(e.target.value)}
                      className="w-full appearance-none bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl px-4 py-2.5 pr-9 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/20 font-bold"
                    >
                      <option value="">Select vendor...</option>
                      {vendors.map((v: any) => (
                        <option key={v.id} value={v.id}>{v.name}</option>
                      ))}
                    </select>
                    <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-1.5">Expected Delivery</label>
                  <input
                    type="date"
                    value={expectedDate}
                    onChange={(e) => setExpectedDate(e.target.value)}
                    className="w-full bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/20 font-medium"
                  />
                </div>
              </div>

              {/* Section 2: Items */}
              <div className="space-y-3">
                <div className="flex items-center justify-between border-b border-gray-100 dark:border-white/5 pb-2">
                  <label className="text-xs font-black text-gray-400 uppercase tracking-widest">Order Items</label>
                  <div className="flex gap-3">
                    <button onClick={() => setShowMaterialForm(true)} className="flex items-center gap-1 text-[11px] font-bold text-indigo-500 hover:text-indigo-400">
                      <Plus size={12} /> New Material
                    </button>
                    <button onClick={addItem} className="flex items-center gap-1 text-[11px] font-bold text-orange-500 hover:text-orange-400">
                      <Plus size={12} /> Add Row
                    </button>
                  </div>
                </div>
                
                <div className="space-y-2">
                  {items.map((item, i) => (
                    <div key={i} className="group grid grid-cols-12 gap-2 items-center bg-gray-50/50 dark:bg-white/5 p-2 rounded-xl border border-transparent hover:border-gray-200 dark:hover:border-white/10 transition-all">
                      <div className="col-span-5">
                        <select
                          value={item.inventoryItemId}
                          onChange={(e) => updateItem(i, "inventoryItemId", e.target.value)}
                          className="w-full appearance-none bg-white dark:bg-card border border-gray-200 dark:border-white/5 rounded-lg px-3 py-2 text-[12px] focus:outline-none focus:ring-2 focus:ring-orange-500/20 font-medium"
                        >
                          <option value="">Select material...</option>
                          {materials.map((m: any) => (
                            <option key={m.id} value={m.id}>{m.name} ({m.unit})</option>
                          ))}
                        </select>
                      </div>
                      <div className="col-span-2">
                        <input
                          type="number"
                          placeholder="Qty"
                          value={item.quantity}
                          onChange={(e) => updateItem(i, "quantity", Number(e.target.value))}
                          className="w-full bg-white dark:bg-card border border-gray-200 dark:border-white/5 rounded-lg px-2 py-2 text-[12px] focus:outline-none focus:ring-2 focus:ring-orange-500/20 text-center font-bold"
                        />
                      </div>
                      <div className="col-span-3">
                        <div className="relative">
                          <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400 text-[11px]">₹</span>
                          <input
                            type="number"
                            placeholder="Rate"
                            value={item.price}
                            onChange={(e) => updateItem(i, "price", Number(e.target.value))}
                            className={clsx(
                              "w-full pl-6 pr-2 border rounded-lg py-2 text-[12px] focus:outline-none focus:ring-2 font-bold",
                              item.price > 0 && selectedVendor?.suppliedMaterials?.find((sm: any) => sm.materialId === item.inventoryItemId)?.price === item.price
                                ? "bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-500/30 text-emerald-700 dark:text-emerald-400 focus:ring-emerald-500/20"
                                : "bg-white dark:bg-card border-gray-200 dark:border-white/5 focus:ring-orange-500/20"
                            )}
                          />
                          {item.price > 0 && selectedVendor?.suppliedMaterials?.find((sm: any) => sm.materialId === item.inventoryItemId)?.price === item.price && (
                            <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[9px] font-black text-emerald-500 uppercase">rate</span>
                          )}
                        </div>
                      </div>
                      <div className="col-span-1 text-right">
                        <span className="text-[11px] font-black text-gray-700 dark:text-slate-300">{fmt(item.quantity * item.price)}</span>
                      </div>
                      <div className="col-span-1 flex justify-end">
                        {items.length > 1 && (
                          <button onClick={() => removeItem(i)} className="p-1 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-md transition-all">
                            <X size={14} />
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Section 3: Advance Info + Summary */}
              {/* Vendor Advance Banner */}
              {vendorId && (
                <div className={clsx(
                  "rounded-2xl px-4 py-3 border flex items-center justify-between",
                  availableAdvance > 0
                    ? "bg-emerald-50 dark:bg-emerald-500/10 border-emerald-200 dark:border-emerald-500/20"
                    : "bg-gray-50 dark:bg-white/[0.03] border-gray-200 dark:border-white/10"
                )}>
                  <div className="flex items-center gap-2">
                    <Wallet size={16} className={availableAdvance > 0 ? "text-emerald-500" : "text-gray-400"} />
                    <span className={clsx("text-xs font-black uppercase tracking-wider",
                      availableAdvance > 0 ? "text-emerald-700 dark:text-emerald-400" : "text-gray-500")}>
                      {availableAdvance > 0 ? "Advance Available" : "No Advance Balance"}
                    </span>
                  </div>
                  <span className={clsx("text-base font-black",
                    availableAdvance > 0 ? "text-emerald-600 dark:text-emerald-400" : "text-gray-400")}>
                    {fmt(availableAdvance)}
                  </span>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-1.5">Notes</label>
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Special instructions or quality notes..."
                    className="w-full bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/20 h-24 resize-none"
                  />
                </div>

                {/* Order Summary */}
                <div className="bg-orange-50/50 dark:bg-orange-500/5 rounded-2xl p-5 border border-orange-100/50 dark:border-orange-500/10 space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Subtotal</span>
                    <span className="text-lg font-black text-gray-900 dark:text-white">{fmt(total)}</span>
                  </div>
                  {autoApplied > 0 && (
                    <div className="flex justify-between items-center">
                      <div>
                        <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">Advance Applied</span>
                        <p className="text-[10px] text-emerald-500/70 mt-0.5">Auto-adjusted from ledger</p>
                      </div>
                      <span className="font-black text-emerald-600 dark:text-emerald-400">− {fmt(autoApplied)}</span>
                    </div>
                  )}
                  <div className={clsx(
                    "pt-3 border-t flex justify-between items-center",
                    autoApplied > 0 ? "border-emerald-200 dark:border-emerald-500/20" : "border-orange-200 dark:border-orange-500/20"
                  )}>
                    <span className="text-xs font-black text-gray-700 dark:text-slate-300 uppercase tracking-widest">Balance Due</span>
                    <span className={clsx("text-xl font-black", balanceDue > 0 ? "text-red-500" : "text-emerald-500")}>
                      {balanceDue > 0 ? fmt(balanceDue) : "₹0 — Covered"}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-6 pt-0 flex gap-3 justify-end items-center">
              <p className="text-[10px] text-gray-400 font-bold uppercase mr-auto flex items-center gap-2">
                <AlertCircle size={12} className="text-orange-400" />
                PO will be created in PENDING status
              </p>
              <button 
                onClick={() => setShowForm(false)} 
                className="px-6 py-3 rounded-xl border border-gray-200 dark:border-white/10 text-sm font-bold text-gray-600 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-white/5 transition-all"
              >
                Discard
              </button>
              <button
                onClick={handleCreate}
                disabled={saving || !vendorId || total <= 0 || items.some(it => !it.inventoryItemId || it.quantity <= 0 || it.price <= 0)}
                className="px-8 py-3 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-400 hover:to-orange-500 disabled:opacity-50 text-white rounded-xl text-sm font-black shadow-lg shadow-orange-500/20 hover:shadow-orange-500/40 transition-all border border-orange-400/20"
              >
                {saving ? "Processing..." : "Confirm Purchase Order"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Quick Add Material Modal */}
      {showMaterialForm && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-md p-4">
          <div className="bg-white dark:bg-[#12141c] rounded-3xl shadow-2xl w-full max-w-sm p-6 border border-gray-100 dark:border-white/5">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-black text-gray-900 dark:text-white">Quick Add Material</h2>
              <button onClick={() => setShowMaterialForm(false)} className="p-1.5 hover:bg-gray-100 dark:hover:bg-white/10 rounded-lg">
                <X size={18} className="text-gray-500" />
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5">Material Name</label>
                <input
                  autoFocus
                  placeholder="e.g. Black Gram"
                  value={newMat.name}
                  onChange={(e) => setNewMat({ ...newMat, name: e.target.value })}
                  className="w-full bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 font-bold"
                />
              </div>
              <div>
                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5">Unit</label>
                <select
                  value={newMat.unit}
                  onChange={(e) => setNewMat({ ...newMat, unit: e.target.value })}
                  className="w-full bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 font-bold"
                >
                  <option value="kg">kilogram (kg)</option>
                  <option value="g">gram (g)</option>
                  <option value="ltr">liter (ltr)</option>
                  <option value="ml">milliliter (ml)</option>
                  <option value="pc">piece (pc)</option>
                  <option value="pkt">packet (pkt)</option>
                  <option value="box">box</option>
                </select>
              </div>
            </div>

            <div className="flex gap-3 mt-8">
              <button onClick={() => setShowMaterialForm(false)} className="flex-1 py-3 text-sm font-bold text-gray-400 hover:text-gray-600 transition-all">Cancel</button>
              <button 
                onClick={handleQuickAddMaterial}
                disabled={matSaving || !newMat.name}
                className="flex-1 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-sm font-black shadow-lg shadow-indigo-500/20 transition-all border border-indigo-400/20 disabled:opacity-50"
              >
                {matSaving ? "Adding..." : "Add Material"}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
