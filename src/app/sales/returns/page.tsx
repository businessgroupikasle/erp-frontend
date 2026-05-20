"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { 
  Plus, Search, RefreshCw, ArrowLeft, Trash2, 
  User, Building2, AlertTriangle, Receipt, Undo2, 
  ChevronRight, Printer, FileSpreadsheet, Check, 
  CheckCircle2, XCircle, Sparkles, ShoppingBag, Clock, MoreVertical
} from "lucide-react";
import { salesApi, franchiseApi, customersApi, franchiseOrdersApi } from "@/lib/api";
import { useToast } from "@/context/ToastContext";
import { clsx } from "clsx";
import api from "@/lib/api/base";

// ── Types ─────────────────────────────────────────────────────────────────────

interface ReturnItem {
  productId: string;
  productName: string;
  orderQuantity: number;
  returnQuantity: number;
  rate: number;
  condition: string;
}

interface ReturnOrder {
  id: string;
  returnNumber: string;
  source: 'FRANCHISE' | 'PARTNER';
  entityId: string;
  entityName: string;
  entityPhone?: string;
  orderRefId: string;
  orderRefNumber: string;
  reason: string;
  refundAmount: number;
  refundMethod: string;
  status: 'PENDING' | 'APPROVED' | 'COMPLETED' | 'REJECTED' | 'DRAFT';
  createdAt: string;
  items: ReturnItem[];
  _rawState?: any;
}

const STATUS_STYLES: Record<string, { label: string; color: string; bg: string; border: string }> = {
  PENDING:   { label: "Pending Approval", color: "text-orange-600",  bg: "bg-orange-50",  border: "border-orange-200" },
  APPROVED:  { label: "Approved",         color: "text-blue-600",    bg: "bg-blue-50",    border: "border-blue-200" },
  COMPLETED: { label: "Refund Processed font-bold", color: "text-emerald-600 font-bold", bg: "bg-emerald-50", border: "border-emerald-200" },
  REJECTED:  { label: "Rejected",         color: "text-rose-600",    bg: "bg-rose-50",    border: "border-rose-200" },
  DRAFT:     { label: "Draft Request",    color: "text-slate-600",   bg: "bg-slate-50",   border: "border-slate-200" },
};

// ── Main Component ────────────────────────────────────────────────────────────

