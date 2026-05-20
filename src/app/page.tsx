"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import {
  ShoppingCart, Package, Users, TrendingUp, TrendingDown,
  AlertTriangle, Clock, IndianRupee, RotateCcw, Target, Calendar,
  CreditCard, Receipt, Activity, ChevronRight, Search, 
  BarChart3, Wallet, Zap, LayoutDashboard, Factory, Settings2, Settings, UserCheck, Plus, Send, Building2,
  Bell, ShieldAlert, History, Repeat, Store, Truck, CheckCircle2, XCircle, Landmark, PackageCheck
} from "lucide-react";
import { clsx } from "clsx";
import { dashboardApi } from "@/lib/api";
import { formatCurrency } from "@/lib/utils";
import {
  KPICard, RevenueIntelligence, PremiumFilter, ReportTableWidget
} from "@/components/dashboard/DashboardComponents";

export default function Dashboard() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [period, setPeriod] = useState("today");
  const [customStartDate, setCustomStartDate] = useState("");
  const [customEndDate, setCustomEndDate] = useState("");

  const fetchDashboard = useCallback(() => {
    setLoading(true);
    
    let endDateStr = new Date().toISOString();
    let startDateStr = new Date().toISOString();

    if (period === "custom" && customStartDate && customEndDate) {
      startDateStr = new Date(customStartDate).toISOString();
      const endD = new Date(customEndDate);
      endD.setHours(23, 59, 59, 999);
      endDateStr = endD.toISOString();
    } else {
      let startDate = new Date();
      if (period === "today") startDate.setHours(0,0,0,0);
      else if (period === "week") startDate.setDate(startDate.getDate() - 7);
      else if (period === "month") startDate.setMonth(startDate.getMonth() - 1);
      else startDate.setFullYear(2020);
      startDateStr = startDate.toISOString();
    }

    dashboardApi.getSummary({ startDate: startDateStr, endDate: endDateStr, period })
      .then((res) => setData(res.data))
      .catch((err) => setError(err.response?.data?.error || "Failed to load dashboard"))
      .finally(() => setLoading(false));
  }, [period, customStartDate, customEndDate]);

  useEffect(() => {
    fetchDashboard();
  }, [fetchDashboard]);

  if (error) return (
    <div className="min-h-screen flex items-center justify-center bg-[#F8FAFC] dark:bg-[#090a0f] p-4">
      <div className="bg-white dark:bg-[#12141c] p-10 rounded-[3rem] border border-rose-500/20 shadow-2xl shadow-rose-500/10 flex flex-col items-center text-center max-w-md animate-in zoom-in-95 duration-500">
        <div className="w-20 h-20 rounded-3xl bg-rose-50 dark:bg-rose-500/10 flex items-center justify-center text-rose-500 mb-6">
          <AlertTriangle size={40} />
        </div>
        <h2 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-widest mb-3">Telemetry Failure</h2>
        <p className="text-sm font-bold text-slate-500 dark:text-slate-400 mb-8 leading-relaxed">{error}</p>
        <button 
          onClick={() => { setError(null); fetchDashboard(); }}
          className="px-8 py-3 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] hover:scale-105 transition-all shadow-xl active:scale-95"
        >
          Re-establish Connection
        </button>
      </div>
    </div>
  );

  if (loading && !data) return (
    <div className="min-h-screen flex items-center justify-center bg-[#F8FAFC] dark:bg-[#090a0f]">
      <div className="flex flex-col items-center gap-6 animate-pulse">
        <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin shadow-xl shadow-blue-600/20" />
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em]">Establishing Mission Control Link...</p>
      </div>
    </div>
  );

  const stats = data?.stats;

  // --- LAYER 1: CEO SUMMARY (LIVE DATA) ---
  const executiveKPIs = [
    { title: "Today Revenue", value: formatCurrency(stats?.revenueToday || 0), trend: stats?.revenueChangePct || "0", icon: Zap, colorClass: "emerald", insight: `${stats?.orderCountToday || 0} Orders Today` },
    { title: "Net Profit", value: formatCurrency((stats?.totalSales || 0) - (stats?.totalPurchase || 0)), icon: TrendingUp, colorClass: "emerald", subtext: `Profit for this ${period}`, insight: `Margin: ${stats?.totalSales > 0 ? (((stats.totalSales - stats.totalPurchase) / stats.totalSales) * 100).toFixed(1) : 0}%` },
    { title: "Vendor Payables", value: formatCurrency(stats?.vendorPayables || 0), icon: CreditCard, colorClass: "rose", subtext: "Dues to Suppliers", insight: `From ${stats?.vendorCountActive || 0} Vendors` },
    { title: "Inventory Value", value: formatCurrency(stats?.inventoryValue || 0), icon: Package, colorClass: "blue", subtext: "Warehouse Asset Net Worth", insight: `${stats?.inventoryItemCount || 0} Active SKUs` },
    { title: "Active Franchise Orders", value: stats?.activeFranchiseOrders || 0, icon: Send, colorClass: "indigo", subtext: "Fulfillment Queue", insight: `${stats?.lowStockCount || 0} Critical Stock Alerts` },
    { title: "Total Sales", value: stats?.totalSalesCount || 0, icon: BarChart3, colorClass: "orange", subtext: `Volume for this ${period}`, insight: `Revenue: ${formatCurrency(stats?.totalSales || 0)}` },
  ];

  // --- LAYER 2: REVENUE SOURCES ---
  const revenueBreakdown = (data?.revenueBreakdown || []).map((b: any, i: number) => ({
    label: b.label,
    value: b.value,
    percent: stats?.revenueToday ? (b.value / stats.revenueToday) * 100 : 0,
    color: i === 0 ? "bg-blue-500" : i === 1 ? "bg-emerald-500" : i === 2 ? "bg-amber-500" : "bg-rose-500"
  }));

  // --- ANALYTICS & OPERATIONS ---
  const chartData = (data?.historicalSales || []).map((s: any) => ({
    date: s.date,
    sales: s.sales || 0,
    orders: s.orders,
    purchase: s.purchase || 0,
    profit: (s.sales || 0) - (s.purchase || 0),
  }));

  return (
    <div className="min-h-full bg-[#F8FAFC] dark:bg-[#090a0f] p-4 md:p-8 space-y-8 animate-in fade-in duration-1000">
      
      {/* ── HEADER ── */}
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4 border-b border-slate-100 dark:border-white/5 pb-6">
        <div>
          <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tighter uppercase transition-colors hover:text-[#F58220]">HQ Control Center</h1>
          <p className="text-[11px] text-slate-400 font-black uppercase tracking-[0.3em] mt-1">ADMINISTRATIVE INTERFACE • {new Date().getFullYear()}</p>
        </div>
        
        <div className="flex flex-col sm:flex-row sm:items-center flex-wrap gap-4 xl:justify-end">
          {/* Date range picker & Period filter */}
          <div className="flex flex-wrap items-center gap-2">
            {period === 'custom' && (
              <div className="flex items-center gap-2 animate-in fade-in slide-in-from-right-4 duration-300">
                <input 
                  type="date" 
                  value={customStartDate} 
                  onChange={e => setCustomStartDate(e.target.value)}
                  className="px-4 py-1.5 bg-white dark:bg-[#12141c] border border-slate-200 dark:border-white/10 rounded-full text-[11px] font-bold text-slate-700 dark:text-slate-300 outline-none shadow-sm focus:border-[#F58220] focus:ring-2 focus:ring-orange-500/20 transition-all"
                />
                <span className="text-slate-400 font-bold">-</span>
                <input 
                  type="date" 
                  value={customEndDate} 
                  onChange={e => setCustomEndDate(e.target.value)}
                  className="px-4 py-1.5 bg-white dark:bg-[#12141c] border border-slate-200 dark:border-white/10 rounded-full text-[11px] font-bold text-slate-700 dark:text-slate-300 outline-none shadow-sm focus:border-[#F58220] focus:ring-2 focus:ring-orange-500/20 transition-all"
                />
              </div>
            )}
            <PremiumFilter 
              options={[
                { label: 'Today', value: 'today' },
                { label: 'Week', value: 'week' },
                { label: 'Month', value: 'month' },
                { label: 'Custom', value: 'custom' },
              ]}
              active={period}
              onChange={setPeriod}
            />
          </div>

          {/* Actions */}
          <div className="flex items-center gap-3">
            <Link href="/purchases/new" className="flex-1 sm:flex-initial justify-center bg-slate-900 dark:bg-white text-white dark:text-slate-900 px-6 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:scale-105 transition-all shadow-xl active:scale-95 flex items-center gap-3 whitespace-nowrap">
              <Plus size={16} strokeWidth={3} /> Create PO
            </Link>
            <Link href="/franchise-orders" className="flex-1 sm:flex-initial justify-center bg-blue-600 text-white px-6 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-blue-700 hover:scale-105 transition-all active:scale-95 flex items-center gap-3 shadow-xl shadow-blue-500/20 whitespace-nowrap">
              <Send size={16} strokeWidth={3} /> Dispatch
            </Link>
          </div>
        </div>
      </div>
 
      {/* ── LAYER 1: CEO SUMMARY ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-6 gap-6">
        {executiveKPIs.map((kpi, i) => (
          <KPICard key={i} {...kpi} />
        ))}
      </div>

      {/* ── LAYER 2: REVENUE INTELLIGENCE ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-12">
          <RevenueIntelligence 
            data={chartData} 
            title="Revenue Analytics" 
            trend={stats?.revenueChangePct || "0"} 
            period={period} 
            setPeriod={setPeriod} 
          />
        </div>
        <div className="lg:col-span-12">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <ReportTableWidget 
              title="Recent Purchase Report View" 
              icon={PackageCheck} 
              color="indigo"
              headers={['PO Number', 'Vendor', 'Amount']}
              data={(data?.recentPurchases || []).map((p: any) => ({
                col1: p.poNumber,
                col2: p.vendor?.name || p.items?.[0]?.inventoryItem?.name || 'Vendor',
                col3: formatCurrency(p.totalAmount)
              }))}
            />
            
            <ReportTableWidget 
              title="Recent B2B Sales Details" 
              icon={Building2} 
              color="blue"
              headers={['Invoice #', 'Client', 'Amount']}
              data={(data?.recentB2BSales || []).map((s: any) => ({
                col1: s.invoiceNum,
                col2: s.customerName || 'B2B Client',
                col3: formatCurrency(s.totalAmount)
              }))}
            />

            <ReportTableWidget 
              title="Recent B2C Sales Details" 
              icon={Store} 
              color="emerald"
              headers={['Invoice #', 'Amount']}
              data={(data?.recentB2CBills || []).map((s: any) => ({
                col1: `#${s.invoiceNum}`,
                col2: formatCurrency(s.totalAmount)
              }))}
            />

            <ReportTableWidget 
              title="Top Selling Products of the Week" 
              icon={TrendingUp} 
              color="amber"
              headers={['Product', 'Units Sold', 'Trend']}
              data={(data?.topSellers || []).map((p: any) => ({
                col1: p.name,
                col2: `${p.value} ${p.unit}`,
                col3: `${p.growth}%`
              }))}
            />

            <ReportTableWidget 
              title="Stock Urgent Report" 
              icon={AlertTriangle} 
              color="rose"
              headers={['Product', 'Current Stock', 'Action']}
              data={(data?.lowStock || []).map((p: any) => ({
                col1: p.name,
                col2: `${p.currentStock} ${p.unit}`,
                col3: p.action
              }))}
            />

            <ReportTableWidget 
              title="Supplier payment Tracking View" 
              icon={CreditCard} 
              color="purple"
              headers={['Vendor', 'PO Number', 'Amount Due']}
              data={(data?.supplierPaymentsDue || []).map((p: any) => ({
                col1: p.vendor?.name || 'Vendor',
                col2: p.poNumber,
                col3: formatCurrency(p.totalAmount)
              }))}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
