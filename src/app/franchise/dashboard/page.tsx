"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import {
  ShoppingCart, Package, AlertTriangle, TrendingUp,
  RefreshCw, ArrowRight, Clock, CheckCircle2, Truck,
  PackageCheck, CreditCard, ChevronRight, BarChart3,
  User,
} from "lucide-react";
import { clsx } from "clsx";
import { franchiseOrdersApi, productBatchesApi, posApi, inventoryApi } from "@/lib/api";
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
  const searchParams = useSearchParams();
  const monitorId = searchParams.get("id");
  const [monitoredFranchise, setMonitoredFranchise] = useState<any>(null);

  const [franchiseOrders, setFranchiseOrders] = useState<any[]>([]);
  const [batches, setBatches]                 = useState<any[]>([]);
  const [salesOrders, setSalesOrders]         = useState<any[]>([]);
  const [loading, setLoading]                 = useState(true);

  const fetchAll = useCallback(async () => {
    setLoading(true);
    try {
      const fId = monitorId || undefined;
      
      const [foRes, bRes, soRes, fRes] = await Promise.allSettled([
        franchiseOrdersApi.getAll({ franchiseId: fId }),
        productBatchesApi.getAll({ franchiseId: fId }),
        posApi.getOrders({ franchiseId: fId, take: 100 }),
        monitorId ? franchiseApi.getById(monitorId) : Promise.reject("No monitor ID"),
      ]);

      if (foRes.status === "fulfilled") setFranchiseOrders(foRes.value.data ?? []);
      if (bRes.status  === "fulfilled") setBatches(bRes.value.data ?? []);
      if (soRes.status === "fulfilled") setSalesOrders(soRes.value.data ?? []);
      if (fRes.status  === "fulfilled") setMonitoredFranchise(fRes.value.data);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }, [monitorId]);

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
    <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500 py-8 px-4">
      
      {/* ── Header ── */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-2">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2.5 bg-[#FF6B00]/10 rounded-xl">
              <BarChart3 size={24} className="text-[#FF6B00]" />
            </div>
            <h1 className="text-3xl font-black text-gray-900 dark:text-white tracking-tight">
              Branch Dashboard
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
            href="/franchise-orders" 
            className="flex items-center gap-2 bg-[#FF6B00] hover:bg-[#e66000] text-white px-6 py-3 rounded-2xl text-sm font-bold shadow-lg shadow-orange-500/20 transition-all active:scale-95"
          >
            <ShoppingCart size={18} /> New Stock Order
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

      {/* ── Stats Grid (Matches Franchise Page) ── */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { label: "Today Revenue", val: fmt(todaySales), sub: `${todayOrderCount} sales`, color: "bg-emerald-500" },
          { label: "Pending Supply", val: pendingCount, sub: "Inbound orders", color: "bg-[#FF6B00]" },
          { label: "Low Stock Items", val: lowStockBatches.length, sub: "Below 10 units", color: "bg-amber-500" },
          { label: "Unpaid Deliveries", val: fmt(pendingPayment), sub: "Payable amount", color: "bg-red-500" },
        ].map((stat, i) => (
          <div key={i} className="bg-white dark:bg-card rounded-2xl border border-slate-100 dark:border-white/5 p-6 shadow-sm hover:shadow-md transition-all">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">{stat.label}</p>
            <div className="flex items-end justify-between">
              <div>
                <p className="text-3xl font-black text-slate-900 dark:text-white leading-none">{stat.val}</p>
                <p className="text-[10px] text-slate-400 font-bold mt-2 uppercase tracking-widest">{stat.sub}</p>
              </div>
              <div className={`w-1.5 h-8 rounded-full ${stat.color} opacity-20`} />
            </div>
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
                <p className="text-xs text-slate-500 font-medium mt-1">Batches currently available for sale.</p>
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
              <div className="grid gap-3">
                {stockItems.map((batch: any) => (
                  <div key={batch.id} className="group flex items-center justify-between p-5 bg-slate-50 dark:bg-white/[0.03] hover:bg-white border border-transparent hover:border-[#FF6B00]/20 rounded-[1.5rem] transition-all">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-white/10 flex items-center justify-center text-slate-400 group-hover:text-[#FF6B00] transition-colors shadow-sm">
                        <Package size={20} />
                      </div>
                      <div>
                        <p className="font-black text-slate-900 dark:text-white text-sm">{batch.product?.name}</p>
                        <p className={clsx("text-xs font-bold", batch.quantity < 10 ? "text-amber-500" : "text-slate-400")}>
                          {batch.quantity} {batch.product?.unit} available
                        </p>
                      </div>
                    </div>
                    <div className={clsx(
                      "px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest border shadow-sm",
                      batch.expiryStatus === "EXPIRED" ? "bg-red-50 text-red-500 border-red-100" : 
                      batch.expiryStatus === "EXPIRING_SOON" ? "bg-amber-50 text-amber-500 border-amber-100" :
                      "bg-emerald-50 text-emerald-500 border-emerald-100"
                    )}>
                      {batch.expiryStatus === "NO_EXPIRY" ? "Valid" : batch.expiryStatus}
                    </div>
                  </div>
                ))}
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

        {/* Right: Quick Stats and Actions */}
        <div className="space-y-8">
          
          {/* Revenue Focus Card */}
          <div className="bg-gradient-to-br from-[#FF6B00] to-[#FF8C33] rounded-[2.5rem] p-8 shadow-xl shadow-orange-500/20 text-white relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 blur-2xl rounded-full -mr-16 -mt-16" />
            <div className="relative z-10">
              <div className="flex items-center gap-2 mb-6">
                <TrendingUp size={18} />
                <span className="text-[10px] font-black uppercase tracking-[0.2em]">Live Revenue</span>
              </div>
              <p className="text-4xl font-black tracking-tighter mb-1">{fmt(todaySales)}</p>
              <p className="text-xs font-bold opacity-80 uppercase tracking-widest">Generated Today</p>
              
              <Link href="/reports" className="mt-8 flex items-center justify-center gap-2 w-full py-4 bg-white text-[#FF6B00] rounded-2xl text-xs font-black uppercase tracking-widest transition-all hover:bg-orange-50 active:scale-95 shadow-lg">
                View Reports <ArrowRight size={14} />
              </Link>
            </div>
          </div>

          {/* Quick Actions Menu */}
          <div className="bg-white dark:bg-card border border-slate-100 dark:border-white/5 rounded-[2.5rem] p-8 shadow-sm">
            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.25em] mb-6">Operations</h3>
            <div className="space-y-1.5">
              {[
                { label: "Sales Terminal", href: "/pos", icon: ShoppingCart, color: "text-blue-500", bg: "bg-blue-50" },
                { label: "Restock Stock", href: "/franchise-orders", icon: Package, color: "text-[#FF6B00]", bg: "bg-orange-50" },
                { label: "Branch Ledger", href: "/franchise/payments", icon: CreditCard, color: "text-emerald-500", bg: "bg-emerald-50" },
                { label: "Manage Staff", href: "/franchise", icon: User, color: "text-purple-500", bg: "bg-purple-50" },
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
