"use client";

import { useState } from "react";
import { 
  CreditCard, 
  Search, 
  Filter, 
  Calendar, 
  User, 
  Building2, 
  CheckCircle2,
  Clock,
  AlertCircle,
  Plus,
  ArrowUpRight,
  MoreVertical,
  ChevronLeft,
  ChevronRight,
  Banknote,
  Stamp
} from "lucide-react";
import { clsx } from "clsx";

// Sample data for demonstration since backend is pending
const SAMPLE_CHEQUES = [
  {
    id: "1",
    chequeNumber: "CHQ-889021",
    bankName: "HDFC Bank",
    payeeName: "Global Supplies Inc",
    amount: 45000,
    issueDate: "2024-03-10",
    dueDate: "2024-04-10",
    status: "PENDING",
    type: "PAYABLE",
    franchise: "HQ Central"
  },
  {
    id: "2",
    chequeNumber: "CHQ-112233",
    bankName: "ICICI Bank",
    payeeName: "Rahul Kumar",
    amount: 12500,
    issueDate: "2024-03-12",
    dueDate: "2024-03-15",
    status: "CLEARED",
    type: "RECEIVABLE",
    franchise: "Downtown Branch"
  },
  {
    id: "3",
    chequeNumber: "CHQ-445566",
    bankName: "SBI",
    payeeName: "Quality Packaging Co",
    amount: 89000,
    issueDate: "2024-03-05",
    dueDate: "2024-03-08",
    status: "BOUNCED",
    type: "PAYABLE",
    franchise: "HQ Central"
  }
];

