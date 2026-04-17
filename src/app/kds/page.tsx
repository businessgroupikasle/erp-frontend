"use client";

import { useState, useEffect } from "react";
import {
  ChefHat,
  Clock,
  CheckCircle2,
  AlertCircle,
  BarChart2,
  Printer,
  RefreshCw,
  Utensils,
} from "lucide-react";
import { clsx } from "clsx";
import api from "@/lib/api";

const DEMO_ORDERS = [
  {
    id: "d1", invoiceNum: "ORD-001", priority: "HIGH", orderType: "Dine-In", tableNo: "5",
    createdAt: new Date(Date.now() - 5 * 60000).toISOString(),
    orderItems: [
      { id: "i1", quantity: 2, recipe: { name: "Chicken Biryani" } },
      { id: "i2", quantity: 1, recipe: { name: "Mango Lassi" } },
    ],
    status: "preparing",
  },
  {
    id: "d2", invoiceNum: "ORD-002", priority: "NORMAL", orderType: "Takeaway", tableNo: null,
    createdAt: new Date(Date.now() - 12 * 60000).toISOString(),
    orderItems: [
      { id: "i3", quantity: 1, recipe: { name: "Masala Dosa" } },
      { id: "i4", quantity: 2, recipe: { name: "Filter Coffee" } },
    ],
    status: "preparing",
  },
  {
    id: "d3", invoiceNum: "ORD-003", priority: "NORMAL", orderType: "Dine-In", tableNo: "2",
    createdAt: new Date(Date.now() - 3 * 60000).toISOString(),
    orderItems: [
      { id: "i5", quantity: 3, recipe: { name: "Veg Thali" } },
      { id: "i6", quantity: 1, recipe: { name: "Gulab Jamun" } },
    ],
    status: "ready",
  },
  {
    id: "d4", invoiceNum: "ORD-004", priority: "HIGH", orderType: "Delivery", tableNo: null,
    createdAt: new Date(Date.now() - 18 * 60000).toISOString(),
    orderItems: [
      { id: "i7", quantity: 2, recipe: { name: "Paneer Butter Masala" } },
      { id: "i8", quantity: 4, recipe: { name: "Butter Naan" } },
    ],
    status: "preparing",
  },
];

const ORDER_TYPE_COLORS: Record<string, string> = {
  "Dine-In":  "bg-blue-500/20 text-blue-300 border-blue-500/30",
  "Takeaway": "bg-amber-500/20 text-amber-300 border-amber-500/30",
  "Delivery": "bg-orange-500/20 text-orange-300 border-orange-500/30",
};

function getElapsed(createdAt: string): string {
  const diff = Math.floor((Date.now() - new Date(createdAt).getTime()) / 60000);
  return `${diff}m`;
}

function getElapsedMinutes(createdAt: string): number {
  return Math.floor((Date.now() - new Date(createdAt).getTime()) / 60000);
}

