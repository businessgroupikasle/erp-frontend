"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Layers,
  Plus,
  Pencil,
  Trash2,
  X,
  RefreshCw,
  ChefHat,
  Package,
  Search,
  Minus,
  Check,
  AlertTriangle,
  Play,
} from "lucide-react";
import { clsx } from "clsx";
import { recipesApi, rawMaterialsApi, productsApi } from "@/lib/api";
import { toast } from "react-hot-toast";
import { useRouter } from "next/navigation";

interface RecipeItem {
  inventoryItemId: string;
  quantityRequired: number;
  unit: string;
}

const UNITS = ["KG", "G", "L", "ML", "PCS", "PKT", "BOX", "DOZEN"];

const emptyForm = {
  name: "",
  productId: "",
  yieldQty: 1,
  instructions: "",
  items: [] as RecipeItem[],
};

export default function RecipesPage() {
  const router = useRouter();
  const [recipes, setRecipes] = useState<any[]>([]);
  const [materials, setMaterials] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [form, setForm] = useState({ ...emptyForm });
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const fetchAll = useCallback(async () => {
    setLoading(true);
    try {
      const [rRes, mRes, pRes] = await Promise.all([
        recipesApi.getAll(),
        rawMaterialsApi.getAll(),
        productsApi.getAll(),
      ]);
      setRecipes(rRes.data ?? []);
      setMaterials(mRes.data ?? []);
      setProducts(pRes.data ?? []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const openCreate = () => {
    setForm({ ...emptyForm });
    setEditingId(null);
    setError("");
    setShowForm(true);
  };

  const openEdit = (recipe: any) => {
    setForm({
      name: recipe.name ?? "",
      productId: recipe.productId ?? "",
      yieldQty: recipe.yieldQty ?? 1,
      instructions: recipe.instructions ?? "",
      items: (recipe.recipeItems ?? []).map((i: any) => ({
        inventoryItemId: i.inventoryItemId,
        quantityRequired: i.quantityRequired,
        unit: i.unit,
      })),
    });
    setEditingId(recipe.id);
    setError("");
    setShowForm(true);
  };

  const handleSave = async () => {
    if (!form.name.trim()) { setError("Recipe name is required."); return; }
    if (form.items.length === 0) { setError("Add at least one ingredient."); return; }
    setSaving(true);
    setError("");
    try {
      await recipesApi.upsert({
        ...(editingId ? { id: editingId } : {}),
        name: form.name,
        productId: form.productId || undefined,
        yieldQty: form.yieldQty,
        instructions: form.instructions || undefined,
        items: form.items,
      });
      toast.success(editingId ? "Recipe updated" : "Recipe created");
      setShowForm(false);
      fetchAll();
    } catch (e: any) {
      setError(e?.response?.data?.error ?? "Failed to save recipe.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this recipe? This cannot be undone.")) return;
    setDeleting(id);
    try {
      await recipesApi.delete(id);
      toast.success("Recipe deleted");
      fetchAll();
    } catch (e: any) {
      toast.error(e?.response?.data?.error ?? "Failed to delete recipe.");
    } finally {
      setDeleting(null);
    }
  };

  const addItem = () => {
    setForm(f => ({
      ...f,
      items: [...f.items, { inventoryItemId: "", quantityRequired: 1, unit: "KG" }],
    }));
  };

  const removeItem = (idx: number) => {
    setForm(f => ({ ...f, items: f.items.filter((_, i) => i !== idx) }));
  };

  const updateItem = (idx: number, patch: Partial<RecipeItem>) => {
    setForm(f => ({
      ...f,
      items: f.items.map((item, i) => i === idx ? { ...item, ...patch } : item),
    }));
  };

  const filtered = recipes.filter(r =>
    !search ||
    r.name?.toLowerCase().includes(search.toLowerCase()) ||
    r.product?.name?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto space-y-6 animate-in fade-in duration-700 px-4 sm:px-0">
      {/* Header */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 py-4 border-b border-slate-200 dark:border-slate-800">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 bg-[#F97316] rounded-xl shadow-lg shadow-orange-600/20 shrink-0">
              <Layers size={20} className="text-white" />
            </div>
            <h1 className="text-2xl md:text-3xl font-black tracking-tight text-slate-900 dark:text-white uppercase">
              Recipe <span className="text-slate-400 font-medium ml-1 tracking-tighter italic hidden sm:inline">Management</span>
            </h1>
          </div>
          <p className="text-slate-500 dark:text-slate-400 mt-1.5 font-medium ml-12 uppercase tracking-widest text-[9px]">
            Define formulas, bill of materials & production yields
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={fetchAll}
            className="p-3 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl hover:border-slate-300 transition-all shadow-sm group"
          >
            <RefreshCw size={14} className={clsx("text-slate-400 group-hover:rotate-180 transition-transform duration-500", loading && "animate-spin")} />
          </button>
          <button
            onClick={openCreate}
            className="flex items-center gap-2 bg-[#F97316] text-white px-5 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:shadow-xl hover:translate-y-[-1px] transition-all active:translate-y-0 shadow-lg shadow-orange-600/10"
          >
            <Plus size={14} />
            New Recipe
          </button>
        </div>
      </header>

      {/* Search */}
      <div className="relative max-w-sm">
        <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search recipes..."
          className="w-full pl-9 pr-4 py-2.5 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-semibold outline-none focus:border-orange-400 transition-colors dark:text-white"
        />
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        {[
          { label: "Total Recipes", value: recipes.length, color: "text-orange-500" },
          { label: "Total Ingredients", value: recipes.reduce((s, r) => s + (r.recipeItems?.length ?? 0), 0), color: "text-blue-500" },
          { label: "Avg Yield / Recipe", value: recipes.length ? Math.round(recipes.reduce((s, r) => s + (r.yieldQty ?? 0), 0) / recipes.length) : 0, color: "text-emerald-500" },
        ].map(stat => (
          <div key={stat.label} className="bg-white dark:bg-card/40 rounded-2xl border border-slate-100 dark:border-white/5 p-5">
            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">{stat.label}</p>
            <p className={clsx("text-3xl font-black tracking-tighter", stat.color)}>{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Recipe List */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-24 bg-white/50 dark:bg-white/[0.02] rounded-[32px] border border-dashed border-slate-200 dark:border-white/5">
          <div className="w-10 h-10 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mb-4" />
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Loading Recipes...</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 bg-white dark:bg-slate-900 rounded-[40px] border-2 border-dashed border-slate-100 dark:border-slate-800/50">
          <div className="w-20 h-20 bg-slate-50 dark:bg-slate-800 rounded-3xl flex items-center justify-center text-slate-300 dark:text-slate-700 mb-6">
            <ChefHat size={32} />
          </div>
          <p className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-tight">No Recipes Found</p>
          <p className="text-[10px] text-slate-500 mt-1">Create your first recipe to get started.</p>
          <button onClick={openCreate} className="mt-4 flex items-center gap-2 bg-[#F97316] text-white px-4 py-2.5 rounded-xl font-black text-[10px] uppercase tracking-widest shadow-lg">
            <Plus size={12} /> Create Recipe
          </button>
        </div>
      ) : (
        <div className="grid gap-4">
          {filtered.map(recipe => {
            const isExpanded = expandedId === recipe.id;
            return (
              <div
                key={recipe.id}
                className="group bg-white dark:bg-card/40 backdrop-blur-md rounded-[24px] border border-slate-100 dark:border-white/5 overflow-hidden hover:shadow-xl transition-all"
              >
                <div
                  className="flex items-center justify-between p-5 cursor-pointer"
                  onClick={() => setExpandedId(isExpanded ? null : recipe.id)}
                >
                  <div className="flex items-center gap-4 min-w-0">
                    <div className="w-12 h-12 rounded-2xl bg-orange-500 flex items-center justify-center text-white font-black text-sm shrink-0 shadow-lg shadow-orange-500/20">
                      {recipe.name.substring(0, 2).toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <h3 className="text-base font-black text-slate-900 dark:text-white uppercase tracking-tight truncate">{recipe.name}</h3>
                      <div className="flex items-center gap-3 mt-1 flex-wrap">
                        {recipe.product?.name && (
                          <span className="text-[9px] font-black text-slate-400 uppercase tracking-wider flex items-center gap-1">
                            <Package size={9} className="text-orange-400" /> {recipe.product.name}
                          </span>
                        )}
                        <span className="text-[9px] font-black text-emerald-500 uppercase tracking-wider bg-emerald-50 dark:bg-emerald-500/10 px-2 py-0.5 rounded-lg">
                          Yield: {recipe.yieldQty} units/batch
                        </span>
                        <span className="text-[9px] font-black text-slate-400 uppercase tracking-wider">
                          {recipe.recipeItems?.length ?? 0} ingredients
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0 ml-4">
                    <button
                      onClick={e => { e.stopPropagation(); router.push(`/production?recipeId=${recipe.id}`); }}
                      className="p-2 rounded-xl bg-orange-50 dark:bg-orange-500/10 text-orange-500 hover:bg-orange-100 transition-colors"
                      title="Start Production"
                    >
                      <Play size={13} fill="currentColor" />
                    </button>
                    <button
                      onClick={e => { e.stopPropagation(); openEdit(recipe); }}
                      className="p-2 rounded-xl bg-slate-50 dark:bg-white/5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition-colors"
                      title="Edit"
                    >
                      <Pencil size={13} />
                    </button>
                    <button
                      onClick={e => { e.stopPropagation(); handleDelete(recipe.id); }}
                      disabled={deleting === recipe.id}
                      className="p-2 rounded-xl bg-slate-50 dark:bg-white/5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                      title="Delete"
                    >
                      {deleting === recipe.id ? <RefreshCw size={13} className="animate-spin" /> : <Trash2 size={13} />}
                    </button>
                  </div>
                </div>

                {isExpanded && (
                  <div className="px-5 pb-5 pt-0 border-t border-slate-100 dark:border-white/5 animate-in fade-in duration-200">
                    <div className="pt-4 grid md:grid-cols-2 gap-6">
                      {/* Bill of Materials */}
                      <div>
                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-3">Bill of Materials</p>
                        <div className="space-y-2">
                          {recipe.recipeItems?.length > 0 ? recipe.recipeItems.map((item: any, i: number) => (
                            <div key={i} className="flex items-center justify-between px-3 py-2.5 bg-slate-50 dark:bg-white/[0.02] rounded-xl border border-slate-100 dark:border-white/5">
                              <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300">{item.inventoryItem?.name || "Ingredient"}</span>
                              <span className="text-[11px] font-black text-orange-500">{item.quantityRequired} {item.unit}</span>
                            </div>
                          )) : (
                            <p className="text-[10px] text-slate-400 italic">No ingredients defined.</p>
                          )}
                        </div>
                      </div>

                      {/* Instructions */}
                      <div>
                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-3">Instructions</p>
                        {recipe.instructions ? (
                          <div className="bg-[#FFFDF9] dark:bg-slate-950 p-3 rounded-xl border border-orange-100 dark:border-white/5 text-[10px] font-medium text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-line max-h-40 overflow-y-auto">
                            {recipe.instructions.replace(/\[unitWeight:[\d.]+\]/, "").replace(/\[weightUnit:\w+\]/, "").trim()}
                          </div>
                        ) : (
                          <p className="text-[10px] text-slate-400 italic">No instructions provided.</p>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Create / Edit Modal */}
      {showForm && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 animate-in zoom-in duration-300 text-slate-900">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-md" onClick={() => setShowForm(false)} />
          <div className="relative bg-white rounded-[2rem] shadow-2xl w-full max-w-2xl border border-slate-100 p-6 md:p-8 max-h-[92vh] overflow-y-auto custom-scrollbar">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-12 h-12 rounded-2xl bg-orange-500 flex items-center justify-center text-white shadow-lg shadow-orange-500/20 shrink-0">
                <ChefHat size={20} />
              </div>
              <div>
                <h2 className="text-xl font-black tracking-tight uppercase">{editingId ? "Edit Recipe" : "New Recipe"}</h2>
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mt-0.5">
                  {editingId ? "Update formula and bill of materials" : "Define formula and bill of materials"}
                </p>
              </div>
              <button onClick={() => setShowForm(false)} className="ml-auto p-2 rounded-xl hover:bg-slate-50 text-slate-400">
                <X size={16} />
              </button>
            </div>

            <div className="space-y-5">
              {/* Name */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Recipe Name *</label>
                <input
                  value={form.name}
                  onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                  placeholder="e.g. Khakhra Classic Mix"
                  className="w-full h-11 bg-slate-50 px-4 rounded-xl font-bold text-xs outline-none focus:ring-4 ring-orange-100 border border-slate-100 transition-all"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                {/* Product */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Linked Product</label>
                  <select
                    value={form.productId}
                    onChange={e => setForm(f => ({ ...f, productId: e.target.value }))}
                    className="w-full h-11 bg-slate-50 px-4 rounded-xl font-bold text-xs outline-none focus:ring-4 ring-orange-100 border border-slate-100 transition-all appearance-none cursor-pointer"
                  >
                    <option value="">None</option>
                    {products.map((p: any) => (
                      <option key={p.id} value={p.id}>{p.name}</option>
                    ))}
                  </select>
                </div>

                {/* Yield */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Yield (units/batch) *</label>
                  <input
                    type="number"
                    min={1}
                    value={form.yieldQty}
                    onChange={e => setForm(f => ({ ...f, yieldQty: Math.max(1, parseInt(e.target.value) || 1) }))}
                    className="w-full h-11 bg-slate-50 px-4 rounded-xl font-bold text-xs outline-none focus:ring-4 ring-orange-100 border border-slate-100 transition-all"
                  />
                </div>
              </div>

              {/* Instructions */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Instructions</label>
                <textarea
                  value={form.instructions}
                  onChange={e => setForm(f => ({ ...f, instructions: e.target.value }))}
                  rows={3}
                  placeholder="Step-by-step production instructions..."
                  className="w-full bg-slate-50 px-4 py-3 rounded-xl font-bold text-xs outline-none focus:ring-4 ring-orange-100 border border-slate-100 transition-all resize-none"
                />
              </div>

              {/* Ingredients */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
                    Ingredients / Bill of Materials *
                  </label>
                  <button
                    onClick={addItem}
                    className="flex items-center gap-1.5 text-[9px] font-black uppercase tracking-widest text-orange-500 hover:text-orange-600 bg-orange-50 px-3 py-1.5 rounded-lg transition-colors"
                  >
                    <Plus size={11} /> Add Ingredient
                  </button>
                </div>

                {form.items.length === 0 && (
                  <div className="py-8 text-center bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200">
                    <ChefHat size={24} className="mx-auto text-slate-300 mb-2" />
                    <p className="text-[10px] font-bold text-slate-400 uppercase">No ingredients yet</p>
                  </div>
                )}

                <div className="space-y-2 max-h-64 overflow-y-auto pr-1 custom-scrollbar">
                  {form.items.map((item, idx) => (
                    <div key={idx} className="flex items-center gap-2 p-3 bg-slate-50 rounded-xl border border-slate-100">
                      <select
                        value={item.inventoryItemId}
                        onChange={e => updateItem(idx, { inventoryItemId: e.target.value })}
                        className="flex-1 h-9 bg-white border border-slate-200 px-3 rounded-lg font-bold text-[10px] outline-none focus:border-orange-400 cursor-pointer"
                      >
                        <option value="">Select ingredient...</option>
                        {materials.map((m: any) => (
                          <option key={m.id} value={m.id}>{m.name}</option>
                        ))}
                      </select>
                      <input
                        type="number"
                        min={0.001}
                        step={0.001}
                        value={item.quantityRequired}
                        onChange={e => updateItem(idx, { quantityRequired: parseFloat(e.target.value) || 0 })}
                        className="w-20 h-9 bg-white border border-slate-200 px-3 rounded-lg font-black text-[11px] outline-none focus:border-orange-400 text-center"
                      />
                      <select
                        value={item.unit}
                        onChange={e => updateItem(idx, { unit: e.target.value })}
                        className="w-20 h-9 bg-white border border-slate-200 px-2 rounded-lg font-bold text-[10px] outline-none focus:border-orange-400 cursor-pointer"
                      >
                        {UNITS.map(u => <option key={u} value={u}>{u}</option>)}
                      </select>
                      <button
                        onClick={() => removeItem(idx)}
                        className="p-2 text-slate-300 hover:text-rose-500 transition-colors"
                      >
                        <Minus size={13} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {error && (
                <div className="flex items-center gap-3 p-4 bg-rose-50 rounded-2xl border border-rose-100 animate-in slide-in-from-top-2">
                  <AlertTriangle size={16} className="text-rose-500 shrink-0" />
                  <p className="text-[10px] font-bold text-rose-600">{error}</p>
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
                  onClick={handleSave}
                  disabled={saving}
                  className="flex-[2] py-4 bg-orange-500 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-lg shadow-orange-500/20 hover:bg-orange-400 transition-all flex items-center justify-center gap-2"
                >
                  {saving ? "Saving..." : <><Check size={14} /> {editingId ? "Update Recipe" : "Create Recipe"}</>}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
