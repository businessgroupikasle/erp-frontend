"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Package, Plus, X, Search, IndianRupee,
  RefreshCw, Edit2, Trash2, CheckCircle2, ChevronDown,
} from "lucide-react";
import { productsFullApi } from "@/lib/api";

export default function ProductsPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading]   = useState(true);
  const [search, setSearch]     = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing]   = useState<any>(null);
  const [saving, setSaving]     = useState(false);

  const [form, setForm] = useState({
    name: "", sku: "", description: "", basePrice: 0,
    category: "BATTER", taxPercent: 5, isVeg: true, isActive: true,
  });

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const res = await productsFullApi.getAll();
      setProducts(res.data ?? []);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchProducts(); }, [fetchProducts]);

  const openCreate = () => {
    setEditing(null);
    setForm({ name: "", sku: "", description: "", basePrice: 0, category: "BATTER", taxPercent: 5, isVeg: true, isActive: true });
    setShowForm(true);
  };

  const openEdit = (p: any) => {
    setEditing(p);
    setForm({ name: p.name, sku: p.sku ?? "", description: p.description ?? "", basePrice: p.basePrice, category: p.category ?? "BATTER", taxPercent: p.taxPercent ?? 5, isVeg: p.isVeg ?? true, isActive: p.isActive ?? true });
    setShowForm(true);
  };

  const handleSave = async () => {
    if (!form.name || form.basePrice <= 0) return;
    setSaving(true);
    try {
      if (editing) {
        await productsFullApi.update(editing.id, form);
      } else {
        await productsFullApi.create(form);
      }
      setShowForm(false);
      fetchProducts();
    } catch (e) { console.error(e); }
    finally { setSaving(false); }
  };

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
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-gray-900 dark:text-white flex items-center gap-2">
            <Package size={22} className="text-orange-500" /> Products
          </h1>
          <p className="text-sm text-gray-500 dark:text-slate-400 mt-1">
            Manage finished goods produced by the home house with fixed selling prices
          </p>
        </div>
        <div className="flex gap-2">
          <button onClick={fetchProducts} className="p-2 rounded-xl border border-gray-200 dark:border-white/10 hover:bg-gray-50 dark:hover:bg-white/5 transition-all">
            <RefreshCw size={16} className="text-gray-400" />
          </button>
          <button onClick={openCreate} className="flex items-center gap-2 bg-orange-500 hover:bg-orange-400 text-white px-4 py-2 rounded-xl text-sm font-bold transition-all">
            <Plus size={16} /> New Product
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: "Total Products", value: products.length },
          { label: "Active",         value: activeCount },
          { label: "Categories",     value: categories.length },
        ].map((s) => (
          <div key={s.label} className="bg-white dark:bg-card rounded-2xl border border-gray-100 dark:border-white/5 p-4">
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{s.label}</p>
            <p className="text-3xl font-black text-gray-900 dark:text-white mt-1">{s.value}</p>
          </div>
        ))}
      </div>

      {/* Search */}
      <div className="relative">
        <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search products..."
          className="w-full pl-9 pr-4 py-2.5 text-sm bg-white dark:bg-card border border-gray-200 dark:border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500/20" />
      </div>

      {/* Products Grid */}
      {loading ? (
        <div className="py-20 text-center text-gray-400 text-sm">Loading products...</div>
      ) : filtered.length === 0 ? (
        <div className="py-20 text-center text-gray-300 dark:text-slate-600 space-y-2">
          <Package size={48} strokeWidth={1} className="mx-auto" />
          <p className="text-sm font-semibold">No products yet. Add your first product.</p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((product) => (
            <div key={product.id} className="bg-white dark:bg-card rounded-2xl border border-gray-100 dark:border-white/5 p-5 hover:shadow-md transition-all">
              <div className="flex items-start justify-between gap-2 mb-3">
                <div className="w-12 h-12 rounded-2xl bg-orange-50 dark:bg-orange-900/20 flex items-center justify-center text-2xl shrink-0">
                  {product.emoji ?? "📦"}
                </div>
                <div className="flex gap-1">
                  <button onClick={() => openEdit(product)} className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-white/5 text-gray-400 hover:text-orange-500 transition-all">
                    <Edit2 size={13} />
                  </button>
                  <button onClick={() => handleDelete(product.id)} className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/10 text-gray-400 hover:text-red-500 transition-all">
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>

              <h3 className="font-black text-gray-900 dark:text-white text-sm mb-1">{product.name}</h3>
              {product.description && <p className="text-[11px] text-gray-400 mb-3 line-clamp-2">{product.description}</p>}

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1 text-orange-600 dark:text-orange-400">
                  <IndianRupee size={14} />
                  <span className="text-lg font-black">{product.basePrice?.toLocaleString("en-IN")}</span>
                </div>
                <div className="flex items-center gap-2">
                  {product.category && (
                    <span className="px-2 py-0.5 rounded-lg bg-gray-100 dark:bg-white/5 text-[10px] font-bold text-gray-500 uppercase">
                      {product.category}
                    </span>
                  )}
                  {product.isActive ? (
                    <CheckCircle2 size={14} className="text-emerald-500" />
                  ) : (
                    <X size={14} className="text-gray-400" />
                  )}
                </div>
              </div>

              <div className="mt-3 pt-3 border-t border-gray-100 dark:border-white/5 flex items-center gap-3 text-[10px] text-gray-400 font-bold">
                <span>{product.isVeg ? "🟢 Veg" : "🔴 Non-Veg"}</span>
                <span>•</span>
                <span>Tax: {product.taxPercent ?? 0}%</span>
                {product.sku && <><span>•</span><span>SKU: {product.sku}</span></>}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Product Form Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-[#12141c] rounded-3xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-100 dark:border-white/5 flex items-center justify-between">
              <h2 className="text-lg font-black text-gray-900 dark:text-white">{editing ? "Edit Product" : "New Product"}</h2>
              <button onClick={() => setShowForm(false)} className="p-1.5 hover:bg-gray-100 dark:hover:bg-white/10 rounded-lg"><X size={18} className="text-gray-500" /></button>
            </div>
            <div className="p-6 space-y-4">
              {[
                { label: "Product Name *", key: "name", type: "text", placeholder: "e.g. Idly Batter" },
                { label: "SKU", key: "sku", type: "text", placeholder: "e.g. IB-001" },
                { label: "Description", key: "description", type: "text", placeholder: "Short description" },
              ].map(({ label, key, type, placeholder }) => (
                <div key={key}>
                  <label className="block text-xs font-bold text-gray-600 dark:text-slate-400 mb-1">{label}</label>
                  <input type={type} placeholder={placeholder} value={(form as any)[key]}
                    onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))}
                    className="w-full px-3 py-2.5 text-sm bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500/20" />
                </div>
              ))}

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-600 dark:text-slate-400 mb-1">Base Price (₹) *</label>
                  <div className="relative">
                    <IndianRupee size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input type="number" min={0} step={0.01} value={form.basePrice}
                      onChange={(e) => setForm((f) => ({ ...f, basePrice: Number(e.target.value) }))}
                      className="w-full pl-8 pr-3 py-2.5 text-sm bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500/20" />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-600 dark:text-slate-400 mb-1">Tax %</label>
                  <input type="number" min={0} max={100} value={form.taxPercent}
                    onChange={(e) => setForm((f) => ({ ...f, taxPercent: Number(e.target.value) }))}
                    className="w-full px-3 py-2.5 text-sm bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500/20" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-600 dark:text-slate-400 mb-1">Category</label>
                <div className="relative">
                  <select value={form.category} onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}
                    className="w-full appearance-none bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl px-3 py-2.5 pr-8 text-sm focus:outline-none">
                    {["BATTER", "SNACK", "BEVERAGE", "CONDIMENT", "OTHER"].map((c) => <option key={c}>{c}</option>)}
                  </select>
                  <ChevronDown size={13} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                </div>
              </div>

              <div className="flex gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={form.isVeg} onChange={(e) => setForm((f) => ({ ...f, isVeg: e.target.checked }))}
                    className="w-4 h-4 rounded accent-orange-500" />
                  <span className="text-sm font-bold text-gray-700 dark:text-slate-300">Vegetarian</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={form.isActive} onChange={(e) => setForm((f) => ({ ...f, isActive: e.target.checked }))}
                    className="w-4 h-4 rounded accent-orange-500" />
                  <span className="text-sm font-bold text-gray-700 dark:text-slate-300">Active</span>
                </label>
              </div>
            </div>
            <div className="p-6 pt-0 flex gap-3 justify-end">
              <button onClick={() => setShowForm(false)} className="px-5 py-2.5 rounded-xl border border-gray-200 dark:border-white/10 text-sm font-bold text-gray-600 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-white/5 transition-all">Cancel</button>
              <button onClick={handleSave} disabled={saving || !form.name}
                className="px-6 py-2.5 bg-orange-500 hover:bg-orange-400 disabled:opacity-50 text-white rounded-xl text-sm font-bold transition-all">
                {saving ? "Saving..." : editing ? "Update" : "Create"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
