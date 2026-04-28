"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import {
  ShoppingCart, Package, AlertTriangle, TrendingUp,
  RefreshCw, ArrowRight, Clock, CheckCircle2, Truck,
  PackageCheck, CreditCard, ChevronRight, BarChart3,
} from "lucide-react";
import { clsx } from "clsx";
import { franchiseOrdersApi, productBatchesApi, posApi, inventoryApi } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";

type FranchiseOrderStatus = "PENDING" | "APPROVED" | "IN_PRODUCTION" | "DISPATCHED" | "DELIVERED";
const STATUS_STEPS: FranchiseOrderStatus[] = ["PENDING", "APPROVED", "IN_PRODUCTION", "DISPATCHED", "DELIVERED"];
const STATUS_LABELS: Record<FranchiseOrderStatus, string> = {
  PENDING: "Pending",
  APPROVED: "Approved",
  IN_PRODUCTION: "In Production",
  DISPATCHED: "Dispatched",
  DELIVERED: "Delivered",
};

const EXPIRY_BADGE: Record<string, string> = {
  EXPIRED:       "bg-red-500/15 text-red-400 border-red-500/30",
  EXPIRING_SOON: "bg-amber-500/15 text-amber-400 border-amber-500/30",
  VALID:         "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
  NO_EXPIRY:     "bg-zinc-700/60 text-zinc-400 border-zinc-600/40",
};

function fmt(n: number) {
  return "₹" + Math.round(n).toLocaleString("en-IN");
}
function isToday(d: string) {
  return new Date(d).toDateString() === new Date().toDateString();
}

