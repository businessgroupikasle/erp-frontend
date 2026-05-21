"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import {
  Receipt, Plus, Search, RefreshCw, X, User,
  Printer, ChevronDown, Trash2, Check, Share2, Calendar,
  AlignLeft, Image as ImageIcon, FileText, ArrowLeft
} from "lucide-react";
import { clsx } from "clsx";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { customersApi, productsFullApi, draftsApi } from "@/lib/api";
import { useToast } from "@/context/ToastContext";
import api from "@/lib/api/base";

// ── Constants ────────────────────────────────────────────────────────────────

const UNITS = [
  { label: "None",              short: "None",  code: "NONE" },
  { label: "Bags (Bag)",       short: "Bag",   code: "BAG" },
  { label: "Bottles (Btl)",    short: "Btl",   code: "BTL" },
  { label: "Box (Box)",        short: "Box",   code: "BOX" },
  { label: "Bundles (Bdl)",    short: "Bdl",   code: "BDL" },
  { label: "Carats (Ct)",      short: "Ct",    code: "CT" },
  { label: "Cms",              short: "Cms",   code: "CMS" },
  { label: "Dozens (Dzn)",     short: "Dzn",   code: "DZN" },
  { label: "Grams (Grm)",      short: "Grm",   code: "GRM" },
  { label: "Kilograms (Kgs)",  short: "Kgs",   code: "KGS" },
  { label: "Liters (Ltr)",     short: "Ltr",   code: "LTR" },
  { label: "Meters (Mtr)",     short: "Mtr",   code: "MTR" },
  { label: "Numbers (Nos)",    short: "Nos",   code: "NOS" },
  { label: "Packs (Pkt)",      short: "Pkt",   code: "PKT" },
  { label: "Pieces (Pcs)",     short: "Pcs",   code: "PCS" },
  { label: "Rolls",            short: "Roll",  code: "ROLL" },
  { label: "Square Feet (Sqf)",short: "Sqf",   code: "SQF" },
  { label: "Tons (Tne)",       short: "Tne",   code: "TNE" },
  { label: "Units (Unt)",      short: "Unt",   code: "UNT" },
];

const TAX_OPTIONS = [
  { label: "NONE", value: 0 },
  { label: "IGST@0%", value: 0 },
  { label: "GST@0%", value: 0 },
  { label: "IGST@0.25%", value: 0.25 },
  { label: "GST@0.25%", value: 0.25 },
  { label: "IGST@3%", value: 3 },
  { label: "GST@3%", value: 3 },
  { label: "IGST@5%", value: 5 },
  { label: "GST@5%", value: 5 },
  { label: "IGST@12%", value: 12 },
  { label: "GST@12%", value: 12 },
  { label: "IGST@18%", value: 18 },
  { label: "GST@18%", value: 18 },
  { label: "IGST@28%", value: 28 },
  { label: "GST@28%", value: 28 },
];

const INDIAN_STATES = [
  "Andhra Pradesh","Arunachal Pradesh","Assam","Bihar","Chhattisgarh",
  "Goa","Gujarat","Haryana","Himachal Pradesh","Jharkhand","Karnataka",
  "Kerala","Madhya Pradesh","Maharashtra","Manipur","Meghalaya","Mizoram",
  "Nagaland","Odisha","Punjab","Rajasthan","Sikkim","Tamil Nadu","Telangana",
  "Tripura","Uttar Pradesh","Uttarakhand","West Bengal","Delhi",
  "Jammu & Kashmir","Ladakh",
];

const STATUS_STYLES: Record<string, { label: string; color: string; bg: string; border: string }> = {
  DRAFT:    { label: "Draft",    color: "text-slate-600",   bg: "bg-slate-50",   border: "border-slate-200" },
  SENT:     { label: "Sent",     color: "text-blue-600",    bg: "bg-blue-50",    border: "border-blue-200" },
  PAID:     { label: "Paid",     color: "text-emerald-600", bg: "bg-emerald-50", border: "border-emerald-200" },
  PARTIAL:  { label: "Partial",  color: "text-amber-600",   bg: "bg-amber-50",   border: "border-amber-200" },
  OVERDUE:  { label: "Overdue",  color: "text-rose-600",    bg: "bg-rose-50",    border: "border-rose-200" },
  CANCELLED:{ label: "Cancelled",color: "text-slate-400",   bg: "bg-slate-100",  border: "border-slate-200" },
};

// ── Types ─────────────────────────────────────────────────────────────────────

interface LineItem {
  id: string;
  productId: string;
  itemSearch: string;
  qty: number;
  unit: string;
  rate: number;
  discountPct: number;
  taxPct: number;
  taxLabel?: string;
}

function makeItem(): LineItem {
  return {
    id: Math.random().toString(36).slice(2),
    productId: "",
    itemSearch: "",
    qty: 1,
    unit: "NONE",
    rate: 0,
    discountPct: 0,
    taxPct: 0,
    taxLabel: "NONE",
  };
}

function computeRow(item: LineItem, withTax: boolean) {
  const gross = item.qty * item.rate;
  const discAmt = parseFloat((gross * item.discountPct / 100).toFixed(2));
  if (withTax) {
    const netAmt = gross - discAmt;
    const taxAmt = parseFloat((netAmt * item.taxPct / (100 + item.taxPct)).toFixed(2));
    return { discAmt, taxAmt, amount: parseFloat(netAmt.toFixed(2)) };
  }
  const taxable = gross - discAmt;
  const taxAmt = parseFloat((taxable * item.taxPct / 100).toFixed(2));
  return { discAmt, taxAmt, amount: parseFloat((taxable + taxAmt).toFixed(2)) };
}

// ── MiniCalendar ──────────────────────────────────────────────────────────────
const MONTH_NAMES = ["January","February","March","April","May","June",
  "July","August","September","October","November","December"];
const DAY_NAMES = ["Su","Mo","Tu","We","Th","Fr","Sa"];

