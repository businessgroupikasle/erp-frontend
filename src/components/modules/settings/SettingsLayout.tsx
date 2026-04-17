"use client";

import { ReactNode } from "react";
import { ChevronRight, ChevronDown } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { clsx } from "clsx";

interface SettingsLayoutProps {
  children: ReactNode;
  categoryTitle?: string;
}

export default function SettingsLayout({ 
  children, 
  categoryTitle = "Business Settings" 
}: SettingsLayoutProps) {
  const pathname = usePathname();

  const settingsItems = [
    { label: "General Settings", href: "/settings/general" },
    { label: "All Users", href: "/settings/team" },
    { label: "Roles & Permissions", href: "/settings/roles", isBeta: true },
    { label: "Accounting", href: "/settings/accounting" },
    { label: "Approval Workflow Settings", href: "/settings/approval" },
    { label: "Inventory", href: "/settings/inventory" },
    { label: "Advanced Accounting", href: "/settings/advanced" },
    { label: "Email Settings", href: "/settings/email" },
    { label: "Lead Management System (CRM)", href: "/settings/crm" },
    { label: "Custom Fields & Tags", href: "/settings/custom-fields" },
    { label: "Integrations", href: "/settings/integrations" },
    { label: "Clients Statement", href: "/settings/clients-statement" },
  ];

  return (
    <div className="min-h-screen bg-[#FDFCFD] dark:bg-[#020617] -m-8 font-sans">
      <div className="p-8 space-y-6">
        {/* Breadcrumbs */}
        <div className="flex items-center gap-2 text-[10px] font-bold text-[#999] uppercase tracking-widest transition-all">
          <Link href="/" className="hover:text-[#7C3AED]">Azeez</Link>
          <ChevronRight size={10} />
          <span className="text-[#666]">{categoryTitle}</span>
        </div>

        <h1 className="text-2xl font-black text-[#1A1A1A] dark:text-white">{categoryTitle}</h1>

        <div className="flex gap-8 items-start">
          {/* Settings Sidebar */}
          <aside className="w-64 flex flex-col space-y-1">
            {settingsItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.label}
                  href={item.href}
                  className={clsx(
                    "px-4 py-2.5 rounded-lg text-[13px] font-bold transition-all flex items-center justify-between group",
                    isActive 
                      ? "bg-[#F3E8FF] text-[#7C3AED]" 
                      : "text-[#666] dark:text-slate-400 hover:bg-[#F5F1F5] dark:hover:bg-slate-900/50 hover:text-[#1A1A1A] dark:hover:text-white"
                  )}
                >
                  <span className="flex-1 text-left">{item.label}</span>
                  {item.isBeta && (
                    <span className="px-2 py-0.5 rounded-full bg-[#E0E7FF] text-[#4F46E5] text-[9px] font-bold uppercase tracking-wider ml-2">
                       BETA
                    </span>
                  )}
                </Link>
              );
            })}

            <div className="pt-20">
               <Link 
                 href="/settings/user/profile"
                 className="px-4 py-3 flex items-center justify-between rounded-xl hover:bg-[#F5F1F5] dark:hover:bg-slate-900/50 group cursor-pointer border border-transparent hover:border-[#F0EAF0] transition-all"
               >
                  <div className="flex items-center gap-3">
                     <div className="w-8 h-8 rounded-lg bg-[#006699] flex items-center justify-center text-white text-[10px] font-black uppercase">
                        SAMI
                     </div>
                     <span className="text-[12px] font-black text-[#1A1A1A] dark:text-white">User Settings</span>
                  </div>
                  <ChevronRight size={14} className="text-[#999] group-hover:translate-x-1 transition-transform" />
               </Link>
            </div>
          </aside>

          {/* Settings Content Area */}
          <main className="flex-1 bg-white dark:bg-slate-900 border border-[#F0EAF0] dark:border-slate-800 rounded-3xl p-10 min-h-[700px] shadow-sm">
             {children}
          </main>
        </div>
      </div>
    </div>
  );
}
