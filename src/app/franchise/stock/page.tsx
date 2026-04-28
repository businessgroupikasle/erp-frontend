"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import {
  Package, RefreshCw, AlertTriangle, CheckCircle2,
  Clock, ShoppingCart, Filter, ArrowRight,
} from "lucide-react";
import { clsx } from "clsx";
import { productBatchesApi, productsFullApi } from "@/lib/api";

type ExpiryStatus = "EXPIRED" | "EXPIRING_SOON" | "VALID" | "NO_EXPIRY";

const EXPIRY_CARD: Record<ExpiryStatus, { badge: string; bar: string; label: string }> = {
  EXPIRED:       { badge: "bg-red-500/15 text-red-400 border-red-500/30",    bar: "bg-red-500",    label: "EXPIRED"      },
  EXPIRING_SOON: { badge: "bg-amber-500/15 text-amber-400 border-amber-500/30", bar: "bg-amber-500", label: "Expiring Soon" },
  VALID:         { badge: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30", bar: "bg-emerald-500", label: "Safe" },
  NO_EXPIRY:     { badge: "bg-zinc-700/60 text-zinc-400 border-zinc-600/40", bar: "bg-zinc-600",   label: "No Expiry"    },
};

const EXPIRY_ICONS: Record<ExpiryStatus, JSX.Element> = {
  EXPIRED:       <AlertTriangle className="w-3 h-3" />,
  EXPIRING_SOON: <Clock className="w-3 h-3" />,
  VALID:         <CheckCircle2 className="w-3 h-3" />,
  NO_EXPIRY:     <Package className="w-3 h-3" />,
};

const FILTER_TABS: Array<{ key: string; label: string }> = [
  { key: "ALL",           label: "All"          },
  { key: "VALID",         label: "Safe"         },
  { key: "EXPIRING_SOON", label: "Expiring Soon"},
  { key: "EXPIRED",       label: "Expired"      },
  { key: "NO_EXPIRY",     label: "No Expiry"    },
];

export default function FranchiseStockPage() {
  const [batches, setBatches]       = useState<any[]>([]);
  const [products, setProducts]     = useState<any[]>([]);
  const [loading, setLoading]       = useState(true);
  const [productFilter, setProductFilter] = useState("");
  const [expiryFilter, setExpiryFilter]   = useState("ALL");
  const [searchTerm, setSearchTerm]       = useState("");

  const fetchData = useCallback(async (pid?: string) => {
    setLoading(true);
    try {
      const [bRes, pRes] = await Promise.all([
        productBatchesApi.getAll(pid || undefined),
        productsFullApi.getAll(),
      ]);
      setBatches(bRes.data ?? []);
      setProducts(pRes.data ?? []);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleProductFilter = (pid: string) => {
    setProductFilter(pid);
    fetchData(pid || undefined);
  };

  const filtered = batches.filter((b) => {
    const status = b.expiryStatus ?? "NO_EXPIRY";
    const matchExpiry  = expiryFilter === "ALL" || status === expiryFilter;
    const matchSearch  = !searchTerm || (b.product?.name ?? "").toLowerCase().includes(searchTerm.toLowerCase());
    return matchExpiry && matchSearch;
  });

  // Stats
  const stats = {
    total:    batches.length,
    expired:  batches.filter((b) => b.expiryStatus === "EXPIRED").length,
    expiring: batches.filter((b) => b.expiryStatus === "EXPIRING_SOON").length,
    safe:     batches.filter((b) => !b.expiryStatus || b.expiryStatus === "VALID" || b.expiryStatus === "NO_EXPIRY").length,
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-white p-4 md:p-6">

      {/* Header */}
      <div className="flex items-start justify-between gap-4 mb-6">
        <div>
          <p className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em]">Franchise</p>
          <h1 className="text-2xl font-black text-white mt-0.5">Available Products</h1>
          <p className="text-sm text-zinc-500 mt-0.5">Finished goods batches from Home House</p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => fetchData(productFilter || undefined)}
            className="p-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 transition-colors"
          >
            <RefreshCw className={clsx("w-4 h-4 text-zinc-400", loading && "animate-spin")} />
          </button>
          <Link
            href="/franchise-orders"
            className="flex items-center gap-2 px-4 py-2.5 bg-orange-500 hover:bg-orange-400 text-white text-sm font-bold rounded-xl transition-colors"
          >
            <ShoppingCart className="w-4 h-4" /> Order More
          </Link>
        </div>
      </div>

      {/* Stats Strip */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        {[
          { label: "Total Batches",   value: stats.total,    color: "text-white" },
          { label: "Expired",         value: stats.expired,  color: "text-red-400" },
          { label: "Expiring Soon",   value: stats.expiring, color: "text-amber-400" },
          { label: "Safe / No Expiry",value: stats.safe,     color: "text-emerald-400" },
        ].map((s) => (
          <div key={s.label} className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
            <p className="text-[10px] text-zinc-600 uppercase tracking-widest font-bold mb-1">{s.label}</p>
            <p className={clsx("text-2xl font-black", s.color)}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-6">
        {/* Search */}
        <div className="flex items-center gap-2 bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2">
          <Filter className="w-4 h-4 text-zinc-500 shrink-0" />
          <input
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search product..."
            className="bg-transparent text-sm text-zinc-300 outline-none w-36 placeholder-zinc-600"
          />
        </div>

        {/* Product dropdown */}
        <div className="flex items-center gap-2 bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2">
          <select
            value={productFilter}
            onChange={(e) => handleProductFilter(e.target.value)}
            className="bg-transparent text-sm text-zinc-300 outline-none"
          >
            <option value="">All Products</option>
            {products.map((p: any) => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </select>
        </div>

        {/* Expiry filter tabs */}
        <div className="flex gap-1.5 flex-wrap">
          {FILTER_TABS.map((t) => (
            <button
              key={t.key}
              onClick={() => setExpiryFilter(t.key)}
              className={clsx(
                "px-3 py-1.5 rounded-lg text-xs font-bold border transition-colors",
                expiryFilter === t.key
                  ? "bg-orange-500/20 border-orange-500/40 text-orange-300"
                  : "bg-zinc-900 border-zinc-800 text-zinc-500 hover:text-zinc-300 hover:border-zinc-700"
              )}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex items-center justify-center py-20 text-zinc-600">
          <RefreshCw className="w-5 h-5 animate-spin mr-2" /> Loading batches...
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-zinc-600">
          <Package className="w-12 h-12 mb-3 opacity-30" />
          <p className="text-sm font-medium">No batches match your filters</p>
          <button
            onClick={() => { setExpiryFilter("ALL"); setSearchTerm(""); setProductFilter(""); fetchData(); }}
            className="mt-3 text-xs text-orange-400 hover:text-orange-300 font-bold"
          >
            Clear filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map((batch: any) => {
            const status  = (batch.expiryStatus ?? "NO_EXPIRY") as ExpiryStatus;
            const style   = EXPIRY_CARD[status];
            const isLow   = batch.quantity < 10;
            const daysLeft = batch.expiryDate
              ? Math.ceil((new Date(batch.expiryDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
              : null;

            return (
              <div
                key={batch.id}
                className={clsx(
                  "bg-zinc-900 border rounded-2xl p-5 flex flex-col gap-4 hover:border-zinc-700 transition-colors",
                  status === "EXPIRED" ? "border-red-500/20" :
                  status === "EXPIRING_SOON" ? "border-amber-500/20" : "border-zinc-800"
                )}
              >
                {/* Top */}
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-10 h-10 rounded-xl bg-zinc-800 flex items-center justify-center shrink-0">
                      <Package className="w-5 h-5 text-zinc-500" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-bold text-white truncate">
                        {batch.product?.name ?? "Unknown Product"}
                      </p>
                      <p className="text-[10px] font-mono text-zinc-600 mt-0.5">{batch.batchCode}</p>
                    </div>
                  </div>
                  <span className={clsx("inline-flex items-center gap-1 text-[10px] font-bold px-2 py-1 rounded-lg border shrink-0", style.badge)}>
                    {EXPIRY_ICONS[status]}
                    {style.label}
                  </span>
                </div>

                {/* Qty + Expiry */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-zinc-800/60 rounded-xl p-3">
                    <p className="text-[10px] text-zinc-600 uppercase tracking-wider font-bold mb-1">Quantity</p>
                    <p className={clsx("text-xl font-black", isLow ? "text-amber-400" : "text-white")}>
                      {batch.quantity}
                      <span className="text-xs font-medium text-zinc-500 ml-1">{batch.product?.unit ?? "units"}</span>
                    </p>
                    {isLow && <p className="text-[10px] text-amber-500 mt-0.5">⚠️ Low stock</p>}
                  </div>
                  <div className="bg-zinc-800/60 rounded-xl p-3">
                    <p className="text-[10px] text-zinc-600 uppercase tracking-wider font-bold mb-1">Expiry</p>
                    {batch.expiryDate ? (
                      <>
                        <p className="text-sm font-bold text-zinc-300">
                          {new Date(batch.expiryDate).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "2-digit" })}
                        </p>
                        <p className={clsx("text-[10px] mt-0.5 font-medium",
                          daysLeft !== null && daysLeft < 0 ? "text-red-400" :
                          daysLeft !== null && daysLeft <= 3 ? "text-amber-400" : "text-zinc-500"
                        )}>
                          {daysLeft === null ? "—" :
                           daysLeft < 0 ? `${Math.abs(daysLeft)}d ago` :
                           daysLeft === 0 ? "Today" :
                           `${daysLeft}d left`}
                        </p>
                      </>
                    ) : (
                      <p className="text-sm font-bold text-zinc-600">—</p>
                    )}
                  </div>
                </div>

                {/* Expiry bar */}
                {batch.expiryDate && daysLeft !== null && daysLeft >= 0 && (
                  <div className="h-1 bg-zinc-800 rounded-full overflow-hidden">
                    <div
                      className={clsx("h-full rounded-full transition-all", style.bar)}
                      style={{ width: `${Math.min(100, Math.max(4, (daysLeft / 30) * 100))}%` }}
                    />
                  </div>
                )}

                {/* Produced date */}
                <p className="text-[10px] text-zinc-700">
                  Produced: {new Date(batch.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                </p>

                {/* Actions */}
                <div className="flex gap-2 pt-1 border-t border-zinc-800">
                  <Link
                    href="/franchise-orders"
                    className="flex-1 flex items-center justify-center gap-1.5 py-2 bg-orange-500/10 hover:bg-orange-500/20 border border-orange-500/20 text-orange-400 text-xs font-bold rounded-xl transition-colors"
                  >
                    <ShoppingCart className="w-3.5 h-3.5" /> Order More
                  </Link>
                  <Link
                    href="/production/batches"
                    className="flex items-center justify-center gap-1.5 px-3 py-2 bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 text-zinc-400 text-xs font-bold rounded-xl transition-colors"
                  >
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
