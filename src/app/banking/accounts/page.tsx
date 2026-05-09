'use client';

import React, { useState, useEffect } from 'react';
import { accountsApi } from '@/lib/api';
import { 
  Plus, 
  Trash2, 
  Wallet, 
  Building2, 
  Smartphone, 
  ArrowUpRight, 
  ChevronRight,
  Info
} from 'lucide-react';
import { useToast } from '@/context/ToastContext';
import clsx from 'clsx';

export default function AccountsPage() {
  const { showToast } = useToast();
  const [accounts, setAccounts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    type: 'CASH',
    balance: ''
  });

  const fetchAccounts = async () => {
    setLoading(true);
    try {
      const res = await accountsApi.getAll();
      setAccounts(res.data || []);
    } catch (e) {
      showToast("Failed to load accounts", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAccounts();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name) return showToast("Account name is required", "error");
    
    try {
      await accountsApi.create({
        name: formData.name,
        type: formData.type as any,
        balance: Number(formData.balance) || 0
      });
      showToast("Financial account active", "success");
      setShowAddForm(false);
      setFormData({ name: '', type: 'CASH', balance: '' });
      fetchAccounts();
    } catch (e: any) {
      showToast(e.response?.data?.error || "Failed to create account", "error");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure? This cannot be undone if the account has history.")) return;
    try {
      await accountsApi.delete(id);
      showToast("Account decommissioned", "success");
      fetchAccounts();
    } catch (e: any) {
      showToast(e.response?.data?.error || "Cannot delete active account", "error");
    }
  };

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-8 animate-in fade-in duration-700">
      {/* Header Section */}
      <div className="flex items-end justify-between border-b border-slate-200 dark:border-white/5 pb-8">
        <div>
          <h1 className="text-4xl font-black text-slate-900 dark:text-white uppercase tracking-tighter">Business Accounts</h1>
          <p className="text-slate-500 font-medium mt-1 italic">Internal Financial Tracking System</p>
        </div>
        <button 
          onClick={() => setShowAddForm(true)}
          className="px-6 py-3 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-2xl font-black uppercase text-[10px] tracking-widest flex items-center gap-2 hover:scale-105 active:scale-95 transition-all shadow-xl shadow-slate-900/10 dark:shadow-white/10"
        >
          <Plus size={16} /> Create Financial Account
        </button>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
         <div className="p-6 bg-emerald-500 text-white rounded-[2rem] shadow-xl shadow-emerald-500/20 relative overflow-hidden group">
            <div className="relative z-10">
               <p className="text-[10px] font-black uppercase tracking-widest opacity-80">Total Liquidity</p>
               <h3 className="text-3xl font-black mt-1">₹{accounts.reduce((acc, curr) => acc + curr.balance, 0).toLocaleString()}</h3>
               <div className="flex items-center gap-2 mt-4 text-[10px] font-bold bg-white/20 w-fit px-3 py-1 rounded-full backdrop-blur-md">
                  <ArrowUpRight size={12} /> Live synchronized
               </div>
            </div>
            <div className="absolute -right-4 -bottom-4 opacity-10 group-hover:scale-110 transition-transform duration-500">
               <Wallet size={120} />
            </div>
         </div>

         <div className="p-6 bg-slate-900 dark:bg-slate-800 text-white rounded-[2rem] shadow-xl relative overflow-hidden group">
            <div className="relative z-10">
               <p className="text-[10px] font-black uppercase tracking-widest opacity-60">Bank Holdings</p>
               <h3 className="text-3xl font-black mt-1">₹{accounts.filter(a => a.type === 'BANK').reduce((acc, curr) => acc + curr.balance, 0).toLocaleString()}</h3>
               <div className="flex items-center gap-2 mt-4 text-[10px] font-bold bg-white/10 w-fit px-3 py-1 rounded-full">
                  <Building2 size={12} /> {accounts.filter(a => a.type === 'BANK').length} Accounts
               </div>
            </div>
         </div>

         <div className="p-6 bg-white dark:bg-slate-800 border border-slate-200 dark:border-white/5 rounded-[2rem] shadow-sm relative overflow-hidden group">
            <div className="relative z-10">
               <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Cash & Digital</p>
               <h3 className="text-3xl font-black mt-1 text-slate-900 dark:text-white">₹{accounts.filter(a => a.type !== 'BANK').reduce((acc, curr) => acc + curr.balance, 0).toLocaleString()}</h3>
               <div className="flex items-center gap-2 mt-4 text-[10px] font-bold text-slate-500 bg-slate-100 dark:bg-white/5 w-fit px-3 py-1 rounded-full">
                  <Smartphone size={12} /> {accounts.filter(a => a.type !== 'BANK').length} Wallets
               </div>
            </div>
         </div>
      </div>

      {/* Accounts List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {accounts.map(acc => (
          <div key={acc.id} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/5 rounded-[2.5rem] p-8 space-y-6 hover:shadow-xl hover:-translate-y-1 transition-all group">
            <div className="flex items-start justify-between">
              <div className={clsx(
                "p-4 rounded-2xl shadow-inner",
                acc.type === 'CASH' ? "bg-orange-50 text-orange-600 dark:bg-orange-500/10 dark:text-orange-500" :
                acc.type === 'BANK' ? "bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-500" :
                "bg-indigo-50 text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-500"
              )}>
                {acc.type === 'CASH' ? <Wallet size={24} /> : 
                 acc.type === 'BANK' ? <Building2 size={24} /> : 
                 <Smartphone size={24} />}
              </div>
              <div className="flex flex-col items-end gap-2">
                <span className={clsx(
                  "px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest border",
                  acc.status === 'ACTIVE' ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20" : "bg-rose-500/10 text-rose-600 border-rose-500/20"
                )}>
                  {acc.status}
                </span>
                <button 
                  onClick={() => handleDelete(acc.id)}
                  className="p-2 text-slate-300 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/10 rounded-xl transition-all"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>

            <div>
              <div className="flex items-center gap-2">
                <span className="text-[9px] font-bold text-slate-400 bg-slate-100 dark:bg-white/5 px-2 py-0.5 rounded-md">{acc.accountCode}</span>
              </div>
              <h3 className="text-xl font-black text-slate-900 dark:text-white tracking-tight leading-none uppercase mt-2">{acc.name}</h3>
              <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mt-2">
                {acc.type === 'BANK' ? 'BANK ACCOUNT' : acc.type === 'CASH' ? 'CASH DRAWER' : 'DIGITAL WALLET'}
              </p>
            </div>

            {/* Last Transaction Preview */}
            <div className="p-4 bg-slate-50 dark:bg-white/5 rounded-2xl space-y-1.5">
               <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Last Activity</p>
               {acc.lastTransaction ? (
                 <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-slate-600 dark:text-slate-300 truncate max-w-[120px]">{acc.lastTransaction.note}</span>
                    <span className={clsx(
                      "text-[10px] font-black",
                      acc.lastTransaction.type === 'INFLOW' ? "text-emerald-500" : "text-rose-500"
                    )}>
                      {acc.lastTransaction.type === 'INFLOW' ? '+' : '-'}₹{acc.lastTransaction.amount.toLocaleString()}
                    </span>
                 </div>
               ) : (
                 <p className="text-[10px] font-medium text-slate-400 italic">No recent activity</p>
               )}
            </div>

            <div className="pt-6 border-t border-slate-100 dark:border-white/5 flex items-end justify-between">
              <div>
                <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">System Balance</p>
                <p className="text-2xl font-black text-slate-900 dark:text-white">₹{acc.balance.toLocaleString()}</p>
              </div>
              <div className="w-10 h-10 bg-slate-50 dark:bg-white/5 rounded-full flex items-center justify-center text-slate-400 group-hover:text-slate-900 dark:group-hover:text-white transition-colors">
                <ChevronRight size={20} />
              </div>
            </div>
          </div>
        ))}

        {accounts.length === 0 && !loading && (
          <div className="col-span-full py-20 text-center space-y-4">
             <div className="w-20 h-20 bg-slate-100 dark:bg-white/5 rounded-[2rem] flex items-center justify-center mx-auto text-slate-300">
                <Info size={40} />
             </div>
             <p className="text-slate-500 font-bold uppercase text-[10px] tracking-widest">No financial accounts found. Create your first one to begin operations.</p>
          </div>
        )}
      </div>

      {/* Add Account Modal */}
      {showAddForm && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-4">
          <div className="bg-white dark:bg-slate-900 rounded-[3rem] shadow-2xl w-full max-w-lg border border-slate-200 dark:border-white/10 p-10 animate-in zoom-in-95 duration-200">
             <div className="flex justify-between items-start mb-10">
                <div>
                   <h2 className="text-3xl font-black text-slate-900 dark:text-white uppercase tracking-tighter">Create Financial Account</h2>
                   <p className="text-slate-500 font-medium">Define a new money container for your business.</p>
                </div>
                <button onClick={() => setShowAddForm(false)} className="text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors">✕</button>
             </div>

             <form onSubmit={handleCreate} className="space-y-8">
                <div className="space-y-2">
                   <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4">Account Name</label>
                   <input 
                     value={formData.name}
                     onChange={e => setFormData({...formData, name: e.target.value})}
                     placeholder="e.g., Main Operating Bank, Office Petty Cash"
                     className="w-full px-8 py-5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-white/5 rounded-[1.5rem] font-bold outline-none focus:ring-4 ring-orange-500/10 transition-all"
                   />
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                     <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4">Account Type</label>
                     <select 
                       value={formData.type}
                       onChange={e => setFormData({...formData, type: e.target.value})}
                       className="w-full px-8 py-5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-white/5 rounded-[1.5rem] font-bold outline-none appearance-none"
                     >
                        <option value="BANK">Bank Account</option>
                        <option value="CASH">Cash Drawer</option>
                        <option value="UPI">Digital Wallet (UPI)</option>
                     </select>
                  </div>
                  <div className="space-y-2">
                     <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4">Opening Balance</label>
                     <input 
                       type="number"
                       value={formData.balance}
                       onChange={e => setFormData({...formData, balance: e.target.value})}
                       placeholder="0.00"
                       className="w-full px-8 py-5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-white/5 rounded-[1.5rem] font-bold outline-none focus:ring-4 ring-orange-500/10 transition-all"
                     />
                  </div>
                </div>

                <div className="pt-4 flex gap-4">
                  <button 
                    type="button"
                    onClick={() => setShowAddForm(false)}
                    className="flex-1 py-5 rounded-[1.5rem] font-black uppercase text-[10px] tracking-widest text-slate-500 hover:bg-slate-100 dark:hover:bg-white/5 transition-all"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit"
                    className="flex-1 py-5 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-[1.5rem] font-black uppercase text-[10px] tracking-widest hover:scale-[1.02] active:scale-95 transition-all shadow-xl shadow-slate-900/10 dark:shadow-white/10"
                  >
                    Create Account
                  </button>
                </div>
             </form>
          </div>
        </div>
      )}
    </div>
  );
}
