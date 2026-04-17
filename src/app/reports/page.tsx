"use client";

import { useState } from "react";
import { 
  ChevronRight, 
  ChevronDown,
  ChevronUp,
  Download,
  Calendar,
  ExternalLink,
  FileText,
  BadgeDollarSign,
  ShoppingCart,
  Plus
} from "lucide-react";
import Link from "next/link";
import { clsx } from "clsx";

export default function CentralReports() {
  const [expandedSections, setExpandedSections] = useState<string[]>([
    "Invoices Summary", "Purchases and Expenses Summary", "Purchase Order Summary"
  ]);

  const toggleSection = (section: string) => {
    setExpandedSections(prev => 
      prev.includes(section) ? prev.filter(s => s !== section) : [...prev, section]
    );
  };

  const ReportCategory = ({ title, items }: { title: string, items: { label: string, href: string, actions: string[], isNew?: boolean }[] }) => (
    <div className="space-y-4">
      <h3 className="text-sm font-black text-[#1A1A1A] dark:text-white border-b border-[#F0EAF0] dark:border-slate-800 pb-2">{title}</h3>
      <div className="space-y-3">
        {items.map((item, idx) => (
          <div key={idx} className="flex items-center justify-between group">
            <div className="flex items-center gap-1.5 min-w-0">
               <span className="text-[13px] font-medium text-[#444] dark:text-slate-300 truncate group-hover:text-[#7C3AED] cursor-pointer">
                  {item.label}
               </span>
               {item.isNew && <span className="text-orange-400 text-sm">✨</span>}
            </div>
            <div className="flex items-center gap-3">
               {item.actions.includes("Open") && (
                 <Link href={item.href} className="flex items-center gap-1 text-[11px] font-bold text-[#999] hover:text-[#7C3AED] transition-colors">
                    <ExternalLink size={12} /> Open
                 </Link>
               )}
               {item.actions.includes("CSV") && (
                 <button className="flex items-center gap-1 text-[11px] font-bold text-[#999] hover:text-[#7C3AED] transition-colors">
                    <Download size={12} /> CSV
                 </button>
               )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#FDFCFD] dark:bg-[#020617] -m-8 font-sans">
      <div className="p-8 space-y-6">
        {/* Breadcrumbs & Header */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-[10px] font-bold text-[#999] uppercase tracking-widest">
            <Link href="/" className="hover:text-[#7C3AED]">Azeez</Link>
            <ChevronRight size={10} />
            <span className="text-[#666]">Reports</span>
          </div>
          <h1 className="text-2xl font-black text-[#1A1A1A] dark:text-white">Reports</h1>
        </div>

        {/* Central Filter Card */}
        <div className="bg-white dark:bg-slate-900 border border-[#F0EAF0] dark:border-slate-800 rounded-2xl shadow-sm overflow-hidden">
           <div className="p-6 space-y-6">
              <div className="space-y-4 border-b border-[#F0EAF0] dark:border-slate-800 pb-6">
                 <p className="text-[13px] font-bold text-[#666]">Select Filters to see Reports</p>
                 <div className="space-y-2">
                    <label className="text-[11px] font-bold text-[#999] uppercase tracking-wider">Select Date Range</label>
                    <div className="flex items-center gap-2 max-w-sm bg-[#FAF9FA] dark:bg-slate-800 border border-[#F0EAF0] dark:border-slate-800 rounded-lg p-2.5">
                       <input 
                         type="text" 
                         defaultValue="Apr 01, 2026 - Apr 30, 2026"
                         className="flex-1 bg-transparent text-[13px] font-medium outline-none"
                       />
                       <Calendar size={16} className="text-[#999]" />
                    </div>
                 </div>
              </div>

              {/* Collapsible Summaries */}
              <div className="space-y-4">
                 {/* Invoices Summary */}
                 <div className="border border-[#F0EAF0] dark:border-slate-800 rounded-xl overflow-hidden shadow-sm">
                    <button 
                      onClick={() => toggleSection("Invoices Summary")}
                      className="w-full flex items-center justify-between p-4 bg-[#FAF9FA] dark:bg-slate-800 group"
                    >
                       <span className="text-[13px] font-black text-[#666] dark:text-slate-300">Invoices Summary</span>
                       {expandedSections.includes("Invoices Summary") ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                    </button>
                    {expandedSections.includes("Invoices Summary") && (
                      <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                         <SummaryCard icon={<FileText size={20} />} label="Invoices" value="-" color="blue" />
                         <SummaryCard icon={<Plus size={20} />} label="Total Amount" value="₹0" color="blue" />
                         <SummaryCard icon={<BadgeDollarSign size={20} />} label="Amount due" value="₹0" color="green" />
                         <SummaryCard icon={<BadgeDollarSign size={20} />} label="Payment Received" value="₹0" color="green" />
                         <SummaryCard icon={<span className="text-[10px] font-bold">GST</span>} label="GST Amount" value="₹0" color="orange" />
                         <SummaryCard icon={<span className="text-[10px] font-bold">⇌</span>} label="Transaction Charge" value="₹0" color="orange" />
                         <SummaryCard icon={<span className="text-[10px] font-bold">TAX</span>} label="TDS" value="₹0" color="orange" />
                      </div>
                    )}
                 </div>

                 {/* Purchases Summary */}
                 <div className="border border-[#F0EAF0] dark:border-slate-800 rounded-xl overflow-hidden shadow-sm">
                    <button 
                      onClick={() => toggleSection("Purchases and Expenses Summary")}
                      className="w-full flex items-center justify-between p-4 bg-[#FAF9FA] dark:bg-slate-800 group"
                    >
                       <span className="text-[13px] font-black text-[#666] dark:text-slate-300">Purchases and Expenses Summary</span>
                       {expandedSections.includes("Purchases and Expenses Summary") ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                    </button>
                    {expandedSections.includes("Purchases and Expenses Summary") && (
                      <div className="p-6 grid grid-cols-1 md:grid-cols-4 gap-8">
                         <SummaryCard icon={<FileText size={20} />} label="Purchases and Expenses" value="0" color="blue" />
                         <SummaryCard icon={<Plus size={20} />} label="Total Amount" value="0" color="blue" />
                         <SummaryCard icon={<BadgeDollarSign size={20} />} label="Amount Due" value="0" color="green" />
                         <SummaryCard icon={<BadgeDollarSign size={20} />} label="Payment Made" value="0" color="green" />
                      </div>
                    )}
                 </div>

                 {/* PO Summary */}
                 <div className="border border-[#F0EAF0] dark:border-slate-800 rounded-xl overflow-hidden shadow-sm">
                    <button 
                      onClick={() => toggleSection("Purchase Order Summary")}
                      className="w-full flex items-center justify-between p-4 bg-[#FAF9FA] dark:bg-slate-800 group"
                    >
                       <span className="text-[13px] font-black text-[#666] dark:text-slate-300">Purchase Order Summary</span>
                       {expandedSections.includes("Purchase Order Summary") ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                    </button>
                    {expandedSections.includes("Purchase Order Summary") && (
                      <div className="p-6 grid grid-cols-1 md:grid-cols-4 gap-8">
                         <div className="flex items-center gap-3">
                            <div className="w-4 h-4 rounded-full bg-blue-500" />
                            <div>
                               <p className="text-[11px] font-bold text-[#999] uppercase">Purchase Orders</p>
                               <p className="text-sm font-black text-[#1A1A1A] dark:text-white">0</p>
                            </div>
                         </div>
                         <div className="flex items-center gap-3">
                            <div className="w-4 h-4 rounded-full bg-blue-400" />
                            <div>
                               <p className="text-[11px] font-bold text-[#999] uppercase">Purchased Amount</p>
                               <p className="text-sm font-black text-[#1A1A1A] dark:text-white">₹0</p>
                            </div>
                         </div>
                      </div>
                    )}
                 </div>
              </div>
           </div>
        </div>

        {/* Categories Directory Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 bg-white dark:bg-slate-900 border border-[#F0EAF0] dark:border-slate-800 rounded-2xl p-8 shadow-sm">
           <ReportCategory 
             title="Accounts Receivable"
             items={[
               { label: "Proforma Invoices", href: "/sales/proforma", actions: ["Open", "CSV"] },
               { label: "Invoices", href: "/sales/invoices", actions: ["Open", "CSV"] },
               { label: "Client Report", href: "/reports/clients", actions: ["Open"] },
               { label: "Payment Report", href: "/reports/payments", actions: ["Open", "CSV"] },
               { label: "TDS Report", href: "/reports/tds", actions: ["Open", "CSV"] },
               { label: "Line Item Report", href: "/reports/line-items", actions: ["Open"] },
               { label: "HSN Report", href: "/reports/hsn", actions: ["Open"] },
               { label: "Credit Note GST Report", href: "/gst/credit-notes", actions: ["CSV"] },
               { label: "GST Report", href: "/gst/report", actions: ["Open", "CSV"] },
               { label: "GSTR-1 Report", href: "/gst/gstr-1", actions: ["Open"], isNew: true },
               { label: "Client Ageing Report", href: "/reports/client-ageing", actions: ["Open"] },
               { label: "Client Outstanding Report", href: "/reports/client-outstanding", actions: ["Open"] },
             ]}
           />
           <ReportCategory 
             title="Accounts Payable"
             items={[
               { label: "Purchase Order", href: "/purchases/orders", actions: ["Open"] },
               { label: "Purchases and Expenses", href: "/purchases", actions: ["Open", "CSV"] },
               { label: "Vendor Report", href: "/reports/vendors", actions: ["Open", "CSV"] },
               { label: "Payment Report", href: "/reports/vendor-payments", actions: ["Open", "CSV"] },
               { label: "TDS Report", href: "/reports/vendor-tds", actions: ["Open", "CSV"] },
               { label: "Line Item Report", href: "/reports/vendor-line-items", actions: ["Open"] },
               { label: "HSN Report", href: "/reports/vendor-hsn", actions: ["Open"] },
               { label: "GST Report", href: "/gst/vendor-report", actions: ["Open", "CSV"] },
               { label: "GSTR-2B Report", href: "/gst/gstr-2b", actions: ["Open"], isNew: true },
               { label: "Vendor Ageing Report", href: "/reports/vendor-ageing", actions: ["Open"] },
               { label: "Vendor Outstanding Report", href: "/reports/vendor-outstanding", actions: ["Open"] },
             ]}
           />
           <ReportCategory 
             title="Advanced Accounting Reports"
             items={[
               { label: "Trial Balance", href: "/accounting/trial-balance", actions: ["Open"] },
               { label: "Balance Sheet", href: "/accounting/balance-sheet", actions: ["Open"] },
               { label: "Income Statement", href: "/accounting/income-statement", actions: ["Open"] },
               { label: "Profit And Loss", href: "/accounting/profit-loss", actions: ["Open"] },
               { label: "DayBook Report", href: "/accounting/day-book", actions: ["Open"] },
               { label: "Cash Flow Statement", href: "/accounting/cash-flow", actions: ["Open"] },
               { label: "All Ledgers Master Report", href: "/accounting/ledgers", actions: ["Open"] },
             ]}
           />
           <ReportCategory 
             title="Other Reports"
             items={[
               { label: "Delivery Challans", href: "/sales/delivery-challans", actions: ["Open", "CSV"] },
               { label: "Product-wise P&L", href: "/inventory/product-pnl", actions: ["Open"], isNew: true },
               { label: "Project-wise P&L", href: "/projects/pnl", actions: ["Open"], isNew: true },
               { label: "Order Management Report", href: "/orders/management", actions: ["Open"] },
               { label: "GSTR-3B Report", href: "/gst/gstr-3b", actions: ["Open"] },
             ]}
           />
        </div>
      </div>
    </div>
  );
}

function SummaryCard({ icon, label, value, color }: { icon: any, label: string, value: string, color: "blue" | "green" | "orange" }) {
  const colorMap = {
    blue: "bg-blue-50 text-blue-500",
    green: "bg-emerald-50 text-emerald-500",
    orange: "bg-orange-50 text-orange-500"
  };

  return (
    <div className="flex items-center gap-4">
       <div className={clsx("w-12 h-12 rounded-full flex items-center justify-center", colorMap[color])}>
          {icon}
       </div>
       <div>
          <div className="flex items-center gap-1.5 text-[11px] font-bold text-[#999] uppercase tracking-wide">
             {label} <BadgeDollarSign size={14} className="opacity-40" />
          </div>
          <p className="text-[13px] font-black text-[#1A1A1A] dark:text-white">{value}</p>
       </div>
    </div>
  );
}
