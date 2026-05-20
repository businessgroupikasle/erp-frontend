"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import {
  FilePlus2, Plus, RefreshCw, ChevronDown, X, Calendar,
  Check, Printer, Share2, Trash2, AlignLeft, FileText, Image as ImageIcon
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

// ── Main ──────────────────────────────────────────────────────────────────────

export default function ProformaInvoicePage() {
  const { showToast } = useToast();

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
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // ── Computed totals ────────────────────────────────────────────────────────
  const rowData = items.map(item => ({ item, ...computeRow(item) }));
  const totalQty = items.reduce((s, i) => s + i.qty, 0);
  const totalDisc = parseFloat(rowData.reduce((s, r) => s + r.discAmt, 0).toFixed(2));
  const totalTax = parseFloat(rowData.reduce((s, r) => s + r.taxAmt, 0).toFixed(2));
  const totalAmount = parseFloat(rowData.reduce((s, r) => s + r.amount, 0).toFixed(2));
  const roundOff = roundOffEnabled ? parseFloat((Math.round(totalAmount) - totalAmount).toFixed(2)) : 0;
  const finalTotal = parseFloat((totalAmount + roundOff).toFixed(2));

  const totalConverted = proformas.filter((p: any) => p.status === "CONVERTED").reduce((s: number, p: any) => s + (p.totalAmount || 0), 0);
  const totalOpen = proformas.filter((p: any) => p.status !== "CONVERTED").reduce((s: number, p: any) => s + (p.totalAmount || 0), 0);
  const grandTotal = proformas.reduce((s: number, p: any) => s + (p.totalAmount || 0), 0);

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
      <div className="flex flex-col h-screen bg-[#f0f0f0] overflow-hidden">

        {/* Top bar */}
        <div className="bg-white border-b border-gray-200 px-4 py-2 flex items-center gap-4 shrink-0">
          <span className="text-base font-semibold text-gray-800">Proforma Invoice</span>
        </div>

        {/* Scrollable body */}
        <div className="flex-1 overflow-y-auto">

          {/* Customer + Invoice info row */}
          <div className="bg-[#f0f0f0] px-6 py-4 flex flex-wrap items-start gap-4">

            {/* Customer dropdown */}
            <div className="relative" ref={customerDropRef}>
              <div
                className={clsx("flex items-center gap-1 min-w-[220px] bg-white border rounded px-2 py-1.5 cursor-pointer", showCustomerDrop ? "border-blue-500" : "border-gray-300")}
                onClick={() => setShowCustomerDrop(v => !v)}
              >
                <div className="flex-1">
                  <div className="text-[10px] text-[#f58220] font-medium leading-none mb-0.5">Customer *</div>
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
                <div className="absolute top-full left-0 z-50 mt-1 w-72 bg-white border border-gray-200 rounded shadow-lg max-h-64 overflow-y-auto">
                  <button className="w-full flex items-center gap-2 px-3 py-2 text-sm text-[#f58220] hover:bg-orange-50 border-b border-gray-100" onClick={() => setShowCustomerDrop(false)}>
                    <Plus size={14} /> Add Party
                  </button>
                  {filteredCustomers.length === 0 ? (
                    <div className="px-3 py-4 text-sm text-gray-400 text-center">No customers found</div>
                  ) : filteredCustomers.map(c => (
                    <button
                      key={c.id}
                      className="w-full flex items-center justify-between px-3 py-2 hover:bg-gray-50 border-b border-gray-50 last:border-0"
                      onClick={() => { setSelectedCustomer(c); setCustomerSearch(c.name); setCustomerPhone(c.phone || ""); setShowCustomerDrop(false); }}
                    >
                      <div className="text-left">
                        <div className="text-sm font-medium text-gray-800">{c.name}</div>
                        <div className="text-xs text-gray-400">{c.phone || "—"}</div>
                      </div>
                      {c.balance > 0 && (
                        <div className="flex items-center gap-1 bg-green-100 text-green-700 text-xs font-semibold px-2 py-0.5 rounded">
                          {c.balance} <Check size={10} />
                        </div>
                      )}
                    </button>
                  ))}
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

            <div className="flex-1" />

            {/* Metadata */}
            <div className="flex flex-col gap-2 text-sm text-right">
              <div className="flex items-center justify-end gap-3">
                <span className="text-gray-500">Proforma No.</span>
                <span className="text-gray-400 w-16 text-left">Auto</span>
              </div>
              <div className="flex items-center justify-end gap-3">
                <span className="text-gray-500">Date</span>
                <div className="flex items-center gap-1 border border-gray-300 rounded px-2 py-1 bg-white">
                  <input type="date" value={proformaDate} onChange={e => setProformaDate(e.target.value)} className="text-sm text-gray-700 outline-none bg-transparent" />
                  <Calendar size={13} className="text-blue-500 shrink-0" />
                </div>
              </div>
              <div className="flex items-center justify-end gap-3">
                <span className="text-gray-500">State of supply</span>
                <select value={stateOfSupply} onChange={e => setStateOfSupply(e.target.value)} className="border border-gray-300 rounded px-2 py-1 bg-white text-sm text-gray-700 outline-none w-36">
                  <option value="">Select</option>
                  {INDIAN_STATES.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
            </div>
          </div>

          {/* Items table */}
          <div className="overflow-x-auto">
            <table className="w-full text-sm border-collapse bg-white">
              <thead>
                <tr className="bg-[#f5f5f5] border-y border-gray-200 text-xs font-semibold text-gray-600 uppercase">
                  <th className="w-10 px-2 py-2 border-r border-gray-200 text-center">#</th>
                  <th className="px-3 py-2 border-r border-gray-200 text-left">ITEM</th>
                  <th className="w-16 px-2 py-2 border-r border-gray-200 text-center">QTY</th>
                  <th className="w-24 px-2 py-2 border-r border-gray-200 text-center">UNIT</th>
                  <th className="w-28 px-2 py-2 border-r border-gray-200 text-center">PRICE/UNIT</th>
                  <th className="w-32 px-2 py-2 border-r border-gray-200 text-center" colSpan={2}>DISCOUNT</th>
                  <th className="w-40 px-2 py-2 border-r border-gray-200 text-center" colSpan={2}>TAX</th>
                  <th className="w-24 px-2 py-2 border-r border-gray-200 text-right">AMOUNT</th>
                  <th className="w-8 px-1 py-2 text-center">
                    <button onClick={() => setItems(prev => [...prev, makeItem()])} className="text-blue-500 hover:text-blue-700">
                      <Plus size={16} strokeWidth={2.5} />
                    </button>
                  </th>
                </tr>
                <tr className="bg-[#f5f5f5] border-b border-gray-200 text-[10px] text-gray-500">
                  <th className="border-r border-gray-200" />
                  <th className="border-r border-gray-200" />
                  <th className="border-r border-gray-200" />
                  <th className="border-r border-gray-200" />
                  <th className="px-2 py-1 border-r border-gray-200 text-center">
                    <div className="relative" ref={priceDropRef}>
                      <button onClick={() => setShowPriceDrop(v => !v)} className="flex items-center gap-1 text-[10px] text-gray-500 hover:text-gray-700 mx-auto">
                        {priceMode === "without_tax" ? "Without Tax" : "With Tax"} <ChevronDown size={10} />
                      </button>
                      {showPriceDrop && (
                        <div className="absolute top-full left-1/2 -translate-x-1/2 z-50 mt-1 bg-white border border-gray-200 rounded shadow-lg text-xs w-28">
                          <button className="w-full px-3 py-2 text-left hover:bg-gray-50" onClick={() => { setPriceMode("with_tax"); setShowPriceDrop(false); }}>With Tax</button>
                          <button className="w-full px-3 py-2 text-left hover:bg-gray-50" onClick={() => { setPriceMode("without_tax"); setShowPriceDrop(false); }}>Without Tax</button>
                        </div>
                      )}
                    </div>
                  </th>
                  <th className="px-2 py-1 border-r border-gray-200 text-center w-14">%</th>
                  <th className="px-2 py-1 border-r border-gray-200 text-center w-20">AMOUNT</th>
                  <th className="px-2 py-1 border-r border-gray-200 text-center w-24">%</th>
                  <th className="px-2 py-1 border-r border-gray-200 text-center w-20">AMOUNT</th>
                  <th className="border-r border-gray-200" />
                  <th />
                </tr>
              </thead>
              <tbody>
                {items.map((item, idx) => {
                  const { discAmt, taxAmt, amount } = computeRow(item);
                  const filtProd = products.filter(p => !item.itemSearch || p.name?.toLowerCase().includes(item.itemSearch.toLowerCase())).slice(0, 10);
                  return (
                    <tr key={item.id} className="border-b border-gray-100 hover:bg-gray-50 group">
                      <td className="px-2 py-1.5 border-r border-gray-100 text-center text-xs text-gray-400">
                        <div className="flex items-center justify-center gap-1">
                          <button onClick={() => { if (items.length > 1) setItems(prev => prev.filter((_, i) => i !== idx)); }} className="opacity-0 group-hover:opacity-100 text-red-400 hover:text-red-600 transition-opacity">
                            <Trash2 size={12} />
                          </button>
                          <span>{idx + 1}</span>
                        </div>
                      </td>
                      <td className="px-2 py-1.5 border-r border-gray-100 relative">
                        <input
                          className="w-full text-sm text-gray-700 outline-none bg-transparent"
                          placeholder="Search item..."
                          value={item.itemSearch}
                          onChange={e => { updateItem(idx, "itemSearch", e.target.value); updateItem(idx, "productId", ""); setOpenItemDrop(item.id); }}
                          onFocus={() => setOpenItemDrop(item.id)}
                        />
                        {openItemDrop === item.id && filtProd.length > 0 && (
                          <div className="absolute top-full left-0 z-50 mt-0.5 w-72 bg-white border border-gray-200 rounded shadow-lg max-h-48 overflow-y-auto">
                            {filtProd.map(p => (
                              <button key={p.id} className="w-full flex items-center justify-between px-3 py-2 hover:bg-gray-50 text-left border-b border-gray-50 last:border-0" onMouseDown={() => selectProduct(idx, p)}>
                                <div>
                                  <div className="text-sm text-gray-800">{p.name}</div>
                                  <div className="text-xs text-gray-400">₹{p.basePrice || p.price || 0}</div>
                                </div>
                              </button>
                            ))}
                          </div>
                        )}
                      </td>
                      <td className="px-1 py-1.5 border-r border-gray-100">
                        <input type="number" min={0} value={item.qty} onChange={e => updateItem(idx, "qty", Number(e.target.value))} className="w-full text-sm text-gray-700 text-center outline-none bg-transparent" />
                      </td>
                      <td className="px-1 py-1.5 border-r border-gray-100">
                        <select value={item.unit} onChange={e => updateItem(idx, "unit", e.target.value)} className="w-full text-xs text-gray-700 outline-none bg-transparent cursor-pointer">
                          {UNITS.map(u => <option key={u.code} value={u.code}>{u.label}</option>)}
                        </select>
                      </td>
                      <td className="px-1 py-1.5 border-r border-gray-100">
                        <input type="number" min={0} value={item.rate || ""} placeholder="0" onChange={e => updateItem(idx, "rate", Number(e.target.value))} className="w-full text-sm text-gray-700 text-right outline-none bg-transparent" />
                      </td>
                      <td className="px-1 py-1.5 border-r border-gray-100 w-14">
                        <input type="number" min={0} max={100} value={item.discountPct || ""} placeholder="0" onChange={e => updateItem(idx, "discountPct", Number(e.target.value))} className="w-full text-sm text-gray-700 text-center outline-none bg-transparent" />
                      </td>
                      <td className="px-2 py-1.5 border-r border-gray-100 text-right text-xs text-gray-500 w-20">{discAmt > 0 ? discAmt.toFixed(2) : ""}</td>
                      <td className="px-1 py-1.5 border-r border-gray-100 w-24">
                        <select value={item.taxPct} onChange={e => updateItem(idx, "taxPct", Number(e.target.value))} className="w-full text-xs text-gray-700 outline-none bg-transparent cursor-pointer">
                          {TAX_OPTIONS.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                        </select>
                      </td>
                      <td className="px-2 py-1.5 border-r border-gray-100 text-right text-xs text-gray-500 w-20">{taxAmt > 0 ? taxAmt.toFixed(2) : ""}</td>
                      <td className="px-2 py-1.5 border-r border-gray-100 text-right text-sm font-medium text-gray-800">{amount > 0 ? amount.toFixed(2) : ""}</td>
                      <td />
                    </tr>
                  );
                })}
              </tbody>
              <tfoot>
                <tr className="border-t border-gray-200 bg-[#f9f9f9] text-xs font-semibold text-gray-600">
                  <td className="px-2 py-2 border-r border-gray-200" />
                  <td className="px-3 py-2 border-r border-gray-200">
                    <button onClick={() => setItems(prev => [...prev, makeItem()])} className="text-[#f58220] hover:text-[#e8740e] font-semibold border border-[#f58220]/40 px-2 py-0.5 rounded text-xs">ADD ROW</button>
                    <span className="ml-6 text-gray-400 uppercase tracking-wide">TOTAL</span>
                  </td>
                  <td className="px-2 py-2 border-r border-gray-200 text-center text-[#f58220]">{totalQty}</td>
                  <td className="border-r border-gray-200" /><td className="border-r border-gray-200" /><td className="border-r border-gray-200" />
                  <td className="px-2 py-2 border-r border-gray-200 text-right text-[#f58220]">{totalDisc > 0 ? totalDisc.toFixed(2) : 0}</td>
                  <td className="border-r border-gray-200" />
                  <td className="px-2 py-2 border-r border-gray-200 text-right text-[#f58220]">{totalTax > 0 ? totalTax.toFixed(2) : 0}</td>
                  <td className="px-2 py-2 border-r border-gray-200 text-right text-[#f58220]">{totalAmount > 0 ? totalAmount.toFixed(2) : 0}</td>
                  <td />
                </tr>
              </tfoot>
            </table>
          </div>

          {/* Bottom section */}
          <div className="px-6 py-4 flex flex-wrap gap-6 items-start bg-[#f0f0f0]">
            <div className="min-w-[180px]">
              {!showTerms ? (
                <button onClick={() => setShowTerms(true)} className="flex items-center gap-2 text-xs text-gray-500 hover:text-gray-700 border border-gray-300 bg-white rounded px-3 py-2">
                  <AlignLeft size={13} /> ADD TERMS AND CONDITIONS
                </button>
              ) : (
                <textarea value={termsText} onChange={e => setTermsText(e.target.value)} rows={4} placeholder="Terms and conditions..." className="w-full text-xs text-gray-700 border border-gray-300 bg-white rounded px-3 py-2 outline-none resize-none min-w-[200px]" />
              )}
            </div>
            <div className="flex flex-col gap-2">
              {!showDesc ? (
                <button onClick={() => setShowDesc(true)} className="flex items-center gap-2 text-xs text-gray-500 hover:text-gray-700 border border-gray-300 bg-white rounded px-3 py-2 w-40">
                  <FileText size={13} /> ADD DESCRIPTION
                </button>
              ) : (
                <textarea value={description} onChange={e => setDescription(e.target.value)} rows={4} placeholder="Description" className="w-48 text-xs text-gray-700 border border-gray-300 bg-white rounded px-3 py-2 outline-none resize-none" />
              )}
              <button className="flex items-center gap-2 text-xs text-gray-500 hover:text-gray-700 border border-gray-300 bg-white rounded px-3 py-2 w-40">
                <ImageIcon size={13} /> ADD IMAGE
              </button>
              <button className="flex items-center gap-2 text-xs text-gray-500 hover:text-gray-700 border border-gray-300 bg-white rounded px-3 py-2 w-40">
                <FileText size={13} /> ADD DOCUMENT
              </button>
            </div>
            <div className="flex-1" />
            <div className="flex flex-col gap-2 items-end text-sm">
              <div className="flex items-center gap-3">
                <label className="flex items-center gap-1.5 text-gray-600 cursor-pointer">
                  <input type="checkbox" checked={roundOffEnabled} onChange={e => setRoundOffEnabled(e.target.checked)} className="w-3.5 h-3.5 accent-blue-600" />
                  Round Off
                </label>
                <input readOnly value={roundOff.toFixed(2)} className="w-20 text-right border border-gray-300 bg-white rounded px-2 py-1 text-xs text-gray-600 outline-none" />
              </div>
              <div className="flex items-center gap-3">
                <span className="text-gray-600 font-medium">Total</span>
                <input readOnly value={finalTotal > 0 ? finalTotal.toFixed(2) : ""} placeholder="0.00" className="w-36 text-right border border-gray-300 bg-white rounded px-2 py-1 text-sm font-semibold text-gray-800 outline-none" />
              </div>
            </div>
          </div>
        </div>

        {/* Bottom action bar */}
        <div className="bg-white border-t border-gray-200 px-6 py-2.5 flex items-center justify-end gap-3 shrink-0">
          <button onClick={() => handleSave(false, true)} disabled={saving} className="px-4 py-1.5 text-sm font-semibold text-gray-600 hover:text-gray-800 bg-white border border-gray-200 rounded disabled:opacity-60">Save Draft</button>
          <button onClick={() => setView("list")} className="px-4 py-1.5 text-sm text-gray-500 hover:text-gray-700">Cancel</button>
          <div className="relative" ref={shareDropRef}>
            <div className="flex">
              <button onClick={() => showToast("Share feature coming soon", "info")} className="px-4 py-1.5 text-sm font-medium text-white bg-[#f58220] hover:bg-[#e8740e] rounded-l border-r border-[#e8740e]">Share</button>
              <button onClick={() => setShowShareDrop(v => !v)} className="px-2 py-1.5 text-white bg-[#f58220] hover:bg-[#e8740e] rounded-r"><ChevronDown size={14} /></button>
            </div>
            {showShareDrop && (
              <div className="absolute bottom-full right-0 mb-1 bg-white border border-gray-200 rounded shadow-lg text-sm min-w-[160px] z-50">
                <button className="w-full px-4 py-2 text-left hover:bg-gray-50 text-gray-700 flex items-center gap-2"><Printer size={13} /> Print</button>
                <button className="w-full px-4 py-2 text-left hover:bg-gray-50 text-gray-700 flex items-center gap-2"><Share2 size={13} /> Share</button>
                <button className="w-full px-4 py-2 text-left hover:bg-gray-50 text-gray-700" onClick={() => { setShowShareDrop(false); handleSave(true); }}>Save &amp; New</button>
              </div>
            )}
          </div>
          <button onClick={() => handleSave(false)} disabled={saving} className="px-6 py-1.5 text-sm font-semibold text-white bg-[#f58220] hover:bg-[#e8740e] rounded disabled:opacity-60">
            {saving ? "Saving..." : "Save"}
          </button>
        </div>
      </div>
    );
  }

  // ── LIST VIEW ──────────────────────────────────────────────────────────────
  return (
    <div className="flex flex-col min-h-screen bg-white">

      {/* Header */}
      <div className="flex items-center justify-between px-5 py-3 border-b border-gray-200">
        <div className="flex items-center gap-2">
          <span className="text-base font-semibold text-gray-800">Proforma Invoice</span>
          <ChevronDown size={16} className="text-gray-400" />
        </div>
        <button
          onClick={openCreate}
          className="flex items-center gap-1.5 bg-[#f58220] hover:bg-[#e8740e] text-white text-sm font-semibold px-4 py-2 rounded transition-colors"
        >
          <Plus size={15} strokeWidth={2.5} />
          Add Proforma
        </button>
      </div>

      {/* Filter bar */}
      <div className="flex items-center gap-3 px-5 py-3 border-b border-gray-100 flex-wrap">
        <span className="text-sm text-gray-500">Filter by :</span>
        <div className="relative" ref={periodDropRef}>
          <button onClick={() => setShowPeriodDrop(v => !v)} className="flex items-center gap-1.5 text-sm text-gray-700 border border-gray-300 rounded px-3 py-1.5 bg-white hover:border-gray-400">
            {periodLabel} <ChevronDown size={13} />
          </button>
          {showPeriodDrop && (
            <div className="absolute top-full left-0 z-50 mt-1 bg-white border border-gray-200 rounded shadow-lg min-w-[140px] text-sm">
              {PERIOD_OPTIONS.map(o => (
                <button key={o.value} onClick={() => { setPeriod(o.value); setDateRange(getPeriodDates(o.value)); setShowPeriodDrop(false); }}
                  className={clsx("w-full px-4 py-2 text-left hover:bg-gray-50", period === o.value && "text-[#f58220] font-medium")}>
                  {o.label}
                </button>
              ))}
            </div>
          )}
        </div>
        <div className="flex items-center gap-1.5 border border-gray-300 rounded px-3 py-1.5 bg-white text-sm text-gray-700">
          <Calendar size={13} className="text-gray-400" />
          <span>{formatDate(dateRange.start)}</span>
          <span className="text-gray-400">To</span>
          <span>{formatDate(dateRange.end)}</span>
        </div>
        <button className="flex items-center gap-1.5 text-sm text-gray-700 border border-gray-300 rounded px-3 py-1.5 bg-white hover:border-gray-400">
          All Firms <ChevronDown size={13} />
        </button>
        <div className="ml-auto">
          <button onClick={fetchData} className="p-2 hover:bg-gray-100 rounded-lg text-gray-400">
            <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
          </button>
        </div>
      </div>

      {/* Stats card */}
      <div className="px-5 py-4">
        <div className="border border-gray-200 rounded-lg p-4 w-64 bg-white shadow-sm">
          <div className="flex items-center justify-between mb-1">
            <span className="text-sm text-gray-500">Total Quotations</span>
            <span className="text-xs text-gray-400 flex items-center gap-0.5">0% ↗ <span className="text-[10px]">vs last month</span></span>
          </div>
          <div className="text-2xl font-bold text-gray-800 mb-1">₹{grandTotal.toFixed(2)}</div>
          <div className="text-xs text-gray-500">
            Converted: ₹{totalConverted.toFixed(2)}
            <span className="mx-1 text-gray-300">|</span>
            Open: ₹{totalOpen.toFixed(2)}
          </div>
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex-1 flex items-center justify-center">
          <RefreshCw size={24} className="text-[#f58220] animate-spin" />
        </div>
      ) : proformas.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center pb-16">
          <EmptyIllustration />
          <p className="text-base font-semibold text-gray-700 mb-1">No Transactions to show</p>
          <p className="text-sm text-gray-400 mb-5">You haven&apos;t added any transactions yet.</p>
          <button
            onClick={openCreate}
            className="flex items-center gap-1.5 bg-[#f58220] hover:bg-[#e8740e] text-white text-sm font-semibold px-6 py-2.5 rounded transition-colors"
          >
            <Plus size={15} strokeWidth={2.5} />
            Add Proforma
          </button>
        </div>
      ) : (
        <div className="flex-1 overflow-auto px-5">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="border-b border-gray-200 text-xs font-semibold text-gray-500 uppercase">
                <th className="py-3 text-left">Date</th>
                <th className="py-3 text-left">Proforma No.</th>
                <th className="py-3 text-left">Customer</th>
                <th className="py-3 text-left">Status</th>
                <th className="py-3 text-right">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {proformas.map((p: any) => {
                const isDraft = p.status === "DRAFT";
                return (
                  <tr 
                    key={p.id} 
                    className={clsx(
                      "hover:bg-gray-50",
                      isDraft ? "hover:bg-yellow-50/50 cursor-pointer font-medium" : ""
                    )}
                    onClick={() => {
                      if (isDraft) loadDraft(p);
                    }}
                  >
                    <td className="py-3 text-gray-500">{p.quotationDate ? new Date(p.quotationDate).toLocaleDateString() : "—"}</td>
                    <td className="py-3 text-[#f58220] font-medium">{p.quotationNumber || p.id?.substring(0, 8).toUpperCase()}</td>
                    <td className="py-3 font-medium text-gray-800">{p.customer?.name || "—"}</td>
                    <td className="py-3">
                      <span className={clsx("px-2 py-0.5 rounded text-xs font-semibold border",
                        p.status === "CONVERTED" ? "bg-green-100 text-green-700 border-green-200" :
                        p.status === "DRAFT" ? "bg-yellow-50 text-yellow-700 border-yellow-200" : "bg-orange-100 text-[#f58220] border-orange-200"
                      )}>
                        {p.status === "CONVERTED" ? "Converted" : p.status === "DRAFT" ? "Draft" : "Open"}
                      </span>
                    </td>
                  <td className="py-3 text-right font-semibold text-gray-800">₹{(p.totalAmount || 0).toFixed(2)}</td>
                </tr>
              );
            })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
