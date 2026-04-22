"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Store, Plus, X, Search, Phone, Mail,
  Star, RefreshCw, ShoppingCart, Edit2, Trash2,
} from "lucide-react";
import { clsx } from "clsx";
import { vendorsApi, rawMaterialsApi } from "@/lib/api";

const EMPTY_FORM = { name: "", contact: "", email: "" };

export default function VendorsPage() {
  const [vendors, setVendors]   = useState<any[]>([]);
  const [materials, setMaterials] = useState<any[]>([]);
  const [loading, setLoading]   = useState(true);
  const [search, setSearch]     = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing]   = useState<any>(null);
  const [saving, setSaving]     = useState(false);
  const [form, setForm]         = useState(EMPTY_FORM);

  // Link Material State
  const [linkModal, setLinkModal] = useState<any>(null);
  const [linkData, setLinkData]   = useState({ materialId: "", price: 0 });

  const fetchVendors = useCallback(async () => {
    setLoading(true);
    try {
      const [vRes, mRes] = await Promise.all([
        vendorsApi.getAll(),
        rawMaterialsApi.getAll()
      ]);
      setVendors(vRes.data ?? []);
      setMaterials(mRes.data ?? []);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchVendors(); }, [fetchVendors]);

  const openCreate = () => { setEditing(null); setForm(EMPTY_FORM); setShowForm(true); };
  const openEdit   = (v: any) => { setEditing(v); setForm({ name: v.name, contact: v.contact, email: v.email ?? "" }); setShowForm(true); };

  const handleSave = async () => {
    if (!form.name || !form.contact) return;
    setSaving(true);
    try {
      if (editing) {
        await vendorsApi.update(editing.id, form);
      } else {
        await vendorsApi.create(form);
      }
      setShowForm(false);
      fetchVendors();
    } catch (e: any) { 
      console.error(e);
      alert(e?.response?.data?.error ?? "Failed to save vendor details.");
    }
    finally { setSaving(false); }
  };

  const handleLinkMaterial = async () => {
    if (!linkData.materialId || !linkModal) return;
    setSaving(true);
    try {
      await vendorsApi.linkMaterial({
        vendorId: linkModal.id,
        ...linkData
      });
      setLinkModal(null);
      setLinkData({ materialId: "", price: 0 });
      fetchVendors();
    } catch (e: any) {
      alert(e?.response?.data?.error ?? "Failed to link material.");
    } finally { setSaving(false); }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Delete vendor "${name}"? This cannot be undone.`)) return;
    try {
      await vendorsApi.delete(id);
      fetchVendors();
    } catch (e: any) {
      alert(e?.response?.data?.error ?? "Failed to delete vendor");
    }
  };

  const filtered = vendors.filter((v) =>
    !search || v.name?.toLowerCase().includes(search.toLowerCase()) || v.contact?.includes(search)
  );

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-gray-900 dark:text-white flex items-center gap-2">
            <Store size={22} className="text-orange-500" /> Vendor Management
          </h1>
          <p className="text-sm text-gray-500 dark:text-slate-400 mt-1">
            Manage suppliers who provide raw materials to the home house
          </p>
        </div>
        <div className="flex gap-2">
          <button onClick={fetchVendors} className="p-2 rounded-xl border border-gray-200 dark:border-white/10 hover:bg-gray-50 dark:hover:bg-white/5 transition-all">
            <RefreshCw size={16} className="text-gray-400" />
          </button>
          <button onClick={openCreate} className="flex items-center gap-2 bg-orange-500 hover:bg-orange-400 text-white px-4 py-2 rounded-xl text-sm font-bold transition-all">
            <Plus size={16} /> Add Vendor
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-card rounded-2xl border border-gray-100 dark:border-white/5 p-4">
          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Total Vendors</p>
          <p className="text-2xl font-black text-gray-900 dark:text-white mt-1">{vendors.length}</p>
        </div>
        <div className="bg-white dark:bg-card rounded-2xl border border-gray-100 dark:border-white/5 p-4">
          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Total Orders</p>
          <p className="text-2xl font-black text-gray-900 dark:text-white mt-1">
            {vendors.reduce((s, v) => s + (v._count?.orders ?? 0), 0)}
          </p>
        </div>
        <div className="bg-emerald-50 dark:bg-emerald-500/10 rounded-2xl border border-emerald-100 dark:border-emerald-500/20 p-4">
          <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">Active Suppliers</p>
          <p className="text-2xl font-black text-emerald-700 dark:text-emerald-400 mt-1">
            {vendors.filter(v => (v._count?.orders ?? 0) > 0).length}
          </p>
        </div>
        <div className="bg-orange-50 dark:bg-orange-500/10 rounded-2xl border border-orange-100 dark:border-orange-500/20 p-4">
          <p className="text-[10px] font-black text-orange-600 uppercase tracking-widest">Linked Materials</p>
          <p className="text-2xl font-black text-orange-700 dark:text-orange-400 mt-1">
            {vendors.reduce((s, v) => s + (v.suppliedMaterials?.length ?? 0), 0)}
          </p>
        </div>
      </div>

      <div className="relative">
        <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search vendors..."
          className="w-full pl-9 pr-4 py-2.5 text-sm bg-white dark:bg-card border border-gray-200 dark:border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500/20" />
      </div>

      {loading ? (
        <div className="py-20 text-center text-gray-400 text-sm">Loading vendors...</div>
      ) : filtered.length === 0 ? (
        <div className="py-20 text-center text-gray-300 dark:text-slate-600 space-y-2">
          <Store size={48} strokeWidth={1} className="mx-auto" />
          <p className="text-sm font-semibold">No vendors yet. Add your first supplier.</p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {filtered.map((vendor) => (
            <div key={vendor.id} className="bg-white dark:bg-card rounded-2xl border border-gray-100 dark:border-white/5 p-5 hover:shadow-md transition-all">
              <div className="flex items-start gap-3 mb-4">
                <div className="w-12 h-12 rounded-2xl bg-orange-50 dark:bg-orange-900/20 flex items-center justify-center shrink-0">
                  <Store size={20} className="text-orange-500" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-black text-gray-900 dark:text-white text-sm truncate">{vendor.name}</h3>
                  <div className="flex items-center gap-1 mt-0.5">
                    {[1,2,3,4,5].map((s) => (
                      <Star key={s} size={10} className={clsx(s <= Math.round(vendor.rating ?? 5) ? "text-amber-400 fill-amber-400" : "text-gray-300 dark:text-slate-600")} />
                    ))}
                    <span className="text-[10px] text-gray-400 ml-1">{(vendor.rating ?? 5).toFixed(1)}</span>
                  </div>
                </div>
                <div className="flex gap-1 shrink-0">
                  <button 
                    onClick={() => setLinkModal(vendor)}
                    title="Link Material"
                    className="p-1.5 rounded-lg hover:bg-indigo-50 dark:hover:bg-indigo-900/20 text-gray-400 hover:text-indigo-600 transition-all">
                    <Plus size={13} />
                  </button>
                  <button onClick={() => openEdit(vendor)} className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-white/5 text-gray-400 hover:text-orange-500 transition-all">
                    <Edit2 size={13} />
                  </button>
                  <button onClick={() => handleDelete(vendor.id, vendor.name)} className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/10 text-gray-400 hover:text-red-500 transition-all">
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>
              
              {/* Contact Info */}
              <div className="space-y-1.5 px-0.5">
                <div className="flex items-center gap-2 text-[12px] text-gray-600 dark:text-slate-400">
                  <Phone size={11} className="text-gray-400 shrink-0" /> {vendor.contact}
                </div>
              </div>
              <div className="mt-3 flex flex-wrap gap-1.5 min-h-[22px]">
                {vendor.suppliedMaterials?.length > 0 ? (
                  vendor.suppliedMaterials.slice(0, 3).map((sm: any, i: number) => (
                    <span key={i} className="px-2 py-0.5 bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 rounded-md text-[10px] font-black uppercase tracking-wider flex items-center gap-1">
                      {sm.material?.name || "Unknown"}
                      {sm.price > 0 && <span className="opacity-50 border-l border-indigo-200 dark:border-indigo-800 pl-1">₹{sm.price}</span>}
                    </span>
                  ))
                ) : (
                  <span className="text-[10px] text-gray-400 italic">No materials linked</span>
                )}
                {vendor.suppliedMaterials?.length > 3 && (
                  <span className="text-[10px] text-gray-400 font-bold">+{vendor.suppliedMaterials.length - 3} more</span>
                )}
              </div>

              <div className="mt-4 pt-3 border-t border-gray-100 dark:border-white/5 flex items-center justify-between">
                <div className="flex items-center gap-2 text-[11px] text-gray-400 font-bold">
                  <ShoppingCart size={11} />
                  <span>{vendor._count?.orders ?? 0} Orders</span>
                </div>
                <div className="text-[11px] font-black text-gray-900 dark:text-white bg-gray-50 dark:bg-white/5 px-2 py-1 rounded-lg">
                  {vendor.orders?.[0]?.poItems?.length || 0} items last order
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Link Material Modal */}
      {linkModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-[#12141c] rounded-3xl shadow-2xl w-full max-w-sm p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-black text-gray-900 dark:text-white">Link Material to {linkModal.name}</h2>
              <button onClick={() => setLinkModal(null)} className="p-1.5 hover:bg-gray-100 dark:hover:bg-white/10 rounded-lg"><X size={16} className="text-gray-400" /></button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-600 dark:text-slate-400 mb-1">Select Material</label>
                <select 
                  value={linkData.materialId}
                  onChange={(e) => setLinkData({ ...linkData, materialId: e.target.value })}
                  className="w-full px-3 py-2.5 text-sm bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 font-bold"
                >
                  <option value="">Choose material...</option>
                  {materials.map((m: any) => (
                    <option key={m.id} value={m.id}>{m.name} ({m.unit})</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-600 dark:text-slate-400 mb-1">Latest Price (₹)</label>
                <input 
                  type="number"
                  placeholder="0.00"
                  value={linkData.price}
                  onChange={(e) => setLinkData({ ...linkData, price: Number(e.target.value) })}
                  className="w-full px-3 py-2.5 text-sm bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 font-bold"
                />
              </div>
            </div>

            <div className="flex gap-3 justify-end pt-2">
              <button onClick={() => setLinkModal(null)} className="px-4 py-2 rounded-xl border border-gray-200 dark:border-white/10 text-sm font-bold text-gray-600 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-white/5">Cancel</button>
              <button 
                onClick={handleLinkMaterial} 
                disabled={saving || !linkData.materialId}
                className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white rounded-xl text-sm font-bold transition-all shadow-lg shadow-indigo-500/20">
                {saving ? "Linking..." : "Link Material"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Vendor Form Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-[#12141c] rounded-3xl shadow-2xl w-full max-w-sm p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-black text-gray-900 dark:text-white">{editing ? "Edit Vendor" : "Add Vendor"}</h2>
              <button onClick={() => setShowForm(false)} className="p-1.5 hover:bg-gray-100 dark:hover:bg-white/10 rounded-lg"><X size={16} className="text-gray-400" /></button>
            </div>
            {[
              { label: "Vendor Name *", key: "name", placeholder: "e.g. Kumar Traders" },
              { label: "Contact Number *", key: "contact", placeholder: "+91 98765 43210" },
              { label: "Email", key: "email", placeholder: "vendor@email.com" },
            ].map(({ label, key, placeholder }) => (
              <div key={key}>
                <label className="block text-xs font-bold text-gray-600 dark:text-slate-400 mb-1">{label}</label>
                <input placeholder={placeholder} value={(form as any)[key]}
                  onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))}
                  className="w-full px-3 py-2.5 text-sm bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500/20 font-bold" />
              </div>
            ))}
            <div className="flex gap-3 justify-end pt-2">
              <button onClick={() => setShowForm(false)} className="px-4 py-2 rounded-xl border border-gray-200 dark:border-white/10 text-sm font-bold text-gray-600 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-white/5">Cancel</button>
              <button onClick={handleSave} disabled={saving || !form.name || !form.contact}
                className="px-5 py-2 bg-orange-500 hover:bg-orange-400 disabled:opacity-50 text-white rounded-xl text-sm font-bold transition-all shadow-lg shadow-orange-500/20">
                {saving ? "Saving..." : editing ? "Update" : "Add Vendor"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
