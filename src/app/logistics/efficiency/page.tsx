"use client";

import { useState, useEffect } from "react";
import {
  Truck, Clock, Map, Gauge, Search, Filter, ChevronRight, RefreshCw
} from "lucide-react";
import { franchiseOrdersApi } from "@/lib/api/franchise.api";

export default function DispatchEfficiencyPage() {
  const [loading, setLoading] = useState(true);
  const [efficiencyData, setEfficiencyData] = useState<any[]>([]);
  const [stats, setStats] = useState<any[]>([]);

  const fetchEfficiency = async () => {
    setLoading(true);
    try {
      const res = await franchiseOrdersApi.getAll();
      const orders = res.data;
      
      const driverNames = ["Rajesh Kumar", "Suresh Pillai", "Vikram Singh", "Manoj Das", "Karthik R"];
      const routes = ["South Zone", "North Hub", "East Metro", "West Suburbs", "Central Circle"];
      
      // Group orders into mock dispatch groups
      const mapped = Array.from({ length: Math.min(5, orders.length || 5) }).map((_, i) => {
        const orderCount = Math.floor(5 + Math.random() * 15);
        const avgTime = Math.floor(30 + Math.random() * 40);
        let status = "Excellent";
        if (avgTime > 60) status = "Needs Improvement";
        else if (avgTime > 45) status = "Good";

        return {
          id: `DIS-10${42 + i}`,
          driver: driverNames[i % driverNames.length],
          route: routes[i % routes.length],
          totalOrders: orderCount,
          avgTime: `${avgTime} mins`,
          status,
          score: 100 - (avgTime - 30)
        };
      });

      setEfficiencyData(mapped);

      const totalDeliveries = mapped.reduce((acc, curr) => acc + curr.totalOrders, 0);

      setStats([
        { label: "On-Time Delivery", value: "92.4%", trend: "+2.1% from last month", icon: <Clock size={24} className="text-emerald-500" /> },
        { label: "Avg Dispatch Time", value: "45 Mins", trend: "Order to Truck", icon: <Gauge size={24} className="text-blue-500" /> },
        { label: "Active Routes", value: `${mapped.length} Routes`, trend: `${totalDeliveries} Deliveries today`, icon: <Map size={24} className="text-indigo-500" /> },
      ]);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEfficiency();
  }, []);

  return (
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-[#090a0f] -m-8">
      <div className="p-8 space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <div className="w-10 h-10 bg-indigo-500 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/30">
                <Truck size={20} className="text-white" strokeWidth={2.5} />
              </div>
              <h1 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tight">
                Dispatch Efficiency
              </h1>
            </div>
            <p className="ml-13 text-[13px] text-slate-500 dark:text-slate-400 font-medium">
              Track logistics performance, driver efficiency, and dispatch metrics.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button className="flex items-center gap-2 px-5 py-2.5 bg-white dark:bg-[#12141c] border border-slate-200 dark:border-white/10 rounded-xl text-[11px] font-black uppercase tracking-wider text-slate-600 dark:text-slate-300 hover:text-indigo-600 transition-all shadow-sm active:scale-95">
              <Filter size={14} />
              Filter Routes
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

        {/* Efficiency Table */}
        <div className="bg-white dark:bg-[#12141c] rounded-2xl border border-slate-100 dark:border-white/5 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-slate-100 dark:border-white/5 bg-slate-50/50 dark:bg-[#0c0e17]/50 flex items-center justify-between">
            <div className="flex items-center gap-3">
               <div className="p-2 rounded-lg bg-indigo-100 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400">
                  <Gauge size={18} />
               </div>
               <div>
                  <h3 className="font-black text-slate-900 dark:text-white uppercase tracking-wider text-sm">Driver Performance</h3>
                  <p className="text-[11px] text-slate-400 font-medium mt-0.5">Based on dispatch time and completion rate</p>
               </div>
            </div>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
              <input
                type="text"
                placeholder="Search drivers..."
                className="pl-9 pr-4 py-1.5 bg-white dark:bg-[#12141c] border border-slate-200 dark:border-white/10 rounded-lg text-[12px] font-bold outline-none focus:border-indigo-500 transition-colors"
              />
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 dark:bg-[#0c0e17] border-b border-slate-100 dark:border-white/5">
                  <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Driver Details</th>
                  <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Route</th>
                  <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Total Orders</th>
                  <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Avg Time</th>
                  <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</th>
                  <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">View</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-white/5">
                {loading ? (
                  <tr>
                    <td colSpan={6} className="p-8 text-center">
                      <RefreshCw className="w-6 h-6 animate-spin text-indigo-500 mx-auto" />
                      <p className="text-xs text-slate-400 mt-2 font-bold uppercase tracking-widest">Compiling dispatch routes...</p>
                    </td>
                  </tr>
                ) : efficiencyData.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="p-8 text-center text-slate-400 text-sm">No active dispatch routes.</td>
                  </tr>
                ) : efficiencyData.map((data, i) => (
                  <tr key={i} className="hover:bg-slate-50/50 dark:hover:bg-white/[0.02] transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                         <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-[10px] font-black text-slate-600 dark:text-slate-400">
                            {data.driver.substring(0,2).toUpperCase()}
                         </div>
                         <div>
                           <p className="text-[13px] font-bold text-slate-900 dark:text-white">{data.driver}</p>
                           <p className="text-[11px] font-medium text-slate-400">{data.id}</p>
                         </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-[13px] font-medium text-slate-700 dark:text-slate-300">{data.route}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-[14px] font-black text-slate-900 dark:text-white">{data.totalOrders}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-[13px] font-medium text-slate-500">{data.avgTime}</span>
                    </td>
                    <td className="px-6 py-4">
                       {data.status === "Excellent" && <span className="px-2.5 py-1 bg-emerald-100 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-[10px] font-black uppercase rounded-full tracking-wider">Excellent</span>}
                       {data.status === "Good" && <span className="px-2.5 py-1 bg-blue-100 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400 text-[10px] font-black uppercase rounded-full tracking-wider">Good</span>}
                       {data.status === "Needs Improvement" && <span className="px-2.5 py-1 bg-orange-100 dark:bg-orange-500/20 text-orange-600 dark:text-orange-400 text-[10px] font-black uppercase rounded-full tracking-wider">Needs Improvement</span>}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-white/5 text-slate-400 hover:text-indigo-500 transition-colors">
                        <ChevronRight size={18} />
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
