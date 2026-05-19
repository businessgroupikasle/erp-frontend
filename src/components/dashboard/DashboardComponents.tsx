import { useState } from "react";
import { 
  TrendingUp, TrendingDown, IndianRupee, Users, ShoppingCart, 
  Package, AlertTriangle, ArrowUpRight, ArrowDownRight, CreditCard,
  Target, Calendar, Activity, Receipt, Clock, UserCheck, ChevronRight,
  PackageCheck, DollarSign, ArrowRight, Store, Send, ChevronDown,
  Factory, ShieldAlert, History, Repeat, Zap, Building2, Bell,
  BarChart3, Wallet, Eye, CheckCircle2, XCircle, RotateCcw
} from "lucide-react";
import { clsx } from "clsx";
import { formatCurrency } from "@/lib/utils";
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, 
  ResponsiveContainer, BarChart, Bar, Cell, LineChart, Line,
  ComposedChart, Legend 
} from "recharts";
import Link from "next/link";

// --- 1. Executive KPI Card (Money + Operations) ---
export function KPICard({ title, value, trend, icon: Icon, colorClass = "blue", trendType = "up", subtext, insight }: any) {
  const colorMap: any = {
    blue: "text-blue-600 bg-blue-50/50 dark:bg-blue-500/10 border-blue-500/20",
    amber: "text-amber-600 bg-amber-50/50 dark:bg-amber-500/10 border-amber-500/20",
    emerald: "text-emerald-600 bg-emerald-50/50 dark:bg-emerald-500/10 border-emerald-500/20",
    rose: "text-rose-600 bg-rose-50/50 dark:bg-rose-500/10 border-rose-500/20",
    indigo: "text-indigo-600 bg-indigo-50/50 dark:bg-indigo-500/10 border-indigo-500/20",
    orange: "text-orange-600 bg-orange-50/50 dark:bg-orange-500/10 border-orange-500/20",
    purple: "text-purple-600 bg-purple-50/50 dark:bg-purple-500/10 border-purple-500/20",
  };

  return (
    <div className="bg-white dark:bg-[#12141c] p-6 rounded-[2rem] border border-slate-200/50 dark:border-white/5 shadow-sm transition-all hover:shadow-2xl hover:-translate-y-1 group">
      <div className="flex justify-between items-start mb-4">
        <div className={clsx("p-2.5 rounded-2xl", colorMap[colorClass])}>
          <Icon size={20} strokeWidth={2.5} />
        </div>
        {trend && (
          <span className={clsx(
            "text-[10px] font-black px-2 py-0.5 rounded-lg flex items-center gap-0.5",
            trendType === 'up' ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'
          )}>
            {trend}% {trendType === 'up' ? <TrendingUp size={10} /> : <TrendingDown size={10} />}
          </span>
        )}
      </div>
      <div className="space-y-1">
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">{title}</p>
        <h3 className="text-2xl font-black text-slate-900 dark:text-white tracking-tighter">{value}</h3>
        
        <div className="pt-4 mt-4 border-t border-slate-50 dark:border-white/5 flex flex-col gap-1.5">
           {subtext && <p className="text-[9px] text-slate-400 font-bold uppercase tracking-tight">{subtext}</p>}
           {insight && (
             <div className="flex items-center gap-2">
               <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse shadow-[0_0_8px_rgba(59,130,246,0.5)]" />
               <p className="text-[10px] font-black text-slate-900 dark:text-slate-300 uppercase tracking-widest">{insight}</p>
             </div>
           )}
        </div>
      </div>
    </div>
  );
}

