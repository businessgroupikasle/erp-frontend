"use client";

import React, { useState, useEffect } from "react";
import { 
  X, Save, Sparkles, ChevronDown, 
  AlertCircle, CheckCircle2, Package, Scale, Info,
  Thermometer, Clock, ShieldCheck, Warehouse, History, Barcode
} from "lucide-react";
import { rawMaterialsApi, franchiseApi, vendorsApi } from "@/lib/api";
import { ITEM_CATEGORIES, UNITS } from "@/lib/constants";
import { useAuth } from "@/context/AuthContext";
import { clsx } from "clsx";
import { 
  generateEnterpriseSKU, getGSTByHSN, 
  VALUATION_METHODS, STORAGE_TYPES 
} from "@/lib/utils/erp";

interface AddMaterialDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function AddMaterialDrawer({ isOpen, onClose, onSuccess }: AddMaterialDrawerProps) {
  const { user } = useAuth();
  const [franchises, setFranchises] = useState<any[]>([]);
  const [vendors, setVendors] = useState<any[]>([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showAdvanced, setShowAdvanced] = useState(false);
  
  const [form, setForm] = useState({
    name: "",
    sku: "",
    unit: "kg",
    minimumStock: 10,
    reorderQty: 50,
    category: "RAW_MATERIAL",
    initialStock: 0,
    reconciliationValue: 0,
    reconciliationDate: new Date().toISOString().split('T')[0],
    vendorId: "",
    hsnCode: "",
    gstRate: 5,
    franchiseId: "",
    storageType: "DRY",
    shelfLife: 180,
    batchTracking: true,
    qcRequired: true,
    valuationMethod: "FIFO",
    barcode: "",
    defaultWarehouse: "Main Stores",
    storageZone: "Zone A",
    binLocation: "",
    status: "PENDING_APPROVAL",
    notes: "",
  });

  useEffect(() => {
    if (isOpen) {
      const fetchData = async () => {
        try {
          const [fRes, vRes] = await Promise.all([
            franchiseApi.getAll().catch(() => ({ data: [] })),
            vendorsApi.getAll().catch(() => ({ data: [] }))
          ]);
          const fetchedFranchises = fRes.data || [];
          setFranchises(fetchedFranchises);
          setVendors(vRes.data || []);
          
          if (fetchedFranchises.length > 0 && !form.franchiseId) {
            setForm(prev => ({ ...prev, franchiseId: fetchedFranchises[0].id }));
          }
        } catch (e) {
          console.error("Failed to fetch data", e);
        }
      };
      fetchData();
    }
  }, [isOpen]);

  useEffect(() => {
    const sku = generateEnterpriseSKU(form.category, form.name);
    setForm((f) => ({ ...f, sku }));
  }, [form.category, form.name]);

  useEffect(() => {
    if (form.hsnCode.length >= 4) {
      const suggestedGst = getGSTByHSN(form.hsnCode);
      if (suggestedGst !== null) {
        setForm(f => ({ ...f, gstRate: suggestedGst }));
      }
    }
  }, [form.hsnCode]);

  const handleSave = async () => {
    if (!form.name) {
      setError("Material designation is required");
      return;
    }
    if (!form.franchiseId) {
      setError("Franchise identification is required");
      return;
    }

    setSaving(true);
    setError(null);
    try {
      await rawMaterialsApi.create({
        ...form,
        initialStock: Number(form.initialStock) || 0,
        createdBy: user?.id,
        requestedAt: new Date().toISOString(),
      });
      onSuccess();
      onClose();
    } catch (e: any) {
      console.error(e);
      setError(e.response?.data?.error || "Failed to submit material request.");
    } finally {
      setSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[150] flex justify-end overflow-hidden">
      <div 
        className="absolute inset-0 bg-slate-900/20 backdrop-blur-[2px] animate-in fade-in duration-500"
        onClick={onClose}
      />
      
      <div className="relative w-full max-w-2xl bg-white dark:bg-[#0f1117] h-full shadow-[-20px_0_50px_rgba(0,0,0,0.1)] animate-in slide-in-from-right duration-500 flex flex-col">
        {/* Header */}
        <div className="bg-white/80 dark:bg-[#0f1117]/80 backdrop-blur-xl border-b border-slate-100 dark:border-white/5 p-8 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-[2rem] bg-orange-500 flex items-center justify-center text-white shadow-xl shadow-orange-500/20">
              <Package size={28} />
            </div>
            <div>
              <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight uppercase">Master Resource Entry</h2>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mt-0.5">Supply Chain & Traceability</p>
            </div>
          </div>
          <button onClick={onClose} className="p-3 hover:bg-slate-100 dark:hover:bg-white/5 rounded-full transition-all text-slate-300 hover:text-slate-500">
            <X size={28} />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-10 space-y-10 custom-scrollbar">
          {error && (
            <div className="p-5 rounded-3xl bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-900/30 flex items-center gap-4 text-red-600 dark:text-red-400 text-[11px] font-black uppercase tracking-widest animate-in zoom-in-95">
              <AlertCircle size={20} />
              {error}
            </div>
          )}

          {/* Section: Core Identification */}
          <div className="space-y-6">
            <div className="space-y-3">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-2">Material Designation *</label>
              <input 
                type="text" 
                placeholder="e.g. Organic Basmati Rice" 
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                className="w-full px-8 py-5 text-base font-black bg-slate-50 dark:bg-white/5 border-2 border-transparent focus:border-orange-500/20 rounded-[1.5rem] outline-none dark:text-white transition-all shadow-sm" 
              />
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-3">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-2">Category</label>
                <div className="relative">
                  <select 
                    value={form.category} 
                    onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}
                    className="w-full appearance-none bg-slate-50 dark:bg-white/5 border-2 border-transparent focus:border-orange-500/20 rounded-[1.2rem] px-6 py-4 text-xs font-black dark:text-white transition-all shadow-sm"
                  >
                    {ITEM_CATEGORIES.map((c) => <option key={c} value={c}>{c.replace(/_/g, " ")}</option>)}
                  </select>
                  <ChevronDown size={18} className="absolute right-6 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                </div>
              </div>
              <div className="space-y-3">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-2">Sourcing Unit</label>
                <div className="relative">
                  <select 
                    value={form.unit} 
                    onChange={(e) => setForm((f) => ({ ...f, unit: e.target.value }))}
                    className="w-full appearance-none bg-slate-50 dark:bg-white/5 border-2 border-transparent focus:border-orange-500/20 rounded-[1.2rem] px-6 py-4 text-xs font-black dark:text-white transition-all shadow-sm"
                  >
                    {UNITS.map((u) => <option key={u} value={u}>{u.toUpperCase()}</option>)}
                  </select>
                  <ChevronDown size={18} className="absolute right-6 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-3">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-2 flex items-center gap-2">
                  <Barcode size={12} className="text-indigo-500" /> HSN Code
                </label>
                <input 
                  type="text" 
                  placeholder="4 or 8 digits"
                  value={form.hsnCode}
                  onChange={(e) => setForm((f) => ({ ...f, hsnCode: e.target.value }))}
                  className="w-full px-6 py-4 text-xs font-black bg-slate-50 dark:bg-white/5 border-2 border-transparent focus:border-indigo-500/20 rounded-[1.2rem] outline-none dark:text-white transition-all" 
                />
              </div>
              <div className="space-y-3">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-2">Tax Rate (GST)</label>
                <div className="relative">
                  <select 
                    value={form.gstRate} 
                    onChange={(e) => setForm((f) => ({ ...f, gstRate: Number(e.target.value) }))}
                    className="w-full appearance-none bg-slate-50 dark:bg-white/5 border-2 border-transparent focus:border-indigo-500/20 rounded-[1.2rem] px-6 py-4 text-xs font-black dark:text-white transition-all"
                  >
                    {[0, 5, 12, 18, 28].map((rate) => <option key={rate} value={rate}>{rate}% GST Standard</option>)}
                  </select>
                  <ChevronDown size={18} className="absolute right-6 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                </div>
              </div>
            </div>
          </div>

          <button 
            type="button"
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="flex items-center gap-2 text-[10px] font-black text-indigo-500 uppercase tracking-widest hover:bg-indigo-50 dark:hover:bg-white/5 px-4 py-2 rounded-xl transition-all"
          >
            {showAdvanced ? "Hide Advanced ERP Configurations" : "Configure Advanced Traceability & Warehouse"}
            <ChevronDown size={14} className={clsx("transition-transform", showAdvanced && "rotate-180")} />
          </button>

          {showAdvanced && (
            <div className="space-y-10 animate-in fade-in slide-in-from-top-4 duration-500">
              {/* Section: Identification (Detailed) */}
              <div className="grid grid-cols-2 gap-6 p-6 bg-slate-50 dark:bg-white/5 rounded-3xl border border-slate-100 dark:border-white/5">
                <div className="space-y-2">
                   <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest">System SKU (Auto)</label>
                   <p className="text-xs font-black text-indigo-600 dark:text-indigo-400 px-1">{form.sku || "GENERATING..."}</p>
                </div>
                <div className="space-y-2 text-right">
                   <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Initial Status</label>
                   <p className="text-[9px] font-black text-amber-600 bg-amber-50 dark:bg-amber-500/10 px-3 py-1 rounded-full inline-block">PENDING APPROVAL</p>
                </div>
              </div>

              {/* Section: Supply Chain Parameters */}
              <div className="bg-blue-500/5 p-8 rounded-[2.5rem] border border-blue-500/10 space-y-8">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-blue-500 flex items-center justify-center text-white shadow-lg shadow-blue-500/20"><Scale size={16} /></div>
                  <h3 className="text-[11px] font-black text-blue-600 uppercase tracking-[0.3em]">Supply Chain Controls</h3>
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-2">Valuation Method</label>
                    <div className="relative">
                      <select 
                        value={form.valuationMethod} 
                        onChange={(e) => setForm((f) => ({ ...f, valuationMethod: e.target.value }))}
                        className="w-full appearance-none bg-white dark:bg-slate-900 border-none rounded-[1.2rem] px-6 py-4 text-xs font-black dark:text-white transition-all shadow-sm"
                      >
                        {VALUATION_METHODS.map((m) => <option key={m.id} value={m.id}>{m.id}</option>)}
                      </select>
                      <ChevronDown size={18} className="absolute right-6 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                    </div>
                  </div>
                  <div className="space-y-3">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-2">Safety Stock</label>
                    <input 
                      type="number" 
                      value={form.minimumStock}
                      onChange={(e) => setForm((f) => ({ ...f, minimumStock: Number(e.target.value) }))}
                      className="w-full px-6 py-4 text-xs font-black bg-white dark:bg-slate-900 border-none rounded-[1.2rem] outline-none dark:text-white transition-all shadow-sm" 
                    />
                  </div>
                </div>
              </div>

              {/* Section: Traceability & Storage */}
              <div className="grid grid-cols-2 gap-8 p-8 rounded-[2.5rem] border border-slate-100 dark:border-white/5 bg-slate-50/50 dark:bg-white/[0.02]">
                <div className="space-y-6">
                    <div className="flex items-center gap-3">
                       <div className="w-8 h-8 rounded-xl bg-purple-500/10 flex items-center justify-center text-purple-500"><Thermometer size={16} /></div>
                       <h3 className="text-[11px] font-black text-slate-500 uppercase tracking-[0.3em]">Storage</h3>
                    </div>
                    <div className="space-y-3">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Environment</label>
                      <select 
                        value={form.storageType} 
                        onChange={(e) => setForm((f) => ({ ...f, storageType: e.target.value }))}
                        className="w-full bg-white dark:bg-white/5 border-none rounded-xl px-4 py-3 text-xs font-bold dark:text-white transition-all shadow-sm"
                      >
                        {STORAGE_TYPES.map((s) => <option key={s.id} value={s.id}>{s.label}</option>)}
                      </select>
                    </div>
                </div>

                <div className="space-y-6">
                    <div className="flex items-center gap-3">
                       <div className="w-8 h-8 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-500"><ShieldCheck size={16} /></div>
                       <h3 className="text-[11px] font-black text-slate-500 uppercase tracking-[0.3em]">Quality</h3>
                    </div>
                    <div className="flex items-center justify-between p-4 bg-white dark:bg-white/5 rounded-xl shadow-sm">
                       <p className="text-[9px] text-slate-400 font-bold uppercase">Batch Tracking</p>
                       <button 
                         type="button"
                         onClick={() => setForm(f => ({ ...f, batchTracking: !f.batchTracking }))}
                         className={clsx("w-10 h-5 rounded-full transition-all relative", form.batchTracking ? "bg-emerald-500" : "bg-slate-200 dark:bg-slate-700")}
                       >
                         <div className={clsx("absolute top-0.5 w-4 h-4 bg-white rounded-full transition-all shadow-sm", form.batchTracking ? "right-0.5" : "left-0.5")} />
                       </button>
                    </div>
                </div>
              </div>

              {/* Section: Warehouse Allocation */}
              <div className="p-8 bg-slate-900 text-white rounded-[2.5rem] space-y-6">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-white/10 flex items-center justify-center text-white"><Warehouse size={16} /></div>
                  <h3 className="text-[11px] font-black uppercase tracking-[0.3em]">Warehouse Mapping</h3>
                </div>
                <div className="grid grid-cols-2 gap-4">
                   <div className="space-y-2">
                      <label className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">Storage Zone</label>
                      <input value={form.storageZone} onChange={e => setForm(f => ({...f, storageZone: e.target.value}))} className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-xs font-bold outline-none" />
                   </div>
                   <div className="space-y-2">
                      <label className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">Bin / Rack No.</label>
                      <input value={form.binLocation} onChange={e => setForm(f => ({...f, binLocation: e.target.value}))} className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-xs font-bold outline-none" />
                   </div>
                </div>
              </div>
            </div>
          )}

          {/* Section: Opening Reconciliation */}
          <div className="p-10 bg-slate-50/80 dark:bg-white/5 rounded-[3rem] border border-slate-100 dark:border-white/5 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-orange-500/5 rounded-bl-full -mr-10 -mt-10 transition-transform group-hover:scale-110" />
            <div className="flex items-center justify-between mb-8 relative z-10">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-white dark:bg-[#0f1117] flex items-center justify-center text-orange-500 shadow-sm">
                  <History size={20} />
                </div>
                <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.3em]">Opening Reconciliation</h3>
              </div>
              <input 
                type="date"
                value={form.reconciliationDate}
                onChange={e => setForm(f => ({...f, reconciliationDate: e.target.value}))}
                className="bg-transparent text-[10px] font-black text-slate-400 uppercase tracking-widest outline-none border-b border-slate-200 dark:border-white/10 pb-1"
              />
            </div>
            
            <div className="grid grid-cols-2 gap-8 relative z-10">
              <div className="space-y-4">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Opening Quantity</p>
                <div className="relative">
                  <input 
                    type="number" 
                    step={0.01}
                    value={form.initialStock}
                    onChange={(e) => setForm((f) => ({ ...f, initialStock: Number(e.target.value) }))}
                    className="w-full px-6 py-4 text-2xl font-black bg-white dark:bg-[#0f1117] border-none rounded-2xl outline-none dark:text-white shadow-lg" 
                  />
                  <div className="absolute right-6 top-1/2 -translate-y-1/2 text-[10px] font-black text-slate-300 uppercase">{form.unit}</div>
                </div>
              </div>
              <div className="space-y-4">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Valuation (₹)</p>
                <div className="relative">
                  <input 
                    type="number" 
                    step={0.01}
                    value={form.reconciliationValue}
                    onChange={(e) => setForm((f) => ({ ...f, reconciliationValue: Number(e.target.value) }))}
                    className="w-full px-6 py-4 text-2xl font-black bg-white dark:bg-[#0f1117] border-none rounded-2xl outline-none dark:text-white shadow-lg" 
                  />
                  <div className="absolute right-6 top-1/2 -translate-y-1/2 text-[10px] font-black text-slate-300 uppercase tracking-widest">INR</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-white/80 dark:bg-[#0f1117]/80 backdrop-blur-2xl border-t border-slate-100 dark:border-white/5 p-10 flex gap-6 shrink-0">
          <button 
            type="button"
            onClick={onClose}
            className="flex-1 py-5 border-2 border-slate-100 dark:border-white/5 text-[11px] font-black uppercase tracking-[0.3em] text-slate-400 hover:bg-slate-50 dark:hover:bg-white/5 rounded-[2rem] transition-all"
          >
            Discard
          </button>
          <button 
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="flex-[2] py-5 bg-orange-500 hover:bg-orange-400 disabled:opacity-50 text-white rounded-[2rem] text-[11px] font-black uppercase tracking-[0.3em] shadow-2xl shadow-orange-500/40 transition-all flex items-center justify-center gap-4 active:scale-95"
          >
            {saving ? (
              <div className="w-6 h-6 border-3 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <CheckCircle2 size={22} />
            )}
            {saving ? "Processing..." : "Submit For Approval"}
          </button>
        </div>
      </div>
    </div>
  );
}
