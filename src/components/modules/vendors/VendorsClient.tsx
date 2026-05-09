"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import {
  Store, Plus, Search,
  RefreshCw, Edit2, Trash2,
  AlertCircle, History,
  TrendingUp, Wallet,
  CheckCircle2, FileText, Download,
  Phone, Mail, ShieldCheck, Zap, ArrowRight,
  Package, Truck, Receipt, LayoutDashboard, Settings2,
  AlertTriangle, Star, Calendar, FileCheck
} from "lucide-react";
import { clsx } from "clsx";
import { vendorsApi, accountsApi } from "@/lib/api";
import { useToast } from "@/context/ToastContext";
import { useAuth } from "@/context/AuthContext";

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
  const [selectedTab, setSelectedTab] = useState<'OVERVIEW' | 'POS' | 'GRNS' | 'MATERIALS' | 'INVOICES' | 'LEDGER'>('OVERVIEW');
  
  const [selectedVendorDetail, setSelectedVendorDetail] = useState<any>(null);
  const [detailLoading, setDetailLoading] = useState(false);
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
  const [paymentForm, setPaymentForm] = useState({ 
    amount: "", 
    note: "", 
    type: "PAYMENT" as "PAYMENT" | "ADVANCE", 
    accountId: "",
    paymentMode: "CASH",
    referenceId: "",
    date: new Date().toISOString().split('T')[0]
  });
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
      }
    } catch (e) {
      showToast("Sync Error: Financial nodes unreachable", "error");
    } finally {
      setLoading(false);
    }
  }, [selectedVendorId, showToast]);

  const fetchVendorDetails = useCallback(async (vendorId: string) => {
    setDetailLoading(true);
    setLedgerLoading(true);
    try {
      const [lRes, dRes, aRes] = await Promise.all([
        vendorsApi.getLedger(vendorId),
        vendorsApi.getById(vendorId),
        vendorsApi.getAging(vendorId)
      ]);
      
      setLedger(lRes.data || []);
      setSelectedVendorDetail(dRes.data);
      setAging(aRes.data || { current: 0, thirtySixty: 0, sixtyNinety: 0, overNinety: 0 });
    } catch (e) {
      showToast("Sync Error: Connection to node lost", "error");
    } finally {
      setDetailLoading(false);
      setLedgerLoading(false);
    }
  }, [showToast]);

  useEffect(() => { fetchData(); }, [fetchData]);
  useEffect(() => { if (selectedVendorId) fetchVendorDetails(selectedVendorId); }, [selectedVendorId, fetchVendorDetails]);

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
      showToast(e.response?.data?.error || "Transaction Aborted", "error");
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
      fetchVendorDetails(selectedVendorId);
    } catch (e: any) {
      showToast(e.response?.data?.error || "Settlement Failed", "error");
    } finally { setSaving(false); }
  };

  const amountNum = Number(paymentForm.amount) || 0;
  const selectedAccount = accounts.find(a => a.id === paymentForm.accountId);
  const accountBalance = selectedAccount?.balance || 0;

  return (
    <div className="flex h-[calc(100vh-100px)] bg-slate-50 dark:bg-[#0b0c14] -m-4 overflow-hidden selection:bg-orange-500/30 selection:text-orange-500 transition-colors">
      
      {/* Sidebar */}
      <div className="w-[320px] flex flex-col bg-white dark:bg-slate-900/40 border-r border-slate-200 dark:border-white/5 relative overflow-hidden shrink-0">
        <div className="p-4 space-y-4 relative z-10 border-b border-slate-100 dark:border-white/5">
          <div className="flex items-center justify-between">
            <h2 className="text-[11px] font-bold text-slate-900 dark:text-white uppercase tracking-[0.2em] flex items-center gap-2">
              <Store className="text-orange-500 w-4 h-4" /> Directory
            </h2>
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
                  "flex-1 py-1.5 text-[8px] font-bold uppercase tracking-[0.15em] rounded-lg transition-all",
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
               <p className="text-[9px] font-bold uppercase tracking-[0.2em]">Empty directory</p>
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
                       <span className={clsx("text-[10px] font-black tracking-tighter", bal > 0 ? "text-emerald-500" : bal < 0 ? "text-rose-500" : "text-slate-400")}>
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

      {/* Main Dashboard */}
      <div className="flex-1 flex flex-col relative overflow-hidden bg-white dark:bg-[#0b0c14]">
        {selectedVendor ? (
          <>
            <div className="px-6 py-4 border-b border-slate-200 dark:border-white/5 relative z-10 flex items-center justify-between bg-white dark:bg-transparent">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-orange-500 text-white flex items-center justify-center shadow-lg shadow-orange-500/20">
                  <Store size={24} />
                </div>
                <div>
                  <div className="flex items-center gap-3">
                    <h1 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tighter leading-none">{selectedVendor.name}</h1>
                    <span className={clsx("px-2 py-0.5 rounded-lg text-[8px] font-black uppercase tracking-widest border", VENDOR_STATUS.find(s => s.value === selectedVendor.status)?.color, VENDOR_STATUS.find(s => s.value === selectedVendor.status)?.bg, VENDOR_STATUS.find(s => s.value === selectedVendor.status)?.border)}>
                      {selectedVendor.status}
                    </span>
                  </div>
                  <div className="flex items-center gap-4 mt-1 text-slate-500 font-bold text-[10px] uppercase tracking-widest">
                     <span className="flex items-center gap-1.5"><Phone size={10} className="text-orange-500" /> {selectedVendor.contact}</span>
                     <span className="flex items-center gap-1.5"><Mail size={10} className="text-blue-500" /> {selectedVendor.email || "N/A"}</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                 <button onClick={() => { setEditing(selectedVendor); setForm({ ...selectedVendor }); setShowForm(true); }} className="px-4 py-2 bg-slate-100 dark:bg-white/5 text-slate-700 dark:text-white rounded-xl text-[9px] font-bold uppercase tracking-widest border border-slate-200 dark:border-white/10 transition-all">Edit Profile</button>
                 <button onClick={() => { setPaymentForm({ amount: "", note: "", type: "PAYMENT", accountId: accounts[0]?.id || "", paymentMode: "CASH", referenceId: "", date: new Date().toISOString().split('T')[0] }); setShowPaymentModal(true); }} className="px-6 py-2 bg-orange-500 text-white rounded-xl text-[9px] font-bold uppercase tracking-widest shadow-lg shadow-orange-500/20 active:scale-95 transition-all">Record Transaction</button>
              </div>
            </div>

            {/* Tab Navigation */}
            <div className="px-6 flex items-center gap-6 border-b border-slate-200 dark:border-white/5 bg-white dark:bg-transparent">
              {([
                { id: 'OVERVIEW', label: 'Overview', icon: LayoutDashboard },
                { id: 'POS', label: 'Purchase Orders', icon: Package },
                { id: 'GRNS', label: 'Receipts (GRN)', icon: Truck },
                { id: 'MATERIALS', label: 'Materials', icon: Zap },
                { id: 'INVOICES', label: 'Invoices', icon: Receipt },
                { id: 'LEDGER', label: 'Audit Ledger', icon: History }
              ] as const).map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setSelectedTab(tab.id)}
                  className={clsx(
                    "flex items-center gap-2 py-4 text-[10px] font-bold uppercase tracking-[0.15em] border-b-2 transition-all",
                    selectedTab === tab.id 
                      ? "border-orange-500 text-orange-600 dark:text-white" 
                      : "border-transparent text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                  )}
                >
                  <tab.icon size={14} /> {tab.label}
                </button>
              ))}
            </div>

            <div className="flex-1 overflow-hidden flex flex-col min-h-0 bg-slate-50/50 dark:bg-transparent p-4">
              {selectedTab === 'OVERVIEW' && (
                <div className="space-y-4 overflow-y-auto custom-scrollbar pr-2">
                  <div className="grid grid-cols-4 gap-4">
                    <div className="p-5 rounded-[2rem] border bg-white dark:bg-slate-900/40 border-slate-100 dark:border-white/5 shadow-sm">
                        <p className="text-[8px] font-bold text-slate-400 uppercase tracking-[0.2em] mb-3 flex items-center gap-1.5"><AlertCircle size={10} className="text-rose-500" /> Total Payable</p>
                        <h3 className="text-3xl font-black text-rose-600 dark:text-rose-400 tracking-tighter">₹{Math.round(selectedVendor.due || 0).toLocaleString()}</h3>
                        <div className="mt-4 flex items-center gap-2">
                           <span className="px-2 py-0.5 bg-rose-500/10 text-rose-500 rounded-full text-[7px] font-bold uppercase tracking-wider">Outstanding</span>
                        </div>
                    </div>
                    <div className="p-5 bg-white dark:bg-slate-900/40 border border-slate-100 dark:border-white/5 rounded-[2.5rem] shadow-sm">
                        <p className="text-[8px] font-bold text-slate-400 uppercase tracking-[0.2em] mb-3 flex items-center gap-1.5"><CheckCircle2 size={10} className="text-emerald-500" /> Total Settled</p>
                        <h3 className="text-3xl font-black text-slate-900 dark:text-white tracking-tighter">₹{Math.round(selectedVendor.totalPaid || 0).toLocaleString()}</h3>
                        <p className="mt-2 text-[8px] font-bold text-slate-400 uppercase tracking-widest">Lifetime transaction value</p>
                    </div>
                    <div className="p-5 bg-white dark:bg-slate-900/40 border border-slate-100 dark:border-white/5 rounded-[2.5rem] shadow-sm">
                        <p className="text-[8px] font-bold text-slate-400 uppercase tracking-[0.2em] mb-3 flex items-center gap-1.5"><Wallet size={10} className="text-indigo-500" /> Vendor Balance</p>
                        <h3 className="text-3xl font-black text-indigo-600 dark:text-indigo-400 tracking-tighter">₹{Math.round(selectedVendor.advance || 0).toLocaleString()}</h3>
                        <div className="mt-4 flex items-center gap-2">
                           <span className="px-2 py-0.5 bg-indigo-500/10 text-indigo-500 rounded-full text-[7px] font-bold uppercase tracking-wider">Available Credit</span>
                        </div>
                    </div>
                    <div className="p-5 bg-white dark:bg-slate-900/40 border border-slate-100 dark:border-white/5 rounded-[2.5rem] shadow-sm flex flex-col">
                        <p className="text-[8px] font-bold text-slate-400 uppercase tracking-[0.2em] mb-3">Due Aging Analytics</p>
                        <div className="flex-1 flex flex-col justify-center">
                          <div className="h-4 bg-slate-100 dark:bg-white/5 rounded-full overflow-hidden flex mb-3 border border-slate-200 dark:border-white/10">
                            {aging && (
                              <>
                                <div style={{ width: `${(aging.current / (selectedVendor.due || 1)) * 100}%` }} className="bg-emerald-500 h-full transition-all duration-1000" />
                                <div style={{ width: `${(aging.thirtySixty / (selectedVendor.due || 1)) * 100}%` }} className="bg-amber-500 h-full transition-all duration-1000" />
                                <div style={{ width: `${(aging.sixtyNinety / (selectedVendor.due || 1)) * 100}%` }} className="bg-orange-500 h-full transition-all duration-1000" />
                                <div style={{ width: `${(aging.overNinety / (selectedVendor.due || 1)) * 100}%` }} className="bg-rose-500 h-full transition-all duration-1000" />
                              </>
                            )}
                          </div>
                          <div className="grid grid-cols-4 gap-1 text-[6px] font-bold uppercase text-center tracking-[0.1em]">
                            <div className="text-emerald-500">0-30D</div>
                            <div className="text-amber-500">31-60D</div>
                            <div className="text-orange-500">61-90D</div>
                            <div className="text-rose-500">90D+</div>
                          </div>
                        </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    {/* Health Scorecard */}
                    <div className="col-span-1 p-6 bg-white dark:bg-slate-900/40 border border-slate-100 dark:border-white/5 rounded-[2.5rem] space-y-6">
                      <h4 className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-900 dark:text-white flex items-center gap-2">
                        <ShieldCheck size={14} className="text-emerald-500" /> Vendor Health
                      </h4>
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">Vendor Rating</span>
                          <div className="flex items-center gap-0.5">
                            {[1,2,3,4,5].map(s => <Star key={s} size={10} className={s <= (selectedVendor.rating || 5) ? "text-orange-400 fill-orange-400" : "text-slate-200"} />)}
                          </div>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">Payment Terms</span>
                          <span className="text-[9px] font-bold text-slate-900 dark:text-white uppercase tracking-tight">{selectedVendor.paymentTerms}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">Total Orders</span>
                          <span className="text-[9px] font-bold text-slate-900 dark:text-white tracking-tight">{selectedVendor._count?.orders || 0}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">Status</span>
                          <span className="px-2 py-0.5 bg-emerald-500/10 text-emerald-500 rounded text-[8px] font-bold uppercase tracking-widest">Verified Vendor</span>
                        </div>
                      </div>
                    </div>

                    {/* Quick Stats */}
                    <div className="col-span-2 p-6 bg-white dark:bg-slate-900/40 border border-slate-100 dark:border-white/5 rounded-[2.5rem] grid grid-cols-2 gap-8">
                       <div className="space-y-4">
                          <h4 className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-900 dark:text-white">Business Metrics</h4>
                          <div className="grid grid-cols-2 gap-4">
                             <div className="p-4 bg-slate-50 dark:bg-white/5 rounded-3xl border border-slate-100 dark:border-white/5">
                                <p className="text-[7px] font-bold text-slate-400 uppercase tracking-[0.15em] mb-1">Avg Lead Time</p>
                                <span className="text-base font-black text-slate-900 dark:text-white tracking-tighter">
                                  {(() => {
                                    const orders = selectedVendorDetail?.orders?.filter((o: any) => o.status === 'RECEIVED' && o.goodsReceipts?.length > 0);
                                    if (!orders || orders.length === 0) return "N/A";
                                    const totalDays = orders.reduce((sum: number, o: any) => {
                                      const receivedAt = new Date(o.goodsReceipts[0].createdAt);
                                      const createdAt = new Date(o.createdAt);
                                      return sum + (receivedAt.getTime() - createdAt.getTime());
                                    }, 0);
                                    const avg = totalDays / orders.length / (1000 * 60 * 60 * 24);
                                    return `${avg.toFixed(1)} Days`;
                                  })()}
                                </span>
                             </div>
                             <div className="p-4 bg-slate-50 dark:bg-white/5 rounded-3xl border border-slate-100 dark:border-white/5">
                                <p className="text-[7px] font-bold text-slate-400 uppercase tracking-[0.15em] mb-1">QC Pass Rate</p>
                                <span className="text-base font-black text-emerald-500 tracking-tighter">
                                  {(() => {
                                    const items = selectedVendorDetail?.orders?.flatMap((o: any) => o.goodsReceipts || []).flatMap((g: any) => g.items || []);
                                    if (!items || items.length === 0) return "100%";
                                    const accepted = items.reduce((s: number, i: any) => s + (i.acceptedQty || 0), 0);
                                    const received = items.reduce((s: number, i: any) => s + (i.receivedQty || 1), 0);
                                    return `${((accepted / received) * 100).toFixed(1)}%`;
                                  })()}
                                </span>
                             </div>
                          </div>
                       </div>
                       <div className="space-y-4">
                          <h4 className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-900 dark:text-white">Operational Info</h4>
                          <div className="space-y-2.5">
                             <div className="flex items-center justify-between text-[9px] font-bold text-slate-500 uppercase tracking-widest"><span>GST Number</span> <span className="font-black text-slate-900 dark:text-white tracking-normal">{selectedVendor.gstNumber || "Not Provided"}</span></div>
                             <div className="flex items-center justify-between text-[9px] font-bold text-slate-500 uppercase tracking-widest"><span>Category</span> <span className="font-black text-slate-900 dark:text-white tracking-normal uppercase">{selectedVendor.category || "General"}</span></div>
                             <div className="mt-2 pt-2 border-t border-slate-100 dark:border-white/5">
                                <span className="text-[7px] font-bold text-slate-400 uppercase tracking-widest">Office Address</span>
                                <p className="text-[10px] font-medium text-slate-600 dark:text-slate-400 mt-1 leading-relaxed">{selectedVendor.address}</p>
                             </div>
                          </div>
                       </div>
                    </div>
                  </div>
                </div>
              )}

              {selectedTab === 'POS' && (
                <div className="flex-1 flex flex-col bg-white dark:bg-slate-900/20 border border-slate-200 dark:border-white/5 rounded-[2rem] overflow-hidden">
                   <div className="p-4 border-b border-slate-100 dark:border-white/5 flex items-center justify-between">
                      <h4 className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-900 dark:text-white">Recent Purchase Orders</h4>
                   </div>
                   <div className="flex-1 overflow-y-auto custom-scrollbar">
                      <table className="w-full text-left">
                        <thead className="bg-slate-50 dark:bg-slate-800 sticky top-0 z-20">
                          <tr className="text-[8px] font-bold text-slate-500 dark:text-slate-400 uppercase border-b border-slate-200 dark:border-white/5 tracking-widest">
                            <th className="py-3 pl-6">PO Number</th>
                            <th className="py-3">Date</th>
                            <th className="py-3">Status</th>
                            <th className="py-3 text-right">Items</th>
                            <th className="py-3 text-right pr-6">Total Amount</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-white/5">
                          {selectedVendorDetail?.orders?.map((po: any) => (
                            <tr key={po.id} className="hover:bg-slate-50 dark:hover:bg-white/[0.03] transition-colors text-[11px]">
                              <td className="py-4 pl-6 font-black text-orange-600 tracking-tight">{po.poNumber || po.id.substring(0,8)}</td>
                              <td className="py-4 font-bold text-slate-500">{new Date(po.createdAt).toLocaleDateString()}</td>
                              <td className="py-4">
                                <span className={clsx(
                                  "px-2 py-0.5 rounded-full text-[8px] font-bold uppercase tracking-wider",
                                  po.status === 'RECEIVED' ? "bg-emerald-500/10 text-emerald-500" : 
                                  po.status === 'PENDING' ? "bg-amber-500/10 text-amber-500" : "bg-slate-100 text-slate-400"
                                )}>
                                  {po.status}
                                </span>
                              </td>
                              <td className="py-4 text-right font-bold text-slate-500">{po.poItems?.length || 0} Lines</td>
                              <td className="py-4 text-right pr-6 font-black text-slate-900 dark:text-white tracking-tighter">₹{Math.round(po.totalAmount).toLocaleString()}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                      {(!selectedVendorDetail?.orders || selectedVendorDetail.orders.length === 0) && (
                        <div className="p-10 text-center opacity-30 flex flex-col items-center"><Package size={40} /><p className="text-[10px] font-bold uppercase tracking-widest mt-2">No active purchase orders</p></div>
                      )}
                   </div>
                </div>
              )}

              {selectedTab === 'GRNS' && (
                <div className="flex-1 flex flex-col bg-white dark:bg-slate-900/20 border border-slate-200 dark:border-white/5 rounded-[2rem] overflow-hidden">
                   <div className="p-4 border-b border-slate-100 dark:border-white/5 flex items-center justify-between">
                      <h4 className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-900 dark:text-white">Goods Receipt History</h4>
                   </div>
                   <div className="flex-1 overflow-y-auto custom-scrollbar">
                      <table className="w-full text-left">
                        <thead className="bg-slate-50 dark:bg-slate-800 sticky top-0 z-20">
                          <tr className="text-[8px] font-bold text-slate-500 dark:text-slate-400 uppercase border-b border-slate-200 dark:border-white/5 tracking-widest">
                            <th className="py-3 pl-6">GRN ID</th>
                            <th className="py-3">PO Reference</th>
                            <th className="py-3">Received At</th>
                            <th className="py-3 text-center">QC Status</th>
                            <th className="py-3 text-right pr-6">Items Received</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-white/5">
                          {selectedVendorDetail?.orders?.flatMap((po: any) => (po.goodsReceipts || []).map((gr:any) => ({...gr, poNumber: po.poNumber})))?.map((grn: any) => (
                            <tr key={grn.id} className="hover:bg-slate-50 dark:hover:bg-white/[0.03] transition-colors text-[11px]">
                              <td className="py-4 pl-6 font-black tracking-tight">{grn.id.substring(0,8)}</td>
                              <td className="py-4 font-bold text-orange-600">#{grn.poNumber || grn.poId.substring(0,8)}</td>
                              <td className="py-4 font-bold text-slate-500">{new Date(grn.createdAt).toLocaleDateString()}</td>
                              <td className="py-4 text-center">
                                <span className={clsx(
                                  "px-2 py-0.5 rounded text-[8px] font-bold uppercase tracking-wider",
                                  grn.status === 'COMPLETED' ? "bg-emerald-500/10 text-emerald-500" : "bg-amber-500/10 text-amber-500"
                                )}>
                                  {grn.status === 'COMPLETED' ? "PASSED QC" : grn.status}
                                </span>
                              </td>
                              <td className="py-4 text-right pr-6 font-black text-emerald-600 tracking-tighter">{grn.items?.reduce((s:number, i:any) => s + (i.receivedQty || 0), 0)} Units</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                      {(!selectedVendorDetail?.orders?.some((o:any) => o.goodsReceipts?.length > 0)) && (
                        <div className="p-10 text-center opacity-30 flex flex-col items-center"><Truck size={40} /><p className="text-[10px] font-bold uppercase tracking-[0.2em] mt-2">No warehouse movements recorded</p></div>
                      )}
                   </div>
                </div>
              )}

              {selectedTab === 'MATERIALS' && (
                <div className="grid grid-cols-3 gap-4">
                  {selectedVendorDetail?.suppliedMaterials?.map((sm: any) => (
                    <div key={sm.materialId} className="p-5 bg-white dark:bg-slate-900/40 border border-slate-100 dark:border-white/5 rounded-[2rem] shadow-sm flex flex-col justify-between">
                       <div>
                          <div className="flex items-center gap-3 mb-4">
                             <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-white/5 flex items-center justify-center text-slate-400">
                                <Package size={20} />
                             </div>
                             <div>
                                <h4 className="text-xs font-black text-slate-900 dark:text-white uppercase truncate max-w-[150px]">{sm.material?.name}</h4>
                                <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">{sm.material?.sku}</p>
                             </div>
                          </div>
                          <div className="flex items-center justify-between py-2 border-t border-slate-50 dark:border-white/5">
                             <span className="text-[9px] font-bold text-slate-500 uppercase">Standard Price</span>
                             <span className="text-xs font-black text-slate-900 dark:text-white">₹{sm.price || 0}</span>
                          </div>
                          <div className="flex items-center justify-between py-2 border-t border-slate-50 dark:border-white/5">
                             <span className="text-[9px] font-bold text-slate-500 uppercase">Unit</span>
                             <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{sm.material?.unit}</span>
                          </div>
                       </div>
                       <button className="mt-4 w-full py-2 bg-slate-50 dark:bg-white/5 hover:bg-orange-500/10 hover:text-orange-600 text-slate-400 rounded-xl text-[8px] font-black uppercase tracking-widest transition-all">Update Pricing</button>
                    </div>
                  ))}
                  {(!selectedVendorDetail?.suppliedMaterials || selectedVendorDetail.suppliedMaterials.length === 0) && (
                    <div className="col-span-3 p-10 text-center opacity-30 flex flex-col items-center"><Zap size={40} /><p className="text-[10px] font-black uppercase mt-2">No materials linked to this vendor</p></div>
                  )}
                </div>
              )}

              {selectedTab === 'INVOICES' && (
                <div className="flex-1 flex flex-col bg-white dark:bg-slate-900/20 border border-slate-200 dark:border-white/5 rounded-[2rem] overflow-hidden">
                   <div className="p-4 border-b border-slate-100 dark:border-white/5 flex items-center justify-between">
                      <h4 className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-900 dark:text-white">Vendor Invoices & 3-Way Match</h4>
                   </div>
                   <div className="flex-1 overflow-y-auto custom-scrollbar">
                      <table className="w-full text-left">
                        <thead className="bg-slate-50 dark:bg-slate-800 sticky top-0 z-20">
                          <tr className="text-[8px] font-bold text-slate-500 dark:text-slate-400 uppercase border-b border-slate-200 dark:border-white/5 tracking-widest">
                            <th className="py-3 pl-6">Invoice No</th>
                            <th className="py-3">PO Reference</th>
                            <th className="py-3">Amount</th>
                            <th className="py-3">Match Status</th>
                            <th className="py-3 text-right pr-6">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-white/5">
                          {selectedVendorDetail?.invoices?.map((inv: any) => (
                            <tr key={inv.id} className="hover:bg-slate-50 dark:hover:bg-white/[0.03] transition-colors text-[11px]">
                              <td className="py-4 pl-6 font-black tracking-tight">{inv.invoiceNumber}</td>
                              <td className="py-4 font-bold text-orange-600">#{inv.poNumber || inv.poId.substring(0,8)}</td>
                              <td className="py-4 font-black tracking-tighter">₹{inv.amount?.toLocaleString()}</td>
                              <td className="py-4">
                                <div className="flex items-center gap-2">
                                  <span className={clsx(
                                    "w-1.5 h-1.5 rounded-full",
                                    inv.status === 'MATCHED' ? "bg-emerald-500" : "bg-rose-500"
                                  )} />
                                  <span className="font-bold uppercase text-[8px] tracking-[0.1em]">{inv.status}</span>
                                </div>
                              </td>
                              <td className="py-4 text-right pr-6">
                                <button className="p-2 hover:bg-slate-100 dark:hover:bg-white/5 rounded-lg text-slate-400 transition-all"><FileCheck size={14} /></button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                      {(!selectedVendorDetail?.invoices || selectedVendorDetail.invoices.length === 0) && (
                        <div className="p-10 text-center opacity-30 flex flex-col items-center"><Receipt size={40} /><p className="text-[10px] font-bold uppercase tracking-[0.2em] mt-2">No vendor invoices processed</p></div>
                      )}
                   </div>
                </div>
              )}

              {selectedTab === 'LEDGER' && (
                <div className="flex-1 flex flex-col overflow-hidden min-h-0">
                  <div className={clsx("flex-1 overflow-y-auto custom-scrollbar border border-slate-200 dark:border-white/5 rounded-[2rem] bg-white dark:bg-slate-900/20", ledgerLoading ? "opacity-50" : "opacity-100")}>
                      {ledger.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-full py-10 opacity-40"><FileText size={32} className="mb-2" /><p className="text-[10px] font-bold uppercase tracking-[0.2em]">No verified transactions</p></div>
                      ) : (
                        <table className="w-full text-left">
                          <thead className="bg-slate-50 dark:bg-slate-800 sticky top-0 z-20">
                              <tr className="text-[8px] font-bold text-slate-500 dark:text-slate-400 uppercase border-b border-slate-200 dark:border-white/5 tracking-widest">
                                <th className="py-3 pl-6">Timestamp</th>
                                <th className="py-3">Reference / Doc</th>
                                <th className="py-3">Module</th>
                                <th className="py-3 text-right">Debit</th>
                                <th className="py-3 text-right">Credit</th>
                                <th className="py-3 text-right pr-6">Balance</th>
                              </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100 dark:divide-white/5">
                              {ledger.map(e => {
                                const isDebit = e.type === 'DEBIT';
                                const balance = e.runningBalance || e.balanceAfterTransaction || 0;
                                return (
                                  <tr key={e.id} className="hover:bg-slate-50 dark:hover:bg-white/[0.03] transition-colors text-[10px]">
                                    <td className="py-4 pl-6">
                                        <div className="flex flex-col">
                                          <span className="font-bold">{new Date(e.createdAt).toLocaleDateString()}</span>
                                          <span className="text-[7px] text-slate-400 font-black uppercase">{new Date(e.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                        </div>
                                    </td>
                                    <td className="py-4">
                                        <div className="flex flex-col">
                                          <span className="font-black text-orange-600 uppercase tracking-tighter">{e.referenceType}</span>
                                          <span className="text-slate-500 truncate max-w-[150px] font-bold">{e.note || "-"}</span>
                                        </div>
                                    </td>
                                    <td className="py-4"><span className="text-[8px] font-black bg-slate-100 dark:bg-white/5 px-2 py-0.5 rounded-lg uppercase border border-slate-200 dark:border-white/5">{e.sourceModule}</span></td>
                                    <td className="py-4 text-right"><span className={clsx("font-black text-xs tracking-tighter", isDebit ? "text-rose-600" : "opacity-0")}>{isDebit ? `₹${Math.round(e.amount).toLocaleString()}` : "—"}</span></td>
                                    <td className="py-4 text-right"><span className={clsx("font-black text-xs tracking-tighter", !isDebit ? "text-emerald-600" : "opacity-0")}>{!isDebit ? `₹${Math.round(e.amount).toLocaleString()}` : "—"}</span></td>
                                    <td className="py-4 pr-6 text-right">
                                        <div className={clsx("inline-flex flex-col items-end px-3 py-1 rounded-xl border", balance >= 0 ? "text-emerald-600 bg-emerald-500/5 border-emerald-500/10" : "text-rose-600 bg-rose-500/5 border-rose-500/10")}>
                                          <span className="font-black tracking-tighter text-xs">₹{Math.abs(Math.round(balance)).toLocaleString()}</span>
                                          <span className="text-[6px] font-black uppercase">{balance >= 0 ? "VENDOR CREDIT (CR)" : "OUTSTANDING (DR)"}</span>
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
              )}
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center bg-slate-50/30 dark:bg-[#0b0c14] relative">
             <div className="relative z-10 flex flex-col items-center max-w-md text-center px-10">
                <div className="w-24 h-24 rounded-full bg-white dark:bg-slate-900 shadow-xl border border-slate-100 dark:border-white/5 flex items-center justify-center text-slate-200 dark:text-slate-800 mb-8">
                   <Store size={48} />
                </div>
                <h2 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tighter mb-4">Vendor Command Center</h2>
                <p className="text-sm font-bold text-slate-400 mb-10">Select a supplier from the directory to manage procurement, monitor financial ledgers, and track warehouse receiving.</p>
                
                <div className="grid grid-cols-2 gap-4 w-full">
                   <button onClick={() => { setEditing(null); setForm(EMPTY_FORM); setShowForm(true); }} className="p-4 bg-white dark:bg-slate-800 border border-slate-200 dark:border-white/5 rounded-3xl hover:border-orange-500/50 hover:shadow-xl hover:shadow-orange-500/10 transition-all group text-left">
                      <Plus className="text-orange-500 mb-2 group-hover:scale-110 transition-transform" size={24} />
                      <p className="text-[10px] font-black text-slate-900 dark:text-white uppercase tracking-widest">New Supplier</p>
                      <p className="text-[8px] font-bold text-slate-400 mt-1 uppercase">Onboard a vendor</p>
                   </button>
                   <button onClick={() => fetchData()} className="p-4 bg-white dark:bg-slate-800 border border-slate-200 dark:border-white/5 rounded-3xl hover:border-blue-500/50 hover:shadow-xl hover:shadow-blue-500/10 transition-all group text-left">
                      <RefreshCw className="text-blue-500 mb-2 group-hover:rotate-180 transition-transform duration-500" size={24} />
                      <p className="text-[10px] font-black text-slate-900 dark:text-white uppercase tracking-widest">Global Sync</p>
                      <p className="text-[8px] font-bold text-slate-400 mt-1 uppercase">Refresh ERP nodes</p>
                   </button>
                </div>
             </div>
          </div>
        )}
      </div>

      {/* Modals */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-[#12141c] rounded-[2.5rem] shadow-2xl w-full max-w-xl p-8 space-y-6">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white uppercase tracking-tight">{editing ? "Edit Vendor" : "Add Vendor"}</h2>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1 col-span-2"><label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Vendor Name</label><input placeholder="Enter name..." value={form.name} onChange={(e) => setForm({...form, name: e.target.value})} className="w-full px-4 py-3 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl font-semibold text-sm outline-none focus:ring-2 ring-orange-500/20" /></div>
              <div className="space-y-1"><label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Contact Number</label><input placeholder="10 digits..." value={form.contact} maxLength={10} onChange={(e) => setForm({...form, contact: e.target.value.replace(/\D/g, "")})} className="w-full px-4 py-3 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl font-semibold text-sm outline-none focus:ring-2 ring-orange-500/20" /></div>
              <div className="space-y-1"><label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Email Address</label><input placeholder="optional@gmail.com" value={form.email} onChange={(e) => setForm({...form, email: e.target.value})} className="w-full px-4 py-3 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl font-semibold text-sm outline-none focus:ring-2 ring-orange-500/20" /></div>
              <div className="space-y-1 col-span-2"><label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Address</label><textarea placeholder="Address..." value={form.address} rows={2} onChange={(e) => setForm({...form, address: e.target.value})} className="w-full px-4 py-3 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl font-semibold text-sm outline-none focus:ring-2 ring-orange-500/20 resize-none" /></div>
            </div>
            <div className="flex gap-3 pt-4 border-t border-slate-100 dark:border-white/5">
              <button onClick={() => setShowForm(false)} className="px-5 py-2 text-xs font-bold text-slate-500 hover:bg-slate-50 rounded-lg transition-all">Cancel</button>
              <button onClick={handleSave} className="flex-1 px-8 py-2.5 bg-orange-500 text-white rounded-lg text-xs font-bold uppercase transition-all disabled:opacity-50" disabled={saving}>{saving ? "Saving..." : "Confirm"}</button>
            </div>
          </div>
        </div>
      )}

      {showPaymentModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-[#12141c] rounded-[2.5rem] shadow-2xl w-full max-w-md p-8 space-y-6">
            <h2 className="text-lg font-black text-gray-900 dark:text-white">Record Transaction</h2>
            <div className="p-1 bg-slate-100 dark:bg-slate-800/50 rounded-xl flex border border-slate-200 dark:border-white/5">
              <button onClick={() => setPaymentForm({...paymentForm, type: 'PAYMENT'})} className={clsx("flex-1 py-2.5 rounded-lg text-[9px] font-black uppercase transition-all", paymentForm.type === 'PAYMENT' ? "bg-white dark:bg-slate-700 text-orange-600 dark:text-white shadow-sm" : "text-slate-500")}>Pay Due</button>
              <button onClick={() => setPaymentForm({...paymentForm, type: 'ADVANCE'})} className={clsx("flex-1 py-2.5 rounded-lg text-[9px] font-black uppercase transition-all", paymentForm.type === 'ADVANCE' ? "bg-white dark:bg-slate-700 text-indigo-600 dark:text-white shadow-sm" : "text-slate-500")}>Advance</button>
            </div>
            <div className="space-y-1">
              <label className="text-[8px] font-black text-slate-400 uppercase tracking-widest ml-3">Transaction Amount</label>
              <div className="relative group">
                <span className="absolute left-6 top-1/2 -translate-y-1/2 text-xl font-black text-slate-300">₹</span>
                <input value={paymentForm.amount} onChange={e => setPaymentForm({...paymentForm, amount: e.target.value.replace(/[^0-9.]/g, '')})} placeholder="0.00" className="w-full pl-12 pr-6 py-5 text-3xl font-black text-slate-900 dark:text-white bg-slate-50 dark:bg-slate-800/30 border border-slate-200 dark:border-white/5 rounded-2xl outline-none focus:ring-4 ring-orange-500/10" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[8px] font-black text-slate-400 uppercase tracking-widest ml-3">Debit From Account</label>
                <select value={paymentForm.accountId} onChange={e => setPaymentForm({...paymentForm, accountId: e.target.value})} className="w-full px-4 py-3 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl text-sm font-bold outline-none">
                  {accounts.map(a => <option key={a.id} value={a.id}>{a.name} (₹{Math.round(a.balance).toLocaleString()})</option>)}
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-[8px] font-black text-slate-400 uppercase tracking-widest ml-3">Payment Mode</label>
                <select value={paymentForm.paymentMode} onChange={e => setPaymentForm({...paymentForm, paymentMode: e.target.value})} className="w-full px-4 py-3 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl text-sm font-bold outline-none">
                  <option value="CASH">Cash</option>
                  <option value="BANK">Bank Transfer</option>
                  <option value="UPI">UPI / Digital</option>
                  <option value="CHEQUE">Cheque</option>
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-[8px] font-black text-slate-400 uppercase tracking-widest ml-3">Reference No.</label>
                <input placeholder="TXN-123456" value={paymentForm.referenceId} onChange={e => setPaymentForm({...paymentForm, referenceId: e.target.value})} className="w-full px-4 py-3 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl text-sm font-bold outline-none" />
              </div>
              <div className="space-y-1">
                <label className="text-[8px] font-black text-slate-400 uppercase tracking-widest ml-3">Transaction Date</label>
                <input type="date" value={paymentForm.date} onChange={e => setPaymentForm({...paymentForm, date: e.target.value})} className="w-full px-4 py-3 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl text-sm font-bold outline-none" />
              </div>
            </div>
            <div className="space-y-1">
               <label className="text-[8px] font-black text-slate-400 uppercase tracking-widest ml-3">Remarks / Internal Notes</label>
               <input placeholder="Note for accounting..." value={paymentForm.note} onChange={e => setPaymentForm({...paymentForm, note: e.target.value})} className="w-full px-4 py-3 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl text-sm font-bold outline-none" />
            </div>
            {amountNum > 0 && (
              <div className="p-4 bg-orange-500/5 border border-orange-500/10 rounded-2xl space-y-2">
                <p className="text-[8px] font-black text-orange-600 uppercase tracking-widest flex items-center gap-1.5"><Zap size={10} /> Live Impact Preview</p>
                <div className="grid grid-cols-2 gap-4 text-[10px] font-black">
                  <div><p className="text-[7px] text-slate-500 uppercase">Vendor Position</p><span>₹{Math.round(paymentForm.type === 'PAYMENT' ? Math.max(0, (selectedVendor?.due || 0) - amountNum) : (selectedVendor?.advance || 0) + amountNum).toLocaleString()}</span></div>
                  <div><p className="text-[7px] text-slate-500 uppercase">Account Balance</p><span className="text-rose-500">₹{Math.round(accountBalance - amountNum).toLocaleString()}</span></div>
                </div>
              </div>
            )}
            <div className="flex gap-3 pt-4 border-t border-slate-100 dark:border-white/5">
              <button onClick={() => setShowPaymentModal(false)} className="px-5 py-2 text-xs font-bold text-slate-500 hover:bg-slate-50 rounded-lg transition-all">Cancel</button>
              <button onClick={handlePayment} className="flex-1 px-8 py-2.5 bg-orange-500 text-white rounded-lg text-xs font-bold uppercase transition-all" disabled={saving || !amountNum || !paymentForm.accountId}>{saving ? "Wait..." : "Confirm"}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