// --- 2. Revenue Intelligence (Redesigned Elegant Chart) ---
export function RevenueIntelligence({ data, title, trend, period, setPeriod }: any) {
  const [visibleMetrics, setVisibleMetrics] = useState(['sales', 'purchase', 'profit']);

  const toggleMetric = (id: string) => {
    setVisibleMetrics(prev => 
      prev.includes(id) 
        ? (prev.length > 1 ? prev.filter(m => m !== id) : prev) 
        : [...prev, id]
    );
  };

  return (
    <div className="bg-white dark:bg-[#12141c] p-8 rounded-[2.5rem] border border-slate-200/50 dark:border-white/5 shadow-sm h-full flex flex-col relative overflow-hidden group">
      {/* Header with Toggles */}
      <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-6 mb-10 relative z-10">
        <div>
          <h3 className="text-[11px] font-black text-slate-900 dark:text-white uppercase tracking-[0.2em] mb-1">Mission Intelligence</h3>
          <div className="flex items-center gap-2">
            <span className="text-3xl font-black tracking-tighter text-slate-900 dark:text-white">↑ {trend}%</span>
            <span className="text-[9px] text-slate-400 font-bold uppercase tracking-widest px-2 py-1 bg-slate-50 dark:bg-white/5 rounded-lg border border-slate-100 dark:border-white/5">Trend Factor</span>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3 bg-slate-50/50 dark:bg-white/5 p-1.5 rounded-2xl border border-slate-100 dark:border-white/5">
           {[
             { id: 'sales', label: 'Sales', color: 'bg-orange-600' },
             { id: 'purchase', label: 'Purchase', color: 'bg-rose-600' },
             { id: 'profit', label: 'Profit', color: 'bg-emerald-600' }
           ].map((m) => (
             <button 
               key={m.id}
               onClick={() => toggleMetric(m.id)}
               className={clsx(
                 "px-5 py-2 rounded-xl text-[10px] font-black uppercase transition-all duration-300 flex items-center gap-2",
                 visibleMetrics.includes(m.id) ? `${m.color} text-white shadow-xl scale-105` : "text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
               )}
             >
               <div className={clsx("w-2 h-2 rounded-full", visibleMetrics.includes(m.id) ? "bg-white" : m.color.replace('bg-', 'bg-'))} />
               {m.label}
             </button>
           ))}
        </div>

        <div className="flex items-center gap-1 bg-slate-50/50 dark:bg-white/5 p-1 rounded-xl">
           {['today', 'week', 'month', 'all'].map((p) => (
             <button 
               key={p}
               onClick={() => setPeriod(p)}
               className={clsx(
                 "px-3 py-1.5 rounded-lg text-[9px] font-black uppercase transition-all",
                 period === p ? "bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm border border-slate-200/50 dark:border-white/10" : "text-slate-400 hover:text-slate-500"
               )}
             >
               {p === 'all' ? 'Year' : p}
             </button>
           ))}
        </div>
      </div>

      {/* Chart Area */}
      <div className="flex-1 min-h-[300px] relative">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={data}>
            <defs>
              <linearGradient id="salesGrad" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#f97316" stopOpacity={0.3}/><stop offset="95%" stopColor="#f97316" stopOpacity={0}/></linearGradient>
              <linearGradient id="profitGrad" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#10b981" stopOpacity={0.2}/><stop offset="95%" stopColor="#10b981" stopOpacity={0}/></linearGradient>
              <linearGradient id="purchaseGrad" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#f43f5e" stopOpacity={0.15}/><stop offset="95%" stopColor="#f43f5e" stopOpacity={0}/></linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
            <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 9, fontWeight: 900, fill: '#94a3b8' }} dy={15} interval={data?.length > 15 ? (data.length > 25 ? 5 : 2) : 0} />
            <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 9, fontWeight: 900, fill: '#94a3b8' }} tickFormatter={(v) => `₹${v >= 1000 ? (v/1000).toFixed(0)+'k' : v}`} domain={['auto', 'auto']} />
            <Tooltip 
              cursor={{ stroke: '#cbd5e1', strokeWidth: 1 }}
              contentStyle={{ borderRadius: '24px', border: 'none', background: '#090a0f', color: '#fff', fontSize: '10px', padding: '20px', boxShadow: '0 25px 50px -12px rgb(0 0 0 / 0.5)' }}
              itemStyle={{ fontWeight: 900, padding: '4px 0' }}
              labelStyle={{ fontWeight: 900, marginBottom: '8px', color: '#64748b', fontSize: '11px' }}
              formatter={(value: any, name: string) => [formatCurrency(value), name.toUpperCase()]}
            />
            {visibleMetrics.includes('sales') && (
              <Area type="monotone" dataKey="sales" name="Sales" fill="url(#salesGrad)" stroke="#f97316" strokeWidth={4} animationDuration={2000} activeDot={{ r: 6, fill: '#fff', stroke: '#f97316', strokeWidth: 3 }} />
            )}
            {visibleMetrics.includes('purchase') && (
              <Area type="monotone" dataKey="purchase" name="Purchase" fill="url(#purchaseGrad)" stroke="#f43f5e" strokeWidth={3} strokeDasharray="5 5" animationDuration={2000} />
            )}
            {visibleMetrics.includes('profit') && (
              <Area type="monotone" dataKey="profit" name="Profit" fill="url(#profitGrad)" stroke="#10b981" strokeWidth={4} animationDuration={2000} activeDot={{ r: 6, fill: '#fff', stroke: '#10b981', strokeWidth: 3 }} />
            )}
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

