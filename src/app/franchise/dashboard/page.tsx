"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import {
  ShoppingCart, Package, AlertTriangle, TrendingUp,
  RefreshCw, ArrowRight, Clock, CheckCircle2, Truck,
  PackageCheck, CreditCard, ChevronRight, BarChart3,
  User, Undo2, Users, Receipt, Landmark, Send
} from "lucide-react";
import { clsx } from "clsx";
import { 
  franchiseOrdersApi, 
  productBatchesApi, 
  posApi, 
  inventoryApi, 
  dashboardApi 
} from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { useSearchParams } from "next/navigation";
import { franchiseApi } from "@/lib/api";

type FranchiseOrderStatus = "PENDING" | "APPROVED" | "IN_PRODUCTION" | "DISPATCHED" | "DELIVERED";
const STATUS_STEPS: FranchiseOrderStatus[] = ["PENDING", "APPROVED", "IN_PRODUCTION", "DISPATCHED", "DELIVERED"];
const STATUS_LABELS: Record<FranchiseOrderStatus, string> = {
  PENDING: "Pending",
  APPROVED: "Approved",
  IN_PRODUCTION: "In Production",
  DISPATCHED: "Dispatched",
  DELIVERED: "Delivered",
};

function fmt(n: number) {
  return "₹" + Math.round(n).toLocaleString("en-IN");
}

