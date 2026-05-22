"use client";

import { useState, useEffect } from "react";
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
  Search as SearchIcon,
  Info as InfoIcon,
  IndianRupee as IndianRupeeIcon,
  Crown as CrownIcon,
  Users as UsersIcon,
  Layers as LayersIcon,
  Package as PackageIcon,
  TrendingUp as TrendingUpIcon,
  Calculator as CalculatorIcon,
  Wallet as WalletIcon,
  Landmark as LandmarkIcon,
  Printer as PrinterIcon,
  Share2 as ShareIcon,
  MoreVertical as MoreVerticalIcon,
  BarChart4 as ChartIcon,
  FileSpreadsheet as ExcelIcon
} from "lucide-react";
import { clsx } from "clsx";
import toast from "react-hot-toast";

interface ReportItem {
  label: string;
  isNew?: boolean;
  isVip?: boolean;
}

interface ReportCategory {
  title: string;
  icon: any;
  items: ReportItem[];
}

const REPORT_CATEGORIES: ReportCategory[] = [
  {
    title: "Transaction report",
    icon: FileTextIcon,
    items: [
      { label: "Sale" },
      { label: "Purchase" },
      { label: "Day book" },
      { label: "All Transactions" },
      { label: "Profit And Loss" },
      { label: "Bill Wise Profit", isVip: true },
      { label: "Cash flow" },
      { label: "Trial Balance Report", isNew: true, isVip: true },
      { label: "Balance Sheet", isVip: true },
    ]
  },
  {
    title: "Party report",
    icon: UsersIcon,
    items: [
      { label: "Party Statement" },
      { label: "Party wise Profit & Loss", isVip: true },
      { label: "All parties" },
      { label: "Party Report By Item" },
      { label: "Sale Purchase By Party" },
      { label: "Sale Purchase By Party Group" },
    ]
  },
  {
    title: "GST reports",
    icon: LayersIcon,
    items: [
      { label: "GSTR 1" },
      { label: "GSTR 2" },
      { label: "GSTR 3 B" },
      { label: "GSTR 9" },
      { label: "Sale Summary By HSN" },
      { label: "SAC Report" },
    ]
  },
  {
    title: "Item/ Stock report",
    icon: PackageIcon,
    items: [
      { label: "Stock summary" },
      { label: "Item Report By Party" },
      { label: "Item Wise Profit And Loss" },
      { label: "Item Category Wise Profit And Loss" },
      { label: "Low Stock Summary" },
      { label: "Stock Detail" },
      { label: "Item Detail" },
      { label: "Sale/ Purchase Report By Item Category" },
      { label: "Stock Summary Report By Item Category" },
      { label: "Item Wise Discount" },
    ]
  },
  {
    title: "Business Status",
    icon: TrendingUpIcon,
    items: [
      { label: "Bank Statement" },
      { label: "Discount Report" },
    ]
  },
  {
    title: "Taxes",
    icon: CalculatorIcon,
    items: [
      { label: "GST Report" },
      { label: "GST Rate Report" },
      { label: "Form No. 27EQ" },
      { label: "TCS Receivable" },
      { label: "TDS Payable" },
      { label: "TDS Receivable" },
    ]
  },
  {
    title: "Expense report",
    icon: WalletIcon,
    items: [
      { label: "Expense" },
      { label: "Expense Category Report" },
      { label: "Expense Item Report" },
    ]
  },
  {
    title: "Sale Order report",
    icon: ShoppingCartIcon,
    items: [
      { label: "Sale Orders" },
    ]
  },
  {
    title: "Loan Accounts",
    icon: LandmarkIcon,
    items: [
      { label: "Loan Statement" },
    ]
  }
];

interface MockDataRow {
  [key: string]: any;
}

interface MockReportDetails {
  title: string;
  addBtnLabel?: string;
  addBtnColor?: string;
  kpiLabel: string;
  kpiValue: string;
  kpiSubText: string;
  kpiTrend?: string;
  tableTitle: string;
  columns: { key: string; label: string }[];
  data: MockDataRow[];
}

