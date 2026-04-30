"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/context/ToastContext";
import {
  Package, ChevronDown, CheckCircle2, XCircle, AlertTriangle,
  Truck, ClipboardCheck, ArrowLeft, Loader2, Search, Calendar,
  ExternalLink, ArrowRight, History, Plus
} from "lucide-react";
import { purchaseOrdersApi, grnApi } from "@/lib/api";
import { clsx } from "clsx";

interface POItem {
  id: string;
  inventoryItem: { id: string; name: string; unit: string };
  quantity: number;
  price: number;
}

interface PO {
  id: string;
  poNumber?: string;
  vendor: { name: string };
  status: string;
  totalAmount: number;
  createdAt: string;
  poItems: POItem[];
}

interface GRNItem {
  materialId: string;
  quantity: number;       // ordered
  receivedQty: number;
  acceptedQty: number;
  rejectedQty: number;
  price: number;
  inventoryItem?: { name: string; unit: string };
}

export default function GRNPage() {
  const router = useRouter();
  const { showToast } = useToast();
  const [view, setView] = useState<"NEW" | "HISTORY">("NEW");
  const [step, setStep] = useState<1 | 2>(1);
  const [pos, setPOs] = useState<PO[]>([]);
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPO, setSelectedPO] = useState<PO | null>(null);
  const [grnItems, setGrnItems] = useState<GRNItem[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [approvedId, setApprovedId] = useState<string | null>(null);
  const [poSearch, setPoSearch] = useState("");

  // Fetch Pending POs or History based on view
  useEffect(() => {
    setLoading(true);
    if (view === "NEW") {
      purchaseOrdersApi.getAll().then(r => {
        const pending = (r.data.orders || r.data || []).filter(
          (p: PO) => p.status === "PENDING" || p.status === "APPROVED"
        );
        setPOs(pending);
      }).finally(() => setLoading(false));
    } else {
      grnApi.getAll().then(r => {
        setHistory(r.data || []);
      }).finally(() => setLoading(false));
    }
  }, [view]);

  const selectPO = (po: PO) => {
    setSelectedPO(po);
    setGrnItems(
      (po.poItems || []).map(item => ({
        materialId: item.inventoryItem.id,
        quantity: item.quantity,
        receivedQty: item.quantity,
        acceptedQty: item.quantity,
        rejectedQty: 0,
        price: item.price,
      }))
    );
    setStep(2);
  };

  const updateItem = (idx: number, field: keyof GRNItem, val: number) => {
    setGrnItems(prev => {
      const next = [...prev];
      next[idx] = { ...next[idx], [field]: val };
      if (field === "acceptedQty" || field === "rejectedQty") {
        const accepted = field === "acceptedQty" ? val : next[idx].acceptedQty;
        const rejected = field === "rejectedQty" ? val : next[idx].rejectedQty;
        next[idx].receivedQty = accepted + rejected;
      }
      if (field === "receivedQty") {
        next[idx].acceptedQty = val - next[idx].rejectedQty;
      }
      return next;
    });
  };

  const handleCreateAndApprove = async () => {
    if (!selectedPO) return;
    setSubmitting(true);
    try {
      const res = await grnApi.createFromPO(selectedPO.id, { items: grnItems });
      const grnId = res.data.id;
      await grnApi.approve(grnId);
      setApprovedId(grnId);
      showToast("GRN Approved successfully! Stock levels updated.", "success");
      
      // Wait a bit and go to history
      setTimeout(() => {
        setView("HISTORY");
        setStep(1);
        setSelectedPO(null);
        setApprovedId(null);
      }, 2000);
    } catch (e: any) {
      console.error(e);
      showToast(e.response?.data?.error || "Failed to create or approve GRN. Please verify quantities.", "error");
    } finally {
      setSubmitting(false);
    }
  };

  const filteredPOs = pos.filter(p => 
    p.vendor.name.toLowerCase().includes(poSearch.toLowerCase()) ||
    p.poNumber?.toLowerCase().includes(poSearch.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[#FDFCFD] dark:bg-slate-950 p-4 md:p-10 animate-in fade-in duration-700">
      <div className="max-w-7xl mx-auto space-y-10">
        
        <header className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 py-4 border-b border-slate-200 dark:border-slate-800">
          <div className="space-y-1">
            <div className="flex items-center gap-2.5">
              <div className="p-2 md:p-2.5 bg-orange-500 rounded-lg md:rounded-xl shadow-lg shadow-orange-500/20 shrink-0">
                <Truck className="text-white md:hidden" size={18} />
                <Truck className="text-white hidden md:block" size={20} />
              </div>
              <h1 className="text-lg md:text-xl lg:text-2xl font-black tracking-tight text-slate-900 dark:text-white uppercase transition-all">
                Goods Received <span className="text-slate-400 font-medium ml-1 tracking-tighter italic">Notes</span>
              </h1>
            </div>
            <p className="text-slate-500 dark:text-slate-400 font-medium ml-10 md:ml-12 text-[10px] md:text-xs leading-relaxed">
              Inventory reconciliation and <span className="text-orange-500 font-bold underline decoration-orange-500/30">vendor shipment</span> verification.
            </p>
          </div>

          {/* View Toggle */}
          <div className="flex p-1 bg-slate-100 dark:bg-white/5 rounded-2xl w-full md:w-fit border border-slate-200 dark:border-white/5 overflow-x-auto">
            <button
              onClick={() => { setView("NEW"); setStep(1); }}
              className={clsx(
                "flex-1 md:flex-none px-6 py-2.5 rounded-xl text-[10px] md:text-[11px] font-black uppercase tracking-widest transition-all whitespace-nowrap flex items-center justify-center gap-2",
                view === "NEW" 
                  ? "bg-white dark:bg-card text-slate-900 dark:text-white shadow-md border border-slate-100 dark:border-white/10" 
                  : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
              )}
            >
              <Plus size={14} /> New Receipt
            </button>
            <button
              onClick={() => setView("HISTORY")}
              className={clsx(
                "flex-1 md:flex-none px-6 py-2.5 rounded-xl text-[10px] md:text-[11px] font-black uppercase tracking-widest transition-all whitespace-nowrap flex items-center justify-center gap-2",
                view === "HISTORY" 
                  ? "bg-white dark:bg-card text-slate-900 dark:text-white shadow-md border border-slate-100 dark:border-white/10" 
                  : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
              )}
            >
              <History size={14} /> Received History
            </button>
          </div>
        </header>

        {view === "HISTORY" ? (
          /* --- HISTORY VIEW --- */
          <div className="space-y-6">
            {loading ? (
              <div className="py-20 text-center space-y-4">
                <Loader2 className="mx-auto text-purple-600 animate-spin" size={40} />
                <p className="text-sm font-black text-slate-400 uppercase tracking-widest">Fetching history...</p>
              </div>
            ) : history.length === 0 ? (
              <div className="py-20 bg-white rounded-[32px] border-2 border-dashed border-slate-200 text-center">
                <Package size={48} className="mx-auto text-slate-300 mb-4" />
                <p className="text-slate-500 font-bold uppercase text-xs tracking-widest">No received goods found</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4">
                {history.map((grn) => (
                  <div key={grn.id} className="bg-white dark:bg-card/40 backdrop-blur-md rounded-[32px] border border-slate-200 dark:border-white/5 p-6 hover:shadow-2xl hover:shadow-black/[0.03] transition-all group">
                    <div className="flex flex-col md:flex-row justify-between gap-6">
                      <div className="flex items-start gap-4">
                        <div className="p-3 bg-green-50 dark:bg-green-500/10 rounded-2xl group-hover:scale-110 transition-transform">
                          <ClipboardCheck className="text-green-600" size={24} />
                        </div>
                        <div>
                          <div className="flex items-center gap-3 mb-1">
                            <h3 className="text-lg font-black text-slate-900 dark:text-white uppercase tracking-tight">
                              GRN-{grn.id.substring(0,8).toUpperCase()}
                            </h3>
                            <span className="px-3 py-1 bg-green-50 dark:bg-green-500/10 text-green-600 text-[10px] font-black rounded-full uppercase tracking-widest border border-green-100/50 dark:border-green-500/20">
                              {grn.status}
                            </span>
                          </div>
                          <p className="text-sm font-bold text-slate-500 flex items-center gap-2">
                             From: <span className="text-orange-500 font-black">{grn.procurementOrder?.vendor?.name}</span>
                             <span className="w-1 h-1 rounded-full bg-slate-300 dark:bg-slate-700" />
                             Ref: <span className="text-slate-900 dark:text-slate-300">{grn.procurementOrder?.poNumber || 'Legacy PO'}</span>
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-10">
                        <div className="text-center">
                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Received Date</p>
                          <p className="text-sm font-black text-slate-900 dark:text-white uppercase">
                            {new Date(grn.receivedAt || grn.createdAt).toLocaleDateString(undefined, { day: '2-digit', month: 'short', year: 'numeric' })}
                          </p>
                        </div>
                        <div className="text-center">
                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Items Received</p>
                          <p className="text-sm font-black text-slate-900 dark:text-white">{grn.items?.length || 0} SKUs</p>
                        </div>
                      </div>
                    </div>

                    <div className="mt-6 pt-6 border-t border-slate-100 dark:border-white/5 flex flex-wrap gap-2">
                       {grn.items?.map((item: any) => (
                         <span key={item.id} className="px-3 py-1.5 bg-slate-50 dark:bg-white/5 rounded-lg text-[10px] font-bold text-slate-600 dark:text-slate-400 border border-slate-100 dark:border-white/5">
                           {item.inventoryItem?.name}: <span className="text-orange-500 font-black">{item.acceptedQty} {item.inventoryItem?.unit}</span>
                         </span>
                       ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : step === 1 ? (
          /* --- STEP 1: SELECT PO --- */
          <div className="bg-white dark:bg-card/40 backdrop-blur-md rounded-[40px] shadow-2xl shadow-black/[0.03] border border-slate-200 dark:border-white/5 p-8 space-y-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
              <h2 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tighter flex items-center gap-3">
                <div className="w-1.5 h-8 bg-orange-500 rounded-full" />
                Select Pending Purchase Order
              </h2>
              <div className="relative group">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-orange-500 transition-colors" size={16} />
                <input
                  type="text"
                  placeholder="Search Vendor or PO #"
                  value={poSearch}
                  onChange={e => setPoSearch(e.target.value)}
                  className="pl-12 pr-6 py-3.5 bg-slate-50 dark:bg-white/5 border-none rounded-2xl text-sm font-bold dark:text-white focus:ring-4 focus:ring-orange-500/10 outline-none w-full md:w-72 transition-all"
                />
              </div>
            </div>

            {loading ? (
              <div className="py-20 text-center">
                <Loader2 className="mx-auto text-purple-600 animate-spin" size={32} />
              </div>
            ) : filteredPOs.length === 0 ? (
              <div className="py-16 text-center space-y-4">
                <Package size={40} className="mx-auto text-[#CCC]" />
                <p className="text-sm font-bold text-[#999] uppercase tracking-widest">No pending purchase orders found</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredPOs.map(po => (
                  <button
                    key={po.id}
                    onClick={() => selectPO(po)}
                    className="flex flex-col p-6 bg-white dark:bg-card/60 border-2 border-slate-100 dark:border-white/5 rounded-[32px] hover:border-orange-500/50 hover:shadow-2xl hover:shadow-black/[0.05] transition-all text-left group"
                  >
                    <div className="flex items-center justify-between mb-4">
                      <span className="px-4 py-1 bg-orange-50 dark:bg-orange-500/10 text-orange-600 text-[10px] font-black rounded-full uppercase tracking-widest border border-orange-100 dark:border-orange-500/20">
                        {po.poNumber || "PO-PENDING"}
                      </span>
                      <ArrowRight size={18} className="text-slate-300 group-hover:text-orange-500 transition-all translate-x-0 group-hover:translate-x-2" />
                    </div>
                    <h3 className="text-lg font-black text-slate-900 dark:text-white uppercase truncate">{po.vendor.name}</h3>
                    <div className="flex items-center gap-4 mt-3">
                      <div className="flex flex-col">
                        <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Amount</span>
                        <span className="text-sm font-black text-slate-900 dark:text-white">₹{po.totalAmount.toLocaleString()}</span>
                      </div>
                      <div className="w-px h-8 bg-slate-100 dark:bg-white/5" />
                      <div className="flex flex-col">
                        <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Date</span>
                        <span className="text-sm font-black text-slate-900 dark:text-white">{new Date(po.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        ) : (
          /* --- STEP 2: VERIFY QUANTITIES --- */
          <div className="bg-white dark:bg-card/40 backdrop-blur-md rounded-[40px] shadow-2xl shadow-black/[0.03] border border-slate-200 dark:border-white/5 p-8 space-y-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="space-y-1">
                <h2 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tighter">Verify Shipment Content</h2>
                <p className="text-sm font-bold text-slate-500">
                  Purchasing from <span className="text-orange-500 font-black">{selectedPO?.vendor.name}</span> • {selectedPO?.poNumber}
                </p>
              </div>
              {approvedId && (
                <div className="flex items-center gap-2 px-6 py-3 bg-emerald-50 dark:bg-emerald-500/10 border-2 border-emerald-100/50 dark:border-emerald-500/20 text-emerald-600 rounded-2xl animate-bounce">
                  <CheckCircle2 size={20} />
                  <span className="text-[10px] font-black uppercase tracking-widest">Stock Updated Successfully</span>
                </div>
              )}
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-12 gap-4 px-6 py-4 bg-slate-50 dark:bg-white/5 rounded-2xl">
                <div className="col-span-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Material Name</div>
                <div className="col-span-2 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Ordered</div>
                <div className="col-span-2 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Accepted</div>
                <div className="col-span-2 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Rejected</div>
                <div className="col-span-1"></div>
              </div>

              {grnItems.map((item, idx) => {
                const originalItem = selectedPO?.poItems[idx];
                const hasRejection = item.rejectedQty > 0;
                const hasShortage = item.acceptedQty < item.quantity;

                return (
                  <div key={idx} className="grid grid-cols-12 gap-4 items-center px-6 py-5 border border-slate-100 dark:border-white/5 rounded-[24px] hover:bg-slate-50/50 dark:hover:bg-white/[0.02] transition-all group">
                    <div className="col-span-5">
                      <p className="text-sm font-black text-slate-900 dark:text-white uppercase truncate">{originalItem?.inventoryItem.name}</p>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">Unit: {originalItem?.inventoryItem.unit}</p>
                    </div>
                    <div className="col-span-2 text-center text-sm font-black text-slate-400">
                      {item.quantity}
                    </div>
                    <div className="col-span-2 flex items-center justify-center">
                      <input
                        type="number"
                        min={0}
                        max={item.quantity}
                        value={item.acceptedQty}
                        onChange={e => updateItem(idx, "acceptedQty", Number(e.target.value))}
                        className="w-20 text-center px-2 py-3 border-2 border-emerald-100 dark:border-emerald-500/20 rounded-xl text-sm font-black text-emerald-600 bg-emerald-50/50 dark:bg-emerald-500/5 focus:outline-none focus:border-emerald-400 transition-all"
                      />
                    </div>
                    <div className="col-span-2 flex items-center justify-center">
                      <input
                        type="number"
                        min={0}
                        max={item.quantity - item.acceptedQty}
                        value={item.rejectedQty}
                        onChange={e => updateItem(idx, "rejectedQty", Number(e.target.value))}
                        className="w-20 text-center px-2 py-3 border-2 border-red-100 dark:border-red-500/20 rounded-xl text-sm font-black text-red-600 bg-red-50/50 dark:bg-red-500/5 focus:outline-none focus:border-red-400 transition-all"
                      />
                    </div>
                    <div className="col-span-1 flex items-center justify-center">
                      {hasRejection ? (
                        <div className="p-2 bg-red-50 dark:bg-red-500/10 rounded-full"><XCircle className="text-red-500" size={18} /></div>
                      ) : hasShortage ? (
                        <div className="p-2 bg-amber-50 dark:bg-amber-500/10 rounded-full"><AlertTriangle className="text-amber-500" size={18} /></div>
                      ) : (
                        <div className="p-2 bg-emerald-50 dark:bg-emerald-500/10 rounded-full"><CheckCircle2 className="text-emerald-500" size={18} /></div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Summary */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[
                { label: "Total Ordered", value: grnItems.reduce((s, i) => s + i.quantity, 0), color: "text-slate-900 dark:text-white", bg: "bg-slate-50 dark:bg-white/5" },
                { label: "Total Accepted", value: grnItems.reduce((s, i) => s + i.acceptedQty, 0), color: "text-emerald-600", bg: "bg-emerald-50/50 dark:bg-emerald-500/5" },
                { label: "Total Rejected", value: grnItems.reduce((s, i) => s + i.rejectedQty, 0), color: "text-red-600", bg: "bg-red-50/50 dark:bg-red-500/5" },
              ].map(stat => (
                <div key={stat.label} className={`${stat.bg} rounded-[28px] p-6 text-center border border-slate-100 dark:border-white/5`}>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{stat.label}</p>
                  <p className={`text-3xl font-black tracking-tighter ${stat.color}`}>{stat.value}</p>
                </div>
              ))}
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-6 border-t border-slate-100 dark:border-white/5">
              <button
                onClick={() => setStep(1)}
                className="w-full sm:w-auto px-8 py-4 border-2 border-slate-100 dark:border-white/5 rounded-2xl font-black text-[10px] uppercase tracking-widest text-slate-400 hover:bg-slate-50 dark:hover:bg-white/5 transition-all flex items-center justify-center gap-2"
              >
                <ArrowLeft size={16} /> Change PO
              </button>
              <button
                onClick={handleCreateAndApprove}
                disabled={submitting}
                className="w-full sm:w-auto px-12 py-5 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-[24px] font-black text-[11px] uppercase tracking-[0.2em] shadow-2xl hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-3 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {submitting ? <Loader2 size={18} className="animate-spin" /> : <ClipboardCheck size={18} />}
                {submitting ? "Processing..." : "Approve GRN & Update Stock"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
