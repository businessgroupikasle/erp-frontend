"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Package, Plus, Search, IndianRupee,
  RefreshCw, Edit2, Trash2, CheckCircle2,
} from "lucide-react";
import clsx from "clsx";
import { productsFullApi } from "@/lib/api";
import Link from "next/link";

export default function ProductsPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading]   = useState(true);
  const [search, setSearch]     = useState("");

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const res = await productsFullApi.getAll();
      setProducts(res.data ?? []);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchProducts(); }, [fetchProducts]);

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this product?")) return;
    try {
      await productsFullApi.delete(id);
      fetchProducts();
    } catch (e) { console.error(e); }
  };

  const filtered = products.filter((p) =>
    !search || p.name?.toLowerCase().includes(search.toLowerCase()) || p.category?.toLowerCase().includes(search.toLowerCase())
  );

  const activeCount  = products.filter((p) => p.isActive).length;
  const categories   = Array.from(new Set(products.map((p) => p.category).filter(Boolean)));

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-black text-gray-900 dark:text-white flex items-center gap-3 tracking-tight">
            <div className="p-2.5 rounded-2xl bg-orange-500/10 text-orange-500">
              <Package size={28} />
            </div>
            Marketplace Products
          </h1>
          <p className="text-sm text-gray-500 dark:text-slate-400 mt-2 font-medium">
            Strategic management of finished goods and consumer offerings
          </p>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={fetchProducts} 
            className="p-3.5 rounded-2xl bg-white dark:bg-white/5 border border-gray-100 dark:border-white/10 hover:bg-gray-50 dark:hover:bg-white/10 transition-all text-gray-400 hover:text-orange-500 shadow-sm"
          >
            <RefreshCw size={20} />
          </button>
          <Link 
            href="/products/add" 
            className="flex items-center gap-3 bg-orange-500 hover:bg-orange-400 text-white px-6 py-3.5 rounded-2xl text-sm font-black uppercase tracking-widest transition-all shadow-xl shadow-orange-500/20 active:scale-95"
          >
            <Plus size={18} /> Add Product
          </Link>
        </div>
      </div>

      {/* Stats Dashboard */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        {[
          { label: "Total Inventory", value: products.length, icon: Package, color: "text-blue-500" },
          { label: "Active Listings",  value: activeCount, icon: CheckCircle2, color: "text-emerald-500" },
          { label: "Market Segments", value: categories.length, icon: Search, color: "text-purple-500" },
        ].map((s) => (
          <div key={s.label} className="bg-white dark:bg-card rounded-[2rem] border border-gray-100 dark:border-white/5 p-6 shadow-sm group hover:border-orange-500/20 transition-all">
            <div className="flex items-center justify-between mb-4">
              <div className={clsx("p-2 rounded-xl bg-gray-50 dark:bg-white/5", s.color)}>
                <s.icon size={20} />
              </div>
              <span className="text-[10px] font-black text-gray-300 dark:text-slate-600 uppercase tracking-widest">Live Metrics</span>
            </div>
            <p className="text-[11px] font-black text-gray-400 uppercase tracking-widest">{s.label}</p>
            <p className="text-3xl font-black text-gray-900 dark:text-white mt-1 group-hover:scale-110 transition-transform origin-left">{s.value}</p>
          </div>
        ))}
      </div>

      {/* Search & Filter Bar */}
      <div className="relative group">
        <div className="absolute inset-y-0 left-5 flex items-center pointer-events-none">
          <Search size={18} className="text-gray-400 group-focus-within:text-orange-500 transition-colors" />
        </div>
        <input 
          value={search} 
          onChange={(e) => setSearch(e.target.value)} 
          placeholder="Filter by name, category, or SKU..."
          className="w-full pl-14 pr-6 py-4.5 text-base font-bold bg-white dark:bg-card border border-gray-100 dark:border-white/5 rounded-[1.5rem] focus:outline-none focus:ring-4 focus:ring-orange-500/10 shadow-sm transition-all dark:text-white" 
        />
      </div>

      {/* Products Display */}
      {loading ? (
        <div className="py-32 flex flex-col items-center justify-center gap-4">
          <div className="w-12 h-12 border-4 border-orange-500/20 border-t-orange-500 rounded-full animate-spin" />
          <p className="text-sm font-black text-gray-400 uppercase tracking-widest">Synchronizing Database...</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="py-32 text-center bg-white dark:bg-card rounded-[3rem] border border-dashed border-gray-200 dark:border-white/5 space-y-4">
          <div className="w-20 h-20 bg-gray-50 dark:bg-white/5 rounded-full flex items-center justify-center mx-auto">
            <Package size={40} strokeWidth={1} className="text-gray-300" />
          </div>
          <div>
            <p className="text-lg font-black text-gray-900 dark:text-white">No products found</p>
            <p className="text-sm text-gray-400 font-medium mt-1">Adjust your search or create a new product entry.</p>
          </div>
          <Link 
            href="/products/add" 
            className="inline-flex items-center gap-2 text-orange-500 font-black text-xs uppercase tracking-widest hover:gap-3 transition-all"
          >
            Create First Product <Plus size={16} />
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filtered.map((product) => (
            <div key={product.id} className="bg-white dark:bg-card rounded-[2.5rem] border border-gray-100 dark:border-white/5 p-8 hover:shadow-2xl hover:-translate-y-1 transition-all group relative overflow-hidden">
              <div className="absolute top-0 right-0 p-4 opacity-0 group-hover:opacity-100 transition-opacity">
                <div className="flex gap-2">
                  <Link 
                    href={`/products/edit?id=${product.id}`} 
                    className="p-2.5 rounded-xl bg-white dark:bg-slate-800 shadow-lg text-gray-400 hover:text-orange-500 transition-all border border-gray-100 dark:border-white/5"
                  >
                    <Edit2 size={16} />
                  </Link>
                  <button 
                    onClick={() => handleDelete(product.id)} 
                    className="p-2.5 rounded-xl bg-white dark:bg-slate-800 shadow-lg text-gray-400 hover:text-red-500 transition-all border border-gray-100 dark:border-white/5"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>

              <div className="flex items-center gap-4 mb-6">
                <div className="w-16 h-16 rounded-2xl bg-orange-50 dark:bg-orange-500/10 flex items-center justify-center text-3xl group-hover:scale-110 transition-transform">
                  {product.emoji ?? "📦"}
                </div>
                  <div className="flex items-center gap-2">
                    <span className="px-3 py-1 rounded-full bg-gray-100 dark:bg-white/5 text-[10px] font-black text-gray-500 uppercase tracking-wider">
                      {product.category ?? "Uncategorized"}
                    </span>
                    {product.recipe ? (
                      <Link 
                        href={`/recipes?search=${product.name}`}
                        className="px-3 py-1 rounded-full bg-orange-500/10 text-[10px] font-black text-orange-600 dark:text-orange-400 uppercase tracking-wider flex items-center gap-1 hover:bg-orange-500/20 transition-all"
                      >
                        <CheckCircle2 size={10} /> Recipe Ready
                      </Link>
                    ) : (
                      <Link 
                        href={`/recipes`}
                        className="px-3 py-1 rounded-full bg-red-500/10 text-[10px] font-black text-red-600 dark:text-red-400 uppercase tracking-wider flex items-center gap-1 hover:bg-red-500/20 transition-all"
                      >
                        Missing Recipe
                      </Link>
                    )}
                  </div>
                  <h3 className="font-black text-gray-900 dark:text-white text-lg mt-1 line-clamp-1">{product.name}</h3>
              </div>

              {product.description && (
                <p className="text-sm text-gray-400 mb-6 line-clamp-2 font-medium leading-relaxed">
                  {product.description}
                </p>
              )}

              <div className="flex items-end justify-between mt-auto pt-6 border-t border-gray-50 dark:border-white/5">
                <div className="space-y-1">
                  <span className="text-[10px] font-black text-gray-300 dark:text-slate-600 uppercase tracking-widest">Base Value</span>
                  <div className="flex items-center gap-1.5 text-orange-600 dark:text-orange-400">
                    <IndianRupee size={20} className="font-black" />
                    <span className="text-2xl font-black">{product.basePrice?.toLocaleString("en-IN")}</span>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-2">
                   <div className="flex items-center gap-2">
                    {product.isActive ? (
                      <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[10px] font-black uppercase">
                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                        Active
                      </div>
                    ) : (
                      <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-gray-50 dark:bg-white/5 text-gray-400 text-[10px] font-black uppercase">
                        Inactive
                      </div>
                    )}
                  </div>
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-tight">
                    {product.isVeg ? "🟢 Pure Veg" : "🔴 Non-Veg"}
                  </span>
                </div>
              </div>
              
              <div className="mt-4 flex gap-4 text-[10px] font-bold text-gray-300 uppercase tracking-widest">
                {product.sku && <span>SKU: {product.sku}</span>}
                <span>Tax: {product.taxPercent ?? 0}%</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
