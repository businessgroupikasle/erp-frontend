"use client";

import { useState } from "react";
import {
  Bell,
  AlertTriangle,
  CheckCircle2,
  TrendingUp,
  ShoppingCart,
  Package,
  X,
  Filter,
  Eye,
  EyeOff,
  RefreshCw,
  Shield,
  Clock,
} from "lucide-react";
import { clsx } from "clsx";

type AlertType = "stock" | "sales" | "kitchen" | "security" | "system";
type AlertSeverity = "critical" | "warning" | "info" | "success";

interface Alert {
  id: string;
  type: AlertType;
  severity: AlertSeverity;
  title: string;
  message: string;
  time: string;
  read: boolean;
  actionLabel?: string;
  actionHref?: string;
}

const INITIAL_ALERTS: Alert[] = [
  { id: "1",  type: "stock",    severity: "critical", title: "Critical: Chicken Stock Very Low",    message: "Chicken breast only 1.8 kg remaining. Minimum threshold is 3 kg. Reorder immediately.",      time: "5 min ago",  read: false, actionLabel: "Reorder", actionHref: "/purchases" },
  { id: "2",  type: "kitchen",  severity: "warning",  title: "Order #46 Delayed",                   message: "Order #46 has been in kitchen queue for 22 minutes. Expected time was 15 minutes.",           time: "8 min ago",  read: false, actionLabel: "View KDS", actionHref: "/kds" },
  { id: "3",  type: "stock",    severity: "warning",  title: "Paneer Stock Low",                    message: "Paneer at 800g. Minimum is 1.5 kg. Consider restocking before evening service.",              time: "12 min ago", read: false, actionLabel: "Reorder", actionHref: "/purchases" },
  { id: "4",  type: "sales",    severity: "success",  title: "🎉 Daily Target Achieved!",            message: "Today's revenue hit ₹25,000 target at 6:42 PM. Current total: ₹26,480. Keep it up!",          time: "1h ago",     read: false },
  { id: "5",  type: "stock",    severity: "warning",  title: "Basmati Rice Running Low",            message: "Basmati rice at 4 kg. Minimum threshold: 5 kg. Plan restock for tomorrow.",                   time: "2h ago",     read: true  },
  { id: "6",  type: "security", severity: "warning",  title: "Unusual Discount Applied",            message: "100% discount applied to Order #44 (₹840 waived) by user: cashier01. Please verify.",        time: "2h ago",     read: true,  actionLabel: "Review", actionHref: "/reports" },
  { id: "7",  type: "sales",    severity: "info",     title: "Peak Hour Starting",                  message: "Historical data shows 7-9 PM is peak. Current kitchen has 8 pending orders.",                 time: "3h ago",     read: true  },
  { id: "8",  type: "system",   severity: "info",     title: "KDS Connection Restored",             message: "Kitchen Display System reconnected after brief network interruption at 3:12 PM.",              time: "4h ago",     read: true  },
  { id: "9",  type: "stock",    severity: "critical", title: "Cooking Oil Almost Empty",            message: "Cooking oil at 2.1 litres. Minimum is 3 litres. Cannot complete evening service without restock.", time: "4h ago", read: true, actionLabel: "Reorder", actionHref: "/purchases" },
  { id: "10", type: "sales",    severity: "success",  title: "Biryani Sales Record",                message: "Chicken Biryani sold 18 plates today — new daily record! Previous record was 15 plates.",      time: "5h ago",     read: true  },
];

const TYPE_CONFIG: Record<AlertType, { label: string; icon: any; color: string; bg: string }> = {
  stock:    { label: "Low Stock",  icon: Package,      color: "text-orange-500",  bg: "bg-orange-50 dark:bg-orange-900/20" },
  sales:    { label: "Sales",      icon: TrendingUp,   color: "text-emerald-500", bg: "bg-emerald-50 dark:bg-emerald-900/20" },
  kitchen:  { label: "Kitchen",    icon: Clock,        color: "text-blue-500",    bg: "bg-blue-50 dark:bg-blue-900/20" },
  security: { label: "Security",   icon: Shield,       color: "text-purple-500",  bg: "bg-purple-50 dark:bg-purple-900/20" },
  system:   { label: "System",     icon: RefreshCw,    color: "text-gray-500",    bg: "bg-gray-50 dark:bg-white/10" },
};

