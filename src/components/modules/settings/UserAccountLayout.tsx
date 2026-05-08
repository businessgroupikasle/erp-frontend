"use client";

import { ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { clsx } from "clsx";
import { ChevronRight } from "lucide-react";


interface UserAccountLayoutProps {
  children: ReactNode;
}

export default function UserAccountLayout({ children }: UserAccountLayoutProps) {
  const pathname = usePathname();

  const menuItems = [
    { label: "Personal Information", href: "/settings/user/profile" },
    // { label: "Notification & Alerts", href: "/settings/user/notifications" },
    { label: "Password & Security", href: "/settings/user/security" },
    // { label: "Configurations", href: "/settings/user/config" },
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

      </div>
 
       {/* Content Area */}

      <div className="flex-1 p-10 max-w-7xl">
        {children}
      </div>
    </div>
  );
}
