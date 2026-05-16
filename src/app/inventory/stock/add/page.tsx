"use client";

import { useState, useEffect, useRef } from "react";
import { 
  ArrowLeft, Save, Info, X,
  Sparkles, ChevronDown, 
  AlertCircle, CheckCircle2,
  Layers, Package, Scale, Lock,
  Database, Tag, LayoutGrid,
  RefreshCw,
  Plus
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { rawMaterialsApi, franchiseApi, vendorsApi } from "@/lib/api";
import { ITEM_CATEGORIES, UNITS } from "@/lib/constants";
import { clsx } from "clsx";
import { useAuth } from "@/context/AuthContext";
import { generateSKU } from "@/lib/utils/erp";

export default function AddItemPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [franchises, setFranchises] = useState<any[]>([]);
  const [vendors, setVendors] = useState<any[]>([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sourceType, setSourceType] = useState<"VENDOR" | "DIRECT">("DIRECT");
  const [directAllocate, setDirectAllocate] = useState(false);

  const [form, setForm] = useState({
    name: "",
    sku: "",
    unit: "kg",
    minimumStock: 10,
    category: "RAW_MATERIAL",
    hsnCode: "",
    gstRate: 5,
    vendorId: "",
    initialStock: 0,
    franchiseId: "hq-001",
    costPrice: 0,
    basePrice: 0
  });

  const [size, setSize] = useState("1KG");
  const [isCustomMode, setIsCustomMode] = useState(false);
  const [customValue, setCustomValue] = useState("");
  const [customUnit, setCustomUnit] = useState("KG");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [fRes, vRes] = await Promise.all([
          franchiseApi.getAll().catch(() => ({ data: [] })),
          vendorsApi.getAll().catch(() => ({ data: [] }))
        ]);
        setFranchises((fRes.data || []).filter((f: any) => 
          !f.name.toUpperCase().includes("HEADQUARTERS") && f.id !== "hq-001"
        ));
        setVendors(vRes.data || []);
      } catch (e) {
        console.error("Failed to fetch dependencies", e);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    const sku = generateSKU(form.category, form.name, size);
    setForm(f => ({ ...f, sku }));
  }, [form.category, form.name, size]);

  const handleSave = async () => {
    if (!form.name || !form.sku) {
      setError("Please provide Item Name and SKU.");
      return;
    }
    setSaving(true);
    setError(null);
    try {
      await rawMaterialsApi.create({
        ...form,
        vendorId: sourceType === "VENDOR" ? form.vendorId : null,
      });
      router.push("/inventory/stock");
    } catch (e: any) {
      setError(e.response?.data?.error || "Failed to create item.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-10 gap-6">
        <div className="space-y-1">
          <div className="flex items-center gap-4 mb-2">
            <Link href="/inventory/stock" className="p-3 rounded-2xl bg-white dark:bg-white/5 border border-gray-100 dark:border-white/10 text-gray-500 hover:text-orange-500 transition-all shadow-xl">
              <ArrowLeft size={22} />
            </Link>
            <h1 className="text-4xl font-black text-slate-900 dark:text-white tracking-tighter uppercase">
              Create <span className="text-orange-500">Item Master</span>
            </h1>
          </div>
          <p className="text-sm text-slate-500 font-bold ml-16 flex items-center gap-2">
            <Tag size={14} className="text-orange-500" />
            Defining product specifications & inventory rules.
          </p>
        </div>
        <div className="flex gap-4 invisible pointer-events-none">
          {/* Moved to bottom */}
        </div>
      </div>

      {error && (
        <div className="mb-8 p-6 rounded-3xl bg-red-50 border border-red-100 flex items-center gap-4 text-red-600 text-sm font-bold animate-in zoom-in-95">
          <AlertCircle size={20} />
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <div className="bg-white dark:bg-card rounded-[3rem] border border-gray-100 dark:border-white/5 p-10 shadow-2xl relative overflow-hidden">
            <div className="flex items-center justify-between mb-10">
              <div className="flex items-center gap-3 text-slate-400">
                <div className="w-10 h-10 rounded-2xl bg-slate-50 dark:bg-white/5 flex items-center justify-center text-slate-900 dark:text-white"><LayoutGrid size={20} /></div>
                <h2 className="text-[11px] font-black uppercase tracking-[0.3em]">Identity & Variants</h2>
              </div>
              <div className="flex p-1.5 bg-slate-100 dark:bg-white/5 rounded-2xl border border-slate-200 dark:border-white/10">
                <button onClick={() => setSourceType("DIRECT")} className={clsx("px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all", sourceType === "DIRECT" ? "bg-white dark:bg-slate-800 text-blue-600 shadow-xl" : "text-slate-400")}>Internal/Production</button>
                <button onClick={() => setSourceType("VENDOR")} className={clsx("px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all", sourceType === "VENDOR" ? "bg-white dark:bg-slate-800 text-indigo-600 shadow-xl" : "text-slate-400")}>External Vendor</button>
              </div>
            </div>

            <div className="space-y-8">
               <div className="space-y-3">
                  <label className="block text-[11px] font-black text-slate-400 uppercase tracking-widest ml-2">Official Item Name *</label>
                  <input 
                    placeholder="e.g. Idly Batter" 
                    value={form.name}
                    onChange={e => setForm({...form, name: e.target.value})}
                    className="w-full px-8 py-5 text-lg font-black bg-slate-50 dark:bg-white/5 border-2 border-transparent focus:border-slate-900/10 rounded-[2rem] outline-none dark:text-white transition-all"
                  />
               </div>

               <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-3">
                    <label className="block text-[11px] font-black text-slate-400 uppercase tracking-widest ml-2">Item Category</label>
                    <div className="relative">
                       <select 
                         value={form.category} 
                         onChange={e => {
                           const cat = e.target.value;
                           setForm({
                             ...form, 
                             category: cat,
                             unit: cat === 'FINISHED_GOOD' ? 'pkt' : 'kg'
                           });
                         }} 
                         className="w-full appearance-none bg-slate-50 dark:bg-white/5 border-none rounded-2xl px-8 py-5 text-sm font-black focus:ring-4 ring-slate-900/5 dark:text-white"
                       >
                          {ITEM_CATEGORIES.map(c => <option key={c} value={c}>{c.replace("_", " ")}</option>)}
                       </select>
                       <ChevronDown size={20} className="absolute right-6 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                    </div>
                  </div>
                  <div className="space-y-3">
                    <label className="block text-[11px] font-black text-slate-400 uppercase tracking-widest ml-2">Base Unit (UOM)</label>
                    <div className="relative">
                       <select 
                         value={form.unit} 
                         onChange={e => setForm({...form, unit: e.target.value})} 
                         className="w-full appearance-none bg-slate-50 dark:bg-white/5 border-none rounded-2xl px-8 py-5 text-sm font-black focus:ring-4 ring-slate-900/5 dark:text-white"
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
                  </div>
               </div>

               {form.category === "FINISHED_GOOD" && (
                 <div className="p-6 bg-blue-50 dark:bg-blue-500/5 rounded-[2.5rem] border border-blue-100 dark:border-blue-500/10 flex items-center justify-between animate-in slide-in-from-top-2 duration-500">
                    <div>
                       <p className="text-[10px] font-black text-blue-500 uppercase tracking-widest mb-1">Stock Tracking Logic</p>
                       <p className="text-xs font-bold text-slate-600 dark:text-slate-300">You are tracking this product in <span className="text-blue-600 uppercase">{form.unit}s</span>. Each unit contains <span className="text-blue-600">{size}</span> of product.</p>
                    </div>
                    <div className="w-12 h-12 bg-blue-500/10 rounded-2xl flex items-center justify-center text-blue-500"><Package size={24} /></div>
                 </div>
               )}

               <div className="space-y-3 pt-6 border-t border-slate-50 dark:border-white/5">
                  <label className="block text-[11px] font-black text-slate-400 uppercase tracking-widest ml-2">Available Pack Variants</label>
                  <div className="flex flex-wrap gap-3">
                     {["1KG", "500G", "250G", "100G"].map(s => (
                       <button 
                         key={s} 
                         type="button" 
                         onClick={() => {
                            setSize(s);
                            setIsCustomMode(false);
                         }} 
                         className={clsx("px-8 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all", 
                           size === s && !isCustomMode ? "bg-slate-900 text-white shadow-xl scale-105" : "bg-slate-50 dark:bg-white/5 text-slate-400"
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
                               className="bg-transparent px-6 py-4 text-[10px] font-black uppercase outline-none w-32 dark:text-white"
                             />
                             <button onClick={() => setIsCustomMode(false)} className="px-4 py-4 bg-slate-200 dark:bg-slate-800 text-slate-600"><X size={14} /></button>
                          </div>
                        ) : (
                          <button 
                            type="button" 
                            onClick={() => setIsCustomMode(true)}
                            className="p-4 rounded-2xl bg-slate-50 dark:bg-white/5 border border-dashed border-slate-300 dark:border-white/10 text-slate-400 hover:text-slate-900 transition-all"
                          >
                             <Plus size={20} />
                          </button>
                        )}
                     </div>
                  </div>
               </div>
            </div>
          </div>
          
          <div className="bg-white dark:bg-card rounded-[3rem] border border-gray-100 dark:border-white/5 p-10 shadow-2xl">
              <div className="flex items-center gap-3 mb-8 text-slate-400">
                <Scale size={20} />
                <h2 className="text-[11px] font-black uppercase tracking-widest">Inventory & Pricing</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  <div className="space-y-3">
                    <label className="block text-[11px] font-black text-slate-400 uppercase tracking-widest ml-2">Avg. Purchase Cost</label>
                    <div className="relative group">
                       <input 
                         type="number" 
                         value={form.costPrice} 
                         onChange={e => setForm({...form, costPrice: parseFloat(e.target.value) || 0})}
                         onWheel={(e) => (e.target as HTMLInputElement).blur()}
                         className="w-full bg-slate-50 dark:bg-white/5 border-none rounded-2xl px-8 py-5 text-lg font-black focus:ring-4 ring-slate-900/5 dark:text-white [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                       />
                       <span className="absolute right-6 top-1/2 -translate-y-1/2 text-[10px] font-black text-slate-300 uppercase tracking-widest">INR</span>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <label className="block text-[11px] font-black text-blue-500 uppercase tracking-widest ml-2">Standard Selling Price</label>
                    <div className="relative group">
                       <input 
                         type="number" 
                         value={form.basePrice} 
                         onChange={e => setForm({...form, basePrice: parseFloat(e.target.value) || 0})}
                         onWheel={(e) => (e.target as HTMLInputElement).blur()}
                         className="w-full bg-blue-50 dark:bg-blue-500/5 border border-blue-100 dark:border-blue-500/10 rounded-2xl px-8 py-5 text-lg font-black focus:ring-4 ring-blue-500/10 text-blue-600 dark:text-blue-400 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                       />
                       <span className="absolute right-6 top-1/2 -translate-y-1/2 text-[10px] font-black text-blue-300 uppercase tracking-widest">SALE</span>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <label className="block text-[11px] font-black text-slate-400 uppercase tracking-widest ml-2">Opening Stock Balance</label>
                    <div className="relative">
                       <input 
                         type="number" 
                         value={form.initialStock} 
                         onChange={e => setForm({...form, initialStock: parseFloat(e.target.value) || 0})}
                         onWheel={(e) => (e.target as HTMLInputElement).blur()}
                         className="w-full bg-slate-50 dark:bg-white/5 border-none rounded-2xl px-8 py-5 text-lg font-black focus:ring-4 ring-slate-900/5 dark:text-white [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                       />
                       <div className="absolute right-6 top-1/2 -translate-y-1/2 flex items-center gap-1.5">
                          <Scale size={14} className="text-slate-300" />
                          <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">{form.unit}</span>
                       </div>
                    </div>
                  </div>
               </div>
          </div>
        </div>

        <div className="space-y-8">
           <div className="bg-slate-900 text-white rounded-[3rem] p-10 shadow-2xl">
              <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-4">Auto-Generated SKU</p>
              <div className="flex items-center justify-between mb-6">
                 <h3 className="text-2xl font-black tracking-tighter">{form.sku}</h3>
                 <Sparkles className="text-orange-500" size={24} />
              </div>
              <div className="space-y-2 pt-6 border-t border-white/10">
                 <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">System validation ready. This identifier is unique across the manufacturing ledger.</p>
              </div>
           </div>

           <div className="bg-white dark:bg-card/40 rounded-[3rem] border border-slate-100 dark:border-white/5 p-10 shadow-xl">
              <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-6">Tax Compliance</h3>
              <div className="space-y-6">
                 <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">HSN Code</label>
                    <input value={form.hsnCode} onChange={e => setForm({...form, hsnCode: e.target.value})} className="w-full bg-slate-50 dark:bg-white/5 border-none rounded-xl px-6 py-4 text-xs font-black outline-none" />
                 </div>
                 <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">GST Bracket (%)</label>
                    <select value={form.gstRate} onChange={e => setForm({...form, gstRate: Number(e.target.value)})} className="w-full bg-slate-50 dark:bg-white/5 border-none rounded-xl px-6 py-4 text-xs font-black outline-none">
                       {[0, 5, 12, 18, 28].map(r => <option key={r} value={r}>{r}%</option>)}
                    </select>
                 </div>
              </div>
           </div>
        </div>
      </div>

      <div className="mt-12 flex flex-col md:flex-row items-center justify-center gap-4">
         <Link 
           href="/inventory/stock" 
           className="px-12 py-5 rounded-[2rem] text-[11px] font-black uppercase tracking-widest text-slate-400 hover:text-slate-900 transition-all"
         >
           Cancel & Discard
         </Link>
         <button 
           onClick={handleSave} 
           disabled={saving} 
           className="group relative flex items-center gap-4 px-16 py-6 bg-slate-900 text-white rounded-[2.5rem] text-[13px] font-black uppercase tracking-[0.3em] shadow-[0_20px_50px_-12px_rgba(0,0,0,0.3)] hover:shadow-[0_20px_50px_-12px_rgba(0,0,0,0.5)] transition-all active:scale-95 disabled:opacity-50 overflow-hidden"
         >
            <div className="absolute inset-0 bg-gradient-to-r from-orange-500/0 via-orange-500/10 to-orange-500/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
            {saving ? <RefreshCw size={20} className="animate-spin" /> : <Save size={20} />}
            {saving ? "Processing System Entry..." : "Finalize Item Master"}
         </button>
      </div>
    </div>
  );
}
