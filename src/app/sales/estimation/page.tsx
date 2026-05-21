"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import {
  Calculator, Plus, Search, RefreshCw, X, User,
  Printer, ChevronDown, Trash2, Check, Share2, Calendar,
  AlignLeft, Image as ImageIcon, FileText, ArrowLeft, ArrowRight, FileClock
} from "lucide-react";
import { clsx } from "clsx";
import { customersApi, productsFullApi } from "@/lib/api";
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
  ACCEPTED: { label: "Accepted", color: "text-emerald-600", bg: "bg-emerald-50", border: "border-emerald-200" },
  REJECTED: { label: "Rejected", color: "text-rose-600",    bg: "bg-rose-50",    border: "border-rose-200" },
  CONVERTED:{ label: "Converted",color: "text-orange-600",  bg: "bg-orange-50", border: "border-orange-200" },
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
      <div className="flex items-center justify-between mb-2">
        <button onClick={prevMonth} className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-gray-100 text-gray-500">
          <ChevronDown size={14} className="rotate-90" />
        </button>
        <span className="text-sm font-semibold text-gray-800">{MONTH_NAMES[viewMonth]} {viewYear}</span>
        <button onClick={nextMonth} className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-gray-100 text-gray-500">
          <ChevronDown size={14} className="-rotate-90" />
        </button>
      </div>
      <div className="grid grid-cols-7 mb-1">
        {DAY_NAMES.map(d => (
          <div key={d} className="text-center text-[10px] font-semibold text-gray-400 py-0.5">{d}</div>
        ))}
      </div>
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
              isSelected(d) && "bg-[#ff4d4f] text-white",
              !isSelected(d) && isToday(d) && "bg-red-50 text-[#ff4d4f]",
              !isSelected(d) && !isToday(d) && "text-gray-700 hover:bg-gray-100"
            )}
          >{d}</button>
        ))}
      </div>
      <div className="mt-2 flex justify-between items-center border-t border-gray-100 pt-2">
        <button
          onClick={() => {
            const t = new Date();
            const iso = `${t.getFullYear()}-${String(t.getMonth() + 1).padStart(2, "0")}-${String(t.getDate()).padStart(2, "0")}`;
            onChange(iso);
            onClose();
          }}
          className="text-[11px] font-semibold text-[#ff4d4f] hover:text-red-700"
        >Today</button>
        <button onClick={onClose} className="text-[11px] text-gray-400 hover:text-gray-600">Close</button>
      </div>
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────

