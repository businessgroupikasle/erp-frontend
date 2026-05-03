"use client";

import { useState, useEffect, useCallback, Suspense } from "react";
import {
  Factory, X, ChevronDown, CheckCircle2,
  Clock, Package, RefreshCw, Play,
  AlertTriangle, ChefHat, History, Minus,
  ArrowRight, Square, CheckSquare
} from "lucide-react";
import { clsx } from "clsx";
import { productionApi, recipesApi, franchiseApi, inventoryApi, customersApi } from "@/lib/api";
import { useSearchParams } from "next/navigation";

const STATUS_CONFIG: Record<string, { color: string, bg: string, border: string, dot: string, icon: any }> = {
  COMPLETED:   { color: "text-emerald-700 dark:text-emerald-400", bg: "bg-emerald-50 dark:bg-emerald-500/10", border: "border-emerald-200 dark:border-emerald-500/20", dot: "bg-emerald-500", icon: CheckCircle2 },
  IN_PROGRESS: { color: "text-blue-700 dark:text-blue-400", bg: "bg-blue-50 dark:bg-blue-500/10", border: "border-blue-200 dark:border-blue-500/20", dot: "bg-blue-500", icon: Clock },
  STOPPED:     { color: "text-amber-700 dark:text-amber-400", bg: "bg-amber-50 dark:bg-amber-500/10", border: "border-amber-200 dark:border-amber-500/20", dot: "bg-amber-500", icon: Square },
  PENDING:     { color: "text-slate-600 dark:text-slate-400", bg: "bg-slate-50 dark:bg-white/5", border: "border-slate-200 dark:border-white/10", dot: "bg-slate-400", icon: Clock },
  CANCELLED:   { color: "text-rose-700 dark:text-rose-400", bg: "bg-rose-50 dark:bg-rose-500/10", border: "border-rose-200 dark:border-rose-500/20", dot: "bg-rose-500", icon: X },
};

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
  const [productionType, setProductionType] = useState("FINISHED_GOOD");
  const [expiryDate, setExpiryDate]         = useState("");

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
        setShowForm(true);
      }
    }
  }, [initialRecipeId, recipes]);

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
        franchiseId: allocationType === "FRANCHISE" ? franchiseId : (franchiseId || ""), // Fallback to current franchiseId if already set
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
      alert(e?.response?.data?.error ?? "Failed to stop production");
    } finally { setSaving(false); }
  };

  const handleApprove = async (id: string) => {
    if (!confirm("Approve this batch and move to finished products?")) return;
    setSaving(true);
    try {
      await productionApi.approveBatch(id);
      fetchAll();
    } catch (e: any) {
      alert(e?.response?.data?.error ?? "Failed to approve production");
    } finally { setSaving(false); }
  };


  const completedCount = history.filter((h) => h.status === "COMPLETED").length;
  const totalProduced  = history.filter((h) => h.status === "COMPLETED").reduce((s, h) => s + (h.quantity ?? 0), 0);

  interface IngredientPreview { id: string; name: string; unit: string; needed: string; available: number | string; sufficient: boolean; }
  const ingredientPreview: IngredientPreview[] = selectedRecipe?.recipeItems?.map((item: any) => {
    // Match by SKU or Name in the selected franchise's inventory
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
      {/* Strategic Header */}
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
            <Play size={14} className="md:w-4 md:h-4" fill="currentColor" /> Start Engine Batch
          </button>
        </div>
      </header>

      {/* Real-time Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-5">
        {[
          { label: "Active Cycles", value: history.filter(h => h.status === 'IN_PROGRESS').length, icon: Clock, color: "text-blue-500", bg: "bg-blue-500/10" },
          { label: "Completed Batches", value: completedCount, icon: CheckCircle2, color: "text-emerald-500", bg: "bg-emerald-500/10" },
          { label: "Units Synthesized", value: totalProduced.toFixed(0), icon: Package, color: "text-[#F97316]", bg: "bg-orange-500/10" },
        ].map((stat, i) => (
          <div key={i} className="bg-white dark:bg-card/40 backdrop-blur-sm p-4 md:p-6 rounded-[24px] md:rounded-[32px] border border-slate-100 dark:border-white/5 shadow-lg shadow-black/[0.01]">
            <div className="flex items-center justify-between mb-3 md:mb-4">
               <div className={clsx("p-2.5 md:p-3 rounded-lg md:rounded-xl", stat.bg, stat.color)}>
                  <stat.icon size={18} className="md:w-5 md:h-5" />
               </div>
               <span className="text-[7px] md:text-[9px] font-black text-slate-300 tracking-[0.3em] uppercase">Metric</span>
            </div>
            <p className="text-[8px] md:text-[9px] font-black text-slate-400 uppercase tracking-widest mb-0.5">{stat.label}</p>
            <h3 className="text-2xl md:text-3xl font-black text-slate-900 dark:text-white tracking-tighter tabular-nums">{stat.value}</h3>
          </div>
        ))}
      </div>

      {/* Production Ledger */}
      <div className="space-y-3 md:space-y-4">
        <h2 className="text-[8px] md:text-[9px] font-black text-slate-400 uppercase tracking-[0.4em] flex items-center gap-3 ml-2">
           <History size={12} /> History Ledger
        </h2>

        {loading ? (
          <div className="py-16 text-center flex flex-col items-center gap-3">
             <div className="w-8 h-8 border-3 border-[#F97316] border-t-transparent rounded-full animate-spin" />
             <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Hydrating History...</p>
          </div>
        ) : history.length === 0 ? (
          <div className="py-16 bg-slate-50 dark:bg-white/[0.02] rounded-[24px] md:rounded-[32px] border-2 border-dashed border-slate-200 dark:border-white/5 text-center px-6 md:px-8">
             <div className="w-12 h-12 md:w-16 md:h-16 bg-white dark:bg-card rounded-xl md:rounded-2xl mx-auto flex items-center justify-center shadow-lg mb-4 text-slate-200 dark:text-white/10">
                <Factory size={28} className="md:w-8 md:h-8" />
             </div>
             <p className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-tight">System Ready</p>
             <p className="text-[10px] text-slate-500 mt-1">Initialize your first batch to begin tracking yield.</p>
          </div>
        ) : (
          <div className="grid gap-3 md:gap-5">
            {history.map((batch) => (
              <div key={batch.id} className="group bg-white dark:bg-card/40 backdrop-blur-md rounded-[24px] md:rounded-[32px] border border-slate-100 dark:border-white/5 p-4 md:p-5 hover:shadow-2xl transition-all relative overflow-hidden">
                {/* Status-aware Corner Accent */}
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
                         <p className="text-[10px] md:text-xs text-slate-500 dark:text-slate-400 mt-0.5 font-medium italic truncate">
                            Synthesized {(batch.quantity * (batch.recipe?.yieldQty || 1)).toFixed(1)} units of <span className="text-[#F97316] dark:text-orange-400 font-bold">{batch.recipe?.product?.name || "Uncategorized"}</span>
                         </p>
                         <div className="flex items-center gap-2.5 md:gap-4 mt-2 flex-wrap">
                            <span className="text-[8px] md:text-[9px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1">
                               <Package size={9} className="text-slate-300 md:w-2.5 md:h-2.5" /> {batch.quantity} Batch(es)
                            </span>
                             <span className="text-[8px] md:text-[9px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1">
                               <Clock size={9} className="text-slate-300 md:w-2.5 md:h-2.5" /> Start: {batch.startTime ? new Date(batch.startTime).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }) : "N/A"}
                             </span>
                             {batch.endTime && (
                               <span className="text-[8px] md:text-[9px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1">
                                 <Clock size={9} className="text-slate-300 md:w-2.5 md:h-2.5" /> End: {new Date(batch.endTime).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                               </span>
                             )}
                            {batch.customer && (
                              <span className="text-[8px] md:text-[9px] font-black text-indigo-500 bg-indigo-500/10 px-2 py-0.5 rounded-full uppercase tracking-widest flex items-center gap-1">
                                Customer: {batch.customer.name}
                              </span>
                            )}
                             {(() => {
                               const actualExpiry = batch.expiryDate || (batch.batches && batch.batches.length > 0 ? batch.batches[0].expiryDate : null);
                               if (!actualExpiry) return null;
                               const expiryDateObj = new Date(actualExpiry);
                               const isExpired = expiryDateObj < new Date();
                               const isExpiringSoon = (expiryDateObj.getTime() - Date.now()) < 3 * 86400000;

                               return (
                                 <span className={clsx(
                                   "flex items-center gap-1.5 text-[8px] font-black px-2 py-1 rounded-lg uppercase tracking-wider border backdrop-blur-md",
                                   isExpired ? "bg-rose-500/10 text-rose-600 border-rose-500/20 dark:text-rose-400" 
                                             : isExpiringSoon ? "bg-amber-500/10 text-amber-700 border-amber-500/20 dark:text-amber-400" 
                                                              : "bg-emerald-500/10 text-emerald-700 border-emerald-500/20 dark:text-emerald-400"
                                 )}>
                                   <span className={clsx("w-1 h-1 rounded-full animate-pulse", 
                                     isExpired ? "bg-rose-500" : isExpiringSoon ? "bg-amber-500" : "bg-emerald-500"
                                   )} />
                                   {isExpired ? "Expired" : isExpiringSoon ? "Expiring Soon" : "Valid"}
                                   <span className="opacity-40">/</span>
                                   {expiryDateObj.toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}
                                 </span>
                               );
                             })()}
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
                         onClick={() => handleApprove(batch.id)}
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

      {/* High-Impact Production Modal */}
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
                           <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Customer Name *</label>
                           <select 
                             value={customerId} 
                             onChange={(e) => setCustomerId(e.target.value)}
                             className="w-full h-11 bg-slate-50 px-4 rounded-xl font-bold text-xs outline-none focus:ring-4 ring-orange-100 border border-slate-100 transition-all appearance-none cursor-pointer"
                           >
                              <option value="">Select recipient...</option>
                              {customers.map(c => <option key={c.id} value={c.id}>{c.name} ({c.phone || "No Phone"})</option>)}
                           </select>
                           
                           <div className="mt-4 pt-3 border-t border-slate-50">
                              <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Produce From (Source)</label>
                              <select 
                                value={franchiseId} 
                                onChange={(e) => setFranchiseId(e.target.value)}
                                className="w-full h-10 mt-1 bg-slate-50/50 px-3 rounded-lg font-bold text-[10px] outline-none border border-slate-100"
                              >
                                 <option value="">Select branch...</option>
                                 {franchises.map(f => <option key={f.id} value={f.id}>{f.name}</option>)}
                              </select>
                           </div>
                        </div>
                     )}
                  </div>

                 <div className="p-4 bg-orange-50 rounded-2xl border border-orange-100 space-y-4">
                    <div className="flex items-center justify-between">
                       <label className="text-[10px] font-black text-orange-600 uppercase tracking-widest">Production Quantity</label>
                       <span className="text-[8px] font-black text-white bg-orange-500 px-2 py-0.5 rounded-full uppercase">Multiplier: x{quantity}</span>
                    </div>
                    <div className="flex items-center gap-4">
                       <div className="relative flex-1">
                          <input
                             type="number"
                             min={1}
                             value={quantity}
                             onChange={(e) => setQuantity(Number(e.target.value))}
                             className="w-full bg-white border border-orange-200 px-4 py-3 rounded-xl font-black text-3xl outline-none focus:ring-4 ring-orange-500/10 transition-all text-orange-600"
                          />
                       </div>
                       <div className="text-right flex flex-col justify-center">
                          <p className="text-[9px] font-black uppercase text-slate-400">Net Output</p>
                          <p className="text-2xl font-black tracking-tighter text-slate-900">
                             {(quantity * (selectedRecipe?.yieldQty || 0)).toFixed(1)} 
                             <span className="text-[10px] ml-1 text-slate-400">UNITS</span>
                          </p>
                       </div>
                    </div>
                 </div>

                 <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Safe Expiry Date *</label>
                    <input
                      type="date"
                      value={expiryDate}
                      onChange={(e) => setExpiryDate(e.target.value)}
                      min={new Date().toISOString().split("T")[0]}
                      className="w-full h-11 bg-slate-50 px-4 rounded-xl font-bold text-xs outline-none focus:ring-4 ring-orange-100 border border-slate-100"
                    />
                 </div>

                 {/* Stock Verification Preview */}
                 {selectedRecipe && (
                   <div className="space-y-2">
                       <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest ml-1">Inventory Status</p>
                       <div className="space-y-1 max-h-32 overflow-y-auto pr-1">
                          {stockLoading ? (
                             <div className="py-4 text-center flex items-center justify-center gap-2">
                                <RefreshCw size={14} className="animate-spin text-slate-300" />
                                <span className="text-[9px] font-black text-slate-300 uppercase">Checking Stock...</span>
                             </div>
                          ) : !franchiseId ? (
                             <div className="p-4 bg-slate-50 border border-dashed border-slate-200 rounded-xl text-center">
                                <p className="text-[9px] font-black text-slate-400 uppercase italic">Select branch to verify stock</p>
                             </div>
                          ) : (
                             ingredientPreview.map((ing, i) => (
                                <div key={i} className={clsx("flex items-center justify-between p-2.5 rounded-xl border transition-all", 
                                  ing.sufficient ? "bg-emerald-50/30 border-emerald-100" : "bg-rose-50 border-rose-100")}>
                                   <div className="flex items-center gap-2.5">
                                      <div className={clsx("w-5 h-5 rounded-md flex items-center justify-center shrink-0", ing.sufficient ? "bg-emerald-100 text-emerald-600" : "bg-rose-100 text-rose-600")}>
                                         {ing.sufficient ? <CheckCircle2 size={10} /> : <AlertTriangle size={10} />}
                                      </div>
                                      <div className="min-w-0">
                                         <p className="text-[10px] font-black text-slate-800 uppercase tracking-tight truncate">{ing.name}</p>
                                         <p className="text-[8px] font-bold text-slate-400">Need {ing.needed} {ing.unit}</p>
                                      </div>
                                   </div>
                                   <div className="text-[10px] font-black text-slate-900">
                                      {ing.available}
                                   </div>
                                </div>
                             ))
                          )}
                       </div>
                   </div>
                 )}

                 {error && (
                    <div className="p-3 bg-rose-50 border border-rose-100 rounded-xl text-center">
                       <p className="text-[9px] font-black text-rose-600 uppercase tracking-widest">{error}</p>
                    </div>
                 )}

                 <div className="pt-2 flex gap-3">
                    <button onClick={() => setShowForm(false)} className="flex-1 py-3.5 bg-slate-100 rounded-xl font-black text-[10px] uppercase tracking-widest text-slate-400 hover:bg-slate-200 transition-all">Cancel</button>
                    <button 
                      onClick={handleStart} 
                      disabled={saving || !recipeId || !franchiseId || !expiryDate || ingredientPreview.some(i => !i.sufficient)} 
                      className="flex-[2] py-3.5 bg-slate-900 text-white rounded-xl font-black text-[10px] uppercase tracking-[0.2em] shadow-lg hover:shadow-xl transition-all disabled:opacity-30 disabled:grayscale"
                    >
                       {saving ? "Processing..." : "Start Production"}
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