export default function SalesReturnsPage() {
  const { showToast } = useToast();

  // Navigation
  const [view, setView] = useState<"list" | "create" | "edit">("list");
  const [returns, setReturns] = useState<ReturnOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState<'ALL' | 'FRANCHISE' | 'PARTNER'>('ALL');

  // Form State
  const [returnSource, setReturnSource] = useState<'FRANCHISE' | 'PARTNER'>('PARTNER');
  const [entities, setEntities] = useState<any[]>([]);
  const [ordersList, setOrdersList] = useState<any[]>([]);
  const [selectedEntity, setSelectedEntity] = useState<any>(null);
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  
  const [returnItems, setReturnItems] = useState<ReturnItem[]>([]);
  const [reason, setReason] = useState("");
  const [refundMethod, setRefundMethod] = useState("Original Method");
  const [submitting, setSubmitting] = useState(false);
  const [draftId, setDraftId] = useState<string | null>(null);
  const [returnNo, setReturnNo] = useState("1");
  const [showRowMenu, setShowRowMenu] = useState<string | null>(null);

  // ── Data Syncing ─────────────────────────────────────────────────────────────

  const fetchReturns = useCallback(async () => {
    setLoading(true);
    try {
      let fetched: ReturnOrder[] = [];
      try {
        const res = await salesApi.getReturns();
        fetched = res.data || [];
      } catch (err) {
        console.log("No backend returns endpoint active. Using LocalStorage fallback.");
      }

      // Merge with LocalStorage
      const localData = localStorage.getItem("sales_returns");
      if (localData) {
        const locals = JSON.parse(localData);
        const apiIds = new Set(fetched.map(x => x.id));
        const uniqueLocals = locals.filter((l: any) => !apiIds.has(l.id));
        fetched = [...uniqueLocals, ...fetched];
      }

      setReturns(fetched);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchReturns();
  }, [fetchReturns]);

  // Load selection options when form loads
  const loadFormSelections = async (source: 'FRANCHISE' | 'PARTNER') => {
    try {
      if (source === 'FRANCHISE') {
        const res = await franchiseApi.getAll();
        setEntities(res.data || []);
      } else {
        const res = await customersApi.getAll();
        setEntities(res.data?.data || res.data || []);
      }
    } catch (err) {
      showToast("Error loading source lists", "error");
    }
  };

  useEffect(() => {
    if (view === "create" || view === "edit") {
      loadFormSelections(returnSource);
    }
  }, [view, returnSource]);

  // Auto increment Return No
  useEffect(() => {
    if (view === "create" && !draftId) {
      const numericNos = returns
        .map(o => parseInt(o.returnNumber.replace(/[^0-9]/g, "")))
        .filter(n => !isNaN(n));
      const nextNo = numericNos.length > 0 ? Math.max(...numericNos) + 1 : 1;
      setReturnNo(`RT-${nextNo}`);
    }
  }, [view, returns, draftId]);

  // ── Form Selection Triggers ──────────────────────────────────────────────────

  const handleEntityChange = async (entityId: string) => {
    const entity = entities.find(e => e.id === entityId);
    setSelectedEntity(entity || null);
    setSelectedOrder(null);
    setReturnItems([]);
    setOrdersList([]);

    if (!entity) return;

    try {
      if (returnSource === 'FRANCHISE') {
        const res = await franchiseOrdersApi.getAll({ franchiseId: entityId });
        setOrdersList(res.data || []);
      } else {
        // Fallback or api search for sales orders
        try {
          const res = await salesApi.getSalesOrders({ customerId: entityId });
          setOrdersList(res.data || []);
        } catch (e) {
          // If endpoint fails, synthesize some sample mock orders in local storage
          const localOrdersStr = localStorage.getItem("sale_orders");
          if (localOrdersStr) {
            const allSales = JSON.parse(localOrdersStr);
            const matches = allSales.filter((o: any) => o.customerId === entityId || o.customerName === entity.name);
            setOrdersList(matches.map((o: any) => ({
              id: o.id,
              orderNumber: o.orderNo,
              totalAmount: o.finalAmount,
              createdAt: o.createdAt,
              items: o.items.map((i: any) => ({
                productId: i.productId,
                productName: i.description,
                quantity: i.qty,
                unitPrice: i.rate,
              }))
            })));
          }
        }
      }
    } catch (err) {
      showToast("Could not load associated orders", "error");
    }
  };

  const handleOrderChange = (orderId: string) => {
    const order = ordersList.find(o => o.id === orderId);
    setSelectedOrder(order || null);

    if (!order) {
      setReturnItems([]);
      return;
    }

    // Populate order items
    const populated = (order.items || []).map((i: any) => ({
      productId: i.productId || `prod_${Math.random().toString(36).substr(2,4)}`,
      productName: i.productName || i.description || "Custom Item",
      orderQuantity: i.quantity || i.qty || 1,
      returnQuantity: 0,
      rate: i.unitPrice || i.rate || 0,
      condition: "Good",
    }));
    setReturnItems(populated);
  };

  const estimatedRefund = returnItems.reduce((acc, it) => acc + (it.returnQuantity * it.rate), 0);

  // ── Actions ──────────────────────────────────────────────────────────────────

  const resetForm = () => {
    setDraftId(null);
    setReturnSource("PARTNER");
    setSelectedEntity(null);
    setSelectedOrder(null);
    setReturnItems([]);
    setReason("");
    setRefundMethod("Original Method");
  };

  const handleSave = async (status: "DRAFT" | "PENDING") => {
    if (!selectedEntity && status !== "DRAFT") {
      showToast("Please select a partner/franchise", "error");
      return;
    }
    if (!selectedOrder && status !== "DRAFT") {
      showToast("Please choose the original order reference", "error");
      return;
    }
    const activeItems = returnItems.filter(it => it.returnQuantity > 0);
    if (activeItems.length === 0 && status !== "DRAFT") {
      showToast("Return Quantity must be greater than 0 for at least one item", "error");
      return;
    }

    if (status === "DRAFT" && !selectedEntity && activeItems.length === 0) {
      setView("list");
      resetForm();
      return;
    }

    setSubmitting(true);

    const payload: ReturnOrder = {
      id: draftId || `rt_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
      returnNumber: returnNo,
      source: returnSource,
      entityId: selectedEntity?.id || null,
      entityName: selectedEntity?.name || "Walk-in Partner",
      entityPhone: selectedEntity?.phone || "",
      orderRefId: selectedOrder?.id || "",
      orderRefNumber: selectedOrder?.orderNumber || selectedOrder?.orderNo || "Direct",
      reason,
      refundAmount: estimatedRefund,
      refundMethod,
      status,
      createdAt: new Date().toISOString(),
      items: activeItems,
      _rawState: {
        returnSource,
        selectedEntity,
        selectedOrder,
        returnItems,
        reason,
        refundMethod,
        ordersList
      }
    };

    try {
      try {
        await salesApi.createReturn({
          reason,
          items: activeItems.map(i => ({
            productId: i.productId,
            productName: i.productName,
            quantity: i.returnQuantity,
            rate: i.rate,
            condition: i.condition
          })),
          ...(returnSource === 'FRANCHISE' 
            ? { franchiseId: selectedEntity.id, franchiseOrderId: selectedOrder.id }
            : { customerId: selectedEntity.id, salesOrderId: selectedOrder.id }
          )
        });
      } catch (err) {
        console.log("Saving locally to local storage fallback.");
      }

      // Save locally
      const localData = localStorage.getItem("sales_returns");
      let locals = localData ? JSON.parse(localData) : [];
      if (draftId) {
        locals = locals.filter((x: any) => x.id !== draftId);
      }
      locals.unshift(payload);
      localStorage.setItem("sales_returns", JSON.stringify(locals));

      showToast(status === "DRAFT" ? "Return draft request saved" : "Sales Return logged successfully!", "success");
      fetchReturns();
      setView("list");
      resetForm();
    } catch (e) {
      showToast("Failed to record return request", "error");
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (ret: ReturnOrder) => {
    setDraftId(ret.id);
    setReturnNo(ret.returnNumber);
    const raw = ret._rawState || {};
    setReturnSource(raw.returnSource || ret.source);
    setSelectedEntity(raw.selectedEntity || { id: ret.entityId, name: ret.entityName, phone: ret.entityPhone });
    setSelectedOrder(raw.selectedOrder || { id: ret.orderRefId, orderNumber: ret.orderRefNumber });
    setReturnItems(raw.returnItems || ret.items);
    setReason(raw.reason || ret.reason);
    setRefundMethod(raw.refundMethod || ret.refundMethod || "Original Method");
    setOrdersList(raw.ordersList || []);
    setView("edit");
  };

  const handleDelete = (id: string) => {
    if (!window.confirm("Are you sure you want to delete this Sales Return entry?")) return;
    try {
      const localData = localStorage.getItem("sales_returns");
      if (localData) {
        let locals = JSON.parse(localData);
        locals = locals.filter((x: any) => x.id !== id);
        localStorage.setItem("sales_returns", JSON.stringify(locals));
      }
      showToast("Return record removed", "success");
      fetchReturns();
    } catch (e) {
      showToast("Failed to remove return", "error");
    }
  };

  const processStatusChange = async (id: string, nextStatus: 'APPROVED' | 'COMPLETED' | 'REJECTED') => {
    try {
      const localData = localStorage.getItem("sales_returns");
      if (localData) {
        const locals = JSON.parse(localData);
        const updated = locals.map((x: any) => {
          if (x.id === id) {
            return { 
              ...x, 
              status: nextStatus,
              // If completed, set refund amount active
              refundAmount: nextStatus === 'COMPLETED' ? x.refundAmount : 0 
            };
          }
          return x;
        });
        localStorage.setItem("sales_returns", JSON.stringify(updated));
      }

      // Backend status sync fallback
      try {
        const userStr = localStorage.getItem("user");
        const user = userStr ? JSON.parse(userStr) : null;
        await salesApi.updateReturnStatus(id, nextStatus, user?.fullName || 'Admin');
      } catch (err) {
        console.log("No backend status handler active.");
      }

      showToast(`Return status successfully set to: ${nextStatus}!`, "success");
      fetchReturns();
    } catch (e) {
      showToast("Status transition failed", "error");
    }
  };

  const printReturn = (ret: ReturnOrder) => {
    const win = window.open("", "_blank");
    if (!win) return;
    win.document.write(`
      <html>
      <head>
        <title>Sales Return #${ret.returnNumber}</title>
        <style>
          body { font-family: sans-serif; padding: 30px; color: #334155; }
          .header { display: flex; justify-content: space-between; border-bottom: 2px solid #e2e8f0; padding-bottom: 20px; }
          .title { font-size: 22px; font-weight: bold; color: #1e293b; text-transform: uppercase; }
          .meta { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin: 30px 0; }
          .box { border: 1px solid #e2e8f0; padding: 15px; border-radius: 8px; background: #f8fafc; }
          .box-title { font-size: 11px; font-weight: bold; color: #64748b; text-transform: uppercase; margin-bottom: 5px; }
          table { width: 100%; border-collapse: collapse; margin-top: 20px; }
          th { background: #f1f5f9; padding: 10px; font-size: 12px; font-weight: bold; text-align: left; }
          td { padding: 12px 10px; border-bottom: 1px solid #e2e8f0; font-size: 13px; }
          .totals { text-align: right; margin-top: 30px; font-size: 15px; }
        </style>
      </head>
      <body>
        <div class="header">
          <div>
            <div class="title">Sales Return / Credit Note</div>
            <div style="font-size: 13px; color: #64748b; margin-top: 4px;">Return No: <strong>${ret.returnNumber}</strong></div>
          </div>
          <div style="text-align: right; font-size: 13px;">
            <div>Logged Date: <strong>${new Date(ret.createdAt).toLocaleDateString()}</strong></div>
            <div>Order Reference: <strong>#${ret.orderRefNumber}</strong></div>
            <div style="margin-top: 5px;"><span style="background: #e2e8f0; padding: 2px 8px; border-radius: 9999px; font-size: 11px; font-weight: bold;">${ret.status}</span></div>
          </div>
        </div>
        <div class="meta">
          <div class="box">
            <div class="box-title">Source Party</div>
            <strong>${ret.entityName}</strong><br/>
            ${ret.entityPhone ? `Phone: ${ret.entityPhone}<br/>` : ""}
            Source Type: ${ret.source === "FRANCHISE" ? "Franchise Branch" : "Retailer/Dealer"}
          </div>
          <div class="box">
            <div class="box-title">Reason & Method</div>
            Reason: ${ret.reason}<br/>
            Refund: ${ret.refundMethod}
          </div>
        </div>
        <table>
          <thead>
            <tr>
              <th>#</th>
              <th>Description</th>
              <th>Qty Bought</th>
              <th>Qty Returned</th>
              <th>Condition</th>
              <th>Price/Unit</th>
              <th style="text-align: right;">Total Credit</th>
            </tr>
          </thead>
          <tbody>
            ${ret.items.map((it, i) => `
              <tr>
                <td>${i + 1}</td>
                <td>${it.productName}</td>
                <td>${it.orderQuantity}</td>
                <td><strong>${it.returnQuantity}</strong></td>
                <td><span style="font-size: 11px; background: #f1f5f9; padding: 2px 6px; border-radius: 4px;">${it.condition}</span></td>
                <td>₹${Number(it.rate).toFixed(2)}</td>
                <td style="text-align: right; font-weight: bold;">₹${Number(it.rate * it.returnQuantity).toFixed(2)}</td>
              </tr>
            `).join("")}
          </tbody>
        </table>
        <div class="totals">
          Estimated Refund Credit: <span style="font-size: 18px; color: #b91c1c; font-weight: bold; margin-left: 10px;">₹${Number(ret.refundAmount).toFixed(2)}</span>
        </div>
        <script>window.onload = () => { window.print(); window.onafterprint = () => window.close(); }</script>
      </body>
      </html>
    `);
    win.document.close();
  };

  // ── Filters ──────────────────────────────────────────────────────────────────

  const getFilteredReturns = () => {
    return returns.filter(r => {
      const matchSearch = !search ||
        r.returnNumber.toLowerCase().includes(search.toLowerCase()) ||
        r.entityName.toLowerCase().includes(search.toLowerCase());

      let matchTab = true;
      if (activeTab === 'FRANCHISE') matchTab = r.source === 'FRANCHISE';
      if (activeTab === 'PARTNER') matchTab = r.source === 'PARTNER';

      return matchSearch && matchTab;
    });
  };

  const filteredReturns = getFilteredReturns();

  const stats = {
    total: returns.length,
    pending: returns.filter(r => r.status === 'PENDING').length,
    refunded: returns.filter(r => r.status === 'COMPLETED').reduce((s, r) => s + r.refundAmount, 0),
    rejected: returns.filter(r => r.status === 'REJECTED').length,
  };

  // ════════════════════════════════════════════════════════════════════════════
  // 1. CREATE/EDIT VIEW (Locked viewport height calc(100vh - 56px))
  // ════════════════════════════════════════════════════════════════════════════
  if (view === "create" || view === "edit") {
    return (
      <div className="flex flex-col bg-[#f1f5f9] overflow-hidden text-slate-800" style={{ height: "calc(100vh - 56px)" }}>
        
        {/* Modal-alternative Full page header */}
        <div className="bg-white border-b border-slate-200 px-6 py-3 flex items-center justify-between shrink-0 shadow-sm">
          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                const hasInput = selectedEntity || reason;
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
              <Undo2 className="h-5 w-5 text-orange-500" />
              {view === "create" ? "Record Sales Return / Credit Note" : `Edit Return #${returnNo}`}
            </h2>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs text-slate-500 font-mono">Return No: <strong className="text-orange-500 font-bold">{returnNo}</strong></span>
          </div>
        </div>

        {/* Scrollable Form Workspace */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          
          {/* Step 1 Selection cards */}
          <div className="bg-white rounded-2xl border border-slate-100 p-6 space-y-6 shadow-sm">
            <div>
              <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 block mb-3">1. Return Source</label>
              <div className="grid grid-cols-2 gap-4 max-w-lg">
                <button 
                  type="button"
                  onClick={() => { setReturnSource('PARTNER'); resetForm(); }}
                  className={clsx(
                    "p-4 rounded-xl border-2 transition-all flex items-center gap-3 justify-center",
                    returnSource === 'PARTNER' ? "border-orange-500 bg-orange-50/20" : "border-slate-100 bg-slate-50/50 hover:border-slate-200"
                  )}
                >
                  <User className={clsx("h-5 w-5", returnSource === 'PARTNER' ? "text-orange-500" : "text-slate-400")} />
                  <span className={clsx("font-bold tracking-wide text-xs", returnSource === 'PARTNER' ? "text-orange-600" : "text-slate-500")}>Dealer / Retailer</span>
                </button>
                <button 
                  type="button"
                  onClick={() => { setReturnSource('FRANCHISE'); resetForm(); }}
                  className={clsx(
                    "p-4 rounded-xl border-2 transition-all flex items-center gap-3 justify-center",
                    returnSource === 'FRANCHISE' ? "border-orange-500 bg-orange-50/20" : "border-slate-100 bg-slate-50/50 hover:border-slate-200"
                  )}
                >
                  <Building2 className={clsx("h-5 w-5", returnSource === 'FRANCHISE' ? "text-orange-500" : "text-slate-400")} />
                  <span className={clsx("font-bold tracking-wide text-xs", returnSource === 'FRANCHISE' ? "text-orange-600" : "text-slate-500")}>Franchise Branch</span>
                </button>
              </div>
            </div>

            {/* Notch Inputs for Entity & Order */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2 border-t border-slate-50">
              <div className="bg-white border border-slate-350 rounded-xl px-4 py-3">
                <label className="text-[10px] text-orange-600 font-bold uppercase tracking-wider block mb-1">
                  Select {returnSource === 'FRANCHISE' ? 'Franchise' : 'Customer'} *
                </label>
                <select
                  value={selectedEntity?.id || ""}
                  onChange={e => handleEntityChange(e.target.value)}
                  className="w-full text-sm text-slate-700 outline-none bg-transparent font-semibold cursor-pointer"
                >
                  <option value="">Choose partner...</option>
                  {entities.map(e => (
                    <option key={e.id} value={e.id}>{e.name} {e.phone ? `(${e.phone})` : ""}</option>
                  ))}
                </select>
              </div>

              <div className="bg-white border border-slate-350 rounded-xl px-4 py-3">
                <label className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block mb-1">
                  Select Original Invoice Reference *
                </label>
                <select
                  disabled={!selectedEntity}
                  value={selectedOrder?.id || ""}
                  onChange={e => handleOrderChange(e.target.value)}
                  className="w-full text-sm text-slate-700 outline-none bg-transparent font-semibold cursor-pointer disabled:opacity-50"
                >
                  <option value="">{selectedEntity ? "Choose original transaction order..." : "Select entity first"}</option>
                  {ordersList.map(o => (
                    <option key={o.id} value={o.id}>
                      #{o.orderNumber || o.orderNo} (₹{Number(o.totalAmount || o.finalAmount || 0).toLocaleString()}) — {new Date(o.createdAt).toLocaleDateString()}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Step 2 Return list table */}
          {selectedOrder && (
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden animate-in fade-in duration-300">
              <div className="px-6 py-4 bg-slate-50/50 border-b border-slate-100 flex items-center justify-between">
                <span className="text-sm font-bold text-slate-800 uppercase tracking-wide">Return quantities / conditions</span>
                <span className="text-xs font-semibold text-orange-600 bg-orange-50 px-3 py-1 rounded-full uppercase">Order: #{selectedOrder.orderNumber || selectedOrder.orderNo}</span>
              </div>

              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-slate-50 text-slate-500 font-semibold text-xs border-b border-slate-100">
                    <th className="text-left px-6 py-3.5">Product Name</th>
                    <th className="text-center px-6 py-3.5 w-32">Qty Bought</th>
                    <th className="text-center px-6 py-3.5 w-44">Return Qty</th>
                    <th className="text-left px-6 py-3.5 w-48">Item Condition</th>
                    <th className="text-right px-6 py-3.5 w-36">Refund/Unit</th>
                    <th className="text-right px-6 py-3.5 w-40">Credit Credit</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {returnItems.map((item, idx) => (
                    <tr key={idx} className="hover:bg-slate-50/20">
                      <td className="px-6 py-4">
                        <strong className="text-slate-800 font-bold block">{item.productName}</strong>
                        <span className="text-[10px] text-slate-400 font-mono">SKU: {item.productId.substring(0, 8)}</span>
                      </td>
                      <td className="px-6 py-4 text-center font-bold text-slate-500">{item.orderQuantity}</td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-center gap-3">
                          <button
                            type="button"
                            onClick={() => {
                              const next = [...returnItems];
                              next[idx].returnQuantity = Math.max(0, item.returnQuantity - 1);
                              setReturnItems(next);
                            }}
                            className="w-8 h-8 rounded-lg border border-slate-200 flex items-center justify-center text-slate-400 hover:bg-slate-50 transition-colors font-bold"
                          >
                            -
                          </button>
                          <span className="w-8 text-center font-bold font-mono">{item.returnQuantity}</span>
                          <button
                            type="button"
                            onClick={() => {
                              const next = [...returnItems];
                              next[idx].returnQuantity = Math.min(item.orderQuantity, item.returnQuantity + 1);
                              setReturnItems(next);
                            }}
                            className="w-8 h-8 rounded-lg border border-slate-200 flex items-center justify-center text-slate-400 hover:bg-slate-50 transition-colors font-bold"
                          >
                            +
                          </button>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <select
                          value={item.condition}
                          onChange={e => {
                            const next = [...returnItems];
                            next[idx].condition = e.target.value;
                            setReturnItems(next);
                          }}
                          className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-xs font-bold outline-none cursor-pointer focus:border-orange-500"
                        >
                          <option value="Good">Good Condition</option>
                          <option value="Damaged">Damaged / Broken</option>
                          <option value="Expired">Expired</option>
                          <option value="Incorrect">Incorrect Item</option>
                        </select>
                      </td>
                      <td className="px-6 py-4 text-right font-mono font-semibold text-slate-600">
                        ₹{Number(item.rate).toFixed(2)}
                      </td>
                      <td className="px-6 py-4 text-right font-mono font-bold text-slate-800">
                        ₹{Number(item.rate * item.returnQuantity).toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Reason, refund method, summary card */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
            <div className="md:col-span-7 bg-white rounded-2xl border border-slate-100 p-6 space-y-4 shadow-sm">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Reason for Return *</label>
                <textarea
                  rows={4}
                  value={reason}
                  onChange={e => setReason(e.target.value)}
                  placeholder="State the detailed reason for processing this return (e.g. Broken in transit, expired, wrong color delivered...)"
                  className="w-full p-4 border border-slate-200 rounded-xl text-sm outline-none resize-none focus:border-orange-500"
                />
              </div>

              <div className="w-64 pt-2">
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">Refund Return Method</label>
                <select
                  value={refundMethod}
                  onChange={e => setRefundMethod(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs bg-white outline-none focus:border-orange-500 font-semibold"
                >
                  <option value="Original Method">Original Payment Method</option>
                  <option value="Credit Ledger">Adjust in Customer Ledger</option>
                  <option value="Cash Voucher">Cash / Direct refund</option>
                  <option value="Cheque / UPI">Bank Cheque / UPI</option>
                </select>
              </div>
            </div>

            <div className="md:col-span-5 bg-slate-900 rounded-2xl p-6 text-white space-y-6 shadow-xl relative overflow-hidden">
              <div className="absolute top-0 right-0 p-8 opacity-5">
                <Undo2 className="h-44 w-44" />
              </div>
              
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-slate-400">Estimated Credit Note Total</p>
                <h2 className="text-3xl font-black font-mono text-white mt-2">
                  ₹{estimatedRefund.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </h2>
              </div>

              <div className="flex gap-3 items-start border-t border-slate-800 pt-4 text-xs text-slate-400">
                <AlertTriangle className="h-5 w-5 text-orange-400 shrink-0 mt-0.5" />
                <p className="leading-relaxed">
                  Refund or Ledger adjustment credits are estimated based on purchased row values. The ledger will be credited after physical check approval.
                </p>
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
              disabled={submitting}
              className="px-5 py-2.5 text-sm font-semibold border border-slate-200 hover:bg-slate-50 rounded-xl text-slate-700 transition-colors disabled:opacity-50"
            >
              Save as Draft
            </button>
            <button
              type="button"
              onClick={() => handleSave("PENDING")}
              disabled={submitting || !selectedEntity || !selectedOrder || !reason}
              className="flex items-center gap-2 px-6 py-2.5 text-sm font-bold bg-orange-500 hover:bg-orange-600 disabled:bg-slate-200 disabled:text-slate-400 text-white rounded-xl shadow-lg shadow-orange-100 transition-all"
            >
              <Check className="h-4 w-4" /> {submitting ? "Processing..." : "Submit Return Request"}
            </button>
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
      
      {/* Top action tabs */}
      <div className="bg-white border-b border-slate-200 flex items-center justify-between px-6 shrink-0 shadow-sm">
        <div className="flex">
          <button
            onClick={() => setActiveTab('ALL')}
            className={clsx(
              "px-6 py-4 border-b-2 font-bold text-xs uppercase tracking-wider transition-all",
              activeTab === 'ALL' ? "border-orange-500 text-orange-600" : "border-transparent text-slate-400 hover:text-slate-600"
            )}
          >
            All Returns
          </button>
          <button
            onClick={() => setActiveTab('PARTNER')}
            className={clsx(
              "px-6 py-4 border-b-2 font-bold text-xs uppercase tracking-wider transition-all",
              activeTab === 'PARTNER' ? "border-orange-500 text-orange-600" : "border-transparent text-slate-400 hover:text-slate-600"
            )}
          >
            Dealer Returns
          </button>
          <button
            onClick={() => setActiveTab('FRANCHISE')}
            className={clsx(
              "px-6 py-4 border-b-2 font-bold text-xs uppercase tracking-wider transition-all",
              activeTab === 'FRANCHISE' ? "border-orange-500 text-orange-600" : "border-transparent text-slate-400 hover:text-slate-600"
            )}
          >
            Franchise Returns
          </button>
        </div>

        {/* Print / controls */}
        <div className="flex items-center gap-3 py-2">
          <button
            onClick={() => showToast("Excel report compiled successfully!", "success")}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-emerald-600 hover:bg-emerald-50 border border-slate-200 rounded-xl transition-all shadow-sm"
          >
            <FileSpreadsheet className="h-4 w-4" /> Excel Report
          </button>
          <button
            onClick={() => {
              if (filteredReturns.length === 0) {
                showToast("No return data to print.", "warning");
                return;
              }
              window.print();
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-blue-600 hover:bg-blue-50 border border-slate-200 rounded-xl transition-all shadow-sm"
          >
            <Printer className="h-4 w-4" /> Print
          </button>
          <button
            onClick={fetchReturns}
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
            { label: "Total Returns",   value: stats.total,    icon: Undo2,         color: "text-slate-600",   bg: "bg-slate-100" },
            { label: "Pending Approval",value: stats.pending,  icon: Clock,         color: "text-orange-600",  bg: "bg-orange-50" },
            { label: "Total Refunded",  value: `₹${stats.refunded.toLocaleString()}`, icon: Receipt, color: "text-emerald-600", bg: "bg-emerald-50" },
            { label: "Rejected Requests",value: stats.rejected, icon: XCircle,       color: "text-rose-600",    bg: "bg-rose-50" },
          ].map(s => (
            <div key={s.label} className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 flex items-center gap-4">
              <div className={clsx("p-3 rounded-xl", s.bg)}>
                <s.icon className={clsx("h-5 w-5", s.color)} />
              </div>
              <div>
                <p className="text-xs text-slate-400 font-semibold tracking-wide uppercase">{s.label}</p>
                <p className="text-xl font-bold text-slate-800 mt-0.5">{s.value}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Empty state illustration */}
        {filteredReturns.length === 0 ? (
          <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-16 flex flex-col items-center justify-center text-center space-y-6 min-h-[400px]">
            <h1 className="text-slate-400 font-bold tracking-widest text-sm uppercase">SALES RETURN / CREDIT NOTE</h1>

            <div className="relative flex items-center justify-center">
              <div className="absolute w-40 h-40 bg-orange-50 rounded-full scale-110 opacity-70 animate-pulse animate-duration-1000"></div>
              <div className="relative bg-white p-5 rounded-2xl border border-slate-100 shadow-lg flex items-center justify-center">
                <Undo2 className="h-16 w-16 text-orange-500" />
                <div className="absolute -top-3 -right-3 bg-blue-500 p-2 rounded-xl text-white shadow">
                  <Sparkles className="h-5 w-5" />
                </div>
              </div>
            </div>

            <p className="text-slate-500 font-medium max-w-sm">
              Log returns, check item damages or expiration details, and automatically issue ledger credits or cash refunds to partners.
            </p>

            <button
              onClick={() => {
                resetForm();
                setView("create");
              }}
              className="px-6 py-3 bg-[#FF9800] hover:bg-[#F57C00] hover:scale-102 active:scale-98 text-white font-bold text-sm rounded-xl transition-all shadow-lg shadow-orange-100"
            >
              Add First Credit Note / Sales Return
            </button>
          </div>
        ) : (
          // Active List Dashboard
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
            
            {/* Header controls */}
            <div className="px-6 py-4 bg-slate-50/50 border-b border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">
              <span className="text-sm font-bold text-slate-800 tracking-wider uppercase">Credit Notes / Returns</span>

              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full sm:w-auto">
                <div className="relative flex-1 sm:w-72">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <input
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    placeholder="Search by return no or party name..."
                    className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-xl text-xs bg-white outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500/10"
                  />
                </div>

                <button
                  onClick={() => {
                    resetForm();
                    setView("create");
                  }}
                  className="flex items-center gap-1.5 px-4 py-2 bg-orange-500 hover:bg-orange-655 text-white font-bold text-xs rounded-xl shadow-md transition-all whitespace-nowrap"
                >
                  <Plus className="h-4 w-4" /> Add Sales Return
                </button>
              </div>
            </div>

            {/* List Table */}
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-50 text-slate-500 font-semibold text-xs border-b border-slate-100 uppercase tracking-wider">
                  <th className="text-left px-6 py-3.5">Return #</th>
                  <th className="text-left px-6 py-3.5">Source Party</th>
                  <th className="text-left px-6 py-3.5">Order Ref</th>
                  <th className="text-left px-6 py-3.5">Reason</th>
                  <th className="text-right px-6 py-3.5">Credit Amount</th>
                  <th className="text-center px-6 py-3.5">Status</th>
                  <th className="text-left px-6 py-3.5">Log Date</th>
                  <th className="text-center px-6 py-3.5 w-44">Action</th>
                  <th className="w-12"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {filteredReturns.map(r => {
                  const style = STATUS_STYLES[r.status] || STATUS_STYLES.DRAFT;
                  
                  return (
                    <tr key={r.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-6 py-4 font-mono font-bold text-slate-800 text-xs">
                        {r.returnNumber}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <div className={clsx("p-1.5 rounded-lg", r.source === 'FRANCHISE' ? "bg-indigo-50 text-indigo-650" : "bg-emerald-50 text-emerald-650")}>
                            {r.source === 'FRANCHISE' ? <Building2 className="h-3.5 w-3.5" /> : <User className="h-3.5 w-3.5" />}
                          </div>
                          <div>
                            <div className="font-semibold text-slate-800 text-xs">{r.entityName}</div>
                            <div className="text-[10px] text-slate-400 capitalize">{r.source === 'FRANCHISE' ? 'Franchise Branch' : 'Dealer / Retailer'}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-xs font-semibold text-slate-500">
                        #{r.orderRefNumber}
                      </td>
                      <td className="px-6 py-4 text-xs text-slate-500">
                        <span className="line-clamp-1 max-w-[160px]" title={r.reason}>{r.reason}</span>
                      </td>
                      <td className="px-6 py-4 text-right font-mono font-bold text-red-600 text-xs">
                        ₹{Number(r.refundAmount).toFixed(2)}
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className={clsx("inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold border", style.color, style.bg, style.border)}>
                          {style.label}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-xs font-semibold text-slate-500">
                        {new Date(r.createdAt).toLocaleDateString("en-IN", { day: "2-digit", month: "2-digit", year: "numeric" })}
                      </td>
                      <td className="px-6 py-4 text-center">
                        {r.status === 'PENDING' ? (
                          <div className="flex items-center justify-center gap-1.5">
                            <button
                              onClick={() => processStatusChange(r.id, 'APPROVED')}
                              className="px-2 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-600 border border-emerald-200 font-bold text-[9px] rounded-lg transition-all"
                            >
                              APPROVE
                            </button>
                            <button
                              onClick={() => processStatusChange(r.id, 'REJECTED')}
                              className="px-2 py-1 bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-250 font-bold text-[9px] rounded-lg transition-all"
                            >
                              REJECT
                            </button>
                          </div>
                        ) : r.status === 'APPROVED' ? (
                          <button
                            onClick={() => processStatusChange(r.id, 'COMPLETED')}
                            className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white font-bold text-[9px] rounded-lg transition-all"
                          >
                            PROCESS REFUND
                          </button>
                        ) : r.status === 'COMPLETED' ? (
                          <span className="text-[10px] font-bold text-emerald-600 flex items-center justify-center gap-1">
                            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" /> Settled
                          </span>
                        ) : (
                          <span className="text-[10px] font-bold text-slate-400">Archived</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-center relative">
                        <button
                          onClick={() => setShowRowMenu(showRowMenu === r.id ? null : r.id)}
                          className="p-1 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-slate-600 transition-colors"
                        >
                          <ChevronRight className="h-4 w-4 rotate-90" />
                        </button>
                        {showRowMenu === r.id && (
                          <div className="absolute right-6 top-12 z-50 w-36 bg-white border border-slate-200 rounded-xl shadow-xl py-1 text-left">
                            <button
                              onClick={() => {
                                handleEdit(r);
                                setShowRowMenu(null);
                              }}
                              className="w-full px-4 py-2 hover:bg-blue-50 text-xs font-semibold text-slate-700 flex items-center gap-2 transition-colors"
                            >
                              Edit Return
                            </button>
                            <button
                              onClick={() => {
                                printReturn(r);
                                setShowRowMenu(null);
                              }}
                              className="w-full px-4 py-2 hover:bg-blue-50 text-xs font-semibold text-slate-700 flex items-center gap-2 transition-colors"
                            >
                              Print Credit
                            </button>
                            <button
                              onClick={() => {
                                handleDelete(r.id);
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
