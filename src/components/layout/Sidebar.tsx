"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LogOut,
  ChevronRight,
  ChevronUp,
  Plus,
  Receipt,
  ChevronDown,
  Sun,
  Moon,
  Landmark,
  Store
} from "lucide-react";
import Image from "next/image";
import { useState, useRef, useEffect, useCallback } from "react";
import { clsx } from "clsx";
import { useTheme } from "@/context/ThemeContext";
import { useAuth } from "@/context/AuthContext";
import { useSidebar } from "@/context/SidebarContext";
import { menuSections } from "@/config/navigation";

export default function Sidebar() {
  const pathname = usePathname();
  const { theme, toggleTheme } = useTheme();
  const { user, logout } = useAuth();
  const { isCollapsed } = useSidebar();

  const [expandedMenus, setExpandedMenus] = useState<string[]>(["Sales CRM"]);
  const [collapsedSections, setCollapsedSections] = useState<string[]>([]);
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);
  const [canScrollUp, setCanScrollUp] = useState(false);
  const [canScrollDown, setCanScrollDown] = useState(false);
  const navRef = useRef<HTMLElement>(null);

  const checkScroll = useCallback(() => {
    const el = navRef.current;
    if (!el) return;
    setCanScrollUp(el.scrollTop > 4);
    setCanScrollDown(el.scrollTop + el.clientHeight < el.scrollHeight - 4);
  }, []);

  useEffect(() => {
    const el = navRef.current;
    if (!el) return;
    checkScroll();
    el.addEventListener("scroll", checkScroll, { passive: true });
    const ro = new ResizeObserver(checkScroll);
    ro.observe(el);
    return () => {
      el.removeEventListener("scroll", checkScroll);
      ro.disconnect();
    };
  }, [checkScroll]);

  const scrollNav = (dir: "up" | "down") =>
    navRef.current?.scrollBy({ top: dir === "up" ? -140 : 140, behavior: "smooth" });

  const toggleMenu = (label: string) => {
    if (isCollapsed) return;
    setExpandedMenus((prev) =>
      prev.includes(label) ? prev.filter((l) => l !== label) : [...prev, label]
    );
  };

  const toggleSection = (section: string) => {
    setCollapsedSections((prev) =>
      prev.includes(section) ? prev.filter((s) => s !== section) : [...prev, section]
    );
  };

  const userRole = user?.role?.toUpperCase() || "STAFF";
  const initials = user?.fullName?.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase() || "NX";

  if (pathname === "/login") return null;

  return (
    <aside
      className={clsx(
        "relative flex flex-col h-screen shrink-0 sidebar-transition z-50",
        "bg-white dark:bg-[#0f1117] border-r border-orange-100 dark:border-white/5",
        isCollapsed ? "w-[72px]" : "w-[288px]"
      )}
    >
      {/* ── Brand / User Header ─────────────────────── */}
      <div
        className={clsx(
          "flex items-center border-b border-orange-100 dark:border-white/5 shrink-0",
          isCollapsed ? "px-2 py-3 justify-center" : "px-4 py-3 gap-3"
        )}
      >
        <div className="relative w-8 h-8 rounded-lg overflow-hidden shrink-0 shadow-md">
          <Image
            src="/logo.png"
            alt="Logo"
            fill
            className="object-contain"
          />
        </div>
        {!isCollapsed && (
          <div className="flex-1 min-w-0">
            <p className="text-[13px] font-semibold text-gray-900 dark:text-white truncate leading-tight">
              Kiddos Food
            </p>
            <p className="text-[11px] text-orange-500 dark:text-orange-400 font-medium leading-tight">
              Food Business Ecosystem
            </p>
          </div>
        )}
      </div>


      {/* ── Nav Wrapper ─────────────────────────────── */}
      <div className="relative flex-1 flex flex-col min-h-0">

        {/* Scroll Up */}
        {canScrollUp && (
          <div className="absolute top-0 inset-x-0 flex justify-center pt-1 z-10 pointer-events-none">
            {/* Scroll indicator hidden as per icon removal request */}
          </div>
        )}

        {/* Navigation */}
        <nav
          ref={navRef}
          className={clsx(
            "flex-1 overflow-y-auto hide-scrollbar",
            "px-3 py-4"
          )}
        >
          <div className="space-y-0.5">
            {menuSections.map((section) => {
              const filteredItems = section.items.filter(
                (item) => !user || item.roles.includes(userRole)
              );
              if (filteredItems.length === 0) return null;

              return (
                <div key={section.section}>
                  {/* Section Header */}
                  {!isCollapsed && (
                    <div 
                      onClick={() => toggleSection(section.section)}
                      className="px-2 pb-2 mt-6 flex items-center justify-between cursor-pointer group/section"
                    >
                      <p className={clsx(
                        "text-[10px] font-black uppercase tracking-[0.2em] transition-colors",
                        (section.section === "OVERVIEW" || section.section === "HOME HOUSE") 
                          ? "text-orange-500/80 dark:text-orange-400" 
                          : "text-slate-400 dark:text-slate-600 group-hover/section:text-slate-500"
                      )}>
                        {section.section}
                      </p>
                      <ChevronDown 
                        size={11} 
                        className={clsx(
                          "text-slate-300 dark:text-slate-700 transition-transform duration-300",
                          collapsedSections.includes(section.section) ? "-rotate-90" : "rotate-0"
                        )} 
                      />
                    </div>
                  )}

                  <div className={clsx(
                    "space-y-1 transition-all duration-300 overflow-hidden",
                    collapsedSections.includes(section.section) ? "max-h-0 opacity-0" : "max-h-[1000px] opacity-100"
                  )}>

                  {/* Section Items */}
                  {filteredItems.map((item) => {
                    const isExpanded = expandedMenus.includes(item.label);
                    const hasChildren = !!item.children?.length;
                    const isActive =
                      pathname === item.href ||
                      (hasChildren && item.children?.some((c) => pathname === c.href));
                    const isHovered = hoveredItem === item.label;

                    return (
                      <div
                        key={item.label}
                        className="relative"
                        onMouseEnter={() => setHoveredItem(item.label)}
                        onMouseLeave={() => setHoveredItem(null)}
                      >
                        {/* Row */}
                        <div
                          onClick={() => hasChildren ? toggleMenu(item.label) : undefined}
                          className={clsx(
                            "flex items-center gap-3 rounded-2xl cursor-pointer select-none transition-all duration-200",
                            "px-3 py-3",
                            isActive
                              ? "bg-gradient-to-r from-orange-500/10 to-orange-500/5 text-orange-600 dark:text-orange-400 backdrop-blur-md border border-orange-500/10 shadow-[0_4px_12px_-2px_rgba(255,107,0,0.12)]"
                              : "text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-white/5 hover:text-slate-900 dark:hover:text-slate-200"
                          )}
                        >
                          {hasChildren ? (
                            <span className="flex items-center gap-3 flex-1 min-w-0">
                              <span className="text-[13px] font-bold flex-1 truncate tracking-tight">{item.label}</span>
                            </span>
                          ) : (
                            <Link
                              href={item.href}
                              className="flex items-center gap-3 flex-1 min-w-0"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <span className="text-[13px] font-bold flex-1 truncate tracking-tight">{item.label}</span>
                            </Link>
                          )}

                          {!isCollapsed && item.isNew && (
                            <span className="badge-new shrink-0">New</span>
                          )}
                          {!isCollapsed && item.isHot && !item.isNew && (
                            <span className="badge-hot shrink-0">Hot</span>
                          )}
                          {!isCollapsed && hasChildren && (
                            <ChevronRight
                              size={12}
                              strokeWidth={2.5}
                              className={clsx(
                                "shrink-0 text-gray-300 dark:text-slate-600 transition-transform duration-200",
                                isExpanded && "rotate-90"
                              )}
                            />
                          )}
                        </div>

                        {/* Tooltip (collapsed) */}
                        {isCollapsed && isHovered && (
                          <div className="absolute left-full top-1/2 -translate-y-1/2 ml-3 z-[200] pointer-events-none">
                            <div className="bg-gray-900 dark:bg-slate-700 text-white text-[11px] font-semibold px-2.5 py-1.5 rounded-lg shadow-xl whitespace-nowrap">
                              {item.label}
                              {item.isNew && (
                                <span className="ml-1.5 text-orange-400 text-[9px] font-bold">NEW</span>
                              )}
                              <div className="absolute right-full top-1/2 -translate-y-1/2 border-4 border-transparent border-r-gray-900 dark:border-r-slate-700" />
                            </div>
                          </div>
                        )}

                        {/* Submenu */}
                        {!isCollapsed && hasChildren && isExpanded && (
                          <div className="pl-[30px] mt-0.5 space-y-0.5 pb-1">
                            {item.children?.map((child) => (
                              <Link
                                key={child.href}
                                href={child.href}
                                className={clsx(
                                  "flex items-center justify-between px-2.5 py-1.5 rounded-lg text-[12px] font-medium transition-all",
                                  pathname === child.href
                                    ? "text-orange-600 dark:text-orange-300 bg-orange-50/80 dark:bg-orange-900/10"
                                    : "text-gray-500 dark:text-slate-500 hover:text-gray-800 dark:hover:text-slate-300 hover:bg-orange-50/50 dark:hover:bg-white/5"
                                )}
                              >
                                <span className="truncate">{child.label}</span>
                                {child.isNew && (
                                  <span className="text-[9px] font-bold text-orange-500 dark:text-orange-400 uppercase tracking-wider shrink-0 ml-2">
                                    New
                                  </span>
                                )}
                              </Link>
                            ))}
                          </div>
                        )}
                      </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </nav>

        {/* Scroll Down */}
        {canScrollDown && (
          <div className="absolute bottom-0 inset-x-0 flex justify-center pb-1 z-10 pointer-events-none">
            {/* Scroll indicator hidden as per icon removal request */}
          </div>
        )}
      </div>

      {/* ── Footer Removed ────────────────────────── */}
    </aside>
  );
}
