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
  return "₹" + n.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
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

export default function PurchaseOrdersPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [vendors, setVendors] = useState<any[]>([]);
  const [materials, setMaterials] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [search, setSearch] = useState("");

  const [companyProfile, setCompanyProfile] = useState<any>(null);

  const [vendorId, setVendorId] = useState("");
  const [expectedDate, setExpectedDate] = useState("");
  const [notes, setNotes] = useState("");
  const [items, setItems] = useState<POItem[]>([
    { inventoryItemId: "", itemName: "", unit: "kg", quantity: 0, price: 0, hsnCode: "", gstRate: 5 },
  ]);
  const [saving, setSaving] = useState(false);

  // Custom Select States
  const [showVendorList, setShowVendorList] = useState(false);
  const [vendorSearch, setVendorSearch] = useState("");
  const [showMaterialList, setShowMaterialList] = useState<number | null>(null);
  const [materialSearch, setMaterialSearch] = useState("");
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [viewDate, setViewDate] = useState(new Date());
  const [showUnitList, setShowUnitList] = useState(false);

  // Quick Add Material State
  const [showMaterialForm, setShowMaterialForm] = useState(false);
  const [newMat, setNewMat] = useState({ name: "", unit: "kg", hsnCode: "", gstRate: 5 });
  const [matSaving, setMatSaving] = useState(false);
  const [viewingPO, setViewingPO] = useState<any>(null);
  const [showSettings, setShowSettings] = useState(false);
  const [editingProfile, setEditingProfile] = useState<any>(FALLBACK_COMPANY);

  // Derived Company Data
  const currentCompany = companyProfile || FALLBACK_COMPANY;
  const isProfileComplete = companyProfile && companyProfile.gstin && companyProfile.address;

  const fetchAll = useCallback(async () => {
    setLoading(true);
    try {
      const [poRes, vRes, rmRes, cpRes] = await Promise.all([
        purchaseOrdersApi.getAll(),
        vendorsApi.getAll(),
        rawMaterialsApi.getAll(),
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

  const handleSaveProfile = async () => {
    setSaving(true);
    try {
      await settingsApi.updateCompanyProfile(editingProfile);
      setCompanyProfile(editingProfile);
      setShowSettings(false);
      fetchAll();
    } catch (e: any) {
      console.error(e);
      const msg = e.response?.data?.error || e.message || "Failed to save business profile.";
      alert(`SETUP ERROR: ${msg}`);
    } finally {
      setSaving(false);
    }
  };

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const addItem = () =>
    setItems((prev) => [...prev, { inventoryItemId: "", itemName: "", unit: "kg", quantity: 0, price: 0, hsnCode: "", gstRate: 5 }]);

  const removeItem = (i: number) =>
    setItems((prev) => prev.filter((_, idx) => idx !== i));

  const updateItem = (i: number, field: keyof POItem, value: any) =>
    setItems((prev) => prev.map((it, idx) => {
      if (idx !== i) return it;
      const cleanVal = (field === "quantity" || field === "price") ? Math.max(0, value) : value;
      if (field === "inventoryItemId") {
        const mat = materials.find((m: any) => m.id === value);
        // Auto-fill price from vendor's linked material rate (if available)
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

  // GST Logic (Senior Architect Rounding)
  const round = (n: number) => Math.round(n * 100) / 100;

  const selectedVendor = vendors.find((v: any) => v.id === vendorId);
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

  // Auto-advance
  const availableAdvance = Math.max(0, selectedVendor?.balance ?? 0);
  const autoApplied = Math.min(availableAdvance, grandTotal);
  const balanceDue = Math.max(0, grandTotal - autoApplied);

  const handleCreate = async () => {
    if (!vendorId || items.some((it) => !it.inventoryItemId || it.quantity <= 0 || it.price <= 0)) return;
    setSaving(true);
    try {
      await purchaseOrdersApi.create({
        vendorId,
        advancePaid: autoApplied,   // auto-applied from vendor ledger balance
        expectedDeliveryDate: expectedDate,
        notes,
        items: items.map(({ inventoryItemId, quantity, price, hsnCode, gstRate }) => ({ inventoryItemId, quantity, price, hsnCode, gstRate })),
      });
      setShowForm(false);
      setVendorId(""); setExpectedDate(""); setNotes("");
      setItems([{ inventoryItemId: "", itemName: "", unit: "kg", quantity: 0, price: 0, hsnCode: "", gstRate: 5 }]);
      fetchAll();
    } catch (e: any) {
      console.error(e);
      const serverError = e?.response?.data?.error;
      alert(serverError || "Failed to create Purchase Order. Please check the information and try again.");
    }
    finally { setSaving(false); }
  };

  const handleQuickAddMaterial = async () => {
    if (!newMat.name) return;
    setMatSaving(true);
    try {
      const res = await rawMaterialsApi.create({
        ...newMat,
        sku: "RM-" + Math.random().toString(36).substring(2, 8).toUpperCase()
      });
      setMaterials(prev => [...prev, res.data]);
      setShowMaterialForm(false);
      setNewMat({ name: "", unit: "kg", hsnCode: "", gstRate: 5 });

      // Automatically select this material in the last empty row or add a new row
      setItems((prev) => {
        const lastIdx = prev.length - 1;
        const lastItem = prev[lastIdx];
        const newItem = {
          inventoryItemId: res.data.id,
          itemName: res.data.name,
          unit: res.data.unit,
          quantity: 1,
          price: 0,
          hsnCode: res.data.hsnCode || "",
          gstRate: res.data.gstRate || 5
        };

        if (!lastItem.inventoryItemId) {
          const next = [...prev];
          next[lastIdx] = newItem;
          return next;
        }
        return [...prev, newItem];
      });

    } catch (e: any) {
      console.error("Material creation failed:", e);
      const msg = e.response?.data?.error || e.message || "Unknown error";
      alert("Failed to add material: " + msg);
    }
    finally { setMatSaving(false); }
  };

  const handleReceive = async (id: string) => {
    try {
      await purchaseOrdersApi.receive(id);
      fetchAll();
    } catch (e) { console.error(e); }
  };

  const handleApplyAdvance = async (id: string) => {
    try {
      await purchaseOrdersApi.applyAdvance(id);
      fetchAll();
    } catch (e: any) {
      alert(e?.response?.data?.error || "Failed to successfully apply advance.");
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

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this purchase order? This cannot be undone.")) return;
    try {
      await purchaseOrdersApi.delete(id);
      fetchAll();
    } catch (e: any) {
      alert(e?.response?.data?.error ?? "Failed to delete PO");
    }
  };


  const filtered = orders.filter((o) =>
    !search ||
    o.vendor?.name?.toLowerCase().includes(search.toLowerCase()) ||
    o.id?.toLowerCase().includes(search.toLowerCase())
  );

  const totalSpend = orders.reduce((s, o) => s + (o.totalAmount ?? 0), 0);
  const totalPaid = orders.reduce((s, o) => s + (o.paid ?? 0), 0);
  const totalBalance = Math.max(0, totalSpend - totalPaid);
  const pendingCount = orders.filter((o) => o.status === "PENDING").length;

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-gray-900 dark:text-white flex items-center gap-2">
            <ShoppingCart size={22} className="text-orange-500" />
            Purchase Orders
          </h1>
          <p className="text-sm text-gray-500 dark:text-slate-400 mt-1">
            Buy raw materials from vendors — track advance payments and balance due
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setShowSettings(true)}
            className="p-2 rounded-xl border border-gray-200 dark:border-white/10 hover:bg-gray-50 dark:hover:bg-white/5 transition-all group"
            title="Edit Business Profile"
          >
            <Cog size={16} className="text-gray-400 group-hover:text-orange-500 transition-colors" />
          </button>
          <button
            onClick={fetchAll}
            className="p-2 rounded-xl border border-gray-200 dark:border-white/10 hover:bg-gray-50 dark:hover:bg-white/5 transition-all"
          >
            <RefreshCw size={16} className="text-gray-400" />
          </button>
          <button
            onClick={() => setShowForm(true)}
            className="flex items-center gap-2 bg-orange-500 hover:bg-orange-400 text-white px-4 py-2 rounded-xl text-sm font-bold transition-all"
          >
            <Plus size={16} /> New Purchase Order
          </button>
        </div>
      </div>

      {/* Super Admin Alert */}
      {!isProfileComplete && (
        <div className="bg-rose-50 dark:bg-rose-900/10 border border-rose-100 dark:border-rose-500/20 rounded-[2.2rem] p-8 flex flex-col md:flex-row items-center justify-between gap-6 relative overflow-hidden">
          <div className="flex items-center gap-6 relative z-10">
            <div className="w-16 h-16 bg-rose-500 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-rose-500/20">
              <AlertCircle size={32} />
            </div>
            <div className="space-y-1">
              <h3 className="text-base font-black text-rose-600 dark:text-rose-400 uppercase tracking-widest leading-none">Super Admin: Setup Required</h3>
              <p className="text-sm font-bold text-slate-500 dark:text-slate-400 max-w-md">Your Company Profile is using placeholder data. Please configure your GSTIN and Business Address in Settings.</p>
            </div>
          </div>
          <button 
            onClick={() => setShowSettings(true)}
            className="w-full md:w-auto px-8 py-4 bg-rose-600 hover:bg-rose-500 text-white rounded-2xl text-[11px] font-black uppercase tracking-widest shadow-lg shadow-rose-500/20 transition-all active:scale-95 shrink-0"
          >
            Update Profile
          </button>
        </div>
      )}

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Total Spend", value: fmt(totalSpend), icon: ShoppingCart, color: "text-indigo-500", bg: "bg-indigo-50 dark:bg-indigo-500/10" },
          { label: "Total Paid", value: fmt(totalPaid), icon: Wallet, color: "text-emerald-500", bg: "bg-emerald-50 dark:bg-emerald-500/10" },
          { label: "Balance Due", value: fmt(totalBalance), icon: AlertCircle, color: "text-red-500", bg: "bg-red-50 dark:bg-red-500/10" },
          { label: "Pending Orders", value: String(pendingCount), icon: Clock, color: "text-amber-500", bg: "bg-amber-50 dark:bg-amber-500/10" },
        ].map((card) => (
          <div key={card.label} className="bg-white dark:bg-card rounded-2xl border border-gray-100 dark:border-white/5 p-4 flex items-center gap-3">
            <div className={clsx("w-10 h-10 rounded-xl flex items-center justify-center shrink-0", card.bg)}>
              <card.icon size={18} className={card.color} />
            </div>
            <div>
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{card.label}</p>
              <p className="text-lg font-black text-gray-900 dark:text-white">{card.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Search */}
      <div className="relative">
        <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by vendor or order ID..."
          className="w-full pl-9 pr-4 py-2.5 text-sm bg-white dark:bg-card border border-gray-200 dark:border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500/20"
        />
      </div>

      {/* Orders List */}
      {loading ? (
        <div className="py-20 text-center text-gray-400 text-sm">Loading purchase orders...</div>
      ) : filtered.length === 0 ? (
        <div className="py-20 text-center text-gray-300 dark:text-slate-600 space-y-2">
          <ShoppingCart size={48} strokeWidth={1} className="mx-auto" />
          <p className="text-sm font-semibold">No purchase orders yet</p>
          <p className="text-xs">Create your first PO to start buying raw materials from vendors.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((po) => {
            const currentPaid = po.paid ?? 0;
            const balance = Math.max(0, (po.totalAmount ?? 0) - currentPaid);
            const StatusIcon = STATUS_ICONS[po.status] ?? Clock;
            return (
              <div key={po.id} className="bg-white dark:bg-card rounded-2xl border border-gray-100 dark:border-white/5 p-5">
                {/* PO Header */}
                <div className="flex items-start justify-between gap-4 flex-wrap">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-orange-50 dark:bg-orange-900/20 flex items-center justify-center shrink-0">
                      <Store size={18} className="text-orange-500" />
                    </div>
                    <div>
                      <p className="font-bold text-gray-900 dark:text-white text-sm">{po.vendor?.name ?? "Unknown Vendor"}</p>
                      <p className="text-[11px] text-gray-400 mt-0.5">PO-{po.id?.slice(0, 8).toUpperCase()} · {new Date(po.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</p>
                    </div>
                  </div>
                  <span className={clsx("flex items-center gap-1 px-3 py-1 rounded-xl text-[10px] font-black uppercase tracking-wider", STATUS_STYLES[po.status] ?? STATUS_STYLES.PENDING)}>
                    <StatusIcon size={11} />
                    {po.status}
                  </span>
                </div>

                {/* Items */}
                {po.poItems?.length > 0 && (
                  <div className="mt-4 space-y-1.5">
                    {po.poItems.map((item: any, i: number) => (
                      <div key={i} className="flex items-center justify-between text-[12px] bg-gray-50 dark:bg-white/5 rounded-lg px-3 py-2">
                        <div className="flex items-center gap-2">
                          <Package size={12} className="text-gray-400" />
                          <span className="font-medium text-gray-700 dark:text-slate-300">
                            {item.inventoryItem?.name ?? item.inventoryItemId}
                          </span>
                          <span className="text-gray-400">{item.quantity} {item.inventoryItem?.unit ?? "kg"}</span>
                        </div>
                        <span className="font-bold text-gray-900 dark:text-white">{fmt(item.quantity * item.price)}</span>
                      </div>
                    ))}
                  </div>
                )}

                {/* Financial Summary */}
                <div className="mt-4 grid grid-cols-4 gap-3">
                  <div className="bg-gray-50 dark:bg-white/5 rounded-xl p-3 text-center">
                    <p className="text-[10px] text-gray-400 uppercase font-bold tracking-wider">Subtotal</p>
                    <p className="text-[12px] font-black text-gray-700 dark:text-slate-300 mt-1">{fmt(po.subtotal || (po.totalAmount - (po.cgst + po.sgst + po.igst)) || 0)}</p>
                  </div>
                  <div className="bg-gray-50 dark:bg-white/5 rounded-xl p-3 text-center">
                    <p className="text-[10px] text-gray-400 uppercase font-bold tracking-wider">GST</p>
                    <p className="text-[12px] font-black text-gray-700 dark:text-slate-300 mt-1">{fmt((po.cgst + po.sgst + po.igst) || 0)}</p>
                  </div>
                  <div className="bg-emerald-50 dark:bg-emerald-500/10 rounded-xl p-3 text-center">
                    <p className="text-[10px] text-emerald-600 uppercase font-bold tracking-wider">Total Paid</p>
                    <p className="text-sm font-black text-emerald-700 dark:text-emerald-400 mt-1">{fmt(currentPaid)}</p>
                  </div>
                  <div className={clsx("rounded-xl p-3 text-center", balance > 0 ? "bg-red-50 dark:bg-red-500/10" : "bg-gray-50 dark:bg-white/5")}>
                    <p className={clsx("text-[10px] uppercase font-bold tracking-wider", balance > 0 ? "text-red-500" : "text-gray-400")}>Balance Due</p>
                    <p className={clsx("text-sm font-black mt-1", (po.balance ?? balance) > 0 ? "text-red-600 dark:text-red-400" : "text-gray-500")}>{fmt(po.balance ?? balance)}</p>
                  </div>
                </div>

                {/* Actions */}
                <div className="mt-4 flex gap-2 flex-wrap">
                  {balance > 0 && vendors.find(v => v.id === po.vendorId)?.balance > 0 && (
                    <button
                      onClick={() => handleApplyAdvance(po.id)}
                      className="flex items-center gap-1.5 px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-white rounded-xl text-[12px] font-bold transition-all shadow-md shadow-emerald-500/20"
                    >
                      <Wallet size={13} /> Settle with Advance
                    </button>
                  )}
                  <button
                    onClick={() => {
                      if (!isProfileComplete) {
                        alert("SETUP REQUIRED: You must complete your Company Profile (Settings) before you can view or download GST-compliant invoices.");
                        setShowSettings(true);
                        return;
                      }
                      setViewingPO(po);
                    }}
                    className={clsx(
                      "flex items-center gap-1.5 px-4 py-2 rounded-xl text-[12px] font-black transition-all",
                      isProfileComplete 
                        ? "bg-indigo-50 dark:bg-indigo-900/10 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-100 hover:scale-[1.02] active:scale-95"
                        : "bg-slate-100 text-slate-400 cursor-not-allowed opacity-50"
                    )}
                  >
                    <FileText size={13} /> View GST Invoice
                  </button>
                  {po.status === "PENDING" && (
                    <>
                      <button
                        onClick={() => handleReceive(po.id)}
                        className="flex items-center gap-1.5 px-4 py-2 bg-orange-500 hover:bg-orange-400 text-white rounded-xl text-[12px] font-bold transition-all"
                      >
                        <Truck size={13} /> Mark Received (GRN)
                      </button>
                      <button
                        onClick={() => handleCancel(po.id)}
                        className="flex items-center gap-1.5 px-4 py-2 bg-gray-100 dark:bg-white/5 hover:bg-red-50 dark:hover:bg-red-900/10 text-gray-600 dark:text-slate-300 hover:text-red-600 rounded-xl text-[12px] font-bold transition-all"
                      >
                        <Ban size={13} /> Cancel
                      </button>
                    </>
                  )}
                  {(po.status === "PENDING" || po.status === "CANCELLED") && (
                    <button
                      onClick={() => handleDelete(po.id)}
                      className="flex items-center gap-1.5 px-4 py-2 bg-gray-100 dark:bg-white/5 hover:bg-red-50 dark:hover:bg-red-900/10 text-gray-400 hover:text-red-500 rounded-xl text-[12px] font-bold transition-all ml-auto"
                    >
                      <Trash2 size={13} /> Delete
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ── New PO Modal ── */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-[#12141c] rounded-3xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-100 dark:border-white/5 flex items-center justify-between">
              <h2 className="text-lg font-black text-gray-900 dark:text-white">New Purchase Order</h2>
              <button onClick={() => setShowForm(false)} className="p-1.5 hover:bg-gray-100 dark:hover:bg-white/10 rounded-lg transition-all">
                <X size={18} className="text-gray-500" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Section 1: Vendor & Delivery */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-1.5">
                  <label className="block text-[11px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest ml-1">Vendor *</label>
                  <div className="relative">
                    <button
                      onClick={() => setShowVendorList(!showVendorList)}
                      className="w-full px-5 py-3.5 text-left text-sm bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl focus:outline-none focus:ring-4 focus:ring-orange-500/10 focus:border-orange-500/50 font-semibold transition-all text-slate-800 dark:text-white flex items-center justify-between"
                    >
                      <span className={clsx(!vendorId && "text-slate-400 font-normal")}>
                        {vendorId ? vendors.find(v => v.id === vendorId)?.name : "Select vendor..."}
                      </span>
                      <ChevronDown size={16} className={clsx("text-slate-400 transition-transform", showVendorList && "rotate-180")} />
                    </button>

                    {showVendorList && (
                      <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-[#1a1c26] border border-slate-200 dark:border-white/10 rounded-[1.5rem] shadow-2xl z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                        <div className="p-3 border-b border-slate-100 dark:border-white/5">
                          <div className="relative">
                            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                            <input
                              placeholder="Search vendors..."
                              value={vendorSearch}
                              onChange={(e) => setVendorSearch(e.target.value)}
                              className="w-full pl-9 pr-4 py-2 text-xs bg-slate-50 dark:bg-white/5 border-none rounded-xl focus:ring-0 font-bold"
                            />
                          </div>
                        </div>
                        <div className="max-h-[200px] overflow-y-auto p-1.5 space-y-1">
                          {vendors.filter(v => v.name.toLowerCase().includes(vendorSearch.toLowerCase())).map(v => (
                            <button
                              key={v.id}
                              onClick={() => {
                                setVendorId(v.id);
                                setShowVendorList(false);
                                setVendorSearch("");
                              }}
                              className={clsx(
                                "w-full text-left px-4 py-3 rounded-xl text-xs font-bold transition-all",
                                vendorId === v.id
                                  ? "bg-orange-500 text-white shadow-lg shadow-orange-500/20"
                                  : "text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/10 hover:text-orange-600"
                              )}
                            >
                              {v.name}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
                <div className="space-y-1.5">
                  <label className="block text-[11px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest ml-1">Expected Delivery</label>
                  <div className="relative">
                    <button
                      onClick={() => setShowDatePicker(!showDatePicker)}
                      className="w-full px-5 py-3.5 text-left text-sm bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl focus:outline-none focus:ring-4 focus:ring-orange-500/10 focus:border-orange-500/50 font-semibold transition-all text-slate-800 dark:text-white flex items-center justify-between"
                    >
                      <span className={clsx(!expectedDate && "text-slate-400 font-normal")}>
                        {expectedDate ? format(parseISO(expectedDate), "dd MMM yyyy") : "Choose date..."}
                      </span>
                      <CalendarIcon size={16} className="text-slate-400" />
                    </button>

                    {showDatePicker && (
                      <div className="absolute top-full right-0 mt-2 bg-white dark:bg-[#1a1c26] border border-slate-200 dark:border-white/10 rounded-[1.5rem] shadow-2xl z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-200 w-[280px]">
                        <div className="p-4 bg-slate-50 dark:bg-white/[0.02] border-b border-slate-100 dark:border-white/5 flex items-center justify-between">
                          <button onClick={() => setViewDate(subMonths(viewDate, 1))} className="p-1 hover:bg-slate-200 dark:hover:bg-white/10 rounded-lg transition-colors text-slate-500"><ChevronLeft size={16} /></button>
                          <span className="text-[11px] font-black uppercase tracking-widest text-slate-700 dark:text-slate-200">{format(viewDate, "MMMM yyyy")}</span>
                          <button onClick={() => setViewDate(addMonths(viewDate, 1))} className="p-1 hover:bg-slate-200 dark:hover:bg-white/10 rounded-lg transition-colors text-slate-500"><ChevronRight size={16} /></button>
                        </div>
                        <div className="p-3">
                          <div className="grid grid-cols-7 mb-2">
                            {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(d => (
                              <div key={d} className="text-[9px] font-black text-slate-400 text-center uppercase">{d}</div>
                            ))}
                          </div>
                          <div className="grid grid-cols-7 gap-1">
                            {(() => {
                              const start = startOfWeek(startOfMonth(viewDate));
                              const end = endOfWeek(endOfMonth(viewDate));
                              const days = [];
                              let curr = start;
                              while (curr <= end) {
                                days.push(curr);
                                curr = addDays(curr, 1);
                              }
                              return days.map(day => {
                                const isSelected = expectedDate && isSameDay(day, parseISO(expectedDate));
                                const isCurrentMonth = isSameMonth(day, viewDate);
                                const isPast = isBefore(day, startOfDay(new Date()));
                                return (
                                  <button
                                    key={day.toISOString()}
                                    disabled={isPast}
                                    onClick={() => {
                                      setExpectedDate(format(day, "yyyy-MM-dd"));
                                      setShowDatePicker(false);
                                    }}
                                    className={clsx(
                                      "aspect-square flex items-center justify-center rounded-lg text-[10px] font-bold transition-all",
                                      isSelected
                                        ? "bg-orange-500 text-white shadow-md shadow-orange-500/20"
                                        : !isCurrentMonth
                                          ? "text-slate-300 dark:text-slate-600 pointer-events-none opacity-0"
                                          : isPast
                                            ? "text-slate-200 dark:text-slate-700 cursor-not-allowed"
                                            : "text-slate-600 dark:text-slate-300 hover:bg-orange-50 dark:hover:bg-white/5 hover:text-orange-500"
                                    )}
                                  >
                                    {format(day, "d")}
                                  </button>
                                );
                              });
                            })()}
                          </div>
                          <div className="mt-3 pt-3 border-t border-slate-100 dark:border-white/5 flex justify-between">
                            <button
                              onClick={() => { setExpectedDate(""); setShowDatePicker(false); }}
                              className="text-[9px] font-black uppercase tracking-widest text-slate-400 hover:text-slate-600 transition-colors"
                            >Clear</button>
                            <button
                              onClick={() => {
                                const today = new Date();
                                setExpectedDate(format(today, "yyyy-MM-dd"));
                                setViewDate(today);
                                setShowDatePicker(false);
                              }}
                              className="text-[9px] font-black uppercase tracking-widest text-orange-500 hover:text-orange-600 transition-colors"
                            >Today</button>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Section 2: Items */}
              <div className="space-y-4">
                <div className="flex items-center justify-between ml-1">
                  <label className="text-[11px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest">Order Items</label>
                  <div className="flex gap-4">
                    <button onClick={() => setShowMaterialForm(true)} className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-indigo-500 hover:text-indigo-600 transition-colors">
                      <Plus size={12} className="stroke-[3]" /> New Material
                    </button>
                    <button onClick={addItem} className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-orange-500 hover:text-orange-600 transition-colors">
                      <Plus size={12} className="stroke-[3]" /> Add Row
                    </button>
                  </div>
                </div>

                <div className="space-y-3">
                  {items.map((item, i) => (
                    <div key={i} className="group grid grid-cols-12 gap-3 items-center bg-slate-50/50 dark:bg-white/[0.02] p-3 rounded-2xl border border-slate-100 dark:border-white/5 hover:border-orange-500/30 transition-all">
                      <div className="col-span-12 md:col-span-5 relative">
                        <button
                          onClick={() => setShowMaterialList(showMaterialList === i ? null : i)}
                          className="w-full px-4 py-2.5 text-left text-xs bg-white dark:bg-[#1a1c26] border border-slate-200 dark:border-white/5 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500/20 font-bold transition-all text-slate-800 dark:text-white flex items-center justify-between"
                        >
                          <span className={clsx(!item.inventoryItemId && "text-slate-400 font-normal")}>
                            {item.inventoryItemId ? materials.find(m => m.id === item.inventoryItemId)?.name : "Select material..."}
                          </span>
                          <ChevronDown size={14} className="text-slate-400" />
                        </button>

                        {showMaterialList === i && (
                          <div className="absolute top-full left-0 right-0 mt-1.5 bg-white dark:bg-[#1a1c26] border border-slate-200 dark:border-white/10 rounded-2xl shadow-xl z-[60] overflow-hidden animate-in fade-in slide-in-from-top-1 duration-200">
                            <div className="p-2 border-b border-slate-100 dark:border-white/5">
                              <div className="relative">
                                <Search size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
                                <input
                                  placeholder="Quick search..."
                                  value={materialSearch}
                                  onChange={(e) => setMaterialSearch(e.target.value)}
                                  className="w-full pl-8 pr-3 py-1.5 text-[10px] bg-slate-50 dark:bg-white/5 border-none rounded-lg focus:ring-0 font-bold"
                                />
                              </div>
                            </div>
                            <div className="max-h-[160px] overflow-y-auto p-1 space-y-0.5 custom-scrollbar">
                              {materials.filter(m => m.name.toLowerCase().includes(materialSearch.toLowerCase())).map(m => (
                                <button
                                  key={m.id}
                                  onClick={() => {
                                    updateItem(i, "inventoryItemId", m.id);
                                    setShowMaterialList(null);
                                    setMaterialSearch("");
                                  }}
                                  className={clsx(
                                    "w-full text-left px-3 py-2 rounded-lg text-[11px] font-bold transition-all flex items-center justify-between",
                                    item.inventoryItemId === m.id
                                      ? "bg-indigo-600 text-white shadow-md shadow-indigo-500/20"
                                      : "text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/10 hover:text-indigo-600"
                                  )}
                                >
                                  <span>{m.name}</span>
                                  <span className="opacity-50 text-[10px]">{m.unit}</span>
                                </button>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                      <div className="col-span-4 md:col-span-2">
                        <div className="relative">
                          <input
                            type="number"
                            placeholder="Qty"
                            value={item.quantity === 0 ? "" : item.quantity}
                            onFocus={(e) => e.target.select()}
                            onChange={(e) => updateItem(i, "quantity", Number(e.target.value))}
                            className="w-full bg-white dark:bg-[#1a1c26] border border-slate-200 dark:border-white/5 rounded-xl px-3 py-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-orange-500/20 text-center font-black text-slate-800 dark:text-white"
                          />
                        </div>
                      </div>
                      <div className="col-span-5 md:col-span-3">
                        <div className="relative">
                          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs font-bold">₹</span>
                          <input
                            type="number"
                            placeholder="Rate"
                            value={item.price === 0 ? "" : item.price}
                            onFocus={(e) => e.target.select()}
                            onChange={(e) => updateItem(i, "price", Number(e.target.value))}
                            className={clsx(
                              "w-full pl-7 pr-3 border rounded-xl py-2.5 text-xs focus:outline-none focus:ring-2 font-black transition-all",
                              item.price > 0 && selectedVendor?.suppliedMaterials?.find((sm: any) => sm.materialId === item.inventoryItemId)?.price === item.price
                                ? "bg-emerald-50 dark:bg-emerald-500/10 border-emerald-200 dark:border-emerald-500/20 text-emerald-600 focus:ring-emerald-500/10"
                                : "bg-white dark:bg-[#1a1c26] border-slate-200 dark:border-white/5 focus:ring-orange-500/20 text-slate-800 dark:text-white placeholder:font-normal placeholder:text-slate-400/50"
                            )}
                          />
                          {item.price > 0 && selectedVendor?.suppliedMaterials?.find((sm: any) => sm.materialId === item.inventoryItemId)?.price === item.price && (
                            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[8px] font-black text-emerald-500 uppercase tracking-tighter bg-emerald-100 dark:bg-emerald-500/20 px-1 rounded">Linked</span>
                          )}
                        </div>
                      </div>
                      <div className="col-span-2 md:col-span-1 text-right">
                        <span className="text-[11px] font-black text-slate-700 dark:text-slate-300 tabular-nums">{fmt(item.quantity * item.price)}</span>
                      </div>
                      <div className="col-span-1 flex justify-end">
                        {items.length > 1 && (
                          <button onClick={() => removeItem(i)} className="p-2 text-slate-300 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/10 rounded-xl transition-all">
                            <Trash2 size={16} />
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Section 3: Advance Info + Summary */}
              {vendorId && (
                <div className={clsx(
                  "rounded-3xl px-6 py-4 border flex items-center justify-between transition-all",
                  availableAdvance > 0
                    ? "bg-emerald-50/50 dark:bg-emerald-500/5 border-emerald-100 dark:border-emerald-500/20"
                    : "bg-slate-50 dark:bg-white/[0.02] border-slate-100 dark:border-white/5"
                )}>
                  <div className="flex items-center gap-3">
                    <div className={clsx(
                      "w-10 h-10 rounded-2xl flex items-center justify-center transition-colors",
                      availableAdvance > 0 ? "bg-emerald-100 dark:bg-emerald-500/20 text-emerald-600" : "bg-slate-100 dark:bg-white/5 text-slate-400"
                    )}>
                      <Wallet size={20} />
                    </div>
                    <div>
                      <p className={clsx("text-[10px] font-black uppercase tracking-widest ml-0.5",
                        availableAdvance > 0 ? "text-emerald-500" : "text-slate-400")}>
                        {availableAdvance > 0 ? "Advance Available" : "No Advance Balance"}
                      </p>
                      <p className={clsx("text-lg font-black leading-none mt-1",
                        availableAdvance > 0 ? "text-emerald-700 dark:text-emerald-400" : "text-slate-400")}>
                        {fmt(availableAdvance)}
                      </p>
                    </div>
                  </div>
                  {availableAdvance > 0 && (
                    <div className="px-3 py-1 bg-emerald-500 text-white rounded-full text-[9px] font-black uppercase tracking-widest shadow-lg shadow-emerald-500/20">
                      Auto-Adjusting
                    </div>
                  )}
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-1.5">
                  <label className="block text-[11px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest ml-1">Special Notes</label>
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Instructions for the vendor..."
                    className="w-full px-5 py-4 text-sm bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl focus:outline-none focus:ring-4 focus:ring-orange-500/10 focus:border-orange-500/50 font-semibold transition-all h-28 resize-none text-slate-800 dark:text-white placeholder:font-normal placeholder:text-slate-400/50"
                  />
                </div>

                {/* Order Summary */}
                <div className="bg-slate-50/50 dark:bg-white/[0.02] rounded-[2rem] p-6 border border-slate-100 dark:border-white/5 space-y-4">
                  <div className="space-y-2 border-b border-slate-200 dark:border-white/10 pb-4">
                    <div className="flex justify-between items-center px-1">
                      <span className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Taxable Amount</span>
                      <span className="text-base font-black text-slate-900 dark:text-white tabular-nums">{fmt(subtotal)}</span>
                    </div>
                    {isSameState ? (
                      <>
                        <div className="flex justify-between items-center px-1">
                          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">CGST (Taxable/2)</span>
                          <span className="text-sm font-bold text-slate-600 dark:text-slate-400 tabular-nums">{fmt(taxDetails.cgst)}</span>
                        </div>
                        <div className="flex justify-between items-center px-1">
                          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">SGST (Taxable/2)</span>
                          <span className="text-sm font-bold text-slate-600 dark:text-slate-400 tabular-nums">{fmt(taxDetails.sgst)}</span>
                        </div>
                      </>
                    ) : (
                      <div className="flex justify-between items-center px-1">
                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">IGST (Inter-state)</span>
                        <span className="text-sm font-bold text-slate-600 dark:text-slate-400 tabular-nums">{fmt(taxDetails.igst)}</span>
                      </div>
                    )}
                    <div className="flex justify-between items-center px-1 pt-1 border-t border-slate-100 dark:border-white/5">
                      <span className="text-[11px] font-black text-slate-500 dark:text-slate-300 uppercase tracking-widest">Grand Total</span>
                      <span className="text-xl font-black text-orange-500 tabular-nums">{fmt(grandTotal)}</span>
                    </div>
                  </div>

                  {autoApplied > 0 && (
                    <div className="flex justify-between items-start bg-emerald-50/50 dark:bg-emerald-500/5 p-4 rounded-2xl border border-emerald-100/50 dark:border-emerald-500/10">
                      <div>
                        <span className="text-[10px] font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-widest">Advance Credit</span>
                        <p className="text-[9px] text-emerald-500/70 font-bold uppercase tracking-tight mt-0.5">Applied from ledger</p>
                      </div>
                      <span className="text-base font-black text-emerald-600 dark:text-emerald-400 tabular-nums">− {fmt(autoApplied)}</span>
                    </div>
                  )}
                  <div className={clsx(
                    "flex justify-between items-center px-1 transition-colors",
                    autoApplied > 0 ? "" : ""
                  )}>
                    <span className="text-[11px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest">Net Payable</span>
                    <span className={clsx("text-2xl font-black tabular-nums", balanceDue > 0 ? "text-rose-500" : "text-emerald-500")}>
                      {balanceDue > 0 ? fmt(balanceDue) : "Covered"}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-8 pt-0 flex flex-col md:flex-row gap-4 justify-end items-center">
              <div className="mr-auto flex items-center gap-2 bg-slate-50 dark:bg-white/5 px-4 py-2 rounded-xl">
                <AlertCircle size={14} className="text-orange-400 shrink-0" />
                <p className="text-[9px] text-slate-400 font-black uppercase tracking-widest">PO status will be PENDING</p>
              </div>
              <div className="flex gap-4 w-full md:w-auto">
                <button
                  onClick={() => setShowForm(false)}
                  className="flex-1 md:flex-none px-8 py-3.5 rounded-2xl border border-slate-200 dark:border-white/10 text-xs font-black uppercase tracking-widest text-slate-500 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-white/5 transition-all"
                >
                  Discard
                </button>
                <button
                  onClick={handleCreate}
                  disabled={saving || !vendorId || grandTotal <= 0 || items.some(it => !it.inventoryItemId || it.quantity <= 0 || it.price <= 0)}
                  className="flex-1 md:flex-none px-10 py-3.5 bg-orange-500 hover:bg-orange-400 disabled:opacity-50 text-white rounded-2xl text-xs font-black shadow-xl shadow-orange-500/20 hover:shadow-orange-500/40 transition-all uppercase tracking-widest"
                >
                  {saving ? "Processing..." : "Confirm PO"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      {/* Quick Add Material Modal */}
      {showMaterialForm && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-[#12141c] rounded-[2.5rem] shadow-2xl w-full max-w-sm p-8 border border-white/5 space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-black text-gray-900 dark:text-white">New Material</h2>
              <button
                onClick={() => setShowMaterialForm(false)}
                className="p-1.5 hover:bg-gray-100 dark:hover:bg-white/10 rounded-lg transition-all"
              >
                <X size={18} className="text-gray-500" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="block text-[11px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest ml-1">Material Name</label>
                <input
                  autoFocus
                  placeholder="Ex: Black Gram"
                  value={newMat.name}
                  onChange={(e) => setNewMat({ ...newMat, name: e.target.value })}
                  className="w-full px-5 py-3.5 text-sm bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500/50 font-semibold transition-all text-slate-800 dark:text-white placeholder:font-normal placeholder:text-slate-400/50"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="block text-[11px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest ml-1">HSN Code</label>
                  <input
                    placeholder="e.g. 1006"
                    value={newMat.hsnCode}
                    onChange={(e) => setNewMat({ ...newMat, hsnCode: e.target.value })}
                    className="w-full px-5 py-3.5 text-sm bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500/50 font-semibold transition-all text-slate-800 dark:text-white"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="block text-[11px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest ml-1">GST Rate (%)</label>
                  <div className="relative">
                    <select
                      value={newMat.gstRate}
                      onChange={(e) => setNewMat({ ...newMat, gstRate: Number(e.target.value) })}
                      className="w-full appearance-none px-5 py-3.5 text-sm bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500/50 font-semibold transition-all text-slate-800 dark:text-white"
                    >
                      <option value={5}>5%</option>
                      <option value={12}>12%</option>
                      <option value={18}>18%</option>
                      <option value={28}>28%</option>
                      <option value={0}>Exempt</option>
                    </select>
                    <ChevronDown size={14} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                  </div>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="block text-[11px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest ml-1">Unit</label>
                <div className="relative">
                  <button
                    onClick={() => setShowUnitList(!showUnitList)}
                    className="w-full px-5 py-3.5 text-left text-sm bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500/50 font-semibold transition-all text-slate-800 dark:text-white flex items-center justify-between"
                  >
                    <span>{
                      newMat.unit === "kg" ? "kilogram (kg)" :
                        newMat.unit === "g" ? "gram (g)" :
                          newMat.unit === "ltr" ? "liter (ltr)" :
                            newMat.unit === "ml" ? "milliliter (ml)" :
                              newMat.unit === "pc" ? "piece (pc)" :
                                newMat.unit === "pkt" ? "packet (pkt)" :
                                  "box"
                    }</span>
                    <ChevronDown size={16} className={clsx("text-slate-400 transition-transform", showUnitList && "rotate-180")} />
                  </button>

                  {showUnitList && (
                    <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-[#1a1c26] border border-slate-200 dark:border-white/10 rounded-2xl shadow-2xl z-[70] overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                      <div className="p-1.5 space-y-0.5">
                        {[
                          { id: "kg", label: "kilogram (kg)" },
                          { id: "g", label: "gram (g)" },
                          { id: "ltr", label: "liter (ltr)" },
                          { id: "ml", label: "milliliter (ml)" },
                          { id: "pc", label: "piece (pc)" },
                          { id: "pkt", label: "packet (pkt)" },
                          { id: "box", label: "box" }
                        ].map(unit => (
                          <button
                            key={unit.id}
                            onClick={() => {
                              setNewMat({ ...newMat, unit: unit.id });
                              setShowUnitList(false);
                            }}
                            className={clsx(
                              "w-full text-left px-4 py-2.5 rounded-xl text-xs font-bold transition-all",
                              newMat.unit === unit.id
                                ? "bg-indigo-600 text-white shadow-lg shadow-indigo-500/20"
                                : "text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/10 hover:text-indigo-600"
                            )}
                          >
                            {unit.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="flex gap-4 pt-4 border-t border-slate-100 dark:border-white/5">
              <button
                onClick={() => setShowMaterialForm(false)}
                className="flex-1 py-4 rounded-2xl border border-slate-200 dark:border-white/10 text-[11px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-white/5 transition-all"
              >
                Cancel
              </button>
              <button
                onClick={handleQuickAddMaterial}
                disabled={matSaving || !newMat.name}
                className="flex-[2] py-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl text-[11px] font-black shadow-lg shadow-indigo-500/20 transition-all uppercase tracking-widest border border-indigo-400/20"
              >
                {matSaving ? "Wait..." : "Add Material"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* GST Invoice Modal */}
      {viewingPO && (
        <GSTInvoice
          order={viewingPO}
          vendor={viewingPO.vendor}
          companyDetails={currentCompany}
          onClose={() => setViewingPO(null)}
        />
      )}
      {/* Simple Company Settings Modal */}
      {showSettings && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white dark:bg-[#1a1c26] w-full max-w-lg rounded-2xl shadow-xl border border-slate-200 dark:border-white/10 overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-slate-100 dark:border-white/5 flex justify-between items-center bg-slate-50/50 dark:bg-white/[0.02]">
              <div>
                <h2 className="text-lg font-bold text-slate-800 dark:text-white">Business Settings</h2>
                <p className="text-[11px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">GST & Identity Details</p>
              </div>
              <button onClick={() => setShowSettings(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-white transition-colors">
                <X size={20} />
              </button>
            </div>

            <div className="p-6 space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Company Name</label>
                  <input
                    value={editingProfile.name}
                    onChange={(e) => setEditingProfile({ ...editingProfile, name: e.target.value })}
                    className="w-full px-4 py-2.5 bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 text-sm font-semibold transition-all"
                    placeholder="Enter Company Name"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">GSTIN Number</label>
                  <input
                    value={editingProfile.gstin}
                    onChange={(e) => setEditingProfile({ ...editingProfile, gstin: e.target.value.toUpperCase() })}
                    className="w-full px-4 py-2.5 bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 text-sm font-semibold transition-all uppercase"
                    placeholder="e.g. 33XXXXXXXXXXXXX"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Full Address</label>
                <textarea
                  value={editingProfile.address}
                  onChange={(e) => setEditingProfile({ ...editingProfile, address: e.target.value })}
                  className="w-full px-4 py-2.5 bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 text-sm font-semibold transition-all h-20 resize-none"
                  placeholder="Street, City, State, ZIP..."
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Business State</label>
                  <input
                    value={editingProfile.state}
                    onChange={(e) => setEditingProfile({ ...editingProfile, state: e.target.value })}
                    className="w-full px-4 py-2.5 bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 text-sm font-semibold transition-all"
                    placeholder="E.g. Tamil Nadu"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Email Address</label>
                  <input
                    value={editingProfile.email}
                    onChange={(e) => setEditingProfile({ ...editingProfile, email: e.target.value })}
                    className="w-full px-4 py-2.5 bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 text-sm font-semibold transition-all"
                    placeholder="email@company.com"
                  />
                </div>
              </div>

              <div className="pt-2 flex gap-3">
                <button 
                  onClick={() => setShowSettings(false)}
                  className="flex-1 px-6 py-3 rounded-xl border border-slate-200 dark:border-white/10 text-[11px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-white/5 transition-all"
                >
                  Close
                </button>
                <button 
                  onClick={handleSaveProfile}
                  disabled={saving}
                  className="flex-1 px-6 py-3 bg-orange-500 hover:bg-orange-400 text-white rounded-xl text-[11px] font-black uppercase tracking-widest shadow-lg shadow-orange-500/20 transition-all disabled:opacity-50"
                >
                  {saving ? "Saving..." : "Update Details"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
