"use client";

import SettingsLayout from "@/components/modules/settings/SettingsLayout";
import { Plus, ChevronDown, Key, FileEdit, Copy, MoreHorizontal, X } from "lucide-react";

export default function RolesPermissionsPage() {
  const roles = [
    { name: "Super Admin", description: "Can Do Everything", archived: "No" },
    { name: "Accountant", description: "", archived: "No" },
    { name: "Manager", description: "", archived: "No" },
    { name: "Sales Executive", description: "", archived: "No" },
  ];

  return (
    <SettingsLayout>
      <div className="space-y-8">
        <div className="flex items-center justify-between">
           <h2 className="text-[17px] font-black text-[#1A1A1A] dark:text-white flex items-center gap-2">
              Roles & Permissions <span className="text-sm opacity-60">✨</span>
           </h2>
           <button className="px-5 py-2.5 bg-[#7C3AED] hover:bg-[#6D28D9] text-white rounded-xl font-bold text-[13px] flex items-center gap-2 transition-all active:scale-95 shadow-lg shadow-purple-200/50">
              <Plus size={16} /> Add New Role
           </button>
        </div>

        {/* Filter Bar */}
        <div className="space-y-6">
           <div className="flex items-center gap-4 text-[12px] font-black uppercase tracking-wider text-[#1A1A1A] dark:text-white">
              <button className="flex items-center gap-2 hover:opacity-70 transition-opacity">
                 <ChevronDown size={14} strokeWidth={3} /> Filters
              </button>
              <button className="text-[#999] hover:text-red-500 transition-colors flex items-center gap-2">
                 <X size={14} /> Clear All Filters
              </button>
           </div>
           
           <div className="space-y-3">
              <p className="text-[11px] font-bold text-[#999] uppercase tracking-widest">Applied Filters</p>
              <div className="flex items-center gap-2">
                 <div className="px-3 py-1.5 bg-white dark:bg-slate-800 border border-[#F0EAF0] dark:border-slate-800 rounded-lg flex items-center gap-3 text-[12px] font-bold shadow-sm">
                    <span className="text-[#999]">Archived:</span> <span className="text-[#1A1A1A] dark:text-white">No</span>
                    <button className="text-[#999] hover:text-red-500 transition-colors"><X size={12} strokeWidth={3} /></button>
                 </div>
              </div>
           </div>
        </div>

        <p className="text-[11px] font-bold text-[#999]">Showing 1 to 4 of 4 Records</p>

        {/* Roles Table */}
        <div className="bg-white dark:bg-slate-900 border border-[#F0EAF0] dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#FAF9FA] dark:bg-slate-800/50 border-b border-[#F0EAF0] dark:border-slate-800">
                <th className="p-4 text-[11px] font-bold text-[#999] uppercase tracking-wider">Role Name</th>
                <th className="p-4 text-[11px] font-bold text-[#999] uppercase tracking-wider flex items-center gap-2">
                   Archived <ChevronDown size={12} className="opacity-40" />
                </th>
                <th className="p-4 text-[11px] font-bold text-[#999] uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {roles.map((role) => (
                <tr key={role.name} className="border-b border-[#F0EAF0] dark:border-slate-800 last:border-0 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors group">
                  <td className="p-4">
                     <div className="space-y-0.5">
                        <p className="text-[13px] font-black text-[#1A1A1A] dark:text-white">{role.name}</p>
                        {role.description && <p className="text-[11px] font-medium text-[#999]">{role.description}</p>}
                     </div>
                  </td>
                  <td className="p-4 text-[13px] font-medium text-[#666] dark:text-slate-400">{role.archived}</td>
                  <td className="p-4">
                     <div className="flex items-center justify-end gap-6 opacity-60 group-hover:opacity-100 transition-opacity pr-4">
                        <button className="flex flex-col items-center gap-1 hover:text-[#7C3AED] transition-colors">
                           <Key size={18} strokeWidth={2.5} />
                           <span className="text-[9px] font-black uppercase">View Permissions</span>
                        </button>
                        <button className="flex flex-col items-center gap-1 hover:text-[#7C3AED] transition-colors">
                           <FileEdit size={18} strokeWidth={2.5} />
                           <span className="text-[9px] font-black uppercase">Update</span>
                        </button>
                        <button className="flex flex-col items-center gap-1 hover:text-[#7C3AED] transition-colors">
                           <Copy size={18} strokeWidth={2.5} />
                           <span className="text-[9px] font-black uppercase">Duplicate</span>
                        </button>
                        <button className="flex flex-col items-center gap-1 hover:text-[#7C3AED] transition-colors">
                           <MoreHorizontal size={18} strokeWidth={2.5} />
                           <span className="text-[9px] font-black uppercase">More</span>
                        </button>
                     </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </SettingsLayout>
  );
}
