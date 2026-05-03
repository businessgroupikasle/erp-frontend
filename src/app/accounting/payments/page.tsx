"use client";

import { useState, useEffect } from "react";
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
import api from "@/lib/api";

type FlowType = "ALL" | "IN" | "OUT";

export default function PaymentsPage() {
  const [activeTab, setActiveTab] = useState<FlowType>("ALL");
  const [search, setSearch] = useState("");
  const [payments, setPayments] = useState<any[]>([]);
  const [stats, setStats] = useState({ inflow: 0, outflow: 0 });
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState<any>(null);

  const loadData = async () => {
    setLoading(true);
    try {
      const [pRes, sRes] = await Promise.all([
        api.get("/api/finance/payments", { 
          params: { 
            flowType: activeTab === "ALL" ? undefined : activeTab === "IN" ? "INFLOW" : "OUTFLOW",
            search 
          } 
        }),
        api.get("/api/finance/payments/stats")
      ]);
      setPayments(pRes.data);
      setStats(sRes.data);
    } catch {}
    setLoading(false);
  };

  useEffect(() => { loadData(); }, [activeTab, search]);

  const totalIn = stats.inflow;
  const totalOut = stats.outflow;

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
        <button onClick={() => setShowModal(true)} className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-5 py-2.5 rounded-xl font-black text-xs uppercase tracking-widest transition-all shadow-lg shadow-blue-500/20 active:scale-95">
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
              {loading ? (
                <tr><td colSpan={7} className="px-6 py-12 text-center text-gray-400">Loading transactions...</td></tr>
              ) : payments.map(payment => (
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
                    <button 
                      onClick={() => setSelectedPayment(payment)}
                      className="text-xs font-black text-blue-600 dark:text-blue-400 hover:underline text-left"
                    >
                      {payment.id}
                    </button>
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
                    {payment.flowType === 'INFLOW' ? (
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
                    <p className={clsx("text-sm font-black", payment.flowType === 'INFLOW' ? "text-emerald-500" : "text-gray-900 dark:text-white")}>
                      {payment.flowType === 'INFLOW' ? '+' : '-'}₹{payment.amount.toLocaleString()}
                    </p>
                  </td>
                </tr>
              ))}
              
              {payments.length === 0 && !loading && (
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
      
      {showModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl w-full max-w-md shadow-2xl overflow-hidden">
            <div className="p-6 border-b border-gray-100 dark:border-white/5 bg-gray-50/50 dark:bg-white/[0.02]">
              <h2 className="text-lg font-black text-gray-900 dark:text-white uppercase tracking-tight">Record Manual Payment</h2>
            </div>
            <form 
              onSubmit={async (e) => {
                e.preventDefault();
                const formData = new FormData(e.currentTarget);
                const data = Object.fromEntries(formData.entries());
                try {
                  await api.post("/api/finance/payments", {
                    ...data,
                    amount: Number(data.amount)
                  });
                  setShowModal(false);
                  loadData();
                } catch { alert("Failed to record payment"); }
              }}
              className="p-6 space-y-4"
            >
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="text-[10px] font-black uppercase text-gray-400 mb-1 block">Entity Name / Payee</label>
                  <input name="entity" required className="w-full bg-gray-100 dark:bg-black/20 border-none rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500/20 transition-all font-bold" placeholder="e.g. Ravi / Spice Valley" />
                </div>
                <div>
                  <label className="text-[10px] font-black uppercase text-gray-400 mb-1 block">Flow Type</label>
                  <select name="flowType" className="w-full bg-gray-100 dark:bg-black/20 border-none rounded-xl px-4 py-2.5 text-sm outline-none font-bold">
                    <option value="OUTFLOW">Outflow (Pay)</option>
                    <option value="INFLOW">Inflow (Receive)</option>
                  </select>
                </div>
                <div>
                  <label className="text-[10px] font-black uppercase text-gray-400 mb-1 block">Entity Type</label>
                  <select name="entityType" className="w-full bg-gray-100 dark:bg-black/20 border-none rounded-xl px-4 py-2.5 text-sm outline-none font-bold">
                    <option value="EMPLOYEE">Employee</option>
                    <option value="VENDOR">Vendor</option>
                    <option value="CUSTOMER">Customer</option>
                    <option value="OTHER">Other</option>
                  </select>
                </div>
                <div>
                  <label className="text-[10px] font-black uppercase text-gray-400 mb-1 block">Amount</label>
                  <input name="amount" type="number" required className="w-full bg-gray-100 dark:bg-black/20 border-none rounded-xl px-4 py-2.5 text-sm outline-none font-bold text-blue-600" placeholder="0.00" />
                </div>
                <div>
                  <label className="text-[10px] font-black uppercase text-gray-400 mb-1 block">Method</label>
                  <select name="method" className="w-full bg-gray-100 dark:bg-black/20 border-none rounded-xl px-4 py-2.5 text-sm outline-none font-bold">
                    <option value="UPI">UPI</option>
                    <option value="CASH">Cash</option>
                    <option value="BANK_TRANSFER">Bank Transfer</option>
                    <option value="CARD">Card</option>
                  </select>
                </div>
                <div className="col-span-2">
                  <label className="text-[10px] font-black uppercase text-gray-400 mb-1 block">Reference / Note</label>
                  <input name="reference" className="w-full bg-gray-100 dark:bg-black/20 border-none rounded-xl px-4 py-2.5 text-sm outline-none font-bold" placeholder="Optional reference #" />
                </div>
                <div className="col-span-2">
                  <label className="text-[10px] font-black uppercase text-gray-400 mb-1 block">Payment Category (Type)</label>
                  <select name="type" className="w-full bg-gray-100 dark:bg-black/20 border-none rounded-xl px-4 py-2.5 text-sm outline-none font-bold">
                    <option value="GENERAL">General</option>
                    <option value="PAYROLL">Payroll</option>
                    <option value="INVENTORY_PURCHASE">Inventory Purchase</option>
                    <option value="UTILITY_BILL">Utility Bill</option>
                    <option value="RENT">Rent</option>
                    <option value="OTHER">Other</option>
                  </select>
                </div>
              </div>
              <div className="flex gap-3 pt-2">
                <button type="submit" className="flex-1 bg-blue-600 hover:bg-blue-500 text-white py-3 rounded-xl font-black text-xs uppercase tracking-widest transition-all shadow-lg shadow-blue-500/20 active:scale-95">Record Payment</button>
                <button type="button" onClick={() => setShowModal(false)} className="flex-1 bg-gray-100 dark:bg-white/5 text-gray-500 py-3 rounded-xl font-black text-xs uppercase tracking-widest hover:bg-gray-200 dark:hover:bg-white/10 transition-all">Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {selectedPayment && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] w-full max-w-xl shadow-2xl overflow-hidden border border-gray-100 dark:border-white/5">
            <div className="p-8 border-b border-gray-100 dark:border-white/5 flex justify-between items-center">
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-600 mb-1">Transaction Details</p>
                <h2 className="text-2xl font-black text-gray-900 dark:text-white uppercase tracking-tight">{selectedPayment.id}</h2>
              </div>
              <button onClick={() => setSelectedPayment(null)} className="p-2 hover:bg-gray-100 dark:hover:bg-white/5 rounded-full transition-colors">
                <XCircle size={24} className="text-gray-400" />
              </button>
            </div>
            
            <div className="p-8 space-y-8">
              <div className="grid grid-cols-2 gap-8">
                <div>
                  <label className="text-[10px] font-black uppercase text-gray-400 mb-2 block">Party / Entity</label>
                  <p className="text-lg font-black text-gray-900 dark:text-white">{selectedPayment.entity}</p>
                  <span className="text-[10px] font-black uppercase px-2 py-0.5 bg-gray-100 dark:bg-white/10 rounded text-gray-500">{selectedPayment.entityType}</span>
                </div>
                <div className="text-right">
                  <label className="text-[10px] font-black uppercase text-gray-400 mb-2 block">Amount</label>
                  <p className={clsx("text-3xl font-black", selectedPayment.flowType === 'INFLOW' ? "text-emerald-500" : "text-gray-900 dark:text-white")}>
                    {selectedPayment.flowType === 'INFLOW' ? '+' : '-'}₹{selectedPayment.amount.toLocaleString()}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-6 pt-6 border-t border-gray-100 dark:border-white/5">
                <div>
                  <label className="text-[10px] font-black uppercase text-gray-400 mb-1 block">Method</label>
                  <p className="text-xs font-black uppercase text-gray-900 dark:text-white">{selectedPayment.method}</p>
                </div>
                <div>
                  <label className="text-[10px] font-black uppercase text-gray-400 mb-1 block">Category</label>
                  <p className="text-xs font-black uppercase text-gray-900 dark:text-white">{selectedPayment.type || 'General'}</p>
                </div>
                <div className="text-right">
                  <label className="text-[10px] font-black uppercase text-gray-400 mb-1 block">Reference</label>
                  <p className="text-xs font-black text-gray-900 dark:text-white">{selectedPayment.reference || 'N/A'}</p>
                </div>
              </div>

              <div className="bg-gray-50 dark:bg-white/[0.02] p-6 rounded-2xl">
                <label className="text-[10px] font-black uppercase text-gray-400 mb-2 block">Description / Notes</label>
                <p className="text-sm text-gray-600 dark:text-gray-400 font-medium italic">
                  {selectedPayment.description || "No additional notes provided for this transaction."}
                </p>
              </div>

              <div className="flex items-center justify-between pt-4">
                 <div className="flex items-center gap-2">
                    <div className={clsx("w-2 h-2 rounded-full", selectedPayment.status === 'PAID' ? "bg-emerald-500" : "bg-amber-500")}></div>
                    <span className="text-[10px] font-black uppercase tracking-widest text-gray-500">{selectedPayment.status}</span>
                 </div>
                 <p className="text-[10px] font-bold text-gray-400">Recorded on {new Date(selectedPayment.createdAt).toLocaleString()}</p>
              </div>
            </div>

            <div className="p-6 bg-gray-50 dark:bg-white/[0.02] border-t border-gray-100 dark:border-white/5 flex gap-3">
               <button onClick={() => window.print()} className="flex-1 bg-white dark:bg-slate-800 border border-gray-200 dark:border-white/10 text-gray-900 dark:text-white py-3 rounded-xl font-black text-xs uppercase tracking-widest hover:bg-gray-50 dark:hover:bg-white/5 transition-all">Print Receipt</button>
               <button onClick={() => setSelectedPayment(null)} className="flex-1 bg-gray-900 dark:bg-blue-600 text-white py-3 rounded-xl font-black text-xs uppercase tracking-widest transition-all">Close Details</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
