"use client";

import Link from "next/link";
import {
  ShoppingCart,
  Tv,
  UtensilsCrossed,
  ChefHat,
  Factory,
  Trash2,
  Package,
  Bell,
  Users,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  CheckCircle2,
  Clock,
  ArrowRight,
  IndianRupee,
  Star,
  Zap,
  BarChart3,
} from "lucide-react";
import { clsx } from "clsx";

const KPI_CARDS = [
  {
    label: "Today's Revenue",
    value: "₹24,860",
    change: "+12.4%",
    up: true,
    sub: "vs yesterday ₹22,120",
    icon: IndianRupee,
    color: "orange",
    bg: "bg-orange-50 dark:bg-orange-900/10",
    iconBg: "bg-orange-500",
    border: "border-orange-100 dark:border-orange-900/20",
  },
  {
    label: "Orders Today",
    value: "47",
    change: "+8",
    up: true,
    sub: "39 yesterday",
    icon: ShoppingCart,
    color: "blue",
    bg: "bg-blue-50 dark:bg-blue-900/10",
    iconBg: "bg-blue-500",
    border: "border-blue-100 dark:border-blue-900/20",
  },
  {
    label: "Kitchen Queue",
    value: "8",
    change: "-3",
    up: false,
    sub: "active orders pending",
    icon: Clock,
    color: "amber",
    bg: "bg-amber-50 dark:bg-amber-900/10",
    iconBg: "bg-amber-500",
    border: "border-amber-100 dark:border-amber-900/20",
  },
  {
    label: "Low Stock Alerts",
    value: "5",
    change: "+2",
    up: false,
    sub: "items need restocking",
    icon: AlertTriangle,
    color: "red",
    bg: "bg-red-50 dark:bg-red-900/10",
    iconBg: "bg-red-500",
    border: "border-red-100 dark:border-red-900/20",
  },
];

const QUICK_MODULES = [
  { label: "Billing & POS", sub: "Create orders & accept payments", href: "/pos", icon: ShoppingCart, color: "from-orange-400 to-orange-600", shadow: "shadow-orange-200 dark:shadow-orange-900/30" },
  { label: "Kitchen Display", sub: "Live kitchen order queue", href: "/kds", icon: Tv, color: "from-emerald-400 to-emerald-600", shadow: "shadow-emerald-200 dark:shadow-emerald-900/30" },
  { label: "Menu Management", sub: "Add & manage food items", href: "/menu", icon: UtensilsCrossed, color: "from-violet-400 to-violet-600", shadow: "shadow-violet-200 dark:shadow-violet-900/30" },
  { label: "Recipe Builder", sub: "Map ingredients to dishes", href: "/recipes", icon: ChefHat, color: "from-pink-400 to-pink-600", shadow: "shadow-pink-200 dark:shadow-pink-900/30" },
  { label: "Production", sub: "Kitchen batch management", href: "/production", icon: Factory, color: "from-cyan-400 to-cyan-600", shadow: "shadow-cyan-200 dark:shadow-cyan-900/30" },
  { label: "Raw Materials", sub: "Track ingredient stock", href: "/inventory/items", icon: Package, color: "from-teal-400 to-teal-600", shadow: "shadow-teal-200 dark:shadow-teal-900/30" },
  { label: "Waste & Loss", sub: "Track food wastage", href: "/waste", icon: Trash2, color: "from-rose-400 to-rose-600", shadow: "shadow-rose-200 dark:shadow-rose-900/30" },
  { label: "Customers", sub: "CRM & loyalty rewards", href: "/customers", icon: Users, color: "from-indigo-400 to-indigo-600", shadow: "shadow-indigo-200 dark:shadow-indigo-900/30" },
  { label: "Real-Time Alerts", sub: "Live business alerts", href: "/alerts", icon: Bell, color: "from-amber-400 to-amber-600", shadow: "shadow-amber-200 dark:shadow-amber-900/30" },
];

const RECENT_ORDERS = [
  { id: "ORD-047", table: "Table 5", items: "Biryani x2, Lassi x2", amount: "₹840", status: "completed", time: "2m ago" },
  { id: "ORD-046", table: "Takeaway", items: "Pizza x1, Fries x2, Cola x2", amount: "₹680", status: "preparing", time: "8m ago" },
  { id: "ORD-045", table: "Table 2", items: "Thali x3", amount: "₹450", status: "ready", time: "12m ago" },
  { id: "ORD-044", table: "Table 8", items: "Dosa x2, Filter Coffee x2", amount: "₹280", status: "completed", time: "18m ago" },
  { id: "ORD-043", table: "Delivery", items: "Paneer Butter Masala, Naan x4", amount: "₹560", status: "completed", time: "25m ago" },
];

