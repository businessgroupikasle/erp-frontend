"use client";

import { useState, useEffect, useCallback } from "react";
import {
  ShoppingCart, Plus, X, CheckCircle2, Clock, Truck,
  Store, Package, IndianRupee, Search, ChevronDown,
  Wallet, AlertCircle, RefreshCw, Ban, Trash2, Calendar as CalendarIcon,
  ChevronLeft, ChevronRight, FileText, Cog
} from "lucide-react";
import { clsx } from "clsx";
import {
  format, addMonths, subMonths, startOfMonth, endOfMonth,
  startOfWeek, endOfWeek, isSameDay, isSameMonth, addDays, parseISO,
  isBefore, startOfDay
} from "date-fns";
import { purchaseOrdersApi, vendorsApi, rawMaterialsApi, settingsApi } from "@/lib/api";
import GSTInvoice from "@/components/documents/GSTInvoice";
import { useToast } from "@/context/ToastContext";
import { UNITS } from "@/lib/constants";

const FALLBACK_COMPANY = {
  name: "Your Company Ltd",
  address: "Please update address in System Settings",
  gstin: "Not Configured",
  state: "Select State",
  email: "admin@company.com",
  phone: "Contact Not Set"
};

const STATUS_STYLES: Record<string, string> = {
  PENDING: "bg-amber-100 text-amber-700 dark:bg-amber-900/20 dark:text-amber-400",
  APPROVED: "bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400",
  RECEIVED: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400",
  CANCELLED: "bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-400",
};

const STATUS_ICONS: Record<string, any> = {
  PENDING: Clock,
  APPROVED: CheckCircle2,
  RECEIVED: Truck,
  CANCELLED: X,
};

function fmt(n: number) {
  return "₹" + Math.round(n).toLocaleString("en-IN");
}

interface POItem {
  inventoryItemId: string;
  itemName: string;
  unit: string;
  quantity: number;
  price: number;
  hsnCode: string;
  gstRate: number;
}

