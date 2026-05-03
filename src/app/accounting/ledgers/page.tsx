"use client";

import { useState } from "react";
import { 
  Building2, 
  Search, 
  ArrowUpRight, 
  ArrowDownRight, 
  FileText, 
  CreditCard,
  Plus,
  ShieldAlert,
  ChevronRight,
  Calculator
} from "lucide-react";
import { clsx } from "clsx";

// MOCK VENDORS
const MOCK_VENDORS = [
  { id: "V-001", name: "Spice Valley Suppliers", type: "Wholesale" },
  { id: "V-002", name: "Fresh Farms Organics", type: "Raw Material" },
  { id: "V-003", name: "Metro Packaging Hub", type: "Packaging" },
];

// MOCK LEDGER (Dynamically calculated balance)
const MOCK_LEDGER_DATA: Record<string, { id: string, date: string, type: string, ref: string, debit: number | null, credit: number | null }[]> = {
  "V-001": [
    { id: "L-1", date: "2026-04-20T10:00:00Z", type: "PO", ref: "PO-102", debit: 50000, credit: null },
    { id: "L-2", date: "2026-04-22T09:30:00Z", type: "PAYMENT", ref: "PAY-104", debit: null, credit: 30000 },
    { id: "L-3", date: "2026-04-27T14:15:00Z", type: "PO", ref: "PO-108", debit: 12000, credit: null },
    { id: "L-4", date: "2026-04-28T11:00:00Z", type: "ADVANCE", ref: "PAY-109", debit: null, credit: 5000 },
  ],
  "V-002": [
    { id: "L-5", date: "2026-04-28T08:00:00Z", type: "PO", ref: "PO-109", debit: 8000, credit: null },
    { id: "L-6", date: "2026-04-28T09:00:00Z", type: "PAYMENT", ref: "PAY-110", debit: null, credit: 8000 },
  ]
};

