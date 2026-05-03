"use client";

import { useState } from "react";
import { 
  CreditCard, 
  ArrowUpRight, 
  ArrowDownRight, 
  Filter, 
  Search,
  CheckCircle2,
  Clock,
  XCircle,
  Plus,
  RefreshCw,
  Landmark
} from "lucide-react";
import { clsx } from "clsx";

type FlowType = "ALL" | "IN" | "OUT";

const MOCK_PAYMENTS = [
  { id: 'PAY-1001', date: new Date().toISOString(), entity: 'Walk-in Customer', flow: 'IN', method: 'UPI', amount: 850, status: 'PAID', reference: 'POS-8902', type: 'DIRECT' },
  { id: 'PAY-1002', date: new Date(Date.now() - 86400000).toISOString(), entity: 'Spice Valley', flow: 'OUT', method: 'BANK_TRANSFER', amount: 15400, status: 'PAID', reference: 'PO-104', type: 'PO_LINKED' },
  { id: 'PAY-1003', date: new Date(Date.now() - 172800000).toISOString(), entity: 'Franchise B', flow: 'IN', method: 'NEFT', amount: 24000, status: 'PENDING', reference: 'FRA-42', type: 'DIRECT' },
  { id: 'PAY-1004', date: new Date(Date.now() - 259200000).toISOString(), entity: 'Fresh Farms', flow: 'OUT', method: 'CASH', amount: 3200, status: 'PAID', reference: 'ADV-1005', type: 'ADVANCE' },
  { id: 'PAY-1005', date: new Date(Date.now() - 345600000).toISOString(), entity: 'Walk-in Customer', flow: 'IN', method: 'CARD', amount: 1200, status: 'FAILED', reference: 'POS-8890', type: 'DIRECT' },
];

