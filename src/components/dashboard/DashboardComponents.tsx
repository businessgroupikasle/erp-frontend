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

  const hoverGlowMap: any = {
    blue: "hover:shadow-[0_20px_40px_-15px_rgba(59,130,246,0.12)] dark:hover:shadow-[0_20px_40px_-15px_rgba(59,130,246,0.22)] hover:border-blue-500/30 dark:hover:border-blue-500/20",
    amber: "hover:shadow-[0_20px_40px_-15px_rgba(245,158,11,0.12)] dark:hover:shadow-[0_20px_40px_-15px_rgba(245,158,11,0.22)] hover:border-amber-500/30 dark:hover:border-amber-500/20",
    emerald: "hover:shadow-[0_20px_40px_-15px_rgba(16,185,129,0.12)] dark:hover:shadow-[0_20px_40px_-15px_rgba(16,185,129,0.22)] hover:border-emerald-500/30 dark:hover:border-emerald-500/20",
    rose: "hover:shadow-[0_20px_40px_-15px_rgba(244,63,94,0.12)] dark:hover:shadow-[0_20px_40px_-15px_rgba(244,63,94,0.22)] hover:border-rose-500/30 dark:hover:border-rose-500/20",
    indigo: "hover:shadow-[0_20px_40px_-15px_rgba(99,102,241,0.12)] dark:hover:shadow-[0_20px_40px_-15px_rgba(99,102,241,0.22)] hover:border-indigo-500/30 dark:hover:border-indigo-500/20",
    orange: "hover:shadow-[0_20px_40px_-15px_rgba(249,115,22,0.12)] dark:hover:shadow-[0_20px_40px_-15px_rgba(249,115,22,0.22)] hover:border-orange-500/30 dark:hover:border-orange-500/20",
    purple: "hover:shadow-[0_20px_40px_-15px_rgba(168,85,247,0.12)] dark:hover:shadow-[0_20px_40px_-15px_rgba(168,85,247,0.22)] hover:border-purple-500/30 dark:hover:border-purple-500/20",
  };

  return (
    <div className={clsx(
      "bg-white dark:bg-[#12141c] p-6 rounded-[2rem] border border-slate-200/50 dark:border-white/5 shadow-sm transition-all duration-300 hover:-translate-y-1 group relative overflow-hidden flex flex-col justify-between min-h-[190px]",
      hoverGlowMap[colorClass]
    )}>
      {/* Background Soft Glow Gradient */}
      <div className={clsx(
        "absolute -right-10 -top-10 w-24 h-24 rounded-full blur-[40px] opacity-0 transition-all duration-500 group-hover:scale-150 group-hover:opacity-10 dark:group-hover:opacity-20 pointer-events-none",
        colorClass === 'blue' && 'bg-blue-500',
        colorClass === 'amber' && 'bg-amber-500',
        colorClass === 'emerald' && 'bg-emerald-500',
        colorClass === 'rose' && 'bg-rose-500',
        colorClass === 'indigo' && 'bg-indigo-500',
        colorClass === 'orange' && 'bg-orange-500',
        colorClass === 'purple' && 'bg-purple-500',
      )} />

      <div className="flex justify-between items-start mb-3 relative z-10">
        <div className={clsx("p-2.5 rounded-2xl transition-transform duration-300 group-hover:scale-110", colorMap[colorClass])}>
          <Icon size={18} strokeWidth={2.5} />
        </div>
        {trend && (
          <span className={clsx(
            "text-[9px] font-black px-2 py-0.5 rounded-lg flex items-center gap-0.5 shadow-sm border",
            trendType === 'up' 
              ? 'bg-emerald-50 border-emerald-100 text-emerald-600 dark:bg-emerald-500/10 dark:border-emerald-500/20 dark:text-emerald-400' 
              : 'bg-rose-50 border-rose-100 text-rose-600 dark:bg-rose-500/10 dark:border-rose-500/20 dark:text-rose-400'
          )}>
            {trend}% {trendType === 'up' ? <TrendingUp size={10} /> : <TrendingDown size={10} />}
          </span>
        )}
      </div>
      
      <div className="space-y-1 relative z-10 flex-1 flex flex-col justify-end">
        <p className="text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em]">{title}</p>
        <h3 className="text-2xl font-black text-slate-900 dark:text-white tracking-tighter transition-all duration-300 group-hover:text-[#F58220] dark:group-hover:text-orange-400">{value}</h3>
        
        <div className="pt-3 mt-3 border-t border-slate-100 dark:border-white/5 flex flex-col gap-1.5">
           {subtext && <p className="text-[9px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-tight">{subtext}</p>}
           {insight && (
             <div className="flex items-center gap-2">
               <span className="w-1.5 h-1.5 rounded-full bg-[#F58220] animate-pulse shadow-[0_0_8px_rgba(245,130,32,0.5)]" />
               <p className="text-[9px] font-black text-slate-800 dark:text-slate-300 uppercase tracking-widest">{insight}</p>
             </div>
           )}
        </div>
      </div>
    </div>
  );
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white dark:bg-[#12141c] border border-slate-200/50 dark:border-white/5 rounded-2xl p-4 shadow-xl text-[10px] space-y-1.5 min-w-[140px] border-slate-100 dark:border-white/5">
        <p className="font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest text-[9px]">{label}</p>
        <div className="space-y-1.5">
          {payload.map((pld: any) => (
            <div key={pld.name} className="flex justify-between items-center gap-4">
              <span className="font-black uppercase tracking-tight text-[10px] flex items-center gap-1.5" style={{ color: pld.color }}>
                <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: pld.color }} />
                {pld.name} :
              </span>
              <span className="font-black text-slate-900 dark:text-white">
                {formatCurrency(pld.value)}
              </span>
            </div>
          ))}
        </div>
      </div>
    );
  }
  return null;
};

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
    <div className="bg-white dark:bg-[#12141c] p-6 md:p-8 rounded-[2.5rem] border border-slate-200/50 dark:border-white/5 shadow-sm h-full flex flex-col relative overflow-hidden group">
      {/* Header with Toggles */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 mb-8 relative z-10">
        <div>
          <h3 className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] mb-1">Mission Intelligence</h3>
          <div className="flex items-center gap-2">
            <span className="text-2xl font-black tracking-tighter text-slate-900 dark:text-white">↑ {trend}%</span>
            <span className="text-[9px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-widest px-2 py-1 bg-slate-50 dark:bg-white/5 rounded-lg border border-slate-100 dark:border-white/5">Trend Factor</span>
          </div>
        </div>

        {/* Metric selection controls */}
        <div className="flex flex-wrap items-center gap-2 bg-slate-50/50 dark:bg-white/5 p-1 rounded-2xl border border-slate-100 dark:border-white/5">
           {[
             { id: 'sales', label: 'Sales', color: 'bg-orange-500' },
             { id: 'purchase', label: 'Purchase', color: 'bg-rose-500' },
             { id: 'profit', label: 'Profit', color: 'bg-emerald-500' }
           ].map((m) => (
             <button 
               key={m.id}
               onClick={() => toggleMetric(m.id)}
               className={clsx(
                 "px-4 py-1.5 rounded-xl text-[9px] font-black uppercase transition-all duration-300 flex items-center gap-2 shadow-sm border border-transparent",
                 visibleMetrics.includes(m.id) 
                   ? `${m.color} text-white shadow-md` 
                   : "bg-transparent text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100/50 dark:hover:bg-white/5"
               )}
             >
               <div className={clsx("w-1.5 h-1.5 rounded-full", visibleMetrics.includes(m.id) ? "bg-white" : m.color)} />
               {m.label}
             </button>
           ))}
        </div>

        {/* Period toggle controls */}
        <div className="flex items-center gap-0.5 bg-slate-50/50 dark:bg-white/5 p-1 rounded-xl border border-slate-100 dark:border-white/5">
           {['today', 'week', 'month', 'custom'].map((p) => (
             <button 
               key={p}
               onClick={() => setPeriod(p)}
               className={clsx(
                 "px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-wider transition-all",
                 period === p 
                   ? "bg-white dark:bg-slate-800 text-orange-500 dark:text-orange-400 shadow-sm border border-slate-200/50 dark:border-white/10" 
                   : "text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
               )}
             >
               {p}
             </button>
           ))}
        </div>
      </div>

      {/* Chart Area */}
      <div className="flex-1 min-h-[320px] w-full relative">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={data} margin={{ top: 10, right: 5, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="salesGrad" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#f97316" stopOpacity={0.25}/><stop offset="95%" stopColor="#f97316" stopOpacity={0}/></linearGradient>
              <linearGradient id="profitGrad" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#10b981" stopOpacity={0.2}/><stop offset="95%" stopColor="#10b981" stopOpacity={0}/></linearGradient>
              <linearGradient id="purchaseGrad" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#f43f5e" stopOpacity={0.15}/><stop offset="95%" stopColor="#f43f5e" stopOpacity={0}/></linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" className="dark:stroke-white/5" />
            <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 9, fontWeight: 900, fill: '#94a3b8' }} dy={10} interval={data?.length > 15 ? (data.length > 25 ? 5 : 2) : 0} />
            <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 9, fontWeight: 900, fill: '#94a3b8' }} tickFormatter={(v) => `₹${v >= 1000 ? (v/1000).toFixed(0)+'k' : v}`} domain={['auto', 'auto']} />
            <Tooltip 
              cursor={{ stroke: '#cbd5e1', strokeWidth: 1 }}
              content={<CustomTooltip />}
            />
            {visibleMetrics.includes('sales') && (
              <Area type="monotone" dataKey="sales" name="Sales" fill="url(#salesGrad)" stroke="#f97316" strokeWidth={3} animationDuration={2000} activeDot={{ r: 5, fill: '#fff', stroke: '#f97316', strokeWidth: 3 }} />
            )}
            {visibleMetrics.includes('purchase') && (
              <Area type="monotone" dataKey="purchase" name="Purchase" fill="url(#purchaseGrad)" stroke="#f43f5e" strokeWidth={2.5} strokeDasharray="4 4" animationDuration={2000} />
            )}
            {visibleMetrics.includes('profit') && (
              <Area type="monotone" dataKey="profit" name="Profit" fill="url(#profitGrad)" stroke="#10b981" strokeWidth={3} animationDuration={2000} activeDot={{ r: 5, fill: '#fff', stroke: '#10b981', strokeWidth: 3 }} />
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
    blue: "text-blue-600 bg-blue-50/50 dark:bg-blue-500/10 border border-blue-500/20",
    rose: "text-rose-600 bg-rose-50/50 dark:bg-rose-500/10 border border-rose-500/20",
    emerald: "text-emerald-600 bg-emerald-50/50 dark:bg-emerald-500/10 border border-emerald-500/20",
    amber: "text-amber-600 bg-amber-50/50 dark:bg-amber-500/10 border border-amber-500/20",
    purple: "text-purple-600 bg-purple-50/50 dark:bg-purple-500/10 border border-purple-500/20",
    indigo: "text-indigo-600 bg-indigo-50/50 dark:bg-indigo-500/10 border border-indigo-500/20",
  };

  return (
    <div className="bg-white dark:bg-[#12141c] rounded-[2rem] border border-slate-200/50 dark:border-white/5 shadow-sm h-full flex flex-col overflow-hidden transition-all duration-300 hover:shadow-xl hover:border-slate-300/40 dark:hover:border-white/10 group">
      <div className="px-6 py-4 border-b border-slate-50 dark:border-white/5 flex items-center gap-3">
        <div className={clsx("p-2 rounded-xl transition-transform duration-300 group-hover:scale-105", colorMap[color])}>
          <Icon size={16} strokeWidth={2.5} />
        </div>
        <h3 className="text-[11px] font-black text-slate-800 dark:text-white uppercase tracking-[0.1em]">{title}</h3>
      </div>
      <div className="flex-1 overflow-auto custom-scrollbar p-3">
        {data.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center py-10 opacity-40">
            <Icon size={24} className="mb-3" />
            <p className="text-[9px] font-black uppercase tracking-widest">{emptyMessage}</p>
          </div>
        ) : (
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest border-b border-slate-100 dark:border-white/5">
                {headers.map((h: string, i: number) => (
                  <th key={i} className="px-3 py-2.5">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 dark:divide-white/5">
              {data.map((row: any, i: number) => (
                <tr key={i} className="hover:bg-slate-50/50 dark:hover:bg-white/[0.01] transition-colors">
                  {Object.values(row).map((val: any, j: number) => {
                    const valStr = String(val);
                    const isPercentage = valStr.includes('%');
                    const isPositive = isPercentage && !valStr.startsWith('-');
                    const isAction = valStr === 'Reorder' || valStr === 'Restock' || valStr === 'Buy' || valStr === 'Track';
                    
                    return (
                      <td key={j} className="px-3 py-3.5 text-[11px] font-bold text-slate-700 dark:text-slate-300">
                        {isPercentage ? (
                          <span className={clsx(
                            "px-2 py-0.5 rounded-full text-[9px] font-black tracking-wider uppercase border",
                            isPositive
                              ? "bg-emerald-50 text-emerald-600 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20"
                              : "bg-rose-50 text-rose-600 border-rose-200 dark:bg-rose-500/10 dark:text-rose-400 dark:border-rose-500/20"
                          )}>
                            {valStr}
                          </span>
                        ) : isAction ? (
                          <span className="px-2 py-0.5 rounded-full text-[9px] font-black tracking-wider uppercase border bg-amber-50 text-amber-600 border-amber-200 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/20">
                            {valStr}
                          </span>
                        ) : (
                          val
                        )}
                      </td>
                    );
                  })}
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
              ? "bg-white dark:bg-slate-800 text-orange-500 dark:text-orange-400 shadow-sm border border-slate-200/20 dark:border-white/5" 
              : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 hover:bg-white/20 dark:hover:bg-white/5"
          )}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}
