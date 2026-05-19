"use client";

import { useState, useEffect } from "react";
import { 
  Search as SearchIcon, 
  Filter as FilterIcon, 
  Calendar as CalendarIcon, 
  Printer as PrinterIcon, 
  FileText as FileTextIcon, 
  User as UserIcon, 
  ChevronRight as ChevronRightIcon, 
  ArrowLeft as ArrowLeftIcon,
  ArrowUpRight as ArrowUpRightIcon,
  Receipt as ReceiptIcon,
  Download as DownloadIcon,
  CreditCard as CreditCardIcon,
  Banknote as BanknoteIcon,
  QrCode as QrCodeIcon,
  History as HistoryIcon
} from "lucide-react";
import { clsx } from "clsx";
import { posApi } from "@/lib/api";
import { toast } from "react-hot-toast";
import Link from "next/link";

interface Invoice {
  id: string;
  orderNumber: string;
  totalAmount: number;
  subTotal: number;
  taxAmount: number;
  discountAmount: number;
  paymentMode: 'CASH' | 'UPI' | 'CARD';
  orderType: string;
  status: string;
  createdAt: string;
  customer?: { name: string; phone?: string };
  items?: any[];
}

export default function InvoicesPage() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);

  useEffect(() => {
    fetchInvoices();
  }, []);

  const fetchInvoices = async () => {
    setLoading(true);
    try {
      const res = await posApi.getOrders();
      const data = res.data?.data || res.data || [];
      const mapped = data.map((inv: any) => ({
        ...inv,
        orderNumber: inv.orderNumber || inv.invoiceNum || inv.id || ''
      }));
      setInvoices(mapped);
    } catch (err) {
      toast.error("Failed to fetch invoices");
    } finally {
      setLoading(false);
    }
  };

  const filteredInvoices = invoices.filter(inv => 
    (inv.orderNumber || '').toLowerCase().includes(search.toLowerCase()) ||
    (inv.customer?.name || '').toLowerCase().includes(search.toLowerCase()) ||
    (inv.customer?.phone || '').includes(search)
  );

  const getPaymentIcon = (mode: string) => {
    if (mode === 'CASH') return <BanknoteIcon size={14} className="text-emerald-500" />;
    if (mode === 'UPI') return <QrCodeIcon size={14} className="text-blue-500" />;
    return <CreditCardIcon size={14} className="text-violet-500" />;
  };

  return (
    <div className="max-w-[1400px] mx-auto h-[calc(100vh-100px)] flex flex-col space-y-6 py-6 px-4 animate-in fade-in duration-700">
      {/* Header */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-white dark:bg-card/40 p-8 rounded-[40px] border border-slate-100 dark:border-white/5 shadow-2xl shadow-black/[0.03]">
        <div className="flex items-center gap-6">
          <Link href="/pos" className="p-3 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl hover:bg-slate-100 transition-all">
            <ArrowLeftIcon size={20} className="text-slate-500" />
          </Link>
          <div>
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-orange-500 rounded-xl shadow-lg shadow-orange-500/20">
                <ReceiptIcon size={20} className="text-white" />
              </div>
              <h1 className="text-3xl font-black tracking-tight text-slate-900 dark:text-white uppercase">
                Sales <span className="text-slate-400 font-medium italic">Invoices</span>
              </h1>
            </div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-2 ml-14">Registry of all completed transactions and billing history</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
           <div className="relative group min-w-[300px]">
              <SearchIcon size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-orange-500 transition-colors" />
              <input 
                type="text" 
                placeholder="Search Invoice #, Customer..." 
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-full pl-11 pr-4 py-3.5 bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/10 rounded-2xl text-xs font-bold text-slate-900 placeholder:text-slate-400 outline-none focus:border-orange-500 transition-all" 
              />
           </div>
           <button onClick={fetchInvoices} className="p-3.5 bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl text-slate-500 hover:text-orange-500 hover:bg-orange-50 transition-all shadow-sm">
             <HistoryIcon size={18} />
           </button>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-3 gap-8 overflow-hidden">
        {/* List */}
        <div className="lg:col-span-2 bg-white dark:bg-card/40 rounded-[40px] border border-slate-100 dark:border-white/5 shadow-2xl shadow-black/[0.03] overflow-hidden flex flex-col">
           <div className="overflow-x-auto flex-1 scrollbar-none">
              <table className="w-full text-left border-collapse">
                <thead className="sticky top-0 bg-white/80 dark:bg-[#12141c]/80 backdrop-blur-md z-10 border-b border-slate-50 dark:border-white/5">
                  <tr className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
                    <th className="px-8 py-6 text-center">#</th>
                    <th className="px-8 py-6">Customer</th>
                    <th className="px-8 py-6">Mode</th>
                    <th className="px-8 py-6">Amount</th>
                    <th className="px-8 py-6">Date</th>
                    <th className="px-8 py-6 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50 dark:divide-white/5">
                  {loading ? (
                    Array.from({ length: 6 }).map((_, i) => (
                      <tr key={i} className="animate-pulse">
                        <td colSpan={6} className="px-8 py-4"><div className="h-10 bg-slate-50 dark:bg-white/5 rounded-2xl w-full" /></td>
                      </tr>
                    ))
                  ) : filteredInvoices.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-8 py-20 text-center">
                        <div className="flex flex-col items-center gap-4 opacity-30">
                          <FileTextIcon size={48} />
                          <p className="text-xs font-black uppercase tracking-widest">No invoices found</p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    filteredInvoices.map(invoice => (
                      <tr key={invoice.id} onClick={() => setSelectedInvoice(invoice)}
                        className={clsx("group hover:bg-slate-50/50 dark:hover:bg-white/[0.02] cursor-pointer transition-all", 
                          selectedInvoice?.id === invoice.id ? "bg-orange-50/50 dark:bg-orange-500/5" : "")}>
                        <td className="px-8 py-5 text-center">
                          <span className="text-[10px] font-black text-slate-400 uppercase tracking-tighter">
                            {(invoice.orderNumber || '').split('-').pop()}
                          </span>
                        </td>
                        <td className="px-8 py-5">
                           <div className="flex items-center gap-3">
                              <div className="w-9 h-9 rounded-xl bg-slate-100 dark:bg-white/5 flex items-center justify-center text-slate-400 group-hover:bg-orange-100 group-hover:text-orange-500 transition-all">
                                <UserIcon size={16} />
                              </div>
                              <div>
                                <p className="text-xs font-black text-slate-900 dark:text-white uppercase truncate max-w-[120px]">{invoice.customer?.name || "Walk-in"}</p>
                                <p className="text-[9px] font-bold text-slate-400 mt-0.5">{invoice.customer?.phone || "Counter Sale"}</p>
                              </div>
                           </div>
                        </td>
                        <td className="px-8 py-5">
                           <div className="flex items-center gap-2 px-2.5 py-1.5 bg-slate-50 dark:bg-white/5 rounded-lg border border-slate-100 dark:border-white/5 w-fit">
                              {getPaymentIcon(invoice.paymentMode)}
                              <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">{invoice.paymentMode}</span>
                           </div>
                        </td>
                        <td className="px-8 py-5">
                           <span className="text-sm font-black text-slate-900 dark:text-white">₹{invoice.totalAmount.toLocaleString()}</span>
                        </td>
                        <td className="px-8 py-5 text-slate-500 font-bold text-[11px]">
                           {new Date(invoice.createdAt).toLocaleDateString()}
                        </td>
                        <td className="px-8 py-5 text-right">
                           <button className="p-2 text-slate-300 hover:text-orange-500 transition-all">
                              <ArrowUpRightIcon size={18} />
                           </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
           </div>
        </div>

        {/* Details Panel */}
        <div className="bg-white dark:bg-card/40 rounded-[40px] border border-slate-100 dark:border-white/5 shadow-2xl shadow-black/[0.03] flex flex-col overflow-hidden">
          {selectedInvoice ? (
            <div className="flex-1 flex flex-col h-full animate-in slide-in-from-right-4 duration-500">
               <div className="p-8 border-b border-slate-50 dark:border-white/5 shrink-0">
                  <div className="flex items-center justify-between mb-6">
                    <span className="px-3 py-1 bg-orange-100 dark:bg-orange-500/10 text-orange-600 text-[10px] font-black rounded-lg uppercase tracking-widest">
                      Invoice Detailed
                    </span>
                    <div className="flex gap-2">
                       <button className="p-2.5 bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/10 rounded-xl text-slate-400 hover:text-slate-900 transition-all">
                         <PrinterIcon size={16} />
                       </button>
                       <button className="p-2.5 bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/10 rounded-xl text-slate-400 hover:text-slate-900 transition-all">
                         <DownloadIcon size={16} />
                       </button>
                    </div>
                  </div>
                  <h2 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tighter">{selectedInvoice.orderNumber || selectedInvoice.id}</h2>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-2">Placed on {new Date(selectedInvoice.createdAt).toLocaleString()}</p>
               </div>

               <div className="flex-1 overflow-y-auto p-8 space-y-8 scrollbar-none">
                  {/* Customer Info */}
                  <div className="grid grid-cols-2 gap-6">
                     <div className="space-y-1">
                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Customer Detail</p>
                        <p className="text-xs font-black text-slate-900 dark:text-white uppercase">{selectedInvoice.customer?.name || "Walk-in"}</p>
                        <p className="text-[10px] font-bold text-slate-500">{selectedInvoice.customer?.phone || "No phone linked"}</p>
                     </div>
                     <div className="space-y-1 text-right">
                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Payment Source</p>
                        <p className="text-xs font-black text-slate-900 dark:text-white uppercase">{selectedInvoice.paymentMode}</p>
                        <p className="text-[10px] font-bold text-slate-500">{selectedInvoice.orderType.toUpperCase()}</p>
                     </div>
                  </div>

                  {/* Items List */}
                  <div className="space-y-4">
                     <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Invoice Line Items</p>
                     <div className="space-y-2">
                        {selectedInvoice.items?.map((item, i) => (
                           <div key={i} className="flex justify-between items-center p-4 bg-slate-50 dark:bg-white/5 rounded-2xl border border-slate-100 dark:border-white/5">
                              <div>
                                 <p className="text-[11px] font-black text-slate-900 dark:text-white uppercase line-clamp-1">{item.productName || "Product Item"}</p>
                                 <p className="text-[10px] font-bold text-slate-400 mt-1">₹{item.unitPrice} × {item.quantity}</p>
                              </div>
                              <p className="text-xs font-black text-slate-900 dark:text-white">₹{item.totalPrice.toLocaleString()}</p>
                           </div>
                        ))}
                     </div>
                  </div>

                  {/* Totals Summary */}
                  <div className="bg-slate-900 dark:bg-orange-500 p-8 rounded-[32px] text-white space-y-4 shadow-xl shadow-black/5">
                     <div className="flex justify-between text-[11px] font-black uppercase tracking-widest opacity-60">
                        <span>Subtotal</span>
                        <span>₹{selectedInvoice.subTotal.toLocaleString()}</span>
                     </div>
                     <div className="flex justify-between text-[11px] font-black uppercase tracking-widest opacity-60">
                        <span>GST / Tax</span>
                        <span>₹{selectedInvoice.taxAmount.toLocaleString()}</span>
                     </div>
                     {selectedInvoice.discountAmount > 0 && (
                        <div className="flex justify-between text-[11px] font-black uppercase tracking-widest text-orange-200">
                           <span>Discount Applied</span>
                           <span>- ₹{selectedInvoice.discountAmount.toLocaleString()}</span>
                        </div>
                     )}
                     <div className="pt-4 border-t border-white/10 flex justify-between items-end">
                        <p className="text-[10px] font-black uppercase tracking-[0.2em] opacity-60">Final Total</p>
                        <p className="text-3xl font-black tabular-nums tracking-tighter">₹{selectedInvoice.totalAmount.toLocaleString()}</p>
                     </div>
                  </div>
               </div>
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center p-12 text-center space-y-6 opacity-40">
               <div className="w-24 h-24 bg-slate-100 dark:bg-white/5 rounded-3xl flex items-center justify-center">
                  <FileTextIcon size={40} className="text-slate-300" />
               </div>
               <div>
                  <p className="text-sm font-black uppercase tracking-widest text-slate-900 dark:text-white">Select Invoice</p>
                  <p className="text-[10px] font-bold text-slate-500 mt-2">Choose a transaction record from the list to view full breakdown and items</p>
               </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
