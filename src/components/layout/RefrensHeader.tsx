"use client";

import {
  Menu,
  Bell,
  ChevronDown,
  Settings,
  LogOut,
  CheckCircle,
  AlertCircle,
  Info,
  Search,
  X,
  ShoppingCart,
  AlertTriangle,
  TrendingUp,
  ChefHat,
} from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { clsx } from "clsx";
import { usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useSidebar } from "@/context/SidebarContext";
import { menuItems } from "@/config/navigation";

interface Notification {
  id: string;
  type: "success" | "warning" | "info" | "alert";
  title: string;
  message: string;
  time: string;
  read: boolean;
}

const MOCK_NOTIFICATIONS: Notification[] = [
  { id: "1", type: "success",  title: "Order Completed",    message: "Table #5 order ₹840 paid via UPI.",         time: "2m ago",    read: false },
  { id: "2", type: "alert",    title: "Low Stock ⚠️",        message: "Chicken stock below 2kg threshold.",          time: "15m ago",   read: false },
  { id: "3", type: "warning",  title: "Kitchen Delay",      message: "Order #47 waiting 18 mins in queue.",         time: "20m ago",   read: false },
  { id: "4", type: "success",  title: "Daily Target Hit",   message: "Today's sales crossed ₹25,000 🎉",            time: "1h ago",    read: true  },
  { id: "5", type: "info",     title: "Recipe Updated",     message: "Biryani recipe modified by Chef Ramesh.",     time: "3h ago",    read: true  },
];

const SEARCH_SUGGESTIONS = [
  "Billing & POS", "Kitchen Display", "Menu Management", "Recipe Management",
  "Raw Materials", "Stock Alerts", "Customer Database", "Sales Reports",
  "Waste & Loss", "Production Batches", "GST Reports", "Business Settings",
];

function NIcon({ type }: { type: Notification["type"] }) {
  if (type === "success") return <CheckCircle size={14} className="text-emerald-500 shrink-0" />;
  if (type === "alert")   return <AlertTriangle size={14} className="text-red-500 shrink-0" />;
  if (type === "warning") return <AlertCircle size={14} className="text-amber-500 shrink-0" />;
  return <Info size={14} className="text-blue-500 shrink-0" />;
}

function HBtn({
  children, title, onClick, badge,
}: {
  children: React.ReactNode;
  title?: string;
  onClick?: () => void;
  badge?: number | string;
}) {
  return (
    <button
      title={title}
      onClick={onClick}
      className="relative p-2 rounded-xl text-gray-500 dark:text-slate-400 hover:bg-orange-50 dark:hover:bg-white/5 hover:text-orange-500 dark:hover:text-orange-400 transition-all duration-150"
    >
      {children}
      {badge !== undefined && (
        <span className="absolute -top-0.5 -right-0.5 min-w-[16px] h-4 px-0.5 bg-red-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center border-2 border-white dark:border-[#0f1117] leading-none">
          {badge}
        </span>
      )}
    </button>
  );
}