// --- 3. Report Table Widget (For explicit list views) ---
export function ReportTableWidget({ title, icon: Icon, headers, data, color = "blue", emptyMessage = "No data available" }: any) {
  const colorMap: any = {
    blue: "text-blue-600 bg-blue-50/50 dark:bg-blue-500/10",
    rose: "text-rose-600 bg-rose-50/50 dark:bg-rose-500/10",
    emerald: "text-emerald-600 bg-emerald-50/50 dark:bg-emerald-500/10",
    amber: "text-amber-600 bg-amber-50/50 dark:bg-amber-500/10",
    purple: "text-purple-600 bg-purple-50/50 dark:bg-purple-500/10",
    indigo: "text-indigo-600 bg-indigo-50/50 dark:bg-indigo-500/10",
  };

  return (
    <div className="bg-white dark:bg-[#12141c] rounded-[2rem] border border-slate-200/50 dark:border-white/5 shadow-sm h-full flex flex-col overflow-hidden">
      <div className="px-8 py-5 border-b border-slate-50 dark:border-white/5 flex items-center gap-3">
        <div className={clsx("p-2 rounded-xl", colorMap[color])}>
          <Icon size={16} strokeWidth={2.5} />
        </div>
        <h3 className="text-[12px] font-black text-slate-900 dark:text-white uppercase tracking-[0.1em]">{title}</h3>
      </div>
      <div className="flex-1 overflow-auto p-4">
        {data.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center py-10 opacity-40">
            <Icon size={32} className="mb-3" />
            <p className="text-[10px] font-black uppercase tracking-widest">{emptyMessage}</p>
          </div>
        ) : (
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="text-[9px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100 dark:border-white/5">
                {headers.map((h: string, i: number) => (
                  <th key={i} className="px-4 py-3">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 dark:divide-white/5">
              {data.map((row: any, i: number) => (
                <tr key={i} className="hover:bg-slate-50/50 dark:hover:bg-white/[0.02] transition-colors">
                  {Object.values(row).map((val: any, j: number) => (
                    <td key={j} className="px-4 py-4 text-[12px] font-bold text-slate-700 dark:text-slate-300">
                      {val}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

// --- 4. Premium Filter Tabs (Compact Segmented Control) ---
export function PremiumFilter({ options, active, onChange }: any) {
  return (
    <div className="flex p-0.5 bg-slate-100 dark:bg-white/5 rounded-xl border border-slate-200/50 dark:border-white/5 shadow-inner">
      {options.map((opt: any) => (
        <button
          key={opt.value}
          onClick={() => onChange(opt.value)}
          className={clsx(
            "px-4 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all duration-300 relative",
            active === opt.value 
              ? "bg-white dark:bg-slate-800 text-blue-600 shadow-sm" 
              : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
          )}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}
