"use client";

import { useState, useEffect, useRef } from "react";
import { 
  ArrowLeft, Save, Info, X,
  Sparkles, ChevronDown, 
  AlertCircle, CheckCircle2,
  Layers, Package, Scale
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { rawMaterialsApi, franchiseApi } from "@/lib/api";
import { ITEM_CATEGORIES, UNITS } from "@/lib/constants";
import { useAuth } from "@/context/AuthContext";
import { clsx } from "clsx";
import { PREDEFINED_SIZES, generateSKU } from "@/lib/utils/erp";

export default function AddMaterialPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [franchises, setFranchises] = useState<any[]>([]);
  const [vendors, setVendors]         = useState<any[]>([]);
  const [saving, setSaving] = useState(false);
  const [error, setError]   = useState<string | null>(null);
  const [sourceType, setSourceType] = useState<"VENDOR" | "DIRECT">("DIRECT");
  
  const [form, setForm] = useState({
    name: "",
    sku: "",
    unit: "kg",
    minimumStock: 10,
    category: "RAW_MATERIAL",
    initialStock: 0,
    vendorId: "",
    hsnCode: "",
    taxPercent: 0,
    gstRate: 0,
    franchiseId: "",
  });

  const [size, setSize] = useState("1KG");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [fRes, vRes] = await Promise.all([
          franchiseApi.getAll().catch(() => ({ data: [] })),
          vendorsApi.getAll().catch(() => ({ data: [] }))
        ]);
        setFranchises(fRes.data || []);
        setVendors(vRes.data || []);
      } catch (e) {
        console.error("Failed to fetch data", e);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    const sku = generateSKU(form.category, form.name, size);
    setForm((f) => ({ ...f, sku }));
  }, [form.category, form.name, size]);

  const handleSave = async () => {
    if (!form.name) {
      setError("Material name is required");
      return;
    }

    setSaving(true);
    setError(null);
    try {
      await rawMaterialsApi.create({
        ...form,
        vendorId: sourceType === "VENDOR" ? form.vendorId : null,
        initialStock: Number(form.initialStock) || 0,
      });
      router.push("/inventory/stock");
    } catch (e: any) {
      console.error(e);
      setError(e.response?.data?.error || "Failed to create material. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto pb-20 px-4">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-10 gap-6">
        <div className="space-y-1">
          <div className="flex items-center gap-4 mb-2">
            <Link 
              href="/inventory/stock" 
              className="p-3 rounded-2xl bg-white dark:bg-white/5 border border-gray-100 dark:border-white/10 text-gray-500 hover:text-orange-500 transition-all hover:shadow-xl hover:scale-105"
            >
              <ArrowLeft size={22} />
            </Link>
            <div>
              <h1 className="text-4xl font-black text-gray-900 dark:text-white tracking-tight">
                New Material
              </h1>
              <p className="text-sm text-gray-500 dark:text-slate-400 flex items-center gap-2 mt-1">
                <Sparkles size={14} className="text-orange-500" />
                Defining a new resource for the supply chain
              </p>
            </div>
          </div>
        </div>

        <div className="flex gap-4">
          <Link 
            href="/inventory/stock" 
            className="px-8 py-4 rounded-[2rem] border-2 border-gray-100 dark:border-white/5 text-[11px] font-black uppercase tracking-[0.2em] text-gray-500 hover:bg-gray-50 dark:hover:bg-white/5 transition-all"
          >
            Cancel
          </Link>
          <button 
            onClick={handleSave} 
            disabled={saving}
            className="flex items-center gap-3 px-10 py-4 bg-orange-500 hover:bg-orange-400 disabled:opacity-50 text-white rounded-[2rem] text-[11px] font-black uppercase tracking-[0.2em] shadow-2xl shadow-orange-500/30 transition-all active:scale-95"
          >
            {saving ? (
              <div className="w-5 h-5 border-3 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <Save size={18} />
            )}
            {saving ? "Creating..." : "Save Material"}
          </button>
        </div>
      </div>

      {error && (
        <div className="mb-8 p-5 rounded-3xl bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-900/30 flex items-center gap-4 text-red-600 dark:text-red-400 text-sm font-black uppercase tracking-widest animate-in fade-in slide-in-from-top-4 duration-300">
          <div className="w-10 h-10 rounded-2xl bg-red-100 dark:bg-red-500/20 flex items-center justify-center shrink-0">
            <AlertCircle size={20} />
          </div>
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-8 space-y-8">
          {/* Main Card */}
          <div className="bg-white dark:bg-card rounded-[3rem] border border-gray-100 dark:border-white/5 p-10 shadow-2xl shadow-slate-200/50 dark:shadow-none relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-orange-500/5 rounded-bl-[120px] -mr-20 -mt-20 pointer-events-none" />
            
            <div className="flex items-center justify-between mb-10">
              <div className="flex items-center gap-3 text-slate-400">
                <div className="w-10 h-10 rounded-2xl bg-slate-50 dark:bg-white/5 flex items-center justify-center">
                  <Layers size={18} />
                </div>
                <h2 className="text-[11px] font-black uppercase tracking-[0.3em]">Identification</h2>
              </div>
              <div className="flex p-1.5 bg-slate-100 dark:bg-white/5 rounded-2xl border border-slate-200 dark:border-white/10 relative z-10">
                <button 
                  onClick={() => setSourceType("DIRECT")}
                  className={clsx("px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all", 
                    sourceType === "DIRECT" ? "bg-white dark:bg-slate-800 text-blue-600 shadow-xl" : "text-slate-400 hover:text-slate-600")}
                >
                  Direct Stock
                </button>
                <button 
                  onClick={() => setSourceType("VENDOR")}
                  className={clsx("px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all", 
                    sourceType === "VENDOR" ? "bg-white dark:bg-slate-800 text-indigo-600 shadow-xl" : "text-slate-400 hover:text-slate-600")}
                >
                  From Vendor
                </button>
              </div>
            </div>
            
            <div className="space-y-8 relative z-10">
              {sourceType === "VENDOR" && (
                <div className="p-8 bg-indigo-500/5 border border-indigo-500/10 rounded-[2.5rem] space-y-4 animate-in zoom-in-95 duration-300">
                   <div className="flex items-center gap-3 mb-2">
                      <div className="w-8 h-8 rounded-xl bg-indigo-500 flex items-center justify-center text-white"><Package size={14} /></div>
                      <label className="text-[11px] font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-widest">Preferred Vendor Linkage</label>
                   </div>
                   <div className="relative">
                      <select 
                        value={form.vendorId} 
                        onChange={(e) => setForm((f) => ({ ...f, vendorId: e.target.value }))}
                        className="w-full appearance-none bg-white dark:bg-slate-900 border-2 border-transparent focus:border-indigo-500/30 rounded-[1.5rem] px-6 py-4 text-sm font-black focus:outline-none dark:text-white transition-all shadow-sm"
                      >
                        <option value="">Select Vendor</option>
                        {vendors.map((v) => <option key={v.id} value={v.id}>{v.name}</option>)}
                      </select>
                      <ChevronDown size={18} className="absolute right-6 top-1/2 -translate-y-1/2 text-indigo-300 pointer-events-none" />
                   </div>
                </div>
              )}

              <div className="space-y-3">
                <label className="block text-[11px] font-black text-slate-400 uppercase tracking-widest ml-2">Material Name *</label>
                <input 
                  type="text" 
                  placeholder="e.g. Premium Basmati Rice" 
                  value={form.name}
                  onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                  className="w-full px-8 py-5 text-lg font-black bg-slate-50 dark:bg-white/5 border-2 border-transparent focus:border-orange-500/20 rounded-[2rem] outline-none dark:text-white transition-all placeholder:text-slate-300 dark:placeholder:text-white/5" 
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-3">
                  <label className="block text-[11px] font-black text-slate-400 uppercase tracking-widest ml-2">Classification</label>
                  <div className="relative">
                    <select 
                      value={form.category} 
                      onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}
                      className="w-full appearance-none bg-slate-50 dark:bg-white/5 border-2 border-transparent focus:border-orange-500/20 rounded-[1.5rem] px-8 py-4 text-sm font-black focus:outline-none dark:text-white transition-all"
                    >
                      {ITEM_CATEGORIES.map((c) => <option key={c} value={c}>{c.replace("_", " ")}</option>)}
                    </select>
                    <ChevronDown size={20} className="absolute right-6 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                  </div>
                </div>
                
                <div className="space-y-3">
                  <label className="block text-[11px] font-black text-orange-500 uppercase tracking-widest ml-2">SKU (Auto-Generated)</label>
                  <div className="relative group">
                    <input 
                      type="text" 
                      value={form.sku}
                      readOnly
                      className="w-full px-8 py-4 text-sm font-black bg-orange-500/5 dark:bg-orange-500/10 border-2 border-orange-500/10 rounded-[1.5rem] outline-none text-orange-600 dark:text-orange-400 cursor-not-allowed transition-all" 
                    />
                    <Sparkles size={16} className="absolute right-6 top-1/2 -translate-y-1/2 text-orange-400/50" />
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <label className="block text-[11px] font-black text-slate-400 uppercase tracking-widest ml-2">Size Variation</label>
                <div className="flex flex-wrap gap-3">
                  {["1KG", "500G", "250G", "100G"].map((s) => (
                    <button 
                      key={s}
                      type="button"
                      onClick={() => setSize(s)}
                      className={clsx(
                        "px-8 py-4 rounded-2xl font-black text-[11px] uppercase tracking-widest transition-all",
                        size === s ? "bg-slate-900 dark:bg-orange-500 text-white shadow-2xl scale-105" : "bg-slate-50 dark:bg-white/5 text-slate-400 hover:bg-slate-100"
                      )}
                    >
                      {s}
                    </button>
                  ))}
                  {size === "OTHER" ? (
                    <input 
                      autoFocus
                      onChange={(e) => setSize(e.target.value.toUpperCase())}
                      placeholder="CUSTOM (e.g. 10KG)"
                      className="px-8 py-4 bg-white dark:bg-slate-900 border-2 border-orange-500 rounded-2xl font-black text-[11px] uppercase tracking-widest focus:ring-4 ring-orange-500/10 outline-none animate-in zoom-in-95"
                    />
                  ) : !["1KG", "500G", "250G", "100G"].includes(size) ? (
                    <div className="flex items-center gap-3 bg-slate-900 dark:bg-orange-500 text-white px-8 py-4 rounded-2xl shadow-2xl scale-105">
                      <span className="font-black text-[11px] uppercase tracking-widest">{size}</span>
                      <button onClick={() => setSize("1KG")} className="opacity-60 hover:opacity-100 transition-opacity">
                        <X size={14} />
                      </button>
                    </div>
                  ) : (
                    <button 
                      type="button"
                      onClick={() => setSize("OTHER")}
                      className="px-8 py-4 rounded-2xl font-black text-[11px] uppercase tracking-widest transition-all border-2 border-dashed border-slate-200 dark:border-white/10 text-slate-400 hover:border-orange-500 hover:text-orange-500"
                    >
                      + Custom
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Compliance Card */}
          <div className="bg-white dark:bg-card rounded-[3rem] border border-gray-100 dark:border-white/5 p-10 shadow-xl relative overflow-hidden">
            <div className="flex items-center gap-3 mb-8 text-slate-400">
               <div className="w-10 h-10 rounded-2xl bg-slate-50 dark:bg-white/5 flex items-center justify-center">
                 <CheckCircle2 size={18} />
               </div>
               <h2 className="text-[11px] font-black uppercase tracking-[0.3em]">Taxation & Logistics</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="space-y-3">
                <label className="block text-[11px] font-black text-slate-400 uppercase tracking-widest ml-2">HSN Code</label>
                <input 
                  type="text" 
                  placeholder="e.g. 1006" 
                  value={form.hsnCode}
                  onChange={(e) => setForm((f) => ({ ...f, hsnCode: e.target.value }))}
                  className="w-full px-6 py-4 text-sm font-black bg-slate-50 dark:bg-white/5 border-2 border-transparent focus:border-indigo-500/20 rounded-[1.5rem] outline-none dark:text-white transition-all placeholder:text-slate-300" 
                />
              </div>
              <div className="space-y-3">
                <label className="block text-[11px] font-black text-slate-400 uppercase tracking-widest ml-2">GST Rate (%)</label>
                <div className="relative">
                  <select 
                    value={form.gstRate} 
                    onChange={(e) => setForm((f) => ({ ...f, gstRate: Number(e.target.value) }))}
                    className="w-full appearance-none bg-slate-50 dark:bg-white/5 border-2 border-transparent focus:border-indigo-500/20 rounded-[1.5rem] px-6 py-4 text-sm font-black focus:outline-none dark:text-white transition-all"
                  >
                    {[0, 5, 12, 18, 28].map((rate) => <option key={rate} value={rate}>{rate}% GST</option>)}
                  </select>
                  <ChevronDown size={18} className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                </div>
              </div>
              <div className="space-y-3">
                <label className="block text-[11px] font-black text-slate-400 uppercase tracking-widest ml-2">Min. Stock Level</label>
                <div className="relative">
                  <input 
                    type="number" 
                    min={0} 
                    value={form.minimumStock}
                    onChange={(e) => setForm((f) => ({ ...f, minimumStock: Number(e.target.value) }))}
                    className="w-full px-6 py-4 text-sm font-black bg-slate-50 dark:bg-white/5 border-2 border-transparent focus:border-indigo-500/20 rounded-[1.5rem] outline-none dark:text-white transition-all" 
                  />
                  <div className="absolute right-6 top-1/2 -translate-y-1/2 text-[10px] font-black text-slate-400 uppercase">{form.unit}</div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-8 pt-8 border-t border-slate-100 dark:border-white/5">
              <div className="space-y-3">
                <label className="block text-[11px] font-black text-slate-400 uppercase tracking-widest ml-2">Unit of Measure</label>
                <div className="relative">
                  <select 
                    value={form.unit} 
                    onChange={(e) => setForm((f) => ({ ...f, unit: e.target.value }))}
                    className="w-full appearance-none bg-slate-50 dark:bg-white/5 border-2 border-transparent focus:border-indigo-500/20 rounded-[1.5rem] px-8 py-4 text-sm font-black focus:outline-none dark:text-white transition-all"
                  >
                    {UNITS.map((u) => <option key={u} value={u}>{u}</option>)}
                  </select>
                  <ChevronDown size={20} className="absolute right-6 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                </div>
              </div>

              {user?.role === "SUPER_ADMIN" && (
                <div className="space-y-3">
                  <label className="block text-[11px] font-black text-slate-400 uppercase tracking-widest ml-2">Assign to Franchise</label>
                  <div className="relative">
                    <select 
                      value={form.franchiseId} 
                      onChange={(e) => setForm((f) => ({ ...f, franchiseId: e.target.value }))}
                      className="w-full appearance-none bg-slate-50 dark:bg-white/5 border-2 border-transparent focus:border-indigo-500/20 rounded-[1.5rem] px-8 py-4 text-sm font-black focus:outline-none dark:text-white transition-all"
                    >
                      <option value="">Select Franchise</option>
                      {franchises.map((fran) => <option key={fran.id} value={fran.id}>{fran.name}</option>)}
                    </select>
                    <ChevronDown size={20} className="absolute right-6 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Sidebar Controls */}
        <div className="lg:col-span-4 space-y-8">
          <div className="bg-white dark:bg-card rounded-[3rem] border border-gray-100 dark:border-white/5 p-8 shadow-xl">
            <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.3em] mb-8 flex items-center gap-2">
              <Scale size={14} /> Initial Reconciliation
            </h3>
            
            <div className="space-y-8">
              <div className="space-y-3">
                <label className="block text-[11px] font-black text-slate-400 uppercase tracking-widest ml-2">Opening Stock Balance</label>
                <div className="relative">
                  <input 
                    type="number" 
                    min={0} 
                    step={0.01}
                    placeholder="0.00"
                    value={form.initialStock}
                    onChange={(e) => setForm((f) => ({ ...f, initialStock: Number(e.target.value) }))}
                    className="w-full px-8 py-6 text-3xl font-black bg-slate-50 dark:bg-white/5 border-2 border-transparent focus:border-orange-500/20 rounded-[2rem] outline-none dark:text-white transition-all placeholder:text-slate-200" 
                  />
                  <div className="absolute right-8 top-1/2 -translate-y-1/2 text-xs font-black text-slate-400 uppercase tracking-widest">{form.unit}</div>
                </div>
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mt-4 leading-relaxed px-2">
                  <Info size={10} className="inline mr-1 text-indigo-500" />
                  This balance will be recorded as the starting point for inventory tracking.
                </p>
              </div>
            </div>
          </div>

          <div className="bg-indigo-600 rounded-[3rem] p-10 text-white shadow-2xl shadow-indigo-500/30 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-bl-full -mr-10 -mt-10 transition-transform group-hover:scale-110" />
            
            <div className="relative z-10">
              <div className="w-14 h-14 rounded-3xl bg-white/20 backdrop-blur-md flex items-center justify-center mb-6">
                <CheckCircle2 size={28} />
              </div>
              <h4 className="text-xl font-black uppercase tracking-tight mb-2">Ready to Track?</h4>
              <p className="text-sm font-medium text-indigo-100 leading-relaxed mb-8">
                Once created, this material will be globally available for Procurement, Recipes, and Production Batching.
              </p>
              <button 
                onClick={handleSave} 
                disabled={saving}
                className="w-full py-5 bg-white text-indigo-600 hover:bg-indigo-50 disabled:opacity-50 rounded-[2rem] text-[11px] font-black uppercase tracking-[0.2em] shadow-xl transition-all active:scale-95"
              >
                {saving ? "Creating Material..." : "Establish Resource"}
              </button>
            </div>
          </div>
        </div>
      </div>
      
      {/* Mobile Actions */}
      <div className="fixed bottom-6 left-6 right-6 md:hidden">
        <button 
          onClick={handleSave} 
          disabled={saving}
          className="w-full py-5 bg-orange-500 hover:bg-orange-400 disabled:opacity-50 text-white rounded-[2rem] text-xs font-black uppercase tracking-[0.2em] shadow-2xl shadow-orange-500/40 transition-all active:scale-95 flex items-center justify-center gap-3"
        >
          {saving ? (
            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            <Save size={18} />
          )}
          {saving ? "Creating Material..." : "Create Material"}
        </button>
      </div>
    </div>
  );
}
