"use client";

import React from 'react';
import { Printer, X } from 'lucide-react';

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
  const safe = (val: any) => Number(val) || 0;
  const items = (order.poItems || order.items || []) as any[];
  const round = (n: number) => Math.round(n * 100) / 100;
  const fmt = (n: number) =>
    safe(n).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  const companyState = (companyDetails?.state || "").toLowerCase().trim();
  const vendorState = (vendor?.state || "").toLowerCase().trim();
  const isSameState =
    !companyState || !vendorState
      ? true
      : vendorState.includes(companyState) || companyState.includes(vendorState);

  const taxableSubtotal = items.reduce((s: number, it: any) => s + safe(it.quantity) * safe(it.price), 0);

  const taxBreakdown = items.reduce(
    (acc: any, it: any) => {
      const amt = safe(it.quantity) * safe(it.price);
      const tax = amt * (safe(it.gstRate) / 100);
      if (isSameState) {
        acc.cgst += round(tax / 2);
        acc.sgst += round(tax / 2);
      } else {
        acc.igst += round(tax);
      }
      return acc;
    },
    { cgst: 0, sgst: 0, igst: 0 }
  );

  const totalTax = round(taxBreakdown.cgst + taxBreakdown.sgst + taxBreakdown.igst);
  const grandTotal = round(taxableSubtotal + totalTax);
  const totalPaid = safe(order.paid || order.advancePaid);
  const balance = Math.max(0, round(grandTotal - totalPaid));

  const invoiceNo =
    order.poNumber ||
    `INV-${new Date().getFullYear()}-${order.id?.slice(-4).toUpperCase() || '0001'}`;
  const invoiceDate = new Date(order.createdAt || Date.now()).toLocaleDateString('en-GB');
  const paymentStatus =
    balance <= 0.01 && grandTotal > 0 ? 'PAID' : totalPaid > 0 ? 'PARTIAL' : 'UNPAID';

  return (
    <div className="fixed inset-0 z-[100] flex items-start justify-center bg-black/70 p-4 md:p-8 overflow-y-auto print:p-0 print:bg-white">
      {/* Action Bar */}
      <div className="fixed top-4 right-6 flex gap-2 print:hidden z-[110]">
        <button
          onClick={() => window.print()}
          className="flex items-center gap-2 bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded text-sm font-medium shadow hover:bg-gray-50 transition-colors"
        >
          <Printer size={14} /> Print / Save PDF
        </button>
        <button
          onClick={onClose}
          className="flex items-center gap-2 bg-white border border-gray-300 text-gray-700 px-3 py-2 rounded text-sm font-medium shadow hover:bg-gray-50 transition-colors"
        >
          <X size={14} /> Close
        </button>
      </div>

      {/* Invoice Document */}
      <div className="w-full max-w-3xl bg-white text-gray-900 shadow-lg my-14 print:my-0 print:shadow-none border border-gray-300 text-sm">

        {/* ── Header ── */}
        <div className="p-6 border-b-2 border-gray-800">
          <div className="flex justify-between items-start gap-4">
            <div className="flex-1">
              <p className="text-lg font-bold text-gray-900 leading-tight">{companyDetails.name}</p>
              <p className="text-xs text-gray-600 mt-1 leading-relaxed whitespace-pre-line">{companyDetails.address}</p>
              <p className="text-xs text-gray-700 mt-1">
                <span className="font-semibold">GSTIN:</span> {companyDetails.gstin}
              </p>
              {companyDetails.phone && (
                <p className="text-xs text-gray-600">Ph: {companyDetails.phone}</p>
              )}
              {companyDetails.email && (
                <p className="text-xs text-gray-600">Email: {companyDetails.email}</p>
              )}
            </div>

            <div className="text-right shrink-0">
              <div className="inline-block border-2 border-gray-800 px-4 py-1 mb-3">
                <span className="font-bold text-base tracking-widest uppercase">Tax Invoice</span>
              </div>
              <table className="text-xs ml-auto">
                <tbody>
                  <tr>
                    <td className="pr-3 text-gray-500 py-0.5">Invoice No.</td>
                    <td className="font-semibold py-0.5">{invoiceNo}</td>
                  </tr>
                  <tr>
                    <td className="pr-3 text-gray-500 py-0.5">Date</td>
                    <td className="font-semibold py-0.5">{invoiceDate}</td>
                  </tr>
                  <tr>
                    <td className="pr-3 text-gray-500 py-0.5">Status</td>
                    <td
                      className={`font-bold py-0.5 ${
                        paymentStatus === 'PAID'
                          ? 'text-green-700'
                          : paymentStatus === 'PARTIAL'
                          ? 'text-blue-700'
                          : 'text-red-700'
                      }`}
                    >
                      {paymentStatus}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* ── Bill From / Bill To ── */}
        <div className="grid grid-cols-2 border-b border-gray-300">
          <div className="p-4 border-r border-gray-300">
            <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1.5">
              Bill From
            </p>
            <p className="font-semibold text-gray-900">{companyDetails.name}</p>
            <p className="text-xs text-gray-600 mt-0.5 leading-relaxed whitespace-pre-line">
              {companyDetails.address}
            </p>
            <p className="text-xs text-gray-700 mt-1">
              GSTIN: <span className="font-medium">{companyDetails.gstin || '-'}</span>
            </p>
            <p className="text-xs text-gray-500 mt-0.5">
              Place of Supply: {companyDetails.state || '-'}
            </p>
          </div>

          <div className="p-4">
            <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1.5">
              Bill To (Vendor)
            </p>
            <p className="font-semibold text-gray-900">{vendor?.name || '-'}</p>
            <p className="text-xs text-gray-600 mt-0.5 leading-relaxed">
              {vendor?.address || '-'}
            </p>
            <p className="text-xs text-gray-700 mt-1">
              GSTIN: <span className="font-medium">{vendor?.gstin || 'NOT PROVIDED'}</span>
            </p>
            <p className="text-xs text-gray-600 mt-0.5">
              Contact: {vendor?.contact || vendor?.phone || '-'}
            </p>
          </div>
        </div>

        {/* ── Items Table ── */}
        <table className="w-full text-xs border-collapse border-b border-gray-800">
          <thead>
            <tr className="bg-gray-100 border-y border-gray-800">
              <th className="text-center py-2 px-2 border-r border-gray-300 w-8 font-bold">#</th>
              <th className="text-left py-2 px-3 border-r border-gray-300 font-bold">
                Item Description
              </th>
              <th className="text-center py-2 px-2 border-r border-gray-300 w-20 font-bold">
                HSN Code
              </th>
              <th className="text-right py-2 px-2 border-r border-gray-300 w-24 font-bold">
                Qty
              </th>
              <th className="text-right py-2 px-3 border-r border-gray-300 w-24 font-bold">
                Rate (₹)
              </th>
              <th className="text-center py-2 px-2 border-r border-gray-300 w-14 font-bold">
                GST %
              </th>
              <th className="text-right py-2 px-3 w-24 font-bold">Amount (₹)</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item: any, idx: number) => {
              const itemName =
                item.itemName || item.inventoryItem?.name || `Material #${idx + 1}`;
              const itemUnit = item.inventoryItem?.unit || item.unit || 'unit';
              return (
                <tr key={idx} className="border-b border-gray-200">
                  <td className="py-2.5 px-2 border-r border-gray-200 text-center text-gray-500">
                    {idx + 1}
                  </td>
                  <td className="py-2.5 px-3 border-r border-gray-200 font-medium text-gray-900">
                    {itemName}
                  </td>
                  <td className="py-2.5 px-2 border-r border-gray-200 text-center text-gray-500 font-mono">
                    {item.hsnCode || '-'}
                  </td>
                  <td className="py-2.5 px-2 border-r border-gray-200 text-right">
                    {safe(item.quantity)} {itemUnit}
                  </td>
                  <td className="py-2.5 px-3 border-r border-gray-200 text-right">
                    {fmt(safe(item.price))}
                  </td>
                  <td className="py-2.5 px-2 border-r border-gray-200 text-center text-gray-600">
                    {safe(item.gstRate)}%
                  </td>
                  <td className="py-2.5 px-3 text-right font-semibold">
                    {fmt(safe(item.quantity) * safe(item.price))}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {/* ── Footer: Terms + Tax Summary ── */}
        <div className="flex border-b border-gray-300">
          {/* Terms & Conditions */}
          <div className="flex-1 p-4 border-r border-gray-300">
            <p className="text-[10px] font-bold text-gray-600 uppercase tracking-widest mb-2">
              Terms &amp; Conditions
            </p>
            <ol className="text-xs text-gray-500 space-y-1 list-decimal list-inside leading-relaxed">
              <li>Payment is expected within established vendor terms.</li>
              <li>HSN Classification is based on material category.</li>
              <li>Goods received must match the PO quality standards.</li>
            </ol>
          </div>

          {/* Tax Summary */}
          <div className="w-60 shrink-0">
            <table className="w-full text-xs">
              <tbody>
                <tr className="border-b border-gray-200">
                  <td className="py-2 px-4 text-gray-500">Taxable Amount</td>
                  <td className="py-2 px-4 text-right font-medium">₹{fmt(taxableSubtotal)}</td>
                </tr>
                {isSameState ? (
                  <>
                    <tr className="border-b border-gray-200">
                      <td className="py-2 px-4 text-gray-500">CGST Output</td>
                      <td className="py-2 px-4 text-right font-medium">₹{fmt(taxBreakdown.cgst)}</td>
                    </tr>
                    <tr className="border-b border-gray-200">
                      <td className="py-2 px-4 text-gray-500">SGST Output</td>
                      <td className="py-2 px-4 text-right font-medium">₹{fmt(taxBreakdown.sgst)}</td>
                    </tr>
                  </>
                ) : (
                  <tr className="border-b border-gray-200">
                    <td className="py-2 px-4 text-gray-500">IGST</td>
                    <td className="py-2 px-4 text-right font-medium">₹{fmt(taxBreakdown.igst)}</td>
                  </tr>
                )}
                <tr className="border-b-2 border-gray-800 bg-gray-100 font-bold">
                  <td className="py-2 px-4">Grand Total</td>
                  <td className="py-2 px-4 text-right">₹{fmt(grandTotal)}</td>
                </tr>
                <tr className="border-b border-gray-200 text-green-700">
                  <td className="py-2 px-4">Amount Paid</td>
                  <td className="py-2 px-4 text-right font-medium">₹{fmt(totalPaid)}</td>
                </tr>
                <tr className={balance > 0.01 ? 'text-red-700 font-bold' : 'text-green-700 font-bold'}>
                  <td className="py-2 px-4">Balance Due</td>
                  <td className="py-2 px-4 text-right">₹{fmt(balance)}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* ── Signature Row ── */}
        <div className="flex border-b border-gray-300 text-xs">
          <div className="flex-1 p-4 border-r border-gray-300 text-gray-400 italic">
            <p>This is a computer generated document.</p>
            <p className="mt-0.5">
              Generated on:{' '}
              {new Date().toLocaleDateString('en-GB')}{' '}
              {new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
            </p>
          </div>
          <div className="w-60 shrink-0 p-4 text-center">
            <p className="text-gray-500 mb-8 text-xs">For {companyDetails.name}</p>
            <div className="border-t border-gray-400 pt-1">
              <p className="text-gray-500 text-xs">Authorized Signatory</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
