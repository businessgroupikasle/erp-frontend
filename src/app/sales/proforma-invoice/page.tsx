"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import {
  FilePlus2, Plus, RefreshCw, ChevronDown, X, Calendar,
  Search, ArrowLeft, ArrowRight,
  Check, Printer, Share2, Trash2, AlignLeft, FileText,
} from "lucide-react";
import { clsx } from "clsx";
import { customersApi, productsFullApi } from "@/lib/api";
import { useToast } from "@/context/ToastContext";
import api from "@/lib/api/base";

// ── Constants ─────────────────────────────────────────────────────────────────

const UNITS = [
  { label: "NONE", code: "NONE" },
  { label: "BAGS (BAG)", code: "BAG" },
  { label: "BOTTLES (BTL)", code: "BTL" },
  { label: "BOX (BOX)", code: "BOX" },
  { label: "BUNDLES (BDL)", code: "BDL" },
  { label: "KILOGRAMS (KGS)", code: "KGS" },
  { label: "LITERS (LTR)", code: "LTR" },
  { label: "METERS (MTR)", code: "MTR" },
  { label: "NUMBERS (NOS)", code: "NOS" },
  { label: "PIECES (PCS)", code: "PCS" },
  { label: "TONS (TNE)", code: "TNE" },
  { label: "UNITS (UNT)", code: "UNT" },
];

const TAX_OPTIONS = [
  { label: "None (0%)", value: 0 },
  { label: "GST @ 5%", value: 5 },
  { label: "GST @ 12%", value: 12 },
  { label: "GST @ 18%", value: 18 },
  { label: "GST @ 28%", value: 28 },
];

const INDIAN_STATES = [
  "Andhra Pradesh","Arunachal Pradesh","Assam","Bihar","Chhattisgarh",
  "Goa","Gujarat","Haryana","Himachal Pradesh","Jharkhand","Karnataka",
  "Kerala","Madhya Pradesh","Maharashtra","Manipur","Meghalaya","Mizoram",
  "Nagaland","Odisha","Punjab","Rajasthan","Sikkim","Tamil Nadu","Telangana",
  "Tripura","Uttar Pradesh","Uttarakhand","West Bengal","Delhi",
  "Jammu & Kashmir","Ladakh",
];

const PERIOD_OPTIONS = [
  { label: "This Month", value: "this_month" },
  { label: "Last Month", value: "last_month" },
  { label: "This Quarter", value: "this_quarter" },
  { label: "This Year", value: "this_year" },
];

function formatDate(dateStr: string) {
  if (!dateStr) return "";
  const d = new Date(dateStr + "T00:00:00");
  return `${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")}/${d.getFullYear()}`;
}

function getPeriodDates(period: string) {
  const now = new Date();
  const y = now.getFullYear();
  const m = now.getMonth();
  const pad = (n: number) => String(n).padStart(2, "0");
  const iso = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
  if (period === "last_month") return { start: iso(new Date(y, m - 1, 1)), end: iso(new Date(y, m, 0)) };
  if (period === "this_quarter") { const q = Math.floor(m / 3); return { start: iso(new Date(y, q * 3, 1)), end: iso(new Date(y, q * 3 + 3, 0)) }; }
  if (period === "this_year") return { start: iso(new Date(y, 0, 1)), end: iso(new Date(y, 11, 31)) };
  return { start: iso(new Date(y, m, 1)), end: iso(new Date(y, m + 1, 0)) };
}

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
}

function makeItem(): LineItem {
  return { id: Math.random().toString(36).slice(2), productId: "", itemSearch: "", qty: 1, unit: "NONE", rate: 0, discountPct: 0, taxPct: 0 };
}

function computeRow(item: LineItem) {
  const gross = item.qty * item.rate;
  const discAmt = parseFloat((gross * item.discountPct / 100).toFixed(2));
  const taxable = gross - discAmt;
  const taxAmt = parseFloat((taxable * item.taxPct / 100).toFixed(2));
  return { discAmt, taxAmt, amount: parseFloat((taxable + taxAmt).toFixed(2)) };
}

// ── Empty state ───────────────────────────────────────────────────────────────

