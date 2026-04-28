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
    <div className="min-h-screen bg-zinc-950 text-white p-4 md:p-6">

      {/* Header */}
      <div className="flex items-start justify-between gap-4 mb-6">
        <div>
          <p className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em]">Franchise</p>
          <h1 className="text-2xl font-black text-white mt-0.5">Payments & Ledger</h1>
          <p className="text-sm text-zinc-500 mt-0.5">Track balances, pay outstanding orders</p>
        </div>
        <button
          onClick={fetchOrders}
          className="p-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 transition-colors"
        >
          <RefreshCw className={clsx("w-4 h-4 text-zinc-400", loading && "animate-spin")} />
        </button>
      </div>

      {/* Balance Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        {/* Outstanding */}
        <div className={clsx(
          "rounded-2xl border p-6",
          (totalUnpaid + totalPartial) > 0
            ? "bg-red-500/5 border-red-500/20"
            : "bg-zinc-900 border-zinc-800"
        )}>
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 rounded-xl bg-red-500/10 flex items-center justify-center">
              <AlertTriangle className="w-5 h-5 text-red-400" />
            </div>
            <TrendingDown className="w-4 h-4 text-red-400/60" />
          </div>
          <p className="text-[10px] text-zinc-500 uppercase tracking-[0.15em] font-bold">Outstanding Balance</p>
          <p className={clsx("text-3xl font-black mt-1", (totalUnpaid + totalPartial) > 0 ? "text-red-400" : "text-zinc-600")}>
            {fmt(totalUnpaid + totalPartial)}
          </p>
          <p className="text-xs text-zinc-600 mt-1">
            {deliveredOrders.filter((o: any) => o.paymentStatus !== "PAID").length} unpaid delivered orders
          </p>
          {(totalUnpaid + totalPartial) > 0 && (
            <Link
              href="/franchise-orders"
              className="mt-4 flex items-center gap-1.5 text-xs font-bold text-red-400 hover:text-red-300 transition-colors"
            >
              View Pending Orders <ArrowRight className="w-3 h-3" />
            </Link>
          )}
        </div>

        {/* Paid */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center">
              <CheckCircle2 className="w-5 h-5 text-emerald-400" />
            </div>
            <TrendingUp className="w-4 h-4 text-emerald-400/60" />
          </div>
          <p className="text-[10px] text-zinc-500 uppercase tracking-[0.15em] font-bold">Total Paid</p>
          <p className="text-3xl font-black mt-1 text-emerald-400">{fmt(totalPaid)}</p>
          <p className="text-xs text-zinc-600 mt-1">
            {deliveredOrders.filter((o: any) => o.paymentStatus === "PAID").length} paid orders
          </p>
          {lastPaymentOrder && (
            <p className="mt-2 text-[10px] text-zinc-600">
              Last: {new Date(lastPaymentOrder.updatedAt ?? lastPaymentOrder.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
              {" · "}{fmt(lastPaymentOrder.totalAmount ?? 0)}{" · "}{lastPaymentOrder.paymentType ?? "—"}
            </p>
          )}
        </div>

        {/* Total Orders Value */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center">
              <ShoppingCart className="w-5 h-5 text-blue-400" />
            </div>
            <Clock className="w-4 h-4 text-blue-400/60" />
          </div>
          <p className="text-[10px] text-zinc-500 uppercase tracking-[0.15em] font-bold">Total Orders Value</p>
          <p className="text-3xl font-black mt-1 text-blue-400">{fmt(totalValue)}</p>
          <p className="text-xs text-zinc-600 mt-1">{deliveredOrders.length} delivered orders</p>
          {totalValue > 0 && (
            <div className="mt-3">
              <div className="flex items-center justify-between text-[10px] text-zinc-600 mb-1">
                <span>Paid</span>
                <span>{totalValue > 0 ? Math.round((totalPaid / totalValue) * 100) : 0}%</span>
              </div>
              <div className="h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-emerald-500 rounded-full transition-all"
                  style={{ width: `${totalValue > 0 ? (totalPaid / totalValue) * 100 : 0}%` }}
                />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Pay Now CTA — only if outstanding */}
      {(totalUnpaid + totalPartial) > 0 && (
        <div className="bg-gradient-to-r from-orange-500/10 to-orange-600/5 border border-orange-500/20 rounded-2xl p-5 mb-6 flex items-center justify-between gap-4">
          <div>
            <p className="text-sm font-bold text-orange-300">You have outstanding payments</p>
            <p className="text-xs text-orange-400/60 mt-0.5">
              {fmt(totalUnpaid + totalPartial)} pending across {deliveredOrders.filter((o: any) => o.paymentStatus !== "PAID").length} orders
            </p>
          </div>
          <Link
            href="/franchise-orders"
            className="flex items-center gap-2 px-5 py-2.5 bg-orange-500 hover:bg-orange-400 text-white text-sm font-bold rounded-xl transition-colors shrink-0"
          >
            <CreditCard className="w-4 h-4" /> Pay Now
          </Link>
        </div>
      )}

      {/* Ledger Table */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-xs font-black text-zinc-400 uppercase tracking-[0.15em]">Order Payment History</h2>
          <div className="flex gap-1.5">
            {(["ALL", "UNPAID", "PAID", "PARTIAL"] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={clsx(
                  "px-3 py-1.5 rounded-lg text-xs font-bold border transition-colors",
                  filter === f
                    ? "bg-orange-500/20 border-orange-500/40 text-orange-300"
                    : "bg-zinc-900 border-zinc-800 text-zinc-500 hover:text-zinc-300"
                )}
              >
                {f}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-16 text-zinc-600">
            <RefreshCw className="w-5 h-5 animate-spin mr-2" /> Loading...
          </div>
        ) : displayOrders.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-zinc-600">
            <CreditCard className="w-10 h-10 mb-3 opacity-30" />
            <p className="text-sm">No orders found</p>
          </div>
        ) : (
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-zinc-800 text-zinc-500 text-[10px] uppercase tracking-[0.12em]">
                  <th className="px-4 py-3 text-left font-black">Order</th>
                  <th className="px-4 py-3 text-left font-black hidden md:table-cell">Items</th>
                  <th className="px-4 py-3 text-left font-black hidden sm:table-cell">Date</th>
                  <th className="px-4 py-3 text-right font-black">Amount</th>
                  <th className="px-4 py-3 text-center font-black">Order Status</th>
                  <th className="px-4 py-3 text-center font-black">Payment</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/70">
                {displayOrders.map((order: any) => {
                  const itemNames = (order.items ?? [])
                    .slice(0, 2)
                    .map((i: any) => i.product?.name ?? "Product")
                    .join(", ");
                  const payStatus = order.paymentStatus ?? "UNPAID";
                  const ordStatus = order.status;

                  return (
                    <tr key={order.id} className="hover:bg-zinc-800/40 transition-colors">
                      <td className="px-4 py-3">
                        <p className="font-mono text-zinc-400 text-xs">#{order.id.slice(-6).toUpperCase()}</p>
                        <p className="text-[10px] text-zinc-600 mt-0.5">{order.paymentType ?? "—"}</p>
                      </td>
                      <td className="px-4 py-3 text-zinc-400 hidden md:table-cell max-w-[160px]">
                        <p className="truncate text-xs">{itemNames || "—"}</p>
                        {order.items?.length > 2 && (
                          <p className="text-[10px] text-zinc-600">+{order.items.length - 2} more</p>
                        )}
                      </td>
                      <td className="px-4 py-3 text-zinc-500 text-xs hidden sm:table-cell">
                        {new Date(order.createdAt).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <span className="text-sm font-black text-white">{fmt(order.totalAmount ?? 0)}</span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className={clsx(
                          "inline-flex text-[10px] font-bold px-2 py-1 rounded-lg border",
                          ORDER_STATUS_STYLE[ordStatus] ?? ORDER_STATUS_STYLE.PENDING
                        )}>
                          {ordStatus}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className={clsx(
                          "inline-flex text-[10px] font-bold px-2 py-1 rounded-lg border",
                          PAYMENT_STATUS_STYLE[payStatus] ?? PAYMENT_STATUS_STYLE.UNPAID
                        )}>
                          {payStatus}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            {/* Footer total */}
            <div className="border-t border-zinc-800 px-4 py-3 flex items-center justify-between bg-zinc-900/50">
              <span className="text-[10px] text-zinc-600 font-bold uppercase tracking-wider">
                {displayOrders.length} order{displayOrders.length !== 1 ? "s" : ""}
              </span>
              <span className="text-sm font-black text-white">
                {fmt(displayOrders.reduce((s: number, o: any) => s + (o.totalAmount ?? 0), 0))}
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
