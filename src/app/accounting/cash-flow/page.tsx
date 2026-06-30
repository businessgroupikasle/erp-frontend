"use client";

import { useState, useEffect, useCallback } from "react";
import { ArrowUpRight, ArrowDownRight, RefreshCw, Wallet, Building2, Smartphone, TrendingUp, TrendingDown, DollarSign } from "lucide-react";
import { clsx } from "clsx";
import { accountingApi } from "@/lib/api/accounting.api";
import { toast } from "react-hot-toast";

interface CashFlowSummary {
  accounts: any[];
  totalLiquidity: number;
  breakdown: {
    cash: number;
    bank: number;
    upi: number;
  };
}

interface Payment {
  id: string;
  paymentNumber?: string;
  date: string;
  entity: string;
  flow: "IN" | "OUT";
  method: string;
  amount: number;
  status: string;
  accountName?: string;
}

export default function CashFlowPage() {
  const [summary, setSummary] = useState<CashFlowSummary | null>(null);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchCashFlow = useCallback(async () => {
    setLoading(true);
    try {
      const [cashRes, paymentsRes] = await Promise.all([
        accountingApi.getCashFlow(),
        accountingApi.getPayments()
      ]);
      setSummary(cashRes.data);
      // Filter for PAID payments only for the cash flow statement
      const allPayments = paymentsRes.data?.payments || [];
      const settled = allPayments.filter((p: any) => p.status === 'PAID' && !p.isCancelled);
      setPayments(settled);
    } catch (err: any) {
      toast.error(err?.response?.data?.error || "Failed to load cash flow data");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCashFlow();
  }, [fetchCashFlow]);

  // Calculate Inflows and Outflows for the current period (assuming all fetched for now, can be paginated/filtered)
  const totalInflows = payments.filter(p => p.flow === 'IN').reduce((acc, curr) => acc + curr.amount, 0);
  const totalOutflows = payments.filter(p => p.flow === 'OUT').reduce((acc, curr) => acc + curr.amount, 0);
  const netCashFlow = totalInflows - totalOutflows;

  return (
    <div className="max-w-6xl mx-auto space-y-10 py-4 animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row justify-between md:items-end gap-6 border-b border-gray-100 pb-8">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <div className="w-2 h-8 bg-blue-500 rounded-full" />
            <h1 className="text-4xl font-black text-slate-900 tracking-tight">Cash Flow Overview</h1>
          </div>
          <p className="text-sm font-medium text-slate-500">Track your business&apos;s liquidity and cash position in real-time.</p>
        </div>
        <button
          onClick={fetchCashFlow}
          className="w-12 h-12 flex items-center justify-center rounded-2xl bg-slate-50 text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-all active:scale-90"
        >
          <RefreshCw size={18} className={clsx(loading && "animate-spin")} />
        </button>
      </div>

      {loading ? (
        <div className="py-40 flex flex-col items-center justify-center gap-6">
          <div className="flex gap-1.5">
            {[1, 2, 3].map((i) => (
              <div key={i} className="w-2 h-2 rounded-full bg-slate-200 animate-bounce" style={{ animationDelay: `${i * 150}ms` }} />
            ))}
          </div>
          <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Loading Overview</p>
        </div>
      ) : (
        <div className="space-y-8">
          {/* Liquidity Section */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-slate-900 rounded-[2rem] p-8 text-white flex flex-col justify-between relative overflow-hidden shadow-xl shadow-slate-900/10">
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full blur-3xl -mr-10 -mt-10" />
              <div className="space-y-1 relative z-10">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Total Liquidity</p>
                <p className="text-4xl font-black tabular-nums">₹{summary?.totalLiquidity.toLocaleString() || '0'}</p>
              </div>
              <div className="flex items-center gap-2 mt-6 text-slate-400">
                <Wallet size={16} /> <span className="text-xs font-bold">Total Cash Equivalents</span>
              </div>
            </div>
            
            <div className="bg-emerald-50 rounded-[2rem] p-8 flex flex-col justify-between border border-emerald-100">
              <div className="space-y-1">
                <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">Cash In Hand</p>
                <p className="text-3xl font-black tabular-nums text-emerald-900">₹{summary?.breakdown?.cash.toLocaleString() || '0'}</p>
              </div>
              <div className="flex items-center gap-2 mt-6 text-emerald-600">
                <DollarSign size={16} /> <span className="text-xs font-bold">Physical Cash</span>
              </div>
            </div>

            <div className="bg-blue-50 rounded-[2rem] p-8 flex flex-col justify-between border border-blue-100">
              <div className="space-y-1">
                <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest">Bank Balance</p>
                <p className="text-3xl font-black tabular-nums text-blue-900">₹{summary?.breakdown?.bank.toLocaleString() || '0'}</p>
              </div>
              <div className="flex items-center gap-2 mt-6 text-blue-600">
                <Building2 size={16} /> <span className="text-xs font-bold">Bank Accounts</span>
              </div>
            </div>

            <div className="bg-purple-50 rounded-[2rem] p-8 flex flex-col justify-between border border-purple-100">
              <div className="space-y-1">
                <p className="text-[10px] font-black text-purple-600 uppercase tracking-widest">UPI / Wallets</p>
                <p className="text-3xl font-black tabular-nums text-purple-900">₹{summary?.breakdown?.upi.toLocaleString() || '0'}</p>
              </div>
              <div className="flex items-center gap-2 mt-6 text-purple-600">
                <Smartphone size={16} /> <span className="text-xs font-bold">Digital Wallets</span>
              </div>
            </div>
          </div>

          {/* Operating Cash Flow Summary */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="bg-white border border-slate-100 rounded-[2rem] p-8 space-y-6 shadow-sm flex flex-col justify-center items-center text-center">
              <div className="p-4 rounded-full bg-emerald-50 text-emerald-500">
                <TrendingUp size={32} />
              </div>
              <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Total Inflows</p>
                <p className="text-3xl font-black tabular-nums text-slate-900">+₹{totalInflows.toLocaleString()}</p>
              </div>
            </div>

            <div className="bg-white border border-slate-100 rounded-[2rem] p-8 space-y-6 shadow-sm flex flex-col justify-center items-center text-center">
              <div className="p-4 rounded-full bg-orange-50 text-orange-500">
                <TrendingDown size={32} />
              </div>
              <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Total Outflows</p>
                <p className="text-3xl font-black tabular-nums text-slate-900">-₹{totalOutflows.toLocaleString()}</p>
              </div>
            </div>

            <div className={clsx(
              "border rounded-[2rem] p-8 space-y-6 shadow-sm flex flex-col justify-center items-center text-center",
              netCashFlow >= 0 ? "bg-emerald-500 text-white border-emerald-600" : "bg-orange-500 text-white border-orange-600"
            )}>
              <div>
                <p className="text-[10px] font-black text-white/80 uppercase tracking-widest mb-2">Net Cash Flow</p>
                <p className="text-4xl font-black tabular-nums">
                  {netCashFlow >= 0 ? '+' : ''}₹{netCashFlow.toLocaleString()}
                </p>
              </div>
              <p className="text-xs font-bold text-white/80">Operating Period</p>
            </div>
          </div>

          {/* Recent Flow Activity */}
          <div className="bg-white border border-slate-100 rounded-[2rem] overflow-hidden shadow-sm">
            <div className="px-8 py-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <h2 className="text-lg font-black text-slate-900">Recent Cash Movements</h2>
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 bg-white border border-slate-200 px-3 py-1.5 rounded-xl">Settled Transactions</span>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-100">
                    <th className="px-8 py-5 text-[10px] uppercase font-black tracking-widest text-slate-400">Date & Ref</th>
                    <th className="px-8 py-5 text-[10px] uppercase font-black tracking-widest text-slate-400">Description</th>
                    <th className="px-8 py-5 text-[10px] uppercase font-black tracking-widest text-slate-400">Flow</th>
                    <th className="px-8 py-5 text-[10px] uppercase font-black tracking-widest text-slate-400">Account</th>
                    <th className="px-8 py-5 text-[10px] uppercase font-black tracking-widest text-slate-400 text-right">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {payments.slice(0, 15).map((payment) => (
                    <tr key={payment.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-8 py-4">
                        <p className="text-xs font-black text-slate-900 uppercase">{payment.paymentNumber || "—"}</p>
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">
                          {new Date(payment.date).toLocaleDateString("en-IN", { day: "2-digit", month: "short" })}
                        </p>
                      </td>
                      <td className="px-8 py-4">
                        <p className="text-sm font-bold text-slate-900">{payment.entity || "—"}</p>
                      </td>
                      <td className="px-8 py-4">
                        {payment.flow === "IN" ? (
                          <div className="flex items-center gap-1.5 text-emerald-500"><ArrowDownRight size={14} strokeWidth={3} /><span className="text-[10px] font-black uppercase tracking-widest">Inflow</span></div>
                        ) : (
                          <div className="flex items-center gap-1.5 text-orange-500"><ArrowUpRight size={14} strokeWidth={3} /><span className="text-[10px] font-black uppercase tracking-widest">Outflow</span></div>
                        )}
                      </td>
                      <td className="px-8 py-4">
                        <span className="px-3 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest bg-slate-100 text-slate-600">
                          {payment.accountName || payment.method}
                        </span>
                      </td>
                      <td className="px-8 py-4 text-right">
                        <p className={clsx("text-sm font-black tabular-nums", payment.flow === "IN" ? "text-emerald-500" : "text-slate-900")}>
                          {payment.flow === "IN" ? "+" : "-"}₹{payment.amount.toLocaleString()}
                        </p>
                      </td>
                    </tr>
                  ))}
                  {payments.length === 0 && (
                    <tr>
                      <td colSpan={5} className="px-8 py-16 text-center">
                        <p className="text-sm font-bold text-slate-400">No recent cash movements found.</p>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            {payments.length > 15 && (
              <div className="p-4 text-center border-t border-slate-100 bg-slate-50/50">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Showing last 15 settled transactions</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
