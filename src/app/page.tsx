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
  LayoutDashboard,
  UserCheck,
  Settings2,
  Settings
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
  Line,
  BarChart,
  Bar,
  Cell,
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis
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
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDashboard = useCallback(() => {
    setLoading(true);
    setError(null);

    const periodEnd = new Date();
    const periodStart = new Date();
    periodStart.setHours(0,0,0,0);

    dashboardApi.getSummary({ 
      startDate: periodStart.toISOString(), 
      endDate: periodEnd.toISOString(),
    })
      .then((res) => {
        setData(res.data);
      })
      .catch((err) => setError(err.response?.data?.error || "Failed to load dashboard"))
      .finally(() => setLoading(false));
  }, []);

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

  // Synthesis / Mock Data for new visualizations as per request
  const profitData = (weeklySales || []).map(s => ({ ...s, profit: (s.value || 0) * 0.28 })); 
  const purchaseData = [
    { month: 'Jan', amount: 45000 },
    { month: 'Feb', amount: 52000 },
    { month: 'Mar', amount: 48000 },
    { month: 'Apr', amount: 61000 },
    { month: 'May', amount: 55000 },
  ];
  const stockData = [
    { name: 'Flour', value: 85 },
    { name: 'Sugar', value: 42 },
    { name: 'Butter', value: 65 },
    { name: 'Milk', value: 30 },
    { name: 'Oil', value: 75 },
  ];
  const performanceData = [
    { subject: 'Sales', A: 120, fullMark: 150 },
    { subject: 'Compliance', A: 98, fullMark: 150 },
    { subject: 'SLA', A: 86, fullMark: 150 },
    { subject: 'Inventory', A: 99, fullMark: 150 },
    { subject: 'Support', A: 85, fullMark: 150 },
    { subject: 'Churn', A: 65, fullMark: 150 },
  ];

  return (
    <div className="min-h-full bg-[#F8FAFC] dark:bg-[#090a0f] p-4 md:p-6 space-y-6">
      


      {/* ── 🥈 MODULE OVERVIEW ───────────────────────── */}
      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Daily Sales */}
        <div className="bg-white dark:bg-[#12141c] rounded-3xl p-6 border border-slate-200/60 dark:border-white/5 shadow-sm space-y-4 hover:shadow-md transition-all">
            <div className="flex items-center justify-between">
              <div className="w-10 h-10 rounded-xl bg-orange-50 dark:bg-orange-500/10 flex items-center justify-center text-orange-600 dark:text-orange-400">
                <TrendingUp size={20} />
              </div>
              <span className={clsx(
                "text-[10px] font-black px-2 py-1 rounded-lg uppercase tracking-wider",
                isRevenueUp ? "text-emerald-500 bg-emerald-50 dark:bg-emerald-500/10" : "text-rose-500 bg-rose-50 dark:bg-rose-500/10"
              )}>
                 {isRevenueUp ? '+' : ''}{revenueChange}%
              </span>
            </div>
            <div>
               <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">Daily Sales</p>
                <div className="text-3xl font-black text-slate-900 dark:text-white tabular-nums">
                  {loading ? <Skeleton className="h-8 w-32" /> : fmt(stats?.revenueToday || 0)}
                </div>
            </div>
        </div>

        {/* Daily Profit */}
        <div className="bg-white dark:bg-[#12141c] rounded-3xl p-6 border border-slate-200/60 dark:border-white/5 shadow-sm space-y-4 hover:shadow-md transition-all">
            <div className="flex items-center justify-between">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                <IndianRupee size={20} />
              </div>
              <span className="text-[10px] font-black text-emerald-500 bg-emerald-50 dark:bg-emerald-500/10 px-2 py-1 rounded-lg uppercase tracking-wider">
                 28% Profit
              </span>
            </div>
            <div>
               <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">Daily Profit</p>
                <div className="text-3xl font-black text-slate-900 dark:text-white tabular-nums">
                   {loading ? <Skeleton className="h-8 w-32" /> : fmt((stats?.revenueToday || 0) * 0.28)}
                </div>
            </div>
        </div>

        {/* Inventory Stock */}
        <div className="bg-white dark:bg-[#12141c] rounded-3xl p-6 border border-slate-200/60 dark:border-white/5 shadow-sm space-y-4 hover:shadow-md transition-all">
            <div className="flex items-center justify-between">
              <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-500/10 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
                <Package size={20} />
              </div>
              <span className="text-[10px] font-black text-indigo-500 bg-indigo-50 dark:bg-indigo-500/10 px-2 py-1 rounded-lg uppercase tracking-wider">
                 92% Active
              </span>
            </div>
            <div>
               <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">Inventory Stock</p>
                <div className="text-3xl font-black text-slate-900 dark:text-white tabular-nums">1.2k SKU</div>
            </div>
        </div>

        {/* System Activity */}
        <div className="bg-white dark:bg-[#12141c] rounded-3xl p-6 border border-slate-200/60 dark:border-white/5 shadow-sm space-y-4 hover:shadow-md transition-all">
            <div className="flex items-center justify-between">
              <div className="w-10 h-10 rounded-xl bg-slate-900 dark:bg-white/10 flex items-center justify-center text-white">
                <Zap size={20} />
              </div>
              <span className="text-[10px] font-black text-slate-400 bg-slate-50 dark:bg-white/5 px-2 py-1 rounded-lg uppercase tracking-wider">
                 Enterprise
              </span>
            </div>
            <div>
               <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">Health Score</p>
                <div className="text-3xl font-black text-slate-900 dark:text-white tabular-nums">94%</div>
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
                    <p className="text-xs text-slate-400 font-bold uppercase tracking-widest italic">Daily Sales & Projected Profit</p>
                 </div>
                 <div className="flex items-center gap-6">
                    <div className="flex items-center gap-2">
                       <div className="w-3 h-3 rounded-full bg-slate-900 dark:bg-white" />
                       <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Daily Sales</span>
                    </div>
                    <div className="flex items-center gap-2">
                       <div className="w-3 h-3 rounded-full bg-emerald-500" />
                       <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Daily Profit</span>
                    </div>
                 </div>
              </div>
              
              <div className="h-[350px] w-full">
                 <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={profitData}>
                       <defs>
                          <linearGradient id="salesGradient" x1="0" y1="0" x2="0" y2="1">
                             <stop offset="5%" stopColor="#0f172a" stopOpacity={0.1}/>
                             <stop offset="95%" stopColor="#0f172a" stopOpacity={0}/>
                          </linearGradient>
                          <linearGradient id="profitGradient" x1="0" y1="0" x2="0" y2="1">
                             <stop offset="5%" stopColor="#10b981" stopOpacity={0.1}/>
                             <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                          </linearGradient>
                       </defs>
                       <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                       <XAxis 
                         dataKey="day" 
                         axisLine={false} 
                         tickLine={false} 
                         tick={{ fontSize: 10, fontWeight: 900, fill: '#94a3b8' }} 
                         dy={15}
                       />
                       <YAxis 
                         axisLine={false} 
                         tickLine={false} 
                         tick={{ fontSize: 10, fontWeight: 700, fill: '#94a3b8' }}
                       />
                       <Tooltip 
                         contentStyle={{ borderRadius: '24px', border: 'none', background: '#000', color: '#fff', padding: '16px' }}
                         itemStyle={{ fontSize: '14px', fontWeight: 900 }}
                         labelStyle={{ fontSize: '10px', color: '#64748b', textTransform: 'uppercase', marginBottom: '8px' }}
                       />
                       <Area 
                         type="monotone" 
                         dataKey="value" 
                         stroke="#0f172a" 
                         strokeWidth={4} 
                         fill="url(#salesGradient)" 
                         name="Sales"
                         isAnimationActive={!loading}
                       />
                       <Area 
                         type="monotone" 
                         dataKey="profit" 
                         stroke="#10b981" 
                         strokeWidth={4} 
                         fill="url(#profitGradient)" 
                         name="Profit"
                         isAnimationActive={!loading}
                       />
                    </AreaChart>
                 </ResponsiveContainer>
              </div>
           </div>

           {/* Visualization Hub: Monthly Purchase & Inventory Stock */}
           <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white dark:bg-[#12141c] rounded-[2.5rem] border border-slate-200/60 dark:border-white/5 shadow-sm p-8">
                  <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-6">Monthly Purchase Trends</h3>
                  <div className="h-[200px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={purchaseData}>
                        <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 900, fill: '#94a3b8' }} />
                        <YAxis hide />
                        <Tooltip cursor={{ fill: 'transparent' }} contentStyle={{ borderRadius: '12px' }} />
                        <Bar dataKey="amount" fill="#6366f1" radius={[4, 4, 0, 0]}>
                           {purchaseData.map((entry, index) => (
                             <Cell key={`cell-${index}`} fill={index === purchaseData.length - 1 ? '#6366f1' : '#e2e8f0'} />
                           ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
              </div>
              <div className="bg-white dark:bg-[#12141c] rounded-[2.5rem] border border-slate-200/60 dark:border-white/5 shadow-sm p-8">
                  <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-6">Inventory Stock Highlights</h3>
                  <div className="h-[200px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={stockData} layout="vertical">
                        <XAxis type="number" hide />
                        <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 800, fill: '#64748b' }} width={60} />
                        <Tooltip contentStyle={{ borderRadius: '12px' }} />
                        <Bar dataKey="value" fill="#f59e0b" radius={[0, 4, 4, 0]} barSize={12} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
              </div>
           </div>

           {/* Company Performance Hub */}
           <div className="bg-white dark:bg-[#12141c] rounded-[2.5rem] border border-slate-200/60 dark:border-white/5 shadow-sm p-8">
              <div className="flex items-center justify-between mb-8">
                  <h3 className="text-xs font-black text-slate-950 dark:text-white uppercase tracking-widest flex items-center gap-2">
                    <Activity size={16} className="text-orange-500" />
                    Company Performance Hub
                  </h3>
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Enterprise KPIs</span>
              </div>
              <div className="h-[300px] w-full flex items-center justify-center">
                 <ResponsiveContainer width="100%" height="100%">
                    <RadarChart cx="50%" cy="50%" outerRadius="80%" data={performanceData}>
                      <PolarGrid stroke="#e2e8f0" />
                      <PolarAngleAxis dataKey="subject" tick={{ fontSize: 10, fontWeight: 900, fill: '#64748b' }} />
                      <PolarRadiusAxis angle={30} domain={[0, 150]} hide />
                      <Radar name="Performance" dataKey="A" stroke="#f59e0b" fill="#f59e0b" fillOpacity={0.6} />
                    </RadarChart>
                 </ResponsiveContainer>
              </div>
           </div>

           {/* Quick Action Dock */}
           {/* ── 🚀 QUICK ACCESS DOCK (REQUESTED LINKS) ───────────────── */}
           <div className="grid grid-cols-3 lg:grid-cols-3 gap-4">
              {[
                { label: 'Leads', icon: Users, href: '/crm', color: 'bg-indigo-500', desc: 'CRM Pipeline' },
                { label: 'Products', icon: Package, href: '/products', color: 'bg-orange-500', desc: 'Catalog' },
                { label: 'Sales', icon: IndianRupee, href: '/sales', color: 'bg-emerald-500', desc: 'Orders' },
                { label: 'Purchase', icon: ShoppingCart, href: '/purchases', color: 'bg-rose-500', desc: 'Procurement' },
                { label: 'GRN', icon: Receipt, href: '/purchases/grn', color: 'bg-blue-500', desc: 'Goods Receipt' },
                { label: 'Production', icon: Factory, href: '/production', color: 'bg-slate-900', desc: 'Manufacturing' },
                { label: 'Customers', icon: UserCheck, href: '/customers', color: 'bg-amber-500', desc: 'Accounts' },
                { label: 'Users', icon: Settings2, href: '/admin', color: 'bg-slate-400', desc: 'Permissions' },
                { label: 'Settings', icon: Settings, href: '/settings', color: 'bg-slate-600', desc: 'System' },
              ].map((action) => (
                <Link key={action.label} href={action.href} className="bg-white dark:bg-[#12141c] p-5 rounded-[2.5rem] border border-slate-200/60 dark:border-white/5 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all group flex flex-col items-center text-center gap-2">
                   <div className={clsx("w-12 h-12 rounded-2xl flex items-center justify-center text-white shadow-lg group-hover:scale-110 transition-transform shadow-current/20", action.color)}>
                      <action.icon size={20} />
                   </div>
                   <div>
                      <p className="text-[10px] font-black text-slate-900 dark:text-white uppercase tracking-widest">{action.label}</p>
                      <p className="text-[9px] text-slate-400 font-bold uppercase tracking-tighter opacity-0 group-hover:opacity-100 transition-opacity">{action.desc}</p>
                   </div>
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