export default function EstimationsPage() {
  const { showToast } = useToast();

  // shared
  const [view, setView] = useState<"list" | "create">("list");
  const [estimations, setEstimations] = useState<any[]>([]);
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
  const [converting, setConverting] = useState<string | null>(null);
  const [draftId, setDraftId] = useState<string | null>(null);

  // Add Party inline form
  const [showAddParty, setShowAddParty] = useState(false);
  const [newParty, setNewParty] = useState({ name: "", phone: "", email: "" });
  const [savingParty, setSavingParty] = useState(false);

  // Item dropdown fixed position
  const [itemDropRect, setItemDropRect] = useState<{ top: number; left: number; width: number } | null>(null);

  // Custom calendar
  const [showCalendar, setShowCalendar] = useState(false);
  const calendarRef = useRef<HTMLDivElement>(null);

  const customerDropRef = useRef<HTMLDivElement>(null);
  const shareDropRef = useRef<HTMLDivElement>(null);
  const priceDropRef = useRef<HTMLDivElement>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [eRes, cRes, pRes] = await Promise.allSettled([
        api.get("/api/sales/quotations").catch(() => ({ data: [] })),
        customersApi.getAll(),
        productsFullApi.getAll(),
      ]);
      
      let apiEstimations = eRes.status === "fulfilled" ? (eRes.value as any).data || [] : [];
      
      // Merge local drafts
      try {
        const draftsStr = localStorage.getItem("sale_estimations_drafts");
        if (draftsStr) {
          const drafts = JSON.parse(draftsStr);
          apiEstimations = [...drafts, ...apiEstimations];
        }
      } catch (e) {
        console.error("Error loading drafts", e);
      }
      
      setEstimations(apiEstimations);
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

  const handleDeleteDraft = (id: string) => {
    try {
      const draftsStr = localStorage.getItem("sale_estimations_drafts");
      if (draftsStr) {
        const drafts = JSON.parse(draftsStr);
        const newDrafts = drafts.filter((d: any) => d.id !== id);
        localStorage.setItem("sale_estimations_drafts", JSON.stringify(newDrafts));
        showToast("Draft deleted", "success");
        fetchData();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const loadDraft = (draft: any) => {
    setDraftId(draft.id);
    const raw = draft._rawState || {};
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
    if (!selectedCustomer && !isDraft) { showToast("Please select a party", "error"); return; }
    const validItems = items.filter(i => (i.productId || i.itemSearch.trim()) && i.qty > 0 && i.rate > 0);
    if (validItems.length === 0 && !isDraft) { showToast("Add at least one item with price", "error"); return; }
    
    if (isDraft && !selectedCustomer && validItems.length === 0) {
       setView("list");
       return;
    }

    const draftPayload = {
      id: draftId || `draft_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      status: "DRAFT",
      createdAt: new Date().toISOString(),
      quotationNumber: "DRAFT",
      customerName: selectedCustomer?.name || "Unknown Customer",
      totalAmount: finalTotal,
      _rawState: {
        selectedCustomer,
        customerSearch,
        customerPhone,
        invoiceDate,
        stateOfSupply,
        items,
        priceMode,
        termsText,
        description,
        roundOffEnabled
      }
    };

    if (isDraft) {
      try {
        const draftsStr = localStorage.getItem("sale_estimations_drafts");
        let drafts = draftsStr ? JSON.parse(draftsStr) : [];
        if (draftId) {
          drafts = drafts.filter((d: any) => d.id !== draftId);
        }
        drafts.unshift(draftPayload);
        localStorage.setItem("sale_estimations_drafts", JSON.stringify(drafts));
        showToast("Draft saved locally", "success");
        fetchData();
        setView("list");
      } catch (e) {
        console.error("Failed to save draft locally", e);
      }
      return;
    }

    setSaving(true);
    try {
      const payload: any = {
        customerId: selectedCustomer?.id,
        customerName: selectedCustomer ? undefined : customerSearch,
        customerPhone,
        validUntil: invoiceDate,
        status: "SENT",
        items: validItems.map(i => ({
          productId: i.productId || undefined,
          productName: i.itemSearch,
          quantity: i.qty,
          unit: i.unit,
          rate: i.rate,
          taxPercent: i.taxPct,
        })),
        discountAmount: totalDisc,
        termsConditions: termsText || undefined,
        notes: description || undefined,
      };

      await api.post("/api/sales/quotations", payload);
      
      // If we saved an estimation that was previously a draft, remove the draft
      if (draftId) {
        try {
          const draftsStr = localStorage.getItem("sale_estimations_drafts");
          if (draftsStr) {
            const drafts = JSON.parse(draftsStr);
            const newDrafts = drafts.filter((d: any) => d.id !== draftId);
            localStorage.setItem("sale_estimations_drafts", JSON.stringify(newDrafts));
          }
        } catch (e) {
          console.error("Failed to clear draft", e);
        }
      }

      showToast("Estimation saved successfully", "success");
      fetchData();
      setView("list");
    } catch (e: any) {
      showToast(e?.response?.data?.error || "Failed to save estimation", "error");
    } finally {
      setSaving(false);
    }
  };

  const handleBack = () => {
    const hasData = selectedCustomer || items.some(i => i.productId || i.itemSearch.trim());
    if (hasData) {
       handleSave(true);
    } else {
       setView("list");
    }
  };

  const handleConvertToOrder = async (id: string) => {
    setConverting(id);
    try {
      await api.post(`/api/sales/quotations/${id}/convert`);
      showToast("Converted to Sales Order", "success");
      fetchData();
    } catch (e: any) {
      showToast(e?.response?.data?.error || "Conversion failed", "error");
    } finally { setConverting(null); }
  };

  // ── Filtered list ──────────────────────────────────────────────────────────
  const filtered = estimations.filter(est => {
    const matchSearch = !search ||
      est.quotationNumber?.toLowerCase().includes(search.toLowerCase()) ||
      est.customerName?.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === "ALL" || est.status === statusFilter;
    // Add date filtering logic if required here
    return matchSearch && matchStatus;
  });

  const totalQuotations = filtered.reduce((s, i) => s + (i.totalAmount || 0), 0);
  const totalConverted = filtered.filter(i => i.status === "CONVERTED").reduce((s, i) => s + (i.totalAmount || 0), 0);
  const totalOpen = filtered.filter(i => i.status === "SENT" || i.status === "DRAFT").reduce((s, i) => s + (i.totalAmount || 0), 0);

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
      <div className="flex flex-col bg-gray-50 overflow-hidden" style={{ height: 'calc(100vh - 56px)' }}>

        {/* ── Top bar ── */}
        <div className="bg-white border-b border-gray-200 px-4 py-2 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <button onClick={handleBack} className="p-1 hover:bg-gray-100 rounded text-gray-600 transition-colors">
              <ArrowLeft size={18} />
            </button>
            <span className="text-base font-semibold text-gray-800">Estimate/Quotation</span>
          </div>
        </div>

        {/* ── Scrollable body ── */}
        <div className="flex-1 overflow-y-auto min-h-0 pb-16">

          {/* ── Customer + Meta info row ── */}
          <div className="bg-gray-50 px-6 py-4 flex flex-wrap items-start justify-between gap-4">

            {/* Customer dropdown */}
            <div className="relative" ref={customerDropRef}>
              <div
                className={clsx(
                  "flex items-center gap-1 min-w-[300px] bg-white border rounded-md px-3 py-1.5 cursor-pointer",
                  showCustomerDrop ? "border-blue-500" : "border-gray-300"
                )}
                onClick={() => setShowCustomerDrop(v => !v)}
              >
                <div className="flex-1">
                  <div className="text-[10px] text-[#f58220] font-semibold leading-none mb-1">Party *</div>
                  <input
                    className="w-full text-sm text-gray-800 outline-none bg-transparent placeholder-gray-400 font-medium"
                    placeholder=""
                    value={customerSearch}
                    onChange={e => { setCustomerSearch(e.target.value); setShowCustomerDrop(true); }}
                    onClick={e => { e.stopPropagation(); setShowCustomerDrop(true); }}
                  />
                </div>
                <ChevronDown size={16} className="text-gray-400 shrink-0" />
              </div>

              {showCustomerDrop && (
                <div className="absolute top-full left-0 z-50 mt-1 w-[400px] bg-white border border-gray-200 rounded-xl shadow-xl overflow-hidden">
                  {/* Add Party inline card */}
                  {showAddParty ? (
                    <div className="flex flex-col bg-white">
                      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
                        <span className="text-sm font-bold text-[#1a237e]">Add Party</span>
                        <button onClick={() => { setShowAddParty(false); setNewParty({ name: "", phone: "", email: "" }); }} className="text-gray-400 hover:text-gray-600">
                          <X size={18} />
                        </button>
                      </div>
                      <div className="p-4 space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div className="col-span-1">
                            <label className="text-[10px] text-[#f58220] font-semibold absolute ml-2 mt-[-6px] bg-white px-1">Party Name *</label>
                            <input
                              type="text"
                              value={newParty.name}
                              onChange={e => setNewParty(p => ({ ...p, name: e.target.value }))}
                              className="w-full text-sm border-2 border-blue-500 rounded-md px-3 py-2 outline-none bg-white font-medium text-gray-800"
                              autoFocus
                            />
                          </div>
                          <div className="col-span-1">
                            <input type="text" placeholder="GSTIN" className="w-full text-sm border border-gray-300 rounded-md px-3 py-2 outline-none focus:border-gray-400 bg-white" />
                          </div>
                          <div className="col-span-1">
                            <input type="tel" placeholder="Phone Number" value={newParty.phone} onChange={e => setNewParty(p => ({ ...p, phone: e.target.value }))} className="w-full text-sm border border-gray-300 rounded-md px-3 py-2 outline-none focus:border-gray-400 bg-white" />
                          </div>
                        </div>

                        {/* Tabs simulation */}
                        <div className="flex border-b border-gray-200">
                          <div className="px-4 py-2 border-b-2 border-[#f58220] text-sm font-bold text-[#f58220]">GST & Address</div>
                          <div className="px-4 py-2 text-sm font-semibold text-gray-400 flex items-center gap-2">Credit & Balance <span className="bg-[#ff4d4f] text-white text-[9px] px-1.5 py-0.5 rounded">New</span></div>
                          <div className="px-4 py-2 text-sm font-semibold text-gray-400">Additional Fields</div>
                        </div>

                        <div className="grid grid-cols-2 gap-6 pt-2">
                          <div className="space-y-3">
                            <div className="border border-gray-300 rounded-md p-2 relative">
                              <label className="text-[10px] text-[#f58220] font-semibold absolute top-[-7px] left-2 bg-white px-1">GST Type</label>
                              <select className="w-full text-sm outline-none bg-transparent appearance-none font-medium text-gray-800 pt-1">
                                <option>Unregistered/Consumer</option>
                                <option>Registered Business - Regular</option>
                                <option>Registered Business - Composition</option>
                              </select>
                              <ChevronDown size={14} className="absolute right-2 top-3 text-gray-500 pointer-events-none" />
                            </div>
                            <select className="w-full text-sm border border-gray-300 rounded-md px-3 py-2 outline-none font-medium text-gray-500 bg-white">
                              <option>State</option>
                              {INDIAN_STATES.map(s => <option key={s}>{s}</option>)}
                            </select>
                            <input type="email" placeholder="Email ID" className="w-full text-sm border border-gray-300 rounded-md px-3 py-2 outline-none bg-white" />
                          </div>
                          <div>
                            <span className="text-xs font-semibold text-gray-700 mb-1 block">Billing Address</span>
                            <textarea placeholder="Billing Address" rows={3} className="w-full text-sm border border-gray-300 rounded-md px-3 py-2 outline-none resize-none bg-white" />
                            <div className="text-right mt-1">
                              <button className="text-xs text-[#f58220] font-medium">Show Detailed Address</button>
                            </div>
                            <div className="mt-3">
                              <span className="text-xs font-semibold text-gray-700 mb-1 block">Shipping Address</span>
                              <button className="text-xs text-[#f58220] font-medium">+ Enable Shipping Address</button>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      <div className="border-t border-gray-100 p-4 flex justify-end gap-3 bg-white">
                        <button 
                          disabled={!newParty.name.trim() || savingParty}
                          onClick={async () => {
                            setSavingParty(true);
                            try {
                              const res = await customersApi.create({
                                name: newParty.name.trim(),
                                phone: newParty.phone.trim(),
                                email: newParty.email.trim() || undefined,
                              });
                              const created = (res as any).data;
                              setCustomers(prev => [created, ...prev]);
                              selectCustomer(created);
                              setShowAddParty(false);
                              setNewParty({ name: "", phone: "", email: "" });
                              showToast("Customer added successfully", "success");
                            } catch {
                              showToast("Failed to add customer", "error");
                            } finally {
                              setSavingParty(false);
                            }
                          }}
                          className="px-6 py-2 bg-[#f58220] text-white rounded-md text-sm font-semibold hover:bg-[#e8740e] shadow-md"
                        >
                          {savingParty ? "Saving..." : "Save"}
                        </button>
                      </div>
                    </div>
                  ) : (
                    <button
                      className="w-full flex items-center gap-2 px-3 py-2.5 text-sm text-blue-600 hover:bg-blue-50 border-b border-gray-100 font-medium"
                      onClick={() => {
                        const isPhone = /^[\d\s\-+()]{6,}$/.test(customerSearch.trim());
                        setNewParty({
                          name: isPhone ? "" : customerSearch.trim(),
                          phone: isPhone ? customerSearch.trim() : "",
                          email: "",
                        });
                        setShowAddParty(true);
                      }}
                    >
                      <span className="w-5 h-5 rounded-full bg-orange-100 flex items-center justify-center text-[#f58220] font-bold text-base leading-none">+</span>
                      Add New Party
                    </button>
                  )}
                  {/* Customer list */}
                  {!showAddParty && (
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
                          </button>
                        ))
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Invoice metadata */}
            <div className="flex flex-col gap-3 text-xs">
              <div className="flex items-center justify-end gap-4">
                <span className="text-gray-500 w-24 text-right">Ref No</span>
                <span className="text-gray-800 font-semibold w-32 text-left">Auto</span>
              </div>
              <div className="flex items-center justify-end gap-4">
                <span className="text-gray-500 w-24 text-right">Valid Until</span>
                <div className="relative w-32" ref={calendarRef}>
                  <button
                    onClick={() => setShowCalendar(v => !v)}
                    className="flex items-center justify-between w-full text-xs text-gray-800 font-semibold bg-transparent transition-colors text-left"
                  >
                    {invoiceDate ? new Date(invoiceDate + "T00:00:00").toLocaleDateString("en-GB") : "Pick date"}
                    <Calendar size={13} className="text-blue-500" />
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
              <div className="flex items-center justify-end gap-4">
                <span className="text-gray-500 w-24 text-right">State of supply</span>
                <div className="w-32 relative">
                  <select
                    value={stateOfSupply}
                    onChange={e => setStateOfSupply(e.target.value)}
                    className="w-full bg-transparent text-xs text-gray-800 font-semibold outline-none appearance-none"
                  >
                    <option value="">Select</option>
                    {INDIAN_STATES.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                  <ChevronDown size={10} className="absolute right-0 top-1 text-gray-800 pointer-events-none" />
                </div>
              </div>
            </div>
          </div>

          {/* ── Items Table ── */}
          <div className="px-0">
            <table className="w-full text-sm border-collapse bg-white border-y border-gray-200">
              <thead>
                {/* Row 1 — main column headers */}
                <tr className="bg-white border-b border-gray-200 text-[10px] font-bold text-gray-600 uppercase">
                  <th className="w-10 px-2 py-2 border-r border-gray-200 text-center">#</th>
                  <th className="px-3 py-2 border-r border-gray-200 text-left">ITEM</th>
                  <th className="w-20 px-2 py-2 border-r border-gray-200 text-center">QTY</th>
                  <th className="w-24 px-2 py-2 border-r border-gray-200 text-center">UNIT</th>
                  <th className="w-48 px-2 py-0 border-r border-gray-200 text-center align-top p-0">
                    <div className="border-b border-gray-200 py-2">PRICE/UNIT</div>
                    <div className="relative py-1 bg-gray-50" ref={priceDropRef}>
                      <button
                        onClick={() => setShowPriceDrop(v => !v)}
                        className="flex items-center justify-center gap-1 text-[9px] text-gray-500 hover:text-gray-700 w-full font-semibold"
                      >
                        {priceMode === "without_tax" ? "Without Tax" : "With Tax"}
                        <ChevronDown size={10} />
                      </button>
                      {showPriceDrop && (
                        <div className="absolute top-full left-0 z-50 mt-1 bg-white border border-gray-200 rounded shadow-lg text-xs w-full text-left font-normal">
                          <button className="w-full px-3 py-2 text-left hover:bg-gray-50" onClick={() => { setPriceMode("with_tax"); setShowPriceDrop(false); }}>With Tax</button>
                          <button className="w-full px-3 py-2 text-left hover:bg-gray-50" onClick={() => { setPriceMode("without_tax"); setShowPriceDrop(false); }}>Without Tax</button>
                        </div>
                      )}
                    </div>
                  </th>
                  <th className="w-40 px-0 py-0 border-r border-gray-200 text-center align-top p-0">
                    <div className="border-b border-gray-200 py-2">TAX</div>
                    <div className="flex bg-gray-50 text-[9px]">
                      <div className="flex-1 py-1 border-r border-gray-200">%</div>
                      <div className="flex-1 py-1">AMOUNT</div>
                    </div>
                  </th>
                  <th className="w-32 px-2 py-2 border-r border-gray-200 text-right">AMOUNT</th>
                  <th className="w-10 text-center text-blue-500"><Plus size={14} className="mx-auto cursor-pointer" onClick={addRow} /></th>
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
                      <td className="px-2 py-2 border-r border-gray-100 text-center text-xs text-gray-500">
                        {idx + 1}
                      </td>

                      {/* ITEM */}
                      <td className="px-2 py-2 border-r border-gray-100" style={{ position: "relative", overflow: "visible" }}>
                        <input
                          className="w-full text-xs text-gray-800 outline-none bg-transparent font-medium"
                          placeholder=""
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
                        {openItemDrop === item.id && filtProd.length > 0 && itemDropRect && (
                          <div
                            className="bg-white border border-gray-200 rounded-md shadow-2xl max-h-60 overflow-y-auto"
                            style={{ position: "fixed", top: itemDropRect.top + 4, left: itemDropRect.left, width: itemDropRect.width, zIndex: 9999 }}
                          >
                            {filtProd.map(p => (
                              <button
                                key={p.id}
                                className="w-full flex items-center justify-between px-3 py-2 hover:bg-blue-50 text-left border-b border-gray-50 last:border-0"
                                onMouseDown={() => selectProduct(idx, p)}
                              >
                                <div>
                                  <div className="text-sm font-medium text-gray-800">{p.name}</div>
                                  <div className="text-xs text-gray-500">₹{p.basePrice || p.price || 0}</div>
                                </div>
                              </button>
                            ))}
                          </div>
                        )}
                      </td>

                      {/* QTY */}
                      <td className="px-1 py-2 border-r border-gray-100">
                        <input
                          type="number"
                          min={0}
                          value={item.qty === 0 ? "" : item.qty}
                          onChange={e => updateItem(idx, "qty", Number(e.target.value))}
                          className="w-full text-xs font-semibold text-gray-800 text-center outline-none bg-transparent"
                        />
                      </td>

                      {/* UNIT */}
                      <td className="border-r border-gray-100 px-1 py-2" style={{ position: "relative", overflow: "visible" }}>
                        <div className="relative w-full h-full flex items-center justify-between">
                          <select 
                            value={item.unit}
                            onChange={e => updateItem(idx, "unit", e.target.value)}
                            className="w-full text-[11px] font-bold text-gray-800 outline-none bg-transparent appearance-none text-center"
                          >
                             {UNITS.map(u => <option key={u.code} value={u.code}>{u.short}</option>)}
                          </select>
                          <ChevronDown size={10} className="text-gray-800 pointer-events-none absolute right-1" />
                        </div>
                      </td>

                      {/* PRICE */}
                      <td className="px-2 py-2 border-r border-gray-100 text-right">
                        <input
                          type="number"
                          min={0}
                          value={item.rate === 0 ? "" : item.rate}
                          onChange={e => updateItem(idx, "rate", Number(e.target.value))}
                          className="w-full text-xs font-semibold text-gray-800 outline-none bg-transparent text-right"
                        />
                      </td>

                      {/* TAX % & AMOUNT */}
                      <td className="p-0 border-r border-gray-100 h-full">
                        <div className="flex h-full">
                          <div className="flex-1 border-r border-gray-100 p-1 relative">
                            <select
                              value={item.taxLabel || "NONE"}
                              onChange={e => {
                                const label = e.target.value;
                                const option = TAX_OPTIONS.find(o => o.label === label);
                                const val = option ? option.value : 0;
                                updateItem(idx, "taxLabel", label);
                                updateItem(idx, "taxPct", val);
                              }}
                              className="w-full text-xs font-semibold text-gray-800 outline-none bg-transparent appearance-none h-full pl-1"
                            >
                              {TAX_OPTIONS.map((o, index) => (
                                <option key={index} value={o.label}>{o.label}</option>
                              ))}
                            </select>
                            <ChevronDown size={10} className="text-gray-800 pointer-events-none absolute right-1 top-2.5" />
                          </div>
                          <div className="flex-1 p-1 text-right text-xs font-semibold text-gray-800 flex items-center justify-end px-2">
                             {taxAmt > 0 ? taxAmt : ""}
                          </div>
                        </div>
                      </td>

                      {/* AMOUNT */}
                      <td className="px-2 py-2 border-r border-gray-100 text-right text-xs font-bold text-gray-800">
                        {amount > 0 ? amount : ""}
                      </td>

                      {/* ACTIONS */}
                      <td className="px-2 py-2 text-center">
                         <button
                           onClick={() => removeRow(idx)}
                           className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-red-500 transition-opacity"
                         >
                           <Trash2 size={14} />
                         </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            
            <div className="flex border-b border-gray-200 bg-white">
              <div className="flex items-center px-4 py-2 flex-1">
                 <button onClick={addRow} className="text-[11px] font-bold text-blue-500 border border-blue-200 rounded px-3 py-1 hover:bg-blue-50">
                    ADD ROW
                 </button>
              </div>
              <div className="w-20 px-2 py-2 flex items-center justify-center font-bold text-xs text-gray-600">TOTAL</div>
              <div className="w-24 px-2 py-2 border-r border-gray-200 text-center font-bold text-xs text-gray-800">{totalQty}</div>
              <div className="w-48 px-2 py-2 border-r border-gray-200" />
              <div className="w-40 px-2 py-2 border-r border-gray-200 flex text-xs font-bold text-gray-800">
                 <div className="flex-1" />
                 <div className="flex-1 text-right">{totalTax.toFixed(2)}</div>
              </div>
              <div className="w-32 px-2 py-2 border-r border-gray-200 text-right font-bold text-xs text-gray-800">
                 {totalAmount.toFixed(2)}
              </div>
              <div className="w-10" />
            </div>
          </div>

          {/* ── Footer notes & totals ── */}
          <div className="flex gap-4 p-6 bg-gray-50">
            {/* Left actions */}
            <div className="flex flex-col gap-4">
               <button
                 onClick={() => setShowTerms(true)}
                 className="flex items-center gap-2 text-xs font-semibold text-gray-500 bg-white border border-gray-200 rounded px-4 py-2 hover:bg-gray-50"
               >
                 <AlignLeft size={14} className="text-gray-400" />
                 ADD TERMS AND CONDITIONS
               </button>
            </div>
            
            <div className="flex flex-col gap-4">
               <button
                 onClick={() => setShowDesc(true)}
                 className="flex items-center justify-center gap-2 w-48 text-xs font-semibold text-gray-500 bg-white border border-gray-200 rounded px-4 py-2 hover:bg-gray-50"
               >
                 <FileText size={14} className="text-gray-400" />
                 ADD DESCRIPTION
               </button>
               <button className="flex items-center justify-center gap-2 w-48 text-xs font-semibold text-gray-500 bg-white border border-gray-200 rounded px-4 py-2 hover:bg-gray-50">
                 <ImageIcon size={14} className="text-gray-400" />
                 ADD IMAGE
               </button>
               <button className="flex items-center justify-center gap-2 w-48 text-xs font-semibold text-gray-500 bg-white border border-gray-200 rounded px-4 py-2 hover:bg-gray-50">
                 <FileText size={14} className="text-gray-400" />
                 ADD DOCUMENT
               </button>
            </div>

            <div className="flex-1" />

            {/* Right totals */}
            <div className="flex flex-col gap-3 min-w-[280px]">
               <div className="flex items-center justify-end gap-3 text-xs font-semibold text-gray-600">
                  <label className="flex items-center gap-2 cursor-pointer">
                     <input type="checkbox" checked={roundOffEnabled} onChange={e => setRoundOffEnabled(e.target.checked)} className="accent-blue-500" />
                     Round Off
                  </label>
                  <input type="text" readOnly value={roundOff} className="w-16 border border-gray-300 rounded px-2 py-1 text-right bg-white outline-none" />
               </div>
               
               <div className="flex items-center justify-end gap-3 text-sm font-bold text-gray-800">
                  <span>Total</span>
                  <input type="text" readOnly value={finalTotal.toFixed(2)} className="w-32 border border-gray-300 rounded-lg px-3 py-1.5 text-right bg-white outline-none text-base font-semibold" />
               </div>
            </div>
          </div>

          {/* Description modal / terms modal */}
          {(showTerms || showDesc) && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
               <div className="bg-white rounded-lg shadow-xl w-full max-w-lg overflow-hidden">
                  <div className="flex justify-between items-center px-4 py-3 border-b border-gray-200">
                     <span className="font-bold text-sm text-gray-800">{showTerms ? "Terms & Conditions" : "Description"}</span>
                     <button onClick={() => { setShowTerms(false); setShowDesc(false); }} className="text-gray-400 hover:text-gray-600"><X size={16} /></button>
                  </div>
                  <div className="p-4">
                     <textarea
                       rows={4}
                       className="w-full border border-gray-300 rounded p-3 text-sm outline-none focus:border-blue-400 resize-none"
                       placeholder={showTerms ? "Add terms..." : "Add description..."}
                       value={showTerms ? termsText : description}
                       onChange={e => showTerms ? setTermsText(e.target.value) : setDescription(e.target.value)}
                     />
                  </div>
                  <div className="px-4 py-3 bg-gray-50 flex justify-end">
                     <button onClick={() => { setShowTerms(false); setShowDesc(false); }} className="bg-[#f58220] text-white px-6 py-1.5 rounded text-sm font-semibold">Done</button>
                  </div>
               </div>
            </div>
          )}

        </div>

        {/* ── Fixed Bottom Actions ── */}
        <div className="fixed bottom-0 right-0 left-64 bg-white border-t border-gray-200 px-6 py-3 flex items-center justify-end shrink-0 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] z-40">
          <div className="flex gap-3">
             <button
               onClick={() => handleSave(true)}
               disabled={saving}
               className="px-6 py-2 text-sm font-bold text-gray-500 hover:text-gray-700 hover:bg-gray-50 rounded-md border border-gray-200"
             >
               Save Draft
             </button>
             <div className="relative" ref={shareDropRef}>
                <button
                  onClick={() => setShowShareDrop(v => !v)}
                  className="flex items-center justify-center gap-1.5 px-6 py-2 text-sm font-bold text-[#f58220] bg-white border border-gray-200 rounded-md hover:bg-gray-50"
                >
                  <Share2 size={16} /> Share <ChevronDown size={14} />
                </button>
                {showShareDrop && (
                  <div className="absolute bottom-full mb-2 right-0 bg-white border border-gray-200 rounded-lg shadow-xl w-32 overflow-hidden text-sm z-50">
                     <button className="w-full text-left px-4 py-2 hover:bg-gray-50 text-gray-700">WhatsApp</button>
                     <button className="w-full text-left px-4 py-2 hover:bg-gray-50 text-gray-700">Email</button>
                  </div>
                )}
             </div>
             
             <button
               onClick={() => handleSave(false)}
               disabled={saving}
               className="flex items-center justify-center px-8 py-2 text-sm font-bold text-white bg-[#f58220] rounded-md hover:bg-[#e8740e] shadow-md"
             >
               {saving ? "Saving..." : "Save"}
             </button>
          </div>
        </div>
      </div>
    );
  }

  // ══════════════════════════════════════════════════════════════════════════
  // LIST VIEW — Simplified Clean UI
  // ══════════════════════════════════════════════════════════════════════════
  const fmt = (d: string) => new Date(d + "T00:00:00").toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });

  return (
    <div className="min-h-screen bg-gray-50 text-gray-800">

      {/* ── Page Header ── */}
      <div className="bg-white border-b border-gray-200 px-6 py-3 flex items-center justify-between">
        <h1 className="text-base font-bold text-gray-800 flex items-center gap-2">
          <Calculator className="h-5 w-5 text-[#f58220]" />
          Estimations
        </h1>
        <button
          onClick={openCreate}
          className="flex items-center gap-1.5 bg-[#f58220] hover:bg-[#e8740e] text-white text-sm font-semibold px-4 py-2 rounded-lg shadow-sm transition-colors"
        >
          <Plus className="h-4 w-4" /> New Estimate
        </button>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-5 space-y-5">

        {/* ── Summary Strip ── */}
        <div className="grid grid-cols-3 gap-4">
          {[
            { label: "Total Estimations", value: `₹${totalQuotations.toLocaleString("en-IN")}`, color: "text-gray-700", dot: "bg-gray-400" },
            { label: "Converted",         value: `₹${totalConverted.toLocaleString("en-IN")}`,  color: "text-emerald-600", dot: "bg-emerald-500" },
            { label: "Open",              value: `₹${totalOpen.toLocaleString("en-IN")}`,       color: "text-[#f58220]",   dot: "bg-[#f58220]" },
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
              placeholder="Search estimate or customer..."
              className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:border-[#f58220] bg-white"
            />
          </div>

          <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden bg-white">
            {["ALL", "SENT", "CONVERTED", "DRAFT"].map(s => (
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
              <Calculator className="h-8 w-8 text-[#f58220]" />
            </div>
            <div>
              <p className="text-gray-800 font-semibold">No Estimations Found</p>
              <p className="text-gray-500 text-sm mt-1">Create an estimate to share with your customers.</p>
            </div>
            <button
              onClick={openCreate}
              className="px-5 py-2.5 bg-[#f58220] hover:bg-[#e8740e] text-white font-semibold text-sm rounded-lg transition-colors"
            >
              Create Estimate
            </button>
          </div>
        ) : (
          /* ── Table ── */
          <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 text-gray-500 text-xs font-medium border-b border-gray-200 uppercase">
                  <th className="text-left px-4 py-3">Date</th>
                  <th className="text-left px-4 py-3">Est No</th>
                  <th className="text-left px-4 py-3">Party Name</th>
                  <th className="text-right px-4 py-3">Amount</th>
                  <th className="text-center px-4 py-3">Status</th>
                  <th className="text-right px-4 py-3">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filtered.map((est) => {
                  const style = STATUS_STYLES[est.status] || STATUS_STYLES.DRAFT;
                  const isDraft = est.status === "DRAFT";
                  return (
                    <tr 
                      key={est.id} 
                      className={clsx(
                        "transition-colors",
                        isDraft ? "hover:bg-orange-50/50 cursor-pointer bg-orange-50/30" : "hover:bg-gray-50"
                      )}
                      onClick={() => {
                        if (isDraft) loadDraft(est);
                      }}
                    >
                      <td className="px-4 py-3 text-xs text-gray-600 whitespace-nowrap">
                        {new Date(est.createdAt).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}
                      </td>
                      <td className="px-4 py-3 font-mono font-semibold text-gray-800 text-xs">
                        {est.quotationNumber}
                      </td>
                      <td className="px-4 py-3 text-sm">
                        <span className="font-medium text-gray-800">
                          {est.customerName || "—"}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right font-medium text-gray-800">
                        ₹ {(est.totalAmount || 0).toLocaleString("en-IN")}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className={clsx("inline-block px-2 py-0.5 rounded text-[11px] font-semibold border", style.color, style.bg, style.border)}>
                          {style.label}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-1">
                          {est.status !== "CONVERTED" && !isDraft && (
                             <button
                               onClick={(e) => { e.stopPropagation(); handleConvertToOrder(est.id); }}
                               disabled={!!converting}
                               className="px-2 py-1 bg-green-50 text-green-600 border border-green-200 rounded text-xs font-bold hover:bg-green-100 transition-colors mr-2"
                             >
                               {converting === est.id ? "..." : "Convert"}
                             </button>
                          )}
                          {isDraft ? (
                            <button
                              onClick={(e) => { e.stopPropagation(); handleDeleteDraft(est.id); }}
                              className="p-1 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                              title="Delete Draft"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          ) : (
                            <>
                              <button
                                onClick={(e) => e.stopPropagation()}
                                className="p-1 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded transition-colors"
                                title="Print"
                              >
                                <Printer className="h-4 w-4" />
                              </button>
                              <button
                                onClick={(e) => e.stopPropagation()}
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

