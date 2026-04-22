"use client";

import { useState, useEffect, useRef } from "react";
import {
  ChefHat,
  Clock,
  CheckCircle2,
  AlertCircle,
  BarChart2,
  Printer,
  RefreshCw,
  Utensils,
  Flame,
  LayoutGrid
} from "lucide-react";
import { clsx } from "clsx";
import api from "@/lib/api";
import { io, Socket } from "socket.io-client";

const ORDER_TYPE_COLORS: Record<string, string> = {
  "Dine-In":  "bg-blue-500/20 text-blue-300 border-blue-500/30",
  "Takeaway": "bg-amber-500/20 text-amber-300 border-amber-500/30",
  "Delivery": "bg-orange-500/20 text-orange-300 border-orange-500/30",
};

const playDing = () => {
  try {
    const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "sine";
    osc.frequency.setValueAtTime(880, ctx.currentTime); // High pitch
    osc.frequency.exponentialRampToValueAtTime(440, ctx.currentTime + 0.2); 
    gain.gain.setValueAtTime(1, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.5);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.5);
  } catch(e) {}
};

function getElapsedMinutes(createdAt: string): number {
  return Math.floor((Date.now() - new Date(createdAt).getTime()) / 60000);
}

function getElapsed(createdAt: string): string {
  const diff = getElapsedMinutes(createdAt);
  return `${diff}m`;
}

