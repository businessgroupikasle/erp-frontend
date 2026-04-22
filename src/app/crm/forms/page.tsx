"use client";

import { useState, useEffect } from "react";
import {
  Plus,
  Search,
  ChevronRight,
  Filter,
  X,
  Columns,
  Loader2,
  ToggleLeft,
  ToggleRight,
  Trash2
} from "lucide-react";
import Link from "next/link";
import { clsx } from "clsx";
import api from "@/lib/api";

interface CRMForm {
  id: string;
  name: string;
  status: string;
  capturedLeads: number;
  createdAt: string;
  updatedAt: string;
  pipeline?: { name: string };
  creatorId?: string;
}

const SUB_TABS = ["All Forms", "Active Forms", "Inactive Forms", "Deleted Forms"];

export default function CRMFormsPage() {
  const [activeTab, setActiveTab] = useState("Forms");
  const [subTab, setSubTab] = useState("All Forms");
  const [showFilters, setShowFilters] = useState(false);
  const [search, setSearch] = useState("");
  const [forms, setForms] = useState<CRMForm[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchForms();
  }, [subTab]);

  const fetchForms = async () => {
    setLoading(true);
    try {
      const statusMap: Record<string, string> = {
        "Active Forms": "ACTIVE",
        "Inactive Forms": "INACTIVE",
        "Deleted Forms": "DELETED"
      };
      const params: any = {};
      if (statusMap[subTab]) params.status = statusMap[subTab];
      const res = await api.get("/api/crm/forms", { params });
      setForms(res.data);
    } catch {
      setForms([]);
    } finally {
      setLoading(false);
    }
  };

  const toggleStatus = async (form: CRMForm) => {
    const newStatus = form.status === "ACTIVE" ? "INACTIVE" : "ACTIVE";
    try {
      await api.patch(`/api/crm/forms/${form.id}`, { status: newStatus });
      fetchForms();
    } catch {}
  };

  const deleteForm = async (id: string) => {
    if (!confirm("Delete this form?")) return;
    try {
      await api.delete(`/api/crm/forms/${id}`);
      fetchForms();
    } catch {}
  };

  const filtered = forms.filter((f) =>
    f.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[#FDFCFD] dark:bg-[#020617] -m-8 font-sans">
      <div className="p-8 space-y-6">

        {/* Breadcrumbs & Header */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-[10px] font-bold text-[#999] uppercase tracking-widest">
            <Link href="/" className="hover:text-[#7C3AED]">Dashboard</Link>
            <ChevronRight size={10} />
            <Link href="/crm/pipelines" className="hover:text-[#7C3AED]">Lead Management</Link>
            <ChevronRight size={10} />
            <span className="text-[#666]">All Forms</span>
          </div>

          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-black text-[#1A1A1A] dark:text-white flex items-center gap-2">
              All Forms <span className="text-xl">✨</span>
            </h1>
            <Link
              href="/crm/forms/new"
              className="flex items-center gap-2 px-6 py-2.5 bg-[#D81159] hover:bg-[#B00E4A] text-white rounded-lg font-bold text-[13px] transition-all active:scale-95 shadow-lg shadow-pink-200/50"
            >
              <Plus size={18} strokeWidth={3} />
              Create Form
            </Link>
          </div>
        </div>

        {/* Primary Tabs */}
        <div className="flex items-center gap-8 border-b border-[#F0EAF0] dark:border-slate-800">
          {["All Sales Pipelines", "Forms", "All Leads", "Reports & More"].map((tab) => (
            <button
               key={tab}
               onClick={() => setActiveTab(tab)}
               className={clsx(
                 "pb-3 text-[13px] font-bold transition-all relative flex items-center gap-2",
                 activeTab === tab
                  ? "text-[#7C3AED]"
                  : "text-[#666] dark:text-slate-500 hover:text-[#1A1A1A] dark:hover:text-white"
               )}
            >
              {tab}
              {tab === "Reports & More" && <ChevronRight size={12} />}
              {activeTab === tab && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#7C3AED]" />
              )}
            </button>
          ))}
        </div>

        {/* Sub-tabs */}
        <div className="flex items-center gap-6">
          {SUB_TABS.map((tab) => (
            <button
               key={tab}
               onClick={() => setSubTab(tab)}
               className={clsx(
                 "text-[12px] font-bold transition-all relative",
                 subTab === tab
                  ? "text-[#1A1A1A] dark:text-white border-b-2 border-[#1A1A1A] dark:border-white pb-1"
                  : "text-[#999] dark:text-slate-500 hover:text-[#1A1A1A] dark:hover:text-white pb-1"
               )}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Action Bar */}
        <div className="pt-4 flex items-center justify-between">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2 text-[13px] font-bold text-[#333] dark:text-white hover:text-[#7C3AED] transition-colors"
          >
            <ChevronRight size={16} className={clsx("transition-transform", showFilters && "rotate-90")} />
            <Filter size={16} /> Filters
            {search && (
              <span onClick={(e) => { e.stopPropagation(); setSearch(""); }} className="text-[11px] text-[#999] cursor-pointer flex items-center gap-1">
                <X size={10} /> Clear
              </span>
            )}
          </button>

          <div className="relative w-80">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search Forms"
              className="w-full pl-4 pr-10 py-2 bg-white dark:bg-slate-900 border border-[#F0EAF0] dark:border-slate-800 rounded-lg text-[13px] font-medium outline-none focus:border-[#7C3AED] transition-all"
            />
            <Search size={14} className="absolute right-4 top-1/2 -translate-y-1/2 text-[#999]" />
          </div>
        </div>

        {/* Table */}
        <div className="bg-white dark:bg-slate-900 border border-[#F0EAF0] dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm">
          <div className="flex items-center justify-between p-4 border-b border-[#F0EAF0] dark:border-slate-800 bg-[#FAF9FA] dark:bg-slate-800/50">
            <span className="text-[12px] font-bold text-[#666]">{filtered.length} Form{filtered.length !== 1 ? "s" : ""}</span>
            <button className="flex items-center gap-2 px-3 py-1.5 border border-[#F0EAF0] dark:border-slate-800 rounded-md text-[11px] font-bold text-[#666] hover:bg-slate-50 transition-colors">
              <Columns size={14} />
              Show/Hide Columns
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-white dark:bg-slate-900 border-b border-[#F0EAF0] dark:border-slate-800">
                  <th className="p-4 w-10">
                    <div className="w-4 h-4 rounded border border-[#DDD] dark:border-slate-600" />
                  </th>
                  {["Form Name", "Sales Pipeline", "Status", "Last Modified", "Captured Leads", "Created At", "Actions"].map((head) => (
                    <th key={head} className="p-4 text-[11px] font-bold text-[#999] dark:text-slate-500 uppercase tracking-wider whitespace-nowrap">
                      {head}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={8} className="py-20">
                      <div className="flex items-center justify-center">
                        <Loader2 size={28} className="animate-spin text-[#7C3AED]" />
                      </div>
                    </td>
                  </tr>
                ) : filtered.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-40">
                      <div className="flex flex-col items-center justify-center space-y-6 animate-in fade-in zoom-in duration-500">
                        <div className="w-24 h-24 rounded-full bg-purple-50 dark:bg-slate-800 flex items-center justify-center">
                          <div className="w-12 h-8 bg-purple-200 dark:bg-slate-700 rounded-lg relative">
                            <div className="absolute -top-1 -right-1 w-4 h-4 bg-purple-400 rounded-full" />
                          </div>
                        </div>
                        <p className="text-sm font-black text-[#1A1A1A] dark:text-white uppercase tracking-widest">No Forms Found</p>
                        <Link href="/crm/forms/new" className="px-6 py-2 bg-[#7C3AED] text-white rounded-lg font-bold text-[13px]">
                          Create Your First Form
                        </Link>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filtered.map((form) => (
                    <tr key={form.id} className="border-b border-[#F0EAF0] dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                      <td className="p-4">
                        <div className="w-4 h-4 rounded border border-[#DDD] dark:border-slate-600" />
                      </td>
                      <td className="p-4 text-[13px] font-bold text-[#1A1A1A] dark:text-white whitespace-nowrap">{form.name}</td>
                      <td className="p-4 text-[13px] text-[#666] dark:text-slate-400 whitespace-nowrap">{form.pipeline?.name || "—"}</td>
                      <td className="p-4">
                        <span className={clsx(
                          "px-2 py-1 rounded-md text-[11px] font-bold",
                          form.status === "ACTIVE" ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"
                        )}>
                          {form.status}
                        </span>
                      </td>
                      <td className="p-4 text-[13px] text-[#666] dark:text-slate-400 whitespace-nowrap">
                        {new Date(form.updatedAt).toLocaleDateString()}
                      </td>
                      <td className="p-4 text-[13px] font-bold text-[#1A1A1A] dark:text-white tabular-nums">{form.capturedLeads}</td>
                      <td className="p-4 text-[13px] text-[#666] dark:text-slate-400 whitespace-nowrap">
                        {new Date(form.createdAt).toLocaleDateString()}
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <button onClick={() => toggleStatus(form)} title="Toggle status">
                            {form.status === "ACTIVE"
                              ? <ToggleRight size={20} className="text-green-500" />
                              : <ToggleLeft size={20} className="text-gray-400" />}
                          </button>
                          <button onClick={() => deleteForm(form.id)} className="text-red-400 hover:text-red-600 transition-colors">
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
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