export default function FranchiseDashboardPage() {
  const { user } = useAuth();
  const [franchiseOrders, setFranchiseOrders] = useState<any[]>([]);
  const [batches, setBatches]                 = useState<any[]>([]);
  const [salesOrders, setSalesOrders]         = useState<any[]>([]);
  const [loading, setLoading]                 = useState(true);

  const fetchAll = useCallback(async () => {
    setLoading(true);
    try {
      const [foRes, bRes, soRes] = await Promise.allSettled([
        franchiseOrdersApi.getAll(),
        productBatchesApi.getAll(),
        posApi.getOrders({ take: 100 }),
      ]);
      if (foRes.status === "fulfilled") setFranchiseOrders(foRes.value.data ?? []);
      if (bRes.status  === "fulfilled") setBatches(bRes.value.data ?? []);
      if (soRes.status === "fulfilled") setSalesOrders(soRes.value.data ?? []);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  // ── Stats ────────────────────────────────────────────────────────────────────
  const todaySales      = salesOrders.filter((o: any) => isToday(o.createdAt)).reduce((s: number, o: any) => s + (o.totalAmount ?? 0), 0);
  const todayOrderCount = salesOrders.filter((o: any) => isToday(o.createdAt)).length;
  const pendingCount    = franchiseOrders.filter((o: any) => ["PENDING", "APPROVED"].includes(o.status)).length;
  const activeOrders    = franchiseOrders.filter((o: any) => ["PENDING", "APPROVED", "IN_PRODUCTION", "DISPATCHED"].includes(o.status));

  const expiryAlerts    = batches.filter((b: any) => b.expiryStatus === "EXPIRED" || b.expiryStatus === "EXPIRING_SOON");
  const lowStockBatches = batches.filter((b: any) => b.quantity < 10);
  const stockItems      = batches.slice(0, 6);

  const pendingPayment  = franchiseOrders
    .filter((o: any) => o.paymentStatus === "UNPAID" && o.status === "DELIVERED")
    .reduce((s: number, o: any) => s + (o.totalAmount ?? 0), 0);
  const totalOrderValue = franchiseOrders.reduce((s: number, o: any) => s + (o.totalAmount ?? 0), 0);

  return (
    <div className="min-h-screen bg-zinc-950 text-white p-4 md:p-6 space-y-6">

      {/* ── Header ── */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em]">Franchise Dashboard</p>
          <h1 className="text-2xl font-black text-white mt-0.5">
            Welcome, {user?.fullName?.split(" ")[0] ?? "Franchise"} 👋
          </h1>
          <p className="text-sm text-zinc-500 mt-0.5">
            {new Date().toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
          </p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={fetchAll}
            className="p-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 transition-colors"
            title="Refresh"
          >
            <RefreshCw className={clsx("w-4 h-4 text-zinc-400", loading && "animate-spin")} />
          </button>
          <Link
            href="/franchise-orders"
            className="flex items-center gap-2 px-4 py-2.5 bg-orange-500 hover:bg-orange-400 text-white text-sm font-bold rounded-xl transition-colors"
          >
            <ShoppingCart className="w-4 h-4" />
            New Order
          </Link>
        </div>
      </div>

      {/* ── Expiry Alert Banner ── */}
      {expiryAlerts.length > 0 && (
        <div className="bg-red-500/10 border border-red-500/30 rounded-2xl p-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-red-500/20 flex items-center justify-center shrink-0">
              <AlertTriangle className="w-5 h-5 text-red-400" />
            </div>
            <div>
              <p className="text-sm font-bold text-red-300">
                {expiryAlerts.filter((b) => b.expiryStatus === "EXPIRED").length > 0 && (
                  <span>{expiryAlerts.filter((b) => b.expiryStatus === "EXPIRED").length} batch(es) EXPIRED · </span>
                )}
                {expiryAlerts.filter((b) => b.expiryStatus === "EXPIRING_SOON").length > 0 && (
                  <span>{expiryAlerts.filter((b) => b.expiryStatus === "EXPIRING_SOON").length} batch(es) expiring soon</span>
                )}
              </p>
              <p className="text-xs text-red-400/70 mt-0.5">
                {expiryAlerts.slice(0, 3).map((b: any) => b.product?.name).filter(Boolean).join(", ")}
                {expiryAlerts.length > 3 && ` +${expiryAlerts.length - 3} more`}
              </p>
            </div>
          </div>
          <Link
            href="/production/batches"
            className="text-xs font-bold text-red-400 hover:text-red-300 flex items-center gap-1 shrink-0"
          >
            View All <ArrowRight className="w-3 h-3" />
          </Link>
        </div>
      )}

      {/* ── Stats Grid ── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          {
            label: "Today Sales",
            value: fmt(todaySales),
            sub: `${todayOrderCount} transactions`,
            icon: TrendingUp,
            color: "text-emerald-400",
            bg: "bg-emerald-500/10",
            border: "border-emerald-500/20",
          },
          {
            label: "Orders Today",
            value: String(todayOrderCount),
            sub: "via POS",
            icon: ShoppingCart,
            color: "text-blue-400",
            bg: "bg-blue-500/10",
            border: "border-blue-500/20",
          },
          {
            label: "Low Stock",
            value: String(lowStockBatches.length),
            sub: lowStockBatches.length > 0 ? "needs reorder" : "all good",
            icon: AlertTriangle,
            color: lowStockBatches.length > 0 ? "text-amber-400" : "text-zinc-600",
            bg: lowStockBatches.length > 0 ? "bg-amber-500/10" : "bg-zinc-800/60",
            border: lowStockBatches.length > 0 ? "border-amber-500/20" : "border-zinc-700/50",
          },
          {
            label: "Pending Orders",
            value: String(pendingCount),
            sub: "to home house",
            icon: Clock,
            color: pendingCount > 0 ? "text-orange-400" : "text-zinc-600",
            bg: pendingCount > 0 ? "bg-orange-500/10" : "bg-zinc-800/60",
            border: pendingCount > 0 ? "border-orange-500/20" : "border-zinc-700/50",
          },
        ].map((s) => (
          <div key={s.label} className={clsx("bg-zinc-900 rounded-2xl border p-5", s.border)}>
            <div className={clsx("w-9 h-9 rounded-xl flex items-center justify-center mb-3", s.bg)}>
              <s.icon className={clsx("w-4 h-4", s.color)} />
            </div>
            <p className="text-[10px] text-zinc-500 uppercase tracking-[0.15em] font-bold">{s.label}</p>
            <p className={clsx("text-2xl font-black mt-1", s.color)}>{s.value}</p>
            <p className="text-[11px] text-zinc-600 mt-0.5">{s.sub}</p>
          </div>
        ))}
      </div>

      {/* ── Main 2-col layout ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* LEFT 2/3: Stock + Active Orders */}
        <div className="lg:col-span-2 space-y-6">

          {/* Stock Panel */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-xs font-black text-zinc-400 uppercase tracking-[0.15em]">📦 Stock to Sell</h2>
              <Link href="/franchise/stock" className="text-xs font-bold text-orange-400 hover:text-orange-300 flex items-center gap-1">
                View All <ArrowRight className="w-3 h-3" />
              </Link>
            </div>

            {loading ? (
              <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 text-center text-zinc-600 text-sm">
                Loading stock...
              </div>
            ) : stockItems.length === 0 ? (
              <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-8 text-center">
                <Package className="w-10 h-10 mx-auto text-zinc-700 mb-3" />
                <p className="text-sm text-zinc-500 mb-4">No product batches available</p>
                <Link
                  href="/franchise-orders"
                  className="inline-flex items-center gap-2 px-4 py-2 bg-orange-500 hover:bg-orange-400 text-white text-xs font-bold rounded-xl transition-colors"
                >
                  <ShoppingCart className="w-3.5 h-3.5" /> Order from Home
                </Link>
              </div>
            ) : (
              <div className="space-y-2">
                {stockItems.map((batch: any) => {
                  const status = batch.expiryStatus ?? "NO_EXPIRY";
                  const isLow  = batch.quantity < 10;
                  return (
                    <div
                      key={batch.id}
                      className="bg-zinc-900 border border-zinc-800 hover:border-zinc-700 rounded-2xl p-4 flex items-center justify-between gap-4 transition-colors"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-10 h-10 rounded-xl bg-zinc-800 flex items-center justify-center shrink-0">
                          <Package className="w-5 h-5 text-zinc-500" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-bold text-white truncate">
                            {batch.product?.name ?? "Unknown Product"}
                          </p>
                          <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                            <span className={clsx("text-xs font-bold", isLow ? "text-amber-400" : "text-zinc-400")}>
                              {batch.quantity} {batch.product?.unit ?? "units"}
                              {isLow && <span className="ml-1">⚠️</span>}
                            </span>
                            {batch.expiryDate && (
                              <>
                                <span className="text-zinc-700">·</span>
                                <span className="text-xs text-zinc-500">
                                  Exp: {new Date(batch.expiryDate).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
                                </span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <span className={clsx(
                          "text-[10px] font-bold px-2 py-1 rounded-lg border hidden sm:inline-flex",
                          EXPIRY_BADGE[status] ?? EXPIRY_BADGE.NO_EXPIRY
                        )}>
                          {status === "NO_EXPIRY" ? "Safe" : status === "EXPIRING_SOON" ? "Exp. Soon" : status}
                        </span>
                        <Link
                          href="/franchise-orders"
                          className="px-3 py-1.5 bg-orange-500/10 hover:bg-orange-500/20 border border-orange-500/20 text-orange-400 text-xs font-bold rounded-lg transition-colors whitespace-nowrap"
                        >
                          Order More
                        </Link>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Active Order Tracking */}
          {activeOrders.length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-xs font-black text-zinc-400 uppercase tracking-[0.15em]">🚚 Active Orders</h2>
                <Link href="/franchise-orders" className="text-xs font-bold text-orange-400 hover:text-orange-300 flex items-center gap-1">
                  All Orders <ArrowRight className="w-3 h-3" />
                </Link>
              </div>
              <div className="space-y-3">
                {activeOrders.slice(0, 4).map((order: any) => {
                  const stepIdx = STATUS_STEPS.indexOf(order.status as FranchiseOrderStatus);
                  const isDelayed =
                    order.expectedDispatchDate &&
                    new Date(order.expectedDispatchDate) < new Date() &&
                    !["DISPATCHED", "DELIVERED"].includes(order.status);

                  const itemNames = (order.items ?? [])
                    .slice(0, 2)
                    .map((i: any) => i.product?.name ?? i.productName ?? "Product")
                    .join(", ");

                  return (
                    <div key={order.id} className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4">
                      {/* Row 1: ID + items + amount */}
                      <div className="flex items-start justify-between gap-2 mb-3">
                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-xs font-mono text-zinc-500">
                              #{order.id.slice(-6).toUpperCase()}
                            </span>
                            {isDelayed && (
                              <span className="text-[10px] font-bold text-red-400 bg-red-500/10 border border-red-500/20 px-1.5 py-0.5 rounded-md">
                                ⚠️ DELAYED
                              </span>
                            )}
                            {order.paymentType === "COD" && (
                              <span className="text-[10px] font-bold text-zinc-500 bg-zinc-800 border border-zinc-700 px-1.5 py-0.5 rounded-md">
                                COD
                              </span>
                            )}
                          </div>
                          {itemNames && (
                            <p className="text-xs text-zinc-400 mt-1 truncate max-w-[280px]">{itemNames}</p>
                          )}
                        </div>
                        <span className="text-sm font-black text-white shrink-0">{fmt(order.totalAmount ?? 0)}</span>
                      </div>

                      {/* Status Pipeline */}
                      <div className="flex items-center">
                        {STATUS_STEPS.map((step, i) => {
                          const isPast    = i < stepIdx;
                          const isCurrent = i === stepIdx;
                          return (
                            <div key={step} className="flex items-center flex-1">
                              {i > 0 && (
                                <div className={clsx("h-1 flex-1 rounded-full transition-all", isPast || isCurrent ? "bg-orange-500" : "bg-zinc-700")} />
                              )}
                              <div className={clsx(
                                "w-2.5 h-2.5 rounded-full shrink-0 transition-all",
                                isCurrent
                                  ? "bg-orange-500 ring-2 ring-orange-500/30 ring-offset-1 ring-offset-zinc-900"
                                  : isPast ? "bg-orange-500" : "bg-zinc-700"
                              )} />
                              {i < STATUS_STEPS.length - 1 && (
                                <div className={clsx("h-1 flex-1 rounded-full", isPast ? "bg-orange-500" : "bg-zinc-700")} />
                              )}
                            </div>
                          );
                        })}
                      </div>

                      {/* Row 3: Current status + expected date */}
                      <div className="flex items-center justify-between mt-2">
                        <span className="text-[11px] font-bold text-orange-400">
                          {STATUS_LABELS[order.status as FranchiseOrderStatus]}
                        </span>
                        {order.expectedDispatchDate ? (
                          <span className="text-[10px] text-zinc-600">
                            Expected: {new Date(order.expectedDispatchDate).toLocaleDateString("en-IN", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}
                          </span>
                        ) : (
                          <span className="text-[10px] text-zinc-700">No dispatch date set</span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* RIGHT 1/3: Payment + Actions + Sales */}
        <div className="space-y-4">

          {/* Payment Summary */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5">
            <div className="flex items-center gap-2 mb-4">
              <CreditCard className="w-4 h-4 text-zinc-500" />
              <h3 className="text-xs font-black text-zinc-400 uppercase tracking-[0.15em]">💰 Payments</h3>
            </div>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs text-zinc-500">Pending Payment</span>
                <span className={clsx("text-sm font-black", pendingPayment > 0 ? "text-red-400" : "text-zinc-500")}>
                  {fmt(pendingPayment)}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-zinc-500">Total Orders Value</span>
                <span className="text-sm font-bold text-zinc-300">{fmt(totalOrderValue)}</span>
              </div>
              {pendingPayment > 0 && (
                <div className="pt-1 border-t border-zinc-800">
                  <p className="text-[10px] text-zinc-600 mb-2">Last delivered order unpaid</p>
                </div>
              )}
            </div>
            {pendingPayment > 0 && (
              <Link
                href="/franchise/payments"
                className="mt-3 w-full flex items-center justify-center gap-2 py-2.5 bg-orange-500 hover:bg-orange-400 text-white text-xs font-bold rounded-xl transition-colors"
              >
                <CreditCard className="w-3.5 h-3.5" /> Pay Now
              </Link>
            )}
            <Link
              href="/franchise/payments"
              className="mt-2 w-full flex items-center justify-center gap-1 py-2 text-xs font-medium text-zinc-600 hover:text-zinc-300 transition-colors"
            >
              View Full Ledger <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          {/* Quick Actions */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5">
            <h3 className="text-xs font-black text-zinc-400 uppercase tracking-[0.15em] mb-3">Quick Actions</h3>
            <div className="space-y-1.5">
              {[
                { label: "Place New Order",  href: "/franchise-orders",    icon: ShoppingCart, accent: "text-orange-400" },
                { label: "Track Deliveries", href: "/franchise-orders",    icon: Truck,        accent: "text-blue-400" },
                { label: "View Stock",       href: "/franchise/stock",     icon: Package,      accent: "text-emerald-400" },
                { label: "Expiry Alerts",    href: "/production/batches",  icon: AlertTriangle, accent: expiryAlerts.length > 0 ? "text-red-400" : "text-zinc-600" },
                { label: "Sales Reports",    href: "/reports",             icon: BarChart3,    accent: "text-violet-400" },
              ].map((a) => (
                <Link
                  key={a.label}
                  href={a.href}
                  className="flex items-center justify-between px-3 py-2.5 rounded-xl bg-zinc-800/60 hover:bg-zinc-800 transition-colors group"
                >
                  <div className="flex items-center gap-2.5">
                    <a.icon className={clsx("w-4 h-4", a.accent)} />
                    <span className="text-sm text-zinc-400 group-hover:text-white transition-colors">{a.label}</span>
                  </div>
                  <ChevronRight className="w-3.5 h-3.5 text-zinc-700 group-hover:text-zinc-500 transition-colors" />
                </Link>
              ))}
            </div>
          </div>

          {/* Sales Mini */}
          <div className="bg-gradient-to-br from-orange-500/10 via-orange-600/5 to-transparent border border-orange-500/20 rounded-2xl p-5">
            <div className="flex items-center gap-2 mb-1">
              <BarChart3 className="w-4 h-4 text-orange-400" />
              <h3 className="text-xs font-black text-orange-400/80 uppercase tracking-[0.15em]">📊 Today Sales</h3>
            </div>
            <p className="text-3xl font-black text-white mt-2">{fmt(todaySales)}</p>
            <p className="text-xs text-zinc-500 mt-1">{todayOrderCount} order{todayOrderCount !== 1 ? "s" : ""} · via POS</p>
            <Link
              href="/reports"
              className="mt-4 flex items-center gap-1 text-xs font-bold text-orange-400 hover:text-orange-300 transition-colors"
            >
              Full Reports <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          {/* Batch Expiry Summary */}
          {expiryAlerts.length > 0 && (
            <div className="bg-zinc-900 border border-red-500/20 rounded-2xl p-4">
              <div className="flex items-center gap-2 mb-3">
                <PackageCheck className="w-4 h-4 text-red-400" />
                <h3 className="text-xs font-black text-red-400/80 uppercase tracking-[0.15em]">⏰ Expiry Alerts</h3>
              </div>
              <div className="space-y-2">
                {expiryAlerts.slice(0, 4).map((b: any) => (
                  <div key={b.id} className="flex items-center justify-between gap-2">
                    <span className="text-xs text-zinc-300 truncate">{b.product?.name ?? "Product"}</span>
                    <span className={clsx(
                      "text-[10px] font-bold px-2 py-0.5 rounded border shrink-0",
                      b.expiryStatus === "EXPIRED" ? "bg-red-500/10 text-red-400 border-red-500/20" : "bg-amber-500/10 text-amber-400 border-amber-500/20"
                    )}>
                      {b.expiryStatus === "EXPIRED" ? "EXPIRED" : "Exp. Soon"}
                    </span>
                  </div>
                ))}
              </div>
              <Link href="/production/batches" className="mt-3 flex items-center gap-1 text-xs font-bold text-red-400 hover:text-red-300">
                View All <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