const getReportDetails = (label: string): MockReportDetails => {
  switch (label) {
    case "Sale":
      return {
        title: "Sale Invoices",
        addBtnLabel: "+ Add Sale",
        addBtnColor: "bg-red-600 hover:bg-red-700 focus:ring-red-500",
        kpiLabel: "Total Sales Amount",
        kpiValue: "₹ 875",
        kpiSubText: "Received: ₹ 500  Balance: ₹ 375",
        kpiTrend: "100% ↗ vs last month",
        tableTitle: "Transactions",
        columns: [
          { key: "date", label: "Date" },
          { key: "invoiceNo", label: "Invoice no" },
          { key: "partyName", label: "Party Name" },
          { key: "transaction", label: "Transaction" },
          { key: "paymentType", label: "Payment Type" },
          { key: "amount", label: "Amount" },
          { key: "balance", label: "Balance" }
        ],
        data: [
          { date: "08/05/2026", invoiceNo: "1", partyName: "selva", transaction: "Lite Sale", paymentType: "Cash", amount: "₹ 875", balance: "₹ 375" }
        ]
      };
    case "Purchase":
      return {
        title: "Purchase Orders",
        addBtnLabel: "+ Add Purchase",
        addBtnColor: "bg-emerald-600 hover:bg-emerald-700 focus:ring-emerald-500",
        kpiLabel: "Total Purchases Value",
        kpiValue: "₹ 15,240",
        kpiSubText: "Paid: ₹ 12,000  Balance: ₹ 3,240",
        kpiTrend: "12% ↗ vs last month",
        tableTitle: "Purchase Orders",
        columns: [
          { key: "date", label: "Date" },
          { key: "poNo", label: "PO No" },
          { key: "supplier", label: "Supplier" },
          { key: "status", label: "Status" },
          { key: "paymentType", label: "Payment Type" },
          { key: "amount", label: "Amount" },
          { key: "balance", label: "Balance" }
        ],
        data: [
          { date: "15/05/2026", poNo: "PO-2026-001", supplier: "Supreme Ingredients", status: "Billed", paymentType: "Bank Transfer", amount: "₹ 10,500", balance: "₹ 0" },
          { date: "18/05/2026", poNo: "PO-2026-002", supplier: "Fresh Dairy Co.", status: "Pending", paymentType: "Credit", amount: "₹ 4,740", balance: "₹ 3,240" }
        ]
      };
    case "Day book":
      return {
        title: "Day Book Ledger",
        kpiLabel: "Daily Cash Flow Net",
        kpiValue: "+₹ 4,375",
        kpiSubText: "Cash In: ₹ 8,500  Cash Out: ₹ 4,125",
        tableTitle: "Daily Ledger Entries",
        columns: [
          { key: "time", label: "Time" },
          { key: "particulars", label: "Particulars" },
          { key: "voucherType", label: "Voucher Type" },
          { key: "voucherNo", label: "Voucher No" },
          { key: "debit", label: "Debit (In)" },
          { key: "credit", label: "Credit (Out)" }
        ],
        data: [
          { time: "09:30 AM", particulars: "Opening Cash Balance", voucherType: "System", voucherNo: "-", debit: "₹ 10,000", credit: "-" },
          { time: "11:15 AM", particulars: "selva (Invoice #1)", voucherType: "Sale", voucherNo: "1", debit: "₹ 500", credit: "-" },
          { time: "02:00 PM", particulars: "Office Supplies Expense", voucherType: "Expense", voucherNo: "EXP-04", debit: "-", credit: "₹ 1,125" },
          { time: "04:30 PM", particulars: "Franchise Royalty Received", voucherType: "Receipt", voucherNo: "REC-99", debit: "₹ 3,875", credit: "-" }
        ]
      };
    case "All Transactions":
      return {
        title: "All Account Transactions",
        kpiLabel: "Total Transaction Volume",
        kpiValue: "4 Transactions",
        kpiSubText: "Debit Total: ₹ 14,375  Credit Total: ₹ 1,125",
        tableTitle: "Account Transactions",
        columns: [
          { key: "date", label: "Date" },
          { key: "refNo", label: "Reference No" },
          { key: "particulars", label: "Particulars" },
          { key: "type", label: "Type" },
          { key: "amount", label: "Amount" },
          { key: "status", label: "Status" }
        ],
        data: [
          { date: "08/05/2026", refNo: "INV-001", particulars: "selva", type: "Sale", amount: "₹ 875", status: "Partial" },
          { date: "15/05/2026", refNo: "PO-001", particulars: "Supreme Ingredients", type: "Purchase", amount: "₹ 10,500", status: "Completed" },
          { date: "18/05/2026", refNo: "EXP-04", particulars: "Office Supplies", type: "Expense", amount: "₹ 1,125", status: "Paid" },
          { date: "22/05/2026", refNo: "REC-99", particulars: "Royalty Payment", type: "Receipt", amount: "₹ 3,875", status: "Completed" }
        ]
      };
    case "Profit And Loss":
      return {
        title: "Profit and Loss Statement",
        kpiLabel: "Net Profit Margin",
        kpiValue: "₹ 8,765",
        kpiSubText: "Operating Revenues: ₹ 24,500  Total Expenses: ₹ 15,735",
        kpiTrend: "14.2% Margin Increase",
        tableTitle: "Revenue & Expense Accounts",
        columns: [
          { key: "category", label: "Category" },
          { key: "accountName", label: "Account Name" },
          { key: "mtd", label: "Month to Date" },
          { key: "ytd", label: "Year to Date" }
        ],
        data: [
          { category: "Revenue", accountName: "Direct Sales Revenue", mtd: "₹ 18,250", ytd: "₹ 92,100" },
          { category: "Revenue", accountName: "Franchise Fee Income", mtd: "₹ 6,250", ytd: "₹ 37,500" },
          { category: "Expenses", accountName: "Cost of Goods Sold (COGS)", mtd: "₹ 11,500", ytd: "₹ 54,200" },
          { category: "Expenses", accountName: "Operational Expense", mtd: "₹ 3,125", ytd: "₹ 18,700" },
          { category: "Expenses", accountName: "Taxes & Levies", mtd: "₹ 1,110", ytd: "₹ 6,660" }
        ]
      };
    default:
      // Generic fallback report template
      return {
        title: `${label} Report`,
        kpiLabel: `Total ${label} Metric`,
        kpiValue: "₹ 45,850",
        kpiSubText: "Updated: Just now  Period: Selected Range",
        tableTitle: "Report Details",
        columns: [
          { key: "date", label: "Date" },
          { key: "description", label: "Description" },
          { key: "reference", label: "Reference" },
          { key: "amount", label: "Amount" },
          { key: "status", label: "Status" }
        ],
        data: [
          { date: "12/05/2026", description: `Sample Entry A for ${label}`, reference: "REF-A09", amount: "₹ 25,400", status: "Verified" },
          { date: "19/05/2026", description: `Sample Entry B for ${label}`, reference: "REF-B12", amount: "₹ 20,450", status: "Verified" }
        ]
      };
  }
};

