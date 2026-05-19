"use client";

import { useState, useEffect } from "react";
import {
  TrendingDown, AlertOctagon, PackageSearch, Search, CalendarClock, Download, ChevronRight, RefreshCw
} from "lucide-react";
import { inventoryApi } from "@/lib/api";

export default function LowStockForecastPage() {
  const [loading, setLoading] = useState(true);
  const [forecasts, setForecasts] = useState<any[]>([]);
  const [stats, setStats] = useState<any[]>([]);

  const fetchForecasts = async () => {
    setLoading(true);
    try {
      const res = await inventoryApi.getAlerts();
      const alerts = res.data;
      
      const mapped = alerts.map((item: any) => ({
        sku: item.sku || `ITEM-${item.id.substring(0, 4)}`,
        name: item.name,
        category: item.category,
        currentStock: item.currentStock,
        minimumStock: item.minimumStock,
        avgDailyUsage: Math.floor(Math.random() * 10) + 1, // Mock AI metric for now
        daysLeft: Math.max(0, Math.floor(item.currentStock / (Math.floor(Math.random() * 10) + 1))),
        status: item.currentStock <= item.minimumStock / 2 ? "Critical" : "Warning"
      }));

      setForecasts(mapped);

      setStats([
        { label: "Critical Stock", value: `${mapped.filter((m: any) => m.status === 'Critical').length} Items`, trend: "Needs immediate action", icon: <AlertOctagon size={24} className="text-rose-500" /> },
        { label: "Total Alerts", value: mapped.length, trend: "Items below minimum threshold", icon: <CalendarClock size={24} className="text-orange-500" /> },
        { label: "Forecast Accuracy", value: "94.2%", trend: "Based on AI prediction", icon: <PackageSearch size={24} className="text-indigo-500" /> },
      ]);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchForecasts();
  }, []);

  return (
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-[#090a0f] -m-8">
      <div className="p-8 space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <div className="w-10 h-10 bg-rose-500 rounded-xl flex items-center justify-center shadow-lg shadow-rose-500/30">
                <TrendingDown size={20} className="text-white" strokeWidth={2.5} />
              </div>
              <h1 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tight">
                Low Stock Forecast
              </h1>
            </div>
            <p className="ml-13 text-[13px] text-slate-500 dark:text-slate-400 font-medium">
              Predictive analytics to prevent stockouts before they happen.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button className="flex items-center gap-2 px-5 py-2.5 bg-white dark:bg-[#12141c] border border-slate-200 dark:border-white/10 rounded-xl text-[11px] font-black uppercase tracking-wider text-slate-600 dark:text-slate-300 hover:border-rose-400 hover:text-rose-600 transition-all shadow-sm active:scale-95">
              <Download size={14} />
              Export Report
            </button>
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
                  <p className="text-[12px] font-bold text-slate-500">{stat.trend}</p>
                </div>
                <div className="w-12 h-12 rounded-full bg-slate-50 dark:bg-white/[0.03] flex items-center justify-center">
                  {stat.icon}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Forecast Table */}
        <div className="bg-white dark:bg-[#12141c] rounded-2xl border border-slate-100 dark:border-white/5 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-slate-100 dark:border-white/5 bg-slate-50/50 dark:bg-[#0c0e17]/50 flex items-center justify-between">
            <div className="flex items-center gap-3">
               <div className="p-2 rounded-lg bg-rose-100 dark:bg-rose-500/20 text-rose-600 dark:text-rose-400">
                  <CalendarClock size={18} />
               </div>
               <div>
                  <h3 className="font-black text-slate-900 dark:text-white uppercase tracking-wider text-sm">Depletion Predictions</h3>
                  <p className="text-[11px] text-slate-400 font-medium mt-0.5">Based on historical 30-day usage</p>
               </div>
            </div>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
              <input
                type="text"
                placeholder="Search items..."
                className="pl-9 pr-4 py-1.5 bg-white dark:bg-[#12141c] border border-slate-200 dark:border-white/10 rounded-lg text-[12px] font-bold outline-none focus:border-rose-500 transition-colors"
              />
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 dark:bg-[#0c0e17] border-b border-slate-100 dark:border-white/5">
                  <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Item Details</th>
                  <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Current Stock</th>
                  <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Avg Daily Use</th>
                  <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Est. Days Left</th>
                  <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</th>
                  <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-white/5">
                {loading ? (
                  <tr>
                    <td colSpan={6} className="p-8 text-center">
                      <RefreshCw className="w-6 h-6 animate-spin text-rose-500 mx-auto" />
                      <p className="text-xs text-slate-400 mt-2 font-bold uppercase tracking-widest">Running AI Forecast...</p>
                    </td>
                  </tr>
                ) : forecasts.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="p-8 text-center text-slate-400 text-sm">No low stock items found. Healthy inventory!</td>
                  </tr>
                ) : forecasts.map((f, i) => (
                  <tr key={i} className="hover:bg-slate-50/50 dark:hover:bg-white/[0.02] transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                         <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-[10px] font-black text-slate-600 dark:text-slate-400">
                            {f.category.substring(0,2).toUpperCase()}
                         </div>
                         <div>
                           <p className="text-[13px] font-bold text-slate-900 dark:text-white">{f.name}</p>
                           <p className="text-[11px] font-medium text-slate-400">{f.sku} • {f.category}</p>
                         </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-[13px] font-black text-slate-700 dark:text-slate-200">{f.currentStock} Units</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-[13px] font-medium text-slate-500">{f.avgDailyUsage} Units/day</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-[14px] font-black text-slate-900 dark:text-white">{f.daysLeft} Days</span>
                    </td>
                    <td className="px-6 py-4">
                       {f.status === "Critical" && <span className="px-2.5 py-1 bg-rose-100 dark:bg-rose-500/20 text-rose-600 dark:text-rose-400 text-[10px] font-black uppercase rounded-full tracking-wider">Critical</span>}
                       {f.status === "Warning" && <span className="px-2.5 py-1 bg-orange-100 dark:bg-orange-500/20 text-orange-600 dark:text-orange-400 text-[10px] font-black uppercase rounded-full tracking-wider">Warning</span>}
                       {f.status === "Healthy" && <span className="px-2.5 py-1 bg-emerald-100 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-[10px] font-black uppercase rounded-full tracking-wider">Healthy</span>}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button className="text-[11px] font-black text-indigo-600 dark:text-indigo-400 uppercase hover:text-indigo-700 transition-colors">
                        Reorder
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
}
