"use client";

import { useState, useEffect, useCallback } from "react";
import {
  ShoppingCart, Plus, X, RefreshCw, CheckCircle2, Clock,
  Truck, PackageCheck, AlertTriangle, ChevronDown, Receipt,
  CreditCard, Banknote, ArrowRight, Package
} from "lucide-react";
import { clsx } from "clsx";
import api from "@/lib/api";
import { useAuth } from "@/context/AuthContext";

const STATUS_STYLES: Record<string, string> = {
  PENDING:      "bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-900/20 dark:text-amber-400 dark:border-amber-700/20",
  APPROVED:     "bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-700/20",
  IN_PRODUCTION:"bg-indigo-100 text-indigo-700 border-indigo-200 dark:bg-indigo-900/20 dark:text-indigo-400 dark:border-indigo-700/20",
  DISPATCHED:   "bg-purple-100 text-purple-700 border-purple-200 dark:bg-purple-900/20 dark:text-purple-400 dark:border-purple-700/20",
  DELIVERED:    "bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-900/20 dark:text-emerald-400 dark:border-emerald-700/20",
  CANCELLED:    "bg-red-100 text-red-700 border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-700/20",
};

const STATUS_ICONS: Record<string, any> = {
  PENDING: Clock, APPROVED: CheckCircle2, IN_PRODUCTION: Package,
  DISPATCHED: Truck, DELIVERED: PackageCheck, CANCELLED: X,
};

const NEXT_STATUS: Record<string, string> = {
  PENDING: "APPROVED", APPROVED: "IN_PRODUCTION",
  IN_PRODUCTION: "DISPATCHED", DISPATCHED: "DELIVERED",
};

