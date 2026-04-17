"use client";

import { useState } from "react";
import {
  Factory,
  Plus,
  ChefHat,
  Package,
  ArrowRight,
  CheckCircle2,
  Clock,
  Flame,
  X,
  Save,
  TrendingUp,
  Layers,
} from "lucide-react";
import { clsx } from "clsx";

interface ProductionBatch {
  id: string;
  batchNo: string;
  item: string;
  emoji: string;
  stage: "raw" | "semi" | "finished";
  qty: number;
  unit: string;
  startedAt: string;
  finishedAt?: string;
  status: "in-progress" | "completed" | "paused";
  yield: number;
}

const INITIAL_BATCHES: ProductionBatch[] = [
  { id: "1", batchNo: "BATCH-001", item: "Chicken Biryani",     emoji: "🍛", stage: "finished", qty: 40,  unit: "plates", startedAt: "08:00 AM", finishedAt: "10:30 AM", status: "completed", yield: 95 },
  { id: "2", batchNo: "BATCH-002", item: "Biryani Gravy (Base)",emoji: "🍲", stage: "semi",     qty: 15,  unit: "kg",     startedAt: "09:00 AM",                         status: "in-progress", yield: 0 },
  { id: "3", batchNo: "BATCH-003", item: "Paneer Tikka",        emoji: "🧀", stage: "semi",     qty: 8,   unit: "kg",     startedAt: "09:30 AM",                         status: "paused",      yield: 0 },
  { id: "4", batchNo: "BATCH-004", item: "Masala Dosa",         emoji: "🥘", stage: "finished", qty: 60,  unit: "plates", startedAt: "07:00 AM", finishedAt: "09:00 AM", status: "completed", yield: 98 },
  { id: "5", batchNo: "BATCH-005", item: "Sambar",              emoji: "🥣", stage: "semi",     qty: 20,  unit: "litres", startedAt: "07:30 AM",                         status: "in-progress", yield: 0 },
];

const STAGE_FLOW = [
  { key: "raw",      label: "Raw Ingredients",  icon: Package,      color: "text-gray-500",   bg: "bg-gray-100 dark:bg-gray-800" },
  { key: "semi",     label: "Semi-Finished",    icon: Flame,        color: "text-amber-500",  bg: "bg-amber-50 dark:bg-amber-900/20" },
  { key: "finished", label: "Finished Product", icon: CheckCircle2, color: "text-emerald-500", bg: "bg-emerald-50 dark:bg-emerald-900/20" },
];

const STATUS_STYLES: Record<string, string> = {
  "in-progress": "bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400",
  "completed":   "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400",
  "paused":      "bg-amber-100 text-amber-700 dark:bg-amber-900/20 dark:text-amber-400",
};

