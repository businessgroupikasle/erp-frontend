"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import {
  Store, Plus, Search,
  RefreshCw, Edit2, Trash2,
  AlertCircle, History,
  TrendingUp, Wallet,
  CheckCircle2, FileText, Download,
  Phone, Mail, ShieldCheck, Zap, ArrowRight,
  Package, Truck, Receipt, LayoutDashboard, Settings2,
  AlertTriangle, Star, Calendar, FileCheck, Loader2,
  Printer, MoreVertical, Filter, ChevronDown, MessageSquare, Clock, Info, X
} from "lucide-react";
import { clsx } from "clsx";

import api, { vendorsApi, accountsApi } from "@/lib/api";
import { useToast } from "@/context/ToastContext";
import { useAuth } from "@/context/AuthContext";
import AddPartyModal from "@/components/modals/AddPartyModal";



const VENDOR_STATUS = [
  { value: "ACTIVE", label: "Active", color: "text-emerald-600 dark:text-emerald-400", bg: "bg-emerald-50 dark:bg-emerald-400/10", border: "border-emerald-200 dark:border-emerald-400/20" },
  { value: "BLOCKED", label: "Blocked", color: "text-amber-600 dark:text-amber-400", bg: "bg-amber-50 dark:bg-amber-400/10", border: "border-amber-200 dark:border-amber-400/20" },
  { value: "BLACKLISTED", label: "Blacklisted", color: "text-rose-600 dark:text-rose-400", bg: "bg-rose-50 dark:bg-rose-400/10", border: "border-rose-200 dark:border-rose-400/20" },
];