const LOW_STOCK = [
  { name: "Chicken Breast", current: "1.8 kg", min: "3 kg", severity: "critical" },
  { name: "Basmati Rice", current: "4 kg", min: "5 kg", severity: "warning" },
  { name: "Paneer", current: "800g", min: "1.5 kg", severity: "critical" },
  { name: "Cooking Oil", current: "2.1 L", min: "3 L", severity: "warning" },
  { name: "Onions", current: "2.5 kg", min: "3 kg", severity: "warning" },
];

const TOP_SELLERS = [
  { name: "Chicken Biryani", count: 18, revenue: "₹7,200", pct: 90 },
  { name: "Paneer Tikka", count: 12, revenue: "₹4,200", pct: 60 },
  { name: "Veg Thali", count: 9, revenue: "₹2,700", pct: 45 },
  { name: "Masala Dosa", count: 8, revenue: "₹1,200", pct: 40 },
];

const WEEKLY_SALES = [
  { day: "Mon", value: 18400, height: 65 },
  { day: "Tue", value: 22100, height: 78 },
  { day: "Wed", value: 19800, height: 70 },
  { day: "Thu", value: 26400, height: 93 },
  { day: "Fri", value: 28200, height: 100 },
  { day: "Sat", value: 24860, height: 88 },
  { day: "Sun", value: 0, height: 0 },
];

const STATUS_STYLES: Record<string, string> = {
  completed: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400",
  preparing: "bg-amber-100 text-amber-700 dark:bg-amber-900/20 dark:text-amber-400",
  ready: "bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400",
};

