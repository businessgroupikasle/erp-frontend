"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Factory, X, ChevronDown, CheckCircle2,
  Clock, Package, RefreshCw, Play, Layers,
  AlertTriangle, ChefHat, History, Minus,
  ArrowRight
} from "lucide-react";
import { clsx } from "clsx";
import { productionApi, recipesApi, franchiseApi } from "@/lib/api";

const STATUS_STYLES: Record<string, string> = {
  COMPLETED:   "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
  IN_PROGRESS: "bg-blue-500/10 text-blue-500 border-blue-500/20",
  PENDING:     "bg-amber-500/10 text-amber-500 border-amber-500/20",
  CANCELLED:   "bg-red-500/10 text-red-500 border-red-500/20",
};

export default function ProductionPage() {
  const [history, setHistory]     = useState<any[]>([]);
  const [recipes, setRecipes]     = useState<any[]>([]);
  const [franchises, setFranchises] = useState<any[]>([]);
  const [loading, setLoading]     = useState(true);
  const [showForm, setShowForm]   = useState(false);
  const [saving, setSaving]       = useState(false);
  const [error, setError]         = useState("");

  // Form
  const [recipeId, setRecipeId]             = useState("");
  const [franchiseId, setFranchiseId]       = useState("");
  const [quantity, setQuantity]             = useState(1);
  const [productionType, setProductionType] = useState("FINISHED_GOOD");
  const [expiryDate, setExpiryDate]         = useState("");

  const selectedRecipe = recipes.find((r: any) => r.id === recipeId);

  const fetchAll = useCallback(async () => {
    setLoading(true);
    try {
      const [hRes, rRes, fRes] = await Promise.all([
        productionApi.getHistory(),
        recipesApi.getAll(),
        franchiseApi.getAll(),
      ]);
      setHistory(hRes.data ?? []);
      setRecipes(rRes.data ?? []);
      setFranchises(fRes.data ?? []);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const handleStart = async () => {
    if (!recipeId || !franchiseId || quantity <= 0) {
      setError("Please fill all required fields.");
      return;
    }
    setSaving(true);
    setError("");
    try {
      await productionApi.startBatch({ recipeId, franchiseId, quantity, productionType, expiryDate: expiryDate || undefined });
      setShowForm(false);
      setRecipeId(""); setFranchiseId(""); setQuantity(1); setExpiryDate("");
      fetchAll();
    } catch (e: any) {
      setError(e?.response?.data?.error ?? "Failed to start production. Check stock levels.");
    } finally { setSaving(false); }
  };

  const completedCount = history.filter((h) => h.status === "COMPLETED").length;
  const totalProduced  = history.filter((h) => h.status === "COMPLETED").reduce((s, h) => s + (h.quantity ?? 0), 0);

  interface IngredientPreview { name: string; unit: string; needed: string; available: number | string; sufficient: boolean; }
  const ingredientPreview: IngredientPreview[] = selectedRecipe?.recipeItems?.map((item: any) => ({
    name: item.inventoryItem?.name ?? item.inventoryItemId,
    unit: item.unit,
    needed: ((item.quantityRequired ?? 0) * quantity).toFixed(3),
    available: item.inventoryItem?.currentStock ?? "?",
    sufficient: (item.inventoryItem?.currentStock ?? 0) >= (item.quantityRequired ?? 0) * quantity,
  })) ?? [];

  return (
    <div className="max-w-7xl mx-auto space-y-10 animate-in fade-in duration-700">
      {/* Strategic Header */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 py-6 border-b border-slate-200 dark:border-slate-800">
        <div>
          <div className="flex items-center gap-3">
             <div className="p-3 bg-indigo-600 rounded-2xl shadow-xl shadow-indigo-600/20">
                <Factory size={24} className="text-white" />
             </div>
             <h1 className="text-4xl font-black tracking-tight text-slate-900 dark:text-white uppercase transition-all">
               Production <span className="text-slate-400 font-medium ml-1 tracking-tighter italic">Batch Control</span>
             </h1>
          </div>
          <p className="text-slate-500 dark:text-slate-400 mt-2 font-medium ml-14 uppercase tracking-widest text-[10px]">
            Executing sophisticated RECIPE-TO-STOCK transformation workflows
          </p>
        </div>
        <div className="flex items-center gap-3">
           <button onClick={fetchAll} className="p-4 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl hover:border-slate-300 transition-all shadow-sm group">
             <RefreshCw size={18} className={clsx("text-slate-400 group-hover:rotate-180 transition-transform duration-500", loading && "animate-spin")} />
           </button>
           <button
             onClick={() => setShowForm(true)}
             className="flex items-center gap-3 bg-indigo-600 text-white px-8 py-4 rounded-3xl font-black text-xs uppercase tracking-widest hover:shadow-2xl hover:translate-y-[-2px] transition-all active:translate-y-0"
           >
            <Play size={20} fill="currentColor" /> Start Batch
          </button>
        </div>
      </header>

      {/* Real-time Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          { label: "Active Cycles", value: history.filter(h => h.status === 'IN_PROGRESS').length, icon: Clock, color: "text-blue-500", bg: "bg-blue-500/10" },
          { label: "Completed Batches", value: completedCount, icon: CheckCircle2, color: "text-emerald-500", bg: "bg-emerald-500/10" },
          { label: "Units Synthesized", value: totalProduced.toFixed(0), icon: Package, color: "text-indigo-500", bg: "bg-indigo-500/10" },
        ].map((stat, i) => (
          <div key={i} className="bg-white dark:bg-card/40 backdrop-blur-sm p-8 rounded-[40px] border border-slate-100 dark:border-white/5 shadow-xl shadow-black/[0.01]">
            <div className="flex items-center justify-between mb-6">
               <div className={clsx("p-4 rounded-2xl", stat.bg, stat.color)}>
                  <stat.icon size={24} />
               </div>
               <span className="text-[10px] font-black text-slate-300 tracking-[0.3em] uppercase">Metric</span>
            </div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{stat.label}</p>
            <h3 className="text-4xl font-black text-slate-900 dark:text-white tracking-tighter tabular-nums">{stat.value}</h3>
          </div>
        ))}
      </div>

      {/* Production Ledger */}
      <div className="space-y-6">
        <h2 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em] flex items-center gap-3 ml-2">
           <History size={14} /> Synthetic History Ledger
        </h2>

        {loading ? (
          <div className="py-20 text-center flex flex-col items-center gap-4">
             <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
             <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Hydrating History...</p>
          </div>
        ) : history.length === 0 ? (
          <div className="py-20 bg-slate-50 dark:bg-white/[0.02] rounded-[48px] border-2 border-dashed border-slate-200 dark:border-white/5 text-center px-10">
             <div className="w-20 h-20 bg-white dark:bg-card rounded-3xl mx-auto flex items-center justify-center shadow-xl mb-6 text-slate-200 dark:text-white/10">
                <Factory size={40} />
             </div>
             <p className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-tight">System Ready for Production</p>
             <p className="text-xs text-slate-500 mt-2">Initialize your first recipe-to-stock batch to begin tracking yield.</p>
          </div>
        ) : (
          <div className="grid gap-6">
            {history.map((batch) => (
              <div key={batch.id} className="group bg-white dark:bg-card/40 backdrop-blur-md rounded-[40px] border border-slate-100 dark:border-white/5 p-8 hover:shadow-2xl hover:shadow-indigo-500/5 transition-all">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                   <div className="flex items-center gap-6">
                      <div className="w-20 h-20 rounded-[28px] bg-indigo-500 dark:bg-indigo-600 flex items-center justify-center text-white shadow-xl shadow-indigo-500/20">
                         <ChefHat size={32} />
                      </div>
                      <div>
                         <div className="flex items-center gap-3">
                            <h3 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight">
                               {batch.recipe?.name || "Standard Production"}
                            </h3>
                            <span className={clsx("px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-[0.2em] border", STATUS_STYLES[batch.status])}>
                               {batch.status}
                            </span>
                         </div>
                         <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 font-medium italic">
                            Synthesized {(batch.quantity * (batch.recipe?.yieldQty || 1)).toFixed(1)} units of <span className="text-indigo-600 dark:text-indigo-400 font-bold">{batch.recipe?.product?.name || "Uncategorized"}</span>
                         </p>
                         <div className="flex items-center gap-4 mt-3 flex-wrap">
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                               <Package size={12} className="text-slate-300" /> {batch.quantity} Batch(es)
                            </span>
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                               <Clock size={12} className="text-slate-300" /> {new Date(batch.producedAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
                            </span>
                            {batch.batches?.map((b: any) => b.expiryDate && (
                              <span key={b.id} className={clsx(
                                "text-[9px] font-black px-2 py-1 rounded-lg uppercase tracking-wider",
                                new Date(b.expiryDate) < new Date() ? "bg-red-100 text-red-600 dark:bg-red-900/20 dark:text-red-400" :
                                (new Date(b.expiryDate).getTime() - Date.now()) < 3 * 86400000 ? "bg-amber-100 text-amber-700 dark:bg-amber-900/20 dark:text-amber-400" :
                                "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400"
                              )}>
                                {new Date(b.expiryDate) < new Date() ? "Expired" :
                                 (new Date(b.expiryDate).getTime() - Date.now()) < 3 * 86400000 ? "Expiring Soon" : "Valid"}
                                {" · "}{new Date(b.expiryDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: '2-digit' })}
                              </span>
                            ))}
                         </div>
                      </div>
                   </div>

                   <button className="px-6 py-4 bg-slate-50 dark:bg-white/5 rounded-2xl border border-slate-100 dark:border-white/10 text-[10px] font-black uppercase tracking-widest text-slate-500 hover:text-indigo-600 transition-all flex items-center gap-3">
                      View Ledger Entry <ArrowRight size={14} />
                   </button>
                </div>

                {/* Integrated Material Breakdown */}
                <div className="mt-8 pt-8 border-t border-slate-100 dark:border-white/5 grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                   {batch.items?.map((item: any, i: number) => (
                      <div key={i} className="p-4 bg-slate-50/50 dark:bg-white/[0.01] rounded-2xl border border-slate-100 dark:border-white/5 group/ing">
                         <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 truncate">{item.inventoryItem?.name || "Ingredient"}</p>
                         <p className="text-lg font-black text-red-500 tracking-tighter">-{item.usedQuantity.toFixed(2)}</p>
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
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 animate-in zoom-in duration-500">
          <div className="absolute inset-0 bg-slate-900/40 dark:bg-black/80 backdrop-blur-xl" onClick={() => setShowForm(false)} />
          <div className="relative bg-white dark:bg-card rounded-[48px] shadow-2xl w-full max-w-2xl border border-white/20 dark:border-white/5 p-12 overflow-hidden max-h-[90vh] overflow-y-auto">
             <div className="flex items-center gap-6 mb-12">
                <div className="w-20 h-20 rounded-[32px] bg-indigo-600 flex items-center justify-center text-white shadow-2xl shadow-indigo-600/30">
                   <Play size={40} fill="currentColor" />
                </div>
                <div>
                   <h2 className="text-4xl font-black text-slate-900 dark:text-white tracking-tighter uppercase">Initialize Cycle</h2>
                   <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mt-1">Executing Recipe Blueprint</p>
                </div>
             </div>

             <div className="space-y-10">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                   <div className="space-y-3">
                      <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">Select Active Recipe *</label>
                      <select 
                        value={recipeId} 
                        onChange={(e) => setRecipeId(e.target.value)}
                        className="w-full h-16 bg-slate-50 dark:bg-white/5 px-6 rounded-3xl font-black text-sm outline-none focus:ring-4 ring-indigo-500/10 appearance-none dark:text-white cursor-pointer"
                      >
                         <option value="">Choose Blueprint...</option>
                         {recipes.map(r => <option key={r.id} value={r.id}>{r.name} (Yield: {r.yieldQty})</option>)}
                      </select>
                   </div>
                   <div className="space-y-3">
                      <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">Allocation Franchise *</label>
                      <select 
                        value={franchiseId} 
                        onChange={(e) => setFranchiseId(e.target.value)}
                        className="w-full h-16 bg-slate-50 dark:bg-white/5 px-6 rounded-3xl font-black text-sm outline-none focus:ring-4 ring-indigo-500/10 appearance-none dark:text-white cursor-pointer"
                      >
                         <option value="">Target Destination...</option>
                         {franchises.map(f => <option key={f.id} value={f.id}>{f.name}</option>)}
                      </select>
                   </div>
                </div>

                <div className="p-8 bg-slate-900 dark:bg-white rounded-[40px] text-white dark:text-slate-900 shadow-2xl">
                   <label className="text-[11px] font-black text-slate-400/80 dark:text-slate-500 uppercase tracking-widest block mb-4">Target Batch Magnitude</label>
                   <div className="flex items-center gap-6">
                      <input
                         type="number"
                         min={1}
                         value={quantity}
                         onChange={(e) => setQuantity(Number(e.target.value))}
                         className="flex-1 bg-white/10 dark:bg-slate-100 px-8 py-5 rounded-3xl font-black text-4xl outline-none"
                      />
                      <div className="text-right">
                         <p className="text-[10px] font-black uppercase tracking-widest opacity-60">Cumulative Yield</p>
                         <p className="text-2xl font-black tracking-tighter">{(quantity * (selectedRecipe?.yieldQty || 0)).toFixed(1)} Units</p>
                      </div>
                   </div>
                </div>

                <div className="space-y-3">
                   <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">Batch Expiry Date <span className="text-slate-300">(Optional)</span></label>
                   <input
                     type="date"
                     value={expiryDate}
                     onChange={(e) => setExpiryDate(e.target.value)}
                     min={new Date().toISOString().split("T")[0]}
                     className="w-full h-14 bg-slate-50 dark:bg-white/5 px-6 rounded-3xl font-bold text-sm outline-none focus:ring-4 ring-indigo-500/10 dark:text-white"
                   />
                   <p className="text-[10px] font-bold text-slate-400 ml-2 uppercase tracking-widest">
                     Leave blank for no-expiry items (e.g. dry goods)
                   </p>
                </div>

                {/* Raw Material Verification Ledger */}
                {selectedRecipe && (
                  <div className="space-y-4">
                     <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">Pre-Cycle Stock Verification</p>
                     <div className="space-y-2">
                        {ingredientPreview.map((ing, i) => (
                           <div key={i} className={clsx("flex items-center justify-between p-5 rounded-3xl border transition-all", 
                             ing.sufficient ? "bg-slate-50/50 dark:bg-white/[0.02] border-slate-100 dark:border-white/5" : "bg-red-500/5 border-red-500/20")}>
                              <div className="flex items-center gap-4">
                                 <div className={clsx("w-8 h-8 rounded-xl flex items-center justify-center", ing.sufficient ? "bg-emerald-500/10 text-emerald-500" : "bg-red-500/10 text-red-500")}>
                                    {ing.sufficient ? <CheckCircle2 size={16} /> : <AlertTriangle size={16} />}
                                 </div>
                                 <div>
                                    <p className="text-xs font-black text-slate-800 dark:text-white uppercase tracking-tight">{ing.name}</p>
                                    <p className="text-[10px] text-slate-400 font-bold tracking-widest uppercase">Required: {ing.needed} {ing.unit}</p>
                                 </div>
                              </div>
                              <div className="text-right">
                                 <p className={clsx("text-xs font-black", ing.sufficient ? "text-slate-900 dark:text-white" : "text-red-500 tracking-widest flex items-center gap-2 uppercase")}>
                                    {!ing.sufficient && <Minus size={10} />} {ing.available} <span className="text-[9px] text-slate-400 font-bold">ON HAND</span>
                                 </p>
                              </div>
                           </div>
                        ))}
                     </div>
                  </div>
                )}

                {error && (
                   <div className="p-6 bg-red-500/10 border border-red-500/20 rounded-3xl animate-shake">
                      <p className="text-xs font-black text-red-500 uppercase tracking-widest text-center">{error}</p>
                   </div>
                )}

                <div className="pt-6 flex gap-6">
                   <button onClick={() => setShowForm(false)} className="flex-1 py-8 bg-slate-50 dark:bg-white/5 rounded-[32px] font-black text-[11px] uppercase tracking-widest text-slate-400 hover:bg-slate-100 transition-all">Abort</button>
                   <button 
                     onClick={handleStart} 
                     disabled={saving || !recipeId || !franchiseId || ingredientPreview.some(i => !i.sufficient)} 
                     className="flex-[2] py-8 bg-indigo-600 text-white rounded-[32px] font-black text-[11px] uppercase tracking-[0.3em] shadow-2xl hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50"
                   >
                      {saving ? "Synthesizing Ledger..." : "Authorize Production Cycle"}
                   </button>
                </div>
             </div>
          </div>
        </div>
      )}
    </div>
  );
}
