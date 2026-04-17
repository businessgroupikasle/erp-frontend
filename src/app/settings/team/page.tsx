"use client";

import SettingsLayout from "@/components/modules/settings/SettingsLayout";
import { Plus, Search, MoreHorizontal, ShieldCheck, X } from "lucide-react";
import Link from "next/link";

export default function ManageUsersPage() {
  return (
    <SettingsLayout>
      <div className="space-y-8">
        <div className="flex items-center justify-between">
           <h2 className="text-[17px] font-black text-[#1A1A1A] dark:text-white flex items-center gap-2">
              All Users <span className="text-sm opacity-60">✨</span>
           </h2>
           <button className="px-5 py-2.5 bg-[#7C3AED] hover:bg-[#6D28D9] text-white rounded-xl font-bold text-[13px] flex items-center gap-2 transition-all active:scale-95 shadow-lg shadow-purple-200/50">
              <Plus size={16} /> Add User
           </button>
        </div>

        {/* Search Bar */}
        <div className="max-w-md">
           <div className="relative group">
              <p className="absolute -top-6 left-0 text-[11px] font-bold text-[#999] opacity-0 group-focus-within:opacity-100 transition-opacity">Name/Email</p>
              <input 
                type="text" 
                placeholder="Name/Email" 
                className="w-full px-4 py-3 bg-white dark:bg-slate-800 border border-[#F0EAF0] dark:border-slate-800 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/20 transition-all font-medium" 
              />
           </div>
        </div>

        <p className="text-[11px] font-bold text-[#999]">Showing 1 to 1 of 1 Record</p>

        {/* User Card */}
        <div className="p-4 bg-white dark:bg-slate-800 border border-[#F0EAF0] dark:border-slate-800 rounded-2xl flex items-center justify-between group hover:border-[#7C3AED]/20 transition-all">
           <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-[#006699] flex items-center justify-center text-white text-xs font-black shadow-lg">
                 IKASLE
              </div>
              <div className="space-y-1">
                 <div className="flex items-center gap-2">
                    <span className="text-[14px] font-black text-[#1A1A1A] dark:text-white">Ikasle Business Group (You)</span>
                 </div>
                 <p className="text-[12px] font-medium text-[#666] dark:text-slate-400">businessgroupikasle@gmail.com</p>
                 
                 <div className="flex items-center gap-2 pt-1">
                    <div className="px-3 py-1 bg-[#F3E8FF] border border-[#E9D5FF] rounded-lg flex items-center gap-2 transition-all hover:bg-[#E9D5FF]">
                       <span className="text-[11px] font-extrabold text-[#7C3AED]">Super Admin</span>
                       <button className="text-[#7C3AED] hover:text-[#5B21B6] transition-colors">
                          <X size={10} strokeWidth={4} />
                       </button>
                    </div>
                 </div>
              </div>
           </div>

           <div className="flex items-center gap-6 pr-4">
              <button className="flex flex-col items-center gap-1 group/btn">
                 <ShieldCheck size={20} className="text-[#999] group-hover/btn:text-[#7C3AED] transition-colors" />
                 <span className="text-[10px] font-bold text-[#999] group-hover/btn:text-[#7C3AED] transition-colors">Permissions</span>
              </button>
              <button className="flex flex-col items-center gap-1 group/btn">
                 <MoreHorizontal size={20} className="text-[#999] group-hover/btn:text-[#7C3AED] transition-colors" />
                 <span className="text-[10px] font-bold text-[#999] group-hover/btn:text-[#7C3AED] transition-colors">More</span>
              </button>
           </div>
        </div>
      </div>
    </SettingsLayout>
  );
}
