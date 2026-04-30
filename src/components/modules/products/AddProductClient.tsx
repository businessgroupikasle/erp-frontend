"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  Save, ArrowLeft, Sparkles, CheckCircle2, AlertCircle, Info, IndianRupee, ChevronDown, Package
} from "lucide-react";
import { productsFullApi } from "@/lib/api";
import Link from "next/link";
import { clsx } from "clsx";
import { PREDEFINED_SIZES, getCategoryDefaults, generateSKU } from "@/lib/utils/erp";

export default function AddProductClient() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
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

  useEffect(() => {
    if (form.category !== prevCategory.current) {
      const defs = getCategoryDefaults(form.category);
      setForm((f) => ({ ...f, hsnCode: defs.hsnCode, taxPercent: defs.taxPercent }));
      prevCategory.current = form.category;
    }
  }, [form.category]);

  useEffect(() => {
    const sku = generateSKU(form.category, form.name, size);
    setForm((f) => ({ ...f, sku }));
  }, [form.category, form.name, size]);

  const handleSave = async () => {
    if (!form.name) {
      setError("Product name is required");
      return;
    }
    setError(null);
    setSaving(true);
    try {
      await productsFullApi.create(form);
      router.push("/products");
    } catch (e: any) {
      setError(e.response?.data?.message || "Failed to create product.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto py-8 px-4 animate-in fade-in">
      {/* Header */}
      <div className="flex items-center justify-between mb-8 border-b border-gray-100 pb-6">
        <div className="flex items-center gap-4">
          <Link 
            href="/products" 
            className="w-10 h-10 rounded-xl bg-gray-50 text-gray-400 hover:text-orange-500 transition-all flex items-center justify-center group"
          >
            <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
          </Link>
          <div>
            <h1 className="text-2xl font-black text-gray-900 flex items-center gap-2">
              <Package className="text-orange-500" /> New Product
            </h1>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mt-1">Register items to your digital catalog</p>
          </div>
        </div>
        <Link href="/products" className="text-xs font-black text-gray-400 hover:text-gray-600 transition-colors uppercase tracking-widest">
          Cancel
        </Link>
      </div>

      {error && (
        <div className="mb-6 p-4 rounded-2xl bg-red-50 border border-red-100 text-red-600 text-sm font-bold flex items-center gap-2">
          <AlertCircle size={16} /> {error}
        </div>
      )}

      {/* Main Form Card */}
      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-8 space-y-8">
        {/* Basic Info */}
        <div className="space-y-4">
          <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block ml-1">Core Identity</label>
          <input 
            placeholder="Product Name (e.g. Rice Batter)" 
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            className="w-full px-5 py-4 bg-gray-50 rounded-2xl font-bold text-gray-900 border-none outline-none focus:ring-2 ring-orange-100 transition-all"
          />
          <textarea 
            placeholder="Short description..." 
            rows={3}
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            className="w-full px-5 py-4 bg-gray-50 rounded-2xl font-bold text-gray-900 border-none outline-none focus:ring-2 ring-orange-100 transition-all resize-none"
          />
        </div>

        {/* Classification */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
          <div className="space-y-2">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Category</label>
            <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} className="w-full px-5 py-4 bg-gray-50 rounded-2xl font-bold border-none outline-none focus:ring-2 ring-orange-100 transition-all">
              {["BATTER", "SNACK", "BEVERAGE", "CONDIMENT", "OTHER"].map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Size</label>
            <select value={size} onChange={(e) => setSize(e.target.value)} className="w-full px-5 py-4 bg-gray-50 rounded-2xl font-bold border-none outline-none focus:ring-2 ring-orange-100 transition-all">
              {PREDEFINED_SIZES.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          <div className="space-y-2 col-span-2 md:col-span-1">
            <label className="text-[10px] font-black text-orange-500 uppercase tracking-widest ml-1">SKU (Auto)</label>
            <input value={form.sku} readOnly className="w-full px-5 py-4 bg-orange-50 text-orange-600 font-mono font-black text-xs rounded-2xl border-none outline-none" />
          </div>
        </div>

        {/* Financials */}
        <div className="grid grid-cols-2 gap-6 pt-4 border-t border-gray-50">
          <div className="space-y-2">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Base Price (₹)</label>
            <input type="number" value={form.basePrice} onChange={(e) => setForm({ ...form, basePrice: Number(e.target.value) })} className="w-full px-5 py-4 bg-gray-50 rounded-2xl font-bold border-none outline-none focus:ring-2 ring-orange-100 transition-all" />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">GST (%)</label>
            <input type="number" value={form.taxPercent} onChange={(e) => setForm({ ...form, taxPercent: Number(e.target.value) })} className="w-full px-5 py-4 bg-gray-50 rounded-2xl font-bold border-none outline-none focus:ring-2 ring-orange-100 transition-all" />
          </div>
        </div>

        {/* Toggles */}
        <div className="flex flex-wrap gap-6 pt-4">
          <label className="flex items-center gap-3 cursor-pointer group">
            <div className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" checked={form.isVeg} onChange={(e) => setForm({...form, isVeg: e.target.checked})} className="sr-only peer" />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
            </div>
            <span className="text-[11px] font-black text-gray-500 uppercase tracking-widest">{form.isVeg ? "Vegetarian" : "Non-Veg"}</span>
          </label>

          <label className="flex items-center gap-3 cursor-pointer group border-l border-gray-100 pl-6">
            <div className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" checked={form.is_menu_item} onChange={(e) => setForm({...form, is_menu_item: e.target.checked})} className="sr-only peer" />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-orange-500"></div>
            </div>
            <span className="text-[11px] font-black text-gray-500 uppercase tracking-widest">Show in Menu</span>
          </label>
        </div>

        {/* Action Button */}
        <button 
          onClick={handleSave} 
          disabled={saving}
          className="w-full py-5 bg-orange-500 text-white font-black text-xs uppercase tracking-widest rounded-2xl shadow-xl shadow-orange-500/20 hover:bg-orange-600 transition-all flex items-center justify-center gap-3 active:scale-95 disabled:opacity-50"
        >
          {saving ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Sparkles size={16} />}
          {saving ? "Processing..." : "Launch Product"}
        </button>
      </div>
    </div>
  );
}
