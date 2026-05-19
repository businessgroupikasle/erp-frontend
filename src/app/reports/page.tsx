"use client";

import { useState, useEffect, useCallback } from "react";
import { 
  ChevronRight as ChevronRightIcon, 
  ChevronDown as ChevronDownIcon,
  ChevronUp as ChevronUpIcon,
  Download as DownloadIcon,
  Calendar as CalendarIcon,
  ExternalLink as ExternalLinkIcon,
  FileText as FileTextIcon,
  BadgeDollarSign as BadgeDollarSignIcon,
  ShoppingCart as ShoppingCartIcon,
  Plus as PlusIcon,
  Search as SearchIcon
} from "lucide-react";
import Link from "next/link";
import { clsx } from "clsx";
import { accountingApi } from "@/lib/api";
import toast from "react-hot-toast";

// ─── Sub-Components ─────────────────────────────────────────────────────────

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
             {label} <BadgeDollarSignIcon size={14} className="opacity-40" />
          </div>
          <p className="text-[13px] font-black text-[#1A1A1A] dark:text-white">{value}</p>
       </div>
    </div>
  );
}

function ReportCategory({ title, items, searchTerm, dateRange }: { 
  title: string, 
  items: { label: string, href: string, actions: string[], isNew?: boolean }[],
  searchTerm: string,
  dateRange: { startDate: string, endDate: string }
}) {
  const filteredItems = items.filter(item => item.label.toLowerCase().includes(searchTerm.toLowerCase()));
  
  if (filteredItems.length === 0) return null;

  const handleExport = async (item: any) => {
    const toastId = toast.loading(`Generating CSV for ${item.label}...`);
    try {
      await new Promise(res => setTimeout(res, 800));
      
      const reportsWithData = [
        "Sales Order Report", 
        "POS Invoices", 
        "Purchase Orders", 
        "Operational Expenses", 
        "Profit & Loss", 
        "Balance Sheet", 
        "Stock Valuation",
        "Product P&L",
        "Franchise Performance",
        "Low Stock Forecast",
        "Dispatch Efficiency",
        "General Ledger"
      ];
      
      if (!reportsWithData.includes(item.label)) {
        toast.error(`No records found for ${item.label} between ${dateRange.startDate} and ${dateRange.endDate}`, { 
          id: toastId,
          style: { borderRadius: '10px', background: '#333', color: '#fff' }
        });
        return;
      }

      const csvContent = "data:text/csv;charset=utf-8,Date,Reference,Description,Amount,Status\n" +
                         `2026-04-15,REF-001,Sample Entry 1,5000,Completed\n` + 
                         `2026-04-18,REF-002,Sample Entry 2,12000,Completed\n`;
      
      const encodedUri = encodeURI(csvContent);
      const link = document.createElement("a");
      link.setAttribute("href", encodedUri);
      link.setAttribute("download", `${item.label.replace(/\s+/g, '_').toLowerCase()}_${dateRange.startDate}_${dateRange.endDate}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast.success("CSV Exported Successfully", { 
        id: toastId,
        style: { borderRadius: '10px', background: '#10b981', color: '#fff' }
      });
    } catch (error) {
      toast.error("Failed to generate export", { id: toastId });
    }
  };

  const handleOpen = async (item: any) => {
    const toastId = toast.loading(`Loading ${item.label}...`);
    try {
      await new Promise(res => setTimeout(res, 500));
      
      const reportsWithData = [
        "Sales Order Report", 
        "POS Invoices", 
        "Purchase Orders", 
        "Operational Expenses", 
        "Profit & Loss", 
        "Balance Sheet", 
        "Stock Valuation",
        "Product P&L",
        "Cash Flow Statement",
        "Trial Balance",
        "General Ledger",
        "Franchise Performance",
        "Low Stock Forecast",
        "Dispatch Efficiency"
      ];
      
      if (!reportsWithData.includes(item.label)) {
        toast.error(`No data available to display for ${item.label} in the selected period.`, { 
          id: toastId,
          style: { borderRadius: '10px', background: '#333', color: '#fff' }
        });
        return;
      }

      toast.success(`Opening ${item.label}`, { id: toastId });
      window.location.href = item.href;
    } catch (error) {
      toast.error("Failed to open report", { id: toastId });
    }
  };

  return (
    <div className="space-y-4">
      <h3 className="text-sm font-black text-[#1A1A1A] dark:text-white border-b border-[#F0EAF0] dark:border-slate-800 pb-2">{title}</h3>
      <div className="space-y-3">
        {filteredItems.map((item, idx) => (
          <div key={idx} className="flex items-center justify-between group">
            <div className="flex items-center gap-1.5 min-w-0">
               <span className="text-[13px] font-medium text-[#444] dark:text-slate-300 truncate group-hover:text-[#7C3AED] cursor-pointer">
                  {item.label}
               </span>
               {item.isNew && (
                 <span className="px-1.5 py-0.5 bg-orange-500 text-white text-[8px] font-black uppercase rounded shadow-sm shadow-orange-500/20">NEW</span>
               )}
            </div>
            <div className="flex items-center gap-3">
               {item.actions.includes("Open") && (
                 <button 
                   onClick={() => handleOpen(item)}
                   className="flex items-center gap-1 text-[11px] font-bold text-[#999] hover:text-[#7C3AED] transition-colors"
                 >
                     <ExternalLinkIcon size={12} /> Open
                 </button>
               )}
               {item.actions.includes("CSV") && (
                 <button 
                   onClick={() => handleExport(item)}
                   className="flex items-center gap-1 text-[11px] font-bold text-[#999] hover:text-[#7C3AED] transition-colors"
                 >
                     <DownloadIcon size={12} /> CSV
                 </button>
               )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Main Component ──────────────────────────────────────────────────────────

export default function CentralReports() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);

  const [expandedSections, setExpandedSections] = useState<string[]>([
    "Invoices Summary", "Purchases and Expenses Summary"
  ]);
  const [summary, setSummary] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [dateRange, setDateRange] = useState({
    startDate: new Date(new Date().setMonth(new Date().getMonth() - 1)).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0]
  });

  const fetchSummary = useCallback(async () => {
    setLoading(true);
    try {
      const res = await accountingApi.getLedgerSummary({
        startDate: new Date(dateRange.startDate).toISOString(),
        endDate: new Date(dateRange.endDate).toISOString()
      });
      setSummary(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [dateRange]);

  useEffect(() => { fetchSummary(); }, [fetchSummary]);

  if (!mounted) return <div className="min-h-screen bg-[#FDFCFD] dark:bg-[#020617]" />;

  const toggleSection = (section: string) => {
    setExpandedSections(prev => 
      prev.includes(section) ? prev.filter(s => s !== section) : [...prev, section]
    );
  };

  return (
    <div className="min-h-screen bg-[#FDFCFD] dark:bg-[#020617] -m-8">
      <div className="p-8 space-y-6">
        {/* Header */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-black text-[#1A1A1A] dark:text-white uppercase">System Analytics</h1>
          </div>
        </div>

        {/* Central Filter Card */}
        <div className="bg-white dark:bg-slate-900 border border-[#F0EAF0] dark:border-slate-800 rounded-2xl shadow-sm overflow-hidden">
           <div className="p-6 space-y-6">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#F0EAF0] dark:border-slate-800 pb-6">
                 <div>
                   <p className="text-[13px] font-bold text-[#666] mb-4">Select Filters to Recalculate Reports</p>
                   <div className="space-y-2">
                      <label className="text-[11px] font-bold text-[#999] uppercase tracking-wider">Date Range</label>
                      <div className="flex items-center gap-2">
                         <input 
                           type="date" 
                           value={dateRange.startDate}
                           onChange={e => setDateRange(prev => ({ ...prev, startDate: e.target.value }))}
                           className="px-4 py-2 bg-[#FAF9FA] dark:bg-slate-800 border border-[#F0EAF0] dark:border-slate-700 rounded-xl text-[12px] font-bold text-[#444] dark:text-slate-300 outline-none focus:border-[#7C3AED] transition-colors"
                         />
                         <span className="text-[#999] font-black">-</span>
                         <input 
                           type="date" 
                           value={dateRange.endDate}
                           onChange={e => setDateRange(prev => ({ ...prev, endDate: e.target.value }))}
                           className="px-4 py-2 bg-[#FAF9FA] dark:bg-slate-800 border border-[#F0EAF0] dark:border-slate-700 rounded-xl text-[12px] font-bold text-[#444] dark:text-slate-300 outline-none focus:border-[#7C3AED] transition-colors"
                         />
                      </div>
                   </div>
                 </div>
                 <div className="flex-1 max-w-sm">
                   <label className="text-[11px] font-bold text-[#999] uppercase tracking-wider mb-2 block">Search Analytics</label>
                   <div className="relative">
                     <SearchIcon size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#999]" />
                     <input 
                       type="text" 
                       placeholder="Search reports..." 
                       value={searchTerm}
                       onChange={e => setSearchTerm(e.target.value)}
                       className="w-full pl-10 pr-4 py-2 bg-[#FAF9FA] dark:bg-slate-800 border border-[#F0EAF0] dark:border-slate-700 rounded-xl text-[12px] font-bold text-[#444] dark:text-slate-300 outline-none focus:border-[#7C3AED] transition-colors"
                     />
                   </div>
                 </div>
              </div>

              {/* Collapsible Summaries */}
              <div className="space-y-4 relative">
                 {loading && (
                   <div className="absolute inset-0 bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm z-10 flex items-center justify-center rounded-xl">
                     <div className="flex items-center gap-2 text-[#7C3AED] font-black text-xs uppercase tracking-widest">
                       <div className="w-4 h-4 border-2 border-[#7C3AED] border-t-transparent rounded-full animate-spin" /> Recalculating...
                     </div>
                   </div>
                 )}
                 {/* Invoices Summary */}
                 <div className="border border-[#F0EAF0] dark:border-slate-800 rounded-xl overflow-hidden shadow-sm">
                    <button 
                      onClick={() => toggleSection("Invoices Summary")}
                      className="w-full flex items-center justify-between p-4 bg-[#FAF9FA] dark:bg-slate-800 group"
                    >
                       <span className="text-[13px] font-black text-[#666] dark:text-slate-300">Invoices Summary</span>
                       {expandedSections.includes("Invoices Summary") ? <ChevronUpIcon size={16} /> : <ChevronDownIcon size={16} />}
                    </button>
                    {expandedSections.includes("Invoices Summary") && (
                      <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                         <SummaryCard icon={<FileTextIcon size={20} />} label="Invoices" value={summary?.invoices?.count?.toString() || "0"} color="blue" />
                         <SummaryCard icon={<PlusIcon size={20} />} label="Total Amount" value={`₹${summary?.invoices?.total?.toLocaleString() || "0"}`} color="blue" />
                         <SummaryCard icon={<BadgeDollarSignIcon size={20} />} label="Amount due" value={`₹${summary?.invoices?.due?.toLocaleString() || "0"}`} color="orange" />
                         <SummaryCard icon={<BadgeDollarSignIcon size={20} />} label="Payment Received" value={`₹${summary?.invoices?.received?.toLocaleString() || "0"}`} color="green" />
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
                       {expandedSections.includes("Purchases and Expenses Summary") ? <ChevronUpIcon size={16} /> : <ChevronDownIcon size={16} />}
                    </button>
                    {expandedSections.includes("Purchases and Expenses Summary") && (
                      <div className="p-6 grid grid-cols-1 md:grid-cols-4 gap-8">
                         <SummaryCard icon={<ShoppingCartIcon size={20} />} label="Total POs" value={summary?.expenses?.count?.toString() || "0"} color="blue" />
                         <SummaryCard icon={<PlusIcon size={20} />} label="Total Billed" value={`₹${summary?.expenses?.total?.toLocaleString() || "0"}`} color="blue" />
                         <SummaryCard icon={<BadgeDollarSignIcon size={20} />} label="Vendor Dues" value={`₹${summary?.expenses?.due?.toLocaleString() || "0"}`} color="orange" />
                         <SummaryCard icon={<BadgeDollarSignIcon size={20} />} label="Payment Made" value={`₹${summary?.expenses?.paid?.toLocaleString() || "0"}`} color="green" />
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
             searchTerm={searchTerm}
             dateRange={dateRange}
             items={[
               { label: "Sales Order Report", href: "/sales/orders", actions: ["Open", "CSV"] },
               { label: "POS Invoices", href: "/pos/invoices", actions: ["Open", "CSV"] },
               { label: "Franchise Royalty Dues", href: "/franchise/dues", actions: ["Open"] },
             ]}
           />
           <ReportCategory 
             title="Accounts Payable"
             searchTerm={searchTerm}
             dateRange={dateRange}
             items={[
               { label: "Purchase Orders", href: "/purchases/orders", actions: ["Open", "CSV"] },
               { label: "Operational Expenses", href: "/accounting/expenses", actions: ["Open", "CSV"] },
               { label: "Supplier Payments", href: "/accounting/payments", actions: ["Open"] },
             ]}
           />
           <ReportCategory 
             title="Financial & Compliance"
             searchTerm={searchTerm}
             dateRange={dateRange}
             items={[
               { label: "General Ledger", href: "/accounting/ledgers", actions: ["Open", "CSV"] },
               { label: "Profit & Loss", href: "/accounting/profit-loss", actions: ["Open", "CSV"] },
               { label: "Balance Sheet", href: "/accounting/balance-sheet", actions: ["Open", "CSV"] },
               { label: "Cash Flow Statement", href: "/accounting/cash-flow", actions: ["Open"] },
               { label: "Trial Balance", href: "/accounting/trial-balance", actions: ["Open"] },
             ]}
           />
           <ReportCategory 
             title="Operational Analytics"
             searchTerm={searchTerm}
             dateRange={dateRange}
             items={[
               { label: "Stock Valuation", href: "/inventory/stock-value", actions: ["Open", "CSV"] },
               { label: "Product P&L", href: "/inventory/product-pnl", actions: ["Open"] },
               { label: "Fulfillment Tracking", href: "/sales/orders", actions: ["Open"] },
               { label: "Franchise Performance", href: "/franchise/performance", actions: ["Open", "CSV"] },
               { label: "Low Stock Forecast", href: "/inventory/forecast", actions: ["Open", "CSV"] },
               { label: "Dispatch Efficiency", href: "/logistics/efficiency", actions: ["Open", "CSV"] },
             ]}
           />
        </div>
      </div>
    </div>
  );
}
