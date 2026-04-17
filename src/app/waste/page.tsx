"use client";

import { useState } from "react";
import {
  Trash2,
  Plus,
  AlertTriangle,
  TrendingDown,
  IndianRupee,
  X,
  Save,
  BarChart3,
  Calendar,
  Filter,
} from "lucide-react";
import { clsx } from "clsx";

interface WasteEntry {
  id: string;
  date: string;
  item: string;
  emoji: string;
  qty: number;
  unit: string;
  reason: string;
  cost: number;
  recordedBy: string;
}

const REASONS = ["Spoilage / Expired", "Overcooked / Burnt", "Over-preparation", "Customer Return", "Contamination", "Storage Error", "Other"];

const INITIAL_WASTE: WasteEntry[] = [
  { id: "1", date: "2026-04-17", item: "Chicken",        emoji: "🍗", qty: 1.5,  unit: "kg",     reason: "Spoilage / Expired",   cost: 360, recordedBy: "Chef Ramesh" },
  { id: "2", date: "2026-04-17", item: "Biryani Rice",   emoji: "🍚", qty: 2,    unit: "kg",     reason: "Over-preparation",     cost: 120, recordedBy: "Chef Ramesh" },
  { id: "3", date: "2026-04-16", item: "Paneer",         emoji: "🧀", qty: 0.8,  unit: "kg",     reason: "Storage Error",        cost: 280, recordedBy: "Chef Suresh" },
  { id: "4", date: "2026-04-16", item: "Dosa Batter",    emoji: "🥘", qty: 3,    unit: "litres", reason: "Spoilage / Expired",   cost: 90,  recordedBy: "Chef Ramesh" },
  { id: "5", date: "2026-04-15", item: "Chicken Curry",  emoji: "🍛", qty: 2,    unit: "plates", reason: "Customer Return",      cost: 560, recordedBy: "Chef Suresh" },
  { id: "6", date: "2026-04-15", item: "Cooking Oil",    emoji: "🫙", qty: 1,    unit: "litre",  reason: "Contamination",        cost: 150, recordedBy: "Chef Ramesh" },
];

const REASON_COLORS: Record<string, string> = {
  "Spoilage / Expired":   "bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-400",
  "Overcooked / Burnt":   "bg-orange-100 text-orange-700 dark:bg-orange-900/20 dark:text-orange-400",
  "Over-preparation":     "bg-amber-100 text-amber-700 dark:bg-amber-900/20 dark:text-amber-400",
  "Customer Return":      "bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400",
  "Contamination":        "bg-purple-100 text-purple-700 dark:bg-purple-900/20 dark:text-purple-400",
  "Storage Error":        "bg-gray-100 text-gray-700 dark:bg-white/10 dark:text-slate-400",
  "Other":                "bg-slate-100 text-slate-700 dark:bg-white/5 dark:text-slate-400",
};

