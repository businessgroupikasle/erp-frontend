"use client";

import { useState, useEffect, Suspense, useRef } from "react";
import { 
  ArrowLeft, Save, Trash2, Info, X,
  Sparkles, ChevronDown, 
  AlertCircle, CheckCircle2,
  Layers, Package, Scale, Lock,
  Database, Tag, BadgeIndianRupee, Truck, ShieldCheck,
  LayoutGrid,
  RefreshCw,
  AlertTriangle, Plus
} from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { rawMaterialsApi, inventoryApi } from "@/lib/api";
import { ITEM_CATEGORIES, UNITS } from "@/lib/constants";
import { clsx } from "clsx";
import { generateSKU } from "@/lib/utils/erp";

function EditItemForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const id = searchParams.get("id");

  const [activeTab, setActiveTab] = useState<"GENERAL" | "INVENTORY" | "FINANCE" | "PROCUREMENT">("GENERAL");
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
    gstRate: 0,
    vendorId: "",
    currentStock: 0,
    isActive: true,
    costPrice: 0,
    basePrice: 0
  });

  const [size, setSize] = useState("1KG");
  const [isCustomMode, setIsCustomMode] = useState(false);
  const [customValue, setCustomValue] = useState("");
  const isInitialLoad = useRef(true);

  useEffect(() => {
    if (!id) {
      setError("No Item ID provided.");
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
        
        let initialSize = "1KG";
        if (m.sku) {
           const parts = m.sku.split('-');
           if (parts.length >= 2) initialSize = parts[parts.length - 1];
        }
        setSize(initialSize);

        setForm({
          name: m.name,
          sku: m.sku ?? "",
          unit: m.unit ?? "kg",
          minimumStock: m.minimumStock ?? 10,
          category: m.category ?? "RAW_MATERIAL",
          hsnCode: m.hsnCode ?? "",
          gstRate: m.gstRate ?? 5,
          vendorId: m.vendorId ?? "",
          currentStock: m.currentStock ?? 0,
          isActive: m.isActive ?? true,
          costPrice: m.costPrice ?? 0,
          basePrice: m.basePrice ?? 0
        });
      } catch (e: any) {
        setError(`Failed to fetch details: ${e.message}`);
      } finally {
        setLoading(false);
        setTimeout(() => { isInitialLoad.current = false; }, 500);
      }
    };
    fetchData();
  }, [id]);

  const handleSave = async () => {
    if (!id || !form.name) return;
    setSaving(true);
    try {
      const { currentStock, ...updateData } = form;
      await rawMaterialsApi.update(id as string, {
        ...updateData,
        vendorId: sourceType === "VENDOR" ? form.vendorId : null,
      });
      router.push("/inventory/stock");
    } catch (e: any) {
      setError(e.response?.data?.error || "Update failed.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return (
    <div className="flex flex-col items-center justify-center py-40 gap-4">
      <RefreshCw className="animate-spin text-slate-400" size={32} />
      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Hydrating Item Master...</p>
    </div>
  );

  return (
    <div className="max-w-5xl mx-auto pb-20">
      <header className="flex items-center justify-between mb-10">
        <div className="flex items-center gap-4">
           <Link href="/inventory/stock" className="p-3 bg-white dark:bg-slate-900 border border-slate-100 dark:border-white/5 rounded-2xl text-slate-400 hover:text-slate-900 transition-all"><ArrowLeft size={20} /></Link>
           <div>
              <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tighter uppercase">Item Master</h1>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2 mt-1">
                 <ShieldCheck size={12} className="text-emerald-500" /> System ID: {id?.substring(0,8)} • {form.sku}
              </p>
           </div>
        </div>
        <div className="flex items-center gap-3">
           <button onClick={handleSave} disabled={saving} className="flex items-center gap-3 bg-slate-900 text-white px-8 py-4 rounded-[2rem] font-black text-[11px] uppercase tracking-[0.2em] shadow-2xl shadow-slate-900/20 active:scale-95 transition-all">
              {saving ? <RefreshCw size={16} className="animate-spin" /> : <Save size={16} />}
              {saving ? "Syncing..." : "Update Item Master"}
           </button>
        </div>
      </header>

      {/* Tab Navigation */}
      <div className="flex p-1.5 bg-slate-100 dark:bg-white/5 rounded-3xl border border-slate-200 dark:border-white/10 mb-8 max-w-2xl">
         {[
           { id: "GENERAL", label: "Identity", icon: Tag },
           { id: "INVENTORY", label: "Inventory", icon: Database },
           { id: "FINANCE", label: "Finance & Tax", icon: BadgeIndianRupee },
           { id: "PROCUREMENT", label: "Sourcing", icon: Truck }
         ].map((tab) => (
           <button
             key={tab.id}
             onClick={() => setActiveTab(tab.id as any)}
             className={clsx(
               "flex-1 flex items-center justify-center gap-2 py-3.5 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all",
               activeTab === tab.id ? "bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-xl" : "text-slate-400 hover:text-slate-600"
             )}
           >
             <tab.icon size={14} /> {tab.label}
           </button>
         ))}
      </div>

      <div className="bg-white dark:bg-card/40 border border-slate-200 dark:border-white/5 rounded-[3rem] p-10 shadow-2xl shadow-slate-200/20 dark:shadow-none min-h-[500px]">
         
         {activeTab === "GENERAL" && (
           <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                 <div className="space-y-4">
                    <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">Item Official Name</label>
                    <input 
                      className="w-full bg-slate-50 dark:bg-white/5 border-none rounded-2xl px-8 py-5 text-xl font-black focus:ring-4 ring-slate-900/5 outline-none dark:text-white transition-all"
                      value={form.name}
                      onChange={e => setForm({...form, name: e.target.value})}
                    />
                 </div>
                 <div className="space-y-4">
                    <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">SKU Identification</label>
                    <div className="flex items-center gap-4">
                       <input 
                         className="flex-1 bg-slate-100 dark:bg-white/10 border-none rounded-2xl px-8 py-5 text-lg font-black text-slate-400 cursor-not-allowed"
                         value={form.sku}
                         readOnly
                       />
                       <div className="p-5 bg-orange-500/10 text-orange-600 rounded-2xl"><Lock size={20} /></div>
                    </div>
                 </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-10 pt-10 border-t border-slate-50 dark:border-white/5">
                 <div className="space-y-4">
                    <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">Item Classification</label>
                    <div className="relative">
                       <select 
                         className="w-full appearance-none bg-slate-50 dark:bg-white/5 border-none rounded-2xl px-8 py-5 text-base font-black focus:ring-4 ring-slate-900/5 outline-none dark:text-white"
                         value={form.category}
                         onChange={e => setForm({...form, category: e.target.value})}
                       >
                         {ITEM_CATEGORIES.map(c => <option key={c} value={c}>{c.replace("_", " ")}</option>)}
                       </select>
                       <ChevronDown size={20} className="absolute right-6 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                    </div>
                 </div>
                 <div className="space-y-4">
                    <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">Pack Size Variant</label>
                    <div className="flex flex-wrap gap-2">
                       {["1KG", "500G", "250G", "100G"].map(s => (
                         <button 
                           key={s} 
                           onClick={() => {
                              setSize(s);
                              setIsCustomMode(false);
                           }}
                           className={clsx("px-6 py-3.5 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all",
                             size === s && !isCustomMode ? "bg-slate-900 text-white shadow-xl" : "bg-slate-50 dark:bg-white/5 text-slate-400 hover:bg-slate-100"
                           )}
                         >
                           {s}
                         </button>
                       ))}
                       
                       <div className="flex items-center gap-2">
                          {isCustomMode ? (
                            <div className="flex items-center bg-slate-50 dark:bg-white/5 rounded-2xl border border-slate-200 dark:border-white/10 overflow-hidden animate-in slide-in-from-right-4">
                               <input 
                                 autoFocus
                                 placeholder="e.g. 2KG" 
                                 value={customValue}
                                 onChange={e => {
                                    const val = e.target.value.toUpperCase();
                                    setCustomValue(val);
                                    setSize(val);
                                 }}
                                 className="bg-transparent px-6 py-3 text-[10px] font-black uppercase outline-none w-28 dark:text-white"
                               />
                               <button onClick={() => setIsCustomMode(false)} className="px-4 py-3 bg-slate-200 dark:bg-slate-800 text-slate-600"><X size={14} /></button>
                            </div>
                          ) : (
                            <button 
                              type="button" 
                              onClick={() => setIsCustomMode(true)}
                              className="px-6 py-3.5 rounded-2xl bg-slate-50 dark:bg-white/5 border border-dashed border-slate-300 dark:border-white/10 text-slate-400 hover:text-slate-900 transition-all"
                            >
                               <Plus size={16} />
                            </button>
                          )}
                       </div>
                    </div>
                 </div>
              </div>
           </div>
         )}

         {activeTab === "INVENTORY" && (
           <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
                 <div className="bg-slate-50 dark:bg-white/5 p-8 rounded-[2.5rem] border border-slate-100 dark:border-white/5">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Stock In Hand</p>
                    <div className="flex items-baseline gap-2">
                       <span className="text-5xl font-black text-slate-900 dark:text-white tracking-tighter">{(form.currentStock || 0).toFixed(0)}</span>
                       <span className="text-[12px] font-black text-slate-400 uppercase tracking-[0.2em]">{form.unit}</span>
                    </div>
                 </div>
                 <div className="space-y-4 md:col-span-2">
                    <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">Inventory Base Unit (UOM)</label>
                    <div className="flex items-center gap-4">
                       <div className="relative flex-1 max-w-xs">
                          <select 
                            className="w-full appearance-none bg-slate-50 dark:bg-white/5 border-none rounded-2xl px-8 py-5 text-base font-black focus:ring-4 ring-slate-900/5 outline-none dark:text-white"
                            value={form.unit}
                            onChange={e => setForm({...form, unit: e.target.value})}
                          >
                            {form.category === "FINISHED_GOOD" ? (
                              <>
                                <option value="pkt">PKT (Packet)</option>
                                <option value="pc">PCS (Piece)</option>
                                <option value="box">BOX</option>
                                <option value="kg">KG (Bulk Weight)</option>
                              </>
                            ) : (
                              UNITS.map(u => <option key={u} value={u}>{u.toUpperCase()}</option>)
                            )}
                          </select>
                          <ChevronDown size={20} className="absolute right-6 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                       </div>
                       
                       {form.category === "FINISHED_GOOD" && (
                         <div className="flex-1 p-5 bg-blue-500/5 border border-blue-500/10 rounded-[2rem] animate-in fade-in zoom-in-95">
                            <p className="text-[9px] font-black text-blue-500 uppercase tracking-widest mb-1">Pack Specification</p>
                            <p className="text-sm font-black text-slate-900 dark:text-white uppercase">{size} Content per {form.unit === 'pkt' ? 'Packet' : 'Unit'}</p>
                         </div>
                       )}
                    </div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tight italic mt-2">
                      {form.category === "FINISHED_GOOD" 
                        ? "For products, track by Packet/Unit to avoid weight confusion." 
                        : "Base measurement used for production recipes and stock counting."}
                    </p>
                 </div>
              </div>

              <div className="pt-10 border-t border-slate-50 dark:border-white/5">
                 <div className="space-y-6 max-w-lg">
                    <div className="flex items-center gap-3">
                       <AlertTriangle size={18} className="text-orange-500" />
                       <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-tight">Reorder Parameters</h3>
                    </div>
                    <div className="grid grid-cols-2 gap-6">
                       <div className="space-y-3">
                          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Min. Threshold</label>
                          <div className="relative">
                             <input 
                               type="number"
                               className="w-full bg-slate-50 dark:bg-white/5 border-none rounded-2xl px-6 py-4 text-lg font-black focus:ring-4 ring-orange-500/10 outline-none dark:text-white transition-all [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                               value={form.minimumStock}
                               onChange={e => setForm({...form, minimumStock: Number(e.target.value)})}
                               onWheel={(e) => (e.target as HTMLInputElement).blur()}
                             />
                             <span className="absolute right-6 top-1/2 -translate-y-1/2 text-[10px] font-black text-slate-300 uppercase">{form.unit}</span>
                          </div>
                       </div>
                       <div className="p-4 bg-orange-50 dark:bg-orange-500/5 rounded-2xl border border-orange-100 dark:border-orange-500/10">
                          <p className="text-[9px] font-black text-orange-600 uppercase tracking-widest mb-1">Stock Status</p>
                          <p className={clsx("text-xs font-black uppercase tracking-widest", (form.currentStock || 0) < (form.minimumStock || 0) ? "text-red-500" : "text-emerald-500")}>
                             {(form.currentStock || 0) < (form.minimumStock || 0) ? "Low Stock" : "Healthy"}
                          </p>
                       </div>
                    </div>
                 </div>
              </div>
           </div>
         )}

         {activeTab === "FINANCE" && (
           <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                 <div className="space-y-4">
                    <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">Reference Cost (Avg.)</label>
                    <div className="relative">
                       <span className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300 font-bold">₹</span>
                       <input 
                         className="w-full bg-slate-50 dark:bg-white/5 border-none rounded-2xl px-12 py-5 text-xl font-black focus:ring-4 ring-emerald-500/10 outline-none dark:text-white transition-all [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                         type="number"
                         value={form.costPrice}
                         onChange={e => setForm({...form, costPrice: Number(e.target.value)})}
                         onWheel={(e) => (e.target as HTMLInputElement).blur()}
                       />
                    </div>
                 </div>
                 <div className="space-y-4">
                    <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">Standard Selling Price</label>
                    <div className="relative">
                       <span className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300 font-bold">₹</span>
                       <input 
                         className="w-full bg-slate-50 dark:bg-white/5 border-none rounded-2xl px-12 py-5 text-xl font-black focus:ring-4 ring-blue-500/10 outline-none dark:text-white transition-all [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                         type="number"
                         value={form.basePrice}
                         onChange={e => setForm({...form, basePrice: Number(e.target.value)})}
                         onWheel={(e) => (e.target as HTMLInputElement).blur()}
                       />
                    </div>
                 </div>
              </div>

              <div className="pt-10 border-t border-slate-50 dark:border-white/5 grid grid-cols-1 md:grid-cols-3 gap-10">
                 <div className="space-y-4">
                    <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">HSN/SAC Code</label>
                    <input 
                      className="w-full bg-slate-50 dark:bg-white/5 border-none rounded-2xl px-8 py-4 text-base font-black focus:ring-4 ring-slate-900/5 outline-none dark:text-white transition-all"
                      value={form.hsnCode}
                      onChange={e => setForm({...form, hsnCode: e.target.value})}
                    />
                 </div>
                 <div className="space-y-4">
                    <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">Tax Bracket (GST %)</label>
                    <div className="relative">
                       <select 
                         className="w-full appearance-none bg-slate-50 dark:bg-white/5 border-none rounded-2xl px-8 py-4 text-base font-black focus:ring-4 ring-slate-900/5 outline-none dark:text-white"
                         value={form.gstRate}
                         onChange={e => setForm({...form, gstRate: Number(e.target.value)})}
                       >
                         {[0, 5, 12, 18, 28].map(r => <option key={r} value={r}>{r}% GST</option>)}
                       </select>
                       <ChevronDown size={20} className="absolute right-6 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                    </div>
                 </div>
                 <div className="p-6 bg-slate-900 dark:bg-white/5 rounded-3xl text-white">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Inventory Valuation</p>
                    <h4 className="text-2xl font-black tracking-tighter">₹{((form.currentStock || 0) * (form.costPrice || 0)).toLocaleString()}</h4>
                 </div>
              </div>
           </div>
         )}

         {activeTab === "PROCUREMENT" && (
           <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="flex items-center justify-between mb-8">
                 <div className="flex p-1 bg-slate-100 dark:bg-white/5 rounded-2xl border border-slate-200 dark:border-white/10">
                    <button 
                      onClick={() => setSourceType("DIRECT")}
                      className={clsx("px-8 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all", 
                        sourceType === "DIRECT" ? "bg-white dark:bg-slate-800 text-blue-500 shadow-lg" : "text-slate-400")}
                    >
                      Production/Direct
                    </button>
                    <button 
                      onClick={() => setSourceType("VENDOR")}
                      className={clsx("px-8 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all", 
                        sourceType === "VENDOR" ? "bg-white dark:bg-slate-800 text-purple-500 shadow-lg" : "text-slate-400")}
                    >
                      External Vendor
                    </button>
                 </div>
              </div>

              {sourceType === "VENDOR" ? (
                 <div className="space-y-8 animate-in zoom-in-95 duration-300">
                    <div className="p-8 bg-purple-500/5 border border-purple-500/10 rounded-[3rem] space-y-4">
                       <label className="text-[11px] font-black text-purple-500 uppercase tracking-widest ml-1">Primary Supplier Linkage</label>
                       <div className="relative">
                          <select 
                            className="w-full appearance-none bg-white dark:bg-slate-900 border-none rounded-2xl px-8 py-5 text-base font-black focus:ring-4 ring-purple-500/10 dark:text-white shadow-sm"
                            value={form.vendorId}
                            onChange={e => setForm({...form, vendorId: e.target.value})}
                          >
                            <option value="">Select Primary Vendor</option>
                            {vendors.map(v => <option key={v.id} value={v.id}>{v.name}</option>)}
                          </select>
                          <ChevronDown size={20} className="absolute right-6 top-1/2 -translate-y-1/2 text-purple-300 pointer-events-none" />
                       </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                       <div className="p-8 bg-slate-50 dark:bg-white/5 rounded-[2.5rem] space-y-2">
                          <h4 className="text-xs font-black uppercase tracking-widest text-slate-900 dark:text-white">Procurement Rule</h4>
                          <p className="text-xs font-medium text-slate-500 leading-relaxed">
                             Linking a vendor enables automated Purchase Order generation when stock levels hit the reorder threshold.
                          </p>
                       </div>
                    </div>
                 </div>
              ) : (
                 <div className="p-20 text-center space-y-6 bg-blue-500/[0.02] border border-dashed border-blue-500/10 rounded-[4rem] animate-in zoom-in-95 duration-300">
                    <div className="inline-flex p-6 bg-blue-500/10 text-blue-500 rounded-[2rem]"><LayoutGrid size={32} /></div>
                    <div className="max-w-md mx-auto space-y-2">
                       <h3 className="text-lg font-black text-slate-900 dark:text-white uppercase tracking-tight">Direct Internal Sourcing</h3>
                       <p className="text-sm font-medium text-slate-500 leading-relaxed">
                          This item is flagged for internal production or direct procurement. Stock levels will be updated via Production Completion reports.
                       </p>
                    </div>
                 </div>
              )}
           </div>
         )}
      </div>
    </div>
  );
}

export default function EditItemPage() {
  return (
    <Suspense fallback={<div className="p-20 text-center font-black uppercase tracking-widest text-slate-400">Loading Item Master...</div>}>
      <EditItemForm />
    </Suspense>
  );
}
