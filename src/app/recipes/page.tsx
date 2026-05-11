"use client";

import { useState, useEffect, useCallback } from "react";
import {
  ChefHat, Plus, Search, Package, ArrowRight,
  RefreshCw, Trash2, Edit2, Download, Play, ChevronRight, Scale
} from "lucide-react";
import { clsx } from "clsx";
import { recipesApi, productsFullApi, rawMaterialsApi } from "@/lib/api";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useToast } from "@/context/ToastContext";

export default function RecipesPage() {
  const router = useRouter();
  const { showToast } = useToast();
  const [recipes, setRecipes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const fetchAll = useCallback(async () => {
    setLoading(true);
    try {
      const res = await recipesApi.getAll();
      setRecipes(res.data ?? []);
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

  return (
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
          <Link
            href="/recipes/new"
            className="flex items-center gap-2 bg-[#F97316] hover:bg-orange-600 text-white px-5 py-2.5 rounded-xl text-sm font-black transition-all shadow-lg shadow-orange-500/20"
          >
            <Plus size={18} strokeWidth={3} /> New Recipe
          </Link>
        </div>
      </div>

      {/* Stats Dashboard */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { label: "Total Formulas", value: recipes.length, color: "text-orange-600", bg: "bg-orange-50 dark:bg-orange-500/10" },
          { label: "Products Covered", value: new Set(recipes.map((r) => r.productId)).size, color: "text-blue-600", bg: "bg-blue-50 dark:bg-blue-500/10" },
          { label: "Avg Ingredients", value: recipes.length ? (recipes.reduce((s, r) => s + (r.recipeItems?.length ?? 0), 0) / recipes.length).toFixed(1) : 0, color: "text-emerald-600", bg: "bg-emerald-50 dark:bg-emerald-500/10" },
          { label: "Active Production", value: "8", color: "text-purple-600", bg: "bg-purple-50 dark:bg-purple-500/10" },
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
             <button className="flex items-center gap-2 px-4 py-2 text-xs font-bold text-gray-500 hover:bg-gray-50 dark:hover:bg-white/5 rounded-lg transition-all">
                <Download size={14} /> Export CSV
             </button>
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
                    onClick={() => router.push(`/recipes/${recipe.id}`)}
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
                            onClick={(e) => { e.stopPropagation(); router.push(`/recipes/${recipe.id}/edit`); }}
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
  );
}
