"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import {
  ShoppingCart,
  Tv,
  UtensilsCrossed,
  ChefHat,
  Factory,
  Trash2,
  Package,
  Bell,
  Users,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  CheckCircle2,
  Clock,
  ArrowRight,
  IndianRupee,
  Star,
  Zap,
  BarChart3,
  Loader2,
  RotateCcw,
  Calendar,
  Layers,
  Activity,
  ArrowDownRight,
  ArrowUpRight,
  Search,
  Plus,
  Wallet,
  CreditCard,
  QrCode,
  PackagePlus,
  Receipt,
  ChevronDown,
  Landmark,
  LayoutDashboard
} from "lucide-react";
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  LineChart,
  Line
} from "recharts";
import { clsx } from "clsx";
import { dashboardApi, franchiseApi } from "@/lib/api";

const STATUS_STYLES: Record<string, string> = {
  completed: "bg-emerald-50 text-emerald-600 border-emerald-100",
  preparing: "bg-amber-50 text-amber-600 border-amber-100",
  ready:     "bg-blue-50 text-blue-600 border-blue-100",
  pending:   "bg-slate-50 text-slate-500 border-slate-100",
  cancelled: "bg-rose-50 text-rose-600 border-rose-100",
};

function fmt(amount: number) {
  return "₹" + Math.round(amount).toLocaleString("en-IN");
}

function Skeleton({ className }: { className?: string }) {
  return <div className={clsx("animate-pulse bg-gray-100 dark:bg-white/5 rounded-lg", className)} />;
}

