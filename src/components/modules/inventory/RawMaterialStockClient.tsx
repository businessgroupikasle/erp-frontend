"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Layers, Plus, Search, AlertTriangle, CheckCircle2,
  RefreshCw, TrendingDown, TrendingUp, Trash2, X,
  ArrowDownCircle, Truck, Edit2, Lock
} from "lucide-react";
import { clsx } from "clsx";
import { rawMaterialsApi, inventoryApi } from "@/lib/api";

import { ITEM_CATEGORIES } from "@/lib/constants";
import Link from "next/link";

export default function RawMaterialStockClient() {
  const [items, setItems]   = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("ALL");
  const [sourceFilter, setSourceFilter] = useState("ALL");
  const [showInactive, setShowInactive] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const fetchItems = useCallback(async () => {
    setLoading(true);
    try {
      const res = await rawMaterialsApi.getAll(showInactive);
      setItems(res.data ?? []);
    } catch (e) {
      console.error("Failed to fetch inventory:", e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchItems(); }, [fetchItems, showInactive]);

  const handleDeactivate = async (id: string, name: string) => {
    if (!confirm(`Archive "${name}"? It will be hidden from main lists but history will be preserved.`)) return;
    try {
      await rawMaterialsApi.deactivate(id);
      fetchItems();
    } catch (e: any) {
      setDeleteError(e?.response?.data?.error || "Failed to deactivate item.");
    }
  };

  const handleActivate = async (id: string) => {
    try {
      await rawMaterialsApi.activate(id);
      fetchItems();
    } catch (e: any) {
      setDeleteError(e?.response?.data?.error || "Failed to reactivate item.");
    }
  };

  const handleDelete = async (item: any) => {
    const { id, name } = item;
    setDeleteError(null);

    try {
      // First try to delete
      await rawMaterialsApi.delete(id);
      fetchItems();
    } catch (e: any) {
       const serverError = e?.response?.data?.error;
       if (serverError && serverError.includes("history")) {
         // If history exists, offer deactivation
         if (confirm(`${name} has stock history and cannot be deleted permanently.\n\nWould you like to MARK AS INACTIVE instead? (It will be hidden but safe for audits)`)) {
           handleDeactivate(id, name);
         }
       } else {
         setDeleteError(serverError ?? "Delete failed.");
       }
    }
  };

  const filtered = items.filter((it) => {
    const matchSearch = !search ||
      it.name?.toLowerCase().includes(search.toLowerCase()) ||
      it.sku?.toLowerCase().includes(search.toLowerCase()) ||
      it.hsnCode?.toLowerCase().includes(search.toLowerCase());
    const matchCat = category === "ALL" || it.category === category;
    const matchSource = sourceFilter === "ALL" ||
      (sourceFilter === "PURCHASED" && it.isPurchased) ||
      (sourceFilter === "MANUAL" && !it.isPurchased);
    return matchSearch && matchCat && matchSource;
  });

  return (
    <div className="max-w-7xl mx-auto space-y-10 animate-in fade-in duration-700">
      {deleteError && (
        <div className="flex items-center justify-between gap-4 p-4 bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 rounded-2xl text-red-600 dark:text-red-400 text-sm font-bold animate-in fade-in slide-in-from-top-2">
          <div className="flex items-center gap-3">
            <AlertTriangle size={16} className="shrink-0" />
            {deleteError}
          </div>
          <button onClick={() => setDeleteError(null)} className="shrink-0 text-red-400 hover:text-red-600 transition-colors">
            <X size={14} />
          </button>
        </div>
      )}
      <header className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 py-4 border-b border-slate-200 dark:border-slate-800">
        <div className="space-y-1">
          <div className="flex items-center gap-2.5">
             <div className="p-2 md:p-2.5 bg-orange-500 rounded-lg md:rounded-xl shadow-lg shadow-orange-500/20 shrink-0">
                <Layers size={20} className="text-white" />
             </div>
              <h1 className="text-lg md:text-xl lg:text-2xl font-black tracking-tight text-slate-900 dark:text-white uppercase transition-all">
                 Inventory & <span className="text-slate-400 font-medium ml-1 tracking-tighter italic">Stock Intelligence</span>
              </h1>
          </div>
          <p className="text-slate-500 dark:text-slate-400 font-medium ml-12 text-xs leading-relaxed">
            Strategic inventory control and <span className="text-orange-500 font-bold underline decoration-orange-500/30">real-time movement</span> tracking.
          </p>
        </div>
        <div className="flex items-center gap-2 md:gap-3">
           <button onClick={fetchItems} className="p-3 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl hover:border-slate-300 transition-all shadow-sm group shrink-0">
             <RefreshCw size={16} className={clsx("text-slate-400 group-hover:rotate-180 transition-transform duration-500", loading && "animate-spin")} />
           </button>
           <Link
             href="/inventory/stock/add"
             className="flex items-center justify-center gap-2.5 bg-slate-900 dark:bg-white text-white dark:text-slate-900 px-6 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest hover:shadow-xl hover:translate-y-[-1px] transition-all active:translate-y-0 shadow-slate-200 dark:shadow-none"
           >
             <Plus size={16} strokeWidth={3} /> Add Item
          </Link>
        </div>
      </header>

      <div className="flex flex-col gap-6">
         <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="flex p-1 bg-slate-100 dark:bg-white/5 rounded-2xl w-full md:w-fit border border-slate-200 dark:border-white/5 overflow-x-auto hide-scrollbar">
               {["ALL", ...ITEM_CATEGORIES].map((cat) => (
                 <button
                   key={cat}
                   onClick={() => setCategory(cat)}
                   className={clsx(
                     "px-6 py-2.5 rounded-xl text-[11px] font-black uppercase tracking-widest transition-all whitespace-nowrap",
                     category === cat
                       ? "bg-white dark:bg-card text-slate-900 dark:text-white shadow-md border border-slate-100 dark:border-white/10"
                       : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
                   )}
                 >
                   {cat === "ALL" ? "All Items" : cat.replace("_", " ")}
                 </button>
               ))}
            </div>

            <div className="flex p-1 bg-slate-100 dark:bg-white/5 rounded-2xl w-full md:w-fit border border-slate-200 dark:border-white/5 overflow-x-auto hide-scrollbar">
               {[
                  { id: "ALL", label: "All Sources" },
                  { id: "PURCHASED", label: "Purchased" },
                  { id: "MANUAL", label: "Direct" }
               ].map((src) => (
                  <button
                     key={src.id}
                     onClick={() => setSourceFilter(src.id)}
                     className={clsx(
                        "px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap",
                        sourceFilter === src.id
                           ? "bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-md"
                           : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
                     )}
                  >
                     {src.label}
                  </button>
               ))}
            </div>

            <button 
              onClick={() => setShowInactive(!showInactive)}
              className={clsx("flex items-center gap-2 px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest border transition-all", 
                showInactive ? "bg-slate-900 text-white border-slate-900" : "bg-white text-slate-400 border-slate-100 hover:border-slate-200")}
            >
              <Lock size={12} className={showInactive ? "text-orange-500" : "text-slate-300"} />
              {showInactive ? "Viewing All (Inc. Archived)" : "Active Only"}
            </button>
         </div>

         <div className="relative group w-full">
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

      <div className="space-y-4">
        {/* Mobile View */}
        <div className="grid grid-cols-1 gap-4 md:hidden">
          {filtered.map((item) => (
            <div key={item.id} className="bg-white dark:bg-card/40 backdrop-blur-md border border-slate-200 dark:border-white/5 rounded-3xl p-5 shadow-lg space-y-4">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className={clsx("w-10 h-10 rounded-xl flex items-center justify-center font-black text-[10px] border shrink-0",
                    item.status === "LOW" ? "bg-red-50 text-red-500 border-red-100" : "bg-emerald-50 text-emerald-500 border-emerald-100"
                  )}>
                     {item.name.substring(0,2).toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <p className="font-black text-slate-900 dark:text-white uppercase tracking-tight text-sm leading-tight truncate">{item.name}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className={clsx("text-[8px] font-black px-1.5 py-0.5 rounded bg-slate-100 dark:bg-white/10 uppercase tracking-tighter", 
                        item.status === "LOW" ? "text-red-500" : "text-slate-400")}>
                        {item.sku}
                      </span>
                      {item.isPurchased ? (
                        <span className="px-1.5 py-0.5 bg-purple-500/10 text-purple-500 border border-purple-500/20 rounded text-[7px] font-black uppercase tracking-widest">Vendor</span>
                      ) : (
                        <span className="px-1.5 py-0.5 bg-blue-500/10 text-blue-500 border border-blue-500/20 rounded text-[7px] font-black uppercase tracking-widest">Direct</span>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-2 shrink-0">
                  <span className="text-[10px] font-black text-slate-600 dark:text-slate-300">{(item.currentStock || 0).toFixed(0)} {item.unit}</span>
                  <span className={clsx("px-2 py-1 rounded-full text-[8px] font-black uppercase tracking-wider border", 
                    item.status === "LOW" ? "bg-red-50 dark:bg-red-500/10 text-red-600 border-red-100 dark:border-red-500/20" : "bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 border-emerald-100 dark:border-emerald-500/20")}>
                    {item.status === "LOW" ? "LOW" : "SAFE"}
                  </span>
                </div>
              </div>
              
              <div className="px-3 py-2 bg-slate-50 dark:bg-white/[0.02] rounded-xl border border-slate-100 dark:border-white/5">
                 {item.isPurchased ? (
                    <div className="flex items-center gap-2 text-[9px] font-black text-purple-600 uppercase tracking-tight">
                       <Truck size={10} /> {item.vendor?.name || 'Linked Vendor'}
                    </div>
                 ) : (
                    <div className="flex items-center gap-2 text-[9px] font-black text-blue-500 uppercase tracking-tight">
                       <Plus size={10} /> Manual Stock
                    </div>
                 )}
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-white/5">
                <div className="flex gap-2">
                  <Link href={`/inventory/stock/edit?id=${item.id}`} className="p-2.5 bg-slate-100 dark:bg-white/5 text-slate-500 rounded-xl"><Edit2 size={14} /></Link>
                  {item.isActive ? (
                    <button onClick={() => handleDelete(item)} className="p-2.5 bg-red-50 dark:bg-red-500/10 text-red-500 rounded-xl"><Trash2 size={14} /></button>
                  ) : (
                    <button onClick={() => handleActivate(item.id)} className="px-4 py-2 bg-emerald-500 text-white rounded-xl text-[8px] font-black uppercase tracking-widest uppercase">Activate</button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Desktop Table View */}
        <div className="hidden md:block bg-white dark:bg-card/40 backdrop-blur-md border border-slate-200 dark:border-white/5 rounded-[48px] shadow-2xl shadow-black/[0.03] overflow-hidden">
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
                  const isLow = item.status === "LOW";
                  return (
                    <tr key={item.id} className="group hover:bg-slate-50 dark:hover:bg-white/5 transition-all">
                      <td className="px-10 py-6">
                         <div className="flex items-start gap-4">
                            <div className={clsx("w-12 h-12 rounded-2xl flex items-center justify-center font-black text-xs border transition-all group-hover:shadow-lg shrink-0 mt-1",
                              isLow ? "bg-red-50 text-red-500 border-red-100 shadow-red-500/10" : "bg-emerald-50 text-emerald-500 border-emerald-100 shadow-emerald-500/10"
                            )}>
                               {item.name.substring(0,2).toUpperCase()}
                            </div>
                            <div className="min-w-0 flex-1 space-y-2">
                               <div className="flex items-center gap-3">
                                  <p className="font-black text-slate-900 dark:text-white uppercase tracking-tight text-[15px] leading-tight truncate">{item.name}</p>
                                  {item.isPurchased ? (
                                    <span className="px-2 py-0.5 bg-purple-500/10 text-purple-500 border border-purple-500/20 rounded-md text-[8px] font-black uppercase tracking-widest">Vendor</span>
                                  ) : (
                                    <span className="px-2 py-0.5 bg-blue-500/10 text-blue-500 border border-blue-500/20 rounded-md text-[8px] font-black uppercase tracking-widest">Direct</span>
                                  )}
                               </div>
                               <div className="flex items-center gap-2">
                                  <span className={clsx("text-[9px] font-black px-1.5 py-0.5 rounded bg-slate-100 dark:bg-white/10 uppercase tracking-tighter",
                                    isLow ? "text-red-500" : "text-slate-400")}>
                                    {item.sku}
                                  </span>
                                  <span className="w-1 h-1 rounded-full bg-slate-200" />
                                  <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{item.category?.replace("_", " ")}</span>
                               </div>
                               {(item.isPurchased || item.incomingStock > 0) ? (
                                  <div className="flex flex-col gap-1.5 p-2 bg-purple-50/50 dark:bg-purple-500/[0.02] rounded-xl border border-purple-100/50 dark:border-purple-500/10">
                                     <span className="text-[9px] font-black text-purple-600 dark:text-purple-400 uppercase tracking-tight flex items-center gap-1.5">
                                        <Truck size={10} className="shrink-0" />
                                        {item.vendor?.name || 'Linked Vendor'}
                                     </span>
                                  </div>
                               ) : (
                                  <div className="flex items-center gap-1.5 text-[9px] font-black text-blue-500 uppercase tracking-tight px-1 bg-blue-50/50 dark:bg-blue-500/[0.02] py-1.5 rounded-lg border border-blue-100/50 dark:border-blue-500/10">
                                     <Plus size={10} className="text-blue-500" /> Manual Stock / Direct Add
                                  </div>
                               )}
                            </div>
                         </div>
                      </td>
                      <td className="px-8 py-6">
                         <div className="flex flex-col items-center gap-1.5">
                            <div className="flex items-center gap-1.5 px-2 py-1 bg-emerald-50 dark:bg-emerald-500/5 rounded-lg border border-emerald-100/50 dark:border-emerald-500/10">
                               <TrendingUp size={10} className="text-emerald-500" />
                               <span className="text-[11px] font-black text-emerald-600 dark:text-emerald-400">+{(item.inbound || 0).toFixed(1)}</span>
                            </div>
                            <div className="flex items-center gap-1.5 px-2 py-1 bg-orange-50 dark:bg-orange-500/5 rounded-lg border border-orange-100/50 dark:border-orange-500/10">
                               <TrendingDown size={10} className="text-orange-500" />
                               <span className="text-[11px] font-black text-orange-600 dark:text-orange-400">-{(item.outbound || 0).toFixed(1)}</span>
                            </div>
                         </div>
                      </td>
                      <td className="px-8 py-6">
                         <div className="space-y-1.5 min-w-[140px]">
                            <div className="flex justify-between items-center px-1">
                               <span className={clsx("text-[14px] font-black", isLow ? "text-red-600" : "text-slate-900 dark:text-slate-200")}>
                                  {(item.currentStock || 0).toFixed(1)} <span className="text-[10px] text-slate-400 font-bold tracking-widest uppercase">{item.unit}</span>
                               </span>
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
                         {item.incomingStock > 0 ? (
                            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-50 dark:bg-amber-500/10 text-[10px] font-black text-amber-600 uppercase tracking-wider border border-amber-100 dark:border-amber-500/20 animate-pulse">
                               <Truck size={12} /> On Order
                            </span>
                         ) : isLow ? (
                           <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-red-50 dark:bg-red-500/10 text-[10px] font-black text-red-600 uppercase tracking-wider border border-red-100 dark:border-red-500/20">
                             <AlertTriangle size={12} /> Low
                           </span>
                         ) : (
                           <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-50 dark:bg-emerald-500/10 text-[10px] font-black text-emerald-600 uppercase tracking-wider border border-emerald-100 dark:border-emerald-500/20">
                             <CheckCircle2 size={12} /> Safe
                           </span>
                         )}
                      </td>
                      <td className="px-10 py-6 text-right">
                         <div className="flex justify-end gap-2">
                            <Link href={`/inventory/stock/edit?id=${item.id}`} className="p-2 bg-slate-50 dark:bg-white/5 text-slate-400 rounded-2xl hover:bg-slate-900 dark:hover:bg-white hover:text-white dark:hover:text-slate-900 transition-all border border-slate-100 dark:border-white/5"><Edit2 size={14} /></Link>
                            {item.isActive ? (
                               <button onClick={() => handleDelete(item)} className="p-2 bg-red-50 dark:bg-red-500/10 text-red-400 rounded-2xl hover:bg-red-500 hover:text-white transition-all border border-red-100 dark:border-red-500/20"><Trash2 size={14} /></button>
                            ) : (
                               <button onClick={() => handleActivate(item.id)} className="px-4 py-2 bg-emerald-50 dark:bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 rounded-2xl hover:bg-emerald-500 hover:text-white transition-all text-[9px] font-black uppercase tracking-widest">Restore</button>
                            )}
                         </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <div className="w-full py-8 text-center border-t border-slate-100 dark:border-white/5 bg-slate-50/20 dark:bg-transparent flex flex-wrap items-center justify-center gap-8 px-6">
             <div className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest"><span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" /> STOCK FROM MOVEMENTS</div>
             <div className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest"><Lock size={10} className="text-orange-500 shrink-0" /> NO MANUAL EDITS</div>
             <div className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest"><span className="w-2 h-2 rounded-full bg-blue-500 shrink-0" /> GRN / PRODUCTION DRIVEN</div>
          </div>
        </div>
      </div>
    </div>
  );
}
