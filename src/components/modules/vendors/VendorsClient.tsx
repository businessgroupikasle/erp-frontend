"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Store, Plus, X, Search,
  Star, RefreshCw, ShoppingCart, Edit2, Trash2,
  ChevronDown, Package, AlertCircle, CreditCard, History,
  TrendingUp, TrendingDown, Minus, Wallet
} from "lucide-react";
import { clsx } from "clsx";
import { vendorsApi, rawMaterialsApi, purchaseOrdersApi } from "@/lib/api";
import VendorLedgerModal from "@/components/modules/vendors/VendorLedgerModal";
import { useToast } from "@/context/ToastContext";

const EMPTY_FORM = {
  name: "",
  contact: "",
  email: "",
  address: "",
  remark: ""
};

export default function VendorsClient() {
  const { showToast } = useToast();
  const [vendors, setVendors]   = useState<any[]>([]);
  const [summary, setSummary]   = useState<any>(null);
  const [materials, setMaterials] = useState<any[]>([]);
  const [loading, setLoading]   = useState(true);
  const [search, setSearch]     = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing]   = useState<any>(null);
  const [orders, setOrders]     = useState<any[]>([]);
  const [saving, setSaving]     = useState(false);
  const [form, setForm]         = useState(EMPTY_FORM);

  const [linkModal, setLinkModal] = useState<any>(null);
  const [linkData, setLinkData]   = useState({ materialId: "", price: "", isNew: false, newName: "", newUnit: "kg" });

  const [confirmModal, setConfirmModal] = useState<{ show: boolean, vendor: any } | null>(null);
  const [errorMessage, setErrorMessage] = useState<{ title: string; message: string } | null>(null);
  const [summaryDetail, setSummaryDetail] = useState<'OWE' | 'ADVANCE' | null>(null);
  
  const [showLedger, setShowLedger] = useState<any>(null);
  const [showPayment, setShowPayment] = useState<any>(null);
  const [showUnitList, setShowUnitList] = useState(false);
  const [paymentForm, setPaymentForm] = useState({ amount: "", note: "", referenceId: "", type: "PAYMENT" as "PAYMENT" | "ADVANCE" });

  const [showReturn, setShowReturn] = useState<any>(null);
  const [returnForm, setReturnForm] = useState({ amount: "", note: "" });

  const fetchVendors = useCallback(async () => {
    setLoading(true);
    try {
      const [vRes, mRes, sRes, poRes] = await Promise.all([
        vendorsApi.getAll().catch(() => ({ data: [] })),
        rawMaterialsApi.getAll().catch(() => ({ data: [] })),
        vendorsApi.getSummary().catch(() => ({ data: null })),
        purchaseOrdersApi.getAll().catch(() => ({ data: [] }))
      ]);
      setVendors(vRes.data ?? []);
      setMaterials(mRes.data ?? []);
      setSummary(sRes.data ?? null);
      setOrders(poRes.data ?? []);
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
    if (!form.name.trim() || !/^[A-Za-z\s]+$/.test(form.name)) {
      showToast("Vendor Name is required and must contain only alphabets.", "warning");
      return;
    }
    if (!form.contact.trim() || !/^\d{10}$/.test(form.contact)) {
      showToast("Contact Number must be exactly 10 digits.", "warning");
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
      alert(e?.response?.data?.error ?? "Failed to save vendor details.");
    } finally { setSaving(false); }
  };

  const handleRecordPayment = async () => {
    if (!showPayment || !paymentForm.amount) return;
    setSaving(true);
    try {
      await vendorsApi.recordPayment(showPayment.id, {
        amount: Number(paymentForm.amount),
        note: paymentForm.note || (paymentForm.type === "ADVANCE" ? "Advance Payment" : "Direct Payment"),
        referenceId: paymentForm.referenceId || undefined
      });
      setShowPayment(null);
      setPaymentForm({ amount: "", note: "", type: "PAYMENT", referenceId: "" });
      fetchVendors();
    } catch (e: any) {
      alert(e?.response?.data?.error ?? "Failed to record payment.");
    } finally { setSaving(false); }
  };

  const handleReturnAdvance = async () => {
    if (!showReturn || !returnForm.amount) return;
    const amount = Number(returnForm.amount);
    const advance = showReturn.advance ?? 0;
    if (amount > advance) {
      alert(`Return amount (₹${amount.toLocaleString()}) cannot exceed available advance (₹${advance.toLocaleString()})`);
      return;
    }
    setSaving(true);
    try {
      await vendorsApi.recordAdjustment(showReturn.id, {
        amount,
        type: "DEBIT",
        referenceType: "RETURN",
        note: returnForm.note || "Advance Returned by Vendor"
      });
      setShowReturn(null);
      setReturnForm({ amount: "", note: "" });
      fetchVendors();
    } catch (e: any) {
      alert(e?.response?.data?.error ?? "Failed to record return.");
    } finally { setSaving(false); }
  };

  const handleLinkMaterial = async () => {
    if (linkData.isNew && (!linkData.newName || !linkData.newUnit)) return;
    if (!linkData.isNew && !linkData.materialId) return;
    setSaving(true);
    try {
      let finalMaterialId = linkData.materialId;
      if (linkData.isNew) {
        const res = await rawMaterialsApi.create({ name: linkData.newName, unit: linkData.newUnit });
        finalMaterialId = res.data.id;
      }
      await vendorsApi.linkMaterial({
        vendorId: linkModal.id,
        materialId: finalMaterialId,
        price: Number(linkData.price) || 0
      });
      setLinkModal(null);
      setLinkData({ materialId: "", price: "", isNew: false, newName: "", newUnit: "kg" });
      fetchVendors();
      showToast("Material linked successfully", "success");
    } catch (e: any) {
      showToast(e?.response?.data?.error ?? "Failed to link material", "error");
    } finally { setSaving(false); }
  };

  const handleDelete = async (vendor: any) => {
    if (Math.abs(vendor.balance || 0) > 0) {
      setErrorMessage({
        title: "Financial Settle Required",
        message: `Cannot delete "${vendor.name}" because there is a remaining balance of ₹${Math.abs(vendor.balance).toLocaleString()}.`
      });
      return;
    }
    setConfirmModal({ show: true, vendor });
  };

  const confirmDelete = async () => {
    if (!confirmModal?.vendor) return;
    try {
      await vendorsApi.delete(confirmModal.vendor.id);
      fetchVendors();
      setConfirmModal(null);
    } catch (e: any) {
      setErrorMessage({ title: "Deletion Failed", message: e?.response?.data?.error ?? "Error deleting vendor." });
      setConfirmModal(null);
    }
  };

  const [materialFilter, setMaterialFilter] = useState("");
  const [balanceFilter, setBalanceFilter]   = useState("ALL");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");

  const filtered = vendors.filter((v) => {
    const matchesSearch = !search || v.name?.toLowerCase().includes(search.toLowerCase()) || v.contact?.includes(search);
    const matchesMaterial = !materialFilter || (v.suppliedMaterials || []).some((sm: any) => sm.materialId === materialFilter);
    let matchesBalance = true;
    if (balanceFilter === "ADVANCE") matchesBalance = (v.balance || 0) > 0;
    if (balanceFilter === "OWED")    matchesBalance = (v.balance || 0) < 0;
    return matchesSearch && matchesMaterial && matchesBalance;
  });

  const totalOwed    = summary?.totalOwed ?? 0;
  const totalAdvance = summary?.totalAdvance ?? 0;
  const totalPurchased = summary?.totalPurchased ?? 0;

  return (
    <div className="max-w-6xl mx-auto space-y-8 p-1">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-gray-900 dark:text-white flex items-center gap-2">
            <Store size={22} className="text-orange-500" /> Vendor Management
          </h1>
          <p className="text-sm text-gray-500 dark:text-slate-400 mt-1">Manage suppliers who provide raw materials</p>
        </div>
        <div className="flex gap-2">
          <button onClick={fetchVendors} className="p-2 rounded-xl border border-gray-200 dark:border-white/10"><RefreshCw size={16} className="text-gray-400" /></button>
          <button onClick={openCreate} className="bg-orange-500 text-white px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2"><Plus size={16} /> Add Vendor</button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white/70 dark:bg-card/70 backdrop-blur-md rounded-2xl border border-gray-100 dark:border-white/5 p-6 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-orange-50 dark:bg-orange-500/10 rounded-xl"><Store size={20} className="text-orange-500" /></div>
            <div><p className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Vendors</p><p className="text-2xl font-black text-slate-900 dark:text-white mt-1">{vendors.length}</p></div>
          </div>
        </div>
        <div onClick={() => setSummaryDetail('OWE')} className="bg-red-50/70 dark:bg-red-500/10 rounded-2xl border border-red-100 dark:border-red-500/20 p-5 shadow-sm cursor-pointer">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-red-100 dark:bg-red-500/20 rounded-xl"><AlertCircle size={20} className="text-red-500" /></div>
            <div><p className="text-[11px] font-black text-red-600/70 uppercase tracking-widest">Total Owed</p><p className="text-2xl font-black text-red-700 dark:text-red-400 mt-1">₹{Math.round(totalOwed).toLocaleString()}</p></div>
          </div>
        </div>
        <div onClick={() => setSummaryDetail('ADVANCE')} className="bg-emerald-50/70 dark:bg-emerald-500/10 rounded-2xl border border-emerald-100 dark:border-emerald-500/20 p-5 shadow-sm cursor-pointer">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-emerald-100 dark:bg-emerald-500/20 rounded-xl"><RefreshCw size={20} className="text-emerald-500" /></div>
            <div><p className="text-[11px] font-black text-emerald-600/70 uppercase tracking-widest">Advance</p><p className="text-2xl font-black text-emerald-700 dark:text-emerald-400 mt-1">₹{Math.round(totalAdvance).toLocaleString()}</p></div>
          </div>
        </div>
        <div className="bg-indigo-50/70 dark:bg-indigo-500/10 rounded-2xl border border-indigo-100 dark:border-indigo-500/20 p-5 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-indigo-100 dark:bg-indigo-500/20 rounded-xl"><ShoppingCart size={20} className="text-indigo-600" /></div>
            <div><p className="text-[11px] font-black text-indigo-600/70 uppercase tracking-widest">Purchased</p><p className="text-2xl font-black text-indigo-700 dark:text-indigo-400 mt-1">₹{Math.round(totalPurchased).toLocaleString()}</p></div>
          </div>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search vendors..." className="w-full pl-9 pr-4 py-2.5 text-sm bg-white dark:bg-card border border-gray-200 rounded-xl" />
        </div>
        <select value={balanceFilter} onChange={(e) => setBalanceFilter(e.target.value)} className="px-3 py-2.5 text-sm bg-white dark:bg-card border border-gray-200 rounded-xl font-bold">
          <option value="ALL">All Balances</option>
          <option value="ADVANCE">Only Advance</option>
          <option value="OWED">Only Owed</option>
        </select>
      </div>

      <div className="grid gap-6 sm:grid-cols-2">
        {filtered.map((vendor) => (
          <div key={vendor.id} className="bg-white dark:bg-[#12141c] rounded-3xl border border-gray-100 dark:border-white/5 p-6 hover:shadow-xl transition-all group overflow-hidden relative">
            <div className="absolute top-0 right-0 w-24 h-24 bg-orange-500/5 rounded-bl-[100px] -mr-8 -mt-8" />
            <div className="flex items-start gap-4 mb-5 relative z-10">
              <div className="w-14 h-14 rounded-2xl bg-orange-500 flex items-center justify-center shrink-0 shadow-lg shadow-orange-500/20"><Store size={24} className="text-white" /></div>
              <div className="flex-1 min-w-0">
                <h3 className="font-black text-gray-900 dark:text-white text-[15px] truncate uppercase">{vendor.name}</h3>
                <div className="flex items-center gap-1.5 mt-1">
                  <Star size={11} className="text-amber-400 fill-amber-400" />
                  <span className="text-[10px] font-black text-amber-500 bg-amber-50 dark:bg-amber-400/10 px-1.5 py-0.5 rounded-full">5.0</span>
                </div>
              </div>
              <div className="flex gap-1 shrink-0 bg-gray-50 dark:bg-white/5 p-1 rounded-xl">
                <button onClick={() => setLinkModal(vendor)} className="p-2 text-gray-400 hover:text-indigo-600"><Plus size={14} /></button>
                <button onClick={() => openEdit(vendor)} className="p-2 text-gray-400 hover:text-orange-500"><Edit2 size={14} /></button>
                <button onClick={() => handleDelete(vendor)} className="p-2 text-gray-400 hover:text-red-500"><Trash2 size={14} /></button>
              </div>
            </div>
            
            <div className="grid grid-cols-3 gap-2.5 mb-5">
              <div className="bg-slate-50 dark:bg-white/5 p-3 rounded-2xl border border-slate-100"><p className="text-[9px] font-black text-slate-400 uppercase tracking-tighter mb-1">PURCHASED</p><p className="text-[13px] font-black">₹{(vendor.totalPurchased || 0).toLocaleString()}</p></div>
              <div className="bg-emerald-50/30 dark:bg-emerald-500/5 p-3 rounded-2xl border border-emerald-100"><p className="text-[9px] font-black text-emerald-600 uppercase tracking-tighter mb-1">PAID</p><p className="text-[13px] font-black">₹{(vendor.totalPaid || 0).toLocaleString()}</p></div>
              <div className={clsx("p-3 rounded-2xl border", (vendor.balance ?? 0) > 0 ? "bg-emerald-50" : (vendor.balance ?? 0) < 0 ? "bg-red-50" : "bg-slate-50")}>
                <p className="text-[9px] font-black uppercase tracking-tighter mb-1">{(vendor.balance ?? 0) > 0 ? "ADVANCE" : (vendor.balance ?? 0) < 0 ? "DUE" : "SETTLED"}</p>
                <p className="text-[13px] font-black">₹{Math.abs(vendor.balance || 0).toLocaleString()}</p>
              </div>
            </div>

            <div className="flex gap-2 mb-5">
              <button onClick={() => setShowLedger(vendor)} className="flex-1 py-2 px-4 bg-blue-500/10 text-blue-600 font-black text-[11px] uppercase rounded-xl border border-blue-500/10 flex items-center justify-center gap-2"><History size={14} /> Ledger</button>
              <button onClick={() => { setShowPayment(vendor); setPaymentForm({ amount: "", note: "", type: "PAYMENT", referenceId: "" }); }} className="flex-1 py-2 px-4 bg-emerald-500/10 text-emerald-600 font-black text-[11px] uppercase rounded-xl border border-emerald-500/10 flex items-center justify-center gap-2"><CreditCard size={14} /> Payment</button>
            </div>

            <div className="bg-gray-50 dark:bg-indigo-500/5 rounded-2xl p-3 border border-gray-100">
              <p className="text-[9px] font-black text-indigo-400 uppercase tracking-widest mb-2 flex items-center gap-1.5"><Package size={10} /> Linked Materials</p>
              <div className="flex flex-wrap gap-2">
                {vendor.suppliedMaterials?.map((sm: any, i: number) => (
                  <div key={i} className="px-2 py-1 bg-white border border-gray-200 rounded-lg text-[10px] font-black flex items-center gap-1">
                    <span>{sm.material?.name}</span><span className="text-indigo-500">₹{sm.price}</span>
                  </div>
                )) || <span className="text-[10px] text-gray-400 italic">None</span>}
              </div>
            </div>
          </div>
        ))}
      </div>

      {linkModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-[#12141c] rounded-[2.5rem] shadow-2xl w-full max-w-md p-8 space-y-6 overflow-hidden relative">
             <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 rounded-bl-[100px] -mr-12 -mt-12" />
             
             <div className="flex items-center gap-4 relative z-10">
                <div className="w-12 h-12 rounded-2xl bg-indigo-600 flex items-center justify-center text-white shadow-lg shadow-indigo-600/20">
                   <Plus size={24} />
                </div>
                <div>
                   <h2 className="text-lg font-black text-gray-900 dark:text-white uppercase tracking-tight">Link Material</h2>
                   <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{linkModal.name}</p>
                </div>
             </div>

             <div className="bg-slate-50 dark:bg-white/5 p-1.5 rounded-2xl flex gap-1">
                <button 
                  onClick={() => setLinkData({ ...linkData, isNew: false })}
                  className={clsx("flex-1 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all", !linkData.isNew ? "bg-white dark:bg-card text-indigo-600 shadow-sm" : "text-slate-400")}
                >
                  Existing
                </button>
                <button 
                  onClick={() => setLinkData({ ...linkData, isNew: true })}
                  className={clsx("flex-1 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all", linkData.isNew ? "bg-white dark:bg-card text-indigo-600 shadow-sm" : "text-slate-400")}
                >
                  New Material
                </button>
             </div>

             <div className="space-y-4 relative z-10">
                {linkData.isNew ? (
                   <>
                      <div className="space-y-1.5">
                         <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Material Name</label>
                         <input 
                           placeholder="Enter material name..." 
                           value={linkData.newName} 
                           onChange={(e) => setLinkData({ ...linkData, newName: e.target.value })}
                           className="w-full px-5 py-3.5 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl font-bold text-sm focus:ring-4 ring-indigo-500/10 outline-none transition-all"
                         />
                      </div>
                      <div className="space-y-1.5">
                         <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Unit (kg, ltr, etc.)</label>
                         <input 
                           placeholder="kg" 
                           value={linkData.newUnit} 
                           onChange={(e) => setLinkData({ ...linkData, newUnit: e.target.value })}
                           className="w-full px-5 py-3.5 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl font-bold text-sm focus:ring-4 ring-indigo-500/10 outline-none transition-all"
                         />
                      </div>
                   </>
                ) : (
                   <div className="space-y-1.5">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Select Material</label>
                      <select 
                        value={linkData.materialId} 
                        onChange={(e) => setLinkData({ ...linkData, materialId: e.target.value })}
                        className="w-full px-5 py-3.5 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl font-bold text-sm focus:ring-4 ring-indigo-500/10 outline-none transition-all appearance-none cursor-pointer"
                      >
                         <option value="">Choose Material...</option>
                         {materials.map(m => (
                            <option key={m.id} value={m.id}>{m.name} ({m.unit})</option>
                         ))}
                      </select>
                   </div>
                )}

                <div className="space-y-1.5">
                   <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Base Price (₹)</label>
                   <input 
                     placeholder="0.00" 
                     type="number"
                     value={linkData.price} 
                     onChange={(e) => setLinkData({ ...linkData, price: e.target.value })}
                     className="w-full px-5 py-3.5 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl font-bold text-sm focus:ring-4 ring-indigo-500/10 outline-none transition-all"
                   />
                </div>
             </div>

             <div className="flex gap-4 pt-2">
                <button 
                  onClick={() => setLinkModal(null)} 
                  className="flex-1 py-4 text-[11px] font-black uppercase tracking-widest text-slate-500 hover:bg-slate-100 dark:hover:bg-white/5 rounded-2xl transition-all"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleLinkMaterial} 
                  disabled={saving || (linkData.isNew ? !linkData.newName : !linkData.materialId)} 
                  className="flex-[2] py-4 bg-indigo-600 text-white rounded-2xl text-[11px] font-black shadow-lg shadow-indigo-600/20 uppercase tracking-[0.2em] transition-all hover:scale-[1.02] active:scale-95 disabled:opacity-50"
                >
                  {saving ? "Linking..." : "Confirm Link"}
                </button>
             </div>
          </div>
        </div>
      )}

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-[#12141c] rounded-[2.5rem] shadow-2xl w-full max-w-xl p-8 space-y-6">
            <h2 className="text-base font-black text-gray-900 dark:text-white">{editing ? "Edit Vendor" : "Add Vendor"}</h2>
            <div className="space-y-4">
              <input placeholder="Vendor Name" value={form.name} onChange={(e) => setForm({...form, name: e.target.value})} className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl font-semibold" />
              <input placeholder="Contact" value={form.contact} maxLength={10} onChange={(e) => setForm({...form, contact: e.target.value.replace(/\D/g, "")})} className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl font-semibold" />
              <input placeholder="Email" value={form.email} onChange={(e) => setForm({...form, email: e.target.value})} className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl font-semibold" />
              <textarea placeholder="Address" value={form.address} rows={2} onChange={(e) => setForm({...form, address: e.target.value})} className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl font-semibold resize-none" />
            </div>
            <div className="flex gap-3 justify-end">
              <button onClick={() => setShowForm(false)} className="px-4 py-2 text-sm font-bold text-gray-600">Cancel</button>
              <button onClick={handleSave} disabled={saving} className="px-5 py-2 bg-orange-500 text-white rounded-xl text-sm font-bold shadow-lg shadow-orange-500/20">{saving ? "Saving..." : "Save Vendor"}</button>
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
