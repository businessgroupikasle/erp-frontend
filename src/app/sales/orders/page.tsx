"use client";

import { useState, useEffect, useCallback } from "react";
import {
  FileText, Search, RefreshCw, Calendar, 
  ChevronRight, ArrowUpRight, Filter, ShoppingBag,
  Clock, CheckCircle2, XCircle, Printer
} from "lucide-react";
import clsx from "clsx";
import { posApi } from "@/lib/api";
import { format } from "date-fns";
import toast from "react-hot-toast";

export default function SalesOrdersPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    try {
      const res = await posApi.getOrders();
      setOrders(res.data ?? []);
    } catch (e) {
      console.error(e);
      toast.error("Failed to sync sales history");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const filtered = orders.filter((o) => {
    const matchesSearch = !search || 
      o.invoiceNum?.toLowerCase().includes(search.toLowerCase()) || 
      o.customer?.name?.toLowerCase().includes(search.toLowerCase());
    
    const matchesStatus = statusFilter === "ALL" || o.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "COMPLETED": return "bg-emerald-50 text-emerald-600 border-emerald-100";
      case "PENDING": return "bg-amber-50 text-amber-600 border-amber-100";
      case "CANCELLED": return "bg-rose-50 text-rose-600 border-rose-100";
      default: return "bg-slate-50 text-slate-600 border-slate-100";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "COMPLETED": return <CheckCircle2 size={12} />;
      case "PENDING": return <Clock size={12} />;
      case "CANCELLED": return <XCircle size={12} />;
      default: return <FileText size={12} />;
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-10 py-6 animate-in fade-in duration-700">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <div className="w-2 h-10 bg-orange-500 rounded-full" />
            <h1 className="text-4xl font-black text-slate-900 tracking-tight uppercase">Sales Orders</h1>
          </div>
          <p className="text-sm font-medium text-slate-400 max-w-md leading-relaxed ml-5">
            Full transaction history and order lifecycle management.
          </p>
        </div>

        <div className="flex items-center gap-4">
          <button
            onClick={fetchOrders}
            className="w-12 h-12 flex items-center justify-center rounded-2xl bg-white border border-slate-100 text-slate-400 hover:text-orange-500 hover:border-orange-200 transition-all active:scale-90 shadow-sm"
          >
            <RefreshCw size={18} className={clsx(loading && "animate-spin")} />
          </button>
        </div>
      </div>

      {/* Metrics & Filter Row */}
      <div className="flex flex-col lg:flex-row gap-6">
        {/* Quick Stats */}
        <div className="flex-1 grid grid-cols-2 md:grid-cols-3 gap-6">
          {[
            { label: "Today's Orders", value: orders.filter(o => format(new Date(o.createdAt), 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd')).length, color: "text-slate-900" },
            { label: "Completed", value: orders.filter(o => o.status === 'COMPLETED').length, color: "text-emerald-500" },
            { label: "Total Revenue", value: `₹${orders.reduce((acc, o) => acc + o.totalAmount, 0).toLocaleString()}`, color: "text-orange-500" },
          ].map((s) => (
            <div key={s.label} className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{s.label}</p>
              <p className={clsx("text-2xl font-black mt-1 tabular-nums", s.color)}>{s.value}</p>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div className="bg-white p-4 rounded-[2rem] border border-slate-100 shadow-sm flex flex-col md:flex-row items-center gap-4 min-w-[400px]">
          <div className="relative flex-1 w-full">
            <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search Invoice / Customer..."
              className="w-full pl-11 pr-4 py-3 bg-slate-50 border-none rounded-xl text-xs font-bold outline-none focus:ring-2 focus:ring-orange-500/10 transition-all"
            />
          </div>
          <div className="flex bg-slate-50 p-1 rounded-xl">
            {["ALL", "COMPLETED"].map(f => (
              <button
                key={f}
                onClick={() => setStatusFilter(f)}
                className={clsx(
                  "px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all",
                  statusFilter === f ? "bg-white text-slate-900 shadow-sm" : "text-slate-400 hover:text-slate-600"
                )}
              >
                {f}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Orders Table/List */}
      <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50">
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Order Info</th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Customer</th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Items</th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Total Amount</th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Status</th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td colSpan={6} className="px-8 py-6"><div className="h-4 bg-slate-100 rounded w-full" /></td>
                  </tr>
                ))
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-8 py-20 text-center">
                    <div className="flex flex-col items-center gap-3 text-slate-300">
                      <ShoppingBag size={48} strokeWidth={1} />
                      <p className="font-bold uppercase tracking-widest text-xs">No orders found matching criteria</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filtered.map((order) => (
                  <tr key={order.id} className="group hover:bg-slate-50/50 transition-colors">
                    <td className="px-8 py-6">
                      <div className="flex flex-col">
                        <span className="text-xs font-black text-slate-900 uppercase tracking-tight">{order.invoiceNum}</span>
                        <span className="text-[10px] font-bold text-slate-400 mt-1 flex items-center gap-1">
                          <Calendar size={10} /> {format(new Date(order.createdAt), 'dd MMM yyyy, HH:mm')}
                        </span>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 font-black text-[10px] uppercase">
                          {order.customer?.name?.[0] || "W"}
                        </div>
                        <div className="flex flex-col">
                          <span className="text-xs font-black text-slate-800 uppercase tracking-tight">{order.customer?.name || "Walk-in Customer"}</span>
                          {order.customer?.phone && <span className="text-[10px] font-bold text-slate-400">{order.customer.phone}</span>}
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6 text-xs font-bold text-slate-500">
                      {order.orderItems?.length || 0} items
                    </td>
                    <td className="px-8 py-6 text-right">
                      <span className="text-sm font-black text-slate-900">₹{order.totalAmount.toLocaleString()}</span>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex justify-center">
                        <span className={clsx(
                          "px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border flex items-center gap-1.5",
                          getStatusColor(order.status)
                        )}>
                          {getStatusIcon(order.status)}
                          {order.status}
                        </span>
                      </div>
                    </td>
                    <td className="px-8 py-6 text-right">
                      <button 
                        onClick={() => toast.success("Invoice view coming soon")}
                        className="p-2 rounded-xl text-slate-300 hover:text-orange-500 hover:bg-orange-50 transition-all"
                      >
                        <ArrowUpRight size={18} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
