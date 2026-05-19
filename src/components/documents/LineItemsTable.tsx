"use client";

import { useState, useEffect, useRef } from "react";
import { Plus, Trash2, Search, Package, IndianRupee, Zap, Info, AlertTriangle, CheckCircle2 } from "lucide-react";
import { usePurchaseOrder } from "@/context/PurchaseOrderContext";
import { rawMaterialsApi } from "@/lib/api";
import { clsx } from "clsx";
import Link from "next/link";
import AddMaterialDrawer from "@/components/modules/inventory/AddMaterialDrawer";

export default function LineItemsTable() {
  const { items, addItem, removeItem, updateItem, getVendorPrice, selectedVendor, autoFilledIds, setAutoFilledIds } = usePurchaseOrder();
  const [activeSearchId, setActiveSearchId] = useState<string | null>(null);
  const [materials, setMaterials] = useState<any[]>([]);
  const [loadingMaterials, setLoadingMaterials] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const searchRef = useRef<HTMLDivElement>(null);
  const prevActiveSearchId = useRef<string | null>(null);
  const [showAddMaterialDrawer, setShowAddMaterialDrawer] = useState(false);

  // Reset search query when switching items
  useEffect(() => {
    if (activeSearchId !== prevActiveSearchId.current) {
      setSearchQuery("");
      prevActiveSearchId.current = activeSearchId;
    }
  }, [activeSearchId]);

  const [materialRefreshKey, setMaterialRefreshKey] = useState(0);

  // Fetch materials (including filter) – refresh when key changes
  useEffect(() => {
    const fetchMaterials = async () => {
      setLoadingMaterials(true);
      try {
        const response = await rawMaterialsApi.getAll();
        console.log('Fetched raw materials (filtered):', response.data);
        setMaterials(response.data);
      } catch (error) {
        console.error('Failed to fetch materials', error);
      } finally {
        setLoadingMaterials(false);
      }
    };
    fetchMaterials();
  }, [materialRefreshKey]);

  // In Add Material Drawer success, trigger refresh
  const handleAddMaterialSuccess = () => {
    setMaterialRefreshKey(prev => prev + 1);
    setShowAddMaterialDrawer(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent, itemId: string) => {
    if (e.key === "Enter" && !activeSearchId) {
      e.preventDefault();
      addItem();
    }
    if (e.key === " " && (e.target as HTMLInputElement).placeholder.includes("Material")) {
      e.preventDefault();
      setActiveSearchId(itemId);
      setSearchQuery("");
    }
  };

  // Get all material IDs currently selected in the table to prevent duplicate selection
  const selectedMaterialIds = new Set(
    items.map(item => item.materialId).filter(Boolean)
  );

  const filteredMaterials = materials.filter(m => {
    // Exclude materials already added to the table
    if (selectedMaterialIds.has(m.id)) return false;
    
    return m.name.toLowerCase().includes(searchQuery.toLowerCase()) || m.sku?.toLowerCase().includes(searchQuery.toLowerCase());
  });

  return (
    <div className="w-full">
      <div className="overflow-x-auto pb-64">
        <table className="w-full text-left border-collapse table-fixed min-w-[1000px]">
          <thead>
            <tr className="bg-slate-50 dark:bg-slate-900/50 text-slate-400 text-[10px] font-black uppercase tracking-widest border-b border-slate-100 dark:border-slate-800">
              <th className="px-6 py-3 w-12 text-center">#</th>
              <th className="px-4 py-3 min-w-[280px]">Material / Item Detail</th>
              <th className="px-4 py-3 w-28">SKU</th>
              <th className="px-4 py-3 w-24">Qty</th>
              <th className="px-4 py-3 w-24">Unit</th>
              <th className="px-4 py-3 w-32">Unit Price</th>
              <th className="px-4 py-3 w-20 text-center">GST %</th>
              <th className="px-4 py-3 w-32 text-right">Line Total</th>
              <th className="px-6 py-3 w-16 text-center"></th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-slate-900 divide-y divide-slate-50 dark:divide-slate-800">
            {items.map((item, index) => {
              const amount = item.quantity * item.price;
              const totalWithGst = amount + (amount * (item.gstRate / 100));
              const material = materials.find(m => m.id === item.materialId);

              return (
                <tr key={item.id} className="group hover:bg-slate-50/30 dark:hover:bg-slate-800/30 transition-all relative">
                  <td className="px-6 py-4 align-middle text-[10px] font-black text-slate-300 group-hover:text-[#7C3AED] transition-colors text-center">
                    {String(index + 1).padStart(2, '0')}
                  </td>
                  <td className="px-4 py-4 align-top relative">
                    <div
                      className={clsx(
                        "flex items-center gap-3 p-2 rounded-xl border border-transparent transition-all cursor-text relative z-50",
                        !item.materialId ? "bg-slate-50/50 dark:bg-slate-950/50" : "bg-transparent"
                      )}
                      onClick={() => !item.materialId && setActiveSearchId(item.id)}
                    >
                      <Package size={14} className={item.materialId ? "text-[#7C3AED]" : "text-slate-300"} />
                        <div className="flex flex-col flex-1 relative">
                          <input
                            type="text"
                            placeholder="Search Material..."
                            className="w-full bg-transparent outline-none text-xs font-black text-slate-900 dark:text-white placeholder:text-slate-300 placeholder:font-bold uppercase tracking-tight"
                            value={activeSearchId === item.id ? searchQuery : item.name}
                            readOnly={!!item.materialId}
                            onChange={(e) => {
                               if (!item.materialId) {
                                  setSearchQuery(e.target.value);
                                  if (activeSearchId !== item.id) setActiveSearchId(item.id);
                               }
                            }}
                            onFocus={() => {
                               if (!item.materialId) {
                                  setActiveSearchId(item.id);
                                  setSearchQuery("");
                               }
                            }}
                            onKeyDown={(e) => handleKeyDown(e, item.id)}
                          />
                          {material && (
                            <div className="flex items-center gap-2 mt-1">
                               <div className={clsx(
                                 "flex items-center gap-1 text-[8px] font-black uppercase px-1.5 py-0.5 rounded border",
                                 material.currentStock <= (material.minimumStock || 10) 
                                   ? "bg-red-50 text-red-500 border-red-100" 
                                   : "bg-green-50 text-green-600 border-green-100"
                               )}>
                                 {material.currentStock <= (material.minimumStock || 10) ? <AlertTriangle size={8} /> : <CheckCircle2 size={8} />}
                                 Stock: {material.currentStock} {item.unit}
                               </div>
                               <span className="text-[8px] font-bold text-slate-400">HSN: {material.hsnCode || "N/A"}</span>
                            </div>
                          )}
                        </div>
                        {item.materialId && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              updateItem(item.id, { materialId: "", name: "" });
                              setAutoFilledIds(prev => { const s = new Set(prev); s.delete(item.id); return s; });
                            }}
                            className="text-[9px] font-black text-slate-300 hover:text-red-500 uppercase tracking-widest transition-colors"
                          >
                            Clear
                          </button>
                        )}

                        {activeSearchId === item.id && (
                          <div className="absolute top-[calc(100%+8px)] left-0 w-[400px] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-2xl z-[100] overflow-hidden" ref={searchRef}>
                             <div className="max-h-60 overflow-y-auto">
                            {filteredMaterials.length > 0 ? (
                                <>
                                  {filteredMaterials.map(m => {
                                    const vendorPrice = getVendorPrice(m.id);
                                  const displayPrice = vendorPrice !== null ? vendorPrice : (m.price || 0);
                                  const isLow = m.currentStock <= (m.minimumStock || 10);

                                  return (
                                    <div
                                      key={m.id}
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        updateItem(item.id, {
                                          materialId: m.id,
                                          name: m.name,
                                          unit: m.unit || "KG",
                                          price: displayPrice,
                                          gstRate: m.gstRate || 5
                                        });
                                        if (vendorPrice !== null) {
                                          setAutoFilledIds(prev => new Set(prev).add(item.id));
                                        } else {
                                          setAutoFilledIds(prev => { const s = new Set(prev); s.delete(item.id); return s; });
                                        }
                                        setActiveSearchId(null);
                                      }}
                                      className="p-3 hover:bg-purple-50 dark:hover:bg-slate-800 cursor-pointer transition-colors flex justify-between items-center"
                                    >
                                       <div className="flex flex-col gap-0.5">
                                          <span className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-tight">{m.name}</span>
                                          <div className="flex items-center gap-2">
                                             <span className="text-[9px] font-bold text-slate-400">{m.sku}</span>
                                             {isLow && <span className="text-[8px] font-black text-red-500 bg-red-50 px-1 py-0.5 rounded">CRITICAL STOCK</span>}
                                          </div>
                                       </div>
                                       <div className="flex flex-col items-end gap-1">
                                          <div className="flex items-center gap-2">
                                            {vendorPrice !== null && (
                                              <span className="text-[8px] font-black text-[#7C3AED] bg-purple-50 px-1.5 py-0.5 rounded flex items-center gap-0.5 border border-purple-100 uppercase tracking-tighter">
                                                <Zap size={8} /> Vendor Rate
                                              </span>
                                            )}
                                            <span className={`text-[10px] font-black ${vendorPrice !== null ? "text-[#7C3AED]" : "text-slate-900"}`}>
                                              ₹{displayPrice}
                                            </span>
                                          </div>
                                          <span className="text-[9px] font-bold text-slate-400">Stock: {m.currentStock} {m.unit}</span>
                                       </div>
                                    </div>
                                  );
                                })}
                                <div className="p-3 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 sticky bottom-0 flex justify-center">
                                   <button 
                                     onClick={(e) => {
                                       e.stopPropagation();
                                       setShowAddMaterialDrawer(true);
                                     }} 
                                     className="inline-flex items-center gap-2 px-4 py-2 bg-[#7C3AED] hover:bg-purple-700 text-white rounded-lg text-[10px] font-black uppercase tracking-wider transition-colors shadow-sm"
                                   >
                                      <Plus size={14} /> Add New Material
                                   </button>
                                </div>
                                </>
                            ) : (
                                <div className="p-10 text-center space-y-4">
                                   <Package size={32} className="mx-auto text-slate-100" />
                                   <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">
                                      {!selectedVendor ? "Please select a vendor first" : "No materials found"}
                                   </p>
                                   <button 
                                     onClick={(e) => {
                                       e.stopPropagation();
                                       setShowAddMaterialDrawer(true);
                                     }} 
                                     className="inline-flex items-center gap-2 px-4 py-2 bg-[#7C3AED] hover:bg-purple-700 text-white rounded-lg text-[10px] font-black uppercase tracking-wider transition-colors shadow-sm mt-2"
                                   >
                                      <Plus size={14} /> Add New Material
                                   </button>
                                </div>
                            )}
                         </div>
                       </div>
                    )}
                    </div>
                  </td>
                  <td className="px-4 py-4 align-top">
                     <span className="text-[10px] font-black text-slate-400 bg-slate-50 px-2 py-1 rounded dark:bg-slate-800">
                        {material?.sku || "---"}
                     </span>
                  </td>
                  <td className="px-4 py-4 align-top">
                    <input
                      type="number"
                      className="w-full p-2 bg-slate-50/50 dark:bg-slate-950 rounded-xl outline-none text-xs font-black text-center border-2 border-transparent focus:border-purple-100 focus:bg-white transition-all"
                      value={item.quantity === 0 ? "" : item.quantity}
                      onChange={(e) => updateItem(item.id, { quantity: parseFloat(e.target.value) || 0 })}
                      onKeyDown={(e) => handleKeyDown(e, item.id)}
                    />
                  </td>
                  <td className="px-4 py-4 align-top">
                    <div className="p-2 text-[10px] font-black text-slate-400 text-center uppercase tracking-widest bg-slate-50/30 rounded-lg border border-slate-100">
                       {item.unit}
                    </div>
                  </td>
                  <td className="px-4 py-4 align-top">
                    <div className="relative group/price">
                      <IndianRupee size={10} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300" />
                      <input
                        type="number"
                        className={clsx(
                          "w-full pl-7 p-2 rounded-xl outline-none text-xs font-black border-2 transition-all",
                          autoFilledIds.has(item.id)
                            ? "bg-purple-50/50 border-purple-100 text-[#7C3AED] focus:bg-white"
                            : "bg-slate-50/50 dark:bg-slate-950 border-transparent focus:border-purple-100 focus:bg-white"
                        )}
                        value={item.price === 0 ? "" : item.price}
                        onChange={(e) => {
                          updateItem(item.id, { price: parseFloat(e.target.value) || 0 });
                          setAutoFilledIds(prev => { const s = new Set(prev); s.delete(item.id); return s; });
                        }}
                        onKeyDown={(e) => handleKeyDown(e, item.id)}
                      />
                      {autoFilledIds.has(item.id) && (
                        <div className="absolute -top-3.5 left-0 flex items-center gap-1 text-[8px] font-black text-[#7C3AED] uppercase tracking-tighter">
                          <Zap size={8} /> Auto Vendor Rate
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-4 align-top text-center">
                    <span className="text-xs font-black text-purple-600">
                      {item.gstRate}%
                    </span>
                  </td>
                  <td className="px-4 py-4 align-top text-right">
                    <div className="flex flex-col items-end">
                       <span className="text-sm font-black text-slate-900 dark:text-white">
                         ₹{totalWithGst.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                       </span>
                       <span className="text-[9px] font-black text-slate-300 uppercase tracking-tighter">
                         Tax: ₹{(totalWithGst - amount).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                       </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 align-middle text-center">
                    <button
                      onClick={() => removeItem(item.id)}
                      className="p-2 text-slate-200 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-all"
                    >
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <button
        onClick={addItem}
        className="w-full py-4 mt-4 bg-slate-50/50 dark:bg-slate-900/50 border-2 border-dashed border-slate-100 dark:border-slate-800 rounded-2xl text-slate-400 font-black text-xs uppercase tracking-[0.2em] flex items-center justify-center gap-3 hover:bg-white hover:border-[#7C3AED] hover:text-[#7C3AED] transition-all group"
      >
        <div className="w-8 h-8 rounded-full bg-white shadow-sm border border-slate-100 group-hover:border-[#7C3AED] group-hover:bg-[#7C3AED] group-hover:text-white flex items-center justify-center transition-all">
          <Plus size={16} />
        </div>
        Add New Line Item
      </button>

      {/* Keyboard Helper Footer */}
      <div className="flex items-center gap-6 mt-6 px-4">
         <div className="flex items-center gap-2">
            <kbd className="px-1.5 py-0.5 bg-white border border-slate-200 rounded shadow-sm text-[10px] font-black text-slate-500">Space</kbd>
            <span className="text-[10px] font-bold text-slate-400">Search Material</span>
         </div>
         <div className="flex items-center gap-2">
            <kbd className="px-1.5 py-0.5 bg-white border border-slate-200 rounded shadow-sm text-[10px] font-black text-slate-500">Enter</kbd>
            <span className="text-[10px] font-bold text-slate-400">Add New Row</span>
         </div>
         <div className="flex-1" />
         <div className="flex items-center gap-2 text-slate-400">
            <Info size={14} />
            <span className="text-[10px] font-bold italic">All calculations are real-time & GST compliant</span>
         </div>
      </div>

      <AddMaterialDrawer 
        isOpen={showAddMaterialDrawer} 
        onClose={() => setShowAddMaterialDrawer(false)} 
        onSuccess={handleAddMaterialSuccess} 
      />
    </div>
  );
}
