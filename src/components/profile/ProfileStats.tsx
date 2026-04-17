"use client";

import { Briefcase, Users, FileText, Flag, Star } from "lucide-react";

const stats = [
  { label: "Clients", value: "0", icon: Briefcase, color: "text-purple-600" },
  { label: "Team Members", value: "20", icon: Users, color: "text-blue-600" },
  { label: "Projects", value: "0", icon: FileText, color: "text-indigo-600" },
  { label: "Years In Business", value: "0", icon: Flag, color: "text-pink-600" },
  { label: "Average Rating", value: "0", icon: Star, color: "text-orange-600" },
];

export default function ProfileStats() {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
      {stats.map((stat, index) => (
        <div 
          key={index} 
          className="bg-slate-50/50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-6 rounded-2xl flex flex-col items-center justify-center text-center space-y-3 group hover:bg-white hover:border-[#7C3AED]/20 hover:shadow-xl hover:shadow-purple-100/50 transition-all cursor-default"
        >
          <span className="text-3xl font-black text-[#1A1A1A] dark:text-white group-hover:scale-110 transition-transform">{stat.value}</span>
          <div className="flex items-center gap-2">
            <stat.icon size={16} className={stat.color} />
            <span className="text-[10px] font-bold text-[#999] uppercase tracking-widest">{stat.label}</span>
          </div>
        </div>
      ))}
    </div>
  );
}
