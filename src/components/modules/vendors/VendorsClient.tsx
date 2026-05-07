"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import {
  Store, Plus, Search,
  Star, RefreshCw, ShoppingCart, Edit2, Trash2,
  ChevronRight, Package, AlertCircle, CreditCard, History,
  TrendingUp, TrendingDown, Wallet,
  Info, ArrowDownLeft, ArrowUpRight, CheckCircle2, XCircle,
  Clock, FileText, Download, Printer,
  Phone, Mail, MapPin, Tag, Calendar, User, ExternalLink,
  Filter, LayoutGrid, List, MoreVertical,
  ChevronDown, Settings, ShieldCheck, Zap, ArrowRight, ArrowRightLeft
} from "lucide-react";
import { clsx } from "clsx";
import { vendorsApi, accountsApi } from "@/lib/api";
import { useToast } from "@/context/ToastContext";
import { useAuth } from "@/context/AuthContext";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";

const EMPTY_FORM = {
  name: "",
  contact: "",
  email: "",
  address: "",
  remark: "",
  gstNumber: "",
  category: "",
  paymentTerms: "IMMEDIATE" as "IMMEDIATE" | "NET_7" | "NET_30" | "ADVANCE",
  status: "ACTIVE" as "ACTIVE" | "BLOCKED" | "BLACKLISTED"
};

const VENDOR_STATUS = [
  { value: "ACTIVE", label: "Active", color: "text-emerald-600 dark:text-emerald-400", bg: "bg-emerald-50 dark:bg-emerald-400/10", border: "border-emerald-200 dark:border-emerald-400/20" },
  { value: "BLOCKED", label: "Blocked", color: "text-amber-600 dark:text-amber-400", bg: "bg-amber-50 dark:bg-amber-400/10", border: "border-amber-200 dark:border-amber-400/20" },
  { value: "BLACKLISTED", label: "Blacklisted", color: "text-rose-600 dark:text-rose-400", bg: "bg-rose-50 dark:bg-rose-400/10", border: "border-rose-200 dark:border-rose-400/20" },
];

