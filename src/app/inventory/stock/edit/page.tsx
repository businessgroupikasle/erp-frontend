"use client";

import { useState, useEffect, Suspense } from "react";
import { 
  ArrowLeft, Save, Trash2, Info, 
  Sparkles, ChevronDown, 
  AlertCircle, CheckCircle2,
  Layers, Package, Scale
} from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { rawMaterialsApi, inventoryApi } from "@/lib/api";
import { ITEM_CATEGORIES, UNITS } from "@/lib/constants";
import { clsx } from "clsx";

function EditMaterialForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const id = searchParams.get("id");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving]   = useState(false);
  const [error, setError]     = useState<string | null>(null);
  const [vendors, setVendors] = useState<any[]>([]);
  const [sourceType, setSourceType] = useState<"VENDOR" | "DIRECT">("DIRECT");
  
  const [form, setForm] = useState({
    name: "",
    sku: "",
    unit: "kg",
    minimumStock: 10,
    category: "RAW_MATERIAL",
    hsnCode: "",
    gstRate: 5,
    currentStock: 0,
    vendorId: "",
  });

  useEffect(() => {
    if (!id) {
      setError("No material ID provided.");
      setLoading(false);
      return;
    }

    const fetchData = async () => {
      try {
        const [matRes, vendRes] = await Promise.all([
          inventoryApi.getItem(id as string),
          import("@/lib/api").then(api => api.vendorsApi.getAll())
        ]);

        const m = matRes.data;
        setVendors(vendRes.data);
        setSourceType(m.vendorId ? "VENDOR" : "DIRECT");
        
        setForm({
          name: m.name,
          sku: m.sku ?? "",
          unit: m.unit ?? "kg",
          minimumStock: m.minimumStock ?? 10,
          category: m.category ?? "RAW_MATERIAL",
          hsnCode: m.hsnCode ?? "",
          gstRate: m.gstRate ?? 5,
          currentStock: m.currentStock ?? 0,
          vendorId: m.vendorId ?? "",
        });
      } catch (e: any) {
        console.error(e);
        const msg = e.response?.data?.error || e.response?.data?.message || e.message;
        setError(`Failed to fetch details: ${msg}`);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  const handleSave = async () => {
    if (!id) return;
    if (!form.name) {
      setError("Material name is required");
      return;
    }
    if (sourceType === "VENDOR" && !form.vendorId) {
      setError("Please select a vendor or switch to Direct Stock.");
      return;
    }

    setSaving(true);
    setError(null);
    try {
      const { currentStock, ...updateData } = form;
      await rawMaterialsApi.update(id as string, {
        ...updateData,
        vendorId: sourceType === "VENDOR" ? form.vendorId : null,
      });
      router.push("/inventory/stock");
    } catch (e: any) {
      console.error(e);
      setError(e.response?.data?.error || e.response?.data?.message || "Failed to update material. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!id) return;
    if (!confirm("Are you sure you want to delete this material record? This action cannot be undone if there are no movements.")) return;
    try {
      await rawMaterialsApi.delete(id as string);
      router.push("/inventory/stock");
    } catch (e: any) {
      console.error(e);
      setError(e.response?.data?.error || "Failed to delete material. Ensure it has no stock history.");
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
              Edit Material
            </h1>
          </div>
          <p className="text-sm text-gray-500 dark:text-slate-400 flex items-center gap-2">
            <Sparkles size={14} className="text-orange-500" />
            Optimizing resource parameters: {form.name}
          </p>
        </div>

        <div className="hidden md:flex gap-3">
          <button 
            onClick={handleDelete}
            className="p-3 rounded-2xl bg-red-50 dark:bg-red-900/10 text-red-500 hover:bg-red-100 transition-all"
            title="Delete Material"
          >
            <Trash2 size={20} />
          </button>
          <Link 
            href="/inventory/stock" 
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
            {saving ? "Updating..." : "Update Material"}
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
                <div className="p-6 bg-purple-500/5 border border-purple-500/10 rounded-3xl space-y-4 animate-in slide-in-from-top-2 mb-6">
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
                      <Sparkles size={12} /> Resource sourcing affects procurement history and GRN automation.
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

              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="block text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">SKU / Material Code</label>
                  <input 
                    type="text" 
                    placeholder="RM-RIC-001" 
                    value={form.sku}
                    onChange={(e) => setForm((f) => ({ ...f, sku: e.target.value.toUpperCase() }))}
                    className="w-full px-6 py-4 text-base font-bold bg-slate-50 dark:bg-white/5 border-none rounded-2xl outline-none focus:ring-4 ring-orange-500/10 dark:text-white transition-all placeholder:text-gray-300 dark:placeholder:text-white/10" 
                  />
                </div>
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
             <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4">Stock Availability</h3>
             <div className="flex items-end gap-2 mb-2">
                <span className="text-4xl font-black text-slate-900 dark:text-white tracking-tighter">{(form.currentStock || 0).toFixed(1)}</span>
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">{form.unit}</span>
             </div>
             <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mb-6">Current Inventory Balance</p>
             
             <div className="space-y-3 pt-4 border-t border-slate-50 dark:border-white/5">
                <div className="flex justify-between items-center">
                   <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Alert Threshold</span>
                   <span className="text-xs font-bold text-slate-700 dark:text-slate-200">{form.minimumStock} {form.unit}</span>
                </div>
                <div className="flex justify-between items-center">
                   <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</span>
                   <span className={clsx("px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider", 
                      form.currentStock <= form.minimumStock ? "bg-red-50 text-red-500" : "bg-emerald-50 text-emerald-500")}>
                      {form.currentStock <= form.minimumStock ? "CRITICAL" : "HEALTHY"}
                   </span>
                </div>
             </div>
          </div>

          <div className="bg-white dark:bg-card rounded-[2.5rem] border border-gray-100 dark:border-white/5 p-8 shadow-sm">
             <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4">Stock Integrity</h3>
             <p className="text-xs font-medium text-gray-500 leading-relaxed">
               Modifying the unit or category may affect existing recipes and stock records. Proceed with caution.
             </p>
          </div>

          <div className="bg-orange-500/5 dark:bg-orange-500/10 rounded-[2.5rem] border border-orange-500/10 p-8">
            <div className="flex gap-4 mb-4">
              <div className="w-10 h-10 rounded-2xl bg-orange-500 flex items-center justify-center text-white shrink-0">
                <CheckCircle2 size={20} />
              </div>
              <div>
                <h4 className="text-sm font-black text-orange-600 dark:text-orange-400">Update Settings</h4>
                <p className="text-xs font-bold text-orange-900/40 dark:text-orange-400/40 mt-0.5">Changes take effect immediately across all modules.</p>
              </div>
            </div>
            <button 
              onClick={handleSave} 
              disabled={saving}
              className="w-full py-4 bg-orange-500 hover:bg-orange-400 disabled:opacity-50 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl shadow-orange-500/20 transition-all active:scale-95"
            >
              {saving ? "Updating..." : "Save Changes"}
            </button>
          </div>

          <button 
            onClick={handleDelete}
            className="w-full py-4 rounded-2xl border border-red-200 dark:border-red-900/20 text-[10px] font-black uppercase tracking-widest text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10 transition-all"
          >
            Archive Material
          </button>
        </div>
      </div>
      
      {/* Mobile Actions */}
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
          {saving ? "Updating..." : "Update Material"}
        </button>
      </div>
    </div>
  );
}

export default function EditMaterialPage() {
  return (
    <Suspense fallback={
      <div className="flex flex-col items-center justify-center py-20 gap-4">
        <div className="w-12 h-12 border-4 border-orange-500/20 border-t-orange-500 rounded-full animate-spin" />
        <p className="text-sm font-bold text-gray-400 uppercase tracking-widest">Loading Editor...</p>
      </div>
    }>
      <EditMaterialForm />
    </Suspense>
  );
}