export default function ProductionPage() {
  const [batches, setBatches] = useState<ProductionBatch[]>(INITIAL_BATCHES);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ item: "", qty: 0, unit: "kg", stage: "raw" as const });

  const stats = {
    inProgress: batches.filter((b) => b.status === "in-progress").length,
    completed:  batches.filter((b) => b.status === "completed").length,
    paused:     batches.filter((b) => b.status === "paused").length,
    avgYield:   Math.round(batches.filter((b) => b.yield > 0).reduce((s, b) => s + b.yield, 0) / Math.max(1, batches.filter((b) => b.yield > 0).length)),
  };

  const advanceStage = (id: string) => {
    setBatches((prev) => prev.map((b) => {
      if (b.id !== id) return b;
      const next = b.stage === "raw" ? "semi" : "finished";
      const isFinished = next === "finished";
      return { ...b, stage: next, status: isFinished ? "completed" : "in-progress", finishedAt: isFinished ? new Date().toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" }) : undefined, yield: isFinished ? 95 : 0 };
    }));
  };

  const pauseResume = (id: string) => {
    setBatches((prev) => prev.map((b) => b.id === id ? { ...b, status: b.status === "paused" ? "in-progress" : "paused" } : b));
  };

  const addBatch = () => {
    const newBatch: ProductionBatch = {
      id: Date.now().toString(),
      batchNo: `BATCH-${String(batches.length + 1).padStart(3, "0")}`,
      item: form.item,
      emoji: "🍳",
      stage: form.stage,
      qty: form.qty,
      unit: form.unit,
      startedAt: new Date().toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" }),
      status: "in-progress",
      yield: 0,
    };
    setBatches((prev) => [...prev, newBatch]);
    setShowModal(false);
    setForm({ item: "", qty: 0, unit: "kg", stage: "raw" });
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-gray-900 dark:text-white flex items-center gap-2">
            <Factory size={24} className="text-orange-500" />
            Production Management
          </h1>
          <p className="text-sm text-gray-500 dark:text-slate-400 mt-1">Track kitchen batches · Raw → Semi → Finished · Monitor yield</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 bg-orange-500 hover:bg-orange-400 text-white rounded-xl px-5 py-2.5 font-bold text-sm shadow-md shadow-orange-200 dark:shadow-orange-900/30 transition-all active:scale-95"
        >
          <Plus size={16} />
          New Batch
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "In Progress", value: stats.inProgress, color: "text-blue-500",    bg: "bg-blue-50 dark:bg-blue-900/10",    icon: Clock },
          { label: "Completed",   value: stats.completed,  color: "text-emerald-500", bg: "bg-emerald-50 dark:bg-emerald-900/10", icon: CheckCircle2 },
          { label: "Paused",      value: stats.paused,     color: "text-amber-500",   bg: "bg-amber-50 dark:bg-amber-900/10",  icon: Factory },
          { label: "Avg Yield",   value: `${stats.avgYield}%`, color: "text-orange-500", bg: "bg-orange-50 dark:bg-orange-900/10", icon: TrendingUp },
        ].map((s) => (
          <div key={s.label} className={clsx("rounded-2xl border border-gray-100 dark:border-white/5 p-4 flex items-center gap-3", s.bg)}>
            <div className={clsx("w-10 h-10 rounded-xl bg-white dark:bg-card flex items-center justify-center shadow-sm")}>
              <s.icon size={18} className={s.color} />
            </div>
            <div>
              <p className={clsx("text-xl font-black", s.color)}>{s.value}</p>
              <p className="text-[11px] text-gray-500 dark:text-slate-400 font-semibold">{s.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Production Flow Diagram */}
      <div className="bg-white dark:bg-card rounded-2xl border border-gray-100 dark:border-white/5 p-5">
        <p className="text-[11px] font-black uppercase tracking-widest text-gray-400 mb-4">Production Flow</p>
        <div className="flex items-center gap-2">
          {STAGE_FLOW.map((stage, i) => (
            <div key={stage.key} className="flex items-center gap-2 flex-1">
              <div className={clsx("flex-1 flex flex-col items-center gap-2 p-4 rounded-2xl border border-gray-100 dark:border-white/5", stage.bg)}>
                <stage.icon size={20} className={stage.color} />
                <p className={clsx("text-[11px] font-black", stage.color)}>{stage.label}</p>
                <p className="text-[10px] text-gray-400">
                  {batches.filter((b) => b.stage === stage.key).length} batches
                </p>
              </div>
              {i < STAGE_FLOW.length - 1 && <ArrowRight size={16} className="text-gray-300 dark:text-slate-600 shrink-0" />}
            </div>
          ))}
        </div>
      </div>

      {/* Batch List */}
      <div className="bg-white dark:bg-card rounded-2xl border border-gray-100 dark:border-white/5 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-50 dark:border-white/5 flex items-center gap-2">
          <Layers size={16} className="text-orange-500" />
          <h2 className="text-sm font-bold text-gray-900 dark:text-white">Today's Batches</h2>
        </div>
        <div className="divide-y divide-gray-50 dark:divide-white/5">
          {batches.map((batch) => (
            <div key={batch.id} className="flex items-center gap-4 px-6 py-4 hover:bg-orange-50/20 dark:hover:bg-white/5 transition-colors">
              <span className="text-2xl shrink-0">{batch.emoji}</span>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-[13px] font-bold text-gray-900 dark:text-white">{batch.item}</span>
                  <span className="text-[10px] text-gray-400 font-mono">{batch.batchNo}</span>
                </div>
                <div className="flex items-center gap-3 mt-1 text-[11px] text-gray-400 flex-wrap">
                  <span className="font-semibold">{batch.qty} {batch.unit}</span>
                  <span>·</span>
                  <span>Started {batch.startedAt}</span>
                  {batch.finishedAt && <><span>·</span><span>Done {batch.finishedAt}</span></>}
                  {batch.yield > 0 && <><span>·</span><span className="text-emerald-500 font-bold">{batch.yield}% yield</span></>}
                </div>
              </div>

              {/* Stage pill */}
              <div className={clsx("px-3 py-1 rounded-xl text-[10px] font-bold uppercase tracking-wider",
                batch.stage === "finished" ? "bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-400" :
                batch.stage === "semi"     ? "bg-amber-50 text-amber-600 dark:bg-amber-900/20 dark:text-amber-400" :
                "bg-gray-100 text-gray-600 dark:bg-white/10 dark:text-slate-400"
              )}>
                {batch.stage === "raw" ? "Raw" : batch.stage === "semi" ? "Semi-Finished" : "Finished"}
              </div>

              <span className={clsx("px-3 py-1 rounded-xl text-[10px] font-bold uppercase tracking-wider", STATUS_STYLES[batch.status])}>
                {batch.status.replace("-", " ")}
              </span>

              {/* Actions */}
              <div className="flex items-center gap-2 shrink-0">
                {batch.status !== "completed" && batch.stage !== "finished" && (
                  <button
                    onClick={() => advanceStage(batch.id)}
                    className="px-3 py-1.5 bg-orange-500 hover:bg-orange-400 text-white rounded-xl text-[11px] font-bold transition-all active:scale-95"
                  >
                    Advance →
                  </button>
                )}
                {batch.status === "in-progress" && (
                  <button
                    onClick={() => pauseResume(batch.id)}
                    className="px-3 py-1.5 border border-amber-300 dark:border-amber-700 text-amber-600 dark:text-amber-400 rounded-xl text-[11px] font-bold hover:bg-amber-50 transition-all"
                  >
                    Pause
                  </button>
                )}
                {batch.status === "paused" && (
                  <button
                    onClick={() => pauseResume(batch.id)}
                    className="px-3 py-1.5 border border-blue-300 dark:border-blue-700 text-blue-600 dark:text-blue-400 rounded-xl text-[11px] font-bold hover:bg-blue-50 transition-all"
                  >
                    Resume
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* New Batch Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-[#0f1117] rounded-3xl w-full max-w-md shadow-2xl border border-orange-100 dark:border-white/10">
            <div className="flex items-center justify-between px-6 py-5 border-b border-orange-50 dark:border-white/5">
              <h2 className="text-base font-black text-gray-900 dark:text-white">Create Production Batch</h2>
              <button onClick={() => setShowModal(false)} className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-white/5 text-gray-400 transition-all">
                <X size={18} />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1.5 block">Item / Dish Name *</label>
                <input
                  type="text"
                  placeholder="e.g. Chicken Biryani"
                  value={form.item}
                  onChange={(e) => setForm({ ...form, item: e.target.value })}
                  className="w-full px-4 py-2.5 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl text-sm outline-none focus:border-orange-300"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1.5 block">Quantity</label>
                  <input
                    type="number"
                    min={1}
                    value={form.qty}
                    onChange={(e) => setForm({ ...form, qty: Number(e.target.value) })}
                    className="w-full px-4 py-2.5 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl text-sm outline-none focus:border-orange-300"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1.5 block">Unit</label>
                  <select
                    value={form.unit}
                    onChange={(e) => setForm({ ...form, unit: e.target.value })}
                    className="w-full px-4 py-2.5 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl text-sm outline-none focus:border-orange-300"
                  >
                    {["plates", "kg", "litres", "pcs", "batches"].map((u) => <option key={u}>{u}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1.5 block">Starting Stage</label>
                <div className="flex gap-2">
                  {(["raw", "semi"] as const).map((s) => (
                    <button
                      key={s}
                      onClick={() => setForm({ ...form, stage: s })}
                      className={clsx("flex-1 py-2.5 rounded-xl text-[11px] font-bold border-2 transition-all",
                        form.stage === s ? "border-orange-400 bg-orange-50 text-orange-600" : "border-gray-200 dark:border-white/10 text-gray-400"
                      )}
                    >
                      {s === "raw" ? "Raw → Cooking" : "Semi-Finished"}
                    </button>
                  ))}
                </div>
              </div>
              <div className="flex gap-3 pt-2">
                <button onClick={() => setShowModal(false)} className="flex-1 py-3 border border-gray-200 dark:border-white/10 rounded-xl text-sm font-bold text-gray-500 hover:bg-gray-50 dark:hover:bg-white/5 transition-all">Cancel</button>
                <button onClick={addBatch} className="flex-[2] py-3 bg-orange-500 hover:bg-orange-400 text-white rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-all active:scale-95">
                  <Save size={15} /> Start Batch
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
