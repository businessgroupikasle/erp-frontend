'use client';

import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { reportsApi, accountingApi } from '@/lib/api';
import { TrendingUp, TrendingDown, DollarSign, ShoppingCart, Wallet, CreditCard, ArrowRight } from 'lucide-react';
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";

export default function ProfitLossPage() {
  const [data, setData] = useState<any>(null);
  const [cashFlow, setCashFlow] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const [plRes, cfRes] = await Promise.all([
          reportsApi.getDetailedProfit(),
          accountingApi.getCashFlow()
        ]);
        setData(plRes.data);
        setCashFlow(cfRes.data);
      } catch (err) {
        console.error('Failed to fetch P&L data', err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  if (loading) return <div className="p-8 text-center animate-pulse">Calculating financial intelligence...</div>;
  if (!data) return <div className="p-8 text-center text-red-500">Failed to load financial records.</div>;

  const grossProfitMargin = ((data.grossProfit / data.revenue) * 100) || 0;
  const netProfitMargin = ((data.netProfit / data.revenue) * 100) || 0;

  return (
    <div className="p-6 space-y-6 bg-slate-50/50 min-h-screen">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">Profit & Loss Statement</h1>
          <p className="text-slate-500">Real-time financial performance auditing</p>
        </div>
        <Badge variant={data.netProfit >= 0 ? "default" : "destructive"} className="text-lg px-4 py-1">
          {data.netProfit >= 0 ? 'PROFITABLE' : 'LOSS'}
        </Badge>
      </div>

      {/* Top 3 Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="border-l-4 border-l-blue-500 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-500 flex items-center gap-2">
              <ShoppingCart className="w-4 h-4" /> REVENUE
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900">₹{data.revenue.toLocaleString('en-IN')}</div>
            <p className="text-xs text-slate-400 mt-1">Total POS Sales Invoiced</p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-orange-500 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-500 flex items-center gap-2">
              <ArrowRight className="w-4 h-4" /> COGS
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900">₹{data.cogs.toLocaleString('en-IN')}</div>
            <p className="text-xs text-slate-400 mt-1">Cost of Materials Consumed</p>
          </CardContent>
        </Card>

        <Card className={`border-l-4 ${data.netProfit >= 0 ? 'border-l-emerald-500' : 'border-l-rose-500'} shadow-sm`}>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-500 flex items-center gap-2">
              {data.netProfit >= 0 ? <TrendingUp className="w-4 h-4 text-emerald-500" /> : <TrendingDown className="w-4 h-4 text-rose-500" />}
              NET PROFIT
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${data.netProfit >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
              ₹{data.netProfit.toLocaleString('en-IN')}
            </div>
            <p className="text-xs text-slate-400 mt-1">Bottom line after all deductions</p>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Analysis Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left: Calculation Breakdown */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Detailed Breakdown</CardTitle>
            <CardDescription>From Revenue to Net Profit</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <div className="flex justify-between items-center text-lg">
                <span className="text-slate-600">(+) Total Indirect/Direct Revenue</span>
                <span className="font-semibold">₹{data.revenue.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between items-center text-lg text-orange-600">
                <span>(-) Cost of Goods Sold (Recipe Based)</span>
                <span className="font-semibold">₹{data.cogs.toLocaleString('en-IN')}</span>
              </div>
              <hr />
              <div className="flex justify-between items-center text-xl font-bold">
                <span>(=) Gross Profit</span>
                <span className="text-blue-600">₹{data.grossProfit.toLocaleString('en-IN')}</span>
              </div>
              <div className="pt-2">
                <div className="flex justify-between text-xs mb-1">
                  <span>Gross Margin</span>
                  <span>{grossProfitMargin.toFixed(1)}%</span>
                </div>
                <Progress value={grossProfitMargin} className="h-2" />
              </div>
              
              <div className="flex justify-between items-center text-lg text-rose-500 pt-4">
                <span>(-) Operational Expenses (Salary, Rent, Others)</span>
                <span className="font-semibold">₹{data.expenses.toLocaleString('en-IN')}</span>
              </div>
              <hr className="border-2 border-slate-900" />
              <div className="flex justify-between items-center text-2xl font-black">
                <span>Net Earnings</span>
                <span className={data.netProfit >= 0 ? 'text-emerald-600' : 'text-rose-600'}>
                  ₹{data.netProfit.toLocaleString('en-IN')}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Right: Cash Flow / Liquidity */}
        <Card className="bg-slate-900 text-white border-none shadow-xl">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Wallet className="w-5 h-5 text-blue-400" /> Liquidity Status
            </CardTitle>
            <CardDescription className="text-slate-400">Total Money Available in Accounts</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="text-center py-4">
              <div className="text-sm text-slate-400 uppercase tracking-widest">Total Cash Value</div>
              <div className="text-4xl font-bold text-blue-400">₹{cashFlow?.totalLiquidity?.toLocaleString('en-IN') || 0}</div>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg border border-white/10">
                <div className="flex items-center gap-3">
                  <DollarSign className="w-4 h-4 text-emerald-400" />
                  <span>Physical Cash</span>
                </div>
                <span className="font-mono text-emerald-400">₹{cashFlow?.breakdown?.cash?.toLocaleString('en-IN') || 0}</span>
              </div>
              
              <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg border border-white/10">
                <div className="flex items-center gap-3">
                  <CreditCard className="w-4 h-4 text-blue-400" />
                  <span>Bank Balance</span>
                </div>
                <span className="font-mono text-blue-400">₹{cashFlow?.breakdown?.bank?.toLocaleString('en-IN') || 0}</span>
              </div>

              <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg border border-white/10">
                <div className="flex items-center gap-3">
                  <TrendingUp className="w-4 h-4 text-purple-400" />
                  <span>UPI Wallet</span>
                </div>
                <span className="font-mono text-purple-400">₹{cashFlow?.breakdown?.upi?.toLocaleString('en-IN') || 0}</span>
              </div>
            </div>

            <div className="pt-4 border-t border-white/10">
              <p className="text-xs text-slate-500 text-center italic">
                * All balances are strictly verified against transactional history.
              </p>
            </div>
          </CardContent>
        </Card>

      </div>
    </div>
  );
}