const SEVERITY_STYLES: Record<AlertSeverity, string> = {
  critical: "border-l-4 border-l-red-500 bg-red-50/30 dark:bg-red-900/5",
  warning:  "border-l-4 border-l-amber-400 bg-amber-50/30 dark:bg-amber-900/5",
  info:     "border-l-4 border-l-blue-400 bg-blue-50/30 dark:bg-blue-900/5",
  success:  "border-l-4 border-l-emerald-400 bg-emerald-50/30 dark:bg-emerald-900/5",
};

const SEVERITY_BADGE: Record<AlertSeverity, string> = {
  critical: "bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-400",
  warning:  "bg-amber-100 text-amber-700 dark:bg-amber-900/20 dark:text-amber-400",
  info:     "bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400",
  success:  "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400",
};

export default function AlertsPage() {
  const [alerts, setAlerts] = useState<Alert[]>(INITIAL_ALERTS);
  const [filterType, setFilterType] = useState<"all" | AlertType>("all");
  const [filterSeverity, setFilterSeverity] = useState<"all" | AlertSeverity>("all");
  const [showUnreadOnly, setShowUnreadOnly] = useState(false);

  const filtered = alerts.filter((a) => {
    if (filterType !== "all" && a.type !== filterType) return false;
    if (filterSeverity !== "all" && a.severity !== filterSeverity) return false;
    if (showUnreadOnly && a.read) return false;
    return true;
  });

  const unreadCount = alerts.filter((a) => !a.read).length;
  const criticalCount = alerts.filter((a) => a.severity === "critical" && !a.read).length;

  const markRead = (id: string) => setAlerts((p) => p.map((a) => a.id === id ? { ...a, read: true } : a));
  const markAllRead = () => setAlerts((p) => p.map((a) => ({ ...a, read: true })));
  const dismiss = (id: string) => setAlerts((p) => p.filter((a) => a.id !== id));

  return (
    <div className="max-w-5xl mx-auto space-y-6">

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-gray-900 dark:text-white flex items-center gap-2">
            <Bell size={24} className="text-orange-500" />
            Real-Time Alerts
          </h1>
          <p className="text-sm text-gray-500 dark:text-slate-400 mt-1">Owner-level visibility into stock, sales, kitchen & security</p>
        </div>
        <div className="flex items-center gap-2">
          {unreadCount > 0 && (
            <button onClick={markAllRead} className="flex items-center gap-1.5 px-4 py-2 border border-gray-200 dark:border-white/10 rounded-xl text-[12px] font-bold text-gray-500 hover:bg-gray-50 dark:hover:bg-white/5 transition-all">
              <CheckCircle2 size={13} /> Mark All Read
            </button>
          )}
          <div className="flex items-center gap-1.5 bg-orange-50 dark:bg-orange-900/10 border border-orange-200 dark:border-orange-800/30 rounded-xl px-3 py-2">
            <div className="w-2 h-2 rounded-full bg-orange-500 animate-pulse" />
            <span className="text-[11px] font-bold text-orange-600 dark:text-orange-400">Live Monitoring</span>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Unread",    value: unreadCount,  color: "text-orange-500", bg: "bg-orange-50 dark:bg-orange-900/10",    icon: Bell },
          { label: "Critical",  value: criticalCount, color: "text-red-500",   bg: "bg-red-50 dark:bg-red-900/10",          icon: AlertTriangle },
          { label: "Low Stock", value: alerts.filter((a) => a.type === "stock").length,    color: "text-amber-500", bg: "bg-amber-50 dark:bg-amber-900/10", icon: Package },
          { label: "Today",     value: alerts.length, color: "text-blue-500",  bg: "bg-blue-50 dark:bg-blue-900/10",        icon: ShoppingCart },
        ].map((s) => (
          <div key={s.label} className={clsx("rounded-2xl border border-gray-100 dark:border-white/5 p-4 flex items-center gap-3", s.bg)}>
            <div className="w-9 h-9 rounded-xl bg-white dark:bg-card flex items-center justify-center shadow-sm">
              <s.icon size={16} className={s.color} />
            </div>
            <div>
              <p className={clsx("text-xl font-black", s.color)}>{s.value}</p>
              <p className="text-[11px] text-gray-500 dark:text-slate-400 font-semibold">{s.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3 bg-white dark:bg-card rounded-2xl border border-gray-100 dark:border-white/5 p-4">
        <Filter size={14} className="text-gray-400" />

        <div className="flex gap-1.5 flex-wrap">
          {(["all", "stock", "sales", "kitchen", "security", "system"] as const).map((t) => (
            <button key={t} onClick={() => setFilterType(t)}
              className={clsx("px-3 py-1.5 rounded-xl text-[11px] font-bold capitalize transition-all",
                filterType === t ? "bg-orange-500 text-white" : "bg-gray-100 dark:bg-white/5 text-gray-500 hover:bg-orange-50 hover:text-orange-600"
              )}
            >
              {t === "all" ? "All Types" : TYPE_CONFIG[t as AlertType]?.label}
            </button>
          ))}
        </div>

        <div className="w-px h-5 bg-gray-200 dark:bg-white/10" />

        <div className="flex gap-1.5">
          {(["all", "critical", "warning", "info", "success"] as const).map((s) => (
            <button key={s} onClick={() => setFilterSeverity(s)}
              className={clsx("px-3 py-1.5 rounded-xl text-[11px] font-bold capitalize transition-all",
                filterSeverity === s ? "bg-orange-500 text-white" : "bg-gray-100 dark:bg-white/5 text-gray-500 hover:bg-orange-50 hover:text-orange-600"
              )}
            >
              {s === "all" ? "All" : s}
            </button>
          ))}
        </div>

        <button onClick={() => setShowUnreadOnly(!showUnreadOnly)}
          className={clsx("ml-auto flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[11px] font-bold transition-all",
            showUnreadOnly ? "bg-orange-500 text-white" : "bg-gray-100 dark:bg-white/5 text-gray-500 hover:bg-orange-50 hover:text-orange-600"
          )}
        >
          {showUnreadOnly ? <EyeOff size={12} /> : <Eye size={12} />}
          {showUnreadOnly ? "Show All" : "Unread Only"}
        </button>
      </div>

      {/* Alert Feed */}
      <div className="space-y-2">
        {filtered.map((alert) => {
          const typeConf = TYPE_CONFIG[alert.type];
          const Icon = typeConf.icon;
          return (
            <div
              key={alert.id}
              className={clsx(
                "bg-white dark:bg-card rounded-2xl border border-gray-100 dark:border-white/5 overflow-hidden transition-all hover:shadow-sm",
                SEVERITY_STYLES[alert.severity],
                !alert.read && "ring-1 ring-orange-200 dark:ring-orange-800/30"
              )}
            >
              <div className="flex items-start gap-4 p-4">
                <div className={clsx("w-9 h-9 rounded-xl flex items-center justify-center shrink-0", typeConf.bg)}>
                  <Icon size={16} className={typeConf.color} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="text-[13px] font-bold text-gray-900 dark:text-white leading-tight">{alert.title}</h3>
                      {!alert.read && <span className="w-1.5 h-1.5 rounded-full bg-orange-500 shrink-0 mt-0.5" />}
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      <span className={clsx("px-2 py-0.5 rounded-lg text-[9px] font-black uppercase tracking-wider", SEVERITY_BADGE[alert.severity])}>
                        {alert.severity}
                      </span>
                      <button onClick={() => dismiss(alert.id)} className="p-1 rounded-lg text-gray-300 hover:text-gray-500 dark:hover:text-slate-400 transition-colors">
                        <X size={13} />
                      </button>
                    </div>
                  </div>
                  <p className="text-[12px] text-gray-500 dark:text-slate-400 mt-1 leading-relaxed">{alert.message}</p>
                  <div className="flex items-center gap-3 mt-2.5">
                    <span className="text-[10px] text-gray-400 flex items-center gap-1">
                      <Clock size={10} /> {alert.time}
                    </span>
                    <span className={clsx("text-[10px] font-bold px-2 py-0.5 rounded-lg", typeConf.bg, typeConf.color)}>
                      {typeConf.label}
                    </span>
                    {!alert.read && (
                      <button onClick={() => markRead(alert.id)} className="text-[10px] text-orange-500 font-bold hover:underline">
                        Mark Read
                      </button>
                    )}
                    {alert.actionLabel && alert.actionHref && (
                      <a href={alert.actionHref} className="text-[10px] font-bold text-white bg-orange-500 hover:bg-orange-400 px-2.5 py-1 rounded-lg transition-all">
                        {alert.actionLabel} →
                      </a>
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })}

        {filtered.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 gap-4 text-gray-300 dark:text-slate-600">
            <CheckCircle2 size={48} strokeWidth={1} />
            <p className="text-sm font-semibold">No alerts matching your filters</p>
          </div>
        )}
      </div>
    </div>
  );
}
