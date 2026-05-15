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
  Store,
  X as CloseIcon,
  PanelLeftClose,
  PanelLeftOpen
} from "lucide-react";

import { useState, useRef, useEffect, useCallback } from "react";
import { clsx } from "clsx";
import { useTheme } from "@/context/ThemeContext";
import { useAuth } from "@/context/AuthContext";
import { useSidebar } from "@/context/SidebarContext";
import { SUPER_ADMIN_SIDEBAR, franchiseMenuSections } from "@/config/navigation";

export default function Sidebar() {
  const pathname = usePathname();
  const { theme, toggleTheme } = useTheme();
  const { user, logout } = useAuth();
  const { isCollapsed, toggleCollapsed, isMobileOpen, closeMobile } = useSidebar();

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

  const userRole = user?.role?.toUpperCase() || "";
  const isFranchiseUser = userRole === "FRANCHISE_ADMIN";

  const sections = isFranchiseUser ? franchiseMenuSections : SUPER_ADMIN_SIDEBAR;

  if (pathname === "/login") return null;

  return (
    <aside
      className={clsx(
        "fixed inset-y-0 left-0 lg:relative flex flex-col h-screen shrink-0 sidebar-transition z-[100] lg:z-50",
        "bg-white/70 dark:bg-[#0f1117]/80 backdrop-blur-xl transition-all duration-500 ease-in-out",
        isCollapsed ? "lg:w-[88px]" : "lg:w-[280px] border-r border-orange-100/50 dark:border-white/5",
        isMobileOpen ? "translate-x-0 w-[280px] border-r border-orange-100/50" : "-translate-x-full lg:translate-x-0"
      )}
    >
      {/* Mobile Overlay */}
      {isMobileOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/30 backdrop-blur-[2px] lg:hidden z-[-1]" 
          onClick={closeMobile}
        />
      )}
      {/* ── Brand / User Header ─────────────────────── */}
      <div
        className={clsx(
          "flex items-center border-b border-orange-100/50 dark:border-white/5 shrink-0 transition-all duration-300",
          isCollapsed ? "px-2 py-4 justify-center" : "px-5 py-4 gap-3"
        )}
      >
        <div className={clsx(
          "relative rounded-xl overflow-hidden shrink-0 shadow-lg transition-all duration-500",
          isCollapsed ? "w-10 h-10" : "w-9 h-9"
        )}>
          <img
            src="/logo.png"
            alt="Logo"
            className="w-full h-full object-contain"
          />
        </div>
        {(!isCollapsed || isMobileOpen) && (
          <div className="flex-1 min-w-0 animate-in fade-in slide-in-from-left-2 duration-500">
            <p className="text-[15px] font-black text-gray-900 dark:text-white truncate tracking-tight leading-tight">
              Kiddos Food
            </p>
            <p className="text-[9px] text-orange-500 font-black leading-tight mt-0.5 uppercase tracking-[0.2em]">
              Control Center
            </p>
          </div>
        )}

        {/* Mobile Close Button */}
        <button
          onClick={closeMobile}
          className="lg:hidden p-1.5 rounded-lg hover:bg-slate-50 dark:hover:bg-white/5 text-slate-400 hover:text-red-500 transition-colors"
        >
          <CloseIcon size={20} />
        </button>
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
            "px-4 py-4"
          )}
        >
          <div className="space-y-0.5">
            {sections.map((section) => {
              const filteredItems = section.items.filter(
                (item) => !user || item.roles.includes(userRole)
              );
              if (filteredItems.length === 0) return null;

              return (
                <div key={section.title}>
                  {/* Section Header */}
                  {!isCollapsed && (
                    <div 
                      onClick={() => toggleSection(section.title)}
                      className="px-2 pb-2 mt-5 flex items-center justify-between cursor-pointer group/section"
                    >
                      <p className={clsx(
                        "text-[10px] font-black uppercase tracking-[0.3em] transition-colors",
                        "text-slate-400/70 dark:text-slate-500/70 group-hover/section:text-orange-500"
                      )}>
                        {section.title}
                      </p>
                      <ChevronDown 
                        size={10} 
                        className={clsx(
                          "text-slate-300 dark:text-slate-700 transition-transform duration-300",
                          collapsedSections.includes(section.title) ? "-rotate-90" : "rotate-0"
                        )} 
                      />
                    </div>
                  )}

                  {isCollapsed && (
                    <div className="h-px bg-slate-100 dark:bg-white/5 my-3 mx-4" />
                  )}

                  <div className={clsx(
                    "space-y-1 transition-all duration-300 overflow-hidden",
                    collapsedSections.includes(section.title) ? "max-h-0 opacity-0" : "max-h-[1000px] opacity-100"
                  )}>

                  {/* Section Items */}
                  {filteredItems.map((item) => {
                    const itemIcon = item.icon;
                    const isExpanded = expandedMenus.includes(item.label);
                    const hasChildren = !!item.children?.length;
                    const isActive =
                      pathname === item.href ||
                      (hasChildren && item.children?.some((c) => pathname === c.href));
                    const isHovered = hoveredItem === item.label;
                    const isComingSoon = item.isComingSoon;

                    const IconComponent = itemIcon;

                    return (
                      <div
                        key={item.label}
                        className="relative"
                        onMouseEnter={() => setHoveredItem(item.label)}
                        onMouseLeave={() => setHoveredItem(null)}
                      >
                        {/* Row */}
                        <div
                          onClick={() => (!hasChildren && !isComingSoon) ? undefined : (hasChildren ? toggleMenu(item.label) : undefined)}
                          className={clsx(
                            "flex items-center select-none transition-all duration-300 relative group/item",
                            isCollapsed ? "justify-center px-0 py-2" : "px-4 py-2 gap-3",
                            "my-0.5 rounded-xl",
                            isComingSoon ? "opacity-50 cursor-not-allowed grayscale" : "cursor-pointer",
                            isActive
                              ? "bg-white dark:bg-white/5 text-orange-600 dark:text-orange-400 shadow-[0_4px_20px_-4px_rgba(255,107,0,0.15)] ring-1 ring-orange-500/10"
                              : "text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-white/[0.03] hover:text-slate-900 dark:hover:text-slate-200"
                          )}
                        >
                          {/* Active Indicator Bar */}
                          {isActive && (
                            <div className={clsx(
                              "absolute bg-orange-500 rounded-full transition-all duration-300",
                              isCollapsed ? "left-1 top-1/2 -translate-y-1/2 w-1 h-8" : "left-0 top-1/2 -translate-y-1/2 w-1 h-6"
                            )} />
                          )}

                          {/* Icon (Visible only when collapsed) */}
                          {isCollapsed && IconComponent && (
                            <div className={clsx(
                              "flex items-center justify-center w-10 h-10 rounded-xl shrink-0 transition-all duration-300",
                              isActive ? "bg-orange-500 text-white shadow-lg shadow-orange-500/30" : "text-slate-400 group-hover/item:text-slate-600 dark:group-hover/item:text-slate-300"
                            )}>
                              <IconComponent size={20} strokeWidth={isActive ? 2.5 : 2} />
                            </div>
                          )}

                          {/* Label (Visible only when expanded) */}
                          {!isCollapsed && (
                            <>
                          {hasChildren ? (
                            <span className="flex items-center gap-3 flex-1 min-w-0">
                              <span className="text-[13px] font-semibold flex-1 truncate tracking-tight">{item.label}</span>
                            </span>
                          ) : (
                            isComingSoon ? (
                              <div className="flex items-center gap-3 flex-1 min-w-0">
                                <span className="text-[13px] font-semibold flex-1 truncate tracking-tight text-slate-400">{item.label}</span>
                              </div>
                            ) : (
                              <Link
                                href={item.href}
                                className="flex items-center gap-3 flex-1 min-w-0"
                                onClick={(e) => { e.stopPropagation(); closeMobile(); }}
                              >
                                <span className="text-[13px] font-semibold flex-1 truncate tracking-tight">{item.label}</span>
                              </Link>
                            )
                          )}

                          {!isCollapsed && item.isNew && (
                            <span className="badge-new shrink-0">New</span>
                          )}
                          {!isCollapsed && item.isComingSoon && (
                            <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500 uppercase tracking-wider shrink-0">Soon</span>
                          )}
                          {!isCollapsed && item.isHot && !item.isNew && !item.isComingSoon && (
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
                            </>
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
                          <div className="pl-11 mt-1 space-y-1 pb-2 relative">
                            {/* Connector Line */}
                            <div className="absolute left-[23px] top-0 bottom-4 w-px bg-slate-100 dark:bg-white/5" />
                            
                            {item.children?.map((child) => (
                              <Link
                                key={child.href}
                                href={child.href}
                                onClick={closeMobile}
                                className={clsx(
                                  "flex items-center justify-between px-3 py-2 rounded-lg text-[12px] font-medium transition-all relative",
                                  pathname === child.href
                                    ? "text-orange-600 dark:text-orange-400 bg-orange-50/50 dark:bg-orange-500/5"
                                    : "text-slate-500 dark:text-slate-500 hover:text-slate-900 dark:hover:text-slate-300 hover:bg-slate-50/50 dark:hover:bg-white/[0.02]"
                                )}
                              >
                                <span className="truncate">{child.label}</span>
                                {child.isNew && (
                                  <span className="text-[8px] font-black bg-orange-100 dark:bg-orange-500/20 text-orange-600 dark:text-orange-400 px-1.5 py-0.5 rounded uppercase tracking-wider shrink-0 ml-2">
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
