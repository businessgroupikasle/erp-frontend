"use client";

import { useState, useEffect } from "react";
import { 
  Package, ArrowRight, ClipboardList, CheckCircle2, AlertCircle, 
  RefreshCw, Scale, Search, Layers, Box, Tag, Play
} from "lucide-react";
import { productionApi, franchiseApi } from "@/lib/api";
import { toast } from "react-hot-toast";
import { format } from "date-fns";

interface ProductBatch {
  id: string;
  batchCode: string;
  quantity: number;
  approvedQty: number;
  packagedQty: number;
  qcStatus: string;
  packagingStatus: string;
  expiryDate: string;
  product: {
    name: string;
    sku: string;
    unit: string;
  };
}

export default function PackagingQueuePage() {
  const [batches, setBatches] = useState<ProductBatch[]>([]);
  const [franchises, setFranchises] = useState<any[]>([]);
  const [selectedFranchiseId, setSelectedFranchiseId] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedBatch, setSelectedBatch] = useState<ProductBatch | null>(null);

  // Form states
  const [packetSize, setPacketSize] = useState("500g");
  const [quantityPackets, setQuantityPackets] = useState(10);
  const [submitting, setSubmitting] = useState(false);

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

  const loadBatches = async () => {
    if (!selectedFranchiseId) return;
    setLoading(true);
    try {
      const res = await productionApi.getAllBatches(selectedFranchiseId);
      setBatches(res.data || []);
    } catch (err) {
      toast.error("Failed to fetch production batches");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBatches();
  }, [selectedFranchiseId]);

  // Compute total bulk stock conversion needed
  const parseWeight = (size: string): number => {
    const match = size.match(/^(\d+(\.\d+)?)\s*(g|kg|l|ml|pcs|unit)$/i);
    if (!match) return 1.0;
    const val = parseFloat(match[1]);
    const unit = match[3].toLowerCase();

    if (unit === 'g' || unit === 'ml') return val / 1000;
    return val;
  };

  const unitMultiplier = parseWeight(packetSize);
  const totalWeightNeeded = quantityPackets * unitMultiplier;

  const handlePackageRun = async () => {
    if (!selectedBatch) return;
    if (quantityPackets <= 0) {
      toast.error("Packet quantity must be greater than zero");
      return;
    }

    setSubmitting(true);
    try {
      await productionApi.packageBatch(selectedBatch.id, {
        packetSize,
        quantityPackets
      });
      toast.success("Packaging conversion successful!");
      setSelectedBatch(null);
      loadBatches();
      // Redirect to label view to print
      window.location.href = "/packaging/labels";
    } catch (err: any) {
      toast.error(err?.response?.data?.error || "Error executing packaging run. Verify bulk stock.");
    } finally {
      setSubmitting(false);
    }
  };

  const filteredBatches = batches.filter(b => 
    b.batchCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
    b.product?.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[#FDFCFD] dark:bg-[#020617] p-4 md:p-8 space-y-6 md:space-y-8 animate-in fade-in duration-500">
      {/* Header */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 py-4 border-b border-slate-200 dark:border-slate-800">
        <div>
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-[#F97316] rounded-xl shadow-lg shadow-orange-600/20 text-white">
              <Package size={22} />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-black uppercase tracking-tight text-slate-900 dark:text-white">
                Packaging <span className="text-[#F97316]">Queue</span>
              </h1>
              <p className="text-xs text-slate-500 mt-0.5 font-semibold tracking-wider uppercase">
                Convert bulk kitchen production batches to retail-ready units
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
        </div>
      </header>

      {/* Main Grid split: List + Detail Modal Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
        
        {/* Left 2 Columns: Batches list */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800/80 rounded-3xl overflow-hidden shadow-sm">
            <div className="p-6 border-b border-slate-200/50 dark:border-slate-800/50 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <h3 className="text-sm font-black uppercase tracking-widest text-slate-800 dark:text-slate-200 flex items-center gap-2">
                <Layers size={16} className="text-[#F97316]" />
                Production Outputs awaiting conversion
              </h3>

              <div className="relative w-full sm:w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input 
                  type="text"
                  placeholder="Search batches..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-855 rounded-xl text-xs focus:outline-none text-slate-900 dark:text-white"
                />
              </div>
            </div>

            {loading ? (
              <div className="flex flex-col items-center justify-center py-20">
                <div className="w-10 h-10 border-4 border-[#F97316] border-t-transparent rounded-full animate-spin mb-4" />
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest animate-pulse">Scanning batches...</p>
              </div>
            ) : filteredBatches.length === 0 ? (
              <div className="py-20 text-center text-slate-400 uppercase text-[10px] font-bold">
                No production batches available for packaging.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50 dark:bg-slate-950 text-[10px] font-black uppercase tracking-wider text-slate-400 border-b border-slate-200/50 dark:border-slate-800/50">
                      <th className="py-4 px-6">Batch Details</th>
                      <th className="py-4 px-4 text-center">QC Status</th>
                      <th className="py-4 px-4 text-right">Yield Qty</th>
                      <th className="py-4 px-4 text-right">Packaged Qty</th>
                      <th className="py-4 px-6 text-center">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800/50 text-xs font-semibold text-slate-750 dark:text-slate-250">
                    {filteredBatches.map((batch) => {
                      const isApproved = batch.qcStatus === "APPROVED";
                      
                      return (
                        <tr key={batch.id} className="hover:bg-slate-50/50 dark:hover:bg-white/[0.01] transition-all">
                          <td className="py-4 px-6">
                            <div className="font-bold text-slate-900 dark:text-white">{batch.product?.name}</div>
                            <div className="flex gap-2 text-[9px] font-mono text-slate-450 mt-1 uppercase">
                              <span>Code: {batch.batchCode}</span>
                              <span>•</span>
                              <span>Exp: {batch.expiryDate ? format(new Date(batch.expiryDate), 'dd/MM/yyyy') : 'N/A'}</span>
                            </div>
                          </td>
                          <td className="py-4 px-4 text-center">
                            {isApproved ? (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-500/20">
                                Pass
                              </span>
                            ) : batch.qcStatus === "REJECTED" ? (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-rose-50 dark:bg-rose-500/10 text-rose-600 dark:text-rose-450 border border-rose-100 dark:border-rose-550/20">
                                Fail
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-100 dark:border-amber-500/20">
                                Hold (QC)
                              </span>
                            )}
                          </td>
                          <td className="py-4 px-4 text-right font-bold text-slate-700 dark:text-slate-350">
                            {batch.quantity} <span className="text-[9px] text-slate-400 uppercase">{batch.product?.unit}</span>
                          </td>
                          <td className="py-4 px-4 text-right font-bold text-slate-700 dark:text-slate-350">
                            {batch.packagedQty || 0} <span className="text-[9px] text-slate-400 uppercase">{batch.product?.unit}</span>
                          </td>
                          <td className="py-4 px-6 text-center">
                            <button
                              disabled={!isApproved}
                              onClick={() => setSelectedBatch(batch)}
                              className="px-4 py-2 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-lg text-[10px] font-black uppercase tracking-wider hover:bg-slate-800 disabled:opacity-30 disabled:scale-100 transition-all active:scale-[0.97]"
                            >
                              Package
                            </button>
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

        {/* Right 1 Column: Conversion form panel */}
        <div className="lg:col-span-1">
          {selectedBatch ? (
            <div className="bg-white dark:bg-slate-900/50 border border-slate-100 dark:border-slate-850 rounded-3xl p-6 space-y-6 shadow-sm animate-in slide-in-from-right duration-350">
              <div className="flex justify-between items-start border-b border-slate-100 dark:border-slate-800 pb-4">
                <div>
                  <span className="text-[9px] font-black uppercase tracking-widest text-[#F97316]">Retail Conversion</span>
                  <h3 className="text-md font-black text-slate-900 dark:text-white uppercase tracking-tight mt-0.5">
                    {selectedBatch.product?.name}
                  </h3>
                </div>
                <button 
                  onClick={() => setSelectedBatch(null)}
                  className="text-xs font-black text-slate-400 hover:text-slate-600 uppercase tracking-widest"
                >
                  Close
                </button>
              </div>

              <div className="space-y-4">
                <div className="flex justify-between text-xs font-semibold">
                  <span className="text-slate-400 uppercase">Available approved bulk:</span>
                  <span className="text-slate-900 dark:text-white font-bold">{selectedBatch.quantity - (selectedBatch.packagedQty || 0)} {selectedBatch.product?.unit}</span>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">Target Pack Size</label>
                  <select 
                    value={packetSize}
                    onChange={(e) => setPacketSize(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white rounded-xl px-4 py-3 text-xs font-bold uppercase tracking-wider focus:outline-none"
                  >
                    <option value="250g">250 G Packet</option>
                    <option value="500g">500 G Packet</option>
                    <option value="1kg">1.0 KG Packet</option>
                    <option value="200ml">200 ML Bottle</option>
                    <option value="500ml">500 ML Bottle</option>
                    <option value="1l">1.0 L Bottle</option>
                    <option value="1unit">1 Unit Box</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">Quantity of Packets</label>
                  <input 
                    type="number"
                    min="1"
                    value={quantityPackets || ""}
                    onChange={(e) => setQuantityPackets(Math.max(1, Number(e.target.value)))}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white rounded-xl px-4 py-3 text-xs font-bold focus:outline-none"
                  />
                </div>

                {/* Simulated conversions */}
                <div className="bg-slate-50 dark:bg-slate-950 p-4 rounded-2xl border border-slate-100 dark:border-slate-850 space-y-3">
                  <div className="flex justify-between items-center text-[10px] font-black uppercase text-slate-450 border-b border-slate-200/40 pb-2">
                    <span>Audit Simulation</span>
                    <Scale size={14} className="text-[#F97316]" />
                  </div>
                  
                  <div className="space-y-2 text-xs font-semibold">
                    <div className="flex justify-between">
                      <span className="text-slate-450 uppercase">Total Bulk Stock Deduct:</span>
                      <span className="text-rose-500 font-bold">-{totalWeightNeeded.toFixed(2)} {selectedBatch.product?.unit}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-450 uppercase">Total Retail Stock Added:</span>
                      <span className="text-emerald-500 font-black">+{quantityPackets} packets</span>
                    </div>
                  </div>
                </div>

                <button
                  onClick={handlePackageRun}
                  disabled={submitting || totalWeightNeeded > (selectedBatch.quantity - (selectedBatch.packagedQty || 0))}
                  className="w-full py-4 bg-[#F97316] text-white rounded-xl font-black text-xs uppercase tracking-wider shadow-lg hover:shadow-xl hover:translate-y-[-1px] transition-all disabled:opacity-40 disabled:scale-100 disabled:translate-y-0 flex items-center justify-center gap-2"
                >
                  {submitting ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Play size={12} fill="currentColor" />}
                  Package & Generate Labels
                </button>

                {totalWeightNeeded > (selectedBatch.quantity - (selectedBatch.packagedQty || 0)) && (
                  <div className="flex gap-2 text-[10px] text-rose-500 font-bold uppercase p-2 border border-rose-500/10 bg-rose-500/5 rounded-xl">
                    <AlertTriangle size={14} className="shrink-0" />
                    <span>Insufficient bulk stock to fulfill this quantity of packs.</span>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="hidden lg:flex flex-col items-center justify-center py-24 border border-dashed border-slate-200 dark:border-slate-800 rounded-3xl text-center p-6">
              <Box size={32} className="text-slate-300 dark:text-slate-700 mb-3" />
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Select a batch to configure conversions</p>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}

// Simple local fallback for warning icon
function AlertTriangle(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" />
      <line x1="12" y1="9" x2="12" y2="13" />
      <line x1="12" y1="17" x2="12.01" y2="17" />
    </svg>
  );
}
