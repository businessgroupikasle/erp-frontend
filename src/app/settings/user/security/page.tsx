"use client";

import UserAccountLayout from "@/components/modules/settings/UserAccountLayout";

export default function UserSecuritySettingsPage() {
  return (
    <UserAccountLayout>
      <div className="space-y-12">
        <div className="space-y-1">
           <h2 className="text-[17px] font-black text-[#1A1A1A] dark:text-white">Password & Security</h2>
        </div>

        <div className="space-y-12 max-w-5xl">
           {/* Change Password */}
           <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 p-8 bg-white dark:bg-slate-900 border border-[#FDFCFD] dark:border-slate-800 rounded-3xl shadow-sm">
              <div className="space-y-1">
                 <h3 className="text-[15px] font-black text-[#1A1A1A] dark:text-white">Change Password</h3>
                 <p className="text-[12px] font-medium text-[#999]">Update your password frequently to stay secure</p>
              </div>
              <button className="px-8 py-3 bg-white dark:bg-slate-800 border border-[#E9D5FF] rounded-xl text-[12px] font-black text-[#7C3AED] hover:bg-slate-50 transition-all">
                 Change Password
              </button>
           </div>

           {/* Logout All */}
           <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 p-8 bg-white dark:bg-slate-900 border border-[#FDFCFD] dark:border-slate-800 rounded-3xl shadow-sm">
              <div className="space-y-1">
                 <h3 className="text-[15px] font-black text-[#1A1A1A] dark:text-white">Logout from all devices</h3>
                 <p className="text-[12px] font-medium text-[#999]">This will log you out from all the devices you are logged in with</p>
              </div>
              <button className="px-8 py-3 bg-white dark:bg-slate-800 border-2 border-[#FEE2E2] rounded-xl text-[12px] font-black text-[#B91C1C] hover:bg-red-50 transition-all">
                 Logout
              </button>
           </div>
        </div>
      </div>
    </UserAccountLayout>
  );
}
