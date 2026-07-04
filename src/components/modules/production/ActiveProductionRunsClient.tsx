"use client";

import { useState, useEffect } from "react";
import { PlayCircle, StopCircle, CheckCircle2, ChevronRight, PackageCheck, AlertTriangle } from "lucide-react";
import { productionApi } from "@/lib/api";
import { formatERPNumber } from "@/lib/utils";
import { toast } from "react-hot-toast";
import { Modal } from "@/components/ui/Modal";
import clsx from "clsx";

export default function ActiveProductionRunsClient() {
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showApprovalModal, setShowApprovalModal] = useState(false);
  const [batchToApprove, setBatchToApprove] = useState<any | null>(null);
  const [actualYield, setActualYield] = useState<number>(0);

  const fetchHistory = async () => {
    try {
      const res = await productionApi.getHistory();
      setHistory(res.data || []);
    } catch (e) {
      console.error(e);
      toast.error("Failed to load production history");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  const handleStop = async (id: string) => {
    try {
      await productionApi.stopBatch(id);
      toast.success("Production batch stopped. Ready for QC / Approval.");
      fetchHistory();
    } catch (err: any) {
      toast.error(err?.response?.data?.error || "Failed to stop production");
    }
  };

  const handleApproveClick = (production: any) => {
    setBatchToApprove(production);
    setActualYield(production.quantity * (production.recipe?.yieldQty || 1));
    setShowApprovalModal(true);
  };

  const handleFinalApprove = async () => {
    if (!batchToApprove) return;
    try {
      await productionApi.approveBatch(batchToApprove.id, { actualYield });
      toast.success("Production Approved & Added to Batch Registry");
      setShowApprovalModal(false);
      setBatchToApprove(null);
      fetchHistory();
    } catch (err: any) {
      toast.error(err?.response?.data?.error || "Failed to approve production");
    }
  };

  if (loading) {
    return (
      <div className="py-20 flex flex-col items-center gap-4">
        <div className="w-8 h-8 border-4 border-[#F97316] border-t-transparent rounded-full animate-spin" />
        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Loading Active Runs...</p>
      </div>
    );
  }

  const activeRuns = history.filter(h => h.status === 'IN_PROGRESS' || h.status === 'STOPPED');
  const pastRuns = history.filter(h => h.status === 'COMPLETED' || h.status === 'CANCELLED');

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {activeRuns.length === 0 ? (
          <div className="col-span-full py-16 text-center border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-3xl">
            <PackageCheck size={32} className="mx-auto text-slate-300 dark:text-slate-700 mb-3" />
            <h3 className="text-sm font-black uppercase tracking-widest text-slate-500">No Active Runs</h3>
            <p className="text-xs text-slate-400 mt-1">Start a production run from the planning page.</p>
          </div>
        ) : (
          activeRuns.map((run) => (
            <div key={run.id} className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-5 rounded-3xl shadow-sm flex flex-col gap-4">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-tight">
                    {run.recipe?.name || "Unknown Recipe"}
                  </h3>
                  <p className="text-[10px] font-bold text-slate-500 uppercase mt-0.5">
                    Batch: {formatERPNumber("PRD", run.id, run.producedAt)}
                  </p>
                </div>
                <span className={clsx("px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-wider",
                  run.status === 'IN_PROGRESS' ? 'bg-blue-50 text-blue-600' : 'bg-amber-50 text-amber-600'
                )}>
                  {run.status.replace("_", " ")}
                </span>
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 bg-slate-50 dark:bg-slate-950 p-4 rounded-2xl">
                <div>
                  <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest">Started By</p>
                  <p className="text-xs font-black text-slate-900 dark:text-white">Admin</p>
                </div>
                <div>
                  <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest">Start Time</p>
                  <p className="text-xs font-black text-slate-900 dark:text-white">
                    {new Date(run.producedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
                <div>
                  <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest">Expected Finish</p>
                  <p className="text-xs font-black text-slate-900 dark:text-white">
                    {new Date(new Date(run.producedAt).getTime() + 2 * 60 * 60 * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
                <div>
                  <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest">Elapsed Time</p>
                  <p className="text-xs font-black text-slate-900 dark:text-white">1h 15m</p>
                </div>
                <div>
                  <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest">Current Stage</p>
                  <p className="text-xs font-black text-indigo-600 dark:text-indigo-400">Mixing</p>
                </div>
                <div>
                  <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest">Completed %</p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <div className="flex-1 h-1.5 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                      <div className="h-full bg-indigo-500 w-[45%]" />
                    </div>
                    <span className="text-[10px] font-black text-slate-700 dark:text-slate-300">45%</span>
                  </div>
                </div>
              </div>

              <div className="pt-2 flex gap-2 mt-auto">
                {run.status === 'IN_PROGRESS' && (
                  <>
                    <button
                      onClick={() => handleStop(run.id)}
                      className="flex-1 py-3 bg-amber-50 hover:bg-amber-100 text-amber-600 rounded-xl font-black text-[10px] uppercase tracking-widest transition-colors flex items-center justify-center gap-2"
                    >
                      <StopCircle size={14} /> Pause
                    </button>
                    <button
                      onClick={() => handleApproveClick(run)}
                      className="flex-1 py-3 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl font-black text-[10px] uppercase tracking-widest transition-colors shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2"
                    >
                      <CheckCircle2 size={14} /> Complete
                    </button>
                    <button
                      onClick={() => handleStop(run.id)}
                      className="flex-1 py-3 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-xl font-black text-[10px] uppercase tracking-widest transition-colors flex items-center justify-center gap-2"
                    >
                      Cancel
                    </button>
                  </>
                )}
                {run.status === 'STOPPED' && (
                  <>
                    <button
                      onClick={() => {}}
                      className="flex-1 py-3 bg-indigo-50 hover:bg-indigo-100 text-indigo-600 rounded-xl font-black text-[10px] uppercase tracking-widest transition-colors flex items-center justify-center gap-2"
                    >
                      <PlayCircle size={14} /> Resume
                    </button>
                    <button
                      onClick={() => handleApproveClick(run)}
                      className="flex-1 py-3 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl font-black text-[10px] uppercase tracking-widest transition-colors shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2"
                    >
                      <CheckCircle2 size={14} /> Complete
                    </button>
                  </>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {pastRuns.length > 0 && (
        <div className="pt-8 border-t border-slate-100 dark:border-slate-800">
          <h3 className="text-xs font-black uppercase tracking-widest text-slate-800 dark:text-slate-200 mb-4 flex items-center gap-2">
            Recent Completed Runs
          </h3>
          <div className="space-y-3">
            {pastRuns.slice(0, 10).map((run) => (
              <div key={run.id} className="flex items-center justify-between p-4 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-slate-50 dark:bg-slate-950 flex items-center justify-center">
                    <CheckCircle2 size={18} className="text-emerald-500" />
                  </div>
                  <div>
                    <p className="text-xs font-black text-slate-900 dark:text-white uppercase">{run.recipe?.name}</p>
                    <p className="text-[10px] font-bold text-slate-400 mt-0.5">{new Date(run.producedAt).toLocaleDateString()}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xs font-black text-slate-900 dark:text-white">
                    {run.actualYield?.toFixed(2) || (run.quantity * (run.recipe?.yieldQty || 1)).toFixed(2)} {run.recipe?.yieldUnit}
                  </p>
                  <p className="text-[9px] font-black text-emerald-500 uppercase tracking-widest mt-0.5">Yield Logged</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Approval Modal */}
      <Modal isOpen={showApprovalModal} onClose={() => setShowApprovalModal(false)} title="Finalize Production Yield">
        <div className="space-y-6">
          <div className="p-4 bg-blue-50 dark:bg-blue-500/10 rounded-2xl flex items-start gap-3">
            <AlertTriangle size={16} className="text-blue-500 shrink-0 mt-0.5" />
            <div>
              <p className="text-xs font-bold text-blue-900 dark:text-blue-100">Log Actual Yield</p>
              <p className="text-[10px] text-blue-700 dark:text-blue-300 mt-1">
                Enter the actual output obtained from this run. The expected theoretical yield is {(batchToApprove?.quantity * (batchToApprove?.recipe?.yieldQty || 1)).toFixed(2)} {batchToApprove?.recipe?.yieldUnit}.
              </p>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Actual Yield ({batchToApprove?.recipe?.yieldUnit})</label>
            <input 
              type="number"
              step="0.01"
              value={actualYield || ""}
              onChange={(e) => setActualYield(Number(e.target.value))}
              className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-3 text-lg font-black focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
            />
          </div>

          <div className="flex gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
            <button
              onClick={() => setShowApprovalModal(false)}
              className="flex-1 py-4 rounded-xl font-black text-[10px] uppercase tracking-widest text-slate-400 hover:text-slate-600 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleFinalApprove}
              className="flex-[2] py-4 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl font-black text-[10px] uppercase tracking-widest shadow-lg shadow-emerald-500/20 transition-all flex items-center justify-center gap-2"
            >
              Submit & Add to Registry <ChevronRight size={14} />
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