export default function FranchiseOrdersPage() {
  const { user } = useAuth();
  const isFranchiseAdmin = user?.role === "FRANCHISE_ADMIN";
  const isSuperAdmin = user?.role === "SUPER_ADMIN";

  const [orders, setOrders] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [franchises, setFranchises] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");

  // Create form
  const [selectedFranchise, setSelectedFranchise] = useState(user?.franchiseId ?? "");
  const [paymentType, setPaymentType] = useState("COD");
  const [expectedDispatch, setExpectedDispatch] = useState("");
  const [notes, setNotes] = useState("");
  const [orderItems, setOrderItems] = useState<Array<{ productId: string; quantity: number }>>([
    { productId: "", quantity: 1 },
  ]);

  const fetchAll = useCallback(async () => {
    setLoading(true);
    try {
      const [ordersRes, productsRes] = await Promise.all([
        api.get("/api/franchise-orders"),
        api.get("/api/products"),
      ]);
      setOrders(ordersRes.data ?? []);
      setProducts((productsRes.data ?? []).filter((p: any) => p.isActive));

      if (!isFranchiseAdmin) {
        const franchiseRes = await api.get("/api/franchise");
        setFranchises(franchiseRes.data ?? []);
      }
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }, [isFranchiseAdmin]);

  useEffect(() => { fetchAll(); }, [fetchAll]);
  useEffect(() => {
    if (user?.franchiseId) setSelectedFranchise(user.franchiseId);
  }, [user]);

  const handleCreate = async () => {
    setError("");
    const validItems = orderItems.filter(i => i.productId && i.quantity > 0);
    if (!selectedFranchise || validItems.length === 0) {
      setError("Select a franchise and at least one product.");
      return;
    }
    setSaving(true);
    try {
      await api.post("/api/franchise-orders", {
        franchiseId: selectedFranchise,
        paymentType,
        expectedDispatchDate: expectedDispatch || undefined,
        notes: notes || undefined,
        items: validItems,
      });
      setShowCreate(false);
      setOrderItems([{ productId: "", quantity: 1 }]);
      setNotes(""); setExpectedDispatch("");
      fetchAll();
    } catch (e: any) {
      setError(e?.response?.data?.error ?? "Failed to create order.");
    } finally { setSaving(false); }
  };

  const handleAdvanceStatus = async (orderId: string, nextStatus: string) => {
    try {
      await api.patch(`/api/franchise-orders/${orderId}/status`, { status: nextStatus });
      fetchAll();
    } catch (e: any) {
      alert(e?.response?.data?.error ?? "Failed to update status.");
    }
  };

  const handlePayment = async (orderId: string) => {
    try {
      await api.post(`/api/franchise-orders/${orderId}/payment`, { amount: 0 });
      fetchAll();
    } catch (e: any) {
      alert(e?.response?.data?.error ?? "Failed to record payment.");
    }
  };

  const handleInvoice = async (orderId: string) => {
    try {
      const res = await api.get(`/api/franchise-orders/${orderId}/invoice`);
      const inv = res.data;
      alert(
        `Invoice: ${inv.invoiceNumber}\n` +
        `Franchise: ${inv.franchise}\n` +
        `Subtotal: ₹${inv.subtotal}\n` +
        `CGST: ₹${inv.cgst}  SGST: ₹${inv.sgst}\n` +
        `Grand Total: ₹${inv.grandTotal}`
      );
    } catch (e: any) {
      alert(e?.response?.data?.error ?? "Invoice not available yet (must be paid).");
    }
  };

  const filtered = statusFilter === "ALL" ? orders : orders.filter(o => o.status === statusFilter);

  const statsMap = {
    PENDING:      orders.filter(o => o.status === "PENDING").length,
    IN_PRODUCTION:orders.filter(o => o.status === "IN_PRODUCTION").length,
    DISPATCHED:   orders.filter(o => o.status === "DISPATCHED").length,
    DELIVERED:    orders.filter(o => o.status === "DELIVERED").length,
  };

  return (
    <div className="max-w-7xl mx-auto space-y-10 animate-in fade-in duration-700">
      {/* Header */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 py-6 border-b border-slate-200 dark:border-slate-800">
        <div>
          <div className="flex items-center gap-3">
            <div className="p-3 bg-orange-500 rounded-2xl shadow-xl shadow-orange-500/20">
              <ShoppingCart size={24} className="text-white" />
            </div>
            <h1 className="text-4xl font-black tracking-tight text-slate-900 dark:text-white uppercase">
              Franchise <span className="text-slate-400 font-medium ml-1 tracking-tighter italic">Orders</span>
            </h1>
          </div>
          <p className="text-slate-500 dark:text-slate-400 mt-2 font-medium ml-14 uppercase tracking-widest text-[10px]">
            {isFranchiseAdmin ? "Place and track your orders from HQ" : "Manage all franchise product orders"}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={fetchAll} className="p-4 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl hover:border-slate-300 transition-all shadow-sm group">
            <RefreshCw size={18} className={clsx("text-slate-400 group-hover:rotate-180 transition-transform duration-500", loading && "animate-spin")} />
          </button>
          <button
            onClick={() => setShowCreate(true)}
            className="flex items-center gap-3 bg-orange-500 text-white px-8 py-4 rounded-3xl font-black text-xs uppercase tracking-widest hover:shadow-2xl hover:translate-y-[-2px] transition-all active:translate-y-0 shadow-orange-500/20"
          >
            <Plus size={20} strokeWidth={3} /> New Order
          </button>
        </div>
      </header>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Pending", value: statsMap.PENDING, color: "text-amber-500", bg: "bg-amber-500/10" },
          { label: "In Production", value: statsMap.IN_PRODUCTION, color: "text-indigo-500", bg: "bg-indigo-500/10" },
          { label: "Dispatched", value: statsMap.DISPATCHED, color: "text-purple-500", bg: "bg-purple-500/10" },
          { label: "Delivered", value: statsMap.DELIVERED, color: "text-emerald-500", bg: "bg-emerald-500/10" },
        ].map((s, i) => (
          <div key={i} className="bg-white dark:bg-card/40 p-6 rounded-[28px] border border-slate-100 dark:border-white/5 shadow-xl shadow-black/[0.02]">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{s.label}</p>
            <div className={clsx("text-3xl font-black tracking-tighter", s.color)}>{s.value}</div>
          </div>
        ))}
      </div>

      {/* Status Filter */}
      <div className="flex p-1.5 bg-slate-100 dark:bg-white/5 rounded-2xl w-fit border border-slate-200 dark:border-white/5 overflow-x-auto">
        {["ALL", "PENDING", "APPROVED", "IN_PRODUCTION", "DISPATCHED", "DELIVERED", "CANCELLED"].map(s => (
          <button
            key={s}
            onClick={() => setStatusFilter(s)}
            className={clsx(
              "px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap",
              statusFilter === s
                ? "bg-white dark:bg-card text-slate-900 dark:text-white shadow-md border border-slate-100 dark:border-white/10"
                : "text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
            )}
          >{s === "IN_PRODUCTION" ? "In Prod." : s}</button>
        ))}
      </div>

      {/* Orders List */}
      {loading ? (
        <div className="py-20 flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-4 border-orange-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Loading Orders...</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="py-20 bg-slate-50 dark:bg-white/[0.02] rounded-[48px] border-2 border-dashed border-slate-200 dark:border-white/5 text-center">
          <ShoppingCart className="mx-auto mb-4 text-slate-200" size={48} />
          <p className="text-sm font-black text-slate-400 uppercase tracking-tight">No orders found</p>
          <p className="text-xs text-slate-400 mt-1">Place your first order using the button above.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map(order => {
            const StatusIcon = STATUS_ICONS[order.status] ?? Clock;
            const nextStatus = NEXT_STATUS[order.status];
            const isDelayed  = order.delayStatus === "DELAYED";

            return (
              <div key={order.id} className="bg-white dark:bg-card/40 backdrop-blur-md rounded-[32px] border border-slate-100 dark:border-white/5 p-8 hover:shadow-2xl transition-all">
                <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-6">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 flex-wrap">
                      <h3 className="text-lg font-black text-slate-900 dark:text-white uppercase tracking-tight">
                        {order.orderNumber}
                      </h3>
                      <span className={clsx("px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border flex items-center gap-1.5", STATUS_STYLES[order.status])}>
                        <StatusIcon size={11} /> {order.status.replace("_", " ")}
                      </span>
                      {isDelayed && (
                        <span className="px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border bg-red-100 text-red-600 border-red-200 flex items-center gap-1">
                          <AlertTriangle size={10} /> Delayed
                        </span>
                      )}
                      <span className={clsx(
                        "px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border",
                        order.paymentStatus === "PAID"
                          ? "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-900/20 dark:text-emerald-400"
                          : "bg-slate-50 text-slate-500 border-slate-200 dark:bg-white/5 dark:text-slate-400"
                      )}>
                        {order.paymentType} · {order.paymentStatus}
                      </span>
                    </div>

                    <p className="text-sm font-bold text-slate-500 dark:text-slate-400 mt-1">
                      {order.franchise?.name} · {new Date(order.createdAt).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}
                    </p>

                    <div className="flex flex-wrap gap-2 mt-4">
                      {order.items?.map((item: any) => (
                        <span key={item.id} className={clsx(
                          "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[10px] font-black border",
                          item.productType === "MADE_TO_ORDER"
                            ? "bg-indigo-50 text-indigo-700 border-indigo-100 dark:bg-indigo-900/20 dark:text-indigo-400"
                            : "bg-slate-50 text-slate-700 border-slate-100 dark:bg-white/5 dark:text-slate-300"
                        )}>
                          {item.product?.name} × {item.quantity}
                          {item.productType === "MADE_TO_ORDER" && <span className="text-[8px] opacity-60">MTO</span>}
                        </span>
                      ))}
                    </div>

                    {order.expectedDispatchDate && (
                      <p className="text-[10px] font-bold text-slate-400 mt-2 uppercase tracking-widest">
                        Expected Dispatch: {new Date(order.expectedDispatchDate).toLocaleDateString("en-IN", { day: "2-digit", month: "short" })}
                        {order.actualDispatchDate && ` · Dispatched: ${new Date(order.actualDispatchDate).toLocaleDateString("en-IN", { day: "2-digit", month: "short" })}`}
                      </p>
                    )}
                  </div>

                  <div className="flex flex-col items-end gap-3 min-w-[200px]">
                    <p className="text-3xl font-black text-slate-900 dark:text-white tracking-tighter">
                      ₹{order.totalAmount.toLocaleString("en-IN")}
                    </p>

                    {/* Actions for SUPER_ADMIN */}
                    {isSuperAdmin && nextStatus && (
                      <button
                        onClick={() => handleAdvanceStatus(order.id, nextStatus)}
                        className="w-full px-4 py-2.5 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 hover:opacity-90 transition-all"
                      >
                        Mark {nextStatus.replace("_", " ")} <ArrowRight size={12} />
                      </button>
                    )}
                    {isSuperAdmin && order.status === "DELIVERED" && order.paymentStatus !== "PAID" && (
                      <button
                        onClick={() => handlePayment(order.id)}
                        className="w-full px-4 py-2.5 bg-emerald-500 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 hover:opacity-90 transition-all"
                      >
                        <Banknote size={12} /> Mark Paid
                      </button>
                    )}
                    {(order.paymentStatus === "PAID") && (
                      <button
                        onClick={() => handleInvoice(order.id)}
                        className="w-full px-4 py-2.5 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 border border-blue-100 dark:border-blue-700/20 rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 hover:opacity-90 transition-all"
                      >
                        <Receipt size={12} /> GST Invoice
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Create Order Modal */}
      {showCreate && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 animate-in fade-in duration-300">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-xl" onClick={() => setShowCreate(false)} />
          <div className="relative bg-white dark:bg-card rounded-[48px] shadow-2xl w-full max-w-2xl border border-white/20 dark:border-white/5 p-10 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center gap-4 mb-8">
              <div className="w-14 h-14 rounded-[20px] bg-orange-500 flex items-center justify-center text-white shadow-xl shadow-orange-500/20">
                <Plus size={28} />
              </div>
              <div>
                <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tighter">New Franchise Order</h2>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-0.5">Place product order from HQ</p>
              </div>
              <button onClick={() => setShowCreate(false)} className="ml-auto p-3 hover:bg-slate-100 dark:hover:bg-white/5 rounded-2xl transition-all">
                <X size={20} className="text-slate-400" />
              </button>
            </div>

            <div className="space-y-6">
              {/* Franchise selector (SUPER_ADMIN only) */}
              {!isFranchiseAdmin && (
                <div className="space-y-2">
                  <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Franchise *</label>
                  <select
                    value={selectedFranchise}
                    onChange={e => setSelectedFranchise(e.target.value)}
                    className="w-full h-12 bg-slate-50 dark:bg-white/5 px-4 rounded-2xl font-bold text-sm outline-none dark:text-white appearance-none"
                  >
                    <option value="">Select franchise...</option>
                    {franchises.map(f => <option key={f.id} value={f.id}>{f.name}</option>)}
                  </select>
                </div>
              )}

              {/* Products */}
              <div className="space-y-3">
                <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Products *</label>
                {orderItems.map((item, idx) => {
                  const selectedProduct = products.find(p => p.id === item.productId);
                  return (
                    <div key={idx} className="flex gap-3 items-center">
                      <select
                        value={item.productId}
                        onChange={e => {
                          const updated = [...orderItems];
                          updated[idx].productId = e.target.value;
                          setOrderItems(updated);
                        }}
                        className="flex-1 h-12 bg-slate-50 dark:bg-white/5 px-4 rounded-2xl font-bold text-sm outline-none dark:text-white appearance-none"
                      >
                        <option value="">Select product...</option>
                        {products.map(p => (
                          <option key={p.id} value={p.id}>
                            {p.name} {p.productType === "MADE_TO_ORDER" ? "(MTO)" : ""} — ₹{p.basePrice}
                          </option>
                        ))}
                      </select>
                      <input
                        type="number"
                        min={1}
                        value={item.quantity}
                        onChange={e => {
                          const updated = [...orderItems];
                          updated[idx].quantity = Number(e.target.value);
                          setOrderItems(updated);
                        }}
                        className="w-24 h-12 bg-slate-50 dark:bg-white/5 px-3 rounded-2xl font-bold text-sm outline-none dark:text-white text-center"
                        placeholder="Qty"
                      />
                      {selectedProduct && (
                        <span className="text-xs font-black text-slate-500 dark:text-slate-400 w-20 text-right">
                          ₹{(selectedProduct.basePrice * item.quantity).toLocaleString("en-IN")}
                        </span>
                      )}
                      {orderItems.length > 1 && (
                        <button
                          onClick={() => setOrderItems(orderItems.filter((_, i) => i !== idx))}
                          className="p-2 text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-all"
                        ><X size={16} /></button>
                      )}
                    </div>
                  );
                })}
                <button
                  onClick={() => setOrderItems([...orderItems, { productId: "", quantity: 1 }])}
                  className="text-[11px] font-black text-orange-500 uppercase tracking-widest flex items-center gap-1.5 hover:opacity-70 transition-all"
                >
                  <Plus size={12} /> Add Another Product
                </button>
              </div>

              {/* Payment + Dispatch */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Payment Type</label>
                  <div className="flex p-1 bg-slate-100 dark:bg-white/5 rounded-2xl">
                    {["COD", "ONLINE"].map(pt => (
                      <button
                        key={pt}
                        onClick={() => setPaymentType(pt)}
                        className={clsx(
                          "flex-1 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 transition-all",
                          paymentType === pt ? "bg-white dark:bg-card text-slate-900 dark:text-white shadow-md" : "text-slate-400"
                        )}
                      >
                        {pt === "COD" ? <Banknote size={12} /> : <CreditCard size={12} />} {pt}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Expected Dispatch</label>
                  <input
                    type="date"
                    value={expectedDispatch}
                    onChange={e => setExpectedDispatch(e.target.value)}
                    min={new Date().toISOString().split("T")[0]}
                    className="w-full h-12 bg-slate-50 dark:bg-white/5 px-4 rounded-2xl font-bold text-sm outline-none dark:text-white"
                  />
                </div>
              </div>

              <textarea
                rows={2}
                placeholder="Special notes (optional)..."
                value={notes}
                onChange={e => setNotes(e.target.value)}
                className="w-full bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/5 rounded-2xl p-4 text-sm font-bold outline-none resize-none dark:text-white"
              />

              {/* Total preview */}
              <div className="p-4 bg-slate-50 dark:bg-white/5 rounded-2xl flex justify-between items-center">
                <span className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Estimated Total</span>
                <span className="text-xl font-black text-slate-900 dark:text-white">
                  ₹{orderItems.reduce((sum, item) => {
                    const p = products.find(p => p.id === item.productId);
                    return sum + (p ? p.basePrice * item.quantity : 0);
                  }, 0).toLocaleString("en-IN")}
                  <span className="text-xs text-slate-400 font-bold ml-1">+ GST 5%</span>
                </span>
              </div>

              {error && (
                <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-700/20 rounded-2xl">
                  <p className="text-xs font-black text-red-600 uppercase tracking-widest">{error}</p>
                </div>
              )}

              <div className="flex gap-4 pt-2">
                <button onClick={() => setShowCreate(false)} className="flex-1 py-4 bg-slate-50 dark:bg-white/5 rounded-3xl font-black text-[10px] uppercase tracking-widest text-slate-400 hover:bg-slate-100 transition-all">Cancel</button>
                <button
                  onClick={handleCreate}
                  disabled={saving}
                  className="flex-[2] py-4 bg-orange-500 text-white rounded-3xl font-black text-[10px] uppercase tracking-[0.2em] shadow-xl shadow-orange-500/20 hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50"
                >
                  {saving ? "Placing Order..." : "Place Order"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