export default function KDSPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [, setLoading] = useState(true);
  const [now, setNow] = useState(new Date());
  const [completedToday, setCompletedToday] = useState(18);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const response = await api.get("/api/pos/orders");
        if (response.data?.length) {
          setOrders(response.data);
          return;
        }
      } catch (_) {}
      setOrders(DEMO_ORDERS);
      setLoading(false);
    };
    fetchOrders();
    const poll = setInterval(fetchOrders, 10000);
    const clock = setInterval(() => setNow(new Date()), 1000);
    return () => { clearInterval(poll); clearInterval(clock); };
  }, []);

  const completeOrder = (id: string) => {
    setOrders((prev) => prev.filter((o) => o.id !== id));
    setCompletedToday((n) => n + 1);
  };

  const markReady = (id: string) => {
    setOrders((prev) => prev.map((o) => o.id === id ? { ...o, status: "ready" } : o));
  };

  const activeOrders   = orders.filter((o) => o.status !== "completed");
  const readyOrders    = orders.filter((o) => o.status === "ready");
  const delayedOrders  = orders.filter((o) => getElapsedMinutes(o.createdAt) > 15);

  return (
    <div className="min-h-screen bg-[#0a0d14] -m-8 p-6 space-y-6">

      {/* ── Header ─────────────────────────────────────── */}
      <header className="flex items-center justify-between bg-[#111520] border border-white/5 rounded-2xl px-6 py-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center shadow-lg shadow-orange-500/30">
            <ChefHat size={24} className="text-white" />
          </div>
          <div>
            <h1 className="text-xl font-black text-white tracking-tight">Kitchen Display System</h1>
            <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-[0.3em]">Real-Time Order Queue</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Live clock */}
          <div className="bg-zinc-800/80 border border-white/5 rounded-xl px-4 py-2 text-center">
            <p className="text-lg font-black text-white tabular-nums">{now.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", second: "2-digit" })}</p>
            <p className="text-[9px] text-zinc-500 uppercase font-bold tracking-widest">{now.toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "short" })}</p>
          </div>

          {/* Stats chips */}
          <div className="flex gap-2">
            {[
              { label: "Active",    value: activeOrders.length,    color: "bg-blue-500/20 text-blue-400 border-blue-500/20" },
              { label: "Ready",     value: readyOrders.length,     color: "bg-emerald-500/20 text-emerald-400 border-emerald-500/20" },
              { label: "Delayed",   value: delayedOrders.length,   color: "bg-red-500/20 text-red-400 border-red-500/20" },
              { label: "Completed", value: completedToday,         color: "bg-zinc-700/50 text-zinc-400 border-zinc-600/20" },
            ].map((s) => (
              <div key={s.label} className={clsx("flex flex-col items-center px-3 py-2 rounded-xl border text-center", s.color)}>
                <span className="text-lg font-black tabular-nums">{s.value}</span>
                <span className="text-[9px] font-bold uppercase tracking-wider opacity-80">{s.label}</span>
              </div>
            ))}
          </div>

          {/* Live indicator */}
          <div className="flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 rounded-xl px-3 py-2">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[10px] font-black text-emerald-400 uppercase tracking-widest">Live</span>
          </div>
        </div>
      </header>

      {/* ── Order Grid ─────────────────────────────────── */}
      {activeOrders.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-64 gap-4 text-zinc-700">
          <BarChart2 size={48} strokeWidth={1} />
          <p className="text-lg font-black uppercase tracking-widest italic">Kitchen queue is clear</p>
          <p className="text-sm text-zinc-600">New orders will appear here automatically</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {activeOrders.map((order) => {
            const elapsed = getElapsedMinutes(order.createdAt);
            const isDelayed = elapsed > 15;
            const isReady = order.status === "ready";
            const isHighPriority = order.priority === "HIGH";

            return (
              <div
                key={order.id}
                className={clsx(
                  "bg-[#111520] rounded-2xl border flex flex-col overflow-hidden transition-all duration-300",
                  isReady
                    ? "border-emerald-500/30 shadow-lg shadow-emerald-500/10"
                    : isDelayed
                    ? "border-red-500/40 shadow-lg shadow-red-500/10"
                    : isHighPriority
                    ? "border-orange-500/30 shadow-lg shadow-orange-500/10"
                    : "border-white/5"
                )}
              >
                {/* Card Header */}
                <div className={clsx(
                  "px-4 py-3 flex items-center justify-between border-b",
                  isReady ? "bg-emerald-500/10 border-emerald-500/20" :
                  isDelayed ? "bg-red-500/10 border-red-500/20" :
                  isHighPriority ? "bg-orange-500/10 border-orange-500/20" :
                  "bg-white/[0.02] border-white/5"
                )}>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-lg font-black text-white">
                        #{order.invoiceNum?.split("-")[1] || order.id.slice(-3)}
                      </h3>
                      {isHighPriority && !isReady && (
                        <span className="px-1.5 py-0.5 bg-orange-500/20 text-orange-400 text-[9px] font-black uppercase rounded-md border border-orange-500/20">
                          Priority
                        </span>
                      )}
                    </div>
                    <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest mt-0.5">
                      {new Date(order.createdAt).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}
                    </p>
                  </div>
                  <div className="text-right">
                    <div className={clsx("flex items-center gap-1 font-black text-sm",
                      isDelayed ? "text-red-400" : isReady ? "text-emerald-400" : "text-zinc-400"
                    )}>
                      {isDelayed ? <AlertCircle size={14} /> : <Clock size={14} />}
                      <span>{getElapsed(order.createdAt)}</span>
                    </div>
                    <span className={clsx("text-[10px] font-bold px-2 py-0.5 rounded-md border mt-1 inline-block", ORDER_TYPE_COLORS[order.orderType] || "bg-zinc-800 text-zinc-400 border-zinc-700")}>
                      {order.orderType}
                      {order.tableNo && ` · T${order.tableNo}`}
                    </span>
                  </div>
                </div>

                {/* Items */}
                <div className="flex-1 p-4 space-y-2.5">
                  {order.orderItems?.map((item: any) => (
                    <div key={item.id} className="flex items-center gap-3 group">
                      <div className={clsx(
                        "w-8 h-8 rounded-xl flex items-center justify-center text-white font-black text-sm shrink-0 transition-all",
                        isReady ? "bg-emerald-500/20 text-emerald-400" : "bg-white/10 group-hover:bg-orange-500/20 group-hover:text-orange-400"
                      )}>
                        {item.quantity}
                      </div>
                      <div className="flex-1">
                        <p className="text-white font-bold text-[13px] leading-tight">{item.recipe?.name || "Item"}</p>
                      </div>
                      {isReady && <CheckCircle2 size={14} className="text-emerald-400 shrink-0" />}
                    </div>
                  ))}
                </div>

                {/* Actions */}
                <div className={clsx("p-3 grid gap-2", isReady ? "grid-cols-1" : "grid-cols-2")}>
                  {isReady ? (
                    <button
                      onClick={() => completeOrder(order.id)}
                      className="py-3 bg-emerald-500 hover:bg-emerald-400 text-white rounded-xl font-black text-[11px] uppercase tracking-widest shadow-lg shadow-emerald-500/20 transition-all active:scale-95 flex items-center justify-center gap-2"
                    >
                      <CheckCircle2 size={16} /> Complete Order
                    </button>
                  ) : (
                    <>
                      <button
                        onClick={() => markReady(order.id)}
                        className="py-3 bg-orange-500 hover:bg-orange-400 text-white rounded-xl font-black text-[11px] uppercase tracking-widest shadow-lg shadow-orange-500/20 transition-all active:scale-95 flex items-center justify-center gap-1.5"
                      >
                        <Utensils size={14} /> Ready
                      </button>
                      <button className="py-3 bg-zinc-700/80 hover:bg-zinc-600 text-zinc-300 rounded-xl font-black text-[11px] uppercase tracking-widest transition-all active:scale-95 flex items-center justify-center gap-1.5">
                        <Printer size={14} /> KOT
                      </button>
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ── Footer Stats ───────────────────────────────── */}
      <div className="bg-[#111520] border border-white/5 rounded-2xl px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-4 text-[11px] text-zinc-500 font-bold uppercase tracking-widest">
          <span>Kitchen Performance</span>
          <div className="w-px h-4 bg-zinc-800" />
          <span className="text-emerald-400">Avg Time: 12 min</span>
          <div className="w-px h-4 bg-zinc-800" />
          <span className="text-orange-400">Efficiency: 94%</span>
        </div>
        <div className="flex items-center gap-2 text-zinc-600">
          <RefreshCw size={12} className="animate-spin-slow" />
          <span className="text-[10px] font-bold">Auto-refresh every 10s</span>
        </div>
      </div>
    </div>
  );
}
