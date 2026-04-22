"use client";

import { useState, useEffect, useCallback, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  Package, Send, CheckCircle2, Clock,
  TrendingUp, RefreshCw, ArrowRight,
  ShoppingCart, AlertTriangle, Layers, Eye,
} from "lucide-react";
import { clsx } from "clsx";
import {
  franchiseProductRequestsApi,
  inventoryApi,
  posApi,
} from "@/lib/api";
import { useAuth } from "@/context/AuthContext";

const STATUS_STYLES: Record<string, string> = {
  PENDING:  "bg-amber-100 text-amber-700 dark:bg-amber-900/20 dark:text-amber-400",
  APPROVED: "bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400",
  REJECTED: "bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-400",
  FULFILLED:"bg-emerald-100 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400",
};

function fmt(n: number) {
  return "₹" + Math.round(n).toLocaleString("en-IN");
}

export default function FranchiseDashboardPage() {
  return (
    <Suspense fallback={<div className="p-10 text-center font-bold animate-pulse">Initializing Dashboard...</div>}>
      <FranchiseDashboard />
    </Suspense>
  );
}

function FranchiseDashboard() {
  const { user } = useAuth();
  const searchParams = useSearchParams();
  const monitorId = searchParams.get("id");

  const [requests, setRequests] = useState<any[]>([]);
  const [stock, setStock]       = useState<any[]>([]);
  const [orders, setOrders]     = useState<any[]>([]);
  const [loading, setLoading]   = useState(true);

  // Determine active franchiseId
  const activeFid = (user?.role === "SUPER_ADMIN" && monitorId) ? monitorId : user?.franchiseId;
  const isMonitoring = !!(user?.role === "SUPER_ADMIN" && monitorId);

  const fetchAll = useCallback(async () => {
    if (!activeFid) return;
    setLoading(true);
    try {
      const [rRes, sRes, oRes] = await Promise.allSettled([
        franchiseProductRequestsApi.getAll(),
        inventoryApi.getInventory(activeFid),
        posApi.getOrders({ franchiseId: activeFid, take: 10 }),
      ]);
      if (rRes.status === "fulfilled") {
        // Filter requests by franchise if Super Admin monitoring
        const rawReq = rRes.value.data ?? [];
        setRequests(isMonitoring ? rawReq.filter((r: any) => r.franchiseId === activeFid) : rawReq);
      }
      if (sRes.status === "fulfilled") setStock(sRes.value.data ?? []);
      if (oRes.status === "fulfilled") setOrders(oRes.value.data ?? []);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }, [activeFid, isMonitoring]);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const pending    = requests.filter((r) => r.status === "PENDING").length;
  const approved   = requests.filter((r) => r.status === "APPROVED").length;
  const lowStock   = stock.filter((s: any) => s.currentStock <= s.minimumStock).length;
  const todaySales = orders
    .filter((o: any) => new Date(o.createdAt).toDateString() === new Date().toDateString())
    .reduce((s: number, o: any) => s + (o.totalAmount ?? 0), 0);

  const quickActions = [
    { label: "Request Products",  icon: Send,         href: "/franchise/requests", color: "bg-orange-500" },
    { label: "View Stock",        icon: Layers,       href: "/inventory/stock",    color: "bg-indigo-500" },
    { label: "New Sale (POS)",    icon: ShoppingCart, href: "/pos",                color: "bg-emerald-500" },
    { label: "My Requests",       icon: Package,      href: "/franchise/requests", color: "bg-amber-500" },
  ];

  return (
    <div className="min-h-full bg-[#F8FAFC] dark:bg-[#090a0f] p-4 md:p-6 space-y-6">

      {isMonitoring && (
        <div className="bg-orange-500 text-white px-6 py-4 rounded-2xl shadow-lg shadow-orange-500/30 flex items-center justify-between border-2 border-white/20 animate-in slide-in-from-top duration-500">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center animate-pulse">
              <Eye size={18} />
            </div>
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.2em] opacity-80">GOD-MODE MONITORING</p>
              <h2 className="text-lg font-black tracking-tight italic">Analyzing Branch: {activeFid}</h2>
            </div>
          </div>
          <Link href="/franchise" className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-xl text-xs font-black uppercase transition-all backdrop-blur-md">
            Exit Viewing
          </Link>
        </div>
      )}

      {/* Welcome header */}
      <div className="bg-white dark:bg-[#12141c] rounded-2xl border border-slate-200/60 dark:border-white/5 p-6 flex items-center justify-between">
        <div>
          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
            {isMonitoring ? "EXTERNAL OBSERVATION" : "Franchise Dashboard"}
          </p>
          <h1 className="text-2xl font-black text-gray-900 dark:text-white mt-1">
            {isMonitoring ? "Franchise Activity Node" : `Welcome back, ${user?.fullName?.split(" ")[0] ?? "Franchise Admin"} 👋`}
          </h1>
          <p className="text-sm text-gray-500 dark:text-slate-400 mt-1 font-medium">
            {activeFid ? `ID: ${activeFid.slice(0, 8)}` : "Your Franchise"} · Real-time Operational Stream
          </p>
        </div>
        <button onClick={fetchAll} className="p-2 rounded-xl border border-gray-200 dark:border-white/10 hover:bg-gray-50 dark:hover:bg-white/5 transition-all group">
          <RefreshCw size={16} className={clsx("text-gray-400 transition-transform duration-700 group-hover:rotate-180", loading && "animate-spin")} />
        </button>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Today's Sales",      value: fmt(todaySales), icon: TrendingUp,    color: "text-indigo-500",  bg: "bg-indigo-50 dark:bg-indigo-500/10" },
          { label: "Pending Requests",   value: String(pending),  icon: Clock,        color: "text-amber-500",   bg: "bg-amber-50 dark:bg-amber-500/10" },
          { label: "Approved Requests",  value: String(approved), icon: CheckCircle2, color: "text-emerald-500", bg: "bg-emerald-50 dark:bg-emerald-500/10" },
          { label: "Low Stock Items",    value: String(lowStock), icon: AlertTriangle, color: lowStock > 0 ? "text-red-500" : "text-gray-400", bg: lowStock > 0 ? "bg-red-50 dark:bg-red-500/10" : "bg-gray-50 dark:bg-white/5" },
        ].map((card) => (
          <div key={card.label} className="bg-white dark:bg-[#12141c] rounded-2xl border border-slate-200/60 dark:border-white/5 p-5">
            <div className={clsx("w-10 h-10 rounded-xl flex items-center justify-center mb-3", card.bg)}>
              <card.icon size={18} className={card.color} />
            </div>
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{card.label}</p>
            <p className={clsx("text-2xl font-black mt-1", card.color)}>{card.value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Quick Actions */}
        <div className="lg:col-span-1 space-y-4">
          <h2 className="text-xs font-black text-gray-900 dark:text-white uppercase tracking-widest">Quick Actions</h2>
          <div className="grid grid-cols-2 gap-3">
            {quickActions.map((action) => (
              <Link key={action.label} href={action.href}
                className="bg-white dark:bg-[#12141c] p-5 rounded-2xl border border-slate-200/60 dark:border-white/5 hover:shadow-lg hover:-translate-y-0.5 transition-all flex flex-col items-center text-center gap-3 group">
                <div className={clsx("w-12 h-12 rounded-2xl flex items-center justify-center text-white shadow-md group-hover:scale-110 transition-transform", action.color)}>
                  <action.icon size={22} />
                </div>
                <p className="text-[11px] font-black text-gray-900 dark:text-white uppercase tracking-wide leading-tight">{action.label}</p>
              </Link>
            ))}
          </div>

          {/* Low stock alert */}
          {lowStock > 0 && (
            <div className="bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-800/30 rounded-2xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <AlertTriangle size={14} className="text-red-500" />
                <p className="text-xs font-black text-red-600 dark:text-red-400 uppercase tracking-wide">Stock Alert</p>
              </div>
              <p className="text-sm text-red-600 dark:text-red-400">
                <strong>{lowStock}</strong> item{lowStock > 1 ? "s are" : " is"} below minimum stock level.
              </p>
              <Link href="/inventory/stock" className="mt-2 flex items-center gap-1 text-[11px] font-bold text-red-500 hover:text-red-400">
                View Stock <ArrowRight size={10} />
              </Link>
            </div>
          )}
        </div>

        {/* Recent Requests */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-black text-gray-900 dark:text-white uppercase tracking-widest">My Product Requests</h2>
            <Link href="/franchise/requests" className="text-[11px] font-bold text-orange-500 hover:text-orange-400 flex items-center gap-1">
              View All <ArrowRight size={10} />
            </Link>
          </div>

          {loading ? (
            <div className="py-12 text-center text-gray-400 text-sm">Loading...</div>
          ) : requests.length === 0 ? (
            <div className="bg-white dark:bg-[#12141c] rounded-2xl border border-slate-200/60 dark:border-white/5 p-8 text-center">
              <Send size={32} strokeWidth={1} className="mx-auto text-gray-300 dark:text-slate-600 mb-3" />
              <p className="text-sm text-gray-500 dark:text-slate-400 font-medium">No requests yet</p>
              <Link href="/franchise/requests" className="mt-3 inline-flex items-center gap-1.5 px-4 py-2 bg-orange-500 hover:bg-orange-400 text-white rounded-xl text-[12px] font-bold transition-all">
                <Send size={12} /> Request Products Now
              </Link>
            </div>
          ) : (
            <div className="space-y-2">
              {requests.slice(0, 6).map((req) => {
                const prods = (req.details as any)?.products ?? [];
                return (
                  <div key={req.id} className="bg-white dark:bg-[#12141c] rounded-2xl border border-slate-200/60 dark:border-white/5 p-4 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-9 h-9 rounded-xl bg-orange-50 dark:bg-orange-900/20 flex items-center justify-center shrink-0">
                        <Package size={15} className="text-orange-500" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-bold text-gray-900 dark:text-white truncate">
                          {prods.length > 0 ? prods.map((p: any) => p.productName).join(", ") : "Product Request"}
                        </p>
                        <p className="text-[11px] text-gray-400">
                          {new Date(req.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
                          {prods.length > 0 && <> · {prods.reduce((s: number, p: any) => s + Number(p.quantity), 0)} units</>}
                        </p>
                      </div>
                    </div>
                    <span className={clsx("px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wide shrink-0", STATUS_STYLES[req.status] ?? STATUS_STYLES.PENDING)}>
                      {req.status}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Recent Stock */}
      {stock.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-black text-gray-900 dark:text-white uppercase tracking-widest">Current Inventory</h2>
            <Link href="/inventory/stock" className="text-[11px] font-bold text-orange-500 hover:text-orange-400 flex items-center gap-1">
              View All <ArrowRight size={10} />
            </Link>
          </div>
          <div className="bg-white dark:bg-[#12141c] rounded-2xl border border-slate-200/60 dark:border-white/5 overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100 dark:border-white/5">
                  <th className="text-left px-5 py-3 text-[10px] font-black text-gray-400 uppercase tracking-widest">Item</th>
                  <th className="text-center px-5 py-3 text-[10px] font-black text-gray-400 uppercase tracking-widest">Stock</th>
                  <th className="text-center px-5 py-3 text-[10px] font-black text-gray-400 uppercase tracking-widest">Min</th>
                  <th className="text-center px-5 py-3 text-[10px] font-black text-gray-400 uppercase tracking-widest">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 dark:divide-white/5">
                {stock.slice(0, 8).map((item: any) => {
                  const isLow = item.currentStock <= item.minimumStock;
                  return (
                    <tr key={item.id} className="hover:bg-gray-50 dark:hover:bg-white/[0.02]">
                      <td className="px-5 py-3 text-sm font-bold text-gray-900 dark:text-white">{item.name}</td>
                      <td className="px-5 py-3 text-center">
                        <span className={clsx("text-sm font-black", isLow ? "text-red-500" : "text-gray-900 dark:text-white")}>
                          {item.currentStock} {item.unit}
                        </span>
                      </td>
                      <td className="px-5 py-3 text-center text-sm text-gray-400">{item.minimumStock} {item.unit}</td>
                      <td className="px-5 py-3 text-center">
                        {isLow
                          ? <span className="text-[10px] font-black text-red-500 flex items-center justify-center gap-1"><AlertTriangle size={10} /> Low</span>
                          : <span className="text-[10px] font-black text-emerald-500 flex items-center justify-center gap-1"><CheckCircle2 size={10} /> OK</span>}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
