import { LucideIcon } from "lucide-react";
import { clsx } from "clsx";
import React, { memo } from "react";

interface StatCardProps {
  title: string;
  value: string;
  change: string;
  trend: "up" | "down";
  icon: LucideIcon;
  color: "primary" | "secondary" | "accent";
}

const StatCard = memo(({ title, value, change, trend, icon: Icon, color }: StatCardProps) => {
  const colorClasses = {
    primary: "bg-slate-900 dark:bg-white text-white dark:text-slate-950",
    secondary: "bg-[#F58220]/10 text-[#F58220] border-[#F58220]/20",
    accent: "bg-red-500/10 text-red-600 border-red-500/20",
  };

  return (
    <div className="bg-white dark:bg-[#020617] p-8 rounded-[32px] border border-slate-100 dark:border-slate-800 shadow-sm transition-all duration-500 hover:shadow-2xl hover:shadow-slate-200 dark:hover:shadow-none hover:-translate-y-1 group">
      <div className="flex justify-between items-start mb-8">
        <div className={clsx(
          "p-4 rounded-2xl border transition-all duration-500 group-hover:scale-110 shadow-sm", 
          colorClasses[color]
        )}>
          <Icon size={20} strokeWidth={2.5} />
        </div>
        <div className={clsx(
          "flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest border shadow-sm",
          trend === "up" ? "bg-green-50 text-green-700 border-green-100" : "bg-red-50 text-red-700 border-red-100"
        )}>
          {trend === "up" ? "↑" : "↓"} {change}
        </div>
      </div>
      <div>
        <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] leading-none mb-3 italic opacity-80">{title}</p>
        <h3 className="text-3xl font-black tracking-tighter text-slate-900 dark:text-white group-hover:text-primary transition-colors">{value}</h3>
        <div className="w-8 h-1 bg-slate-100 dark:bg-slate-800 rounded-full mt-4 group-hover:w-16 transition-all duration-500" />
      </div>
    </div>
  );
});

StatCard.displayName = "StatCard";

export default StatCard;
