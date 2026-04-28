"use client";

import { useState, useEffect, useCallback } from "react";
import {
  PackageCheck,
  RefreshCw,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Filter,
} from "lucide-react";
import { clsx } from "clsx";
import { productBatchesApi, productsFullApi } from "@/lib/api";

type ExpiryStatus = "EXPIRED" | "EXPIRING_SOON" | "VALID" | "NO_EXPIRY";

const EXPIRY_STYLES: Record<ExpiryStatus, string> = {
  EXPIRED:       "bg-red-500/10 text-red-400 border-red-500/20",
  EXPIRING_SOON: "bg-amber-500/10 text-amber-400 border-amber-500/20",
  VALID:         "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  NO_EXPIRY:     "bg-zinc-500/10 text-zinc-400 border-zinc-500/20",
};

const EXPIRY_ICONS: Record<ExpiryStatus, JSX.Element> = {
  EXPIRED:       <AlertTriangle className="w-3 h-3" />,
  EXPIRING_SOON: <Clock className="w-3 h-3" />,
  VALID:         <CheckCircle2 className="w-3 h-3" />,
  NO_EXPIRY:     <PackageCheck className="w-3 h-3" />,
};

function expiryLabel(status: ExpiryStatus) {
  return status === "NO_EXPIRY" ? "No Expiry" : status.replace("_", " ");
}

export default function ProductBatchesPage() {
  const [batches, setBatches]   = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading]   = useState(true);
  const [productFilter, setProductFilter] = useState("");
  const [expiryFilter, setExpiryFilter]   = useState<string>("ALL");

  const fetchBatches = useCallback(async (productId?: string) => {
    setLoading(true);
    try {
      const [bRes, pRes] = await Promise.all([
        productBatchesApi.getAll(productId || undefined),
        productsFullApi.getAll(),
      ]);
      setBatches(bRes.data ?? []);
      setProducts(pRes.data ?? []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchBatches(); }, [fetchBatches]);

  const handleProductFilter = (pid: string) => {
    setProductFilter(pid);
    fetchBatches(pid || undefined);
  };

  const filtered = batches.filter((b) => {
    if (expiryFilter === "ALL") return true;
    return (b.expiryStatus ?? "NO_EXPIRY") === expiryFilter;
  });

  const stats = {
    total:        batches.length,
    expired:      batches.filter((b) => b.expiryStatus === "EXPIRED").length,
    expiringSoon: batches.filter((b) => b.expiryStatus === "EXPIRING_SOON").length,
    valid:        batches.filter((b) => !b.expiryStatus || b.expiryStatus === "VALID" || b.expiryStatus === "NO_EXPIRY").length,
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-white p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-violet-500/10 border border-violet-500/20">
            <PackageCheck className="w-6 h-6 text-violet-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">Product Batches</h1>
            <p className="text-sm text-zinc-400">Track expiry status and batch quantities</p>
          </div>
        </div>
        <button
          onClick={() => fetchBatches(productFilter || undefined)}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-sm text-zinc-300 transition-colors"
        >
          <RefreshCw className="w-4 h-4" />
          Refresh
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {[
          { label: "Total Batches",   value: stats.total,        color: "text-white" },
          { label: "Expired",         value: stats.expired,      color: "text-red-400" },
          { label: "Expiring Soon",   value: stats.expiringSoon, color: "text-amber-400" },
          { label: "Valid / No Expiry", value: stats.valid,      color: "text-emerald-400" },
        ].map((s) => (
          <div key={s.label} className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
            <p className="text-xs text-zinc-500 mb-1">{s.label}</p>
            <p className={clsx("text-2xl font-bold", s.color)}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-6">
        <div className="flex items-center gap-2 bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2">
          <Filter className="w-4 h-4 text-zinc-400" />
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

        <div className="flex gap-2">
          {["ALL", "VALID", "EXPIRING_SOON", "EXPIRED", "NO_EXPIRY"].map((f) => (
            <button
              key={f}
              onClick={() => setExpiryFilter(f)}
              className={clsx(
                "px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors",
                expiryFilter === f
                  ? "bg-violet-500/20 border-violet-500/40 text-violet-300"
                  : "bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-zinc-300"
              )}
            >
              {f === "ALL" ? "All" : f === "NO_EXPIRY" ? "No Expiry" : f.replace("_", " ")}
            </button>
          ))}
        </div>
      </div>

      {/* Batch Table */}
      {loading ? (
        <div className="flex items-center justify-center py-20 text-zinc-500">
          <RefreshCw className="w-5 h-5 animate-spin mr-2" />
          Loading batches...
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-zinc-500">
          <PackageCheck className="w-10 h-10 mb-3 opacity-30" />
          <p className="text-sm">No batches found</p>
        </div>
      ) : (
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-zinc-800 text-zinc-400 text-xs">
                <th className="px-4 py-3 text-left font-medium">Batch Code</th>
                <th className="px-4 py-3 text-left font-medium">Product</th>
                <th className="px-4 py-3 text-right font-medium">Quantity</th>
                <th className="px-4 py-3 text-left font-medium">Produced</th>
                <th className="px-4 py-3 text-left font-medium">Expiry Date</th>
                <th className="px-4 py-3 text-left font-medium">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800">
              {filtered.map((batch: any) => {
                const status: ExpiryStatus = batch.expiryStatus ?? "NO_EXPIRY";
                return (
                  <tr key={batch.id} className="hover:bg-zinc-800/40 transition-colors">
                    <td className="px-4 py-3 font-mono text-violet-300 text-xs">{batch.batchCode}</td>
                    <td className="px-4 py-3 text-zinc-200">{batch.product?.name ?? "—"}</td>
                    <td className="px-4 py-3 text-right text-zinc-200 font-medium">
                      {batch.quantity}
                      {batch.product?.unit && (
                        <span className="text-zinc-500 ml-1 text-xs">{batch.product.unit}</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-zinc-400">
                      {batch.createdAt
                        ? new Date(batch.createdAt).toLocaleDateString("en-IN", {
                            day: "2-digit", month: "short", year: "numeric",
                          })
                        : "—"}
                    </td>
                    <td className="px-4 py-3 text-zinc-400">
                      {batch.expiryDate
                        ? new Date(batch.expiryDate).toLocaleDateString("en-IN", {
                            day: "2-digit", month: "short", year: "numeric",
                          })
                        : <span className="text-zinc-600">—</span>}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={clsx(
                          "inline-flex items-center gap-1.5 px-2 py-1 rounded-md border text-xs font-medium",
                          EXPIRY_STYLES[status]
                        )}
                      >
                        {EXPIRY_ICONS[status]}
                        {expiryLabel(status)}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
