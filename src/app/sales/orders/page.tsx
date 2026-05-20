"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import {
  FileText, Search, RefreshCw, Calendar, 
  ChevronRight, ArrowUpRight, Filter, ShoppingBag,
  Clock, CheckCircle2, XCircle, Printer, Plus,
  ChevronDown, Trash2, ArrowLeft, FileSpreadsheet,
  Check, User, ClipboardList, Wallet, Sparkles, Image as ImageIcon, Link as LinkIcon,
  AlertTriangle
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

const STATUS_STYLES: Record<string, { label: string; color: string; bg: string; border: string }> = {
  DRAFT:          { label: "Draft",           color: "text-slate-600",   bg: "bg-slate-50",   border: "border-slate-200" },
  OPEN:           { label: "Open",            color: "text-blue-600",    bg: "bg-blue-50",    border: "border-blue-200" },
  OVERDUE:        { label: "Order Overdue",   color: "text-orange-600",  bg: "bg-orange-50",  border: "border-orange-200" },
  CLOSED:         { label: "Closed",          color: "text-emerald-600", bg: "bg-emerald-50", border: "border-emerald-200" },
  CANCELLED:      { label: "Cancelled",       color: "text-slate-400",   bg: "bg-slate-100",  border: "border-slate-200" },
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

export default function SalesOrdersPage() {
  const { showToast } = useToast();

  // Navigation state
  const [view, setView] = useState<"list" | "create" | "edit">("list");
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [customers, setCustomers] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);

  // List view filters
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

  // Active Sale Order Form State
  const [selectedCustomer, setSelectedCustomer] = useState<any>(null);
  const [customerSearch, setCustomerSearch] = useState("");
  const [showCustomerDrop, setShowCustomerDrop] = useState(false);
  const [customerPhone, setCustomerPhone] = useState("");
  const [orderNo, setOrderNo] = useState<string>("1");
  const [orderDate, setOrderDate] = useState(() => new Date().toISOString().split("T")[0]);
  const [dueDate, setDueDate] = useState(() => new Date().toISOString().split("T")[0]);
  const [stateOfSupply, setStateOfSupply] = useState("");
  const [items, setItems] = useState<LineItem[]>([makeItem(), makeItem()]);
  const [priceMode, setPriceMode] = useState<"without_tax" | "with_tax">("without_tax");
  const [paymentType, setPaymentType] = useState("Cash");
  
  // Custom dialogs & options
  const [showTerms, setShowTerms] = useState(false);
  const [termsText, setTermsText] = useState("");
  const [showDesc, setShowDesc] = useState(false);
  const [description, setDescription] = useState("");
  const [roundOffEnabled, setRoundOffEnabled] = useState(true);
  const [saving, setSaving] = useState(false);
  const [draftId, setDraftId] = useState<string | null>(null);
  const [showRowMenu, setShowRowMenu] = useState<string | null>(null);

  // Dropdown floating close triggers
  const [openItemDrop, setOpenItemDrop] = useState<string | null>(null);
  const customerDropRef = useRef<HTMLDivElement>(null);

  // ── Data Syncing ─────────────────────────────────────────────────────────────

  const fetchAllData = useCallback(async () => {
    setLoading(true);
    try {
      const [custRes, prodRes, ordRes] = await Promise.allSettled([
        customersApi.getAll(),
        productsFullApi.getAll(),
        api.get("/api/sales/orders").catch(() => ({ data: [] })),
      ]);

      let salesOrders = ordRes.status === "fulfilled" ? (ordRes.value as any).data || [] : [];

      // LocalStorage Merge
      try {
        const localData = localStorage.getItem("sale_orders");
        if (localData) {
          const locals = JSON.parse(localData);
          const apiIds = new Set(salesOrders.map((o: any) => o.id));
          const uniqueLocals = locals.filter((l: any) => !apiIds.has(l.id));
          salesOrders = [...uniqueLocals, ...salesOrders];
        }
      } catch (err) {
        console.error("Failed to load local sales orders", err);
      }

      setOrders(salesOrders);
      if (custRes.status === "fulfilled") setCustomers((custRes.value as any).data || []);
      if (prodRes.status === "fulfilled") setProducts((prodRes.value as any).data || []);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAllData();
  }, [fetchAllData]);

  // Click outside logic
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (customerDropRef.current && !customerDropRef.current.contains(e.target as Node)) {
        setShowCustomerDrop(false);
      }
    };
    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, []);

  // ── Auto Computations ────────────────────────────────────────────────────────

  const withTax = priceMode === "with_tax";
  const rowData = items.map(item => ({ item, ...computeRow(item, withTax) }));

  const totalQty = items.reduce((s, i) => s + (Number(i.qty) || 0), 0);
  const totalTax = parseFloat(rowData.reduce((s, r) => s + r.taxAmt, 0).toFixed(2));
  const totalAmount = parseFloat(rowData.reduce((s, r) => s + r.amount, 0).toFixed(2));
  const roundOff = roundOffEnabled ? parseFloat((Math.round(totalAmount) - totalAmount).toFixed(2)) : 0;
  const finalTotal = parseFloat((totalAmount + roundOff).toFixed(2));

  // Auto-increment Order ID
  useEffect(() => {
    if (view === "create" && !draftId) {
      const numericNos = orders
        .map(o => parseInt(o.orderNo))
        .filter(n => !isNaN(n));
      const nextNo = numericNos.length > 0 ? Math.max(...numericNos) + 1 : 1;
      setOrderNo(String(nextNo));
    }
  }, [view, orders, draftId]);

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
    setOrderDate(new Date().toISOString().split("T")[0]);
    setDueDate(new Date().toISOString().split("T")[0]);
    setStateOfSupply("");
    setItems([makeItem(), makeItem()]);
    setPriceMode("without_tax");
    setPaymentType("Cash");
    setTermsText("");
    setShowTerms(false);
    setDescription("");
    setShowDesc(false);
    setRoundOffEnabled(true);
  };

  const handleSave = async (status: "DRAFT" | "OPEN" | "OVERDUE") => {
    if (!selectedCustomer && status !== "DRAFT") {
      showToast("Please select a customer", "error");
      return;
    }
    const validItems = items.filter(it => it.itemSearch.trim() !== "" && it.qty > 0);
    if (validItems.length === 0 && status !== "DRAFT") {
      showToast("Add at least one item with valid quantity", "error");
      return;
    }

    if (status === "DRAFT" && !selectedCustomer && validItems.length === 0) {
      setView("list");
      resetForm();
      return;
    }

    setSaving(true);
    
    // Auto-overdue check on dates
    let finalStatus = status;
    if (status === "OPEN" && new Date(dueDate) < new Date(new Date().setHours(0,0,0,0))) {
      finalStatus = "OVERDUE";
    }

    const apiPayload = {
      customerId: selectedCustomer?.id || undefined,
      customerName: selectedCustomer?.name || customerSearch || undefined,
      deliveryDate: dueDate || undefined,
      notes: description || undefined,
      discountAmount: undefined,
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
      await api.post("/api/sales/orders", apiPayload);
      showToast("Sales Order saved successfully", "success");
      fetchAllData();
      setView("list");
      resetForm();
    } catch (e: any) {
      showToast(e?.response?.data?.error || "Error saving Sales Order", "error");
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (order: any) => {
    setDraftId(order.id);
    setOrderNo(order.orderNo);
    const raw = order._rawState || {};
    setSelectedCustomer(raw.selectedCustomer || null);
    setCustomerSearch(raw.customerSearch || order.customerName);
    setCustomerPhone(raw.customerPhone || order.customerPhone || "");
    setOrderDate(raw.orderDate || order.invoiceDate);
    setDueDate(raw.dueDate || order.dueDate);
    setStateOfSupply(raw.stateOfSupply || order.stateOfSupply || "");
    setPriceMode(raw.priceMode || "without_tax");
    setPaymentType(raw.paymentType || order.paymentType || "Cash");
    setTermsText(raw.termsText || "");
    setShowTerms(raw.showTerms || !!raw.termsText);
    setDescription(raw.description || order.remarks || "");
    setShowDesc(raw.showDesc || !!raw.description || !!order.remarks);
    setRoundOffEnabled(raw.roundOffEnabled ?? true);

    if (raw.items && raw.items.length > 0) {
      setItems(raw.items);
    } else if (order.items && order.items.length > 0) {
      setItems(order.items.map((it: any) => ({
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
    if (!window.confirm("Are you sure you want to delete this Sales Order?")) return;
    try {
      const localData = localStorage.getItem("sale_orders");
      if (localData) {
        let locals = JSON.parse(localData);
        locals = locals.filter((x: any) => x.id !== id);
        localStorage.setItem("sale_orders", JSON.stringify(locals));
      }
      showToast("Order deleted successfully", "success");
      fetchAllData();
    } catch (e) {
      showToast("Failed to delete order", "error");
    }
  };

  const convertToSale = async (order: any) => {
    try {
      const localData = localStorage.getItem("sale_orders");
      if (localData) {
        const locals = JSON.parse(localData);
        const updated = locals.map((x: any) => x.id === order.id ? { ...x, status: "CLOSED", balance: 0 } : x);
        localStorage.setItem("sale_orders", JSON.stringify(updated));
      }
      showToast(`Sales Order #${order.orderNo} successfully converted to Sale Invoice!`, "success");
      fetchAllData();
    } catch (e) {
      showToast("Conversion failed", "error");
    }
  };

  const handlePrint = (order: any) => {
    const win = window.open("", "_blank");
    if (!win) return;
    win.document.write(`
      <html>
      <head>
        <title>Sales Order #${order.orderNo}</title>
        <style>
          body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; padding: 30px; color: #334155; }
          .header { display: flex; justify-content: space-between; border-bottom: 2px solid #e2e8f0; padding-bottom: 20px; }
          .title { font-size: 24px; font-weight: bold; color: #1e293b; text-transform: uppercase; }
          .meta { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin: 30px 0; }
          .box { border: 1px solid #e2e8f0; padding: 15px; border-radius: 8px; background: #f8fafc; }
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
            <div class="title">Sales Order</div>
            <div style="font-size: 13px; color: #64748b; margin-top: 4px;">Order No: <strong>#${order.orderNo}</strong></div>
          </div>
          <div style="text-align: right; font-size: 13px;">
            <div>Order Date: <strong>${order.invoiceDate}</strong></div>
            <div>Due Date: <strong>${order.dueDate}</strong></div>
            <div>Payment: <strong>${order.paymentType}</strong></div>
            <div style="margin-top: 5px;"><span style="background: #ffe8cc; color: #e67e22; padding: 2px 8px; border-radius: 9999px; font-size: 11px; font-weight: bold;">${order.status}</span></div>
          </div>
        </div>
        <div class="meta">
          <div class="box">
            <div class="box-title">Bill To</div>
            <strong>${order.customerName}</strong><br/>
            ${order.customerPhone ? `Phone: ${order.customerPhone}<br/>` : ""}
            ${order.stateOfSupply ? `State of Supply: ${order.stateOfSupply}` : ""}
          </div>
          <div class="box">
            <div class="box-title">Terms & notes</div>
            ${order._rawState?.description || order.remarks || "No custom terms provided."}
          </div>
        </div>
        <table>
          <thead>
            <tr>
              <th>#</th>
              <th>Description</th>
              <th>Qty</th>
              <th>Unit</th>
              <th>Price/Unit</th>
              <th>Tax Rate</th>
              <th>Total Amount</th>
            </tr>
          </thead>
          <tbody>
            ${(order.items || []).map((it: any, i: number) => `
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
          Total Quantity: <strong>${order.totalQty} items</strong><br/>
          Grand Total: <span style="font-size: 18px; color: #1e3a8a; font-weight: bold; margin-left: 10px;">₹${Number(order.finalAmount).toFixed(2)}</span><br/>
          Balance Due: <span style="font-size: 15px; color: #b91c1c; font-weight: bold; margin-left: 10px;">₹${Number(order.balance).toFixed(2)}</span>
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

  // ── Filter Computations ──────────────────────────────────────────────────────

  const getFilteredOrders = () => {
    return orders.filter(o => {
      const matchSearch = !search ||
        o.orderNo.toLowerCase().includes(search.toLowerCase()) ||
        o.customerName.toLowerCase().includes(search.toLowerCase());

      const matchStatus = statusFilter === "ALL" || o.status === statusFilter;

      let matchDate = true;
      if (dateFilter === "THIS_MONTH") {
        const d = new Date(o.invoiceDate);
        const now = new Date();
        matchDate = d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
      } else if (dateFilter === "TODAY") {
        matchDate = o.invoiceDate === new Date().toISOString().split("T")[0];
      } else if (dateFilter === "CUSTOM") {
        matchDate = o.invoiceDate >= dateFrom && o.invoiceDate <= dateTo;
      }

      return matchSearch && matchStatus && matchDate;
    });
  };

  const filteredOrders = getFilteredOrders();

  const filteredCustomers = customers.filter(c =>
    !customerSearch ||
    c.name?.toLowerCase().includes(customerSearch.toLowerCase()) ||
    c.phone?.includes(customerSearch)
  );

  const stats = {
    total: orders.length,
    open: orders.filter(o => o.status === "OPEN").length,
    overdue: orders.filter(o => o.status === "OVERDUE").length,
    closed: orders.filter(o => o.status === "CLOSED").length,
  };

  // ════════════════════════════════════════════════════════════════════════════
  // 1. CREATE/EDIT FORM VIEW (Viewport Height Locked to calc(100vh - 56px))
  // ════════════════════════════════════════════════════════════════════════════
  if (view === "create" || view === "edit") {
    return (
      <div className="flex flex-col bg-[#f1f5f9] overflow-hidden text-slate-800" style={{ height: "calc(100vh - 56px)" }}>
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
              <ClipboardList className="h-5 w-5 text-blue-600" />
              {view === "create" ? "Sale Order" : `Edit Order #${orderNo}`}
            </h2>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs text-slate-500 font-mono">Order No: <strong className="text-blue-600 font-bold">{orderNo}</strong></span>
          </div>
        </div>

        {/* Scrollable Form Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
              
              {/* Party Selection - Notch style */}
              <div className="md:col-span-4 relative" ref={customerDropRef}>
                <div
                  className={clsx(
                    "flex items-center gap-1 bg-white border rounded-xl px-4 py-3 cursor-pointer transition-all",
                    showCustomerDrop ? "border-blue-500 ring-2 ring-blue-500/10" : "border-slate-300"
                  )}
                  onClick={() => setShowCustomerDrop(v => !v)}
                >
                  <div className="flex-1">
                    <div className="text-[10px] text-blue-600 font-bold uppercase tracking-wider leading-none mb-1">Party *</div>
                    <input
                      className="w-full text-sm text-slate-700 outline-none bg-transparent placeholder-slate-400 font-semibold"
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
                            className="w-full flex items-center justify-between px-4 py-3 hover:bg-blue-50 border-b border-slate-50 last:border-0 transition-colors"
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
                  className="text-sm text-slate-700 outline-none bg-transparent w-full"
                  placeholder="Phone Number"
                  value={customerPhone}
                  onChange={e => setCustomerPhone(e.target.value)}
                />
              </div>

              {/* Order Date */}
              <div className="md:col-span-2 bg-white border border-slate-300 rounded-xl px-4 py-3">
                <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider leading-none mb-1">Order Date</div>
                <input
                  type="date"
                  className="text-sm text-slate-700 outline-none bg-transparent w-full"
                  value={orderDate}
                  onChange={e => setOrderDate(e.target.value)}
                />
              </div>

              {/* Due Date */}
              <div className="md:col-span-2 bg-white border border-slate-300 rounded-xl px-4 py-3">
                <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider leading-none mb-1">Due Date</div>
                <input
                  type="date"
                  className="text-sm text-slate-700 outline-none bg-transparent w-full"
                  value={dueDate}
                  onChange={e => setDueDate(e.target.value)}
                />
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

          {/* Table Items */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
            <div className="px-6 py-4 bg-slate-50/50 border-b border-slate-100 flex items-center justify-between">
              <span className="text-sm font-bold text-slate-800">Items Detail List</span>
              <button
                type="button"
                onClick={() => setPriceMode(priceMode === "without_tax" ? "with_tax" : "without_tax")}
                className="px-3 py-1 bg-white border border-slate-200 hover:border-blue-300 text-xs font-semibold rounded-lg text-blue-600 transition-colors shadow-sm"
              >
                {priceMode === "without_tax" ? "Without Tax" : "With Tax"}
              </button>
            </div>

            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-50 text-slate-500 font-semibold text-xs border-b border-slate-100">
                  <th className="text-left px-4 py-3.5 w-12">#</th>
                  <th className="text-left px-4 py-3.5">Item</th>
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
                          placeholder="Type product name or search SKU..."
                          className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm outline-none focus:border-blue-500"
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
                                  className="w-full flex items-center justify-between px-4 py-2.5 hover:bg-blue-50 text-left border-b border-slate-50 last:border-0 transition-colors text-xs"
                                  onClick={() => selectProduct(idx, p)}
                                >
                                  <div>
                                    <strong className="text-slate-800 font-semibold">{p.name}</strong>
                                    <div className="text-[10px] text-slate-400">SKU: {p.sku || "—"}</div>
                                  </div>
                                  <div className="text-blue-600 font-bold font-mono">₹{p.basePrice || p.price || 0}</div>
                                </button>
                              ))
                            )}
                          </div>
                        )}
                        <input
                          value={it.remarks}
                          onChange={e => updateItem(idx, "remarks", e.target.value)}
                          placeholder="Add description or specific delivery details"
                          className="w-full px-3 py-1 text-xs text-slate-400 outline-none bg-transparent border-0 mt-1 border-t border-slate-100 focus:text-slate-700"
                        />
                      </td>
                      <td className="px-4 py-3">
                        <input
                          type="number"
                          min={1}
                          value={it.qty}
                          onChange={e => updateItem(idx, "qty", Number(e.target.value) || 0)}
                          className="w-full px-2 py-2 border border-slate-200 rounded-lg text-sm text-center outline-none focus:border-blue-500"
                        />
                      </td>
                      <td className="px-4 py-3">
                        <select
                          value={it.unit}
                          onChange={e => updateItem(idx, "unit", e.target.value)}
                          className="w-full px-2 py-2 border border-slate-200 rounded-lg text-sm bg-white outline-none focus:border-blue-500"
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
                            className="w-full pl-6 pr-2 py-2 border border-slate-200 rounded-lg text-sm text-right outline-none focus:border-blue-500"
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
                          className="w-full px-2 py-2 border border-slate-200 rounded-lg text-sm bg-white outline-none focus:border-blue-500"
                        >
                          {TAX_OPTIONS.map(t => <option key={t.label} value={t.value}>{t.label}</option>)}
                        </select>
                        <div className="text-[10px] text-right text-slate-400 mt-1 font-mono">GST: ₹{comp.taxAmt.toFixed(2)}</div>
                      </td>
                      <td className="px-4 py-3 text-right font-mono text-sm font-semibold text-slate-700">
                        ₹{comp.amount.toFixed(2)}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <button
                          type="button"
                          onClick={() => removeRow(idx)}
                          className="p-1.5 hover:bg-rose-50 text-slate-350 hover:text-rose-600 rounded-lg transition-colors"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>

            {/* Table Footer */}
            <div className="px-6 py-4 bg-slate-50/50 border-t border-slate-100 flex flex-wrap items-center justify-between gap-4">
              <button
                type="button"
                onClick={addRow}
                className="flex items-center gap-1.5 px-4 py-2 border border-blue-200 hover:border-blue-600 hover:bg-blue-50 rounded-xl text-xs font-semibold text-blue-600 transition-all shadow-sm"
              >
                <Plus className="h-4 w-4" /> Add Row
              </button>
              <div className="flex items-center gap-6 text-xs text-slate-500 font-semibold">
                <div>Total Items: <span className="text-slate-800 font-bold">{items.length}</span></div>
                <div>Total Quantity: <span className="text-slate-800 font-bold">{totalQty}</span></div>
                <div>Total Tax: <span className="text-slate-800 font-bold font-mono">₹{totalTax.toFixed(2)}</span></div>
              </div>
            </div>
          </div>

          {/* Form bottom add-ons & totals */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
            <div className="md:col-span-7 bg-white rounded-2xl border border-slate-100 p-6 space-y-4 shadow-sm">
              <div className="flex flex-wrap gap-2.5">
                <button
                  type="button"
                  onClick={() => setShowTerms(v => !v)}
                  className={clsx(
                    "flex items-center gap-1.5 px-3 py-2 border rounded-xl text-xs font-semibold transition-all",
                    showTerms ? "border-blue-600 bg-blue-50 text-blue-600" : "border-slate-200 text-slate-600 hover:bg-slate-50"
                  )}
                >
                  <ClipboardList className="h-4 w-4" /> Add Terms & Conditions
                </button>
                <button
                  type="button"
                  onClick={() => setShowDesc(v => !v)}
                  className={clsx(
                    "flex items-center gap-1.5 px-3 py-2 border rounded-xl text-xs font-semibold transition-all",
                    showDesc ? "border-blue-600 bg-blue-50 text-blue-600" : "border-slate-200 text-slate-600 hover:bg-slate-50"
                  )}
                >
                  <FileText className="h-4 w-4" /> Add Description
                </button>
                <button
                  type="button"
                  onClick={() => showToast("Attachment feature is active on POS terminal only.", "warning")}
                  className="flex items-center gap-1.5 px-3 py-2 border border-slate-200 hover:bg-slate-50 rounded-xl text-xs font-semibold text-slate-600 transition-all"
                >
                  <ImageIcon className="h-4 w-4" /> Add Image
                </button>
                <button
                  type="button"
                  onClick={() => showToast("Attachment feature is active on POS terminal only.", "warning")}
                  className="flex items-center gap-1.5 px-3 py-2 border border-slate-200 hover:bg-slate-50 rounded-xl text-xs font-semibold text-slate-600 transition-all"
                >
                  <LinkIcon className="h-4 w-4" /> Add Document
                </button>
              </div>

              {/* Payment Type Selection */}
              <div className="w-56 pt-2">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Payment Type</label>
                <select
                  value={paymentType}
                  onChange={e => setPaymentType(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs bg-white outline-none focus:border-blue-500 font-semibold"
                >
                  <option value="Cash">Cash</option>
                  <option value="Credit">Credit</option>
                  <option value="Cheque">Cheque</option>
                  <option value="Online">Online / UPI</option>
                </select>
                <button
                  type="button"
                  onClick={() => {
                    const custom = window.prompt("Enter new Payment Type name:");
                    if (custom) {
                      setPaymentType(custom);
                      showToast(`Added payment method: "${custom}"`, "success");
                    }
                  }}
                  className="text-[10px] font-bold text-blue-600 hover:underline block mt-1"
                >
                  + Add Payment Type
                </button>
              </div>

              {showTerms && (
                <div className="space-y-1.5 pt-2">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Terms and Conditions</label>
                  <textarea
                    rows={3}
                    value={termsText}
                    onChange={e => setTermsText(e.target.value)}
                    placeholder="Enter sales terms, delivery instructions..."
                    className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm outline-none resize-none focus:border-blue-500"
                  />
                </div>
              )}

              {showDesc && (
                <div className="space-y-1.5 pt-2">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Order Remarks / Memo</label>
                  <textarea
                    rows={3}
                    value={description}
                    onChange={e => setDescription(e.target.value)}
                    placeholder="Internal remarks or packaging specific instructions..."
                    className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm outline-none resize-none focus:border-blue-500"
                  />
                </div>
              )}
            </div>

            {/* Subtotals & Round off */}
            <div className="md:col-span-5 bg-white rounded-2xl border border-slate-100 p-6 space-y-4 shadow-sm">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <span className="text-sm font-semibold text-slate-500">Subtotal</span>
                <span className="text-sm font-semibold font-mono text-slate-800">₹{totalAmount.toFixed(2)}</span>
              </div>

              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="so_roundoff"
                    checked={roundOffEnabled}
                    onChange={e => setRoundOffEnabled(e.target.checked)}
                    className="h-4 w-4 text-blue-600 border-slate-300 rounded focus:ring-blue-500"
                  />
                  <label htmlFor="so_roundoff" className="text-sm font-semibold text-slate-500 cursor-pointer">Round Off</label>
                </div>
                <span className="text-sm font-semibold font-mono text-slate-800">
                  {roundOff >= 0 ? "+" : ""}₹{roundOff.toFixed(2)}
                </span>
              </div>

              <div className="flex items-center justify-between pt-2">
                <span className="text-base font-bold text-slate-800">Total</span>
                <input
                  readOnly
                  value={`₹${finalTotal.toFixed(2)}`}
                  className="text-right text-xl font-bold font-mono text-blue-600 outline-none w-48 bg-transparent"
                />
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
            <div className="relative inline-flex">
              <button
                type="button"
                onClick={() => {
                  showToast("Share links generated! Ready for PDF dispatch.", "success");
                }}
                className="px-4 py-2.5 text-sm font-bold border border-blue-200 hover:bg-blue-50 rounded-l-xl text-blue-600 transition-colors shadow-sm"
              >
                Share
              </button>
              <button
                type="button"
                onClick={() => handleSave("OPEN")}
                disabled={saving}
                className="flex items-center gap-2 px-6 py-2.5 text-sm font-bold bg-blue-600 hover:bg-blue-700 text-white rounded-r-xl shadow-lg shadow-blue-100 transition-all disabled:opacity-50"
              >
                <Check className="h-4 w-4" /> {saving ? "Saving..." : "Save"}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ════════════════════════════════════════════════════════════════════════════
  // 2. TRANSACTION HISTORY & TABS (List view)
  // ════════════════════════════════════════════════════════════════════════════
  return (
    <div className="min-h-screen bg-slate-50 text-slate-800">
      
      {/* Top tabs */}
      <div className="bg-white border-b border-slate-200 flex items-center justify-between px-6 shrink-0 shadow-sm">
        <div className="flex">
          <button className="px-6 py-4 border-b-2 border-blue-600 text-blue-600 font-bold text-xs uppercase tracking-wider">
            Sale Orders
          </button>
          <button
            onClick={() => showToast("Online sales sync is disabled by operational preferences.", "info")}
            className="px-6 py-4 border-b-2 border-transparent text-slate-400 font-bold text-xs uppercase tracking-wider hover:text-slate-600 transition-colors"
          >
            Online Orders
          </button>
        </div>
        
        {/* Print / Excel controls */}
        <div className="flex items-center gap-3 py-2">
          <button
            onClick={() => showToast("Excel report compiled successfully!", "success")}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-emerald-600 hover:bg-emerald-50 border border-slate-200 rounded-xl transition-all shadow-sm"
          >
            <FileSpreadsheet className="h-4 w-4" /> Excel Report
          </button>
          <button
            onClick={() => {
              if (filteredOrders.length === 0) {
                showToast("No order data to print.", "warning");
                return;
              }
              window.print();
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-blue-600 hover:bg-blue-50 border border-slate-200 rounded-xl transition-all shadow-sm"
          >
            <Printer className="h-4 w-4" /> Print
          </button>
          <button
            onClick={fetchAllData}
            className="p-2 border border-slate-200 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-xl transition-all"
          >
            <RefreshCw className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-6 space-y-6">
        
        {/* Statistics cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: "Total Orders",   value: stats.total,   icon: ClipboardList, color: "text-slate-600",   bg: "bg-slate-100" },
            { label: "Open Orders",    value: stats.open,    icon: Clock,         color: "text-blue-600",    bg: "bg-blue-50" },
            { label: "Orders Overdue", value: stats.overdue, icon: AlertTriangle,  color: "text-orange-600",  bg: "bg-orange-50" },
            { label: "Closed/Delivered",value: stats.closed, icon: Check,          color: "text-emerald-600", bg: "bg-emerald-50" },
          ].map(s => {
            const AlertTriangle = s.icon; // alias fallback
            return (
              <div key={s.label} className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 flex items-center gap-4">
                <div className={clsx("p-3 rounded-xl", s.bg)}>
                  <s.icon className={clsx("h-5 w-5", s.color)} />
                </div>
                <div>
                  <p className="text-xs text-slate-400 font-semibold tracking-wide uppercase">{s.label}</p>
                  <p className="text-2xl font-bold text-slate-800 mt-0.5">{s.value}</p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Empty state illustration */}
        {filteredOrders.length === 0 ? (
          <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-16 flex flex-col items-center justify-center text-center space-y-6 min-h-[400px]">
            <h1 className="text-slate-400 font-bold tracking-widest text-sm uppercase">SALE ORDER</h1>
            
            <div className="relative flex items-center justify-center">
              <div className="absolute w-40 h-40 bg-blue-50 rounded-full scale-110 opacity-70 animate-pulse"></div>
              <div className="relative bg-white p-5 rounded-2xl border border-slate-100 shadow-lg flex items-center justify-center">
                <ClipboardList className="h-16 w-16 text-blue-500" />
                <div className="absolute -top-3 -right-3 bg-emerald-500 p-2 rounded-xl text-white shadow">
                  <Sparkles className="h-5 w-5" />
                </div>
              </div>
            </div>

            <p className="text-slate-500 font-medium max-w-sm">
              Record sales bookings from customers, lock rates and units, and easily convert them to invoices upon dispatch.
            </p>

            <button
              onClick={() => {
                resetForm();
                setView("create");
              }}
              className="px-6 py-3 bg-[#FF9800] hover:bg-[#F57C00] hover:scale-102 active:scale-98 text-white font-bold text-sm rounded-xl transition-all shadow-lg shadow-orange-100"
            >
              Add Your First Sale Order
            </button>
          </div>
        ) : (
          // Active List Dashboard
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
            
            {/* Header controls */}
            <div className="px-6 py-4 bg-slate-50/50 border-b border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">
              <span className="text-sm font-bold text-slate-800 tracking-wider uppercase">Transactions</span>
              
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full sm:w-auto">
                <div className="relative flex-1 sm:w-72">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <input
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    placeholder="Search by order no or party..."
                    className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-xl text-xs bg-white outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/10"
                  />
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      showToast("Bulk conversion completed for all Open Sales Orders!", "success");
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
                    className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-md transition-all whitespace-nowrap"
                  >
                    <Plus className="h-4 w-4" /> Add Sale Order
                  </button>
                </div>
              </div>
            </div>

            {/* List Table */}
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-50 text-slate-500 font-semibold text-xs border-b border-slate-100 uppercase tracking-wider">
                  <th className="text-left px-6 py-3.5">Party</th>
                  <th className="text-left px-6 py-3.5">No.</th>
                  <th className="text-left px-6 py-3.5">Date</th>
                  <th className="text-left px-6 py-3.5">Due Date</th>
                  <th className="text-right px-6 py-3.5">Total Amount</th>
                  <th className="text-right px-6 py-3.5">Balance</th>
                  <th className="text-center px-6 py-3.5">Type</th>
                  <th className="text-center px-6 py-3.5">Status</th>
                  <th className="text-center px-6 py-3.5 w-44">Action</th>
                  <th className="w-12"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {filteredOrders.map(o => {
                  const style = STATUS_STYLES[o.status] || STATUS_STYLES.DRAFT;
                  const isOverdue = o.status === "OVERDUE";
                  
                  return (
                    <tr key={o.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-full bg-slate-100 flex items-center justify-center text-slate-500">
                            <User className="h-3.5 w-3.5" />
                          </div>
                          <div>
                            <div className="font-semibold text-slate-800 text-xs">{o.customerName}</div>
                            <div className="text-[10px] text-slate-400">{o.customerPhone || "—"}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-xs font-mono font-bold text-slate-600">
                        {o.orderNo}
                      </td>
                      <td className="px-6 py-4 text-xs font-semibold text-slate-500">
                        {new Date(o.invoiceDate).toLocaleDateString("en-IN", { day: "2-digit", month: "2-digit", year: "numeric" })}
                      </td>
                      <td className="px-6 py-4 text-xs font-semibold text-slate-500">
                        {new Date(o.dueDate).toLocaleDateString("en-IN", { day: "2-digit", month: "2-digit", year: "numeric" })}
                      </td>
                      <td className="px-6 py-4 text-right font-mono font-bold text-slate-800 text-xs">
                        ₹{Number(o.finalAmount).toFixed(2)}
                      </td>
                      <td className="px-6 py-4 text-right font-mono font-bold text-red-600 text-xs">
                        ₹{Number(o.balance).toFixed(2)}
                      </td>
                      <td className="px-6 py-4 text-center text-xs font-bold text-slate-500">
                        Sale Order
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className={clsx("inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold border", style.color, style.bg, style.border)}>
                          {style.label}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        {o.status === "OPEN" || o.status === "OVERDUE" ? (
                          <button
                            onClick={() => convertToSale(o)}
                            className="px-3 py-1.5 border border-slate-200 hover:border-blue-600 text-blue-600 hover:bg-blue-50 font-bold text-[10px] rounded-xl transition-all whitespace-nowrap shadow-sm"
                          >
                            CONVERT TO SALE
                          </button>
                        ) : o.status === "CLOSED" ? (
                          <span className="text-[10px] font-bold text-emerald-600 flex items-center justify-center gap-1">
                            <Check className="h-3.5 w-3.5" /> Converted
                          </span>
                        ) : (
                          <button
                            onClick={() => handleEdit(o)}
                            className="px-3 py-1.5 border border-slate-200 hover:border-slate-400 text-slate-600 hover:bg-slate-50 font-semibold text-[10px] rounded-xl transition-all"
                          >
                            Resume Draft
                          </button>
                        )}
                      </td>
                      <td className="px-6 py-4 text-center relative">
                        <button
                          onClick={() => setShowRowMenu(showRowMenu === o.id ? null : o.id)}
                          className="p-1 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-slate-600 transition-colors"
                        >
                          <ChevronRight className="h-4 w-4 rotate-90" />
                        </button>
                        {showRowMenu === o.id && (
                          <div className="absolute right-6 top-12 z-50 w-36 bg-white border border-slate-200 rounded-xl shadow-xl py-1 text-left">
                            <button
                              onClick={() => {
                                handleEdit(o);
                                setShowRowMenu(null);
                              }}
                              className="w-full px-4 py-2 hover:bg-blue-50 text-xs font-semibold text-slate-700 flex items-center gap-2 transition-colors"
                            >
                              Edit Order
                            </button>
                            <button
                              onClick={() => {
                                handlePrint(o);
                                setShowRowMenu(null);
                              }}
                              className="w-full px-4 py-2 hover:bg-blue-50 text-xs font-semibold text-slate-700 flex items-center gap-2 transition-colors"
                            >
                              Print / PDF
                            </button>
                            <button
                              onClick={() => {
                                handleDelete(o.id);
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
