"use client";

import { useEffect, useState } from "react";
import {
  TrendingUp, TrendingDown, Wallet, CreditCard, DollarSign,
  Activity, ArrowUpRight, ArrowDownRight, Building2,
  Zap, AlertTriangle, Info, ChevronRight, RefreshCw,
  Landmark, ShoppingCart, Users, Lightbulb, CheckCircle2,
  Edit3, Save
} from "lucide-react";
import { clsx } from "clsx";
import { accountingApi } from "@/lib/api";
import { formatCurrency } from "@/lib/utils";

// ─── Types ───────────────────────────────────────────────────────────────────
interface CashFlowData {
  totalLiquidity: number;
  breakdown: { cash: number; bank: number; upi: number };
}

// ─── Sub-Components ───────────────────────────────────────────────────────────

function StatCard({
  label, value, icon: Icon, color, sub, trend,
}: {
  label: string; value: string; icon: any;
  color: "blue" | "emerald" | "purple" | "rose";
  sub?: string; trend?: "up" | "down";
}) {
  const colorMap = {
    blue:    "bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400 border-blue-100 dark:border-blue-500/20",
    emerald: "bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400 border-emerald-100 dark:border-emerald-500/20",
    purple:  "bg-purple-50 text-purple-600 dark:bg-purple-500/10 dark:text-purple-400 border-purple-100 dark:border-purple-500/20",
    rose:    "bg-rose-50 text-rose-600 dark:bg-rose-500/10 dark:text-rose-400 border-rose-100 dark:border-rose-500/20",
  };
  return (
    <div className="bg-white dark:bg-[#12141c] rounded-2xl border border-slate-100 dark:border-white/5 p-6 shadow-sm hover:shadow-md transition-all group">
      <div className="flex items-start justify-between mb-4">
        <div className={clsx("w-11 h-11 rounded-xl flex items-center justify-center border", colorMap[color])}>
          <Icon size={20} strokeWidth={2} />
        </div>
        {trend && (
          <span className={clsx(
            "text-[10px] font-black px-2 py-1 rounded-lg flex items-center gap-1",
            trend === "up" ? "bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10" : "bg-rose-50 text-rose-600 dark:bg-rose-500/10"
          )}>
            {trend === "up" ? <ArrowUpRight size={10} /> : <ArrowDownRight size={10} />}
            {trend === "up" ? "Positive" : "Negative"}
          </span>
        )}
      </div>
      <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">{label}</p>
      <h3 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">{value}</h3>
      {sub && <p className="text-[11px] text-slate-400 mt-2 font-medium">{sub}</p>}
    </div>
  );
}

