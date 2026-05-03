"use client";

import { useState } from "react";
import { 
  TrendingDown, 
  Home, 
  Briefcase, 
  Truck, 
  Zap, 
  PackageMinus,
  Plus,
  Calendar,
  ChevronDown,
  BarChart2
} from "lucide-react";
import { clsx } from "clsx";

type ExpenseCategory = "RENT" | "SALARY" | "TRANSPORT" | "UTILITIES" | "OTHER";

const CATEGORY_CONFIG: Record<ExpenseCategory, { icon: any, label: string, color: string, bg: string }> = {
  RENT: { icon: Home, label: "Rent & Leases", color: "text-indigo-500", bg: "bg-indigo-50 dark:bg-indigo-500/10" },
  SALARY: { icon: Briefcase, label: "Payroll & Wages", color: "text-blue-500", bg: "bg-blue-50 dark:bg-blue-500/10" },
  TRANSPORT: { icon: Truck, label: "Transport & Logistics", color: "text-orange-500", bg: "bg-orange-50 dark:bg-orange-500/10" },
  UTILITIES: { icon: Zap, label: "Electricity & Bills", color: "text-yellow-500", bg: "bg-yellow-50 dark:bg-yellow-500/10" },
  OTHER: { icon: PackageMinus, label: "Miscellaneous", color: "text-slate-500", bg: "bg-slate-50 dark:bg-slate-500/10" }
};

const MOCK_EXPENSES = [
  { id: 'EXP-901', date: new Date().toISOString(), category: 'UTILITIES', amount: 4500, note: 'Electricity Bill - Head Office', recordedBy: 'Admin' },
  { id: 'EXP-902', date: new Date(Date.now() - 86400 * 2000).toISOString(), category: 'TRANSPORT', amount: 1200, note: 'Delivery tempo to Franchise B', recordedBy: 'Admin' },
  { id: 'EXP-903', date: new Date(Date.now() - 86400 * 5000).toISOString(), category: 'RENT', amount: 45000, note: 'Warehouse Rent March', recordedBy: 'Admin' },
  { id: 'EXP-904', date: new Date(Date.now() - 86400 * 10000).toISOString(), category: 'OTHER', amount: 800, note: 'Office stationery supplies', recordedBy: 'Manager' },
] as const;

