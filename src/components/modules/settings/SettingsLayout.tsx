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

  interface SettingsItem {
    label: string;
    href: string;
    isBeta?: boolean;
  }

  const settingsItems: SettingsItem[] = [
    // { label: "All Users", href: "/settings/team" },
    // { label: "Roles & Permissions", href: "/settings/roles", isBeta: true },
    // { label: "Accounting", href: "/settings/accounting" },
    // { label: "Approval Workflow Settings", href: "/settings/approval" },
    // { label: "Inventory", href: "/settings/inventory" },
    // { label: "Advanced Accounting", href: "/settings/advanced" },
    // { label: "Email Settings", href: "/settings/email" },
    // { label: "Lead Management System (CRM)", href: "/settings/crm" },
    // { label: "Custom Fields & Tags", href: "/settings/custom-fields" },
    // { label: "Integrations", href: "/settings/integrations" },
    // { label: "Clients Statement", href: "/settings/clients-statement" },
  ];


  return (
    <div className="min-h-screen bg-[#FDFCFD] dark:bg-[#020617] font-sans -m-4 sm:-m-8">
      <div className="p-4 sm:p-8 space-y-6">
        {/* Breadcrumbs */}
        <div className="flex items-center gap-2 text-[10px] font-bold text-[#999] uppercase tracking-widest transition-all">
          <Link href="/" className="hover:text-[#7C3AED] transition-colors">Azeez</Link>
          <ChevronRight size={10} />
          <span className="text-[#666]">{categoryTitle}</span>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <h1 className="text-2xl sm:text-3xl font-black text-[#1A1A1A] dark:text-white tracking-tight">{categoryTitle}</h1>
        </div>

        <div className="flex flex-col lg:flex-row gap-6 lg:gap-10 items-start">
          {/* Settings Sidebar */}
          <aside className="w-full lg:w-72 flex flex-col space-y-1">
            <div className="flex lg:flex-col overflow-x-auto lg:overflow-x-visible pb-4 lg:pb-0 gap-1 hide-scrollbar">
              {settingsItems.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.label}
                    href={item.href}
                    className={clsx(
                      "px-4 py-3 rounded-xl text-[13px] font-bold transition-all flex items-center justify-between group whitespace-nowrap lg:whitespace-normal shrink-0 lg:shrink",
                      isActive 
                        ? "bg-[#7C3AED] text-white shadow-lg shadow-purple-500/20" 
                        : "text-[#666] dark:text-slate-400 hover:bg-white dark:hover:bg-slate-800 hover:text-[#1A1A1A] dark:hover:text-white border border-transparent hover:border-[#F0EAF0] dark:hover:border-slate-700 shadow-sm hover:shadow-md"
                    )}
                  >
                    <span className="flex-1 text-left">{item.label}</span>
                    {item.isBeta && (
                      <span className={clsx(
                        "px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider ml-2",
                        isActive ? "bg-white/20 text-white" : "bg-[#E0E7FF] text-[#4F46E5]"
                      )}>
                         BETA
                      </span>
                    )}
                  </Link>
                );
              })}
            </div>

            <div className="pt-6 lg:pt-12 border-t border-[#F0EAF0] dark:border-slate-800 mt-4 lg:mt-0">
               <Link 
                 href="/settings/user/profile"
                 className="px-4 py-4 flex items-center justify-between rounded-2xl bg-white dark:bg-slate-900 hover:bg-[#F3E8FF] dark:hover:bg-purple-900/20 group cursor-pointer border border-[#F0EAF0] dark:border-slate-800 hover:border-[#7C3AED]/30 transition-all shadow-sm hover:shadow-md"
               >
                  <div className="flex items-center gap-3">
                     <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#006699] to-[#004466] flex items-center justify-center text-white text-[11px] font-black uppercase shadow-inner">
                        SAMI
                     </div>
                     <div className="flex flex-col">
                        <span className="text-[13px] font-black text-[#1A1A1A] dark:text-white">User Settings</span>
                        <span className="text-[10px] text-[#999] group-hover:text-[#7C3AED] transition-colors">Manage profile</span>
                     </div>
                  </div>
                  <ChevronRight size={14} className="text-[#999] group-hover:translate-x-1 group-hover:text-[#7C3AED] transition-all" />
               </Link>
            </div>
          </aside>

          {/* Settings Content Area */}
          <main className="flex-1 w-full bg-white dark:bg-slate-900 border border-[#F0EAF0] dark:border-slate-800 rounded-[2rem] p-6 sm:p-10 lg:p-12 min-h-[600px] shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-none relative overflow-hidden">
             {/* Decorative background element */}
             <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-purple-500/5 to-transparent rounded-full -mr-32 -mt-32 pointer-events-none" />
             
             <div className="relative z-10">
               {children}
             </div>
          </main>
        </div>
      </div>
    </div>
  );
}

