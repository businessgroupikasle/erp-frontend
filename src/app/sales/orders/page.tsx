"use client";

import { useState, useEffect, useCallback } from "react";
import {
  ShoppingBag, Search, RefreshCw, TrendingUp, Banknote, QrCode,
  CreditCard, Calendar, ChevronDown, Package, Clock, CheckCircle2,
  XCircle, X,
} from "lucide-react";
import { clsx } from "clsx";
import { posApi } from "@/lib/api";

// ── Helpers ──────────────────────────────────────────────────────────────────

const PAYMENT_MODE_CONFIG: Record<string, { label: string; icon: any; color: string; bg: string }> = {
  CASH: { label: "Cash", icon: Banknote, color: "text-emerald-700 dark:text-emerald-400", bg: "bg-emerald-50 dark:bg-emerald-500/10 border-emerald-200 dark:border-emerald-500/20" },
  UPI:  { label: "UPI",  icon: QrCode,   color: "text-blue-700 dark:text-blue-400",    bg: "bg-blue-50 dark:bg-blue-500/10 border-blue-200 dark:border-blue-500/20" },
  CARD: { label: "Card", icon: CreditCard, color: "text-violet-700 dark:text-violet-400", bg: "bg-violet-50 dark:bg-violet-500/10 border-violet-200 dark:border-violet-500/20" },
};

const ORDER_STATUS_CONFIG: Record<string, { label: string; color: string; bg: string; icon: any }> = {
  PENDING:    { label: "Pending",    color: "text-amber-700",   bg: "bg-amber-50 border-amber-200",   icon: Clock },
  CONFIRMED:  { label: "Confirmed",  color: "text-blue-700",    bg: "bg-blue-50 border-blue-200",     icon: CheckCircle2 },
  PROCESSING: { label: "Processing", color: "text-purple-700",  bg: "bg-purple-50 border-purple-200", icon: Package },
  DELIVERED:  { label: "Delivered",  color: "text-emerald-700", bg: "bg-emerald-50 border-emerald-200", icon: CheckCircle2 },
  CANCELLED:  { label: "Cancelled",  color: "text-red-700",     bg: "bg-red-50 border-red-200",       icon: XCircle },
};

const PAYMENT_STATUS_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
  PAID:    { label: "Paid",    color: "text-emerald-700 dark:text-emerald-400", bg: "bg-emerald-50 dark:bg-emerald-500/10 border-emerald-200 dark:border-emerald-500/20" },
  UNPAID:  { label: "Unpaid",  color: "text-red-700 dark:text-red-400",         bg: "bg-red-50 dark:bg-red-500/10 border-red-200 dark:border-red-500/20" },
  PARTIAL: { label: "Partial", color: "text-amber-700 dark:text-amber-400",     bg: "bg-amber-50 dark:bg-amber-500/10 border-amber-200 dark:border-amber-500/20" },
};

function fmtDate(d: string) {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
}
function fmtTime(d: string) {
  if (!d) return "";
  return new Date(d).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" });
}
function shortId(id: string) {
  return id ? id.slice(-8).toUpperCase() : "—";
}

// ── Component ─────────────────────────────────────────────────────────────────

