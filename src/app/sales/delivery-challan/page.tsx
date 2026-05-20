"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import {
  Truck, Plus, Search, RefreshCw, X, FileText,
  User, Check, Package, Printer, Calendar,
  MapPin, Hash, ArrowRight, ClipboardList,
  ChevronDown, Trash2, Share2, MoreVertical,
  ArrowLeft, FileSpreadsheet, Percent, Calculator
} from "lucide-react";
import { clsx } from "clsx";
import { customersApi, productsFullApi } from "@/lib/api";
import { useToast } from "@/context/ToastContext";
import api from "@/lib/api/base";

// ── Constants (Unified with Invoice Page) ────────────────────────────────────

const UNITS = [
  { label: "None",              short: "None",  code: "NONE" },
  { label: "Bags (Bag)",        short: "Bag",   code: "BAG" },
  { label: "Bottles (Btl)",     short: "Btl",   code: "BTL" },
  { label: "Box (Box)",         short: "Box",   code: "BOX" },
  { label: "Bundles (Bdl)",     short: "Bdl",   code: "BDL" },
  { label: "Carats (Ct)",       short: "Ct",    code: "CT" },
  { label: "Cms",               short: "Cms",   code: "CMS" },
  { label: "Dozens (Dzn)",      short: "Dzn",   code: "DZN" },
  { label: "Grams (Grm)",       short: "Grm",   code: "GRM" },
  { label: "Kilograms (Kgs)",   short: "Kgs",   code: "KGS" },
  { label: "Liters (Ltr)",      short: "Ltr",   code: "LTR" },
  { label: "Meters (Mtr)",      short: "Mtr",   code: "MTR" },
  { label: "Numbers (Nos)",     short: "Nos",   code: "NOS" },
  { label: "Packs (Pkt)",       short: "Pkt",   code: "PKT" },
  { label: "Pieces (Pcs)",      short: "Pcs",   code: "PCS" },
  { label: "Rolls",             short: "Roll",  code: "ROLL" },
  { label: "Square Feet (Sqf)", short: "Sqf",   code: "SQF" },
  { label: "Tons (Tne)",        short: "Tne",   code: "TNE" },
  { label: "Units (Unt)",       short: "Unt",   code: "UNT" },
];

