"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Layers, Plus, Search, AlertTriangle, CheckCircle2,
  RefreshCw, TrendingDown, TrendingUp, Trash2, X,
  ArrowDownCircle, Truck, Edit2, Lock, ArrowLeft, ArrowUpRight,
  Calculator, Package, BarChart3, Database
} from "lucide-react";
import { clsx } from "clsx";
import { rawMaterialsApi } from "@/lib/api";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";

export default function RawMaterialStockClient() {
  const [items, setItems]   = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("ALL");
  const [sourceFilter, setSourceFilter] = useState("ALL");
  const [showInactive, setShowInactive] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState<string>("");
  const [updating, setUpdating] = useState(false);

  const { user } = useAuth();

  const fetchItems = useCallback(async () => {
    setLoading(true);
    try {
      const res = await rawMaterialsApi.getAll(showInactive, user?.franchiseId);
      setItems(res.data ?? []);
    } catch (e) {
      console.error("Failed to fetch inventory:", e);
    } finally {
      setLoading(false);
    }
  }, [showInactive, user?.franchiseId]);

  const handleUpdateThreshold = async (itemId: string) => {
    setUpdating(true);
    try {
      const val = parseFloat(editValue);
      if (isNaN(val)) return;
      await rawMaterialsApi.update(itemId, { minimumStock: val });
      setEditingId(null);
      fetchItems();
    } catch (e) {
      console.error("Failed to update threshold", e);
    } finally {
      setUpdating(false);
    }
  };

  useEffect(() => { fetchItems(); }, [fetchItems, showInactive]);

  const handleDelete = async (item: any) => {
    if (!confirm(`Archive "${item.name}"?`)) return;
    try {
      await rawMaterialsApi.delete(item.id);
      fetchItems();
    } catch (e: any) {
       setDeleteError(e?.response?.data?.error || "Delete failed.");
    }
  };

  const filtered = items.filter((it) => {
    const matchSearch = !search ||
      it.name?.toLowerCase().includes(search.toLowerCase()) ||
      it.sku?.toLowerCase().includes(search.toLowerCase());
    
    const cat = category.toUpperCase();
    const itemCat = it.category?.toUpperCase() || "";
    
    const matchCat = cat === "ALL" || 
      (cat === "RAW" && (itemCat === "RAW_MATERIAL" || itemCat.startsWith("RAW_"))) ||
      (cat === "FINISHED" && (itemCat === "FINISHED_GOOD" || itemCat === "FINISHED_PRODUCT")) ||
      (cat === "PACKAGING" && itemCat.startsWith("PACKAGING"));
    
    const matchSource = sourceFilter === "ALL" ||
      (sourceFilter === "PURCHASED" && it.isPurchased) ||
      (sourceFilter === "MANUAL" && !it.isPurchased);
      
    return matchSearch && matchCat && matchSource;
  });

  const getStockStatus = (stock: number, threshold: number) => {
    const s = stock || 0;
    const t = threshold || 0;
    if (s <= 0) return { label: "CRITICAL", color: "bg-red-50 text-red-600 border-red-100 dark:bg-red-500/10 dark:border-red-500/20" };
    if (s < t) return { label: "LOW STOCK", color: "bg-orange-50 text-orange-600 border-orange-100 dark:bg-orange-500/10 dark:border-orange-500/20" };
    if (s === t) return { label: "REORDER", color: "bg-amber-50 text-amber-600 border-amber-100 dark:bg-amber-500/10 dark:border-amber-500/20" };
    return { label: "SAFE", color: "bg-emerald-50 text-emerald-600 border-emerald-100 dark:bg-emerald-500/10 dark:border-emerald-500/20" };
  };

  const totalValue = items.reduce((acc, i) => acc + ((i.currentStock || 0) * (i.costPrice || 0)), 0);

  return (
    <div className="max-w-[1600px] mx-auto space-y-8 animate-in fade-in duration-500 p-4 md:p-8">
      {deleteError && (
        <div className="flex items-center justify-between p-4 bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 rounded-2xl text-red-600 text-xs font-bold">
          <div className="flex items-center gap-3">
            <AlertTriangle size={14} />
            {deleteError}
          </div>
          <button onClick={() => setDeleteError(null)}><X size={14} /></button>
        </div>
      )}

      <header className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
             <div className="p-3 bg-slate-900 rounded-2xl shadow-xl shadow-slate-900/10 shrink-0">
                <Database size={24} className="text-white" />
             </div>
              <div>
                <h1 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white uppercase">
                   Item Master <span className="text-slate-400 font-medium ml-1 italic">& Inventory</span>
                </h1>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                  <BarChart3 size={12} className="text-orange-500" /> Operational stock ledger & valuation engine
                </p>
              </div>
          </div>
        </div>
        <div className="flex items-center gap-3">
           <button onClick={fetchItems} className="p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-xl hover:border-slate-300 transition-all shadow-sm">
             <RefreshCw size={16} className={clsx("text-slate-400", loading && "animate-spin")} />
           </button>
           {user?.role?.name === 'SUPER_ADMIN' && (
             <button 
               onClick={async () => {
                 if(!confirm("Standardize all Finished Goods to 'PC' unit?")) return;
                 try {
                   await fetch('/api/inventory/fix-units', { 
                     method: 'POST', 
                     headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` } 
                   });
                   alert("Units standardized successfully.");
                   fetchItems();
                 } catch (e) { alert("Sync failed."); }
               }}
               className="p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-xl hover:border-blue-300 transition-all shadow-sm text-blue-500"
               title="Sync Finished Goods Units"
             >
               <RefreshCw size={16} />
             </button>
           )}
           <Link
             href="/inventory/stock/add"
             className="flex items-center gap-3 bg-slate-900 text-white px-8 py-3.5 rounded-2xl font-black text-[11px] uppercase tracking-[0.2em] hover:bg-slate-800 transition-all shadow-2xl shadow-slate-900/20"
           >
             <Plus size={18} strokeWidth={3} /> Create New Item
           </Link>
        </div>
      </header>

      {/* High Density Analytics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
         {[
           { label: "Inventory Valuation", value: `₹${(totalValue/1000).toFixed(1)}K`, sub: "Live Asset Value", icon: Calculator, color: "text-orange-500", bg: "bg-orange-500/10" },
           { label: "Finished Products", value: items.filter(i => i.category?.includes('FINISHED')).length, sub: "Market Ready SKUs", icon: Package, color: "text-emerald-500", bg: "bg-emerald-500/10" },
           { label: "Low Stock Alerts", value: items.filter(i => (i.currentStock || 0) < (i.minimumStock || 0)).length, sub: "Reorder Required", icon: AlertTriangle, color: "text-red-500", bg: "bg-red-500/10" },
           { label: "Raw Materials", value: items.filter(i => i.category?.includes('RAW')).length, sub: "Production Inputs", icon: Layers, color: "text-blue-500", bg: "bg-blue-500/10" },
         ].map((stat, i) => (
           <div key={i} className="bg-white dark:bg-card/40 p-5 rounded-[2rem] border border-slate-100 dark:border-white/5 shadow-sm flex items-center gap-4">
              <div className={clsx("p-4 rounded-2xl", stat.bg, stat.color)}>
                 <stat.icon size={20} />
              </div>
              <div>
                 <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">{stat.label}</p>
                 <div className="flex items-baseline gap-2">
                    <h3 className="text-2xl font-black text-slate-900 dark:text-white tracking-tighter">{stat.value}</h3>
                    <span className="text-[8px] font-bold text-slate-400 uppercase italic">{stat.sub}</span>
                 </div>
              </div>
           </div>
         ))}
      </div>

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-50 dark:bg-white/5 p-2 rounded-[2rem] border border-slate-100 dark:border-white/5">
            <div className="flex gap-1 overflow-x-auto hide-scrollbar">
               {[
                  { id: "ALL", label: "All Items" },
                  { id: "RAW", label: "Raw Materials" },
                  { id: "FINISHED", label: "Finished Products" },
                  { id: "PACKAGING", label: "Packaging" }
               ].map((cat) => (
                 <button
                   key={cat.id}
                   onClick={() => setCategory(cat.id)}
                   className={clsx(
                     "px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap",
                     category === cat.id ? "bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm border border-slate-100 dark:border-white/10" : "text-slate-400"
                   )}
                 >
                   {cat.label}
                 </button>
               ))}
            </div>
            <div className="relative group w-full md:w-80 px-2">
               <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
               <input
                 type="text"
                 placeholder="Search SKU / Item Name..."
                 value={search}
                 onChange={(e) => setSearch(e.target.value)}
                 className="w-full pl-12 pr-6 py-3 bg-white dark:bg-slate-900 border-none rounded-xl outline-none text-xs font-bold shadow-sm"
               />
            </div>
      </div>

      {/* Dense Table Layout */}
      <div className="bg-white dark:bg-card/40 border border-slate-200 dark:border-white/5 rounded-[2.5rem] shadow-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left table-fixed">
            <thead className="bg-slate-50/50 dark:bg-white/[0.02] border-b border-slate-100 dark:border-white/5">
              <tr className="text-slate-400">
                <th className="w-[26%] px-8 py-4 text-[9px] font-black uppercase tracking-widest">Item Specification</th>
                <th className="w-[10%] px-6 py-4 text-[9px] font-black uppercase tracking-widest text-center">Movement</th>
                <th className="w-[14%] px-6 py-4 text-[9px] font-black uppercase tracking-widest">Stock Balance</th>
                <th className="w-[10%] px-6 py-4 text-[9px] font-black uppercase tracking-widest">Avg. Cost</th>
                <th className="w-[10%] px-6 py-4 text-[9px] font-black uppercase tracking-widest">Sale Price</th>
                <th className="w-[10%] px-6 py-4 text-[9px] font-black uppercase tracking-widest text-right">Valuation</th>
                <th className="w-[10%] px-6 py-4 text-[9px] font-black uppercase tracking-widest text-center">Status</th>
                <th className="w-[10%] px-8 py-4"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 dark:divide-white/5">
              {filtered.map((item) => {
                const status = getStockStatus(item.currentStock, item.minimumStock);
                const isFinished = item.category?.includes('FINISHED');
                const stockVal = (item.currentStock || 0) * (item.costPrice || 0);
                
                return (
                  <tr key={item.id} className="group hover:bg-slate-50/50 dark:hover:bg-white/[0.02] transition-all">
                    <td className="px-8 py-3">
                       <div className="flex items-center gap-3">
                          <div className={clsx("w-8 h-8 rounded-lg flex items-center justify-center font-black text-[9px] border shrink-0",
                            status.label === "CRITICAL" ? "bg-red-50 text-red-500 border-red-100" : "bg-slate-50 text-slate-500 border-slate-200"
                          )}>
                             {item.name.substring(0,2).toUpperCase()}
                          </div>
                          <div className="min-w-0">
                             <p className="font-black text-slate-900 dark:text-white uppercase tracking-tight text-[12px] truncate leading-none mb-1">{item.name}</p>
                             <div className="flex items-center gap-2">
                                <span className="text-[8px] font-black text-slate-400 uppercase tracking-tighter">{item.sku}</span>
                                <span className="text-[8px] font-bold text-slate-300 uppercase tracking-widest">• {item.category?.replace("_", " ")}</span>
                             </div>
                          </div>
                       </div>
                    </td>
                    <td className="px-6 py-3">
                       <div className="flex items-center justify-center gap-2">
                          <span className="text-[10px] font-black text-emerald-500">↑{(item.inbound || 0).toFixed(0)}</span>
                          <span className="text-[10px] font-black text-orange-500">↓{(item.outbound || 0).toFixed(0)}</span>
                       </div>
                    </td>
                    <td className="px-6 py-3">
                       <div className="flex flex-col gap-0.5">
                          <div className="flex items-center gap-2">
                             <span className={clsx("text-[13px] font-black tracking-tight", status.label !== "SAFE" ? "text-orange-600" : "text-slate-900 dark:text-slate-200")}>
                                {(item.currentStock || 0).toFixed(isFinished ? 0 : 1)}
                             </span>
                             <span className="text-[9px] text-slate-400 font-bold uppercase">{item.unit}</span>
                          </div>
                          <div className="text-[8px] font-bold text-slate-300 uppercase tracking-widest">
                             Min: {item.minimumStock} {item.unit}
                          </div>
                       </div>
                    </td>
                    <td className="px-6 py-3">
                       <span className="text-[12px] font-bold text-slate-500">₹{(item.costPrice || 0).toLocaleString()}</span>
                    </td>
                    <td className="px-6 py-3">
                       <span className="text-[12px] font-black text-blue-600 dark:text-blue-400">₹{(item.basePrice || 0).toLocaleString()}</span>
                    </td>
                    <td className="px-6 py-3 text-right">
                       <span className="text-[12px] font-black text-slate-900 dark:text-white">₹{stockVal.toLocaleString()}</span>
                    </td>
                    <td className="px-6 py-3 text-center">
                       <span className={clsx("inline-block px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-wider border", status.color)}>
                         {status.label}
                       </span>
                    </td>
                    <td className="px-8 py-3 text-right">
                       <div className="flex justify-end gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Link href={`/inventory/stock/edit?id=${item.id}`} className="p-2 bg-white dark:bg-slate-800 text-slate-400 rounded-lg hover:text-slate-900 border border-slate-100 dark:border-white/5"><Edit2 size={12} /></Link>
                          <button onClick={() => handleDelete(item)} className="p-2 bg-red-50 dark:bg-red-500/10 text-red-400 rounded-lg hover:bg-red-500 hover:text-white transition-all"><Trash2 size={12} /></button>
                       </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {filtered.length === 0 && (
            <div className="py-20 text-center space-y-4">
               <div className="inline-flex p-6 bg-slate-50 dark:bg-white/5 rounded-full mb-2"><Database size={40} className="text-slate-200" /></div>
               <p className="text-sm font-black text-slate-400 uppercase tracking-widest">No matching items found in ledger</p>
            </div>
          )}
        </div>
        <div className="px-8 py-4 bg-slate-50/50 dark:bg-white/[0.02] border-t border-slate-100 dark:border-white/5 flex items-center justify-between">
            <div className="flex items-center gap-6">
               <div className="flex items-center gap-2 text-[9px] font-black text-slate-400 uppercase tracking-widest"><span className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> Stock Integrity Active</div>
               <div className="flex items-center gap-2 text-[9px] font-black text-slate-400 uppercase tracking-widest"><Lock size={10} className="text-orange-500" /> Production Locked Ledger</div>
            </div>
            <p className="text-[9px] font-bold text-slate-300 uppercase tracking-widest italic">Total Valuation: ₹{totalValue.toLocaleString()}</p>
        </div>
      </div>
    </div>
  );
}
