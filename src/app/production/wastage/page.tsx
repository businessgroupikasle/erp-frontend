"use client";

import { useState, useEffect } from "react";
import { 
  Trash2, Plus, RefreshCw, AlertTriangle, Calendar, 
  Search, ShieldAlert, FileText, CheckCircle
} from "lucide-react";
import { wasteApi, inventoryApi, franchiseApi } from "@/lib/api";
import { toast } from "react-hot-toast";
import { format } from "date-fns";

interface WasteEntry {
  id: string;
  quantity: number;
  reason: string;
  note?: string;
  createdAt: string;
  inventoryItem: {
    name: string;
    sku: string;
    unit: string;
  };
}

export default function WastagePage() {
  const [wasteLogs, setWasteLogs] = useState<WasteEntry[]>([]);
  const [franchises, setFranchises] = useState<any[]>([]);
  const [selectedFranchiseId, setSelectedFranchiseId] = useState<string>("");
  const [inventoryItems, setInventoryItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  // Log Form State
  const [showLogModal, setShowLogModal] = useState(false);
  const [formData, setFormData] = useState({
    itemId: "",
    quantity: 1,
    reason: "SPOILAGE",
    note: ""
  });

  useEffect(() => {
    async function initData() {
      try {
        const fRes = await franchiseApi.getAll();
        setFranchises(fRes.data || []);
        if (fRes.data?.length > 0) {
          setSelectedFranchiseId(fRes.data[0].id);
        }
      } catch (err) {
        toast.error("Failed to load franchises");
      }
    }
    initData();
  }, []);

  const loadData = async () => {
    if (!selectedFranchiseId) return;
    setLoading(true);
    try {
      const [wRes, iRes] = await Promise.all([
        wasteApi.getAll(),
        inventoryApi.getInventory(selectedFranchiseId)
      ]);
      setWasteLogs(wRes.data || []);
      setInventoryItems(iRes.data || []);
      if (iRes.data?.length > 0) {
        setFormData(prev => ({ ...prev, itemId: iRes.data[0].id }));
      }
    } catch (err) {
      toast.error("Failed to fetch wastage logs");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [selectedFranchiseId]);

  const handleSubmitWaste = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.itemId || formData.quantity <= 0) {
      toast.error("Please enter a valid item and quantity");
      return;
    }

    setSubmitting(true);
    try {
      await wasteApi.create({
        itemId: formData.itemId,
        quantity: Number(formData.quantity),
        reason: formData.reason,
        note: formData.note,
        franchiseId: selectedFranchiseId
      });
      toast.success("Wastage logged successfully");
      setShowLogModal(false);
      setFormData({
        itemId: inventoryItems[0]?.id || "",
        quantity: 1,
        reason: "SPOILAGE",
        note: ""
      });
      loadData();
    } catch (err: any) {
      toast.error(err?.response?.data?.error || "Failed to log wastage");
    } finally {
      setSubmitting(false);
    }
  };

  const filteredLogs = wasteLogs.filter(log => 
    log.inventoryItem?.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    log.reason.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[#FDFCFD] dark:bg-[#020617] p-4 md:p-8 space-y-6 md:space-y-8 animate-in fade-in duration-500">
      
      {/* Header */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 py-4 border-b border-slate-200 dark:border-slate-800">
        <div>
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-[#F97316] rounded-xl shadow-lg shadow-orange-600/20 text-white">
              <Trash2 size={22} />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-black uppercase tracking-tight text-slate-900 dark:text-white">
                Wastage <span className="text-[#F97316]">Control</span>
              </h1>
              <p className="text-xs text-slate-500 mt-0.5 font-semibold tracking-wider uppercase">
                Track manufacturing yield losses, spoilage, and scrap items
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <select
            value={selectedFranchiseId}
            onChange={(e) => setSelectedFranchiseId(e.target.value)}
            className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white rounded-xl px-4 py-3 text-xs font-bold uppercase tracking-wider focus:outline-none"
          >
            {franchises.map((f) => (
              <option key={f.id} value={f.id}>
                {f.name}
              </option>
            ))}
          </select>

          <button
            onClick={() => setShowLogModal(true)}
            className="flex items-center gap-2 px-5 py-3 bg-[#F97316] text-white rounded-xl font-bold text-xs uppercase tracking-wider hover:shadow-xl hover:translate-y-[-1px] transition-all active:translate-y-0"
          >
            <Plus size={16} />
            Log Spoilage
          </button>
        </div>
      </header>

      {/* Main split dashboard view */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
        
        {/* Left Side: Stats and Log Modals */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800/80 rounded-3xl p-6 space-y-4">
            <h3 className="text-sm font-black uppercase tracking-widest text-slate-800 dark:text-slate-200 flex items-center gap-2">
              <ShieldAlert size={16} className="text-[#F97316]" />
              Wastage Statistics
            </h3>
            
            <div className="space-y-4 text-xs font-semibold text-slate-600 dark:text-slate-350">
              <div className="flex justify-between border-b border-slate-250/30 pb-2">
                <span className="text-slate-450 uppercase">Total Logged Entries:</span>
                <span className="font-bold text-slate-900 dark:text-white">{wasteLogs.length}</span>
              </div>
              <div className="flex justify-between border-b border-slate-250/30 pb-2">
                <span className="text-slate-450 uppercase">Spoiled / Damaged:</span>
                <span className="font-bold text-slate-900 dark:text-white">
                  {wasteLogs.filter(w => w.reason === 'SPOILAGE' || w.reason === 'DAMAGED').length}
                </span>
              </div>
              <div className="flex justify-between border-b border-slate-250/30 pb-2">
                <span className="text-slate-450 uppercase">QC Failures:</span>
                <span className="font-bold text-rose-500">
                  {wasteLogs.filter(w => w.reason === 'QC_FAIL').length}
                </span>
              </div>
            </div>
          </div>

          {showLogModal && (
            <div className="bg-white dark:bg-slate-900/50 border border-[#F97316]/20 rounded-3xl p-6 space-y-4 animate-in slide-in-from-bottom duration-300">
              <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-800 pb-3">
                <h3 className="text-sm font-black uppercase tracking-widest text-slate-900 dark:text-white">
                  Log Wastage / Spoilage
                </h3>
                <button 
                  onClick={() => setShowLogModal(false)}
                  className="text-xs font-black text-slate-400 hover:text-slate-600 uppercase"
                >
                  Cancel
                </button>
              </div>

              <form onSubmit={handleSubmitWaste} className="space-y-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">Inventory Item</label>
                  <select 
                    value={formData.itemId}
                    onChange={(e) => setFormData({ ...formData, itemId: e.target.value })}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white rounded-xl px-4 py-3 text-xs font-bold uppercase tracking-wider focus:outline-none"
                  >
                    <option value="" disabled>Choose Item...</option>
                    {inventoryItems.map(item => (
                      <option key={item.id} value={item.id}>
                        {item.name} ({item.sku})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">Quantity</label>
                  <input 
                    type="number"
                    min="0.01"
                    step="0.01"
                    value={formData.quantity || ""}
                    onChange={(e) => setFormData({ ...formData, quantity: Number(e.target.value) })}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white rounded-xl px-4 py-3 text-xs font-bold focus:outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">Wastage Reason</label>
                  <select 
                    value={formData.reason}
                    onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white rounded-xl px-4 py-3 text-xs font-bold uppercase tracking-wider focus:outline-none"
                  >
                    <option value="SPOILAGE">Spoilage & Rotting</option>
                    <option value="DAMAGED">Damaged in House</option>
                    <option value="QC_FAIL">Failed QC Inspection</option>
                    <option value="EXPIRED">Expired Shelf Life</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">Remarks / Notes</label>
                  <input 
                    type="text"
                    value={formData.note}
                    onChange={(e) => setFormData({ ...formData, note: e.target.value })}
                    placeholder="Enter reason details..."
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white rounded-xl px-4 py-3 text-xs font-bold focus:outline-none"
                  />
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full py-3.5 bg-[#F97316] text-white rounded-xl font-black text-xs uppercase tracking-wider shadow-lg hover:shadow-xl transition-all disabled:opacity-40"
                >
                  {submitting ? "Submitting..." : "Submit Wastage Log"}
                </button>
              </form>
            </div>
          )}
        </div>

        {/* Right Side: Wastage History List */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800/80 rounded-3xl overflow-hidden shadow-sm">
            <div className="p-6 border-b border-slate-200/50 dark:border-slate-800/50 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <h3 className="text-sm font-black uppercase tracking-widest text-slate-850 dark:text-slate-200 flex items-center gap-2">
                <FileText size={16} className="text-[#F97316]" />
                Wastage Audit History
              </h3>

              <div className="relative w-full sm:w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input 
                  type="text"
                  placeholder="Search logs..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 bg-slate-55 dark:bg-slate-950 border border-slate-200 dark:border-slate-855 rounded-xl text-xs focus:outline-none text-slate-900 dark:text-white"
                />
              </div>
            </div>

            {loading ? (
              <div className="flex flex-col items-center justify-center py-20">
                <div className="w-10 h-10 border-4 border-[#F97316] border-t-transparent rounded-full animate-spin mb-4" />
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest animate-pulse">Scanning audit logs...</p>
              </div>
            ) : filteredLogs.length === 0 ? (
              <div className="py-20 text-center text-slate-400 uppercase text-[10px] font-bold">
                No wastage records found for selected filters.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50 dark:bg-slate-950 text-[10px] font-black uppercase tracking-wider text-slate-400 border-b border-slate-200/50 dark:border-slate-800/50">
                      <th className="py-4 px-6">Item</th>
                      <th className="py-4 px-4 text-center">Reason</th>
                      <th className="py-4 px-4 text-right">Qty Loss</th>
                      <th className="py-4 px-6">Notes / Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800/50 text-xs font-semibold text-slate-750 dark:text-slate-250">
                    {filteredLogs.map((log) => {
                      const isQCFail = log.reason === "QC_FAIL";
                      const isExpired = log.reason === "EXPIRED";
                      
                      return (
                        <tr key={log.id} className="hover:bg-slate-55/50 dark:hover:bg-white/[0.01] transition-all">
                          <td className="py-4 px-6">
                            <div className="font-bold text-slate-900 dark:text-white">{log.inventoryItem?.name}</div>
                            <div className="text-[9px] font-mono text-slate-450 mt-1 uppercase">SKU: {log.inventoryItem?.sku}</div>
                          </td>
                          <td className="py-4 px-4 text-center">
                            <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider border ${isQCFail ? 'bg-rose-50 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-100 dark:border-rose-500/20' : isExpired ? 'bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-100 dark:border-amber-500/20' : 'bg-slate-105 dark:bg-slate-850 text-slate-600 dark:text-slate-350 border-slate-200 dark:border-slate-800'}`}>
                              {log.reason}
                            </span>
                          </td>
                          <td className="py-4 px-4 text-right font-black text-rose-500">
                            -{log.quantity} <span className="text-[9px] text-slate-400 uppercase">{log.inventoryItem?.unit}</span>
                          </td>
                          <td className="py-4 px-6">
                            <div className="text-slate-800 dark:text-slate-200 font-bold">{log.note || 'N/A'}</div>
                            <div className="text-[9px] text-slate-450 font-bold uppercase mt-1 flex items-center gap-1">
                              <Calendar size={10} />
                              {format(new Date(log.createdAt), 'dd MMM yyyy HH:mm')}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
