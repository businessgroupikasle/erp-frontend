"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import {
  Receipt, Plus, Search, RefreshCw, X, User,
  Printer, ChevronDown, Trash2, Check, Share2, Calendar,
  AlignLeft, Image, FileText, ArrowLeft
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
  const [partyTab, setPartyTab] = useState<"GST" | "CREDIT" | "ADDITIONAL">("GST");
  const [newParty, setNewParty] = useState({
    name: "", phone: "", email: "", gstin: "", gstType: "Unregistered/Consumer",
    state: "", billingAddress: "", shippingAddress: "", openingBalance: "", creditLimit: ""
  });
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
      const [iRes, cRes, pRes] = await Promise.allSettled([
        api.get("/api/finance/invoices").catch(() => ({ data: [] })),
        customersApi.getAll(),
        productsFullApi.getAll(),
      ]);
      
      let apiInvoices = iRes.status === "fulfilled" ? (iRes.value as any).data || [] : [];
      
      // Merge local drafts
      try {
        const draftsStr = localStorage.getItem("sale_invoices_drafts");
        if (draftsStr) {
          const drafts = JSON.parse(draftsStr);
          apiInvoices = [...drafts, ...apiInvoices];
        }
      } catch (e) {
        console.error("Error loading drafts", e);
      }
      
      setInvoices(apiInvoices);
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

    const draftPayload = {
      id: draftId || `draft_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      status: "DRAFT",
      createdAt: new Date().toISOString(),
      order: {
        invoiceNum: "DRAFT",
        customer: selectedCustomer || { name: "Unknown Customer" },
        orderItems: validItems.map(i => ({
          product: { name: i.itemSearch },
          quantity: i.qty,
          price: i.rate,
          taxAmount: (i.qty * i.rate * (i.taxPct / 100)),
          totalAmount: (i.qty * i.rate) + (i.qty * i.rate * (i.taxPct / 100)),
        }))
      },
      finalAmount: finalTotal,
      // Store raw state to restore later
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
      try {
        const draftsStr = localStorage.getItem("sale_invoices_drafts");
        let drafts = draftsStr ? JSON.parse(draftsStr) : [];
        if (draftId) {
          drafts = drafts.filter((d: any) => d.id !== draftId);
        }
        drafts.unshift(draftPayload);
        localStorage.setItem("sale_invoices_drafts", JSON.stringify(drafts));
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
          const draftsStr = localStorage.getItem("sale_invoices_drafts");
          if (draftsStr) {
            const drafts = JSON.parse(draftsStr);
            const newDrafts = drafts.filter((d: any) => d.id !== draftId);
            localStorage.setItem("sale_invoices_drafts", JSON.stringify(newDrafts));
          }
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
    <body><h2>Tax Invoice — ${inv.order?.invoiceNum || ""}</h2>
    <p>Customer: ${inv.order?.customer?.name || ""}</p>
    <p>Date: ${new Date(inv.createdAt).toLocaleDateString()}</p>
    <table><thead><tr><th>Item</th><th>Qty</th><th>Rate</th><th>Tax</th><th>Amount</th></tr></thead>
    <tbody>${(inv.order?.orderItems || []).map((it: any) =>
      `<tr><td>${it.product?.name || ""}</td><td>${it.quantity}</td><td>₹${it.price}</td><td>₹${(it.taxAmount || 0).toFixed(2)}</td><td>₹${(it.totalAmount || 0).toFixed(2)}</td></tr>`
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
      <div className="flex flex-col bg-[#f0f0f0] overflow-hidden" style={{ height: 'calc(100vh - 56px)' }}>

        {/* ── Top bar ── */}
        <div className="bg-white border-b border-gray-200 px-4 py-2 flex items-center gap-3 shrink-0">
          <button onClick={handleBack} className="p-1 hover:bg-gray-100 rounded text-gray-600 transition-colors">
            <ArrowLeft size={18} />
          </button>
          <span className="text-base font-semibold text-gray-800">Sale</span>
        </div>

        {/* ── Scrollable body ── */}
        <div className="flex-1 overflow-y-auto min-h-0">

          {/* ── Customer + Invoice info row ── */}
          <div className="bg-[#f0f0f0] px-6 py-2 flex flex-wrap items-start gap-4">

            {/* Customer dropdown */}
            <div className="relative" ref={customerDropRef}>
              <div
                className={clsx(
                  "flex items-center gap-1 min-w-[220px] bg-white border rounded px-2 py-1.5 cursor-pointer",
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
                <div className="absolute top-full left-0 z-50 mt-1 w-72 bg-white border border-gray-200 rounded-xl shadow-xl overflow-hidden">
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
            <div className="bg-white border border-gray-300 rounded px-2 py-1.5 min-w-[160px]">
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
          <div style={{ minHeight: 220, overflowX: "auto", overflowY: "visible" }}>
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
                        {openItemDrop === item.id && filtProd.length > 0 && itemDropRect && (
                          <div
                            className="bg-white border border-gray-200 rounded-xl shadow-2xl max-h-60 overflow-y-auto"
                            style={{ position: "fixed", top: itemDropRect.top + 4, left: itemDropRect.left, width: itemDropRect.width, zIndex: 9999 }}
                          >
                            {filtProd.map(p => (
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
                            ))}
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
                          value={item.taxPct}
                          onChange={e => updateItem(idx, "taxPct", Number(e.target.value))}
                          className="w-full text-xs text-gray-700 outline-none bg-transparent cursor-pointer"
                        >
                          {TAX_OPTIONS.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
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
          <div className="px-6 py-2 flex flex-wrap gap-4 items-start bg-[#f0f0f0]">

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
                <Image size={13} />
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
        <div className="bg-white border-t border-gray-200 px-6 py-1.5 flex items-center justify-end gap-3 shrink-0">
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
                className="px-4 py-1.5 text-sm font-medium text-white bg-orange-500 hover:bg-orange-600 rounded-l border-r border-orange-400"
              >
                Share
              </button>
              <button
                onClick={() => setShowShareDrop(v => !v)}
                className="px-2 py-1.5 text-sm text-white bg-orange-500 hover:bg-orange-600 rounded-r"
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
            className="px-6 py-1.5 text-sm font-semibold text-white bg-orange-500 hover:bg-orange-600 rounded disabled:opacity-60"
          >
            {saving ? "Saving..." : "Save"}
          </button>
        </div>
      {/* ── Add Party Modal ── */}
      {showAddParty && (
        <div className="fixed inset-0 z-[100] bg-black/40 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-[480px] overflow-hidden flex flex-col max-h-[90vh]">
            {/* Header */}
            <div className="px-5 py-3 border-b border-gray-100 flex items-center justify-between bg-[#f8fafc]">
              <h2 className="text-[17px] font-bold text-[#1e3a8a]">Add Party</h2>
              <button onClick={() => setShowAddParty(false)} className="text-gray-400 hover:text-gray-600">
                <X size={20} />
              </button>
            </div>

            <div className="p-5 overflow-y-auto flex-1">
              {/* Top Inputs */}
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div>
                  <div className="relative">
                    <label className="absolute -top-2 left-2 bg-white px-1 text-[10px] font-semibold text-blue-600">Party Name *</label>
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
                  <input
                    type="text"
                    placeholder="GSTIN"
                    value={newParty.gstin}
                    onChange={e => setNewParty(p => ({ ...p, gstin: e.target.value }))}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-gray-400 bg-white placeholder-gray-400"
                  />
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
                    partyTab === "GST" ? "border-blue-500 text-blue-600" : "border-transparent text-gray-400 hover:text-gray-600"
                  )}
                >
                  GST &amp; Address
                </button>
                <button
                  onClick={() => setPartyTab("CREDIT")}
                  className={clsx(
                    "flex-1 text-center py-2 text-sm font-bold border-b-2 transition-colors",
                    partyTab === "CREDIT" ? "border-blue-500 text-blue-600" : "border-transparent text-gray-400 hover:text-gray-600"
                  )}
                >
                  Credit &amp; Balance
                </button>
                <button
                  onClick={() => setPartyTab("ADDITIONAL")}
                  className={clsx(
                    "flex-1 flex items-center justify-center gap-1.5 py-2 text-sm font-bold border-b-2 transition-colors",
                    partyTab === "ADDITIONAL" ? "border-blue-500 text-blue-600" : "border-transparent text-gray-400 hover:text-gray-600"
                  )}
                >
                  <span className="bg-red-500 text-white text-[9px] px-1.5 py-0.5 rounded leading-none">New</span>
                  Additional Fields
                </button>
              </div>

              {/* Tab Content */}
              {partyTab === "GST" && (
                <div className="flex gap-6">
                  <div className="flex-1 space-y-4">
                    <div className="relative">
                      <label className="absolute -top-2 left-2 bg-white px-1 text-[10px] font-semibold text-blue-600">GST Type</label>
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
                      className="w-full h-24 border border-gray-300 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-gray-400 bg-white placeholder-gray-400 resize-none"
                    />
                    <div className="text-right">
                      <button className="text-blue-500 text-[11px] font-semibold hover:underline">Show Detailed Address</button>
                    </div>
                    <div className="mt-2">
                      <label className="text-[11px] font-bold text-gray-700 block mb-1">Shipping Address</label>
                      <button className="text-blue-500 text-[11px] font-semibold hover:underline">+ Enable Shipping Address</button>
                    </div>
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

              {partyTab === "ADDITIONAL" && (
                <div className="text-sm text-gray-500 italic py-4 text-center">
                  Additional custom fields will appear here.
                </div>
              )}
            </div>

            {/* Footer Buttons */}
            <div className="px-5 py-3 border-t border-gray-100 flex items-center justify-end gap-3 bg-white">
              <button
                className="px-6 py-2 border-2 border-blue-500 text-blue-600 rounded-lg font-bold text-sm hover:bg-blue-50 transition-colors"
                onClick={() => {
                  // If we need to "Save & New", we can call API and leave modal open.
                  // For now, simple behavior:
                }}
              >
                Save &amp; New
              </button>
              <button
                disabled={!newParty.name.trim() || savingParty}
                className="px-8 py-2 bg-blue-500 text-white rounded-lg font-bold text-sm hover:bg-blue-600 transition-colors disabled:opacity-50"
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
                      state: newParty.state || undefined,
                      billingAddress: newParty.billingAddress.trim() || undefined
                    });
                    const created = (res as any).data;
                    setCustomers(prev => [created, ...prev]);
                    selectCustomer(created);
                    setShowAddParty(false);
                    setNewParty({ name: "", phone: "", email: "", gstin: "", gstType: "Unregistered/Consumer", state: "", billingAddress: "", shippingAddress: "", openingBalance: "", creditLimit: "" });
                    showToast("Party added successfully", "success");
                  } catch {
                    showToast("Failed to add party", "error");
                  } finally {
                    setSavingParty(false);
                  }
                }}
              >
                {savingParty ? "Saving..." : "Save"}
              </button>
            </div>
          </div>
        </div>
      )}
      </div>
    );
  }


  // ══════════════════════════════════════════════════════════════════════════
  // LIST VIEW — Vyapar-style
  // ══════════════════════════════════════════════════════════════════════════
  const fmt = (d: string) => new Date(d + "T00:00:00").toLocaleDateString("en-IN", { day: "2-digit", month: "2-digit", year: "numeric" });

  const nonDraft     = filtered.filter(i => i.status !== "DRAFT");
  const totalAmt     = nonDraft.reduce((s, i) => s + (i.finalAmount || 0), 0);
  const receivedAmt  = nonDraft.filter(i => i.status === "PAID").reduce((s, i) => s + (i.finalAmount || 0), 0);
  const balanceAmt   = totalAmt - receivedAmt;

  return (
    <div className="flex flex-col bg-white min-h-screen" style={{ fontSize: 13 }}>

      {/* ── Top toolbar ── */}
      <div className="flex items-center gap-3 px-4 py-2 border-b border-gray-200 bg-white">
        <span className="font-semibold text-gray-800 text-sm mr-1">Sale Invoices</span>

        <div className="flex items-center gap-2 ml-4 text-[13px] text-gray-500">
          <span>Filter by:</span>
          <div className="border border-gray-300 rounded px-2.5 py-1.5 bg-white text-gray-700 font-medium">This Month</div>
        </div>

        <div className="flex items-center gap-2 border border-gray-300 rounded px-2 py-1 bg-white text-[13px] text-gray-700 relative">
          <div className="flex items-center gap-1.5 cursor-pointer" onClick={() => setShowFromCal(v => !v)}>
            <Calendar size={13} className="text-gray-400" />
            <span className="font-medium text-gray-600">{fmt(dateFrom)}</span>
          </div>
          {showFromCal && (
            <div className="absolute top-full left-0 mt-1 z-50" ref={fromCalRef}>
              <MiniCalendar value={dateFrom} onChange={setDateFrom} onClose={() => setShowFromCal(false)} />
            </div>
          )}

          <span className="text-gray-400 text-xs px-1">To</span>

          <div className="flex items-center gap-1.5 cursor-pointer" onClick={() => setShowToCal(v => !v)}>
            <span className="font-medium text-gray-600">{fmt(dateTo)}</span>
            <Calendar size={13} className="text-gray-400" />
          </div>
          {showToCal && (
            <div className="absolute top-full right-0 mt-1 z-50" ref={toCalRef}>
              <MiniCalendar value={dateTo} onChange={setDateTo} onClose={() => setShowToCal(false)} />
            </div>
          )}
        </div>

        <div className="flex-1" />

        <button onClick={fetchData} className="p-1.5 text-gray-400 hover:text-gray-600 rounded border border-gray-200">
          <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
        </button>
        <button
          onClick={openCreate}
          className="flex items-center gap-1.5 bg-orange-500 hover:bg-orange-600 text-white text-xs font-semibold px-4 py-1.5 rounded shadow-sm"
        >
          <Plus size={13} strokeWidth={2.5} />
          Add Sale
        </button>
      </div>

      {/* ── Summary card ── */}
      <div className="px-4 py-3 border-b border-gray-100 bg-[#fafafa]">
        <div className="inline-flex flex-col bg-white border border-gray-200 rounded-lg px-4 py-2.5 min-w-[200px] shadow-sm">
          <span className="text-[11px] text-orange-500 font-semibold">Total Sales Amount</span>
          <span className="text-xl font-bold text-gray-900 mt-0.5">₹ {totalAmt.toLocaleString("en-IN")}</span>
          <div className="flex items-center gap-2 text-xs text-gray-500 mt-1">
            <span>Received <span className="font-semibold text-gray-700">₹ {receivedAmt.toLocaleString("en-IN")}</span></span>
            <span className="text-gray-300">|</span>
            <span>Balance <span className="font-semibold text-gray-700">₹ {balanceAmt.toLocaleString("en-IN")}</span></span>
          </div>
        </div>
      </div>

      {/* ── Transactions table ── */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-gray-100">
        <div className="flex items-center gap-4">
          <span className="font-semibold text-gray-800 text-sm">Transactions</span>
          <div className="flex gap-1 p-0.5 bg-gray-100 rounded border border-gray-200">
            {["ALL", "SENT", "PAID", "DRAFT"].map(s => (
              <button 
                key={s} 
                onClick={() => setStatusFilter(s)} 
                className={clsx(
                  "px-3 py-1 rounded text-[11px] font-semibold transition-colors",
                  statusFilter === s ? "bg-white text-gray-800 shadow-sm" : "text-gray-500 hover:text-gray-700"
                )}
              >
                {s}
              </button>
            ))}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search size={13} className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search..."
              className="pl-7 pr-3 py-1 text-xs border border-gray-200 rounded outline-none bg-white w-40"
            />
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-auto">
        {loading ? (
          <div className="py-16 text-center"><RefreshCw size={24} className="mx-auto text-orange-400 animate-spin opacity-40" /></div>
        ) : filtered.length === 0 ? (
          <div className="py-16 text-center">
            <Receipt size={36} strokeWidth={1} className="mx-auto text-gray-200 mb-2" />
            <p className="text-sm text-gray-400">No invoices found.</p>
          </div>
        ) : (
          <table className="w-full text-left" style={{ borderCollapse: "collapse" }}>
            <thead>
              <tr className="bg-[#f5f5f5] border-y border-gray-200">
                {["Date","Invoice No","Party Name","Transaction","Payment Type","Amount","Balance","Actions"].map(h => (
                  <th key={h} className="px-4 py-2 text-[11px] font-semibold text-gray-500 whitespace-nowrap">
                    <span className="flex items-center gap-1">{h}</span>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((inv, idx) => {
                const isPaid   = inv.status === "PAID";
                const isDraft  = inv.status === "DRAFT";
                const balance  = isPaid || isDraft ? 0 : (inv.finalAmount || 0);
                const received = isPaid ? (inv.finalAmount || 0) : 0;
                return (
                  <tr 
                    key={inv.id} 
                    className={clsx(
                      "border-b border-gray-100 transition-colors",
                      isDraft ? "hover:bg-yellow-50/50 cursor-pointer" : "hover:bg-orange-50/30"
                    )}
                    onClick={() => {
                      if (isDraft) loadDraft(inv);
                    }}
                  >
                    <td className="px-4 py-2 text-xs text-gray-600 whitespace-nowrap">
                      {new Date(inv.createdAt).toLocaleDateString("en-IN", { day: "2-digit", month: "2-digit", year: "numeric" })}
                    </td>
                    <td className="px-4 py-2 text-xs text-gray-500">
                      {idx + 1}
                      {inv.status === "DRAFT" && (
                        <span className="ml-2 px-1.5 py-0.5 bg-yellow-100 text-yellow-700 rounded text-[9px] font-bold">DRAFT</span>
                      )}
                    </td>
                    <td className="px-4 py-2 text-xs">
                      <span className="text-blue-600 font-medium cursor-pointer hover:underline">
                        {inv.order?.customer?.name || "Walk-In Customer"}
                      </span>
                    </td>
                    <td className="px-4 py-2 text-xs text-gray-600">
                      {inv.order?.invoiceNum || "Lite Sale"}
                    </td>
                    <td className="px-4 py-2 text-xs text-gray-600">
                      {inv.paymentMode === "CASH" || inv.order?.paymentType === "CASH" ? "Cash" : "Credit"}
                    </td>
                    <td className="px-4 py-2 text-xs text-right font-medium text-gray-800">
                      ₹ {(inv.finalAmount || 0).toLocaleString("en-IN")}
                    </td>
                    <td className="px-4 py-2 text-xs text-right font-medium text-gray-800">
                      ₹ {balance.toLocaleString("en-IN")}
                    </td>
                    <td className="px-4 py-2">
                      {!isDraft && (
                        <div className="flex items-center gap-2">
                          <button
                            onClick={(e) => { e.stopPropagation(); handlePrint(inv); }}
                            className="p-1 text-gray-400 hover:text-gray-700 rounded"
                            title="Print"
                          ><Printer size={13} /></button>
                          <button
                            onClick={(e) => { e.stopPropagation(); }}
                            className="p-1 text-gray-400 hover:text-gray-700 rounded"
                            title="Share"
                          ><Share2 size={13} /></button>
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