export default function VendorsClient() {
  const { user } = useAuth();
  const { showToast } = useToast();
  
  // -- State --
  const [vendors, setVendors] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState<'ALL' | 'OWED' | 'ADVANCE'>('ALL');
  const [selectedVendorId, setSelectedVendorId] = useState<string | null>(null);
  
  const [ledger, setLedger] = useState<any[]>([]);
  const [ledgerLoading, setLedgerLoading] = useState(false);
  const [aging, setAging] = useState<any>(null);
  const [summary, setSummary] = useState<any>(null);

  // -- Modals --
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentForm, setPaymentForm] = useState({ amount: "", note: "", type: "PAYMENT" as "PAYMENT" | "ADVANCE", accountId: "" });
  const [accounts, setAccounts] = useState<any[]>([]);

  // -- Data Fetching --
  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [vRes, sRes, aRes] = await Promise.allSettled([
        vendorsApi.getAll(),
        vendorsApi.getSummary(),
        accountsApi.getAll()
      ]);

      if (vRes.status === 'fulfilled') {
        const data = vRes.value.data || [];
        setVendors(data);
        if (!selectedVendorId && data.length > 0) setSelectedVendorId(data[0].id);
      }
      if (sRes.status === 'fulfilled') setSummary(sRes.value.data);
      if (aRes.status === 'fulfilled') {
        const accs = aRes.value.data || [];
        setAccounts(accs);
        if (accs.length > 0) {
          setPaymentForm(prev => ({ ...prev, accountId: prev.accountId || accs[0].id }));
        }
      } else {
        console.error('Accounts Fetch Failed:', aRes.reason);
      }
    } catch (e) {
      showToast("Sync Error: Financial nodes unreachable", "error");
    } finally {
      setLoading(false);
    }
  }, [selectedVendorId, showToast]);

  const fetchLedger = useCallback(async (vendorId: string) => {
    setLedgerLoading(true);
    try {
      const lRes = await vendorsApi.getLedger(vendorId);
      setLedger(lRes.data || []);
      
      vendorsApi.getAging(vendorId)
        .then(res => setAging(res.data))
        .catch(() => setAging({ current: 0, thirtySixty: 0, sixtyNinety: 0, overNinety: 0 }));
    } catch (e) {
      showToast("Ledger Error: Connection timeout", "error");
    } finally {
      setLedgerLoading(false);
    }
  }, [showToast]);

  useEffect(() => { fetchData(); }, [fetchData]);
  useEffect(() => { if (selectedVendorId) fetchLedger(selectedVendorId); }, [selectedVendorId, fetchLedger]);

  // -- Filtered Lists --
  const filteredVendors = useMemo(() => {
    return vendors.filter(v => {
      const matchSearch = v.name?.toLowerCase().includes(search.toLowerCase()) || v.vendorCode?.toLowerCase().includes(search.toLowerCase());
      if (filterType === 'OWED') return matchSearch && (v.due > 0);
      if (filterType === 'ADVANCE') return matchSearch && (v.advance > 0);
      return matchSearch;
    });
  }, [vendors, search, filterType]);

  const selectedVendor = useMemo(() => vendors.find(v => v.id === selectedVendorId) || null, [vendors, selectedVendorId]);

  // -- Actions --
  const handleSave = async () => {
    setSaving(true);
    try {
      if (editing) await vendorsApi.update(editing.id, form);
      else await vendorsApi.create(form);
      showToast(editing ? "Vendor identity synchronized" : "New vendor registered", "success");
      setShowForm(false);
      fetchData();
    } catch (e: any) {
      const msg = e.response?.data?.error || e.message || "Transaction Aborted";
      showToast(msg, "error");
    } finally {
      setSaving(false);
    }
  };

  const handlePayment = async () => {
    if (!selectedVendorId || !paymentForm.amount || !paymentForm.accountId) return;
    setSaving(true);
    try {
      await vendorsApi.recordPayment(selectedVendorId, {
        amount: Number(paymentForm.amount),
        type: paymentForm.type,
        note: paymentForm.note || `${paymentForm.type} Settlement`,
        accountId: paymentForm.accountId,
        paymentMode: accounts.find(a => a.id === paymentForm.accountId)?.type || "CASH"
      });
      showToast("Financial settlement recorded", "success");
      setShowPaymentModal(false);
      fetchData();
      fetchLedger(selectedVendorId);
    } catch (e: any) {
      showToast(e.response?.data?.error || "Settlement Failed", "error");
    } finally { setSaving(false); }
  };


  // -- UI Helpers --
  const amountNum = Number(paymentForm.amount) || 0;
  const selectedAccount = accounts.find(a => a.id === paymentForm.accountId);
  const accountBalance = selectedAccount?.balance || 0;

  return (
    <div className="flex h-[calc(100vh-100px)] bg-slate-50 dark:bg-[#0b0c14] -m-4 overflow-hidden selection:bg-orange-500/30 selection:text-orange-500 transition-colors">
      
      {/* --- Sidebar: Compact Directory --- */}
      <div className="w-[320px] flex flex-col bg-white dark:bg-slate-900/40 border-r border-slate-200 dark:border-white/5 relative overflow-hidden shrink-0">
        <div className="p-4 space-y-4 relative z-10 border-b border-slate-100 dark:border-white/5">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-black text-slate-900 dark:text-white uppercase tracking-tighter flex items-center gap-2">
                <Store className="text-orange-500 w-5 h-5" /> Directory
              </h2>
            </div>
            <button 
              onClick={() => { setEditing(null); setForm(EMPTY_FORM); setShowForm(true); }}
              className="p-2 bg-orange-500 hover:bg-orange-600 text-white rounded-xl transition-all shadow-lg shadow-orange-500/20 active:scale-90"
            >
              <Plus size={18} />
            </button>
          </div>

          <div className="flex p-1 bg-slate-100 dark:bg-white/5 rounded-xl border border-slate-200 dark:border-white/5">
            {(['ALL', 'OWED', 'ADVANCE'] as const).map((t) => (
              <button 
                key={t}
                onClick={() => setFilterType(t)}
                className={clsx(
                  "flex-1 py-1.5 text-[8px] font-black uppercase tracking-widest rounded-lg transition-all",
                  filterType === t ? "bg-white dark:bg-slate-800 text-orange-600 dark:text-white shadow-sm" : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
                )}
              >
                {t}
              </button>
            ))}
          </div>

          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search..."
              className="w-full pl-9 pr-3 py-2.5 bg-slate-100 dark:bg-white/5 border border-transparent dark:border-white/5 rounded-xl text-xs font-bold text-slate-900 dark:text-white placeholder:text-slate-400 focus:ring-2 ring-orange-500/20 transition-all outline-none"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-2 space-y-1 custom-scrollbar">
          {loading ? (
             Array(8).fill(0).map((_, i) => <div key={i} className="h-16 bg-slate-100 dark:bg-white/5 rounded-2xl animate-pulse" />)
          ) : filteredVendors.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 text-slate-400">
               <ShieldCheck size={32} className="opacity-10 mb-2" />
               <p className="text-[9px] font-black uppercase tracking-widest">Empty directory</p>
            </div>
          ) : (
            filteredVendors.map(v => {
              const isActive = selectedVendorId === v.id;
              const status = VENDOR_STATUS.find(s => s.value === v.status) || VENDOR_STATUS[0];
              const bal = v.balance || 0;
              return (
                <button
                  key={v.id}
                  onClick={() => setSelectedVendorId(v.id)}
                  className={clsx(
                    "w-full flex items-center gap-3 p-3 rounded-2xl transition-all group relative overflow-hidden",
                    isActive 
                      ? "bg-white dark:bg-slate-800 shadow-md border border-slate-200 dark:border-white/10" 
                      : "hover:bg-slate-100 dark:hover:bg-white/5 border border-transparent"
                  )}
                >
                  {isActive && <div className="absolute left-0 top-2 bottom-2 w-1 bg-orange-500 rounded-full" />}
                  
                  <div className={clsx(
                    "w-9 h-9 rounded-xl flex items-center justify-center shrink-0 transition-all",
                    isActive ? "bg-orange-500 text-white shadow-orange-500/20" : "bg-slate-100 dark:bg-white/5 text-slate-400"
                  )}>
                    <Store size={18} />
                  </div>

                  <div className="flex-1 text-left min-w-0">
                    <div className="flex items-center justify-between gap-2">
                       <h3 className={clsx("font-black text-[11px] truncate", isActive ? "text-slate-900 dark:text-white" : "text-slate-600 dark:text-slate-400")}>
                          {v.name}
                       </h3>
                       <div className={clsx("w-1.5 h-1.5 rounded-full shrink-0", status.color.replace('text', 'bg'))} />
                    </div>
                    <div className="flex items-center justify-between mt-1">
                       <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">{v.vendorCode || 'NEW'}</span>
                       <span className={clsx(
                         "text-[10px] font-black tracking-tighter",
                         bal > 0 ? "text-emerald-500" : bal < 0 ? "text-rose-500" : "text-slate-400"
                       )}>
                         {bal === 0 ? "Settled" : `₹${Math.abs(Math.round(bal)).toLocaleString()}`}
                       </span>
                    </div>
                  </div>
                </button>
              );
            })
          )}
        </div>
      </div>

      {/* --- Main Dashboard: Compressed Layout --- */}
      <div className="flex-1 flex flex-col relative overflow-hidden bg-white dark:bg-[#0b0c14]">
        {selectedVendor ? (
          <>
            {/* 1. Dashboard Header */}
            <div className="px-6 py-4 border-b border-slate-200 dark:border-white/5 relative z-10 flex items-center justify-between bg-white dark:bg-transparent">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-orange-500 text-white flex items-center justify-center shadow-lg shadow-orange-500/20">
                  <Store size={24} />
                </div>
                <div>
                  <div className="flex items-center gap-3">
                    <h1 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tighter leading-none">
                      {selectedVendor.name}
                    </h1>
                    <span className={clsx(
                      "px-2 py-0.5 rounded-lg text-[8px] font-black uppercase tracking-widest border",
                      VENDOR_STATUS.find(s => s.value === selectedVendor.status)?.color,
                      VENDOR_STATUS.find(s => s.value === selectedVendor.status)?.bg,
                      VENDOR_STATUS.find(s => s.value === selectedVendor.status)?.border
                    )}>
                      {selectedVendor.status}
                    </span>
                  </div>
                  <div className="flex items-center gap-4 mt-1 text-slate-500 font-bold text-[10px] uppercase tracking-widest">
                     <span className="flex items-center gap-1.5"><Phone size={10} className="text-orange-500" /> {selectedVendor.contact}</span>
                     <span className="flex items-center gap-1.5"><Mail size={10} className="text-blue-500" /> {selectedVendor.email || "N/A"}</span>
                     <span className="flex items-center gap-1.5 text-slate-400">ID: {selectedVendor.vendorCode || '-'}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                 <button 
                  onClick={() => { setEditing(selectedVendor); setForm({ ...selectedVendor }); setShowForm(true); }}
                  className="px-4 py-2 bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 text-slate-700 dark:text-white rounded-xl text-[9px] font-black uppercase tracking-widest border border-slate-200 dark:border-white/10 transition-all"
                 >
                   Edit Profile
                 </button>
                 <button 
                  onClick={() => { setPaymentForm({ amount: "", note: "", type: "PAYMENT", accountId: accounts[0]?.id || "" }); setShowPaymentModal(true); }}
                  className="px-6 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-xl text-[9px] font-black uppercase tracking-widest shadow-lg shadow-orange-500/20 transition-all active:scale-95"
                 >
                   Record Transaction
                 </button>
              </div>
            </div>

            {/* 2. Compressed Metric Grid */}
            <div className="grid grid-cols-4 gap-4 p-4 relative z-10">
               {/* Card: Outstanding */}
               <div className={clsx(
                  "p-4 rounded-2xl border transition-all relative overflow-hidden bg-white dark:bg-slate-900/40",
                  selectedVendor.due > 0 ? "border-rose-200 dark:border-rose-500/20" : "border-slate-100 dark:border-white/5"
               )}>
                  <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-1.5">
                     <AlertCircle size={10} className={selectedVendor.due > 0 ? "text-rose-500" : "text-slate-400"} /> Total Payable
                  </p>
                  <h3 className={clsx("text-2xl font-black tracking-tighter", selectedVendor.due > 0 ? "text-rose-600 dark:text-rose-400" : "text-slate-900 dark:text-white")}>
                    ₹{Math.round(selectedVendor.due || 0).toLocaleString()}
                  </h3>
               </div>

               {/* Card: Paid */}
               <div className="p-4 bg-white dark:bg-slate-900/40 border border-slate-100 dark:border-white/5 rounded-2xl">
                  <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-1.5">
                     <CheckCircle2 size={10} className="text-emerald-500" /> Total Settled
                  </p>
                  <h3 className="text-2xl font-black text-slate-900 dark:text-white tracking-tighter">
                    ₹{Math.round(selectedVendor.totalPaid || 0).toLocaleString()}
                  </h3>
               </div>

               {/* Card: Advance */}
               <div className="p-4 bg-white dark:bg-slate-900/40 border border-slate-100 dark:border-white/5 rounded-2xl">
                  <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-1.5">
                     <Wallet size={10} className="text-indigo-500" /> Prepaid Balance
                  </p>
                  <h3 className="text-2xl font-black text-indigo-600 dark:text-indigo-400 tracking-tighter">
                    ₹{Math.round(selectedVendor.advance || 0).toLocaleString()}
                  </h3>
               </div>

               {/* Card: Aging */}
               <div className="p-4 bg-white dark:bg-slate-900/40 border border-slate-100 dark:border-white/5 rounded-2xl flex flex-col justify-center">
                  <div className="h-2.5 bg-slate-100 dark:bg-white/5 rounded-full overflow-hidden flex mb-2">
                    {aging ? (
                      <>
                        <div style={{ width: `${(aging.current / (selectedVendor.due || 1)) * 100}%` }} className="bg-emerald-500 h-full" />
                        <div style={{ width: `${(aging.thirtySixty / (selectedVendor.due || 1)) * 100}%` }} className="bg-amber-500 h-full" />
                        <div style={{ width: `${(aging.sixtyNinety / (selectedVendor.due || 1)) * 100}%` }} className="bg-orange-500 h-full" />
                        <div style={{ width: `${(aging.overNinety / (selectedVendor.due || 1)) * 100}%` }} className="bg-rose-500 h-full" />
                      </>
                    ) : <div className="w-full bg-slate-200 dark:bg-white/10 animate-pulse" />}
                  </div>
                  <div className="flex justify-between items-center text-[7px] font-black uppercase text-slate-400">
                    <span>Due Aging History</span>
                    <span className="flex gap-1.5">
                       <span className="text-emerald-500">0-30D</span>
                       <span className="text-rose-500">90D+</span>
                    </span>
                  </div>
               </div>
            </div>

            {/* 3. Compact Audit Ledger Table */}
            <div className="flex-1 flex flex-col overflow-hidden px-4 relative z-10 min-h-0">
               <div className="flex items-center justify-between mb-2 relative">
                  <h4 className="text-[10px] font-black text-slate-900 dark:text-white uppercase tracking-widest flex items-center gap-2">
                     <History size={14} className="text-orange-500" /> Financial Audit Ledger
                     {ledgerLoading && <RefreshCw size={10} className="animate-spin text-orange-500" />}
                  </h4>
                  <button className="text-[8px] font-black uppercase text-slate-500 hover:text-orange-500 flex items-center gap-1">
                    <Download size={12} /> Export CSV
                  </button>
               </div>

               <div className={clsx(
                 "flex-1 overflow-y-auto custom-scrollbar border border-slate-200 dark:border-white/5 rounded-xl bg-white dark:bg-slate-900/20 transition-opacity duration-300",
                 ledgerLoading ? "opacity-50" : "opacity-100"
               )}>
                  {ledger.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full py-10 opacity-40">
                       <FileText size={32} className="mb-2" />
                       <p className="text-[10px] font-black uppercase tracking-widest">No verified transactions</p>
                    </div>
                  ) : (
                    <table className="w-full text-left">
                       <thead className="bg-slate-50 dark:bg-slate-800 sticky top-0 z-20">
                          <tr className="text-[8px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest border-b border-slate-200 dark:border-white/5">
                             <th className="py-3 pl-4">Timestamp</th>
                             <th className="py-3">Reference / Doc</th>
                             <th className="py-3">Module</th>
                             <th className="py-3 text-right">Debit</th>
                             <th className="py-3 text-right">Credit</th>
                             <th className="py-3 text-right pr-4">Balance</th>
                          </tr>
                       </thead>
                       <tbody className="divide-y divide-slate-100 dark:divide-white/5">
                          {ledger.map(e => {
                            const isDebit = e.type === 'DEBIT';
                            const balance = e.runningBalance || e.balanceAfterTransaction || 0;
                            return (
                              <tr key={e.id} className="hover:bg-slate-50 dark:hover:bg-white/[0.03] transition-colors">
                                 <td className="py-3 pl-4">
                                    <div className="flex flex-col">
                                       <span className="text-[10px] font-bold text-slate-700 dark:text-slate-300">{new Date(e.createdAt).toLocaleDateString()}</span>
                                       <span className="text-[7px] text-slate-400">{new Date(e.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                    </div>
                                 </td>
                                 <td className="py-3">
                                    <div className="flex flex-col">
                                       <span className="text-[9px] font-black text-orange-600 dark:text-orange-400 uppercase leading-none">{e.referenceType}</span>
                                       <span className="text-[9px] text-slate-500 truncate max-w-[150px]">{e.note || "-"}</span>
                                    </div>
                                 </td>
                                 <td className="py-3">
                                    <span className="text-[8px] font-black text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-white/5 px-1.5 py-0.5 rounded border border-slate-200 dark:border-white/10 uppercase">
                                       {e.sourceModule}
                                    </span>
                                 </td>
                                 <td className="py-3 text-right">
                                    <span className={clsx("text-xs font-black", isDebit ? "text-rose-600" : "opacity-0")}>
                                       {isDebit ? `₹${Math.round(e.amount).toLocaleString()}` : "—"}
                                    </span>
                                 </td>
                                 <td className="py-3 text-right">
                                    <span className={clsx("text-xs font-black", !isDebit ? "text-emerald-600" : "opacity-0")}>
                                       {!isDebit ? `₹${Math.round(e.amount).toLocaleString()}` : "—"}
                                    </span>
                                 </td>
                                 <td className="py-3 pr-4 text-right">
                                    <div className={clsx(
                                      "inline-flex flex-col items-end px-2 py-0.5 rounded transition-all",
                                      balance >= 0 ? "text-emerald-600" : "text-rose-600"
                                    )}>
                                       <span className="text-xs font-black tracking-tighter">₹{Math.abs(Math.round(balance)).toLocaleString()}</span>
                                       <span className="text-[6px] font-black uppercase">{balance >= 0 ? "CR" : "DR"}</span>
                                    </div>
                                 </td>
                              </tr>
                            );
                          })}
                       </tbody>
                    </table>
                  )}
               </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-slate-400 space-y-4">
             <Store size={48} className="opacity-10" />
             <p className="text-[10px] font-black uppercase tracking-widest">Select vendor to begin financial analysis</p>
          </div>
        )}
      </div>

      {/* --- Vendor Enrollment Modal --- */}
      {showForm && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-[#12141c] rounded-[2.5rem] shadow-2xl w-full max-w-md p-8 space-y-6 overflow-hidden relative">
             <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 rounded-bl-[100px] -mr-12 -mt-12" />
             
             <div className="flex items-center gap-3 relative z-10">
                <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-lg shadow-indigo-600/20">
                   {linkEditing ? <Edit3 size={20} /> : <Plus size={20} />}
                </div>
                <div>
                   <h2 className="text-base font-bold text-gray-900 dark:text-white uppercase">{linkEditing ? "Update Link" : "Link Material"}</h2>
                   <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">{linkModal.name}</p>
                </div>
              </div>

              {!linkEditing && (
                <div className="bg-slate-50 dark:bg-white/5 p-1 rounded-xl flex gap-1">
                  <button 
                    onClick={() => setLinkData({ ...linkData, isNew: false })}
                    className={clsx("flex-1 py-1.5 rounded-lg text-[10px] font-bold uppercase transition-all", !linkData.isNew ? "bg-white dark:bg-card text-indigo-600 shadow-sm" : "text-slate-400")}
                  >
                    Existing
                  </button>
                  <button 
                    onClick={() => setLinkData({ ...linkData, isNew: true })}
                    className={clsx("flex-1 py-1.5 rounded-lg text-[10px] font-bold uppercase transition-all", linkData.isNew ? "bg-white dark:bg-card text-indigo-600 shadow-sm" : "text-slate-400")}
                  >
                    New
                  </button>
                </div>
              )}

              <div className="space-y-4 relative z-10">
                {linkEditing ? (
                  <div className="bg-slate-50 dark:bg-white/5 p-4 rounded-xl border border-slate-100 dark:border-white/5">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Selected Material</p>
                    <p className="text-sm font-bold text-indigo-600 uppercase">{linkEditing.material?.name}</p>
                  </div>
                ) : (
                  <>
                    {linkData.isNew ? (
                      <div className="grid grid-cols-1 gap-4">
                          <div className="space-y-1">
                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Material Name</label>
                            <input 
                              placeholder="Ex: Refined Oil" 
                              value={linkData.newName} 
                              onChange={(e) => setLinkData({ ...linkData, newName: e.target.value })}
                              className="w-full px-4 py-3 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl font-semibold text-sm outline-none"
                            />
                          </div>
                          <div className="space-y-1">
                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Unit</label>
                            <select 
                              value={linkData.newUnit} 
                              onChange={(e) => setLinkData({ ...linkData, newUnit: e.target.value })}
                              className="w-full px-4 py-3 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl text-sm font-semibold outline-none appearance-none cursor-pointer"
                            >
                                {STANDARD_UNITS.map(u => (
                                  <option key={u.value} value={u.value}>{u.label}</option>
                                ))}
                            </select>
                          </div>
                      </div>
                    ) : (
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Select Material</label>
                        <select
                          value={linkData.materialId}
                          onChange={(e) => setLinkData({ ...linkData, materialId: e.target.value })}
                          className="w-full px-4 py-3 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl text-sm font-bold outline-none appearance-none cursor-pointer"
                        >
                            <option value="">Choose Material...</option>
                            {allKnownMaterials
                              .filter(m => !(linkModal?.suppliedMaterials || []).some((sm: any) => sm.materialId === m.id || sm.material?.id === m.id))
                              .map(m => (
                                <option key={m.id} value={m.id}>{m.name} ({m.unit})</option>
                              ))
                            }
                        </select>
                        {allKnownMaterials.filter(m => !(linkModal?.suppliedMaterials || []).some((sm: any) => sm.materialId === m.id || sm.material?.id === m.id)).length === 0 && (
                          <p className="text-[10px] text-slate-400 italic ml-1">All materials are already linked to this vendor.</p>
                        )}
                      </div>
                    )}
                  </>
                )}

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Quantity</label>
                    <input type="number" placeholder="0" value={linkData.quantity} onChange={(e) => setLinkData({...linkData, quantity: e.target.value})} className="w-full px-4 py-3 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl text-sm font-bold outline-none" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Base Price (₹)</label>
                    <input type="number" placeholder="0.00" value={linkData.price} onChange={(e) => setLinkData({...linkData, price: e.target.value})} className="w-full px-4 py-3 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl text-sm font-bold outline-none" />
                  </div>
                </div>
              </div>

             <div className="flex gap-3 pt-2">
                <button 
                  onClick={() => setLinkModal(null)} 
                  className="px-5 py-2 text-xs font-bold text-slate-500 hover:bg-slate-50 rounded-lg transition-all"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleLinkMaterial} 
                  disabled={saving || (linkData.isNew ? !linkData.newName : !linkData.materialId)} 
                  className="flex-1 py-3 bg-indigo-600 text-white rounded-lg text-xs font-bold uppercase transition-all disabled:opacity-50"
                >
                  {saving ? "Linking..." : "Confirm"}
                </button>
             </div>
          </div>
        </div>
      )}

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-[#12141c] rounded-[2.5rem] shadow-2xl w-full max-w-xl p-8 space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-gray-900 dark:text-white uppercase tracking-tight">{editing ? "Edit Vendor" : "Add Vendor"}</h2>
                {!editing && <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">Step {formStep} of 2</p>}
              </div>
              {!editing && (
                <div className="flex gap-1">
                  <div className={clsx("w-5 h-1 rounded-full transition-all", formStep === 1 ? "bg-orange-500" : "bg-slate-200")} />
                  <div className={clsx("w-5 h-1 rounded-full transition-all", formStep === 2 ? "bg-orange-500" : "bg-slate-200")} />
                </div>
              )}
            </div>

            {formStep === 1 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1 col-span-2">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Vendor Name</label>
                  <input placeholder="Enter name..." value={form.name} onChange={(e) => setForm({...form, name: e.target.value})} className="w-full px-4 py-3 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl font-semibold text-sm outline-none focus:ring-2 ring-orange-500/20" />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Contact Number</label>
                  <input placeholder="10 digits..." value={form.contact} maxLength={10} onChange={(e) => setForm({...form, contact: e.target.value.replace(/\D/g, "")})} className="w-full px-4 py-3 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl font-semibold text-sm outline-none focus:ring-2 ring-orange-500/20" />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Email Address</label>
                  <input placeholder="optional@gmail.com" value={form.email} onChange={(e) => setForm({...form, email: e.target.value})} className="w-full px-4 py-3 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl font-semibold text-sm outline-none focus:ring-2 ring-orange-500/20" />
                </div>
                <div className="space-y-1 col-span-2">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Registered Address</label>
                  <textarea placeholder="Enter full address..." value={form.address} rows={2} onChange={(e) => setForm({...form, address: e.target.value})} className="w-full px-4 py-3 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl font-semibold text-sm outline-none focus:ring-2 ring-orange-500/20 resize-none" />
                </div>
              </div>

              {/* Toggles */}
              <div className="px-6 space-y-4">
                 <div className="p-1 bg-slate-100 dark:bg-slate-800/50 rounded-xl flex border border-slate-200 dark:border-white/5">
                    <button 
                       onClick={() => setPaymentForm({...paymentForm, type: 'PAYMENT'})} 
                       className={clsx(
                         "flex-1 py-2.5 rounded-lg text-[9px] font-black uppercase transition-all flex items-center justify-center gap-1.5",
                         paymentForm.type === 'PAYMENT' ? "bg-white dark:bg-slate-700 text-orange-600 dark:text-white shadow-sm" : "text-slate-500"
                       )}
                    >
                       <CheckCircle2 size={12} /> Pay Due
                    </button>
                    <button 
                       onClick={() => setPaymentForm({...paymentForm, type: 'ADVANCE'})} 
                       className={clsx(
                         "flex-1 py-2.5 rounded-lg text-[9px] font-black uppercase transition-all flex items-center justify-center gap-1.5",
                         paymentForm.type === 'ADVANCE' ? "bg-white dark:bg-slate-700 text-indigo-600 dark:text-white shadow-sm" : "text-slate-500"
                       )}
                    >
                       <TrendingUp size={12} /> Advance
                    </button>
                 </div>

                 {/* Amount Input */}
                 <div className="space-y-1">
                    <label className="text-[8px] font-black text-slate-400 uppercase tracking-widest ml-3">Transaction Amount</label>
                    <div className="relative group">
                       <span className="absolute left-6 top-1/2 -translate-y-1/2 text-xl font-black text-slate-300 group-focus-within:text-orange-500 transition-colors">₹</span>
                       <input 
                         autoFocus
                         value={paymentForm.amount} 
                         onChange={e => setPaymentForm({...paymentForm, amount: e.target.value.replace(/[^0-9.]/g, '')})} 
                         placeholder="0.00"
                         className="w-full pl-12 pr-6 py-5 text-3xl font-black text-slate-900 dark:text-white bg-slate-50 dark:bg-slate-800/30 border border-slate-200 dark:border-white/5 rounded-2xl outline-none focus:ring-4 ring-orange-500/10 transition-all placeholder:text-slate-200"
                       />
                    </div>
                 </div>

                 {/* Financial Impact Preview (Only show when amount entered) */}
                 {amountNum > 0 && (
                   <div className="p-4 bg-orange-500/5 dark:bg-orange-500/[0.03] border border-orange-500/10 rounded-2xl space-y-2 animate-in fade-in slide-in-from-top-1">
                      <p className="text-[8px] font-black text-orange-600 dark:text-orange-400 uppercase tracking-widest flex items-center gap-1.5">
                         <Zap size={10} /> Live Impact Preview
                      </p>
                      <div className="grid grid-cols-2 gap-4">
                         <div className="space-y-0.5">
                            <p className="text-[7px] font-bold text-slate-500 uppercase">Vendor Position</p>
                            <div className="flex items-center gap-1.5 text-[10px] font-black text-slate-800 dark:text-slate-200">
                               <span>₹{Math.round(paymentForm.type === 'PAYMENT' ? (selectedVendor?.due || 0) : (selectedVendor?.advance || 0)).toLocaleString()}</span>
                               <ArrowRight size={10} className="text-slate-400" />
                               <span className="text-emerald-500">
                                  ₹{Math.round(paymentForm.type === 'PAYMENT' 
                                    ? Math.max(0, (selectedVendor?.due || 0) - amountNum) 
                                    : (selectedVendor?.advance || 0) + amountNum
                                  ).toLocaleString()}
                               </span>
                            </div>
                         </div>
                         <div className="space-y-0.5">
                            <p className="text-[7px] font-bold text-slate-500 uppercase">Account Liquidity</p>
                            <div className="flex items-center gap-1.5 text-[10px] font-black text-slate-800 dark:text-slate-200">
                               <span>₹{Math.round(accountBalance).toLocaleString()}</span>
                               <ArrowRight size={10} className="text-slate-400" />
                               <span className="text-rose-500">₹{Math.round(accountBalance - amountNum).toLocaleString()}</span>
                          </div>
                       </div>
                    </div>
                   </div>
                 )}

            <div className="flex gap-3 pt-4 border-t border-slate-100 dark:border-white/5">
              <button 
                onClick={() => {
                  if (formStep === 2) setFormStep(1);
                  else setShowForm(false);
                }} 
                className="px-5 py-2 text-xs font-bold text-slate-500 hover:bg-slate-50 rounded-lg transition-all"
              >
                {formStep === 2 ? "Back" : "Cancel"}
              </button>
              <button 
                onClick={handleSave} 
                className="flex-1 px-8 py-2.5 bg-orange-500 text-white rounded-lg text-xs font-bold uppercase transition-all disabled:opacity-50"
                disabled={saving}
              >
                {saving ? "Saving..." : (editing ? "Save" : (formStep === 1 ? "Next" : "Finish"))}
              </button>
            </div>
          </div>
        </div>
      )}

      {showPayment && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-[#12141c] rounded-[2.5rem] shadow-2xl w-full max-w-md p-8 space-y-6">
            <h2 className="text-lg font-black text-gray-900 dark:text-white">Record Payment - {showPayment.name}</h2>
            <div className="bg-slate-50 p-1.5 rounded-2xl flex gap-1">
              <button onClick={() => setPaymentForm({...paymentForm, type: "PAYMENT"})} className={clsx("flex-1 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest", paymentForm.type === "PAYMENT" ? "bg-white text-emerald-600 shadow-sm" : "text-slate-400")}>Payment</button>
              <button onClick={() => setPaymentForm({...paymentForm, type: "ADVANCE"})} className={clsx("flex-1 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest", paymentForm.type === "ADVANCE" ? "bg-white text-violet-600 shadow-sm" : "text-slate-400")}>Advance</button>
            </div>
            <div className="space-y-1.5 text-center">
              <label className="text-[11px] font-black text-slate-500 uppercase tracking-widest">Amount (₹)</label>
              <input type="text" value={paymentForm.amount} onChange={(e) => setPaymentForm({...paymentForm, amount: e.target.value.replace(/[^0-9.]/g, "")})} className="w-full py-5 text-4xl text-center bg-slate-50 border border-slate-200 rounded-2xl font-black focus:outline-none" />
            </div>
            <textarea placeholder="Notes..." value={paymentForm.note} onChange={(e) => setPaymentForm({...paymentForm, note: e.target.value})} className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl font-semibold resize-none" rows={2} />
            <div className="flex gap-4">
              <button onClick={() => setShowPayment(null)} className="flex-1 py-4 text-[11px] font-black uppercase tracking-widest text-slate-500">Cancel</button>
              <button onClick={handleRecordPayment} disabled={saving || !paymentForm.amount} className="flex-[2] py-4 bg-emerald-500 text-white rounded-2xl text-[11px] font-black shadow-lg uppercase tracking-widest">{saving ? "Wait..." : "Confirm"}</button>
            </div>
          </div>
        </div>
      )}

      {showLedger && <VendorLedgerModal vendor={showLedger} onClose={() => setShowLedger(null)} />}
      
      {confirmModal?.show && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-md p-4">
          <div className="bg-white dark:bg-[#12141c] rounded-3xl p-8 space-y-6 text-center">
            <Trash2 size={48} className="text-red-500 mx-auto" />
            <h2 className="text-xl font-black">Delete {confirmModal.vendor.name}?</h2>
            <div className="flex gap-3">
              <button onClick={() => setConfirmModal(null)} className="flex-1 py-3 px-4 rounded-xl border text-sm font-bold">Cancel</button>
              <button onClick={confirmDelete} className="flex-1 py-3 px-4 bg-red-500 text-white rounded-xl text-sm font-black shadow-lg">Delete</button>
            </div>
          </div>
        </div>
      )}
      
      {errorMessage && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/60 backdrop-blur-md p-4">
          <div className="bg-white dark:bg-[#12141c] rounded-3xl p-8 space-y-6 text-center">
            <AlertCircle size={48} className="text-orange-500 mx-auto" />
            <h2 className="text-xl font-black uppercase">{errorMessage.title}</h2>
            <p className="text-sm text-gray-500">{errorMessage.message}</p>
            <button onClick={() => setErrorMessage(null)} className="w-full py-4 bg-orange-500 text-white rounded-xl text-sm font-black shadow-lg uppercase tracking-widest">Got it</button>
          </div>
        </div>
      )}
    </div>
  );
}