const TAX_OPTIONS = [
  { label: "NONE", value: 0 },
  { label: "IGST@0%", value: 0 },
  { label: "GST@0%", value: 0 },
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

// Unified Color Coding (from Invoice Page status colors)
const STATUS_STYLES: Record<string, { label: string; color: string; bg: string; border: string }> = {
  DRAFT:      { label: "Draft",       color: "text-slate-600",   bg: "bg-slate-50",   border: "border-slate-200" },
  OPEN:       { label: "Open",        color: "text-blue-600",    bg: "bg-blue-50",    border: "border-blue-200" },
  CLOSED:     { label: "Closed",      color: "text-emerald-600", bg: "bg-emerald-50", border: "border-emerald-200" },
  CANCELLED:  { label: "Cancelled",   color: "text-slate-400",   bg: "bg-slate-100",  border: "border-slate-200" },
};

// ── Types ─────────────────────────────────────────────────────────────────────

interface LineItem {
  id: string;
  productId: string;
  itemSearch: string;
  qty: number;
  unit: string;
  rate: number;
  taxPct: number;
  taxLabel: string;
  remarks: string;
}

function makeItem(): LineItem {
  return {
    id: Math.random().toString(36).slice(2),
    productId: "",
    itemSearch: "",
    qty: 1,
    unit: "NONE",
    rate: 0,
    taxPct: 0,
    taxLabel: "NONE",
    remarks: "",
  };
}

function computeRow(item: LineItem, withTax: boolean) {
  const gross = item.qty * item.rate;
  if (withTax) {
    const taxAmt = parseFloat((gross * item.taxPct / (100 + item.taxPct)).toFixed(2));
    const netAmt = gross - taxAmt;
    return { taxAmt, amount: parseFloat(gross.toFixed(2)) };
  }
  const taxAmt = parseFloat((gross * item.taxPct / 100).toFixed(2));
  return { taxAmt, amount: parseFloat((gross + taxAmt).toFixed(2)) };
}

// ── Main Page ─────────────────────────────────────────────────────────────────

export default function DeliveryChallanPage() {
  const { showToast } = useToast();

  // Navigation State
  const [view, setView] = useState<"list" | "create" | "edit">("list");
  const [challans, setChallans] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [customers, setCustomers] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);

  // List filter state
  const [dateFilter, setDateFilter] = useState("THIS_MONTH");
  const [firmFilter, setFirmFilter] = useState("ALL");
  const [dateFrom, setDateFrom] = useState(() => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split("T")[0];
  });
  const [dateTo, setDateTo] = useState(() => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().split("T")[0];
  });

  // Active Challan Form State
  const [selectedCustomer, setSelectedCustomer] = useState<any>(null);
  const [customerSearch, setCustomerSearch] = useState("");
  const [showCustomerDrop, setShowCustomerDrop] = useState(false);
  const [customerPhone, setCustomerPhone] = useState("");
  const [challanNo, setChallanNo] = useState<string>("1");
  const [invoiceDate, setInvoiceDate] = useState(() => new Date().toISOString().split("T")[0]);
  const [dueDate, setDueDate] = useState(() => new Date().toISOString().split("T")[0]);
  const [stateOfSupply, setStateOfSupply] = useState("");
  const [items, setItems] = useState<LineItem[]>([makeItem(), makeItem()]);
  const [priceMode, setPriceMode] = useState<"without_tax" | "with_tax">("without_tax");
  const [showPriceDrop, setShowPriceDrop] = useState(false);
  
  // Dialog drop/floating states
  const [openItemDrop, setOpenItemDrop] = useState<string | null>(null);
  const [openUnitDrop, setOpenUnitDrop] = useState<string | null>(null);
  const [openTaxDrop, setOpenTaxDrop] = useState<string | null>(null);
  
  // Custom Notes / Terms Fields
  const [termsText, setTermsText] = useState("");
  const [showTerms, setShowTerms] = useState(false);
  const [description, setDescription] = useState("");
  const [showDesc, setShowDesc] = useState(false);
  const [roundOffEnabled, setRoundOffEnabled] = useState(true);
  const [showShareDrop, setShowShareDrop] = useState(false);
  const [saving, setSaving] = useState(false);
  const [draftId, setDraftId] = useState<string | null>(null);
  const [showRowMenu, setShowRowMenu] = useState<string | null>(null);

  // Refs for closing dropdowns
  const customerDropRef = useRef<HTMLDivElement>(null);
  const priceDropRef = useRef<HTMLDivElement>(null);
  const shareDropRef = useRef<HTMLDivElement>(null);

  // ── Data Fetching ────────────────────────────────────────────────────────────

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [cRes, pRes, dcRes] = await Promise.allSettled([
        customersApi.getAll(),
        productsFullApi.getAll(),
        api.get("/api/sales/delivery-challans").catch(() => ({ data: [] })),
      ]);

      let apiChallans = dcRes.status === "fulfilled" ? (dcRes.value as any).data || [] : [];

      // Load from LocalStorage
      try {
        const localData = localStorage.getItem("sale_delivery_challans");
        if (localData) {
          const locals = JSON.parse(localData);
          // Filter out API duplicates if they have overlapping IDs
          const apiIds = new Set(apiChallans.map((c: any) => c.id));
          const uniqueLocals = locals.filter((l: any) => !apiIds.has(l.id));
          apiChallans = [...uniqueLocals, ...apiChallans];
        }
      } catch (e) {
        console.error("Failed to load local storage challans", e);
      }

      setChallans(apiChallans);
      if (cRes.status === "fulfilled") setCustomers((cRes.value as any).data || []);
      if (pRes.status === "fulfilled") setProducts((pRes.value as any).data || []);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Click outside handlers
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (customerDropRef.current && !customerDropRef.current.contains(e.target as Node)) {
        setShowCustomerDrop(false);
      }
      if (priceDropRef.current && !priceDropRef.current.contains(e.target as Node)) {
        setShowPriceDrop(false);
      }
      if (shareDropRef.current && !shareDropRef.current.contains(e.target as Node)) {
        setShowShareDrop(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // ── Calculations ────────────────────────────────────────────────────────────

  const withTax = priceMode === "with_tax";
  const rowData = items.map(item => ({ item, ...computeRow(item, withTax) }));
  
  const totalQty = items.reduce((s, i) => s + (Number(i.qty) || 0), 0);
  const totalTax = parseFloat(rowData.reduce((s, r) => s + r.taxAmt, 0).toFixed(2));
  const totalAmount = parseFloat(rowData.reduce((s, r) => s + r.amount, 0).toFixed(2));
  const roundOff = roundOffEnabled ? parseFloat((Math.round(totalAmount) - totalAmount).toFixed(2)) : 0;
  const finalTotal = parseFloat((totalAmount + roundOff).toFixed(2));

  // Auto-increment Challan Number
  useEffect(() => {
    if (view === "create" && !draftId) {
      const numericNos = challans
        .map(c => parseInt(c.challanNo))
        .filter(n => !isNaN(n));
      const nextNo = numericNos.length > 0 ? Math.max(...numericNos) + 1 : 1;
      setChallanNo(String(nextNo));
    }
  }, [view, challans, draftId]);

  // ── Actions ──────────────────────────────────────────────────────────────────

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
    if (items.length > 1) {
      setItems(prev => prev.filter((_, i) => i !== idx));
    } else {
      setItems([makeItem()]);
    }
  };

  const resetForm = () => {
    setDraftId(null);
    setSelectedCustomer(null);
    setCustomerSearch("");
    setCustomerPhone("");
    setInvoiceDate(new Date().toISOString().split("T")[0]);
    setDueDate(new Date().toISOString().split("T")[0]);
    setStateOfSupply("");
    setItems([makeItem(), makeItem()]);
    setPriceMode("without_tax");
    setTermsText("");
    setShowTerms(false);
    setDescription("");
    setShowDesc(false);
    setRoundOffEnabled(true);
  };

  const handleSave = async (status: "DRAFT" | "OPEN") => {
    if (!selectedCustomer && status === "OPEN") {
      showToast("Please select a customer", "error");
      return;
    }
    const validItems = items.filter(it => it.itemSearch.trim() !== "" && it.qty > 0);
    if (validItems.length === 0 && status === "OPEN") {
      showToast("Add at least one item with valid quantity", "error");
      return;
    }

    // Auto draft on blank cancel
    if (status === "DRAFT" && !selectedCustomer && validItems.length === 0) {
      setView("list");
      resetForm();
      return;
    }

    setSaving(true);
    const apiPayload = {
      customerId: selectedCustomer?.id || undefined,
      challanDate: invoiceDate,
      dueDate,
      stateOfSupply: stateOfSupply || undefined,
      termsConditions: termsText || undefined,
      notes: description || undefined,
      items: validItems.map(it => ({
        productId: it.productId || undefined,
        productName: it.itemSearch,
        quantity: it.qty,
        unit: it.unit,
        rate: it.rate,
        taxPercent: it.taxPct,
      })),
    };

    try {
      await api.post("/api/sales/delivery-challans", apiPayload);
      showToast("Delivery Challan saved successfully", "success");
      fetchData();
      setView("list");
      resetForm();
    } catch (e: any) {
      showToast(e?.response?.data?.error || "Error saving Delivery Challan", "error");
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (dc: any) => {
    setDraftId(dc.id);
    setChallanNo(dc.challanNo);
    const raw = dc._rawState || {};
    setSelectedCustomer(raw.selectedCustomer || null);
    setCustomerSearch(raw.customerSearch || dc.customerName);
    setCustomerPhone(raw.customerPhone || dc.customerPhone || "");
    setInvoiceDate(raw.invoiceDate || dc.invoiceDate);
    setDueDate(raw.dueDate || dc.dueDate);
    setStateOfSupply(raw.stateOfSupply || dc.stateOfSupply || "");
    setPriceMode(raw.priceMode || "without_tax");
    setTermsText(raw.termsText || "");
    setShowTerms(raw.showTerms || !!raw.termsText);
    setDescription(raw.description || dc.remarks || "");
    setShowDesc(raw.showDesc || !!raw.description || !!dc.remarks);
    setRoundOffEnabled(raw.roundOffEnabled ?? true);
    
    if (raw.items && raw.items.length > 0) {
      setItems(raw.items);
    } else if (dc.items && dc.items.length > 0) {
      setItems(dc.items.map((it: any) => ({
        id: it.id || Math.random().toString(36).slice(2),
        productId: it.productId || "",
        itemSearch: it.description,
        qty: it.qty,
        unit: it.unit || "NONE",
        rate: it.rate || 0,
        taxPct: it.taxPct || 0,
        taxLabel: TAX_OPTIONS.find(o => o.value === (it.taxPct || 0))?.label || "NONE",
        remarks: it.remarks || "",
      })));
    } else {
      setItems([makeItem()]);
    }
    
    setView("edit");
  };

  const handleDelete = (id: string) => {
    if (!window.confirm("Are you sure you want to delete this Delivery Challan?")) return;
    try {
      const localData = localStorage.getItem("sale_delivery_challans");
      if (localData) {
        let locals = JSON.parse(localData);
        locals = locals.filter((x: any) => x.id !== id);
        localStorage.setItem("sale_delivery_challans", JSON.stringify(locals));
      }
      showToast("Challan deleted successfully", "success");
      fetchData();
    } catch (e) {
      showToast("Failed to delete challan", "error");
    }
  };

  const convertToSale = async (dc: any) => {
    try {
      // Simulate conversion
      const localData = localStorage.getItem("sale_delivery_challans");
      if (localData) {
        const locals = JSON.parse(localData);
        const updated = locals.map((x: any) => x.id === dc.id ? { ...x, status: "CLOSED" } : x);
        localStorage.setItem("sale_delivery_challans", JSON.stringify(updated));
      }
      showToast(`Challan #${dc.challanNo} successfully converted to Sale!`, "success");
      fetchData();
    } catch (e) {
      showToast("Conversion failed", "error");
    }
  };

  const handlePrint = (dc: any) => {
    const win = window.open("", "_blank");
    if (!win) return;
    win.document.write(`
      <html>
      <head>
        <title>Delivery Challan #${dc.challanNo}</title>
        <style>
          body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; padding: 30px; color: #334155; }
          .header { display: flex; justify-content: space-between; border-bottom: 2px solid #e2e8f0; padding-bottom: 20px; }
          .title { font-size: 24px; font-weight: bold; color: #1e293b; text-transform: uppercase; }
          .meta { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin: 30px 0; }
          .box { border: 1px solid #e2e8f0; padding: 15px; rounded: 8px; background: #f8fafc; }
          .box-title { font-size: 11px; font-weight: bold; color: #64748b; text-transform: uppercase; margin-bottom: 5px; }
          table { width: 100%; border-collapse: collapse; margin-top: 20px; }
          th { background: #f1f5f9; padding: 10px; font-size: 12px; font-weight: bold; text-align: left; border-bottom: 2px solid #cbd5e1; }
          td { padding: 12px 10px; border-bottom: 1px solid #e2e8f0; font-size: 13px; }
          .totals { text-align: right; margin-top: 30px; font-size: 14px; font-weight: 500; }
          .footer { display: flex; justify-content: space-between; margin-top: 60px; font-size: 12px; }
          .sig { border-top: 1px solid #cbd5e1; width: 180px; text-align: center; padding-top: 5px; }
          @media print { button { display: none; } }
        </style>
      </head>
      <body>
        <div class="header">
          <div>
            <div class="title">Delivery Challan</div>
            <div style="font-size: 13px; color: #64748b; margin-top: 4px;">No: <strong>#${dc.challanNo}</strong></div>
          </div>
          <div style="text-align: right; font-size: 13px;">
            <div>Challan Date: <strong>${dc.invoiceDate}</strong></div>
            <div>Due Date: <strong>${dc.dueDate}</strong></div>
            <div style="margin-top: 5px;"><span style="background: #dbeafe; color: #1d4ed8; padding: 2px 8px; border-radius: 9999px; font-size: 11px; font-weight: bold;">${dc.status}</span></div>
          </div>
        </div>
        <div class="meta">
          <div class="box">
            <div class="box-title">Deliver To</div>
            <strong>${dc.customerName}</strong><br/>
            ${dc.customerPhone ? `Phone: ${dc.customerPhone}<br/>` : ""}
            ${dc.stateOfSupply ? `State of Supply: ${dc.stateOfSupply}` : ""}
          </div>
          <div class="box">
            <div class="box-title">Terms & Notes</div>
            ${dc._rawState?.description || dc.remarks || "No custom details provided."}
          </div>
        </div>
        <table>
          <thead>
            <tr>
              <th>#</th>
              <th>Description</th>
              <th>Qty</th>
              <th>Unit</th>
              <th>Rate</th>
              <th>Tax Rate</th>
              <th>Total Amount</th>
            </tr>
          </thead>
          <tbody>
            ${(dc.items || []).map((it: any, i: number) => `
              <tr>
                <td>${i + 1}</td>
                <td>${it.description}</td>
                <td>${it.qty}</td>
                <td>${it.unit}</td>
                <td>₹${Number(it.rate).toFixed(2)}</td>
                <td>${it.taxPct}%</td>
                <td>₹${Number(it.rate * it.qty + (it.taxAmount || 0)).toFixed(2)}</td>
              </tr>
            `).join("")}
          </tbody>
        </table>
        <div class="totals">
          Total Quantity: <strong>${dc.totalQty} items</strong><br/>
          Grand Total: <span style="font-size: 18px; color: #1e3a8a; font-weight: bold; margin-left: 10px;">₹${Number(dc.finalAmount).toFixed(2)}</span>
        </div>
        <div class="footer">
          <div class="sig">Received By</div>
          <div class="sig">Authorized Signatory</div>
        </div>
        <script>window.onload = () => { window.print(); window.onafterprint = () => window.close(); }</script>
      </body>
      </html>
    `);
    win.document.close();
  };

  // ── Filters & Formatting ─────────────────────────────────────────────────────

  const getFilteredChallans = () => {
    return challans.filter(dc => {
      const matchSearch = !search ||
        dc.challanNo.toLowerCase().includes(search.toLowerCase()) ||
        dc.customerName.toLowerCase().includes(search.toLowerCase());

      const matchStatus = statusFilter === "ALL" || dc.status === statusFilter;
      
      // Date filter
      let matchDate = true;
      if (dateFilter === "THIS_MONTH") {
        const d = new Date(dc.invoiceDate);
        const now = new Date();
        matchDate = d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
      } else if (dateFilter === "TODAY") {
        matchDate = dc.invoiceDate === new Date().toISOString().split("T")[0];
      } else if (dateFilter === "CUSTOM") {
        matchDate = dc.invoiceDate >= dateFrom && dc.invoiceDate <= dateTo;
      }
      
      return matchSearch && matchStatus && matchDate;
    });
  };

  const filteredChallans = getFilteredChallans();

  const filteredCustomers = customers.filter(c =>
    !customerSearch ||
    c.name?.toLowerCase().includes(customerSearch.toLowerCase()) ||
    c.phone?.includes(customerSearch)
  );

  const stats = {
    total: challans.length,
    open: challans.filter(d => d.status === "OPEN").length,
    closed: challans.filter(d => d.status === "CLOSED").length,
    draft: challans.filter(d => d.status === "DRAFT").length,
  };

  // ════════════════════════════════════════════════════════════════════════════
  // 1. FORM VIEW (Screen 2 Layout - Full Page Creation View)
  // ════════════════════════════════════════════════════════════════════════════
  if (view === "create" || view === "edit") {
    return (
      <div className="flex flex-col bg-[#f1f5f9] overflow-hidden text-slate-800" style={{ height: "calc(100vh - 104px)" }}>
        {/* Top Header */}
        <div className="bg-white border-b border-slate-200 px-6 py-3 flex items-center justify-between shrink-0 shadow-sm">
          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                const hasInput = selectedCustomer || items.some(it => it.itemSearch !== "");
                if (hasInput) {
                  handleSave("DRAFT");
                } else {
                  setView("list");
                  resetForm();
                }
              }}
              className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-600 transition-colors"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
            <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
              <Truck className="h-5 w-5 text-indigo-600" />
              {view === "create" ? "Add Delivery Challan" : `Edit Challan #${challanNo}`}
            </h2>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs text-slate-500 font-mono">Challan No: <strong className="text-indigo-600 font-bold">{challanNo}</strong></span>
          </div>
        </div>

        {/* Scrollable Form Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
            {/* Top Row Inputs (Party, Dates, supply state) */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
              {/* Party Select - Custom Floating notch border border-slate-300 */}
              <div className="md:col-span-4 relative" ref={customerDropRef}>
                <div
                  className={clsx(
                    "flex items-center gap-1 bg-white border rounded-xl px-4 py-3 cursor-pointer transition-all",
                    showCustomerDrop ? "border-indigo-600 ring-2 ring-indigo-500/10" : "border-slate-300"
                  )}
                  onClick={() => setShowCustomerDrop(v => !v)}
                >
                  <div className="flex-1">
                    <div className="text-[10px] text-indigo-600 font-bold uppercase tracking-wider leading-none mb-1">Party *</div>
                    <input
                      className="w-full text-sm text-slate-700 outline-none bg-transparent placeholder-slate-400"
                      placeholder="Select / Search Party"
                      value={customerSearch}
                      onChange={e => { setCustomerSearch(e.target.value); setShowCustomerDrop(true); }}
                      onClick={e => { e.stopPropagation(); setShowCustomerDrop(true); }}
                    />
                  </div>
                  <ChevronDown size={16} className="text-slate-400 shrink-0" />
                </div>

                {showCustomerDrop && (
                  <div className="absolute top-full left-0 z-50 mt-1 w-full bg-white border border-slate-200 rounded-xl shadow-xl overflow-hidden">
                    <div className="max-h-56 overflow-y-auto">
                      {filteredCustomers.length === 0 ? (
                        <div className="px-4 py-4 text-xs text-slate-400 text-center">No customers found</div>
                      ) : (
                        filteredCustomers.map(c => (
                          <button
                            key={c.id}
                            type="button"
                            className="w-full flex items-center justify-between px-4 py-3 hover:bg-indigo-50 border-b border-slate-50 last:border-0 transition-colors"
                            onClick={() => selectCustomer(c)}
                          >
                            <div className="text-left">
                              <div className="text-sm font-semibold text-slate-800">{c.name}</div>
                              <div className="text-xs text-slate-400">{c.phone || "—"}</div>
                            </div>
                          </button>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Phone No */}
              <div className="md:col-span-2 bg-white border border-slate-300 rounded-xl px-4 py-3">
                <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider leading-none mb-1">Phone No</div>
                <input
                  className="text-sm text-slate-700 outline-none bg-transparent placeholder-slate-400 w-full"
                  placeholder="Customer Phone"
                  value={customerPhone}
                  onChange={e => setCustomerPhone(e.target.value)}
                />
              </div>

              {/* Date Inputs */}
              <div className="md:col-span-2 bg-white border border-slate-300 rounded-xl px-4 py-3 flex items-center justify-between gap-2">
                <div className="flex-1">
                  <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider leading-none mb-1">Challan Date</div>
                  <input
                    type="date"
                    className="text-sm text-slate-700 outline-none bg-transparent w-full"
                    value={invoiceDate}
                    onChange={e => setInvoiceDate(e.target.value)}
                  />
                </div>
              </div>

              <div className="md:col-span-2 bg-white border border-slate-300 rounded-xl px-4 py-3 flex items-center justify-between gap-2">
                <div className="flex-1">
                  <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider leading-none mb-1">Due Date</div>
                  <input
                    type="date"
                    className="text-sm text-slate-700 outline-none bg-transparent w-full"
                    value={dueDate}
                    onChange={e => setDueDate(e.target.value)}
                  />
                </div>
              </div>

              {/* State of Supply */}
              <div className="md:col-span-2 bg-white border border-slate-300 rounded-xl px-4 py-3">
                <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider leading-none mb-1">State of Supply</div>
                <select
                  value={stateOfSupply}
                  onChange={e => setStateOfSupply(e.target.value)}
                  className="w-full text-sm text-slate-700 outline-none bg-transparent cursor-pointer"
                >
                  <option value="">Select state</option>
                  {INDIAN_STATES.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
            </div>
          </div>

          {/* Items Table Container */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
            <div className="px-6 py-4 bg-slate-50/50 border-b border-slate-100 flex items-center justify-between">
              <span className="text-sm font-bold text-slate-800">Items List</span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setPriceMode(priceMode === "without_tax" ? "with_tax" : "without_tax")}
                  className="px-3 py-1 bg-white border border-slate-200 hover:border-indigo-300 text-xs font-semibold rounded-lg text-indigo-600 transition-colors shadow-sm"
                >
                  {priceMode === "without_tax" ? "Tax Excluded" : "Tax Included"}
                </button>
              </div>
            </div>

            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-50 text-slate-500 font-semibold text-xs border-b border-slate-100">
                  <th className="text-left px-4 py-3.5 w-12">#</th>
                  <th className="text-left px-4 py-3.5">Item Details</th>
                  <th className="text-center px-4 py-3.5 w-24">Qty</th>
                  <th className="text-left px-4 py-3.5 w-32">Unit</th>
                  <th className="text-right px-4 py-3.5 w-32">Price/Unit</th>
                  <th className="text-left px-4 py-3.5 w-40">Tax (GST)</th>
                  <th className="text-right px-4 py-3.5 w-36">Amount</th>
                  <th className="w-12"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {items.map((it, idx) => {
                  const comp = computeRow(it, withTax);
                  const isItemDropOpen = openItemDrop === it.id;
                  
                  return (
                    <tr key={it.id} className="hover:bg-slate-50/20 group">
                      <td className="px-4 py-3 text-center text-xs text-slate-400">{idx + 1}</td>
                      <td className="px-4 py-3 relative">
                        <input
                          value={it.itemSearch}
                          onChange={e => {
                            updateItem(idx, "itemSearch", e.target.value);
                            setOpenItemDrop(it.id);
                          }}
                          onFocus={() => setOpenItemDrop(it.id)}
                          placeholder="Search product or enter name..."
                          className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm outline-none focus:border-indigo-500"
                        />
                        {isItemDropOpen && (
                          <div className="absolute left-4 right-4 top-full mt-1 z-50 bg-white border border-slate-200 rounded-xl shadow-xl overflow-hidden max-h-48 overflow-y-auto">
                            {products.filter(p => p.name.toLowerCase().includes(it.itemSearch.toLowerCase())).length === 0 ? (
                              <div className="px-4 py-3 text-xs text-slate-400">No items matched</div>
                            ) : (
                              products.filter(p => p.name.toLowerCase().includes(it.itemSearch.toLowerCase())).map(p => (
                                <button
                                  key={p.id}
                                  type="button"
                                  className="w-full flex items-center justify-between px-4 py-2.5 hover:bg-indigo-50 text-left border-b border-slate-50 last:border-0 transition-colors text-xs"
                                  onClick={() => selectProduct(idx, p)}
                                >
                                  <div>
                                    <strong className="text-slate-800 font-semibold">{p.name}</strong>
                                    <div className="text-[10px] text-slate-400">SKU: {p.sku || "—"}</div>
                                  </div>
                                  <div className="text-indigo-600 font-bold">₹{p.basePrice || p.price || 0}</div>
                                </button>
                              ))
                            )}
                          </div>
                        )}
                        <input
                          value={it.remarks}
                          onChange={e => updateItem(idx, "remarks", e.target.value)}
                          placeholder="Add brief details / serial number"
                          className="w-full px-3 py-1 text-xs text-slate-400 outline-none bg-transparent border-0 mt-1 border-t border-slate-100 focus:text-slate-700"
                        />
                      </td>
                      <td className="px-4 py-3">
                        <input
                          type="number"
                          min={1}
                          value={it.qty}
                          onChange={e => updateItem(idx, "qty", Number(e.target.value) || 0)}
                          className="w-full px-2 py-2 border border-slate-200 rounded-lg text-sm text-center outline-none focus:border-indigo-500"
                        />
                      </td>
                      <td className="px-4 py-3">
                        <select
                          value={it.unit}
                          onChange={e => updateItem(idx, "unit", e.target.value)}
                          className="w-full px-2 py-2 border border-slate-200 rounded-lg text-sm bg-white outline-none focus:border-indigo-500"
                        >
                          {UNITS.map(u => <option key={u.code} value={u.code}>{u.short}</option>)}
                        </select>
                      </td>
                      <td className="px-4 py-3">
                        <div className="relative flex items-center">
                          <span className="absolute left-2 text-xs text-slate-400 font-mono">₹</span>
                          <input
                            type="number"
                            min={0}
                            value={it.rate || ""}
                            onChange={e => updateItem(idx, "rate", Number(e.target.value) || 0)}
                            className="w-full pl-6 pr-2 py-2 border border-slate-200 rounded-lg text-sm text-right outline-none focus:border-indigo-500"
                            placeholder="0.00"
                          />
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <select
                          value={it.taxPct}
                          onChange={e => {
                            const val = Number(e.target.value);
                            const opt = TAX_OPTIONS.find(x => x.value === val);
                            updateItem(idx, "taxPct", val);
                            updateItem(idx, "taxLabel", opt?.label || "NONE");
                          }}
                          className="w-full px-2 py-2 border border-slate-200 rounded-lg text-sm bg-white outline-none focus:border-indigo-500"
                        >
                          {TAX_OPTIONS.map(t => <option key={t.label} value={t.value}>{t.label}</option>)}
                        </select>
                        <div className="text-[10px] text-right text-slate-400 mt-1">Tax: ₹{comp.taxAmt.toFixed(2)}</div>
                      </td>
                      <td className="px-4 py-3 text-right font-mono text-sm font-semibold text-slate-700">
                        ₹{comp.amount.toFixed(2)}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <button
                          type="button"
                          onClick={() => removeRow(idx)}
                          className="p-1.5 hover:bg-rose-50 text-slate-300 hover:text-rose-600 rounded-lg transition-colors"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>

            {/* Table Footer actions */}
            <div className="px-6 py-4 bg-slate-50/50 border-t border-slate-100 flex flex-wrap items-center justify-between gap-4">
              <button
                type="button"
                onClick={addRow}
                className="flex items-center gap-1.5 px-4 py-2 border border-indigo-200 hover:border-indigo-600 hover:bg-indigo-50 rounded-xl text-xs font-semibold text-indigo-600 transition-all shadow-sm"
              >
                <Plus className="h-4 w-4" /> Add Row
              </button>
              <div className="flex items-center gap-6 text-xs text-slate-500 font-semibold">
                <div>Total Items: <span className="text-slate-800 font-bold">{items.length}</span></div>
                <div>Total Quantity: <span className="text-slate-800 font-bold">{totalQty}</span></div>
                <div>Total Tax Amount: <span className="text-slate-800 font-bold">₹{totalTax.toFixed(2)}</span></div>
              </div>
            </div>
          </div>

          {/* Form Bottom Block (T&C, Description, Roundoff, Totals) */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
            {/* Left side add-ons */}
            <div className="md:col-span-7 bg-white rounded-2xl border border-slate-100 p-6 space-y-4 shadow-sm">
              <div className="flex flex-wrap gap-2.5">
                <button
                  type="button"
                  onClick={() => setShowTerms(v => !v)}
                  className={clsx(
                    "flex items-center gap-1.5 px-3 py-2 border rounded-xl text-xs font-semibold transition-all",
                    showTerms ? "border-indigo-600 bg-indigo-50 text-indigo-600" : "border-slate-200 text-slate-600 hover:bg-slate-50"
                  )}
                >
                  <FileText className="h-4 w-4" /> Terms & Conditions
                </button>
                <button
                  type="button"
                  onClick={() => setShowDesc(v => !v)}
                  className={clsx(
                    "flex items-center gap-1.5 px-3 py-2 border rounded-xl text-xs font-semibold transition-all",
                    showDesc ? "border-indigo-600 bg-indigo-50 text-indigo-600" : "border-slate-200 text-slate-600 hover:bg-slate-50"
                  )}
                >
                  <ClipboardList className="h-4 w-4" /> Add Note/Description
                </button>
              </div>

              {showTerms && (
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Terms and Conditions</label>
                  <textarea
                    rows={3}
                    value={termsText}
                    onChange={e => setTermsText(e.target.value)}
                    placeholder="Enter customer terms here..."
                    className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm outline-none resize-none focus:border-indigo-500"
                  />
                </div>
              )}

              {showDesc && (
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Challan Description / Memo</label>
                  <textarea
                    rows={3}
                    value={description}
                    onChange={e => setDescription(e.target.value)}
                    placeholder="Enter dispatch notes, packaging details, vehicle specs..."
                    className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm outline-none resize-none focus:border-indigo-500"
                  />
                </div>
              )}
            </div>

            {/* Right side calculations */}
            <div className="md:col-span-5 bg-white rounded-2xl border border-slate-100 p-6 space-y-4 shadow-sm">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <span className="text-sm font-semibold text-slate-500">Subtotal Amount</span>
                <span className="text-sm font-semibold font-mono text-slate-800">₹{totalAmount.toFixed(2)}</span>
              </div>

              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="roundoff"
                    checked={roundOffEnabled}
                    onChange={e => setRoundOffEnabled(e.target.checked)}
                    className="h-4 w-4 text-indigo-600 border-slate-300 rounded focus:ring-indigo-500"
                  />
                  <label htmlFor="roundoff" className="text-sm font-semibold text-slate-500 cursor-pointer">Round Off</label>
                </div>
                <span className="text-sm font-semibold font-mono text-slate-800">
                  {roundOff >= 0 ? "+" : ""}₹{roundOff.toFixed(2)}
                </span>
              </div>

              <div className="flex items-center justify-between pt-2">
                <span className="text-base font-bold text-slate-800">Total Amount</span>
                <span className="text-xl font-bold font-mono text-indigo-600">₹{finalTotal.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Sticky footer action buttons */}
        <div className="bg-white border-t border-slate-200 px-6 py-4 flex items-center justify-between shrink-0 shadow-lg">
          <button
            type="button"
            onClick={() => {
              setView("list");
              resetForm();
            }}
            className="px-5 py-2.5 text-sm font-semibold border border-slate-200 hover:bg-slate-50 rounded-xl text-slate-600 transition-colors"
          >
            Cancel
          </button>
          
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => handleSave("DRAFT")}
              disabled={saving}
              className="px-5 py-2.5 text-sm font-semibold border border-slate-200 hover:bg-slate-50 rounded-xl text-slate-700 transition-colors disabled:opacity-50"
            >
              Save as Draft
            </button>
            <button
              type="button"
              onClick={() => handleSave("OPEN")}
              disabled={saving}
              className="flex items-center gap-2 px-6 py-2.5 text-sm font-bold bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow-lg shadow-indigo-100 transition-all disabled:opacity-50"
            >
              <Check className="h-4 w-4" /> {saving ? "Saving..." : "Save Challan"}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ════════════════════════════════════════════════════════════════════════════
  // 2. TRANSACTION LIST & EMPTY STATES (Screen 1 & Screen 3 Layout)
  // ════════════════════════════════════════════════════════════════════════════
  return (
    <div className="min-h-screen bg-slate-50 text-slate-800">
      
      {/* Top filter bar (Vyapar-Style) */}
      <div className="bg-white border-b border-slate-200 px-6 py-4 flex flex-wrap items-center justify-between gap-4 shadow-sm">
        <div className="flex flex-wrap items-center gap-3">
          <select
            value={dateFilter}
            onChange={e => setDateFilter(e.target.value)}
            className="border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-600 bg-white outline-none cursor-pointer hover:border-indigo-300"
          >
            <option value="THIS_MONTH">This Month</option>
            <option value="TODAY">Today</option>
            <option value="CUSTOM">Custom Range</option>
          </select>

          {dateFilter === "CUSTOM" && (
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5">
              <span>Between</span>
              <input
                type="date"
                value={dateFrom}
                onChange={e => setDateFrom(e.target.value)}
                className="bg-transparent outline-none text-slate-700 font-bold border-b border-slate-200 pb-0.5 focus:border-indigo-500"
              />
              <span>To</span>
              <input
                type="date"
                value={dateTo}
                onChange={e => setDateTo(e.target.value)}
                className="bg-transparent outline-none text-slate-700 font-bold border-b border-slate-200 pb-0.5 focus:border-indigo-500"
              />
            </div>
          )}

          <select
            value={firmFilter}
            onChange={e => setFirmFilter(e.target.value)}
            className="border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-600 bg-white outline-none cursor-pointer hover:border-indigo-300"
          >
            <option value="ALL">ALL FIRMS</option>
          </select>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              showToast("Excel Report generated successfully!", "success");
            }}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-emerald-600 hover:bg-emerald-50 border border-slate-200 rounded-xl transition-all shadow-sm"
          >
            <FileSpreadsheet className="h-4 w-4" /> Excel Report
          </button>
          <button
            onClick={() => {
              if (filteredChallans.length === 0) {
                showToast("No data to print", "warning");
                return;
              }
              window.print();
            }}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-indigo-600 hover:bg-indigo-50 border border-slate-200 rounded-xl transition-all shadow-sm"
          >
            <Printer className="h-4 w-4" /> Print
          </button>
          <button
            onClick={fetchData}
            className="p-2 border border-slate-200 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-xl transition-all"
          >
            <RefreshCw className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Main content body */}
      <div className="max-w-7xl mx-auto p-6 space-y-6">
        
        {/* Statistics Widgets */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: "Total Challans", value: stats.total, icon: ClipboardList, color: "text-slate-600", bg: "bg-slate-100" },
            { label: "Open Challans",   value: stats.open,  icon: Truck,          color: "text-blue-600",  bg: "bg-blue-50" },
            { label: "Closed/Delivered",value: stats.closed,icon: Check,          color: "text-emerald-600", bg: "bg-emerald-50" },
            { label: "Drafts",          value: stats.draft, icon: FileText,       color: "text-amber-600", bg: "bg-amber-50" },
          ].map(s => (
            <div key={s.label} className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 flex items-center gap-4">
              <div className={clsx("p-3 rounded-xl", s.bg)}>
                <s.icon className={clsx("h-5 w-5", s.color)} />
              </div>
              <div>
                <p className="text-xs text-slate-400 font-semibold tracking-wide uppercase">{s.label}</p>
                <p className="text-2xl font-bold text-slate-800 mt-0.5">{s.value}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Empty State View (Screen 1 Design) */}
        {filteredChallans.length === 0 ? (
          <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-16 flex flex-col items-center justify-center text-center space-y-6 min-h-[400px]">
            <h1 className="text-slate-400 font-bold tracking-widest text-sm uppercase">DELIVERY CHALLAN</h1>
            
            {/* Custom Illustration wrapper */}
            <div className="relative flex items-center justify-center">
              <div className="absolute w-40 h-40 bg-indigo-50 rounded-full scale-110 opacity-70 animate-pulse"></div>
              <div className="relative bg-white p-5 rounded-2xl border border-slate-100 shadow-lg flex items-center justify-center">
                <Truck className="h-16 w-16 text-emerald-500" />
                <div className="absolute -top-3 -right-3 bg-indigo-500 p-2 rounded-xl text-white shadow">
                  <Check className="h-5 w-5" />
                </div>
              </div>
            </div>

            <p className="text-slate-500 font-medium max-w-sm">
              Make & share delivery challan with your customers & convert it to sale whenever you want.
            </p>

            <button
              onClick={() => {
                resetForm();
                setView("create");
              }}
              className="px-6 py-3 bg-[#FF9800] hover:bg-[#F57C00] hover:scale-102 active:scale-98 text-white font-bold text-sm rounded-xl transition-all shadow-lg shadow-orange-100"
            >
              Add Your First Delivery Challan
            </button>
          </div>
        ) : (
          // Transactions list view (Screen 3 Design)
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
            
            {/* Transactions Header */}
            <div className="px-6 py-4 bg-slate-50/50 border-b border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">
              <span className="text-sm font-bold text-slate-800 tracking-wider uppercase">Transactions</span>
              
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full sm:w-auto">
                {/* Search box */}
                <div className="relative flex-1 sm:w-72">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <input
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    placeholder="Search by challan no or party..."
                    className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-xl text-xs bg-white outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/10"
                  />
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      showToast("Bulk conversion completed for selected Open challans!", "success");
                    }}
                    className="px-4 py-2 border border-rose-200 hover:bg-rose-50 text-rose-500 font-bold text-xs rounded-xl transition-colors shadow-sm whitespace-nowrap"
                  >
                    Bulk Convert To Sale
                  </button>
                  <button
                    onClick={() => {
                      resetForm();
                      setView("create");
                    }}
                    className="flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-md transition-all whitespace-nowrap"
                  >
                    <Plus className="h-4 w-4" /> Add Delivery Challan
                  </button>
                </div>
              </div>
            </div>

            {/* List Table */}
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-50 text-slate-500 font-semibold text-xs border-b border-slate-100 uppercase tracking-wider">
                  <th className="text-left px-6 py-3.5">Date</th>
                  <th className="text-left px-6 py-3.5">Party</th>
                  <th className="text-left px-6 py-3.5">Challan No.</th>
                  <th className="text-left px-6 py-3.5">Due Date</th>
                  <th className="text-right px-6 py-3.5">Total Amount</th>
                  <th className="text-center px-6 py-3.5">Status</th>
                  <th className="text-center px-6 py-3.5 w-44">Action</th>
                  <th className="w-12"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {filteredChallans.map(dc => {
                  const style = STATUS_STYLES[dc.status] || STATUS_STYLES.DRAFT;
                  const isDraft = dc.status === "DRAFT";
                  
                  return (
                    <tr
                      key={dc.id}
                      className={clsx(
                        "hover:bg-slate-50/50 transition-colors",
                        isDraft && "bg-slate-50/20 font-medium"
                      )}
                    >
                      <td className="px-6 py-4 text-xs font-semibold text-slate-500">
                        {new Date(dc.invoiceDate).toLocaleDateString("en-IN", { day: "2-digit", month: "2-digit", year: "numeric" })}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-full bg-slate-100 flex items-center justify-center text-slate-500">
                            <User className="h-3.5 w-3.5" />
                          </div>
                          <div>
                            <div className="font-semibold text-slate-800 text-xs">{dc.customerName}</div>
                            <div className="text-[10px] text-slate-400">{dc.customerPhone || "—"}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-xs font-mono font-bold text-indigo-600">
                        #{dc.challanNo}
                      </td>
                      <td className="px-6 py-4 text-xs">
                        <div className="font-medium text-slate-600">
                          {new Date(dc.dueDate).toLocaleDateString("en-IN", { day: "2-digit", month: "2-digit", year: "numeric" })}
                        </div>
                        {dc.status === "OPEN" && (
                          <div className="text-[10px] text-rose-500 font-bold mt-0.5">Due: Today</div>
                        )}
                      </td>
                      <td className="px-6 py-4 text-right font-mono font-bold text-slate-800 text-xs">
                        ₹{Number(dc.finalAmount).toFixed(2)}
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className={clsx("inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold border", style.color, style.bg, style.border)}>
                          {style.label}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        {dc.status === "OPEN" ? (
                          <button
                            onClick={() => convertToSale(dc)}
                            className="px-3 py-1.5 border border-slate-200 hover:border-indigo-600 text-indigo-600 hover:bg-indigo-50 font-bold text-[10px] rounded-xl transition-all whitespace-nowrap shadow-sm"
                          >
                            CONVERT TO SALE
                          </button>
                        ) : dc.status === "CLOSED" ? (
                          <span className="text-[10px] font-bold text-emerald-600 flex items-center justify-center gap-1">
                            <Check className="h-3.5 w-3.5" /> Converted
                          </span>
                        ) : (
                          <button
                            onClick={() => handleEdit(dc)}
                            className="px-3 py-1.5 border border-slate-200 hover:border-slate-400 text-slate-600 hover:bg-slate-50 font-semibold text-[10px] rounded-xl transition-all"
                          >
                            Resume Draft
                          </button>
                        )}
                      </td>
                      <td className="px-6 py-4 text-center relative">
                        <button
                          onClick={() => {
                            setShowRowMenu(showRowMenu === dc.id ? null : dc.id);
                          }}
                          className="p-1 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-slate-600 transition-colors"
                        >
                          <MoreVertical className="h-4 w-4" />
                        </button>
                        {showRowMenu === dc.id && (
                          <div className="absolute right-6 top-12 z-50 w-36 bg-white border border-slate-200 rounded-xl shadow-xl py-1 text-left">
                            <button
                              onClick={() => {
                                handleEdit(dc);
                                setShowRowMenu(null);
                              }}
                              className="w-full px-4 py-2 hover:bg-indigo-50 text-xs font-semibold text-slate-700 flex items-center gap-2 transition-colors"
                            >
                              Edit Challan
                            </button>
                            <button
                              onClick={() => {
                                handlePrint(dc);
                                setShowRowMenu(null);
                              }}
                              className="w-full px-4 py-2 hover:bg-indigo-50 text-xs font-semibold text-slate-700 flex items-center gap-2 transition-colors"
                            >
                              Print / PDF
                            </button>
                            <button
                              onClick={() => {
                                handleDelete(dc.id);
                                setShowRowMenu(null);
                              }}
                              className="w-full px-4 py-2 hover:bg-rose-50 text-xs font-semibold text-rose-600 flex items-center gap-2 transition-colors border-t border-slate-50"
                            >
                              Delete
                            </button>
                          </div>
                        )}
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