export default function FranchiseDashboardPage() {
  const { user } = useAuth();
  const searchParams = useSearchParams();
  const monitorId = searchParams.get("id");
  const [monitoredFranchise, setMonitoredFranchise] = useState<any>(null);

  const [summary, setSummary]           = useState<any>(null);
  const [franchiseOrders, setFranchiseOrders] = useState<any[]>([]);
  const [batches, setBatches]                 = useState<any[]>([]);
  const [loading, setLoading]                 = useState(true);

  const fetchAll = useCallback(async () => {
    setLoading(true);
    try {
      const fId = monitorId || undefined;
      
      const [summRes, foRes, bRes, fRes] = await Promise.allSettled([
        dashboardApi.getSummary({ franchiseId: fId }),
        franchiseOrdersApi.getAll({ franchiseId: fId }),
        productBatchesApi.getAll({ franchiseId: fId }),
        monitorId ? franchiseApi.getById(monitorId) : Promise.reject("No monitor ID"),
      ]);

      if (summRes.status === "fulfilled") setSummary(summRes.value.data);
      if (foRes.status === "fulfilled") setFranchiseOrders(foRes.value.data ?? []);
      if (bRes.status  === "fulfilled") setBatches(bRes.value.data ?? []);
      if (fRes.status  === "fulfilled") setMonitoredFranchise(fRes.value.data);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }, [monitorId]);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  // ── Derived Data ─────────────────────────────────────────────────────────────
  const expiryAlerts    = batches.filter((b: any) => b.expiryStatus === "EXPIRED" || b.expiryStatus === "EXPIRING_SOON");
  const lowStockCount   = summary?.lowStockCount ?? batches.filter((b: any) => b.quantity < 10).length;
  const activeOrders    = franchiseOrders.filter((o: any) => ["PENDING", "APPROVED", "IN_PRODUCTION", "DISPATCHED"].includes(o.status));
  const stockItems      = batches.slice(0, 8);

  return (
    <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500 py-8 px-4 pb-20">
      
      {/* ── Header ── */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-2">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2.5 bg-[#FF6B00]/10 rounded-xl">
              <BarChart3 size={24} className="text-[#FF6B00]" />
            </div>
            <h1 className="text-3xl font-black text-gray-900 dark:text-white tracking-tight">
              Franchise Distribution ERP
            </h1>
          </div>
          <p className="text-slate-500 dark:text-slate-400 font-medium text-sm">
            {monitorId && monitoredFranchise ? `Monitoring: ${monitoredFranchise.name}` : `Welcome back, ${user?.fullName ?? "Partner"}`}
          </p>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={fetchAll} 
            className="p-3 rounded-2xl border border-slate-200 dark:border-white/10 hover:bg-slate-50 dark:hover:bg-white/5 transition-all"
          >
            <RefreshCw size={18} className={clsx("text-slate-400", loading && "animate-spin")} />
          </button>
          <Link 
            href="/pos" 
            className="flex items-center gap-2 bg-[#FF6B00] hover:bg-[#e66000] text-white px-6 py-3 rounded-2xl text-sm font-bold shadow-lg shadow-orange-500/20 transition-all active:scale-95"
          >
            <Receipt size={18} /> New Sales Invoice
          </Link>
        </div>
      </div>

      {/* ── Expiry Alert Banner ── */}
      {expiryAlerts.length > 0 && (
        <div className="bg-red-50 border border-red-100 rounded-3xl p-5 flex items-center justify-between gap-4 animate-in slide-in-from-top-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-red-500/10 flex items-center justify-center shrink-0">
              <AlertTriangle className="w-6 h-6 text-red-500" />
            </div>
            <div>
              <p className="text-sm font-black text-red-900">Inventory Expiry Warning</p>
              <p className="text-xs text-red-600 font-medium mt-0.5">
                {expiryAlerts.length} batches require immediate attention or disposal.
              </p>
            </div>
          </div>
          <Link href="/production/batches" className="px-4 py-2 bg-white border border-red-100 text-red-500 text-xs font-black rounded-xl hover:bg-red-50 transition-all uppercase tracking-widest">
            Manage Stock
          </Link>
        </div>
      )}

      {/* ── Advanced Stats Grid ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {[
          { label: "Today's Sales", val: fmt(summary?.revenueToday ?? 0), sub: "Gross Billing", color: "bg-emerald-500", icon: TrendingUp },
          { label: "Outstanding", val: fmt(summary?.outstandingAmount ?? 0), sub: "Total Credit", color: "bg-red-500", icon: AlertTriangle },
          { label: "Pending Cheques", val: summary?.pendingChequesCount ?? 0, sub: fmt(summary?.pendingChequesValue ?? 0), color: "bg-blue-500", icon: Landmark },
          { label: "Sales Returns", val: fmt(summary?.salesReturnsToday ?? 0), sub: "Today's value", color: "bg-amber-500", icon: Undo2 },
          { label: "Low Stock", val: lowStockCount, sub: "Items to refill", color: "bg-orange-500", icon: Package },
          { label: "Dealers", val: summary?.dealerCount ?? 0, sub: "Active Network", color: "bg-purple-500", icon: Users },
        ].map((stat, i) => (
          <div key={i} className="bg-white dark:bg-card rounded-2xl border border-slate-100 dark:border-white/5 p-5 shadow-sm hover:shadow-md transition-all">
            <div className="flex items-center justify-between mb-3">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.15em]">{stat.label}</p>
              <stat.icon size={14} className="text-slate-300" />
            </div>
            <p className="text-2xl font-black text-slate-900 dark:text-white leading-none tracking-tight">{stat.val}</p>
            <p className="text-[10px] text-slate-400 font-bold mt-2 uppercase tracking-widest">{stat.sub}</p>
          </div>
        ))}
      </div>

      {/* ── Main Layout ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left: Inventory and Tracking */}
        <div className="lg:col-span-2 space-y-8">
          
          <div className="bg-white dark:bg-card rounded-[2.5rem] border border-slate-100 dark:border-white/5 p-8 shadow-sm">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h3 className="text-xl font-black text-slate-900 dark:text-white">Active Inventory</h3>
                <p className="text-xs text-slate-500 font-medium mt-1">Real-time stock availability and expiry tracking.</p>
              </div>
              <Link href="/franchise/stock" className="text-xs font-black text-[#FF6B00] uppercase tracking-widest hover:underline">
                View Full Stock
              </Link>
            </div>

            {loading ? (
              <div className="py-20 text-center text-slate-300 font-black uppercase tracking-widest text-xs animate-pulse">Syncing Data...</div>
            ) : stockItems.length === 0 ? (
              <div className="py-20 text-center bg-slate-50 dark:bg-white/[0.02] rounded-[2rem] border-2 border-dashed border-slate-200">
                <Package size={48} strokeWidth={1} className="mx-auto text-slate-200 mb-4" />
                <p className="text-slate-500 font-bold">No stock detected in branch.</p>
                <Link href="/franchise-orders" className="mt-4 inline-block text-[#FF6B00] font-black text-xs uppercase underline">Place first order</Link>
              </div>
            ) : (
              <div className="overflow-hidden rounded-2xl border border-slate-100 dark:border-white/5">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50 dark:bg-white/5">
                      <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Product</th>
                      <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Stock</th>
                      <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Expiry</th>
                      <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50 dark:divide-white/5">
                    {stockItems.map((batch: any) => (
                      <tr key={batch.id} className="hover:bg-slate-50/50 dark:hover:bg-white/[0.02] transition-colors">
                        <td className="px-6 py-4">
                          <p className="font-black text-slate-900 dark:text-white text-sm">{batch.product?.name}</p>
                          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tighter">Batch: {batch.batchNumber || "N/A"}</p>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <span className={clsx("text-sm font-black", batch.quantity < 10 ? "text-amber-500" : "text-slate-900 dark:text-white")}>
                            {batch.quantity}
                          </span>
                          <span className="text-[10px] text-slate-400 font-bold ml-1">{batch.product?.unit}</span>
                        </td>
                        <td className="px-6 py-4">
                          <p className="text-xs font-bold text-slate-600 dark:text-slate-400">
                            {batch.expiryDate ? new Date(batch.expiryDate).toLocaleDateString() : "No Expiry"}
                          </p>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <span className={clsx(
                            "px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border",
                            batch.expiryStatus === "EXPIRED" ? "bg-red-50 text-red-500 border-red-100" : 
                            batch.expiryStatus === "EXPIRING_SOON" ? "bg-amber-50 text-amber-500 border-amber-100" :
                            "bg-emerald-50 text-emerald-500 border-emerald-100"
                          )}>
                            {batch.expiryStatus === "NO_EXPIRY" ? "Valid" : batch.expiryStatus}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Shipment Pipeline */}
          {activeOrders.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.25em] ml-2">Shipment Pipeline</h3>
              <div className="space-y-3">
                {activeOrders.slice(0, 3).map((order: any) => (
                  <div key={order.id} className="bg-white dark:bg-card border border-slate-100 dark:border-white/5 rounded-[2rem] p-6 flex items-center gap-6 shadow-sm">
                    <div className="w-14 h-14 rounded-2xl bg-orange-50 dark:bg-orange-950/20 flex items-center justify-center text-[#FF6B00] shrink-0 border border-orange-100">
                      <Truck size={24} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-2">
                        <span className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-widest">Order #{order.id.slice(-6)}</span>
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">• {fmt(order.totalAmount)}</span>
                      </div>
                      <div className="h-1.5 w-full bg-slate-100 dark:bg-white/5 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-[#FF6B00] shadow-[0_0_10px_rgba(255,107,0,0.3)] transition-all duration-1000"
                          style={{ width: `${((STATUS_STEPS.indexOf(order.status) + 1) / STATUS_STEPS.length) * 100}%` }}
                        />
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-[10px] font-black text-[#FF6B00] uppercase tracking-widest">{STATUS_LABELS[order.status as FranchiseOrderStatus]}</p>
                      <p className="text-[9px] text-slate-400 font-bold mt-1 uppercase">ETA: {order.expectedDispatchDate ? new Date(order.expectedDispatchDate).toLocaleDateString() : "TBD"}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right: Quick Actions */}
        <div className="space-y-8">
          
          {/* Revenue Focus Card */}
          <div className="bg-gradient-to-br from-[#FF6B00] to-[#FF8C33] rounded-[2.5rem] p-8 shadow-xl shadow-orange-500/20 text-white relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 blur-2xl rounded-full -mr-16 -mt-16" />
            <div className="relative z-10">
              <div className="flex items-center gap-2 mb-6">
                <TrendingUp size={18} />
                <span className="text-[10px] font-black uppercase tracking-[0.2em]">Live Revenue</span>
              </div>
              <p className="text-4xl font-black tracking-tighter mb-1">{fmt(summary?.revenueToday ?? 0)}</p>
              <p className="text-xs font-bold opacity-80 uppercase tracking-widest">Today's Billing</p>
              
              <Link href="/reports" className="mt-8 flex items-center justify-center gap-2 w-full py-4 bg-white text-[#FF6B00] rounded-2xl text-xs font-black uppercase tracking-widest transition-all hover:bg-orange-50 active:scale-95 shadow-lg">
                Full Analytics <ArrowRight size={14} />
              </Link>
            </div>
          </div>

          {/* Operations Menu */}
          <div className="bg-white dark:bg-card border border-slate-100 dark:border-white/5 rounded-[2.5rem] p-8 shadow-sm">
            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.25em] mb-6">Operations</h3>
            <div className="space-y-1.5">
              {[
                { label: "Sales Invoice", href: "/pos", icon: Receipt, color: "text-blue-500", bg: "bg-blue-50" },
                { label: "Purchase Entry", href: "/purchases/inward", icon: PackageCheck, color: "text-purple-500", bg: "bg-purple-50" },
                { label: "Outstanding Ledger", href: "/accounting/ledgers", icon: Landmark, color: "text-red-500", bg: "bg-red-50" },
                { label: "Manage Partners", href: "/franchise/dealers", icon: Users, color: "text-emerald-500", bg: "bg-emerald-50" },
                { label: "Sales Requests", href: "/franchise-orders", icon: Send, color: "text-[#FF6B00]", bg: "bg-orange-50" },
              ].map((link) => (
                <Link 
                  key={link.label}
                  href={link.href}
                  className="group flex items-center justify-between p-4 bg-slate-50 dark:bg-white/[0.03] hover:bg-white border border-transparent hover:border-slate-100 rounded-2xl transition-all"
                >
                  <div className="flex items-center gap-4">
                    <div className={clsx("p-2 rounded-xl border border-transparent group-hover:border-slate-100 transition-all", link.color, link.bg, "dark:bg-slate-900")}>
                      <link.icon size={18} />
                    </div>
                    <span className="text-sm font-black text-slate-600 dark:text-zinc-400 group-hover:text-slate-900 transition-colors">{link.label}</span>
                  </div>
                  <ChevronRight size={16} className="text-slate-300 group-hover:text-[#FF6B00] transition-colors" />
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