export default function ChequeRegistryPage() {
  const [cheques, setCheques] = useState(SAMPLE_CHEQUES);
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState<"ALL" | "PENDING" | "CLEARED" | "BOUNCED">("ALL");

  const getStatusStyle = (status: string) => {
    switch(status) {
      case "CLEARED": return "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400";
      case "BOUNCED": return "bg-rose-100 text-rose-700 dark:bg-rose-500/10 dark:text-rose-400";
      case "PENDING": return "bg-amber-100 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400";
      default: return "bg-slate-100 text-slate-700 dark:bg-slate-500/10 dark:text-slate-400";
    }
  };

  const filteredCheques = cheques.filter(c => {
    const matchesSearch = c.chequeNumber.includes(search) || c.payeeName.toLowerCase().includes(search.toLowerCase());
    const matchesTab = activeTab === "ALL" || c.status === activeTab;
    return matchesSearch && matchesTab;
  });

  return (
    <div className="space-y-6 max-w-[1400px] mx-auto p-4 md:p-6 animate-in fade-in duration-700">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900 dark:text-white flex items-center gap-3">
            <Stamp className="text-orange-500" size={32} />
            Cheque Registry
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">
            Manage Post-Dated Cheques (PDC), clearance cycles and bouncing records
          </p>
        </div>
        <button className="flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white px-5 py-3 rounded-2xl font-black text-xs uppercase tracking-widest transition-all shadow-lg shadow-orange-500/20 active:scale-95">
          <Plus size={18} strokeWidth={3} />
          Record New Cheque
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { label: "Total Volume", value: "₹2,45,000", icon: Banknote, color: "text-slate-600" },
          { label: "Pending Clearance", value: "₹45,000", icon: Clock, color: "text-amber-500" },
          { label: "Cleared Today", value: "₹1,12,000", icon: CheckCircle2, color: "text-emerald-500" },
          { label: "Bounced (Risk)", value: "₹89,000", icon: AlertCircle, color: "text-rose-500" },
        ].map((stat, i) => (
          <div key={i} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <div className={`p-2 rounded-xl bg-slate-50 dark:bg-slate-800 ${stat.color}`}>
                <stat.icon size={20} />
              </div>
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Live</span>
            </div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{stat.label}</p>
            <p className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Filters & Tabs */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-2xl w-fit">
          {["ALL", "PENDING", "CLEARED", "BOUNCED"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab as any)}
              className={clsx(
                "px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all",
                activeTab === tab 
                  ? "bg-white dark:bg-slate-900 text-orange-500 shadow-sm" 
                  : "text-slate-500 hover:text-slate-900 dark:hover:text-white"
              )}
            >
              {tab}
            </button>
          ))}
        </div>
        <div className="relative group w-full md:w-80">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-orange-500 transition-colors" size={18} />
          <input
            type="text"
            placeholder="Search cheque # or payee..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-11 pr-4 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl outline-none focus:ring-4 focus:ring-orange-500/10 focus:border-orange-500 transition-all font-medium text-sm"
          />
        </div>
      </div>

      {/* Cheque Table */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[2.5rem] overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800">
                <th className="px-8 py-5 text-[11px] font-black uppercase tracking-widest text-slate-500">Cheque Info</th>
                <th className="px-8 py-5 text-[11px] font-black uppercase tracking-widest text-slate-500">Payee / Entity</th>
                <th className="px-8 py-5 text-[11px] font-black uppercase tracking-widest text-slate-500">Amount</th>
                <th className="px-8 py-5 text-[11px] font-black uppercase tracking-widest text-slate-500">Critical Dates</th>
                <th className="px-8 py-5 text-[11px] font-black uppercase tracking-widest text-slate-500">Status</th>
                <th className="px-8 py-5 text-[11px] font-black uppercase tracking-widest text-slate-500 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredCheques.map((cheque) => (
                <tr key={cheque.id} className="hover:bg-slate-50/50 dark:hover:bg-white/5 transition-colors group">
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400 group-hover:bg-orange-100 group-hover:text-orange-500 transition-all">
                        <Stamp size={24} />
                      </div>
                      <div>
                        <p className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-tight">{cheque.chequeNumber}</p>
                        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{cheque.bankName}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <div className="space-y-1">
                      <p className="text-sm font-bold text-slate-700 dark:text-slate-300">{cheque.payeeName}</p>
                      <div className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                        <Building2 size={12} />
                        {cheque.franchise}
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <p className="text-lg font-black text-slate-900 dark:text-white">₹{cheque.amount.toLocaleString()}</p>
                    <span className={`text-[9px] font-black uppercase tracking-widest ${cheque.type === 'PAYABLE' ? 'text-rose-500' : 'text-emerald-500'}`}>
                      {cheque.type}
                    </span>
                  </td>
                  <td className="px-8 py-6">
                    <div className="space-y-1.5">
                      <div className="flex items-center gap-2 text-[10px] font-bold text-slate-500">
                        <Calendar size={12} className="text-slate-300" />
                        Issued: {new Date(cheque.issueDate).toLocaleDateString()}
                      </div>
                      <div className="flex items-center gap-2 text-[10px] font-black text-orange-600 dark:text-orange-400 uppercase tracking-widest">
                        <Clock size={12} />
                        Due: {new Date(cheque.dueDate).toLocaleDateString()}
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <span className={clsx(
                      "px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest inline-flex items-center gap-2",
                      getStatusStyle(cheque.status)
                    )}>
                      <div className={clsx("w-1.5 h-1.5 rounded-full animate-pulse", 
                        cheque.status === 'CLEARED' ? 'bg-emerald-500' : 
                        cheque.status === 'BOUNCED' ? 'bg-rose-500' : 'bg-amber-500'
                      )} />
                      {cheque.status}
                    </span>
                  </td>
                  <td className="px-8 py-6 text-right">
                    <div className="flex justify-end gap-2">
                      <button className="p-2.5 hover:bg-slate-100 dark:hover:bg-white/10 rounded-xl text-slate-400 hover:text-orange-500 transition-all">
                        <ArrowUpRight size={18} />
                      </button>
                      <button className="p-2.5 hover:bg-slate-100 dark:hover:bg-white/10 rounded-xl text-slate-400 hover:text-slate-900 transition-all">
                        <MoreVertical size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
