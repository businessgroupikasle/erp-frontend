"use client";

import { ChevronDown, Edit3, Plus, Search } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

export default function BillingSection() {
  const { user } = useAuth();

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 py-8">
      {/* Billed By */}
      <div className="space-y-4">
        <h3 className="text-sm font-bold text-[#1A1A1A] dark:text-white flex items-center gap-2">
          Billed By <span className="text-[#999] font-medium text-xs">Your Details</span>
        </h3>
        
        <div className="p-6 bg-white dark:bg-slate-900 border border-[#F0EAF0] dark:border-slate-800 rounded-xl space-y-4">
          <div className="flex items-center justify-between p-3 border border-[#F0EAF0] rounded-lg">
             <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-md bg-[#3D3D3D] text-white flex items-center justify-center font-bold text-xs uppercase">
                   {user?.fullName?.charAt(0) || "A"}
                </div>
                <span className="text-sm font-bold text-[#1A1A1A]">{user?.fullName || "Azeez"}</span>
             </div>
             <ChevronDown size={14} className="text-[#999]" />
          </div>

          <div className="space-y-4 pt-2">
             <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[#666] uppercase tracking-wider">Business details</span>
                <button className="text-[#7C3AED] text-xs font-bold flex items-center gap-1 hover:underline">
                   <Edit3 size={12} /> Edit
                </button>
             </div>
             <div className="space-y-2">
                <div className="flex justify-between items-start">
                   <span className="text-xs text-[#999]">Business Name</span>
                   <span className="text-sm font-medium text-[#1A1A1A]">{user?.fullName || "Azeez"}</span>
                </div>
                <div className="flex justify-between items-start">
                   <span className="text-xs text-[#999]">Address</span>
                   <span className="text-sm font-medium text-[#1A1A1A]">India</span>
                </div>
             </div>
          </div>
        </div>
      </div>

      {/* Billed To */}
      <div className="space-y-4">
        <h3 className="text-sm font-bold text-[#1A1A1A] dark:text-white flex items-center gap-2">
          Billed To <span className="text-[#999] font-medium text-xs">Client's Details</span>
        </h3>
        
        <div className="p-6 bg-[#F9F7F9] dark:bg-slate-900/50 border border-dashed border-[#F0EAF0] dark:border-slate-800 rounded-xl flex flex-col items-center justify-center min-h-[220px] text-center gap-6">
          <div className="w-full">
            <div className="flex items-center justify-between p-3 bg-white dark:bg-slate-950 border border-[#F0EAF0] rounded-lg cursor-pointer hover:border-[#7C3AED] transition-all">
               <span className="text-sm text-[#999]">Select a Client</span>
               <ChevronDown size={14} className="text-[#999]" />
            </div>
          </div>

          <div className="space-y-4">
             <p className="text-xs font-medium text-[#999]">Select Client/Business from the list</p>
             <p className="text-[10px] font-bold text-[#CCC] uppercase tracking-widest leading-none">OR</p>
             <button className="flex items-center gap-2 px-6 py-2.5 bg-[#7C3AED] text-white rounded-lg font-bold text-sm shadow-md shadow-purple-200 transition-all active:scale-95">
                <Plus size={16} /> Add New Client
             </button>
          </div>
        </div>
      </div>
    </div>
  );
}