export default function Dashboard() {
  const [dateFilter, setDateFilter] = useState<'today' | 'week' | 'month'>('today');
  const [data, setData] = useState<any>(null);
  const [branches, setBranches] = useState<any[]>([]);
  const [selectedBranch, setSelectedBranch] = useState<string>("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchBranches = useCallback(async () => {
    try {
      const res = await franchiseApi.getAll();
      setBranches(res.data);
    } catch (err) {
      console.error("Failed to load branches", err);
    }
  }, []);

  const fetchDashboard = useCallback(() => {
    setLoading(true);
    setError(null);

    const periodEnd = new Date();
    const periodStart = new Date();
    periodStart.setHours(0,0,0,0);

    if (dateFilter === 'week') {
      periodStart.setDate(periodEnd.getDate() - 7);
    } else if (dateFilter === 'month') {
      periodStart.setMonth(periodEnd.getMonth() - 1);
    }

    dashboardApi.getSummary({ 
      startDate: periodStart.toISOString(), 
      endDate: periodEnd.toISOString(),
      franchiseId: selectedBranch === "all" ? undefined : selectedBranch
    })
      .then((res) => {
        setData(res.data);
      })
      .catch((err) => setError(err.response?.data?.error || "Failed to load dashboard"))
      .finally(() => setLoading(false));
  }, [dateFilter, selectedBranch]);

  useEffect(() => {
    fetchBranches();
  }, [fetchBranches]);

  useEffect(() => {
    fetchDashboard();
  }, [fetchDashboard]);

  if (error && !data) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] bg-white dark:bg-[#0f1117] rounded-3xl border border-red-100 dark:border-white/5 shadow-sm p-8 text-center animate-in fade-in zoom-in-95 duration-500">
        <div className="w-20 h-20 bg-red-50 dark:bg-red-900/10 rounded-full flex items-center justify-center mb-6 shadow-sm ring-8 ring-red-50 dark:ring-red-900/5">
          <AlertTriangle size={36} className="text-red-500" />
        </div>
        <h2 className="text-2xl font-black text-gray-900 dark:text-white mb-2">System Offline</h2>
        <p className="text-gray-500 dark:text-slate-400 mb-8 max-w-sm">Synchronizing with enterprise cloud...</p>
        <button onClick={fetchDashboard} className="flex items-center gap-2 bg-slate-900 dark:bg-white text-white dark:text-slate-900 px-6 py-3 rounded-xl font-bold hover:opacity-90 transition-all shadow-lg">
          <RotateCcw size={18} /> Retry Connection
        </button>
      </div>
    );
  }

  const stats = data?.stats;
  const recentOrders: any[] = data?.recentOrders || [];
  const weeklySales: any[] = data?.weeklySales || [];
  
  const revenueChange = parseFloat(stats?.revenueChangePct || "0");
  const isRevenueUp = revenueChange >= 0;

  return (
    <div className="min-h-full bg-[#F8FAFC] dark:bg-[#090a0f] p-4 md:p-6 space-y-6">
      
      {/* ── 🥇 TOP CONTROL BAR ────────────────────────── */}
      <header className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-white dark:bg-[#12141c] p-4 rounded-2xl border border-slate-200/60 dark:border-white/5 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="relative group">
            <select 
              value={selectedBranch}
              onChange={(e) => setSelectedBranch(e.target.value)}
              className="appearance-none bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl px-4 py-2 pr-10 text-sm font-bold text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-slate-500/20 transition-all cursor-pointer"
            >
              <option value="all">🌐 All Operations</option>
              {branches.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
            </select>
            <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
          </div>

          <div className="h-8 w-px bg-slate-200 dark:bg-white/10 hidden sm:block" />

          <div className="flex items-center bg-slate-50 dark:bg-white/5 rounded-xl p-1 border border-slate-200 dark:border-white/10">
            {(['today', 'week', 'month'] as const).map(f => (
              <button
                key={f}
                onClick={() => setDateFilter(f)}
                className={clsx(
                  "px-4 py-1.5 text-xs font-bold rounded-lg transition-all capitalize",
                  dateFilter === f 
                    ? "bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-sm" 
                    : "text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
                )}
              >
                {f}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden md:block text-right">
            <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Global Status</p>
            <div className="text-xs font-bold text-emerald-500 flex items-center justify-end gap-1">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Operational
            </div>
          </div>
          <button className="relative w-10 h-10 flex items-center justify-center bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl text-slate-500 dark:text-slate-400 hover:text-slate-900 transition-all">
            <Bell size={20} />
            <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-indigo-500 rounded-full border-2 border-white dark:border-[#12141c]" />
          </button>
          <div className="w-10 h-10 rounded-xl bg-slate-900 dark:bg-white flex items-center justify-center text-white dark:text-slate-900 font-black text-xs shadow-lg cursor-pointer hover:scale-105 transition-transform uppercase">
            SA
          </div>
        </div>
      </header>

      {/* ── 🥈 MODULE OVERVIEW ───────────────────────── */}
      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Revenue */}
        <div className="bg-white dark:bg-[#12141c] rounded-3xl p-6 border border-slate-200/60 dark:border-white/5 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-500/10 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
                <BarChart3 size={20} />
              </div>
              <span className={clsx(
                "text-[10px] font-black px-2 py-1 rounded-lg uppercase tracking-wider",
                isRevenueUp ? "text-emerald-500 bg-emerald-50 dark:bg-emerald-500/10" : "text-rose-500 bg-rose-50 dark:bg-rose-500/10"
              )}>
                 {isRevenueUp ? '+' : ''}{revenueChange}%
              </span>
            </div>
            <div>
               <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">Total Sales</p>
                <div className="text-3xl font-black text-slate-900 dark:text-white tabular-nums">
                  {loading ? <Skeleton className="h-8 w-32" /> : fmt(stats?.revenueToday || 0)}
                </div>
            </div>
        </div>

        {/* Lead Conversion */}
        <div className="bg-white dark:bg-[#12141c] rounded-3xl p-6 border border-slate-200/60 dark:border-white/5 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-500/10 flex items-center justify-center text-amber-600 dark:text-amber-400">
                <Users size={20} />
              </div>
              <span className="text-[10px] font-black text-slate-400 bg-slate-50 dark:bg-white/5 px-2 py-1 rounded-lg uppercase tracking-wider">
                 CRM Active
              </span>
            </div>
            <div>
               <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">Sales Leads</p>
                <div className="text-3xl font-black text-slate-900 dark:text-white tabular-nums">24</div>
            </div>
        </div>

        {/* Inventory Value */}
        <div className="bg-white dark:bg-[#12141c] rounded-3xl p-6 border border-slate-200/60 dark:border-white/5 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                <Package size={20} />
              </div>
              <span className="text-[10px] font-black text-emerald-500 bg-emerald-50 dark:bg-emerald-500/10 px-2 py-1 rounded-lg uppercase tracking-wider">
                 Optimized
              </span>
            </div>
            <div>
               <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">Stock Portfolio</p>
                <div className="text-3xl font-black text-slate-900 dark:text-white tabular-nums">1.2k Items</div>
            </div>
        </div>

        {/* HR/Workforce */}
        <div className="bg-white dark:bg-[#12141c] rounded-3xl p-6 border border-slate-200/60 dark:border-white/5 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div className="w-10 h-10 rounded-xl bg-rose-50 dark:bg-rose-500/10 flex items-center justify-center text-rose-600 dark:text-rose-400">
                <Clock size={20} />
              </div>
              <span className="text-[10px] font-black text-rose-500 bg-rose-50 dark:bg-rose-500/10 px-2 py-1 rounded-lg uppercase tracking-wider">
                 84% Present
              </span>
            </div>
            <div>
               <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">Total Workforce</p>
                <div className="text-3xl font-black text-slate-900 dark:text-white tabular-nums">158</div>
            </div>
        </div>
      </section>

      {/* ── 🥉 CORE WORKFLOWS ───────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Main Analytics (8 Columns) */}
        <div className="lg:col-span-8 space-y-6">
           {/* Section Header */}
           <div className="flex items-center justify-between">
              <h2 className="text-lg font-black text-slate-900 dark:text-white uppercase tracking-widest flex items-center gap-3">
                 <div className="w-1.5 h-6 bg-slate-900 dark:bg-white rounded-full" />
                 Operational Intelligence
              </h2>
              <div className="flex items-center gap-2">
                 <button className="p-2 hover:bg-slate-100 dark:hover:bg-white/5 rounded-lg transition-all">
                    <Activity size={18} className="text-slate-400" />
                 </button>
              </div>
           </div>

           <div className="bg-white dark:bg-[#12141c] rounded-[2.5rem] border border-slate-200/60 dark:border-white/5 shadow-sm p-8">
              <div className="flex items-center justify-between mb-10">
                 <div>
                    <h3 className="text-4xl font-black text-slate-900 dark:text-white tracking-tighter mb-1">Growth Matrix</h3>
                    <p className="text-xs text-slate-400 font-bold uppercase tracking-widest italic">Quarterly performance vs projections</p>
                 </div>
                 <div className="flex items-center gap-6">
                    <div className="flex items-center gap-2">
                       <div className="w-3 h-3 rounded-full bg-slate-900 dark:bg-white" />
                       <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Actual Revenue</span>
                    </div>
                    <div className="flex items-center gap-2">
                       <div className="w-3 h-3 rounded-full bg-slate-900/10 dark:bg-white/10" />
                       <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Projection</span>
                    </div>
                 </div>
              </div>
              
              <div className="h-[350px] w-full">
                 <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={weeklySales}>
                       <defs>
                          <linearGradient id="nexusGradient" x1="0" y1="0" x2="0" y2="1">
                             <stop offset="5%" stopColor="#000" stopOpacity={0.1}/>
                             <stop offset="95%" stopColor="#000" stopOpacity={0}/>
                          </linearGradient>
                       </defs>
                       <XAxis 
                         dataKey="day" 
                         axisLine={false} 
                         tickLine={false} 
                         tick={{ fontSize: 10, fontWeight: 900, fill: '#94a3b8' }} 
                         dy={15}
                       />
                       <YAxis hide />
                       <Tooltip 
                         contentStyle={{ borderRadius: '24px', border: 'none', background: '#000', color: '#fff', padding: '16px' }}
                         itemStyle={{ fontSize: '14px', fontWeight: 900 }}
                         labelStyle={{ fontSize: '10px', color: '#64748b', textTransform: 'uppercase', marginBottom: '8px' }}
                       />
                       <Area 
                         type="monotone" 
                         dataKey="value" 
                         stroke="#000" 
                         strokeWidth={4} 
                         fill="url(#nexusGradient)" 
                         isAnimationActive={!loading}
                       />
                    </AreaChart>
                 </ResponsiveContainer>
              </div>
           </div>

           {/* Quick Action Dock */}
           <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
              {[
                { 
                  label: 'Franchise DB', 
                  icon: LayoutDashboard, 
                  href: selectedBranch === 'all' ? '/franchise/dashboard' : `/franchise/dashboard?id=${selectedBranch}`, 
                  color: 'bg-rose-500' 
                },
                { label: 'New Lead', icon: Users, href: '/crm/leads', color: 'bg-indigo-500' },
                { label: 'Raise Ticket', icon: Activity, href: '/service/tickets', color: 'bg-amber-500' },
                { label: 'Stock Audit', icon: Package, href: '/inventory/stock', color: 'bg-emerald-500' },
                { label: 'Run Payroll', icon: Landmark, href: '/hr/payroll', color: 'bg-slate-900' },
              ].map((action) => (
                <Link key={action.label} href={action.href} className="bg-white dark:bg-[#12141c] p-6 rounded-[2rem] border border-slate-200/60 dark:border-white/5 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all group flex flex-col items-center text-center gap-3">
                   <div className={clsx("w-14 h-14 rounded-2xl flex items-center justify-center text-white shadow-lg group-hover:scale-110 transition-transform", action.color)}>
                      <action.icon size={24} />
                   </div>
                   <p className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-widest">{action.label}</p>
                </Link>
              ))}
           </div>
        </div>

        {/* Side Info (4 Columns) */}
        <div className="lg:col-span-4 space-y-6">
           
           {/* Enterprise Health Score */}
           <div className="bg-slate-900 text-white rounded-[2.5rem] p-8 shadow-2xl relative overflow-hidden group">
              <div className="relative z-10 flex flex-col gap-6">
                 <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500">Enterprise Health Score</h3>
                 <div className="flex items-baseline gap-2">
                    <span className="text-7xl font-black tracking-tighter">94</span>
                    <span className="text-xl font-bold text-emerald-400">/100</span>
                 </div>
                 <div className="space-y-4">
                    <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest">
                       <span>Compliance</span>
                       <span className="text-emerald-400">100%</span>
                    </div>
                    <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
                       <div className="h-full bg-white rounded-full w-[94%]" />
                    </div>
                    <p className="text-[11px] text-slate-400 font-medium leading-relaxed italic">
                      Performance is optimal. 0 compliance issues detected. 2 invoices pending approval in Accounts.
                    </p>
                 </div>
              </div>
              <div className="absolute -right-10 -bottom-10 w-48 h-48 bg-white/5 rounded-full blur-3xl group-hover:scale-125 transition-transform duration-700" />
           </div>

           {/* Recent Transactions / Tickets */}
           <div className="bg-white dark:bg-[#12141c] rounded-[2.5rem] border border-slate-200/60 dark:border-white/5 shadow-sm overflow-hidden">
              <div className="px-8 py-6 border-b border-slate-200/60 dark:border-white/5 flex items-center justify-between">
                 <h3 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-[0.2em]">Active Queue</h3>
                 <span className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse" />
              </div>
              <div className="divide-y divide-slate-100 dark:divide-white/5">
                 {[
                   { ref: 'TKT-892', type: 'SUPPORT', status: 'Priority', desc: 'SLA breach risk: Vendor A inquiry' },
                   { ref: 'SO-4421', type: 'SALES', status: 'Pending', desc: 'Quotation accepted by Client X' },
                   { ref: 'LEAD-90', type: 'CRM', status: 'New', desc: 'High-value lead from Website' },
                   { ref: 'EMP-012', type: 'HR', status: 'Review', desc: 'Leave request: Sarah J.' },
                 ].map((item, idx) => (
                   <div key={idx} className="p-6 hover:bg-slate-50 dark:hover:bg-white/[0.02] transition-colors cursor-pointer group">
                      <div className="flex items-center justify-between mb-2">
                         <span className="text-[10px] font-black text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-400/10 px-2 py-0.5 rounded uppercase tracking-tighter">{item.type}</span>
                         <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{item.ref}</span>
                      </div>
                      <p className="text-xs font-black text-slate-900 dark:text-white mb-1 group-hover:text-indigo-600 transition-colors uppercase">{item.status}</p>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium italic">{item.desc}</p>
                   </div>
                 ))}
              </div>
              <Link href="/reports" className="w-full py-5 bg-slate-50 dark:bg-white/[0.02] text-center text-[10px] font-black uppercase text-slate-400 tracking-[0.3em] hover:text-slate-950 transition-colors block border-t border-slate-100 dark:border-white/5">
                 View Full Intelligence Report
              </Link>
           </div>
        </div>
      </div>
    </div>
  );
}
