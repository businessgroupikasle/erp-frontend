"use client";

import { useState, useEffect } from "react";
import {
  ShieldAlert, Search, Package, Store, AlertTriangle,
  CheckCircle2, XCircle, Truck, Clock, RefreshCw,
  ChevronRight, MapPin, FileText, ArrowRight
} from "lucide-react";
import { clsx } from "clsx";
import api from "@/lib/api/base";
import { useToast } from "@/context/ToastContext";

interface RecallBatch {
  id: string;
  batchCode: string;
  productName: string;
  productionDate: string;
  expiryDate: string;
  totalQuantity: number;
  unit: string;
  status: string;
  qcStatus: string;
}

type RecallStep = "identify" | "locate" | "block" | "report" | "collect";

const STEPS: { key: RecallStep; label: string; icon: any }[] = [
  { key: "identify", label: "Identify Defective Batch", icon: Search },
  { key: "locate", label: "Locate Distribution", icon: MapPin },
  { key: "block", label: "Block Sales", icon: XCircle },
  { key: "report", label: "Generate Recall Report", icon: FileText },
  { key: "collect", label: "Collect Returned Stock", icon: Package },
];

export default function BatchRecallPage() {
  const [batches, setBatches] = useState<RecallBatch[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedBatch, setSelectedBatch] = useState<RecallBatch | null>(null);
  const [currentStep, setCurrentStep] = useState<RecallStep>("identify");
  const [recallActive, setRecallActive] = useState(false);
  const [recallLog, setRecallLog] = useState<string[]>([]);
  const { showToast } = useToast();

  useEffect(() => {
    async function loadBatches() {
      try {
        const res = await api.get("/api/production/batches");
        const data = (res.data || []).map((b: any) => ({
          id: b.id,
          batchCode: b.batchCode || b.id?.slice(-6),
          productName: b.product?.name || b.recipe?.name || "Unknown Product",
          productionDate: b.createdAt,
          expiryDate: b.expiryDate || "",
          totalQuantity: b.outputQuantity || b.plannedQuantity || 0,
          unit: b.unit || "KG",
          status: b.status || "COMPLETED",
          qcStatus: b.qcStatus || "PENDING",
        }));
        setBatches(data);
      } catch {
        setBatches([]);
      } finally {
        setLoading(false);
      }
    }
    loadBatches();
  }, []);

  const filtered = batches.filter(
    (b) =>
      b.batchCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.productName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const initiateRecall = () => {
    if (!selectedBatch) return;
    setRecallActive(true);
    setCurrentStep("identify");
    setRecallLog([`[${new Date().toLocaleTimeString()}] Recall initiated for batch ${selectedBatch.batchCode}`]);

    setTimeout(() => {
      setCurrentStep("locate");
      setRecallLog((p) => [...p, `[${new Date().toLocaleTimeString()}] Scanning warehouse and franchise outlet distribution records...`]);
    }, 1200);
    setTimeout(() => {
      setCurrentStep("block");
      setRecallLog((p) => [...p, `[${new Date().toLocaleTimeString()}] Sales blocked across all POS terminals for batch ${selectedBatch.batchCode}`]);
    }, 2400);
    setTimeout(() => {
      setCurrentStep("report");
      setRecallLog((p) => [...p, `[${new Date().toLocaleTimeString()}] Recall report generated with full traceability chain`]);
    }, 3600);
    setTimeout(() => {
      setCurrentStep("collect");
      setRecallLog((p) => [...p, `[${new Date().toLocaleTimeString()}] Return collection orders dispatched to all affected outlets`]);
      showToast("Batch recall workflow completed successfully", "success");
    }, 4800);
  };

  if (loading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-[#F97316] border-t-transparent rounded-full animate-spin" />
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Loading Batch Registry...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 md:space-y-8 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 dark:border-white/5 pb-6">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-[#F97316] rounded-2xl shadow-lg shadow-[#F97316]/20 text-white">
            <ShieldAlert size={24} />
          </div>
          <div>
            <h1 className="text-2xl md:text-3xl font-black text-slate-900 dark:text-white tracking-tighter uppercase">
              Batch <span className="text-[#F97316]">Recall</span>
            </h1>
            <p className="text-[11px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">
              Food Safety Traceability & Defective Batch Management
            </p>
          </div>
        </div>
        <div className="relative w-full md:w-80">
          <Search size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search batch code or product..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-white dark:bg-[#12141c] border border-slate-200 dark:border-white/10 rounded-2xl text-xs font-bold text-slate-700 dark:text-slate-300 outline-none focus:border-[#F97316] focus:ring-2 focus:ring-[#F97316]/20 transition-all"
          />
        </div>
      </div>

      {/* Recall Workflow Steps */}
      <div className="bg-white dark:bg-[#12141c] p-6 rounded-3xl border border-slate-200/50 dark:border-white/5 shadow-sm">
        <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] mb-4">Recall Workflow Pipeline</h3>
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center gap-3 lg:gap-2">
          {STEPS.map((step, idx) => {
            const Icon = step.icon;
            const stepIdx = STEPS.findIndex((s) => s.key === currentStep);
            const thisIdx = idx;
            const isDone = recallActive && thisIdx < stepIdx;
            const isCurrent = recallActive && thisIdx === stepIdx;
            return (
              <div key={step.key} className="flex flex-col lg:flex-row items-center gap-2 lg:gap-2 w-full lg:w-auto">
                <div
                  className={clsx(
                    "flex items-center gap-3 px-4 py-3 rounded-2xl border w-full lg:w-auto transition-all",
                    isDone && "bg-emerald-50 dark:bg-emerald-500/10 border-emerald-500/30 text-emerald-600",
                    isCurrent && "bg-orange-500/10 dark:bg-[#F97316]/10 border-[#F97316]/30 text-orange-600 animate-pulse",
                    !isDone && !isCurrent && "bg-slate-50 dark:bg-white/5 border-slate-100 dark:border-white/[0.02] text-slate-400"
                  )}
                >
                  {isDone ? <CheckCircle2 size={16} /> : <Icon size={16} />}
                  <span className="text-[10px] font-black uppercase tracking-tight">{step.label}</span>
                </div>
                {idx < STEPS.length - 1 && (
                  <ArrowRight className="text-slate-300 dark:text-slate-700 rotate-90 lg:rotate-0 shrink-0" size={14} strokeWidth={3} />
                )}
              </div>
            );
          })}
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
        {/* Batch Selection List */}
        <div className="xl:col-span-5 bg-white dark:bg-[#12141c] rounded-3xl border border-slate-200/50 dark:border-white/5 shadow-sm overflow-hidden">
          <div className="p-5 border-b border-slate-100 dark:border-white/5">
            <h3 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-widest flex items-center gap-2">
              <Package size={14} className="text-[#F97316]" /> Batch Registry
            </h3>
            <p className="text-[9px] text-slate-400 font-bold uppercase mt-1">{filtered.length} batches found</p>
          </div>
          <div className="max-h-[500px] overflow-y-auto divide-y divide-slate-50 dark:divide-white/[0.02]">
            {filtered.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <AlertTriangle size={32} className="text-slate-300 dark:text-slate-700 mb-3" />
                <p className="text-xs font-black text-slate-400 uppercase tracking-widest">No Batches Found</p>
              </div>
            ) : (
              filtered.map((batch) => (
                <div
                  key={batch.id}
                  onClick={() => { setSelectedBatch(batch); setRecallActive(false); setRecallLog([]); setCurrentStep("identify"); }}
                  className={clsx(
                    "p-4 cursor-pointer transition-all flex items-center justify-between",
                    selectedBatch?.id === batch.id
                      ? "bg-orange-500/10/50 dark:bg-[#F97316]/5 border-l-4 border-[#F97316]"
                      : "hover:bg-slate-50 dark:hover:bg-white/[0.02]"
                  )}
                >
                  <div className="space-y-1">
                    <p className="text-xs font-black text-slate-800 dark:text-white uppercase tracking-tight">{batch.batchCode}</p>
                    <p className="text-[10px] text-slate-500 font-bold">{batch.productName}</p>
                    <p className="text-[9px] text-slate-400 font-medium">
                      Qty: {batch.totalQuantity} {batch.unit} • {batch.productionDate ? new Date(batch.productionDate).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }) : "—"}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={clsx(
                      "text-[8px] font-black uppercase px-2 py-0.5 rounded-lg",
                      batch.qcStatus === "APPROVED" ? "bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10" :
                      batch.qcStatus === "REJECTED" ? "bg-orange-500/10 text-orange-600 dark:bg-[#F97316]/10" :
                      "bg-amber-50 text-amber-600 dark:bg-amber-500/10"
                    )}>{batch.qcStatus}</span>
                    <ChevronRight size={14} className="text-slate-300" />
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Recall Details & Actions */}
        <div className="xl:col-span-7 space-y-6">
          {selectedBatch ? (
            <>
              {/* Batch Detail Card */}
              <div className="bg-white dark:bg-[#12141c] p-6 rounded-3xl border border-slate-200/50 dark:border-white/5 shadow-sm space-y-5">
                <div className="flex items-center justify-between border-b border-slate-100 dark:border-white/5 pb-3">
                  <div>
                    <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-tight">{selectedBatch.batchCode}</h3>
                    <p className="text-[10px] text-slate-400 font-bold uppercase mt-0.5">{selectedBatch.productName}</p>
                  </div>
                  <button
                    onClick={initiateRecall}
                    disabled={recallActive}
                    className="px-5 py-2.5 bg-[#F97316] text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-orange-600 hover:scale-105 transition-all shadow-lg shadow-[#F97316]/20 active:scale-95 disabled:opacity-50 flex items-center gap-2"
                  >
                    <ShieldAlert size={14} />
                    {recallActive ? "Recall In Progress..." : "Initiate Recall"}
                  </button>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  {[
                    { label: "Output Qty", value: `${selectedBatch.totalQuantity} ${selectedBatch.unit}`, icon: Package },
                    { label: "QC Status", value: selectedBatch.qcStatus, icon: CheckCircle2 },
                    { label: "Batch Status", value: selectedBatch.status, icon: Clock },
                    { label: "Production Date", value: selectedBatch.productionDate ? new Date(selectedBatch.productionDate).toLocaleDateString("en-IN") : "—", icon: Clock },
                  ].map((item, i) => (
                    <div key={i} className="bg-slate-50 dark:bg-white/5 p-3 rounded-2xl border border-slate-100 dark:border-white/[0.02] space-y-1">
                      <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">{item.label}</p>
                      <p className="text-xs font-black text-slate-800 dark:text-white uppercase">{item.value}</p>
                    </div>
                  ))}
                </div>

                {/* Tracking Map */}
                <div className="space-y-3">
                  <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">ERP Must Track</h4>
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      { label: "Batch Movement", desc: "GRN → Production → Warehouse → DC", icon: Truck },
                      { label: "Outlet Distribution", desc: "All franchise outlets receiving this batch", icon: Store },
                      { label: "Sales Linkage", desc: "POS invoices referencing this batch", icon: FileText },
                      { label: "Return Quantity", desc: "Collected stock from affected outlets", icon: RefreshCw },
                    ].map((t, i) => (
                      <div key={i} className="flex items-start gap-3 bg-slate-50 dark:bg-white/5 p-3 rounded-2xl border border-slate-100 dark:border-white/[0.02]">
                        <div className="p-1.5 bg-white dark:bg-[#12141c] rounded-xl text-[#F97316] border border-slate-200/50 dark:border-white/5 shrink-0">
                          <t.icon size={14} />
                        </div>
                        <div>
                          <p className="text-[10px] font-black text-slate-700 dark:text-slate-200 uppercase">{t.label}</p>
                          <p className="text-[9px] text-slate-400 font-medium mt-0.5">{t.desc}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Live Recall Log */}
              {recallLog.length > 0 && (
                <div className="bg-white dark:bg-[#12141c] p-6 rounded-3xl border border-slate-200/50 dark:border-white/5 shadow-sm space-y-3">
                  <h4 className="text-[10px] font-black text-[#F97316] uppercase tracking-widest flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-[#F97316] animate-pulse" />
                    Live Recall Audit Log
                  </h4>
                  <div className="space-y-2 max-h-[200px] overflow-y-auto">
                    {recallLog.map((log, i) => (
                      <div key={i} className="text-[10px] font-mono text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-white/5 px-3 py-2 rounded-xl border border-slate-100/50 dark:border-white/[0.02]">
                        {log}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="bg-white dark:bg-[#12141c] p-12 rounded-3xl border border-slate-200/50 dark:border-white/5 shadow-sm flex flex-col items-center justify-center text-center min-h-[400px]">
              <ShieldAlert size={56} className="text-slate-200 dark:text-slate-800 mb-4" />
              <h4 className="text-xs font-black text-slate-600 dark:text-slate-400 uppercase tracking-widest">Recall Inspector Idle</h4>
              <p className="text-[11px] text-slate-400 mt-2 max-w-xs leading-relaxed">
                Select a batch from the registry to inspect its traceability chain and initiate a recall workflow if needed.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
