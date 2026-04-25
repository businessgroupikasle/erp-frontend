"use client";

import { useState, useEffect } from "react";
import { Plus, ChevronRight, Calendar, ChevronDown, Download, Columns, Loader2 } from "lucide-react";
import Link from "next/link";
import { clsx } from "clsx";
import api from "@/lib/api";
import { exportToExcel, exportToPDF } from "@/lib/exportUtils";

interface LeadSourceRow {
  leadSource: string;
  totalRevenue: number;
  conversionRate: number;
  leadsGenerated: number;
  openLeads: number;
  closedLeads: number;
  lostLeads: number;
  notServiceable: number;
  avgDealValue: number;
  avgClosureTimeDays: number;
}

interface Pipeline { id: string; name: string; }

export default function LeadSourceReport() {
  const [activeTab, setActiveTab] = useState("Reports & More");
  const [pipelines, setPipelines] = useState<Pipeline[]>([]);
  const [rows, setRows] = useState<LeadSourceRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [lastUpdated, setLastUpdated] = useState("");
  const [filters, setFilters] = useState({ pipelineId: "", dateFrom: "", dateTo: "" });

  useEffect(() => {
    api.get("/api/crm/pipelines").then((r) => setPipelines(r.data)).catch(() => {});
    fetchReport();
  }, []);

  const fetchReport = async () => {
    setLoading(true);
    try {
      const params: any = {};
      if (filters.pipelineId) params.pipelineId = filters.pipelineId;
      if (filters.dateFrom) params.dateFrom = filters.dateFrom;
      if (filters.dateTo) params.dateTo = filters.dateTo;
      const res = await api.get("/api/crm/reports/lead-source", { params });
      setRows(res.data);
      setLastUpdated(new Date().toLocaleString());
    } catch { setRows([]); } finally { setLoading(false); }
  };

  const handleExport = async (type: "excel" | "pdf") => {
    const headers = ["Lead Source", "Total Revenue", "Conversion Rate (%)", "Leads", "Open", "Closed", "Lost", "Not Serviceable", "Avg Deal Value", "Avg Closure Days"];
    const data = rows.map((r) => [String(r.leadSource), String(r.totalRevenue), String(r.conversionRate), String(r.leadsGenerated), String(r.openLeads), String(r.closedLeads), String(r.lostLeads), String(r.notServiceable), String(r.avgDealValue), String(r.avgClosureTimeDays)]);
    
    if (type === "excel") {
      const excelData = rows.map(r => ({
        "Lead Source": r.leadSource,
        "Total Revenue": r.totalRevenue,
        "Conversion Rate (%)": r.conversionRate,
        "Leads": r.leadsGenerated,
        "Open": r.openLeads,
        "Closed": r.closedLeads,
        "Lost": r.lostLeads,
        "Not Serviceable": r.notServiceable,
        "Avg Deal Value": r.avgDealValue,
        "Avg Closure Days": r.avgClosureTimeDays
      }));
      await exportToExcel(excelData, "Lead_Source_Report");
    } else {
      await exportToPDF("Lead Source Report", headers, data, "Lead_Source_Report");
    }
  };

  return (
    <div className="min-h-screen bg-[#FDFCFD] dark:bg-[#020617] -m-8 font-sans">
      <div className="p-8 space-y-6">

        <div className="space-y-4">
          <div className="flex items-center gap-2 text-[10px] font-bold text-[#999] uppercase tracking-widest">
            <Link href="/" className="hover:text-[#7C3AED]">Dashboard</Link>
            <ChevronRight size={10} />
            <Link href="/crm/pipelines" className="hover:text-[#7C3AED]">Lead Management</Link>
            <ChevronRight size={10} />
            <span className="text-[#666]">Lead Source Report</span>
          </div>
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-black text-[#1A1A1A] dark:text-white">Lead Management ✨</h1>
            <Link href="/crm/leads/new" className="flex items-center gap-2 px-6 py-2.5 bg-[#D81159] hover:bg-[#B00E4A] text-white rounded-lg font-bold text-[13px] transition-all active:scale-95 shadow-lg shadow-pink-200/50">
              <Plus size={18} strokeWidth={3} /> Add New
            </Link>
          </div>
        </div>

        <div className="flex items-center gap-8 border-b border-[#F0EAF0] dark:border-slate-800">
          {["All Sales Pipelines", "Forms", "All Leads", "Reports & More"].map((tab) => (
            <button key={tab} onClick={() => setActiveTab(tab)} className={clsx("pb-3 text-[13px] font-bold transition-all relative", activeTab === tab ? "text-[#7C3AED]" : "text-[#666] dark:text-slate-500 hover:text-[#1A1A1A] dark:hover:text-white")}>
              {tab}{activeTab === tab && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#7C3AED]" />}
            </button>
          ))}
        </div>

        <div className="space-y-1">
          <h2 className="text-lg font-black text-[#1A1A1A] dark:text-white">Lead Source Report</h2>
          {lastUpdated && <p className="text-[11px] font-bold text-[#999] uppercase tabular-nums">Last Updated: {lastUpdated}</p>}
        </div>

        <div className="bg-white dark:bg-slate-900 border border-[#F0EAF0] dark:border-slate-800 rounded-2xl p-8 space-y-6 shadow-sm">
          <h3 className="text-sm font-black text-[#1A1A1A] dark:text-white">Filters</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="space-y-2">
              <label className="text-[11px] font-bold text-[#333] dark:text-white uppercase tracking-wider">Lead Created From</label>
              <div className="relative">
                <input type="date" value={filters.dateFrom} onChange={(e) => setFilters((f) => ({ ...f, dateFrom: e.target.value }))} className="w-full pl-4 pr-10 py-2.5 bg-[#FAF9FA] dark:bg-slate-800/50 border border-[#F0EAF0] dark:border-slate-800 rounded-lg text-[13px] outline-none" />
                <Calendar size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-[#999] pointer-events-none" />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-[11px] font-bold text-[#333] dark:text-white uppercase tracking-wider">Lead Created To</label>
              <div className="relative">
                <input type="date" value={filters.dateTo} onChange={(e) => setFilters((f) => ({ ...f, dateTo: e.target.value }))} className="w-full pl-4 pr-10 py-2.5 bg-white dark:bg-slate-900 border border-[#F0EAF0] dark:border-slate-800 rounded-lg text-[13px] outline-none" />
                <Calendar size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-[#999] pointer-events-none" />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-[11px] font-bold text-[#333] dark:text-white uppercase tracking-wider">Pipeline</label>
              <div className="relative">
                <select value={filters.pipelineId} onChange={(e) => setFilters((f) => ({ ...f, pipelineId: e.target.value }))} className="w-full pl-4 pr-10 py-2.5 bg-[#FAF9FA] dark:bg-slate-800/50 border border-[#F0EAF0] dark:border-slate-800 rounded-lg text-[13px] appearance-none outline-none">
                  <option value="">All Pipelines</option>
                  {pipelines.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
                </select>
                <ChevronDown size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-[#999] pointer-events-none" />
              </div>
            </div>
          </div>
          <button onClick={fetchReport} className="px-8 py-2.5 bg-[#D81159] hover:bg-[#B00E4A] text-white rounded-lg font-bold text-[13px] transition-all active:scale-95">Apply Filters</button>
        </div>

        <div className="flex justify-end">
          <div className="relative group">
            <button className="flex items-center gap-2 px-3 py-1.5 border border-[#F0EAF0] dark:border-slate-800 rounded-md text-[11px] font-bold text-[#666] hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
              <Download size={14} />
              Export
              <ChevronDown size={12} className="opacity-70" />
            </button>
            <div className="absolute right-0 top-full mt-1 w-36 bg-white dark:bg-slate-900 border border-[#F0EAF0] dark:border-slate-800 rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50">
              <button onClick={() => handleExport("excel")} className="w-full text-left px-3 py-2 text-[11px] font-bold text-[#666] dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors rounded-t-lg">
                Export as Excel
              </button>
              <button onClick={() => handleExport("pdf")} className="w-full text-left px-3 py-2 text-[11px] font-bold text-[#666] dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors rounded-b-lg">
                Export as PDF
              </button>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-[#F0EAF0] dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm">
          <div className="flex items-center justify-between p-4 border-b border-[#F0EAF0] dark:border-slate-800 bg-[#FAF9FA] dark:bg-slate-800/50">
            <span className="text-[12px] font-bold text-[#666]">{rows.length} Source{rows.length !== 1 ? "s" : ""}</span>
            <button className="flex items-center gap-2 px-3 py-1.5 border border-[#F0EAF0] dark:border-slate-800 rounded-md text-[11px] font-bold text-[#666] hover:bg-slate-50"><Columns size={14} /> Show/Hide Columns</button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[1400px]">
              <thead>
                <tr className="bg-white dark:bg-slate-900 border-b border-[#F0EAF0] dark:border-slate-800">
                  <th className="p-4 w-10"><div className="w-4 h-4 rounded border border-[#DDD]" /></th>
                  {["Lead Source", "Total Revenue", "Conversion Rate (%)", "Leads Generated", "Open Leads", "Closed Leads", "Lost Leads", "Not Serviceable", "Avg. Deal Value", "Avg Closure Days"].map((h) => (
                    <th key={h} className="p-4 text-[11px] font-bold text-[#999] dark:text-slate-500 uppercase tracking-wider whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan={11} className="py-20"><div className="flex justify-center"><Loader2 size={28} className="animate-spin text-[#7C3AED]" /></div></td></tr>
                ) : rows.length === 0 ? (
                  <tr><td colSpan={11} className="py-40 text-center"><p className="text-sm font-black text-[#1A1A1A] dark:text-white uppercase tracking-widest">No Data</p></td></tr>
                ) : (
                  rows.map((row) => (
                    <tr key={row.leadSource} className="border-b border-[#F0EAF0] dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                      <td className="p-4"><div className="w-4 h-4 rounded border border-[#DDD]" /></td>
                      <td className="p-4 text-[13px] font-bold text-[#1A1A1A] dark:text-white whitespace-nowrap">{row.leadSource}</td>
                      <td className="p-4 text-[13px] text-[#666] dark:text-slate-400 tabular-nums">₹{row.totalRevenue.toLocaleString()}</td>
                      <td className="p-4 text-[13px] text-[#666] dark:text-slate-400 tabular-nums">{row.conversionRate}%</td>
                      <td className="p-4 text-[13px] text-[#666] dark:text-slate-400 tabular-nums">{row.leadsGenerated}</td>
                      <td className="p-4 text-[13px] text-[#666] dark:text-slate-400 tabular-nums">{row.openLeads}</td>
                      <td className="p-4 text-[13px] font-bold text-emerald-600 tabular-nums">{row.closedLeads}</td>
                      <td className="p-4 text-[13px] text-red-500 tabular-nums">{row.lostLeads}</td>
                      <td className="p-4 text-[13px] text-[#666] dark:text-slate-400 tabular-nums">{row.notServiceable}</td>
                      <td className="p-4 text-[13px] text-[#666] dark:text-slate-400 tabular-nums">₹{row.avgDealValue.toLocaleString()}</td>
                      <td className="p-4 text-[13px] text-[#666] dark:text-slate-400 tabular-nums">{row.avgClosureTimeDays}d</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