export default function VendorLedgerPage() {
  const [activeVendorId, setActiveVendorId] = useState<string | null>(MOCK_VENDORS[0].id);
  const [search, setSearch] = useState("");

  const vendors = MOCK_VENDORS.filter(v => v.name.toLowerCase().includes(search.toLowerCase()));
  const activeVendor = MOCK_VENDORS.find(v => v.id === activeVendorId);
  const rawLedgerLines = MOCK_LEDGER_DATA[activeVendorId || ""] || [];

  // DYNAMIC LEDGER CALCULATION (Source of Truth)
  // balance = sum(debit) - sum(credit)
  let runningBalance = 0;
  const ledgerLines = rawLedgerLines.map(line => {
    runningBalance = runningBalance + (line.debit || 0) - (line.credit || 0);
    return { ...line, balance: runningBalance };
  });

  const totalOwed = runningBalance;

  return (
    <div className="max-w-[1400px] mx-auto h-[calc(100vh-80px)] flex gap-6">
      
      {/* LEFT: VENDOR LIST */}
      <div className="w-80 flex flex-col bg-white dark:bg-card border border-gray-100 dark:border-white/5 rounded-3xl shadow-sm overflow-hidden shrink-0">
        <div className="p-5 border-b border-gray-100 dark:border-white/5 bg-gray-50/50 dark:bg-white/[0.02]">
          <h2 className="text-sm font-black uppercase tracking-widest text-gray-900 dark:text-white flex items-center gap-2 mb-4">
            <Building2 size={16} className="text-purple-500" />
            Vendor Directory
          </h2>
          <div className="relative">
             <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
             <input 
               type="text" 
               placeholder="Search vendor..." 
               value={search}
               onChange={(e) => setSearch(e.target.value)}
               className="w-full pl-9 pr-4 py-2.5 bg-white dark:bg-black/20 border border-gray-200 dark:border-white/10 rounded-xl text-xs font-bold outline-none focus:border-purple-500 transition-colors"
             />
          </div>
        </div>
        
        <div className="flex-1 overflow-y-auto divide-y divide-gray-50 dark:divide-white/5">
          {vendors.map(vendor => {
            const isActive = vendor.id === activeVendorId;
            return (
              <button 
                key={vendor.id}
                onClick={() => setActiveVendorId(vendor.id)}
                className={clsx(
                  "w-full text-left p-4 flex items-center gap-3 transition-all relative overflow-hidden",
                  isActive ? "bg-purple-50/50 dark:bg-purple-900/10" : "hover:bg-gray-50 dark:hover:bg-white/[0.01]"
                )}
              >
                {isActive && <div className="absolute left-0 top-0 bottom-0 w-1 bg-purple-500" />}
                <div className={clsx("w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border transition-colors", 
                   isActive ? "bg-purple-500 text-white border-purple-600 shadow-sm" : "bg-gray-100 dark:bg-white/5 text-gray-400 border-gray-200 dark:border-transparent")}>
                  <Building2 size={16} />
                </div>
                <div className="flex-1 min-w-0 pr-2">
                  <h3 className={clsx("text-xs font-bold truncate", isActive ? "text-purple-700 dark:text-purple-300" : "text-gray-900 dark:text-white")}>{vendor.name}</h3>
                  <p className="text-[9px] text-gray-400 uppercase tracking-widest mt-1 font-bold">{vendor.type}</p>
                </div>
                <ChevronRight size={14} className={clsx(isActive ? "text-purple-500" : "text-gray-300")} />
              </button>
            )
          })}
        </div>
      </div>

      {/* RIGHT: LEDGER VIEW */}
      <div className="flex-1 flex flex-col bg-white dark:bg-card border border-gray-100 dark:border-white/5 rounded-3xl shadow-sm overflow-hidden min-w-0">
        {activeVendor ? (
          <>
            {/* Ledger Header */}
            <div className="p-6 border-b border-gray-100 dark:border-white/5 flex flex-col xl:flex-row xl:items-start justify-between gap-6 bg-gray-50/50 dark:bg-white/[0.02]">
               <div>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-widest bg-purple-100 dark:bg-purple-500/20 text-purple-600 dark:text-purple-400">
                      {activeVendor.id}
                    </span>
                    <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest"><Calculator size={10} className="inline mr-1 -mt-0.5" /> Source of Truth Ledger</span>
                  </div>
                  <h1 className="text-2xl font-black text-gray-900 dark:text-white truncate max-w-lg mb-1">{activeVendor.name}</h1>
                  <p className="text-xs text-gray-500 font-medium max-w-sm">
                    This ledger strictly calculates balances dynamically based on invoices (debits) and payments (credits). The balance is never stored statically.
                  </p>
               </div>

               <div className="flex items-center gap-4 shrink-0">
                  <div className="text-right pr-4 border-r border-gray-200 dark:border-white/10">
                     <p className="text-[10px] font-black uppercase tracking-[0.15em] text-gray-400 mb-1">Total Outstanding</p>
                     <p className={clsx("text-2xl font-black", totalOwed > 0 ? "text-red-500" : "text-emerald-500")}>
                        {totalOwed > 0 ? '₹' : ''}{totalOwed.toLocaleString()}
                     </p>
                  </div>
                  <div className="flex flex-col gap-2">
                     <button className="flex items-center justify-center gap-2 bg-emerald-500 hover:bg-emerald-400 text-white px-4 py-2 rounded-xl font-black text-[10px] uppercase tracking-widest shadow-sm active:scale-95 transition-all w-40">
                       <CreditCard size={14} /> Record Payment
                     </button>
                     <button className="flex items-center justify-center gap-2 bg-indigo-500 hover:bg-indigo-400 text-white px-4 py-2 rounded-xl font-black text-[10px] uppercase tracking-widest shadow-sm active:scale-95 transition-all w-40">
                       <Plus size={14} /> Add Advance
                     </button>
                  </div>
               </div>
            </div>

            {/* Ledger Table */}
            <div className="flex-1 overflow-hidden flex flex-col">
              <div className="overflow-x-auto flex-1">
                <table className="w-full text-left border-collapse min-w-[700px]">
                  <thead className="sticky top-0 bg-white dark:bg-[#1a1f2b] z-10 shadow-sm border-b border-gray-100 dark:border-white/5">
                    <tr className="text-[10px] uppercase font-black tracking-widest text-gray-400">
                      <th className="px-6 py-4">Date</th>
                      <th className="px-6 py-4">Reference</th>
                      <th className="px-6 py-4">Type</th>
                      <th className="px-6 py-4 text-right">Debit <span className="text-red-400">(+)</span></th>
                      <th className="px-6 py-4 text-right">Credit <span className="text-emerald-400">(-)</span></th>
                      <th className="px-6 py-4 text-right">Running Balance</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50 dark:divide-white/5 text-sm">
                    {ledgerLines.map(line => (
                      <tr key={line.id} className="hover:bg-gray-50/80 dark:hover:bg-white/[0.02] transition-colors">
                        <td className="px-6 py-4">
                          <p className="font-bold text-gray-900 dark:text-white uppercase text-xs">
                            {new Date(line.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                          </p>
                        </td>
                        <td className="px-6 py-4">
                          <p className="font-black text-gray-700 dark:text-gray-300 text-xs">{line.ref}</p>
                        </td>
                        <td className="px-6 py-4">
                          {line.type === 'PO' ? (
                            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-widest bg-red-50 dark:bg-red-500/10 text-red-500">
                              <FileText size={10} /> PO Invoice
                            </span>
                          ) : line.type === 'PAYMENT' ? (
                            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-widest bg-emerald-50 dark:bg-emerald-500/10 text-emerald-500">
                              <ArrowDownRight size={10} /> Payment
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-widest bg-indigo-50 dark:bg-indigo-500/10 text-indigo-500">
                              <Plus size={10} /> Advance Paid
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4 text-right">
                          {line.debit ? (
                            <span className="font-black text-red-500">
                               ₹{line.debit.toLocaleString()}
                            </span>
                          ) : (
                            <span className="text-gray-300 dark:text-white/10">-</span>
                          )}
                        </td>
                        <td className="px-6 py-4 text-right">
                          {line.credit ? (
                            <span className="font-black text-emerald-500">
                               ₹{line.credit.toLocaleString()}
                            </span>
                          ) : (
                            <span className="text-gray-300 dark:text-white/10">-</span>
                          )}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <span className={clsx("font-black", line.balance > 0 ? "text-gray-900 dark:text-white" : "text-emerald-500")}>
                             ₹{line.balance.toLocaleString()}
                          </span>
                        </td>
                      </tr>
                    ))}
                    
                    {ledgerLines.length === 0 && (
                      <tr>
                        <td colSpan={6} className="px-6 py-16 text-center">
                          <ShieldAlert size={32} className="mx-auto text-gray-300 mb-3" />
                          <p className="text-sm font-black uppercase tracking-widest text-gray-400">No Ledger Entries</p>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center p-12 text-center text-gray-400">
            <Building2 size={48} className="mb-4 opacity-20" />
            <h3 className="text-base font-black text-gray-900 dark:text-white mb-2">Select a Vendor</h3>
            <p className="text-sm max-w-sm mx-auto">Choose a vendor from the directory to trace their absolute source of truth ledger and payments.</p>
          </div>
        )}
      </div>

    </div>
  );
}
