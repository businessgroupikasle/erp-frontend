"use client";

import { useState, useEffect, useCallback } from "react";
import {
  ChefHat, Plus, X, Search, Package, ArrowRight,
  IndianRupee, Scale, RefreshCw, Trash2, ChevronDown, Edit2,
} from "lucide-react";
import { clsx } from "clsx";
import { recipesApi, productsFullApi, rawMaterialsApi } from "@/lib/api";

interface RecipeIngredient {
  inventoryItemId: string;
  itemName: string;
  unit: string;
  quantityRequired: number;
}

export default function RecipesPage() {
  const [recipes, setRecipes]     = useState<any[]>([]);
  const [products, setProducts]   = useState<any[]>([]);
  const [materials, setMaterials] = useState<any[]>([]);
  const [loading, setLoading]     = useState(true);
  const [search, setSearch]       = useState("");
  const [showForm, setShowForm]   = useState(false);
  const [editing, setEditing]     = useState<any>(null);
  const [selected, setSelected]   = useState<any>(null);

  // Form state
  const [productId, setProductId]   = useState("");
  const [recipeName, setRecipeName] = useState("");
  const [yieldQty, setYieldQty]     = useState(1);
  const [instructions, setInstructions] = useState("");
  const [ingredients, setIngredients]   = useState<RecipeIngredient[]>([
    { inventoryItemId: "", itemName: "", unit: "kg", quantityRequired: 0 },
  ]);
  const [saving, setSaving] = useState(false);

  // Quick Add state
  const [showQuickProduct, setShowQuickProduct]   = useState(false);
  const [showQuickMaterial, setShowQuickMaterial] = useState(false);
  const [quickName, setQuickName]   = useState("");
  const [quickPrice, setQuickPrice] = useState(0);
  const [quickUnit, setQuickUnit]   = useState("kg");
  const [addingQuick, setAddingQuick] = useState(false);

  const fetchAll = useCallback(async () => {
    setLoading(true);
    try {
      const [rRes, pRes, mRes] = await Promise.all([
        recipesApi.getAll(),
        productsFullApi.getAll(),
        rawMaterialsApi.getAll(),
      ]);
      setRecipes(rRes.data ?? []);
      setProducts(pRes.data ?? []);
      setMaterials(mRes.data ?? []);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const addIngredient = () =>
    setIngredients((prev) => [...prev, { inventoryItemId: "", itemName: "", unit: "kg", quantityRequired: 0 }]);

  const removeIngredient = (i: number) =>
    setIngredients((prev) => prev.filter((_, idx) => idx !== i));

  const updateIngredient = (i: number, field: keyof RecipeIngredient, value: any) =>
    setIngredients((prev) => prev.map((ing, idx) => {
      if (idx !== i) return ing;
      if (field === "inventoryItemId") {
        // Restriction: Prevent duplicates
        if (prev.some((item, index) => index !== i && item.inventoryItemId === value)) {
          alert("This material is already in the recipe. Please adjust its quantity instead.");
          return ing;
        }
        const mat = materials.find((m: any) => m.id === value);
        return { ...ing, inventoryItemId: value, itemName: mat?.name ?? "", unit: mat?.unit ?? "kg" };
      }
      return { ...ing, [field]: value };
    }));

  const handleProductChange = (pid: string) => {
    setProductId(pid);
    const prod = products.find((p: any) => p.id === pid);
    if (prod) setRecipeName(`${prod.name} Recipe`);
  };

  const handleCreate = async () => {
    if (!productId || !recipeName || ingredients.some((i) => !i.inventoryItemId || i.quantityRequired <= 0)) return;
    setSaving(true);
    try {
      await recipesApi.upsert({
        productId,
        name: recipeName,
        yieldQty,
        instructions,
        items: ingredients.map(({ inventoryItemId, quantityRequired, unit }) => ({
          inventoryItemId, quantityRequired, unit,
        })),
      });
      setShowForm(false);
      resetForm();
      fetchAll();
    } catch (e) { console.error(e); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this recipe?")) return;
    try {
      await recipesApi.delete(id);
      fetchAll();
    } catch (e) { console.error(e); }
  };

  const resetForm = () => {
    setEditing(null);
    setProductId(""); setRecipeName(""); setYieldQty(1); setInstructions("");
    setIngredients([{ inventoryItemId: "", itemName: "", unit: "kg", quantityRequired: 0 }]);
  };

  const handleQuickProduct = async () => {
    if (!quickName || quickPrice <= 0) return;
    setAddingQuick(true);
    try {
      const res = await productsFullApi.create({
        name: quickName,
        basePrice: quickPrice,
        category: "BATTER",
        taxPercent: 5,
        isActive: true
      });
      const newProd = res.data;
      await fetchAll();
      setProductId(newProd.id);
      setRecipeName(`${newProd.name} Recipe`);
      setShowQuickProduct(false);
      setQuickName(""); setQuickPrice(0);
    } catch (e) { console.error(e); }
    finally { setAddingQuick(false); }
  };

  const handleQuickMaterial = async () => {
    if (!quickName) return;

    // Restriction: Pre-check if exists
    const exists = materials.find(m => m.name.toLowerCase() === quickName.toLowerCase());
    if (exists) {
        alert(`A material named "${quickName}" already exists. Please select it from the dropdown.`);
        return;
    }

    setAddingQuick(true);
    try {
      await rawMaterialsApi.create({
        name: quickName,
        unit: quickUnit,
        category: "RAW_MATERIAL"
      });
      await fetchAll();
      setShowQuickMaterial(false);
      setQuickName(""); setQuickUnit("kg");
    } catch (e) { console.error(e); }
    finally { setAddingQuick(false); }
  };

  const openEdit = (recipe: any) => {
    setEditing(recipe);
    setProductId(recipe.productId ?? "");
    setRecipeName(recipe.name ?? "");
    setYieldQty(recipe.yieldQty ?? 1);
    setInstructions(recipe.instructions ?? "");
    setIngredients(
      (recipe.recipeItems ?? []).map((item: any) => ({
        inventoryItemId: item.inventoryItemId,
        itemName: item.inventoryItem?.name ?? "",
        unit: item.unit ?? item.inventoryItem?.unit ?? "kg",
        quantityRequired: item.quantityRequired,
      }))
    );
    setShowForm(true);
  };

  const filtered = recipes.filter((r) =>
    !search || r.name?.toLowerCase().includes(search.toLowerCase()) || r.product?.name?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-gray-900 dark:text-white flex items-center gap-2">
            <ChefHat size={22} className="text-orange-500" /> Recipe Management
          </h1>
          <p className="text-sm text-gray-500 dark:text-slate-400 mt-1">
            Define how raw materials combine to produce finished goods
          </p>
        </div>
        <div className="flex gap-2">
          <button onClick={fetchAll} className="p-2 rounded-xl border border-gray-200 dark:border-white/10 hover:bg-gray-50 dark:hover:bg-white/5 transition-all">
            <RefreshCw size={16} className="text-gray-400" />
          </button>
          <button
            onClick={() => { resetForm(); setShowForm(true); }}
            className="flex items-center gap-2 bg-orange-500 hover:bg-orange-400 text-white px-4 py-2 rounded-xl text-sm font-bold transition-all"
          >
            <Plus size={16} /> New Recipe
          </button>

        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: "Total Recipes", value: recipes.length, color: "text-indigo-500", bg: "bg-indigo-50 dark:bg-indigo-500/10" },
          { label: "Products Covered", value: new Set(recipes.map((r) => r.productId)).size, color: "text-emerald-500", bg: "bg-emerald-50 dark:bg-emerald-500/10" },
          { label: "Ingredients Used", value: recipes.reduce((s, r) => s + (r.recipeItems?.length ?? 0), 0), color: "text-amber-500", bg: "bg-amber-50 dark:bg-amber-500/10" },
        ].map((stat) => (
          <div key={stat.label} className="bg-white dark:bg-card rounded-2xl border border-gray-100 dark:border-white/5 p-4">
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{stat.label}</p>
            <p className={clsx("text-3xl font-black mt-1", stat.color)}>{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Search */}
      <div className="relative">
        <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search recipes..."
          className="w-full pl-9 pr-4 py-2.5 text-sm bg-white dark:bg-card border border-gray-200 dark:border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500/20" />
      </div>

      {/* Recipe Cards */}
      {loading ? (
        <div className="py-20 text-center text-gray-400 text-sm">Loading recipes...</div>
      ) : filtered.length === 0 ? (
        <div className="py-20 text-center text-gray-300 dark:text-slate-600 space-y-4">
          <ChefHat size={48} strokeWidth={1} className="mx-auto" />
          <div>
            <p className="text-sm font-semibold">No recipes yet.</p>
            <p className="text-xs text-gray-500 mt-1">Start by defining how your materials combine.</p>
          </div>
          <button
            onClick={() => { resetForm(); setShowForm(true); }}
            className="inline-flex items-center gap-2 bg-orange-500 hover:bg-orange-400 text-white px-6 py-2.5 rounded-xl text-sm font-bold transition-all shadow-lg shadow-orange-500/20"
          >
            <Plus size={16} /> Create Your First Recipe
          </button>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {filtered.map((recipe) => (
            <div
              key={recipe.id}
              className="bg-white dark:bg-card rounded-2xl border border-gray-100 dark:border-white/5 p-5 hover:shadow-md transition-all cursor-pointer"
              onClick={() => setSelected(selected?.id === recipe.id ? null : recipe)}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-orange-50 dark:bg-orange-900/20 flex items-center justify-center text-2xl shrink-0">
                    🍽️
                  </div>
                  <div>
                    <h3 className="font-black text-gray-900 dark:text-white text-sm">{recipe.name}</h3>
                    <p className="text-[11px] text-gray-400 mt-0.5">Product: {recipe.product?.name ?? "—"}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <div className="text-right">
                    <p className="text-[10px] text-gray-400 uppercase font-bold">Yield</p>
                    <p className="text-sm font-black text-gray-900 dark:text-white">{recipe.yieldQty} units</p>
                  </div>
                  <button
                    onClick={(e) => { e.stopPropagation(); openEdit(recipe); }}
                    className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-white/5 text-gray-400 hover:text-orange-500 transition-all"
                  >
                    <Edit2 size={14} />
                  </button>
                  <button
                    onClick={(e) => { e.stopPropagation(); handleDelete(recipe.id); }}
                    className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/10 text-gray-400 hover:text-red-500 transition-all"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>

              {/* Price tag */}
              {recipe.product?.basePrice != null && (
                <div className="mt-3 flex items-center gap-1 text-[11px] text-gray-500 dark:text-slate-400">
                  <IndianRupee size={11} />
                  <span>Selling price: <strong className="text-gray-900 dark:text-white">₹{recipe.product.basePrice}</strong> / unit</span>
                </div>
              )}

              {/* Ingredients */}
              {selected?.id === recipe.id && (
                <div className="mt-4 border-t border-gray-100 dark:border-white/5 pt-4">
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3 flex items-center gap-1">
                    <Scale size={10} /> Ingredients ({recipe.recipeItems?.length ?? 0})
                  </p>
                  <div className="space-y-2">
                    {(recipe.recipeItems ?? []).map((item: any, i: number) => (
                      <div key={i} className="flex items-center justify-between text-[12px] bg-gray-50 dark:bg-white/5 rounded-lg px-3 py-2">
                        <div className="flex items-center gap-2">
                          <Package size={11} className="text-gray-400" />
                          <span className="font-medium text-gray-700 dark:text-slate-300">
                            {item.inventoryItem?.name ?? item.inventoryItemId}
                          </span>
                        </div>
                        <span className="font-bold text-gray-900 dark:text-white">
                          {item.quantityRequired} {item.unit}
                        </span>
                      </div>
                    ))}
                  </div>
                  {recipe.instructions && (
                    <p className="mt-3 text-[11px] text-gray-500 dark:text-slate-400 italic">{recipe.instructions}</p>
                  )}
                  <div className="mt-3 flex items-center gap-1 text-[11px] text-orange-500 font-bold">
                    <ArrowRight size={11} /> Go to Production to execute this recipe
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Create Recipe Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-[#12141c] rounded-3xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-100 dark:border-white/5 flex items-center justify-between">
              <h2 className="text-lg font-black text-gray-900 dark:text-white">{editing ? "Edit Recipe" : "New Recipe"}</h2>
              <button onClick={() => setShowForm(false)} className="p-1.5 hover:bg-gray-100 dark:hover:bg-white/10 rounded-lg">
                <X size={18} className="text-gray-500" />
              </button>
            </div>
            <div className="p-6 space-y-5">
              {/* Product */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-bold text-gray-600 dark:text-slate-400">Product (Output) *</label>
                  <button onClick={() => setShowQuickProduct(true)} className="text-[10px] font-black text-orange-500 uppercase tracking-tight hover:underline">
                    + Add New Product
                  </button>
                </div>
                <div className="relative">
                  <select value={productId} onChange={(e) => handleProductChange(e.target.value)}
                    className="w-full appearance-none bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl px-4 py-2.5 pr-9 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/20">
                    <option value="">Select product this recipe produces...</option>
                    {products.map((p: any) => <option key={p.id} value={p.id}>{p.name} — ₹{p.basePrice}/unit</option>)}
                  </select>
                  <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-600 dark:text-slate-400 mb-1.5">Recipe Name *</label>
                  <input value={recipeName} onChange={(e) => setRecipeName(e.target.value)} placeholder="e.g. Idly Batter Recipe"
                    className="w-full px-3 py-2.5 text-sm bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500/20" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-600 dark:text-slate-400 mb-1.5">Yield Quantity (output units)</label>
                  <input type="number" min={0.01} step={0.01} value={yieldQty} onChange={(e) => setYieldQty(Number(e.target.value))}
                    className="w-full px-3 py-2.5 text-sm bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500/20" />
                </div>
              </div>

              {/* Ingredients */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-bold text-gray-600 dark:text-slate-400">Ingredients *</label>
                  <div className="flex items-center gap-3">
                    <button onClick={() => setShowQuickMaterial(true)} className="text-[10px] font-black text-orange-500 uppercase tracking-tight hover:underline">
                      + New Material
                    </button>
                    <div className="w-px h-3 bg-gray-200 dark:bg-white/10" />
                    <button onClick={addIngredient} className="flex items-center gap-1 text-[11px] font-bold text-orange-500 hover:text-orange-400">
                      <Plus size={12} /> Add Row
                    </button>
                  </div>
                </div>
                <div className="space-y-2">
                  {ingredients.map((ing, i) => (
                    <div key={i} className="grid grid-cols-12 gap-2 items-center">
                      <div className="col-span-6">
                        <select value={ing.inventoryItemId} onChange={(e) => updateIngredient(i, "inventoryItemId", e.target.value)}
                          className="w-full appearance-none bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl px-3 py-2 text-[12px] focus:outline-none focus:ring-2 focus:ring-orange-500/20">
                           <option value="">Select material...</option>
                           {materials
                             .filter(m => !ingredients.some((ing, idx) => idx !== i && ing.inventoryItemId === m.id))
                             .map((m: any) => <option key={m.id} value={m.id}>{m.name} ({m.unit})</option>)}
                        </select>
                      </div>
                      <div className="col-span-3">
                        <input type="number" min={0.001} step={0.001} placeholder="Qty" value={ing.quantityRequired}
                          onChange={(e) => updateIngredient(i, "quantityRequired", Number(e.target.value))}
                          className="w-full bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl px-3 py-2 text-[12px] focus:outline-none focus:ring-2 focus:ring-orange-500/20" />
                      </div>
                      <div className="col-span-2">
                        <span className="text-[11px] text-gray-500 font-bold">{ing.unit || "—"}</span>
                      </div>
                      <div className="col-span-1 flex justify-end">
                        {ingredients.length > 1 && (
                          <button onClick={() => removeIngredient(i)} className="text-red-400 hover:text-red-500"><X size={14} /></button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Instructions */}
              <div>
                <label className="block text-xs font-bold text-gray-600 dark:text-slate-400 mb-1.5">Instructions (optional)</label>
                <textarea value={instructions} onChange={(e) => setInstructions(e.target.value)} rows={3}
                  placeholder="Describe how to prepare this recipe..."
                  className="w-full px-3 py-2.5 text-sm bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500/20 resize-none" />
              </div>

              {/* Summary */}
              {productId && (
                <div className="bg-orange-50 dark:bg-orange-900/10 border border-orange-200 dark:border-orange-800/30 rounded-2xl p-4">
                  <p className="text-xs font-black text-orange-600 dark:text-orange-400 uppercase tracking-widest mb-2">Recipe Summary</p>
                  <p className="text-sm text-gray-700 dark:text-slate-300">
                    <strong>{ingredients.filter(i => i.inventoryItemId).length}</strong> ingredient(s) → produces <strong>{yieldQty}</strong> unit(s) of <strong>{products.find(p => p.id === productId)?.name}</strong>
                  </p>
                </div>
              )}
            </div>
            <div className="p-6 pt-0 flex gap-3 justify-end">
              <button onClick={() => setShowForm(false)} className="px-5 py-2.5 rounded-xl border border-gray-200 dark:border-white/10 text-sm font-bold text-gray-600 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-white/5 transition-all">Cancel</button>
              <button onClick={handleCreate} disabled={saving || !productId || !recipeName}
                className="px-6 py-2.5 bg-orange-500 hover:bg-orange-400 disabled:opacity-50 text-white rounded-xl text-sm font-bold transition-all">
                {saving ? "Saving..." : editing ? "Update Recipe" : "Save Recipe"}
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Quick Add Product Modal */}
      {showQuickProduct && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-md p-4">
          <div className="bg-white dark:bg-[#1a1c26] rounded-3xl shadow-2xl w-full max-w-sm p-6 space-y-4">
            <h3 className="text-lg font-black text-gray-900 dark:text-white">Quick Add Product</h3>
            <div>
              <label className="block text-[10px] font-black text-gray-400 uppercase mb-1">Product Name</label>
              <input value={quickName} onChange={(e) => setQuickName(e.target.value)} placeholder="e.g. Idly Batter"
                className="w-full px-3 py-2 text-sm bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500/20" />
            </div>
            <div>
              <label className="block text-[10px] font-black text-gray-400 uppercase mb-1">Base Price (₹)</label>
              <input type="number" value={quickPrice} onChange={(e) => setQuickPrice(Number(e.target.value))}
                className="w-full px-3 py-2 text-sm bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500/20" />
            </div>
            <div className="flex gap-2 pt-2">
              <button onClick={() => setShowQuickProduct(false)} className="flex-1 py-2 text-sm font-bold text-gray-500 hover:bg-gray-100 dark:hover:bg-white/5 rounded-xl transition-all">Cancel</button>
              <button onClick={handleQuickProduct} disabled={addingQuick || !quickName || quickPrice <= 0}
                className="flex-[2] py-2 bg-orange-500 hover:bg-orange-400 text-white rounded-xl text-sm font-bold transition-all disabled:opacity-50">
                {addingQuick ? "Adding..." : "Add Product"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Quick Add Material Modal */}
      {showQuickMaterial && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-md p-4">
          <div className="bg-white dark:bg-[#1a1c26] rounded-3xl shadow-2xl w-full max-w-sm p-6 space-y-4">
            <h3 className="text-lg font-black text-gray-900 dark:text-white">Quick Add Material</h3>
            <div>
              <label className="block text-[10px] font-black text-gray-400 uppercase mb-1">Material Name</label>
              <input value={quickName} onChange={(e) => setQuickName(e.target.value)} placeholder="e.g. Rice Flour"
                className="w-full px-3 py-2 text-sm bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500/20" />
            </div>
            <div>
              <label className="block text-[10px] font-black text-gray-400 uppercase mb-1">Unit</label>
              <select value={quickUnit} onChange={(e) => setQuickUnit(e.target.value)}
                className="w-full px-3 py-2 text-sm bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500/20">
                <option value="kg">kg</option>
                <option value="ltr">ltr</option>
                <option value="units">units</option>
                <option value="gm">gm</option>
              </select>
            </div>
            <div className="flex gap-2 pt-2">
              <button onClick={() => setShowQuickMaterial(false)} className="flex-1 py-2 text-sm font-bold text-gray-500 hover:bg-gray-100 dark:hover:bg-white/5 rounded-xl transition-all">Cancel</button>
              <button onClick={handleQuickMaterial} disabled={addingQuick || !quickName}
                className="flex-[2] py-2 bg-orange-500 hover:bg-orange-400 text-white rounded-xl text-sm font-bold transition-all disabled:opacity-50">
                {addingQuick ? "Adding..." : "Add Material"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
