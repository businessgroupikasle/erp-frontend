"use client";

import UserAccountLayout from "@/components/modules/settings/UserAccountLayout";
import { ChevronDown } from "lucide-react";

export default function UserConfigSettingsPage() {
  return (
    <UserAccountLayout>
      <div className="space-y-12">
        <div className="space-y-1">
           <h2 className="text-[17px] font-black text-[#1A1A1A] dark:text-white">Choose Display Language</h2>
           <p className="text-[12px] font-medium text-[#999]">Select pages will be displayed in the chosen language</p>
        </div>

        <div className="max-w-2xl relative">
           <select className="w-full px-5 py-4 bg-white dark:bg-slate-900 border border-[#F0EAF0] dark:border-slate-800 rounded-2xl text-[14px] font-bold text-[#1A1A1A] dark:text-slate-200 appearance-none focus:ring-1 focus:ring-purple-400">
              <option value="">Select Language</option>
              <option value="en">English</option>
              <option value="hi">Hindi</option>
              <option value="es">Spanish</option>
           </select>
           <ChevronDown size={18} className="absolute right-5 top-1/2 -translate-y-1/2 text-[#999] pointer-events-none" />
        </div>
      </div>
    </UserAccountLayout>
  );
}
