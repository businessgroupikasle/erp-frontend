"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import {
  Store, Plus, X, Search,
  Star, RefreshCw, ShoppingCart, Edit2, Trash2,
  ChevronDown, Package, AlertCircle, CreditCard, History,
  TrendingUp, TrendingDown, Minus, Wallet,
  Edit3
} from "lucide-react";
import { clsx } from "clsx";
import { vendorsApi, rawMaterialsApi, purchaseOrdersApi, inventoryApi } from "@/lib/api";
import VendorLedgerModal from "@/components/modules/vendors/VendorLedgerModal";
import { useToast } from "@/context/ToastContext";
import { useAuth } from "@/context/AuthContext";

const EMPTY_FORM = {
  name: "",
  contact: "",
  email: "",
  address: "",
  remark: ""
};

const STANDARD_UNITS = [
  { value: "kg", label: "Kilograms (kg)" },
  { value: "g", label: "Grams (g)" },
  { value: "l", label: "Liters (l)" },
  { value: "ml", label: "Milliliters (ml)" },
  { value: "pcs", label: "Pieces (pcs)" },
  { value: "packet", label: "Packet" },
  { value: "box", label: "Box" },
];

export default function VendorsClient() {
  const { user } = useAuth();
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
  const [formStep, setFormStep] = useState(1);

  const [linkModal, setLinkModal] = useState<any>(null);
  const [linkData, setLinkData]   = useState({ materialId: "", price: "", quantity: "", isNew: false, newName: "", newUnit: "kg" });

  // Merge materials from API + materials embedded in vendors' suppliedMaterials so the
  // "Existing" dropdown is never empty even if rawMaterialsApi.getAll() returns nothing.
  const allKnownMaterials = useMemo(() => {
    const seen = new Set<string>();
    const result: any[] = [];
    materials.forEach(m => { if (!seen.has(m.id)) { seen.add(m.id); result.push(m); } });
    vendors.forEach(v => {
      (v.suppliedMaterials || []).forEach((sm: any) => {
        const m = sm.material;
        if (m && !seen.has(m.id)) { seen.add(m.id); result.push(m); }
      });
    });
    return result;
  }, [materials, vendors]);

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

  const openCreate = () => { setEditing(null); setForm(EMPTY_FORM); setFormStep(1); setShowForm(true); };
  const openEdit   = (v: any) => {
    setEditing(v);
    setFormStep(1);
    setForm({
      name: v.name || "",
      contact: v.contact || "",
      email: v.email || "",
      address: v.address || "",
      remark: v.remark || ""
    });
    setShowForm(true);
  };

  const [linkEditing, setLinkEditing] = useState<any>(null);

  const openLinkModal = (vendor: any, materialToEdit: any = null) => {
     setLinkModal(vendor);
     setLinkEditing(materialToEdit);
     if (materialToEdit) {
       setLinkData({
         materialId: materialToEdit.materialId,
         price: materialToEdit.price?.toString() || "",
         quantity: (materialToEdit.quantity || 0).toString(),
         isNew: false,
         newName: "",
         newUnit: "kg"
       });
     } else {
       setLinkData({ materialId: "", price: "", quantity: "", isNew: false, newName: "", newUnit: "kg" });
     }
  };

  const handleSave = async () => {
    if (formStep === 1) {
      if (!form.name.trim() || !/^[A-Za-z\s]+$/.test(form.name)) {
        showToast("Vendor Name is required and must contain only alphabets.", "warning");
        return;
      }
      if (!form.contact.trim() || !/^\d{10}$/.test(form.contact)) {
        showToast("Contact Number must be exactly 10 digits.", "warning");
        return;
      }
      if (editing) {
          setSaving(true);
          try {
            await vendorsApi.update(editing.id, {
                ...form,
                email: form.email?.trim() || null
            });
            setShowForm(false);
            fetchVendors();
          } catch (e: any) {
              alert(e?.response?.data?.error ?? "Failed to update vendor.");
          } finally { setSaving(false); }
      } else {
          setFormStep(2);
      }
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
      
      const vRes = await vendorsApi.create(dataToSave);
      const newVendorId = vRes.data.id;

      let finalMaterialId = linkData.materialId;
      const qty = Number(linkData.quantity) || 0;

      if (linkData.isNew && linkData.newName) {
        const res = await rawMaterialsApi.create({ 
          name: linkData.newName, 
          unit: linkData.newUnit,
          initialStock: 0,
          franchiseId: user?.franchiseId || "hq-001"
        });
        finalMaterialId = res.data.id;
      }

      if (finalMaterialId) {
        await vendorsApi.linkMaterial({
          vendorId: newVendorId,
          materialId: finalMaterialId,
          price: Number(linkData.price) || 0,
          quantity: Number(linkData.quantity) || 0
        });
      }

      setShowForm(false);
      setFormStep(1);
      fetchVendors();
      setForm(EMPTY_FORM);
      setLinkData({ materialId: "", price: "", quantity: "", isNew: false, newName: "", newUnit: "kg" });
      showToast("Vendor created and material linked!", "success");
    } catch (e: any) { 
      alert(e?.response?.data?.error ?? "Failed to complete vendor registration.");
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
      const qty = Number(linkData.quantity) || 0;

      if (linkData.isNew) {
        const res = await rawMaterialsApi.create({ 
          name: linkData.newName, 
          unit: linkData.newUnit,
          initialStock: 0, // Linking doesn't mean purchasing
          franchiseId: user?.franchiseId || "hq-001"
        });
        finalMaterialId = res.data.id;
      }

      await vendorsApi.linkMaterial({
        vendorId: linkModal.id,
        materialId: finalMaterialId,
        price: Number(linkData.price) || 0,
        quantity: qty
      });

      setLinkModal(null);
      setLinkEditing(null);
      setLinkData({ materialId: "", price: "", quantity: "", isNew: false, newName: "", newUnit: "kg" });
      fetchVendors();
      showToast(linkEditing ? "Link updated successfully" : "Material linked successfully", "success");
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
    const vBalance = v.balance || 0;
    const matchesSearch = !search || v.name?.toLowerCase().includes(search.toLowerCase()) || v.contact?.includes(search);
    const matchesMaterial = !materialFilter || (v.suppliedMaterials || []).some((sm: any) => sm.materialId === materialFilter);
    let matchesBalance = true;
    if (balanceFilter === "ADVANCE") matchesBalance = vBalance > 0;
    if (balanceFilter === "OWED")    matchesBalance = vBalance < 0;
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
        <select value={balanceFilter} onChange={(e) => setBalanceFilter(e.target.value)} className="px-3 py-2.5 text-sm bg-white dark:bg-card border border-gray-200 rounded-xl font-bold outline-none ring-orange-500/10 focus:ring-4 transition-all">
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
                <h3 className="font-bold text-gray-900 dark:text-white text-base truncate uppercase">{vendor.name}</h3>
                <div className="flex items-center gap-1 mt-0.5">
                  <Star size={10} className="text-amber-400 fill-amber-400" />
                  <span className="text-[10px] font-bold text-amber-500 uppercase">5.0 Rating</span>
                </div>
              </div>
              <div className="flex gap-1 shrink-0 bg-gray-50 dark:bg-white/5 p-1 rounded-xl">
                <button onClick={() => openLinkModal(vendor)} className="p-2 text-gray-400 hover:text-indigo-600 transition-colors"><Plus size={14} /></button>
                <button onClick={() => openEdit(vendor)} className="p-2 text-gray-400 hover:text-orange-500 transition-colors"><Edit2 size={14} /></button>
                <button onClick={() => handleDelete(vendor)} className="p-2 text-gray-400 hover:text-red-500 transition-colors"><Trash2 size={14} /></button>
              </div>
            </div>
            
            <div className="grid grid-cols-3 gap-2 mb-5">
              <div className="bg-slate-50 dark:bg-white/5 p-2.5 rounded-xl border border-slate-100 dark:border-white/5 flex flex-col justify-center">
                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter mb-0.5">Purchased</p>
                <p className="text-sm font-bold">₹{(vendor.totalPurchased || 0).toLocaleString()}</p>
              </div>
              <div className="bg-emerald-50/30 dark:bg-emerald-500/5 p-2.5 rounded-xl border border-emerald-100 dark:border-emerald-500/10 flex flex-col justify-center">
                <p className="text-[9px] font-bold text-emerald-600 uppercase tracking-tighter mb-0.5">Paid</p>
                <p className="text-sm font-bold">₹{(vendor.totalPaid || 0).toLocaleString()}</p>
              </div>
              <div className={clsx("p-2.5 rounded-xl border flex flex-col justify-center", (vendor.balance ?? 0) > 0 ? "bg-emerald-50 border-emerald-100" : (vendor.balance ?? 0) < 0 ? "bg-red-50 border-red-100" : "bg-slate-50 border-slate-100")}>
                <p className="text-[9px] font-bold uppercase tracking-tighter mb-0.5">{(vendor.balance ?? 0) > 0 ? "Advance" : (vendor.balance ?? 0) < 0 ? "Due" : "Settled"}</p>
                <p className="text-sm font-bold text-slate-900 dark:text-white">₹{Math.abs(vendor.balance || 0).toLocaleString()}</p>
              </div>
            </div>

            <div className="flex gap-2 mb-4">
              <button onClick={() => setShowLedger(vendor)} className="flex-1 py-2 px-3 bg-blue-500/5 hover:bg-blue-500/10 text-blue-600 font-bold text-[10px] uppercase rounded-xl border border-blue-500/10 transition-colors flex items-center justify-center gap-2"><History size={12} /> Ledger</button>
              <button onClick={() => { setShowPayment(vendor); setPaymentForm({ amount: "", note: "", type: "PAYMENT", referenceId: "" }); }} className="flex-1 py-2 px-3 bg-emerald-500/5 hover:bg-emerald-500/10 text-emerald-600 font-bold text-[10px] uppercase rounded-xl border border-emerald-500/10 transition-colors flex items-center justify-center gap-2"><CreditCard size={12} /> Payment</button>
            </div>

            <div className="bg-gray-50 dark:bg-indigo-500/5 rounded-xl p-4 border border-gray-100">
              <p className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest mb-3 flex items-center gap-1.5"><Package size={12} /> Linked Materials</p>
              <div className="flex flex-wrap gap-2">
                {vendor.suppliedMaterials?.map((sm: any, i: number) => (
                  <div key={i} className="group relative px-2.5 py-1.5 bg-white border border-gray-200 rounded-lg text-xs font-semibold flex items-center gap-2 pr-7">
                    <span className="text-gray-700">{sm.material?.name}</span>
                    <span className="text-indigo-600 font-bold">₹{sm.price}</span>
                    <button 
                      onClick={() => openLinkModal(vendor, sm)}
                      className="absolute right-1 opacity-0 group-hover:opacity-100 p-1 text-gray-400 hover:text-indigo-500 transition-all"
                    >
                      <Edit3 size={10} />
                    </button>
                  </div>
                )) || <span className="text-xs text-gray-400 italic">No materials linked</span>}
              </div>
            </div>
          </div>
        ))}
      </div>

      {linkModal && (
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
            ) : (
              <div className="space-y-5 animate-in slide-in-from-right-4 duration-300">
                <div className="bg-slate-50 dark:bg-white/5 p-1 rounded-xl flex gap-1">
                    <button 
                      onClick={() => setLinkData({ ...linkData, isNew: false })}
                      className={clsx("flex-1 py-2 rounded-lg text-[10px] font-bold uppercase transition-all", !linkData.isNew ? "bg-white dark:bg-card text-indigo-600 shadow-sm" : "text-slate-400")}
                    >
                      Existing
                    </button>
                    <button 
                      onClick={() => setLinkData({ ...linkData, isNew: true })}
                      className={clsx("flex-1 py-2 rounded-lg text-[10px] font-bold uppercase transition-all", linkData.isNew ? "bg-white dark:bg-card text-indigo-600 shadow-sm" : "text-slate-400")}
                    >
                      New
                    </button>
                </div>

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
                           className="w-full px-4 py-3 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl text-sm font-semibold outline-none"
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
                      className="w-full px-4 py-3 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl text-sm font-semibold outline-none"
                    >
                        <option value="">Select an option...</option>
                        {allKnownMaterials.map(m => (
                          <option key={m.id} value={m.id}>{m.name} ({m.unit})</option>
                        ))}
                    </select>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Qty</label>
                    <input type="number" placeholder="0" value={linkData.quantity} onChange={(e) => setLinkData({...linkData, quantity: e.target.value})} className="w-full px-4 py-3 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl text-sm font-semibold outline-none" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Price (₹)</label>
                    <input type="number" placeholder="0.00" value={linkData.price} onChange={(e) => setLinkData({...linkData, price: e.target.value})} className="w-full px-4 py-3 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl text-sm font-semibold outline-none" />
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
