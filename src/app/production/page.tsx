"use client";

import { useState, useEffect, useCallback, Suspense } from "react";
import {
  Factory, X, ChevronDown, CheckCircle2,
  Clock, Package, RefreshCw, Play,
  AlertTriangle, ChefHat, History, Minus, Plus,
  ArrowRight, Square, CheckSquare
} from "lucide-react";
import { clsx } from "clsx";
import { productionApi, recipesApi, franchiseApi, inventoryApi, customersApi } from "@/lib/api";
import { useSearchParams } from "next/navigation";
import { toast } from "react-hot-toast";

const STATUS_CONFIG: Record<string, { color: string, bg: string, border: string, dot: string, icon: any }> = {
  COMPLETED:   { color: "text-emerald-700 dark:text-emerald-400", bg: "bg-emerald-50 dark:bg-emerald-500/10", border: "border-emerald-200 dark:border-emerald-500/20", dot: "bg-emerald-500", icon: CheckCircle2 },
  IN_PROGRESS: { color: "text-blue-700 dark:text-blue-400", bg: "bg-blue-50 dark:bg-blue-500/10", border: "border-blue-200 dark:border-blue-500/20", dot: "bg-blue-500", icon: Clock },
  STOPPED:     { color: "text-amber-700 dark:text-amber-400", bg: "bg-amber-50 dark:bg-amber-500/10", border: "border-amber-200 dark:border-amber-500/20", dot: "bg-amber-500", icon: Square },
  PENDING:     { color: "text-slate-600 dark:text-slate-400", bg: "bg-slate-50 dark:bg-white/5", border: "border-slate-200 dark:border-white/10", dot: "bg-slate-400", icon: Clock },
  CANCELLED:   { color: "text-rose-700 dark:text-rose-400", bg: "bg-rose-50 dark:bg-rose-500/10", border: "border-rose-200 dark:border-rose-500/20", dot: "bg-rose-500", icon: X },
};

interface IngredientPreview { id: string; name: string; unit: string; needed: string; available: number | string; sufficient: boolean; }

