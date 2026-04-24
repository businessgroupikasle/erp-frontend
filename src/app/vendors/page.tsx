"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Store, Plus, X, Search,
  Star, RefreshCw, ShoppingCart, Edit2, Trash2,
  ChevronDown, Package, AlertCircle, CreditCard, History,
  TrendingUp, TrendingDown, Minus, Wallet
} from "lucide-react";
import { clsx } from "clsx";
import { vendorsApi, rawMaterialsApi } from "@/lib/api";
import VendorLedgerModal from "@/components/modules/vendors/VendorLedgerModal";

const EMPTY_FORM = {
  name: "",
  contact: "",
  email: "",
  address: "",
  remark: ""
};

export default function VendorsPage() {
  const [vendors, setVendors]   = useState<any[]>([]);
  const [summary, setSummary]   = useState<any>(null); // Real-time financial data from backend
  const [materials, setMaterials] = useState<any[]>([]);
  const [loading, setLoading]   = useState(true);
  const [search, setSearch]     = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing]   = useState<any>(null);
  const [saving, setSaving]     = useState(false);
  const [form, setForm]         = useState(EMPTY_FORM);

  // Link Material State
  const [linkModal, setLinkModal] = useState<any>(null);
  const [linkData, setLinkData]   = useState({ materialId: "", price: "" });

  // Custom Dialogs State
  const [confirmModal, setConfirmModal] = useState<{ show: boolean, vendor: any } | null>(null);
  const [errorMessage, setErrorMessage] = useState<{ title: string; message: string } | null>(null);
  const [summaryDetail, setSummaryDetail] = useState<'OWE' | 'ADVANCE' | null>(null);
  
  // Ledger & Payment State
  const [showLedger, setShowLedger] = useState<any>(null);
  const [showPayment, setShowPayment] = useState<any>(null);
  const [paymentForm, setPaymentForm] = useState({ amount: "", note: "", type: "PAYMENT" as "PAYMENT" | "ADVANCE" });

  // Return Advance State (vendor returns money to us)
  const [showReturn, setShowReturn] = useState<any>(null);
  const [returnForm, setReturnForm] = useState({ amount: "", note: "" });


  const fetchVendors = useCallback(async () => {
    setLoading(true);
    try {
      const [vRes, mRes, sRes] = await Promise.all([
        vendorsApi.getAll(),
        rawMaterialsApi.getAll(),
        vendorsApi.getSummary()
      ]);
      setVendors(vRes.data ?? []);
      setMaterials(mRes.data ?? []);
      setSummary(sRes.data ?? null);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchVendors(); }, [fetchVendors]);

  const openCreate = () => { setEditing(null); setForm(EMPTY_FORM); setShowForm(true); };
  const openEdit   = (v: any) => {
    setEditing(v);
    setForm({
      name: v.name || "",
      contact: v.contact || "",
      email: v.email || "",
      address: v.address || "",
      remark: v.remark || ""
    });
    setShowForm(true);
  };

  const handleSave = async () => {
    // 1. Name Validation (Alpha only)
    if (!form.name.trim() || !/^[A-Za-z\s]+$/.test(form.name)) {
      alert("Vendor Name is required and must contain only alphabets.");
      return;
    }

    // 2. Contact Validation (10 digits)
    if (!form.contact.trim() || !/^\d{10}$/.test(form.contact)) {
      alert("Contact Number must be exactly 10 digits.");
      return;
    }

    // 3. Email Validation (gmail only)
    if (form.email && !form.email.toLowerCase().endsWith("@gmail.com")) {
      alert("Only @gmail.com email addresses are permitted.");
      return;
    }

    // 4. Address Validation (Required)
    if (!form.address.trim()) {
      alert("Registered Office Address is mandatory.");
      return;
    }

    setSaving(true);
    try {
      const dataToSave = { 
        name: form.name.trim(),
        contact: form.contact.trim(),
        email: form.email?.trim() || null,
        address: form.address.trim(),
        remark: form.remark?.trim() || "",
      };
      
      if (editing) {
        await vendorsApi.update(editing.id, dataToSave);
      } else {
        await vendorsApi.create(dataToSave);
      }
      setShowForm(false);
      fetchVendors();
      setForm(EMPTY_FORM);
    } catch (e: any) { 
      console.error(e);
      alert(e?.response?.data?.error ?? "Failed to save vendor details.");
    }
    finally { setSaving(false); }
  };

  const handleRecordPayment = async () => {
    if (!showPayment || !paymentForm.amount) return;
    setSaving(true);
    const isAdvanceType = paymentForm.type === "ADVANCE";
    try {
      await vendorsApi.recordPayment(showPayment.id, {
        amount: Number(paymentForm.amount),
        note: paymentForm.note || (isAdvanceType ? "Advance Payment" : "Direct Payment")
      });
      setShowPayment(null);
      setPaymentForm({ amount: "", note: "", type: "PAYMENT" });
      fetchVendors();
    } catch (e: any) {
      alert(e?.response?.data?.error ?? "Failed to record payment.");
    } finally {
      setSaving(false);
    }
  };

  const handleReturnAdvance = async () => {
    if (!showReturn || !returnForm.amount || Number(returnForm.amount) <= 0) return;
    const amount = Number(returnForm.amount);
    if (amount > (showReturn.balance ?? 0)) {
      alert(`Cannot return more than the available advance of ₹${showReturn.balance?.toLocaleString()}`);
      return;
    }
    setSaving(true);
    try {
      await vendorsApi.recordAdjustment(showReturn.id, {
        amount,
        type: "DEBIT",
        note: returnForm.note || "Advance Returned by Vendor"
      });
      setShowReturn(null);
      setReturnForm({ amount: "", note: "" });
      fetchVendors();
    } catch (e: any) {
      alert(e?.response?.data?.error ?? "Failed to record return.");
    } finally {
      setSaving(false);
    }
  };

  const handleLinkMaterial = async () => {
    if (!linkData.materialId || !linkModal) return;
    setSaving(true);
    try {
      await vendorsApi.linkMaterial({
        vendorId: linkModal.id,
        materialId: linkData.materialId,
        price: Number(linkData.price) || 0
      });
      setLinkModal(null);
      setLinkData({ materialId: "", price: "" });
      fetchVendors();
    } catch (e: any) {
      console.error("Link Material Error:", e);
      alert(e?.response?.data?.error ?? "Failed to link material. Please check if the material is already linked.");
    } finally { setSaving(false); }
  };

  const handleDelete = async (vendor: any) => {
    // 1. Check for remaining balance (Advance or Due)
    if (Math.abs(vendor.balance || 0) > 0) {
      setErrorMessage({
        title: "Financial Settle Required",
        message: `Cannot delete "${vendor.name}" because there is a remaining balance of ₹${Math.abs(vendor.balance).toLocaleString()}. Please settle all Advance and Owe amounts first.`
      });
      return;
    }

    // 2. Check for Pending/Active Purchase Orders
    const hasPendingOrders = vendor.orders?.some((o: any) => o.status === 'PENDING');
    if (hasPendingOrders) {
      setErrorMessage({
        title: "Active Orders",
        message: `Cannot delete "${vendor.name}" because there are PENDING Purchase Orders. Please complete or cancel these orders to proceed.`
      });
      return;
    }

    // 3. Clear to show confirmation
    setConfirmModal({ show: true, vendor });
  };

  const confirmDelete = async () => {
    if (!confirmModal?.vendor) return;
    const { id } = confirmModal.vendor;
    try {
      await vendorsApi.delete(id);
      fetchVendors();
      setConfirmModal(null);
    } catch (e: any) {
      console.error(e);
      setErrorMessage({
        title: "Deletion Failed",
        message: e?.response?.data?.error ?? "An unexpected error occurred while deleting the vendor. Please ensure all financial transactions are settled."
      });
      setConfirmModal(null);
    }
  };

  const [materialFilter, setMaterialFilter] = useState("");
  const [balanceFilter, setBalanceFilter]   = useState("ALL"); // ALL, ADVANCE, OWED
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");

  const filtered = vendors.filter((v) => {
    const matchesSearch   = !search || v.name?.toLowerCase().includes(search.toLowerCase()) || v.contact?.includes(search);
    const matchesMaterial = !materialFilter || v.suppliedMaterials?.some((sm: any) => sm.materialId === materialFilter);
    
    let matchesBalance = true;
    if (balanceFilter === "ADVANCE") matchesBalance = (v.balance || 0) > 0;
    if (balanceFilter === "OWED")    matchesBalance = (v.balance || 0) < 0;

    // Price Filter Logic
    let matchesPrice = true;
    if (minPrice || maxPrice) {
      const prices = v.suppliedMaterials?.map((sm: any) => sm.price || 0) || [];
      if (prices.length === 0) {
        matchesPrice = false;
      } else {
        matchesPrice = prices.some((p: number) => {
          if (minPrice && p < Number(minPrice)) return false;
          if (maxPrice && p > Number(maxPrice)) return false;
          return true;
        });
      }
    }

    return matchesSearch && matchesMaterial && matchesBalance && matchesPrice;
  });

  // Production financial summary from backend
  const totalOwed    = summary?.totalOwed ?? 0;
  const totalAdvance = summary?.totalAdvance ?? 0;

  return (
    <div className="max-w-6xl mx-auto space-y-8 p-1">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-gray-900 dark:text-white flex items-center gap-2">
            <Store size={22} className="text-orange-500" /> Vendor Management
          </h1>
          <p className="text-sm text-gray-500 dark:text-slate-400 mt-1">
            Manage suppliers who provide raw materials to the home house
          </p>
        </div>
        <div className="flex gap-2">
          <button onClick={fetchVendors} className="p-2 rounded-xl border border-gray-200 dark:border-white/10 hover:bg-gray-50 dark:hover:bg-white/5 transition-all">
            <RefreshCw size={16} className="text-gray-400" />
          </button>
          <button onClick={openCreate} className="flex items-center gap-2 bg-orange-500 hover:bg-orange-400 text-white px-4 py-2 rounded-xl text-sm font-bold transition-all">
            <Plus size={16} /> Add Vendor
          </button>
        </div>
      </div>

          {/* Value Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white/70 dark:bg-card/70 backdrop-blur-md rounded-2xl border border-gray-100 dark:border-white/5 p-5 shadow-sm hover:translate-y-[-2px] transition-all">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-orange-50 dark:bg-orange-500/10 rounded-lg">
                  <Store size={16} className="text-orange-500" />
                </div>
                <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Total Vendors</p>
                  <p className="text-xl font-black text-slate-900 dark:text-white leading-none mt-1">{vendors.length}</p>
                </div>
              </div>
            </div>
            
            <div 
              onClick={() => setSummaryDetail('OWE')}
              className="bg-red-50/70 dark:bg-red-500/10 backdrop-blur-md rounded-2xl border border-red-100 dark:border-red-500/20 p-5 shadow-sm hover:translate-y-[-2px] transition-all cursor-pointer group"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 bg-red-100 dark:bg-red-500/20 rounded-lg group-hover:scale-110 transition-transform">
                  <AlertCircle size={16} className="text-red-500" />
                </div>
                <div>
                  <p className="text-[10px] font-black text-red-600/70 uppercase tracking-widest">Total We Owe</p>
                  <p className="text-xl font-black text-red-700 dark:text-red-400 leading-none mt-1">₹{totalOwed.toLocaleString()}</p>
                </div>
              </div>
            </div>

            <div 
              onClick={() => setSummaryDetail('ADVANCE')}
              className="bg-emerald-50/70 dark:bg-emerald-500/10 backdrop-blur-md rounded-2xl border border-emerald-100 dark:border-emerald-500/20 p-5 shadow-sm hover:translate-y-[-2px] transition-all cursor-pointer group"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 bg-emerald-100 dark:bg-emerald-500/20 rounded-lg group-hover:scale-110 transition-transform">
                  <RefreshCw size={16} className="text-emerald-500" />
                </div>
                <div>
                  <p className="text-[10px] font-black text-emerald-600/70 uppercase tracking-widest">Total Advance</p>
                  <p className="text-xl font-black text-emerald-700 dark:text-emerald-400 leading-none mt-1">₹{totalAdvance.toLocaleString()}</p>
                </div>
              </div>
            </div>

            <div className="bg-orange-50/70 dark:bg-orange-500/10 backdrop-blur-md rounded-2xl border border-orange-100 dark:border-orange-500/20 p-5 shadow-sm hover:translate-y-[-2px] transition-all">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-orange-100 dark:bg-orange-500/20 rounded-lg">
                  <Package size={16} className="text-orange-600" />
                </div>
                <div>
                  <p className="text-[10px] font-black text-orange-600/70 uppercase tracking-widest">Linked Materials</p>
                  <p className="text-xl font-black text-orange-700 dark:text-orange-400 leading-none mt-1">
                    {vendors.reduce((s, v) => s + (v.suppliedMaterials?.length ?? 0), 0)}
                  </p>
                </div>
              </div>
            </div>
          </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search by name or mobile..."
            className="w-full pl-9 pr-4 py-2.5 text-sm bg-white dark:bg-card border border-gray-200 dark:border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500/20 shadow-sm" />
        </div>
        <div className="relative min-w-[140px]">
          <select 
            value={balanceFilter} 
            onChange={(e) => setBalanceFilter(e.target.value)}
            className="w-full pl-3 pr-8 py-2.5 text-sm bg-white dark:bg-card border border-gray-200 dark:border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500/20 shadow-sm appearance-none font-bold text-gray-600 dark:text-slate-300"
          >
            <option value="ALL">All Balances</option>
            <option value="ADVANCE">Only Advance</option>
            <option value="OWED">Only We Owe</option>
          </select>
          <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
        </div>

        <div className="flex items-center gap-2">
          <input
            type="number"
            placeholder="Min ₹"
            value={minPrice}
            onChange={(e) => setMinPrice(e.target.value)}
            className="w-24 pl-3 pr-2 py-2.5 text-sm bg-white dark:bg-card border border-gray-200 dark:border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500/20 shadow-sm font-bold text-gray-600 dark:text-slate-300"
          />
          <span className="text-gray-400">to</span>
          <input
            type="number"
            placeholder="Max ₹"
            value={maxPrice}
            onChange={(e) => setMaxPrice(e.target.value)}
            className="w-24 pl-3 pr-2 py-2.5 text-sm bg-white dark:bg-card border border-gray-200 dark:border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500/20 shadow-sm font-bold text-gray-600 dark:text-slate-300"
          />
        </div>
        <div className="relative min-w-[200px]">
          <select 
            value={materialFilter} 
            onChange={(e) => setMaterialFilter(e.target.value)}
            className="w-full pl-3 pr-8 py-2.5 text-sm bg-white dark:bg-card border border-gray-200 dark:border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500/20 shadow-sm appearance-none font-bold text-gray-600 dark:text-slate-300"
          >
            <option value="">Compare by Material...</option>
            {materials.map(m => (
              <option key={m.id} value={m.id}>{m.name}</option>
            ))}
          </select>
          <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
        </div>
      </div>

      {loading ? (
        <div className="py-20 text-center text-gray-400 text-sm">Loading vendors...</div>
      ) : filtered.length === 0 ? (
        <div className="py-20 text-center text-gray-300 dark:text-slate-600 space-y-2">
          <Store size={48} strokeWidth={1} className="mx-auto" />
          <p className="text-sm font-semibold">No vendors yet. Add your first supplier.</p>
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2">
          {filtered.map((vendor) => (
            <div key={vendor.id} className="group bg-white dark:bg-[#12141c] rounded-3xl border border-gray-100 dark:border-white/5 p-6 hover:shadow-xl hover:shadow-orange-500/5 transition-all duration-300 relative overflow-hidden">
              {/* Card Background Accent */}
              <div className="absolute top-0 right-0 w-24 h-24 bg-orange-500/5 rounded-bl-[100px] -mr-8 -mt-8 transition-all group-hover:bg-orange-500/10" />
              
              <div className="flex items-start gap-4 mb-5 relative z-10">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center shrink-0 shadow-lg shadow-orange-500/20">
                  <Store size={24} className="text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="font-black text-gray-900 dark:text-white text-[15px] truncate uppercase tracking-tight">{vendor.name}</h3>
                    {vendor.gender && (
                      <span className="px-1.5 py-0.5 bg-gray-100 dark:bg-white/5 text-gray-500 text-[9px] font-black rounded uppercase">
                        {vendor.gender}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-1.5 mt-1">
                    <div className="flex items-center gap-0.5">
                      {[1,2,3,4,5].map((s) => (
                        <Star key={s} size={11} className={clsx(s <= Math.round(vendor.rating ?? 5) ? "text-amber-400 fill-amber-400" : "text-gray-200 dark:text-slate-700")} />
                      ))}
                    </div>
                    <span className="text-[10px] font-black text-amber-500 bg-amber-50 dark:bg-amber-400/10 px-1.5 py-0.5 rounded-full">
                      {(vendor.rating ?? 5).toFixed(1)}
                    </span>
                  </div>
                </div>
                <div className="flex gap-1 shrink-0 bg-gray-50 dark:bg-white/5 p-1 rounded-xl">
                  <button 
                    onClick={() => setLinkModal(vendor)}
                    title="Link Material"
                    className="p-2 rounded-lg hover:bg-indigo-50 dark:hover:bg-indigo-900/20 text-gray-400 hover:text-indigo-600 transition-all">
                    <Plus size={14} />
                  </button>
                  <button onClick={() => openEdit(vendor)} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-white/10 text-gray-400 hover:text-orange-500 transition-all">
                    <Edit2 size={14} />
                  </button>
                  <button onClick={() => handleDelete(vendor)} className="p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-gray-400 hover:text-red-500 transition-all">
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
              
              {/* Financial Metrics Grid */}
              <div className="grid grid-cols-3 gap-2.5 mb-5 mt-2">
                <div className="bg-slate-50 dark:bg-white/5 p-3 rounded-2xl border border-slate-100 dark:border-white/5">
                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-tighter mb-1">Total Purchased</p>
                  <p className="text-[13px] font-black text-slate-700 dark:text-slate-200">₹{vendor.totalOrder?.toLocaleString() || 0}</p>
                </div>
                <div className="bg-emerald-50/30 dark:bg-emerald-500/5 p-3 rounded-2xl border border-emerald-100/50 dark:border-emerald-500/10">
                  <p className="text-[9px] font-black text-emerald-600/70 dark:text-emerald-400/50 uppercase tracking-tighter mb-1">Amount Paid</p>
                  <p className="text-[13px] font-black text-emerald-700 dark:text-emerald-400">₹{vendor.totalAdvance?.toLocaleString() || 0}</p>
                </div>
                <div className={clsx(
                  "p-3 rounded-2xl border",
                  (vendor.balance || 0) > 0 
                    ? "bg-emerald-50 dark:bg-emerald-500/10 border-emerald-100 dark:border-emerald-500/20" 
                    : (vendor.balance || 0) < 0 
                    ? "bg-red-50 dark:bg-red-500/10 border-red-100 dark:border-red-500/20" 
                    : "bg-slate-50 dark:bg-white/5 border-slate-100 dark:border-white/5"
                )}>
                  <p className={clsx(
                    "text-[9px] font-black uppercase tracking-tighter mb-1",
                    (vendor.balance || 0) > 0 ? "text-emerald-600" : (vendor.balance || 0) < 0 ? "text-red-600" : "text-slate-400"
                  )}>
                    {(vendor.balance || 0) > 0 ? "IN ADVANCE" : (vendor.balance || 0) < 0 ? "TOTAL DUE" : "SETTLED"}
                  </p>
                  <p className={clsx(
                    "text-[13px] font-black",
                    (vendor.balance || 0) > 0 ? "text-emerald-700" : (vendor.balance || 0) < 0 ? "text-red-700" : "text-slate-400"
                  )}>
                    ₹{Math.abs(vendor.balance || 0).toLocaleString()}
                  </p>
                </div>
              </div>

              {/* Action Row */}
              <div className="flex gap-2 mb-5 flex-wrap">
                <button
                  onClick={() => setShowLedger(vendor)}
                  className="flex-1 py-2.5 px-4 bg-blue-500/10 hover:bg-blue-500/20 text-blue-600 dark:text-blue-400 font-black text-[11px] uppercase tracking-wider rounded-xl transition-all border border-blue-500/10 flex items-center justify-center gap-2"
                >
                  <History size={14} /> View Ledger
                </button>
                <button
                  onClick={() => {
                    setShowPayment(vendor);
                    setPaymentForm({ amount: "", note: "", type: "PAYMENT" });
                  }}
                  className="flex-1 py-2.5 px-4 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 font-black text-[11px] uppercase tracking-wider rounded-xl transition-all border border-emerald-500/10 flex items-center justify-center gap-2"
                >
                  <CreditCard size={14} /> Record Payment
                </button>
                {(vendor.balance ?? 0) > 0 && (
                  <button
                    onClick={() => {
                      setShowReturn(vendor);
                      setReturnForm({ amount: "", note: "" });
                    }}
                    className="flex-1 py-2.5 px-4 bg-amber-500/10 hover:bg-amber-500/20 text-amber-600 dark:text-amber-400 font-black text-[11px] uppercase tracking-wider rounded-xl transition-all border border-amber-500/10 flex items-center justify-center gap-2"
                  >
                    <RefreshCw size={14} /> Return Advance
                  </button>
                )}
              </div>

              {/* Linked Materials Section */}
              <div className="bg-gray-50 dark:bg-indigo-500/5 rounded-2xl p-3 border border-gray-100 dark:border-white/5">
                <p className="text-[9px] font-black text-indigo-400 uppercase tracking-widest mb-2 flex items-center gap-1.5">
                  <Package size={10} /> Linked Materials
                </p>
                <div className="flex flex-wrap gap-2">
                  {vendor.suppliedMaterials?.length > 0 ? (
                    vendor.suppliedMaterials.map((sm: any, i: number) => (
                      <div key={i} className={clsx(
                        "group/pill px-2.5 py-1.5 rounded-xl border transition-all flex items-center gap-2 shadow-sm",
                        materialFilter === sm.materialId 
                          ? "bg-indigo-500 border-indigo-400 text-white" 
                          : "bg-white dark:bg-card border-gray-200 dark:border-white/10 text-gray-700 dark:text-slate-300"
                      )}>
                        <span className="text-[11px] font-black uppercase tracking-tight">{sm.material?.name || "???"}</span>
                        <span className={clsx(
                          "w-[1px] h-3",
                          materialFilter === sm.materialId ? "bg-white/30" : "bg-gray-200 dark:bg-white/10"
                        )} />
                        <span className="text-[11px] font-black">₹{sm.price}</span>
                      </div>
                    ))
                  ) : (
                    <span className="text-[10px] text-gray-400 italic py-1">No materials linked yet</span>
                  )}
                </div>
              </div>

              {/* Footer Info */}
              <div className="mt-5 pt-4 border-t border-gray-100 dark:border-white/5 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1.5 text-[11px] font-black text-gray-500">
                    <ShoppingCart size={12} className="text-gray-400" />
                    <span>{vendor._count?.orders ?? 0} <span className="hidden sm:inline">Orders</span></span>
                  </div>
                  {vendor.address && (
                    <div className="w-1.5 h-1.5 rounded-full bg-gray-200 dark:bg-white/10" />
                  )}
                  {vendor.address && (
                    <p className="text-[11px] text-gray-400 font-bold truncate max-w-[100px]" title={vendor.address}>
                      {vendor.address}
                    </p>
                  )}
                </div>
                {vendor.orders?.length > 0 && (
                  <div className="text-[10px] font-black text-emerald-600 bg-emerald-50 dark:bg-emerald-500/10 px-2.5 py-1 rounded-xl uppercase tracking-widest border border-emerald-100 dark:border-emerald-500/20">
                    Last Order: {new Date(vendor.orders[vendor.orders.length - 1].createdAt).toLocaleDateString(undefined, { day: '2-digit', month: 'short' })}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Link Material Modal */}
      {linkModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-[#12141c] rounded-3xl shadow-2xl w-full max-w-sm p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-black text-gray-900 dark:text-white">Link Material to {linkModal.name}</h2>
              <button onClick={() => setLinkModal(null)} className="p-1.5 hover:bg-gray-100 dark:hover:bg-white/10 rounded-lg"><X size={16} className="text-gray-400" /></button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-600 dark:text-slate-400 mb-1">Select Material</label>
                <select 
                  value={linkData.materialId}
                  onChange={(e) => setLinkData({ ...linkData, materialId: e.target.value })}
                  className="w-full px-3 py-2.5 text-sm bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 font-bold"
                >
                  <option value="">Choose material...</option>
                  {materials.map((m: any) => (
                    <option key={m.id} value={m.id}>{m.name} ({m.unit})</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-600 dark:text-slate-400 mb-1">Latest Price (₹)</label>
                <input 
                  type="text"
                  placeholder="0.00"
                  value={linkData.price}
                  onChange={(e) => {
                    const val = e.target.value.replace(/[^0-9.]/g, "");
                    // Remove leading zero if another number is typed
                    setLinkData({ ...linkData, price: val.startsWith("0") && val.length > 1 ? val.substring(1) : val });
                  }}
                  className="w-full px-3 py-2.5 text-sm bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 font-bold"
                />
              </div>
            </div>

            <div className="flex gap-3 justify-end pt-2">
              <button onClick={() => setLinkModal(null)} className="px-4 py-2 rounded-xl border border-gray-200 dark:border-white/10 text-sm font-bold text-gray-600 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-white/5">Cancel</button>
              <button 
                onClick={handleLinkMaterial} 
                disabled={saving || !linkData.materialId}
                className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white rounded-xl text-sm font-bold transition-all shadow-lg shadow-indigo-500/20">
                {saving ? "Linking..." : "Link Material"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Vendor Form Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-[#12141c] rounded-[2.5rem] shadow-2xl w-full max-w-xl p-8 space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-black text-gray-900 dark:text-white">{editing ? "Edit Vendor" : "Add Vendor"}</h2>
              <button onClick={() => setShowForm(false)} className="p-1.5 hover:bg-gray-100 dark:hover:bg-white/10 rounded-lg"><X size={16} className="text-gray-400" /></button>
            </div>
            <div className="max-h-[60vh] overflow-y-auto px-1 space-y-4 pt-1">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-1.5">
                  <label className="block text-[11px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest ml-1">Vendor Official Name *</label>
                  <input 
                    placeholder="Alphabets only (e.g. Rahul Traders)" 
                    value={form.name}
                    onChange={(e) => {
                      const val = e.target.value.replace(/[^A-Za-z\s]/g, "");
                      setForm((f) => ({ ...f, name: val }));
                    }}
                    className="w-full px-5 py-3.5 text-sm bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl focus:outline-none focus:ring-4 focus:ring-orange-500/10 focus:border-orange-500/50 font-bold transition-all text-slate-800 dark:text-white"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="block text-[11px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest ml-1">Contact Number (10-Digit) *</label>
                  <input 
                    placeholder="e.g. 9812345678" 
                    value={form.contact}
                    maxLength={10}
                    onChange={(e) => {
                      const val = e.target.value.replace(/\D/g, "");
                      setForm((f) => ({ ...f, contact: val }));
                    }}
                    className="w-full px-5 py-3.5 text-sm bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl focus:outline-none focus:ring-4 focus:ring-orange-500/10 focus:border-orange-500/50 font-bold transition-all text-slate-800 dark:text-white"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="block text-[11px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest ml-1">Official Gmail Address</label>
                <input 
                  type="email"
                  placeholder="name@gmail.com (Registration Required)" 
                  value={form.email}
                  onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                  className="w-full px-5 py-3.5 text-sm bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl focus:outline-none focus:ring-4 focus:ring-orange-500/10 focus:border-orange-500/50 font-bold transition-all text-slate-800 dark:text-white"
                />
              </div>

              {/* Live Balance Summary (edit mode only) */}
              {editing && (
                <div className="pt-4 border-t border-gray-100 dark:border-white/5">
                  <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-3 ml-1">Current Balance</p>
                  <div className="grid grid-cols-3 gap-3">
                    <div className="bg-slate-50 dark:bg-white/[0.03] rounded-2xl p-3 border border-slate-100 dark:border-white/5 text-center">
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Purchased</p>
                      <p className="text-sm font-black text-slate-700 dark:text-slate-200">
                        ₹{(editing.totalOrder ?? 0).toLocaleString("en-IN")}
                      </p>
                    </div>
                    <div className="bg-slate-50 dark:bg-white/[0.03] rounded-2xl p-3 border border-slate-100 dark:border-white/5 text-center">
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Paid</p>
                      <p className="text-sm font-black text-slate-700 dark:text-slate-200">
                        ₹{(editing.totalAdvance ?? 0).toLocaleString("en-IN")}
                      </p>
                    </div>
                    <div className={clsx(
                      "rounded-2xl p-3 border text-center",
                      (editing.balance ?? 0) > 0
                        ? "bg-emerald-50 dark:bg-emerald-500/10 border-emerald-100 dark:border-emerald-500/20"
                        : (editing.balance ?? 0) < 0
                          ? "bg-rose-50 dark:bg-rose-500/10 border-rose-100 dark:border-rose-500/20"
                          : "bg-slate-50 dark:bg-white/[0.03] border-slate-100 dark:border-white/5"
                    )}>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 flex items-center justify-center gap-1">
                        {(editing.balance ?? 0) > 0
                          ? <TrendingUp size={10} className="text-emerald-500" />
                          : (editing.balance ?? 0) < 0
                            ? <TrendingDown size={10} className="text-rose-500" />
                            : <Minus size={10} className="text-slate-400" />}
                        Balance
                      </p>
                      <p className={clsx(
                        "text-sm font-black",
                        (editing.balance ?? 0) > 0 ? "text-emerald-600 dark:text-emerald-400"
                          : (editing.balance ?? 0) < 0 ? "text-rose-600 dark:text-rose-400"
                            : "text-slate-500"
                      )}>
                        {(editing.balance ?? 0) === 0
                          ? "Settled"
                          : `₹${Math.abs(editing.balance ?? 0).toLocaleString("en-IN")}`}
                      </p>
                      {(editing.balance ?? 0) !== 0 && (
                        <p className="text-[9px] font-bold mt-0.5 text-slate-400">
                          {(editing.balance ?? 0) > 0 ? "Advance" : "Owed"}
                        </p>
                      )}
                    </div>
                  </div>
                  <p className="text-[10px] text-slate-400 mt-2 ml-1">
                    To change balance, use Record Payment or Adjustment on the vendor card.
                  </p>
                </div>
              )}

              <div className="space-y-4 pt-2">
                <div className="space-y-1.5">
                  <label className="block text-[11px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest ml-1">Registered Office Address *</label>
                  <textarea 
                    placeholder="Enter full physical address, city, state and pincode..." 
                    value={form.address}
                    rows={2}
                    onChange={(e) => setForm((f) => ({ ...f, address: e.target.value }))}
                    className="w-full px-5 py-3.5 text-sm bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl focus:outline-none focus:ring-4 focus:ring-orange-500/10 focus:border-orange-500/50 font-bold transition-all resize-none text-slate-800 dark:text-white"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-[11px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest ml-1">Internal Reference Notes</label>
                  <textarea 
                    placeholder="Special instructions or service agreement notes..." 
                    value={form.remark}
                    rows={2}
                    onChange={(e) => setForm((f) => ({ ...f, remark: e.target.value }))}
                    className="w-full px-5 py-3.5 text-sm bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl focus:outline-none focus:ring-4 focus:ring-orange-500/10 focus:border-orange-500/50 font-bold transition-all resize-none text-slate-800 dark:text-white"
                  />
                </div>
              </div>
            </div>
            <div className="flex gap-3 justify-end pt-2">
              <button onClick={() => setShowForm(false)} className="px-4 py-2 rounded-xl border border-gray-200 dark:border-white/10 text-sm font-bold text-gray-600 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-white/5">Cancel</button>
              <button onClick={handleSave} disabled={saving || !form.name || !form.contact}
                className="px-5 py-2 bg-orange-500 hover:bg-orange-400 disabled:opacity-50 text-white rounded-xl text-sm font-bold transition-all shadow-lg shadow-orange-500/20">
                {saving ? "Saving..." : editing ? "Update" : "Add Vendor"}
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Custom Error/Alert Modal */}
      {errorMessage && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/60 backdrop-blur-md p-4">
          <div className="bg-white dark:bg-[#12141c] rounded-3xl shadow-2xl w-full max-w-sm p-8 border border-gray-100 dark:border-white/5 space-y-6 text-center">
            <div className="w-20 h-20 bg-orange-50 dark:bg-orange-500/10 rounded-full flex items-center justify-center mx-auto">
               <AlertCircle size={32} className="text-orange-500" />
            </div>
            <div>
              <h2 className="text-xl font-black text-gray-900 dark:text-white uppercase tracking-tight">{errorMessage.title}</h2>
              <p className="text-sm text-gray-500 dark:text-slate-400 mt-2 leading-relaxed">
                {errorMessage.message}
              </p>
            </div>
            <button 
              onClick={() => setErrorMessage(null)}
              className="w-full py-4 bg-orange-500 hover:bg-orange-600 text-white rounded-xl text-sm font-black shadow-lg shadow-orange-500/20 transition-all uppercase tracking-widest"
            >
              Got it
            </button>
          </div>
        </div>
      )}

      {/* Custom Confirmation Modal */}
      {confirmModal?.show && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-md p-4">
          <div className="bg-white dark:bg-[#12141c] rounded-3xl shadow-2xl w-full max-w-sm p-8 border border-gray-100 dark:border-white/5 space-y-6 text-center">
            <div className="w-20 h-20 bg-red-50 dark:bg-red-500/10 rounded-full flex items-center justify-center mx-auto">
               <Trash2 size={32} className="text-red-500" />
            </div>
            <div>
              <h2 className="text-xl font-black text-gray-900 dark:text-white">Delete {confirmModal.vendor.name}?</h2>
              <p className="text-sm text-gray-500 dark:text-slate-400 mt-2">
                This action cannot be undone. All linked data for this vendor will be permanently removed.
              </p>
            </div>
            <div className="flex gap-3">
              <button 
                onClick={() => setConfirmModal(null)}
                className="flex-1 py-3 px-4 rounded-xl border border-gray-200 dark:border-white/10 text-sm font-bold text-gray-600 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-white/5 transition-all"
              >
                No, Keep it
              </button>
              <button 
                onClick={confirmDelete}
                className="flex-1 py-3 px-4 bg-red-500 hover:bg-red-600 text-white rounded-xl text-sm font-black shadow-lg shadow-red-500/20 transition-all"
              >
                Yes, Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Ledger Modal */}
      {showLedger && (
        <VendorLedgerModal 
          vendor={showLedger} 
          onClose={() => setShowLedger(null)} 
        />
      )}

      {/* Direct Payment Modal */}
      {showPayment && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-md p-4">
          <div className="bg-white dark:bg-[#12141c] rounded-[2.5rem] shadow-2xl w-full max-w-md p-8 space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-black text-gray-900 dark:text-white">Record Payment</h2>
                <p className="text-xs text-gray-500 uppercase tracking-widest font-bold mt-1">{showPayment.name}</p>
              </div>
              <button onClick={() => setShowPayment(null)} className="p-2 hover:bg-black/5 rounded-full"><X size={20} className="text-gray-400" /></button>
            </div>

            {/* Type Toggle */}
            <div className="flex gap-2 p-1 bg-slate-100 dark:bg-white/5 rounded-2xl">
              {([
                { key: "PAYMENT", label: "Payment", icon: CreditCard, desc: "Paying for a PO/invoice" },
                { key: "ADVANCE", label: "Advance", icon: Wallet,     desc: "Upfront credit to vendor" },
              ] as const).map(opt => {
                const Icon = opt.icon;
                const active = paymentForm.type === opt.key;
                return (
                  <button
                    key={opt.key}
                    onClick={() => setPaymentForm(f => ({ ...f, type: opt.key }))}
                    className={`flex-1 flex flex-col items-center py-3 px-4 rounded-xl transition-all ${
                      active
                        ? opt.key === "ADVANCE"
                          ? "bg-violet-600 text-white shadow-sm"
                          : "bg-emerald-500 text-white shadow-sm"
                        : "text-gray-400 hover:text-gray-600 dark:hover:text-white"
                    }`}
                  >
                    <Icon size={16} className="mb-1" />
                    <span className="text-[11px] font-black uppercase tracking-wider">{opt.label}</span>
                    <span className={`text-[9px] font-medium mt-0.5 ${active ? "opacity-80" : "opacity-60"}`}>{opt.desc}</span>
                  </button>
                );
              })}
            </div>

            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="block text-[11px] font-black text-slate-500 uppercase tracking-widest ml-1">Amount (₹)</label>
                <input 
                  type="text"
                  placeholder="0.00"
                  value={paymentForm.amount}
                  onChange={(e) => setPaymentForm({ ...paymentForm, amount: e.target.value.replace(/[^0-9.]/g, "") })}
                  className={`w-full px-5 py-4 text-2xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl focus:outline-none focus:ring-4 font-black transition-colors ${
                    paymentForm.type === "ADVANCE"
                      ? "focus:ring-violet-500/10 focus:border-violet-500/50 text-violet-600"
                      : "focus:ring-emerald-500/10 focus:border-emerald-500/50 text-emerald-600"
                  }`}
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-[11px] font-black text-slate-500 uppercase tracking-widest ml-1">Reference / Note</label>
                <textarea 
                  placeholder={paymentForm.type === "ADVANCE" ? "e.g. Advance for April supplies" : "e.g. Bank Transfer Ref #123"}
                  value={paymentForm.note}
                  onChange={(e) => setPaymentForm({ ...paymentForm, note: e.target.value })}
                  className="w-full px-5 py-3.5 text-sm bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500/50 font-bold transition-all resize-none text-slate-800 dark:text-white"
                  rows={2}
                />
              </div>
            </div>

            <div className="flex gap-4 pt-2">
              <button 
                onClick={() => setShowPayment(null)}
                className="flex-1 py-4 rounded-2xl border border-gray-200 dark:border-white/10 text-sm font-bold text-gray-600 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-white/5 transition-all"
              >
                Cancel
              </button>
              <button 
                onClick={handleRecordPayment}
                disabled={saving || !paymentForm.amount}
                className={`flex-[2] py-4 disabled:opacity-50 text-white rounded-2xl text-sm font-black shadow-lg transition-all uppercase tracking-widest flex items-center justify-center gap-2 ${
                  paymentForm.type === "ADVANCE"
                    ? "bg-violet-600 hover:bg-violet-500 shadow-violet-500/20"
                    : "bg-emerald-500 hover:bg-emerald-600 shadow-emerald-500/20"
                }`}
              >
                {saving
                  ? "Recording..."
                  : paymentForm.type === "ADVANCE"
                    ? <><Wallet size={18} /> Confirm Advance</>
                    : <><CreditCard size={18} /> Confirm Payment</>
                }
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Return Advance Modal */}
      {showReturn && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-md p-4">
          <div className="bg-white dark:bg-[#12141c] rounded-[2.5rem] shadow-2xl w-full max-w-md p-8 space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-black text-gray-900 dark:text-white">Return Advance</h2>
                <p className="text-xs text-gray-500 uppercase tracking-widest font-bold mt-1">{showReturn.name}</p>
              </div>
              <button onClick={() => setShowReturn(null)} className="p-2 hover:bg-black/5 rounded-full"><X size={20} className="text-gray-400" /></button>
            </div>

            <div className="bg-amber-50 dark:bg-amber-500/10 rounded-2xl p-4 border border-amber-100 dark:border-amber-500/20 flex items-center gap-3">
              <RefreshCw size={18} className="text-amber-500 shrink-0" />
              <div>
                <p className="text-xs font-black text-amber-700 dark:text-amber-400 uppercase tracking-wider">Available Advance</p>
                <p className="text-2xl font-black text-amber-600 dark:text-amber-300 leading-none mt-0.5">
                  ₹{(showReturn.balance ?? 0).toLocaleString("en-IN")}
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="block text-[11px] font-black text-slate-500 uppercase tracking-widest ml-1">Return Amount (₹)</label>
                <input
                  type="text"
                  placeholder="0.00"
                  value={returnForm.amount}
                  onChange={(e) => setReturnForm({ ...returnForm, amount: e.target.value.replace(/[^0-9.]/g, "") })}
                  className="w-full px-5 py-4 text-2xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl focus:outline-none focus:ring-4 focus:ring-amber-500/10 focus:border-amber-500/50 font-black text-amber-600"
                />
                {returnForm.amount && Number(returnForm.amount) > (showReturn.balance ?? 0) && (
                  <p className="text-xs text-red-500 font-bold ml-1">Exceeds available advance of ₹{(showReturn.balance ?? 0).toLocaleString("en-IN")}</p>
                )}
              </div>

              <div className="space-y-1.5">
                <label className="block text-[11px] font-black text-slate-500 uppercase tracking-widest ml-1">Reason / Reference</label>
                <textarea
                  placeholder="e.g. Cash returned by vendor on 24 Apr"
                  value={returnForm.note}
                  onChange={(e) => setReturnForm({ ...returnForm, note: e.target.value })}
                  className="w-full px-5 py-3.5 text-sm bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl focus:outline-none focus:ring-4 focus:ring-amber-500/10 focus:border-amber-500/50 font-bold transition-all resize-none text-slate-800 dark:text-white"
                  rows={3}
                />
              </div>
            </div>

            <div className="flex gap-4 pt-2">
              <button
                onClick={() => setShowReturn(null)}
                className="flex-1 py-4 rounded-2xl border border-gray-200 dark:border-white/10 text-sm font-bold text-gray-600 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-white/5 transition-all"
              >
                Cancel
              </button>
              <button
                onClick={handleReturnAdvance}
                disabled={saving || !returnForm.amount || Number(returnForm.amount) <= 0 || Number(returnForm.amount) > (showReturn.balance ?? 0)}
                className="flex-[2] py-4 bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-white rounded-2xl text-sm font-black shadow-lg shadow-amber-500/20 transition-all uppercase tracking-widest flex items-center justify-center gap-2"
              >
                {saving ? "Processing..." : <><RefreshCw size={18} /> Confirm Return</>}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Summary Breakdown Modal */}
      {summaryDetail && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center bg-black/60 backdrop-blur-md p-4">
          <div className="bg-white dark:bg-[#12141c] rounded-3xl shadow-2xl w-full max-w-sm p-6 border border-gray-100 dark:border-white/5 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className={clsx(
                "text-lg font-black tracking-tight",
                summaryDetail === 'OWE' ? "text-red-500" : "text-emerald-500"
              )}>
                {summaryDetail === 'OWE' ? "Vendors We Owe" : "Vendors with Advance"}
              </h2>
              <button 
                onClick={() => setSummaryDetail(null)} 
                className="p-1.5 hover:bg-gray-100 dark:hover:bg-white/10 rounded-lg"
              >
                <X size={18} className="text-gray-400" />
              </button>
            </div>

            <div className="max-h-[50vh] overflow-y-auto px-1 space-y-2 custom-scrollbar">
              {vendors
                .filter(v => summaryDetail === 'OWE' ? (v.balance || 0) < 0 : (v.balance || 0) > 0)
                .sort((a,b) => Math.abs(b.balance) - Math.abs(a.balance))
                .map((v) => (
                <div key={v.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-white/5 rounded-2xl border border-gray-100 dark:border-white/5 group hover:border-orange-500/30 transition-all">
                  <div className="flex items-center gap-3">
                    <div className={clsx(
                      "w-8 h-8 rounded-full flex items-center justify-center font-black text-[10px]",
                      summaryDetail === 'OWE' ? "bg-red-100 text-red-600" : "bg-emerald-100 text-emerald-600"
                    )}>
                      {v.name.substring(0,2).toUpperCase()}
                    </div>
                    <div>
                      <p className="text-sm font-black text-gray-800 dark:text-white group-hover:text-orange-500 transition-colors">{v.name}</p>
                      <p className="text-[10px] text-gray-400 font-bold">{v.contact}</p>
                    </div>
                  </div>
                  <p className={clsx(
                    "text-sm font-black",
                    summaryDetail === 'OWE' ? "text-red-500" : "text-emerald-500"
                  )}>
                    ₹{Math.abs(v.balance || 0).toLocaleString()}
                  </p>
                </div>
              ))}
              {vendors.filter(v => summaryDetail === 'OWE' ? (v.balance || 0) < 0 : (v.balance || 0) > 0).length === 0 && (
                <div className="text-center py-10">
                  <p className="text-sm text-gray-400 italic">No vendors found for this category.</p>
                </div>
              )}
            </div>

            <div className="pt-2 border-t border-gray-100 dark:border-white/5">
              <div className="flex justify-between items-center px-2">
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Total Focused Amount</p>
                <p className={clsx(
                  "text-lg font-black",
                  summaryDetail === 'OWE' ? "text-red-500" : "text-emerald-500"
                )}>
                  ₹{(summaryDetail === 'OWE' ? totalOwed : totalAdvance).toLocaleString()}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
