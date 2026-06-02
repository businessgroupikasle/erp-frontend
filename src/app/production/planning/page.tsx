"use client";

import { useState, useEffect } from "react";
import { 
  Calendar, Plus, Trash2, CheckCircle, AlertTriangle, 
  RefreshCw, ChefHat, Play, ShoppingCart, Info, Sparkles 
} from "lucide-react";
import { recipesApi, franchiseApi, inventoryApi, productionApi } from "@/lib/api";
import { toast } from "react-hot-toast";

interface PlannedItem {
  id: string; // Unique temporary run id
  recipeId: string;
  recipeName: string;
  quantity: number; // Multiplier/runs
  yieldQty: number;
  recipeItems: any[];
}

export default function ProductionPlanningPage() {
  const [recipes, setRecipes] = useState<any[]>([]);
  const [franchises, setFranchises] = useState<any[]>([]);
  const [selectedFranchiseId, setSelectedFranchiseId] = useState<string>("");
  const [plannedQueue, setPlannedQueue] = useState<PlannedItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [stockLoading, setStockLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [franchiseInventory, setFranchiseInventory] = useState<any[]>([]);

  // Selected recipe to add
  const [activeRecipeId, setActiveRecipeId] = useState<string>("");
  const [activeQty, setActiveQty] = useState<number>(1);

  useEffect(() => {
    async function loadData() {
      try {
        const [rRes, fRes] = await Promise.all([
          recipesApi.getAll(),
          franchiseApi.getAll()
        ]);
        setRecipes(rRes.data || []);
        setFranchises(fRes.data || []);
        if (rRes.data?.length > 0) {
          setActiveRecipeId(rRes.data[0].id);
        }
        if (fRes.data?.length > 0) {
          setSelectedFranchiseId(fRes.data[0].id);
        }
      } catch (err) {
        toast.error("Failed to load recipes and franchises");
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  useEffect(() => {
    if (!selectedFranchiseId) return;
    async function loadStock() {
      setStockLoading(true);
      try {
        const res = await inventoryApi.getInventory(selectedFranchiseId);
        setFranchiseInventory(res.data || []);
      } catch (err) {
        console.error("Stock load error:", err);
      } finally {
        setStockLoading(false);
      }
    }
    loadStock();
  }, [selectedFranchiseId]);

  const addToQueue = () => {
    if (!activeRecipeId) return;
    const foundRecipe = recipes.find((r) => r.id === activeRecipeId);
    if (!foundRecipe) return;

    // Check if recipe is already in the queue, if so increment
    const exists = plannedQueue.find((item) => item.recipeId === activeRecipeId);
    if (exists) {
      setPlannedQueue(
        plannedQueue.map((item) => 
          item.recipeId === activeRecipeId 
            ? { ...item, quantity: item.quantity + activeQty }
            : item
        )
      );
    } else {
      setPlannedQueue([
        ...plannedQueue,
        {
          id: Math.random().toString(),
          recipeId: foundRecipe.id,
          recipeName: foundRecipe.name,
          quantity: activeQty,
          yieldQty: foundRecipe.yieldQty,
          recipeItems: foundRecipe.recipeItems || []
        }
      ]);
    }
    toast.success(`${foundRecipe.name} added to schedule`);
  };

  const removeFromQueue = (id: string) => {
    setPlannedQueue(plannedQueue.filter((item) => item.id !== id));
  };

  // Aggregate raw material requirements
  const getAggregatedMaterials = () => {
    const rawMap: Record<string, { 
      name: string; 
      sku: string; 
      required: number; 
      unit: string; 
    }> = {};

    plannedQueue.forEach((item) => {
      item.recipeItems.forEach((ri) => {
        const requiredQty = ri.quantityRequired * item.quantity;
        const itemId = ri.inventoryItemId;
        const itemName = ri.inventoryItem?.name || "Unknown";
        const itemSku = ri.inventoryItem?.sku || "";

        if (rawMap[itemId]) {
          rawMap[itemId].required += requiredQty;
        } else {
          rawMap[itemId] = {
            name: itemName,
            sku: itemSku,
            required: requiredQty,
            unit: ri.unit
          };
        }
      });
    });

    return Object.entries(rawMap).map(([id, val]) => {
      // Find stock available
      const stockItem = franchiseInventory.find((fi) => {
        const matchSku = fi.sku && val.sku && fi.sku.trim().toLowerCase() === val.sku.trim().toLowerCase();
        const matchId = fi.id === id;
        return matchSku || matchId;
      });
      const available = stockItem ? stockItem.currentStock : 0;
      return {
        id,
        ...val,
        available,
        sufficient: available >= val.required
      };
    });
  };

  const aggregatedMaterials = getAggregatedMaterials();
  const allSufficient = aggregatedMaterials.every((m) => m.sufficient);

  const handleLaunchProduction = async () => {
    if (plannedQueue.length === 0) return;
    if (!selectedFranchiseId) {
      toast.error("Please select a target franchise");
      return;
    }

    setSubmitting(true);
    try {
      // Loop over queue and launch each
      for (const item of plannedQueue) {
        // Expiry is set to standard 7 days from now
        const expiryDate = new Date();
        expiryDate.setDate(expiryDate.getDate() + 7);

        await productionApi.startBatch({
          recipeId: item.recipeId,
          franchiseId: selectedFranchiseId,
          quantity: item.quantity,
          expiryDate: expiryDate.toISOString().split("T")[0]
        });
      }
      toast.success("All production schedules initialized!");
      setPlannedQueue([]);
      // Redirect to main production control ledger
      window.location.href = "/production";
    } catch (err: any) {
      toast.error(err?.response?.data?.error || "Failed to launch schedules. Verify ingredients stock.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FDFCFD] dark:bg-[#020617] flex flex-col items-center justify-center p-6">
        <div className="w-12 h-12 border-4 border-[#F97316] border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Planning Scheduler Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FDFCFD] dark:bg-[#020617] p-4 md:p-8 space-y-6 md:space-y-8 animate-in fade-in duration-500">
      {/* Header */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 py-4 border-b border-slate-200 dark:border-slate-800">
        <div>
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-[#F97316] rounded-xl shadow-lg shadow-orange-600/20 text-white">
              <Calendar size={22} />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-black uppercase tracking-tight text-slate-900 dark:text-white">
                Production <span className="text-[#F97316]">Planning</span>
              </h1>
              <p className="text-xs text-slate-500 mt-0.5 font-semibold tracking-wider uppercase">
                Schedule upcoming runs and audit raw material readiness
              </p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <select
            value={selectedFranchiseId}
            onChange={(e) => setSelectedFranchiseId(e.target.value)}
            className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white rounded-xl px-4 py-3 text-xs font-bold uppercase tracking-wider focus:outline-none"
          >
            {franchises.map((f) => (
              <option key={f.id} value={f.id}>
                {f.name}
              </option>
            ))}
          </select>
        </div>
      </header>

      {/* Select Recipe Scheduler */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
        
        {/* Run Schedule Planner Queue */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800/80 rounded-3xl p-6 space-y-5 shadow-sm">
            <h3 className="text-sm font-black uppercase tracking-widest text-slate-850 dark:text-slate-200 flex items-center gap-2">
              <Sparkles size={16} className="text-[#F97316]" />
              Schedule Run
            </h3>

            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Select Formula</label>
                <select
                  value={activeRecipeId}
                  onChange={(e) => setActiveRecipeId(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#F97316]/50"
                >
                  {recipes.map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Number of Runs / Batches</label>
                <input 
                  type="number"
                  min="1"
                  value={activeQty || ""}
                  onChange={(e) => setActiveQty(Math.max(1, Number(e.target.value)))}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white rounded-xl px-4 py-3 text-sm font-bold focus:outline-none"
                />
              </div>

              <button
                onClick={addToQueue}
                className="w-full py-3.5 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-xl font-black text-xs uppercase tracking-wider hover:bg-slate-800 transition-all flex items-center justify-center gap-2"
              >
                <Plus size={16} />
                Add to run Queue
              </button>
            </div>
          </div>

          {/* Planned Schedule list */}
          <div className="bg-white dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800/80 rounded-3xl p-6 space-y-4 shadow-sm">
            <h3 className="text-sm font-black uppercase tracking-widest text-slate-800 dark:text-slate-200">
              Planned Run Queue ({plannedQueue.length})
            </h3>

            {plannedQueue.length === 0 ? (
              <p className="text-[10px] text-slate-400 font-semibold uppercase italic py-4">No schedules planned yet.</p>
            ) : (
              <div className="divide-y divide-slate-100 dark:divide-slate-800/50 max-h-[300px] overflow-y-auto pr-1">
                {plannedQueue.map((item) => (
                  <div key={item.id} className="flex justify-between items-center py-3">
                    <div>
                      <h4 className="text-xs font-bold text-slate-900 dark:text-white">{item.recipeName}</h4>
                      <p className="text-[9px] font-semibold text-slate-500 uppercase">
                        {item.quantity} batches (Yield: {item.quantity * item.yieldQty})
                      </p>
                    </div>
                    <button
                      onClick={() => removeFromQueue(item.id)}
                      className="p-2 hover:bg-rose-50 dark:hover:bg-rose-500/10 text-rose-500 rounded-lg transition-colors"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Dynamic Aggregated Materials & Availability Checklist */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800/80 rounded-3xl overflow-hidden shadow-sm">
            <div className="p-6 border-b border-slate-200/50 dark:border-slate-800/50 flex justify-between items-center">
              <h3 className="text-sm font-black uppercase tracking-widest text-slate-800 dark:text-slate-200 flex items-center gap-2">
                <ShoppingCart size={16} className="text-[#F97316]" />
                Aggregated Ingredient Audit
              </h3>
              {stockLoading && (
                <span className="text-[10px] font-bold text-slate-400 flex items-center gap-1.5 uppercase animate-pulse">
                  <RefreshCw size={12} className="animate-spin" /> Verifying...
                </span>
              )}
            </div>

            {plannedQueue.length === 0 ? (
              <div className="py-20 text-center text-slate-450 uppercase text-[10px] font-bold flex flex-col items-center gap-3">
                <Info size={28} className="text-slate-300 dark:text-slate-700" />
                <span>Add formulas to the run queue to run material audits</span>
              </div>
            ) : (
              <div className="divide-y divide-slate-100 dark:divide-slate-800/50">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-50 dark:bg-slate-950 text-[10px] font-black uppercase tracking-wider text-slate-400 border-b border-slate-200/50 dark:border-slate-800/50">
                        <th className="py-4 px-6">Ingredient</th>
                        <th className="py-4 px-4 text-right">Required quantity</th>
                        <th className="py-4 px-4 text-right">Stock Available</th>
                        <th className="py-4 px-6 text-center">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800/50 text-xs font-semibold text-slate-700 dark:text-slate-200">
                      {aggregatedMaterials.map((mat) => {
                        const deficit = mat.required - mat.available;

                        return (
                          <tr key={mat.id} className="hover:bg-slate-50/50 dark:hover:bg-white/[0.01]">
                            <td className="py-4 px-6 font-bold">
                              <div>{mat.name}</div>
                              <div className="text-[9px] font-mono text-slate-450 mt-0.5">{mat.sku}</div>
                            </td>
                            <td className="py-4 px-4 text-right font-black text-slate-900 dark:text-white">
                              {mat.required.toFixed(2)} <span className="text-[10px] font-bold uppercase">{mat.unit}</span>
                            </td>
                            <td className="py-4 px-4 text-right text-slate-500">
                              {mat.available.toFixed(2)} <span className="text-[10px] font-bold uppercase">{mat.unit}</span>
                            </td>
                            <td className="py-4 px-6 text-center">
                              {mat.sufficient ? (
                                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-wider bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-500/20">
                                  In Stock
                                </span>
                              ) : (
                                <span className="inline-flex flex-col items-center">
                                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-wider bg-rose-50 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-100 dark:border-rose-500/20">
                                    Deficit
                                  </span>
                                  <span className="text-[9px] font-mono text-rose-500 font-bold mt-0.5">
                                    -{deficit.toFixed(2)} {mat.unit}
                                  </span>
                                </span>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                <div className="p-6 bg-slate-50 dark:bg-slate-950 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    {allSufficient ? (
                      <CheckCircle className="text-emerald-500" size={24} />
                    ) : (
                      <AlertTriangle className="text-[#F97316]" size={24} />
                    )}
                    <div>
                      <h4 className="text-xs font-black uppercase tracking-tight text-slate-900 dark:text-white">
                        {allSufficient ? 'Stock Validation Successful' : 'Ingredients Shortfall Detected'}
                      </h4>
                      <p className="text-[10px] text-slate-500 font-semibold uppercase">
                        {allSufficient 
                          ? 'All required quantities are present in selected franchise stock.' 
                          : 'Some ingredients are missing. Launching runs might fail or cause negative stock.'}
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={handleLaunchProduction}
                    disabled={plannedQueue.length === 0 || submitting}
                    className="px-8 py-3.5 bg-[#F97316] text-white rounded-xl font-black text-xs uppercase tracking-wider shadow-lg shadow-orange-600/15 hover:shadow-xl hover:translate-y-[-1px] transition-all disabled:opacity-50 disabled:scale-100 disabled:translate-y-0 flex items-center justify-center gap-2"
                  >
                    {submitting ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Play size={14} fill="currentColor" />}
                    Launch production run
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