function CategoryCard({
  icon: Icon, title, color, description, examples, purpose, isEditing, onChange
}: {
  icon: any; title: string; color: string;
  description: string; examples: string; purpose: string;
  isEditing?: boolean; onChange?: (field: string, val: string) => void;
}) {
  const colors: Record<string, string> = {
    blue:   "from-blue-500/10 to-blue-500/5 border-blue-200/50 dark:border-blue-500/20",
    amber:  "from-amber-500/10 to-amber-500/5 border-amber-200/50 dark:border-amber-500/20",
    purple: "from-purple-500/10 to-purple-500/5 border-purple-200/50 dark:border-purple-500/20",
  };
  const iconColors: Record<string, string> = {
    blue:   "bg-blue-500 text-white",
    amber:  "bg-amber-500 text-white",
    purple: "bg-purple-500 text-white",
  };
  const dotColors: Record<string, string> = {
    blue:   "bg-blue-500",
    amber:  "bg-amber-500",
    purple: "bg-purple-500",
  };

  return (
    <div className={clsx(
      "bg-gradient-to-br rounded-2xl border p-6 hover:shadow-md transition-all",
      colors[color]
    )}>
      <div className="flex items-start gap-4 mb-5">
        <div className={clsx("w-11 h-11 rounded-xl flex items-center justify-center shrink-0 shadow-lg", iconColors[color])}>
          <Icon size={20} strokeWidth={2.5} />
        </div>
        <div className="w-full">
          <h3 className="font-black text-slate-900 dark:text-white text-base">{title}</h3>
          {isEditing ? (
            <input 
              value={description}
              onChange={(e) => onChange?.('description', e.target.value)}
              className="w-full mt-1 bg-white/60 dark:bg-[#12141c]/60 border border-slate-300 dark:border-white/20 rounded-md px-2 py-1 text-[12px] text-slate-800 dark:text-slate-200 focus:outline-none focus:border-blue-500 transition-colors"
              placeholder="Description"
            />
          ) : (
            <p className="text-[12px] text-slate-500 dark:text-slate-400 mt-0.5">{description}</p>
          )}
        </div>
      </div>

      <div className="space-y-2 mb-4">
        {isEditing ? (
          <textarea 
            value={examples}
            onChange={(e) => onChange?.('examples', e.target.value)}
            className="w-full bg-white/60 dark:bg-[#12141c]/60 border border-slate-300 dark:border-white/20 rounded-md px-2 py-1 text-[12px] text-slate-800 dark:text-slate-200 focus:outline-none focus:border-blue-500 transition-colors resize-none"
            rows={2}
            placeholder="Comma separated examples"
          />
        ) : (
          examples.split(',').filter(e => e.trim() !== '').map((ex, i) => (
            <div key={i} className="flex items-center gap-2">
              <div className={clsx("w-1.5 h-1.5 rounded-full shrink-0", dotColors[color])} />
              <span className="text-[12px] font-medium text-slate-600 dark:text-slate-300">{ex.trim()}</span>
            </div>
          ))
        )}
      </div>

      <div className="pt-4 border-t border-white/30 dark:border-white/10">
        <p className="text-[11px] font-black text-slate-400 uppercase tracking-wider mb-1">Purpose</p>
        {isEditing ? (
          <textarea 
            value={purpose}
            onChange={(e) => onChange?.('purpose', e.target.value)}
            className="w-full bg-white/60 dark:bg-[#12141c]/60 border border-slate-300 dark:border-white/20 rounded-md px-2 py-1 text-[12px] text-slate-800 dark:text-slate-200 focus:outline-none focus:border-blue-500 transition-colors resize-none"
            rows={2}
            placeholder="Purpose"
          />
        ) : (
          <p className="text-[12px] text-slate-600 dark:text-slate-300 font-medium">{purpose}</p>
        )}
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function CashFlowPage() {
  const [cashFlow, setCashFlow] = useState<CashFlowData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Editable Content State
  const [isEditing, setIsEditing] = useState(false);
  const [content, setContent] = useState({
    categories: [
      {
        iconKey: "Activity",
        title: "Operating Activities",
        color: "blue",
        description: "Daily business operations",
        examples: "Sales income, Salary payments, Utility bills",
        purpose: "Reflects core business cash generation from day-to-day operations.",
      },
      {
        iconKey: "Building2",
        title: "Investing Activities",
        color: "amber",
        description: "Asset investments",
        examples: "Machinery purchase, Property sales",
        purpose: "Shows cash used for long-term asset acquisition or disposal.",
      },
      {
        iconKey: "Landmark",
        title: "Financing Activities",
        color: "purple",
        description: "Funding activities",
        examples: "Loans, Investor capital, EMI payments",
        purpose: "Captures cash from or repaid to investors and lenders.",
      },
    ],
    purposePoints: [
      "Tracks cash availability across all accounts",
      "Prevents cash shortages before they happen",
      "Helps financial planning and forecasting",
    ],
    importantNote: {
      intro: "A company can show profit in P&L but still face cash problems.",
      details: "The Cash Flow Statement helps identify exactly when and where cash is being consumed — even when the business looks profitable on paper.",
      footer: "Always monitor cash flow alongside P&L"
    }
  });

  const iconMap: Record<string, any> = {
    Activity: Activity,
    Building2: Building2,
    Landmark: Landmark
  };

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await accountingApi.getCashFlow();
      setCashFlow(res.data);
    } catch (err: any) {
      setError(err?.response?.data?.error || "Failed to load cash flow data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { 
    fetchData(); 
    // Load saved content from local storage
    const saved = localStorage.getItem("cashFlowContent");
    if (saved) {
      try {
        setContent(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to parse saved content", e);
      }
    }
  }, []);

  const handleSave = () => {
    localStorage.setItem("cashFlowContent", JSON.stringify(content));
    setIsEditing(false);
  };

  const updateCategory = (index: number, field: string, value: string) => {
    const newCategories = [...content.categories];
    newCategories[index] = { ...newCategories[index], [field]: value };
    setContent({ ...content, categories: newCategories });
  };

  const totalLiquidity  = cashFlow?.totalLiquidity || 0;
  const cashBalance     = cashFlow?.breakdown?.cash || 0;
  const bankBalance     = cashFlow?.breakdown?.bank || 0;
  const upiBalance      = cashFlow?.breakdown?.upi || 0;

  return (
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-[#090a0f] -m-8">
      <div className="p-8 space-y-8">

        {/* ── Header ── */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <div className="w-9 h-9 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/30">
                <Wallet size={18} className="text-white" strokeWidth={2.5} />
              </div>
              <h1 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tight">
                Cash Flow Statement
              </h1>
            </div>
            <p className="text-[12px] text-slate-400 font-medium ml-12">
              Tracks how cash moves in and out of the business
            </p>
          </div>
          <div className="flex items-center gap-3">
            {isEditing ? (
              <button
                onClick={handleSave}
                className="flex items-center gap-2 px-5 py-2.5 bg-emerald-500 text-white rounded-xl text-[11px] font-black uppercase tracking-wider hover:bg-emerald-600 transition-all shadow-md active:scale-95"
              >
                <Save size={14} />
                Save Changes
              </button>
            ) : (
              <button
                onClick={() => setIsEditing(true)}
                className="flex items-center gap-2 px-5 py-2.5 bg-white dark:bg-[#12141c] border border-slate-200 dark:border-white/10 rounded-xl text-[11px] font-black uppercase tracking-wider text-slate-600 dark:text-slate-300 hover:border-purple-400 hover:text-purple-600 transition-all shadow-sm active:scale-95"
              >
                <Edit3 size={14} />
                Edit Content
              </button>
            )}
            <button
              onClick={fetchData}
              disabled={loading}
              className="flex items-center gap-2 px-5 py-2.5 bg-white dark:bg-[#12141c] border border-slate-200 dark:border-white/10 rounded-xl text-[11px] font-black uppercase tracking-wider text-slate-600 dark:text-slate-300 hover:border-blue-400 hover:text-blue-600 transition-all shadow-sm active:scale-95"
            >
              <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
              Refresh
            </button>
          </div>
        </div>

        {/* ── Live Liquidity Stats ── */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="bg-white dark:bg-[#12141c] rounded-2xl border border-slate-100 dark:border-white/5 p-6 animate-pulse h-36" />
            ))}
          </div>
        ) : error ? (
          <div className="bg-rose-50 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/20 rounded-2xl p-6 flex items-center gap-4">
            <AlertTriangle size={24} className="text-rose-500 shrink-0" />
            <div>
              <p className="font-black text-rose-700 dark:text-rose-400 text-sm">{error}</p>
              <button onClick={fetchData} className="text-[11px] font-black text-rose-500 hover:text-rose-600 uppercase tracking-wider mt-1">
                Retry →
              </button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
            <StatCard
              label="Total Liquidity"
              value={formatCurrency(totalLiquidity)}
              icon={Wallet}
              color={totalLiquidity >= 0 ? "blue" : "rose"}
              sub="All accounts combined"
              trend={totalLiquidity >= 0 ? "up" : "down"}
            />
            <StatCard
              label="Physical Cash"
              value={formatCurrency(cashBalance)}
              icon={DollarSign}
              color="emerald"
              sub="Cash-in-hand balance"
            />
            <StatCard
              label="Bank Balance"
              value={formatCurrency(bankBalance)}
              icon={Building2}
              color="blue"
              sub="Total bank accounts"
            />
            <StatCard
              label="UPI / Digital"
              value={formatCurrency(upiBalance)}
              icon={Zap}
              color="purple"
              sub="Digital wallet balance"
            />
          </div>
        )}

        {/* ── Account Breakdown Bar ── */}
        {!loading && !error && cashFlow && (
          <div className="bg-white dark:bg-[#12141c] rounded-2xl border border-slate-100 dark:border-white/5 p-6 shadow-sm">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-[11px] font-black text-slate-900 dark:text-white uppercase tracking-[0.2em]">
                Liquidity Distribution
              </h2>
              <span className="text-[11px] font-bold text-slate-400">
                Total: {formatCurrency(totalLiquidity)}
              </span>
            </div>
            <div className="flex h-3 rounded-full overflow-hidden gap-0.5 mb-4">
              {totalLiquidity > 0 && (
                <>
                  <div className="bg-emerald-500 rounded-l-full transition-all" style={{ width: `${(cashBalance / totalLiquidity) * 100}%` }} />
                  <div className="bg-blue-500 transition-all" style={{ width: `${(bankBalance / totalLiquidity) * 100}%` }} />
                  <div className="bg-purple-500 rounded-r-full transition-all" style={{ width: `${(upiBalance / totalLiquidity) * 100}%` }} />
                </>
              )}
              {totalLiquidity <= 0 && <div className="bg-slate-200 dark:bg-slate-700 rounded-full w-full" />}
            </div>
            <div className="flex flex-wrap gap-6">
              {[
                { label: "Cash", val: cashBalance, color: "bg-emerald-500" },
                { label: "Bank", val: bankBalance, color: "bg-blue-500" },
                { label: "UPI", val: upiBalance, color: "bg-purple-500" },
              ].map((item) => (
                <div key={item.label} className="flex items-center gap-2">
                  <div className={clsx("w-2.5 h-2.5 rounded-full", item.color)} />
                  <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400">
                    {item.label}: <span className="text-slate-800 dark:text-white">{formatCurrency(item.val)}</span>
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── Categories ── */}
        <div>
          <div className="flex items-center gap-3 mb-5">
            <div className="w-1 h-6 bg-blue-500 rounded-full" />
            <h2 className="text-[13px] font-black text-slate-900 dark:text-white uppercase tracking-[0.15em]">
              Categories
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {content.categories.map((cat, i) => (
              <CategoryCard 
                key={cat.title} 
                icon={iconMap[cat.iconKey]} 
                title={cat.title}
                color={cat.color}
                description={cat.description}
                examples={cat.examples}
                purpose={cat.purpose}
                isEditing={isEditing}
                onChange={(field, val) => updateCategory(i, field, val)}
              />
            ))}
          </div>
        </div>

        {/* ── Purpose + Important ── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">

          {/* Purpose */}
          <div className="bg-white dark:bg-[#12141c] rounded-2xl border border-slate-100 dark:border-white/5 p-6 shadow-sm">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-9 h-9 bg-blue-50 dark:bg-blue-500/10 rounded-xl flex items-center justify-center">
                <Lightbulb size={18} className="text-blue-600 dark:text-blue-400" />
              </div>
              <h2 className="font-black text-slate-900 dark:text-white uppercase tracking-wider text-[12px]">
                Purpose
              </h2>
            </div>
            <div className="space-y-3">
              {content.purposePoints.map((point, i) => (
                <div key={i} className="flex items-start gap-3 p-3 bg-slate-50 dark:bg-white/[0.03] rounded-xl">
                  <CheckCircle2 size={16} className="text-blue-500 shrink-0 mt-0.5" />
                  {isEditing ? (
                    <input 
                      value={point}
                      onChange={(e) => {
                        const newPoints = [...content.purposePoints];
                        newPoints[i] = e.target.value;
                        setContent({ ...content, purposePoints: newPoints });
                      }}
                      className="w-full bg-white/60 dark:bg-[#12141c]/60 border border-slate-300 dark:border-white/20 rounded-md px-2 py-1 text-[13px] text-slate-800 dark:text-slate-200 focus:outline-none focus:border-blue-500 transition-colors"
                      placeholder={`Purpose point ${i + 1}`}
                    />
                  ) : (
                    <p className="text-[13px] font-medium text-slate-700 dark:text-slate-300">{point}</p>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Important Note */}
          <div className="bg-amber-50 dark:bg-amber-500/10 rounded-2xl border border-amber-200 dark:border-amber-500/20 p-6">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-9 h-9 bg-amber-100 dark:bg-amber-500/20 rounded-xl flex items-center justify-center">
                <AlertTriangle size={18} className="text-amber-600 dark:text-amber-400" />
              </div>
              <h2 className="font-black text-amber-800 dark:text-amber-300 uppercase tracking-wider text-[12px]">
                Important
              </h2>
            </div>
            <div className="space-y-4">
              {isEditing ? (
                <textarea 
                  value={content.importantNote.intro}
                  onChange={(e) => setContent({ ...content, importantNote: { ...content.importantNote, intro: e.target.value } })}
                  className="w-full bg-white/60 dark:bg-[#12141c]/60 border border-amber-300 dark:border-amber-500/30 rounded-md px-2 py-1 text-[13px] font-semibold text-amber-900 dark:text-amber-100 focus:outline-none focus:border-amber-500 transition-colors resize-none"
                  rows={2}
                  placeholder="Intro text"
                />
              ) : (
                <p className="text-[13px] font-semibold text-amber-800 dark:text-amber-200 leading-relaxed">
                  {content.importantNote.intro}
                </p>
              )}
              <div className="flex items-start gap-3 p-3 bg-amber-100/60 dark:bg-amber-500/10 rounded-xl">
                <Info size={16} className="text-amber-600 shrink-0 mt-0.5" />
                {isEditing ? (
                  <textarea 
                    value={content.importantNote.details}
                    onChange={(e) => setContent({ ...content, importantNote: { ...content.importantNote, details: e.target.value } })}
                    className="w-full bg-white/60 dark:bg-[#12141c]/60 border border-amber-300 dark:border-amber-500/30 rounded-md px-2 py-1 text-[12px] font-medium text-amber-900 dark:text-amber-100 focus:outline-none focus:border-amber-500 transition-colors resize-none"
                    rows={3}
                    placeholder="Detailed explanation"
                  />
                ) : (
                  <p className="text-[12px] font-medium text-amber-700 dark:text-amber-300 leading-relaxed">
                    {content.importantNote.details}
                  </p>
                )}
              </div>
              <div className="flex items-center gap-2 pt-1">
                <ChevronRight size={14} className="text-amber-500" />
                {isEditing ? (
                  <input 
                    value={content.importantNote.footer}
                    onChange={(e) => setContent({ ...content, importantNote: { ...content.importantNote, footer: e.target.value } })}
                    className="w-full bg-white/60 dark:bg-[#12141c]/60 border border-amber-300 dark:border-amber-500/30 rounded-md px-2 py-1 text-[11px] font-black uppercase tracking-wider text-amber-900 dark:text-amber-100 focus:outline-none focus:border-amber-500 transition-colors"
                    placeholder="Footer text"
                  />
                ) : (
                  <p className="text-[11px] font-black text-amber-600 dark:text-amber-400 uppercase tracking-wider">
                    {content.importantNote.footer}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* ── How It Works ── */}
        <div className="bg-slate-900 dark:bg-[#0c0e17] rounded-2xl border border-slate-800 p-8">
          <h2 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.3em] mb-6">
            How Cash Flow Works
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { step: "01", title: "Record Inflows", desc: "Sales receipts, loan proceeds, asset sales — all cash entering the business.", icon: ArrowUpRight, color: "text-emerald-400" },
              { step: "02", title: "Record Outflows", desc: "Salaries, vendor payments, EMIs, utility bills — all cash leaving the business.", icon: ArrowDownRight, color: "text-rose-400" },
              { step: "03", title: "Net Position", desc: "Inflows minus outflows = Net Cash Position. Positive means healthy liquidity.", icon: TrendingUp, color: "text-blue-400" },
            ].map((item) => (
              <div key={item.step} className="flex gap-4">
                <div>
                  <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest">{item.step}</span>
                  <item.icon size={24} className={clsx("mt-1", item.color)} />
                </div>
                <div>
                  <h3 className="font-black text-white text-sm mb-1">{item.title}</h3>
                  <p className="text-[12px] text-slate-500 leading-relaxed">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