export default function KDSPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [, setLoading] = useState(true);
  const [now, setNow] = useState<Date | null>(null);
  const [mounted, setMounted] = useState(false);
  const [completedToday, setCompletedToday] = useState(0);
  const [stationFilter, setStationFilter] = useState("ALL");
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    setMounted(true);
    setNow(new Date());
    // 1. Initial Load
    const fetchOrders = async () => {
      try {
        const response = await api.get("/api/orders", { params: { status: "PENDING,PREPARING,READY", take: 100 } });
        const data = response.data?.data || response.data || [];
        const arr = Array.isArray(data) ? data : [];
        setOrders(arr.filter((o: any) => o.status !== "COMPLETED"));
      } catch (e) {
        console.error("Failed to load orders", e);
      }
      setLoading(false);
    };
    fetchOrders();

    // 2. Setup WebSocket Connection
    // Explicitly binding to the backend URL where socket.io is mounted
    const backendUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
    const socket = io(backendUrl);
    socketRef.current = socket;

    socket.on("new-order", (order) => {
      console.log("WebSocket new-order received", order);
      playDing(); // 🔔 Sound Notification
      setOrders((prev) => [order, ...prev]);
    });

    socket.on("order-updated", (data) => {
      console.log("WebSocket order-updated received", data);
      
      setOrders((prev) => {
        if (data.status === "COMPLETED") {
           // It's gone from KDS
           return prev.filter(o => o.id !== data.orderId);
         }
         return prev.map(o => o.id === data.orderId ? { ...o, status: data.status } : o);
      });

      if (data.status === "COMPLETED") {
        setCompletedToday(prev => prev + 1);
      }
    });

    // 3. Setup Clock
    const clock = setInterval(() => setNow(new Date()), 1000);
    
    return () => { 
      socket.disconnect();
      clearInterval(clock); 
    };
  }, []);

  const changeStatus = async (id: string, newStatus: string) => {
    // Optimistic Update
    if (newStatus === "COMPLETED") {
      setOrders(prev => prev.filter(o => o.id !== id));
      setCompletedToday(n => n + 1);
    } else {
      setOrders(prev => prev.map(o => o.id === id ? { ...o, status: newStatus } : o));
    }
    // Api Call to trigger global Socket broadcast
    try {
      await api.patch(`/api/orders/${id}/status`, { status: newStatus });
    } catch(e) {
      console.error(e);
      // Let the socket correction handle failbacks ideally, or show a toast
    }
  };

  // derived state filtering
  const filteredOrders = orders.filter((o) => o.status !== "COMPLETED");
  const pendingCount   = filteredOrders.filter((o) => o.status === "PENDING").length;
  const prepCount      = filteredOrders.filter((o) => o.status === "PREPARING").length;
  const readyCount     = filteredOrders.filter((o) => o.status === "READY").length;
  const delayedCount   = filteredOrders.filter((o) => getElapsedMinutes(o.createdAt) > 15).length;

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
            <div className="flex items-center gap-3 mt-1">
              {/* Station Filers - Native Mock UI for advanced kitchens */}
              {['ALL', 'GRILL', 'PACKING'].map(st => (
                <button 
                  key={st}
                  onClick={() => setStationFilter(st)}
                  className={clsx("text-[10px] font-bold uppercase tracking-[0.2em] transition-all px-2 py-0.5 rounded",
                    stationFilter === st ? "bg-white/10 text-white" : "text-zinc-500 hover:text-zinc-400"
                  )}>
                  {st}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Live indicator (Websockets) */}
          <div className="flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 rounded-xl px-3 py-2 mr-2">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.8)]" />
            <span className="text-[10px] font-black text-emerald-400 uppercase tracking-widest">Live Sync</span>
          </div>

          <div className="bg-zinc-800/80 border border-white/5 rounded-xl px-4 py-2 text-center mr-4">
            <p className="text-lg font-black text-white tabular-nums" suppressHydrationWarning>
              {mounted && now ? now.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", second: "2-digit" }) : "--:--:--"}
            </p>
            <p className="text-[9px] text-zinc-500 uppercase font-bold tracking-widest" suppressHydrationWarning>
              {mounted && now ? now.toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "short" }) : "---"}
            </p>
          </div>

          <div className="flex gap-2">
            <div className="flex flex-col items-center px-3 py-2 rounded-xl border bg-zinc-800/40 border-zinc-700/50 text-amber-400">
               <span className="text-lg font-black tabular-nums">{pendingCount}</span>
               <span className="text-[9px] font-bold uppercase tracking-wider opacity-80">Pending</span>
            </div>
            <div className="flex flex-col items-center px-3 py-2 rounded-xl border bg-blue-500/20 text-blue-400 border-blue-500/20">
              <span className="text-lg font-black tabular-nums">{prepCount}</span>
              <span className="text-[9px] font-bold uppercase tracking-wider opacity-80">Prep</span>
            </div>
            <div className="flex flex-col items-center px-3 py-2 rounded-xl border bg-emerald-500/20 text-emerald-400 border-emerald-500/20">
              <span className="text-lg font-black tabular-nums">{readyCount}</span>
              <span className="text-[9px] font-bold uppercase tracking-wider opacity-80">Ready</span>
            </div>
            <div className="flex flex-col items-center px-3 py-2 rounded-xl border bg-red-500/20 text-red-400 border-red-500/20">
              <span className="text-lg font-black tabular-nums">{delayedCount}</span>
              <span className="text-[9px] font-bold uppercase tracking-wider opacity-80">Late</span>
            </div>
          </div>
        </div>
      </header>

      {/* ── Order Grid ─────────────────────────────────── */}
      {filteredOrders.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-64 gap-4 text-zinc-700">
          <BarChart2 size={48} strokeWidth={1} />
          <p className="text-lg font-black uppercase tracking-widest italic">Kitchen queue is clear</p>
          <p className="text-sm text-zinc-600">New POS orders will appear here instantly</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredOrders.map((order) => {
            const elapsed = getElapsedMinutes(order.createdAt);
            
            // Priority Engine
            const isDelayed = elapsed > 15;
            const isMedium = elapsed > 8 && elapsed <= 15;
            const isNew = elapsed <= 8;

            const isPending = order.status === "PENDING";
            const isPreparing = order.status === "PREPARING";
            const isReady = order.status === "READY";

            return (
              <div
                key={order.id}
                className={clsx(
                  "bg-[#111520] rounded-2xl border flex flex-col overflow-hidden transition-all duration-300",
                  isReady
                    ? "border-emerald-500/30 shadow-lg shadow-emerald-500/10"
                    : isDelayed
                    ? "border-red-500/60 shadow-[0_0_15px_rgba(239,68,68,0.2)]"
                    : isMedium
                    ? "border-yellow-500/40 shadow-[0_0_10px_rgba(234,179,8,0.1)]"
                    : "border-white/10"
                )}
              >
                {/* Card Header */}
                <div className={clsx(
                  "px-4 py-3 flex items-center justify-between border-b",
                  isReady ? "bg-emerald-500/10 border-emerald-500/20" :
                  isDelayed ? "bg-red-500/20 border-red-500/40" :
                  isMedium ? "bg-yellow-500/10 border-yellow-500/20" :
                  "bg-white/[0.02] border-white/5"
                )}>
                  <div>
                    <div className="flex items-center gap-2">
                       {/* Priority / Urgency Highlight */}
                      <span className={clsx("w-3 h-3 rounded-full animate-pulse", 
                          isDelayed ? "bg-red-500" : isMedium ? "bg-yellow-500" : "bg-emerald-400"
                      )} />
                      <h3 className="text-lg font-black text-white">
                        {order.invoiceNum || `#${order.id.slice(-4)}`}
                      </h3>
                    </div>
                    <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest mt-0.5" suppressHydrationWarning>
                      {mounted && order.createdAt ? new Date(order.createdAt).toLocaleTimeString("en-IN", { hour: "numeric", minute: "2-digit" }) : ""}
                    </p>
                  </div>
                  <div className="text-right">
                    <div className={clsx("flex items-center gap-1 font-black text-sm",
                      isDelayed ? "text-red-400" : isMedium ? "text-yellow-400" : "text-zinc-400"
                    )}>
                      {isDelayed ? <AlertCircle size={14} /> : <Clock size={14} />}
                      <span>{getElapsed(order.createdAt)}</span>
                    </div>
                    <span className={clsx("text-[9px] font-bold px-2 py-0.5 rounded-md border mt-1 inline-block uppercase", ORDER_TYPE_COLORS[order.orderType] || "bg-zinc-800 text-zinc-400 border-zinc-700")}>
                      {order.orderType || 'Order'}
                      {order.tableNo && ` · T${order.tableNo}`}
                    </span>
                  </div>
                </div>

                {/* Items Unrolled */}
                <div className="flex-1 p-4 space-y-3">
                  {order.orderItems?.map((item: any, i: number) => (
                    <div key={item.id || i} className="flex items-start gap-3">
                      <div className={clsx(
                        "w-8 h-8 rounded-xl flex items-center justify-center font-black text-sm shrink-0 border",
                        isReady ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/30" : "bg-zinc-800/80 text-white border-white/10"
                      )}>
                        {item.quantity}x
                      </div>
                      <div className="flex-1 pt-1.5">
                        <p className="text-white font-bold text-[14px] leading-tight flex items-center justify-between">
                           <span>{item.product?.name || item.recipe?.name || "Unknown Item"}</span>
                           {isReady && <CheckCircle2 size={16} className="text-emerald-400" />}
                        </p>
                      </div>
                    </div>
                  ))}
                  
                  {(!order.orderItems || order.orderItems.length === 0) && (
                     <div className="text-zinc-600 text-sm font-bold italic py-4 text-center">Awaiting Items...</div>
                  )}
                </div>

                {/* Flow Actions */}
                <div className="p-3 bg-black/20 border-t border-white/5 space-y-2">
                  
                  {/* Status Indicator Bar */}
                  <div className="flex gap-1 h-1.5 mb-3">
                     <div className={clsx("flex-1 rounded-full", isPending || isPreparing || isReady ? "bg-orange-500 shadow-[0_0_8px_rgba(249,115,22,0.8)]" : "bg-zinc-800")} />
                     <div className={clsx("flex-1 rounded-full", isPreparing || isReady ? "bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.8)]" : "bg-zinc-800")} />
                     <div className={clsx("flex-1 rounded-full", isReady ? "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)]" : "bg-zinc-800")} />
                  </div>

                  {isPending && (
                     <button
                       onClick={() => changeStatus(order.id, "PREPARING")}
                       className="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-black text-[12px] uppercase tracking-widest shadow-lg shadow-blue-500/20 transition-all active:scale-95 flex items-center justify-center gap-2"
                     >
                       <Flame size={16} /> Start Cooking
                     </button>
                  )}

                  {isPreparing && (
                     <button
                       onClick={() => changeStatus(order.id, "READY")}
                       className="w-full py-3 bg-orange-500 hover:bg-orange-400 text-white rounded-xl font-black text-[12px] uppercase tracking-widest shadow-lg shadow-orange-500/20 transition-all active:scale-95 flex items-center justify-center gap-2"
                     >
                       <Utensils size={16} /> Mark Ready
                     </button>
                  )}

                  {isReady && (
                    <button
                      onClick={() => changeStatus(order.id, "COMPLETED")}
                      className="w-full py-3 bg-emerald-500 hover:bg-emerald-400 text-white rounded-xl font-black text-[12px] uppercase tracking-widest shadow-lg shadow-emerald-500/20 transition-all active:scale-95 flex items-center justify-center gap-2"
                    >
                      <CheckCircle2 size={16} /> Handover & Deduct Stock
                    </button>
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
          <span>Kitchen Ops Sync</span>
          <div className="w-px h-4 bg-zinc-800" />
          <span className="text-emerald-400">WebSocket: Connected</span>
        </div>
      </div>
    </div>
  );
}
