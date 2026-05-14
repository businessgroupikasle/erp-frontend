"use client";

import { 
  TrendingUp, TrendingDown, IndianRupee, Users, ShoppingCart, 
  Package, AlertTriangle, ArrowUpRight, ArrowDownRight, CreditCard,
  Target, Calendar, Activity, Receipt, Clock, UserCheck, ChevronRight
} from "lucide-react";
import { clsx } from "clsx";
import { formatCurrency } from "@/lib/utils";
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, 
  ResponsiveContainer, BarChart, Bar, Cell 
} from "recharts";

// --- 1. Summary Metric Card ---
export function MetricCard({ 
  title, 
  monthValue, 
  todayValue, 
  icon: Icon, 
  label1 = "May", 
  label2 = "Today", 
  trend, 
  trendType = "up",
  clickable = true
}: any) {
  return (
    <div className={clsx(
      "bg-white dark:bg-[#12141c] rounded-2xl p-5 border border-slate-200/60 dark:border-white/5 shadow-sm flex flex-col space-y-4 transition-all hover:shadow-xl hover:-translate-y-1 group",
      clickable && "cursor-pointer"
    )}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-slate-50 dark:bg-white/5 flex items-center justify-center group-hover:scale-110 transition-transform shadow-sm">
            <Icon size={20} className="text-slate-400 dark:text-slate-500" />
          </div>
          <div>
            <span className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em]">{title}</span>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="text-xl font-black text-slate-900 dark:text-white tracking-tight">{monthValue}</span>
              {trend !== undefined && (
                <div className={clsx(
                  "flex items-center gap-0.5 px-1.5 py-0.5 rounded-full text-[9px] font-black",
                  trendType === "up" ? "bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400" : "bg-rose-50 text-rose-600 dark:bg-rose-500/10 dark:text-rose-400"
                )}>
                  {trendType === "up" ? <ArrowUpRight size={10} /> : <ArrowDownRight size={10} />}
                  {trend}%
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      
      <div className="h-px bg-gradient-to-r from-transparent via-slate-100 dark:via-white/5 to-transparent w-full" />

      <div className="grid grid-cols-2 gap-4">
        <div className="bg-slate-50/50 dark:bg-white/[0.02] p-3 rounded-xl border border-slate-100 dark:border-white/5">
          <p className="text-[9px] text-slate-400 dark:text-slate-500 font-black uppercase tracking-widest mb-1">{label1}</p>
          <p className="text-sm font-black text-slate-700 dark:text-slate-300">{monthValue}</p>
        </div>
        <div className="bg-slate-50/50 dark:bg-white/[0.02] p-3 rounded-xl border border-slate-100 dark:border-white/5">
          <p className="text-[9px] text-slate-400 dark:text-slate-500 font-black uppercase tracking-widest mb-1">{label2}</p>
          <p className="text-sm font-black text-slate-700 dark:text-slate-300">{todayValue}</p>
        </div>
      </div>
    </div>
  );
}

// --- 2. Monthly Revenue Card ---
export function MonthlyCard({ month, amount, colorClass }: any) {
  return (
    <div className={clsx("rounded-[1.5rem] p-6 text-white shadow-lg relative overflow-hidden group", colorClass)}>
      <div className="relative z-10">
        <p className="text-[10px] font-black uppercase tracking-[0.3em] opacity-60 mb-2">{month}</p>
        <p className="text-2xl font-black tracking-tight">{amount}</p>
      </div>
      <div className="absolute -right-4 -bottom-4 w-20 h-20 bg-white/10 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700" />
    </div>
  );
}

// --- 3. Growth Indicator ---
export function GrowthIndicator({ value }: { value: number }) {
  return (
    <div className="bg-white dark:bg-[#12141c] rounded-[1.5rem] p-6 border border-slate-200/60 dark:border-white/5 shadow-sm flex items-center gap-6">
      <div className="w-16 h-16 rounded-full bg-emerald-500 flex items-center justify-center text-white shadow-lg shadow-emerald-500/20">
        <TrendingUp size={32} />
      </div>
      <div>
        <p className="text-3xl font-black text-slate-900 dark:text-white">{value}%</p>
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Efficiency Growth</p>
      </div>
    </div>
  );
}

// --- 4. Section Header ---
export function SectionHeader({ title, icon: Icon, subtitle }: any) {
  return (
    <div className="flex items-center justify-between mb-6">
      <div className="flex items-center gap-4">
        <div className="w-1.5 h-8 bg-slate-900 dark:bg-white rounded-full" />
        <div>
          <h2 className="text-lg font-black text-slate-900 dark:text-white uppercase tracking-widest flex items-center gap-2">
            {Icon && <Icon size={18} className="text-slate-400" />}
            {title}
          </h2>
          {subtitle && <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">{subtitle}</p>}
        </div>
      </div>
    </div>
  );
}

// --- 5. Data Table Component ---
export function DashboardTable({ headers, rows, title, icon: Icon }: any) {
  return (
    <div className="bg-white dark:bg-[#12141c] rounded-[2rem] border border-slate-200/60 dark:border-white/5 shadow-sm overflow-hidden flex flex-col">
      <div className="px-8 py-5 border-b border-slate-100 dark:border-white/5 flex items-center justify-between bg-slate-50/50 dark:bg-white/[0.02]">
        <h3 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-[0.2em] flex items-center gap-2">
          {Icon && <Icon size={14} className="text-indigo-500" />}
          {title}
        </h3>
        <button className="text-slate-400 hover:text-slate-600 dark:hover:text-white transition-colors">
          <Activity size={14} />
        </button>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50/30 dark:bg-white/[0.01]">
              {headers.map((h: string) => (
                <th key={h} className="px-8 py-4 text-[9px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100 dark:border-white/5">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50 dark:divide-white/5">
            {rows.map((row: any[], i: number) => (
              <tr key={i} className="group hover:bg-slate-50/50 dark:hover:bg-white/[0.01] transition-colors">
                {row.map((cell: any, j: number) => (
                  <td key={j} className="px-8 py-4 text-[11px] font-bold text-slate-600 dark:text-slate-400">
                    {cell}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// --- 6. Executive Target Table ---
export function SalesTargetTable({ data }: any) {
  const headers = ["S.no", "Sales Executives", "Monthly Target", "Quarterly Target", "Yearly Target"];
  const rows = data.map((item: any, i: number) => [
    i + 1,
    <span key={i} className="text-slate-900 dark:text-white font-black">{item.name}</span>,
    <div key={i} className="space-y-1">
      <div className="flex justify-between text-[10px] mb-1">
        <span>{formatCurrency(item.monthly)}</span>
        <span className="text-indigo-600">{item.monthlyPct}%</span>
      </div>
      <div className="h-1.5 w-full bg-slate-100 dark:bg-white/5 rounded-full overflow-hidden">
        <div className="h-full bg-indigo-500 rounded-full" style={{ width: `${item.monthlyPct}%` }} />
      </div>
    </div>,
    <div key={i} className="text-slate-400 italic">Set Target for Quarterly</div>,
    <div key={i} className="text-slate-400 italic">Set Target for Yearly</div>
  ]);

  return <DashboardTable headers={headers} rows={rows} title="Sales Target" icon={Target} />;
}

// --- 8. Top Selling Products ---
export function TopSellingTable({ data }: any) {
  const headers = ["S.no", "Product Name", "Qty"];
  const rows = data.map((item: any, i: number) => [
    i + 1,
    item.name,
    item.qty
  ]);

  return <PremiumReportTable title="Top Selling Products of the Week" headers={headers} rows={rows} />;
}

// --- 9. Stock Urgent Report ---
export function StockUrgentTable({ data }: any) {
  const headers = ["S.no", "P.Code", "P.Name", "Stock", "Reorder Level"];
  const rows = data.map((item: any, i: number) => [
    i + 1,
    item.code,
    item.name,
    item.stock,
    item.reorder
  ]);

  return <PremiumReportTable title="Stock Urgent Report" headers={headers} rows={rows} />;
}

// --- 10. Supplier Payment Tracking ---
export function SupplierPaymentTable({ data }: any) {
  const headers = ["#", "Sup.No", "Date", "Sup.Name", "Status", "Amount"];
  const rows = data.map((item: any, i: number) => [
    i + 1,
    item.no,
    item.date,
    item.name,
    item.status,
    formatCurrency(item.amount)
  ]);

  return <PremiumReportTable title="Supplier payment Tracking View" headers={headers} rows={rows} />;
}

// --- 7. Yearly Sales Chart ---
export function YearlySalesChart({ data }: any) {
  return (
    <div className="bg-white dark:bg-[#12141c] rounded-[2.5rem] border border-slate-200/60 dark:border-white/5 shadow-sm p-8 h-full">
      <div className="flex items-center justify-between mb-10">
         <div>
            <h3 className="text-4xl font-black text-slate-900 dark:text-white tracking-tighter mb-1">Yearly Sales</h3>
            <p className="text-xs text-slate-400 font-bold uppercase tracking-widest italic">Annual Revenue Trajectory</p>
         </div>
      </div>
      
      <div className="h-[300px] w-full">
         <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data}>
               <defs>
                  <linearGradient id="yearlyGradient" x1="0" y1="0" x2="0" y2="1">
                     <stop offset="5%" stopColor="#991b1b" stopOpacity={0.8}/>
                     <stop offset="95%" stopColor="#991b1b" stopOpacity={0}/>
                  </linearGradient>
               </defs>
               <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
               <XAxis 
                 dataKey="date" 
                 axisLine={false} 
                 tickLine={false} 
                 tick={{ fontSize: 9, fontWeight: 900, fill: '#94a3b8' }} 
                 dy={15}
               />
               <YAxis 
                 axisLine={false} 
                 tickLine={false} 
                 tick={{ fontSize: 9, fontWeight: 700, fill: '#94a3b8' }}
                 tickFormatter={(v) => `₹${v >= 1000 ? (v/1000).toFixed(0) + 'k' : v}`}
               />
               <Tooltip 
                 contentStyle={{ borderRadius: '24px', border: 'none', background: '#000', color: '#fff', padding: '16px' }}
                 itemStyle={{ fontSize: '14px', fontWeight: 900 }}
                 labelStyle={{ fontSize: '10px', color: '#64748b', textTransform: 'uppercase', marginBottom: '8px' }}
                 formatter={(value: any) => [formatCurrency(value), "Revenue"]}
               />
               <Area 
                 type="monotone" 
                 dataKey="amount" 
                 stroke="#991b1b" 
                 strokeWidth={4} 
                 fill="url(#yearlyGradient)" 
                 name="Sales"
                 animationDuration={1500}
               />
            </AreaChart>
         </ResponsiveContainer>
      </div>
    </div>
  );
}

// --- 11. Premium Report Table (Screenshot Style) ---
export function PremiumReportTable({ title, headers, rows }: any) {
  return (
    <div className="bg-white dark:bg-[#12141c] rounded-xl border border-slate-200/60 shadow-sm overflow-hidden flex flex-col h-full min-h-[300px]">
      <div className="px-4 py-3 border-b border-slate-100 bg-[#f8f9fe] dark:bg-white/[0.02] flex items-center justify-between">
        <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-200">
          {title}
        </h3>
        <button className="text-slate-400 hover:text-slate-600 transition-colors">
          <ChevronRight size={16} className="rotate-45" /> {/* Close-like icon */}
        </button>
      </div>
      <div className="overflow-auto flex-grow">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-100">
              {headers.map((h: string) => (
                <th key={h} className="px-4 py-3 text-[11px] font-bold text-slate-400 uppercase tracking-tight">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {rows.map((row: any[], i: number) => (
              <tr key={i} className={clsx(
                "group hover:bg-slate-50/50 transition-colors",
                i % 2 === 1 ? "bg-slate-50/30" : ""
              )}>
                {row.map((cell: any, j: number) => (
                  <td key={j} className="px-4 py-3 text-[12px] text-slate-600 dark:text-slate-400 font-medium">
                    {cell}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