export default function WastePage() {
  const [entries, setEntries] = useState<WasteEntry[]>(INITIAL_WASTE);
  const [showModal, setShowModal] = useState(false);
  const [filterReason, setFilterReason] = useState("All");
  const [form, setForm] = useState({ item: "", qty: 0, unit: "kg", reason: REASONS[0], cost: 0, emoji: "🗑️" });

  const filtered = entries.filter((e) => filterReason === "All" || e.reason === filterReason);

  const totalCostToday = entries.filter((e) => e.date === "2026-04-17").reduce((s, e) => s + e.cost, 0);
  const totalCostWeek  = entries.reduce((s, e) => s + e.cost, 0);
  const mostWastedItem = entries.reduce((acc: Record<string, number>, e) => {
    acc[e.item] = (acc[e.item] || 0) + e.cost;
    return acc;
  }, {});
  const topWasted = Object.entries(mostWastedItem).sort((a, b) => b[1] - a[1])[0];

  const addEntry = () => {
    if (!form.item || form.qty <= 0 || form.cost <= 0) return;
    setEntries((prev) => [{
      id: Date.now().toString(),
      date: new Date().toISOString().split("T")[0],
      item: form.item,
      emoji: form.emoji,
      qty: form.qty,
      unit: form.unit,
      reason: form.reason,
      cost: form.cost,
      recordedBy: "You",
    }, ...prev]);
    setShowModal(false);
    setForm({ item: "", qty: 0, unit: "kg", reason: REASONS[0], cost: 0, emoji: "🗑️" });
  };

  const EMOJIS_WASTE = ["🍗", "🍚", "🧀", "🥘", "🍛", "🫙", "🥩", "🥦", "🧅", "🫙", "🥛", "🍳"];

  return (
    <div className="max-w-7xl mx-auto space-y-6">

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-gray-900 dark:text-white flex items-center gap-2">
            <Trash2 size={24} className="text-red-500" />
            Waste & Loss Management
          </h1>
          <p className="text-sm text-gray-500 dark:text-slate-400 mt-1">Track food wastage · Identify loss reasons · Cut hidden costs 📉</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 bg-red-500 hover:bg-red-400 text-white rounded-xl px-5 py-2.5 font-bold text-sm shadow-md shadow-red-200 dark:shadow-red-900/30 transition-all active:scale-95"
        >
          <Plus size={16} />
          Log Waste
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Today's Loss", value: `₹${totalCostToday}`, color: "text-red-500",    bg: "bg-red-50 dark:bg-red-900/10",    icon: IndianRupee },
          { label: "This Week",    value: `₹${totalCostWeek}`,  color: "text-orange-500", bg: "bg-orange-50 dark:bg-orange-900/10", icon: TrendingDown },
          { label: "Total Entries", value: entries.length,     color: "text-gray-600",   bg: "bg-gray-50 dark:bg-white/5",       icon: BarChart3 },
          { label: "Top Wasted",   value: topWasted?.[0] || "–", color: "text-amber-500", bg: "bg-amber-50 dark:bg-amber-900/10", icon: AlertTriangle },
        ].map((s) => (
          <div key={s.label} className={clsx("rounded-2xl border border-gray-100 dark:border-white/5 p-4", s.bg)}>
            <s.icon size={16} className={clsx(s.color, "mb-2")} />
            <p className={clsx("text-xl font-black truncate", s.color)}>{s.value}</p>
            <p className="text-[11px] text-gray-500 dark:text-slate-400 font-semibold mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Reason breakdown chart */}
      <div className="bg-white dark:bg-card rounded-2xl border border-gray-100 dark:border-white/5 p-5">
        <p className="text-[11px] font-black uppercase tracking-widest text-gray-400 mb-4">Loss by Reason</p>
        <div className="space-y-2.5">
          {REASONS.map((reason) => {
            const total = entries.filter((e) => e.reason === reason).reduce((s, e) => s + e.cost, 0);
            const pct = totalCostWeek > 0 ? Math.round((total / totalCostWeek) * 100) : 0;
            if (pct === 0) return null;
            return (
              <div key={reason}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[12px] font-semibold text-gray-600 dark:text-slate-300">{reason}</span>
                  <span className="text-[11px] font-bold text-gray-900 dark:text-white">₹{total} ({pct}%)</span>
                </div>
                <div className="h-2 bg-gray-100 dark:bg-white/10 rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-red-400 to-red-500 rounded-full" style={{ width: `${pct}%` }} />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Filter + Table */}
      <div className="bg-white dark:bg-card rounded-2xl border border-gray-100 dark:border-white/5 overflow-hidden">
        <div className="flex flex-wrap items-center gap-3 px-5 py-4 border-b border-gray-50 dark:border-white/5">
          <div className="flex items-center gap-1.5">
            <Filter size={14} className="text-gray-400" />
            <span className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">Filter:</span>
          </div>
          {["All", ...REASONS].map((r) => (
            <button
              key={r}
              onClick={() => setFilterReason(r)}
              className={clsx("px-3 py-1 rounded-xl text-[11px] font-bold transition-all",
                filterReason === r ? "bg-red-500 text-white" : "bg-gray-100 dark:bg-white/5 text-gray-500 hover:bg-red-50 hover:text-red-600"
              )}
            >
              {r}
            </button>
          ))}
        </div>

        <div className="divide-y divide-gray-50 dark:divide-white/5">
          {filtered.map((entry) => (
            <div key={entry.id} className="flex items-center gap-4 px-5 py-4 hover:bg-red-50/20 dark:hover:bg-white/5 transition-colors">
              <span className="text-2xl">{entry.emoji}</span>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-[13px] font-bold text-gray-900 dark:text-white">{entry.item}</span>
                  <span className="text-[11px] text-gray-500">{entry.qty} {entry.unit}</span>
                </div>
                <div className="flex items-center gap-2 mt-1">
                  <Calendar size={10} className="text-gray-400" />
                  <span className="text-[10px] text-gray-400">{entry.date} · by {entry.recordedBy}</span>
                </div>
              </div>
              <span className={clsx("px-2.5 py-1 rounded-xl text-[10px] font-bold", REASON_COLORS[entry.reason] || "bg-gray-100 text-gray-600")}>
                {entry.reason}
              </span>
              <span className="text-[13px] font-black text-red-500 w-20 text-right shrink-0">-₹{entry.cost}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Log Waste Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-[#0f1117] rounded-3xl w-full max-w-md shadow-2xl border border-red-100 dark:border-white/10">
            <div className="flex items-center justify-between px-6 py-5 border-b border-red-50 dark:border-white/5">
              <h2 className="text-base font-black text-gray-900 dark:text-white">Log Waste Entry</h2>
              <button onClick={() => setShowModal(false)} className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-white/5 text-gray-400 transition-all">
                <X size={18} />
              </button>
            </div>
            <div className="p-6 space-y-4">
              {/* Emoji */}
              <div className="flex flex-wrap gap-2">
                {EMOJIS_WASTE.map((e) => (
                  <button key={e} onClick={() => setForm({ ...form, emoji: e })}
                    className={clsx("w-8 h-8 rounded-xl text-lg flex items-center justify-center transition-all",
                      form.emoji === e ? "bg-red-100 dark:bg-red-900/30 ring-2 ring-red-400" : "bg-gray-50 dark:bg-white/5 hover:bg-red-50"
                    )}>{e}</button>
                ))}
              </div>
              <div>
                <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1.5 block">Item Name *</label>
                <input type="text" placeholder="e.g. Chicken" value={form.item} onChange={(e) => setForm({ ...form, item: e.target.value })}
                  className="w-full px-4 py-2.5 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl text-sm outline-none focus:border-red-300" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1.5 block">Qty</label>
                  <input type="number" min={0} step={0.1} value={form.qty} onChange={(e) => setForm({ ...form, qty: Number(e.target.value) })}
                    className="w-full px-4 py-2.5 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl text-sm outline-none focus:border-red-300" />
                </div>
                <div>
                  <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1.5 block">Unit</label>
                  <select value={form.unit} onChange={(e) => setForm({ ...form, unit: e.target.value })}
                    className="w-full px-4 py-2.5 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl text-sm outline-none focus:border-red-300">
                    {["kg", "g", "litres", "ml", "pcs", "plates"].map((u) => <option key={u}>{u}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1.5 block">Reason *</label>
                <select value={form.reason} onChange={(e) => setForm({ ...form, reason: e.target.value })}
                  className="w-full px-4 py-2.5 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl text-sm outline-none focus:border-red-300">
                  {REASONS.map((r) => <option key={r}>{r}</option>)}
                </select>
              </div>
              <div>
                <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1.5 block">Cost Impact (₹) *</label>
                <input type="number" min={0} value={form.cost} onChange={(e) => setForm({ ...form, cost: Number(e.target.value) })}
                  className="w-full px-4 py-2.5 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl text-sm outline-none focus:border-red-300" />
              </div>
              <div className="flex gap-3 pt-2">
                <button onClick={() => setShowModal(false)} className="flex-1 py-3 border border-gray-200 dark:border-white/10 rounded-xl text-sm font-bold text-gray-500 hover:bg-gray-50 transition-all">Cancel</button>
                <button onClick={addEntry} className="flex-[2] py-3 bg-red-500 hover:bg-red-400 text-white rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-all active:scale-95">
                  <Save size={15} /> Record Loss
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
