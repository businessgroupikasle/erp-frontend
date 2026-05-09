"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import { createPortal } from "react-dom";
import {
  ShoppingCart, Plus, Search, Filter, Calendar as CalendarIcon,
  ChevronDown, Store, Clock, CheckCircle2, XCircle, AlertCircle,
  Trash2, Wallet, RefreshCw, ChevronLeft, ChevronRight, Download, X, Settings
} from "lucide-react";
import { format, addMonths, subMonths, startOfMonth, endOfMonth, startOfWeek, endOfWeek, addDays, isSameMonth, isSameDay, isToday, startOfDay, isBefore } from "date-fns";
import { vendorsApi, purchaseOrdersApi, rawMaterialsApi, settingsApi, accountsApi } from "../../../lib/api";
import { clsx } from "clsx";
import GSTInvoice from "../../documents/GSTInvoice";
import api from "../../../lib/api";
import AddMaterialDrawer from "../inventory/AddMaterialDrawer";

interface POItem {
  inventoryItemId: string;
  itemName: string;
  unit: string;
  quantity: number;
  price: number;
  hsnCode: string;
  gstRate: number;
}

const STATUS_STYLES: Record<string, string> = {
  DRAFT: "bg-slate-100 text-slate-600 border border-slate-200 shadow-sm",
  PENDING_APPROVAL: "bg-amber-50 text-amber-600 border border-amber-200 shadow-sm shadow-amber-500/10",
  APPROVED: "bg-indigo-50 text-indigo-600 border border-indigo-200 shadow-sm shadow-indigo-500/10",
  SENT: "bg-blue-50 text-blue-600 border border-blue-200 shadow-sm shadow-blue-500/10",
  PARTIALLY_RECEIVED: "bg-orange-50 text-orange-600 border border-orange-200 shadow-sm shadow-orange-500/10",
  RECEIVED: "bg-emerald-50 text-emerald-600 border border-emerald-200 shadow-sm shadow-emerald-500/10",
  CLOSED: "bg-emerald-900 text-white border border-emerald-800 shadow-sm",
  CANCELLED: "bg-red-50 text-red-600 border border-red-200 shadow-sm shadow-red-500/10",
};

const STATUS_ICONS: Record<string, any> = {
  DRAFT: Clock,
  PENDING_APPROVAL: Clock,
  APPROVED: CheckCircle2,
  SENT: CheckCircle2,
  PARTIALLY_RECEIVED: Store,
  RECEIVED: Store,
  CLOSED: CheckCircle2,
  CANCELLED: XCircle,
};

const FALLBACK_COMPANY = {
  name: "My Restaurant",
  gstin: "",
  address: "",
  phone: "",
  email: "",
  state: "Tamil Nadu"
};

import { formatCurrency } from "@/lib/utils";


