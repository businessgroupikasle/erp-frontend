"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Layers, Plus, X, Search, AlertTriangle, CheckCircle2,
  RefreshCw, TrendingDown, TrendingUp, Trash2, Settings, Edit2,
  ArrowDownCircle, ArrowUpCircle, Scale, Lock, MoveUp, MoveDown,
  Truck
} from "lucide-react";
import { clsx } from "clsx";
import { rawMaterialsApi, inventoryApi } from "@/lib/api";

import { ITEM_CATEGORIES, UNITS, CATEGORY_COLORS } from "@/lib/constants";
import Link from "next/link";

/**
 * RawMaterialStockPage
 * 
 * This component provides a high-end dashboard for managing raw material inventory.
 * It includes real-time analytics, strategic filtering, and full lifecycle management
 * (Add, Edit, Delete) for inventory items.
 */
export default function RawMaterialStockPage() {
  /**
   * --- STATE MANAGEMENT ---
   */
  const [items, setItems]   = useState<any[]>([]); 
  const [loading, setLoading] = useState(true); 
  const [search, setSearch] = useState(""); 
  const [category, setCategory] = useState("ALL"); 
  const [sourceFilter, setSourceFilter] = useState("ALL"); 

  const fetchItems = useCallback(async () => {
    setLoading(true);
    try {
      const res = await inventoryApi.getInventory();
      setItems(res.data ?? []);
    } catch (e) {
      console.error("Failed to fetch inventory:", e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchItems(); }, [fetchItems]);

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Delete "${name}"? This cannot be undone.`)) return;
    try {
      await rawMaterialsApi.delete(id);
      fetchItems();
    } catch (e: any) {
      alert(e?.response?.data?.error ?? "Failed to delete item. Ensure it has no stock history.");
    }
  };

  /**
   * --- FILTERING LOGIC ---
   * Real-time multi-dimensional filtering across Search, Category, and Source.
   */
  const filtered = items.filter((it) => {
    // 1. Text Search (Name, SKU, or HSN Code)
    const matchSearch = !search || 
      it.name?.toLowerCase().includes(search.toLowerCase()) || 
      it.sku?.toLowerCase().includes(search.toLowerCase()) ||
      it.hsnCode?.toLowerCase().includes(search.toLowerCase());
    
    // 2. Category Filter
    const matchCat = category === "ALL" || it.category === category;
    
    // 3. Source Filter (Vendor-sourced vs Manually added)
    const matchSource = sourceFilter === "ALL" || 
      (sourceFilter === "PURCHASED" && it.isPurchased) || 
      (sourceFilter === "MANUAL" && !it.isPurchased);
    
    return matchSearch && matchCat && matchSource;
  });

  /**
   * --- AGGREGATE STATISTICS ---
   */
  const lowStock   = items.filter((it) => it.status === "LOW").length; // Count of items below safe threshold
  const totalIn    = items.reduce((s: number, it: any) => s + (it.inbound ?? 0), 0); // Total received today
  const totalOut   = items.reduce((s: number, it: any) => s + (it.outbound ?? 0), 0); // Total used today
  const totalQty   = items.reduce((s: number, it: any) => s + (it.currentStock ?? 0), 0); // Cumulative stock count
  const totalValue = items.reduce((s: number, it: any) => s + (it.currentStock * 150), 0); // Estimated inventory value

  return (
    <div className="max-w-7xl mx-auto space-y-10 animate-in fade-in duration-700">
      {/* 
          STRATEGIC HEADER 
          Main title and global actions (Refresh, Add Material)
      */}
      <header className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 py-4 border-b border-slate-200 dark:border-slate-800">
        <div className="space-y-1">
          <div className="flex items-center gap-2.5">
             <div className="p-2 md:p-2.5 bg-orange-500 rounded-lg md:rounded-xl shadow-lg shadow-orange-500/20 shrink-0">
                <Layers size={18} className="text-white md:hidden" />
                <Layers size={20} className="text-white hidden md:block" />
             </div>
             <h1 className="text-lg md:text-xl lg:text-2xl font-black tracking-tight text-slate-900 dark:text-white uppercase transition-all">
                Raw Material <span className="text-slate-400 font-medium ml-1 tracking-tighter italic">Stock Intelligence</span>
             </h1>
          </div>
          <p className="text-slate-500 dark:text-slate-400 font-medium ml-10 md:ml-12 text-[10px] md:text-xs leading-relaxed">
            Strategic inventory control and <span className="text-orange-500 font-bold underline decoration-orange-500/30">real-time movement</span> tracking.
          </p>
        </div>
        <div className="flex items-center gap-2 md:gap-3">
           {/* Manual Refresh Trigger */}
           <button onClick={fetchItems} className="p-2.5 md:p-3 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl hover:border-slate-300 transition-all shadow-sm group shrink-0">
             <RefreshCw size={16} className={clsx("text-slate-400 group-hover:rotate-180 transition-transform duration-500", loading && "animate-spin")} />
           </button>
           {/* Create Modal Trigger */}
           <Link
             href="/inventory/stock/add"
             className="flex-1 md:flex-none flex items-center justify-center gap-2 md:gap-2.5 bg-slate-900 dark:bg-white text-white dark:text-slate-900 px-4 md:px-6 py-2.5 md:py-3 rounded-xl font-black text-[9px] md:text-[10px] uppercase tracking-widest hover:shadow-xl hover:translate-y-[-1px] transition-all active:translate-y-0 shadow-slate-200 dark:shadow-none"
           >
            <Plus size={14} className="md:hidden" strokeWidth={3} />
            <Plus size={16} className="hidden md:block" strokeWidth={3} /> Add Material
          </Link>
        </div>
      </header>

      {/* 
          ANALYTICS DASHBOARD 
          Key Performance Indicators (KPIs) for immediate situational awareness
     
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        {[
          // 1. Inventory Equity: Total estimated monetary value of currently held stock
          { label: "Inventory Equity", value: `₹${(totalValue / 1000).toFixed(1)}K`, icon: Scale, color: "text-blue-500", bg: "bg-blue-500/10" },
          
          // 2. Critical SKU Count: Number of items that have dropped below their minimum stock threshold
          { label: "Critical SKU Count", value: lowStock, icon: AlertTriangle, color: "text-red-500", bg: "bg-red-500/10" },
          
          // 3. Inbound Today: Total quantity of materials received since 12:00 AM today (via GRNs, etc.)
          { label: "Inbound Today", value: `${totalIn.toFixed(1)} Un`, icon: MoveUp, color: "text-emerald-500", bg: "bg-emerald-500/10" },
          
          // 4. Outbound Today: Total quantity of materials used or wasted since 12:00 AM today
          { label: "Outbound Today", value: `${totalOut.toFixed(1)} Un`, icon: MoveDown, color: "text-orange-500", bg: "bg-orange-500/10" },
        ].map((stat, i) => (
          <div key={i} className="bg-white dark:bg-card/40 backdrop-blur-sm p-5 md:p-6 rounded-[24px] md:rounded-[32px] border border-slate-100 dark:border-white/5 shadow-xl shadow-black/[0.02] group">
            <div className="flex items-center justify-between mb-4">
               <div className={clsx("p-2.5 md:p-3 rounded-xl md:rounded-2xl transition-transform group-hover:scale-110 duration-500", stat.bg, stat.color)}>
                  <stat.icon size={18} className="md:hidden" />
                  <stat.icon size={20} className="hidden md:block" />
               </div>
               <span className="text-[10px] font-black text-slate-400 tracking-widest uppercase">Live View</span>
            </div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">{stat.label}</p>
            <h3 className="text-2xl md:text-3xl font-black text-slate-900 dark:text-white tracking-tighter">{stat.value}</h3>
          </div>
        ))}
      </div>

      {/* 
          CONTROL PANEL 
          Filtering by Category, Source, and Keyword
      */}
      <div className="flex flex-col gap-6">
         <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            {/* Category Filter Group */}
            <div className="flex p-1 bg-slate-100 dark:bg-white/5 rounded-2xl w-full md:w-fit border border-slate-200 dark:border-white/5 overflow-x-auto hide-scrollbar">
               {["ALL", ...ITEM_CATEGORIES].map((cat) => (
                 <button
                   key={cat}
                   onClick={() => setCategory(cat)}
                   className={clsx(
                     "flex-1 md:flex-none px-4 md:px-6 py-2.5 rounded-xl text-[10px] md:text-[11px] font-black uppercase tracking-widest transition-all whitespace-nowrap",
                     category === cat 
                       ? "bg-white dark:bg-card text-slate-900 dark:text-white shadow-md border border-slate-100 dark:border-white/10" 
                       : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
                   )}
                 >
                   {cat === "ALL" ? "All Items" : cat.replace("_", " ")}
                 </button>
               ))}
            </div>

            {/* Source Filter Group (Purchased vs Manual) */}
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
                        "flex-1 md:flex-none px-4 md:px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap",
                        sourceFilter === src.id 
                           ? "bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-md" 
                           : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
                     )}
                  >
                     {src.label}
                  </button>
               ))}
            </div>
         </div>

         {/* Multi-field Search Input */}
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

      {/* 
          MAIN STOCK TABLE 
          Detailed breakdown of each inventory item
      */}
      {/* 
          MAIN STOCK VIEW
          Responsive Table for Desktop & Card View for Mobile
      */}
      <div className="space-y-4">
        {/* Mobile Card View (shown only on small screens) */}
        <div className="grid grid-cols-1 gap-4 md:hidden">
          {filtered.map((item) => {
            const isLow = item.status === "LOW";
            return (
              <div key={item.id} className="bg-white dark:bg-card/40 backdrop-blur-md border border-slate-200 dark:border-white/5 rounded-3xl p-5 shadow-lg space-y-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className={clsx("w-10 h-10 rounded-xl flex items-center justify-center font-black text-[10px] border shrink-0", 
                      isLow ? "bg-red-50 text-red-500 border-red-100" : "bg-emerald-50 text-emerald-500 border-emerald-100"
                    )}>
                       {item.name.substring(0,2).toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <p className="font-black text-slate-900 dark:text-white uppercase tracking-tight text-sm leading-tight truncate">{item.name}</p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className={clsx("text-[8px] font-black px-1.5 py-0.5 rounded bg-slate-100 dark:bg-white/10 uppercase tracking-tighter", 
                          isLow ? "text-red-500" : "text-slate-400")}>
                          {item.sku}
                        </span>
                        <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{item.category?.replace("_", " ")}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-2 shrink-0">
                    <div className="flex flex-col items-end">
                      <span className="text-[7px] font-black text-slate-400 uppercase tracking-[0.2em] leading-none mb-1">Threshold</span>
                      <span className="text-[10px] font-black text-slate-600 dark:text-slate-300">{(item.minimumStock || 10).toFixed(0)} {item.unit}</span>
                    </div>
                    {isLow ? (
                      <span className="px-2 py-1 rounded-full bg-red-50 dark:bg-red-500/10 text-[8px] font-black text-red-600 uppercase tracking-wider border border-red-100 dark:border-red-500/20">LOW</span>
                    ) : (
                      <span className="px-2 py-1 rounded-full bg-emerald-50 dark:bg-emerald-500/10 text-[8px] font-black text-emerald-600 uppercase tracking-wider border border-emerald-100 dark:border-emerald-500/20">SAFE</span>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 pt-2 border-t border-slate-100 dark:border-white/5">
                   <div>
                      <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">In Stock</p>
                      <div className="flex items-baseline gap-1">
                         <span className={clsx("text-lg font-black", isLow ? "text-red-600" : "text-slate-900 dark:text-slate-200")}>
                            {(item.currentStock || 0).toFixed(1)}
                         </span>
                         <span className="text-[10px] text-slate-400 font-bold uppercase">{item.unit}</span>
                      </div>
                      <div className="h-1 w-full bg-slate-100 dark:bg-white/5 rounded-full mt-2">
                        <div 
                          className={clsx("h-full rounded-full", isLow ? "bg-red-500" : "bg-emerald-500")} 
                          style={{ width: `${Math.min(100, (item.currentStock / (item.minimumStock * 2)) * 100)}%` }} 
                        />
                      </div>
                   </div>
                   <div>
                      <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">Movement (24h)</p>
                      <div className="space-y-1">
                        <div className="flex items-center gap-1.5 text-[10px] font-black text-emerald-500">
                          <TrendingUp size={10} /> +{(item.inbound || 0).toFixed(1)}
                        </div>
                        <div className="flex items-center gap-1.5 text-[10px] font-black text-orange-500">
                          <TrendingDown size={10} /> -{(item.outbound || 0).toFixed(1)}
                        </div>
                      </div>
                   </div>
                </div>

                <div className="flex items-center justify-between pt-4">
                  <div className="flex flex-col gap-1">
                    {item.isPurchased ? (
                       <>
                        <span className="text-[9px] font-black text-purple-500 uppercase flex items-center gap-1">
                            <ArrowDownCircle size={10} /> Purchased
                        </span>
                        {(() => {
                          const lastPurchase = item.movements?.find((m: any) => m.movementType === 'PURCHASE_IN');
                          if (!lastPurchase) return null;
                          return (
                            <span className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">
                              {new Date(lastPurchase.createdAt).toLocaleDateString()}
                            </span>
                          );
                        })()}
                       </>
                    ) : (
                       <span className="text-[9px] font-black text-slate-400 uppercase flex items-center gap-1">
                          <Plus size={10} /> Manual
                       </span>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <Link
                      href={`/inventory/stock/edit?id=${item.id}`}
                      className="p-2.5 bg-slate-100 dark:bg-white/5 text-slate-500 rounded-xl active:scale-95 transition-all border border-slate-200 dark:border-white/5"
                    >
                       <Edit2 size={14} />
                    </Link>
                    <button
                      onClick={() => handleDelete(item.id, item.name)}
                      className="p-2.5 bg-red-50 dark:bg-red-500/10 text-red-500 rounded-xl active:scale-95 transition-all border border-red-100 dark:border-red-500/20"
                    >
                       <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Desktop Table View (hidden on mobile) */}
        <div className="hidden md:block bg-white dark:bg-card/40 backdrop-blur-md border border-slate-200 dark:border-white/5 rounded-[48px] shadow-2xl shadow-black/[0.03] overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-slate-100 dark:border-white/5 text-slate-400">
                  <th className="px-6 md:px-10 py-6 text-[10px] font-black uppercase tracking-widest">Specifications</th>
                  <th className="hidden lg:table-cell px-8 py-6 text-[10px] font-black uppercase tracking-widest text-center">Movement (24h)</th>
                  <th className="px-6 md:px-8 py-6 text-[10px] font-black uppercase tracking-widest">In Stock Balance</th>
                  <th className="hidden xl:table-cell px-8 py-6 text-[10px] font-black uppercase tracking-widest">Threshold</th>
                  <th className="hidden md:table-cell px-8 py-6 text-[10px] font-black uppercase tracking-widest text-center">Status</th>
                  <th className="px-6 md:px-10 py-6"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50 dark:divide-white/5">
                {filtered.map((item) => {
                  const isLow = item.status === "LOW";
                  return (
                    <tr key={item.id} className="group hover:bg-slate-50 dark:hover:bg-white/5 transition-all">
                      {/* Specification Column: Name, SKU, Category, Source */}
                      <td className="px-6 md:px-10 py-6">
                         <div className="flex items-start gap-3 md:gap-4">
                            {/* Material Initials Icon */}
                            <div className={clsx("w-10 h-10 md:w-12 md:h-12 rounded-xl md:rounded-2xl flex items-center justify-center font-black text-[10px] md:text-xs border transition-all group-hover:shadow-lg shrink-0 mt-1", 
                              isLow ? "bg-red-50 text-red-500 border-red-100 shadow-red-500/10" : "bg-emerald-50 text-emerald-500 border-emerald-100 shadow-emerald-500/10"
                            )}>
                               {item.name.substring(0,2).toUpperCase()}
                            </div>
                            
                            <div className="min-w-0 flex-1 space-y-2">
                               {/* Primary Label */}
                               <p className="font-black text-slate-900 dark:text-white uppercase tracking-tight text-xs md:text-[15px] leading-tight truncate">{item.name}</p>
                               
                               {/* Metadata Row: SKU & Category */}
                               <div className="flex items-center gap-2">
                                  <span className={clsx("text-[8px] md:text-[9px] font-black px-1.5 py-0.5 rounded bg-slate-100 dark:bg-white/10 uppercase tracking-tighter", 
                                    isLow ? "text-red-500" : "text-slate-400")}>
                                    {item.sku}
                                  </span>
                                  <span className="hidden xl:inline w-1 h-1 rounded-full bg-slate-200" />
                                  <span className="hidden xl:inline text-[9px] font-bold text-slate-400 uppercase tracking-widest">{item.category?.replace("_", " ")}</span>
                               </div>

                               {/* Source Details: Vendor & Last Purchase */}
                               {(item.isPurchased || item.incomingStock > 0) ? (
                                  <div className="flex flex-col gap-1.5 p-2 bg-slate-50/50 dark:bg-white/[0.02] rounded-xl border border-slate-100/50 dark:border-white/5">
                                     <div className="flex items-center justify-between gap-4">
                                        <span className="text-[9px] font-black text-purple-500 uppercase tracking-tight flex items-center gap-1.5">
                                           <ArrowDownCircle size={10} className="shrink-0" /> 
                                           {item.incomingStock > 0 && !item.vendorId ? "Incoming from Vendor" : `Vendor: ${item.vendor?.name || 'Linked Vendor'}`}
                                        </span>
                                        {item.incomingStock > 0 && (
                                           <span className="px-1.5 py-0.5 bg-amber-50 dark:bg-amber-500/10 text-amber-600 text-[8px] font-black rounded uppercase tracking-tighter animate-pulse border border-amber-100/50">
                                              Ordered: {item.incomingStock} {item.unit}
                                           </span>
                                        )}
                                     </div>
                                     
                                     {(() => {
                                       const lastPurchase = item.movements?.find((m: any) => m.movementType === 'PURCHASE_IN');
                                       if (!lastPurchase) return null;
                                       const poRef = lastPurchase.note?.match(/PO-[A-Z0-9]+/)?.[0];
                                       return (
                                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-t border-slate-100 dark:border-white/5 pt-1.5 mt-0.5">
                                             <span className="text-[8px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1">
                                               Last Received: {new Date(lastPurchase.createdAt).toLocaleDateString()}
                                             </span>
                                             {poRef && (
                                               <span className="inline-flex items-center text-[8px] font-black text-indigo-500 bg-indigo-50 dark:bg-indigo-500/10 px-1.5 py-0.5 rounded uppercase tracking-tighter border border-indigo-100 dark:border-indigo-500/20">
                                                 Ref: {poRef}
                                               </span>
                                             )}
                                          </div>
                                       );
                                     })()}
                                  </div>
                               ) : (
                                  <div className="flex items-center gap-1.5 text-[9px] font-black text-slate-400 uppercase tracking-tight px-1">
                                     <Plus size={10} className="text-slate-300" /> Direct Add / Manual Stock
                                  </div>
                               )}
                            </div>
                         </div>
                      </td>

                      <td className="hidden lg:table-cell px-8 py-6">
                         <div className="flex flex-col items-center gap-1.5">
                            <div className="flex items-center gap-1.5 px-2 py-1 bg-emerald-50 dark:bg-emerald-500/5 rounded-lg border border-emerald-100/50 dark:border-emerald-500/10">
                               <TrendingUp size={10} className="text-emerald-500" />
                               <span className="text-[10px] md:text-[11px] font-black text-emerald-600 dark:text-emerald-400">
                                  +{(item.inbound || 0).toFixed(1)}
                               </span>
                            </div>
                            <div className="flex items-center gap-1.5 px-2 py-1 bg-orange-50 dark:bg-orange-500/5 rounded-lg border border-orange-100/50 dark:border-orange-500/10">
                               <TrendingDown size={10} className="text-orange-500" />
                               <span className="text-[10px] md:text-[11px] font-black text-orange-600 dark:text-orange-400">
                                  -{(item.outbound || 0).toFixed(1)}
                               </span>
                            </div>
                         </div>
                      </td>

                      {/* Stock Balance Column with visual progress bar */}
                      <td className="px-6 md:px-8 py-6">
                         <div className="space-y-1.5 min-w-[100px] md:min-w-[140px]">
                            <div className="flex justify-between items-center px-1">
                               <span className={clsx("text-xs md:text-[14px] font-black", isLow ? "text-red-600" : "text-slate-900 dark:text-slate-200")}>
                                  {(item.currentStock || 0).toFixed(1)} <span className="text-[8px] md:text-[10px] text-slate-400 font-bold tracking-widest uppercase">{item.unit}</span>
                               </span>
                               <span className="hidden sm:inline text-[8px] md:text-[9px] font-black text-slate-300 uppercase">Stock</span>
                            </div>
                            <div className="h-1.5 w-full bg-slate-100 dark:bg-white/5 rounded-full overflow-hidden">
                               <div 
                                  className={clsx("h-full rounded-full transition-all duration-1000", isLow ? "bg-red-500" : "bg-emerald-500")} 
                                  style={{ width: `${Math.min(100, (item.currentStock / (item.minimumStock * 2)) * 100)}%` }} 
                               />
                            </div>
                         </div>
                      </td>

                      {/* Threshold Identification */}
                      <td className="hidden xl:table-cell px-8 py-6">
                         <p className="text-sm font-black text-slate-900 dark:text-white tracking-tight">{(item.minimumStock || 10).toFixed(1)} {item.unit}</p>
                         <p className="text-[10px] font-bold text-slate-400 tracking-widest uppercase">Safe Threshold</p>
                      </td>

                      {/* Status Badge Column */}
                      <td className="hidden md:table-cell px-8 py-6 text-center">
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

                      {/* Quick Action Buttons (Edit/Delete) */}
                      <td className="px-10 py-6 text-right">
                         <div className="flex justify-end gap-2 md:opacity-0 group-hover:opacity-100 transition-all md:scale-95 group-hover:scale-100">
                            <Link
                              href={`/inventory/stock/edit?id=${item.id}`}
                              className="p-2 bg-slate-50 dark:bg-white/5 text-slate-400 rounded-2xl hover:bg-slate-900 dark:hover:bg-white hover:text-white dark:hover:text-slate-900 transition-all shadow-sm border border-slate-100 dark:border-white/5"
                              title="Edit Material"
                            >
                               <Edit2 size={14} />
                            </Link>
                            <button
                              onClick={() => handleDelete(item.id, item.name)}
                              className="p-2 bg-red-50 dark:bg-red-500/10 text-red-400 rounded-2xl hover:bg-red-500 hover:text-white transition-all shadow-sm border border-red-100 dark:border-red-500/20"
                              title="Delete Record"
                            >
                               <Trash2 size={14} />
                            </button>
                         </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          
          {/* Table Footer: System Integrity Disclaimers */}
          <div className="w-full py-8 text-center border-t border-slate-100 dark:border-white/5 bg-slate-50/20 dark:bg-transparent flex flex-wrap items-center justify-center gap-4 md:gap-8 px-6">
             <div className="flex items-center gap-2 text-[8px] md:text-[10px] font-black text-slate-400 uppercase tracking-widest">
                <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" /> STOCK FROM MOVEMENTS
             </div>
             <div className="flex items-center gap-2 text-[8px] md:text-[10px] font-black text-slate-400 uppercase tracking-widest">
                <Lock size={10} className="text-orange-500 shrink-0" /> NO MANUAL EDITS
             </div>
             <div className="flex items-center gap-2 text-[8px] md:text-[10px] font-black text-slate-400 uppercase tracking-widest">
                <span className="w-2 h-2 rounded-full bg-blue-500 shrink-0" /> GRN / PRODUCTION DRIVEN
             </div>
          </div>
        </div>
      </div>

    </div>
  );
}
