"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter, useParams } from "next/navigation";
import {
  Package, X, IndianRupee, ChevronDown, Save, ArrowLeft,
  Sparkles, CheckCircle2, AlertCircle, Info, Trash2
} from "lucide-react";
import { productsFullApi } from "@/lib/api";
import Link from "next/link";
import { PREDEFINED_SIZES, getCategoryDefaults, generateSKU } from "@/lib/utils/erp";

export default function ProductEditClient() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [form, setForm] = useState({
    name: "",
    sku: "",
    description: "",
    basePrice: 0,
    category: "BATTER",
    taxPercent: 5,
    hsnCode: "",
    productType: "FINISHED_GOOD",
    is_menu_item: true,
    isVeg: true,
    isActive: true,
  });

  const [size, setSize] = useState("1KG");
  
  const prevCategory = useRef(form.category);
  const isInitialLoad = useRef(true);

  useEffect(() => {
    const fetchProduct = async () => {
      if (!id) return;
      try {
        const res = await productsFullApi.getById(id);
        const p = res.data;

        let initialSize = "1KG";
        if (p.sku) {
           const parts = p.sku.split('-');
           if (parts.length >= 2) initialSize = parts[parts.length - 1];
        }
        setSize(initialSize);

        setForm({
          name: p.name,
          sku: p.sku ?? "",
          description: p.description ?? "",
          basePrice: p.basePrice,
          category: p.category ?? "BATTER",
          taxPercent: p.taxPercent ?? 5,
          hsnCode: p.hsnCode ?? "",
          productType: p.productType ?? "FINISHED_GOOD",
          is_menu_item: p.is_menu_item ?? true,
          isVeg: p.isVeg ?? true,
          isActive: p.isActive ?? true,
        });
      } catch (e) {
        console.error(e);
        setError("Failed to fetch product details.");
      } finally {
        setLoading(false);
        setTimeout(() => { isInitialLoad.current = false; }, 500);
      }
    };
    fetchProduct();
  }, [id]);

  useEffect(() => {
    if (isInitialLoad.current) return;
    if (form.category !== prevCategory.current) {
      const defs = getCategoryDefaults(form.category);
      setForm((f) => ({ ...f, hsnCode: defs.hsnCode, taxPercent: defs.taxPercent }));
      prevCategory.current = form.category;
    }
  }, [form.category]);

  useEffect(() => {
    if (isInitialLoad.current) return;
    const sku = generateSKU(form.category, form.name, size);
    setForm((f) => ({ ...f, sku }));
  }, [form.category, form.name, size]);

  const handleSave = async () => {
    if (!form.name) {
      setError("Product name is required");
      return;
    }
    if (form.basePrice <= 0) {
      setError("Base price must be greater than 0");
      return;
    }
    if (form.taxPercent > 0 && !form.hsnCode) {
      setError("HSN Code is required when GST > 0");
      return;
    }

    setSaving(true);
    setError(null);
    try {
      await productsFullApi.update(id, form);
      router.push("/products");
    } catch (e: any) {
      console.error(e);
      setError(e.response?.data?.message || "Failed to update product. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this product? This action cannot be undone.")) return;
    try {
      await productsFullApi.delete(id);
      router.push("/products");
    } catch (e) {
      console.error(e);
      setError("Failed to delete product.");
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4">
        <div className="w-12 h-12 border-4 border-orange-500/20 border-t-orange-500 rounded-full animate-spin" />
        <p className="text-sm font-bold text-gray-400 uppercase tracking-widest">Loading Details...</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto pb-20">
      <div className="flex items-center justify-between mb-8">
        <div className="space-y-1">
          <div className="flex items-center gap-3 mb-2">
            <Link 
              href="/products" 
              className="p-2 rounded-xl bg-white dark:bg-white/5 border border-gray-100 dark:border-white/10 text-gray-500 hover:text-orange-500 transition-all hover:shadow-md"
            >
              <ArrowLeft size={20} />
            </Link>
            <h1 className="text-3xl font-black text-gray-900 dark:text-white tracking-tight">
              Edit Product
            </h1>
          </div>
          <p className="text-sm text-gray-500 dark:text-slate-400 flex items-center gap-2">
            <Sparkles size={14} className="text-orange-500" />
            Refining the masterpiece: {form.name}
          </p>
        </div>

        <div className="hidden md:flex gap-3">
          <button 
            onClick={handleDelete}
            className="p-3 rounded-2xl bg-red-50 dark:bg-red-900/10 text-red-500 hover:bg-red-100 transition-all"
            title="Delete Product"
          >
            <Trash2 size={20} />
          </button>
          <Link 
            href="/products" 
            className="px-6 py-3 rounded-2xl border border-gray-200 dark:border-white/10 text-xs font-black uppercase tracking-widest text-gray-500 hover:bg-gray-50 dark:hover:bg-white/5 transition-all"
          >
            Discard
          </Link>
          <button 
            onClick={handleSave} 
            disabled={saving}
            className="flex items-center gap-2 px-8 py-3 bg-orange-500 hover:bg-orange-400 disabled:opacity-50 text-white rounded-2xl text-xs font-black uppercase tracking-widest shadow-xl shadow-orange-500/20 transition-all active:scale-95"
          >
            {saving ? (
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <Save size={16} />
            )}
            {saving ? "Saving..." : "Update Strategy"}
          </button>
        </div>
      </div>

      {error && (
        <div className="mb-6 p-4 rounded-2xl bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-900/30 flex items-center gap-3 text-red-600 dark:text-red-400 text-sm font-bold animate-in fade-in slide-in-from-top-2">
          <AlertCircle size={18} />
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white dark:bg-card rounded-[2.5rem] border border-gray-100 dark:border-white/5 p-8 shadow-sm">
            <div className="flex items-center gap-2 mb-6 text-gray-400">
              <Info size={16} />
              <h2 className="text-[10px] font-black uppercase tracking-[0.2em]">Essential Identity</h2>
            </div>
            
            <div className="space-y-6">
              <div className="space-y-2">
                <label className="block text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">Product Name *</label>
                <input 
                  type="text" 
                  placeholder="e.g. Traditional Idly Batter" 
                  value={form.name}
                  onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                  className="w-full px-6 py-4 text-base font-bold bg-slate-50 dark:bg-white/5 border-none rounded-2xl outline-none focus:ring-4 ring-orange-500/10 dark:text-white transition-all placeholder:text-gray-300 dark:placeholder:text-white/10" 
                />
              </div>

              <div className="space-y-2">
                <label className="block text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">Visual Narrative (Description)</label>
                <textarea 
                  placeholder="Tell the story of this product..." 
                  rows={4}
                  value={form.description}
                  onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                  className="w-full px-6 py-4 text-base font-bold bg-slate-50 dark:bg-white/5 border-none rounded-2xl outline-none focus:ring-4 ring-orange-500/10 dark:text-white transition-all placeholder:text-gray-300 dark:placeholder:text-white/10 resize-none" 
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <label className="block text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">Category Classification</label>
                  <div className="relative">
                    <select 
                      value={form.category} 
                      onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}
                      className="w-full appearance-none bg-slate-50 dark:bg-white/5 border-none rounded-2xl px-6 py-4 text-base font-bold focus:outline-none focus:ring-4 ring-orange-500/10 dark:text-white transition-all"
                    >
                      {["BATTER", "SNACK", "BEVERAGE", "CONDIMENT", "OTHER"].map((c) => <option key={c} value={c}>{c}</option>)}
                    </select>
                    <ChevronDown size={18} className="absolute right-5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="block text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">Size</label>
                  <div className="relative">
                    <select 
                      value={size} 
                      onChange={(e) => setSize(e.target.value)}
                      className="w-full appearance-none bg-slate-50 dark:bg-white/5 border-none rounded-2xl px-6 py-4 text-base font-bold focus:outline-none focus:ring-4 ring-orange-500/10 dark:text-white transition-all"
                    >
                      {PREDEFINED_SIZES.map((s) => <option key={s} value={s}>{s}</option>)}
                    </select>
                    <ChevronDown size={18} className="absolute right-5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="block text-[11px] font-black text-orange-500 uppercase tracking-widest ml-1">SKU (Auto)</label>
                  <input 
                    type="text" 
                    value={form.sku}
                    readOnly
                    className="w-full px-6 py-4 text-base font-black bg-orange-500/5 dark:bg-orange-500/10 border-none rounded-2xl outline-none text-orange-600 dark:text-orange-400 cursor-not-allowed transition-all" 
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="block text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">HSN Code (GST)</label>
                  <input 
                    type="text" 
                    placeholder="e.g. 2106" 
                    value={form.hsnCode}
                    onChange={(e) => setForm((f) => ({ ...f, hsnCode: e.target.value }))}
                    className="w-full px-6 py-4 text-base font-bold bg-slate-50 dark:bg-white/5 border-none rounded-2xl outline-none focus:ring-4 ring-orange-500/10 dark:text-white transition-all placeholder:text-gray-300 dark:placeholder:text-white/10" 
                  />
                </div>
                <div className="space-y-2">
                  <label className="block text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">Product Type</label>
                  <div className="relative">
                    <select 
                      value={form.productType} 
                      onChange={(e) => setForm((f) => ({ ...f, productType: e.target.value }))}
                      className="w-full appearance-none bg-slate-50 dark:bg-white/5 border-none rounded-2xl px-6 py-4 text-base font-bold focus:outline-none focus:ring-4 ring-orange-500/10 dark:text-white transition-all"
                    >
                      <option value="FINISHED_GOOD">Finished Good (Stocked)</option>
                      <option value="MADE_TO_ORDER">Made to Order (Fresh)</option>
                    </select>
                    <ChevronDown size={18} className="absolute right-5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-card rounded-[2.5rem] border border-gray-100 dark:border-white/5 p-8 shadow-sm">
            <div className="flex items-center gap-2 mb-6 text-gray-400">
              <IndianRupee size={16} />
              <h2 className="text-[10px] font-black uppercase tracking-[0.2em]">Financial Architecture</h2>
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="block text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">Base Price (₹) *</label>
                <div className="relative">
                  <div className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-400 font-bold">₹</div>
                  <input 
                    type="number" 
                    min={0} 
                    step={0.01} 
                    value={form.basePrice}
                    onChange={(e) => setForm((f) => ({ ...f, basePrice: Number(e.target.value) }))}
                    className="w-full pl-12 pr-6 py-4 text-base font-bold bg-slate-50 dark:bg-white/5 border-none rounded-2xl outline-none focus:ring-4 ring-orange-500/10 dark:text-white transition-all" 
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="block text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">Tax Protocol (%)</label>
                <div className="relative">
                  <input 
                    type="number" 
                    min={0} 
                    max={100} 
                    value={form.taxPercent}
                    onChange={(e) => setForm((f) => ({ ...f, taxPercent: Number(e.target.value) }))}
                    className="w-full px-6 py-4 text-base font-bold bg-slate-50 dark:bg-white/5 border-none rounded-2xl outline-none focus:ring-4 ring-orange-500/10 dark:text-white transition-all" 
                  />
                  <div className="absolute right-6 top-1/2 -translate-y-1/2 text-gray-400 font-bold">%</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white dark:bg-card rounded-[2.5rem] border border-gray-100 dark:border-white/5 p-8 shadow-sm">
            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-6">Market Status</h3>
            
            <div className="space-y-6">
              <label className="flex items-center justify-between cursor-pointer group">
                <div className="space-y-0.5">
                  <span className="text-sm font-black text-gray-900 dark:text-white block">Active Status</span>
                  <span className="text-[10px] font-bold text-gray-400 uppercase">Visible to everyone</span>
                </div>
                <div className="relative inline-flex items-center cursor-pointer">
                  <input 
                    type="checkbox" 
                    checked={form.isActive} 
                    onChange={(e) => setForm(f => ({ ...f, isActive: e.target.checked }))}
                    className="sr-only peer" 
                  />
                  <div className="w-12 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer dark:bg-white/5 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[4px] after:left-[4px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all dark:border-gray-600 peer-checked:bg-orange-500"></div>
                </div>
              </label>

              <div className="h-px bg-gray-100 dark:bg-white/5" />

              <label className="flex items-center justify-between cursor-pointer group">
                <div className="space-y-0.5">
                  <span className="text-sm font-black text-gray-900 dark:text-white block">Menu Visibility</span>
                  <span className="text-[10px] font-bold text-gray-400 uppercase">Show in POS Menu</span>
                </div>
                <div className="relative inline-flex items-center cursor-pointer">
                  <input 
                    type="checkbox" 
                    checked={form.is_menu_item} 
                    onChange={(e) => setForm(f => ({ ...f, is_menu_item: e.target.checked }))}
                    className="sr-only peer" 
                  />
                  <div className="w-12 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer dark:bg-white/5 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[4px] after:left-[4px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all dark:border-gray-600 peer-checked:bg-orange-500"></div>
                </div>
              </label>

              <div className="h-px bg-gray-100 dark:bg-white/5" />

              <label className="flex items-center justify-between cursor-pointer group">
                <div className="space-y-0.5">
                  <span className="text-sm font-black text-gray-900 dark:text-white block">Dietary Profile</span>
                  <span className="text-[10px] font-bold text-gray-400 uppercase">
                    {form.isVeg ? "🟢 Vegetarian" : "🔴 Non-Veg"}
                  </span>
                </div>
                <div className="relative inline-flex items-center cursor-pointer">
                  <input 
                    type="checkbox" 
                    checked={form.isVeg} 
                    onChange={(e) => setForm(f => ({ ...f, isVeg: e.target.checked }))}
                    className="sr-only peer" 
                  />
                  <div className="w-12 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer dark:bg-white/5 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[4px] after:left-[4px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all dark:border-gray-600 peer-checked:bg-emerald-500"></div>
                </div>
              </label>
            </div>
          </div>

          <div className="bg-orange-500/5 dark:bg-orange-500/10 rounded-[2.5rem] border border-orange-500/10 p-8">
            <div className="flex gap-4 mb-4">
              <div className="w-10 h-10 rounded-2xl bg-orange-500 flex items-center justify-center text-white shrink-0">
                <CheckCircle2 size={20} />
              </div>
              <div>
                <h4 className="text-sm font-black text-orange-600 dark:text-orange-400">Update Settings</h4>
                <p className="text-xs font-bold text-orange-900/40 dark:text-orange-400/40 mt-0.5">Changes take effect immediately across all platforms.</p>
              </div>
            </div>
            <button 
              onClick={handleSave} 
              disabled={saving}
              className="w-full py-4 bg-orange-500 hover:bg-orange-400 disabled:opacity-50 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl shadow-orange-500/20 transition-all active:scale-95"
            >
              {saving ? "Processing..." : "Confirm & Update"}
            </button>
          </div>

          <button 
            onClick={handleDelete}
            className="w-full py-4 rounded-2xl border border-red-200 dark:border-red-900/20 text-[10px] font-black uppercase tracking-widest text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10 transition-all"
          >
            Archive Product
          </button>
        </div>
      </div>
      
      <div className="fixed bottom-6 left-6 right-6 md:hidden flex gap-3">
        <button 
          onClick={handleDelete}
          className="p-5 bg-red-500 text-white rounded-[2rem] shadow-2xl shadow-red-500/40"
        >
          <Trash2 size={20} />
        </button>
        <button 
          onClick={handleSave} 
          disabled={saving}
          className="flex-1 py-5 bg-orange-500 hover:bg-orange-400 disabled:opacity-50 text-white rounded-[2rem] text-xs font-black uppercase tracking-[0.2em] shadow-2xl shadow-orange-500/40 transition-all active:scale-95 flex items-center justify-center gap-3"
        >
          {saving ? (
            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            <Save size={18} />
          )}
          {saving ? "Updating..." : "Update Product"}
        </button>
      </div>
    </div>
  );
}
