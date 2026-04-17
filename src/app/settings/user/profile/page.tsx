"use client";

import UserAccountLayout from "@/components/modules/settings/UserAccountLayout";
import { Camera, Pencil } from "lucide-react";

export default function UserProfileSettingsPage() {
  return (
    <UserAccountLayout>
      <div className="space-y-12">
        <div className="space-y-1">
           <h2 className="text-[17px] font-black text-[#1A1A1A] dark:text-white">Personal Information</h2>
        </div>

        <div className="space-y-8 max-w-5xl">
           {/* Profile Header */}
           <div className="flex items-center gap-6">
              <div className="relative w-24 h-24 bg-slate-200 rounded-full flex items-center justify-center border-4 border-white shadow-sm overflow-hidden group">
                 <div className="text-[10px] text-[#999] font-black uppercase">No Image</div>
                 <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 flex items-center justify-center cursor-pointer transition-opacity">
                    <Camera size={20} className="text-white" />
                 </div>
                 <div className="absolute bottom-1 right-1 w-6 h-6 bg-white rounded-full flex items-center justify-center shadow-md cursor-pointer border border-slate-100">
                    <Camera size={12} className="text-slate-600" />
                 </div>
              </div>
              <div className="space-y-0.5">
                 <h3 className="text-[15px] font-black text-[#1A1A1A] dark:text-white">Ikasle Business Group</h3>
                 <p className="text-[12px] font-bold text-[#999]">Super Admin</p>
                 <p className="text-[11px] font-medium text-[#7C3AED]">Azeez</p>
              </div>
           </div>

           {/* Form Grid */}
           <div className="grid grid-cols-2 gap-8">
              <div className="space-y-6">
                 <div className="space-y-1.5">
                    <label className="text-[12px] font-bold text-[#666]">Name</label>
                    <input 
                      type="text" 
                      defaultValue="Ikasle Business Group"
                      className="w-full px-4 py-3 bg-white border border-[#F0EAF0] rounded-xl text-[14px] font-medium focus:ring-1 focus:ring-purple-400" 
                    />
                 </div>
                 <div className="space-y-1.5">
                    <label className="text-[12px] font-bold text-[#666]">Country</label>
                    <div className="relative">
                       <select className="w-full px-4 py-3 bg-white border border-[#F0EAF0] rounded-xl text-[14px] font-medium appearance-none">
                          <option>India</option>
                       </select>
                    </div>
                 </div>
              </div>

              <div className="space-y-6">
                 <div className="space-y-1.5">
                    <label className="text-[12px] font-bold text-[#666]">Email</label>
                    <input 
                       type="email" 
                       defaultValue="businessgroupikasle@gmail.com"
                       className="w-full px-4 py-3 bg-slate-50 border border-[#F0EAF0] rounded-xl text-[14px] font-medium text-[#999] cursor-not-allowed" 
                       disabled
                    />
                 </div>
                 <div className="space-y-1.5">
                    <label className="text-[12px] font-bold text-[#666]">Phone</label>
                    <div className="flex items-center gap-3 px-4 py-3 bg-white border border-[#F0EAF0] rounded-xl">
                       <span className="text-[14px] opacity-70">🇮🇳</span>
                       <span className="text-[14px] font-bold text-[#999]">+91</span>
                       <input 
                         type="text" 
                         defaultValue="78451-32962"
                         className="flex-1 bg-transparent border-none p-0 text-[14px] font-medium focus:ring-0" 
                       />
                    </div>
                 </div>
              </div>
           </div>

           <div className="space-y-1.5">
              <label className="text-[12px] font-bold text-[#666] flex items-center gap-2">
                 Active Refrens Key 
                 <span className="w-4 h-4 rounded-full border border-slate-300 flex items-center justify-center text-[10px] text-[#999]">?</span>
              </label>
              <select className="w-full px-4 py-3 bg-white border border-[#F0EAF0] rounded-xl text-[14px] font-medium appearance-none">
                 <option>ikasle-business-group725538</option>
              </select>
           </div>

           <div className="flex justify-end">
              <button className="px-10 py-3 bg-[#E9D5FF] text-[#7C3AED] rounded-xl font-black text-[13px] hover:bg-[#D8B4FE] transition-colors">
                 Save Changes
              </button>
           </div>

           {/* Public Identity Section */}
           <div className="pt-10 space-y-6 border-t border-[#F0EAF0]">
              <div className="space-y-1">
                 <h4 className="text-[14px] font-black text-[#1A1A1A]">Your Public Identity</h4>
                 <p className="text-[11px] font-medium text-[#999]">Choose how your activity - new follows, shares and more will be shown to your followers. Hide any business association that you don't want to be shown publicly.</p>
              </div>

              <div className="flex items-center justify-between">
                 <div className="flex items-center gap-4">
                    <p className="text-[12px] font-bold text-[#666]">Default Identity</p>
                    <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-50 border border-slate-100 rounded-full">
                       <div className="w-6 h-6 bg-slate-200 rounded-full" />
                       <span className="text-[12px] font-black text-[#1A1A1A]">Ikasle</span>
                    </div>
                 </div>
                 <button className="flex items-center gap-2 text-[12px] font-bold text-[#7C3AED] group">
                    <Pencil size={14} className="group-hover:scale-110 transition-transform" />
                    Edit
                 </button>
              </div>
           </div>
        </div>
      </div>
    </UserAccountLayout>
  );
}