function SearchModal({ onClose }: { onClose: () => void }) {
  const [q, setQ] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => { inputRef.current?.focus(); }, []);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  const filtered = q
    ? SEARCH_SUGGESTIONS.filter((s) => s.toLowerCase().includes(q.toLowerCase()))
    : SEARCH_SUGGESTIONS;

  return (
    <div className="fixed inset-0 z-[200] flex items-start justify-center pt-20 bg-black/30 backdrop-blur-sm" onClick={onClose}>
      <div
        className="w-full max-w-xl bg-white dark:bg-[#0f1117] rounded-2xl border border-orange-100 dark:border-white/10 shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-3 px-4 py-3 border-b border-orange-50 dark:border-white/5">
          <Search size={16} className="text-orange-400 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search POS, recipes, inventory, reports…"
            className="flex-1 text-sm text-gray-900 dark:text-white bg-transparent outline-none placeholder:text-gray-400"
          />
          {q && (
            <button onClick={() => setQ("")} className="text-gray-400 hover:text-gray-600 transition-colors">
              <X size={15} />
            </button>
          )}
          <kbd className="hidden sm:flex items-center gap-1 text-[10px] font-medium text-gray-400 border border-gray-200 dark:border-white/10 rounded px-1.5 py-0.5">
            ESC
          </kbd>
        </div>
        <div className="max-h-64 overflow-y-auto hide-scrollbar py-1">
          {filtered.length > 0 ? (
            filtered.map((s) => (
              <button
                key={s}
                onClick={onClose}
                className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 dark:text-slate-300 hover:bg-orange-50 dark:hover:bg-orange-900/10 hover:text-orange-700 dark:hover:text-orange-300 transition-colors text-left"
              >
                <Search size={13} className="text-gray-300 dark:text-slate-600 shrink-0" />
                {s}
              </button>
            ))
          ) : (
            <p className="px-4 py-6 text-center text-sm text-gray-400 dark:text-slate-500">
              No results for &quot;{q}&quot;
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

export default function RefrensHeader() {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const { toggleCollapsed } = useSidebar();

  if (pathname === "/login") return null;

  const [showSearch,        setShowSearch]        = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfile,       setShowProfile]       = useState(false);
  const [notifications,     setNotifications]     = useState(MOCK_NOTIFICATIONS);

  const notifRef   = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);

  const unreadCount = notifications.filter((n) => !n.read).length;
  const initials =
    user?.fullName?.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase() || "KF";

  const markAllRead = () => setNotifications((p) => p.map((n) => ({ ...n, read: true })));
  const markRead = (id: string) =>
    setNotifications((p) => p.map((n) => (n.id === id ? { ...n, read: true } : n)));

  const getPageTitle = () => {
    for (const item of menuItems) {
      if (item.href === pathname) return item.label;
      if (item.children) {
        const child = item.children.find((c) => c.href === pathname);
        if (child) return child.label;
      }
    }
    // Fallback for special cases or home
    if (pathname === "/") return "Dashboard";
    return "";
  };

  const pageTitle = getPageTitle();

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (notifRef.current   && !notifRef.current.contains(e.target as Node))   setShowNotifications(false);
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) setShowProfile(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <>
      {showSearch && <SearchModal onClose={() => setShowSearch(false)} />}

      <header className="w-full h-14 bg-white dark:bg-[#0f1117] border-b border-orange-100 dark:border-white/5 flex items-center px-4 gap-3 sticky top-0 z-40 shadow-sm">

        {/* ── Left: Hamburger + Logo ──────────────────── */}
        <button
          onClick={toggleCollapsed}
          className="p-2 -ml-2 rounded-xl text-gray-500 dark:text-slate-400 hover:bg-orange-50 dark:hover:bg-white/5 hover:text-orange-500 transition-all"
          aria-label="Toggle sidebar"
        >
          <Menu size={20} strokeWidth={1.8} />
        </button>

        {/* Dynamic Page Title */}
        {pageTitle && (
          <div className="flex items-center gap-3 animate-in fade-in slide-in-from-left-2 duration-300">
            <div className="w-px h-5 bg-orange-200 dark:bg-white/10 hidden sm:block" />
            <h1 className="text-[15px] font-black text-gray-900 dark:text-white tracking-tight">
              {pageTitle}
            </h1>
            {pageTitle === "Billing & POS" && (
              <div className="flex items-center gap-1.5 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800/30 rounded-full px-2.5 py-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">Live</span>
              </div>
            )}
          </div>
        )}

        <div className="flex-1" />

        {/* ── Right Actions ──────────────────────────── */}
        <div className="flex items-center gap-1">

          {/* Today's quick stats */}
          <div className="hidden lg:flex items-center gap-3 border border-orange-100 dark:border-white/10 bg-orange-50/50 dark:bg-white/5 rounded-xl px-3 py-1.5 mr-2">
            <div className="flex items-center gap-1.5">
              <TrendingUp size={13} className="text-orange-500" />
              <span className="text-[11px] font-bold text-gray-700 dark:text-slate-300">₹24,860</span>
              <span className="text-[10px] text-gray-400">today</span>
            </div>
            <div className="w-px h-3 bg-orange-200 dark:bg-white/10" />
            <div className="flex items-center gap-1.5">
              <ShoppingCart size={12} className="text-orange-500" />
              <span className="text-[11px] font-bold text-gray-700 dark:text-slate-300">47 orders</span>
            </div>
          </div>

          {/* Search */}
          <HBtn title="Search (Ctrl+K)" onClick={() => setShowSearch(true)}>
            <Search size={18} strokeWidth={1.8} />
          </HBtn>

          {/* Notifications */}
          <div className="relative" ref={notifRef}>
            <HBtn
              title="Notifications"
              badge={unreadCount > 0 ? unreadCount : undefined}
              onClick={() => { setShowNotifications((v) => !v); setShowProfile(false); }}
            >
              <Bell size={18} strokeWidth={1.8} />
            </HBtn>

            {showNotifications && (
              <div className="absolute right-0 top-full mt-2 w-80 bg-white dark:bg-[#0f1117] rounded-2xl border border-orange-100 dark:border-white/10 shadow-2xl shadow-black/10 overflow-hidden z-50">
                <div className="flex items-center justify-between px-4 py-3 border-b border-orange-50 dark:border-white/5">
                  <h3 className="text-sm font-bold text-gray-900 dark:text-white">
                    Alerts
                    {unreadCount > 0 && (
                      <span className="ml-2 px-1.5 py-0.5 bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400 text-[10px] font-bold rounded-full">
                        {unreadCount}
                      </span>
                    )}
                  </h3>
                  {unreadCount > 0 && (
                    <button onClick={markAllRead} className="text-[11px] text-orange-500 hover:underline font-semibold">
                      Mark all read
                    </button>
                  )}
                </div>
                <div className="max-h-72 overflow-y-auto hide-scrollbar divide-y divide-orange-50 dark:divide-white/5">
                  {notifications.map((n) => (
                    <button
                      key={n.id}
                      onClick={() => markRead(n.id)}
                      className={clsx(
                        "w-full flex items-start gap-3 px-4 py-3 text-left hover:bg-orange-50/50 dark:hover:bg-white/5 transition-colors",
                        !n.read && "bg-orange-50/40 dark:bg-orange-900/10"
                      )}
                    >
                      <div className="mt-0.5"><NIcon type={n.type} /></div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[13px] font-semibold text-gray-900 dark:text-white leading-tight">
                          {n.title}
                          {!n.read && <span className="ml-1.5 inline-block w-1.5 h-1.5 rounded-full bg-orange-500 align-middle" />}
                        </p>
                        <p className="text-[12px] text-gray-500 dark:text-slate-400 mt-0.5">{n.message}</p>
                        <p className="text-[11px] text-gray-400 dark:text-slate-500 mt-1">{n.time}</p>
                      </div>
                    </button>
                  ))}
                </div>
                <div className="px-4 py-2.5 border-t border-orange-50 dark:border-white/5">
                  <a href="/alerts" className="w-full text-[12px] text-orange-500 font-semibold hover:underline text-center block">
                    View all alerts →
                  </a>
                </div>
              </div>
            )}
          </div>

          {/* Profile Avatar */}
          <div className="relative ml-1" ref={profileRef}>
            <button
              onClick={() => { setShowProfile((v) => !v); setShowNotifications(false); }}
              className="flex items-center gap-1.5 pl-2 border-l border-orange-100 dark:border-white/5 group"
              aria-label="Open profile menu"
            >
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-orange-400 via-orange-500 to-orange-600 flex items-center justify-center text-white font-black text-sm group-hover:scale-105 transition-all ring-2 ring-white dark:ring-[#0f1117] shadow-md">
                {initials}
              </div>
              <ChevronDown
                size={13}
                strokeWidth={2.5}
                className={clsx(
                  "text-gray-400 dark:text-slate-500 transition-transform duration-200",
                  showProfile && "rotate-180"
                )}
              />
            </button>

            {showProfile && (
              <div className="absolute right-0 top-full mt-2 w-64 bg-white dark:bg-[#0f1117] rounded-2xl border border-orange-100 dark:border-white/10 shadow-2xl shadow-black/10 overflow-hidden z-50">
                <div className="flex items-center gap-3 px-4 py-4">
                  <div className="relative">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-orange-400 via-orange-500 to-orange-600 flex items-center justify-center text-white font-black text-base shrink-0 shadow-lg border-2 border-white dark:border-[#0f1117]">
                      {initials}
                    </div>
                    <span className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-emerald-500 rounded-full border-2 border-white dark:border-[#0f1117] shadow-sm" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[13px] font-bold text-gray-900 dark:text-white truncate">
                      {user?.fullName || "Kiddos Food Business"}
                    </p>
                    <p className="text-[11px] text-gray-500 dark:text-slate-400 truncate mt-0.5">
                      {user?.email || "businessgroupikasle@gmail.com"}
                    </p>
                  </div>
                </div>

                <div className="mx-4 border-t border-orange-50 dark:border-white/5" />

                <div className="py-1.5">
                  <a
                    href="/settings/general"
                    className="flex items-center gap-3 px-4 py-2.5 text-[13px] text-gray-700 dark:text-slate-300 hover:bg-orange-50 dark:hover:bg-white/5 hover:text-orange-600 transition-colors"
                  >
                    <Settings size={15} className="text-gray-400 shrink-0" />
                    Business Settings
                  </a>
                  <button
                    onClick={logout}
                    className="w-full flex items-center gap-3 px-4 py-2.5 text-[13px] text-gray-700 dark:text-slate-300 hover:bg-red-50 dark:hover:bg-red-900/10 hover:text-red-600 transition-colors"
                  >
                    <LogOut size={15} className="text-gray-400 shrink-0" />
                    Logout
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </header>
    </>
  );
}
