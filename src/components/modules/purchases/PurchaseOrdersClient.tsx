"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import { createPortal } from "react-dom";
import {
  ShoppingCart, Plus, Search, Filter, Calendar as CalendarIcon,
  ChevronDown, Store, Clock, CheckCircle2, XCircle, AlertCircle,
  Trash2, Wallet, RefreshCw, ChevronLeft, ChevronRight, Download, X, Settings
} from "lucide-react";
import Link from "next/link";
import { format, addMonths, subMonths, startOfMonth, endOfMonth, startOfWeek, endOfWeek, addDays, isSameMonth, isSameDay, isToday, startOfDay, isBefore } from "date-fns";
import { vendorsApi, purchaseOrdersApi, rawMaterialsApi, settingsApi, accountsApi } from "../../../lib/api";
import { clsx } from "clsx";
import GSTInvoice from "../../documents/GSTInvoice";
import api from "../../../lib/api";
import AddMaterialDrawer from "../inventory/AddMaterialDrawer";
import RecordPaymentModal from "./RecordPaymentModal";
import { toast } from "react-hot-toast";

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
  const [showAdvancedLogistics, setShowAdvancedLogistics] = useState(false);
  const [materialSearchQueries, setMaterialSearchQueries] = useState<string[]>([""]);
  const [activeMaterialDropdown, setActiveMaterialDropdown] = useState<number | null>(null);

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

  const addItem = () => {
    setItems((prev) => [...prev, { inventoryItemId: "", itemName: "", unit: "kg", quantity: 0, price: 0, hsnCode: "", gstRate: 5 }]);
    setMaterialSearchQueries(prev => [...prev, ""]);
  };

  const removeItem = (i: number) => {
    setItems((prev) => prev.filter((_, idx) => idx !== i));
    setMaterialSearchQueries(prev => prev.filter((_, idx) => idx !== i));
  };

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

  const handleCreate = async (status: string = "APPROVED") => {
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
      setMaterialSearchQueries([""]);
      fetchAll();
    } catch (e: any) {
      toast.error(e?.response?.data?.error || "Failed to create Purchase Order.");
    } finally { setSaving(false); }
  };

  const handleApplyAdvance = async (id: string) => {
    try {
      await purchaseOrdersApi.applyAdvance(id);
      fetchAll();
    } catch (e: any) {
      toast.error(e?.response?.data?.error || "Failed to apply advance.");
    }
  };

  const handleCancel = async (id: string) => {
    if (!confirm("Cancel this purchase order?")) return;
    try {
      await purchaseOrdersApi.cancel(id);
      fetchAll();
    } catch (e: any) {
      toast.error(e?.response?.data?.error ?? "Failed to cancel PO");
    }
  };

  const handleApprove = async (id: string) => {
    if (!confirm("Approve this purchase order?")) return;
    try {
      await api.patch(`/api/purchase-orders/${id}/approve`);
      fetchAll();
    } catch (e: any) {
      toast.error(e?.response?.data?.error ?? "Failed to approve PO");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this purchase order?")) return;
    try {
      await purchaseOrdersApi.delete(id);
      fetchAll();
    } catch (e: any) {
      toast.error(e?.response?.data?.error ?? "Failed to delete PO");
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
                      <div className="flex flex-col gap-1">
                        <p className="text-xs font-black text-gray-900 dark:text-white">{formatCurrency(po.totalAmount)}</p>
                        <div className="flex flex-col gap-1 w-24">
                          <div className="flex justify-between items-center text-[8px] font-black text-slate-400 uppercase tracking-widest">
                            <span>Fulfillment</span>
                            <span>{Math.round((po.receivedItemsCount || 0) / (po.totalItemsCount || 1) * 100)}%</span>
                          </div>
                          <div className="w-full h-1 bg-slate-100 dark:bg-white/5 rounded-full overflow-hidden">
                            <div 
                              className={clsx(
                                "h-full transition-all duration-500",
                                po.status === 'RECEIVED' ? "bg-emerald-500" : "bg-orange-500"
                              )} 
                              style={{ width: `${Math.min(100, (po.receivedItemsCount || 0) / (po.totalItemsCount || 1) * 100)}%` }}
                            />
                          </div>
                          <p className="text-[7px] font-bold text-slate-400 uppercase">
                            {po.receivedItemsCount || 0} / {po.totalItemsCount || 0} units
                          </p>
                        </div>
                      </div>
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
                      <div className="flex items-center justify-end gap-1 transition-opacity">
                        {/* Workflow simplified: removed Submit/Approve/Reject actions */}


                        {(po.status === 'APPROVED' || po.status === 'SENT' || po.status === 'PARTIALLY_RECEIVED') && (
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
        <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="absolute inset-0" onClick={() => setShowForm(false)} />
          <div className="bg-white dark:bg-[#0f1117] w-full max-w-5xl max-h-[95vh] rounded-[3rem] shadow-2xl relative overflow-hidden flex flex-col animate-in zoom-in-95 duration-300">
            {/* Modal Header (Sticky-like) */}
            <div className="flex items-center justify-between px-8 py-6 border-b border-slate-100 dark:border-white/5">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-orange-500 shadow-lg shadow-orange-500/20 flex items-center justify-center text-white">
                  <ShoppingCart size={24} />
                </div>
                <div>
                  <h2 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight leading-none">New Purchase Order</h2>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Purchase Management</p>
                </div>
              </div>
              <button onClick={() => setShowForm(false)} className="w-10 h-10 rounded-xl hover:bg-slate-100 dark:hover:bg-white/5 flex items-center justify-center text-slate-400 transition-colors">
                <X size={20} />
              </button>
            </div>

            {/* Modal Body (Scrollable) */}
            <div className="flex-1 overflow-y-auto px-8 py-6 space-y-8 custom-scrollbar">
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
                  <div className="flex items-center gap-4">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Order Items</p>
                    <button 
                      type="button"
                      onClick={() => setShowAddMaterialDrawer(true)}
                      className="text-[10px] font-black text-orange-500 hover:text-orange-600 uppercase tracking-widest flex items-center gap-1 transition-all"
                    >
                      <Plus size={10} /> Add New Material
                    </button>
                  </div>
                  <button
                    type="button"
                    onClick={addItem}
                    className="text-[10px] font-black text-white bg-orange-500 px-4 py-2 rounded-xl uppercase tracking-widest flex items-center gap-2 hover:bg-orange-600 transition-all shadow-lg shadow-orange-500/20"
                  >
                    <Plus size={14} /> Add Row
                  </button>
                </div>

                {/* Items Table Header */}
                <div className="hidden md:grid grid-cols-12 gap-5 px-8 mb-2">
                  <div className="col-span-5 text-[9px] font-black text-slate-400 uppercase tracking-[0.2em]">Material Description</div>
                  <div className="col-span-2 text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] text-center">Quantity</div>
                  <div className="col-span-2 text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] text-center">Unit Price (₹)</div>
                  <div className="col-span-2 text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] text-right pr-4">Subtotal (₹)</div>
                  <div className="col-span-1"></div>
                </div>

                <div className="space-y-3 pb-40">
                  {items.map((it, idx) => (
                    <div key={idx} className="bg-white dark:bg-white/5 p-4 rounded-[2rem] border border-slate-100 dark:border-white/5 grid grid-cols-1 md:grid-cols-12 gap-5 items-center relative transition-all hover:shadow-xl hover:shadow-slate-200/20 dark:hover:shadow-none">
                      <div className="md:col-span-5 relative">
                        <div className="relative group">
                          <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
                            <Search size={14} className="text-slate-400 group-focus-within:text-orange-500 transition-colors" />
                          </div>
                          <input
                            type="text"
                            placeholder="Search materials..."
                            value={materialSearchQueries[idx] ?? it.itemName ?? ""}
                            onChange={(e) => {
                              const val = e.target.value;
                              const newQueries = [...materialSearchQueries];
                              newQueries[idx] = val;
                              setMaterialSearchQueries(newQueries);
                              setActiveMaterialDropdown(idx);
                              if (!val) updateItem(idx, "inventoryItemId", "");
                            }}
                            onFocus={() => {
                              setActiveMaterialDropdown(idx);
                              if (it.itemName && !materialSearchQueries[idx]) {
                                const newQueries = [...materialSearchQueries];
                                newQueries[idx] = it.itemName;
                                setMaterialSearchQueries(newQueries);
                              }
                            }}
                            className="w-full h-12 bg-slate-50 dark:bg-black/20 pl-11 pr-4 rounded-2xl font-bold text-xs outline-none border-2 border-transparent focus:border-orange-500/50 focus:bg-white dark:focus:bg-black/40 transition-all shadow-inner"
                          />
                          
                          {activeMaterialDropdown === idx && (materialSearchQueries[idx] || "").length > 0 && (
                            <div className="absolute top-full left-0 right-0 z-[500] mt-2 bg-white dark:bg-[#1a1c23] border border-slate-200 dark:border-white/10 rounded-[1.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.15)] overflow-hidden max-h-72 overflow-y-auto animate-in fade-in slide-in-from-top-2 duration-200">
                              <div className="p-2 border-b border-slate-50 dark:border-white/5 bg-slate-50/50 dark:bg-white/5">
                                <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest px-2">Suggestions</p>
                              </div>
                              {materials.filter(m => m.name.toLowerCase().includes(materialSearchQueries[idx].toLowerCase())).length === 0 ? (
                                <div className="p-8 text-center">
                                  <AlertCircle className="w-8 h-8 text-slate-200 dark:text-slate-800 mx-auto mb-2" />
                                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">No materials found</p>
                                </div>
                              ) : (
                                materials.filter(m => m.name.toLowerCase().includes(materialSearchQueries[idx].toLowerCase())).map(m => (
                                  <button
                                    key={m.id}
                                    type="button"
                                    onClick={() => {
                                      updateItem(idx, "inventoryItemId", m.id);
                                      const newQueries = [...materialSearchQueries];
                                      newQueries[idx] = m.name;
                                      setMaterialSearchQueries(newQueries);
                                      setActiveMaterialDropdown(null);
                                    }}
                                    className="w-full text-left px-4 py-3 hover:bg-orange-50 dark:hover:bg-orange-500/10 border-b border-slate-50 dark:border-white/5 last:border-none transition-colors group/item"
                                  >
                                    <div className="flex justify-between items-center mb-0.5">
                                      <span className="text-xs font-black text-slate-900 dark:text-white uppercase group-hover/item:text-orange-600">{m.name}</span>
                                      <span className="text-[10px] font-bold text-slate-400">{m.unit}</span>
                                    </div>
                                    <div className="flex items-center gap-3">
                                      <span className={clsx("text-[9px] font-bold px-1.5 py-0.5 rounded-md", (m.currentStock || 0) <= (m.minimumStock || 0) ? "bg-red-50 text-red-500" : "bg-emerald-50 text-emerald-600")}>
                                        Stock: {m.currentStock || 0}
                                      </span>
                                      <span className="text-[9px] font-bold text-slate-400 uppercase">Min: {m.minimumStock || 0}</span>
                                    </div>
                                  </button>
                                ))
                              )}
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="md:col-span-2">
                        <input
                          type="number"
                          value={it.quantity || ""}
                          onChange={(e) => updateItem(idx, "quantity", Number(e.target.value))}
                          className="w-full h-12 bg-slate-50 dark:bg-black/20 px-4 rounded-2xl font-black text-sm outline-none border-2 border-transparent focus:border-orange-500/50 transition-all text-center"
                          placeholder="0"
                        />
                      </div>
                      <div className="md:col-span-2">
                        <input
                          type="number"
                          value={it.price || ""}
                          onChange={(e) => updateItem(idx, "price", Number(e.target.value))}
                          className="w-full h-12 bg-slate-50 dark:bg-black/20 px-4 rounded-2xl font-black text-sm outline-none border-2 border-transparent focus:border-orange-500/50 transition-all text-center"
                          placeholder="0.00"
                        />
                      </div>
                      <div className="md:col-span-2">
                        <div className="h-12 flex items-center justify-end px-4 bg-orange-500/5 rounded-2xl font-black text-sm text-orange-600 tracking-tight">
                          ₹{(it.quantity * it.price).toLocaleString()}
                        </div>
                      </div>
                      <div className="md:col-span-1 flex justify-center">
                        <button
                          type="button"
                          onClick={() => removeItem(idx)}
                          className="h-10 w-10 flex items-center justify-center text-slate-300 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-xl transition-all"
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
                  <button 
                    type="button" 
                    onClick={() => setShowAdvancedLogistics(!showAdvancedLogistics)}
                    className="flex items-center gap-2 text-[10px] font-black text-indigo-600 uppercase tracking-[0.2em] bg-indigo-50 dark:bg-indigo-500/10 px-4 py-2.5 rounded-xl hover:bg-indigo-100 transition-all mb-2"
                  >
                    <Settings size={14} /> {showAdvancedLogistics ? "Hide Logistics & Notes" : "Add Freight, Unloading & Notes"}
                  </button>

                  {showAdvancedLogistics && (
                    <>
                      <div className="grid grid-cols-2 gap-4 animate-in fade-in slide-in-from-top-2 duration-300">
                        <div className="space-y-2">
                          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Freight Cost (₹)</label>
                          <input
                            type="number"
                            value={freightCost || ""}
                            onChange={(e) => setFreightCost(Number(e.target.value))}
                            className="w-full h-11 bg-white dark:bg-card px-4 rounded-xl font-bold text-xs outline-none border border-slate-200 dark:border-white/10 focus:border-indigo-500 transition-all"
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Unloading Cost (₹)</label>
                          <input
                            type="number"
                            value={unloadingCost || ""}
                            onChange={(e) => setUnloadingCost(Number(e.target.value))}
                            className="w-full h-11 bg-white dark:bg-card px-4 rounded-xl font-bold text-xs outline-none border border-slate-200 dark:border-white/10 focus:border-indigo-500 transition-all"
                          />
                        </div>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 animate-in fade-in slide-in-from-top-4 duration-500">
                        <div className="space-y-1.5">
                          <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Internal Notes</label>
                          <textarea value={internalNotes} onChange={e => setInternalNotes(e.target.value)} placeholder="Staff eyes only..." className="w-full h-24 bg-slate-50 dark:bg-white/5 p-3 rounded-2xl text-xs font-bold border border-slate-100 dark:border-white/5 resize-none outline-none focus:border-indigo-500 transition-all" />
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Vendor Notes</label>
                          <textarea value={vendorNotes} onChange={e => setVendorNotes(e.target.value)} placeholder="Print on PO..." className="w-full h-24 bg-slate-50 dark:bg-white/5 p-3 rounded-2xl text-xs font-bold border border-slate-100 dark:border-white/5 resize-none outline-none focus:border-indigo-500 transition-all" />
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Delivery Info</label>
                          <textarea value={deliveryInstructions} onChange={e => setDeliveryInstructions(e.target.value)} placeholder="Warehouse instructions..." className="w-full h-24 bg-slate-50 dark:bg-white/5 p-3 rounded-2xl text-xs font-bold border border-slate-100 dark:border-white/5 resize-none outline-none focus:border-indigo-500 transition-all" />
                        </div>
                      </div>
                    </>
                  )}
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
                </div>
              </div>
            </div>

            {/* Modal Footer (Actions) */}
            <div className="px-8 py-6 border-t border-slate-100 dark:border-white/5 bg-slate-50/50 dark:bg-white/[0.02] flex gap-4">
              <button
                onClick={() => setShowForm(false)}
                className="flex-1 h-14 rounded-2xl font-black text-xs uppercase tracking-widest text-slate-500 hover:bg-slate-100 dark:hover:bg-white/5 transition-all"
              >
                Abort
              </button>
              <button
                onClick={() => handleCreate("APPROVED")}
                disabled={saving || !vendorId || items.some(it => !it.inventoryItemId || it.quantity <= 0)}
                className="flex-[2] h-14 bg-orange-500 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:opacity-90 disabled:opacity-50 transition-all shadow-xl shadow-orange-500/20"
              >
                {saving ? "Processing..." : "Save Purchase Order"}
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}

      <RecordPaymentModal
        isOpen={showPaymentModal}
        onClose={() => { setShowPaymentModal(false); setPayingPO(null); }}
        onSuccess={fetchAll}
        payingPO={payingPO}
        accounts={accounts}
        defaultAccountId={selectedAccountId}
      />

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
                      placeholder="Enter company email..."
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
              {/* Workflow simplified: removed Approve button from details */}


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

