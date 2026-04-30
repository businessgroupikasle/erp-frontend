"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/context/ToastContext";
import {
  Package, ChevronDown, CheckCircle2, XCircle, AlertTriangle,
  Truck, ClipboardCheck, ArrowLeft, Loader2, Search, Calendar,
  ExternalLink, ArrowRight, History, Plus
} from "lucide-react";
import { purchaseOrdersApi, grnApi, purchaseReturnsApi, vendorsApi } from "@/lib/api";
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
  vendorId?: string;
  vendor: { id?: string; name: string };
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
        inventoryItem: item.inventoryItem,
      }))
    );
    setStep(2);
  };

  const updateItem = (idx: number, field: keyof GRNItem, val: number) => {
    setGrnItems(prev => {
      const next = [...prev];
      const currentItem = { ...next[idx], [field]: val };
      
      // Calculate Accepted = Received - Rejected
      if (field === "receivedQty" || field === "rejectedQty") {
        const received = field === "receivedQty" ? val : currentItem.receivedQty;
        const rejected = field === "rejectedQty" ? val : currentItem.rejectedQty;
        currentItem.acceptedQty = Math.max(0, received - rejected);
      }
      
      next[idx] = currentItem;
      return next;
    });
  };

  const handleCreateAndApprove = async () => {
    if (!selectedPO) return;
    setSubmitting(true);
    try {
      // 1. Create and Approve GRN (Impacts Inventory)
      const res = await grnApi.createFromPO(selectedPO.id, { items: grnItems });
      const grnId = res.data.id;
      await grnApi.approve(grnId);
      setApprovedId(grnId);

      // 2. Handle Rejections (Auto-create Purchase Return & Credit Adjustment)
      const rejectedItems = grnItems.filter(item => item.rejectedQty > 0);
      if (rejectedItems.length > 0) {
        const vendorId = selectedPO.vendorId || selectedPO.vendor?.id;
        
        if (vendorId) {
          // Create Purchase Return document
          await purchaseReturnsApi.create({
            vendorId,
            reason: "AUTO-GENERATED FROM GRN REJECTION",
            items: rejectedItems.map(item => ({
              itemName: item.inventoryItem?.name || "Unknown Material",
              quantity: item.rejectedQty,
              unit: item.inventoryItem?.unit || "unit",
              rate: item.price
            }))
          });

          // Record Ledger Adjustment for Financial Accuracy
          const totalRejectedValue = rejectedItems.reduce((sum, item) => sum + (item.rejectedQty * item.price), 0);
          await vendorsApi.recordAdjustment(vendorId, {
            amount: totalRejectedValue,
            type: 'CREDIT',
            note: `Auto-Adjustment: Credit for Rejected Goods on GRN: ${grnId.substring(0,8)}`,
            referenceType: 'ADJUSTMENT',
            referenceId: grnId
          });
        }
      }

      showToast("GRN Approved successfully! Stock updated and rejections processed.", "success");
      
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
    <div className="min-h-screen bg-white dark:bg-slate-950 p-6 space-y-8 animate-in fade-in duration-500">
      <div className="max-w-[1500px] mx-auto space-y-8">
        
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
             <div className="w-14 h-14 rounded-2xl bg-orange-500 flex items-center justify-center text-white shadow-lg shadow-orange-500/20">
                <Package size={28} />
             </div>
             <div>
                <h1 className="text-2xl font-black text-gray-900 dark:text-white uppercase tracking-tight">Goods Receipt (GRN)</h1>
                <p className="text-sm text-gray-500 mt-0.5 font-medium flex items-center gap-1.5">
                  <div className="w-1.5 h-1.5 rounded-full bg-orange-500" />
                  Manage vendor shipment verification and stock reconciliation
                </p>
             </div>
          </div>
          <div className="flex p-1 bg-gray-50 dark:bg-white/5 rounded-2xl border border-gray-100 dark:border-white/5">
            <button
              onClick={() => { setView("NEW"); setStep(1); }}
              className={clsx(
                "px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all",
                view === "NEW" 
                  ? "bg-white dark:bg-card text-orange-600 shadow-lg shadow-black/[0.03] border border-gray-100 dark:border-white/10" 
                  : "text-gray-400 hover:text-gray-600"
              )}
            >
              New Receipt
            </button>
            <button
              onClick={() => setView("HISTORY")}
              className={clsx(
                "px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all",
                view === "HISTORY" 
                  ? "bg-white dark:bg-card text-orange-600 shadow-lg shadow-black/[0.03] border border-gray-100 dark:border-white/10" 
                  : "text-gray-400 hover:text-gray-600"
              )}
            >
              Received History
            </button>
          </div>
        </header>

        {view === "HISTORY" ? (
          /* --- HISTORY VIEW --- */
          <div className="space-y-6">
            <div className="bg-white dark:bg-[#12141c] rounded-3xl border border-gray-100 dark:border-white/5 shadow-xl shadow-black/[0.02] overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-gray-50/50 dark:bg-white/5 border-b border-gray-100 dark:border-white/5">
                  <tr>
                    {["GRN #", "Vendor", "Reference PO", "Date", "Status", "Items"].map(h => (
                      <th key={h} className="px-8 py-5 text-left text-[10px] font-black text-gray-400 uppercase tracking-[0.15em]">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50 dark:divide-white/5">
                  {loading ? (
                    <tr><td colSpan={6} className="px-8 py-16 text-center"><Loader2 className="mx-auto text-orange-500 animate-spin" /></td></tr>
                  ) : history.length === 0 ? (
                    <tr><td colSpan={6} className="px-8 py-16 text-center text-gray-400 font-bold uppercase text-xs tracking-widest">No receipt history found</td></tr>
                  ) : history.map((grn) => (
                    <tr key={grn.id} className="hover:bg-gray-50/30 dark:hover:bg-white/[0.02] transition-colors group">
                      <td className="px-8 py-5 font-bold text-xs text-orange-600">GRN-{grn.id.substring(0,8).toUpperCase()}</td>
                      <td className="px-8 py-5">
                         <div className="text-gray-900 dark:text-white font-black uppercase text-xs">{grn.procurementOrder?.vendor?.name}</div>
                         <div className="text-[10px] text-gray-400 font-bold uppercase mt-0.5 tracking-tight">Verified Shipment</div>
                      </td>
                      <td className="px-8 py-5 font-bold text-gray-500 uppercase text-[10px] tracking-tight">{grn.procurementOrder?.poNumber || 'N/A'}</td>
                      <td className="px-8 py-5 text-gray-500 font-bold text-xs">{new Date(grn.receivedAt || grn.createdAt).toLocaleDateString()}</td>
                      <td className="px-8 py-5">
                        <span className="px-3 py-1 bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 text-[10px] font-black rounded-xl uppercase tracking-widest border border-emerald-100/50 dark:border-emerald-500/20">
                          {grn.status}
                        </span>
                      </td>
                      <td className="px-8 py-5">
                        <div className="flex flex-wrap gap-1.5">
                          {grn.items?.slice(0, 2).map((item: any) => (
                            <span key={item.id} className="px-2.5 py-1 bg-gray-100 dark:bg-white/5 text-gray-600 dark:text-gray-400 text-[9px] rounded-lg font-black uppercase border border-gray-200/50">
                              {item.inventoryItem?.name} ({item.acceptedQty})
                            </span>
                          ))}
                          {grn.items?.length > 2 && <span className="text-[10px] font-bold text-gray-400 ml-1">+{grn.items.length - 2}</span>}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : step === 1 ? (
          /* --- STEP 1: SELECT PO --- */
          <div className="space-y-8 animate-in slide-in-from-bottom-4 duration-500">
            <div className="relative max-w-lg">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input
                type="text"
                placeholder="Search Vendor or PO #"
                value={poSearch}
                onChange={e => setPoSearch(e.target.value)}
                className="w-full pl-12 pr-6 py-4 bg-white dark:bg-[#12141c] border border-gray-100 dark:border-white/5 rounded-2xl text-sm font-bold shadow-xl shadow-black/[0.02] outline-none focus:ring-2 ring-orange-500/10 focus:border-orange-500 transition-all transition-all"
              />
            </div>

            {loading ? (
              <div className="py-24 text-center"><Loader2 className="mx-auto text-orange-500 animate-spin" size={32} /></div>
            ) : filteredPOs.length === 0 ? (
              <div className="py-32 bg-white dark:bg-[#12141c] rounded-[2.5rem] border border-dashed border-gray-200 dark:border-white/5 text-center text-gray-400 shadow-inner">
                <div className="w-16 h-16 bg-gray-50 dark:bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4">
                   <Package className="text-gray-300" size={32} />
                </div>
                <p className="text-xs font-black uppercase tracking-widest">No pending purchase orders available</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredPOs.map(po => (
                  <button
                    key={po.id}
                    onClick={() => selectPO(po)}
                    className="flex flex-col p-8 bg-white dark:bg-[#12141c] border border-gray-100 dark:border-white/5 rounded-[2.5rem] hover:border-orange-500/50 hover:shadow-2xl hover:shadow-orange-500/[0.05] transition-all text-left group overflow-hidden relative"
                  >
                    <div className="absolute top-0 right-0 w-24 h-24 bg-orange-500/5 rounded-bl-[100px] -mr-8 -mt-8" />
                    <div className="flex items-center justify-between mb-6 relative z-10">
                      <span className="px-4 py-1 bg-orange-50 dark:bg-orange-500/10 text-orange-600 text-[10px] font-black rounded-xl uppercase tracking-widest border border-orange-200/50 dark:border-orange-500/20">
                        {po.poNumber || "PO-PENDING"}
                      </span>
                      <span className="text-[10px] font-black text-gray-400">{new Date(po.createdAt).toLocaleDateString()}</span>
                    </div>
                    <h3 className="text-lg font-black text-gray-900 dark:text-white group-hover:text-orange-600 transition-colors uppercase truncate mb-6 relative z-10">
                      {po.vendor.name}
                    </h3>
                    <div className="flex items-center justify-between pt-6 border-t border-gray-50 dark:border-white/5 relative z-10">
                      <div className="flex flex-col">
                        <span className="text-[9px] text-gray-400 uppercase font-black tracking-widest">Total Value</span>
                        <span className="text-xl font-black text-gray-900 dark:text-white leading-tight">₹{po.totalAmount.toLocaleString()}</span>
                      </div>
                      <div className="w-10 h-10 bg-orange-50 dark:bg-orange-500/10 rounded-xl flex items-center justify-center text-orange-500 group-hover:scale-110 transition-transform">
                        <ArrowRight size={20} />
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        ) : (
          /* --- STEP 2: VERIFY QUANTITIES --- */
          <div className="space-y-8 animate-in slide-in-from-right-4 duration-500">
            <div className="bg-white dark:bg-[#12141c] p-8 rounded-[2.5rem] border border-gray-100 dark:border-white/5 shadow-xl shadow-black/[0.02] flex flex-col md:flex-row md:items-center justify-between gap-6 relative overflow-hidden">
               <div className="absolute top-0 right-0 w-32 h-32 bg-orange-500/5 rounded-bl-[120px] -mr-12 -mt-12" />
               <div className="relative z-10">
                <h2 className="text-xl font-black text-gray-900 dark:text-white uppercase tracking-tight">Verify Shipment Content</h2>
                <p className="text-sm text-gray-500 mt-1 font-medium">
                  PO Reference: <span className="font-black text-orange-600">{selectedPO?.poNumber}</span> • Vendor: <span className="font-black text-gray-900 dark:text-gray-200">{selectedPO?.vendor.name}</span>
                </p>
              </div>
              <button
                onClick={() => setStep(1)}
                className="px-6 py-3 border-2 border-gray-100 dark:border-white/5 rounded-2xl text-[10px] font-black uppercase tracking-widest text-gray-500 hover:bg-gray-50 dark:hover:bg-white/5 transition-all relative z-10"
              >
                Change PO Source
              </button>
            </div>

            <div className="bg-white dark:bg-[#12141c] rounded-[2.5rem] border border-gray-100 dark:border-white/5 shadow-xl shadow-black/[0.02] overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-gray-50/50 dark:bg-white/5 border-b border-gray-100 dark:border-white/5">
                  <tr>
                    <th className="px-8 py-5 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest">Material</th>
                    <th className="px-8 py-5 text-center text-[10px] font-black text-gray-400 uppercase tracking-widest">Ordered</th>
                    <th className="px-8 py-5 text-center text-[10px] font-black text-gray-400 uppercase tracking-widest">Received</th>
                    <th className="px-8 py-5 text-center text-[10px] font-black text-gray-400 uppercase tracking-widest">Rejected</th>
                    <th className="px-8 py-5 text-center text-[10px] font-black text-gray-400 uppercase tracking-widest">Accepted</th>
                    <th className="px-8 py-5"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50 dark:divide-white/5">
                  {grnItems.map((item, idx) => {
                    const originalItem = selectedPO?.poItems[idx];
                    return (
                      <tr key={idx} className="hover:bg-gray-50/30 dark:hover:bg-white/[0.01] transition-colors">
                        <td className="px-8 py-6">
                          <div className="font-black text-gray-900 dark:text-white uppercase text-xs">{originalItem?.inventoryItem.name}</div>
                          <div className="text-[9px] text-gray-400 font-black uppercase tracking-widest mt-1 opacity-70">UNIT: {originalItem?.inventoryItem.unit}</div>
                        </td>
                        <td className="px-8 py-6 text-center">
                           <span className="px-3 py-1.5 bg-gray-50 dark:bg-white/5 rounded-lg text-xs font-black text-gray-400 uppercase">{item.quantity}</span>
                        </td>
                        <td className="px-8 py-6">
                          <div className="flex justify-center">
                            <input
                              type="number"
                              min={0}
                              value={item.receivedQty}
                              onChange={e => updateItem(idx, "receivedQty", Number(e.target.value))}
                              className="w-24 text-center px-4 py-3 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-2xl font-black text-gray-700 dark:text-gray-200 outline-none focus:border-orange-500 focus:ring-4 ring-orange-500/10 transition-all"
                            />
                          </div>
                        </td>
                        <td className="px-8 py-6">
                          <div className="flex justify-center">
                            <input
                              type="number"
                              min={0}
                              max={item.receivedQty}
                              value={item.rejectedQty}
                              onChange={e => updateItem(idx, "rejectedQty", Number(e.target.value))}
                              className="w-24 text-center px-4 py-3 bg-red-50/30 dark:bg-red-500/5 border border-red-100 dark:border-red-500/20 rounded-2xl text-red-600 font-black outline-none focus:border-red-400 focus:ring-4 ring-red-500/10 transition-all"
                            />
                          </div>
                        </td>
                        <td className="px-8 py-6">
                          <div className="flex justify-center">
                            <span className="w-24 text-center px-4 py-3 bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 rounded-2xl font-black border border-emerald-100/50 dark:border-emerald-500/20">
                              {item.acceptedQty}
                            </span>
                          </div>
                        </td>
                        <td className="px-8 py-6 text-right">
                          {item.rejectedQty > 0 ? (
                            <div className="w-8 h-8 rounded-full bg-red-50 dark:bg-red-500/10 flex items-center justify-center text-red-500 mx-auto">
                               <XCircle size={16} />
                            </div>
                          ) : item.acceptedQty < item.quantity ? (
                            <div className="w-8 h-8 rounded-full bg-amber-50 dark:bg-amber-500/10 flex items-center justify-center text-amber-500 mx-auto">
                               <AlertTriangle size={16} />
                            </div>
                          ) : (
                            <div className="w-8 h-8 rounded-full bg-emerald-50 dark:bg-emerald-500/10 flex items-center justify-center text-emerald-500 mx-auto">
                               <CheckCircle2 size={16} />
                            </div>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {[
                { label: "Ordered", value: grnItems.reduce((s, i) => s + i.quantity, 0), color: "text-gray-900 dark:text-white", bg: "bg-white dark:bg-[#12141c]" },
                { label: "Received", value: grnItems.reduce((s, i) => s + i.receivedQty, 0), color: "text-orange-500", bg: "bg-orange-50/30 dark:bg-orange-500/5" },
                { label: "Rejected", value: grnItems.reduce((s, i) => s + i.rejectedQty, 0), color: "text-red-500", bg: "bg-red-50/30 dark:bg-red-500/5" },
                { label: "Accepted", value: grnItems.reduce((s, i) => s + i.acceptedQty, 0), color: "text-emerald-500", bg: "bg-emerald-50/30 dark:bg-emerald-500/5" },
              ].map(stat => (
                <div key={stat.label} className={clsx("rounded-[2rem] p-8 border border-gray-100 dark:border-white/5 shadow-xl shadow-black/[0.02] text-center", stat.bg)}>
                   <div className={clsx("text-4xl font-black tracking-tighter mb-2", stat.color)}>
                     {stat.value}
                   </div>
                  <p className="text-[10px] text-gray-400 font-black uppercase tracking-[0.2em]">{stat.label}</p>
                </div>
              ))}
            </div>

            {/* Bottom Actions */}
            <div className="flex justify-end pt-8">
               <button
                onClick={handleCreateAndApprove}
                disabled={submitting}
                className="w-full md:w-auto px-12 py-5 bg-orange-600 text-white rounded-[2rem] font-black text-[11px] uppercase tracking-[0.2em] shadow-2xl shadow-orange-500/20 hover:bg-orange-700 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-3 disabled:opacity-50"
              >
                {submitting ? <Loader2 size={18} className="animate-spin" /> : <ClipboardCheck size={20} />}
                Confirm & Sync Financials
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
