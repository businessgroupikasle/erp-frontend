"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Layers, Plus, X, Search, AlertTriangle, CheckCircle2,
  RefreshCw, TrendingDown, TrendingUp, Trash2, Settings,
  ArrowDownCircle, ArrowUpCircle, Scale, Lock
} from "lucide-react";
import { clsx } from "clsx";
import { rawMaterialsApi, inventoryApi } from "@/lib/api";

const CATEGORY_COLORS: Record<string, string> = {
  RAW_MATERIAL:   "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/20 dark:text-indigo-400",
  FINISHED_GOOD:  "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400",
  PACKAGING:      "bg-purple-100 text-purple-700 dark:bg-purple-900/20 dark:text-purple-400",
};

export default function RawMaterialStockPage() {
  const [items, setItems]   = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("ALL");
  const [showAdd, setShowAdd]   = useState(false);
  const [editModal, setEditModal] = useState<any>(null);
  const [editForm, setEditForm] = useState({ name: "", sku: "", unit: "kg", minimumStock: 10 });

  // Add item form
  const [form, setForm] = useState({ name: "", sku: "", unit: "kg", minimumStock: 10, category: "RAW_MATERIAL", franchiseId: "", initialStock: 0 });
  const [franchiseId, setFranchiseId] = useState("");
  const [saving, setSaving] = useState(false);

  const fetchItems = useCallback(async () => {
    setLoading(true);
    try {
      const res = await inventoryApi.getInventory();
      setItems(res.data ?? []);
      if ((res.data ?? []).length > 0 && res.data[0].franchiseId) {
        setFranchiseId(res.data[0].franchiseId);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchItems(); }, [fetchItems]);

  const handleAdd = async () => {
    if (!form.name) return;
    setSaving(true);
    try {
      await rawMaterialsApi.create({ 
        ...form, 
        initialStock: Number(form.initialStock) || 0,
        franchiseId: franchiseId || form.franchiseId 
      });
      setShowAdd(false);
      setForm({ name: "", sku: "", unit: "kg", minimumStock: 10, category: "RAW_MATERIAL", franchiseId: "", initialStock: 0 });
      fetchItems();
    } catch (e) { console.error(e); }
    finally { setSaving(false); }
  };

  const handleEdit = async () => {
    if (!editModal) return;
    try {
      await rawMaterialsApi.update(editModal.id, editForm);
      setEditModal(null);
      fetchItems();
    } catch (e) { console.error(e); }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Delete "${name}"? This cannot be undone.`)) return;
    try {
      await rawMaterialsApi.delete(id);
      fetchItems();
    } catch (e: any) {
      alert(e?.response?.data?.error ?? "Failed to delete item");
    }
  };

  const filtered = items.filter((it) => {
    const matchSearch = !search || 
      it.name?.toLowerCase().includes(search.toLowerCase()) || 
      it.sku?.toLowerCase().includes(search.toLowerCase());
    const matchCat = category === "ALL" || it.category === category;
    return matchSearch && matchCat;
  });

  const lowStock   = items.filter((it) => it.currentStock <= it.minimumStock).length;
  const totalIn    = items.reduce((s: number, it: any) => s + (it.inbound ?? 0), 0);
  const totalOut   = items.reduce((s: number, it: any) => s + (it.outbound ?? 0), 0);
  const totalQty   = items.reduce((s: number, it: any) => s + (it.currentStock ?? 0), 0);

  return (
    <div className="max-w-7xl mx-auto space-y-10 animate-in fade-in duration-700">
      {/* Strategic Header */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 py-6 border-b border-slate-200 dark:border-slate-800">
        <div>
          <div className="flex items-center gap-3">
             <div className="p-3 bg-orange-500 rounded-2xl shadow-xl shadow-orange-500/20">
                <Layers size={24} className="text-white" />
             </div>
             <h1 className="text-4xl font-black tracking-tight text-slate-900 dark:text-white uppercase transition-all">
               Raw Material <span className="text-slate-400 font-medium ml-1 tracking-tighter italic">Stock Intelligence</span>
             </h1>
          </div>
          <p className="text-slate-500 dark:text-slate-400 mt-2 font-medium ml-14">
            Strategic inventory control and <span className="text-orange-500 font-bold underline decoration-orange-500/30">real-time movement</span> tracking.
          </p>
        </div>
        <div className="flex items-center gap-3">
           <button onClick={fetchItems} className="p-4 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl hover:border-slate-300 transition-all shadow-sm group">
             <RefreshCw size={18} className={clsx("text-slate-400 group-hover:rotate-180 transition-transform duration-500", loading && "animate-spin")} />
           </button>
           <button
             onClick={() => setShowAdd(true)}
             className="flex items-center gap-3 bg-slate-900 dark:bg-white text-white dark:text-slate-900 px-8 py-4 rounded-3xl font-black text-xs uppercase tracking-widest hover:shadow-2xl hover:translate-y-[-2px] transition-all active:translate-y-0 shadow-slate-200 dark:shadow-none"
           >
            <Plus size={20} strokeWidth={3} /> Add Material
          </button>
        </div>
      </header>

      {/* Analytics Dashboard */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[
          { label: "Inventory Equity", value: `${totalQty.toFixed(1)} Un`, icon: Scale, color: "text-blue-500", bg: "bg-blue-500/10" },
          { label: "Critical SKU Count", value: lowStock, icon: AlertTriangle, color: "text-red-500", bg: "bg-red-500/10" },
          { label: "Inbound (24h)", value: `+${totalIn.toFixed(1)}`, icon: ArrowDownCircle, color: "text-emerald-500", bg: "bg-emerald-500/10" },
          { label: "Outbound (24h)", value: `-${totalOut.toFixed(1)}`, icon: ArrowUpCircle, color: "text-orange-500", bg: "bg-orange-500/10" },
        ].map((stat, i) => (
          <div key={i} className="bg-white dark:bg-card/40 backdrop-blur-sm p-6 rounded-[32px] border border-slate-100 dark:border-white/5 shadow-xl shadow-black/[0.02] group">
            <div className="flex items-center justify-between mb-4">
               <div className={clsx("p-3 rounded-2xl transition-transform group-hover:scale-110 duration-500", stat.bg, stat.color)}>
                  <stat.icon size={20} />
               </div>
               <span className="text-[10px] font-black text-slate-400 tracking-widest uppercase">Live View</span>
            </div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">{stat.label}</p>
            <h3 className="text-3xl font-black text-slate-900 dark:text-white tracking-tighter">{stat.value}</h3>
          </div>
        ))}
      </div>

      {/* Control Panel */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
         <div className="flex p-1.5 bg-slate-100 dark:bg-white/5 rounded-2xl w-fit border border-slate-200 dark:border-white/5">
            {["ALL", "RAW_MATERIAL", "FINISHED_GOOD", "PACKAGING"].map((cat) => (
              <button
                key={cat}
                onClick={() => setCategory(cat)}
                className={clsx(
                  "px-6 py-2.5 rounded-xl text-[11px] font-black uppercase tracking-widest transition-all",
                  category === cat 
                    ? "bg-white dark:bg-card text-slate-900 dark:text-white shadow-md border border-slate-100 dark:border-white/10" 
                    : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
                )}
              >
                {cat === "ALL" ? "All Items" : cat.replace("_", " ")}
              </button>
            ))}
         </div>

         <div className="relative group min-w-[340px]">
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-orange-500 transition-colors" size={18} />
            <input 
              type="text" 
              placeholder="Search by SKU or Item Name..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-14 pr-6 py-4 bg-white dark:bg-card border-none rounded-3xl outline-none focus:ring-4 ring-orange-500/10 text-sm font-bold shadow-xl shadow-black/[0.02] transition-all"
            />
         </div>
      </div>

      {/* Main Stock Table */}
      <div className="bg-white dark:bg-card/40 backdrop-blur-md border border-slate-200 dark:border-white/5 rounded-[48px] shadow-2xl shadow-black/[0.03] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-slate-100 dark:border-white/5 text-slate-400">
                <th className="px-10 py-6 text-[10px] font-black uppercase tracking-widest">Specifications</th>
                <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-center">Movement (24h)</th>
                <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest">In Stock Balance</th>
                <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest">Threshold</th>
                <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-center">Status</th>
                <th className="px-10 py-6"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 dark:divide-white/5">
              {filtered.map((item) => {
                const isLow = item.currentStock <= item.minimumStock;
                return (
                  <tr key={item.id} className="group hover:bg-slate-50 dark:hover:bg-white/5 transition-all">
                    <td className="px-10 py-6">
                       <div className="flex items-center gap-4">
                          <div className={clsx("w-12 h-12 rounded-2xl flex items-center justify-center font-black text-xs border transition-transform group-hover:scale-110", 
                            isLow ? "bg-red-50 text-red-500 border-red-100" : "bg-emerald-50 text-emerald-500 border-emerald-100"
                          )}>
                             {item.name.substring(0,2).toUpperCase()}
                          </div>
                          <div>
                             <p className="font-black text-slate-900 dark:text-white uppercase tracking-tight text-sm leading-tight">{item.name}</p>
                             <div className="flex items-center gap-2 mt-1">
                                <span className={clsx("text-[9px] font-black px-1.5 py-0.5 rounded bg-slate-100 dark:bg-white/10 uppercase tracking-tighter", 
                                  isLow ? "text-red-500" : "text-slate-400")}>
                                  {item.sku}
                                </span>
                                <span className="w-1 h-1 rounded-full bg-slate-200" />
                                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{item.category?.replace("_", " ")}</span>
                             </div>
                          </div>
                       </div>
                    </td>
                    <td className="px-8 py-6">
                       <div className="flex flex-col items-center gap-1">
                          <span className="text-[11px] font-black text-emerald-500 flex items-center gap-1">
                             <TrendingUp size={11} /> +{(item.inbound || 0).toFixed(1)}
                          </span>
                          <span className="text-[11px] font-black text-orange-500 flex items-center gap-1">
                             <TrendingDown size={11} /> -{(item.outbound || 0).toFixed(1)}
                          </span>
                       </div>
                    </td>
                    <td className="px-8 py-6">
                       <div className="space-y-1.5 min-w-[140px]">
                          <div className="flex justify-between items-center px-1">
                             <span className={clsx("text-[14px] font-black", isLow ? "text-red-600" : "text-slate-900 dark:text-slate-200")}>
                                {(item.currentStock || 0).toFixed(2)} <span className="text-[10px] text-slate-400 font-bold tracking-widest uppercase">{item.unit}</span>
                             </span>
                             <span className="text-[9px] font-black text-slate-300">ACTUAL</span>
                          </div>
                          <div className="h-1.5 w-full bg-slate-100 dark:bg-white/5 rounded-full overflow-hidden">
                             <div 
                                className={clsx("h-full rounded-full transition-all duration-1000", isLow ? "bg-red-500" : "bg-emerald-500")} 
                                style={{ width: `${Math.min(100, (item.currentStock / (item.minimumStock * 2)) * 100)}%` }} 
                             />
                          </div>
                       </div>
                    </td>
                    <td className="px-8 py-6">
                       <p className="text-sm font-black text-slate-900 dark:text-white tracking-tight">{(item.minimumStock || 10).toFixed(1)} {item.unit}</p>
                       <p className="text-[10px] font-bold text-slate-400 tracking-widest uppercase">Safe Threshold</p>
                    </td>
                    <td className="px-8 py-6 text-center">
                       {isLow ? (
                         <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-red-50 dark:bg-red-500/10 text-[10px] font-black text-red-600 uppercase tracking-wider border border-red-100 dark:border-red-500/20">
                           <AlertTriangle size={12} /> Low Stock
                         </span>
                       ) : (
                         <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-50 dark:bg-emerald-500/10 text-[10px] font-black text-emerald-600 uppercase tracking-wider border border-emerald-100 dark:border-emerald-500/20">
                           <CheckCircle2 size={12} /> Safe
                         </span>
                       )}
                    </td>
                    <td className="px-10 py-6 text-right">
                       <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-all scale-95 group-hover:scale-100">
                          <button
                            onClick={() => { setEditModal(item); setEditForm({ name: item.name, sku: item.sku || "", unit: item.unit || "kg", minimumStock: item.minimumStock || 10 }); }}
                            className="p-3 bg-slate-50 dark:bg-white/5 text-slate-400 rounded-2xl hover:bg-slate-900 dark:hover:bg-white hover:text-white dark:hover:text-slate-900 transition-all shadow-sm border border-slate-100 dark:border-white/5"
                            title="Material Settings"
                          >
                             <Settings size={16} />
                          </button>
                          <button
                            onClick={() => handleDelete(item.id, item.name)}
                            className="p-3 bg-red-50 dark:bg-red-500/10 text-red-400 rounded-2xl hover:bg-red-500 hover:text-white transition-all shadow-sm border border-red-100 dark:border-red-500/20"
                            title="Delete Record"
                          >
                             <Trash2 size={16} />
                          </button>
                       </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <div className="w-full py-8 text-center border-t border-slate-100 dark:border-white/5 bg-slate-50/20 dark:bg-transparent flex items-center justify-center gap-6">
           <div className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest">
              <span className="w-2 h-2 rounded-full bg-emerald-500" /> STOCK FROM MOVEMENTS
           </div>
           <div className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest">
              <Lock size={10} className="text-orange-500" /> NO MANUAL EDITS
           </div>
           <div className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest">
              <span className="w-2 h-2 rounded-full bg-blue-500" /> GRN / PRODUCTION DRIVEN
           </div>
        </div>
      </div>

      {/* Add Material Modal */}
      {showAdd && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 animate-in fade-in duration-300">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-xl" onClick={() => setShowAdd(false)} />
          <div className="relative bg-white dark:bg-card rounded-[48px] shadow-2xl w-full max-w-lg border border-white/20 dark:border-white/5 p-12 overflow-hidden">
             <div className="flex items-center gap-4 mb-10">
                <div className="w-16 h-16 rounded-[24px] bg-slate-900 dark:bg-white flex items-center justify-center text-white dark:text-slate-900 shadow-xl">
                   <Plus size={32} />
                </div>
                <div>
                   <h2 className="text-3xl font-black text-slate-900 dark:text-white tracking-tighter">Register Material</h2>
                   <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Expanding Inventory Catalog</p>
                </div>
             </div>

             <div className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                   <div className="space-y-2">
                      <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">Specification Name *</label>
                      <input 
                        placeholder="e.g. Rice (Premium)" 
                        value={form.name} 
                        onChange={(e) => setForm({...form, name: e.target.value})}
                        className="w-full px-5 py-3.5 text-sm font-bold bg-slate-50 dark:bg-white/5 border-none rounded-2xl outline-none focus:ring-4 ring-slate-500/10 dark:text-white" 
                      />
                   </div>
                   <div className="space-y-2">
                      <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">SKU Identification</label>
                      <input 
                        placeholder="e.g. RM-RIC-01" 
                        value={form.sku} 
                        onChange={(e) => setForm({...form, sku: e.target.value.toUpperCase()})}
                        className="w-full px-5 py-3.5 text-sm font-bold bg-slate-50 dark:bg-white/5 border-none rounded-2xl outline-none focus:ring-4 ring-slate-500/10 dark:text-white" 
                      />
                   </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                   <div className="space-y-2">
                      <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">Measurement Unit</label>
                      <select 
                        value={form.unit} 
                        onChange={(e) => setForm({...form, unit: e.target.value})}
                        className="w-full px-5 py-3.5 text-sm font-bold bg-slate-50 dark:bg-white/5 border-none rounded-2xl outline-none focus:ring-4 ring-slate-500/10 dark:text-white appearance-none"
                      >
                         {["kg", "g", "litre", "ml", "pc", "box"].map(u => <option key={u} value={u}>{u}</option>)}
                      </select>
                   </div>
                   <div className="space-y-2">
                      <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">Min Threshold</label>
                      <input 
                        type="number" 
                        placeholder="10" 
                        value={form.minimumStock} 
                        onChange={(e) => setForm({...form, minimumStock: Number(e.target.value)})}
                        className="w-full px-5 py-3.5 text-sm font-bold bg-slate-50 dark:bg-white/5 border-none rounded-2xl outline-none focus:ring-4 ring-slate-500/10 dark:text-white text-center" 
                      />
                   </div>
                   <div className="space-y-2">
                      <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">Category</label>
                      <select 
                        value={form.category} 
                        onChange={(e) => setForm({...form, category: e.target.value})}
                        className="w-full px-5 py-3.5 text-sm font-bold bg-slate-50 dark:bg-white/5 border-none rounded-2xl outline-none focus:ring-4 ring-slate-500/10 dark:text-white appearance-none"
                      >
                         <option value="RAW_MATERIAL">Raw Material</option>
                         <option value="FINISHED_GOOD">Finished Good</option>
                         <option value="PACKAGING">Packaging</option>
                      </select>
                   </div>
                </div>

                <div className="p-6 bg-slate-50/50 dark:bg-white/5 rounded-[28px] border border-slate-100 dark:border-white/5">
                   <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest block mb-3">Opening Reconciliation Balance</label>
                   <div className="flex items-center gap-4">
                      <input 
                        type="number" 
                        placeholder="0.00" 
                        step="0.01" 
                        value={form.initialStock} 
                        onChange={(e) => setForm({...form, initialStock: Number(e.target.value)})}
                        className="flex-1 bg-white dark:bg-card px-6 py-4 rounded-2xl font-black text-2xl outline-none text-slate-900 dark:text-white" 
                      />
                      <span className="text-xl font-black text-slate-300 uppercase">{form.unit}</span>
                   </div>
                   <p className="text-[10px] text-slate-400 font-bold tracking-widest mt-3 uppercase italic">System will create an initial movement audit entry.</p>
                </div>

                <div className="pt-4 flex gap-4">
                   <button onClick={() => setShowAdd(false)} className="flex-1 py-5 rounded-3xl font-black text-[10px] uppercase tracking-[0.2em] text-slate-400 hover:bg-slate-50 transition-all">Cancel</button>
                   <button onClick={handleAdd} disabled={saving} className="flex-[2] py-5 bg-orange-500 text-white rounded-3xl font-black text-[10px] uppercase tracking-[0.2em] shadow-xl shadow-orange-500/20 hover:scale-[1.02] active:scale-95 transition-all">
                      {saving ? "Registering..." : "Finalize Registration"}
                   </button>
                </div>
             </div>
          </div>
        </div>
      )}

      {/* Settings Modal */}
      {editModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 animate-in fade-in duration-300">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-xl" onClick={() => setEditModal(null)} />
          <div className="relative bg-white dark:bg-card rounded-[48px] shadow-2xl w-full max-w-lg border border-white/20 dark:border-white/5 p-12 overflow-hidden">
             <div className="flex items-center gap-4 mb-10">
                <div className="w-16 h-16 rounded-[24px] bg-slate-900 dark:bg-white flex items-center justify-center text-white dark:text-slate-900 shadow-xl">
                   <Settings size={32} />
                </div>
                <div>
                   <h2 className="text-3xl font-black text-slate-900 dark:text-white tracking-tighter">Material Settings</h2>
                   <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Refining Logical Identification</p>
                </div>
             </div>

             <div className="space-y-6">
                <div className="space-y-2">
                   <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">Resource Name *</label>
                   <input value={editForm.name} onChange={(e) => setEditForm({...editForm, name: e.target.value})} className="w-full px-5 py-3.5 text-sm font-bold bg-slate-50 dark:bg-white/5 border-none rounded-2xl outline-none focus:ring-4 ring-slate-500/10 dark:text-white" />
                </div>

                <div className="grid grid-cols-2 gap-4">
                   <div className="space-y-2">
                      <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">Professional SKU</label>
                      <input value={editForm.sku} onChange={(e) => setEditForm({...editForm, sku: e.target.value.toUpperCase()})} className="w-full px-5 py-3.5 text-sm font-bold bg-slate-50 dark:bg-white/5 border-none rounded-2xl outline-none focus:ring-4 ring-slate-500/10 dark:text-white" />
                   </div>
                   <div className="space-y-2">
                      <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">Unit</label>
                      <select value={editForm.unit} onChange={(e) => setEditForm({...editForm, unit: e.target.value})} className="w-full px-5 py-3.5 text-sm font-bold bg-slate-50 dark:bg-white/5 border-none rounded-2xl outline-none appearance-none dark:text-white">
                         {["kg", "g", "litre", "ml", "pc", "box"].map(u => <option key={u} value={u}>{u}</option>)}
                      </select>
                   </div>
                </div>

                <div className="space-y-2">
                   <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">Critical Minimum Threshold</label>
                   <input type="number" value={editForm.minimumStock} onChange={(e) => setEditForm({...editForm, minimumStock: Number(e.target.value)})} className="w-full px-5 py-3.5 text-sm font-bold bg-slate-50 dark:bg-white/5 border-none rounded-2xl outline-none focus:ring-4 ring-slate-500/10 dark:text-white" />
                </div>

                <div className="pt-4 flex gap-4">
                   <button onClick={() => setEditModal(null)} className="flex-1 py-5 rounded-3xl font-black text-[10px] uppercase tracking-[0.2em] text-slate-400 hover:bg-slate-50 transition-all">Cancel</button>
                   <button onClick={handleEdit} className="flex-[2] py-5 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-3xl font-black text-[10px] uppercase tracking-[0.2em] shadow-xl hover:scale-[1.02] active:scale-95 transition-all">Save Strategic Updates</button>
                </div>
             </div>
          </div>
        </div>
      )}
    </div>
  );
}
