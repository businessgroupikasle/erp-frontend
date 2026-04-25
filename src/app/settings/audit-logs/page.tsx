"use client";

import { useState } from "react";
import SettingsLayout from "@/components/modules/settings/SettingsLayout";
import { Search, Filter, Activity, User, LogIn, Edit, Trash2, Calendar } from "lucide-react";

export default function AuditLogsPage() {
  const [logs, setLogs] = useState([
    { id: 1, user: "Ikasle Business Group", action: "Logged In", module: "Authentication", timestamp: "2026-04-25 10:05 AM", type: "login", icon: LogIn, color: "text-blue-500", bg: "bg-blue-50 dark:bg-blue-900/20" },
    { id: 2, user: "Rahul Sharma", action: "Updated Role Permissions for 'Manager'", module: "Roles & Permissions", timestamp: "2026-04-25 09:45 AM", type: "edit", icon: Edit, color: "text-amber-500", bg: "bg-amber-50 dark:bg-amber-900/20" },
    { id: 3, user: "Priya Singh", action: "Deleted stock: 'Widget A' (50 units)", module: "Inventory", timestamp: "2026-04-24 04:30 PM", type: "delete", icon: Trash2, color: "text-red-500", bg: "bg-red-50 dark:bg-red-900/20" },
    { id: 4, user: "Ikasle Business Group", action: "Enabled 'Manufacturing' Module", module: "Module Management", timestamp: "2026-04-24 02:15 PM", type: "activity", icon: Activity, color: "text-purple-500", bg: "bg-purple-50 dark:bg-purple-900/20" },
    { id: 5, user: "System", action: "Auto-sent invoice INV-0042 to Client", module: "Sales", timestamp: "2026-04-24 11:00 AM", type: "activity", icon: Activity, color: "text-purple-500", bg: "bg-purple-50 dark:bg-purple-900/20" },
  ]);

  const [search, setSearch] = useState("");

  const filteredLogs = logs.filter(log => 
    log.user.toLowerCase().includes(search.toLowerCase()) || 
    log.action.toLowerCase().includes(search.toLowerCase()) ||
    log.module.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <SettingsLayout categoryTitle="Audit Logs">
      <div className="space-y-8">
        <div className="flex items-center justify-between">
           <h2 className="text-[17px] font-black text-[#1A1A1A] dark:text-white flex items-center gap-2">
              Activity & Audit Logs <span className="text-sm opacity-60">✨</span>
           </h2>
           <button className="px-4 py-2 bg-white dark:bg-slate-800 border border-[#F0EAF0] dark:border-slate-700 text-[#1A1A1A] dark:text-white rounded-xl font-bold text-[13px] flex items-center gap-2 transition-all hover:bg-slate-50 dark:hover:bg-slate-700 shadow-sm">
              <Calendar size={14} /> Filter by Date
           </button>
        </div>

        {/* Search & Filter */}
        <div className="flex items-center gap-4">
           <div className="relative group flex items-center flex-1 max-w-md">
              <Search size={16} className="absolute left-4 text-[#999]" />
              <input 
                type="text" 
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by user, action, or module..." 
                className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-slate-800 border border-[#F0EAF0] dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/20 transition-all font-medium" 
              />
           </div>
           <button className="px-4 py-2.5 bg-white dark:bg-slate-800 border border-[#F0EAF0] dark:border-slate-700 rounded-xl flex items-center gap-2 text-[13px] font-bold text-[#666] dark:text-slate-300 hover:text-[#1A1A1A] dark:hover:text-white transition-colors">
              <Filter size={16} /> Filters
           </button>
        </div>

        {/* Logs Timeline */}
        <div className="bg-white dark:bg-slate-900 border border-[#F0EAF0] dark:border-slate-800 rounded-3xl p-6 shadow-sm">
           <div className="space-y-6 relative before:absolute before:inset-0 before:ml-[28px] before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-slate-200 dark:before:via-slate-700 before:to-transparent">
              {filteredLogs.map((log) => (
                 <div key={log.id} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                    {/* Icon */}
                    <div className={`flex items-center justify-center w-14 h-14 rounded-full border-4 border-white dark:border-slate-900 ${log.bg} ${log.color} shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 shadow-sm z-10`}>
                       <log.icon size={20} strokeWidth={2.5} />
                    </div>
                    
                    {/* Content */}
                    <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-4 rounded-2xl border border-[#F0EAF0] dark:border-slate-800 bg-white dark:bg-slate-800/50 shadow-sm transition-all hover:border-[#7C3AED]/30 hover:shadow-md">
                       <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                             <User size={14} className="text-[#999]" />
                             <span className="text-[13px] font-black text-[#1A1A1A] dark:text-white">{log.user}</span>
                          </div>
                          <span className="text-[11px] font-bold text-[#999]">{log.timestamp}</span>
                       </div>
                       <p className="text-[14px] font-medium text-[#444] dark:text-slate-300 mb-2">
                          {log.action}
                       </p>
                       <div className="inline-flex px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-[10px] font-bold text-[#666] dark:text-slate-400 tracking-wide uppercase">
                          Module: {log.module}
                       </div>
                    </div>
                 </div>
              ))}
              
              {filteredLogs.length === 0 && (
                <div className="text-center py-10 relative z-10">
                  <p className="text-sm font-bold text-gray-500">No logs found matching your criteria.</p>
                </div>
              )}
           </div>
        </div>
      </div>
    </SettingsLayout>
  );
}