export default function SalesOrdersPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [paymentModeFilter, setPaymentModeFilter] = useState("");
  const [paymentStatusFilter, setPaymentStatusFilter] = useState("");
  const [orderStatusFilter, setOrderStatusFilter] = useState("");
  const [selectedOrder, setSelectedOrder] = useState<any>(null);

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    try {
      const params: any = {};
      if (search)              params.search        = search;
      if (fromDate)            params.from          = fromDate;
      if (toDate)              params.to            = toDate;
      if (paymentModeFilter)   params.paymentMode   = paymentModeFilter;
      if (paymentStatusFilter) params.paymentStatus = paymentStatusFilter;
      if (orderStatusFilter)   params.status        = orderStatusFilter;

      const res = await posApi.getOrders(params);
      const raw = res.data?.data || res.data || [];
      setOrders(Array.isArray(raw) ? raw : []);
    } catch (e) {
      console.error("Orders fetch failed", e);
      setOrders([]);
    } finally {
      setLoading(false);
    }
  }, [search, fromDate, toDate, paymentModeFilter, paymentStatusFilter, orderStatusFilter]);

  useEffect(() => { fetchOrders(); }, [fetchOrders]);

  // ── Derived stats ─────────────────────────────────────────────────────────
  const totalRevenue = orders.reduce((s, o) => s + (o.totalAmount || 0), 0);
  const cashTotal    = orders.filter(o => o.paymentMode === "CASH").reduce((s, o) => s + (o.totalAmount || 0), 0);
  const upiTotal     = orders.filter(o => o.paymentMode === "UPI").reduce((s, o) => s + (o.totalAmount || 0), 0);
  const cardTotal    = orders.filter(o => o.paymentMode === "CARD").reduce((s, o) => s + (o.totalAmount || 0), 0);

  const clearFilters = () => {
    setSearch(""); setFromDate(""); setToDate("");
    setPaymentModeFilter(""); setPaymentStatusFilter(""); setOrderStatusFilter("");
  };
  const hasFilters = search || fromDate || toDate || paymentModeFilter || paymentStatusFilter || orderStatusFilter;

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="max-w-7xl mx-auto space-y-8 p-1">

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-gray-900 dark:text-white flex items-center gap-2">
            <ShoppingBag size={22} className="text-orange-500" /> Sales Orders
          </h1>
          <p className="text-sm text-gray-500 dark:text-slate-400 mt-1">All POS transactions — history, revenue, payment tracking</p>
        </div>
        <button onClick={fetchOrders} className="p-2.5 rounded-xl border border-gray-200 dark:border-white/10 hover:bg-gray-50 dark:hover:bg-white/5 transition-all">
          <RefreshCw size={16} className="text-gray-400" />
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white/70 dark:bg-card/70 backdrop-blur-md rounded-2xl border border-gray-100 dark:border-white/5 p-5 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-orange-50 dark:bg-orange-500/10 rounded-xl"><ShoppingBag size={20} className="text-orange-500" /></div>
            <div>
              <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Total Orders</p>
              <p className="text-2xl font-black text-slate-900 dark:text-white mt-1">{orders.length}</p>
            </div>
          </div>
        </div>
        <div className="bg-indigo-50/70 dark:bg-indigo-500/10 rounded-2xl border border-indigo-100 dark:border-indigo-500/20 p-5 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-indigo-100 dark:bg-indigo-500/20 rounded-xl"><TrendingUp size={20} className="text-indigo-600" /></div>
            <div>
              <p className="text-[11px] font-black text-indigo-600/70 uppercase tracking-widest">Revenue</p>
              <p className="text-2xl font-black text-indigo-700 dark:text-indigo-400 mt-1">₹{Math.round(totalRevenue).toLocaleString()}</p>
            </div>
          </div>
        </div>
        <div className="bg-emerald-50/70 dark:bg-emerald-500/10 rounded-2xl border border-emerald-100 dark:border-emerald-500/20 p-5 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-emerald-100 dark:bg-emerald-500/20 rounded-xl"><Banknote size={20} className="text-emerald-600" /></div>
            <div>
              <p className="text-[11px] font-black text-emerald-600/70 uppercase tracking-widest">Cash</p>
              <p className="text-2xl font-black text-emerald-700 dark:text-emerald-400 mt-1">₹{Math.round(cashTotal).toLocaleString()}</p>
            </div>
          </div>
        </div>
        <div className="bg-blue-50/70 dark:bg-blue-500/10 rounded-2xl border border-blue-100 dark:border-blue-500/20 p-5 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-blue-100 dark:bg-blue-500/20 rounded-xl"><QrCode size={20} className="text-blue-600" /></div>
            <div>
              <p className="text-[11px] font-black text-blue-600/70 uppercase tracking-widest">UPI / Card</p>
              <p className="text-2xl font-black text-blue-700 dark:text-blue-400 mt-1">₹{Math.round(upiTotal + cardTotal).toLocaleString()}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-card rounded-2xl border border-gray-100 dark:border-white/5 p-4 shadow-sm space-y-3">
        <div className="flex flex-wrap gap-3">
          {/* Search */}
          <div className="relative flex-1 min-w-[180px]">
            <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
            <input value={search} onChange={(e) => setSearch(e.target.value)}
              placeholder="Search customer name..."
              className="w-full pl-9 pr-4 py-2.5 text-sm bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl outline-none focus:border-orange-400 transition-all font-medium" />
          </div>

          {/* From date */}
          <div className="relative">
            <Calendar size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
            <input type="date" value={fromDate} onChange={(e) => setFromDate(e.target.value)}
              className="pl-9 pr-3 py-2.5 text-sm bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl outline-none focus:border-orange-400 transition-all font-medium" />
          </div>

          {/* To date */}
          <div className="relative">
            <Calendar size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
            <input type="date" value={toDate} onChange={(e) => setToDate(e.target.value)}
              className="pl-9 pr-3 py-2.5 text-sm bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl outline-none focus:border-orange-400 transition-all font-medium" />
          </div>

          {/* Payment mode */}
          <div className="relative">
            <ChevronDown size={13} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
            <select value={paymentModeFilter} onChange={(e) => setPaymentModeFilter(e.target.value)}
              className="appearance-none pl-4 pr-8 py-2.5 text-sm bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl outline-none focus:border-orange-400 transition-all font-medium">
              <option value="">All Modes</option>
              <option value="CASH">Cash</option>
              <option value="UPI">UPI</option>
              <option value="CARD">Card</option>
            </select>
          </div>

          {/* Payment status */}
          <div className="relative">
            <ChevronDown size={13} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
            <select value={paymentStatusFilter} onChange={(e) => setPaymentStatusFilter(e.target.value)}
              className="appearance-none pl-4 pr-8 py-2.5 text-sm bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl outline-none focus:border-orange-400 transition-all font-medium">
              <option value="">All Payment</option>
              <option value="PAID">Paid</option>
              <option value="UNPAID">Unpaid</option>
              <option value="PARTIAL">Partial</option>
            </select>
          </div>

          {/* Order status */}
          <div className="relative">
            <ChevronDown size={13} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
            <select value={orderStatusFilter} onChange={(e) => setOrderStatusFilter(e.target.value)}
              className="appearance-none pl-4 pr-8 py-2.5 text-sm bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl outline-none focus:border-orange-400 transition-all font-medium">
              <option value="">All Status</option>
              <option value="PENDING">Pending</option>
              <option value="CONFIRMED">Confirmed</option>
              <option value="PROCESSING">Processing</option>
              <option value="DELIVERED">Delivered</option>
              <option value="CANCELLED">Cancelled</option>
            </select>
          </div>

          {hasFilters && (
            <button onClick={clearFilters}
              className="flex items-center gap-1.5 px-4 py-2.5 text-sm font-bold text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-xl border border-red-200 dark:border-red-500/20 transition-all">
              <X size={14} /> Clear
            </button>
          )}
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white dark:bg-card rounded-2xl border border-gray-100 dark:border-white/5 shadow-sm overflow-hidden">
        {/* Table header */}
        <div className="grid grid-cols-[1fr_1.5fr_auto_auto_auto_auto_auto_auto] gap-4 px-5 py-3 bg-gray-50 dark:bg-white/3 border-b border-gray-100 dark:border-white/5">
          {["Order", "Customer", "Items", "Amount", "Mode", "Payment", "Status", "Date"].map((h) => (
            <p key={h} className="text-[10px] font-black uppercase tracking-widest text-gray-400">{h}</p>
          ))}
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="text-center space-y-3">
              <div className="w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto" />
              <p className="text-[11px] font-black uppercase tracking-widest text-gray-400">Loading orders...</p>
            </div>
          </div>
        ) : orders.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-gray-300 dark:text-slate-700">
            <ShoppingBag size={44} strokeWidth={1} />
            <p className="text-sm font-bold mt-3">{hasFilters ? "No orders match your filters." : "No orders yet. Start billing from POS."}</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-50 dark:divide-white/5">
            {orders.map((order) => {
              const mode   = PAYMENT_MODE_CONFIG[order.paymentMode] || PAYMENT_MODE_CONFIG.CASH;
              const pStat  = order.paymentStatus ? (PAYMENT_STATUS_CONFIG[order.paymentStatus] || PAYMENT_STATUS_CONFIG.UNPAID) : null;
              const oStat  = order.status ? (ORDER_STATUS_CONFIG[order.status] || null) : null;
              const ModeIcon = mode.icon;

              return (
                <div key={order.id}
                  className="grid grid-cols-[1fr_1.5fr_auto_auto_auto_auto_auto_auto] gap-4 px-5 py-3.5 items-center hover:bg-orange-50/20 dark:hover:bg-white/3 transition-colors cursor-pointer group"
                  onClick={() => setSelectedOrder(order)}>

                  {/* Order ID */}
                  <div>
                    <p className="text-xs font-black text-orange-500 font-mono">#{shortId(order.id || order.orderNumber)}</p>
                    <p className="text-[10px] text-gray-400 mt-0.5 capitalize">{order.orderType || "counter"}</p>
                  </div>

                  {/* Customer */}
                  <div className="min-w-0">
                    <p className="text-[13px] font-bold text-gray-900 dark:text-white truncate">{order.customerName || "Walk-in Customer"}</p>
                    {order.customerPhone && <p className="text-[11px] text-gray-400">{order.customerPhone}</p>}
                  </div>

                  {/* Items count */}
                  <div className="flex items-center justify-center w-8 h-8 rounded-xl bg-orange-50 dark:bg-orange-500/10 shrink-0">
                    <span className="text-[11px] font-black text-orange-600">{order.items?.length || 0}</span>
                  </div>

                  {/* Amount */}
                  <p className="text-[14px] font-black text-gray-900 dark:text-white whitespace-nowrap">₹{(order.totalAmount || 0).toLocaleString()}</p>

                  {/* Payment mode badge */}
                  <div className={clsx("flex items-center gap-1.5 px-2.5 py-1 rounded-xl border text-[10px] font-black uppercase whitespace-nowrap", mode.bg, mode.color)}>
                    <ModeIcon size={11} />{mode.label}
                  </div>

                  {/* Payment status badge */}
                  {pStat ? (
                    <div className={clsx("px-2.5 py-1 rounded-xl border text-[10px] font-black uppercase whitespace-nowrap", pStat.bg, pStat.color)}>
                      {pStat.label}
                    </div>
                  ) : (
                    <div className="px-2.5 py-1 rounded-xl border border-gray-200 text-[10px] font-black uppercase text-gray-400 whitespace-nowrap">—</div>
                  )}

                  {/* Order status */}
                  {oStat ? (
                    <div className={clsx("flex items-center gap-1 px-2.5 py-1 rounded-xl border text-[10px] font-black uppercase whitespace-nowrap", oStat.bg, oStat.color)}>
                      <oStat.icon size={10} />{oStat.label}
                    </div>
                  ) : (
                    <div className="px-2.5 py-1 rounded-xl border border-gray-200 text-[10px] font-black uppercase text-gray-400 whitespace-nowrap">—</div>
                  )}

                  {/* Date */}
                  <div className="text-right shrink-0">
                    <p className="text-[11px] font-bold text-gray-600 dark:text-gray-300">{fmtDate(order.createdAt)}</p>
                    <p className="text-[10px] text-gray-400">{fmtTime(order.createdAt)}</p>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Footer */}
        {orders.length > 0 && (
          <div className="px-5 py-3 border-t border-gray-50 dark:border-white/5 bg-gray-50/50 dark:bg-white/3 flex items-center justify-between">
            <p className="text-[11px] font-black text-gray-400 uppercase tracking-widest">{orders.length} order{orders.length !== 1 ? "s" : ""}</p>
            <p className="text-[11px] font-black text-gray-500">Total: <span className="text-orange-500">₹{Math.round(totalRevenue).toLocaleString()}</span></p>
          </div>
        )}
      </div>

      {/* ── ORDER DETAIL MODAL ── */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-[#12141c] rounded-[2.5rem] shadow-2xl w-full max-w-lg overflow-hidden">
            {/* Modal header */}
            <div className="flex items-center justify-between px-7 py-5 border-b border-gray-100 dark:border-white/5">
              <div>
                <h2 className="text-base font-black text-gray-900 dark:text-white uppercase tracking-widest">Order Detail</h2>
                <p className="text-[11px] text-orange-500 font-black mt-0.5">#{shortId(selectedOrder.id || selectedOrder.orderNumber)}</p>
              </div>
              <button onClick={() => setSelectedOrder(null)} className="p-2.5 rounded-xl hover:bg-gray-100 dark:hover:bg-white/5 text-gray-400 transition-all"><X size={18} /></button>
            </div>

            <div className="px-7 py-5 space-y-5 max-h-[70vh] overflow-y-auto">
              {/* Customer + meta */}
              <div className="grid grid-cols-2 gap-3">
                {[
                  { label: "Customer", value: selectedOrder.customerName || "Walk-in" },
                  { label: "Phone", value: selectedOrder.customerPhone || "—" },
                  { label: "Date", value: fmtDate(selectedOrder.createdAt) },
                  { label: "Time", value: fmtTime(selectedOrder.createdAt) },
                  { label: "Type", value: selectedOrder.orderType || "counter" },
                  { label: "Payment Mode", value: selectedOrder.paymentMode || "—" },
                ].map(({ label, value }) => (
                  <div key={label} className="bg-gray-50 dark:bg-white/5 rounded-2xl p-3">
                    <p className="text-[9px] font-black uppercase tracking-widest text-gray-400">{label}</p>
                    <p className="text-[13px] font-black text-gray-900 dark:text-white capitalize mt-0.5">{value}</p>
                  </div>
                ))}
              </div>

              {/* Items */}
              {selectedOrder.items?.length > 0 && (
                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-3">Items ({selectedOrder.items.length})</p>
                  <div className="space-y-2">
                    {selectedOrder.items.map((item: any, i: number) => (
                      <div key={i} className="flex items-center justify-between bg-gray-50 dark:bg-white/5 rounded-2xl px-4 py-3">
                        <div>
                          <p className="text-[13px] font-bold text-gray-900 dark:text-white">{item.productName || item.name || "Product"}</p>
                          <p className="text-[11px] text-gray-400 mt-0.5">
                            ₹{(item.unitPrice || item.rate || 0).toLocaleString()} × {item.quantity}
                            {item.taxPercent > 0 ? ` · GST ${item.taxPercent}%` : ""}
                          </p>
                        </div>
                        <p className="text-[13px] font-black text-gray-900 dark:text-white">₹{(item.totalPrice || item.quantity * (item.unitPrice || 0)).toLocaleString()}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Totals */}
              <div className="bg-orange-50 dark:bg-orange-500/5 rounded-2xl border border-orange-100 dark:border-orange-500/10 p-4 space-y-2">
                {[
                  { label: "Subtotal", value: `₹${(selectedOrder.subtotal || 0).toLocaleString()}` },
                  { label: "Tax (GST)", value: `₹${(selectedOrder.taxAmount || 0).toLocaleString()}` },
                  ...(selectedOrder.discountAmount > 0 ? [{ label: "Discount", value: `− ₹${selectedOrder.discountAmount.toLocaleString()}` }] : []),
                ].map(({ label, value }) => (
                  <div key={label} className="flex justify-between text-[12px]">
                    <span className="text-gray-500">{label}</span>
                    <span className="font-bold text-gray-800 dark:text-gray-200">{value}</span>
                  </div>
                ))}
                <div className="flex justify-between items-center pt-2 border-t border-orange-200 dark:border-orange-500/20">
                  <span className="text-sm font-black text-gray-500 uppercase tracking-widest">Total</span>
                  <span className="text-xl font-black text-orange-500">₹{(selectedOrder.totalAmount || 0).toLocaleString()}</span>
                </div>
              </div>
            </div>

            <div className="px-7 py-5 border-t border-gray-100 dark:border-white/5">
              <button onClick={() => setSelectedOrder(null)}
                className="w-full py-3.5 bg-orange-500 hover:bg-orange-400 text-white rounded-2xl text-sm font-black tracking-widest uppercase transition-all active:scale-95 shadow-lg shadow-orange-500/20">
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