function ProductionContent() {
  const searchParams = useSearchParams();
  const initialRecipeId = searchParams.get("recipeId");

  const [history, setHistory]     = useState<any[]>([]);
  const [recipes, setRecipes]     = useState<any[]>([]);
  const [franchises, setFranchises] = useState<any[]>([]);
  const [customers, setCustomers]     = useState<any[]>([]);
  const [loading, setLoading]     = useState(true);
  const [stockLoading, setStockLoading] = useState(false);
  const [showForm, setShowForm]   = useState(false);
  const [saving, setSaving]       = useState(false);
  const [error, setError]         = useState("");
  const [franchiseInventory, setFranchiseInventory] = useState<any[]>([]);

  // Form
  const [recipeId, setRecipeId]             = useState("");
  const [franchiseId, setFranchiseId]       = useState("");
  const [customerId, setCustomerId]         = useState("");
  const [allocationType, setAllocationType] = useState<"FRANCHISE" | "CUSTOMER">("FRANCHISE");
  const [quantity, setQuantity]             = useState(1);
  const [targetUnits, setTargetUnits]       = useState(1);
  const [productionType, setProductionType] = useState("FINISHED_GOOD");
  const [expiryDate, setExpiryDate]         = useState("");

  // Approval Modal
  const [showApprovalModal, setShowApprovalModal] = useState(false);
  const [batchToApprove, setBatchToApprove]       = useState<any>(null);
  const [actualYield, setActualYield]             = useState(0);

  const selectedRecipe = recipes.find((r: any) => r.id === recipeId);

  const fetchAll = useCallback(async () => {
    setLoading(true);
    try {
      const [hRes, rRes, fRes, cRes] = await Promise.all([
        productionApi.getHistory(),
        recipesApi.getAll(),
        franchiseApi.getAll(),
        customersApi.getAll(),
      ]);
      setHistory(hRes.data ?? []);
      setRecipes(rRes.data ?? []);
      setFranchises(fRes.data ?? []);
      setCustomers(cRes.data ?? []);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  useEffect(() => {
    if (franchiseId && showForm) {
      setStockLoading(true);
      inventoryApi.getInventory(franchiseId).then(res => {
        setFranchiseInventory(res.data ?? []);
      }).catch(console.error).finally(() => setStockLoading(false));
    }
  }, [franchiseId, showForm]);

  useEffect(() => {
    if (initialRecipeId && recipes.length > 0) {
      const found = recipes.find(r => r.id === initialRecipeId);
      if (found) {
        setRecipeId(initialRecipeId);
        setTargetUnits(found.yieldQty || 1);
        setQuantity(1);
        setShowForm(true);
      }
    }
  }, [initialRecipeId, recipes]);

  useEffect(() => {
    if (recipeId && recipes.length > 0) {
      const found = recipes.find(r => r.id === recipeId);
      if (found) {
        setTargetUnits(found.yieldQty || 1);
        setQuantity(1);
      }
    }
  }, [recipeId, recipes]);

  const handleStart = async () => {
    if (!recipeId || !franchiseId || !expiryDate || quantity <= 0) {
      setError("Please fill all required fields including Expiry Date.");
      return;
    }
    setSaving(true);
    setError("");
    try {
      await productionApi.startBatch({ 
        recipeId, 
        franchiseId: allocationType === "FRANCHISE" ? franchiseId : (franchiseId || ""),
        customerId: allocationType === "CUSTOMER" ? customerId : undefined, 
        quantity, 
        productionType, 
        expiryDate: expiryDate || undefined 
      });
      setShowForm(false);
      setRecipeId(""); setFranchiseId(""); setCustomerId(""); setQuantity(1); setExpiryDate("");
      setAllocationType("FRANCHISE");
      fetchAll();
    } catch (e: any) {
      setError(e?.response?.data?.error ?? "Failed to start production. Check stock levels.");
    } finally { setSaving(false); }
  };

  const handleStop = async (id: string) => {
    setSaving(true);
    try {
      await productionApi.stopBatch(id);
      fetchAll();
    } catch (e: any) {
      toast.error(e?.response?.data?.error ?? "Failed to stop production");
    } finally { setSaving(false); }
  };

  const handleApproveClick = (batch: any) => {
    const plannedUnits = batch.quantity * (batch.recipe?.yieldQty || 1);
    setBatchToApprove(batch);
    setActualYield(plannedUnits);
    setShowApprovalModal(true);
  };

  const handleFinalApprove = async () => {
    if (!batchToApprove) return;
    setSaving(true);
    try {
      await productionApi.approveBatch(batchToApprove.id, { actualYield });
      toast.success("Batch approved and stored");
      setShowApprovalModal(false);
      fetchAll();
    } catch (e: any) {
      toast.error(e?.response?.data?.error ?? "Failed to approve production");
    } finally { setSaving(false); }
  };

  const completedCount = history.filter((h) => h.status === "COMPLETED").length;
  const totalProduced  = history.filter((h) => h.status === "COMPLETED").reduce((s, h) => s + (h.quantity ?? 0), 0);

  const ingredientPreview = selectedRecipe?.recipeItems?.map((item: any) => {
    const franchiseItem = franchiseInventory.find(fi => {
      const matchSku = fi.sku && item.inventoryItem?.sku && fi.sku.trim().toLowerCase() === item.inventoryItem.sku.trim().toLowerCase();
      const matchName = fi.name && item.inventoryItem?.name && fi.name.trim().toLowerCase() === item.inventoryItem.name.trim().toLowerCase();
      return matchSku || matchName;
    });

    const availableStock = franchiseId ? (franchiseItem ? franchiseItem.currentStock : 0) : "-";

    return {
      id: item.inventoryItemId,
      name: item.inventoryItem?.name ?? item.inventoryItemId,
      unit: item.unit,
      needed: ((item.quantityRequired ?? 0) * quantity).toFixed(3),
      available: availableStock,
      sufficient: franchiseId && franchiseItem ? (franchiseItem.currentStock >= (item.quantityRequired ?? 0) * quantity) : false,
    };
  }) ?? [];

  return (
    <div className="max-w-7xl mx-auto space-y-4 md:space-y-8 animate-in fade-in duration-700 px-4 sm:px-0">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 py-3 md:py-4 border-b border-slate-200 dark:border-slate-800">
        <div>
          <div className="flex items-center gap-2.5">
             <div className="p-2 md:p-2.5 bg-[#F97316] rounded-lg md:rounded-xl shadow-lg shadow-orange-600/20 shrink-0">
                <Factory size={18} className="text-white md:hidden" />
                <Factory size={20} className="text-white hidden md:block" />
             </div>
             <h1 className="text-xl md:text-3xl font-black tracking-tight text-slate-900 dark:text-white uppercase transition-all">
               Production <span className="text-slate-400 font-medium ml-1 tracking-tighter italic hidden sm:inline">Control</span>
             </h1>
          </div>
          <p className="text-slate-500 dark:text-slate-400 mt-1.5 font-medium ml-10 md:ml-12 uppercase tracking-widest text-[7px] md:text-[9px]">
            Executing RECIPE-TO-STOCK transformation workflows
          </p>
        </div>
        <div className="flex items-center gap-2">
           <button onClick={fetchAll} className="p-2.5 md:p-3 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg md:rounded-xl hover:border-slate-300 transition-all shadow-sm group shrink-0">
             <RefreshCw size={14} className={clsx("text-slate-400 group-hover:rotate-180 transition-transform duration-500 md:w-4 md:h-4", loading && "animate-spin")} />
           </button>
           <button
             onClick={() => setShowForm(true)}
             className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-[#F97316] text-white px-5 md:px-6 py-3 md:py-3.5 rounded-xl md:rounded-2xl font-black text-[9px] md:text-[10px] uppercase tracking-widest hover:shadow-xl hover:translate-y-[-1px] transition-all active:translate-y-0 shadow-lg shadow-orange-600/10"
           >
             <Play size={14} fill="currentColor" className="md:w-4 md:h-4" /> 
             <span className="hidden sm:inline">Initialize Workflow</span>
             <span className="sm:hidden">New Batch</span>
           </button>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-6">
        <div className="md:col-span-2 space-y-4 md:space-y-6">
          <div className="flex items-center justify-between px-1">
             <h2 className="text-sm md:text-base font-black text-slate-800 dark:text-slate-200 uppercase tracking-[0.15em] flex items-center gap-2">
                <History size={16} className="text-[#F97316]" /> History Ledger
             </h2>
          </div>

          {loading ? (
             <div className="flex flex-col items-center justify-center py-20 bg-white/50 dark:bg-white/[0.02] rounded-[32px] border border-dashed border-slate-200 dark:border-white/5">
                <div className="w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mb-4" />
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Synchronizing Ledger...</p>
             </div>
          ) : history.length === 0 ? (
           <div className="flex flex-col items-center justify-center py-24 bg-white dark:bg-slate-900 rounded-[40px] border-2 border-dashed border-slate-100 dark:border-slate-800/50">
              <div className="w-20 h-20 bg-slate-50 dark:bg-slate-800 rounded-3xl flex items-center justify-center text-slate-300 dark:text-slate-700 mb-6 group-hover:scale-110 transition-transform">
                <Factory size={28} className="md:w-8 md:h-8" />
              </div>
              <p className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-tight">System Ready</p>
              <p className="text-[10px] text-slate-500 mt-1">Initialize your first batch to begin tracking yield.</p>
           </div>
         ) : (
           <div className="grid gap-3 md:gap-5">
             {history.map((batch) => (
               <div key={batch.id} className="group bg-white dark:bg-card/40 backdrop-blur-md rounded-[24px] md:rounded-[32px] border border-slate-100 dark:border-white/5 p-4 md:p-5 hover:shadow-2xl transition-all relative overflow-hidden">
                 <div className={clsx(
                   "absolute top-0 right-0 w-24 h-24 rounded-bl-[100px] -mr-8 -mt-8 opacity-40 transition-all group-hover:opacity-60",
                   batch.status === 'COMPLETED' ? "bg-emerald-500/10" :
                   batch.status === 'IN_PROGRESS' ? "bg-blue-500/10" :
                   batch.status === 'CANCELLED' ? "bg-red-500/10" : "bg-amber-500/10"
                 )} />

                 <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 md:gap-6 relative z-10">
                    <div className="flex items-start md:items-center gap-3 md:gap-5">
                       <div className={clsx(
                         "w-12 h-12 md:w-16 md:h-16 rounded-xl md:rounded-2xl flex items-center justify-center text-white shadow-lg transition-transform group-hover:scale-105 shrink-0",
                         batch.status === 'COMPLETED' ? "bg-emerald-500 shadow-emerald-500/20" : 
                         batch.status === 'IN_PROGRESS' ? "bg-blue-500 shadow-blue-500/20" : "bg-[#F97316] shadow-orange-500/20"
                       )}>
                          <ChefHat size={20} className="md:w-7 md:h-7" />
                       </div>
                       <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-2 md:gap-3">
                             <h3 className="text-base md:text-lg font-black text-slate-900 dark:text-white uppercase tracking-tight truncate">
                                {batch.recipe?.name || "Standard Production"}
                             </h3>
                              {(() => {
                                const config = STATUS_CONFIG[batch.status] || STATUS_CONFIG.PENDING;
                                return (
                                  <span className={clsx(
                                    "flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[8px] font-black uppercase tracking-widest border transition-all",
                                    config.bg, config.color, config.border
                                  )}>
                                    <span className={clsx("w-1 h-1 rounded-full", config.dot)} />
                                    {batch.status.replace("_", " ")}
                                  </span>
                                );
                              })()}
                          </div>

                          <div className="flex items-center gap-5 p-2.5 mt-3 bg-slate-50 dark:bg-white/[0.03] rounded-xl border border-slate-100 dark:border-white/5 max-w-fit">
                             <div className="min-w-[80px]">
                                <p className="text-[8px] font-black text-slate-400 uppercase tracking-[0.1em] mb-0.5">Expected</p>
                                <p className="text-sm font-black text-slate-700 dark:text-slate-200 tracking-tight">
                                   {(batch.quantity * (batch.recipe?.yieldQty || 1)).toFixed(0)} <span className="text-[9px] opacity-50 font-medium">UNITS</span>
                                </p>
                             </div>
                             <div className="h-6 w-[1px] bg-slate-200 dark:bg-white/10" />
                             <div className="min-w-[100px]">
                                <p className="text-[8px] font-black text-emerald-500 uppercase tracking-[0.1em] mb-0.5">Outcoming Output</p>
                                <p className="text-sm font-black text-emerald-600 dark:text-emerald-400 tracking-tight">
                                   {batch.actualYield != null ? Number(batch.actualYield).toFixed(0) : "---"} <span className="text-[9px] opacity-50 font-medium">UNITS</span>
                                </p>
                             </div>
                          </div>

                          <div className="flex flex-wrap items-center gap-3 mt-3">
                             <span className="text-[8px] md:text-[9px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5 bg-slate-50 dark:bg-white/5 px-2.5 py-1 rounded-lg">
                                <Package size={10} className="text-[#F97316]" /> {batch.quantity} Batch(es)
                             </span>
                             <span className="text-[8px] md:text-[9px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5 bg-slate-50 dark:bg-white/5 px-2.5 py-1 rounded-lg">
                                <Clock size={10} className="text-blue-500" /> {batch.startTime ? new Date(batch.startTime).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }) : "N/A"}
                             </span>
                          </div>
                       </div>
                    </div>

                    <div className="flex flex-col sm:flex-row items-center gap-2">
                      {batch.status === 'IN_PROGRESS' && (
                        <button 
                          onClick={() => handleStop(batch.id)}
                          disabled={saving}
                          className="w-full lg:w-auto px-6 py-3 md:py-3.5 bg-amber-500 text-white rounded-lg md:rounded-xl shadow-lg shadow-amber-500/20 text-[8px] md:text-[9px] font-black uppercase tracking-widest hover:bg-amber-400 transition-all flex items-center justify-center gap-2"
                        >
                          <Square size={12} fill="currentColor" /> Stop Production
                        </button>
                      )}
                      {batch.status === 'STOPPED' && (
                        <button 
                          onClick={() => handleApproveClick(batch)}
                          disabled={saving}
                          className="w-full lg:w-auto px-6 py-3 md:py-3.5 bg-emerald-600 text-white rounded-lg md:rounded-xl shadow-lg shadow-emerald-600/20 text-[8px] md:text-[9px] font-black uppercase tracking-widest hover:bg-emerald-500 transition-all flex items-center justify-center gap-2"
                        >
                          <CheckSquare size={12} /> Approve & Store
                        </button>
                      )}
                      <button className="w-full lg:w-auto px-4 py-3 md:py-3.5 bg-slate-50 dark:bg-white/5 rounded-lg md:rounded-xl border border-slate-100 dark:border-white/10 text-[8px] md:text-[9px] font-black uppercase tracking-widest text-slate-500 hover:text-indigo-600 transition-all flex items-center justify-center gap-2">
                         View Ledger Entry <ArrowRight size={12} />
                      </button>
                    </div>
                 </div>

                 {/* Integrated Material Breakdown */}
                 <div className="mt-4 md:mt-5 pt-4 md:pt-5 border-t border-slate-100 dark:border-white/5 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2.5 md:gap-3">
                    {batch.items?.map((item: any, i: number) => (
                       <div key={i} className="p-2.5 md:p-3 bg-slate-50/50 dark:bg-white/[0.01] rounded-lg md:rounded-xl border border-slate-100 dark:border-white/5 group/ing">
                          <p className="text-[8px] md:text-[9px] font-black text-slate-400 uppercase tracking-widest mb-0.5 truncate">{item.inventoryItem?.name || "Ingredient"}</p>
                          <p className="text-sm md:text-base font-black text-red-500 tracking-tighter">{item.usedQuantity.toFixed(2)} <span className="text-[10px] opacity-60 ml-0.5 uppercase">{item.inventoryItem?.unit || ""}</span></p>
                       </div>
                    ))}
                 </div>
               </div>
             ))}
           </div>
         )}
        </div>

        <div className="space-y-4 md:space-y-6">
           <div className="bg-white dark:bg-card/40 backdrop-blur-xl rounded-[32px] p-6 md:p-8 border border-slate-100 dark:border-white/5 shadow-2xl shadow-slate-200/50 dark:shadow-none">
              <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] mb-6 flex items-center gap-2">
                 <CheckCircle2 size={16} className="text-emerald-500" /> Operational Health
              </h3>
              <div className="space-y-6">
                 <div>
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Completed Cycles</p>
                    <div className="flex items-end gap-2">
                       <span className="text-3xl font-black text-slate-900 dark:text-white tracking-tighter">{completedCount}</span>
                       <span className="text-[10px] font-bold text-emerald-500 mb-1.5 uppercase">Success</span>
                    </div>
                 </div>
                 <div className="h-[1px] bg-slate-100 dark:bg-white/5" />
                 <div>
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Volume Processed</p>
                    <div className="flex items-end gap-2">
                       <span className="text-3xl font-black text-slate-900 dark:text-white tracking-tighter">{totalProduced}</span>
                       <span className="text-[10px] font-bold text-orange-500 mb-1.5 uppercase">Batches</span>
                    </div>
                 </div>
              </div>
           </div>
        </div>
      </div>

      {showForm && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 animate-in zoom-in duration-500 text-slate-900">
           <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-md" onClick={() => setShowForm(false)} />
           <div className="relative bg-white rounded-[2rem] shadow-2xl w-full max-w-lg border border-slate-100 p-6 md:p-8 overflow-hidden max-h-[92vh] overflow-y-auto custom-scrollbar">
              <div className="flex items-center gap-4 mb-6">
                 <div className="w-12 h-12 rounded-2xl bg-orange-500 flex items-center justify-center text-white shadow-lg shadow-orange-500/20 shrink-0">
                    <Play size={20} fill="currentColor" />
                 </div>
                 <div>
                    <h2 className="text-xl font-black tracking-tight uppercase">New Production</h2>
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mt-0.5">Start a new batch from recipe</p>
                 </div>
              </div>

              <div className="flex p-1 bg-slate-50 rounded-xl mb-6">
                 <button 
                   onClick={() => { setAllocationType("FRANCHISE"); setCustomerId(""); }}
                   className={clsx("flex-1 py-2.5 rounded-lg font-black text-[10px] uppercase tracking-widest transition-all", 
                     allocationType === "FRANCHISE" ? "bg-white text-orange-600 shadow-sm border border-slate-100" : "text-slate-400 hover:text-slate-600")}
                 >
                   Send to Branch
                 </button>
                 <button 
                   onClick={() => { setAllocationType("CUSTOMER"); setFranchiseId(franchiseId); }}
                   className={clsx("flex-1 py-2.5 rounded-lg font-black text-[10px] uppercase tracking-widest transition-all", 
                     allocationType === "CUSTOMER" ? "bg-white text-orange-600 shadow-sm border border-slate-100" : "text-slate-400 hover:text-slate-600")}
                 >
                   Direct Customer
                 </button>
              </div>

              <div className="space-y-5">
                  <div className="grid grid-cols-1 gap-5">
                     <div className="space-y-1.5">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Select Recipe *</label>
                        <select 
                          value={recipeId} 
                          onChange={(e) => setRecipeId(e.target.value)}
                          className="w-full h-11 bg-slate-50 px-4 rounded-xl font-bold text-xs outline-none focus:ring-4 ring-orange-100 border border-slate-100 transition-all appearance-none cursor-pointer"
                        >
                           <option value="">Choose a recipe...</option>
                           {recipes.map(r => <option key={r.id} value={r.id}>{r.name} (Yield: {r.yieldQty})</option>)}
                        </select>
                     </div>

                     {allocationType === "FRANCHISE" ? (
                        <div className="space-y-1.5">
                           <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Target Branch *</label>
                           <select 
                             value={franchiseId} 
                             onChange={(e) => setFranchiseId(e.target.value)}
                             className="w-full h-11 bg-slate-50 px-4 rounded-xl font-bold text-xs outline-none focus:ring-4 ring-orange-100 border border-slate-100 transition-all appearance-none cursor-pointer"
                           >
                              <option value="">Select branch location...</option>
                              {franchises.map(f => <option key={f.id} value={f.id}>{f.name}</option>)}
                           </select>
                        </div>
                     ) : (
                        <div className="space-y-1.5">
                           <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Select Customer *</label>
                           <select 
                             value={customerId} 
                             onChange={(e) => setCustomerId(e.target.value)}
                             className="w-full h-11 bg-slate-50 px-4 rounded-xl font-bold text-xs outline-none focus:ring-4 ring-orange-100 border border-slate-100 transition-all appearance-none cursor-pointer"
                           >
                              <option value="">Choose a customer...</option>
                              {customers.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                           </select>
                        </div>
                     )}

                     <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                           <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Production Scale</label>
                           <div className="h-11 bg-slate-100/50 rounded-xl border border-slate-200/50 flex items-center px-4 font-black text-slate-500 text-sm italic uppercase tracking-tighter">
                              1 Standard Batch
                           </div>
                        </div>
                        <div className="space-y-1.5">
                           <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Total Target Units</label>
                           <div className="h-11 bg-slate-100/50 rounded-xl border border-slate-200/50 flex items-center px-4 font-black text-slate-500 text-sm italic">
                              {quantity * targetUnits} Units
                           </div>
                        </div>
                     </div>

                     <div className="space-y-1.5">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Production Expiry *</label>
                        <input 
                           type="date" 
                           value={expiryDate} 
                           onChange={(e) => setExpiryDate(e.target.value)}
                           min={new Date().toISOString().split('T')[0]}
                           className="w-full h-11 bg-slate-50 px-4 rounded-xl font-bold text-xs outline-none focus:ring-4 ring-orange-100 border border-slate-100 transition-all" 
                        />
                     </div>
                  </div>

                  {recipeId && ingredientPreview.length > 0 && (
                     <div className="mt-2">
                        <div className="flex items-center justify-between mb-3 px-1">
                           <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Resource Availability Check</p>
                           {stockLoading && <RefreshCw size={10} className="animate-spin text-orange-500" />}
                        </div>
                        <div className="space-y-2 max-h-40 overflow-y-auto pr-2 custom-scrollbar">
                           {ingredientPreview.map((ing) => (
                              <div key={ing.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-100">
                                 <div className="flex flex-col">
                                    <span className="text-[10px] font-black text-slate-700 truncate max-w-[140px] uppercase tracking-tight">{ing.name}</span>
                                    <span className="text-[9px] font-bold text-slate-400">Target: {ing.needed} {ing.unit}</span>
                                 </div>
                                 <div className="flex flex-col items-end">
                                    <span className={clsx("text-[10px] font-black uppercase tracking-widest", 
                                       ing.sufficient ? "text-emerald-500" : "text-rose-500")}>
                                       {ing.available} {ing.unit}
                                    </span>
                                    {!ing.sufficient && <span className="text-[8px] font-black text-rose-400 uppercase">Shortage</span>}
                                 </div>
                              </div>
                           ))}
                        </div>
                     </div>
                  )}

                  {error && (
                    <div className="flex items-center gap-3 p-4 bg-rose-50 rounded-2xl border border-rose-100 animate-in slide-in-from-top-2">
                       <AlertTriangle size={18} className="text-rose-500 shrink-0" />
                       <p className="text-[10px] font-bold text-rose-600 leading-tight">{error}</p>
                    </div>
                  )}

                  <div className="flex items-center gap-3 pt-2">
                     <button 
                       onClick={() => setShowForm(false)}
                       className="flex-1 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest text-slate-400 hover:text-slate-600 hover:bg-slate-50 transition-all"
                     >
                       Cancel
                     </button>
                     <button 
                       onClick={handleStart}
                       disabled={saving}
                       className="flex-[2] py-4 bg-orange-500 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-lg shadow-orange-500/20 hover:bg-orange-400 transition-all flex items-center justify-center gap-2"
                     >
                       {saving ? "Initializing..." : "Start Production"}
                       {!saving && <ArrowRight size={14} />}
                     </button>
                  </div>
              </div>
           </div>
        </div>
      )}

      {showApprovalModal && batchToApprove && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 animate-in fade-in duration-300">
           <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-md" onClick={() => setShowApprovalModal(false)} />
           <div className="relative bg-white rounded-[2.5rem] shadow-2xl w-full max-w-md border border-white/20 p-8 overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-bl-[100px] -mr-10 -mt-10" />
              
              <div className="flex items-center gap-4 mb-8">
                 <div className="w-14 h-14 rounded-2xl bg-emerald-500 flex items-center justify-center text-white shadow-xl shadow-emerald-500/20 shrink-0">
                    <CheckCircle2 size={24} />
                 </div>
                 <div>
                    <h2 className="text-2xl font-black tracking-tight uppercase text-slate-900">Confirm Yield</h2>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-0.5">Finalize actual output units</p>
                 </div>
              </div>

              <div className="space-y-6">
                 <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                       <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Planned Output</p>
                       <p className="text-xl font-black text-slate-900">
                          {batchToApprove.quantity * (batchToApprove.recipe?.yieldQty || 1)} <span className="text-xs opacity-40 font-bold uppercase ml-1">Units</span>
                       </p>
                    </div>
                    <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-100">
                       <p className="text-[9px] font-black text-emerald-500 uppercase tracking-widest mb-1">Actual Output</p>
                       <p className="text-xl font-black text-emerald-600">
                          {actualYield} <span className="text-xs opacity-40 font-bold uppercase ml-1">Units</span>
                       </p>
                    </div>
                 </div>

                 <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Adjust Actual Yield (Units) *</label>
                    <div className="relative">
                       <input 
                         type="number" 
                         value={actualYield}
                         onChange={(e) => setActualYield(Number(e.target.value))}
                         className="w-full h-14 bg-slate-50 px-5 rounded-2xl font-black text-lg outline-none focus:ring-4 ring-emerald-500/10 border border-slate-100 transition-all text-slate-900"
                         placeholder="0"
                       />
                       <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-1">
                          <button onClick={() => setActualYield(prev => Math.max(0, prev - 1))} className="p-1.5 hover:bg-slate-200 rounded-lg transition-colors"><Minus size={16} className="text-slate-400" /></button>
                          <button onClick={() => setActualYield(prev => prev + 1)} className="p-1.5 hover:bg-slate-200 rounded-lg transition-colors"><Plus size={16} className="text-slate-400" /></button>
                       </div>
                    </div>
                 </div>

                 <div className="flex items-center gap-3 pt-4">
                    <button 
                      onClick={() => setShowApprovalModal(false)}
                      className="flex-1 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest text-slate-400 hover:text-slate-600 hover:bg-slate-50 transition-all"
                    >
                      Wait
                    </button>
                    <button 
                      onClick={handleFinalApprove}
                      disabled={saving}
                      className="flex-[2] py-4 bg-emerald-600 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-lg shadow-emerald-600/20 hover:bg-emerald-500 transition-all flex items-center justify-center gap-2"
                    >
                      {saving ? "Storing..." : "Complete & Store"}
                    </button>
                 </div>
              </div>
           </div>
        </div>
      )}
    </div>
  );
}

export default function ProductionPage() {
  return (
    <Suspense fallback={
      <div className="flex h-[50vh] items-center justify-center">
        <div className="w-10 h-10 border-4 border-[#F97316] border-t-transparent rounded-full animate-spin" />
      </div>
    }>
      <ProductionContent />
    </Suspense>
  );
}
