"use client";

import { ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { clsx } from "clsx";
import { ChevronRight, Building } from "lucide-react";

interface UserAccountLayoutProps {
  children: ReactNode;
}

export default function UserAccountLayout({ children }: UserAccountLayoutProps) {
  const pathname = usePathname();

  const menuItems = [
    { label: "Personal Information", href: "/settings/user/profile" },
    { label: "Password & Security", href: "/settings/user/security" },
    { label: "Preferences", href: "/settings/user/config" },
  ];

  return (
    <div className="flex bg-[#FDFCFD] dark:bg-slate-950 min-h-screen">
      {/* User Settings Sidebar */}
      <div className="w-80 border-r border-[#F0EAF0] dark:border-slate-800 p-6 flex flex-col justify-between">
        <div>
           <h2 className="text-[17px] font-black text-[#1A1A1A] dark:text-white mb-8 px-4">User Settings</h2>
           <nav className="space-y-1">
             {menuItems.map((item) => {
               const isActive = pathname === item.href;
               return (
                 <Link
                   key={item.href}
                   href={item.href}
                   className={clsx(
                     "flex items-center justify-between px-4 py-3 rounded-xl text-[14px] font-bold transition-all",
                     isActive 
                       ? "bg-[#FAF9FA] text-[#7C3AED] shadow-sm" 
                       : "text-[#666] hover:bg-slate-50 hover:text-[#111] dark:hover:bg-slate-900 dark:hover:text-white"
                   )}
                 >
                   {item.label}
                 </Link>
               );
             })}
           </nav>
        </div>

        {/* Entry point back to Business Settings */}
        <Link 
          href="/settings/team"
          className="group flex items-center justify-between p-4 bg-[#FAF9FA] dark:bg-slate-900 border border-[#F0EAF0] dark:border-slate-800 rounded-2xl hover:border-[#7C3AED] transition-all"
        >
          <div className="flex items-center gap-3">
             <div className="w-8 h-8 bg-slate-800 rounded flex items-center justify-center">
                <Building size={16} className="text-white" />
             </div>
             <p className="text-[13px] font-black text-[#1A1A1A] dark:text-slate-200">Business Settings</p>
          </div>
          <ChevronRight size={14} className="text-[#999] group-hover:text-[#7C3AED]" />
        </Link>
      </div>

      {/* Content Area */}
      <div className="flex-1 p-10 max-w-7xl">
        {children}
      </div>
    </div>
  );
}
