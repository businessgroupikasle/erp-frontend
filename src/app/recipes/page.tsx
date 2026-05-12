"use client";
// Re-compile trigger

import { useState, useEffect, useCallback } from "react";
import {
  ChefHat, Plus, Search, Package, ArrowRight,
  RefreshCw, Trash2, Edit2, Download, Play, ChevronRight, Scale, CheckCircle2
} from "lucide-react";
import { clsx } from "clsx";
import { recipesApi, productsFullApi, rawMaterialsApi } from "@/lib/api";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useToast } from "@/context/ToastContext";
import { Modal } from "@/components/ui/Modal";

export default function RecipesPage() {
  const router = useRouter();
  const { showToast } = useToast();
  const [recipes, setRecipes] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [materials, setMaterials] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [step, setStep] = useState(1);
  const [saving, setSaving] = useState(false);
  const [activeSearchIdx, setActiveSearchIdx] = useState<number | null>(null);
  const [materialSearchQuery, setMaterialSearchQuery] = useState("");
  const [editingRecipe, setEditingRecipe] = useState<any>(null);
  const [formData, setFormData] = useState({
    productId: "",
    name: "",
    yieldQty: 1,
    unitWeight: 1,
    weightUnit: "kg",
    instructions: "",
    items: [] as any[]
  });

  const fetchAll = useCallback(async () => {
    setLoading(true);
    try {
      const [rRes, pRes, mRes] = await Promise.all([
        recipesApi.getAll(),
        productsFullApi.getAll(),
        rawMaterialsApi.getAll()
      ]);
      setRecipes(rRes.data ?? []);
      setProducts(pRes.data ?? []);
      setMaterials(mRes.data ?? []);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm("Delete this recipe?")) return;
    try {
      await recipesApi.delete(id);
      fetchAll();
      showToast("Recipe deleted", "success");
    } catch (e) { console.error(e); }
  };

  const filtered = recipes.filter((r) =>
    !search || r.name?.toLowerCase().includes(search.toLowerCase()) || r.product?.name?.toLowerCase().includes(search.toLowerCase())
  );

  const handleOpenNew = () => {
    setEditingRecipe(null);
    setFormData({
      productId: "",
      name: "",
      yieldQty: 1,
      unitWeight: 1,
      weightUnit: "kg",
      instructions: "",
      items: []
    });
    setStep(1);
    setShowModal(true);
  };

  const handleOpenEdit = (recipe: any, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingRecipe(recipe);
    const instructions = recipe.instructions || "";
    const unitWeightMatch = instructions.match(/\[unitWeight:([\d.]+)\]/);
    const weightUnitMatch = instructions.match(/\[weightUnit:(\w+)\]/);

    setFormData({
      productId: recipe.productId,
      name: recipe.name,
      yieldQty: recipe.yieldQty,
      unitWeight: unitWeightMatch ? Number(unitWeightMatch[1]) : 1,
      weightUnit: weightUnitMatch ? weightUnitMatch[1] : "kg",
      instructions: instructions.replace(/\[unitWeight:[\d.]+\]/, "").replace(/\[weightUnit:\w+\]/, "").trim(),
      items: recipe.recipeItems?.map((i: any) => ({
        inventoryItemId: i.inventoryItemId,
        quantityRequired: i.quantityRequired,
        unit: i.unit
      })) || []
    });
    setStep(1);
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!formData.productId || !formData.name || formData.items.length === 0) {
      showToast("Please fill all required fields and add at least one material", "error");
      return;
    }
    const payload = {
      ...formData,
      instructions: `${formData.instructions} [unitWeight:${formData.unitWeight}][weightUnit:${formData.weightUnit}]`
    };

    setSaving(true);
    try {
      await recipesApi.upsert(payload);
      showToast(editingRecipe ? "Recipe updated" : "Recipe created", "success");
      setShowModal(false);
      fetchAll();
    } catch (e) {
      console.error(e);
      showToast("Failed to save recipe", "error");
    } finally {
      setSaving(false);
    }
  };

  const addItem = () => {
    setFormData({
      ...formData,
      items: [...formData.items, { inventoryItemId: "", quantityRequired: 1, unit: "KG" }]
    });
  };

  const removeItem = (idx: number) => {
    const newItems = [...formData.items];
    newItems.splice(idx, 1);
    setFormData({ ...formData, items: newItems });
  };

  const updateItem = (idx: number, field: string, val: any) => {
    const newItems = [...formData.items];
    newItems[idx] = { ...newItems[idx], [field]: val };

    // Auto-set unit if material changes
    if (field === 'inventoryItemId') {
      const mat = materials.find(m => m.id === val);
      if (mat) newItems[idx].unit = mat.unit || 'KG';
    }

    setFormData({ ...formData, items: newItems });
  };

  const downloadRecipePDF = (recipe: any) => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const instructions = (recipe.instructions || "")
      .replace(/\[unitWeight:[\d.]+\]/, "")
      .replace(/\[weightUnit:\w+\]/, "")
      .trim();

    const html = `
      <html>
        <head>
          <title>Recipe - ${recipe.name}</title>
          <style>
            body { font-family: 'Inter', system-ui, sans-serif; padding: 40px; color: #1e293b; line-height: 1.5; }
            .header { border-bottom: 4px solid #F97316; padding-bottom: 20px; margin-bottom: 30px; display: flex; justify-content: space-between; align-items: flex-end; }
            .title-section h1 { font-size: 28px; font-weight: 900; margin: 0; color: #0f172a; text-transform: uppercase; letter-spacing: -0.02em; }
            .product { color: #64748b; font-size: 14px; margin-top: 4px; font-bold; text-transform: uppercase; letter-spacing: 0.05em; }
            .date { font-size: 12px; color: #94a3b8; font-weight: bold; }
            .stats { display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; margin-bottom: 40px; }
            .stat-box { background: #f8fafc; padding: 20px; border-radius: 16px; border: 1px solid #e2e8f0; }
            .stat-label { font-size: 10px; font-weight: 800; color: #64748b; text-transform: uppercase; margin-bottom: 6px; letter-spacing: 0.1em; }
            .stat-value { font-size: 20px; font-weight: 900; color: #0f172a; }
            .section-title { font-size: 12px; font-weight: 900; text-transform: uppercase; color: #F97316; margin-bottom: 16px; letter-spacing: 0.15em; display: flex; align-items: center; gap: 8px; }
            .section-title::after { content: ""; flex: 1; height: 1px; background: #fee2e2; }
            table { width: 100%; border-collapse: separate; border-spacing: 0; margin-bottom: 40px; border: 1px solid #e2e8f0; border-radius: 16px; overflow: hidden; }
            th { text-align: left; background: #f8fafc; padding: 14px 20px; font-size: 10px; font-weight: 800; text-transform: uppercase; color: #475569; letter-spacing: 0.05em; }
            td { padding: 14px 20px; border-top: 1px solid #e2e8f0; font-size: 14px; font-weight: 600; color: #334155; }
            .instructions-box { background: #fffaf5; padding: 30px; border-radius: 24px; border: 1px solid #fed7aa; }
            .instructions-content { white-space: pre-wrap; line-height: 1.8; font-size: 14px; color: #431407; font-weight: 500; }
            @media print {
              body { padding: 0; }
              .no-print { display: none; }
            }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="title-section">
              <h1>${recipe.name}</h1>
              <div class="product">Finished Product: ${recipe.product?.name || 'N/A'}</div>
            </div>
            <div class="date">Generated: ${new Date().toLocaleDateString()}</div>
          </div>
          
          <div class="stats">
            <div class="stat-box">
              <div class="stat-label">Yield Units</div>
              <div class="stat-value">${recipe.yieldQty} Units</div>
            </div>
            <div class="stat-box">
              <div class="stat-label">Batch Configuration</div>
              <div class="stat-value">${recipe.batchSize || '1'} ${recipe.recipeItems?.[0]?.unit || 'KG'}</div>
            </div>
            <div class="stat-box">
              <div class="stat-label">Total Components</div>
              <div class="stat-value">${recipe.recipeItems?.length || 0} Materials</div>
            </div>
          </div>

          <div class="section-title">Bill of Materials</div>
          <table>
            <thead>
              <tr>
                <th>Ingredient / Raw Material</th>
                <th style="text-align: center;">Required Quantity</th>
                <th style="text-align: right;">Unit of Measure</th>
              </tr>
            </thead>
            <tbody>
              ${recipe.recipeItems?.map((item: any) => `
                <tr>
                  <td>${item.material?.name || item.inventoryItemId}</td>
                  <td style="text-align: center;">${item.quantityRequired}</td>
                  <td style="text-align: right; color: #64748b;">${item.unit || 'KG'}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>

          <div class="section-title">Production Methodology</div>
          <div class="instructions-box">
            <div class="instructions-content">${instructions || 'Standard production procedures apply.'}</div>
          </div>

          <script>
            window.onload = () => {
              setTimeout(() => {
                window.print();
                window.onafterprint = () => window.close();
              }, 500);
            };
          </script>
        </body>
      </html>
    `;

    printWindow.document.write(html);
    printWindow.document.close();
  };

  return (
    <>
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-black text-gray-900 dark:text-white flex items-center gap-2">
              Recipe Management
            </h1>
            <p className="text-sm text-gray-500 dark:text-slate-400 mt-1 font-medium">
              Manage your formulas, ingredient ratios, and production standards
            </p>
          </div>
          <div className="flex gap-2">
            <button onClick={fetchAll} className="p-2.5 rounded-xl border border-gray-200 dark:border-white/10 hover:bg-gray-50 dark:hover:bg-white/5 transition-all">
              <RefreshCw size={18} className="text-gray-400" />
            </button>
            <button
              onClick={handleOpenNew}
              className="flex items-center gap-2 bg-[#F97316] hover:bg-orange-600 text-white px-5 py-2.5 rounded-xl text-sm font-black transition-all shadow-lg shadow-orange-500/20"
            >
              <Plus size={18} strokeWidth={3} /> New Recipe
            </button>
          </div>
        </div>

        {/* Stats Dashboard */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[
            { label: "Total Formulas", value: recipes.length, color: "text-orange-600", bg: "bg-orange-50 dark:bg-orange-500/10" },
            { label: "Products Covered", value: new Set(recipes.map((r) => r.productId)).size, color: "text-blue-600", bg: "bg-blue-50 dark:bg-blue-500/10" },
            { label: "Avg Ingredients", value: recipes.length ? (recipes.reduce((s, r) => s + (r.recipeItems?.length ?? 0), 0) / recipes.length).toFixed(1) : 0, color: "text-emerald-600", bg: "bg-emerald-50 dark:bg-emerald-500/10" },
          ].map((stat) => (
            <div key={stat.label} className="bg-white dark:bg-card rounded-2xl border border-gray-100 dark:border-white/5 p-5 shadow-sm">
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">{stat.label}</p>
              <p className={clsx("text-2xl font-black", stat.color)}>{stat.value}</p>
            </div>
          ))}
        </div>

        {/* Main Content */}
        <div className="bg-white dark:bg-card rounded-3xl border border-gray-100 dark:border-white/5 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-gray-50 dark:border-white/5 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="relative flex-1 max-w-md">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by recipe name or product..."
                className="w-full pl-10 pr-4 py-2.5 text-sm bg-gray-50/50 dark:bg-white/5 border border-gray-100 dark:border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500/20 transition-all"
              />
            </div>
            <div className="flex items-center gap-2">
            </div>
          </div>

          {loading ? (
            <div className="py-20 text-center">
              <RefreshCw size={32} className="mx-auto text-orange-500 animate-spin opacity-20" />
              <p className="mt-4 text-sm font-bold text-gray-400">Syncing Recipes...</p>
            </div>
          ) : filtered.length === 0 ? (
            <div className="py-20 text-center">
              <ChefHat size={48} strokeWidth={1} className="mx-auto text-gray-200" />
              <p className="mt-4 text-sm font-bold text-gray-400">No recipes found matching your search.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-gray-50/50 dark:bg-white/5 text-[10px] font-black text-gray-400 uppercase tracking-widest">
                    <th className="px-6 py-4">Recipe Detail</th>
                    <th className="px-6 py-4">Standard Output</th>
                    <th className="px-6 py-4">Materials</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50 dark:divide-white/5">
                  {filtered.map((recipe) => (
                    <tr
                      key={recipe.id}
                      onClick={(e) => handleOpenEdit(recipe, e)}
                      className="group hover:bg-orange-50/30 dark:hover:bg-orange-500/5 cursor-pointer transition-all"
                    >
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-orange-100 dark:bg-orange-900/30 text-orange-600 flex items-center justify-center font-black text-xs shrink-0">
                            {recipe.name.substring(0, 2).toUpperCase()}
                          </div>
                          <div>
                            <p className="text-sm font-black text-gray-900 dark:text-white group-hover:text-orange-600 transition-colors">{recipe.name}</p>
                            <p className="text-[10px] text-gray-400 font-bold uppercase mt-0.5 tracking-tight">Product: {recipe.product?.name}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <div className="flex flex-col">
                          <span className="text-sm font-black text-gray-700 dark:text-slate-200">{recipe.yieldQty} Units</span>
                          <span className="text-[10px] text-gray-400 font-bold uppercase">per {recipe.batchSize} {recipe.recipeItems?.[0]?.unit || 'KG'} Batch</span>
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-1">
                          <span className="text-sm font-black text-gray-700 dark:text-slate-200">{recipe.recipeItems?.length || 0}</span>
                          <span className="text-[10px] text-gray-400 font-bold uppercase">Ingredients</span>
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <span className="px-2 py-1 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 text-[9px] font-black uppercase rounded-lg border border-emerald-100 dark:border-emerald-500/20">
                          Production Ready
                        </span>
                      </td>
                      <td className="px-6 py-5">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={(e) => { e.stopPropagation(); router.push(`/production?recipeId=${recipe.id}`); }}
                            className="p-2 text-gray-400 hover:text-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-500/10 rounded-xl transition-all"
                            title="Start Production"
                          >
                            <Play size={16} fill="currentColor" />
                          </button>
                          <button
                            onClick={(e) => { e.stopPropagation(); downloadRecipePDF(recipe); }}
                            className="p-2 text-gray-400 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-500/10 rounded-xl transition-all"
                            title="Download PDF"
                          >
                            <Download size={16} />
                          </button>
                          <button
                            onClick={(e) => handleOpenEdit(recipe, e)}
                            className="p-2 text-gray-400 hover:text-orange-600 hover:bg-orange-50 dark:hover:bg-orange-500/10 rounded-xl transition-all"
                          >
                            <Edit2 size={16} />
                          </button>
                          <button
                            onClick={(e) => handleDelete(recipe.id, e)}
                            className="p-2 text-gray-300 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-xl transition-all"
                          >
                            <Trash2 size={16} />
                          </button>
                          <div className="w-8 flex justify-center text-gray-300 group-hover:text-orange-400 transition-all">
                            <ChevronRight size={20} />
                          </div>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Recipe Creator Modal */}
      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title={editingRecipe ? "Edit Recipe" : "New Recipe"}
        size="lg"
        footer={
          <div className="flex justify-between w-full">
            <button
              onClick={() => setStep(s => Math.max(1, s - 1))}
              disabled={step === 1}
              className="px-6 py-2.5 rounded-xl font-bold text-gray-500 hover:bg-gray-100 dark:hover:bg-white/5 disabled:opacity-30"
            >
              Back
            </button>
            {step < 4 ? (
              <button
                onClick={() => setStep(s => s + 1)}
                className="bg-orange-500 text-white px-8 py-2.5 rounded-xl font-black text-sm hover:bg-orange-600 transition-all shadow-lg shadow-orange-500/20"
              >
                Next Step
              </button>
            ) : (
              <button
                onClick={handleSave}
                disabled={saving}
                className="bg-slate-900 text-white px-8 py-2.5 rounded-xl font-black text-sm hover:bg-slate-800 transition-all shadow-lg shadow-black/20"
              >
                {saving ? "Saving..." : "Finalize Recipe"}
              </button>
            )}
          </div>
        }
      >
        <div className="space-y-8 text-slate-900 dark:text-white">
          {/* Step Progress */}
          <div className="flex items-center justify-between relative px-2">
            <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-gray-100 dark:bg-white/5 -translate-y-1/2 z-0" />
            {[1, 2, 3, 4].map(s => (
              <div key={s} className={clsx(
                "w-10 h-10 rounded-2xl flex items-center justify-center font-black text-sm z-10 transition-all border-4",
                step === s ? "bg-orange-500 text-white border-orange-100 dark:border-orange-500/20 scale-110 shadow-lg" :
                  step > s ? "bg-emerald-500 text-white border-emerald-100 dark:border-emerald-500/20" : "bg-white dark:bg-slate-900 text-gray-300 border-gray-50 dark:border-white/5"
              )}>
                {step > s ? "✓" : s}
              </div>
            ))}
          </div>

          {/* Step 1: Product */}
          {step === 1 && (
            <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-300">
              <div className="bg-orange-50 dark:bg-orange-500/5 p-4 rounded-2xl border border-orange-100 dark:border-orange-500/20 flex items-center gap-3">
                <Package className="text-orange-500" />
                <p className="text-xs font-bold text-orange-800 dark:text-orange-400">Select the finished product this recipe will produce.</p>
              </div>
              <div className="grid grid-cols-1 gap-4">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Target Product</label>
                <select
                  value={formData.productId}
                  onChange={(e) => setFormData({ ...formData, productId: e.target.value })}
                  className="w-full bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/10 rounded-2xl p-4 text-sm font-bold outline-none focus:ring-4 ring-orange-500/10 transition-all text-slate-900"
                >
                  <option value="">Choose a product...</option>
                  {products.map(p => <option key={p.id} value={p.id}>{p.name} ({p.sku || 'No SKU'})</option>)}
                </select>
              </div>
            </div>
          )}

          {/* Step 2: Output */}
          {step === 2 && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
              <div className="grid grid-cols-1 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Recipe Name (e.g. Standard Formula V1)</label>
                  <input
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Enter recipe identifier..."
                    className="w-full bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/10 rounded-2xl p-4 text-sm font-bold outline-none focus:ring-4 ring-orange-500/10 transition-all text-slate-900"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Weight / Volume per Unit</label>
                    <div className="flex gap-2">
                      <input
                        type="number"
                        value={formData.unitWeight}
                        onChange={(e) => setFormData({ ...formData, unitWeight: Number(e.target.value) })}
                        className="flex-1 bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/10 rounded-2xl p-4 text-sm font-bold outline-none focus:ring-4 ring-orange-500/10 transition-all text-slate-900"
                      />
                      <select
                        value={formData.weightUnit}
                        onChange={(e) => setFormData({ ...formData, weightUnit: e.target.value })}
                        className="w-24 bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/10 rounded-2xl p-4 text-xs font-black outline-none text-slate-900"
                      >
                        <option value="kg">KG</option>
                        <option value="g">G</option>
                        <option value="l">L</option>
                        <option value="ml">ML</option>
                        <option value="unit">UNIT</option>
                      </select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Number of Units (Yield)</label>
                    <div className="flex items-center gap-3 bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/10 rounded-2xl p-2.5 h-[56px]">
                      <button onClick={() => setFormData({ ...formData, yieldQty: Math.max(1, formData.yieldQty - 1) })} className="w-8 h-8 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-white/10 flex items-center justify-center font-black hover:bg-gray-50">-</button>
                      <input
                        type="number"
                        value={formData.yieldQty}
                        onChange={(e) => setFormData({ ...formData, yieldQty: Number(e.target.value) })}
                        className="flex-1 bg-transparent text-center text-lg font-black outline-none text-slate-900"
                      />
                      <button onClick={() => setFormData({ ...formData, yieldQty: formData.yieldQty + 1 })} className="w-8 h-8 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-white/10 flex items-center justify-center font-black hover:bg-gray-50">+</button>
                    </div>
                  </div>
                </div>

                <div className="bg-orange-50 dark:bg-orange-500/5 p-6 rounded-[2rem] border border-orange-100 dark:border-orange-500/20 flex items-center justify-between">
                  <div>
                    <p className="text-[10px] font-black text-orange-600 dark:text-orange-400 uppercase tracking-widest mb-1">Total Batch Output</p>
                    <p className="text-xs text-orange-800/60 dark:text-orange-400/60 font-medium italic">Calculated weight for this production run</p>
                  </div>
                  <div className="text-right">
                    <p className="text-3xl font-black text-orange-600 dark:text-orange-400">
                      {(formData.unitWeight * formData.yieldQty).toFixed(2)}
                      <span className="text-sm ml-1 uppercase">{formData.weightUnit}</span>
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Materials */}
          {step === 3 && (
            <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-300">
              <div className="flex items-center justify-between mb-2">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Bill of Materials</label>
                <button onClick={addItem} className="flex items-center gap-1.5 text-[10px] font-black text-orange-600 uppercase hover:bg-orange-50 px-3 py-1.5 rounded-lg transition-all">
                  <Plus size={14} /> Add Ingredient
                </button>
              </div>
              <div className="space-y-3 pr-2">
                {formData.items.length === 0 ? (
                  <div className="py-10 text-center border-2 border-dashed border-gray-100 dark:border-white/5 rounded-3xl">
                    <Scale className="mx-auto text-gray-200 mb-2" size={32} />
                    <p className="text-xs font-bold text-gray-400">No ingredients added yet.</p>
                  </div>
                ) : formData.items.map((item, idx) => (
                  <div key={idx} className="flex items-end gap-3 bg-gray-50/50 dark:bg-white/5 p-4 rounded-2xl border border-gray-100 dark:border-white/5 relative group">
                    <div className="flex-1 space-y-1.5 relative">
                      <label className="text-[9px] font-black text-gray-400 uppercase tracking-tight">Material</label>
                      <div className="relative">
                        <div
                          onClick={() => {
                            setActiveSearchIdx(idx);
                            setMaterialSearchQuery("");
                          }}
                          className="w-full bg-white dark:bg-slate-900 border border-gray-100 dark:border-white/10 rounded-xl p-2 text-xs font-bold cursor-pointer flex items-center justify-between min-h-[38px] text-slate-900"
                        >
                          <span className={clsx(!item.inventoryItemId && "text-gray-400")}>
                            {materials.find(m => m.id === item.inventoryItemId)?.name || "Search materials..."}
                          </span>
                          <Search size={14} className="text-gray-400" />
                        </div>

                        {activeSearchIdx === idx && (
                          <>
                            <div className="fixed inset-0 z-40" onClick={() => setActiveSearchIdx(null)} />
                            <div className="absolute top-full left-0 right-0 z-50 mt-1 bg-white dark:bg-slate-900 border border-orange-500 rounded-xl shadow-2xl overflow-hidden animate-in fade-in slide-in-from-top-1 duration-200">
                              <div className="p-2 border-b border-gray-100 dark:border-white/10 flex items-center gap-2">
                                <Search size={14} className="text-orange-500" />
                                <input
                                  autoFocus
                                  value={materialSearchQuery}
                                  onChange={(e) => setMaterialSearchQuery(e.target.value)}
                                  placeholder="Type to search..."
                                  className="flex-1 bg-transparent border-none outline-none text-xs font-bold text-slate-900"
                                />
                              </div>
                              <div className="max-h-48 overflow-y-auto p-1 custom-scrollbar">
                                {materials
                                  .filter(m => m.name.toLowerCase().includes(materialSearchQuery.toLowerCase()))
                                  .filter(m => !formData.items.some((existing, i) => i !== idx && existing.inventoryItemId === m.id))
                                  .map(m => (
                                    <div
                                      key={m.id}
                                      onClick={() => {
                                        updateItem(idx, 'inventoryItemId', m.id);
                                        setActiveSearchIdx(null);
                                      }}
                                      className="p-2.5 text-xs font-bold text-gray-700 dark:text-gray-300 hover:bg-orange-50 dark:hover:bg-orange-500/10 hover:text-orange-600 rounded-lg cursor-pointer transition-colors flex items-center justify-between group"
                                    >
                                      {m.name}
                                      <span className="text-[10px] text-gray-400 opacity-0 group-hover:opacity-100 uppercase">{m.sku}</span>
                                    </div>
                                  ))}
                                {materials.filter(m => m.name.toLowerCase().includes(materialSearchQuery.toLowerCase())).length === 0 && (
                                  <div className="p-4 text-center text-xs text-gray-400 italic">No materials found</div>
                                )}
                              </div>
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                    <div className="w-24 space-y-1.5">
                      <label className="text-[9px] font-black text-gray-400 uppercase tracking-tight">Qty</label>
                      <input
                        type="number"
                        value={item.quantityRequired}
                        onChange={(e) => updateItem(idx, 'quantityRequired', Number(e.target.value))}
                        className="w-full bg-white dark:bg-slate-900 border border-gray-100 dark:border-white/10 rounded-xl p-2 text-xs font-bold outline-none text-slate-900"
                      />
                    </div>
                    <div className="w-24 space-y-1.5">
                      <label className="text-[9px] font-black text-gray-400 uppercase tracking-tight">Unit</label>
                      <select
                        value={item.unit?.toUpperCase()}
                        onChange={(e) => updateItem(idx, 'unit', e.target.value)}
                        className="w-full bg-white dark:bg-slate-900 border border-gray-100 dark:border-white/10 rounded-xl p-2 text-[10px] font-black text-center text-slate-900 uppercase outline-none"
                      >
                        <option value="KG">KG</option>
                        <option value="G">G</option>
                        <option value="L">L</option>
                        <option value="ML">ML</option>
                        <option value="UNIT">UNIT</option>
                        <option value="PCS">PCS</option>
                      </select>
                    </div>
                    <button
                      onClick={() => removeItem(idx)}
                      className="p-2 text-gray-300 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg transition-all"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Step 4: Finalize */}
          {step === 4 && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Cooking / Production Instructions</label>
                <textarea
                  value={formData.instructions}
                  onChange={(e) => setFormData({ ...formData, instructions: e.target.value })}
                  placeholder="Step-by-step process for this recipe..."
                  className="w-full h-40 bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/10 rounded-3xl p-5 text-sm font-medium outline-none focus:ring-4 ring-orange-500/10 transition-all resize-none text-slate-900"
                />
              </div>
              <div className="p-5 bg-emerald-50 dark:bg-emerald-500/5 rounded-2xl border border-emerald-100 dark:border-emerald-500/20">
                <h4 className="text-[10px] font-black text-emerald-600 uppercase tracking-[0.2em] mb-2 flex items-center gap-2">
                  <CheckCircle2 size={14} /> Ready for Production
                </h4>
                <p className="text-xs font-medium text-emerald-800 dark:text-emerald-400">
                  Review all parameters before saving. This formula will be immediately available in the Production Control dashboard.
                </p>
              </div>
            </div>
          )}
        </div>
      </Modal>
    </>
  )
    ;
}
