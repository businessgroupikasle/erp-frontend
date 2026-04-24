"use client";

import { useState, useEffect } from "react";
import { X, ArrowDownLeft, ArrowUpRight, History, Info } from "lucide-react";
import { vendorsApi } from "@/lib/api";
import { clsx } from "clsx";

interface LedgerEntry {
  id: string;
  type: 'CREDIT' | 'DEBIT';
  amount: number;
  referenceType: string;
  referenceId: string;
  note: string;
  createdAt: string;
  runningBalance: number;
}

export default function VendorLedgerModal({ vendor, onClose }: { vendor: any; onClose: () => void }) {
  const [ledger, setLedger] = useState<LedgerEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'ALL' | 'PAYMENTS' | 'PURCHASES'>('ALL');

  useEffect(() => {
    fetchLedger();
  }, [vendor.id]);

  const fetchLedger = async () => {
    setLoading(true);
    try {
      const res = await vendorsApi.getLedger(vendor.id);
      setLedger(res.data);
    } catch (error) {
      console.error("Failed to fetch ledger", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredLedger = ledger.filter(entry => {
    if (activeTab === 'PAYMENTS') return entry.referenceType === 'PAYMENT' || entry.referenceType === 'ADVANCE';
    if (activeTab === 'PURCHASES') return entry.referenceType === 'PO';
    return true;
  });

  const isAdvance = vendor.balance >= 0;

  return (
    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
      <div className="bg-white border border-[#F0EAF0] w-full max-w-4xl rounded-3xl shadow-2xl shadow-slate-200/60 flex flex-col max-h-[90vh]">

        {/* Header */}
        <div className="px-8 py-6 border-b border-[#F0EAF0] flex items-center justify-between rounded-t-3xl bg-gradient-to-r from-violet-50 to-white">
          <div>
            <h2 className="text-xl font-black text-[#1A1A1A] flex items-center gap-3">
              <div className="w-10 h-10 bg-[#7C3AED]/10 rounded-xl flex items-center justify-center">
                <History className="w-5 h-5 text-[#7C3AED]" />
              </div>
              Financial Ledger: {vendor.name}
            </h2>
            <p className="text-sm text-[#999] mt-1 font-medium">Append-only audit-proof transaction history</p>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-slate-100 text-[#999] hover:text-[#1A1A1A] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Filters & Summary */}
        <div className="px-8 py-4 bg-slate-50/70 border-b border-[#F0EAF0] flex items-center justify-between">
          <div className="flex bg-white p-1 rounded-xl border border-[#F0EAF0] shadow-sm">
            {(['ALL', 'PURCHASES', 'PAYMENTS'] as const).map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={clsx(
                  "px-5 py-2 rounded-lg text-sm font-bold transition-all",
                  activeTab === tab
                    ? "bg-[#7C3AED] text-white shadow-lg shadow-purple-200"
                    : "text-[#999] hover:text-[#1A1A1A]"
                )}
              >
                {tab === 'ALL' ? 'All History' : tab.charAt(0) + tab.slice(1).toLowerCase()}
              </button>
            ))}
          </div>

          <div className="text-right">
            <p className="text-[10px] text-[#999] uppercase tracking-[0.15em] font-bold mb-0.5">Net Balance</p>
            <p className={clsx(
              "text-2xl font-black tracking-tight",
              isAdvance ? "text-emerald-600" : "text-rose-600"
            )}>
              ₹{Math.abs(vendor.balance).toLocaleString()}
              <span className="text-xs ml-1.5 font-semibold opacity-70">
                {isAdvance ? "(Advance)" : "(Owed)"}
              </span>
            </p>
          </div>
        </div>

        {/* Ledger Table */}
        <div className="flex-1 overflow-auto px-6 py-4">
          {loading ? (
            <div className="h-64 flex flex-col items-center justify-center gap-4">
              <div className="w-10 h-10 border-4 border-[#7C3AED]/20 border-t-[#7C3AED] rounded-full animate-spin" />
              <p className="text-[#999] text-sm font-medium animate-pulse">Calculating balances...</p>
            </div>
          ) : filteredLedger.length === 0 ? (
            <div className="h-64 flex flex-col items-center justify-center text-[#CCC] border-2 border-dashed border-[#F0EAF0] rounded-2xl">
              <History className="w-10 h-10 mb-3 opacity-30" />
              <p className="text-sm font-bold text-[#999]">No transactions matching your filter</p>
            </div>
          ) : (
            <table className="w-full text-left border-separate border-spacing-y-2">
              <thead>
                <tr className="text-[10px] font-black text-[#999] uppercase tracking-[0.15em]">
                  <th className="pb-3 pl-4">Date</th>
                  <th className="pb-3">Reference / Note</th>
                  <th className="pb-3">Type</th>
                  <th className="pb-3 text-right">Amount</th>
                  <th className="pb-3 pr-4 text-right">Running Balance</th>
                </tr>
              </thead>
              <tbody>
                {filteredLedger.map((entry) => (
                  <tr
                    key={entry.id}
                    className="bg-white hover:bg-slate-50/80 border border-[#F7F0F7] rounded-xl overflow-hidden transition-colors"
                  >
                    <td className="py-4 pl-4 rounded-l-xl border-y border-l border-[#F0EAF0]">
                      <div className="flex flex-col">
                        <span className="text-sm text-[#1A1A1A] font-bold whitespace-nowrap">
                          {new Date(entry.createdAt).toLocaleDateString()}
                        </span>
                        <span className="text-[10px] text-[#999] font-medium">
                          {new Date(entry.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    </td>
                    <td className="py-4 border-y border-[#F0EAF0]">
                      <div className="flex flex-col max-w-[250px]">
                        <span className="text-[10px] font-black text-[#7C3AED] uppercase tracking-widest flex items-center gap-1">
                          <Info className="w-3 h-3" />
                          {entry.referenceType}
                          {entry.referenceId && (
                            <span className="text-[#CCC]">#{entry.referenceId.substring(0, 6).toUpperCase()}</span>
                          )}
                        </span>
                        <span className="text-sm text-[#444] font-medium truncate">{entry.note}</span>
                      </div>
                    </td>
                    <td className="py-4 border-y border-[#F0EAF0]">
                      <span className={clsx(
                        "px-3 py-1 rounded-lg text-[10px] font-black tracking-widest uppercase border",
                        entry.type === 'CREDIT'
                          ? "bg-emerald-50 text-emerald-700 border-emerald-100"
                          : "bg-rose-50 text-rose-700 border-rose-100"
                      )}>
                        {entry.type}
                      </span>
                    </td>
                    <td className="py-4 text-right border-y border-[#F0EAF0]">
                      <div className={clsx(
                        "text-sm font-black flex items-center justify-end gap-1",
                        entry.type === 'CREDIT' ? "text-emerald-600" : "text-rose-600"
                      )}>
                        {entry.type === 'CREDIT'
                          ? <ArrowDownLeft className="w-3 h-3" />
                          : <ArrowUpRight className="w-3 h-3" />
                        }
                        ₹{entry.amount.toLocaleString()}
                      </div>
                    </td>
                    <td className="py-4 pr-4 text-right rounded-r-xl border-y border-r border-[#F0EAF0]">
                      <div className={clsx(
                        "text-sm font-black font-mono px-3 py-1.5 rounded-xl inline-block",
                        entry.runningBalance >= 0
                          ? "bg-emerald-50 text-emerald-700 border border-emerald-100"
                          : "bg-rose-50 text-rose-700 border border-rose-100"
                      )}>
                        ₹{entry.runningBalance.toLocaleString()}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Footer */}
        <div className="px-8 py-5 border-t border-[#F0EAF0] flex justify-between items-center rounded-b-3xl bg-slate-50/50">
          <div className="flex gap-5 text-xs text-[#999] font-semibold">
            <span className="flex items-center gap-1.5">
              <ArrowUpRight className="w-3 h-3 text-rose-500" /> DEBIT = Purchase/Cost
            </span>
            <span className="flex items-center gap-1.5">
              <ArrowDownLeft className="w-3 h-3 text-emerald-500" /> CREDIT = Payment/Advance
            </span>
          </div>
          <button
            onClick={onClose}
            className="px-6 py-2.5 bg-[#1A1A1A] hover:bg-[#333] text-white font-bold text-sm rounded-xl transition-all"
          >
            Close Viewer
          </button>
        </div>
      </div>
    </div>
  );
}
