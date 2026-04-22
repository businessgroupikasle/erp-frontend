"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Factory, X, ChevronDown, CheckCircle2,
  Clock, Package, RefreshCw, Play, Layers,
  AlertTriangle, ChefHat,
} from "lucide-react";
import { clsx } from "clsx";
import { productionApi, recipesApi, franchiseApi } from "@/lib/api";

const STATUS_STYLES: Record<string, string> = {
  COMPLETED:   "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400",
  IN_PROGRESS: "bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400",
  PENDING:     "bg-amber-100 text-amber-700 dark:bg-amber-900/20 dark:text-amber-400",
  CANCELLED:   "bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-400",
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
  const [recipeId, setRecipeId]       = useState("");
  const [franchiseId, setFranchiseId] = useState("");
  const [quantity, setQuantity]       = useState(1);
  const [productionType, setProductionType] = useState("FINISHED_GOOD");

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
      await productionApi.startBatch({ recipeId, franchiseId, quantity, productionType });
      setShowForm(false);
      setRecipeId(""); setFranchiseId(""); setQuantity(1);
      fetchAll();
    } catch (e: any) {
      setError(e?.response?.data?.error ?? "Failed to start production. Check stock levels.");
    } finally { setSaving(false); }
  };

  // Compute totals from history
  const completedCount = history.filter((h) => h.status === "COMPLETED").length;
  const totalProduced  = history.filter((h) => h.status === "COMPLETED").reduce((s, h) => s + (h.quantity ?? 0), 0);

  interface IngredientPreview { name: string; unit: string; needed: string; available: number | string; sufficient: boolean; }
  // Ingredient preview for selected recipe & quantity
  const ingredientPreview: IngredientPreview[] = selectedRecipe?.recipeItems?.map((item: any) => ({
    name: item.inventoryItem?.name ?? item.inventoryItemId,
    unit: item.unit,
    needed: ((item.quantityRequired ?? 0) * quantity).toFixed(3),
    available: item.inventoryItem?.currentStock ?? "?",
    sufficient: (item.inventoryItem?.currentStock ?? 0) >= (item.quantityRequired ?? 0) * quantity,
  })) ?? [];

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-gray-900 dark:text-white flex items-center gap-2">
            <Factory size={22} className="text-orange-500" /> Production
          </h1>
          <p className="text-sm text-gray-500 dark:text-slate-400 mt-1">
            Execute recipes to convert raw materials into finished products
          </p>
        </div>
        <div className="flex gap-2">
          <button onClick={fetchAll} className="p-2 rounded-xl border border-gray-200 dark:border-white/10 hover:bg-gray-50 dark:hover:bg-white/5 transition-all">
            <RefreshCw size={16} className="text-gray-400" />
          </button>
          <button
            onClick={() => { setShowForm(true); setError(""); }}
            className="flex items-center gap-2 bg-orange-500 hover:bg-orange-400 text-white px-4 py-2 rounded-xl text-sm font-bold transition-all"
          >
            <Play size={16} /> Start Production
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: "Total Batches",    value: history.length,    icon: Factory,      color: "text-indigo-500",  bg: "bg-indigo-50 dark:bg-indigo-500/10" },
          { label: "Completed",        value: completedCount,    icon: CheckCircle2, color: "text-emerald-500", bg: "bg-emerald-50 dark:bg-emerald-500/10" },
          { label: "Total Produced",   value: `${totalProduced} units`, icon: Package, color: "text-amber-500", bg: "bg-amber-50 dark:bg-amber-500/10" },
        ].map((stat) => (
          <div key={stat.label} className="bg-white dark:bg-card rounded-2xl border border-gray-100 dark:border-white/5 p-4 flex items-center gap-3">
            <div className={clsx("w-10 h-10 rounded-xl flex items-center justify-center shrink-0", stat.bg)}>
              <stat.icon size={18} className={stat.color} />
            </div>
            <div>
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{stat.label}</p>
              <p className="text-xl font-black text-gray-900 dark:text-white">{stat.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Production History */}
      <div>
        <h2 className="text-sm font-black text-gray-900 dark:text-white uppercase tracking-widest mb-3 flex items-center gap-2">
          <Clock size={14} className="text-gray-400" /> Production History
        </h2>

        {loading ? (
          <div className="py-16 text-center text-gray-400 text-sm">Loading history...</div>
        ) : history.length === 0 ? (
          <div className="py-16 text-center text-gray-300 dark:text-slate-600 space-y-2">
            <Factory size={48} strokeWidth={1} className="mx-auto" />
            <p className="text-sm font-semibold">No production batches yet</p>
          </div>
        ) : (
          <div className="space-y-3">
            {history.map((batch) => (
              <div key={batch.id} className="bg-white dark:bg-card rounded-2xl border border-gray-100 dark:border-white/5 p-5">
                <div className="flex items-start justify-between gap-4 flex-wrap">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-orange-50 dark:bg-orange-900/20 flex items-center justify-center shrink-0">
                      <ChefHat size={18} className="text-orange-500" />
                    </div>
                    <div>
                      <p className="font-bold text-gray-900 dark:text-white text-sm">
                        {batch.recipe?.name ?? "Unknown Recipe"}
                      </p>
                      <p className="text-[11px] text-gray-400 mt-0.5">
                        Product: {batch.recipe?.product?.name ?? "—"} · Franchise: {batch.franchise?.name ?? "—"}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <div className="text-right">
                      <p className="text-[10px] text-gray-400 uppercase font-bold">Produced</p>
                      <p className="text-sm font-black text-gray-900 dark:text-white">{batch.quantity} units</p>
                    </div>
                    <span className={clsx("px-3 py-1 rounded-xl text-[10px] font-black uppercase tracking-wider", STATUS_STYLES[batch.status] ?? STATUS_STYLES.PENDING)}>
                      {batch.status}
                    </span>
                  </div>
                </div>

                {/* Raw materials used */}
                {batch.items?.length > 0 && (
                  <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {batch.items.map((item: any, i: number) => (
                      <div key={i} className="flex items-center gap-2 text-[11px] bg-gray-50 dark:bg-white/5 rounded-lg px-3 py-1.5">
                        <Package size={10} className="text-gray-400 shrink-0" />
                        <span className="text-gray-600 dark:text-slate-400 truncate">{item.inventoryItem?.name ?? "—"}</span>
                        <span className="font-bold text-gray-900 dark:text-white ml-auto shrink-0">−{item.usedQuantity}</span>
                      </div>
                    ))}
                  </div>
                )}

                <p className="text-[10px] text-gray-400 mt-3">
                  {new Date(batch.producedAt).toLocaleString("en-IN")}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Start Production Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-[#12141c] rounded-3xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-100 dark:border-white/5 flex items-center justify-between">
              <h2 className="text-lg font-black text-gray-900 dark:text-white">Start Production Batch</h2>
              <button onClick={() => setShowForm(false)} className="p-1.5 hover:bg-gray-100 dark:hover:bg-white/10 rounded-lg">
                <X size={18} className="text-gray-500" />
              </button>
            </div>
            <div className="p-6 space-y-5">

              {/* Recipe */}
              <div>
                <label className="block text-xs font-bold text-gray-600 dark:text-slate-400 mb-1.5">Recipe *</label>
                <div className="relative">
                  <select value={recipeId} onChange={(e) => setRecipeId(e.target.value)}
                    className="w-full appearance-none bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl px-4 py-2.5 pr-9 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/20">
                    <option value="">Select recipe...</option>
                    {recipes.map((r: any) => (
                      <option key={r.id} value={r.id}>{r.name} → {r.product?.name}</option>
                    ))}
                  </select>
                  <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                </div>
              </div>

              {/* Franchise */}
              <div>
                <label className="block text-xs font-bold text-gray-600 dark:text-slate-400 mb-1.5">Production Franchise *</label>
                <div className="relative">
                  <select value={franchiseId} onChange={(e) => setFranchiseId(e.target.value)}
                    className="w-full appearance-none bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl px-4 py-2.5 pr-9 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/20">
                    <option value="">Select franchise / home house...</option>
                    {franchises.map((f: any) => (
                      <option key={f.id} value={f.id}>{f.name}</option>
                    ))}
                  </select>
                  <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                </div>
              </div>

              {/* Quantity & Type */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-600 dark:text-slate-400 mb-1.5">Batches to Produce *</label>
                  <input type="number" min={1} step={1} value={quantity}
                    onChange={(e) => setQuantity(Number(e.target.value))}
                    className="w-full px-3 py-2.5 text-sm bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500/20" />
                  {selectedRecipe && (
                    <p className="text-[10px] text-gray-400 mt-1">Yields {(selectedRecipe.yieldQty ?? 1) * quantity} units</p>
                  )}
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-600 dark:text-slate-400 mb-1.5">Production Type</label>
                  <select value={productionType} onChange={(e) => setProductionType(e.target.value)}
                    className="w-full appearance-none bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl px-3 py-2.5 text-sm focus:outline-none">
                    <option value="FINISHED_GOOD">Finished Good</option>
                    <option value="SEMI_FINISHED">Semi-Finished</option>
                  </select>
                </div>
              </div>

              {/* Ingredient Stock Check */}
              {selectedRecipe && ingredientPreview.length > 0 && (
                <div>
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 flex items-center gap-1">
                    <Layers size={10} /> Raw Materials Required
                  </p>
                  <div className="space-y-1.5 rounded-2xl overflow-hidden border border-gray-100 dark:border-white/5">
                    {ingredientPreview.map((ing: IngredientPreview, i: number) => (
                      <div key={i} className={clsx(
                        "flex items-center justify-between px-4 py-2.5 text-[12px]",
                        ing.sufficient ? "bg-gray-50 dark:bg-white/[0.03]" : "bg-red-50 dark:bg-red-900/10"
                      )}>
                        <div className="flex items-center gap-2">
                          {ing.sufficient
                            ? <CheckCircle2 size={11} className="text-emerald-500 shrink-0" />
                            : <AlertTriangle size={11} className="text-red-500 shrink-0" />}
                          <span className={clsx("font-medium", ing.sufficient ? "text-gray-700 dark:text-slate-300" : "text-red-600 dark:text-red-400")}>
                            {ing.name}
                          </span>
                        </div>
                        <div className="text-right">
                          <span className="font-bold text-gray-900 dark:text-white">Need: {ing.needed} {ing.unit}</span>
                          <span className="text-gray-400 ml-2">/ Have: {ing.available}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                  {ingredientPreview.some((i: IngredientPreview) => !i.sufficient) && (
                    <p className="mt-2 text-[11px] text-red-500 font-bold flex items-center gap-1">
                      <AlertTriangle size={11} /> Insufficient stock — purchase more materials first
                    </p>
                  )}
                </div>
              )}

              {error && (
                <div className="bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-800/30 rounded-xl p-3 text-[12px] text-red-600 dark:text-red-400 font-medium">
                  {error}
                </div>
              )}
            </div>

            <div className="p-6 pt-0 flex gap-3 justify-end">
              <button onClick={() => setShowForm(false)} className="px-5 py-2.5 rounded-xl border border-gray-200 dark:border-white/10 text-sm font-bold text-gray-600 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-white/5 transition-all">Cancel</button>
              <button onClick={handleStart} disabled={saving || !recipeId || !franchiseId}
                className="px-6 py-2.5 bg-orange-500 hover:bg-orange-400 disabled:opacity-50 text-white rounded-xl text-sm font-bold transition-all flex items-center gap-2">
                <Play size={14} />
                {saving ? "Starting..." : "Start Production"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