export default function VendorsClient() {
  const router = useRouter();
  const { user } = useAuth();
  const { showToast } = useToast();

  // -- State --
  const [vendors, setVendors] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [filters, setFilters] = useState({ all: true, active: false, inactive: false, toReceive: false, toPay: false });
  const [selectedVendorId, setSelectedVendorId] = useState<string | null>(null);
  const [selectedTab, setSelectedTab] = useState<'OVERVIEW' | 'POS' | 'GRNS' | 'MATERIALS' | 'INVOICES' | 'LEDGER'>('OVERVIEW');

  const [selectedVendorDetail, setSelectedVendorDetail] = useState<any>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [ledger, setLedger] = useState<any[]>([]);
  const [ledgerLoading, setLedgerLoading] = useState(false);
  const [aging, setAging] = useState<any>(null);
  const [summary, setSummary] = useState<any>(null);

  const [isTypeFilterOpen, setIsTypeFilterOpen] = useState(false);
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);

  const [isNumberFilterOpen, setIsNumberFilterOpen] = useState(false);
  const [numberFilter, setNumberFilter] = useState({ category: 'Contains', value: '' });

  const [isDateFilterOpen, setIsDateFilterOpen] = useState(false);
  const [dateFilter, setDateFilter] = useState({ category: 'Equal To', value: '', endDate: '' });

  const [isTotalFilterOpen, setIsTotalFilterOpen] = useState(false);
  
  const [isTransactionSearchOpen, setIsTransactionSearchOpen] = useState(false);
  const [transactionSearchQuery, setTransactionSearchQuery] = useState("");
  
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isMoreMenuOpen, setIsMoreMenuOpen] = useState(false);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest('.filter-popover-container')) {
        setIsFilterOpen(false);
        setIsTypeFilterOpen(false);
        setIsBalanceFilterOpen(false);
        setIsMoreMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const [settings, setSettings] = useState({
    partyGrouping: false,
    shippingAddress: false,
    managePartyStatus: false,
    enablePaymentReminder: true,
    reminderDays: "1"
  });
  
  const [saving, setSaving] = useState(false);
  const [totalFilter, setTotalFilter] = useState({ category: 'Equal To', value: '', endValue: '' });

  const [isBalanceFilterOpen, setIsBalanceFilterOpen] = useState(false);
  const [balanceFilter, setBalanceFilter] = useState({ category: 'Equal To', value: '', endValue: '' });

  const transactionTypes = [
    "Sale", "Sale (e-Invoice)", "Purchase", "Credit Note",
    "Credit Note (e-Invoice)", "Debit Note", "Sale Order",
    "Purchase Order", "Payment-In", "Payment-Out", "Estimate",
    "Proforma Invoice", "Delivery Challan", "Receivable Opening Balance",
    "Payable Opening Balance", "Party to Party [Received]",
    "Party to Party [Paid]", "Sale FA", "Sale FA (e-Invoice)",
    "Purchase FA", "Sale[Cancelled]", "Job work out (Challan)",
    "Purchase (Job work)", "Journal Entry"
  ];

  // -- Modals --
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentForm, setPaymentForm] = useState({
    amount: "",
    note: "",
    type: "PAYMENT" as "PAYMENT" | "ADVANCE",
    accountId: "",
    paymentMode: "CASH",
    referenceId: "",
    vendorInvoiceId: "",
    date: new Date().toISOString().split('T')[0]
  });
  const [vendorInvoices, setVendorInvoices] = useState<any[]>([]);
  const [loadingInvoices, setLoadingInvoices] = useState(false);
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
      if (!matchSearch) return false;

      if (filters.all) return true;

      const checkStatus = filters.active || filters.inactive;
      let statusMatch = true;
      if (checkStatus) {
        statusMatch = (filters.active && v.status === 'ACTIVE') || (filters.inactive && v.status !== 'ACTIVE');
      }

      const bal = Number(v.balance) || Number(v.closingBalance) || Number(v.openingBalance) || 0;
      const checkBalance = filters.toReceive || filters.toPay;
      let balanceMatch = true;
      if (checkBalance) {
        balanceMatch = (filters.toPay && bal > 0) || (filters.toReceive && bal < 0);
      }

      if (!checkStatus && !checkBalance) return false;

      return statusMatch && balanceMatch;
    });
  }, [vendors, search, filters]);

  const selectedVendor = useMemo(() => vendors.find(v => v.id === selectedVendorId) || null, [vendors, selectedVendorId]);

  // -- Actions --

  const handlePayment = async () => {
    if (!selectedVendorId || !paymentForm.amount || !paymentForm.accountId) {
      showToast("Please select an account and amount", "error");
      return;
    }
    setSaving(true);
    try {
      await vendorsApi.recordPayment(selectedVendorId, {
        amount: Number(paymentForm.amount),
        type: paymentForm.type === 'PAYMENT' ? 'INVOICE_LINKED' : paymentForm.type,
        note: paymentForm.note || `${paymentForm.type} Settlement`,
        accountId: paymentForm.accountId,
        vendorInvoiceId: paymentForm.vendorInvoiceId || undefined,
        paymentMode: (() => {
          const type = accounts.find(a => a.id === paymentForm.accountId)?.type;
          if (type === 'BANK') return 'BANK_TRANSFER';
          return type || 'CASH';
        })()
      });
      showToast("Financial settlement recorded", "success");
      setShowPaymentModal(false);
      fetchData();
      fetchVendorDetails(selectedVendorId);
    } catch (e: any) {
      showToast(e.response?.data?.error || "Settlement Failed", "error");
    } finally { setSaving(false); }
  };

  const fetchVendorInvoices = async (vId: string) => {
    setLoadingInvoices(true);
    try {
      const res = await vendorsApi.getById(vId); // Or use vendorInvoicesApi
      const invs = res.data?.invoices || [];
      setVendorInvoices(invs.filter((i: any) => i.status !== 'PAID' && i.status !== 'CANCELLED'));
    } catch (e) {
      setVendorInvoices([]);
    } finally {
      setLoadingInvoices(false);
    }
  };

  const amountNum = Number(paymentForm.amount) || 0;
  const selectedAccount = accounts.find(a => a.id === paymentForm.accountId);
  const accountBalance = selectedAccount?.balance || 0;

  return (
    <div className="flex h-[calc(100vh-100px)] bg-slate-50 dark:bg-[#0b0c14] -m-4 overflow-hidden selection:bg-orange-500/30 selection:text-orange-500 transition-colors">

      {/* Sidebar */}
      <div className="w-[300px] border-r border-slate-200 flex flex-col shrink-0 bg-white relative z-10">
        
        {/* Sidebar Header */}
        <div className="px-4 py-3 border-b border-slate-200 flex items-center justify-between">
          <button className="flex items-center gap-2 text-lg font-bold text-slate-800 hover:text-blue-600 transition-colors">
            Vendors <ChevronDown size={18} className="text-blue-500" />
          </button>
          <button
            onClick={() => { setEditing(null); setShowForm(true); }}
            className="p-1.5 bg-orange-500 hover:bg-orange-600 text-white rounded-full transition-all shadow-sm active:scale-95"
          >
            <Plus size={16} />
          </button>
        </div>

        {/* Search & List Headers */}
        <div className="px-3 py-2 border-b border-slate-200 space-y-2">
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search Vendor Name"
              className="w-full pl-9 pr-3 py-1.5 border border-slate-200 rounded-full text-xs outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-400 text-slate-700"
            />
          </div>

          <div className="flex items-center justify-between px-3 py-2 border-b border-slate-100 relative filter-popover-container">
            <div 
              className="flex items-center gap-2 cursor-pointer"
              onClick={() => setIsFilterOpen(!isFilterOpen)}
            >
              <span className="text-[12px] font-bold text-slate-500">Vendor Name</span>
              <Filter size={12} className="text-orange-500" />
            </div>

            {/* Filter Popover */}
            {isFilterOpen && (
              <div className="absolute top-full left-4 mt-2 w-48 bg-white rounded-xl shadow-2xl border border-slate-100 z-50 p-3">
                <div className="space-y-2 mb-3">
                  {[
                    { id: "all", label: "All" },
                    { id: "active", label: "Active" },
                    { id: "inactive", label: "Inactive" },
                    { id: "toReceive", label: "To Receive" },
                    { id: "toPay", label: "To Pay" },
                  ].map((f) => (
                    <label key={f.id} className="flex items-center gap-3 cursor-pointer group">
                      <div className="relative flex items-center justify-center">
                        <input 
                          type="checkbox" 
                          checked={(filters as any)[f.id]}
                          onChange={(e) => setFilters({...filters, [f.id]: e.target.checked, all: f.id === 'all' ? e.target.checked : false})}
                          className="peer appearance-none w-4 h-4 rounded border border-slate-300 checked:bg-orange-500 checked:border-orange-500 cursor-pointer transition-colors" 
                        />
                        <svg className="absolute w-3 h-3 text-white opacity-0 peer-checked:opacity-100 pointer-events-none" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="20 6 9 17 4 12"></polyline>
                        </svg>
                      </div>
                      <span className="text-xs font-medium text-slate-700">{f.label}</span>
                    </label>
                  ))}
                </div>
                <div className="flex items-center justify-between gap-3 pt-3 border-t border-slate-100">
                  <button 
                    onClick={() => { setFilters({ all: true, active: false, inactive: false, toReceive: false, toPay: false }); setIsFilterOpen(false); }}
                    className="flex-1 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-600 text-xs font-bold rounded-full transition-colors"
                  >
                    Clear
                  </button>
                  <button 
                    onClick={() => setIsFilterOpen(false)}
                    className="flex-1 py-1.5 bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold rounded-full transition-colors"
                  >
                    Apply
                  </button>
                </div>
              </div>
            )}
            
            <div className="flex items-center gap-1.5 cursor-pointer relative">
              <span className="text-[12px] font-bold text-slate-500">Amount</span>
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto custom-scrollbar">
          {loading ? (
            <div className="p-6 text-center text-xs font-semibold text-slate-400 animate-pulse">Loading vendors...</div>
          ) : filteredVendors.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 text-slate-400">
              <ShieldCheck size={32} className="opacity-10 mb-2" />
              <p className="text-[10px] font-bold uppercase tracking-[0.1em]">No vendors found</p>
            </div>
          ) : (
            filteredVendors.map(v => {
              const isActive = selectedVendorId === v.id;
              const bal = Number(v.balance) || Number(v.closingBalance) || Number(v.openingBalance) || 0;
              return (
                <div
                  key={v.id}
                  onClick={() => setSelectedVendorId(v.id)}
                  className={`flex items-center justify-between px-4 py-3 cursor-pointer border-b border-slate-50 transition-colors ${
                    isActive ? "bg-[#e6f4fc]" : "hover:bg-slate-50 bg-white"
                  }`}
                >
                  <span className="text-sm text-slate-800 truncate pr-2">{v.name}</span>
                  <div className="flex flex-col items-end shrink-0">
                    <span className={`text-sm font-semibold ${
                      bal > 0 ? "text-rose-500" : bal < 0 ? "text-emerald-500" : "text-slate-400"
                    }`}>
                      {bal === 0 ? "0.00" : Math.abs(bal).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </span>
                    {bal !== 0 && (
                      <span className="text-[9px] font-bold uppercase text-slate-400 -mt-0.5">
                        {bal > 0 ? "To Pay" : "To Receive"}
                      </span>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Main Dashboard */}
      <div className="flex-1 flex flex-col relative overflow-hidden bg-white dark:bg-[#0b0c14]">
        {selectedVendor ? (
          <>
            {/* Party Details Header */}
            <div className="px-6 py-4 flex items-center justify-between border-b border-slate-200 dark:border-white/5 bg-white dark:bg-[#0b0c14]">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <h2 className="text-lg font-bold text-slate-800 dark:text-white tracking-tight">{selectedVendor.name}</h2>
                  <button onClick={() => { setEditing(selectedVendor); setShowForm(true); }} className="text-orange-500 hover:text-orange-600 transition-colors">
                    <Edit2 size={16} />
                  </button>
                </div>
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-400 font-bold">
                  {selectedVendor.vendorCode || "V-NEW"}
                </span>
              </div>
              <div className="flex items-center gap-4">
                <button 
                  onClick={() => { fetchVendorInvoices(selectedVendor.id); setShowPaymentModal(true); }}
                  className="flex items-center gap-2 px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-xl text-xs font-bold shadow-sm transition-all"
                >
                  <Wallet size={14} /> Record Payment
                </button>
                <div className="flex items-center gap-2 text-slate-400">
                  <button onClick={() => setIsSettingsOpen(true)} className="hover:text-slate-600 dark:hover:text-slate-200 transition-colors"><Settings2 size={18} /></button>
                  <div className="relative filter-popover-container">
                    <button onClick={() => setIsMoreMenuOpen(!isMoreMenuOpen)} className="hover:text-slate-600 dark:hover:text-slate-200 transition-colors"><MoreVertical size={18} /></button>
                    {/* More Options Menu */}
                    {isMoreMenuOpen && (
                      <div className="absolute top-full right-0 mt-2 w-60 bg-white rounded-xl shadow-xl border border-slate-200 dark:border-white/5 z-50 py-1.5">
                        {[
                          "Import from Excel",
                          "Import from Phone",
                          "Import Via Google Contacts",
                          "Party Statement (Report)",
                          "All Parties (Report)"
                        ].map((item, i) => (
                          <button key={i} className="w-full text-left px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-white/5 transition-colors">
                            {item}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Tab Selection */}
            <div className="flex gap-6 px-6 border-b border-slate-200 dark:border-white/5 bg-white dark:bg-[#0b0c14] shrink-0">
              {[
                { id: 'OVERVIEW', label: 'Overview' },
                { id: 'LEDGER', label: 'Ledger (Transactions)' },
                { id: 'MATERIALS', label: 'Material History' }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setSelectedTab(tab.id as any)}
                  className={clsx(
                    "text-xs font-bold uppercase tracking-wider pb-3 pt-3 border-b-2 transition-all",
                    selectedTab === tab.id ? "border-orange-500 text-orange-600" : "border-transparent text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                  )}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Tab Contents */}
            {selectedTab === 'OVERVIEW' && (
              <div className="p-6 space-y-6 overflow-y-auto flex-1 custom-scrollbar bg-slate-50/50 dark:bg-[#0b0c14]">
                {/* Financial Formula Card */}
                <div className="bg-white dark:bg-card p-6 rounded-3xl border border-slate-100 dark:border-white/5 shadow-sm">
                  <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Outstanding Balance Formula</h4>
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                      <p className={`text-2xl font-black ${Number(selectedVendor.balance) > 0 ? "text-rose-500" : Number(selectedVendor.balance) < 0 ? "text-emerald-500" : "text-slate-500"}`}>
                        ₹ {Math.round(Math.abs(selectedVendor.balance || 0)).toLocaleString()}
                        {Number(selectedVendor.balance) !== 0 && (
                          <span className="text-xs font-bold uppercase tracking-wider ml-1.5 text-slate-400">
                            {Number(selectedVendor.balance) > 0 ? "To Pay" : "Advance"}
                          </span>
                        )}
                      </p>
                      <p className="text-[10px] font-bold text-slate-400 uppercase mt-0.5">Outstanding Balance</p>
                    </div>
                    <div className="text-2xl text-slate-300 font-light hidden md:block">=</div>
                    <div>
                      <p className="text-xl font-bold text-slate-700 dark:text-slate-300">
                        ₹ {Math.round(selectedVendor.totalPurchased || 0).toLocaleString()}
                      </p>
                      <p className="text-[10px] font-bold text-slate-400 uppercase mt-0.5">Total Purchases</p>
                    </div>
                    <div className="text-2xl text-slate-300 font-light hidden md:block">-</div>
                    <div>
                      <p className="text-xl font-bold text-slate-700 dark:text-slate-300">
                        ₹ {Math.round(selectedVendor.totalPaid || 0).toLocaleString()}
                      </p>
                      <p className="text-[10px] font-bold text-slate-400 uppercase mt-0.5">Payments Made</p>
                    </div>
                  </div>
                </div>

                {/* Workflow Pipeline */}
                <div className="bg-white dark:bg-card p-6 rounded-3xl border border-slate-100 dark:border-white/5 shadow-sm">
                  <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Procurement Workflow</h4>
                  <div className="flex flex-col md:flex-row items-center justify-between gap-4 md:gap-2 text-center">
                    <div className="flex flex-col items-center flex-1">
                      <div className="w-10 h-10 rounded-full bg-emerald-500 flex items-center justify-center text-white shadow-lg shadow-emerald-500/20">
                        <CheckCircle2 size={18} />
                      </div>
                      <p className="text-[10px] font-black text-slate-700 dark:text-slate-300 mt-2 uppercase tracking-wider">Vendor Onboarded</p>
                      <p className="text-[9px] text-slate-400 mt-0.5">{selectedVendor.status || 'ACTIVE'}</p>
                    </div>
                    <div className="text-slate-300 font-light hidden md:block">&rarr;</div>
                    <div className="flex flex-col items-center flex-1">
                      <div className="w-10 h-10 rounded-full bg-orange-500 flex items-center justify-center text-white shadow-lg shadow-orange-500/20">
                        <Package size={18} />
                      </div>
                      <p className="text-[10px] font-black text-slate-700 dark:text-slate-300 mt-2 uppercase tracking-wider">POs Linked</p>
                      <p className="text-[9px] text-slate-400 mt-0.5">{selectedVendorDetail?.orders?.length || 0} orders</p>
                    </div>
                    <div className="text-slate-300 font-light hidden md:block">&rarr;</div>
                    <div className="flex flex-col items-center flex-1">
                      <div className="w-10 h-10 rounded-full bg-indigo-500 flex items-center justify-center text-white shadow-lg shadow-indigo-500/20">
                        <Truck size={18} />
                      </div>
                      <p className="text-[10px] font-black text-slate-700 dark:text-slate-300 mt-2 uppercase tracking-wider">GRN Linked</p>
                      <p className="text-[9px] text-slate-400 mt-0.5">
                        {selectedVendorDetail?.orders?.flatMap((o: any) => o.goodsReceipts || [])?.length || 0} received
                      </p>
                    </div>
                    <div className="text-slate-300 font-light hidden md:block">&rarr;</div>
                    <div className="flex flex-col items-center flex-1">
                      <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center text-white shadow-lg shadow-blue-500/20">
                        <Receipt size={18} />
                      </div>
                      <p className="text-[10px] font-black text-slate-700 dark:text-slate-300 mt-2 uppercase tracking-wider">Bills Linked</p>
                      <p className="text-[9px] text-slate-400 mt-0.5">{selectedVendorDetail?.invoices?.length || 0} invoices</p>
                    </div>
                    <div className="text-slate-300 font-light hidden md:block">&rarr;</div>
                    <div className="flex flex-col items-center flex-1">
                      <div className="w-10 h-10 rounded-full bg-violet-500 flex items-center justify-center text-white shadow-lg shadow-violet-500/20">
                        <Wallet size={18} />
                      </div>
                      <p className="text-[10px] font-black text-slate-700 dark:text-slate-300 mt-2 uppercase tracking-wider">Payments Linked</p>
                      <p className="text-[9px] text-slate-400 mt-0.5">₹ {Math.round(selectedVendor.totalPaid || 0).toLocaleString()}</p>
                    </div>
                  </div>
                </div>

                {/* Profile Details Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-white dark:bg-card p-6 rounded-3xl border border-slate-100 dark:border-white/5 shadow-sm space-y-4">
                    <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Business Identity</h4>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-[10px] text-slate-400 uppercase font-black">Vendor Code</p>
                        <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">{selectedVendorDetail?.vendorCode || selectedVendor.vendorCode || "—"}</p>
                      </div>
                      <div>
                        <p className="text-[10px] text-slate-400 uppercase font-black">GSTIN</p>
                        <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">{selectedVendorDetail?.gstNumber || selectedVendor.gstNumber || "—"}</p>
                      </div>
                      <div>
                        <p className="text-[10px] text-slate-400 uppercase font-black">Material Category</p>
                        <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">{selectedVendorDetail?.category || selectedVendor.category || "General Supplier"}</p>
                      </div>
                      <div>
                        <p className="text-[10px] text-slate-400 uppercase font-black">Credit Period (Payment Terms)</p>
                        <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                          {(() => {
                            const terms = selectedVendorDetail?.paymentTerms || selectedVendor.paymentTerms;
                            if (terms === 'NET_7') return '7 Days';
                            if (terms === 'NET_30') return '30 Days';
                            if (terms === 'ADVANCE') return 'Advance Payment';
                            return 'Immediate';
                          })()}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white dark:bg-card p-6 rounded-3xl border border-slate-100 dark:border-white/5 shadow-sm space-y-4">
                    <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Contact & Location</h4>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-[10px] text-slate-400 uppercase font-black">Phone Number</p>
                        <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">{selectedVendorDetail?.contact || selectedVendor.contact || "—"}</p>
                      </div>
                      <div>
                        <p className="text-[10px] text-slate-400 uppercase font-black">Email Address</p>
                        <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">{selectedVendorDetail?.email || selectedVendor.email || "—"}</p>
                      </div>
                      <div className="col-span-2">
                        <p className="text-[10px] text-slate-400 uppercase font-black">Registered Address</p>
                        <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">{selectedVendorDetail?.address || selectedVendor.address || "—"}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {selectedTab === 'LEDGER' && (
              <div className="flex-1 flex flex-col min-h-0 bg-white dark:bg-[#0b0c14]">
                {/* Section Header */}
                <div className="flex items-center justify-between px-6 py-3 border-b border-slate-200 dark:border-white/5">
                  <h3 className="text-sm font-bold text-slate-700 dark:text-white">Transactions Ledger</h3>
                  <div className="flex items-center gap-3 text-slate-400">
                    {isTransactionSearchOpen ? (
                      <div className="flex items-center bg-slate-100 dark:bg-white/5 rounded-full px-3 py-1">
                        <Search size={14} className="text-slate-400" />
                        <input 
                          type="text" 
                          autoFocus
                          placeholder="Search transactions..." 
                          className="bg-transparent border-none text-xs w-32 focus:outline-none ml-2 text-slate-700 dark:text-slate-300 placeholder:text-slate-400"
                          value={transactionSearchQuery}
                          onChange={(e) => setTransactionSearchQuery(e.target.value)}
                          onBlur={() => !transactionSearchQuery && setIsTransactionSearchOpen(false)}
                        />
                      </div>
                    ) : (
                      <button onClick={() => setIsTransactionSearchOpen(true)} className="hover:text-slate-600 dark:hover:text-slate-200 transition-colors"><Search size={16} /></button>
                    )}
                    <button className="hover:text-slate-600 dark:hover:text-slate-200 transition-colors"><Printer size={16} /></button>
                    <button className="text-emerald-600 hover:text-emerald-700 transition-colors"><FileText size={16} className="opacity-80" /></button>
                  </div>
                </div>

                {/* Transactions Table */}
                <div className="flex-1 overflow-auto custom-scrollbar">
                  <table className="w-full text-left border-collapse">
                    <thead className="bg-white dark:bg-[#0b0c14] sticky top-0 z-10 border-b border-slate-200 dark:border-white/5">
                      <tr>
                        <th className="px-6 py-3 font-semibold text-xs text-slate-500 border-r border-slate-100 dark:border-white/5 relative filter-popover-container">
                          <div className="flex items-center justify-between">
                            Type
                            <button onClick={() => setIsTypeFilterOpen(!isTypeFilterOpen)}>
                              <Filter size={14} className="text-slate-400 hover:text-slate-700" />
                            </button>
                          </div>
                          {/* Type Filter Popover */}
                          {isTypeFilterOpen && (
                            <div className="absolute top-full left-0 mt-1 w-56 bg-white rounded-xl shadow-xl border border-slate-100 z-50 overflow-hidden flex flex-col font-normal text-slate-700 normal-case tracking-normal">
                              <div className="max-h-[240px] overflow-y-auto custom-scrollbar p-2 space-y-1">
                                {transactionTypes.map(type => (
                                  <label key={type} className="flex items-start gap-2 p-1.5 hover:bg-slate-50 rounded cursor-pointer group">
                                    <input
                                      type="checkbox"
                                      checked={selectedTypes.includes(type)}
                                      onChange={(e) => {
                                        if (e.target.checked) setSelectedTypes([...selectedTypes, type]);
                                        else setSelectedTypes(selectedTypes.filter(t => t !== type));
                                      }}
                                      className="mt-0.5 w-3.5 h-3.5 rounded border-slate-300 text-rose-500 focus:ring-rose-500 cursor-pointer"
                                    />
                                    <span className="text-[11px] leading-tight group-hover:text-slate-900">{type}</span>
                                  </label>
                                ))}
                              </div>
                              <div className="p-2 border-t border-slate-100 flex items-center gap-2 bg-white">
                                <button
                                  onClick={() => { setSelectedTypes([]); setIsTypeFilterOpen(false); }}
                                  className="flex-1 py-1.5 bg-white border-2 border-slate-900 hover:bg-slate-50 text-slate-900 rounded-lg text-xs font-bold transition-colors"
                                >
                                  Clear
                                </button>
                                <button
                                  onClick={() => setIsTypeFilterOpen(false)}
                                  className="flex-1 py-1.5 bg-orange-500 hover:bg-orange-600 text-white rounded-lg text-xs font-bold transition-colors shadow-sm border-2 border-orange-500"
                                >
                                  Apply
                                </button>
                              </div>
                            </div>
                          )}
                        </th>
                        <th className="px-6 py-3 font-semibold text-xs text-slate-500 border-r border-slate-100 dark:border-white/5 relative">
                          <div className="flex items-center justify-between">
                            Number
                            <button onClick={() => setIsNumberFilterOpen(!isNumberFilterOpen)}>
                              <Filter size={14} className="text-slate-400 hover:text-slate-700" />
                            </button>
                          </div>
                          {isNumberFilterOpen && (
                            <div className="absolute top-full left-0 mt-1 w-56 bg-white rounded-xl shadow-xl border border-slate-100 z-50 overflow-hidden flex flex-col font-normal text-slate-700 normal-case tracking-normal">
                              <div className="p-3 space-y-3">
                                <div>
                                  <label className="text-[10px] font-bold text-slate-400">Select Category</label>
                                  <div className="relative mt-1">
                                    <select
                                      className="w-full appearance-none bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-xs text-slate-700 focus:outline-none focus:border-slate-300"
                                      value={numberFilter.category}
                                      onChange={e => setNumberFilter({ ...numberFilter, category: e.target.value })}
                                    >
                                      <option>Contains</option>
                                      <option>Exact match</option>
                                    </select>
                                    <ChevronDown size={14} className="absolute right-2 top-2 text-slate-400 pointer-events-none" />
                                  </div>
                                </div>
                                <div>
                                  <label className="text-[10px] font-bold text-slate-400">Number</label>
                                  <input
                                    type="text"
                                    className="w-full mt-1 border border-slate-200 rounded-lg px-3 py-1.5 text-xs text-slate-700 focus:outline-none focus:border-slate-300"
                                    value={numberFilter.value}
                                    onChange={e => setNumberFilter({ ...numberFilter, value: e.target.value })}
                                  />
                                </div>
                              </div>
                              <div className="p-2 border-t border-slate-100 flex items-center gap-2 bg-white">
                                <button onClick={() => { setNumberFilter({ category: 'Contains', value: '' }); setIsNumberFilterOpen(false) }} className="flex-1 py-1.5 bg-white border-2 border-slate-900 hover:bg-slate-50 text-slate-900 rounded-lg text-xs font-bold transition-colors">Clear</button>
                                <button onClick={() => setIsNumberFilterOpen(false)} className="flex-1 py-1.5 bg-orange-500 hover:bg-orange-600 text-white border-2 border-orange-500 rounded-lg text-xs font-bold transition-colors shadow-sm">Apply</button>
                              </div>
                            </div>
                          )}
                        </th>
                        <th className="px-6 py-3 font-semibold text-xs text-slate-500 border-r border-slate-100 dark:border-white/5 relative">
                          <div className="flex items-center justify-between">
                            <span className="flex items-center gap-1">Date <ChevronDown size={12} className="text-slate-400" /></span>
                            <button onClick={() => setIsDateFilterOpen(!isDateFilterOpen)}>
                              <Filter size={14} className="text-slate-400 hover:text-slate-700" />
                            </button>
                          </div>
                          {isDateFilterOpen && (
                            <div className="absolute top-full left-0 mt-1 w-56 bg-white rounded-xl shadow-xl border border-slate-100 z-50 overflow-hidden flex flex-col font-normal text-slate-700 normal-case tracking-normal">
                              <div className="p-3 space-y-3">
                                <div>
                                  <label className="text-[10px] font-bold text-slate-400">Select Category</label>
                                  <div className="relative mt-1">
                                    <select
                                      className="w-full appearance-none bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-xs text-slate-700 focus:outline-none focus:border-slate-300"
                                      value={dateFilter.category}
                                      onChange={e => setDateFilter({ ...dateFilter, category: e.target.value })}
                                    >
                                      <option>Equal To</option>
                                      <option>Less Than</option>
                                      <option>Greater Than</option>
                                      <option>Range</option>
                                    </select>
                                    <ChevronDown size={14} className="absolute right-2 top-2 text-slate-400 pointer-events-none" />
                                  </div>
                                </div>
                                <div>
                                  <label className="text-[10px] font-bold text-slate-400">{dateFilter.category === 'Range' ? 'Start Date' : 'Select Date'}</label>
                                  <div className="relative mt-1">
                                    <input
                                      type="date"
                                      className="w-full border border-slate-200 rounded-lg pl-3 pr-8 py-1.5 text-xs text-slate-700 focus:outline-none focus:border-slate-300 [&::-webkit-calendar-picker-indicator]:opacity-0 [&::-webkit-calendar-picker-indicator]:absolute [&::-webkit-calendar-picker-indicator]:right-0 [&::-webkit-calendar-picker-indicator]:w-full [&::-webkit-calendar-picker-indicator]:cursor-pointer"
                                      value={dateFilter.value}
                                      onChange={e => setDateFilter({ ...dateFilter, value: e.target.value })}
                                    />
                                    <Calendar size={14} className="absolute right-2 top-1.5 text-blue-500 pointer-events-none" />
                                  </div>
                                </div>
                                {dateFilter.category === 'Range' && (
                                  <div>
                                    <label className="text-[10px] font-bold text-slate-400">End Date</label>
                                    <div className="relative mt-1">
                                      <input
                                        type="date"
                                        className="w-full border border-slate-200 rounded-lg pl-3 pr-8 py-1.5 text-xs text-slate-700 focus:outline-none focus:border-slate-300 [&::-webkit-calendar-picker-indicator]:opacity-0 [&::-webkit-calendar-picker-indicator]:absolute [&::-webkit-calendar-picker-indicator]:right-0 [&::-webkit-calendar-picker-indicator]:w-full [&::-webkit-calendar-picker-indicator]:cursor-pointer"
                                        value={dateFilter.endDate}
                                        onChange={e => setDateFilter({ ...dateFilter, endDate: e.target.value })}
                                      />
                                      <Calendar size={14} className="absolute right-2 top-1.5 text-blue-500 pointer-events-none" />
                                    </div>
                                  </div>
                                )}
                              </div>
                              <div className="p-2 border-t border-slate-100 flex items-center gap-2 bg-white">
                                <button onClick={() => { setDateFilter({ category: 'Equal To', value: '', endDate: '' }); setIsDateFilterOpen(false) }} className="flex-1 py-1.5 bg-white border-2 border-slate-900 hover:bg-slate-50 text-slate-900 rounded-lg text-xs font-bold transition-colors">Clear</button>
                                <button onClick={() => setIsDateFilterOpen(false)} className="flex-1 py-1.5 bg-orange-500 hover:bg-orange-600 text-white border-2 border-orange-500 rounded-lg text-xs font-bold transition-colors shadow-sm">Apply</button>
                              </div>
                            </div>
                          )}
                        </th>
                        <th className="px-6 py-3 font-semibold text-xs text-slate-500 border-r border-slate-100 dark:border-white/5 relative text-right">
                          <div className="flex items-center justify-end gap-2">
                            Total
                            <button onClick={() => setIsTotalFilterOpen(!isTotalFilterOpen)}>
                              <Filter size={14} className="text-slate-400 hover:text-slate-700" />
                            </button>
                          </div>
                          {isTotalFilterOpen && (
                            <div className="absolute top-full right-0 mt-1 w-56 bg-white rounded-xl shadow-xl border border-slate-100 z-50 overflow-hidden flex flex-col font-normal text-slate-700 normal-case tracking-normal text-left">
                              <div className="p-3 space-y-3">
                                <div>
                                  <label className="text-[10px] font-bold text-slate-400">Select Category</label>
                                  <div className="relative mt-1">
                                    <select
                                      className="w-full appearance-none bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-xs text-slate-700 focus:outline-none focus:border-slate-300"
                                      value={totalFilter.category}
                                      onChange={e => setTotalFilter({ ...totalFilter, category: e.target.value })}
                                    >
                                      <option>Equal To</option>
                                      <option>Less Than</option>
                                      <option>Greater Than</option>
                                      <option>Range</option>
                                    </select>
                                    <ChevronDown size={14} className="absolute right-2 top-2 text-slate-400 pointer-events-none" />
                                  </div>
                                </div>
                                <div>
                                  <label className="text-[10px] font-bold text-slate-400">{totalFilter.category === 'Range' ? 'Min Amount' : 'Amount'}</label>
                                  <input
                                    type="number"
                                    className="w-full mt-1 border border-slate-200 rounded-lg px-3 py-1.5 text-xs text-slate-700 focus:outline-none focus:border-slate-300"
                                    value={totalFilter.value}
                                    onChange={e => setTotalFilter({ ...totalFilter, value: e.target.value })}
                                  />
                                </div>
                                {totalFilter.category === 'Range' && (
                                  <div>
                                    <label className="text-[10px] font-bold text-slate-400">Max Amount</label>
                                    <input
                                      type="number"
                                      className="w-full mt-1 border border-slate-200 rounded-lg px-3 py-1.5 text-xs text-slate-700 focus:outline-none focus:border-slate-300"
                                      value={totalFilter.endValue}
                                      onChange={e => setTotalFilter({ ...totalFilter, endValue: e.target.value })}
                                    />
                                  </div>
                                )}
                              </div>
                              <div className="p-2 border-t border-slate-100 flex items-center gap-2 bg-white">
                                <button onClick={() => { setTotalFilter({ category: 'Equal To', value: '', endValue: '' }); setIsTotalFilterOpen(false) }} className="flex-1 py-1.5 bg-white border-2 border-slate-900 hover:bg-slate-50 text-slate-900 rounded-lg text-xs font-bold transition-colors">Clear</button>
                                <button onClick={() => setIsTotalFilterOpen(false)} className="flex-1 py-1.5 bg-orange-500 hover:bg-orange-600 text-white border-2 border-orange-500 rounded-lg text-xs font-bold transition-colors shadow-sm">Apply</button>
                              </div>
                            </div>
                          )}
                        </th>
                        <th className="px-6 py-3 font-semibold text-xs text-slate-500 border-r border-slate-100 dark:border-white/5 relative text-right">
                          <div className="flex items-center justify-end gap-2">
                            Balance
                            <button onClick={() => setIsBalanceFilterOpen(!isBalanceFilterOpen)}>
                              <Filter size={14} className="text-slate-400 hover:text-slate-700" />
                            </button>
                          </div>
                          {isBalanceFilterOpen && (
                            <div className="absolute top-full right-0 mt-1 w-56 bg-white rounded-xl shadow-xl border border-slate-100 z-50 overflow-hidden flex flex-col font-normal text-slate-700 normal-case tracking-normal text-left">
                              <div className="p-3 space-y-3">
                                <div>
                                  <label className="text-[10px] font-bold text-slate-400">Select Category</label>
                                  <div className="relative mt-1">
                                    <select
                                      className="w-full appearance-none bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-xs text-slate-700 focus:outline-none focus:border-slate-300"
                                      value={balanceFilter.category}
                                      onChange={e => setBalanceFilter({ ...balanceFilter, category: e.target.value })}
                                    >
                                      <option>Equal To</option>
                                      <option>Less Than</option>
                                      <option>Greater Than</option>
                                      <option>Range</option>
                                    </select>
                                    <ChevronDown size={14} className="absolute right-2 top-2 text-slate-400 pointer-events-none" />
                                  </div>
                                </div>
                                <div>
                                  <label className="text-[10px] font-bold text-slate-400">{balanceFilter.category === 'Range' ? 'Min Amount' : 'Amount'}</label>
                                  <input
                                    type="number"
                                    className="w-full mt-1 border border-slate-200 rounded-lg px-3 py-1.5 text-xs text-slate-700 focus:outline-none focus:border-slate-300"
                                    value={balanceFilter.value}
                                    onChange={e => setBalanceFilter({ ...balanceFilter, value: e.target.value })}
                                  />
                                </div>
                                {balanceFilter.category === 'Range' && (
                                  <div>
                                    <label className="text-[10px] font-bold text-slate-400">Max Amount</label>
                                    <input
                                      type="number"
                                      className="w-full mt-1 border border-slate-200 rounded-lg px-3 py-1.5 text-xs text-slate-700 focus:outline-none focus:border-slate-300"
                                      value={balanceFilter.endValue}
                                      onChange={e => setBalanceFilter({ ...balanceFilter, endValue: e.target.value })}
                                    />
                                  </div>
                                )}
                              </div>
                              <div className="p-2 border-t border-slate-100 flex items-center gap-2 bg-white">
                                <button onClick={() => { setBalanceFilter({ category: 'Equal To', value: '', endValue: '' }); setIsBalanceFilterOpen(false) }} className="flex-1 py-1.5 bg-white border-2 border-slate-900 hover:bg-slate-50 text-slate-900 rounded-lg text-xs font-bold transition-colors">Clear</button>
                                <button onClick={() => setIsBalanceFilterOpen(false)} className="flex-1 py-1.5 bg-orange-500 hover:bg-orange-600 text-white border-2 border-orange-500 rounded-lg text-xs font-bold transition-colors shadow-sm">Apply</button>
                              </div>
                            </div>
                          )}
                        </th>
                        <th className="w-10 px-2 py-3 border-b border-slate-200 dark:border-white/5"></th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-white/5">
                      {ledgerLoading ? (
                        <tr><td colSpan={6} className="text-center py-10 text-slate-400 font-medium">Loading...</td></tr>
                      ) : ledger.length === 0 ? (
                        <tr><td colSpan={6} className="text-center py-10 text-slate-400 font-medium">No transactions found</td></tr>
                      ) : (
                        ledger.map(e => {
                          const balance = e.runningBalance || e.balanceAfterTransaction || 0;
                          return (
                            <tr key={e.id} className="hover:bg-slate-50 dark:hover:bg-white/[0.03] transition-colors group">
                              <td className="px-6 py-4 text-xs font-medium text-slate-700 dark:text-slate-300 border-r border-slate-100 dark:border-white/5">
                                {e.referenceType === 'PAYMENT' ? 'Payment Out' : e.referenceType === 'PURCHASE' ? 'Purchase' : e.referenceType}
                              </td>
                              <td className="px-6 py-4 text-xs font-medium text-slate-700 dark:text-slate-300 border-r border-slate-100 dark:border-white/5">{e.referenceId || "—"}</td>
                              <td className="px-6 py-4 text-xs font-medium text-slate-700 dark:text-slate-300 border-r border-slate-100 dark:border-white/5">{new Date(e.createdAt).toLocaleDateString()}</td>
                              <td className="px-6 py-4 text-xs font-medium text-slate-700 dark:text-slate-300 border-r border-slate-100 dark:border-white/5 text-right">₹ {Math.round(e.amount).toLocaleString()}</td>
                              <td className="px-6 py-4 text-xs font-medium text-slate-700 dark:text-slate-300 border-r border-slate-100 dark:border-white/5 text-right">₹ {Math.abs(Math.round(balance)).toLocaleString()} {balance >= 0 ? 'Cr' : 'Dr'}</td>
                              <td className="px-2 py-4 text-center">
                                <button className="text-slate-300 hover:text-slate-500">
                                  <MoreVertical size={14} />
                                </button>
                              </td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {selectedTab === 'MATERIALS' && (
              <div className="flex-1 overflow-auto p-6 bg-slate-50/50 dark:bg-[#0b0c14] custom-scrollbar">
                <div className="bg-white dark:bg-card rounded-3xl border border-slate-100 dark:border-white/5 shadow-sm overflow-hidden">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-slate-200 dark:border-white/5 bg-slate-50 dark:bg-slate-900/50">
                        <th className="px-6 py-3 font-semibold text-xs text-slate-500">Material Name</th>
                        <th className="px-6 py-3 font-semibold text-xs text-slate-500">Item Code</th>
                        <th className="px-6 py-3 font-semibold text-xs text-slate-500">Unit</th>
                        <th className="px-6 py-3 font-semibold text-xs text-slate-500 text-right">Vendor Price</th>
                        <th className="px-6 py-3 font-semibold text-xs text-slate-500 text-right">Last Updated</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-white/5">
                      {selectedVendorDetail?.suppliedMaterials?.length === 0 ? (
                        <tr>
                          <td colSpan={5} className="text-center py-10 text-slate-400 text-xs font-semibold">
                            No materials linked to this vendor yet.
                          </td>
                        </tr>
                      ) : (
                        selectedVendorDetail?.suppliedMaterials?.map((m: any) => (
                          <tr key={m.id} className="hover:bg-slate-50 dark:hover:bg-white/[0.02] transition-colors">
                            <td className="px-6 py-4 text-xs font-bold text-slate-800 dark:text-white">{m.material?.name || "—"}</td>
                            <td className="px-6 py-4 text-xs text-slate-500">{m.material?.itemCode || m.material?.id?.slice(0, 8) || "—"}</td>
                            <td className="px-6 py-4 text-xs text-slate-500">{m.material?.unit || "Units"}</td>
                            <td className="px-6 py-4 text-xs font-semibold text-slate-800 dark:text-white text-right">₹ {m.price || m.material?.basePrice || 0}</td>
                            <td className="px-6 py-4 text-xs text-slate-400 text-right">{m.lastUpdated ? new Date(m.lastUpdated).toLocaleDateString() : "—"}</td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
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
                <button onClick={() => { setEditing(null); setShowForm(true); }} className="p-4 bg-white dark:bg-slate-800 border border-slate-200 dark:border-white/5 rounded-3xl hover:border-orange-500/50 hover:shadow-xl hover:shadow-orange-500/10 transition-all group text-left">
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
      <AddPartyModal
        isOpen={showForm}
        onClose={() => setShowForm(false)}
        onSave={async (data) => {
          try {
            if (editing) await vendorsApi.update(editing.id, data);
            else await vendorsApi.create(data);
            showToast(editing ? "Vendor identity synchronized" : "New vendor registered", "success");
            setShowForm(false);
            fetchData();
          } catch (e: any) {
            showToast(e.response?.data?.error || "Transaction Aborted", "error");
            throw e;
          }
        }}
        initialData={editing}
        title={editing ? "EDIT VENDOR" : "ADD VENDOR"}
      />

      {showPaymentModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-[#12141c] rounded-[2.5rem] shadow-2xl w-full max-w-md p-8 space-y-6">
            <h2 className="text-lg font-black text-gray-900 dark:text-white">Record Transaction</h2>
            <div className="p-1 bg-slate-100 dark:bg-slate-800/50 rounded-xl flex border border-slate-200 dark:border-white/5">
              <button onClick={() => setPaymentForm({ ...paymentForm, type: 'PAYMENT' })} className={clsx("flex-1 py-2.5 rounded-lg text-[9px] font-black uppercase transition-all", paymentForm.type === 'PAYMENT' ? "bg-white dark:bg-slate-700 text-orange-600 dark:text-white shadow-sm" : "text-slate-500")}>Pay Due</button>
              <button onClick={() => setPaymentForm({ ...paymentForm, type: 'ADVANCE' })} className={clsx("flex-1 py-2.5 rounded-lg text-[9px] font-black uppercase transition-all", paymentForm.type === 'ADVANCE' ? "bg-white dark:bg-slate-700 text-indigo-600 dark:text-white shadow-sm" : "text-slate-500")}>Advance</button>
            </div>
            <div className="space-y-1">
              <label className="text-[8px] font-black text-slate-400 uppercase tracking-widest ml-3">Transaction Amount</label>
              <div className="relative group">
                <span className="absolute left-6 top-1/2 -translate-y-1/2 text-xl font-black text-slate-300">₹</span>
                <input value={paymentForm.amount} onChange={e => setPaymentForm({ ...paymentForm, amount: e.target.value.replace(/[^0-9.]/g, '') })} placeholder="0.00" className="w-full pl-12 pr-6 py-5 text-3xl font-black text-slate-900 dark:text-white bg-slate-50 dark:bg-slate-800/30 border border-slate-200 dark:border-white/5 rounded-2xl outline-none focus:ring-4 ring-orange-500/10" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[8px] font-black text-slate-400 uppercase tracking-widest ml-3">Debit From Account</label>
                {accounts.length === 0 ? (
                  <div className="px-4 py-2 bg-rose-50 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/20 rounded-xl">
                    <p className="text-[9px] font-bold text-rose-600 dark:text-rose-400">No accounts found. Create one in <span className="underline cursor-pointer" onClick={() => router.push('/banking/accounts')}>Banking</span></p>
                  </div>
                ) : (
                  <select value={paymentForm.accountId} onChange={e => setPaymentForm({ ...paymentForm, accountId: e.target.value })} className="w-full px-4 py-3 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl text-sm font-bold outline-none">
                    {accounts.map(a => <option key={a.id} value={a.id}>{a.name} (₹{Math.round(a.balance).toLocaleString()})</option>)}
                  </select>
                )}
              </div>
              <div className="space-y-1">
                <label className="text-[8px] font-black text-slate-400 uppercase tracking-widest ml-3">Payment Mode</label>
                <select value={paymentForm.paymentMode} onChange={e => setPaymentForm({ ...paymentForm, paymentMode: e.target.value })} className="w-full px-4 py-3 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl text-sm font-bold outline-none">
                  <option value="CASH">Cash</option>
                  <option value="BANK_TRANSFER">Bank Transfer</option>
                  <option value="UPI">UPI / Digital</option>
                  <option value="CHEQUE">Cheque</option>
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-[8px] font-black text-slate-400 uppercase tracking-widest ml-3">Reference No.</label>
                <input placeholder="TXN-123456" value={paymentForm.referenceId} onChange={e => setPaymentForm({ ...paymentForm, referenceId: e.target.value })} className="w-full px-4 py-3 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl text-sm font-bold outline-none" />
              </div>
              {paymentForm.type === 'PAYMENT' && (
                <div className="space-y-1 col-span-2">
                  <label className="text-[8px] font-black text-slate-400 uppercase tracking-widest ml-3">Allocate to Invoice (Recommended)</label>
                  <select
                    value={paymentForm.vendorInvoiceId}
                    onChange={e => {
                      const inv = vendorInvoices.find(i => i.id === e.target.value);
                      setPaymentForm({
                        ...paymentForm,
                        vendorInvoiceId: e.target.value,
                        amount: inv ? inv.amount.toString() : paymentForm.amount
                      });
                    }}
                    className="w-full px-4 py-3 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl text-sm font-bold outline-none"
                  >
                    <option value="">Direct Payment (Unallocated)</option>
                    {vendorInvoices.map(inv => (
                      <option key={inv.id} value={inv.id}>{inv.invoiceNumber} (₹{inv.amount.toLocaleString()}) - {inv.status}</option>
                    ))}
                  </select>
                </div>
              )}
              <div className="space-y-1">
                <label className="text-[8px] font-black text-slate-400 uppercase tracking-widest ml-3">Transaction Date</label>
                <input type="date" value={paymentForm.date} onChange={e => setPaymentForm({ ...paymentForm, date: e.target.value })} className="w-full px-4 py-3 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl text-sm font-bold outline-none" />
              </div>
            </div>
            <div className="space-y-1">
              <label className="text-[8px] font-black text-slate-400 uppercase tracking-widest ml-3">Remarks / Internal Notes</label>
              <input placeholder="Note for accounting..." value={paymentForm.note} onChange={e => setPaymentForm({ ...paymentForm, note: e.target.value })} className="w-full px-4 py-3 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl text-sm font-bold outline-none" />
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
              <button
                onClick={handlePayment}
                className={clsx(
                  "flex-1 px-8 py-2.5 rounded-lg text-xs font-bold uppercase transition-all shadow-lg",
                  saving || !amountNum || !paymentForm.accountId
                    ? "bg-slate-300 text-slate-500 cursor-not-allowed shadow-none"
                    : "bg-orange-500 text-white shadow-orange-500/20 hover:bg-orange-600 active:scale-95"
                )}
                disabled={saving || !amountNum || !paymentForm.accountId}
              >
                {saving ? "Processing..." : "Confirm Settlement"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Party Settings Slide-over */}
      {isSettingsOpen && (
        <div className="fixed inset-0 z-[100] bg-black/40 flex justify-end">
          <div className="w-[400px] bg-white h-full shadow-2xl flex flex-col animate-in slide-in-from-right">
            
            {/* Header */}
            <div className="px-6 py-4 flex items-center justify-between border-b border-slate-200 bg-white z-10 shrink-0">
              <h3 className="text-lg font-bold text-slate-700">Party Settings</h3>
              <button onClick={() => setIsSettingsOpen(false)} className="p-1 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors">
                <X size={20} />
              </button>
            </div>

            {/* Settings Content */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              
              {/* General Section */}
              <div className="space-y-4">
                <div className="bg-slate-50 px-4 py-2 rounded-lg border border-slate-100">
                  <span className="text-sm font-bold text-slate-600">General</span>
                </div>
                
                {[
                  { id: "partyGrouping", label: "Party Grouping" },
                  { id: "shippingAddress", label: "Shipping Address" },
                  { id: "managePartyStatus", label: "Manage Party Status" }
                ].map(opt => (
                  <div key={opt.id} className="flex items-center gap-3">
                    <input 
                      type="checkbox" 
                      checked={(settings as any)[opt.id]}
                      onChange={(e) => setSettings({...settings, [opt.id]: e.target.checked})}
                      className="w-4 h-4 rounded border-slate-300 text-orange-500 focus:ring-orange-500" 
                    />
                    <span className="text-sm font-medium text-slate-700">{opt.label}</span>
                    <Info size={14} className="text-slate-400" />
                  </div>
                ))}

                {/* Payment Reminder */}
                <div className="space-y-3 pt-2">
                  <div className="flex items-center gap-3">
                    <input 
                      type="checkbox" 
                      checked={settings.enablePaymentReminder}
                      onChange={(e) => setSettings({...settings, enablePaymentReminder: e.target.checked})}
                      className="w-4 h-4 rounded border-slate-300 text-orange-500 focus:ring-orange-500 bg-orange-500" 
                    />
                    <span className="text-sm font-medium text-slate-700">Enable Payment Reminder</span>
                    <Info size={14} className="text-slate-400" />
                  </div>
                  
                  {settings.enablePaymentReminder && (
                    <div className="pl-7 space-y-2">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-semibold text-slate-500">Remind me for payment due in</span>
                        <Info size={12} className="text-slate-400" />
                      </div>
                      <div className="flex items-center relative">
                        <input 
                          type="text" 
                          value={settings.reminderDays}
                          onChange={(e) => setSettings({...settings, reminderDays: e.target.value})}
                          className="w-full px-4 py-2 border border-slate-200 rounded-lg text-sm font-semibold text-slate-700 focus:outline-none focus:border-orange-400"
                        />
                        <span className="absolute right-4 text-sm font-semibold text-slate-400">(Days)</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>

            </div>

            {/* Footer */}
            <div className="p-4 border-t border-slate-200 bg-slate-50 shrink-0">
              <button onClick={() => setIsSettingsOpen(false)} className="w-full py-2.5 flex items-center justify-center gap-2 text-sm font-bold text-slate-600 hover:text-slate-800 hover:bg-slate-200 rounded-lg transition-colors">
                <Settings2 size={16} />
                More Settings
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
