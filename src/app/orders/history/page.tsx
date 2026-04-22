"use client";

import { useState, useEffect } from "react";
import { Search, Receipt, Clock, CheckCircle2, XCircle, Loader2, ChevronDown, RefreshCw } from "lucide-react";
import { clsx } from "clsx";
import { posApi } from "@/lib/api";

const STATUS_STYLES: Record<string, string> = {
  PENDING:   "bg-amber-100 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400",
  PREPARING: "bg-blue-100 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400",
  READY:     "bg-indigo-100 text-indigo-700 dark:bg-indigo-500/10 dark:text-indigo-400",
  COMPLETED: "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400",
  CANCELLED: "bg-rose-100 text-rose-700 dark:bg-rose-500/10 dark:text-rose-400",
};

const PAYMENT_STYLES: Record<string, string> = {
  CASH: "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400",
  UPI:  "bg-blue-50 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400",
  CARD: "bg-violet-50 text-violet-700 dark:bg-violet-500/10 dark:text-violet-400",
};

export default function OrderHistoryPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const TAKE = 20;

  const fetchOrders = async (reset = false) => {
    setLoading(true);
    try {
      const skip = reset ? 0 : (page - 1) * TAKE;
      const res = await posApi.getOrders({ skip, take: TAKE });
      const data = res.data?.data || res.data || [];
      const arr = Array.isArray(data) ? data : [];
      if (reset) {
        setOrders(arr);
        setPage(1);
      } else {
        setOrders(prev => [...prev, ...arr]);
      }
      setHasMore(arr.length === TAKE);
    } catch (e) {
      console.error("Failed to load orders", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchOrders(true); }, []);

  const filtered = orders.filter(o => {
    const matchStatus = statusFilter === "ALL" || o.status === statusFilter;
    const matchSearch = search === "" ||
      o.id?.toLowerCase().includes(search.toLowerCase()) ||
      o.customerName?.toLowerCase().includes(search.toLowerCase()) ||
      o.customerPhone?.includes(search);
    return matchStatus && matchSearch;
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tight">Order History</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">{orders.length} orders loaded</p>
        </div>
        <button onClick={() => fetchOrders(true)} className="flex items-center gap-2 px-4 py-2 bg-orange-500 text-white rounded-xl text-xs font-black uppercase tracking-widest hover:bg-orange-600 transition-all">
          <RefreshCw size={14} /> Refresh
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search by order ID, customer name or phone..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl pl-9 pr-4 py-2.5 text-sm outline-none focus:border-orange-500 transition-all"
          />
        </div>
        <div className="flex gap-2">
          {["ALL", "PENDING", "PREPARING", "READY", "COMPLETED", "CANCELLED"].map(s => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={clsx(
                "px-3 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all",
                statusFilter === s
                  ? "bg-orange-500 text-white"
                  : "bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-300 hover:border-orange-300"
              )}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-[#12141c] rounded-2xl border border-slate-200/60 dark:border-white/5 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200/60 dark:border-white/5 bg-slate-50/50 dark:bg-white/2">
                <th className="text-left px-5 py-3 text-[10px] font-black uppercase tracking-widest text-slate-400">Order ID</th>
                <th className="text-left px-5 py-3 text-[10px] font-black uppercase tracking-widest text-slate-400">Customer</th>
                <th className="text-left px-5 py-3 text-[10px] font-black uppercase tracking-widest text-slate-400">Type</th>
                <th className="text-left px-5 py-3 text-[10px] font-black uppercase tracking-widest text-slate-400">Payment</th>
                <th className="text-left px-5 py-3 text-[10px] font-black uppercase tracking-widest text-slate-400">Status</th>
                <th className="text-right px-5 py-3 text-[10px] font-black uppercase tracking-widest text-slate-400">Total</th>
                <th className="text-left px-5 py-3 text-[10px] font-black uppercase tracking-widest text-slate-400">Date & Time</th>
                <th className="px-5 py-3" />
              </tr>
            </thead>
            <tbody>
              {loading && orders.length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-center py-16">
                    <Loader2 className="animate-spin mx-auto text-orange-500" size={28} />
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-center py-16 text-slate-400">
                    <Receipt size={36} className="mx-auto mb-3 opacity-30" />
                    <p className="text-sm font-black uppercase tracking-widest">No orders found</p>
                  </td>
                </tr>
              ) : (
                filtered.map(order => (
                  <>
                    <tr
                      key={order.id}
                      onClick={() => setExpandedId(expandedId === order.id ? null : order.id)}
                      className="border-b border-slate-100 dark:border-white/5 hover:bg-slate-50 dark:hover:bg-white/2 cursor-pointer transition-colors"
                    >
                      <td className="px-5 py-3.5">
                        <span className="font-mono text-xs font-black text-slate-700 dark:text-slate-200">
                          #{order.id?.slice(-8).toUpperCase()}
                        </span>
                      </td>
                      <td className="px-5 py-3.5">
                        <p className="text-xs font-bold text-slate-800 dark:text-slate-200">{order.customerName || "Walk-in"}</p>
                        {order.customerPhone && <p className="text-[10px] text-slate-400">{order.customerPhone}</p>}
                      </td>
                      <td className="px-5 py-3.5">
                        <span className="text-[10px] font-black uppercase tracking-wider text-slate-500 dark:text-slate-400">
                          {order.orderType || "—"}
                        </span>
                      </td>
                      <td className="px-5 py-3.5">
                        <span className={clsx("px-2 py-1 rounded-lg text-[10px] font-black uppercase", PAYMENT_STYLES[order.paymentMode] || "bg-slate-100 text-slate-500")}>
                          {order.paymentMode || "—"}
                        </span>
                      </td>
                      <td className="px-5 py-3.5">
                        <span className={clsx("px-2 py-1 rounded-lg text-[10px] font-black uppercase", STATUS_STYLES[order.status] || "bg-slate-100 text-slate-500")}>
                          {order.status}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 text-right">
                        <span className="text-sm font-black text-slate-900 dark:text-white">₹{(order.totalAmount || 0).toLocaleString()}</span>
                      </td>
                      <td className="px-5 py-3.5">
                        <p className="text-xs text-slate-500">
                          {order.createdAt ? new Date(order.createdAt).toLocaleString("en-IN", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" }) : "—"}
                        </p>
                      </td>
                      <td className="px-5 py-3.5">
                        <ChevronDown size={14} className={clsx("text-slate-400 transition-transform", expandedId === order.id && "rotate-180")} />
                      </td>
                    </tr>

                    {/* Expanded Items */}
                    {expandedId === order.id && (
                      <tr key={`${order.id}-detail`} className="bg-slate-50/80 dark:bg-white/2">
                        <td colSpan={8} className="px-8 py-4">
                          <div className="space-y-2">
                            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-3">Order Items</p>
                            {(order.items || order.orderItems || []).map((item: any, i: number) => (
                              <div key={i} className="flex items-center justify-between bg-white dark:bg-[#1c1f2a] rounded-xl px-4 py-2.5 border border-slate-200/60 dark:border-white/5">
                                <div>
                                  <p className="text-xs font-black text-slate-800 dark:text-slate-200">{item.name || item.productName || `Item ${i + 1}`}</p>
                                  <p className="text-[10px] text-slate-400">Qty: {item.quantity} × ₹{item.unitPrice || item.price || 0}</p>
                                </div>
                                <p className="text-sm font-black text-orange-500">₹{(item.totalPrice || (item.quantity * (item.unitPrice || item.price || 0))).toLocaleString()}</p>
                              </div>
                            ))}
                            <div className="flex justify-end gap-6 pt-2 text-xs font-bold text-slate-500 uppercase tracking-widest border-t border-slate-200 dark:border-white/10 mt-3 pt-3">
                              <span>Subtotal: <span className="text-slate-900 dark:text-white">₹{(order.subtotal || 0).toLocaleString()}</span></span>
                              <span>Tax: <span className="text-slate-900 dark:text-white">₹{(order.taxAmount || 0).toLocaleString()}</span></span>
                              <span className="text-orange-500">Total: ₹{(order.totalAmount || 0).toLocaleString()}</span>
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </>
                ))
              )}
            </tbody>
          </table>
        </div>

        {hasMore && (
          <div className="p-4 border-t border-slate-200/60 dark:border-white/5 text-center">
            <button
              onClick={() => { setPage(p => p + 1); fetchOrders(); }}
              disabled={loading}
              className="px-6 py-2.5 bg-slate-100 dark:bg-white/5 hover:bg-orange-50 dark:hover:bg-orange-500/10 text-slate-600 dark:text-slate-300 rounded-xl text-xs font-black uppercase tracking-widest transition-all"
            >
              {loading ? <Loader2 size={14} className="animate-spin inline" /> : "Load More"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