export default function PurchaseOrdersClient() {
  const { showToast } = useToast();
  const [orders, setOrders] = useState<any[]>([]);
  const [vendors, setVendors] = useState<any[]>([]);
  const [materials, setMaterials] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("ALL");
  const [vendorFilter, setVendorFilter] = useState("");

  const [companyProfile, setCompanyProfile] = useState<any>(null);

  const [vendorId, setVendorId] = useState("");
  const [expectedDate, setExpectedDate] = useState("");
  const [notes, setNotes] = useState("");
  const [items, setItems] = useState<POItem[]>([
    { inventoryItemId: "", itemName: "", unit: "kg", quantity: 0, price: 0, hsnCode: "", gstRate: 5 },
  ]);
  const [saving, setSaving] = useState(false);

  const [showVendorList, setShowVendorList] = useState(false);
  const [vendorSearch, setVendorSearch] = useState("");
  const [showMaterialList, setShowMaterialList] = useState<number | null>(null);
  const [materialSearch, setMaterialSearch] = useState("");
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [viewDate, setViewDate] = useState(new Date());
  const [showUnitList, setShowUnitList] = useState(false);

  const [showMaterialForm, setShowMaterialForm] = useState(false);
  const [newMat, setNewMat] = useState({ name: "", unit: "kg", hsnCode: "", gstRate: 5 });
  const [matSaving, setMatSaving] = useState(false);
  const [viewingPO, setViewingPO] = useState<any>(null);
  const [showSettings, setShowSettings] = useState(false);
  const [editingProfile, setEditingProfile] = useState<any>(FALLBACK_COMPANY);
  const [forceShowAllMaterials, setForceShowAllMaterials] = useState(false);

  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentAmount, setPaymentAmount] = useState(0);
  const [paymentNote, setPaymentNote] = useState("");
  const [payingPO, setPayingPO] = useState<any>(null);
  const [paymentMode, setPaymentMode] = useState<"CASH" | "UPI" | "CARD" | undefined>(undefined);
  const [lastPayment, setLastPayment] = useState<any>(null);

  const selectedVendor = vendors.find((v: any) => v.id === vendorId);
  const currentCompany = companyProfile || FALLBACK_COMPANY;
  const isProfileComplete = companyProfile && companyProfile.gstin && companyProfile.address;

  const fetchAll = useCallback(async () => {
    setLoading(true);
    try {
      const [poRes, vRes, rmRes, cpRes] = await Promise.all([
        purchaseOrdersApi.getAll().catch(() => ({ data: [] })),
        vendorsApi.getAll().catch(() => ({ data: [] })),
        rawMaterialsApi.getAll().catch(() => ({ data: [] })),
        settingsApi.getCompanyProfile().catch(() => ({ data: null }))
      ]);
      setOrders(poRes.data ?? []);
      setVendors(vRes.data ?? []);
      setMaterials(rmRes.data ?? []);
      if (cpRes.data) {
        setCompanyProfile(cpRes.data);
        setEditingProfile(cpRes.data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  useEffect(() => {
    if (vendorId && selectedVendor) {
      setItems(prev => prev.map(it => {
        if (!it.inventoryItemId) return it;
        const vendorRate = selectedVendor?.suppliedMaterials?.find(
          (sm: any) => sm.materialId === it.inventoryItemId
        )?.price ?? 0;
        if (vendorRate > 0) return { ...it, price: vendorRate };
        return it;
      }));
    }
  }, [vendorId, selectedVendor]);

  const addItem = () =>
    setItems((prev) => [...prev, { inventoryItemId: "", itemName: "", unit: "kg", quantity: 0, price: 0, hsnCode: "", gstRate: 5 }]);

  const removeItem = (i: number) =>
    setItems((prev) => prev.filter((_, idx) => idx !== i));

  const updateItem = (i: number, field: keyof POItem, value: any) =>
    setItems((prev) => prev.map((it, idx) => {
      if (idx !== i) return it;
      const cleanVal = (field === "quantity" || field === "price") ? Math.max(0, value) : value;
      if (field === "inventoryItemId") {
        if (prev.some((item, index) => index !== i && item.inventoryItemId === value)) {
          showToast("This material is already in your order list.", "warning");
          return it;
        }
        const mat = materials.find((m: any) => m.id === value);
        const vendorRate = selectedVendor?.suppliedMaterials?.find(
          (sm: any) => sm.materialId === value
        )?.price ?? 0;
        return {
          ...it,
          inventoryItemId: value,
          itemName: mat?.name ?? "",
          unit: mat?.unit ?? "kg",
          price: vendorRate > 0 ? vendorRate : it.price,
          hsnCode: mat?.hsnCode ?? "",
          gstRate: mat?.gstRate ?? 5,
        };
      }
      return { ...it, [field]: cleanVal };
    }));

  const subtotal = items.reduce((s, it) => s + (it.quantity * it.price), 0);
  const round = (n: number) => Math.round(n * 100) / 100;
  const isSameState = !selectedVendor?.state || selectedVendor.state.toLowerCase().includes((currentCompany.state || "").toLowerCase());

  const taxDetails = items.reduce((acc, it) => {
    const amt = it.quantity * it.price;
    const tax = amt * (it.gstRate / 100);
    if (isSameState) {
      acc.cgst += round(tax / 2);
      acc.sgst += round(tax / 2);
    } else {
      acc.igst += round(tax);
    }
    return acc;
  }, { cgst: 0, sgst: 0, igst: 0 });

  const totalGst = round(taxDetails.cgst + taxDetails.sgst + taxDetails.igst);
  const grandTotal = round(subtotal + totalGst);
  const availableAdvance = Math.max(0, selectedVendor?.balance ?? 0);
  const autoApplied = Math.min(availableAdvance, grandTotal);
  const balanceDue = Math.max(0, grandTotal - autoApplied);

  const handleCreate = async () => {
    if (!vendorId || items.some((it) => !it.inventoryItemId || it.quantity <= 0 || it.price <= 0)) return;
    setSaving(true);
    try {
      await purchaseOrdersApi.create({
        vendorId,
        advancePaid: autoApplied,
        expectedDeliveryDate: expectedDate,
        notes,
        items: items.map(({ inventoryItemId, quantity, price, hsnCode, gstRate }) => ({ inventoryItemId, quantity, price, hsnCode, gstRate })),
      });
      setShowForm(false);
      setVendorId(""); setExpectedDate(""); setNotes("");
      setItems([{ inventoryItemId: "", itemName: "", unit: "kg", quantity: 0, price: 0, hsnCode: "", gstRate: 5 }]);
      fetchAll();
    } catch (e: any) {
      alert(e?.response?.data?.error || "Failed to create Purchase Order.");
    } finally { setSaving(false); }
  };

  const handleApplyAdvance = async (id: string) => {
    try {
      await purchaseOrdersApi.applyAdvance(id);
      fetchAll();
    } catch (e: any) {
      alert(e?.response?.data?.error || "Failed to apply advance.");
    }
  };

  const handleCancel = async (id: string) => {
    if (!confirm("Cancel this purchase order?")) return;
    try {
      await purchaseOrdersApi.cancel(id);
      fetchAll();
    } catch (e: any) {
      alert(e?.response?.data?.error ?? "Failed to cancel PO");
    }
  };

  const handleRecordPayment = async () => {
    if (!payingPO || paymentAmount <= 0 || !paymentMode) return;
    setSaving(true);
    try {
      const res = await vendorsApi.recordPayment(payingPO.vendorId, {
        amount: paymentAmount,
        note: paymentNote || `Payment for PO #${payingPO.id.substring(0, 8)}`,
        paymentMode,
        referenceId: payingPO.id
      });
      setLastPayment(res.data);
      setShowPaymentModal(false);
      setPayingPO(null);
      setPaymentAmount(0);
      setPaymentNote("");
      fetchAll();
    } catch (e: any) {
      alert(e.response?.data?.error || "Failed to record payment.");
    } finally { setSaving(false); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this purchase order?")) return;
    try {
      await purchaseOrdersApi.delete(id);
      fetchAll();
    } catch (e: any) {
      alert(e?.response?.data?.error ?? "Failed to delete PO");
    }
  };

  const filtered = orders.filter((o) => {
    const matchesSearch = !search || o.vendor?.name?.toLowerCase().includes(search.toLowerCase()) || o.id?.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = filterStatus === "ALL" || o.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const totalSpend = orders.reduce((s, o) => s + (o.totalAmount ?? 0), 0);
  const totalPaid = orders.reduce((s, o) => s + (o.paid ?? 0), 0);
  const totalBalance = Math.max(0, totalSpend - totalPaid);
  const pendingCount = orders.filter((o) => o.status === "PENDING").length;

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-gray-900 dark:text-white flex items-center gap-2">
            <ShoppingCart size={22} className="text-orange-500" /> Purchase Orders
          </h1>
          <p className="text-sm text-gray-500 dark:text-slate-400 mt-1">Buy raw materials from vendors</p>
        </div>
        <div className="flex gap-2">
           <button onClick={() => setShowSettings(true)} className="p-2 rounded-xl border border-gray-200 dark:border-white/10 group"><Cog size={16} className="text-gray-400 group-hover:text-orange-500 transition-colors" /></button>
           <button onClick={fetchAll} className="p-2 rounded-xl border border-gray-200 dark:border-white/10"><RefreshCw size={16} className="text-gray-400" /></button>
           <button onClick={() => setShowForm(true)} className="flex items-center gap-2 bg-orange-500 hover:bg-orange-400 text-white px-4 py-2 rounded-xl text-sm font-bold"><Plus size={16} /> New PO</button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Total Spend", value: fmt(totalSpend), icon: ShoppingCart, color: "text-indigo-500", bg: "bg-indigo-50 dark:bg-indigo-500/10" },
          { label: "Total Paid", value: fmt(totalPaid), icon: Wallet, color: "text-emerald-500", bg: "bg-emerald-50 dark:bg-emerald-500/10" },
          { label: "Balance Due", value: fmt(totalBalance), icon: AlertCircle, color: "text-red-500", bg: "bg-red-50 dark:bg-red-500/10" },
          { label: "Pending Orders", value: String(pendingCount), icon: Clock, color: "text-amber-500", bg: "bg-amber-50 dark:bg-amber-500/10" },
        ].map((card) => (
          <div key={card.label} className="bg-white dark:bg-card rounded-2xl border border-gray-100 dark:border-white/5 p-6 flex items-center gap-5">
            <div className={clsx("w-14 h-14 rounded-2xl flex items-center justify-center shrink-0", card.bg)}><card.icon size={24} className={card.color} /></div>
            <div><p className="text-[11px] font-black text-gray-400 uppercase tracking-widest">{card.label}</p><p className="text-2xl font-black text-gray-900 dark:text-white mt-1">{card.value}</p></div>
          </div>
        ))}
      </div>

      <div className="relative">
        <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search orders..." className="w-full pl-9 pr-4 py-2.5 text-sm bg-white dark:bg-card border border-gray-200 rounded-xl" />
      </div>

      <div className="space-y-3">
        {filtered.map((po) => {
          const currentPaid = po.paid ?? 0;
          const balance = Math.max(0, (po.totalAmount ?? 0) - currentPaid);
          const StatusIcon = STATUS_ICONS[po.status] ?? Clock;
          return (
            <div key={po.id} className="bg-white dark:bg-card rounded-2xl border border-gray-100 dark:border-white/5 p-5">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-orange-50 dark:bg-orange-900/20 flex items-center justify-center shrink-0"><Store size={18} className="text-orange-500" /></div>
                  <div>
                    <p className="font-bold text-gray-900 dark:text-white text-sm">{po.vendor?.name ?? "Unknown"}</p>
                    <p className="text-[11px] text-gray-400 mt-0.5">PO-{po.id?.slice(0, 8).toUpperCase()} · {new Date(po.createdAt).toLocaleDateString()}</p>
                  </div>
                </div>
                <span className={clsx("flex items-center gap-1 px-3 py-1 rounded-xl text-[10px] font-black uppercase", STATUS_STYLES[po.status] || STATUS_STYLES.PENDING)}><StatusIcon size={11} /> {po.status}</span>
              </div>
              
              <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="bg-gray-50 dark:bg-white/5 rounded-xl p-3 text-center"><p className="text-[10px] text-gray-400 uppercase font-bold">Subtotal</p><p className="text-[12px] font-black">{fmt(po.totalAmount - (po.cgst + po.sgst + po.igst))}</p></div>
                <div className="bg-gray-50 dark:bg-white/5 rounded-xl p-3 text-center"><p className="text-[10px] text-gray-400 uppercase font-bold">GST</p><p className="text-[12px] font-black">{fmt(po.cgst + po.sgst + po.igst)}</p></div>
                <div className="bg-emerald-50 dark:bg-emerald-500/10 rounded-xl p-3 text-center"><p className="text-[10px] text-emerald-600 uppercase font-bold">Paid</p><p className="text-sm font-black text-emerald-700">{fmt(currentPaid)}</p></div>
                <div className={clsx("rounded-xl p-3 text-center", balance > 0 ? "bg-red-50" : "bg-gray-50")}><p className="text-[10px] uppercase font-bold">Balance</p><p className="text-sm font-black">{fmt(balance)}</p></div>
              </div>

              <div className="mt-4 flex gap-2">
                {balance > 0 && <button onClick={() => { setPayingPO(po); setPaymentAmount(balance); setShowPaymentModal(true); }} className="px-4 py-2 bg-orange-100 text-orange-600 rounded-xl text-[12px] font-bold">Pay Balance</button>}
                <button onClick={() => setViewingPO(po)} className="px-4 py-2 bg-indigo-50 text-indigo-600 rounded-xl text-[12px] font-black">View GST Invoice</button>
                {po.status === "PENDING" && <button onClick={() => handleCancel(po.id)} className="px-4 py-2 bg-gray-100 text-gray-600 rounded-xl text-[12px] font-bold">Cancel</button>}
              </div>
            </div>
          );
        })}
      </div>

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md p-4 overflow-y-auto">
          <div className="bg-white dark:bg-[#0f1117] rounded-[2.5rem] shadow-2xl w-full max-w-4xl p-8 space-y-8 relative my-8">
            <div className="absolute top-0 right-0 w-40 h-40 bg-orange-500/5 rounded-bl-[100px] -mr-16 -mt-16" />
            
            <div className="flex items-center justify-between relative z-10">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-orange-500 flex items-center justify-center text-white shadow-xl shadow-orange-500/20">
                  <ShoppingCart size={28} />
                </div>
                <div>
                  <h2 className="text-2xl font-black text-gray-900 dark:text-white tracking-tight uppercase">Initialize Purchase Order</h2>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Buy raw materials from vendors</p>
                </div>
              </div>
              <button onClick={() => setShowForm(false)} className="p-3 hover:bg-slate-100 dark:hover:bg-white/5 rounded-full transition-all">
                <X size={24} className="text-slate-400" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative z-10">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Select Vendor *</label>
                <div className="relative">
                   <select 
                     value={vendorId} 
                     onChange={(e) => setVendorId(e.target.value)}
                     className="w-full h-14 bg-slate-50 dark:bg-white/5 px-5 rounded-2xl font-bold text-sm outline-none focus:ring-4 ring-orange-500/10 appearance-none border border-slate-200 dark:border-white/10"
                   >
                     <option value="">Choose Supplier...</option>
                     {vendors.map(v => <option key={v.id} value={v.id}>{v.name} (Bal: ₹{v.balance || 0})</option>)}
                   </select>
                   <ChevronDown size={16} className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Expected Delivery Date</label>
                <input 
                  type="date" 
                  value={expectedDate} 
                  onChange={(e) => setExpectedDate(e.target.value)}
                  className="w-full h-14 bg-slate-50 dark:bg-white/5 px-5 rounded-2xl font-bold text-sm outline-none focus:ring-4 ring-orange-500/10 border border-slate-200 dark:border-white/10"
                />
              </div>
            </div>

            <div className="space-y-4 relative z-10">
              <div className="flex items-center justify-between">
                 <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Order Items</p>
                 <button onClick={addItem} className="text-[10px] font-black text-orange-600 bg-orange-50 dark:bg-orange-500/10 px-3 py-1.5 rounded-lg uppercase tracking-widest flex items-center gap-2 hover:bg-orange-100 transition-all">
                    <Plus size={12} /> Add Material
                 </button>
              </div>
              
              <div className="space-y-3 max-h-[40vh] overflow-y-auto pr-2 custom-scrollbar">
                {items.map((it, idx) => (
                  <div key={idx} className="bg-slate-50/50 dark:bg-white/5 p-4 rounded-3xl border border-slate-100 dark:border-white/5 grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
                    <div className="md:col-span-4 space-y-1.5">
                      <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Material</label>
                      <select 
                        value={it.inventoryItemId} 
                        onChange={(e) => updateItem(idx, "inventoryItemId", e.target.value)}
                        className="w-full h-11 bg-white dark:bg-card px-4 rounded-xl font-bold text-xs outline-none border border-slate-200 dark:border-white/10"
                      >
                        <option value="">Select Item...</option>
                        {materials
                          .filter(m => {
                            if (!vendorId) return true; // Show all if no vendor selected yet
                            const isSupplied = selectedVendor?.suppliedMaterials?.some((sm: any) => sm.materialId === m.id);
                            const isPrimary = m.vendorId === vendorId;
                            return isSupplied || isPrimary;
                          })
                          .map(m => <option key={m.id} value={m.id}>{m.name} ({m.unit})</option>)
                        }
                      </select>
                    </div>
                    <div className="md:col-span-2 space-y-1.5">
                      <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Qty ({it.unit})</label>
                      <input 
                        type="number" 
                        value={it.quantity} 
                        onChange={(e) => updateItem(idx, "quantity", Number(e.target.value))}
                        className="w-full h-11 bg-white dark:bg-card px-4 rounded-xl font-bold text-xs outline-none border border-slate-200 dark:border-white/10"
                      />
                    </div>
                    <div className="md:col-span-2 space-y-1.5">
                      <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Price (₹)</label>
                      <input 
                        type="number" 
                        value={it.price} 
                        onChange={(e) => updateItem(idx, "price", Number(e.target.value))}
                        className="w-full h-11 bg-white dark:bg-card px-4 rounded-xl font-bold text-xs outline-none border border-slate-200 dark:border-white/10"
                      />
                    </div>
                    <div className="md:col-span-3 space-y-1.5">
                       <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Line Total</p>
                       <div className="h-11 flex items-center px-4 bg-white/50 dark:bg-black/20 rounded-xl font-black text-xs">
                          ₹{(it.quantity * it.price).toLocaleString()} <span className="text-[8px] text-slate-400 ml-2">({it.gstRate}% GST)</span>
                       </div>
                    </div>
                    <div className="md:col-span-1 flex justify-center">
                      <button onClick={() => removeItem(idx)} className="p-3 text-slate-300 hover:text-red-500 transition-colors">
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-6 border-t border-slate-100 dark:border-white/5 relative z-10">
               <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Additional Notes</label>
                    <textarea 
                      value={notes} 
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder="Special instructions or terms..."
                      className="w-full h-32 bg-slate-50 dark:bg-white/5 p-5 rounded-3xl font-bold text-sm outline-none border border-slate-200 dark:border-white/10 resize-none"
                    />
                  </div>
               </div>
               
               <div className="bg-slate-50 dark:bg-white/5 rounded-[2rem] p-6 space-y-4">
                  <div className="flex justify-between text-[11px] font-bold text-slate-400 uppercase tracking-widest">
                     <span>Subtotal</span>
                     <span>₹{subtotal.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-[11px] font-bold text-slate-400 uppercase tracking-widest border-b border-slate-200 dark:border-white/10 pb-4">
                     <span>GST ({isSameState ? "CGST + SGST" : "IGST"})</span>
                     <span>₹{totalGst.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center pt-2">
                     <span className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-widest">Grand Total</span>
                     <span className="text-2xl font-black text-orange-600">₹{grandTotal.toLocaleString()}</span>
                  </div>
                  
                  {autoApplied > 0 && (
                    <div className="bg-emerald-500/10 p-3 rounded-xl flex justify-between items-center">
                       <span className="text-[9px] font-black text-emerald-600 uppercase tracking-widest flex items-center gap-2"><Wallet size={12}/> Advance Applied</span>
                       <span className="text-xs font-black text-emerald-700">-₹{autoApplied.toLocaleString()}</span>
                    </div>
                  )}
                  
                  <div className="flex justify-between items-center pt-2 text-slate-500">
                     <span className="text-[10px] font-black uppercase tracking-widest">Balance Due</span>
                     <span className="text-lg font-black italic">₹{balanceDue.toLocaleString()}</span>
                  </div>
               </div>
            </div>

            <div className="flex gap-4 pt-4 relative z-10">
              <button 
                onClick={() => setShowForm(false)} 
                className="flex-1 py-5 text-[11px] font-black uppercase tracking-[0.2em] text-slate-500 hover:bg-slate-100 dark:hover:bg-white/5 rounded-2xl transition-all"
              >
                Abort
              </button>
              <button 
                onClick={handleCreate} 
                disabled={saving || !vendorId || items.some(it => !it.inventoryItemId || it.quantity <= 0)} 
                className="flex-[2] py-5 bg-orange-500 text-white rounded-2xl text-[11px] font-black shadow-xl shadow-orange-500/20 uppercase tracking-[0.3em] transition-all hover:scale-[1.02] active:scale-95 disabled:opacity-50 disabled:grayscale"
              >
                {saving ? "Processing..." : "Authorize Order"}
              </button>
            </div>
          </div>
        </div>
      )}

      {showPaymentModal && payingPO && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md">
          <div className="bg-white dark:bg-[#0f1117] w-full max-w-md rounded-[2.5rem] shadow-2xl border border-slate-100 dark:border-white/5 overflow-hidden animate-in zoom-in-95 duration-300">
            {/* Header */}
            <div className="p-8 pb-0">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-orange-500 flex items-center justify-center shadow-lg shadow-orange-500/20">
                    <Wallet size={22} className="text-white" />
                  </div>
                  <div>
                    <h2 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight">Record Payment</h2>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-0.5">{payingPO.vendor?.name}</p>
                  </div>
                </div>
                <button onClick={() => { setShowPaymentModal(false); setPayingPO(null); }} className="p-2 rounded-xl bg-slate-100 dark:bg-white/5 text-slate-400 hover:text-slate-600 transition-all">
                  <X size={18} />
                </button>
              </div>

              {/* PO Summary */}
              <div className="grid grid-cols-3 gap-3 mb-6">
                <div className="bg-slate-50 dark:bg-white/5 rounded-2xl p-3 text-center">
                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Total</p>
                  <p className="text-sm font-black text-slate-900 dark:text-white mt-0.5">{fmt(payingPO.totalAmount ?? 0)}</p>
                </div>
                <div className="bg-emerald-50 dark:bg-emerald-500/10 rounded-2xl p-3 text-center">
                  <p className="text-[9px] font-black text-emerald-600 uppercase tracking-widest">Paid</p>
                  <p className="text-sm font-black text-emerald-700 dark:text-emerald-400 mt-0.5">{fmt(payingPO.paid ?? 0)}</p>
                </div>
                <div className="bg-red-50 dark:bg-red-500/10 rounded-2xl p-3 text-center">
                  <p className="text-[9px] font-black text-red-500 uppercase tracking-widest">Balance</p>
                  <p className="text-sm font-black text-red-600 dark:text-red-400 mt-0.5">{fmt(Math.max(0, (payingPO.totalAmount ?? 0) - (payingPO.paid ?? 0)))}</p>
                </div>
              </div>
            </div>

            {/* Amount Input */}
            <div className="px-8 space-y-5">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Payment Amount</label>
                <div className="relative">
                  <span className="absolute left-5 top-1/2 -translate-y-1/2 text-2xl font-black text-slate-300 dark:text-slate-600">₹</span>
                  <input
                    type="number"
                    min={0}
                    value={paymentAmount}
                    onChange={(e) => setPaymentAmount(Number(e.target.value))}
                    className="w-full pl-10 pr-6 py-5 text-3xl font-black bg-slate-50 dark:bg-white/5 border-none rounded-2xl outline-none focus:ring-4 ring-orange-500/10 dark:text-white transition-all"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Payment Mode</label>
                <div className="grid grid-cols-3 gap-3">
                  {["CASH", "UPI", "CARD"].map((mode) => (
                    <button
                      key={mode}
                      onClick={() => setPaymentMode(mode as any)}
                      className={clsx(
                        "py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all border",
                        paymentMode === mode 
                          ? "bg-orange-500 text-white border-orange-500 shadow-lg shadow-orange-500/20" 
                          : "bg-slate-50 dark:bg-white/5 text-slate-400 border-transparent hover:border-slate-200"
                      )}
                    >
                      {mode}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Note <span className="text-slate-300 dark:text-slate-600 normal-case tracking-normal font-bold">(optional)</span></label>
                <input
                  type="text"
                  value={paymentNote}
                  onChange={(e) => setPaymentNote(e.target.value)}
                  placeholder={`Payment for PO-${payingPO.id?.slice(0, 8).toUpperCase()}`}
                  className="w-full px-5 py-3.5 text-sm font-bold bg-slate-50 dark:bg-white/5 border-none rounded-2xl outline-none focus:ring-4 ring-orange-500/10 dark:text-white transition-all placeholder:text-slate-300 dark:placeholder:text-white/10"
                />
              </div>
            </div>

            {/* Actions */}
            <div className="p-8 pt-6 flex gap-3">
              <button
                onClick={() => { setShowPaymentModal(false); setPayingPO(null); setPaymentAmount(0); setPaymentNote(""); }}
                className="flex-1 py-4 bg-slate-100 dark:bg-white/5 text-slate-500 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-200 dark:hover:bg-white/10 transition-all"
              >
                Cancel
              </button>
              <button
                onClick={handleRecordPayment}
                disabled={saving || paymentAmount <= 0 || !paymentMode}
                className="flex-[2] py-4 bg-orange-500 hover:bg-orange-400 disabled:opacity-50 disabled:grayscale text-white rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] shadow-xl shadow-orange-500/20 transition-all active:scale-95 flex items-center justify-center gap-2"
              >
                {saving ? <RefreshCw size={16} className="animate-spin" /> : <CheckCircle2 size={16} />}
                {saving ? "Processing..." : "Confirm Payment"}
              </button>
            </div>
          </div>
        </div>
      )}

      {viewingPO && <GSTInvoice order={viewingPO} vendor={viewingPO.vendor} companyDetails={currentCompany} onClose={() => setViewingPO(null)} />}
    </div>
  );
}
