"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import {
  CreditCard, RefreshCw, AlertTriangle, CheckCircle2,
  Clock, ArrowRight, ShoppingCart, TrendingDown, TrendingUp,
} from "lucide-react";
import { clsx } from "clsx";
import { franchiseOrdersApi } from "@/lib/api";

const PAYMENT_STATUS_STYLE: Record<string, string> = {
  PAID:    "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
  UNPAID:  "bg-red-500/15    text-red-400    border-red-500/30",
  PARTIAL: "bg-amber-500/15  text-amber-400  border-amber-500/30",
};

const ORDER_STATUS_STYLE: Record<string, string> = {
  PENDING:       "bg-zinc-700/60 text-zinc-400 border-zinc-600/40",
  APPROVED:      "bg-blue-500/15 text-blue-400 border-blue-500/30",
  IN_PRODUCTION: "bg-violet-500/15 text-violet-400 border-violet-500/30",
  DISPATCHED:    "bg-orange-500/15 text-orange-400 border-orange-500/30",
  DELIVERED:     "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
};

function fmt(n: number) {
  return "₹" + Math.round(n).toLocaleString("en-IN");
}

export default function FranchisePaymentsPage() {
  const [orders, setOrders]   = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter]   = useState<"ALL" | "UNPAID" | "PAID" | "PARTIAL">("ALL");

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    try {
      const res = await franchiseOrdersApi.getAll();
      setOrders(res.data ?? []);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchOrders(); }, [fetchOrders]);

  // ── Aggregates ───────────────────────────────────────────────────────────────
  const deliveredOrders   = orders.filter((o: any) => o.status === "DELIVERED");
  const totalValue        = deliveredOrders.reduce((s: number, o: any) => s + (o.totalAmount ?? 0), 0);
  const totalPaid         = deliveredOrders.filter((o: any) => o.paymentStatus === "PAID")
                                           .reduce((s: number, o: any) => s + (o.totalAmount ?? 0), 0);
  const totalUnpaid       = deliveredOrders.filter((o: any) => o.paymentStatus === "UNPAID")
                                           .reduce((s: number, o: any) => s + (o.totalAmount ?? 0), 0);
  const totalPartial      = deliveredOrders.filter((o: any) => o.paymentStatus === "PARTIAL")
                                           .reduce((s: number, o: any) => s + (o.totalAmount ?? 0), 0);

  const displayOrders = orders.filter((o: any) => {
    if (filter === "ALL") return true;
    return o.paymentStatus === filter;
  });

  const lastPaymentOrder = [...deliveredOrders]
    .filter((o: any) => o.paymentStatus === "PAID")
    .sort((a: any, b: any) => new Date(b.updatedAt ?? b.createdAt).getTime() - new Date(a.updatedAt ?? a.createdAt).getTime())[0];

  return (
    <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500 py-8 px-4">
      
      {/* ── Header ── */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-2">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2.5 bg-[#FF6B00]/10 rounded-xl">
              <CreditCard size={24} className="text-[#FF6B00]" />
            </div>
            <h1 className="text-3xl font-black text-gray-900 dark:text-white tracking-tight">
              Payments & Ledger
            </h1>
          </div>
          <p className="text-slate-500 dark:text-slate-400 font-medium text-sm">
            Track branch balances, view payment history, and manage outstanding dues.
          </p>
        </div>
        <button 
          onClick={fetchOrders} 
          className="p-3 rounded-2xl border border-slate-200 dark:border-white/10 hover:bg-slate-50 dark:hover:bg-white/5 transition-all"
        >
          <RefreshCw size={18} className={clsx("text-slate-400", loading && "animate-spin")} />
        </button>
      </div>

      {/* ── Balance Summary Strip ── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { 
            label: "Outstanding Balance", 
            val: fmt(totalUnpaid + totalPartial), 
            sub: `${deliveredOrders.filter((o: any) => o.paymentStatus !== "PAID").length} pending orders`, 
            color: "bg-red-500",
            accent: (totalUnpaid + totalPartial) > 0 ? "text-red-500" : "text-slate-300"
          },
          { 
            label: "Total Paid", 
            val: fmt(totalPaid), 
            sub: "Delivered & Settled", 
            color: "bg-emerald-500",
            accent: "text-emerald-500"
          },
          { 
            label: "Total Order Value", 
            val: fmt(totalValue), 
            sub: `${deliveredOrders.length} delivered orders`, 
            color: "bg-blue-500",
            accent: "text-blue-500"
          },
        ].map((s, i) => (
          <div key={i} className="bg-white dark:bg-card rounded-2xl border border-slate-100 dark:border-white/5 p-6 shadow-sm">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">{s.label}</p>
            <div className="flex items-end justify-between">
              <div>
                <p className={clsx("text-3xl font-black tracking-tight leading-none", s.accent)}>{s.val}</p>
                <p className="text-[10px] text-slate-400 font-bold mt-2 uppercase tracking-widest">{s.sub}</p>
              </div>
              <div className={`w-1.5 h-8 rounded-full ${s.color} opacity-20`} />
            </div>
          </div>
        ))}
      </div>

      {/* ── Pay Now Alert ── */}
      {(totalUnpaid + totalPartial) > 0 && (
        <div className="bg-orange-50 border border-orange-100 rounded-3xl p-5 flex items-center justify-between gap-4 animate-in slide-in-from-top-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-[#FF6B00]/10 flex items-center justify-center shrink-0">
              <AlertTriangle className="w-6 h-6 text-[#FF6B00]" />
            </div>
            <div>
              <p className="text-sm font-black text-slate-900">Outstanding Dues Detected</p>
              <p className="text-xs text-[#FF6B00] font-medium mt-0.5">
                Please settle the pending amount to ensure uninterrupted supply.
              </p>
            </div>
          </div>
          <Link href="/franchise-orders" className="px-6 py-2.5 bg-[#FF6B00] text-white text-xs font-black rounded-xl hover:bg-[#e66000] shadow-lg shadow-orange-500/20 transition-all uppercase tracking-widest">
            Settle Ledger
          </Link>
        </div>
      )}

      {/* ── Ledger ── */}
      <div className="bg-white dark:bg-card border border-slate-100 dark:border-white/5 rounded-[2.5rem] p-8 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
          <h2 className="text-xl font-black text-slate-900 dark:text-white">Order History & Payments</h2>
          <div className="flex gap-1 bg-slate-50 dark:bg-white/5 p-1 rounded-xl border border-slate-100 dark:border-transparent overflow-x-auto">
            {(["ALL", "UNPAID", "PAID", "PARTIAL"] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={clsx(
                  "px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap",
                  filter === f
                    ? "bg-white dark:bg-card text-[#FF6B00] shadow-sm"
                    : "text-slate-400 hover:text-slate-600"
                )}
              >
                {f}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="py-20 text-center text-slate-300 font-black uppercase tracking-widest text-xs animate-pulse">Retrieving Financial Records...</div>
        ) : displayOrders.length === 0 ? (
          <div className="py-20 text-center bg-slate-50 dark:bg-white/[0.02] rounded-[2rem] border-2 border-dashed border-slate-200">
            <CreditCard size={48} strokeWidth={1} className="mx-auto text-slate-200 mb-4" />
            <p className="text-slate-500 font-bold">No payment records found for the selected filter.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-slate-400 text-[10px] font-black uppercase tracking-[0.2em] border-b border-slate-100 dark:border-white/5">
                  <th className="px-6 py-4 text-left">Order Reference</th>
                  <th className="px-6 py-4 text-left hidden md:table-cell">Details</th>
                  <th className="px-6 py-4 text-left hidden sm:table-cell">Settled Date</th>
                  <th className="px-6 py-4 text-right">Amount</th>
                  <th className="px-6 py-4 text-center">Payment Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-white/5">
                {displayOrders.map((order: any) => {
                  const payStatus = order.paymentStatus ?? "UNPAID";
                  return (
                    <tr key={order.id} className="group hover:bg-slate-50 dark:hover:bg-white/[0.02] transition-colors">
                      <td className="px-6 py-5">
                        <p className="font-black text-slate-900 dark:text-white uppercase tracking-tighter">#{order.id.slice(-6)}</p>
                        <p className="text-[10px] text-slate-400 font-bold uppercase mt-1">{order.paymentType || 'Standard'}</p>
                      </td>
                      <td className="px-6 py-5 hidden md:table-cell">
                        <p className="text-xs font-bold text-slate-600 dark:text-zinc-400 truncate max-w-[180px]">
                          {order.items?.length || 0} Products Delivered
                        </p>
                      </td>
                      <td className="px-6 py-5 hidden sm:table-cell text-xs text-slate-400 font-medium">
                        {new Date(order.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                      </td>
                      <td className="px-6 py-5 text-right">
                        <span className="font-black text-slate-900 dark:text-white">{fmt(order.totalAmount ?? 0)}</span>
                      </td>
                      <td className="px-6 py-5 text-center">
                        <span className={clsx(
                          "px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest border",
                          payStatus === "PAID" ? "bg-emerald-50 text-emerald-500 border-emerald-100" :
                          payStatus === "PARTIAL" ? "bg-amber-50 text-amber-500 border-amber-100" :
                          "bg-red-50 text-red-500 border-red-100"
                        )}>
                          {payStatus}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
