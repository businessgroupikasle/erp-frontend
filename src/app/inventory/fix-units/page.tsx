"use client";

import { useState, useEffect } from "react";
import { inventoryApi, rawMaterialsApi } from "@/lib/api";
import { CheckCircle2, AlertTriangle, RefreshCw } from "lucide-react";

export default function FixUnitsPage() {
  const [status, setStatus] = useState<"idle" | "running" | "done" | "error">("idle");
  const [logs, setLogs] = useState<string[]>([]);

  const runFix = async () => {
    setStatus("running");
    setLogs(["Starting unit cleanup..."]);
    try {
      const res = await rawMaterialsApi.getAll(true);
      const items = res.data || [];
      
      const toFix = items.filter((i: any) => 
        i.category === "FINISHED_GOOD" && (i.unit === "g" || i.unit === "kg")
      );

      setLogs(prev => [...prev, `Found ${toFix.length} items to fix.`]);

      for (const item of toFix) {
        setLogs(prev => [...prev, `Fixing ${item.name} (${item.sku})...`]);
        await rawMaterialsApi.update(item.id, { unit: "pkt" });
      }

      setLogs(prev => [...prev, "Unit cleanup complete!"]);
      setStatus("done");
    } catch (e: any) {
      console.error(e);
      setLogs(prev => [...prev, `ERROR: ${e.message}`]);
      setStatus("error");
    }
  };

  return (
    <div className="max-w-2xl mx-auto py-20 px-6">
      <div className="bg-white dark:bg-card rounded-[3rem] p-10 border border-slate-100 dark:border-white/5 shadow-2xl text-center">
        <h1 className="text-3xl font-black mb-4">Inventory Data Cleanup</h1>
        <p className="text-slate-500 mb-8 font-medium">
          This will automatically change units from <span className="font-bold text-red-500">Grams/Kgs</span> to <span className="font-bold text-emerald-500">Packets</span> for all Finished Goods.
        </p>

        {status === "idle" && (
          <button 
            onClick={runFix}
            className="px-10 py-4 bg-orange-500 text-white rounded-2xl font-black uppercase tracking-widest hover:scale-105 transition-all shadow-xl shadow-orange-500/20"
          >
            Run Cleanup Now
          </button>
        )}

        {(status === "running" || status === "done" || status === "error") && (
          <div className="mt-8 space-y-4">
             <div className="flex justify-center mb-6">
                {status === "running" && <RefreshCw className="animate-spin text-orange-500" size={48} />}
                {status === "done" && <CheckCircle2 className="text-emerald-500" size={48} />}
                {status === "error" && <AlertTriangle className="text-red-500" size={48} />}
             </div>
             
             <div className="bg-slate-50 dark:bg-black/20 rounded-2xl p-6 text-left font-mono text-[10px] space-y-1 max-h-60 overflow-y-auto">
                {logs.map((log, i) => <div key={i}>{log}</div>)}
             </div>
          </div>
        )}
      </div>
    </div>
  );
}