export default function PurchaseOrdersClient() {
  const [orders, setOrders] = useState<any[]>([]);
  const [vendors, setVendors] = useState<any[]>([]);
  const [materials, setMaterials] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);

  const [showForm, setShowForm] = useState(false);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("ALL");
  const [saving, setSaving] = useState(false);

  // Form State
  const [vendorId, setVendorId] = useState("");
  const [expectedDate, setExpectedDate] = useState("");
  const [notes, setNotes] = useState("");
  const [internalNotes, setInternalNotes] = useState("");
  const [vendorNotes, setVendorNotes] = useState("");
  const [deliveryInstructions, setDeliveryInstructions] = useState("");
  const [freightCost, setFreightCost] = useState<number>(0);
  const [unloadingCost, setUnloadingCost] = useState<number>(0);
  const [items, setItems] = useState<POItem[]>([{ inventoryItemId: "", itemName: "", unit: "kg", quantity: 0, price: 0, hsnCode: "", gstRate: 5 }]);
  const [companyProfile, setCompanyProfile] = useState<any>(null);
  const EMPTY_PROFILE = { name: "", gstin: "", address: "", phone: "", email: "", state: "" };
  const [editingProfile, setEditingProfile] = useState<any>(EMPTY_PROFILE);
  const [showSettings, setShowSettings] = useState(false);
  const [profileRequiredForInvoice, setProfileRequiredForInvoice] = useState(false);
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileErrors, setProfileErrors] = useState<Record<string, string>>({});
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [viewDate, setViewDate] = useState(new Date());

  // Payment Modal State
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [payingPO, setPayingPO] = useState<any>(null);
  const [paymentAmount, setPaymentAmount] = useState<number>(0);
  const [paymentMode, setPaymentMode] = useState<"CASH" | "UPI" | "CARD">("CASH");
  const [paymentNote, setPaymentNote] = useState("");

  const [viewingPO, setViewingPO] = useState<any>(null);
  const [viewingDetailsPO, setViewingDetailsPO] = useState<any>(null);
  const [poDetailsTab, setPoDetailsTab] = useState<"OVERVIEW" | "ITEMS" | "GRN" | "AUDIT">("OVERVIEW");
  const [lastPayment, setLastPayment] = useState<any>(null);
  const [accounts, setAccounts] = useState<any[]>([]);
  const [selectedAccountId, setSelectedAccountId] = useState<string>("");
  const [showAddMaterialDrawer, setShowAddMaterialDrawer] = useState(false);

  useEffect(() => {
    if (showForm || showPaymentModal || viewingDetailsPO) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => { document.body.style.overflow = 'unset'; };
  }, [showForm, showPaymentModal, viewingDetailsPO]);

  const selectedVendor = vendors.find((v: any) => v.id === vendorId);
  const currentCompany = companyProfile || FALLBACK_COMPANY;
  const [manualGst, setManualGst] = useState(false);
  const [customGstRate, setCustomGstRate] = useState<number>(5);
  const [customCgst, setCustomCgst] = useState<number>(0);
  const [customSgst, setCustomSgst] = useState<number>(0);
  const [customIgst, setCustomIgst] = useState<number>(0);

  const isProfileComplete = !!(companyProfile?.name && companyProfile?.gstin && companyProfile?.address);

  const fetchAll = useCallback(async () => {
    setLoading(true);
    try {
      const [poRes, vRes, rmRes, cpRes, aRes] = await Promise.all([
        purchaseOrdersApi.getAll().catch(() => ({ data: [] })),
        vendorsApi.getAll().catch(() => ({ data: [] })),
        rawMaterialsApi.getAll().catch(() => ({ data: [] })),
        settingsApi.getCompanyProfile().catch(() => ({ data: null })),
        accountsApi.getAll().catch(() => ({ data: [] }))
      ]);
      setOrders(poRes.data ?? []);
      setVendors(vRes.data ?? []);
      setMaterials(rmRes.data ?? []);
      const accs = aRes.data || [];
      setAccounts(accs);
      if (accs.length > 0) setSelectedAccountId(accs[0].id);
      if (cpRes.data) {
        setCompanyProfile(cpRes.data);
        setEditingProfile(cpRes.data);
      } else {
        setEditingProfile({ name: "", gstin: "", address: "", phone: "", email: "", state: "" });
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

  useEffect(() => {
    if (manualGst) {
      const calculatedTotal = round(subtotal * (customGstRate / 100));
      if (isSameState) {
        setCustomCgst(round(calculatedTotal / 2));
        setCustomSgst(round(calculatedTotal / 2));
        setCustomIgst(0);
      } else {
        setCustomCgst(0);
        setCustomSgst(0);
        setCustomIgst(calculatedTotal);
      }
    }
  }, [manualGst, customGstRate, subtotal, isSameState]);

  const totalGst = manualGst ? round(customCgst + customSgst + customIgst) : round(taxDetails.cgst + taxDetails.sgst + taxDetails.igst);
  const grandTotal = round(subtotal + totalGst);
  const availableAdvance = Math.max(0, selectedVendor?.balance ?? 0);
  const autoApplied = Math.min(availableAdvance, grandTotal);
  const balanceDue = Math.max(0, grandTotal - autoApplied);

  const handleSaveProfile = async () => {
    const errors: Record<string, string> = {};
    const p = editingProfile;

    if (!p.name?.trim()) errors.name = "Company name is required.";
    if (!p.gstin?.trim()) {
      errors.gstin = "GSTIN is required.";
    } else if (!/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/.test(p.gstin.trim())) {
      errors.gstin = "Invalid GSTIN — must be 15 characters (e.g. 22AAAAA0000A1Z5).";
    }
    if (!p.address?.trim()) errors.address = "Address is required.";
    if (!p.phone?.trim()) {
      errors.phone = "Phone number is required.";
    } else if (!/^\d{10}$/.test(p.phone.trim())) {
      errors.phone = "Phone must be exactly 10 digits.";
    }
    if (!p.state?.trim()) errors.state = "State is required.";
    if (p.email?.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(p.email.trim())) {
      errors.email = "Enter a valid email address.";
    }

    if (Object.keys(errors).length > 0) {
      setProfileErrors(errors);
      return;
    }

    setProfileSaving(true);
    try {
      const res = await settingsApi.updateCompanyProfile({
        ...p,
        name: p.name.trim(),
        gstin: p.gstin.trim().toUpperCase(),
        address: p.address.trim(),
        phone: p.phone.trim(),
        email: p.email?.trim() || null,
        state: p.state.trim(),
      });
      setCompanyProfile(res.data);
      setEditingProfile(res.data);
      setProfileErrors({});
      setShowSettings(false);
      setProfileRequiredForInvoice(false);
    } catch (e: any) {
      const msg = e?.response?.data?.error || e?.response?.data?.message || "Failed to save profile. Please try again.";
      setProfileErrors({ _api: msg });
    } finally {
      setProfileSaving(false);
    }
  };

  const handleCreate = async (status: string = "PENDING_APPROVAL") => {
    if (!vendorId || items.some((it) => !it.inventoryItemId || it.quantity <= 0 || it.price <= 0)) return;
    setSaving(true);
    try {
      await purchaseOrdersApi.create({
        vendorId,
        advancePaid: autoApplied,
        expectedDeliveryDate: expectedDate,
        notes,
        internalNotes,
        vendorNotes,
        deliveryInstructions,
        status,
        freightCost,
        unloadingCost,
        items: items.map(({ inventoryItemId, quantity, price, hsnCode, gstRate }) => ({ inventoryItemId, quantity, price, hsnCode, gstRate })),
        manualTax: manualGst ? { cgst: customCgst, sgst: customSgst, igst: customIgst } : undefined
      });
      setShowForm(false);
      setVendorId(""); setExpectedDate(""); setNotes(""); setInternalNotes(""); setVendorNotes(""); setDeliveryInstructions(""); setFreightCost(0); setUnloadingCost(0);
      setManualGst(false); setCustomCgst(0); setCustomSgst(0); setCustomIgst(0);
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

  const handleApprove = async (id: string) => {
    if (!confirm("Approve this purchase order?")) return;
    try {
      await api.patch(`/api/purchase-orders/${id}/approve`);
      fetchAll();
    } catch (e: any) {
      alert(e?.response?.data?.error ?? "Failed to approve PO");
    }
  };

  const handleRecordPayment = async () => {
    if (!payingPO || paymentAmount <= 0 || !paymentMode) return;
    setSaving(true);
    try {
      const res = await vendorsApi.recordPayment(payingPO.vendorId, {
        amount: paymentAmount,
        accountId: selectedAccountId,
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
    <div className={clsx("max-w-6xl mx-auto space-y-6", (showForm || showPaymentModal || viewingDetailsPO) && "relative z-[10000]")}>
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-gray-900 dark:text-white flex items-center gap-2">
            <ShoppingCart size={22} className="text-orange-500" /> Purchase Orders
          </h1>
          <p className="text-sm text-gray-500 dark:text-slate-400 mt-1">Buy raw materials from vendors</p>
        </div>
        <div className="flex gap-2">
          <button type="button" onClick={() => setShowSettings(true)} className="p-2 rounded-xl border border-gray-200 dark:border-white/10 group"><Settings size={16} className="text-gray-400 group-hover:text-orange-500 transition-colors" /></button>
          <button type="button" onClick={fetchAll} className="p-2 rounded-xl border border-gray-200 dark:border-white/10"><RefreshCw size={16} className="text-gray-400" /></button>
          <button type="button" onClick={() => setShowForm(true)} className="flex items-center gap-2 bg-orange-500 hover:bg-orange-400 text-white px-4 py-2 rounded-xl text-sm font-bold"><Plus size={16} /> New PO</button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Total Spend", value: formatCurrency(totalSpend), icon: ShoppingCart, color: "text-indigo-500", bg: "bg-indigo-50 dark:bg-indigo-500/10" },
          { label: "Pending GRNs", value: String(orders.filter(o => o.status === 'APPROVED' || o.status === 'SENT').length), icon: Store, color: "text-orange-500", bg: "bg-orange-50 dark:bg-orange-500/10" },
          { label: "Pending Invoices", value: String(orders.filter(o => o.invoiceStatus === 'PENDING').length), icon: AlertCircle, color: "text-red-500", bg: "bg-red-50 dark:bg-red-500/10" },
          { label: "Pending Approval", value: String(orders.filter(o => o.status === 'PENDING_APPROVAL').length), icon: Clock, color: "text-amber-500", bg: "bg-amber-50 dark:bg-amber-500/10" },
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

      <div className="bg-white dark:bg-card rounded-3xl border border-gray-100 dark:border-white/5 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-gray-100 dark:border-white/5 bg-gray-50/50 dark:bg-white/[0.02]">
                <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">PO No</th>
                <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Vendor</th>
                <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Amount</th>
                <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Status</th>
                <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Delivery</th>
                <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Payment</th>
                <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Details</th>
                <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-white/5">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-20 text-center">
                    <div className="flex flex-col items-center gap-3">
                      <div className="w-16 h-16 rounded-3xl bg-slate-50 dark:bg-white/5 flex items-center justify-center text-slate-300">
                        <ShoppingCart size={32} />
                      </div>
                      <p className="text-sm font-bold text-slate-400">No Purchase Orders found.</p>
                      <button onClick={() => setShowForm(true)} className="text-xs font-black text-orange-500 uppercase tracking-widest mt-2">Create your first PO</button>
                    </div>
                  </td>
                </tr>
              ) : filtered.map((po) => {
                const currentPaid = po.paid ?? 0;
                const balance = Math.max(0, (po.totalAmount ?? 0) - currentPaid);
                const StatusIcon = STATUS_ICONS[po.status] || Clock;
                return (
                  <tr key={po.id} className="hover:bg-slate-50 dark:hover:bg-white/[0.02] transition-colors group">
                    <td className="px-6 py-4">
                      <p className="text-xs font-black text-gray-900 dark:text-white uppercase">PO-{po.poNumber?.split('-').pop() || po.id.slice(0, 8).toUpperCase()}</p>
                      <p className="text-[10px] text-gray-400 mt-1">{format(new Date(po.createdAt), "dd MMM yyyy")}</p>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-orange-50 dark:bg-orange-500/10 flex items-center justify-center text-orange-500 shrink-0"><Store size={14} /></div>
                        <div>
                          <p className="text-xs font-black text-gray-900 dark:text-white">{po.vendor?.name || "Unknown"}</p>
                          <p className="text-[10px] text-gray-400 mt-0.5">{po.vendor?.category || 'General Supplier'}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-xs font-black text-gray-900 dark:text-white">{formatCurrency(po.totalAmount)}</p>
                      <p className="text-[9px] text-gray-400 mt-1 uppercase tracking-tighter">Items: {po.poItems?.length || 0}</p>
                    </td>
                    <td className="px-6 py-4">
                      <span className={clsx("inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-wider whitespace-nowrap", STATUS_STYLES[po.status] || STATUS_STYLES.DRAFT)}>
                        <StatusIcon size={10} />
                        {po.status.replace(/_/g, ' ')}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {po.expectedDeliveryDate ? (
                        <div>
                          <p className={clsx("text-xs font-black", isBefore(new Date(po.expectedDeliveryDate), new Date()) && po.status !== 'RECEIVED' ? "text-red-500" : "text-gray-900 dark:text-white")}>
                            {format(new Date(po.expectedDeliveryDate), "dd MMM")}
                          </p>
                          <p className="text-[9px] text-gray-400 mt-1 uppercase">Expected</p>
                        </div>
                      ) : (
                        <p className="text-xs font-bold text-gray-300 italic">Not set</p>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <p className={clsx("text-xs font-black", balance <= 0 ? "text-emerald-500" : "text-orange-500")}>
                          {balance <= 0 ? "FULLY PAID" : formatCurrency(balance)}
                        </p>
                        <p className="text-[9px] text-gray-400 mt-1 uppercase">{balance <= 0 ? "Success" : "Pending"}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <button type="button" onClick={() => setViewingDetailsPO(po)} className="text-indigo-600 hover:text-indigo-700 text-[10px] font-black uppercase tracking-widest">View Details</button>
                    </td>
                    <td className="px-6 py-4 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        {po.status === 'DRAFT' && (
                          <button type="button" onClick={() => handleApprove(po.id)} className="px-3 py-1.5 bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 rounded-lg text-[10px] font-black uppercase tracking-widest hover:bg-indigo-100 transition-all">Submit</button>
                        )}
                        {po.status === 'PENDING_APPROVAL' && (
                          <div className="flex gap-1">
                            <button type="button" onClick={() => handleApprove(po.id)} className="px-3 py-1.5 bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 rounded-lg text-[10px] font-black uppercase tracking-widest hover:bg-emerald-100 transition-all">Approve</button>
                            <button type="button" onClick={() => handleCancel(po.id)} className="px-3 py-1.5 bg-red-50 dark:bg-red-500/10 text-red-600 rounded-lg text-[10px] font-black uppercase tracking-widest hover:bg-red-100 transition-all">Reject</button>
                          </div>
                        )}
                        {po.status === 'APPROVED' && (
                          <button type="button" onClick={async () => { await purchaseOrdersApi.updateStatus(po.id, 'SENT'); fetchAll(); }} className="px-3 py-1.5 bg-blue-50 dark:bg-blue-500/10 text-blue-600 rounded-lg text-[10px] font-black uppercase tracking-widest hover:bg-blue-100 transition-all">Send to Vendor</button>
                        )}
                        {(po.status === 'SENT' || po.status === 'PARTIALLY_RECEIVED') && (
                          <button type="button" onClick={() => window.location.href = `/purchases/grn?poId=${po.id}`} className="px-3 py-1.5 bg-orange-50 dark:bg-orange-500/10 text-orange-600 rounded-lg text-[10px] font-black uppercase tracking-widest hover:bg-orange-100 transition-all">Receive Goods</button>
                        )}

                        <button
                          type="button"
                          onClick={() => {
                            if (!isProfileComplete) {
                              setProfileRequiredForInvoice(true);
                              setShowSettings(true);
                              return;
                            }
                            setViewingPO(po);
                          }}
                          className="p-2 hover:bg-indigo-50 dark:hover:bg-indigo-500/10 rounded-lg text-indigo-500 transition-colors"
                          title="Invoice"
                        >
                          <Download size={14} />
                        </button>
                        <button type="button" onClick={() => { setPayingPO(po); setPaymentAmount(balance); setShowPaymentModal(true); }} className="p-2 hover:bg-orange-50 dark:hover:bg-orange-500/10 rounded-lg text-orange-500 transition-colors" title="Pay">
                          <Wallet size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {showForm && mounted && createPortal(
        <div className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/60 backdrop-blur-md p-4">
          <div className="absolute inset-0" onClick={() => setShowForm(false)} />
          <div className="bg-white dark:bg-[#0f1117] rounded-[2.5rem] shadow-2xl w-full max-w-4xl p-8 space-y-8 relative my-8">

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-orange-500 flex items-center justify-center text-white shadow-lg shadow-orange-500/20">
                  <ShoppingCart size={22} />
                </div>
                <div>
                  <h2 className="text-xl font-black text-gray-900 dark:text-white uppercase tracking-tight">New Purchase Order</h2>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-0.5">Purchase Management</p>
                </div>
              </div>
              <button type="button" onClick={() => setShowForm(false)} className="p-2 hover:bg-slate-100 dark:hover:bg-white/5 rounded-full transition-all text-slate-300 hover:text-slate-500">
                <X size={24} />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 relative z-[200]">
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
                {selectedVendor && (
                  <div className="flex items-center gap-2 mt-2 ml-1">
                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Payment Terms:</span>
                    <span className="text-[9px] font-black text-indigo-600 bg-indigo-50 dark:bg-indigo-500/10 px-2 py-0.5 rounded uppercase">{selectedVendor.paymentTerms || 'Net 30'}</span>
                  </div>
                )}
              </div>
              <div className="space-y-2 relative">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Expected Delivery Date</label>
                <button
                  onClick={() => setShowDatePicker(!showDatePicker)}
                  className="w-full h-14 bg-slate-50 dark:bg-white/5 px-5 rounded-2xl font-bold text-sm flex items-center justify-between border border-slate-200 dark:border-white/10 hover:border-orange-500/50 transition-all"
                >
                  <span className={clsx(expectedDate ? "text-slate-900 dark:text-white" : "text-slate-400")}>
                    {expectedDate ? format(new Date(expectedDate), "dd/MM/yyyy") : "Select Date"}
                  </span>
                  <CalendarIcon size={18} className="text-slate-400" />
                </button>

                {showDatePicker && (
                  <div
                    className="absolute top-full left-0 mt-3 z-[1000] isolate opacity-100 bg-white dark:bg-[#1a1c23] border border-slate-200 dark:border-white/10 rounded-[2.5rem] shadow-[0_25px_60px_rgba(0,0,0,0.4)] p-6 w-[320px] animate-in fade-in slide-in-from-top-2 duration-200"
                    style={{ backgroundColor: 'white' }}
                  >
                    <div className="flex items-center justify-between mb-4 px-2">
                      <p className="text-[13px] font-black uppercase tracking-widest text-slate-800 dark:text-white">{format(viewDate, "MMMM yyyy")}</p>
                      <div className="flex gap-1">
                        <button onClick={() => setViewDate(subMonths(viewDate, 1))} className="p-2 hover:bg-slate-100 dark:hover:bg-white/10 rounded-xl transition-colors"><ChevronLeft size={16} /></button>
                        <button onClick={() => setViewDate(addMonths(viewDate, 1))} className="p-2 hover:bg-slate-100 dark:hover:bg-white/10 rounded-xl transition-colors"><ChevronRight size={16} /></button>
                      </div>
                    </div>
                    <div className="grid grid-cols-7 gap-1 text-center mb-3">
                      {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map(d => (
                        <div key={d} className="text-[10px] font-black text-slate-400 uppercase py-1 tracking-tighter">{d}</div>
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
                        return days.map(d => {
                          const isPast = isBefore(d, startOfDay(new Date()));
                          return (
                            <button
                              key={d.toISOString()}
                              disabled={isPast}
                              onClick={() => {
                                if (isPast) return;
                                setExpectedDate(format(d, "yyyy-MM-dd"));
                                setShowDatePicker(false);
                              }}
                              className={clsx(
                                "w-9 h-9 rounded-xl text-[10px] font-bold transition-all flex items-center justify-center",
                                isPast ? "text-slate-200 dark:text-slate-800 cursor-not-allowed" :
                                  (!isSameMonth(d, viewDate) ? "text-slate-300 dark:text-gray-700" : "text-slate-700 dark:text-slate-200 hover:bg-orange-50 dark:hover:bg-orange-500/10"),
                                expectedDate && isSameDay(d, new Date(expectedDate)) ? "bg-orange-500 text-white shadow-lg shadow-orange-500/20 hover:bg-orange-500" : ""
                              )}
                            >
                              {format(d, "d")}
                            </button>
                          );
                        });
                      })()}
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-4 relative z-10">
              <div className="flex items-center justify-between">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Order Items</p>
                <button
                  type="button"
                  onClick={addItem}
                  className="text-[10px] font-black text-orange-600 bg-orange-50 dark:bg-orange-500/10 px-3 py-1.5 rounded-lg uppercase tracking-widest flex items-center gap-2 hover:bg-orange-100 transition-all"
                >
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
                        {materials.map(m => (
                          <option key={m.id} value={m.id}>{m.name} ({m.unit})</option>
                        ))}
                      </select>
                      <div className="flex items-center justify-between mt-1 px-1">
                        {it.inventoryItemId ? (
                          <div className="flex gap-2">
                            {(() => {
                              const mat = materials.find(m => m.id === it.inventoryItemId);
                              const vendorMat = selectedVendor?.suppliedMaterials?.find((sm: any) => sm.materialId === it.inventoryItemId);
                              return (
                                <>
                                  <span className={clsx("text-[8px] font-black uppercase tracking-tighter px-1.5 py-0.5 rounded", (mat?.currentStock || 0) < (mat?.minimumStock || 0) ? "bg-red-50 text-red-500" : "bg-emerald-50 text-emerald-600")}>
                                    Stock: {mat?.currentStock || 0} {it.unit}
                                  </span>
                                  <span className="text-[8px] font-black text-slate-400 uppercase tracking-tighter bg-slate-50 dark:bg-white/5 px-1.5 py-0.5 rounded">
                                    Min: {mat?.minimumStock || 0}
                                  </span>
                                  {vendorMat?.price && (
                                    <span className="text-[8px] font-black text-indigo-500 uppercase tracking-tighter bg-indigo-50 dark:bg-indigo-500/10 px-1.5 py-0.5 rounded">
                                      Last: ₹{vendorMat.price}
                                    </span>
                                  )}
                                </>
                              );
                            })()}
                          </div>
                        ) : (
                          <button
                            type="button"
                            onClick={() => setShowAddMaterialDrawer(true)}
                            className="text-[8px] font-black text-indigo-500 uppercase tracking-widest hover:underline flex items-center gap-1"
                          >
                            <Plus size={8} /> Request New Material
                          </button>
                        )}
                      </div>
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
                      <button
                        type="button"
                        onClick={() => removeItem(idx)}
                        className="p-3 text-slate-300 hover:text-red-500 transition-colors"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-6 border-t border-slate-100 dark:border-white/5 relative z-10">
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Freight Cost (₹)</label>
                    <input
                      type="number"
                      value={freightCost}
                      onChange={(e) => setFreightCost(Number(e.target.value))}
                      className="w-full h-11 bg-white dark:bg-card px-4 rounded-xl font-bold text-xs outline-none border border-slate-200 dark:border-white/10"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Unloading Cost (₹)</label>
                    <input
                      type="number"
                      value={unloadingCost}
                      onChange={(e) => setUnloadingCost(Number(e.target.value))}
                      className="w-full h-11 bg-white dark:bg-card px-4 rounded-xl font-bold text-xs outline-none border border-slate-200 dark:border-white/10"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div className="space-y-1.5">
                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Internal Notes</label>
                    <textarea value={internalNotes} onChange={e => setInternalNotes(e.target.value)} placeholder="Staff eyes only..." className="w-full h-24 bg-slate-50 dark:bg-white/5 p-3 rounded-2xl text-xs font-bold border border-slate-100 dark:border-white/5 resize-none" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Vendor Notes</label>
                    <textarea value={vendorNotes} onChange={e => setVendorNotes(e.target.value)} placeholder="Print on PO..." className="w-full h-24 bg-slate-50 dark:bg-white/5 p-3 rounded-2xl text-xs font-bold border border-slate-100 dark:border-white/5 resize-none" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Delivery Info</label>
                    <textarea value={deliveryInstructions} onChange={e => setDeliveryInstructions(e.target.value)} placeholder="Warehouse instructions..." className="w-full h-24 bg-slate-50 dark:bg-white/5 p-3 rounded-2xl text-xs font-bold border border-slate-100 dark:border-white/5 resize-none" />
                  </div>
                </div>
              </div>

              <div className="bg-slate-50 dark:bg-white/5 rounded-[2rem] p-6 space-y-4">
                <div className="flex justify-between text-[11px] font-bold text-slate-400 uppercase tracking-widest">
                  <span>Subtotal</span>
                  <span>₹{subtotal.toLocaleString()}</span>
                </div>
                <div className="space-y-3 border-b border-slate-200 dark:border-white/10 pb-4">
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Tax (GST)</span>
                    <button
                      type="button"
                      onClick={() => {
                        if (!manualGst) {
                          const currentRate = subtotal > 0 ? (totalGst / subtotal) * 100 : 5;
                          setCustomGstRate(round(currentRate));
                        }
                        setManualGst(!manualGst);
                      }}
                      className="text-[9px] font-black text-orange-600 bg-orange-50 dark:bg-orange-500/10 px-2 py-1 rounded"
                    >
                      {manualGst ? "RESET TO AUTO" : "EDIT TAXES"}
                    </button>
                  </div>

                  {manualGst ? (
                    <div className="space-y-4">
                      <div className="space-y-1.5">
                        <div className="flex justify-between items-center">
                          <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Manual GST Rate (%)</label>
                          <span className="text-[10px] font-black text-orange-600 bg-orange-50 dark:bg-orange-500/10 px-2 py-0.5 rounded-full">₹{totalGst.toLocaleString()}</span>
                        </div>
                        <input
                          type="number"
                          value={customGstRate}
                          onChange={(e) => setCustomGstRate(Number(e.target.value))}
                          placeholder="e.g. 18"
                          className="w-full h-11 bg-white dark:bg-black/20 rounded-xl px-4 text-sm font-black outline-none border-2 border-orange-200 dark:border-orange-500/20 focus:border-orange-500 transition-all"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-3 opacity-60">
                        {isSameState ? (
                          <>
                            <div className="bg-slate-50 dark:bg-white/5 p-2 rounded-xl text-center">
                              <p className="text-[8px] font-black text-slate-400 uppercase">CGST (Calc)</p>
                              <p className="text-[11px] font-black">₹{customCgst.toLocaleString()}</p>
                            </div>
                            <div className="bg-slate-50 dark:bg-white/5 p-2 rounded-xl text-center">
                              <p className="text-[8px] font-black text-slate-400 uppercase">SGST (Calc)</p>
                              <p className="text-[11px] font-black">₹{customSgst.toLocaleString()}</p>
                            </div>
                          </>
                        ) : (
                          <div className="col-span-2 bg-slate-50 dark:bg-white/5 p-2 rounded-xl text-center">
                            <p className="text-[8px] font-black text-slate-400 uppercase">IGST (Calc)</p>
                            <p className="text-[11px] font-black">₹{customIgst.toLocaleString()}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="flex justify-between text-[11px] font-bold text-slate-400 uppercase tracking-widest">
                      <span>{isSameState ? "CGST + SGST" : "IGST"}</span>
                      <span>₹{totalGst.toLocaleString()}</span>
                    </div>
                  )}
                </div>
                <div className="flex justify-between items-center pt-2 border-t border-slate-200 dark:border-white/10 mt-2">
                  <span className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-widest">Grand Total</span>
                  <span className="text-2xl font-black text-orange-600">₹{(grandTotal + freightCost + unloadingCost).toLocaleString()}</span>
                </div>

                {autoApplied > 0 && (
                  <div className="bg-emerald-500/10 p-3 rounded-xl flex justify-between items-center">
                    <span className="text-[9px] font-black text-emerald-600 uppercase tracking-widest flex items-center gap-2"><Wallet size={12} /> Advance Applied</span>
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
                type="button"
                onClick={() => setShowForm(false)}
                className="flex-1 py-5 text-[11px] font-black uppercase tracking-[0.2em] text-slate-500 hover:bg-slate-100 dark:hover:bg-white/5 rounded-2xl transition-all"
              >
                Abort
              </button>
              <button
                type="button"
                onClick={() => handleCreate("DRAFT")}
                disabled={saving || !vendorId || items.some(it => !it.inventoryItemId || it.quantity <= 0)}
                className="flex-1 py-5 bg-slate-100 dark:bg-white/5 text-slate-600 rounded-2xl text-[11px] font-black uppercase tracking-[0.2em] transition-all hover:bg-slate-200"
              >
                Save Draft
              </button>
              <button
                type="button"
                onClick={() => handleCreate("PENDING_APPROVAL")}
                disabled={saving || !vendorId || items.some(it => !it.inventoryItemId || it.quantity <= 0)}
                className="flex-[2] py-5 bg-orange-500 text-white rounded-2xl text-[11px] font-black shadow-xl shadow-orange-500/20 uppercase tracking-[0.3em] transition-all hover:scale-[1.02] active:scale-95 disabled:opacity-50 disabled:grayscale"
              >
                {saving ? "Processing..." : "Submit for Approval"}
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}

      {showPaymentModal && payingPO && mounted && createPortal(
        <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md">
          <div className="absolute inset-0" onClick={() => { setShowPaymentModal(false); setPayingPO(null); }} />
          <div className="bg-white dark:bg-[#0f1117] w-full max-w-md rounded-[2.5rem] shadow-2xl border border-slate-100 dark:border-white/5 overflow-hidden animate-in zoom-in-95 duration-300 relative">
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
                  <p className="text-sm font-black text-slate-900 dark:text-white mt-0.5">{formatCurrency(payingPO.totalAmount ?? 0)}</p>
                </div>
                <div className="bg-emerald-50 dark:bg-emerald-500/10 rounded-2xl p-3 text-center">
                  <p className="text-[9px] font-black text-emerald-600 uppercase tracking-widest">Paid</p>
                  <p className="text-sm font-black text-emerald-700 dark:text-emerald-400 mt-0.5">{formatCurrency(payingPO.paid ?? 0)}</p>
                </div>
                <div className="bg-red-50 dark:bg-red-500/10 rounded-2xl p-3 text-center">
                  <p className="text-[9px] font-black text-red-500 uppercase tracking-widest">Balance</p>
                  <p className="text-sm font-black text-red-600 dark:text-red-400 mt-0.5">{formatCurrency(Math.max(0, (payingPO.totalAmount ?? 0) - (payingPO.paid ?? 0)))}</p>
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
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Withdraw From Account *</label>
                <select
                  value={selectedAccountId}
                  onChange={(e) => setSelectedAccountId(e.target.value)}
                  className="w-full px-5 py-4 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl font-bold text-sm outline-none focus:ring-4 ring-orange-500/10 appearance-none"
                >
                  {accounts.map(acc => (
                    <option key={acc.id} value={acc.id}>{acc.name} (₹{(acc.balance || 0).toLocaleString()})</option>
                  ))}
                </select>
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
        </div>,
        document.body
      )}

      {viewingPO && <GSTInvoice order={viewingPO} vendor={viewingPO.vendor} companyDetails={currentCompany} onClose={() => setViewingPO(null)} />}

      {showSettings && mounted && createPortal(
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md">
          <div className="bg-white dark:bg-[#0f1117] w-full max-w-lg rounded-[2.5rem] shadow-2xl border border-slate-100 dark:border-white/5 overflow-hidden">
            <div className="p-8">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-indigo-500 flex items-center justify-center shadow-lg shadow-indigo-500/20">
                    <Settings size={22} className="text-white" />
                  </div>
                  <div>
                    <h2 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight">Company Profile</h2>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-0.5">Required for GST Invoices</p>
                  </div>
                </div>
                <button onClick={() => { setShowSettings(false); setProfileRequiredForInvoice(false); setProfileErrors({}); }} className="p-2 rounded-xl bg-slate-100 dark:bg-white/5 text-slate-400"><X size={18} /></button>
              </div>

              {profileRequiredForInvoice && !profileErrors._api && (
                <div className="mb-4 p-3 bg-amber-50 border border-amber-300 rounded-xl text-xs text-amber-800 font-semibold">
                  Complete your company profile to generate GST Invoices. Fields marked * are required.
                </div>
              )}

              {profileErrors._api && (
                <div className="mb-4 p-3 bg-red-50 border border-red-300 rounded-xl text-xs text-red-700 font-semibold">
                  {profileErrors._api}
                </div>
              )}

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">
                      Company Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={editingProfile.name}
                      placeholder="My Restaurant"
                      onChange={(e) => { setEditingProfile({ ...editingProfile, name: e.target.value }); setProfileErrors({ ...profileErrors, name: "" }); }}
                      className={clsx("w-full h-11 bg-slate-50 dark:bg-white/5 px-4 rounded-xl font-bold text-xs border", profileErrors.name ? "border-red-400 focus:ring-red-200" : "border-slate-200 dark:border-white/10")}
                    />
                    {profileErrors.name && <p className="text-[10px] text-red-500 ml-1 mt-0.5">{profileErrors.name}</p>}
                  </div>

                  <div className="space-y-1">
                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">
                      GSTIN <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={editingProfile.gstin}
                      placeholder="22AAAAA0000A1Z5"
                      maxLength={15}
                      onChange={(e) => { setEditingProfile({ ...editingProfile, gstin: e.target.value.toUpperCase() }); setProfileErrors({ ...profileErrors, gstin: "" }); }}
                      className={clsx("w-full h-11 bg-slate-50 dark:bg-white/5 px-4 rounded-xl font-bold text-xs border font-mono tracking-widest", profileErrors.gstin ? "border-red-400" : "border-slate-200 dark:border-white/10")}
                    />
                    {profileErrors.gstin && <p className="text-[10px] text-red-500 ml-1 mt-0.5">{profileErrors.gstin}</p>}
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">
                    Address <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    value={editingProfile.address}
                    placeholder="Full registered address..."
                    onChange={(e) => { setEditingProfile({ ...editingProfile, address: e.target.value }); setProfileErrors({ ...profileErrors, address: "" }); }}
                    className={clsx("w-full h-20 bg-slate-50 dark:bg-white/5 p-4 rounded-xl font-bold text-xs border resize-none", profileErrors.address ? "border-red-400" : "border-slate-200 dark:border-white/10")}
                  />
                  {profileErrors.address && <p className="text-[10px] text-red-500 ml-1 mt-0.5">{profileErrors.address}</p>}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">
                      Phone <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={editingProfile.phone}
                      placeholder="10-digit mobile"
                      maxLength={10}
                      onChange={(e) => { const v = e.target.value.replace(/\D/g, "").slice(0, 10); setEditingProfile({ ...editingProfile, phone: v }); setProfileErrors({ ...profileErrors, phone: "" }); }}
                      className={clsx("w-full h-11 bg-slate-50 dark:bg-white/5 px-4 rounded-xl font-bold text-xs border", profileErrors.phone ? "border-red-400" : "border-slate-200 dark:border-white/10")}
                    />
                    {profileErrors.phone && <p className="text-[10px] text-red-500 ml-1 mt-0.5">{profileErrors.phone}</p>}
                  </div>

                  <div className="space-y-1">
                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Email</label>
                    <input
                      type="email"
                      value={editingProfile.email}
                      placeholder="optional@company.com"
                      onChange={(e) => { setEditingProfile({ ...editingProfile, email: e.target.value }); setProfileErrors({ ...profileErrors, email: "" }); }}
                      className={clsx("w-full h-11 bg-slate-50 dark:bg-white/5 px-4 rounded-xl font-bold text-xs border", profileErrors.email ? "border-red-400" : "border-slate-200 dark:border-white/10")}
                    />
                    {profileErrors.email && <p className="text-[10px] text-red-500 ml-1 mt-0.5">{profileErrors.email}</p>}
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">
                    State <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={editingProfile.state}
                    placeholder="Tamil Nadu"
                    onChange={(e) => { setEditingProfile({ ...editingProfile, state: e.target.value }); setProfileErrors({ ...profileErrors, state: "" }); }}
                    className={clsx("w-full h-11 bg-slate-50 dark:bg-white/5 px-4 rounded-xl font-bold text-xs border", profileErrors.state ? "border-red-400" : "border-slate-200 dark:border-white/10")}
                  />
                  {profileErrors.state && <p className="text-[10px] text-red-500 ml-1 mt-0.5">{profileErrors.state}</p>}
                </div>
              </div>

              <div className="mt-8 flex gap-3">
                <button onClick={() => { setShowSettings(false); setProfileRequiredForInvoice(false); setProfileErrors({}); }} className="flex-1 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Cancel</button>
                <button
                  onClick={handleSaveProfile}
                  disabled={profileSaving}
                  className="flex-[2] py-4 bg-indigo-500 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl shadow-indigo-500/20 disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {profileSaving ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </div>
          </div>
        </div>,
        document.body
      )}
      {viewingDetailsPO && mounted && createPortal(
        <div className="fixed inset-0 z-[10000] flex items-center justify-end bg-black/60 backdrop-blur-sm">
          <div className="absolute inset-0" onClick={() => setViewingDetailsPO(null)} />
          <div className="bg-white dark:bg-[#0f1117] w-full max-w-2xl h-full shadow-2xl relative flex flex-col animate-in slide-in-from-right duration-500">
            {/* Header */}
            <div className="p-8 border-b border-gray-100 dark:border-white/5">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-orange-500 flex items-center justify-center text-white shadow-lg shadow-orange-500/20">
                    <ShoppingCart size={22} />
                  </div>
                  <div>
                    <h2 className="text-xl font-black text-gray-900 dark:text-white uppercase tracking-tight">PO-{viewingDetailsPO.poNumber?.split('-').pop() || viewingDetailsPO.id.slice(0, 8).toUpperCase()}</h2>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-0.5">{viewingDetailsPO.vendor?.name}</p>
                  </div>
                </div>
                <button onClick={() => setViewingDetailsPO(null)} className="p-2 hover:bg-slate-100 dark:hover:bg-white/5 rounded-full transition-all">
                  <X size={20} className="text-slate-400" />
                </button>
              </div>

              <div className="flex gap-4">
                {["OVERVIEW", "ITEMS", "GRN", "AUDIT"].map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setPoDetailsTab(tab as any)}
                    className={clsx(
                      "text-[10px] font-black uppercase tracking-[0.2em] pb-2 border-b-2 transition-all",
                      poDetailsTab === tab ? "border-orange-500 text-orange-600" : "border-transparent text-slate-400 hover:text-slate-600"
                    )}
                  >
                    {tab}
                  </button>
                ))}
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-8 space-y-8 custom-scrollbar">
              {poDetailsTab === "OVERVIEW" && (
                <div className="space-y-8">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-slate-50 dark:bg-white/5 p-5 rounded-3xl">
                      <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Current Status</p>
                      <span className={clsx("inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider", STATUS_STYLES[viewingDetailsPO.status] || STATUS_STYLES.DRAFT)}>
                        {viewingDetailsPO.status.replace(/_/g, ' ')}
                      </span>
                    </div>
                    <div className="bg-slate-50 dark:bg-white/5 p-5 rounded-3xl">
                      <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Grand Total</p>
                      <p className="text-xl font-black text-orange-600">{formatCurrency(viewingDetailsPO.totalAmount)}</p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h3 className="text-[11px] font-black text-gray-900 dark:text-white uppercase tracking-widest px-1">Order Intelligence</h3>
                    <div className="grid grid-cols-1 gap-3">
                      <div className="bg-slate-50 dark:bg-white/5 p-5 rounded-3xl border border-slate-100 dark:border-white/5">
                        <p className="text-[9px] font-black text-indigo-500 uppercase tracking-widest mb-2">Internal Workflow Notes</p>
                        <p className="text-xs font-bold text-slate-600 dark:text-slate-400 italic">
                          {viewingDetailsPO.internalNotes || "No internal notes recorded for this workflow."}
                        </p>
                      </div>
                      <div className="bg-slate-50 dark:bg-white/5 p-5 rounded-3xl border border-slate-100 dark:border-white/5">
                        <p className="text-[9px] font-black text-orange-500 uppercase tracking-widest mb-2">Vendor Communication</p>
                        <p className="text-xs font-bold text-slate-600 dark:text-slate-400 italic">
                          {viewingDetailsPO.vendorNotes || "No specific notes for the vendor."}
                        </p>
                      </div>
                      <div className="bg-slate-50 dark:bg-white/5 p-5 rounded-3xl border border-slate-100 dark:border-white/5">
                        <p className="text-[9px] font-black text-emerald-500 uppercase tracking-widest mb-2">Delivery Instructions</p>
                        <p className="text-xs font-bold text-slate-600 dark:text-slate-400 italic">
                          {viewingDetailsPO.deliveryInstructions || "Standard delivery protocol applies."}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {poDetailsTab === "ITEMS" && (
                <div className="space-y-4">
                  {viewingDetailsPO.poItems?.map((item: any, idx: number) => (
                    <div key={idx} className="bg-slate-50 dark:bg-white/5 p-5 rounded-3xl border border-slate-100 dark:border-white/5 flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-2xl bg-white dark:bg-card flex items-center justify-center text-orange-500 shadow-sm"><Store size={18} /></div>
                        <div>
                          <p className="text-sm font-black text-gray-900 dark:text-white uppercase">{item.inventoryItem?.name}</p>
                          <p className="text-[10px] text-gray-400 mt-0.5">{item.quantity} {item.inventoryItem?.unit} @ {formatCurrency(item.price)}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-black text-gray-900 dark:text-white">{formatCurrency(item.quantity * item.price)}</p>
                        <p className="text-[10px] text-emerald-500 font-bold uppercase mt-0.5">{item.gstRate}% GST</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {poDetailsTab === "AUDIT" && (
                <div className="space-y-6">
                  <div className="relative pl-8 border-l-2 border-slate-100 dark:border-white/5 ml-2 space-y-8">
                    <div className="relative">
                      <div className="absolute -left-[41px] top-0 w-4 h-4 rounded-full bg-emerald-500 shadow-lg shadow-emerald-500/20" />
                      <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest mb-1">PO Created</p>
                      <p className="text-xs font-bold text-gray-900 dark:text-white">{format(new Date(viewingDetailsPO.createdAt), "dd MMM yyyy · HH:mm")}</p>
                      <p className="text-[10px] text-gray-400 mt-1 uppercase">System Entry</p>
                    </div>
                    {viewingDetailsPO.approvedAt && (
                      <div className="relative">
                        <div className="absolute -left-[41px] top-0 w-4 h-4 rounded-full bg-indigo-500 shadow-lg shadow-indigo-500/20" />
                        <p className="text-[10px] font-black text-indigo-600 uppercase tracking-widest mb-1">Approved</p>
                        <p className="text-xs font-bold text-gray-900 dark:text-white">{format(new Date(viewingDetailsPO.approvedAt), "dd MMM yyyy · HH:mm")}</p>
                        <p className="text-[10px] text-gray-400 mt-1 uppercase">By: {viewingDetailsPO.approvedBy || 'Admin'}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="p-8 border-t border-gray-100 dark:border-white/5 flex gap-4">
              {viewingDetailsPO.status === 'PENDING_APPROVAL' && (
                <button onClick={() => { handleApprove(viewingDetailsPO.id); setViewingDetailsPO(null); }} className="flex-1 py-4 bg-emerald-500 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl shadow-emerald-500/20">Approve PO</button>
              )}
              {viewingDetailsPO.status === 'APPROVED' && (
                <button onClick={async () => { await purchaseOrdersApi.updateStatus(viewingDetailsPO.id, 'SENT'); fetchAll(); setViewingDetailsPO(null); }} className="flex-1 py-4 bg-blue-500 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl shadow-blue-500/20">Send to Vendor</button>
              )}
              <button onClick={() => { setViewingPO(viewingDetailsPO); setViewingDetailsPO(null); }} className="flex-1 py-4 bg-slate-100 dark:bg-white/5 text-slate-600 rounded-2xl text-[10px] font-black uppercase tracking-widest">Download PDF</button>
            </div>
          </div>
        </div>,
        document.body
      )}
      <AddMaterialDrawer
        isOpen={showAddMaterialDrawer}
        onClose={() => setShowAddMaterialDrawer(false)}
        onSuccess={() => {
          fetchAll(); // Refresh material list
          setShowAddMaterialDrawer(false);
        }}
      />
    </div>
  );
}

