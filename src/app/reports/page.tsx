"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
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
import { accountingApi, reportsApi, posApi, salesApi, procurementApi, franchiseApi, franchiseOrdersApi, inventoryApi } from "@/lib/api";
import toast from "react-hot-toast";

// ─── Sub-Components ─────────────────────────────────────────────────────────
//reports
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
  const router = useRouter();
  const filteredItems = items.filter(item => item.label.toLowerCase().includes(searchTerm.toLowerCase()));
  
  if (filteredItems.length === 0) return null;

  const handleExport = async (item: any) => {
    const toastId = toast.loading(`Generating CSV for ${item.label}...`);
    try {
      await new Promise(res => setTimeout(res, 500));

      const rows: string[][] = [];

      switch(item.label) {
        case "Sales Order Report": {
          const soRes = await salesApi.getSalesOrders({ startDate: dateRange.startDate, endDate: dateRange.endDate });
          const orders = soRes.data?.orders ?? soRes.data ?? [];
          rows.push(["Order ID", "Date", "Customer", "Amount", "Status"]);
          orders.forEach((so: any) => rows.push([
            so.orderNumber ?? so.id ?? "",
            so.createdAt ? new Date(so.createdAt).toLocaleDateString("en-IN") : "",
            so.customer?.name ?? "Walk-in",
            String(so.totalAmount ?? 0),
            so.status ?? ""
          ]));
          break;
        }
        case "POS Invoices": {
          const posRes = await posApi.getOrders({ startDate: dateRange.startDate, endDate: dateRange.endDate });
          const orders = posRes.data?.orders ?? posRes.data ?? [];
          rows.push(["Invoice No", "Date", "Amount", "Payment Mode", "Status"]);
          orders.forEach((inv: any) => rows.push([
            inv.invoiceNum ?? inv.orderNumber ?? inv.id ?? "",
            inv.createdAt ? new Date(inv.createdAt).toLocaleDateString("en-IN") : "",
            String(inv.totalAmount ?? 0),
            inv.paymentMethod ?? inv.paymentMode ?? "CASH",
            inv.status ?? ""
          ]));
          break;
        }
        case "Purchase Orders": {
          const poRes = await procurementApi.getPOs({ startDate: dateRange.startDate, endDate: dateRange.endDate });
          const orders = poRes.data?.orders ?? poRes.data ?? [];
          rows.push(["PO Number", "Date", "Vendor", "Total Value", "Status"]);
          orders.forEach((po: any) => rows.push([
            po.poNumber ?? po.id ?? "",
            po.createdAt ? new Date(po.createdAt).toLocaleDateString("en-IN") : "",
            po.vendor?.name ?? "N/A",
            String(po.totalAmount ?? 0),
            po.status ?? ""
          ]));
          break;
        }
        case "Operational Expenses": {
          const expRes = await accountingApi.getExpenses({ startDate: dateRange.startDate, endDate: dateRange.endDate });
          const expenses = expRes.data?.expenses ?? expRes.data ?? [];
          rows.push(["Expense No", "Date", "Category", "Payee", "Amount", "Paid Amount", "Status"]);
          expenses.forEach((exp: any) => rows.push([
            exp.expenseNumber ?? exp.id ?? "",
            (exp.expenseDate ?? exp.date ?? exp.createdAt) ? new Date(exp.expenseDate ?? exp.date ?? exp.createdAt).toLocaleDateString("en-IN") : "",
            exp.category ?? "",
            exp.payee ?? "",
            String(exp.amount ?? exp.totalAmount ?? 0),
            String(exp.paidAmount ?? 0),
            exp.status ?? ""
          ]));
          break;
        }
        case "Profit & Loss": {
          const plRes = await reportsApi.getDetailedProfit({ startDate: dateRange.startDate, endDate: dateRange.endDate });
          const pl = plRes.data ?? {};
          rows.push(["Category", "Metric", "Amount (INR)"]);
          rows.push(["Revenue", "Total Revenue", String(pl.revenue ?? 0)]);
          rows.push(["Expenses", "Cost of Goods Sold", String(pl.cogs ?? 0)]);
          rows.push(["Expenses", "Operating Expenses", String(pl.expenses ?? 0)]);
          rows.push(["Profit", "Net Profit", String((pl.revenue ?? 0) - (pl.cogs ?? 0) - (pl.expenses ?? 0))]);
          break;
        }
        case "Balance Sheet": {
          const bsRes = await accountingApi.getCashFlow();
          const bs = bsRes.data?.breakdown ?? bsRes.data ?? {};
          rows.push(["Account Type", "Account", "Balance (INR)"]);
          rows.push(["Asset", "Cash in Hand", String(bs.cash ?? 0)]);
          rows.push(["Asset", "Bank Accounts", String(bs.bank ?? 0)]);
          rows.push(["Asset", "UPI / Digital", String(bs.upi ?? 0)]);
          break;
        }
        case "Stock Valuation": {
          const stockRes = await reportsApi.getInventoryValue();
          const items = stockRes.data?.items ?? stockRes.data ?? [];
          rows.push(["SKU", "Item Name", "Category", "Quantity", "Unit Cost", "Total Value"]);
          items.forEach((itm: any) => {
            const cost = itm.basePrice ?? itm.costPrice ?? itm.avgPrice ?? 0;
            rows.push([itm.sku ?? "", itm.name ?? "", itm.category ?? "", String(itm.currentStock ?? 0), String(cost), String((itm.currentStock ?? 0) * cost)]);
          });
          break;
        }
        case "Franchise Performance": {
          const fRes = await franchiseApi.getAll();
          const franchises = fRes.data?.franchises ?? fRes.data ?? [];
          rows.push(["Franchise ID", "Name", "Location", "Status"]);
          franchises.forEach((f: any) => rows.push([f.id ?? "", f.name ?? "", f.city ?? f.location ?? "Local", f.isActive ? "Active" : "Inactive"]));
          break;
        }
        case "Low Stock Forecast": {
          const alertRes = await inventoryApi.getAlerts();
          const alerts = alertRes.data?.alerts ?? alertRes.data ?? [];
          rows.push(["SKU", "Item Name", "Category", "Current Stock", "Minimum Stock", "Status"]);
          alerts.forEach((itm: any) => rows.push([
            itm.sku ?? "", itm.name ?? "", itm.category ?? "",
            String(itm.currentStock ?? 0), String(itm.minimumStock ?? 0),
            (itm.currentStock ?? 0) <= (itm.minimumStock ?? 0) / 2 ? "Critical" : "Warning"
          ]));
          break;
        }
        case "Dispatch Efficiency": {
          const dispRes = await franchiseOrdersApi.getAll({ startDate: dateRange.startDate, endDate: dateRange.endDate });
          const orders = dispRes.data?.orders ?? dispRes.data ?? [];
          rows.push(["Order ID", "Franchise", "Total Value", "Status", "Dispatch Date"]);
          orders.forEach((order: any) => rows.push([
            order.id ?? "", order.franchise?.name ?? "N/A", String(order.totalAmount ?? 0), order.status ?? "",
            order.expectedDispatchDate ? new Date(order.expectedDispatchDate).toLocaleDateString("en-IN") : "N/A"
          ]));
          break;
        }
        case "General Ledger": {
          const glRes = await accountingApi.getLedgerSummary({ startDate: dateRange.startDate, endDate: dateRange.endDate });
          const d = glRes.data ?? {};
          rows.push(["Category", "Count", "Total Value", "Due", "Received/Paid"]);
          rows.push(["Invoices", String(d.invoices?.count ?? 0), String(d.invoices?.total ?? 0), String(d.invoices?.due ?? 0), String(d.invoices?.received ?? 0)]);
          rows.push(["Purchases/Expenses", String(d.expenses?.count ?? 0), String(d.expenses?.total ?? 0), String(d.expenses?.due ?? 0), String(d.expenses?.paid ?? 0)]);
          break;
        }
        default:
          toast.error(`CSV export not available for "${item.label}"`, { id: toastId });
          return;
      }

      if (rows.length <= 1) {
        toast.error(`No data found for "${item.label}" in the selected date range.`, { id: toastId });
        return;
      }

      // Safe CSV serialisation — quote fields containing commas/newlines/quotes
      const csvString = rows.map(row =>
        row.map(cell => {
          const str = String(cell ?? "").replace(/"/g, '""');
          return str.includes(",") || str.includes("\n") || str.includes('"') ? `"${str}"` : str;
        }).join(",")
      ).join("\n");

      // Blob + createObjectURL — reliable in all browsers, handles UTF-8 + special chars
      const blob = new Blob(["\uFEFF" + csvString], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `${item.label.replace(/[^a-z0-9]/gi, "_").toLowerCase()}_${dateRange.startDate}_to_${dateRange.endDate}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      toast.success(`Exported ${rows.length - 1} records successfully`, { 
        id: toastId,
        style: { borderRadius: "10px", background: "#10b981", color: "#fff" }
      });
    } catch (error: any) {
      console.error("CSV export error:", error);
      toast.error(error?.response?.data?.error ?? "Failed to generate CSV export", { id: toastId });
    }
  };

  const handleOpen = (item: any) => {
    router.push(item.href);
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
  const router = useRouter();
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
        startDate: dateRange.startDate,
        endDate: dateRange.endDate
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
                       <div className="p-6 space-y-4">
                         {/* Purchase Orders Row */}
                         <div>
                           <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 ml-1">Purchase Orders</p>
                           <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                             <SummaryCard icon={<ShoppingCartIcon size={20} />} label="Total POs" value={summary?.purchaseOrders?.count?.toString() || "0"} color="blue" />
                             <SummaryCard icon={<PlusIcon size={20} />} label="PO Value" value={`₹${(summary?.purchaseOrders?.total || 0).toLocaleString()}`} color="blue" />
                             <SummaryCard icon={<BadgeDollarSignIcon size={20} />} label="PO Due" value={`₹${(summary?.purchaseOrders?.due || 0).toLocaleString()}`} color="orange" />
                           </div>
                         </div>
                         <div className="border-t border-[#F0EAF0] dark:border-slate-700 pt-4">
                           <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 ml-1">Operational Expenses</p>
                           <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                             <SummaryCard icon={<ShoppingCartIcon size={20} />} label="Total Expenses" value={summary?.expenses?.count?.toString() || "0"} color="blue" />
                             <SummaryCard icon={<BadgeDollarSignIcon size={20} />} label="Total Billed" value={`₹${(summary?.expenses?.total || 0).toLocaleString()}`} color="orange" />
                             <SummaryCard icon={<BadgeDollarSignIcon size={20} />} label="Amount Paid" value={`₹${(summary?.expenses?.paid || 0).toLocaleString()}`} color="green" />
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
             searchTerm={searchTerm}
             dateRange={dateRange}
             items={[
               { label: "Sales Order Report", href: "/sales/orders", actions: ["Open", "CSV"] },
               { label: "POS Invoices", href: "/pos/invoices", actions: ["Open", "CSV"] },
              //  { label: "Franchise Royalty Dues", href: "/franchise/dues", actions: ["Open"] },
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
               { label: "Low Stock Forecast", href: "/inventory/forecast", actions: ["Open", "CSV"]},
               { label: "Dispatch Efficiency", href: "/logistics/efficiency", actions: ["Open", "CSV"] },
             ]}
           />
        </div>
      </div>
    </div>
  );
}
