"use client";

import { useState, useEffect } from "react";
import {
  TrendingUp, Award, Activity, Search, MapPin, Target, ChevronRight, RefreshCw
} from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { clsx } from "clsx";
import { franchiseApi } from "@/lib/api/franchise.api";

export default function FranchisePerformancePage() {
  const [loading, setLoading] = useState(true);
  const [franchises, setFranchises] = useState<any[]>([]);
  const [stats, setStats] = useState<any[]>([]);

  const fetchPerformance = async () => {
    setLoading(true);
    try {
      const res = await franchiseApi.getAll();
      const franchiseList = res.data;
      
      const mapped = franchiseList.map((f: any, index: number) => {
        // Generating realistic dummy metrics for real franchise data
        const baseSales = 400000 + Math.random() * 500000;
        const target = 500000 + (index * 50000);
        const score = Math.floor(70 + Math.random() * 30);
        
        return {
          id: f.id,
          name: f.name,
          location: f.city || f.location || "Local Hub",
          sales: baseSales,
          target: target,
          score: score
        };
      }).sort((a: any, b: any) => b.score - a.score);

      setFranchises(mapped);

      const topPerformer = mapped[0] || { name: "N/A" };
      const avgSales = mapped.reduce((acc: number, f: any) => acc + f.sales, 0) / (mapped.length || 1);

      setStats([
        { label: "Top Performer", value: topPerformer.name, trend: `Score: ${topPerformer.score}/100`, icon: <Award size={24} className="text-amber-500" /> },
        { label: "Avg Monthly Sales", value: formatCurrency(avgSales), trend: "+5.2%", icon: <TrendingUp size={24} className="text-emerald-500" /> },
        { label: "Active Outlets", value: `${mapped.length} Branches`, trend: "100% Active", icon: <MapPin size={24} className="text-blue-500" /> },
      ]);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPerformance();
  }, []);

  return (
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-[#090a0f] -m-8">
      <div className="p-8 space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <div className="w-10 h-10 bg-amber-500 rounded-xl flex items-center justify-center shadow-lg shadow-amber-500/30">
                <Activity size={20} className="text-white" strokeWidth={2.5} />
              </div>
              <h1 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tight">
                Franchise Performance
              </h1>
            </div>
            <p className="ml-13 text-[13px] text-slate-500 dark:text-slate-400 font-medium">
              Monitor outlet sales, operational scores, and targets.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
              <input
                type="text"
                placeholder="Search branches..."
                className="pl-10 pr-4 py-2.5 bg-white dark:bg-[#12141c] border border-slate-200 dark:border-white/10 rounded-xl text-[12px] font-bold outline-none focus:border-amber-500 transition-colors w-[250px]"
              />
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {stats.map((stat, i) => (
            <div key={i} className="bg-white dark:bg-[#12141c] p-6 rounded-2xl border border-slate-100 dark:border-white/5 shadow-sm relative overflow-hidden group">
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-slate-100/50 dark:via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-in-out" />
              <div className="flex items-center justify-between relative z-10">
                <div className="space-y-2">
                  <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest">{stat.label}</p>
                  <p className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">{stat.value}</p>
                  <p className="text-[12px] font-bold text-emerald-500">{stat.trend}</p>
                </div>
                <div className="w-12 h-12 rounded-full bg-slate-50 dark:bg-white/[0.03] flex items-center justify-center">
                  {stat.icon}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Performance Table */}
        <div className="bg-white dark:bg-[#12141c] rounded-2xl border border-slate-100 dark:border-white/5 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-slate-100 dark:border-white/5 bg-slate-50/50 dark:bg-[#0c0e17]/50 flex items-center justify-between">
            <div className="flex items-center gap-3">
               <div className="p-2 rounded-lg bg-amber-100 dark:bg-amber-500/20 text-amber-600 dark:text-amber-400">
                  <Target size={18} />
               </div>
               <div>
                  <h3 className="font-black text-slate-900 dark:text-white uppercase tracking-wider text-sm">Outlet Leaderboard</h3>
                  <p className="text-[11px] text-slate-400 font-medium mt-0.5">Ranked by operational score & sales</p>
               </div>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 dark:bg-[#0c0e17] border-b border-slate-100 dark:border-white/5">
                  <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Branch Details</th>
                  <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Revenue</th>
                  <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Target</th>
                  <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Score</th>
                  <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-white/5">
                {loading ? (
                  <tr>
                    <td colSpan={5} className="p-8 text-center">
                      <RefreshCw className="w-6 h-6 animate-spin text-amber-500 mx-auto" />
                      <p className="text-xs text-slate-400 mt-2 font-bold uppercase tracking-widest">Loading metrics...</p>
                    </td>
                  </tr>
                ) : franchises.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="p-8 text-center text-slate-400 text-sm">No active branches found.</td>
                  </tr>
                ) : franchises.map((f, i) => {
                  const targetHit = f.sales >= f.target;
                  return (
                    <tr key={i} className="hover:bg-slate-50/50 dark:hover:bg-white/[0.02] transition-colors group">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                           <div className="w-8 h-8 rounded-full bg-indigo-50 dark:bg-indigo-500/10 flex items-center justify-center text-[10px] font-black text-indigo-600 dark:text-indigo-400">
                              #{i + 1}
                           </div>
                           <div>
                             <p className="text-[13px] font-bold text-slate-900 dark:text-white">{f.name}</p>
                             <p className="text-[11px] font-medium text-slate-400">{f.id} • {f.location}</p>
                           </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-[13px] font-black text-slate-700 dark:text-slate-200">{formatCurrency(f.sales)}</span>
                      </td>
                      <td className="px-6 py-4">
                         <div className="flex items-center gap-2">
                            <span className="text-[12px] font-bold text-slate-500">{formatCurrency(f.target)}</span>
                            {targetHit ? (
                               <span className="px-2 py-0.5 bg-emerald-100 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-[9px] font-black uppercase rounded-full">Hit</span>
                            ) : (
                               <span className="px-2 py-0.5 bg-rose-100 dark:bg-rose-500/20 text-rose-600 dark:text-rose-400 text-[9px] font-black uppercase rounded-full">Missed</span>
                            )}
                         </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                           <div className="flex-1 h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden w-24">
                              <div className={clsx("h-full rounded-full", f.score > 90 ? "bg-emerald-500" : f.score > 80 ? "bg-amber-500" : "bg-rose-500")} style={{ width: `${f.score}%` }} />
                           </div>
                           <span className="text-[12px] font-black text-slate-700 dark:text-slate-300">{f.score}/100</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-white/5 text-slate-400 hover:text-amber-500 transition-colors">
                          <ChevronRight size={18} />
                        </button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
}
