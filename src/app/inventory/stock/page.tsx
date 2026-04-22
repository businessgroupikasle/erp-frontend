"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Layers, Plus, X, Search, AlertTriangle, CheckCircle2,
  RefreshCw, Package, TrendingDown, TrendingUp, Edit2, Trash2, Settings,
} from "lucide-react";
import { clsx } from "clsx";
import { rawMaterialsApi, inventoryApi } from "@/lib/api";

const CATEGORY_COLORS: Record<string, string> = {
  RAW_MATERIAL:   "bg-amber-100 text-amber-700 dark:bg-amber-900/20 dark:text-amber-400",
  SEMI_FINISHED:  "bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400",
  FINISHED_GOOD:  "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400",
  PACKAGING:      "bg-purple-100 text-purple-700 dark:bg-purple-900/20 dark:text-purple-400",
};

export default function RawMaterialStockPage() {
  const [items, setItems]   = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("ALL");
  const [showAdd, setShowAdd]   = useState(false);
  const [adjustModal, setAdjustModal] = useState<{ id: string; name: string; current: number } | null>(null);
  const [editModal, setEditModal] = useState<any>(null);
  const [editForm, setEditForm] = useState({ name: "", sku: "", unit: "kg", minimumStock: 10 });

  // Add item form
  const [form, setForm] = useState({ name: "", sku: "", unit: "kg", minimumStock: 10, category: "RAW_MATERIAL", franchiseId: "", initialStock: 0 });
  const [franchiseId, setFranchiseId] = useState("");
  const [newQty, setNewQty] = useState(0);
  const [saving, setSaving] = useState(false);

  const fetchItems = useCallback(async () => {
    setLoading(true);
    try {
      // Try raw-materials endpoint first, fall back to inventory
      const res = await rawMaterialsApi.getAll();
      setItems(res.data ?? []);
      if ((res.data ?? []).length > 0 && res.data[0].franchiseId) {
        setFranchiseId(res.data[0].franchiseId);
      }
    } catch {
      try {
        const res = await inventoryApi.getInventory();
        setItems(res.data ?? []);
      } catch (e) { console.error(e); }
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
        currentStock: form.initialStock || 0,
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

  const handleAdjust = async () => {
    if (!adjustModal) return;
    try {
      await inventoryApi.adjustment({ itemId: adjustModal.id, newQuantity: newQty });
      setAdjustModal(null);
      fetchItems();
    } catch (e) { console.error(e); }
  };

  const categories = ["ALL", "RAW_MATERIAL", "SEMI_FINISHED", "FINISHED_GOOD", "PACKAGING"];

  const filtered = items.filter((it) => {
    const matchSearch = !search || it.name?.toLowerCase().includes(search.toLowerCase()) || it.sku?.toLowerCase().includes(search.toLowerCase());
    const matchCat = category === "ALL" || it.category === category;
    return matchSearch && matchCat;
  });

  const lowStock  = items.filter((it) => it.currentStock <= it.minimumStock).length;
  const totalItems = items.length;
  const totalQty   = items.reduce((s: number, it: any) => s + (it.currentStock ?? 0), 0);

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-gray-900 dark:text-white flex items-center gap-2">
            <Layers size={22} className="text-orange-500" />
            Raw Material Stock
          </h1>
          <p className="text-sm text-gray-500 dark:text-slate-400 mt-1">
            Track your inventory of raw materials used in production
          </p>
        </div>
        <div className="flex gap-2">
          <button onClick={fetchItems} className="p-2 rounded-xl border border-gray-200 dark:border-white/10 hover:bg-gray-50 dark:hover:bg-white/5 transition-all">
            <RefreshCw size={16} className="text-gray-400" />
          </button>
          <button
            onClick={() => setShowAdd(true)}
            className="flex items-center gap-2 bg-orange-500 hover:bg-orange-400 text-white px-4 py-2 rounded-xl text-sm font-bold transition-all"
          >
            <Plus size={16} /> Add Material
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white dark:bg-card rounded-2xl border border-gray-100 dark:border-white/5 p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-500/10 flex items-center justify-center">
            <Package size={18} className="text-indigo-500" />
          </div>
          <div>
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Total Materials</p>
            <p className="text-xl font-black text-gray-900 dark:text-white">{totalItems}</p>
          </div>
        </div>
        <div className="bg-white dark:bg-card rounded-2xl border border-gray-100 dark:border-white/5 p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 flex items-center justify-center">
            <TrendingUp size={18} className="text-emerald-500" />
          </div>
          <div>
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Total Quantity</p>
            <p className="text-xl font-black text-gray-900 dark:text-white">{totalQty.toFixed(1)} units</p>
          </div>
        </div>
        <div className={clsx("bg-white dark:bg-card rounded-2xl border p-4 flex items-center gap-3", lowStock > 0 ? "border-red-200 dark:border-red-500/30" : "border-gray-100 dark:border-white/5")}>
          <div className={clsx("w-10 h-10 rounded-xl flex items-center justify-center", lowStock > 0 ? "bg-red-50 dark:bg-red-500/10" : "bg-gray-50 dark:bg-white/5")}>
            {lowStock > 0 ? <AlertTriangle size={18} className="text-red-500" /> : <CheckCircle2 size={18} className="text-gray-400" />}
          </div>
          <div>
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Low Stock Alerts</p>
            <p className={clsx("text-xl font-black", lowStock > 0 ? "text-red-500" : "text-gray-900 dark:text-white")}>{lowStock}</p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name or SKU..."
            className="w-full pl-9 pr-4 py-2.5 text-sm bg-white dark:bg-card border border-gray-200 dark:border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500/20"
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          {categories.map((c) => (
            <button
              key={c}
              onClick={() => setCategory(c)}
              className={clsx(
                "px-3 py-2 rounded-xl text-[11px] font-bold transition-all",
                category === c ? "bg-orange-500 text-white" : "bg-white dark:bg-card border border-gray-200 dark:border-white/10 text-gray-500 hover:text-orange-500"
              )}
            >
              {c === "ALL" ? "All" : c.replace("_", " ")}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      {loading ? (
        <div className="py-20 text-center text-gray-400 text-sm">Loading stock data...</div>
      ) : filtered.length === 0 ? (
        <div className="py-20 text-center text-gray-300 dark:text-slate-600 space-y-4">
          <Layers size={48} strokeWidth={1} className="mx-auto" />
          <div>
            <p className="text-sm font-semibold">No materials found</p>
            <p className="text-xs text-gray-500 mt-1">Start by adding your raw materials and ingredients.</p>
          </div>
          <button
            onClick={() => setShowAdd(true)}
            className="inline-flex items-center gap-2 bg-orange-500 hover:bg-orange-400 text-white px-6 py-2.5 rounded-xl text-sm font-bold transition-all shadow-lg shadow-orange-500/20"
          >
            <Plus size={16} /> Add Your First Material
          </button>
        </div>
      ) : (
        <div className="bg-white dark:bg-card rounded-2xl border border-gray-100 dark:border-white/5 overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100 dark:border-white/5">
                <th className="text-left px-5 py-3 text-[10px] font-black text-gray-400 uppercase tracking-widest">Material</th>
                <th className="text-left px-5 py-3 text-[10px] font-black text-gray-400 uppercase tracking-widest">Category</th>
                <th className="text-center px-5 py-3 text-[10px] font-black text-gray-400 uppercase tracking-widest">Current Stock</th>
                <th className="text-center px-5 py-3 text-[10px] font-black text-gray-400 uppercase tracking-widest">Min. Stock</th>
                <th className="text-center px-5 py-3 text-[10px] font-black text-gray-400 uppercase tracking-widest">Status</th>
                <th className="text-center px-5 py-3 text-[10px] font-black text-gray-400 uppercase tracking-widest">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 dark:divide-white/5">
              {filtered.map((item: any) => {
                const isLow = item.currentStock <= item.minimumStock;
                return (
                  <tr key={item.id} className="hover:bg-gray-50 dark:hover:bg-white/[0.02] transition-colors">
                    <td className="px-5 py-3.5">
                      <p className="text-sm font-bold text-gray-900 dark:text-white">{item.name}</p>
                      <p className="text-[11px] text-gray-400">{item.sku}</p>
                    </td>
                    <td className="px-5 py-3.5">
                      <span className={clsx("px-2 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider", CATEGORY_COLORS[item.category] ?? "bg-gray-100 text-gray-500")}>
                        {item.category?.replace("_", " ")}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-center">
                      <span className={clsx("text-sm font-black", isLow ? "text-red-500" : "text-gray-900 dark:text-white")}>
                        {item.currentStock} {item.unit}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-center">
                      <span className="text-sm text-gray-500">{item.minimumStock} {item.unit}</span>
                    </td>
                    <td className="px-5 py-3.5 text-center">
                      {isLow ? (
                        <span className="flex items-center justify-center gap-1 text-[10px] font-black text-red-500">
                          <TrendingDown size={11} /> Low Stock
                        </span>
                      ) : (
                        <span className="flex items-center justify-center gap-1 text-[10px] font-black text-emerald-500">
                          <CheckCircle2 size={11} /> OK
                        </span>
                      )}
                    </td>
                    <td className="px-5 py-3.5 text-center">
                      <div className="flex items-center justify-center gap-1">
                        <button
                          onClick={() => { setAdjustModal({ id: item.id, name: item.name, current: item.currentStock }); setNewQty(item.currentStock); }}
                          className="p-1.5 rounded-lg hover:bg-orange-50 dark:hover:bg-orange-900/10 text-gray-400 hover:text-orange-500 transition-all" title="Adjust Stock"
                        >
                          <Edit2 size={13} />
                        </button>
                        <button
                          onClick={() => { setEditModal(item); setEditForm({ name: item.name, sku: item.sku ?? "", unit: item.unit ?? "kg", minimumStock: item.minimumStock ?? 10 }); }}
                          className="p-1.5 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/10 text-gray-400 hover:text-blue-500 transition-all" title="Edit Details"
                        >
                          <Settings size={13} />
                        </button>
                        <button
                          onClick={() => handleDelete(item.id, item.name)}
                          className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/10 text-gray-400 hover:text-red-500 transition-all" title="Delete"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Add Material Modal */}
      {showAdd && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-[#12141c] rounded-3xl shadow-2xl w-full max-w-md p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-black text-gray-900 dark:text-white">Add Raw Material</h2>
              <button onClick={() => setShowAdd(false)} className="p-1.5 hover:bg-gray-100 dark:hover:bg-white/10 rounded-lg"><X size={16} className="text-gray-400" /></button>
            </div>
            {[
              { label: "Name *", key: "name", type: "text", placeholder: "e.g. Black Gram" },
              { label: "SKU (optional)", key: "sku", type: "text", placeholder: "e.g. BG-001" },
            ].map(({ label, key, type, placeholder }) => (
              <div key={key}>
                <label className="block text-xs font-bold text-gray-600 dark:text-slate-400 mb-1">{label}</label>
                <input
                  type={type}
                  placeholder={placeholder}
                  value={(form as any)[key]}
                  onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))}
                  className="w-full px-3 py-2.5 text-sm bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500/20"
                />
              </div>
            ))}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-gray-600 dark:text-slate-400 mb-1">Unit</label>
                <select value={form.unit} onChange={(e) => setForm((f) => ({ ...f, unit: e.target.value }))}
                  className="w-full px-3 py-2.5 text-sm bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl focus:outline-none">
                  {["kg", "g", "litre", "ml", "pc", "box"].map((u) => <option key={u}>{u}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-600 dark:text-slate-400 mb-1">Min. Stock</label>
                <input type="number" min={0} value={form.minimumStock}
                  onChange={(e) => setForm((f) => ({ ...f, minimumStock: Number(e.target.value) }))}
                  className="w-full px-3 py-2.5 text-sm bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500/20" />
              </div>
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-600 dark:text-slate-400 mb-1">Category</label>
              <select value={form.category} onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}
                className="w-full px-3 py-2.5 text-sm bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl focus:outline-none">
                <option value="RAW_MATERIAL">Raw Material</option>
                <option value="SEMI_FINISHED">Semi-Finished</option>
                <option value="PACKAGING">Packaging</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-600 dark:text-slate-400 mb-1">Initial Stock Quantity</label>
              <input type="number" min={0} step={0.01} value={form.initialStock}
                onChange={(e) => setForm((f) => ({ ...f, initialStock: Number(e.target.value) }))}
                className="w-full px-3 py-2.5 text-sm bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500/20" 
                placeholder="0.00" />
            </div>
            <div className="flex gap-3 justify-end pt-2">
              <button onClick={() => setShowAdd(false)} className="px-4 py-2 rounded-xl border border-gray-200 dark:border-white/10 text-sm font-bold text-gray-600 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-white/5">Cancel</button>
              <button onClick={handleAdd} disabled={saving} className="px-5 py-2 bg-orange-500 hover:bg-orange-400 disabled:opacity-50 text-white rounded-xl text-sm font-bold transition-all">
                {saving ? "Adding..." : "Add Material"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Material Modal */}
      {editModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-[#12141c] rounded-3xl shadow-2xl w-full max-w-sm p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-black text-gray-900 dark:text-white">Edit Material</h2>
              <button onClick={() => setEditModal(null)} className="p-1.5 hover:bg-gray-100 dark:hover:bg-white/10 rounded-lg"><X size={16} className="text-gray-400" /></button>
            </div>
            {[
              { label: "Name *", key: "name", placeholder: "e.g. Black Gram" },
              { label: "SKU", key: "sku", placeholder: "e.g. BG-001" },
            ].map(({ label, key, placeholder }) => (
              <div key={key}>
                <label className="block text-xs font-bold text-gray-600 dark:text-slate-400 mb-1">{label}</label>
                <input placeholder={placeholder} value={(editForm as any)[key]}
                  onChange={(e) => setEditForm((f) => ({ ...f, [key]: e.target.value }))}
                  className="w-full px-3 py-2.5 text-sm bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500/20" />
              </div>
            ))}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-gray-600 dark:text-slate-400 mb-1">Unit</label>
                <select value={editForm.unit} onChange={(e) => setEditForm((f) => ({ ...f, unit: e.target.value }))}
                  className="w-full px-3 py-2.5 text-sm bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl focus:outline-none">
                  {["kg", "g", "litre", "ml", "pc", "box"].map((u) => <option key={u}>{u}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-600 dark:text-slate-400 mb-1">Min. Stock</label>
                <input type="number" min={0} value={editForm.minimumStock}
                  onChange={(e) => setEditForm((f) => ({ ...f, minimumStock: Number(e.target.value) }))}
                  className="w-full px-3 py-2.5 text-sm bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500/20" />
              </div>
            </div>
            <div className="flex gap-3 justify-end pt-2">
              <button onClick={() => setEditModal(null)} className="px-4 py-2 rounded-xl border border-gray-200 dark:border-white/10 text-sm font-bold text-gray-600 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-white/5">Cancel</button>
              <button onClick={handleEdit} className="px-5 py-2 bg-orange-500 hover:bg-orange-400 text-white rounded-xl text-sm font-bold transition-all">Save Changes</button>
            </div>
          </div>
        </div>
      )}

      {/* Adjust Stock Modal */}
      {adjustModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-[#12141c] rounded-3xl shadow-2xl w-full max-w-sm p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-black text-gray-900 dark:text-white">Adjust Stock</h2>
              <button onClick={() => setAdjustModal(null)} className="p-1.5 hover:bg-gray-100 dark:hover:bg-white/10 rounded-lg"><X size={16} className="text-gray-400" /></button>
            </div>
            <p className="text-sm text-gray-500 dark:text-slate-400">
              Set the new stock quantity for <strong className="text-gray-900 dark:text-white">{adjustModal.name}</strong>
            </p>
            <p className="text-xs text-gray-400">Current stock: <span className="font-bold">{adjustModal.current}</span></p>
            <div>
              <label className="block text-xs font-bold text-gray-600 dark:text-slate-400 mb-1">New Quantity</label>
              <input type="number" min={0} step={0.01} value={newQty} onChange={(e) => setNewQty(Number(e.target.value))}
                className="w-full px-3 py-2.5 text-sm bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500/20" />
            </div>
            <div className="flex gap-3 justify-end">
              <button onClick={() => setAdjustModal(null)} className="px-4 py-2 rounded-xl border border-gray-200 dark:border-white/10 text-sm font-bold text-gray-600 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-white/5">Cancel</button>
              <button onClick={handleAdjust} className="px-5 py-2 bg-orange-500 hover:bg-orange-400 text-white rounded-xl text-sm font-bold transition-all">Update Stock</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