function MiniCalendar({ value, onChange, onClose }: {
  value: string;
  onChange: (v: string) => void;
  onClose: () => void;
}) {
  const today = new Date();
  const selected = value ? new Date(value + "T00:00:00") : today;
  const [viewYear, setViewYear] = useState(selected.getFullYear());
  const [viewMonth, setViewMonth] = useState(selected.getMonth());

  const firstDay = new Date(viewYear, viewMonth, 1).getDay();
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
  const cells: (number | null)[] = [
    ...Array(firstDay).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];
  while (cells.length % 7 !== 0) cells.push(null);

  const prevMonth = () => { if (viewMonth === 0) { setViewMonth(11); setViewYear(y => y - 1); } else setViewMonth(m => m - 1); };
  const nextMonth = () => { if (viewMonth === 11) { setViewMonth(0); setViewYear(y => y + 1); } else setViewMonth(m => m + 1); };
  const isSelected = (d: number) => selected.getFullYear() === viewYear && selected.getMonth() === viewMonth && selected.getDate() === d;
  const isToday = (d: number) => today.getFullYear() === viewYear && today.getMonth() === viewMonth && today.getDate() === d;

  return (
    <div className="bg-white rounded-xl shadow-2xl border border-gray-200 p-3 w-64 select-none">
      {/* Header */}
      <div className="flex items-center justify-between mb-2">
        <button onClick={prevMonth} className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-gray-100 text-gray-500">
          <ChevronDown size={14} className="rotate-90" />
        </button>
        <span className="text-sm font-semibold text-gray-800">{MONTH_NAMES[viewMonth]} {viewYear}</span>
        <button onClick={nextMonth} className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-gray-100 text-gray-500">
          <ChevronDown size={14} className="-rotate-90" />
        </button>
      </div>
      {/* Day headers */}
      <div className="grid grid-cols-7 mb-1">
        {DAY_NAMES.map(d => (
          <div key={d} className="text-center text-[10px] font-semibold text-gray-400 py-0.5">{d}</div>
        ))}
      </div>
      {/* Day grid */}
      <div className="grid grid-cols-7 gap-y-0.5">
        {cells.map((d, i) => d === null ? (
          <div key={i} />
        ) : (
          <button
            key={i}
            onClick={() => {
              const iso = `${viewYear}-${String(viewMonth + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
              onChange(iso);
              onClose();
            }}
            className={clsx(
              "w-full aspect-square flex items-center justify-center text-xs rounded-lg font-medium transition-colors",
              isSelected(d) && "bg-orange-500 text-white",
              !isSelected(d) && isToday(d) && "bg-orange-100 text-orange-600",
              !isSelected(d) && !isToday(d) && "text-gray-700 hover:bg-gray-100"
            )}
          >{d}</button>
        ))}
      </div>
      {/* Footer */}
      <div className="mt-2 flex justify-between items-center border-t border-gray-100 pt-2">
        <button
          onClick={() => {
            const t = new Date();
            const iso = `${t.getFullYear()}-${String(t.getMonth() + 1).padStart(2, "0")}-${String(t.getDate()).padStart(2, "0")}`;
            onChange(iso);
            onClose();
          }}
          className="text-[11px] font-semibold text-orange-500 hover:text-orange-700"
        >Today</button>
        <button onClick={onClose} className="text-[11px] text-gray-400 hover:text-gray-600">Close</button>
      </div>
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────

export default function SalesInvoicesPage() {
  const { showToast } = useToast();
  const router = useRouter();
  const { user } = useAuth();
  const isFranchiseUser = user?.role?.toUpperCase() === "FRANCHISE_ADMIN";

  // shared
  const [view, setView] = useState<"list" | "create">("list");
  const [invoices, setInvoices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [customers, setCustomers] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);

  // list date filters
  const now = new Date();
  const firstOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split("T")[0];
  const lastOfMonth  = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().split("T")[0];
  const [dateFrom, setDateFrom] = useState(firstOfMonth);
  const [dateTo,   setDateTo]   = useState(lastOfMonth);
  const [showFromCal, setShowFromCal] = useState(false);
  const [showToCal, setShowToCal] = useState(false);
  const fromCalRef = useRef<HTMLDivElement>(null);
  const toCalRef = useRef<HTMLDivElement>(null);

  // Close calendar popups on outside click
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (fromCalRef.current && !fromCalRef.current.contains(e.target as Node)) setShowFromCal(false);
      if (toCalRef.current && !toCalRef.current.contains(e.target as Node)) setShowToCal(false);
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  // create form
  const [paymentType, setPaymentType] = useState<"CASH" | "CREDIT">("CASH");
  const [selectedCustomer, setSelectedCustomer] = useState<any>(null);
  const [customerSearch, setCustomerSearch] = useState("");
  const [showCustomerDrop, setShowCustomerDrop] = useState(false);
  const [customerPhone, setCustomerPhone] = useState("");
  const [invoiceDate, setInvoiceDate] = useState(new Date().toISOString().split("T")[0]);
  const [stateOfSupply, setStateOfSupply] = useState("");
  const [items, setItems] = useState<LineItem[]>([makeItem(), makeItem()]);
  const [priceMode, setPriceMode] = useState<"without_tax" | "with_tax">("without_tax");
  const [showPriceDrop, setShowPriceDrop] = useState(false);
  const [openItemDrop, setOpenItemDrop] = useState<string | null>(null);
  const [openUnitDrop, setOpenUnitDrop] = useState<string | null>(null);
  const [unitDropRect, setUnitDropRect] = useState<{ top: number; left: number } | null>(null);
  const [termsText, setTermsText] = useState("");
  const [showTerms, setShowTerms] = useState(false);
  const [description, setDescription] = useState("");
  const [showDesc, setShowDesc] = useState(false);
  const [roundOffEnabled, setRoundOffEnabled] = useState(true);
  const [showShareDrop, setShowShareDrop] = useState(false);
  const [saving, setSaving] = useState(false);
  const [draftId, setDraftId] = useState<string | null>(null);

  // Add Party modal state
  const [showAddParty, setShowAddParty] = useState(false);
  const [partyTab, setPartyTab] = useState<"GST" | "CREDIT">("GST");
  const [newParty, setNewParty] = useState({
    name: "", phone: "", email: "", gstin: "", gstType: "Unregistered/Consumer",
    state: "", city: "", pincode: "", billingAddress: "", shippingAddress: "", openingBalance: "", creditLimit: ""
  });
  const [savingParty, setSavingParty] = useState(false);
  const [fetchingGst, setFetchingGst] = useState(false);

  // Add Item modal state
  const [showAddItem, setShowAddItem] = useState(false);
  const [addingItemIdx, setAddingItemIdx] = useState<number | null>(null);
  const [newItem, setNewItem] = useState({
    name: "", sku: "", basePrice: "", taxPercent: 5, description: ""
  });
  const [savingItem, setSavingItem] = useState(false);

  // Item dropdown fixed position
  const [itemDropRect, setItemDropRect] = useState<{ top: number; left: number; width: number } | null>(null);

  // Custom calendar
  const [showCalendar, setShowCalendar] = useState(false);
  const calendarRef = useRef<HTMLDivElement>(null);

  const customerDropRef = useRef<HTMLDivElement>(null);
  const shareDropRef = useRef<HTMLDivElement>(null);
  const priceDropRef = useRef<HTMLDivElement>(null);

  const fetchGstDetails = async (gstin: string) => {
    const cleanGst = gstin.trim().toUpperCase();
    if (!/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/.test(cleanGst)) {
      return;
    }

    setFetchingGst(true);
    try {
      const res = await fetch(`/api/gst-verify/${cleanGst}`);
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || "Failed to fetch GST details");
      }
      
      const data = await res.json();
      if (data.success) {
        setNewParty((prev) => ({
          ...prev,
          name: data.legalName || prev.name,
          billingAddress: data.address || prev.billingAddress,
          state: data.state || prev.state,
          city: data.city || prev.city,
          pincode: data.pinCode || prev.pincode
        }));
        showToast(
          `Successfully auto-filled details for "${data.legalName}"${data.mocked ? " (Demo Mode)" : ""}`,
          "success"
        );
      }
    } catch (err: any) {
      console.error("Auto-fetch GST details failed:", err);
      showToast(err.message || "Could not auto-fetch GST details. Please enter manually.", "warning");
    } finally {
      setFetchingGst(false);
    }
  };

  const handleSaveItem = async () => {
    if (!newItem.name.trim()) {
      showToast("Item Name is required", "error");
      return;
    }
    const priceNum = Number(newItem.basePrice);
    if (isNaN(priceNum) || priceNum <= 0) {
      showToast("Please enter a valid Price/Unit", "error");
      return;
    }

    setSavingItem(true);
    try {
      const res = await productsFullApi.create({
        name: newItem.name.trim(),
        sku: newItem.sku.trim() || undefined,
        basePrice: priceNum,
        taxPercent: newItem.taxPercent,
        description: newItem.description.trim() || undefined,
      });
      const createdProd = (res as any).data;
      showToast("Item created successfully", "success");

      // Update local products list
      setProducts(prev => [...prev, createdProd].sort((a, b) => a.name.localeCompare(b.name)));

      // If we are currently editing a row, auto-select it!
      if (addingItemIdx !== null) {
        selectProduct(addingItemIdx, createdProd);
      }

      // Close modal & reset
      setShowAddItem(false);
      setNewItem({ name: "", sku: "", basePrice: "", taxPercent: 5, description: "" });
      setAddingItemIdx(null);
    } catch (e: any) {
      showToast(e?.response?.data?.error || "Failed to create item", "error");
    } finally {
      setSavingItem(false);
    }
  };

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [iRes, cRes, pRes, dRes] = await Promise.allSettled([
        api.get("/api/finance/invoices").catch(() => ({ data: [] })),
        customersApi.getAll(),
        productsFullApi.getAll(),
        draftsApi.getDrafts("invoice").catch(() => ({ data: [] })),
      ]);
      
      let apiInvoices = iRes.status === "fulfilled" ? (iRes.value as any).data || [] : [];
      let drafts = dRes.status === "fulfilled" ? (dRes.value as any).data || [] : [];
      
      // Format drafts to match invoice structure
      const formattedDrafts = drafts.map((d: any) => ({
        id: d.id,
        status: "DRAFT",
        createdAt: d.createdAt,
        finalAmount: d.data.finalTotal || 0,
        order: {
          invoiceNum: "DRAFT",
          customer: d.data._rawState?.selectedCustomer || { name: "Unknown Customer" },
          orderItems: d.data._rawState?.items?.map((i: any) => ({
            product: { name: i.itemSearch },
            quantity: i.qty,
            price: i.rate,
            taxAmount: (i.qty * i.rate * ((i.taxPct || 0) / 100)),
            totalAmount: (i.qty * i.rate) + (i.qty * i.rate * ((i.taxPct || 0) / 100)),
          })) || []
        },
        _rawState: d.data._rawState
      }));
      
      setInvoices([...formattedDrafts, ...apiInvoices]);
      if (cRes.status === "fulfilled") setCustomers((cRes.value as any).data || []);
      if (pRes.status === "fulfilled") setProducts((pRes.value as any).data || []);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (customerDropRef.current && !customerDropRef.current.contains(e.target as Node))
        setShowCustomerDrop(false);
      if (shareDropRef.current && !shareDropRef.current.contains(e.target as Node))
        setShowShareDrop(false);
      if (priceDropRef.current && !priceDropRef.current.contains(e.target as Node))
        setShowPriceDrop(false);
      if (calendarRef.current && !calendarRef.current.contains(e.target as Node))
        setShowCalendar(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // ── Computed totals ────────────────────────────────────────────────────────
  const withTax = priceMode === "with_tax";
  const rowData = items.map(item => ({ item, ...computeRow(item, withTax) }));
  const totalQty = items.reduce((s, i) => s + i.qty, 0);
  const totalDisc = parseFloat(rowData.reduce((s, r) => s + r.discAmt, 0).toFixed(2));
  const totalTax = parseFloat(rowData.reduce((s, r) => s + r.taxAmt, 0).toFixed(2));
  const totalAmount = parseFloat(rowData.reduce((s, r) => s + r.amount, 0).toFixed(2));
  const roundOff = roundOffEnabled ? parseFloat((Math.round(totalAmount) - totalAmount).toFixed(2)) : 0;
  const finalTotal = parseFloat((totalAmount + roundOff).toFixed(2));

  // ── Handlers ──────────────────────────────────────────────────────────────
  const openCreate = () => {
    setDraftId(null);
    setPaymentType("CASH");
    setSelectedCustomer(null);
    setCustomerSearch("");
    setCustomerPhone("");
    setInvoiceDate(new Date().toISOString().split("T")[0]);
    setStateOfSupply("");
    setItems([makeItem(), makeItem()]);
    setPriceMode("without_tax");
    setTermsText("");
    setShowTerms(false);
    setDescription("");
    setShowDesc(false);
    setRoundOffEnabled(true);
    setView("create");
  };

  const loadDraft = (draft: any) => {
    setDraftId(draft.id);
    const raw = draft._rawState || {};
    setPaymentType(raw.paymentType || "CASH");
    setSelectedCustomer(raw.selectedCustomer || null);
    setCustomerSearch(raw.customerSearch || "");
    setCustomerPhone(raw.customerPhone || "");
    setInvoiceDate(raw.invoiceDate || new Date().toISOString().split("T")[0]);
    setStateOfSupply(raw.stateOfSupply || "");
    setItems(raw.items && raw.items.length > 0 ? raw.items : [makeItem(), makeItem()]);
    setPriceMode(raw.priceMode || "without_tax");
    setTermsText(raw.termsText || "");
    setShowTerms(raw.showTerms || !!raw.termsText);
    setDescription(raw.description || "");
    setShowDesc(raw.showDesc || !!raw.description);
    setRoundOffEnabled(raw.roundOffEnabled ?? true);
    setView("create");
  };

  const selectCustomer = (c: any) => {
    setSelectedCustomer(c);
    setCustomerSearch(c.name);
    setCustomerPhone(c.phone || "");
    setShowCustomerDrop(false);
  };

  const selectProduct = (idx: number, p: any) => {
    setItems(prev => prev.map((it, i) =>
      i === idx ? {
        ...it,
        productId: p.id,
        itemSearch: p.name,
        rate: p.basePrice || p.price || 0,
        unit: p.unit || "NONE",
        taxPct: p.taxPercent || 0,
        taxLabel: TAX_OPTIONS.find(o => o.value === (p.taxPercent || 0))?.label || "NONE",
      } : it
    ));
    setOpenItemDrop(null);
  };

  const updateItem = (idx: number, field: keyof LineItem, value: any) => {
    setItems(prev => prev.map((it, i) => i === idx ? { ...it, [field]: value } : it));
  };

  const addRow = () => setItems(prev => [...prev, makeItem()]);

  const removeRow = (idx: number) => {
    if (items.length > 1) setItems(prev => prev.filter((_, i) => i !== idx));
  };

  const handleSave = async (isDraft = false) => {
    if (!selectedCustomer && !isDraft) { showToast("Please select a customer", "error"); return; }
    const validItems = items.filter(i => i.productId && i.qty > 0 && i.rate > 0);
    if (validItems.length === 0 && !isDraft) { showToast("Add at least one item with price", "error"); return; }
    
    // Draft with NO items and NO customer is basically empty, just close it
    if (isDraft && !selectedCustomer && validItems.length === 0) {
       setView("list");
       return;
    }

    const draftData = {
      finalTotal,
      _rawState: {
        selectedCustomer,
        customerSearch,
        customerPhone,
        invoiceDate,
        stateOfSupply,
        paymentType,
        items,
        priceMode,
        termsText,
        description,
        roundOffEnabled
      }
    };

    if (isDraft) {
      setSaving(true);
      try {
        await draftsApi.saveDraft({
          id: draftId || undefined,
          type: "invoice",
          data: draftData
        });
        showToast("Draft saved successfully", "success");
        fetchData();
        setView("list");
      } catch (e) {
        showToast("Failed to save draft", "error");
      } finally {
        setSaving(false);
      }
      return;
    }

    setSaving(true);
    try {
      const receivedAmount = (paymentType === "CASH") ? finalTotal : 0;
      const payload: any = {
        invoiceDate,
        stateOfSupply: stateOfSupply || undefined,
        paymentType,
        status: "SENT",
        items: validItems.map(i => ({
          productId: i.productId,
          qty: i.qty,
          unit: i.unit,
          rate: i.rate,
          gst: i.taxPct,
          discount: i.discountPct,
        })),
        receivedAmount,
        paymentMode: paymentType === "CASH" ? "CASH" : "CREDIT",
        roundOff,
        termsAndConditions: termsText || undefined,
        description: description || undefined,
      };
      if (selectedCustomer) payload.customerId = selectedCustomer.id;

      await api.post("/api/finance/invoices", payload);
      
      // If we saved an invoice that was previously a draft, remove the draft
      if (draftId) {
        try {
          await draftsApi.deleteDraft(draftId);
        } catch (e) {}
      }

      showToast("Invoice saved successfully", "success");
      fetchData();
      setView("list");
    } catch (e: any) {
      showToast(e?.response?.data?.error || "Failed to save invoice", "error");
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteDraft = async (id: string) => {
    if (!confirm("Are you sure you want to delete this draft?")) return;
    try {
      await draftsApi.deleteDraft(id);
      showToast("Draft deleted", "success");
      fetchData();
    } catch (e) {
      showToast("Failed to delete draft", "error");
    }
  };

  const handleBack = () => {
    const hasData = selectedCustomer || items.some(i => i.productId || i.itemSearch.trim() !== "");
    if (hasData) {
       handleSave(true);
    } else {
       setView("list");
    }
  };

  const handlePrint = (inv: any) => {
    const w = window.open("", "_blank");
    if (!w) return;
    w.document.write(`<html><head><title>Invoice</title>
    <style>body{font-family:sans-serif;padding:40px;color:#1e293b}
    table{width:100%;border-collapse:collapse;margin-top:20px}
    th{background:#f8fafc;padding:10px;font-size:11px;text-align:left;border-bottom:1px solid #e2e8f0}
    td{padding:10px;border-bottom:1px solid #f1f5f9;font-size:13px}
    @media print{button{display:none}}</style></head>
    <body><h2>Tax Invoice — ${inv.order?.invoiceNum || "Lite Sale"}</h2>
    <p>Customer: ${inv.order?.customer?.name || "Walk-In Customer"}</p>
    <p>Date: ${new Date(inv.createdAt).toLocaleDateString()}</p>
    <table><thead><tr><th>Item</th><th>Qty</th><th>Rate</th><th>Tax</th><th>Amount</th></tr></thead>
    <tbody>${(inv.order?.orderItems || []).map((it: any) =>
      `<tr><td>${it.product?.name || "Unknown Item"}</td><td>${it.quantity}</td><td>₹${it.price}</td><td>₹${(it.taxAmount || 0).toFixed(2)}</td><td>₹${(it.totalAmount || 0).toFixed(2)}</td></tr>`
    ).join("")}</tbody></table>
    <div style="text-align:right;margin-top:20px">
      <strong>Total: ₹${(inv.finalAmount || 0).toFixed(2)}</strong>
    </div>
    <script>window.onload=()=>{window.print();window.onafterprint=()=>window.close()}</script>
    </body></html>`);
    w.document.close();
  };

  // ── Filtered list ──────────────────────────────────────────────────────────
  const filtered = invoices.filter(inv => {
    const matchSearch = !search ||
      inv.order?.invoiceNum?.toLowerCase().includes(search.toLowerCase()) ||
      inv.order?.customer?.name?.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === "ALL" || inv.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const totalRevenue = filtered.reduce((s, i) => s + (i.finalAmount || 0), 0);
  const totalPaid = filtered.filter(i => i.status === "PAID").reduce((s, i) => s + (i.finalAmount || 0), 0);
  const totalOutstanding = filtered
    .filter(i => ["SENT", "PARTIAL", "OVERDUE", "PENDING"].includes(i.status))
    .reduce((s, i) => s + (i.finalAmount || 0), 0);

  const filteredCustomers = customers.filter(c =>
    !customerSearch ||
    c.name?.toLowerCase().includes(customerSearch.toLowerCase()) ||
    c.phone?.includes(customerSearch)
  );

  // ══════════════════════════════════════════════════════════════════════════
  // CREATE VIEW — Vyapar-style full-page form
  // ══════════════════════════════════════════════════════════════════════════
  if (view === "create") {
    return (
      <div className="flex flex-col bg-[#f1f5f9] overflow-hidden text-slate-800" style={{ height: 'calc(100vh - 104px)' }}>

        {/* ── Top bar ── */}
        <div className="bg-white border-b border-slate-200 px-6 py-3 flex items-center justify-between shrink-0 shadow-sm">
          <div className="flex items-center gap-3">
            <button onClick={handleBack} className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-600 transition-colors">
              <ArrowLeft size={18} />
            </button>
            <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
              Sale Invoice
            </h2>
          </div>
          <span className="text-xs text-slate-500 font-mono">Invoice No: <strong className="text-[#f58220] font-bold">Auto</strong></span>
        </div>

        {/* ── Scrollable body ── */}
        <div className="flex-1 overflow-y-auto min-h-0 p-6 space-y-6">

          {/* ── Customer + Invoice info row ── */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm px-6 py-5 flex flex-wrap items-start gap-4">

            {/* Customer dropdown */}
            <div className="relative" ref={customerDropRef}>
              <div
                className={clsx(
                  "flex items-center gap-1 min-w-[320px] bg-white border rounded px-2 py-1.5 cursor-pointer",
                  showCustomerDrop ? "border-orange-500" : "border-gray-300"
                )}
                onClick={() => setShowCustomerDrop(v => !v)}
              >
                <div className="flex-1">
                  <div className="text-[10px] text-orange-600 font-medium leading-none mb-0.5">Customer *</div>
                  <input
                    className="w-full text-sm text-gray-700 outline-none bg-transparent placeholder-gray-400"
                    placeholder="Search by Name/Phone"
                    value={customerSearch}
                    onChange={e => { setCustomerSearch(e.target.value); setShowCustomerDrop(true); }}
                    onClick={e => { e.stopPropagation(); setShowCustomerDrop(true); }}
                  />
                </div>
                <ChevronDown size={14} className="text-gray-400 shrink-0" />
              </div>

              {showCustomerDrop && (
                <div className="absolute top-full left-0 z-50 mt-1 w-full bg-white border border-gray-200 rounded-xl shadow-xl overflow-hidden">
                  <button
                    className="w-full flex items-center gap-2 px-3 py-2.5 text-sm text-blue-600 hover:bg-blue-50 border-b border-gray-100 font-medium"
                    onClick={() => {
                      const isPhone = /^[\d\s\-+()]{6,}$/.test(customerSearch.trim());
                      setNewParty(prev => ({
                        ...prev,
                        name: isPhone ? "" : customerSearch.trim(),
                        phone: isPhone ? customerSearch.trim() : "",
                      }));
                      setShowAddParty(true);
                      setShowCustomerDrop(false);
                    }}
                  >
                    <Plus size={16} /> Add Party
                  </button>
                  {/* Customer list */}
                  <div className="max-h-48 overflow-y-auto">
                    {filteredCustomers.length === 0 ? (
                      <div className="px-3 py-4 text-sm text-gray-400 text-center">No customers found</div>
                    ) : (
                      filteredCustomers.map(c => (
                        <button
                          key={c.id}
                          className="w-full flex items-center justify-between px-3 py-2 hover:bg-gray-50 border-b border-gray-50 last:border-0"
                          onClick={() => selectCustomer(c)}
                        >
                          <div className="text-left">
                            <div className="text-sm font-medium text-gray-800">{c.name}</div>
                            <div className="text-xs text-gray-400">{c.phone || "—"}</div>
                          </div>
                          {(c.balance !== undefined && c.balance !== 0) && (
                            <div className="flex items-center gap-1 bg-green-100 text-green-700 text-xs font-semibold px-2 py-0.5 rounded">
                              {c.balance}
                              <Check size={10} />
                            </div>
                          )}
                        </button>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Phone */}
            <div className="bg-white border border-slate-300 rounded-xl px-3 py-2 min-w-[160px]">
              <input
                className="text-sm text-gray-700 outline-none bg-transparent placeholder-gray-400 w-full"
                placeholder="Phone No."
                value={customerPhone}
                onChange={e => setCustomerPhone(e.target.value)}
              />
            </div>

            {/* Spacer */}
            <div className="flex-1" />

            {/* Invoice metadata */}
            <div className="flex flex-col gap-2 text-sm text-right">
              <div className="flex items-center justify-end gap-3">
                <span className="text-gray-500">Invoice Number</span>
                <span className="text-gray-800 font-medium w-16 text-left">Auto</span>
              </div>
              <div className="flex items-center justify-end gap-3">
                <span className="text-gray-500">Invoice Date</span>
                <div className="relative" ref={calendarRef}>
                  <button
                    onClick={() => setShowCalendar(v => !v)}
                    className="flex items-center gap-2 text-sm text-gray-800 font-medium border border-gray-300 rounded-lg px-2.5 py-1 bg-white hover:border-orange-400 transition-colors min-w-[120px]"
                  >
                    <Calendar size={13} className="text-orange-500 shrink-0" />
                    {invoiceDate ? new Date(invoiceDate + "T00:00:00").toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }) : "Pick date"}
                  </button>
                  {showCalendar && (
                    <div className="absolute right-0 top-full mt-1 z-[200]">
                      <MiniCalendar
                        value={invoiceDate}
                        onChange={setInvoiceDate}
                        onClose={() => setShowCalendar(false)}
                      />
                    </div>
                  )}
                </div>
              </div>
              <div className="flex items-center justify-end gap-3">
                <span className="text-gray-500">State of supply</span>
                <select
                  value={stateOfSupply}
                  onChange={e => setStateOfSupply(e.target.value)}
                  className="border border-gray-300 rounded px-2 py-1 bg-white text-sm text-gray-700 outline-none w-36"
                >
                  <option value="">Select</option>
                  {INDIAN_STATES.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
            </div>
          </div>

          {/* ── Items Table ── */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm" style={{ minHeight: 220, overflowX: "auto", overflowY: "visible" }}>
            <table className="w-full text-sm border-collapse bg-white">
              <thead>
                {/* Row 1 — main column headers */}
                <tr className="bg-[#f5f5f5] border-y border-gray-200 text-xs font-semibold text-gray-600 uppercase">
                  <th className="w-10 px-2 py-1 border-r border-gray-200 text-center">#</th>
                  <th className="px-3 py-1 border-r border-gray-200 text-left">ITEM</th>
                  <th className="w-16 px-2 py-1 border-r border-gray-200 text-center">QTY</th>
                  <th className="w-24 px-2 py-1 border-r border-gray-200 text-center">UNIT</th>
                  <th className="w-28 px-2 py-1 border-r border-gray-200 text-center">PRICE/UNIT</th>
                  <th className="w-32 px-2 py-1 border-r border-gray-200 text-center" colSpan={2}>DISCOUNT</th>
                  <th className="w-40 px-2 py-1 border-r border-gray-200 text-center" colSpan={2}>TAX</th>
                  <th className="w-24 px-2 py-1 border-r border-gray-200 text-right">AMOUNT</th>
                  <th className="w-8" />
                </tr>
                {/* Row 2 — sub-headers */}
                <tr className="bg-[#f5f5f5] border-b border-gray-200 text-[10px] text-gray-500">
                  <th className="border-r border-gray-200" />
                  <th className="border-r border-gray-200" />
                  <th className="border-r border-gray-200" />
                  <th className="border-r border-gray-200" />
                  <th className="px-2 py-0.5 border-r border-gray-200 text-center">
                    <div className="relative" ref={priceDropRef}>
                      <button
                        onClick={() => setShowPriceDrop(v => !v)}
                        className="flex items-center gap-1 text-[10px] text-gray-500 hover:text-gray-700 mx-auto"
                      >
                        {priceMode === "without_tax" ? "Without Tax" : "With Tax"}
                        <ChevronDown size={10} />
                      </button>
                      {showPriceDrop && (
                        <div className="absolute top-full left-1/2 -translate-x-1/2 z-50 mt-1 bg-white border border-gray-200 rounded shadow-lg text-xs w-28">
                          <button
                            className="w-full px-3 py-2 text-left hover:bg-gray-50"
                            onClick={() => { setPriceMode("with_tax"); setShowPriceDrop(false); }}
                          >With Tax</button>
                          <button
                            className="w-full px-3 py-2 text-left hover:bg-gray-50"
                            onClick={() => { setPriceMode("without_tax"); setShowPriceDrop(false); }}
                          >Without Tax</button>
                        </div>
                      )}
                    </div>
                  </th>
                  <th className="px-2 py-0.5 border-r border-gray-200 text-center w-14">%</th>
                  <th className="px-2 py-0.5 border-r border-gray-200 text-center w-20">AMOUNT</th>
                  <th className="px-2 py-0.5 border-r border-gray-200 text-center w-24">%</th>
                  <th className="px-2 py-0.5 border-r border-gray-200 text-center w-20">AMOUNT</th>
                  <th className="border-r border-gray-200" />
                  <th />
                </tr>
              </thead>

              <tbody>
                {items.map((item, idx) => {
                  const { discAmt, taxAmt, amount } = computeRow(item, withTax);
                  const filtProd = products.filter(p =>
                    !item.itemSearch || p.name?.toLowerCase().includes(item.itemSearch.toLowerCase())
                  ).slice(0, 10);

                  return (
                    <tr key={item.id} className="border-b border-gray-100 hover:bg-gray-50 group">
                      {/* # */}
                      <td className="px-2 py-1 border-r border-gray-100 text-center text-xs text-gray-400">
                        <div className="flex items-center justify-center gap-1">
                          <button
                            onClick={() => removeRow(idx)}
                            className="opacity-0 group-hover:opacity-100 text-red-400 hover:text-red-600 transition-opacity"
                          >
                            <Trash2 size={12} />
                          </button>
                          <span>{idx + 1}</span>
                        </div>
                      </td>

                      {/* ITEM */}
                      <td className="px-2 py-1.5 border-r border-gray-100" style={{ position: "relative", overflow: "visible" }}>
                        <input
                          className="w-full text-sm text-gray-700 outline-none bg-transparent"
                          placeholder="Search item..."
                          value={item.itemSearch}
                          onChange={e => {
                            updateItem(idx, "itemSearch", e.target.value);
                            updateItem(idx, "productId", "");
                            setOpenItemDrop(item.id);
                          }}
                          onFocus={e => {
                            setOpenItemDrop(item.id);
                            const rect = (e.target as HTMLElement).getBoundingClientRect();
                            setItemDropRect({ top: rect.bottom + window.scrollY, left: rect.left + window.scrollX, width: 320 });
                          }}
                        />
                        {openItemDrop === item.id && itemDropRect && (
                          <div
                            className="bg-white border border-gray-200 rounded-xl shadow-2xl overflow-hidden flex flex-col"
                            style={{ position: "fixed", top: itemDropRect.top + 4, left: itemDropRect.left, width: itemDropRect.width, zIndex: 9999 }}
                          >
                            <button
                              className="w-full flex items-center gap-2 px-3 py-2.5 text-sm text-blue-600 hover:bg-blue-50 border-b border-gray-100 font-semibold text-left transition-colors"
                              onMouseDown={(e) => {
                                e.preventDefault();
                                router.push("/inventory/stock/add");
                              }}
                            >
                              <Plus size={16} /> Add Item
                            </button>
                            <div className="max-h-48 overflow-y-auto">
                              {filtProd.length === 0 ? (
                                <div className="px-3 py-4 text-xs text-gray-400 text-center">No matching products</div>
                              ) : (
                                filtProd.map(p => (
                                  <button
                                    key={p.id}
                                    className="w-full flex items-center justify-between px-3 py-2.5 hover:bg-orange-50 text-left border-b border-gray-50 last:border-0"
                                    onMouseDown={() => selectProduct(idx, p)}
                                  >
                                    <div>
                                      <div className="text-sm font-medium text-gray-800">{p.name}</div>
                                      <div className="text-xs text-gray-400">₹{p.basePrice || p.price || 0}</div>
                                    </div>
                                  </button>
                                ))
                              )}
                            </div>
                          </div>
                        )}
                      </td>

                      {/* QTY */}
                      <td className="px-1 py-1.5 border-r border-gray-100">
                        <input
                          type="number"
                          min={0}
                          value={item.qty}
                          onChange={e => updateItem(idx, "qty", Number(e.target.value))}
                          className="w-full text-sm text-gray-700 text-center outline-none bg-transparent"
                        />
                      </td>

                      {/* UNIT */}
                      <td className="border-r border-gray-100" style={{ padding: 0, width: 72, position: "relative", overflow: "visible" }}>
                        <button
                          className="w-full h-full flex items-center justify-center gap-0.5 px-1 py-1.5 text-xs text-gray-700 hover:bg-gray-50"
                          onClick={e => {
                            const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
                            setUnitDropRect({ top: rect.bottom + window.scrollY, left: rect.left + window.scrollX });
                            setOpenUnitDrop(v => v === item.id ? null : item.id);
                          }}
                        >
                          <span>{UNITS.find(u => u.code === item.unit)?.short ?? item.unit}</span>
                          <ChevronDown size={9} className="text-gray-400 shrink-0" />
                        </button>
                        {openUnitDrop === item.id && unitDropRect && (
                          <div
                            className="bg-white border border-gray-200 rounded-xl shadow-2xl overflow-y-auto"
                            style={{ position: "fixed", top: unitDropRect.top + 2, left: unitDropRect.left, width: 180, maxHeight: 220, zIndex: 9999 }}
                          >
                            {UNITS.map(u => (
                              <button
                                key={u.code}
                                className={clsx(
                                  "w-full text-left px-3 py-2 text-xs border-b border-gray-50 last:border-0 hover:bg-orange-50",
                                  item.unit === u.code ? "text-orange-600 font-semibold bg-orange-50" : "text-gray-700"
                                )}
                                onMouseDown={() => { updateItem(idx, "unit", u.code); setOpenUnitDrop(null); }}
                              >
                                <span className="font-medium">{u.short}</span>
                                <span className="text-gray-400 ml-1">– {u.label}</span>
                              </button>
                            ))}
                          </div>
                        )}
                      </td>

                      {/* PRICE/UNIT */}
                      <td className="px-1 py-1.5 border-r border-gray-100">
                        <input
                          type="number"
                          min={0}
                          value={item.rate || ""}
                          placeholder="0"
                          onChange={e => updateItem(idx, "rate", Number(e.target.value))}
                          className="w-full text-sm text-gray-700 text-right outline-none bg-transparent"
                        />
                      </td>

                      {/* DISCOUNT % */}
                      <td className="px-1 py-1.5 border-r border-gray-100 w-14">
                        <input
                          type="number"
                          min={0}
                          max={100}
                          value={item.discountPct || ""}
                          placeholder="0"
                          onChange={e => updateItem(idx, "discountPct", Number(e.target.value))}
                          className="w-full text-sm text-gray-700 text-center outline-none bg-transparent"
                        />
                      </td>

                      {/* DISCOUNT AMT */}
                      <td className="px-2 py-1.5 border-r border-gray-100 text-right text-xs text-gray-500 w-20">
                        {discAmt > 0 ? discAmt.toFixed(2) : ""}
                      </td>

                      {/* TAX % */}
                      <td className="px-1 py-1.5 border-r border-gray-100 w-24">
                        <select
                          value={item.taxLabel || "NONE"}
                          onChange={e => {
                            const label = e.target.value;
                            const option = TAX_OPTIONS.find(o => o.label === label);
                            const val = option ? option.value : 0;
                            updateItem(idx, "taxLabel", label);
                            updateItem(idx, "taxPct", val);
                          }}
                          className="w-full text-xs text-gray-700 outline-none bg-transparent cursor-pointer"
                        >
                          {TAX_OPTIONS.map((t, index) => <option key={index} value={t.label}>{t.label}</option>)}
                        </select>
                      </td>

                      {/* TAX AMT */}
                      <td className="px-2 py-1.5 border-r border-gray-100 text-right text-xs text-gray-500 w-20">
                        {taxAmt > 0 ? taxAmt.toFixed(2) : ""}
                      </td>

                      {/* AMOUNT */}
                      <td className="px-2 py-1.5 border-r border-gray-100 text-right text-sm font-medium text-gray-800">
                        {amount > 0 ? amount.toFixed(2) : ""}
                      </td>

                      <td />
                    </tr>
                  );
                })}
              </tbody>

              {/* Footer / Totals */}
              <tfoot>
                <tr className="border-t border-gray-200 bg-[#f9f9f9] text-xs font-semibold text-gray-600">
                  <td className="px-2 py-1.5 border-r border-gray-200" />
                  <td className="px-3 py-2 border-r border-gray-200">
                    <button
                      onClick={addRow}
                      className="text-orange-600 hover:text-orange-800 font-semibold border border-orange-300 px-2 py-0.5 rounded text-xs"
                    >
                      ADD ROW
                    </button>
                    <span className="ml-6 text-gray-400 uppercase tracking-wide">TOTAL</span>
                  </td>
                  <td className="px-2 py-2 border-r border-gray-200 text-center text-orange-600">{totalQty}</td>
                  <td className="border-r border-gray-200" />
                  <td className="border-r border-gray-200" />
                  <td className="border-r border-gray-200" />
                  <td className="px-2 py-2 border-r border-gray-200 text-right text-orange-600">{totalDisc > 0 ? totalDisc.toFixed(2) : 0}</td>
                  <td className="border-r border-gray-200" />
                  <td className="px-2 py-2 border-r border-gray-200 text-right text-orange-600">{totalTax > 0 ? totalTax.toFixed(2) : 0}</td>
                  <td className="px-2 py-2 border-r border-gray-200 text-right text-orange-600">{totalAmount > 0 ? totalAmount.toFixed(2) : 0}</td>
                  <td />
                </tr>
              </tfoot>
            </table>
          </div>

          {/* ── Bottom section ── */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm px-6 py-5 flex flex-wrap gap-4 items-start">

            {/* Left — Terms */}
            <div className="min-w-[180px]">
              {!showTerms ? (
                <button
                  onClick={() => setShowTerms(true)}
                  className="flex items-center gap-2 text-xs text-gray-500 hover:text-gray-700 border border-gray-300 bg-white rounded px-3 py-2"
                >
                  <AlignLeft size={13} />
                  ADD TERMS AND CONDITIONS
                </button>
              ) : (
                <textarea
                  value={termsText}
                  onChange={e => setTermsText(e.target.value)}
                  rows={4}
                  placeholder="Terms and conditions..."
                  className="w-full text-xs text-gray-700 border border-gray-300 bg-white rounded px-3 py-2 outline-none resize-none min-w-[200px]"
                />
              )}
            </div>

            {/* Middle — Description / Image / Document */}
            <div className="flex flex-col gap-2">
              {!showDesc ? (
                <button
                  onClick={() => setShowDesc(true)}
                  className="flex items-center gap-2 text-xs text-gray-500 hover:text-gray-700 border border-gray-300 bg-white rounded px-3 py-2 w-40"
                >
                  <FileText size={13} />
                  ADD DESCRIPTION
                </button>
              ) : (
                <textarea
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  rows={4}
                  placeholder="Description"
                  className="w-48 text-xs text-gray-700 border border-gray-300 bg-white rounded px-3 py-2 outline-none resize-none"
                />
              )}
              <button className="flex items-center gap-2 text-xs text-gray-500 hover:text-gray-700 border border-gray-300 bg-white rounded px-3 py-2 w-40">
                <ImageIcon size={13} />
                ADD IMAGE
              </button>
              <button className="flex items-center gap-2 text-xs text-gray-500 hover:text-gray-700 border border-gray-300 bg-white rounded px-3 py-2 w-40">
                <FileText size={13} />
                ADD DOCUMENT
              </button>
            </div>

            {/* Spacer */}
            <div className="flex-1" />

            {/* Right — Round Off + Total */}
            <div className="flex flex-col gap-2 items-end text-sm">
              <div className="flex items-center gap-3">
                <label className="flex items-center gap-1.5 text-gray-600 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={roundOffEnabled}
                    onChange={e => setRoundOffEnabled(e.target.checked)}
                    className="w-3.5 h-3.5 accent-orange-600"
                  />
                  Round Off
                </label>
                <input
                  readOnly
                  value={roundOff.toFixed(2)}
                  className="w-20 text-right border border-gray-300 bg-white rounded px-2 py-1 text-xs text-gray-600 outline-none"
                />
              </div>
              <div className="flex items-center gap-3">
                <span className="text-gray-600 font-medium">Total</span>
                <input
                  readOnly
                  value={finalTotal > 0 ? finalTotal.toFixed(2) : ""}
                  placeholder="0.00"
                  className="w-36 text-right border border-gray-300 bg-white rounded px-2 py-1 text-sm font-semibold text-gray-800 outline-none"
                />
              </div>
            </div>
          </div>
        </div>

        {/* ── Bottom action bar ── */}
        <div className="bg-white/95 backdrop-blur-sm border-t border-white/20 px-6 py-3 flex items-center justify-end gap-3 shrink-0 shadow-[0_-4px_20px_rgba(0,0,0,0.3)]">
          <button
            onClick={() => handleSave(true)}
            disabled={saving}
            className="px-4 py-1.5 text-sm text-gray-500 hover:text-gray-700 disabled:opacity-60"
          >
            Save Draft
          </button>
          <button
            onClick={handleBack}
            className="px-4 py-1.5 text-sm text-gray-500 hover:text-gray-700"
          >
            Cancel
          </button>

          {/* Share dropdown */}
          <div className="relative" ref={shareDropRef}>
            <div className="flex">
              <button
                onClick={() => showToast("Share feature coming soon", "info")}
                className="px-4 py-1.5 text-sm font-medium text-white bg-[#f58220] hover:bg-[#e8740e] rounded-l border-r border-[#e8740e]"
              >
                Share
              </button>
              <button
                onClick={() => setShowShareDrop(v => !v)}
                className="px-2 py-1.5 text-sm text-white bg-[#f58220] hover:bg-[#e8740e] rounded-r"
              >
                <ChevronDown size={14} />
              </button>
            </div>
            {showShareDrop && (
              <div className="absolute bottom-full right-0 mb-1 bg-white border border-gray-200 rounded shadow-lg text-sm min-w-[160px] z-50">
                <button className="w-full px-4 py-2 text-left hover:bg-gray-50 text-gray-700">Generate e-Invoice</button>
                <button className="w-full px-4 py-2 text-left hover:bg-gray-50 text-gray-700 flex items-center gap-2">
                  <Share2 size={13} /> Share
                </button>
                <button className="w-full px-4 py-2 text-left hover:bg-gray-50 text-gray-700 flex items-center gap-2">
                  <Printer size={13} /> Print
                </button>
                <button
                  className="w-full px-4 py-2 text-left hover:bg-gray-50 text-gray-700"
                  onClick={async () => { setShowShareDrop(false); await handleSave(false); openCreate(); }}
                >
                  Save &amp; New
                </button>
              </div>
            )}
          </div>

          <button
            onClick={() => handleSave(false)}
            disabled={saving}
            className="px-6 py-1.5 text-sm font-semibold text-white bg-[#f58220] hover:bg-[#e8740e] rounded disabled:opacity-60"
          >
            {saving ? "Saving..." : "Save"}
          </button>
        </div>
      {/* ── Add Party Modal ── */}
      {showAddParty && (
        <div className="fixed inset-0 z-[100] bg-black/40 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-[650px] h-[530px] overflow-hidden flex flex-col max-h-[90vh]">
            {/* Header */}
            <div className="px-5 py-3 border-b border-gray-100 flex items-center justify-between bg-[#f8fafc]">
              <h2 className="text-[17px] font-bold text-[#1e3a8a]">Add Party</h2>
              <button
                onClick={() => {
                  setShowAddParty(false);
                  setNewParty({ name: "", phone: "", email: "", gstin: "", gstType: "Unregistered/Consumer", state: "", city: "", pincode: "", billingAddress: "", shippingAddress: "", openingBalance: "", creditLimit: "" });
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-5 overflow-y-auto flex-1">
              {/* Top Inputs */}
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div>
                  <div className="relative">
                    <label className="absolute -top-2 left-2 bg-white px-1 text-[10px] font-semibold text-[#f58220]">Party Name *</label>
                    <input
                      type="text"
                      value={newParty.name}
                      onChange={e => setNewParty(p => ({ ...p, name: e.target.value }))}
                      className="w-full border-2 border-blue-500 rounded-lg px-3 py-2 text-sm outline-none bg-white"
                      autoFocus
                    />
                  </div>
                </div>
                <div>
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="GSTIN"
                      value={newParty.gstin}
                      onChange={e => {
                        const val = e.target.value.toUpperCase().trim();
                        setNewParty(p => ({ ...p, gstin: val }));
                        if (val.length === 15) fetchGstDetails(val);
                      }}
                      className="w-full pl-3 pr-16 py-2.5 border border-gray-300 rounded-lg text-sm outline-none focus:border-gray-400 bg-white placeholder-gray-400 font-mono"
                    />
                    {newParty.gstin.length === 15 && !fetchingGst && (
                      <button
                        type="button"
                        onClick={() => fetchGstDetails(newParty.gstin)}
                        className="absolute right-1.5 top-1/2 -translate-y-1/2 text-[10px] font-bold text-orange-600 bg-orange-50 px-2 py-1 rounded border border-orange-200 hover:bg-orange-100 transition-colors"
                      >
                        FETCH
                      </button>
                    )}
                    {fetchingGst && (
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-bold text-orange-600 animate-pulse">
                        Fetching...
                      </span>
                    )}
                  </div>
                </div>
                <div>
                  <input
                    type="tel"
                    placeholder="Phone Number"
                    value={newParty.phone}
                    onChange={e => setNewParty(p => ({ ...p, phone: e.target.value }))}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-gray-400 bg-white placeholder-gray-400"
                  />
                </div>
              </div>

              {/* Tabs */}
              <div className="flex border-b border-gray-200 mb-4">
                <button
                  onClick={() => setPartyTab("GST")}
                  className={clsx(
                    "flex-1 text-center py-2 text-sm font-bold border-b-2 transition-colors",
                    partyTab === "GST" ? "border-[#f58220] text-[#f58220]" : "border-transparent text-gray-400 hover:text-gray-600"
                  )}
                >
                  GST &amp; Address
                </button>
                <button
                  onClick={() => setPartyTab("CREDIT")}
                  className={clsx(
                    "flex-1 text-center py-2 text-sm font-bold border-b-2 transition-colors",
                    partyTab === "CREDIT" ? "border-[#f58220] text-[#f58220]" : "border-transparent text-gray-400 hover:text-gray-600"
                  )}
                >
                  Credit &amp; Balance
                </button>
              </div>

              {/* Tab Content */}
              {partyTab === "GST" && (
                <div className="flex gap-6">
                  <div className="flex-1 space-y-4">
                    <div className="relative">
                      <label className="absolute -top-2 left-2 bg-white px-1 text-[10px] font-semibold text-[#f58220]">GST Type</label>
                      <select
                        value={newParty.gstType}
                        onChange={e => setNewParty(p => ({ ...p, gstType: e.target.value }))}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-gray-400 bg-white appearance-none"
                      >
                        <option>Unregistered/Consumer</option>
                        <option>Registered Regular</option>
                        <option>Registered Composition</option>
                      </select>
                    </div>
                    <select
                      value={newParty.state}
                      onChange={e => setNewParty(p => ({ ...p, state: e.target.value }))}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-gray-400 bg-white"
                    >
                      <option value="">State</option>
                      {INDIAN_STATES.map(st => <option key={st} value={st}>{st}</option>)}
                    </select>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder="City"
                        value={newParty.city}
                        onChange={e => setNewParty(p => ({ ...p, city: e.target.value }))}
                        className="w-1/2 border border-gray-300 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-gray-400 bg-white placeholder-gray-400"
                      />
                      <input
                        type="text"
                        placeholder="Pincode"
                        value={newParty.pincode}
                        onChange={e => setNewParty(p => ({ ...p, pincode: e.target.value }))}
                        className="w-1/2 border border-gray-300 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-gray-400 bg-white placeholder-gray-400"
                      />
                    </div>
                    <input
                      type="email"
                      placeholder="Email ID"
                      value={newParty.email}
                      onChange={e => setNewParty(p => ({ ...p, email: e.target.value }))}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-gray-400 bg-white placeholder-gray-400"
                    />
                  </div>
                  <div className="flex-1 space-y-2">
                    <label className="text-[11px] font-bold text-gray-700">Billing Address</label>
                    <textarea
                      placeholder="Billing Address"
                      value={newParty.billingAddress}
                      onChange={e => setNewParty(p => ({ ...p, billingAddress: e.target.value }))}
                      className="w-full h-36 border border-gray-300 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-gray-400 bg-white placeholder-gray-400 resize-none"
                    />
                  </div>
                </div>
              )}

              {partyTab === "CREDIT" && (
                <div className="space-y-4">
                  <div>
                    <label className="text-xs text-gray-500 block mb-1">Opening Balance</label>
                    <input
                      type="number"
                      placeholder="₹ 0.00"
                      value={newParty.openingBalance}
                      onChange={e => setNewParty(p => ({ ...p, openingBalance: e.target.value }))}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-gray-500 block mb-1">Credit Limit</label>
                    <input
                      type="number"
                      placeholder="₹ 0.00"
                      value={newParty.creditLimit}
                      onChange={e => setNewParty(p => ({ ...p, creditLimit: e.target.value }))}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Footer Buttons */}
            <div className="px-5 py-3 border-t border-gray-100 flex items-center justify-end gap-3 bg-white">
              <button
                disabled={!newParty.name.trim() || savingParty}
                className="px-8 py-2 bg-[#f58220] text-white rounded-lg font-bold text-sm hover:bg-[#e8740e] transition-colors disabled:opacity-50"
                onClick={async () => {
                  setSavingParty(true);
                  try {
                    const res = await customersApi.create({
                      name: newParty.name.trim(),
                      phone: newParty.phone.trim() || undefined,
                      email: newParty.email.trim() || undefined,
                      // Future-proofing payload
                      gstin: newParty.gstin.trim() || undefined,
                      gstType: newParty.gstType,
                      billingAddress: newParty.billingAddress.trim() || undefined,
                      state: newParty.state || undefined,
                      city: newParty.city || undefined,
                      pinCode: newParty.pincode || undefined,
                      openingBalance: Number(newParty.openingBalance) || 0,
                      creditLimit: Number(newParty.creditLimit) || 0,
                    });
                    const createdParty = (res as any).data;
                    showToast("Party created successfully", "success");
                    setCustomers(prev => [...prev, createdParty].sort((a, b) => a.name.localeCompare(b.name)));
                    selectCustomer(createdParty);
                    setShowAddParty(false);
                    setNewParty({ name: "", phone: "", email: "", gstin: "", gstType: "Unregistered/Consumer", state: "", city: "", pincode: "", billingAddress: "", shippingAddress: "", openingBalance: "", creditLimit: "" });
                  } catch (e: any) {
                    showToast(e?.response?.data?.error || "Failed to create party", "error");
                  } finally {
                    setSavingParty(false);
                  }
                }}
              >
                {savingParty ? "Saving..." : "Save Party"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Item Modal */}
      {showAddItem && (
        <div className="fixed inset-0 z-[999] flex items-center justify-center bg-black/50">
          <div className="bg-white w-[400px] rounded-xl shadow-2xl overflow-hidden flex flex-col">
            <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
              <h3 className="font-bold text-gray-800">Add Item</h3>
              <button onClick={() => setShowAddItem(false)} className="text-gray-400 hover:text-gray-600"><X size={18} /></button>
            </div>
            <div className="p-5 space-y-4">
              <input placeholder="Item Name *" value={newItem.name} onChange={e => setNewItem(p => ({ ...p, name: e.target.value }))} className="w-full border border-gray-300 rounded px-3 py-2 text-sm outline-none" />
              <input placeholder="Item SKU" value={newItem.sku} onChange={e => setNewItem(p => ({ ...p, sku: e.target.value }))} className="w-full border border-gray-300 rounded px-3 py-2 text-sm outline-none" />
              <div className="flex gap-4">
                <input type="number" placeholder="Sales Price *" value={newItem.basePrice} onChange={e => setNewItem(p => ({ ...p, basePrice: e.target.value }))} className="w-1/2 border border-gray-300 rounded px-3 py-2 text-sm outline-none" />
                <select value={newItem.taxPercent} onChange={e => setNewItem(p => ({ ...p, taxPercent: Number(e.target.value) }))} className="w-1/2 border border-gray-300 rounded px-3 py-2 text-sm outline-none bg-white">
                  {TAX_OPTIONS.map((t, i) => <option key={i} value={t.value}>{t.label}</option>)}
                </select>
              </div>
              <textarea placeholder="Description" value={newItem.description} onChange={e => setNewItem(p => ({ ...p, description: e.target.value }))} className="w-full border border-gray-300 rounded px-3 py-2 text-sm outline-none resize-none h-20" />
            </div>
            <div className="px-5 py-3 border-t border-gray-100 flex justify-end gap-3">
              <button disabled={savingItem} onClick={handleSaveItem} className="px-6 py-2 bg-[#f58220] text-white rounded font-bold text-sm hover:bg-[#e8740e] transition-colors disabled:opacity-50">Save Item</button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
  // LIST VIEW — Simplified Clean UI
  // ════════════════════════════════════════════════════════════════════════════
  const fmt = (d: string) => new Date(d + "T00:00:00").toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });

  const nonDraft     = filtered.filter(i => i.status !== "DRAFT");
  const totalAmt     = nonDraft.reduce((s, i) => s + (i.finalAmount || 0), 0);
  const receivedAmt  = nonDraft.filter(i => i.status === "PAID").reduce((s, i) => s + (i.finalAmount || 0), 0);
  const balanceAmt   = totalAmt - receivedAmt;

  return (
    <div className="min-h-screen bg-gray-50 text-gray-800">

      {/* ── Page Header ── */}
      <div className="bg-white border-b border-gray-200 px-6 py-3 flex items-center justify-between">
        <h1 className="text-base font-bold text-gray-800 flex items-center gap-2">
          <Receipt className="h-5 w-5 text-[#f58220]" />
          Sale Invoices
        </h1>
        <button
          onClick={openCreate}
          className="flex items-center gap-1.5 bg-[#f58220] hover:bg-[#e8740e] text-white text-sm font-semibold px-4 py-2 rounded-lg shadow-sm transition-colors"
        >
          <Plus className="h-4 w-4" /> New Invoice
        </button>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-5 space-y-5">

        {/* ── Summary Strip ── */}
        <div className="grid grid-cols-4 gap-4">
          {[
            { label: "Total Sales",   value: `₹${totalAmt.toLocaleString("en-IN")}`,     color: "text-gray-700",    dot: "bg-gray-400" },
            { label: "Received",      value: `₹${receivedAmt.toLocaleString("en-IN")}`,  color: "text-emerald-600", dot: "bg-emerald-500" },
            { label: "Balance Due",   value: `₹${balanceAmt.toLocaleString("en-IN")}`,   color: "text-rose-600",    dot: "bg-rose-500" },
          ].map(s => (
            <div key={s.label} className="bg-white rounded-lg border border-gray-200 px-4 py-3 flex items-center gap-3">
              <div className={clsx("w-2.5 h-2.5 rounded-full", s.dot)} />
              <div>
                <p className="text-xs text-gray-500">{s.label}</p>
                <p className={clsx("text-lg font-bold", s.color)}>{s.value}</p>
              </div>
            </div>
          ))}
        </div>

        {/* ── Filters Row ── */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative flex-1 min-w-[200px] max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search invoice or customer..."
              className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:border-[#f58220] bg-white"
            />
          </div>

          <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden bg-white">
            {["ALL", "SENT", "PAID", "DRAFT"].map(s => (
              <button
                key={s}
                onClick={() => setStatusFilter(s)}
                className={clsx(
                  "px-3 py-2 text-xs font-medium transition-colors",
                  statusFilter === s ? "bg-[#f58220] text-white" : "text-gray-600 hover:bg-gray-50"
                )}
              >
                {s === "ALL" ? "All" : s}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2 border border-gray-200 rounded-lg px-3 py-2 bg-white text-sm text-gray-700 relative">
            <div className="flex items-center gap-1.5 cursor-pointer hover:text-gray-900" onClick={() => setShowFromCal(v => !v)}>
              <Calendar className="h-4 w-4 text-gray-400" />
              <span className="font-medium">{fmt(dateFrom)}</span>
            </div>
            {showFromCal && (
              <div className="absolute top-full left-0 mt-1 z-50" ref={fromCalRef}>
                <MiniCalendar value={dateFrom} onChange={setDateFrom} onClose={() => setShowFromCal(false)} />
              </div>
            )}
            <span className="text-gray-300 px-1">to</span>
            <div className="flex items-center gap-1.5 cursor-pointer hover:text-gray-900" onClick={() => setShowToCal(v => !v)}>
              <span className="font-medium">{fmt(dateTo)}</span>
              <Calendar className="h-4 w-4 text-gray-400" />
            </div>
            {showToCal && (
              <div className="absolute top-full right-0 mt-1 z-50" ref={toCalRef}>
                <MiniCalendar value={dateTo} onChange={setDateTo} onClose={() => setShowToCal(false)} />
              </div>
            )}
          </div>

          <div className="flex-1" />
          <button onClick={fetchData} className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors" title="Refresh">
            <RefreshCw className={clsx("h-4 w-4", loading && "animate-spin")} />
          </button>
        </div>

        {/* ── Empty State ── */}
        {loading ? (
          <div className="py-20 flex justify-center"><RefreshCw className="h-8 w-8 animate-spin text-orange-400 opacity-50" /></div>
        ) : filtered.length === 0 ? (
          <div className="bg-white border border-gray-200 rounded-lg py-20 flex flex-col items-center justify-center text-center space-y-4">
            <div className="w-16 h-16 bg-orange-50 rounded-full flex items-center justify-center">
              <Receipt className="h-8 w-8 text-[#f58220]" />
            </div>
            <div>
              <p className="text-gray-800 font-semibold">No Invoices Found</p>
              <p className="text-gray-500 text-sm mt-1">Create an invoice to start billing your customers.</p>
            </div>
            <button
              onClick={openCreate}
              className="px-5 py-2.5 bg-[#f58220] hover:bg-[#e8740e] text-white font-semibold text-sm rounded-lg transition-colors"
            >
              Create Invoice
            </button>
          </div>
        ) : (
          /* ── Table ── */
          <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 text-gray-500 text-xs font-medium border-b border-gray-200 uppercase">
                  <th className="text-left px-4 py-3">Date</th>
                  <th className="text-left px-4 py-3">Invoice No</th>
                  <th className="text-left px-4 py-3">Party Name</th>
                  <th className="text-left px-4 py-3">Pay Type</th>
                  <th className="text-right px-4 py-3">Amount</th>
                  <th className="text-right px-4 py-3">Balance</th>
                  <th className="text-center px-4 py-3">Status</th>
                  <th className="text-right px-4 py-3">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filtered.map((inv) => {
                  const isPaid   = inv.status === "PAID";
                  const isDraft  = inv.status === "DRAFT";
                  const balance  = isPaid || isDraft ? 0 : (inv.finalAmount || 0);
                  const style = STATUS_STYLES[inv.status] || STATUS_STYLES.DRAFT;
                  return (
                    <tr 
                      key={inv.id} 
                      className={clsx(
                        "transition-colors",
                        isDraft ? "hover:bg-orange-50/50 cursor-pointer bg-orange-50/30" : "hover:bg-gray-50"
                      )}
                      onClick={() => {
                        if (isDraft) loadDraft(inv);
                      }}
                    >
                      <td className="px-4 py-3 text-xs text-gray-600 whitespace-nowrap">
                        {new Date(inv.createdAt).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}
                      </td>
                      <td className="px-4 py-3 font-mono font-semibold text-gray-800 text-xs">
                        {inv.order?.invoiceNum || "Lite Sale"}
                      </td>
                      <td className="px-4 py-3 text-sm">
                        <span className="font-medium text-gray-800">
                          {inv.order?.customer?.name || "Walk-In Customer"}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-xs text-gray-600">
                        {inv.paymentMode === "CASH" || inv.order?.paymentType === "CASH" ? "Cash" : "Credit"}
                      </td>
                      <td className="px-4 py-3 text-right font-medium text-gray-800">
                        ₹ {(inv.finalAmount || 0).toLocaleString("en-IN")}
                      </td>
                      <td className="px-4 py-3 text-right font-medium text-rose-600">
                        {balance > 0 ? `₹ ${balance.toLocaleString("en-IN")}` : "—"}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className={clsx("inline-block px-2 py-0.5 rounded text-[11px] font-semibold border", style.color, style.bg, style.border)}>
                          {style.label}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-1">
                          {isDraft ? (
                            <button
                              onClick={(e) => { e.stopPropagation(); handleDeleteDraft(inv.id); }}
                              className="p-1 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                              title="Delete Draft"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          ) : (
                            <>
                              <button
                                onClick={(e) => { e.stopPropagation(); handlePrint(inv); }}
                                className="p-1 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded transition-colors"
                                title="Print"
                              >
                                <Printer className="h-4 w-4" />
                              </button>
                              <button
                                onClick={(e) => { e.stopPropagation(); }}
                                className="p-1 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded transition-colors"
                                title="Share"
                              >
                                <Share2 className="h-4 w-4" />
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
