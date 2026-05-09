import { useState, useEffect, useRef } from "react";
import { Plus, Trash2, Search, Package, IndianRupee, Zap } from "lucide-react";
import { usePurchaseOrder, LineItem } from "@/context/PurchaseOrderContext";
import { rawMaterialsApi } from "@/lib/api";

export default function LineItemsTable() {
  const { items, addItem, removeItem, updateItem, getVendorPrice, selectedVendor, autoFilledIds, setAutoFilledIds } = usePurchaseOrder();
  const [activeSearchId, setActiveSearchId] = useState<string | null>(null);
  const [materials, setMaterials] = useState<any[]>([]);
  const [loadingMaterials, setLoadingMaterials] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const searchRef = useRef<HTMLDivElement>(null);
  const prevActiveSearchId = useRef<string | null>(null);

  // Reset search query when switching items
  useEffect(() => {
    if (activeSearchId !== prevActiveSearchId.current) {
      setSearchQuery("");
      prevActiveSearchId.current = activeSearchId;
    }
  }, [activeSearchId]);

  useEffect(() => {
    const fetchMaterials = async () => {
      setLoadingMaterials(true);
      try {
        const response = await rawMaterialsApi.getAll();
        setMaterials(response.data);
      } catch (error) {
        console.error("Failed to fetch materials", error);
      } finally {
        setLoadingMaterials(false);
      }
    };
    fetchMaterials();
  }, []);

  const handleKeyDown = (e: React.KeyboardEvent, itemId: string, index: number) => {
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

  const filteredMaterials = materials.filter(m => {
    // 1. Must match search query
    const matchSearch = m.name.toLowerCase().includes(searchQuery.toLowerCase());
    if (!matchSearch) return false;

    // 2. If vendor selected, show materials linked to that vendor (either by cross-ref or direct vendorId)
    if (selectedVendor) {
      const isSupplied = selectedVendor.suppliedMaterials?.some(sm => sm.materialId === m.id);
      const isPrimary = m.vendorId === selectedVendor.id;
      return isSupplied || isPrimary;
    }

    // 3. If no vendor selected, don't show any materials (to force vendor selection first)
    return false;
  });

  return (
    <div className="space-y-6 pt-10">
      <div className="flex items-center justify-between">
         <h3 className="text-sm font-bold text-[#1A1A1A] dark:text-white uppercase tracking-tight">Order Items</h3>
         <div className="text-[10px] font-bold text-[#999] uppercase tracking-widest flex items-center gap-4">
            <span className="flex items-center gap-1"><kbd className="px-1.5 py-0.5 bg-slate-100 rounded border border-slate-200 text-[#666]">Space</kbd> Search</span>
            <span className="flex items-center gap-1"><kbd className="px-1.5 py-0.5 bg-slate-100 rounded border border-slate-200 text-[#666]">Enter</kbd> Add Row</span>
         </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-[#F0EAF0] dark:border-slate-800 shadow-sm">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-[#F9F7F9] dark:bg-slate-900 text-[#666] text-[10px] font-bold uppercase tracking-widest border-b border-[#F0EAF0] dark:border-slate-800">
              <th className="px-6 py-4 w-12">#</th>
              <th className="px-6 py-4 min-w-[300px]">Material / Item Details</th>
              <th className="px-6 py-4 w-32">Qty</th>
              <th className="px-6 py-4 w-40">Unit Price</th>
              <th className="px-6 py-4 w-24 text-center">GST %</th>
              <th className="px-6 py-4 w-40 text-right">Total Amount</th>
              <th className="px-6 py-4 w-12 text-center"></th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-slate-900 divide-y divide-[#F0EAF0] dark:divide-slate-800">
            {items.map((item, index) => {
              const amount = item.quantity * item.price;
              const totalWithGst = amount + (amount * (item.gstRate / 100));

              return (
                <tr key={item.id} className="group hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-colors relative">
                  <td className="px-6 py-5 align-top text-xs font-bold text-[#CCC]">
                    {String(index + 1).padStart(2, '0')}
                  </td>
                  <td className="px-6 py-5 align-top relative">
                    <div
                      className="flex items-center gap-3 p-2 rounded-lg border border-transparent focus-within:border-[#7C3AED] focus-within:bg-white dark:focus-within:bg-slate-950 transition-all cursor-text"
                      onClick={() => !item.materialId && setActiveSearchId(item.id)}
                    >
                      <Package size={16} className={item.materialId ? "text-[#7C3AED]" : "text-[#CCC]"} />
                      <input
                        type="text"
                        placeholder="Search or select material..."
                        className="flex-1 bg-transparent outline-none text-sm font-bold text-[#1A1A1A] dark:text-white placeholder:text-[#BBB] placeholder:font-medium"
                        value={item.name}
                        readOnly={!!item.materialId}
                        onKeyDown={(e) => handleKeyDown(e, item.id, index)}
                      />
                      {item.materialId && (
                        <button
                          onClick={() => {
                            updateItem(item.id, { materialId: "", name: "" });
                            setAutoFilledIds(prev => { const s = new Set(prev); s.delete(item.id); return s; });
                          }}
                          className="text-[10px] font-bold text-[#999] hover:text-red-500 uppercase tracking-tight"
                        >
                          Clear
                        </button>
                      )}
                    </div>

                    {activeSearchId === item.id && (
                      <div className="absolute top-full left-6 right-6 mt-2 bg-white dark:bg-slate-900 border border-[#F0EAF0] dark:border-slate-800 rounded-xl shadow-2xl z-50 overflow-hidden" ref={searchRef}>
                         <div className="p-3 border-b border-[#F0EAF0] dark:border-slate-800 flex items-center gap-2">
                           <Search size={14} className="text-[#999]" />
                           <input
                             autoFocus
                             type="text"
                             placeholder="Type to filter..."
                             className="w-full text-xs outline-none bg-transparent"
                             value={searchQuery}
                             onChange={(e) => setSearchQuery(e.target.value)}
                           />
                         </div>
                         <div className="max-h-48 overflow-y-auto">
                            {filteredMaterials.length > 0 ? (
                                filteredMaterials.map(m => {
                                  const vendorPrice = getVendorPrice(m.id);
                                  const displayPrice = vendorPrice !== null ? vendorPrice : (m.price || 0);
                                  return (
                                    <div
                                      key={m.id}
                                      onClick={() => {
                                        updateItem(item.id, {
                                          materialId: m.id,
                                          name: m.name,
                                          price: displayPrice,
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
                                       <span className="text-sm font-bold text-[#1A1A1A] dark:text-white">{m.name}</span>
                                       <div className="flex items-center gap-2">
                                         {vendorPrice !== null && (
                                           <span className="text-[9px] font-bold text-[#7C3AED] bg-purple-50 px-1.5 py-0.5 rounded flex items-center gap-0.5 border border-purple-100">
                                             <Zap size={8} /> Vendor Rate
                                           </span>
                                         )}
                                         <span className={`text-[10px] font-bold ${vendorPrice !== null ? "text-[#7C3AED]" : "text-[#999]"}`}>
                                           ₹{displayPrice}
                                         </span>
                                       </div>
                                    </div>
                                  );
                                })
                            ) : (
                                <div className="p-4 text-xs text-[#999] font-medium italic text-center">
                                   {!selectedVendor ? "Please select a vendor first" : "No materials linked to this vendor"}
                                </div>
                            )}
                         </div>
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-5 align-top">
                    <input
                      type="number"
                      className="w-full p-2 bg-[#F9F7F9] dark:bg-slate-950 rounded-lg outline-none text-sm font-bold text-center border border-transparent focus:border-[#7C3AED] transition-all"
                      value={item.quantity === 0 ? "" : item.quantity}
                      onChange={(e) => updateItem(item.id, { quantity: parseFloat(e.target.value) || 0 })}
                      onKeyDown={(e) => handleKeyDown(e, item.id, index)}
                    />
                  </td>
                  <td className="px-6 py-5 align-top">
                    <div className="relative">
                      <IndianRupee size={12} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#999]" />
                      <input
                        type="number"
                        className={`w-full pl-8 p-2 rounded-lg outline-none text-sm font-bold border transition-all ${
                          autoFilledIds.has(item.id)
                            ? "bg-purple-50 border-[#7C3AED]/30 focus:border-[#7C3AED] text-[#7C3AED]"
                            : "bg-[#F9F7F9] dark:bg-slate-950 border-transparent focus:border-[#7C3AED]"
                        }`}
                        value={item.price === 0 ? "" : item.price}
                        onChange={(e) => {
                          updateItem(item.id, { price: parseFloat(e.target.value) || 0 });
                          // Clear auto-fill indicator when user overrides manually
                          setAutoFilledIds(prev => { const s = new Set(prev); s.delete(item.id); return s; });
                        }}
                        onKeyDown={(e) => handleKeyDown(e, item.id, index)}
                      />
                      {autoFilledIds.has(item.id) && (
                        <div className="absolute -top-5 left-0 flex items-center gap-1 text-[9px] font-bold text-[#7C3AED] whitespace-nowrap">
                          <Zap size={9} /> Vendor Rate
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-5 align-top">
                    <input
                      type="number"
                      className="w-full p-2 bg-transparent outline-none text-sm font-black text-[#7C3AED] text-center border-b-2 border-transparent focus:border-purple-200 transition-all"
                      value={item.gstRate}
                      onChange={(e) => updateItem(item.id, { gstRate: parseFloat(e.target.value) || 0 })}
                    />
                  </td>
                  <td className="px-6 py-5 align-top text-right">
                    <div className="flex flex-col items-end">
                       <span className="text-sm font-black text-[#1A1A1A] dark:text-white">
                         ₹{totalWithGst.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                       </span>
                       <span className="text-[10px] font-bold text-[#CCC] uppercase tracking-tighter">
                         GST: ₹{(totalWithGst - amount).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                       </span>
                    </div>
                  </td>
                  <td className="px-6 py-5 align-top text-center">
                    <button
                      onClick={() => removeItem(item.id)}
                      className="p-2 text-[#DDD] hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-all"
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
        className="w-full py-4 bg-white dark:bg-slate-900 border-2 border-dashed border-[#F0EAF0] dark:border-slate-800 rounded-2xl text-[#7C3AED] font-black text-sm flex items-center justify-center gap-2 hover:bg-purple-50 hover:border-[#7C3AED]/50 transition-all group"
      >
        <div className="w-8 h-8 rounded-full bg-purple-50 group-hover:bg-[#7C3AED] text-[#7C3AED] group-hover:text-white flex items-center justify-center transition-colors">
          <Plus size={18} />
        </div>
        Add New Item
      </button>
    </div>
  );
}