const getReportHref = (label: string): string => {
  switch (label) {
    case "Sales Order Report":
    case "Sale Orders":
    case "Sale Purchase By Party":
    case "Sale Purchase By Party Group":
      return "/sales/orders";
    case "POS Invoices":
    case "Sale":
    case "Sale Summary By HSN":
      return "/sales/invoices";
    case "Purchase Orders":
    case "Purchase":
      return "/purchases/orders";
    case "Operational Expenses":
    case "Expense":
    case "Expense Category Report":
    case "Expense Item Report":
    case "GST Report":
    case "GST Rate Report":
    case "Form No. 27EQ":
    case "TCS Receivable":
    case "TDS Payable":
    case "TDS Receivable":
    case "GSTR 1":
    case "GSTR 2":
    case "GSTR 3 B":
    case "GSTR 9":
      return "/accounting/expenses";
    case "Supplier Payments":
      return "/accounting/payments";
    case "General Ledger":
    case "SAC Report":
    case "Bank Statement":
    case "Loan Statement":
      return "/accounting/ledgers";
    case "Profit & Loss":
    case "Profit And Loss":
    case "Bill Wise Profit":
    case "Party wise Profit & Loss":
    case "Discount Report":
      return "/accounting/profit-loss";
    case "Balance Sheet":
      return "/accounting/balance-sheet";
    case "Cash Flow Statement":
    case "Cash flow":
      return "/accounting/cash-flow";
    case "Trial Balance":
    case "Trial Balance Report":
      return "/accounting/trial-balance";
    case "Stock Valuation":
    case "Stock summary":
    case "Item Report By Party":
    case "Stock Detail":
    case "Item Detail":
    case "Sale/ Purchase Report By Item Category":
    case "Stock Summary Report By Item Category":
      return "/inventory/stock-value";
    case "Product P&L":
    case "Item Wise Profit And Loss":
    case "Item Category Wise Profit And Loss":
    case "Item Wise Discount":
      return "/inventory/product-pnl";
    case "Franchise Royalty Dues":
    case "All parties":
      return "/franchise/dues";
    case "Franchise Performance":
    case "Party Statement":
      return "/franchise/performance";
    case "Low Stock Forecast":
    case "Low Stock Summary":
      return "/inventory/forecast";
    case "Dispatch Efficiency":
      return "/logistics/efficiency";
    default:
      return "/reports";
  }
};

