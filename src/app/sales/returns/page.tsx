"use client";

import { useState, useEffect } from "react";
import { 
  Plus, Search, Filter, ArrowRightLeft, CheckCircle2, XCircle, 
  Clock, ArrowLeft, MoreVertical, Package, User, Building2, 
  AlertTriangle, Receipt, Undo2, ChevronRight, Download
} from "lucide-react";
import { salesApi, franchiseApi, customersApi, franchiseOrdersApi } from "@/lib/api";
import { toast } from "react-hot-toast";
import { clsx } from "clsx";

interface ReturnOrder {
  id: string;
  returnNumber: string;
  reason: string;
  status: 'PENDING' | 'APPROVED' | 'COMPLETED' | 'REJECTED';
  refundAmount: number;
  refundMethod: string;
  createdAt: string;
  customer?: { name: string };
  franchise?: { name: string };
  salesOrder?: { orderNumber: string };
  franchiseOrder?: { orderNumber: string };
  items: any[];
}

export default function SalesReturnsPage() {
  const [returns, setReturns] = useState<ReturnOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [showNewModal, setShowNewModal] = useState(false);
  const [activeTab, setActiveTab] = useState<'ALL' | 'FRANCHISE' | 'BUSINESS'>('ALL');
  
  // Modal State
  const [returnSource, setReturnSource] = useState<'FRANCHISE' | 'BUSINESS'>('BUSINESS');
  const [selectedEntity, setSelectedEntity] = useState<any>(null); // Franchise or Customer
  const [selectedOrder, setSelectedOrder] = useState<any>(null); // FranchiseOrder or SalesOrder
  const [entities, setEntities] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [returnItems, setReturnItems] = useState<any[]>([]);
  const [reason, setReason] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchReturns();
  }, [activeTab]);

  const fetchReturns = async () => {
    setLoading(true);
    try {
      const params: any = {};
      if (activeTab === 'FRANCHISE') params.source = 'FRANCHISE';
      if (activeTab === 'BUSINESS') params.source = 'BUSINESS';
      
      const res = await salesApi.getReturns(params);
      setReturns(res.data);
    } catch (err) {
      toast.error("Failed to fetch returns");
    } finally {
      setLoading(false);
    }
  };

  const fetchEntities = async () => {
    try {
      if (returnSource === 'FRANCHISE') {
        const res = await franchiseApi.getAll();
        setEntities(res.data);
      } else {
        const res = await customersApi.getAll();
        setEntities(res.data?.data || res.data || []);
      }
    } catch (err) {
      toast.error("Failed to fetch entities");
    }
  };

  const fetchOrders = async (entityId: string) => {
    try {
      if (returnSource === 'FRANCHISE') {
        const res = await franchiseOrdersApi.getAll({ franchiseId: entityId });
        setOrders(res.data);
      } else {
        const res = await salesApi.getSalesOrders({ customerId: entityId });
        setOrders(res.data);
      }
    } catch (err) {
      toast.error("Failed to fetch orders");
    }
  };

  const handleEntityChange = (entityId: string) => {
    const entity = entities.find(e => e.id === entityId);
    setSelectedEntity(entity);
    setSelectedOrder(null);
    setReturnItems([]);
    fetchOrders(entityId);
  };

  const handleOrderChange = (orderId: string) => {
    const order = orders.find(o => o.id === orderId);
    setSelectedOrder(order);
    // Initialize return items from order items
    setReturnItems(order.items.map((i: any) => ({
      productId: i.productId,
      productName: i.productName || i.product?.name,
      orderQuantity: i.quantity,
      returnQuantity: 0,
      rate: i.unitPrice || i.rate,
      condition: 'Good'
    })));
  };

  const handleSubmitReturn = async () => {
    if (!reason) return toast.error("Please provide a reason");
    const activeItems = returnItems.filter(i => i.returnQuantity > 0);
    if (activeItems.length === 0) return toast.error("Please add at least one item to return");

    setSubmitting(true);
    try {
      const payload = {
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
      };
      await salesApi.createReturn(payload);
      toast.success("Return request created successfully");
      setShowNewModal(false);
      fetchReturns();
      resetModal();
    } catch (err) {
      toast.error("Failed to create return");
    } finally {
      setSubmitting(false);
    }
  };

  const resetModal = () => {
    setSelectedEntity(null);
    setSelectedOrder(null);
    setReturnItems([]);
    setReason("");
  };

  const updateStatus = async (id: string, status: string) => {
    try {
      const userStr = localStorage.getItem("user");
      const user = userStr ? JSON.parse(userStr) : null;
      await salesApi.updateReturnStatus(id, status, user?.fullName || 'Admin');
      toast.success(`Return ${status.toLowerCase()} successfully`);
      fetchReturns();
    } catch (err) {
      toast.error("Status update failed");
    }
  };

  const stats = [
    { label: "Total Returns", value: returns.length, icon: ArrowRightLeft, color: "text-blue-600", bg: "bg-blue-50" },
    { label: "Pending Approval", value: returns.filter(r => r.status === 'PENDING').length, icon: Clock, color: "text-orange-600", bg: "bg-orange-50" },
    { label: "Total Refunded", value: `₹${returns.filter(r => r.status === 'COMPLETED').reduce((s, r) => s + r.refundAmount, 0).toLocaleString()}`, icon: Receipt, color: "text-emerald-600", bg: "bg-emerald-50" },
    { label: "Rejected", value: returns.filter(r => r.status === 'REJECTED').length, icon: XCircle, color: "text-rose-600", bg: "bg-rose-50" },
  ];

  return (
    <div className="p-6 space-y-6 bg-slate-50/50 min-h-screen">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-3">
            <div className="p-2 bg-orange-500 rounded-xl text-white">
              <Undo2 size={24} />
            </div>
            Sales Return Management
          </h1>
          <p className="text-slate-500 font-medium mt-1">Manage product returns from Franchisees and Business Owners</p>
        </div>
        <button 
          onClick={() => { setShowNewModal(true); fetchEntities(); }}
          className="bg-slate-900 hover:bg-slate-800 text-white px-6 py-3 rounded-2xl font-bold flex items-center justify-center gap-2 transition-all shadow-lg shadow-slate-900/10 active:scale-95"
        >
          <Plus size={20} strokeWidth={3} /> New Return Request
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s, i) => (
          <div key={i} className="bg-white p-5 rounded-[2rem] border border-slate-200/60 shadow-sm flex items-center gap-4">
            <div className={clsx("p-4 rounded-2xl", s.bg, s.color)}>
              <s.icon size={24} />
            </div>
            <div>
              <p className="text-xs font-black text-slate-400 uppercase tracking-widest">{s.label}</p>
              <h3 className="text-xl font-black text-slate-900 mt-1">{s.value}</h3>
            </div>
          </div>
        ))}
      </div>

      {/* Main Content */}
      <div className="bg-white rounded-[2.5rem] border border-slate-200/60 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex bg-slate-100 p-1.5 rounded-2xl gap-1">
            {(['ALL', 'FRANCHISE', 'BUSINESS'] as const).map((t) => (
              <button
                key={t}
                onClick={() => setActiveTab(t)}
                className={clsx(
                  "px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all",
                  activeTab === t ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700"
                )}
              >
                {t} Returns
              </button>
            ))}
          </div>
          <div className="relative group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-orange-500 transition-colors" size={18} />
            <input 
              type="text" 
              placeholder="Search returns..." 
              className="pl-12 pr-6 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-medium outline-none focus:ring-4 focus:ring-orange-500/10 focus:border-orange-500 transition-all w-full md:w-80"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50 border-b border-slate-100">
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Return #</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Source</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Order Ref</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Reason</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Refund</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Date</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 text-sm">
              {loading ? (
                <tr>
                  <td colSpan={8} className="px-6 py-20 text-center">
                    <div className="flex flex-col items-center gap-3">
                      <div className="w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full animate-spin" />
                      <p className="text-xs font-black text-slate-400 uppercase tracking-[0.2em]">Loading returns...</p>
                    </div>
                  </td>
                </tr>
              ) : returns.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-6 py-20 text-center">
                    <div className="flex flex-col items-center gap-4 text-slate-300">
                      <Undo2 size={48} className="opacity-20" />
                      <p className="text-sm font-black uppercase tracking-widest">No returns found</p>
                    </div>
                  </td>
                </tr>
              ) : (
                returns.map((ret) => (
                  <tr key={ret.id} className="hover:bg-slate-50/50 transition-colors group">
                    <td className="px-6 py-4">
                      <span className="font-black text-slate-900">{ret.returnNumber}</span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className={clsx("p-2 rounded-lg", ret.franchise ? "bg-indigo-50 text-indigo-600" : "bg-emerald-50 text-emerald-600")}>
                          {ret.franchise ? <Building2 size={16} /> : <User size={16} />}
                        </div>
                        <div>
                          <p className="font-bold text-slate-900 leading-none">{ret.franchise?.name || ret.customer?.name || "N/A"}</p>
                          <p className="text-[10px] font-black text-slate-400 uppercase mt-1">{ret.franchise ? "Franchise" : "Business Owner"}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-xs font-bold text-slate-500">{ret.franchiseOrder?.orderNumber || ret.salesOrder?.orderNumber || "Direct Return"}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-slate-600 line-clamp-1 max-w-[150px]">{ret.reason}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="font-black text-slate-900">₹{ret.refundAmount.toLocaleString()}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={clsx(
                        "px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest",
                        ret.status === 'COMPLETED' ? "bg-emerald-100 text-emerald-700" :
                        ret.status === 'PENDING' ? "bg-orange-100 text-orange-700" :
                        ret.status === 'REJECTED' ? "bg-rose-100 text-rose-700" :
                        "bg-blue-100 text-blue-700"
                      )}>
                        {ret.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-slate-500 font-medium">
                      {new Date(ret.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        {ret.status === 'PENDING' && (
                          <>
                            <button onClick={() => updateStatus(ret.id, 'APPROVED')} className="p-2 bg-emerald-50 text-emerald-600 hover:bg-emerald-600 hover:text-white rounded-lg transition-all" title="Approve">
                              <CheckCircle2 size={16} />
                            </button>
                            <button onClick={() => updateStatus(ret.id, 'REJECTED')} className="p-2 bg-rose-50 text-rose-600 hover:bg-rose-600 hover:text-white rounded-lg transition-all" title="Reject">
                              <XCircle size={16} />
                            </button>
                          </>
                        )}
                        {ret.status === 'APPROVED' && (
                          <button onClick={() => updateStatus(ret.id, 'COMPLETED')} className="px-3 py-1.5 bg-blue-600 text-white text-[10px] font-black rounded-lg hover:bg-blue-700 transition-all uppercase tracking-widest">
                            Process Refund
                          </button>
                        )}
                        <button className="p-2 bg-slate-50 text-slate-400 hover:text-slate-900 rounded-lg">
                          <MoreVertical size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* New Return Modal */}
      {showNewModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4 animate-in fade-in duration-300">
          <div className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col animate-in zoom-in-95 duration-300">
            {/* Modal Header */}
            <div className="p-8 border-b border-slate-100 shrink-0 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-black text-slate-900 uppercase tracking-tight">Create New Return Request</h2>
                <p className="text-slate-500 font-medium text-sm mt-1">Initiate a return from a specific order</p>
              </div>
              <button onClick={() => { setShowNewModal(false); resetModal(); }} className="p-2 hover:bg-slate-50 rounded-xl transition-all">
                <ArrowLeft size={20} className="text-slate-400" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="flex-1 overflow-y-auto p-8 space-y-8">
              {/* Step 1: Source Selection */}
              <div className="space-y-4">
                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Return Source</label>
                <div className="grid grid-cols-2 gap-4">
                  <button 
                    onClick={() => { setReturnSource('BUSINESS'); resetModal(); fetchEntities(); }}
                    className={clsx(
                      "p-6 rounded-[2rem] border-2 transition-all flex flex-col items-center gap-3",
                      returnSource === 'BUSINESS' ? "border-orange-500 bg-orange-50/50" : "border-slate-100 bg-slate-50/50 hover:border-slate-200"
                    )}
                  >
                    <User className={clsx(returnSource === 'BUSINESS' ? "text-orange-500" : "text-slate-400")} size={32} />
                    <span className={clsx("font-black uppercase tracking-widest text-xs", returnSource === 'BUSINESS' ? "text-orange-600" : "text-slate-500")}>Business Owner</span>
                  </button>
                  <button 
                    onClick={() => { setReturnSource('FRANCHISE'); resetModal(); fetchEntities(); }}
                    className={clsx(
                      "p-6 rounded-[2rem] border-2 transition-all flex flex-col items-center gap-3",
                      returnSource === 'FRANCHISE' ? "border-orange-500 bg-orange-50/50" : "border-slate-100 bg-slate-50/50 hover:border-slate-200"
                    )}
                  >
                    <Building2 className={clsx(returnSource === 'FRANCHISE' ? "text-orange-500" : "text-slate-400")} size={32} />
                    <span className={clsx("font-black uppercase tracking-widest text-xs", returnSource === 'FRANCHISE' ? "text-orange-600" : "text-slate-500")}>Franchise</span>
                  </button>
                </div>
              </div>

              {/* Step 2: Entity & Order Selection */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Select {returnSource === 'FRANCHISE' ? 'Franchise' : 'Customer'}</label>
                  <select 
                    onChange={(e) => handleEntityChange(e.target.value)}
                    className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold outline-none focus:border-orange-500 appearance-none"
                    value={selectedEntity?.id || ""}
                  >
                    <option value="">Choose {returnSource === 'FRANCHISE' ? 'Franchise' : 'Customer'}...</option>
                    {entities.map(e => (
                      <option key={e.id} value={e.id}>{e.name} {e.phone ? `(${e.phone})` : ""}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Select Original Order</label>
                  <select 
                    disabled={!selectedEntity}
                    onChange={(e) => handleOrderChange(e.target.value)}
                    className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold outline-none focus:border-orange-500 appearance-none disabled:opacity-50"
                    value={selectedOrder?.id || ""}
                  >
                    <option value="">{selectedEntity ? "Choose Order..." : "Select entity first"}</option>
                    {orders.map(o => (
                      <option key={o.id} value={o.id}>{o.orderNumber} (₹{o.totalAmount?.toLocaleString()}) - {new Date(o.createdAt).toLocaleDateString()}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Step 3: Items to Return */}
              {selectedOrder && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Items from Order</label>
                    <span className="text-[10px] font-black text-orange-600 bg-orange-50 px-3 py-1 rounded-full uppercase">Order: {selectedOrder.orderNumber}</span>
                  </div>
                  <div className="border border-slate-100 rounded-3xl overflow-hidden shadow-sm">
                    <table className="w-full text-left">
                      <thead className="bg-slate-50 border-b border-slate-100">
                        <tr>
                          <th className="px-6 py-3 text-[10px] font-black text-slate-400 uppercase tracking-widest">Product</th>
                          <th className="px-6 py-3 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Qty Bought</th>
                          <th className="px-6 py-3 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Return Qty</th>
                          <th className="px-6 py-3 text-[10px] font-black text-slate-400 uppercase tracking-widest">Condition</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-50">
                        {returnItems.map((item, idx) => (
                          <tr key={idx} className="hover:bg-slate-50/50 transition-colors">
                            <td className="px-6 py-4">
                              <p className="font-bold text-slate-900">{item.productName}</p>
                              <p className="text-[10px] font-black text-slate-400 uppercase mt-0.5">₹{item.rate} / unit</p>
                            </td>
                            <td className="px-6 py-4 text-center font-black text-slate-500">{item.orderQuantity}</td>
                            <td className="px-6 py-4">
                              <div className="flex items-center justify-center gap-3">
                                <button 
                                  onClick={() => {
                                    const next = [...returnItems];
                                    next[idx].returnQuantity = Math.max(0, item.returnQuantity - 1);
                                    setReturnItems(next);
                                  }}
                                  className="w-8 h-8 rounded-lg border border-slate-200 flex items-center justify-center text-slate-400 hover:bg-slate-50"
                                >-</button>
                                <span className="w-8 text-center font-black">{item.returnQuantity}</span>
                                <button 
                                  onClick={() => {
                                    const next = [...returnItems];
                                    next[idx].returnQuantity = Math.min(item.orderQuantity, item.returnQuantity + 1);
                                    setReturnItems(next);
                                  }}
                                  className="w-8 h-8 rounded-lg border border-slate-200 flex items-center justify-center text-slate-400 hover:bg-slate-50"
                                >+</button>
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <select 
                                onChange={(e) => {
                                  const next = [...returnItems];
                                  next[idx].condition = e.target.value;
                                  setReturnItems(next);
                                }}
                                className="bg-slate-50 border border-slate-100 rounded-lg px-3 py-1.5 text-xs font-bold outline-none"
                              >
                                <option value="Good">Good Condition</option>
                                <option value="Damaged">Damaged / Broken</option>
                                <option value="Expired">Expired</option>
                                <option value="Incorrect">Incorrect Item</option>
                              </select>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Step 4: Reason & Finalization */}
              <div className="space-y-4">
                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Reason for Return</label>
                <textarea 
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="Explain why this return is being processed (e.g., Transit damage, wrong delivery, quality issue...)"
                  className="w-full p-5 bg-slate-50 border border-slate-200 rounded-[1.5rem] text-sm font-medium outline-none focus:border-orange-500 h-32 resize-none"
                />
              </div>

              {/* Refund Summary */}
              <div className="bg-slate-900 rounded-[2rem] p-8 text-white flex items-center justify-between">
                <div>
                  <p className="text-[10px] font-black uppercase tracking-[0.3em] opacity-60">Estimated Refund Amount</p>
                  <h2 className="text-3xl font-black mt-2">₹{returnItems.reduce((s, i) => s + (i.returnQuantity * i.rate), 0).toLocaleString()}</h2>
                </div>
                <div className="flex items-center gap-3 text-slate-400">
                  <AlertTriangle size={24} className="text-orange-400" />
                  <p className="text-xs font-bold leading-relaxed max-w-[200px]">Final refund will be credited to the original payment source after inspection.</p>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-8 border-t border-slate-100 bg-slate-50/50 flex gap-4 shrink-0">
              <button 
                onClick={() => { setShowNewModal(false); resetModal(); }}
                className="flex-1 py-4 px-6 border-2 border-slate-200 rounded-2xl font-black text-xs uppercase tracking-widest text-slate-500 hover:bg-white transition-all"
              >
                Cancel
              </button>
              <button 
                disabled={submitting || !selectedOrder || !reason}
                onClick={handleSubmitReturn}
                className="flex-[2] py-4 px-6 bg-orange-500 hover:bg-orange-600 disabled:bg-slate-300 text-white rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-lg shadow-orange-500/20 transition-all flex items-center justify-center gap-2"
              >
                {submitting ? "Processing..." : "Submit Return Request"}
                {!submitting && <ChevronRight size={16} strokeWidth={3} />}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
