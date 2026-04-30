"use client";

import React from 'react';
import { IndianRupee, Printer, X, CheckCircle, Clock } from 'lucide-react';
import { clsx } from 'clsx';

interface POItem {
  inventoryItemId: string;
  itemName: string;
  unit: string;
  quantity: number;
  price: number;
  hsnCode: string;
  gstRate: number;
}

interface GSTInvoiceProps {
  order: any;
  vendor: any;
  companyDetails: {
    name: string;
    address: string;
    gstin: string;
    state: string;
    email: string;
    phone: string;
  };
  onClose: () => void;
}

export default function GSTInvoice({ order, vendor, companyDetails, onClose }: GSTInvoiceProps) {
  // Safe helper to avoid NaN
  const safe = (val: any) => Number(val) || 0;
  
  const items = (order.poItems || order.items || []) as POItem[];
  
  // Accounting Logic (Standard India GST)
  const round = (n: number) => Math.round(n * 100) / 100;
  
  // Place of Supply Detection
  const companyState = (companyDetails?.state || "Unknown").toLowerCase();
  const vendorState = (vendor?.state || "Unknown").toLowerCase();
  
  const isSameState = 
    vendorState.includes(companyState) ||
    companyState.includes(vendorState);
  
  const taxableSubtotal = items.reduce((s, it) => s + (safe(it.quantity) * safe(it.price)), 0);
  
  const taxBreakdown = items.reduce((acc, it) => {
    const qty = safe(it.quantity);
    const rate = safe(it.price);
    const gstRate = safe(it.gstRate);
    
    const amt = qty * rate;
    const tax = amt * (gstRate / 100);
    
    if (isSameState) {
      acc.cgst += round(tax / 2);
      acc.sgst += round(tax / 2);
    } else {
      acc.igst += round(tax);
    }
    return acc;
  }, { cgst: 0, sgst: 0, igst: 0 });

  const totalTax = round(taxBreakdown.cgst + taxBreakdown.sgst + taxBreakdown.igst);
  const grandTotal = round(taxableSubtotal + totalTax);
  const totalPaid = safe(order.paid || order.advancePaid);
  const balance = Math.max(0, grandTotal - totalPaid);

  // Status Badge Logic
  const getStatusInfo = () => {
    if (balance <= 0.01 && grandTotal > 0) return { label: "PAID", color: "bg-emerald-100 text-emerald-700 border-emerald-200" };
    if (totalPaid > 0 && balance > 0.01) return { label: "PARTIAL", color: "bg-blue-100 text-blue-700 border-blue-200" };
    return { label: "DUE", color: "bg-rose-100 text-rose-700 border-rose-200" };
  };
  const statusInfo = getStatusInfo();

  const handlePrint = () => {
    window.print();
  };

  const fmt = (n: number) => safe(n).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  return (
    <div className="fixed inset-0 z-[100] flex items-start justify-center bg-black/80 backdrop-blur-md p-4 md:p-10 overflow-y-auto no-scrollbar print:p-0 print:bg-white print:backdrop-blur-0">
      {/* Action Bar (Hidden on Print) */}
      <div className="fixed top-6 right-10 flex gap-3 print:hidden z-[110]">
        <button 
          onClick={handlePrint}
          className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white px-6 py-3 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-indigo-500/20 transition-all hover:-translate-y-0.5 active:translate-y-0"
        >
          <Printer size={16} /> Print
        </button>
        <button 
          onClick={handlePrint}
          className="flex items-center gap-2 bg-white dark:bg-slate-800 text-slate-900 dark:text-white px-6 py-3 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl border border-slate-200 dark:border-white/10 transition-all hover:-translate-y-0.5"
        >
          <div className="w-5 h-5 bg-orange-500 rounded-lg flex items-center justify-center text-white mr-1 group-hover:rotate-12 transition-transform">
            <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3" className="w-3 h-3"><path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M7.5 12l4.5 4.5m0 0l4.5-4.5M12 3v13.5" /></svg>
          </div>
          Download PDF
        </button>
        <button 
          onClick={onClose}
          className="p-3 bg-white/10 hover:bg-red-500 hover:text-white text-white rounded-2xl backdrop-blur-md border border-white/10 transition-all"
        >
          <X size={20} />
        </button>
      </div>

      {/* Invoice Container with Responsive Scaling */}
      <div className="w-full max-w-4xl bg-white dark:bg-[#0a0b10] rounded-[2.5rem] shadow-[0_32px_64px_-16px_rgba(0,0,0,0.3)] overflow-hidden print:shadow-none print:rounded-none print:max-w-full origin-top transform scale-[0.85] md:scale-90 lg:scale-100 my-10 md:my-0">
        {/* Header Ribbon */}
        <div className="h-2 bg-gradient-to-r from-orange-500 via-indigo-600 to-indigo-800 print:hidden" />
        
        <div className="p-10 md:p-14 space-y-12">
          {/* Top Section: Branding & Info */}
          <div className="flex flex-col md:flex-row justify-between gap-10">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-indigo-500/20">
                  <IndianRupee size={28} strokeWidth={2.5} />
                </div>
                <div>
                  <h1 className="text-3xl font-black tracking-tighter text-slate-900 dark:text-white uppercase">
                    {companyDetails.name}
                  </h1>
                  <p className="text-[10px] font-black uppercase tracking-[0.3em] text-indigo-500">Premium ERP Solutions</p>
                </div>
              </div>
              <div className="text-sm text-slate-500 dark:text-slate-400 font-medium leading-relaxed max-w-xs">
                {companyDetails.address}<br />
                <span className="font-bold text-indigo-600 dark:text-indigo-400 tracking-wider">GSTIN: {companyDetails.gstin}</span><br />
                {companyDetails.phone}
              </div>
            </div>

            <div className="text-left md:text-right space-y-3 pt-2">
              <h2 className="text-[11px] font-black uppercase tracking-[0.4em] text-indigo-600 dark:text-indigo-400 flex items-center md:justify-end gap-3">
                <div className="w-10 h-px bg-indigo-500/20 print:hidden" />
                Tax Invoice
              </h2>
              <div className="space-y-1">
                <p className="text-4xl font-black text-slate-900 dark:text-white tracking-tighter opacity-90">
                  {order.poNumber || `INV-${new Date().getFullYear()}-${order.id?.slice(-4).toUpperCase() || '0001'}`}
                </p>
                <div className="flex flex-col md:items-end gap-1">
                   <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">
                     Date: {new Date(order.createdAt || Date.now()).toLocaleDateString('en-GB')}
                   </p>
                   <div className={clsx(
                     "inline-flex items-center px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border",
                     statusInfo.color
                   )}>
                     {statusInfo.label}
                   </div>
                </div>
              </div>
            </div>
          </div>

          {/* Billing Info Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 border-y border-slate-100 dark:border-white/5 py-12">
            <div className="space-y-4">
              <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-indigo-500" /> Bill From
              </h3>
              <div className="space-y-1">
                <p className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight">{companyDetails.name}</p>
                <p className="text-sm text-slate-500 font-medium leading-relaxed opacity-80">{companyDetails.address}</p>
                <div className="pt-2">
                   <span className="px-2 py-1 bg-slate-100 dark:bg-white/5 rounded text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                     Place of Supply: {companyDetails.state}
                   </span>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-orange-500" /> Bill To
              </h3>
              <div className="space-y-1">
                <p className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight">{vendor.name}</p>
                <p className="text-sm text-slate-500 font-medium leading-relaxed opacity-80">{vendor.address || 'Address not provided'}</p>
                <div className="flex flex-col gap-1.5 mt-3">
                  <p className="text-[11px] font-bold text-indigo-600 dark:text-indigo-400 tracking-wider">GSTIN: {vendor.gstin || 'NOT PROVIDED'}</p>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Contact: {vendor.contact || vendor.phone || 'N/A'}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Item Table */}
          <div className="space-y-6">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-white/10 text-[10px] font-black uppercase tracking-widest text-slate-400">
                    <th className="py-5 px-2">#</th>
                    <th className="py-5 px-2">Item Description</th>
                    <th className="py-5 px-2">HSN</th>
                    <th className="py-5 px-2 text-right">Qty</th>
                    <th className="py-5 px-2 text-right">Rate</th>
                    <th className="py-5 px-2 text-right">GST %</th>
                    <th className="py-5 px-2 text-right">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-white/5">
                  {items.map((item, idx) => (
                    <tr key={idx} className="group hover:bg-slate-50 dark:hover:bg-white/[0.01] transition-colors">
                      <td className="py-6 px-2 text-xs font-bold text-slate-400">{String(idx + 1).padStart(2, '0')}</td>
                      <td className="py-6 px-2">
                        <p className="text-sm font-black text-slate-800 dark:text-white uppercase tracking-tight leading-none">{item.itemName}</p>
                        <p className="text-[10px] text-slate-400 font-bold mt-1 uppercase opacity-60">Inventory ID: {item.inventoryItemId?.slice(-6) || '---'}</p>
                      </td>
                      <td className="py-6 px-2 text-xs font-bold text-slate-500 font-mono italic tracking-tighter">{item.hsnCode || 'N/A'}</td>
                      <td className="py-6 px-2 text-right text-sm font-bold text-slate-700 dark:text-slate-300">
                        {safe(item.quantity)} <span className="text-[10px] font-black uppercase text-slate-400 ml-1">{item.unit || 'unit'}</span>
                      </td>
                      <td className="py-6 px-2 text-right text-sm font-black text-slate-900 dark:text-white">₹{fmt(safe(item.price))}</td>
                      <td className="py-6 px-2 text-right">
                        <span className="px-2 py-1 bg-indigo-50 dark:bg-indigo-500/10 rounded text-[11px] font-black text-indigo-600 dark:text-indigo-400">
                          {safe(item.gstRate)}%
                        </span>
                      </td>
                      <td className="py-6 px-2 text-right text-sm font-black text-slate-900 dark:text-white tabular-nums">₹{fmt(safe(item.quantity) * safe(item.price))}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Footer & Totals */}
          <div className="flex flex-col md:flex-row justify-between items-start gap-16 pt-8">
            <div className="flex-1 space-y-8">
              <div className="p-8 bg-slate-50 dark:bg-white/[0.02] rounded-[2rem] border border-slate-100 dark:border-white/5 relative overflow-hidden group">
                <div className="absolute top-0 left-0 w-1 h-full bg-indigo-500/30" />
                <h4 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4">Terms & Conditions</h4>
                <ul className="text-[10px] text-slate-500/90 font-bold space-y-2 list-none tracking-wide">
                  <li className="flex items-center gap-2 underline decoration-indigo-500/20 underline-offset-4">1. Payment is expected within established vendor terms.</li>
                  <li className="flex items-center gap-2 underline decoration-indigo-500/20 underline-offset-4">2. HSN Classification is based on material category.</li>
                  <li className="flex items-center gap-2 underline decoration-indigo-500/20 underline-offset-4">3. Goods received must match the PO quality standards.</li>
                </ul>
              </div>
              <div className="flex flex-col gap-6 w-full max-w-xs">
                <div className="h-px bg-slate-200 dark:bg-white/10 w-full" />
                <div className="text-center">
                  <p className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400 mb-2">Authorized Seal & Signature</p>
                  <div className="h-12 border-2 border-dashed border-slate-100 dark:border-white/5 rounded-2xl" />
                </div>
              </div>
            </div>

            <div className="w-full md:w-[380px] space-y-8 print:w-full">
              {/* Premium Total Card */}
              <div className="bg-slate-900 dark:bg-white dark:text-slate-900 text-white p-10 rounded-[3rem] shadow-2xl relative overflow-hidden group">
                {/* Decorative Elements */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 dark:bg-slate-900/5 -mr-16 -mt-16 rounded-full blur-3xl group-hover:bg-indigo-500/10 transition-all duration-700" />
                
                <div className="relative space-y-6">
                  <div className="flex justify-between items-center opacity-60">
                    <span className="text-[11px] font-black uppercase tracking-[0.3em]">Gross Taxable</span>
                    <span className="text-lg font-black tabular-nums tracking-tight">₹{fmt(taxableSubtotal)}</span>
                  </div>
                  
                  <div className="h-px bg-white/10 dark:bg-slate-200" />
                  
                  <div className="space-y-4">
                    {isSameState ? (
                      <>
                        <div className="flex justify-between items-center opacity-60">
                          <span className="text-[11px] font-black uppercase tracking-[0.3em]">CGST Output</span>
                          <span className="text-sm font-black tabular-nums">₹{fmt(taxBreakdown.cgst)}</span>
                        </div>
                        <div className="flex justify-between items-center opacity-60">
                          <span className="text-[11px] font-black uppercase tracking-[0.3em]">SGST Output</span>
                          <span className="text-sm font-black tabular-nums">₹{fmt(taxBreakdown.sgst)}</span>
                        </div>
                      </>
                    ) : (
                      <div className="flex justify-between items-center opacity-60">
                        <span className="text-[11px] font-black uppercase tracking-[0.3em]">IGST Integrated</span>
                        <span className="text-sm font-black tabular-nums">₹{fmt(taxBreakdown.igst)}</span>
                      </div>
                    )}
                  </div>

                  <div className="pt-8 mt-4 border-t-2 border-indigo-500/30 dark:border-indigo-100 flex justify-between items-end">
                    <div className="space-y-1">
                      <span className="text-[13px] font-black uppercase tracking-[0.3em] text-indigo-400 dark:text-indigo-600">Grand Total</span>
                      <p className="text-[10px] font-bold opacity-40 uppercase tracking-widest leading-none">Net Payable</p>
                    </div>
                    <span className="text-5xl font-black tracking-tighter tabular-nums drop-shadow-sm">₹{fmt(grandTotal)}</span>
                  </div>
                </div>
              </div>

              {/* Payment Context (Simplified & Powerful) */}
              <div className="p-10 bg-slate-50 dark:bg-white/[0.03] border border-slate-100 dark:border-white/10 rounded-[3rem] space-y-6">
                 <div className="flex justify-between items-center px-2">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">Total Amount Paid</span>
                    <span className="text-xl font-black text-emerald-600 dark:text-emerald-400 tabular-nums tracking-tighter">− ₹{fmt(totalPaid)}</span>
                 </div>
                 
                 <div className="h-px bg-slate-200 dark:bg-white/10 border-dashed border-t" />
                 
                 <div className="flex justify-between items-center">
                    <div>
                       <span className={clsx(
                         "text-[12px] font-black uppercase tracking-[0.3em] leading-none px-3 py-1.5 rounded-full border shadow-sm transition-all",
                         balance > 0.01 
                          ? "bg-rose-50 text-rose-600 border-rose-200 dark:bg-rose-900/20 dark:border-rose-500/30" 
                          : "bg-emerald-50 text-emerald-600 border-emerald-200 dark:bg-emerald-900/20 dark:border-emerald-500/30"
                       )}>
                         {balance > 0.01 ? "TOTAL DUE" : "FULLY PAID"}
                       </span>
                    </div>
                    <div className="text-right">
                       <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest leading-none mb-1">Final Balance</p>
                       <span className={clsx(
                         "text-3xl font-black tabular-nums transition-colors tracking-tighter", 
                         balance > 0.01 ? "text-rose-600" : "text-emerald-500"
                       )}>
                         ₹{fmt(balance)}
                       </span>
                    </div>
                 </div>
              </div>
            </div>
          </div>
        </div>

        {/* Legal Footer Section */}
        <div className="p-8 bg-slate-50 dark:bg-white/[0.01] border-t border-slate-100 dark:border-white/5 flex flex-col md:flex-row items-center justify-between text-center md:text-left gap-4">
           <div className="flex items-center gap-3">
              <Clock size={14} className="text-slate-400" />
              <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest leading-none">
                Generated on {new Date().toLocaleDateString('en-GB')} {new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
              </p>
           </div>
           <p className="text-[9px] text-slate-400/70 font-medium italic tracking-wide">
             This is a computer generated document and does not require a physical signature in original electronic format.
           </p>
        </div>
      </div>
    </div>
  );
}