export default function PaymentsPage() {
  const [activeTab, setActiveTab] = useState<FlowType>("ALL");
  const [search, setSearch] = useState("");

  const filtered = MOCK_PAYMENTS.filter(p => {
    if (activeTab !== "ALL" && p.flow !== activeTab) return false;
    if (search && !p.entity.toLowerCase().includes(search.toLowerCase()) && !p.id.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const totalIn = MOCK_PAYMENTS.filter(p => p.flow === 'IN' && p.status === 'PAID').reduce((sum, p) => sum + p.amount, 0);
  const totalOut = MOCK_PAYMENTS.filter(p => p.flow === 'OUT' && p.status === 'PAID').reduce((sum, p) => sum + p.amount, 0);

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-gray-900 dark:text-white flex items-center gap-2">
            <Landmark size={24} className="text-blue-500" />
            Hybrid Payment Engine
          </h1>
          <p className="text-sm text-gray-500 dark:text-slate-400 mt-1">Unified money control centre tracing all income and accounts payable.</p>
        </div>
        <button className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-5 py-2.5 rounded-xl font-black text-xs uppercase tracking-widest transition-all shadow-lg shadow-blue-500/20 active:scale-95">
          <Plus size={16} /> Record Manual Payment
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white dark:bg-card rounded-2xl border border-gray-100 dark:border-white/5 p-6 flex flex-col justify-center relative overflow-hidden">
           <div className="absolute top-0 right-0 p-6 opacity-5"><ArrowDownRight size={80} /></div>
           <p className="text-[11px] font-black uppercase tracking-[0.2em] text-emerald-500 mb-1">Total Revenue Inflow</p>
           <h2 className="text-3xl font-black text-gray-900 dark:text-white">₹{totalIn.toLocaleString()}</h2>
        </div>
        <div className="bg-white dark:bg-card rounded-2xl border border-gray-100 dark:border-white/5 p-6 flex flex-col justify-center relative overflow-hidden">
           <div className="absolute top-0 right-0 p-6 opacity-5"><ArrowUpRight size={80} /></div>
           <p className="text-[11px] font-black uppercase tracking-[0.2em] text-orange-500 mb-1">Total Payables Outflow</p>
           <h2 className="text-3xl font-black text-gray-900 dark:text-white">₹{totalOut.toLocaleString()}</h2>
        </div>
      </div>

      <div className="bg-white dark:bg-card rounded-2xl border border-gray-100 dark:border-white/5 shadow-sm overflow-hidden flex flex-col">
        {/* Header Controls */}
        <div className="p-4 border-b border-gray-100 dark:border-white/5 flex flex-wrap gap-4 items-center justify-between bg-gray-50/50 dark:bg-white/[0.02]">
          <div className="flex p-1 bg-gray-100 dark:bg-black/20 rounded-xl border border-gray-200 dark:border-white/5">
            {(["ALL", "IN", "OUT"] as FlowType[]).map(tab => (
              <button 
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={clsx("px-5 py-2 rounded-lg text-[10px] font-black uppercase tracking-[0.15em] transition-all",
                  activeTab === tab 
                    ? "bg-white dark:bg-[#1e2333] text-blue-600 dark:text-blue-400 shadow-sm" 
                    : "text-gray-500 hover:text-gray-900 dark:hover:text-white"
                )}>
                {tab === "ALL" ? "All History" : tab === "IN" ? "Customer (IN)" : "Vendor (OUT)"}
              </button>
            ))}
          </div>
          
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input 
                type="text" 
                placeholder="Search tx or entity..." 
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9 pr-4 py-2 w-64 bg-white dark:bg-black/20 border border-gray-200 dark:border-white/10 rounded-xl text-sm outline-none focus:border-blue-500 transition-colors"
              />
            </div>
            <button className="p-2 border border-gray-200 dark:border-white/10 rounded-xl text-gray-500 hover:bg-gray-100 dark:hover:bg-white/5">
              <Filter size={16} />
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-gray-100 dark:border-white/5 text-[10px] uppercase font-black tracking-widest text-gray-400 bg-white dark:bg-card">
                <th className="px-6 py-4 font-black">Date</th>
                <th className="px-6 py-4 font-black">Tx ID & Ref</th>
                <th className="px-6 py-4 font-black">Entity</th>
                <th className="px-6 py-4 font-black">Flow Type</th>
                <th className="px-6 py-4 font-black">Method</th>
                <th className="px-6 py-4 font-black">Status</th>
                <th className="px-6 py-4 font-black text-right">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 dark:divide-white/5">
              {filtered.map(payment => (
                <tr key={payment.id} className="hover:bg-gray-50 dark:hover:bg-white/[0.02] transition-colors">
                  <td className="px-6 py-4">
                    <p className="text-xs font-bold text-gray-900 dark:text-white uppercase">
                      {new Date(payment.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                    </p>
                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-0.5">
                      {new Date(payment.date).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-xs font-black text-blue-600 dark:text-blue-400">{payment.id}</p>
                    <div className="flex items-center gap-1.5 mt-1">
                      <span className="px-1.5 py-0.5 rounded text-[8px] font-black uppercase tracking-widest bg-gray-100 dark:bg-white/10 text-gray-600 dark:text-slate-300">
                        {payment.type}
                      </span>
                      <span className="text-[10px] text-gray-400 font-bold">Ref: {payment.reference}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-sm font-bold text-gray-900 dark:text-white">{payment.entity}</p>
                  </td>
                  <td className="px-6 py-4">
                    {payment.flow === 'IN' ? (
                      <div className="flex items-center gap-1.5 text-emerald-500">
                        <ArrowDownRight size={14} strokeWidth={3} />
                        <span className="text-[10px] font-black uppercase tracking-widest">Inflow</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-1.5 text-orange-500">
                        <ArrowUpRight size={14} strokeWidth={3} />
                        <span className="text-[10px] font-black uppercase tracking-widest">Outflow</span>
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <span className="px-2 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest bg-gray-100 dark:bg-white/5 text-gray-600 dark:text-slate-300">
                      {payment.method}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    {payment.status === 'PAID' ? (
                      <div className="flex items-center gap-1.5 text-emerald-500">
                        <CheckCircle2 size={14} />
                        <span className="text-[10px] font-black uppercase tracking-widest">Paid</span>
                      </div>
                    ) : payment.status === 'PENDING' ? (
                      <div className="flex items-center gap-1.5 text-amber-500">
                        <Clock size={14} />
                        <span className="text-[10px] font-black uppercase tracking-widest">Pending</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-1.5 text-red-500">
                        <XCircle size={14} />
                        <span className="text-[10px] font-black uppercase tracking-widest">Failed</span>
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <p className={clsx("text-sm font-black", payment.flow === 'IN' ? "text-emerald-500" : "text-gray-900 dark:text-white")}>
                      {payment.flow === 'IN' ? '+' : '-'}₹{payment.amount.toLocaleString()}
                    </p>
                  </td>
                </tr>
              ))}
              
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center justify-center text-gray-400">
                      <RefreshCw size={32} className="mb-3 opacity-20" />
                      <p className="text-sm font-black uppercase tracking-widest text-gray-500">No Transactions Found</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