export default function CentralReports() {
  const [mounted, setMounted] = useState(false);
  const [selectedReport, setSelectedReport] = useState("Sale");
  const [sidebarSearchTerm, setSidebarSearchTerm] = useState("");
  const [tableSearchTerm, setTableSearchTerm] = useState("");
  const [dateFilter, setDateFilter] = useState("This Month");

  useEffect(() => { setMounted(true); }, []);

  if (!mounted) return <div className="min-h-screen bg-[#FDFCFD] dark:bg-[#020617]" />;

  const activeReport = getReportDetails(selectedReport);

  const handleActionClick = (actionName: string) => {
    toast.success(`Action triggered: ${actionName}`);
  };

  const handlePrint = () => {
    toast.success(`Preparing print layout for ${activeReport.title}...`);
    window.print();
  };

  const handleExportCSV = () => {
    handleExport(selectedReport);
  };

  const handleOpen = async (itemLabel: string) => {
    const href = getReportHref(itemLabel);
    const toastId = toast.loading(`Loading ${itemLabel}...`);
    try {
      await new Promise(res => setTimeout(res, 500));
      
      const reportsWithData = [
        "Sale", "Purchase", "Day book", "All Transactions", "Profit And Loss", 
        "Bill Wise Profit", "Cash flow", "Trial Balance Report", "Balance Sheet",
        "Party Statement", "Party wise Profit & Loss", "All parties", "Party Report By Item",
        "Sale Purchase By Party", "Sale Purchase By Party Group",
        "GSTR 1", "GSTR 2", "GSTR 3 B", "GSTR 9", "Sale Summary By HSN", "SAC Report",
        "Stock summary", "Item Report By Party", "Item Wise Profit And Loss",
        "Item Category Wise Profit And Loss", "Low Stock Summary", "Stock Detail", "Item Detail",
        "Sale/ Purchase Report By Item Category", "Stock Summary Report By Item Category",
        "Item Wise Discount", "Bank Statement", "Discount Report", "GST Report",
        "GST Rate Report", "Form No. 27EQ", "TCS Receivable", "TDS Payable", "TDS Receivable",
        "Expense", "Expense Category Report", "Expense Item Report", "Sale Orders", "Loan Statement"
      ];

      if (!reportsWithData.includes(itemLabel)) {
        toast.error(`No data available to display for ${itemLabel} in the selected period.`, {
          id: toastId,
          style: { borderRadius: '10px', background: '#333', color: '#fff' }
        });
        return;
      }

      toast.success(`Opening ${itemLabel}`, { id: toastId });
      window.location.href = href;
    } catch (error) {
      toast.error("Failed to open report", { id: toastId });
    }
  };

  const handleExport = async (itemLabel: string) => {
    const toastId = toast.loading(`Generating CSV for ${itemLabel}...`);
    try {
      await new Promise(res => setTimeout(res, 800));

      const csvContent = "data:text/csv;charset=utf-8,Date,Reference,Description,Amount,Status\n" +
        `2026-04-15,REF-001,Sample Entry 1,5000,Completed\n` +
        `2026-04-18,REF-002,Sample Entry 2,12000,Completed\n`;

      const encodedUri = encodeURI(csvContent);
      const link = document.createElement("a");
      link.setAttribute("href", encodedUri);
      link.setAttribute("download", `${itemLabel.replace(/\s+/g, '_').toLowerCase()}_2026-04-22_2026-05-22.csv`);
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

  // Filter sidebar based on search query
  const filteredCategories = REPORT_CATEGORIES.map(category => {
    const filteredItems = category.items.filter(item =>
      item.label.toLowerCase().includes(sidebarSearchTerm.toLowerCase())
    );
    return { ...category, items: filteredItems };
  }).filter(category => category.items.length > 0);

  // Filter table data
  const filteredTableData = activeReport.data.filter(row => {
    return Object.values(row).some(val => 
      String(val).toLowerCase().includes(tableSearchTerm.toLowerCase())
    );
  });

  return (
    <div className="flex h-[calc(100vh-64px)] overflow-hidden bg-[#FDFCFD] dark:bg-[#020617] -m-8">
      {/* 1. Left Local Sidebar */}
      <div className="w-[280px] shrink-0 border-r border-[#F0EAF0] dark:border-slate-800 flex flex-col h-full bg-[#FAF9FA] dark:bg-slate-900/50">
        {/* Search bar inside Sidebar */}
        <div className="p-4 border-b border-[#F0EAF0] dark:border-slate-800 bg-white dark:bg-slate-900 shrink-0">
          <div className="relative">
            <SearchIcon size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search reports..."
              value={sidebarSearchTerm}
              onChange={e => setSidebarSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-1.5 bg-[#FAF9FA] dark:bg-slate-800 border border-[#F0EAF0] dark:border-slate-700 rounded-lg text-xs font-semibold text-slate-700 dark:text-slate-200 outline-none focus:border-[#7C3AED] transition-colors"
            />
          </div>
        </div>

        {/* Scrollable Categories List */}
        <div className="flex-1 overflow-y-auto">
          {filteredCategories.map((category, catIdx) => (
            <div key={catIdx} className="mb-4">
              {/* Category Header with subtle light banner background */}
              <div className="bg-[#EBF1F6] dark:bg-slate-800/80 px-4 py-2 text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest flex items-center gap-2 select-none">
                <category.icon size={12} className="text-[#0284c7]" />
                {category.title}
              </div>

              {/* Items List */}
              <div className="divide-y divide-[#F9F7F9]/10">
                {category.items.map((item, itemIdx) => {
                  const isActive = selectedReport === item.label;
                  return (
                    <div
                      key={itemIdx}
                      onClick={() => {
                        setSelectedReport(item.label);
                        setTableSearchTerm("");
                      }}
                      className={clsx(
                        "px-4 py-2.5 text-[13px] font-semibold flex items-center justify-between cursor-pointer transition-all duration-150 border-l-4 select-none group/item",
                        isActive
                          ? "bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white border-l-[#0284c7] font-bold"
                          : "text-[#555] dark:text-slate-300 hover:bg-[#F2F0F2] dark:hover:bg-slate-800/50 border-l-transparent"
                      )}
                    >
                      <div className="flex items-center gap-2 min-w-0 flex-1">
                        <span className="truncate">{item.label}</span>
                        {item.isNew && (
                          <span className="w-1.5 h-1.5 rounded-full bg-red-500 shrink-0 animate-pulse" />
                        )}
                        {item.isVip && (
                          <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-blue-50 dark:bg-blue-950/40 text-blue-500 dark:text-blue-400 shrink-0">
                            <CrownIcon size={10} className="fill-current" />
                          </span>
                        )}
                      </div>

                      {/* Hover action buttons in sidebar exactly like original */}
                      <div className="flex items-center gap-2 shrink-0 opacity-0 group-hover/item:opacity-100 transition-opacity duration-150 ml-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleOpen(item.label);
                          }}
                          className="text-slate-400 hover:text-[#7C3AED] dark:hover:text-purple-400 p-0.5 transition-colors"
                          title="Open Page"
                        >
                          <ExternalLinkIcon size={13} className="stroke-[2.5]" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleExport(item.label);
                          }}
                          className="text-slate-400 hover:text-[#7C3AED] dark:hover:text-purple-400 p-0.5 transition-colors"
                          title="Export CSV"
                        >
                          <DownloadIcon size={13} className="stroke-[2.5]" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 2. Right Content Pane */}
      <div className="flex-1 flex flex-col h-full overflow-hidden bg-white dark:bg-[#090D1A]">
        {/* Top Control Header exactly as in screenshots */}
        <div className="px-6 py-3 border-b border-[#F0EAF0] dark:border-slate-800 bg-[#FAF9FA] dark:bg-slate-900/40 flex flex-wrap items-center justify-between gap-4 shrink-0">
          {/* Header Search Field */}
          <div className="relative w-64 max-w-full">
            <SearchIcon size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder={`Search ${activeReport.title}...`}
              value={tableSearchTerm}
              onChange={e => setTableSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-1.5 bg-white dark:bg-slate-800 border border-[#F0EAF0] dark:border-slate-700 rounded-lg text-xs font-semibold text-slate-700 dark:text-slate-200 outline-none focus:border-[#7C3AED] transition-colors"
            />
          </div>

          {/* Action buttons (pinkish Add Sale, blueish Add Purchase, blue plus, ellipsis) */}
          <div className="flex items-center gap-2.5">
            <button
              onClick={() => handleActionClick("Add Sale")}
              className="px-3.5 py-1.5 rounded-lg text-xs font-black text-rose-500 bg-rose-50 hover:bg-rose-100 transition-colors uppercase tracking-wider"
            >
              + Add Sale
            </button>
            <button
              onClick={() => handleActionClick("Add Purchase")}
              className="px-3.5 py-1.5 rounded-lg text-xs font-black text-[#0284c7] bg-blue-50 hover:bg-blue-100 transition-colors uppercase tracking-wider"
            >
              + Add Purchase
            </button>
            <button
              onClick={() => handleActionClick("Quick Create")}
              className="p-2 rounded-lg text-white bg-[#0284c7] hover:bg-blue-600 transition-colors"
            >
              <PlusIcon size={14} className="stroke-[2.5]" />
            </button>
            <button
              onClick={() => handleActionClick("Options")}
              className="p-2 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
            >
              <MoreVerticalIcon size={14} />
            </button>
          </div>
        </div>

        {/* Scrollable Viewport */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Section 1: Title and Main Action */}
          <div className="flex items-center justify-between">
            <h1 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">
              {activeReport.title}
            </h1>
            {activeReport.addBtnLabel && (
              <button
                onClick={() => handleActionClick(activeReport.addBtnLabel || "")}
                className={clsx(
                  "px-4 py-2 rounded-xl text-xs font-bold text-white shadow-sm transition-all focus:outline-none focus:ring-2 focus:ring-offset-2",
                  activeReport.addBtnColor || "bg-[#7C3AED] hover:bg-purple-700"
                )}
              >
                {activeReport.addBtnLabel}
              </button>
            )}
          </div>

          {/* Section 2: Inline Filter Bar */}
          <div className="flex flex-wrap items-center gap-4 bg-[#FAF9FA] dark:bg-slate-900 border border-[#F0EAF0] dark:border-slate-800 rounded-xl p-3 text-xs">
            <div className="flex items-center gap-2">
              <span className="font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Filter by:</span>
              
              {/* This Month Dropdown */}
              <div className="relative">
                <select
                  value={dateFilter}
                  onChange={e => setDateFilter(e.target.value)}
                  className="appearance-none pl-3 pr-8 py-1 bg-white dark:bg-slate-800 border border-[#F0EAF0] dark:border-slate-700 rounded-lg text-xs font-bold text-slate-700 dark:text-slate-200 outline-none cursor-pointer focus:border-[#7C3AED]"
                >
                  <option>This Month</option>
                  <option>Today</option>
                  <option>Yesterday</option>
                  <option>Last 7 Days</option>
                  <option>This Year</option>
                </select>
                <ChevronDownIcon size={12} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
              </div>
            </div>

            {/* Date Range Selector */}
            <div className="flex items-center gap-2 bg-white dark:bg-slate-800 border border-[#F0EAF0] dark:border-slate-700 px-3 py-1 rounded-lg font-bold text-slate-700 dark:text-slate-200 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-750">
              <CalendarIcon size={12} className="text-slate-400" />
              <span>01/05/2026 To 31/05/2026</span>
            </div>

            {/* Firms dropdown */}
            <div className="relative">
              <select
                className="appearance-none pl-3 pr-8 py-1 bg-white dark:bg-slate-800 border border-[#F0EAF0] dark:border-slate-700 rounded-lg text-xs font-bold text-slate-700 dark:text-slate-200 outline-none cursor-pointer focus:border-[#7C3AED]"
              >
                <option>All Firms</option>
                <option>Firm Alpha</option>
                <option>Firm Beta</option>
              </select>
              <ChevronDownIcon size={12} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            </div>
          </div>

          {/* Section 3: KPI Metrics Block */}
          <div className="max-w-md">
            <div className="border border-slate-100 dark:border-slate-800 bg-white dark:bg-[#12141c] rounded-2xl p-5 shadow-sm space-y-3 relative group overflow-hidden">
              <div className="absolute -right-8 -top-8 w-16 h-16 rounded-full bg-[#7C3AED]/5 blur-xl group-hover:bg-[#7C3AED]/10 transition-all duration-300" />
              
              <div className="flex items-start justify-between">
                <div className="space-y-0.5">
                  <span className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest block">
                    {activeReport.kpiLabel}
                  </span>
                  <p className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                    {activeReport.kpiValue}
                  </p>
                </div>
                {activeReport.kpiTrend && (
                  <span className="px-2 py-1 bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400 text-[10px] font-black uppercase rounded-lg shadow-sm">
                    {activeReport.kpiTrend}
                  </span>
                )}
              </div>

              <div className="border-t border-slate-100 dark:border-slate-800/80 pt-3 flex items-center justify-between text-xs font-bold text-slate-500 dark:text-slate-400">
                <span>{activeReport.kpiSubText}</span>
                <InfoIcon size={12} className="opacity-60 cursor-pointer hover:opacity-100" />
              </div>
            </div>
          </div>

          {/* Section 4: Table block */}
          <div className="bg-white dark:bg-[#12141c] border border-slate-100 dark:border-slate-800 rounded-2xl shadow-sm overflow-hidden">
            {/* Table Toolbar Header */}
            <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between shrink-0">
              <h2 className="text-sm font-black text-slate-800 dark:text-white uppercase tracking-wider">
                {activeReport.tableTitle}
              </h2>
              
              {/* Toolbar Buttons */}
              <div className="flex items-center gap-2 text-slate-400">
                <button
                  onClick={() => handleActionClick("Search inside table")}
                  className="p-1.5 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
                  title="Search"
                >
                  <SearchIcon size={14} className="stroke-[2.5]" />
                </button>
                <button
                  onClick={() => handleActionClick("Toggle View Chart")}
                  className="p-1.5 hover:text-[#0284c7] transition-colors"
                  title="Toggle Analytics View"
                >
                  <ChartIcon size={14} className="stroke-[2.5]" />
                </button>
                <button
                  onClick={handleExportCSV}
                  className="p-1.5 hover:text-emerald-600 transition-colors"
                  title="Export to Excel/CSV"
                >
                  <ExcelIcon size={14} className="stroke-[2.5]" />
                </button>
                <button
                  onClick={handlePrint}
                  className="p-1.5 hover:text-[#7C3AED] transition-colors"
                  title="Print Report"
                >
                  <PrinterIcon size={14} className="stroke-[2.5]" />
                </button>
              </div>
            </div>

            {/* Table Body */}
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 dark:bg-slate-800/40 border-b border-slate-100 dark:border-slate-800">
                    {activeReport.columns.map((col, idx) => (
                      <th
                        key={idx}
                        className="px-5 py-3 text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest select-none"
                      >
                        <div className="flex items-center gap-1">
                          {col.label}
                          <ChevronDownIcon size={10} className="opacity-60" />
                        </div>
                      </th>
                    ))}
                    <th className="px-5 py-3 text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest text-right">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredTableData.length > 0 ? (
                    filteredTableData.map((row, rowIdx) => (
                      <tr
                        key={rowIdx}
                        className="border-b border-slate-100 dark:border-slate-800 hover:bg-slate-50/50 dark:hover:bg-slate-800/20 transition-colors"
                      >
                        {activeReport.columns.map((col, colIdx) => (
                          <td
                            key={colIdx}
                            className="px-5 py-4 text-xs font-semibold text-slate-700 dark:text-slate-350"
                          >
                            {row[col.key]}
                          </td>
                        ))}
                        <td className="px-5 py-4 text-right">
                          <div className="inline-flex items-center gap-2.5 text-slate-400">
                            <button
                              onClick={handlePrint}
                              className="p-1 hover:text-[#7C3AED] transition-colors"
                              title="Print"
                            >
                              <PrinterIcon size={12} />
                            </button>
                            <button
                              onClick={() => handleActionClick("Share Entry")}
                              className="p-1 hover:text-blue-500 transition-colors"
                              title="Share"
                            >
                              <ShareIcon size={12} />
                            </button>
                            <button
                              onClick={() => handleActionClick("Options")}
                              className="p-1 hover:text-slate-600 dark:hover:text-slate-300"
                            >
                              <MoreVerticalIcon size={12} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td
                        colSpan={activeReport.columns.length + 1}
                        className="px-5 py-8 text-center text-xs font-bold text-slate-400"
                      >
                        No entries found matching filters.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