export default function ExpensesPage() {
  const [form, setForm] = useState({ category: "RENT" as ExpenseCategory, amount: "", note: "" });

  const totalThisMonth = MOCK_EXPENSES.reduce((sum, e) => sum + e.amount, 0);
  
  // Calculate top category
  const grouped = MOCK_EXPENSES.reduce((acc, curr) => {
    acc[curr.category] = (acc[curr.category] || 0) + curr.amount;
    return acc;
  }, {} as Record<string, number>);
  const topCategoryStr = Object.entries(grouped).sort((a,b) => b[1] - a[1])[0]?.[0] as ExpenseCategory | undefined;

  const TopIcon = topCategoryStr ? CATEGORY_CONFIG[topCategoryStr].icon : BarChart2;

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-gray-900 dark:text-white flex items-center gap-2">
            <TrendingDown size={24} className="text-orange-500" />
            Operational Expenses
          </h1>
          <p className="text-sm text-gray-500 dark:text-slate-400 mt-1">Direct money out that is not linked to vendor inventory purchases.</p>
        </div>
      </div>

      {/* Monthly Summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white dark:bg-card border border-gray-100 dark:border-white/5 rounded-[2rem] p-8 shadow-sm flex items-center gap-6">
           <div className="w-16 h-16 rounded-2xl bg-orange-50 dark:bg-orange-500/10 flex items-center justify-center shrink-0">
             <TrendingDown size={32} className="text-orange-500" />
           </div>
           <div>
             <p className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-500 mb-1">Total Expenses This Month</p>
             <h2 className="text-3xl font-black text-gray-900 dark:text-white">₹{totalThisMonth.toLocaleString()}</h2>
           </div>
        </div>
        <div className="bg-white dark:bg-card border border-gray-100 dark:border-white/5 rounded-[2rem] p-8 shadow-sm flex items-center gap-6">
           <div className={clsx("w-16 h-16 rounded-2xl flex items-center justify-center shrink-0", 
              topCategoryStr ? CATEGORY_CONFIG[topCategoryStr].bg : "bg-slate-100 dark:bg-white/5")}>
             <TopIcon size={32} className={topCategoryStr ? CATEGORY_CONFIG[topCategoryStr].color : "text-slate-400"} />
           </div>
           <div>
             <p className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-500 mb-1">Highest Spend Category</p>
             <h2 className="text-2xl font-black text-gray-900 dark:text-white">
                {topCategoryStr ? CATEGORY_CONFIG[topCategoryStr].label : "None"}
             </h2>
           </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* ADD EXPENSE FORM */}
        <div className="lg:col-span-1 border-t-4 border-t-orange-500 bg-white dark:bg-card rounded-[2rem] shadow-sm border border-gray-100 dark:border-white/5 overflow-hidden flex flex-col pt-2">
           <div className="px-6 py-4 border-b border-gray-100 dark:border-white/5 bg-gray-50/50 dark:bg-white/[0.02]">
             <h3 className="text-xs font-black uppercase tracking-widest text-gray-900 dark:text-white flex items-center gap-2">
               <Plus size={14} className="text-orange-500" />
               Record New Expense
             </h3>
           </div>
           
           <div className="p-6 space-y-5 flex-1">
              <div className="space-y-2">
                 <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Expense Category *</label>
                 <div className="relative">
                   <select 
                     value={form.category}
                     onChange={(e) => setForm(f => ({ ...f, category: e.target.value as ExpenseCategory }))}
                     className="w-full appearance-none bg-slate-50 dark:bg-white/5 border-none rounded-xl px-4 py-3.5 text-sm font-bold focus:outline-none focus:ring-4 ring-orange-500/10 dark:text-white transition-all shadow-sm"
                   >
                     {Object.entries(CATEGORY_CONFIG).map(([key, conf]) => (
                       <option key={key} value={key}>{conf.label}</option>
                     ))}
                   </select>
                   <ChevronDown size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                 </div>
              </div>

              <div className="space-y-2">
                 <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Amount (₹) *</label>
                 <input 
                   type="number"
                   value={form.amount}
                   onChange={e => setForm(f => ({ ...f, amount: e.target.value }))}
                   placeholder="e.g. 5000"
                   className="w-full bg-slate-50 dark:bg-white/5 border-none rounded-xl px-4 py-3.5 text-sm font-bold focus:outline-none focus:ring-4 ring-orange-500/10 dark:text-white transition-all shadow-sm placeholder:text-gray-300 dark:placeholder:text-white/10"
                 />
              </div>

              <div className="space-y-2">
                 <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Date</label>
                 <input 
                   type="date"
                   defaultValue={new Date().toISOString().split('T')[0]}
                   className="w-full bg-slate-50 dark:bg-white/5 border-none rounded-xl px-4 py-3.5 text-sm font-bold focus:outline-none focus:ring-4 ring-orange-500/10 dark:text-white transition-all shadow-sm"
                 />
              </div>

              <div className="space-y-2">
                 <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Note / Reference</label>
                 <textarea 
                   value={form.note}
                   onChange={e => setForm(f => ({ ...f, note: e.target.value }))}
                   placeholder="Brief description of this expense..."
                   className="w-full bg-slate-50 dark:bg-white/5 border-none rounded-xl px-4 py-3.5 text-sm font-bold focus:outline-none focus:ring-4 ring-orange-500/10 dark:text-white transition-all shadow-sm min-h-[80px] resize-none"
                 />
              </div>
           </div>

           <div className="p-4 bg-gray-50/50 dark:bg-white/[0.02]">
             <button className="w-full py-3.5 bg-orange-500 hover:bg-orange-400 text-white rounded-xl font-black text-xs uppercase tracking-widest shadow-lg shadow-orange-500/20 transition-all active:scale-95 text-center disabled:opacity-50 disabled:cursor-not-allowed">
                Save Expense Entry
             </button>
           </div>
        </div>

        {/* EXPENSE LEDGER */}
        <div className="lg:col-span-2 bg-white dark:bg-card rounded-[2rem] shadow-sm border border-gray-100 dark:border-white/5 overflow-hidden">
          <div className="px-6 py-5 border-b border-gray-100 dark:border-white/5 flex items-center justify-between">
             <h2 className="text-sm font-black text-gray-900 dark:text-white uppercase tracking-widest">Recent Expenses Logs</h2>
          </div>
          
          <div className="divide-y divide-gray-50 dark:divide-white/5">
             {MOCK_EXPENSES.map(expense => {
               const conf = CATEGORY_CONFIG[expense.category];
               const Icon = conf.icon;
               return (
                 <div key={expense.id} className="p-4 flex items-center gap-4 hover:bg-slate-50 dark:hover:bg-white/[0.02] transition-colors">
                    <div className={clsx("w-12 h-12 rounded-xl flex items-center justify-center shrink-0", conf.bg)}>
                      <Icon className={conf.color} size={20} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-4">
                        <h3 className="text-sm font-bold text-gray-900 dark:text-white truncate">{expense.note}</h3>
                        <span className="text-base font-black text-gray-900 dark:text-white">₹{expense.amount.toLocaleString()}</span>
                      </div>
                      <div className="flex items-center gap-3 mt-1.5 flex-wrap">
                        <span className={clsx("px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-widest", conf.bg, conf.color)}>
                          {conf.label}
                        </span>
                        <span className="flex items-center gap-1 text-[10px] text-gray-400 font-bold uppercase tracking-widest">
                          <Calendar size={10} />
                          {new Date(expense.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                        </span>
                        <span className="text-[10px] text-gray-400 border-l border-gray-200 dark:border-white/10 pl-3">
                          By: {expense.recordedBy}
                        </span>
                      </div>
                    </div>
                 </div>
               )
             })}
          </div>
        </div>
      </div>
    </div>
  );
}