function EmptyIllustration() {
  return (
    <div className="w-28 h-28 mx-auto mb-4 relative">
      <div className="absolute inset-0 rounded-full bg-orange-50 flex items-center justify-center">
        <div className="w-20 h-16 rounded-lg bg-white border-2 border-blue-100 flex flex-col gap-1.5 items-start justify-center px-3 shadow-sm">
          <div className="w-10 h-1.5 rounded bg-orange-200" />
          <div className="w-6 h-1.5 rounded bg-orange-100" />
          <div className="w-8 h-1.5 rounded bg-orange-100" />
        </div>
        <div className="absolute -top-2 -right-2 w-7 h-7 rounded-full bg-orange-100 border-2 border-orange-200 flex items-center justify-center">
          <FilePlus2 size={12} className="text-[#f58220]" />
        </div>
      </div>
    </div>
  );
}

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

// ── Main ──────────────────────────────────────────────────────────────────────

export default function ProformaInvoicePage() {
  const { showToast } = useToast();

  // filters state
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [dateFrom, setDateFrom] = useState(getPeriodDates("this_month").start);
  const [dateTo, setDateTo] = useState(getPeriodDates("this_month").end);
  const [showFromCal, setShowFromCal] = useState(false);
  const [showToCal, setShowToCal] = useState(false);
  const fromCalRef = useRef<HTMLDivElement>(null);
  const toCalRef = useRef<HTMLDivElement>(null);

  // list state
  const [proformas, setProformas] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState("this_month");
  const [showPeriodDrop, setShowPeriodDrop] = useState(false);
  const [dateRange, setDateRange] = useState(getPeriodDates("this_month"));
  const [customers, setCustomers] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);

  // create form state
  const [view, setView] = useState<"list" | "create">("list");
  const [saving, setSaving] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<any>(null);
  const [customerSearch, setCustomerSearch] = useState("");
  const [showCustomerDrop, setShowCustomerDrop] = useState(false);
  const [customerPhone, setCustomerPhone] = useState("");
  const [proformaDate, setProformaDate] = useState(new Date().toISOString().split("T")[0]);
  const [stateOfSupply, setStateOfSupply] = useState("");
  const [items, setItems] = useState<LineItem[]>([makeItem(), makeItem()]);
  const [showPriceDrop, setShowPriceDrop] = useState(false);
  const [priceMode, setPriceMode] = useState<"without_tax" | "with_tax">("without_tax");
  const [openItemDrop, setOpenItemDrop] = useState<string | null>(null);
  const [termsText, setTermsText] = useState("");
  const [showTerms, setShowTerms] = useState(false);
  const [description, setDescription] = useState("");
  const [showDesc, setShowDesc] = useState(false);
  const [roundOffEnabled, setRoundOffEnabled] = useState(true);
  const [showShareDrop, setShowShareDrop] = useState(false);
  const [draftId, setDraftId] = useState<string | null>(null);

  const periodDropRef = useRef<HTMLDivElement>(null);
  const customerDropRef = useRef<HTMLDivElement>(null);
  const shareDropRef = useRef<HTMLDivElement>(null);
  const priceDropRef = useRef<HTMLDivElement>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [qRes, cRes, pRes] = await Promise.allSettled([
        api.get("/api/sales/quotations").catch(() => ({ data: [] })),
        customersApi.getAll(),
        productsFullApi.getAll(),
      ]);
      
      let apiProformas = qRes.status === "fulfilled" ? (qRes.value as any).data || [] : [];
      
      // Filter out and merge local drafts
      try {
        const draftsStr = localStorage.getItem("sale_proforma_invoices_drafts");
        if (draftsStr) {
          const drafts = JSON.parse(draftsStr);
          apiProformas = [...drafts, ...apiProformas];
        }
      } catch (e) {
        console.error("Error loading drafts", e);
      }
      
      setProformas(apiProformas);
      if (cRes.status === "fulfilled") setCustomers((cRes.value as any).data || []);
      if (pRes.status === "fulfilled") setProducts((pRes.value as any).data || []);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (periodDropRef.current && !periodDropRef.current.contains(e.target as Node)) setShowPeriodDrop(false);
      if (customerDropRef.current && !customerDropRef.current.contains(e.target as Node)) setShowCustomerDrop(false);
      if (shareDropRef.current && !shareDropRef.current.contains(e.target as Node)) setShowShareDrop(false);
      if (priceDropRef.current && !priceDropRef.current.contains(e.target as Node)) setShowPriceDrop(false);
      if (fromCalRef.current && !fromCalRef.current.contains(e.target as Node)) setShowFromCal(false);
      if (toCalRef.current && !toCalRef.current.contains(e.target as Node)) setShowToCal(false);

      // Close item drop if clicked outside
      if (openItemDrop) {
        const isInput = (e.target as HTMLElement).tagName === "INPUT" && (e.target as HTMLInputElement).placeholder === "Search item...";
        const isDrop = (e.target as HTMLElement).closest(".item-dropdown-container");
        if (!isInput && !isDrop) {
          setOpenItemDrop(null);
        }
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [openItemDrop]);

  // ── Computed totals ────────────────────────────────────────────────────────
  const rowData = items.map(item => ({ item, ...computeRow(item) }));
  const totalQty = items.reduce((s, i) => s + i.qty, 0);
  const totalDisc = parseFloat(rowData.reduce((s, r) => s + r.discAmt, 0).toFixed(2));
  const totalTax = parseFloat(rowData.reduce((s, r) => s + r.taxAmt, 0).toFixed(2));
  const totalAmount = parseFloat(rowData.reduce((s, r) => s + r.amount, 0).toFixed(2));
  const roundOff = roundOffEnabled ? parseFloat((Math.round(totalAmount) - totalAmount).toFixed(2)) : 0;
  const finalTotal = parseFloat((totalAmount + roundOff).toFixed(2));


  const filtered = proformas.filter((p: any) => {
    if (statusFilter !== "ALL") {
      if (statusFilter === "DRAFT" && p.status !== "DRAFT") return false;
      if (statusFilter === "CONVERTED" && p.status !== "CONVERTED") return false;
      if (statusFilter === "SENT" && p.status !== "SENT") return false;
    }
    if (search) {
      const q = search.toLowerCase();
      const entityName = (p.customer?.name || "").toLowerCase();
      const num = (p.quotationNumber || "").toLowerCase();
      if (!entityName.includes(q) && !num.includes(q)) return false;
    }
    
    // date filter
    const d = new Date(p.quotationDate || p.createdAt || "2000-01-01");
    const dFrom = new Date(dateFrom);
    const dTo = new Date(dateTo);
    dTo.setHours(23, 59, 59, 999);
    if (d < dFrom || d > dTo) return false;
    
    return true;
  });

  const totalConverted = filtered.filter((p: any) => p.status === "CONVERTED").reduce((s: number, p: any) => s + (p.totalAmount || 0), 0);
  const totalOpen = filtered.filter((p: any) => p.status !== "CONVERTED").reduce((s: number, p: any) => s + (p.totalAmount || 0), 0);
  const grandTotal = filtered.reduce((s: number, p: any) => s + (p.totalAmount || 0), 0);

  const periodLabel = PERIOD_OPTIONS.find(o => o.value === period)?.label || "This Month";

  const filteredCustomers = customers.filter(c =>
    !customerSearch || c.name?.toLowerCase().includes(customerSearch.toLowerCase()) || c.phone?.includes(customerSearch)
  );

  const selectProduct = (idx: number, p: any) => {
    setItems(prev => prev.map((it, i) => i === idx ? { ...it, productId: p.id, itemSearch: p.name, rate: p.basePrice || p.price || 0, unit: p.unit || "NONE", taxPct: p.taxPercent || 0 } : it));
    setOpenItemDrop(null);
  };

  const updateItem = (idx: number, field: keyof LineItem, value: any) =>
    setItems(prev => prev.map((it, i) => i === idx ? { ...it, [field]: value } : it));

  const openCreate = () => {
    setDraftId(null);
    setSelectedCustomer(null); setCustomerSearch(""); setCustomerPhone("");
    setProformaDate(new Date().toISOString().split("T")[0]); setStateOfSupply("");
    setItems([makeItem(), makeItem()]); setPriceMode("without_tax");
    setTermsText(""); setShowTerms(false); setDescription(""); setShowDesc(false);
    setRoundOffEnabled(true); setView("create");
  };


  const handleDeleteDraft = (id: string) => {
    try {
      const draftsStr = localStorage.getItem("sale_proforma_invoices_drafts");
      if (draftsStr) {
        const drafts = JSON.parse(draftsStr);
        const newDrafts = drafts.filter((d: any) => d.id !== id);
        localStorage.setItem("sale_proforma_invoices_drafts", JSON.stringify(newDrafts));
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
    setProformaDate(raw.proformaDate || new Date().toISOString().split("T")[0]);
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

  const handleSave = async (andNew = false, isDraft = false) => {
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
      quotationDate: proformaDate,
      quotationNumber: "DRAFT",
      customer: selectedCustomer || { name: "Unknown Customer" },
      totalAmount: finalTotal,
      _rawState: {
        selectedCustomer,
        customerSearch,
        customerPhone,
        proformaDate,
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
        const draftsStr = localStorage.getItem("sale_proforma_invoices_drafts");
        let drafts = draftsStr ? JSON.parse(draftsStr) : [];
        if (draftId) {
          drafts = drafts.filter((d: any) => d.id !== draftId);
        }
        drafts.unshift(draftPayload);
        localStorage.setItem("sale_proforma_invoices_drafts", JSON.stringify(drafts));
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
      await api.post("/api/sales/quotations", {
        customerId: selectedCustomer.id,
        customerName: selectedCustomer.name,
        validUntil: proformaDate,
        termsConditions: termsText || undefined,
        notes: description || undefined,
        items: validItems.map(i => ({
          productId: i.productId || undefined,
          productName: i.itemSearch,
          quantity: i.qty,
          unit: i.unit,
          rate: i.rate,
          taxPercent: i.taxPct,
        })),
      });

      // If we saved a proforma that was previously a draft, remove the draft
      if (draftId) {
        try {
          const draftsStr = localStorage.getItem("sale_proforma_invoices_drafts");
          if (draftsStr) {
            const drafts = JSON.parse(draftsStr);
            const newDrafts = drafts.filter((d: any) => d.id !== draftId);
            localStorage.setItem("sale_proforma_invoices_drafts", JSON.stringify(newDrafts));
          }
        } catch (e) {
          console.error("Failed to clear draft", e);
        }
      }

      showToast("Proforma invoice saved", "success");
      fetchData();
      if (andNew) openCreate(); else setView("list");
    } catch (e: any) {
      showToast(e?.response?.data?.error || "Failed to save proforma invoice", "error");
    } finally {
      setSaving(false);
    }
  };

  // ── CREATE VIEW ────────────────────────────────────────────────────────────
  if (view === "create") {
    return (
      <div className="flex flex-col bg-gray-50" style={{ height: 'calc(100vh - 104px)' }}>

        {/* Top bar */}
        <div className="bg-white border-b border-gray-200 px-6 py-3 flex items-center gap-3 shrink-0">
          <button onClick={() => setView("list")} className="p-1.5 hover:bg-gray-100 rounded-lg text-gray-500 transition-colors">
            <ArrowLeft size={18} />
          </button>
          <h2 className="text-lg font-bold text-gray-800">Proforma Invoice</h2>
        </div>

        {/* Scrollable body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">

          {/* Customer + Invoice info */}
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-8">
              {/* Left: Party + Phone */}
              <div className="space-y-4">
                <div className="relative" ref={customerDropRef}>
                  <label className="block text-xs font-semibold text-gray-500 mb-1.5">Party *</label>
                  <div
                    className={clsx(
                      "flex items-center gap-2 border rounded-lg px-3 py-2 cursor-pointer bg-white transition-all",
                      showCustomerDrop ? "border-orange-400 ring-1 ring-orange-200" : "border-gray-300 hover:border-gray-400"
                    )}
                    onClick={() => setShowCustomerDrop(v => !v)}
                  >
                    <input
                      className="flex-1 text-sm text-gray-700 outline-none bg-transparent placeholder-gray-400"
                      placeholder="Select or search party"
                      value={customerSearch}
                      onChange={e => { setCustomerSearch(e.target.value); setShowCustomerDrop(true); }}
                      onClick={e => { e.stopPropagation(); setShowCustomerDrop(true); }}
                    />
                    <ChevronDown size={14} className="text-gray-400 shrink-0" />
                  </div>
                  {showCustomerDrop && (
                    <div className="absolute top-full left-0 z-50 mt-1 w-72 bg-white border border-gray-200 rounded-lg shadow-lg max-h-64 overflow-y-auto">
                      <button className="w-full flex items-center gap-2 px-3 py-2.5 text-sm text-[#f58220] hover:bg-orange-50 border-b border-gray-100" onClick={() => setShowCustomerDrop(false)}>
                        <Plus size={14} /> Add Party
                      </button>
                      {filteredCustomers.length === 0 ? (
                        <div className="px-3 py-4 text-sm text-gray-400 text-center">No customers found</div>
                      ) : filteredCustomers.map(c => (
                        <button
                          key={c.id}
                          className="w-full flex items-center justify-between px-3 py-2.5 hover:bg-gray-50 border-b border-gray-50 last:border-0 text-left"
                          onClick={() => { setSelectedCustomer(c); setCustomerSearch(c.name); setCustomerPhone(c.phone || ""); setShowCustomerDrop(false); }}
                        >
                          <div>
                            <div className="text-sm font-medium text-gray-800">{c.name}</div>
                            <div className="text-xs text-gray-400">{c.phone || "—"}</div>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1.5">Phone</label>
                  <input
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-700 outline-none focus:border-orange-400 bg-white"
                    placeholder="Phone number"
                    value={customerPhone}
                    onChange={e => setCustomerPhone(e.target.value)}
                  />
                </div>
              </div>

              {/* Right: Proforma No, Date, State of Supply */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1.5">Proforma No.</label>
                  <div className="border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-400 bg-gray-50 font-mono">Auto</div>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1.5">Date</label>
                  <input
                    type="date"
                    value={proformaDate}
                    onChange={e => setProformaDate(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-700 outline-none focus:border-orange-400 bg-white"
                  />
                </div>
                <div className="col-span-2">
                  <label className="block text-xs font-semibold text-gray-500 mb-1.5">State of Supply</label>
                  <select
                    value={stateOfSupply}
                    onChange={e => setStateOfSupply(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-700 outline-none focus:border-orange-400 bg-white"
                  >
                    <option value="">Select state</option>
                    {INDIAN_STATES.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Items Table */}
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <div className="flex items-center px-4 py-2.5 border-b border-gray-100 bg-gray-50/60">
              <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Items</span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm min-w-[768px]">
              <thead>
                <tr className="bg-gray-50 text-gray-500 text-xs border-b border-gray-100">
                  <th className="text-left px-4 py-2.5 w-10 font-medium">#</th>
                  <th className="text-left px-4 py-2.5 font-medium">Item</th>
                  <th className="text-center px-4 py-2.5 w-20 font-medium">Qty</th>
                  <th className="text-left px-4 py-2.5 w-28 font-medium">Unit</th>
                  <th className="text-right px-4 py-2.5 w-28 font-medium">Price/Unit</th>
                  <th className="text-center px-4 py-2.5 w-20 font-medium">Disc%</th>
                  <th className="text-left px-4 py-2.5 w-36 font-medium">Tax</th>
                  <th className="text-right px-4 py-2.5 w-32 font-medium">Amount</th>
                  <th className="w-10"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {items.map((item, idx) => {
                  const { discAmt, taxAmt, amount } = computeRow(item);
                  const filtProd = products.filter(p => !item.itemSearch || p.name?.toLowerCase().includes(item.itemSearch.toLowerCase())).slice(0, 10);
                  return (
                    <tr key={item.id} className="hover:bg-gray-50/50">
                      <td className="px-4 py-2.5 text-center text-xs text-gray-400">{idx + 1}</td>
                      <td className="px-4 py-2.5 relative">
                        <input
                          className="w-full px-3 py-1.5 border border-gray-200 rounded-md text-sm outline-none focus:border-orange-400"
                          placeholder="Search item..."
                          value={item.itemSearch}
                          onChange={e => { updateItem(idx, "itemSearch", e.target.value); updateItem(idx, "productId", ""); setOpenItemDrop(item.id); }}
                          onFocus={() => setOpenItemDrop(item.id)}
                        />
                        {openItemDrop === item.id && filtProd.length > 0 && (
                          <div className="absolute left-4 right-4 top-full mt-1 z-50 bg-white border border-gray-200 rounded-lg shadow-lg max-h-44 overflow-y-auto item-dropdown-container">
                            {filtProd.map(p => (
                              <button key={p.id} className="w-full flex items-center justify-between px-3 py-2 hover:bg-orange-50 text-left border-b border-gray-50 last:border-0 text-xs" onMouseDown={() => selectProduct(idx, p)}>
                                <div>
                                  <div className="text-sm text-gray-800">{p.name}</div>
                                  <div className="text-xs text-gray-400">₹{p.basePrice || p.price || 0}</div>
                                </div>
                              </button>
                            ))}
                          </div>
                        )}
                      </td>
                      <td className="px-4 py-2.5">
                        <input type="number" min={0} value={item.qty} onChange={e => updateItem(idx, "qty", Number(e.target.value))} className="w-full px-2 py-1.5 border border-gray-200 rounded-md text-sm text-center outline-none focus:border-orange-400" />
                      </td>
                      <td className="px-4 py-2.5">
                        <select value={item.unit} onChange={e => updateItem(idx, "unit", e.target.value)} className="w-full px-2 py-1.5 border border-gray-200 rounded-md text-sm bg-white outline-none focus:border-orange-400">
                          {UNITS.map(u => <option key={u.code} value={u.code}>{u.label}</option>)}
                        </select>
                      </td>
                      <td className="px-4 py-2.5">
                        <div className="relative">
                          <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-xs text-gray-400">₹</span>
                          <input type="number" min={0} value={item.rate || ""} placeholder="0.00" onChange={e => updateItem(idx, "rate", Number(e.target.value))} className="w-full pl-6 pr-2 py-1.5 border border-gray-200 rounded-md text-sm text-right outline-none focus:border-orange-400" />
                        </div>
                      </td>
                      <td className="px-4 py-2.5">
                        <input type="number" min={0} max={100} value={item.discountPct || ""} placeholder="0" onChange={e => updateItem(idx, "discountPct", Number(e.target.value))} className="w-full px-2 py-1.5 border border-gray-200 rounded-md text-sm text-center outline-none focus:border-orange-400" />
                        {discAmt > 0 && <div className="text-[10px] text-right text-gray-400 mt-0.5 font-mono">-₹{discAmt.toFixed(2)}</div>}
                      </td>
                      <td className="px-4 py-2.5">
                        <select value={item.taxPct} onChange={e => updateItem(idx, "taxPct", Number(e.target.value))} className="w-full px-2 py-1.5 border border-gray-200 rounded-md text-sm bg-white outline-none focus:border-orange-400">
                          {TAX_OPTIONS.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                        </select>
                        {taxAmt > 0 && <div className="text-[10px] text-right text-gray-400 mt-0.5 font-mono">₹{taxAmt.toFixed(2)}</div>}
                      </td>
                      <td className="px-4 py-2.5 text-right font-mono text-sm font-semibold text-gray-700">
                        {amount > 0 ? `₹${amount.toFixed(2)}` : "—"}
                      </td>
                      <td className="px-4 py-2.5 text-center">
                        <button onClick={() => { if (items.length > 1) setItems(prev => prev.filter((_, i) => i !== idx)); }} className="p-1 hover:bg-red-50 text-gray-300 hover:text-red-500 rounded transition-colors">
                          <Trash2 size={14} />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            </div>
            <div className="px-4 py-3 border-t border-gray-100 flex items-center justify-between">
              <button onClick={() => setItems(prev => [...prev, makeItem()])} className="flex items-center gap-1.5 px-3 py-1.5 border border-gray-200 hover:border-orange-300 hover:bg-orange-50 rounded-lg text-xs font-semibold text-gray-600 transition-all">
                <Plus className="h-3.5 w-3.5" /> Add Row
              </button>
              <div className="flex items-center gap-5 text-xs text-gray-400">
                <span>Qty: <strong className="text-gray-700">{totalQty}</strong></span>
                {totalDisc > 0 && <span>Disc: <strong className="text-gray-700 font-mono">₹{totalDisc.toFixed(2)}</strong></span>}
                <span>Tax: <strong className="text-gray-700 font-mono">₹{totalTax.toFixed(2)}</strong></span>
              </div>
            </div>
          </div>

          {/* Notes + Summary */}
          <div className="flex flex-col md:flex-row gap-4 items-start w-full">
            <div className="flex-1 bg-white rounded-xl border border-gray-200 p-4 space-y-3">
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setShowTerms(v => !v)}
                  className={clsx(
                    "flex items-center gap-1.5 px-3 py-1.5 border rounded-lg text-xs font-semibold transition-all",
                    showTerms ? "border-orange-400 bg-orange-50 text-orange-600" : "border-gray-200 text-gray-600 hover:bg-gray-50"
                  )}
                >
                  <AlignLeft className="h-3.5 w-3.5" /> Terms & Conditions
                </button>
                <button
                  onClick={() => setShowDesc(v => !v)}
                  className={clsx(
                    "flex items-center gap-1.5 px-3 py-1.5 border rounded-lg text-xs font-semibold transition-all",
                    showDesc ? "border-orange-400 bg-orange-50 text-orange-600" : "border-gray-200 text-gray-600 hover:bg-gray-50"
                  )}
                >
                  <FileText className="h-3.5 w-3.5" /> Description
                </button>
                
              </div>
              {showTerms && (
                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1.5">Terms & Conditions</label>
                  <textarea value={termsText} onChange={e => setTermsText(e.target.value)} rows={3} placeholder="Terms and conditions..." className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm outline-none resize-none focus:border-orange-400" />
                </div>
              )}
              {showDesc && (
                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1.5">Description</label>
                  <textarea value={description} onChange={e => setDescription(e.target.value)} rows={3} placeholder="Description..." className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm outline-none resize-none focus:border-orange-400" />
                </div>
              )}
            </div>

            <div className="bg-white rounded-xl border border-gray-200 p-4 w-full md:w-64 shrink-0 space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-500">Subtotal</span>
                <span className="font-mono font-semibold text-gray-700">₹{totalAmount.toFixed(2)}</span>
              </div>
              {totalDisc > 0 && (
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500">Discount</span>
                  <span className="font-mono text-gray-600">-₹{totalDisc.toFixed(2)}</span>
                </div>
              )}
              {totalTax > 0 && (
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500">Tax</span>
                  <span className="font-mono text-gray-600">₹{totalTax.toFixed(2)}</span>
                </div>
              )}
              <div className="flex items-center justify-between text-sm">
                <label htmlFor="pf_roundoff" className="flex items-center gap-1.5 text-gray-500 cursor-pointer">
                  <input
                    type="checkbox"
                    id="pf_roundoff"
                    checked={roundOffEnabled}
                    onChange={e => setRoundOffEnabled(e.target.checked)}
                    className="h-3.5 w-3.5 rounded border-gray-300"
                  />
                  Round Off
                </label>
                <span className="font-mono text-gray-500 text-xs">{roundOff >= 0 ? "+" : ""}₹{roundOff.toFixed(2)}</span>
              </div>
              <div className="pt-2 border-t border-gray-100 flex items-center justify-between">
                <span className="font-bold text-gray-800">Total</span>
                <span className="text-xl font-bold font-mono text-[#f58220]">₹{finalTotal.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Action Bar */}
        <div className="bg-white border-t border-gray-200 px-6 py-3 flex items-center justify-end gap-3 shrink-0">
          <button onClick={() => setView("list")} className="px-4 py-2 text-sm font-semibold border border-gray-200 hover:bg-gray-50 rounded-lg text-gray-600 transition-colors">
            Cancel
          </button>
          <button onClick={() => handleSave(false, true)} disabled={saving} className="px-4 py-2 text-sm font-semibold border border-gray-200 hover:bg-gray-50 rounded-lg text-gray-700 transition-colors disabled:opacity-50">
            Save Draft
          </button>
          <div className="relative" ref={shareDropRef}>
            <button onClick={() => setShowShareDrop(v => !v)} className="flex items-center gap-1.5 px-4 py-2 text-sm font-semibold border border-orange-200 hover:bg-orange-50 rounded-lg text-[#f58220] transition-colors">
              <Share2 size={15} /> Share <ChevronDown size={13} />
            </button>
            {showShareDrop && (
              <div className="absolute bottom-full mb-2 right-0 bg-white border border-gray-200 rounded-lg shadow-lg text-sm min-w-[160px] z-50">
                <button className="w-full px-4 py-2 text-left hover:bg-gray-50 text-gray-700 flex items-center gap-2"><Printer size={13} /> Print</button>
                <button className="w-full px-4 py-2 text-left hover:bg-gray-50 text-gray-700 flex items-center gap-2"><Share2 size={13} /> Share</button>
                <button className="w-full px-4 py-2 text-left hover:bg-gray-50 text-gray-700" onClick={() => { setShowShareDrop(false); handleSave(true); }}>Save &amp; New</button>
              </div>
            )}
          </div>
          <button onClick={() => handleSave(false)} disabled={saving} className="flex items-center gap-2 px-5 py-2 text-sm font-bold bg-[#f58220] hover:bg-[#e8740e] text-white rounded-lg transition-colors disabled:opacity-50">
            <Check className="h-4 w-4" /> {saving ? "Saving..." : "Save Proforma"}
          </button>
        </div>
      </div>
    );
  }

  // ── LIST VIEW ──────────────────────────────────────────────────────────────
  const fmt = (d: string) => new Date(d + "T00:00:00").toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });

  return (
    <div className="min-h-screen bg-gray-50 text-gray-800">

      {/* ── Page Header ── */}
      <div className="bg-white border-b border-gray-200 px-6 py-3 flex items-center justify-between">
        <h1 className="text-base font-bold text-gray-800 flex items-center gap-2">
          <FilePlus2 className="h-5 w-5 text-[#f58220]" />
          Proforma Invoices
        </h1>
        <button
          onClick={openCreate}
          className="flex items-center gap-1.5 bg-[#f58220] hover:bg-[#e8740e] text-white text-sm font-semibold px-4 py-2 rounded-lg shadow-sm transition-colors"
        >
          <Plus className="h-4 w-4" /> New Proforma
        </button>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-5 space-y-5">

        {/* ── Summary Strip ── */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            { label: "Total Quotations", value: `₹${grandTotal.toLocaleString("en-IN")}`, color: "text-gray-700", dot: "bg-gray-400" },
            { label: "Converted",        value: `₹${totalConverted.toLocaleString("en-IN")}`,  color: "text-emerald-600", dot: "bg-emerald-500" },
            { label: "Open",             value: `₹${totalOpen.toLocaleString("en-IN")}`,       color: "text-[#f58220]",   dot: "bg-[#f58220]" },
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
              placeholder="Search proforma or customer..."
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
              <FilePlus2 className="h-8 w-8 text-[#f58220]" />
            </div>
            <div>
              <p className="text-gray-800 font-semibold">No Proformas Found</p>
              <p className="text-gray-500 text-sm mt-1">Create a proforma invoice to share with your customers.</p>
            </div>
            <button
              onClick={openCreate}
              className="px-5 py-2.5 bg-[#f58220] hover:bg-[#e8740e] text-white font-semibold text-sm rounded-lg transition-colors"
            >
              Create Proforma
            </button>
          </div>
        ) : (
          /* ── Table ── */
          <div className="bg-white rounded-lg border border-gray-200 overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 text-gray-500 text-xs font-medium border-b border-gray-200 uppercase">
                  <th className="text-left px-4 py-3">Date</th>
                  <th className="text-left px-4 py-3">Proforma No.</th>
                  <th className="text-left px-4 py-3">Party Name</th>
                  <th className="text-right px-4 py-3">Amount</th>
                  <th className="text-center px-4 py-3">Status</th>
                  <th className="text-right px-4 py-3">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filtered.map((p: any) => {
                  const isDraft = p.status === "DRAFT";
                  const isConverted = p.status === "CONVERTED";
                  return (
                    <tr 
                      key={p.id} 
                      className={clsx(
                        "transition-colors",
                        isDraft ? "hover:bg-orange-50/50 cursor-pointer bg-orange-50/30" : "hover:bg-gray-50"
                      )}
                      onClick={() => {
                        if (isDraft) loadDraft(p);
                      }}
                    >
                      <td className="px-4 py-3 text-xs text-gray-600 whitespace-nowrap">
                        {p.quotationDate ? new Date(p.quotationDate).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }) : "—"}
                      </td>
                      <td className="px-4 py-3 font-mono font-semibold text-gray-800 text-xs">
                        {p.quotationNumber || p.id?.substring(0, 8).toUpperCase() || "—"}
                      </td>
                      <td className="px-4 py-3 text-sm">
                        <span className="font-medium text-gray-800">
                          {p.customer?.name || "—"}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right font-medium text-gray-800">
                        ₹ {(p.totalAmount || 0).toLocaleString("en-IN")}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className={clsx("inline-block px-2 py-0.5 rounded text-[11px] font-semibold border uppercase",
                          isConverted ? "bg-green-100 text-green-700 border-green-200" :
                          isDraft ? "bg-yellow-50 text-yellow-700 border-yellow-200" : "bg-orange-100 text-[#f58220] border-orange-200"
                        )}>
                          {isConverted ? "Converted" : isDraft ? "Draft" : "Open"}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-1">
                          {isDraft ? (
                            <button
                              onClick={(e) => { e.stopPropagation(); handleDeleteDraft(p.id); }}
                              className="p-1 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                              title="Delete Draft"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          ) : (
                            <>
                              <button
                                className="p-1 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded transition-colors"
                                title="Print"
                              >
                                <Printer className="h-4 w-4" />
                              </button>
                              <button
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