export default function Dashboard() {
  const now = new Date();
  const timeStr = now.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" });
  const dateStr = now.toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long", year: "numeric" });

  return (
    <div className="min-h-full bg-white dark:bg-[#0f1117] rounded-3xl overflow-hidden border border-orange-100 dark:border-white/5 shadow-sm">
      <div className="max-w-[1500px] mx-auto px-6 py-6 space-y-8">

        {/* ── Hero Header ─────────────────────────────── */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-black text-gray-900 dark:text-white tracking-tight">
              Good {now.getHours() < 12 ? "Morning" : now.getHours() < 17 ? "Afternoon" : "Evening"} 👋
            </h1>
            <p className="text-sm text-gray-500 dark:text-slate-400 mt-1">{dateStr} · {timeStr}</p>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/alerts"
              className="flex items-center gap-2 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/30 text-red-600 dark:text-red-400 rounded-xl px-4 py-2 text-sm font-semibold hover:bg-red-100 transition-all"
            >
              <AlertTriangle size={15} />
              5 Alerts
            </Link>
            <Link
              href="/pos"
              className="flex items-center gap-2 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-400 hover:to-orange-500 text-white rounded-xl px-5 py-2.5 text-sm font-bold shadow-md shadow-orange-200 dark:shadow-orange-900/30 transition-all active:scale-95"
            >
              <ShoppingCart size={16} />
              New Order
            </Link>
          </div>
        </div>

        {/* ── KPI Cards ────────────────────────────────── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {KPI_CARDS.map((kpi) => (
            <div key={kpi.label} className={clsx("rounded-2xl border p-5 bg-white dark:bg-card shadow-sm hover:shadow-md transition-all duration-200", kpi.border)}>
              <div className="flex items-start justify-between mb-3">
                <div className={clsx("w-9 h-9 rounded-xl flex items-center justify-center", kpi.iconBg)}>
                  <kpi.icon size={18} className="text-white" />
                </div>
                <span className={clsx("flex items-center gap-0.5 text-xs font-bold", kpi.up ? "text-emerald-600" : "text-red-500")}>
                  {kpi.up ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                  {kpi.change}
                </span>
              </div>
              <p className="text-2xl font-black text-gray-900 dark:text-white">{kpi.value}</p>
              <p className="text-[11px] font-semibold text-gray-500 dark:text-slate-400 mt-1">{kpi.label}</p>
              <p className="text-[10px] text-gray-400 dark:text-slate-500 mt-0.5">{kpi.sub}</p>
            </div>
          ))}
        </div>

        {/* ── Quick Module Access ───────────────────────── */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-black text-gray-900 dark:text-white uppercase tracking-widest flex items-center gap-2">
              <Zap size={14} className="text-orange-500" /> Quick Access
            </h2>
          </div>
          <div className="grid grid-cols-3 sm:grid-cols-5 lg:grid-cols-9 gap-3">
            {QUICK_MODULES.map((mod) => (
              <Link
                key={mod.href}
                href={mod.href}
                className="group flex flex-col items-center gap-2 p-3 bg-white dark:bg-card rounded-2xl border border-gray-100 dark:border-white/5 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200"
              >
                <div className={clsx("w-11 h-11 rounded-2xl bg-gradient-to-br flex items-center justify-center shadow-md", mod.color, mod.shadow)}>
                  <mod.icon size={20} className="text-white" />
                </div>
                <span className="text-[10px] font-bold text-gray-600 dark:text-slate-400 text-center leading-tight group-hover:text-gray-900 dark:group-hover:text-white transition-colors">
                  {mod.label}
                </span>
              </Link>
            ))}
          </div>
        </div>

        {/* ── Main Content Grid ─────────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Recent Orders */}
          <div className="lg:col-span-2 bg-white dark:bg-card rounded-2xl border border-gray-100 dark:border-white/5 shadow-sm overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-50 dark:border-white/5">
              <div className="flex items-center gap-2">
                <ShoppingCart size={16} className="text-orange-500" />
                <h3 className="text-sm font-bold text-gray-900 dark:text-white">Recent Orders</h3>
              </div>
              <Link href="/pos" className="text-[11px] text-orange-500 font-semibold hover:underline flex items-center gap-1">
                View All <ArrowRight size={11} />
              </Link>
            </div>
            <div className="divide-y divide-gray-50 dark:divide-white/5">
              {RECENT_ORDERS.map((order) => (
                <div key={order.id} className="flex items-center gap-4 px-6 py-3.5 hover:bg-orange-50/30 dark:hover:bg-white/5 transition-colors">
                  <div className="w-9 h-9 rounded-xl bg-orange-50 dark:bg-orange-900/20 flex items-center justify-center shrink-0">
                    <ShoppingCart size={15} className="text-orange-500" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-[13px] font-bold text-gray-900 dark:text-white">{order.id}</span>
                      <span className="text-[11px] text-gray-500">· {order.table}</span>
                    </div>
                    <p className="text-[11px] text-gray-400 dark:text-slate-500 truncate mt-0.5">{order.items}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-[13px] font-black text-gray-900 dark:text-white">{order.amount}</p>
                    <p className="text-[10px] text-gray-400 mt-0.5">{order.time}</p>
                  </div>
                  <span className={clsx("px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider shrink-0", STATUS_STYLES[order.status])}>
                    {order.status}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Right Column */}
          <div className="space-y-6">

            {/* Low Stock Alerts */}
            <div className="bg-white dark:bg-card rounded-2xl border border-red-100 dark:border-red-900/20 shadow-sm overflow-hidden">
              <div className="flex items-center justify-between px-5 py-4 border-b border-red-50 dark:border-red-900/10">
                <div className="flex items-center gap-2">
                  <AlertTriangle size={15} className="text-red-500" />
                  <h3 className="text-sm font-bold text-gray-900 dark:text-white">Low Stock</h3>
                </div>
                <Link href="/alerts" className="text-[11px] text-red-500 font-semibold hover:underline">
                  View All
                </Link>
              </div>
              <div className="divide-y divide-red-50 dark:divide-red-900/10">
                {LOW_STOCK.map((item) => (
                  <div key={item.name} className="flex items-center justify-between px-5 py-2.5">
                    <div>
                      <p className="text-[12px] font-semibold text-gray-800 dark:text-slate-200">{item.name}</p>
                      <p className="text-[10px] text-gray-400 mt-0.5">
                        {item.current} / min {item.min}
                      </p>
                    </div>
                    <span className={clsx(
                      "w-2 h-2 rounded-full shrink-0",
                      item.severity === "critical" ? "bg-red-500" : "bg-amber-400"
                    )} />
                  </div>
                ))}
              </div>
            </div>

            {/* Top Sellers */}
            <div className="bg-white dark:bg-card rounded-2xl border border-gray-100 dark:border-white/5 shadow-sm overflow-hidden">
              <div className="flex items-center gap-2 px-5 py-4 border-b border-gray-50 dark:border-white/5">
                <Star size={15} className="text-orange-500" />
                <h3 className="text-sm font-bold text-gray-900 dark:text-white">Top Sellers Today</h3>
              </div>
              <div className="px-5 py-3 space-y-3">
                {TOP_SELLERS.map((item) => (
                  <div key={item.name}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[12px] font-semibold text-gray-700 dark:text-slate-300">{item.name}</span>
                      <span className="text-[11px] text-gray-500">{item.count} orders · {item.revenue}</span>
                    </div>
                    <div className="h-1.5 bg-gray-100 dark:bg-white/10 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-orange-400 to-orange-500 rounded-full"
                        style={{ width: `${item.pct}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* ── Weekly Revenue Chart ──────────────────────── */}
        <div className="bg-white dark:bg-card rounded-2xl border border-gray-100 dark:border-white/5 shadow-sm p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <BarChart3 size={16} className="text-orange-500" />
              <h3 className="text-sm font-bold text-gray-900 dark:text-white">Weekly Revenue</h3>
            </div>
            <div className="flex items-center gap-1.5 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800/30 rounded-lg px-2.5 py-1">
              <TrendingUp size={12} className="text-emerald-600" />
              <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400">+18.2% this week</span>
            </div>
          </div>
          <div className="flex items-end gap-3 h-32">
            {WEEKLY_SALES.map((d) => (
              <div key={d.day} className="flex-1 flex flex-col items-center gap-2">
                <div className="w-full flex items-end justify-center" style={{ height: "96px" }}>
                  <div
                    className={clsx(
                      "w-full rounded-t-lg transition-all",
                      d.day === "Sat"
                        ? "bg-gradient-to-t from-orange-500 to-orange-400"
                        : d.height === 0
                        ? "bg-gray-100 dark:bg-white/5"
                        : "bg-gradient-to-t from-orange-200 to-orange-100 dark:from-orange-900/40 dark:to-orange-900/20"
                    )}
                    style={{ height: `${Math.max(d.height, 4)}%` }}
                  />
                </div>
                <span className={clsx("text-[10px] font-bold", d.day === "Sat" ? "text-orange-500" : "text-gray-400 dark:text-slate-500")}>
                  {d.day}
                </span>
              </div>
            ))}
          </div>
          <div className="mt-4 pt-4 border-t border-gray-50 dark:border-white/5 grid grid-cols-3 gap-4">
            <div>
              <p className="text-[10px] text-gray-400 uppercase font-bold tracking-wider">This Week</p>
              <p className="text-lg font-black text-gray-900 dark:text-white">₹1,39,760</p>
            </div>
            <div>
              <p className="text-[10px] text-gray-400 uppercase font-bold tracking-wider">Avg / Day</p>
              <p className="text-lg font-black text-gray-900 dark:text-white">₹23,293</p>
            </div>
            <div>
              <p className="text-[10px] text-gray-400 uppercase font-bold tracking-wider">Best Day</p>
              <p className="text-lg font-black text-orange-500">Friday · ₹28,200</p>
            </div>
          </div>
        </div>

        {/* ── Modules Overview ─────────────────────────── */}
        <div>
          <div className="flex items-center gap-2 mb-4">
            <CheckCircle2 size={15} className="text-orange-500" />
            <h2 className="text-sm font-black text-gray-900 dark:text-white uppercase tracking-widest">All Modules</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {QUICK_MODULES.map((mod) => (
              <Link
                key={mod.href}
                href={mod.href}
                className="group flex items-center gap-4 bg-white dark:bg-card rounded-2xl border border-gray-100 dark:border-white/5 p-4 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200"
              >
                <div className={clsx("w-12 h-12 rounded-2xl bg-gradient-to-br flex items-center justify-center shadow-md shrink-0", mod.color, mod.shadow)}>
                  <mod.icon size={22} className="text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[13px] font-bold text-gray-900 dark:text-white group-hover:text-orange-600 dark:group-hover:text-orange-400 transition-colors">{mod.label}</p>
                  <p className="text-[11px] text-gray-400 dark:text-slate-500 mt-0.5">{mod.sub}</p>
                </div>
                <ArrowRight size={14} className="text-gray-300 dark:text-slate-600 group-hover:text-orange-500 group-hover:translate-x-0.5 transition-all shrink-0" />
              </Link>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
