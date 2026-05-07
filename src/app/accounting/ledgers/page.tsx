"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Building2,
  Search,
  ArrowDownRight,
  FileText,
  CreditCard,
  Plus,
  ShieldAlert,
  ChevronRight,
  Calculator,
  Loader2,
  RefreshCw,
  AlertCircle,
} from "lucide-react";
import { clsx } from "clsx";
import { vendorsApi, vendorLedgerApi } from "@/lib/api";

interface Vendor {
  id: string;
  name: string;
  type?: string;
  category?: string;
  balance?: number;
}

interface LedgerLine {
  id: string;
  date: string;
  type: string;
  ref?: string;
  reference?: string;
  description?: string;
  debit: number | null;
  credit: number | null;
}

export default function VendorLedgerPage() {
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [loadingVendors, setLoadingVendors] = useState(true);
  const [vendorError, setVendorError] = useState<string | null>(null);

  const [activeVendorId, setActiveVendorId] = useState<string | null>(null);
  const [ledgerLines, setLedgerLines] = useState<(LedgerLine & { balance: number })[]>([]);
  const [loadingLedger, setLoadingLedger] = useState(false);
  const [ledgerError, setLedgerError] = useState<string | null>(null);

  const [search, setSearch] = useState("");

  // Fetch vendors
  const fetchVendors = useCallback(async () => {
    setLoadingVendors(true);
    setVendorError(null);
    try {
      const res = await vendorsApi.getAll();
      const data: Vendor[] = res.data?.vendors ?? res.data ?? [];
      setVendors(data);
      // Auto-select first vendor
      if (data.length > 0 && !activeVendorId) {
        setActiveVendorId(data[0].id);
      }
    } catch (err) {
      console.error("Fetch error:", err);
      setVendors([]);
    } finally {
      setLoadingVendors(false);
    }
  }, []);

  // Fetch ledger when vendor changes
  const fetchLedger = useCallback(async (vendorId: string) => {
    setLoadingLedger(true);
    setLedgerError(null);
    try {
      const res = await vendorLedgerApi.getLedger(vendorId);
      const raw: LedgerLine[] = res.data?.entries ?? res.data?.ledger ?? res.data ?? [];

      // Calculate running balances
      let runningBalance = 0;
      const computed = raw.map((line) => {
        runningBalance += (line.debit || 0) - (line.credit || 0);
        return { ...line, balance: runningBalance };
      });
      setLedgerLines(computed);
    } catch (err) {
      console.error("Fetch error:", err);
      setLedgerLines([]);
    } finally {
      setLoadingLedger(false);
    }
  }, []);

  useEffect(() => {
    fetchVendors();
  }, [fetchVendors]);

  useEffect(() => {
    if (activeVendorId) fetchLedger(activeVendorId);
  }, [activeVendorId, fetchLedger]);

  const filteredVendors = vendors.filter((v) =>
    v.name.toLowerCase().includes(search.toLowerCase())
  );

  const activeVendor = vendors.find((v) => v.id === activeVendorId);
  const totalOwed = ledgerLines.length > 0 ? ledgerLines[ledgerLines.length - 1].balance : 0;

  const selectVendor = (id: string) => {
    setActiveVendorId(id);
  };

  return (
    <div className="max-w-[1400px] mx-auto h-[calc(100vh-80px)] flex gap-8 py-6 px-4 animate-in fade-in duration-700">
      {/* LEFT: VENDOR LIST */}
      <div className="w-80 flex flex-col bg-white border border-slate-100 rounded-[2rem] overflow-hidden shrink-0">
        <div className="p-6 border-b border-slate-100 bg-slate-50/50">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-[11px] font-black uppercase tracking-widest text-slate-900 flex items-center gap-2">
              <Building2 size={16} className="text-purple-500" />
              Vendor Directory
            </h2>
            <button
              onClick={fetchVendors}
              disabled={loadingVendors}
              className="p-2 rounded-xl bg-white hover:bg-slate-100 text-slate-400 border border-slate-100 shadow-sm disabled:opacity-50 transition-all active:scale-95"
            >
              <RefreshCw size={14} className={loadingVendors ? "animate-spin" : ""} />
            </button>
          </div>
          <div className="relative group">
            <Search size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-purple-500 transition-colors" />
            <input
              type="text"
              placeholder="Search directory..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-white border border-slate-100 rounded-xl text-xs font-bold text-slate-900 placeholder:text-slate-300 outline-none focus:border-purple-500 focus:ring-4 focus:ring-purple-50 transition-all"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto divide-y divide-slate-50">
          {/* Loading */}
          {loadingVendors &&
            Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="p-5 flex items-center gap-4 animate-pulse">
                <div className="w-12 h-12 rounded-2xl bg-slate-100 shrink-0" />
                <div className="flex-1 space-y-2.5">
                  <div className="h-3 bg-slate-100 rounded w-3/4" />
                  <div className="h-2.5 bg-slate-50 rounded w-1/2" />
                </div>
              </div>
            ))}

          {/* Error */}
          {!loadingVendors && vendorError && (
            <div className="p-8 text-center bg-red-50/50 m-4 rounded-2xl">
              <AlertCircle size={28} className="mx-auto text-red-300 mb-3" />
              <p className="text-xs font-bold text-red-500 mb-2">{vendorError}</p>
              <button onClick={fetchVendors} className="text-[10px] uppercase font-black tracking-widest text-orange-500 hover:text-orange-600 transition-colors">
                Retry Connection
              </button>
            </div>
          )}

          {/* Empty */}
          {!loadingVendors && !vendorError && filteredVendors.length === 0 && (
            <div className="p-10 text-center">
              <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Building2 size={24} className="text-slate-300" strokeWidth={1.5} />
              </div>
              <p className="text-xs font-bold text-slate-400">
                {search ? "No vendors match your search." : "Vendor directory is empty."}
              </p>
            </div>
          )}

          {/* Vendor list */}
          {!loadingVendors &&
            !vendorError &&
            filteredVendors.map((vendor) => {
              const isActive = vendor.id === activeVendorId;
              return (
                <button
                  key={vendor.id}
                  onClick={() => selectVendor(vendor.id)}
                  className={clsx(
                    "w-full text-left p-5 flex items-center gap-4 transition-all relative overflow-hidden group",
                    isActive
                      ? "bg-purple-50"
                      : "hover:bg-slate-50/80"
                  )}
                >
                  {isActive && <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-purple-500" />}
                  <div
                    className={clsx(
                      "w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 transition-all",
                      isActive
                        ? "bg-purple-500 text-white shadow-lg shadow-purple-500/20"
                        : "bg-slate-50 text-slate-400 group-hover:bg-white group-hover:text-purple-500 group-hover:shadow-sm"
                    )}
                  >
                    <Building2 size={20} strokeWidth={isActive ? 2 : 1.5} />
                  </div>
                  <div className="flex-1 min-w-0 pr-2">
                    <h3
                      className={clsx(
                        "text-sm font-black truncate transition-colors",
                        isActive ? "text-purple-700" : "text-slate-900 group-hover:text-purple-600"
                      )}
                    >
                      {vendor.name}
                    </h3>
                    <p className={clsx("text-[9px] uppercase tracking-[0.1em] mt-1 font-bold", isActive ? "text-purple-400" : "text-slate-400")}>
                      {vendor.type || vendor.category || "Vendor"}
                    </p>
                  </div>
                  <ChevronRight size={16} className={clsx("transition-transform group-hover:translate-x-1", isActive ? "text-purple-500" : "text-slate-300")} />
                </button>
              );
            })}
        </div>
      </div>

      {/* RIGHT: LEDGER VIEW */}
      <div className="flex-1 flex flex-col bg-white border border-slate-100 rounded-[2rem] overflow-hidden min-w-0 shadow-[0_10px_40px_rgba(0,0,0,0.02)]">
        {activeVendor ? (
          <>
            {/* Ledger Header */}
            <div className="p-8 border-b border-slate-100 flex flex-col xl:flex-row xl:items-start justify-between gap-8 bg-slate-50/30">
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-1.5 h-6 bg-purple-500 rounded-full" />
                  <span className="px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-[0.15em] bg-purple-100 text-purple-600 border border-purple-200">
                    ID: {activeVendor.id}
                  </span>
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest flex items-center gap-1.5">
                    <Calculator size={12} className="text-slate-300" />
                    Absolute Ledger Truth
                  </span>
                </div>
                <h1 className="text-3xl font-black text-slate-900 truncate max-w-2xl mb-2 tracking-tight">
                  {activeVendor.name}
                </h1>
                <p className="text-[11px] text-slate-500 font-medium max-w-lg leading-relaxed">
                  Balances calculate dynamically based solely on debits (invoices) and credits (payments). Balances are never statically stored.
                </p>
              </div>

              <div className="flex items-center gap-6 shrink-0 bg-white p-4 rounded-3xl border border-slate-100 shadow-sm">
                <div className="text-right pr-6 border-r border-slate-100">
                  <p className="text-[9px] font-black uppercase tracking-[0.15em] text-slate-400 mb-1.5">
                    Total Outstanding
                  </p>
                  {loadingLedger ? (
                    <div className="h-8 w-28 bg-slate-50 rounded-xl animate-pulse ml-auto" />
                  ) : (
                    <p className={clsx("text-2xl font-black tabular-nums tracking-tight", totalOwed > 0 ? "text-red-500" : "text-emerald-500")}>
                      {totalOwed > 0 ? "₹" : ""}
                      {totalOwed.toLocaleString()}
                    </p>
                  )}
                </div>
                <div className="flex flex-col gap-2.5">
                  <button className="flex items-center justify-center gap-2 bg-slate-900 hover:bg-black text-white px-5 py-2.5 rounded-xl font-black text-[10px] uppercase tracking-widest shadow-lg shadow-slate-900/10 active:translate-y-0.5 transition-all min-w-[140px]">
                    <CreditCard size={14} /> Log Payment
                  </button>
                  <button className="flex items-center justify-center gap-2 bg-slate-50 hover:bg-slate-100 text-slate-600 border border-slate-200 px-5 py-2.5 rounded-xl font-black text-[10px] uppercase tracking-widest shadow-sm active:scale-95 transition-all min-w-[140px]">
                    <Plus size={14} /> Add Advance
                  </button>
                </div>
              </div>
            </div>

            {/* Ledger Table */}
            <div className="flex-1 overflow-hidden flex flex-col bg-white">
              <div className="overflow-x-auto flex-1">
                <table className="w-full text-left border-collapse min-w-[700px]">
                  <thead className="sticky top-0 bg-slate-50/80 backdrop-blur-md z-10 border-b border-slate-100">
                    <tr className="text-[10px] uppercase font-black tracking-widest text-slate-400">
                      <th className="px-8 py-5">Date</th>
                      <th className="px-8 py-5">Reference</th>
                      <th className="px-8 py-5">Entry Type</th>
                      <th className="px-8 py-5 text-right">
                        Debit <span className="text-red-400 ml-1">(+)</span>
                      </th>
                      <th className="px-8 py-5 text-right">
                        Credit <span className="text-emerald-400 ml-1">(-)</span>
                      </th>
                      <th className="px-8 py-5 text-right">Running Balance</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {/* Loading skeleton */}
                    {loadingLedger &&
                      Array.from({ length: 5 }).map((_, i) => (
                        <tr key={i} className="animate-pulse">
                          {Array.from({ length: 6 }).map((_, j) => (
                            <td key={j} className="px-8 py-5">
                              <div className="h-4 bg-slate-50 rounded-md w-full" />
                            </td>
                          ))}
                        </tr>
                      ))}

                    {/* Error */}
                    {!loadingLedger && ledgerError && (
                      <tr>
                        <td colSpan={6} className="px-8 py-16 text-center">
                          <div className="w-16 h-16 bg-red-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                            <AlertCircle size={28} className="text-red-400" />
                          </div>
                          <p className="text-sm font-bold text-red-500 mb-2">{ledgerError}</p>
                          <button
                            onClick={() => activeVendorId && fetchLedger(activeVendorId)}
                            className="text-[10px] uppercase font-black tracking-widest text-orange-500 hover:text-orange-600 transition-colors"
                          >
                            Retry Request
                          </button>
                        </td>
                      </tr>
                    )}

                    {/* Empty */}
                    {!loadingLedger && !ledgerError && ledgerLines.length === 0 && (
                      <tr>
                        <td colSpan={6} className="px-8 py-20 text-center">
                          <div className="w-20 h-20 bg-slate-50 rounded-3xl flex items-center justify-center mx-auto mb-5">
                            <ShieldAlert size={32} className="text-slate-300" strokeWidth={1} />
                          </div>
                          <p className="text-xs font-black uppercase tracking-[0.15em] text-slate-400 mb-1">
                            Blank Ledger
                          </p>
                          <p className="text-[11px] font-medium text-slate-400">
                            Operational entries will sequentially appear here once recorded.
                          </p>
                        </td>
                      </tr>
                    )}

                    {/* Data rows */}
                    {!loadingLedger &&
                      !ledgerError &&
                      ledgerLines.map((line) => (
                        <tr key={line.id} className="hover:bg-slate-50/50 transition-colors group">
                          <td className="px-8 py-5">
                            <p className="font-bold text-slate-900 uppercase text-[11px] tracking-wide">
                              {new Date(line.date).toLocaleDateString("en-IN", {
                                day: "2-digit",
                                month: "short",
                                year: "numeric",
                              })}
                            </p>
                          </td>
                          <td className="px-8 py-5">
                            <p className="font-black text-slate-700 text-xs">
                              {line.ref || line.reference || line.description || "—"}
                            </p>
                          </td>
                          <td className="px-8 py-5">
                            {line.type === "PO" || line.type === "INVOICE" || line.type === "PURCHASE" ? (
                              <span className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-[0.1em] bg-red-50 text-red-600">
                                <FileText size={12} /> Purchase Invoice
                              </span>
                            ) : line.type === "PAYMENT" ? (
                              <span className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-[0.1em] bg-emerald-50 text-emerald-600">
                                <ArrowDownRight size={12} /> Payment Sent
                              </span>
                            ) : line.type === "ADVANCE" ? (
                              <span className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-[0.1em] bg-indigo-50 text-indigo-600">
                                <Plus size={12} /> Cash Advance
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-[0.1em] bg-slate-100 text-slate-600">
                                {line.type || "System Entry"}
                              </span>
                            )}
                          </td>
                          <td className="px-8 py-5 text-right">
                            {line.debit ? (
                              <span className="font-black text-red-500 tabular-nums">₹{line.debit.toLocaleString()}</span>
                            ) : (
                              <span className="text-slate-300">-</span>
                            )}
                          </td>
                          <td className="px-8 py-5 text-right">
                            {line.credit ? (
                              <span className="font-black text-emerald-500 tabular-nums">₹{line.credit.toLocaleString()}</span>
                            ) : (
                              <span className="text-slate-300">-</span>
                            )}
                          </td>
                          <td className="px-8 py-5 text-right">
                            <span
                              className={clsx(
                                "font-black text-sm tabular-nums",
                                line.balance > 0 ? "text-slate-900" : "text-emerald-500"
                              )}
                            >
                              ₹{line.balance.toLocaleString()}
                            </span>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center p-20 text-center text-slate-400 bg-slate-50/30">
            <div className="w-24 h-24 bg-white rounded-[2rem] shadow-sm border border-slate-100 flex items-center justify-center mb-6">
              <Building2 size={40} className="text-slate-300" strokeWidth={1} />
            </div>
            <h3 className="text-lg font-black text-slate-900 mb-2">Select a Vendor Record</h3>
            <p className="text-xs max-w-sm mx-auto leading-relaxed">
              Choose a business entity from the sidebar to inspect their immutable source of truth ledger.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
