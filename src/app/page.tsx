"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import {
  ShoppingCart, Package, Users, TrendingUp, TrendingDown,
  AlertTriangle, Clock, IndianRupee, RotateCcw, Target, Calendar,
  CreditCard, Receipt, Activity, ChevronRight, Search, 
  BarChart3, Wallet, Zap, LayoutDashboard, Factory, Settings2, Settings, UserCheck
} from "lucide-react";
import { clsx } from "clsx";
import { dashboardApi } from "@/lib/api";
import { formatCurrency } from "@/lib/utils";
import {
  MetricCard, MonthlyCard, GrowthIndicator, SectionHeader,
  SalesTargetTable, YearlySalesChart, TopSellingTable,
  StockUrgentTable, SupplierPaymentTable, DashboardTable, PremiumReportTable
} from "@/components/dashboard/DashboardComponents";

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

  // --- Live Data Integration ---
  const stats = data?.stats;
  
  const b2bSales = { 
    month: formatCurrency(stats?.b2bRevenueMonth || 0), 
    today: formatCurrency(stats?.b2bRevenueToday || 0), 
    trend: parseFloat(stats?.b2bRevenueChangePct || "0"),
    trendType: parseFloat(stats?.b2bRevenueChangePct || "0") >= 0 ? "up" : "down"
  };
  const b2cSales = { 
    month: formatCurrency(stats?.b2cRevenueMonth || 0), 
    today: formatCurrency(stats?.b2cRevenueToday || 0), 
    trend: parseFloat(stats?.b2cRevenueChangePct || "0"),
    trendType: parseFloat(stats?.b2cRevenueChangePct || "0") >= 0 ? "up" : "down"
  };
  const purchase = { 
    month: formatCurrency(stats?.purchaseRevenueMonth || 0),
    today: formatCurrency(stats?.purchaseRevenueToday || 0), 
    trend: 0 
  };
  const dealers = { 
    outstanding: formatCurrency(stats?.dealersOutstanding || 0), 
    deposit: formatCurrency(stats?.dealersDeposit || 0) 
  };
  const treasury = {
    cash: formatCurrency(stats?.treasury?.cash || 0),
    bank: formatCurrency(stats?.treasury?.bank || 0)
  };
  const expenses = {
    month: formatCurrency(stats?.expensesToday || 0), // Use expensesToday as month for now or total
    today: formatCurrency(stats?.expensesToday || 0)
  };

  const monthlyCards = (data?.monthlySales || []).slice(-3).map((m: any) => ({
    month: m.month.toUpperCase(),
    amount: formatCurrency(m.amount),
    color: m.amount > 0 ? 'bg-green-800' : 'bg-red-700'
  }));

  const salesTargets = data?.salesTargets || [];

  const yearlySales = (data?.monthlySales || []).map((s: any) => ({
    date: s.month,
    amount: s.amount
  }));

  const recentPurchasesRows = (data?.recentPurchases || []).map((p: any, i: number) => [
    i + 1, p.id || 'N/A', p.date, p.vendor, 1, p.amount
  ]);

  const recentB2BSalesRows = (data?.recentOrders || []).filter((o: any) => o.table === 'B2B').map((o: any) => [
    o.id, o.time.split(' ')[0], "—", o.franchiseName || "Standard", o.amount
  ]);

  const recentB2CSalesRows = (data?.recentOrders || []).filter((o: any) => o.table !== 'B2B').map((o: any) => [
    o.id, o.time, "Walk-in", "Customer", o.amount
  ]);

  const topSelling = (data?.topSellers || []).map((ts: any) => ({
    name: ts.name,
    qty: ts.count
  }));

  const stockUrgent = (data?.lowStock || []).map((ls: any) => ({
    code: ls.code || 'PR-001',
    name: ls.name,
    stock: ls.currentStock,
    reorder: ls.minimumStock
  }));

  const supplierTracking = (data?.supplierTracking || []).map((st: any) => ({
    no: st.id,
    date: st.date,
    name: st.vendor,
    status: st.status,
    amount: st.amount
  }));

  return (
    <div className="min-h-full bg-[#F8FAFC] dark:bg-[#090a0f] p-4 md:p-10 space-y-10 animate-in fade-in duration-700">
      
      {/* ── 📊 SUMMARY METRICS ──────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <MetricCard 
          title="DEALER SALES" 
          monthValue={b2bSales.month} 
          todayValue={b2bSales.today} 
          trend={b2bSales.trend}
          trendType={b2bSales.trendType}
          icon={Calendar} 
        />
        <MetricCard 
          title="PURCHASE" 
          monthValue={purchase.month} 
          todayValue={purchase.today} 
          icon={ShoppingCart} 
        />
        <MetricCard 
          title="DEALERS" 
          monthValue={dealers.outstanding} 
          todayValue={dealers.deposit} 
          label1="Outstanding" 
          label2="Deposit" 
          icon={Users} 
        />

        <MetricCard 
          title="SALES INVOICES" 
          monthValue={b2cSales.month} 
          todayValue={b2cSales.today} 
          trend={b2cSales.trend}
          trendType={b2cSales.trendType}
          icon={Zap} 
        />
        <MetricCard 
          title="EXPENSES" 
          monthValue={expenses.month} 
          todayValue={expenses.today} 
          icon={Receipt} 
        />
        <MetricCard 
          title="TREASURY" 
          monthValue={treasury.bank} 
          todayValue={treasury.cash} 
          label1="Bank Balance" 
          label2="Cash in Hand" 
          icon={Wallet} 
        />
      </div>

      {/* ── 🥉 MONTHLY TRENDS & GROWTH ───────────────────── */}
      <section className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {monthlyCards.map((card, i) => (
          <MonthlyCard key={i} month={card.month} amount={card.amount} colorClass={card.color} />
        ))}
        <GrowthIndicator value={parseFloat(stats?.b2cRevenueChangePct || "0")} />
      </section>

      {/* ── 🏅 SALES INTELLIGENCE ────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        <div className="lg:col-span-12">
          <SectionHeader title="Performance Intelligence" subtitle="Target Tracking & Yearly Trajectory" icon={Activity} />
        </div>
        <div className="lg:col-span-12">
          <YearlySalesChart data={yearlySales} />
        </div>
      </div>

      {/* ── 🚀 ADVANCED OPERATIONS ───────────────────────── */}
      <div className="space-y-6">
        <PremiumReportTable 
          title="Recent Sales Invoices" 
          headers={["Bill.No", "Date", "Bill To", "Name", "T.Amt"]} 
          rows={recentB2CSalesRows} 
        />
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <TopSellingTable data={topSelling} />
          <StockUrgentTable data={stockUrgent} />
        </div>

        <SupplierPaymentTable data={supplierTracking} />
      </div>

      {/* ── 📜 TRANSACTIONAL FEED ────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pt-6 border-t border-slate-200 dark:border-white/5">
        <PremiumReportTable 
          title="Recent Purchase Report View" 
          headers={["S.no", "P.Code", "Date", "S.Name", "Qty", "Amount"]} 
          rows={recentPurchasesRows} 
        />
        <PremiumReportTable 
          title="Recent Dealer Sales" 
          headers={["Bill.No", "Date", "Bill to", "Name", "T.Amt"]} 
          rows={recentB2BSalesRows} 
        />
      </div>

      {/* ── 🚀 QUICK ACCESS DOCK ─────────────────────────── */}
      <section className="pt-10 border-t border-slate-200 dark:border-white/5">
        <SectionHeader title="Enterprise Navigator" subtitle="Direct Access to Core Modules" icon={LayoutDashboard} />
        <div className="grid grid-cols-3 md:grid-cols-5 lg:grid-cols-9 gap-4">
          {[
            { label: 'Leads', icon: Users, href: '/crm', color: 'bg-indigo-500' },
            { label: 'Products', icon: Package, href: '/products', color: 'bg-orange-500' },
            { label: 'Sales', icon: IndianRupee, href: '/sales', color: 'bg-emerald-500' },
            { label: 'Purchase', icon: ShoppingCart, href: '/purchases', color: 'bg-rose-500' },
            { label: 'GRN', icon: Receipt, href: '/purchases/grn', color: 'bg-blue-500' },
            { label: 'Production', icon: Factory, href: '/production', color: 'bg-slate-900' },
            { label: 'Customers', icon: UserCheck, href: '/customers', color: 'bg-amber-500' },
            { label: 'Users', icon: Settings2, href: '/admin', color: 'bg-slate-400' },
            { label: 'Settings', icon: Settings, href: '/settings', color: 'bg-slate-600' },
          ].map((action: any) => (
            <Link key={action.label} href={action.href} className="bg-white dark:bg-[#12141c] p-4 rounded-2xl border border-slate-200/60 dark:border-white/5 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all group flex flex-col items-center text-center gap-2">
               <div className={clsx("w-10 h-10 rounded-xl flex items-center justify-center text-white shadow-lg group-hover:scale-110 transition-transform shadow-current/20", action.color)}>
                  <action.icon size={18} />
               </div>
               <span className="text-[9px] font-black text-slate-900 dark:text-white uppercase tracking-widest">{action.label}</span>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}

