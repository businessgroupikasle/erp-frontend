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
    <div className="max-w-4xl mx-auto pb-20">
      {/* Header Section */}
      <div className="flex items-center justify-between mb-8">
        <div className="space-y-1">
          <div className="flex items-center gap-3 mb-2">
            <Link 
              href="/inventory/stock" 
              className="p-2 rounded-xl bg-white dark:bg-white/5 border border-gray-100 dark:border-white/10 text-gray-500 hover:text-orange-500 transition-all hover:shadow-md"
            >
              <ArrowLeft size={20} />
            </Link>
            <h1 className="text-3xl font-black text-gray-900 dark:text-white tracking-tight">
              New Material
            </h1>
          </div>
          <p className="text-sm text-gray-500 dark:text-slate-400 flex items-center gap-2">
            <Sparkles size={14} className="text-orange-500" />
            Defining a new resource for the supply chain
          </p>
        </div>

        <div className="hidden md:flex gap-3">
          <Link 
            href="/inventory/stock" 
            className="px-6 py-3 rounded-2xl border border-gray-200 dark:border-white/10 text-xs font-black uppercase tracking-widest text-gray-500 hover:bg-gray-50 dark:hover:bg-white/5 transition-all"
          >
            Cancel
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
            {saving ? "Creating..." : "Save Material"}
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
        {/* Main Configuration */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white dark:bg-card rounded-[2.5rem] border border-gray-100 dark:border-white/5 p-8 shadow-sm">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-2 text-gray-400">
                <Layers size={16} />
                <h2 className="text-[10px] font-black uppercase tracking-[0.2em]">Material Sourcing</h2>
              </div>
              <div className="flex p-1 bg-slate-100 dark:bg-white/5 rounded-xl border border-slate-200 dark:border-white/10">
                <button 
                  onClick={() => setSourceType("DIRECT")}
                  className={clsx("px-4 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all", 
                    sourceType === "DIRECT" ? "bg-white dark:bg-slate-800 text-blue-500 shadow-sm" : "text-slate-400 hover:text-slate-600")}
                >
                  Direct Stock
                </button>
                <button 
                  onClick={() => setSourceType("VENDOR")}
                  className={clsx("px-4 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all", 
                    sourceType === "VENDOR" ? "bg-white dark:bg-slate-800 text-purple-500 shadow-sm" : "text-slate-400 hover:text-slate-600")}
                >
                  From Vendor
                </button>
              </div>
            </div>
            
            <div className="space-y-6">
              {sourceType === "VENDOR" && (
                <div className="p-6 bg-purple-500/5 border border-purple-500/10 rounded-3xl space-y-4 animate-in slide-in-from-top-2">
                   <label className="block text-[11px] font-black text-purple-500 uppercase tracking-widest ml-1">Link Registered Vendor *</label>
                   <div className="relative">
                      <select 
                        value={form.vendorId} 
                        onChange={(e) => setForm((f) => ({ ...f, vendorId: e.target.value }))}
                        className="w-full appearance-none bg-white dark:bg-slate-900 border-none rounded-2xl px-6 py-4 text-base font-bold focus:outline-none focus:ring-4 ring-purple-500/10 dark:text-white transition-all shadow-sm"
                      >
                        <option value="">Select Vendor</option>
                        {vendors.map((v) => <option key={v.id} value={v.id}>{v.name}</option>)}
                      </select>
                      <ChevronDown size={18} className="absolute right-5 top-1/2 -translate-y-1/2 text-purple-300 pointer-events-none" />
                   </div>
                   <p className="text-[10px] font-bold text-purple-400 uppercase tracking-tight flex items-center gap-1.5 ml-1">
                      <Sparkles size={12} /> Link this material to a specific supplier for auto-GRN and price tracking.
                   </p>
                </div>
              )}

              <div className="space-y-2">
                <label className="block text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">Material Name *</label>
                <input 
                  type="text" 
                  placeholder="e.g. Premium Basmati Rice" 
                  value={form.name}
                  onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                  className="w-full px-6 py-4 text-base font-bold bg-slate-50 dark:bg-white/5 border-none rounded-2xl outline-none focus:ring-4 ring-orange-500/10 dark:text-white transition-all placeholder:text-gray-300 dark:placeholder:text-white/10" 
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <label className="block text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">Classification</label>
                  <div className="relative">
                    <select 
                      value={form.category} 
                      onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}
                      className="w-full appearance-none bg-slate-50 dark:bg-white/5 border-none rounded-2xl px-6 py-4 text-base font-bold focus:outline-none focus:ring-4 ring-orange-500/10 dark:text-white transition-all"
                    >
                      {ITEM_CATEGORIES.map((c) => <option key={c} value={c}>{c.replace("_", " ")}</option>)}
                    </select>
                    <ChevronDown size={18} className="absolute right-5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                  </div>
                </div>
                <div className="space-y-4">
                  <label className="block text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">Size Regulation</label>
                  <div className="flex flex-wrap gap-2">
                    {["1KG", "500G", "250G", "100G"].map((s) => (
                      <button 
                        key={s}
                        type="button"
                        onClick={() => setSize(s)}
                        className={clsx(
                          "px-5 py-3 rounded-[1.25rem] font-black text-[10px] uppercase tracking-widest transition-all",
                          size === s ? "bg-slate-900 dark:bg-orange-500 text-white shadow-lg" : "bg-slate-50 dark:bg-white/5 text-gray-400 hover:bg-slate-100"
                        )}
                      >
                        {s}
                      </button>
                    ))}
                    {!["1KG", "500G", "250G", "100G", "OTHER"].includes(size) ? (
                      <div className="flex items-center gap-2 bg-slate-900 dark:bg-orange-500 text-white px-5 py-3 rounded-[1.25rem] shadow-lg animate-in zoom-in-95">
                        <span className="font-black text-[10px] uppercase tracking-widest">{size}</span>
                        <button onClick={() => setSize("1KG")} className="opacity-60 hover:opacity-100 transition-opacity">
                          <X size={12} />
                        </button>
                      </div>
                    ) : (
                      <button 
                        type="button"
                        onClick={() => setSize("OTHER")}
                        className={clsx(
                          "px-5 py-3 rounded-[1.25rem] font-black text-[10px] uppercase tracking-widest transition-all border border-dashed text-gray-400",
                          size === "OTHER" ? "border-slate-900 dark:border-orange-500 text-slate-900 dark:text-orange-500" : "border-gray-200 dark:border-white/10 hover:border-gray-300"
                        )}
                      >
                        + Add New
                      </button>
                    )}
                  </div>
                  {size === "OTHER" && (
                    <input 
                      autoFocus
                      onChange={(e) => setSize(e.target.value.toUpperCase())}
                      placeholder="Custom Size (e.g. 10KG)"
                      className="mt-2 w-full px-6 py-4 bg-slate-50 dark:bg-white/5 border-2 border-slate-900/20 dark:border-orange-500/20 rounded-2xl font-bold text-base focus:ring-4 ring-orange-500/10 outline-none animate-in slide-in-from-top-2"
                    />
                  )}
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
                    placeholder="e.g. 1006" 
                    value={form.hsnCode}
                    onChange={(e) => setForm((f) => ({ ...f, hsnCode: e.target.value }))}
                    className="w-full px-6 py-4 text-base font-bold bg-slate-50 dark:bg-white/5 border-none rounded-2xl outline-none focus:ring-4 ring-orange-500/10 dark:text-white transition-all placeholder:text-gray-300 dark:placeholder:text-white/10" 
                  />
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

              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="block text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">HSN Code</label>
                  <input 
                    type="text" 
                    placeholder="e.g. 1006" 
                    value={form.hsnCode}
                    onChange={(e) => setForm((f) => ({ ...f, hsnCode: e.target.value }))}
                    className="w-full px-6 py-4 text-base font-bold bg-slate-50 dark:bg-white/5 border-none rounded-2xl outline-none focus:ring-4 ring-orange-500/10 dark:text-white transition-all placeholder:text-gray-300 dark:placeholder:text-white/10" 
                  />
                </div>
                <div className="space-y-2">
                  <label className="block text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">GST Rate (%)</label>
                  <div className="relative">
                    <select 
                      value={form.gstRate} 
                      onChange={(e) => setForm((f) => ({ ...f, gstRate: Number(e.target.value) }))}
                      className="w-full appearance-none bg-slate-50 dark:bg-white/5 border-none rounded-2xl px-6 py-4 text-base font-bold focus:outline-none focus:ring-4 ring-orange-500/10 dark:text-white transition-all"
                    >
                      {[0, 5, 12, 18, 28].map((rate) => <option key={rate} value={rate}>{rate}%</option>)}
                    </select>
                    <ChevronDown size={18} className="absolute right-5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                  </div>
                </div>
              </div>

              {user?.role === "SUPER_ADMIN" && (
                <div className="space-y-2">
                  <label className="block text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">Assign to Franchise</label>
                  <div className="relative">
                    <select 
                      value={form.franchiseId} 
                      onChange={(e) => setForm((f) => ({ ...f, franchiseId: e.target.value }))}
                      className="w-full appearance-none bg-slate-50 dark:bg-white/5 border-none rounded-2xl px-6 py-4 text-base font-bold focus:outline-none focus:ring-4 ring-orange-500/10 dark:text-white transition-all"
                    >
                      <option value="">Select Franchise</option>
                      {franchises.map((fran) => <option key={fran.id} value={fran.id}>{fran.name}</option>)}
                    </select>
                    <ChevronDown size={18} className="absolute right-5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="bg-white dark:bg-card rounded-[2.5rem] border border-gray-100 dark:border-white/5 p-8 shadow-sm">
            <div className="flex items-center gap-2 mb-6 text-gray-400">
              <Scale size={16} />
              <h2 className="text-[10px] font-black uppercase tracking-[0.2em]">Inventory Metrics</h2>
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="block text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">Unit of Measure</label>
                <div className="relative">
                  <select 
                    value={form.unit} 
                    onChange={(e) => setForm((f) => ({ ...f, unit: e.target.value }))}
                    className="w-full appearance-none bg-slate-50 dark:bg-white/5 border-none rounded-2xl px-6 py-4 text-base font-bold focus:outline-none focus:ring-4 ring-orange-500/10 dark:text-white transition-all"
                  >
                    {UNITS.map((u) => <option key={u} value={u}>{u}</option>)}
                  </select>
                  <ChevronDown size={18} className="absolute right-5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                </div>
              </div>
              <div className="space-y-2">
                <label className="block text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">Min. Stock Alert</label>
                <div className="relative">
                  <input 
                    type="number" 
                    min={0} 
                    value={form.minimumStock}
                    onChange={(e) => setForm((f) => ({ ...f, minimumStock: Number(e.target.value) }))}
                    className="w-full px-6 py-4 text-base font-bold bg-slate-50 dark:bg-white/5 border-none rounded-2xl outline-none focus:ring-4 ring-orange-500/10 dark:text-white transition-all" 
                  />
                  <div className="absolute right-6 top-1/2 -translate-y-1/2 text-gray-400 font-bold uppercase text-[10px] tracking-widest">{form.unit}</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar Controls */}
        <div className="space-y-6">
          <div className="bg-white dark:bg-card rounded-[2.5rem] border border-gray-100 dark:border-white/5 p-8 shadow-sm">
            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-6">Initial Reconciliation</h3>
            
            <div className="space-y-6">
              <div className="space-y-2">
                <label className="block text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">Opening Stock</label>
                <div className="relative">
                  <input 
                    type="number" 
                    min={0} 
                    step={0.01}
                    placeholder="0.00"
                    value={form.initialStock}
                    onChange={(e) => setForm((f) => ({ ...f, initialStock: Number(e.target.value) }))}
                    className="w-full px-6 py-5 text-2xl font-black bg-slate-50 dark:bg-white/5 border-none rounded-2xl outline-none focus:ring-4 ring-orange-500/10 dark:text-white transition-all" 
                  />
                  <div className="absolute right-6 top-1/2 -translate-y-1/2 text-gray-400 font-bold uppercase text-[10px] tracking-widest">{form.unit}</div>
                </div>
                <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mt-2 ml-1">Opening balance will be recorded upon save.</p>
              </div>
            </div>
          </div>

          <div className="bg-orange-500/5 dark:bg-orange-500/10 rounded-[2.5rem] border border-orange-500/10 p-8">
            <div className="flex gap-4 mb-4">
              <div className="w-10 h-10 rounded-2xl bg-orange-500 flex items-center justify-center text-white shrink-0">
                <CheckCircle2 size={20} />
              </div>
              <div>
                <h4 className="text-sm font-black text-orange-600 dark:text-orange-400">Ready to track?</h4>
                <p className="text-xs font-bold text-orange-900/40 dark:text-orange-400/40 mt-0.5">This material will be available for Purchase Orders and Recipes immediately.</p>
              </div>
            </div>
            <button 
              onClick={handleSave} 
              disabled={saving}
              className="w-full py-4 bg-orange-500 hover:bg-orange-400 disabled:opacity-50 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl shadow-orange-500/20 transition-all active:scale-95"
            >
              {saving ? "Processing..." : "Establish Resource"}
            </button>
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
