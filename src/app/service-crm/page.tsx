"use client";

import { useState, useEffect } from "react";
import { Plus, Search, AlertCircle, CheckCircle, Clock, Wrench, Shield, MessageSquare, MapPin } from "lucide-react";
import Link from "next/link";
import api from "@/lib/api";

interface ServiceTicket {
  id: string;
  ticketNumber: string;
  title: string;
  description: string;
  type: string;
  status: string;
  priority: string;
  customerName?: string;
  customerPhone?: string;
  assigneeId?: string;
  slaDeadline?: string;
  createdAt: string;
  fieldVisits?: any[];
}

const STATUS_COLORS: Record<string, string> = {
  OPEN: "bg-blue-100 text-blue-700",
  IN_PROGRESS: "bg-yellow-100 text-yellow-700",
  RESOLVED: "bg-green-100 text-green-700",
  CLOSED: "bg-gray-100 text-gray-600",
  WAITING_FEEDBACK: "bg-purple-100 text-purple-700"
};

const PRIORITY_COLORS: Record<string, string> = {
  LOW: "bg-gray-100 text-gray-600",
  MEDIUM: "bg-yellow-100 text-yellow-700",
  HIGH: "bg-orange-100 text-orange-700",
  CRITICAL: "bg-red-100 text-red-700"
};

const TYPE_ICONS: Record<string, any> = {
  COMPLAINT: AlertCircle,
  MAINTENANCE: Wrench,
  WARRANTY: Shield,
  INQUIRY: MessageSquare
};

export default function ServiceCRMPage() {
  const [tickets, setTickets] = useState<ServiceTicket[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    title: "", description: "", customerName: "", customerPhone: "",
    type: "COMPLAINT", priority: "MEDIUM", slaDeadline: ""
  });

  async function loadData() {
    setLoading(true);
    try {
      const [tRes, sRes] = await Promise.all([
        api.get("/api/service/tickets", { params: { search, status: statusFilter, type: typeFilter } }),
        api.get("/api/service/tickets/stats")
      ]);
      setTickets(tRes.data);
      setStats(sRes.data);
    } catch {}
    setLoading(false);
  }

  useEffect(() => { loadData(); }, [search, statusFilter, typeFilter]);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    try {
      await api.post("/api/service/tickets", form);
      setShowForm(false);
      setForm({ title: "", description: "", customerName: "", customerPhone: "", type: "COMPLAINT", priority: "MEDIUM", slaDeadline: "" });
      loadData();
    } catch {}
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Service CRM</h1>
          <p className="text-sm text-gray-500 mt-1">Manage support tickets, field visits, and SLAs</p>
        </div>
        <button onClick={() => setShowForm(true)} className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 text-sm font-medium">
          <Plus className="w-4 h-4" /> New Ticket
        </button>
      </div>

      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {[
            { label: "Total", value: stats.total, color: "text-gray-700" },
            { label: "Open", value: stats.open, color: "text-blue-600" },
            { label: "In Progress", value: stats.inProgress, color: "text-yellow-600" },
            { label: "Resolved", value: stats.resolved, color: "text-green-600" },
            { label: "Closed", value: stats.closed, color: "text-gray-500" }
          ].map((s) => (
            <div key={s.label} className="bg-white rounded-xl border border-gray-100 p-4 text-center shadow-sm">
              <div className={`text-2xl font-bold ${s.color}`}>{s.value}</div>
              <div className="text-xs text-gray-500 mt-1">{s.label}</div>
            </div>
          ))}
        </div>
      )}

      <div className="flex gap-3 flex-wrap">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search tickets..." className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-lg text-sm" />
        </div>
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="border border-gray-200 rounded-lg px-3 py-2 text-sm">
          <option value="">All Statuses</option>
          {["OPEN","IN_PROGRESS","RESOLVED","CLOSED","WAITING_FEEDBACK"].map(s => <option key={s} value={s}>{s.replace("_"," ")}</option>)}
        </select>
        <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)} className="border border-gray-200 rounded-lg px-3 py-2 text-sm">
          <option value="">All Types</option>
          {["COMPLAINT","MAINTENANCE","WARRANTY","INQUIRY"].map(t => <option key={t} value={t}>{t}</option>)}
        </select>
      </div>

      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-100">
            <tr>
              {["Ticket #","Title","Type","Priority","Customer","Status","SLA Deadline","Visits","Actions"].map(h => (
                <th key={h} className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wide">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {loading ? (
              <tr><td colSpan={9} className="px-4 py-8 text-center text-gray-400">Loading...</td></tr>
            ) : tickets.length === 0 ? (
              <tr><td colSpan={9} className="px-4 py-8 text-center text-gray-400">No tickets found</td></tr>
            ) : tickets.map((ticket) => {
              const TypeIcon = TYPE_ICONS[ticket.type] || MessageSquare;
              return (
                <tr key={ticket.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-mono text-xs text-blue-600">{ticket.ticketNumber}</td>
                  <td className="px-4 py-3">
                    <div className="font-medium text-gray-900">{ticket.title}</div>
                    <div className="text-xs text-gray-400 truncate max-w-[180px]">{ticket.description}</div>
                  </td>
                  <td className="px-4 py-3">
                    <span className="flex items-center gap-1 text-xs text-gray-600"><TypeIcon className="w-3 h-3" />{ticket.type}</span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${PRIORITY_COLORS[ticket.priority] || ""}`}>{ticket.priority}</span>
                  </td>
                  <td className="px-4 py-3 text-gray-700">{ticket.customerName || "—"}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_COLORS[ticket.status] || ""}`}>{ticket.status.replace("_"," ")}</span>
                  </td>
                  <td className="px-4 py-3 text-xs text-gray-500">{ticket.slaDeadline ? new Date(ticket.slaDeadline).toLocaleDateString() : "—"}</td>
                  <td className="px-4 py-3 text-xs text-gray-500 flex items-center gap-1"><MapPin className="w-3 h-3" />{ticket.fieldVisits?.length || 0}</td>
                  <td className="px-4 py-3">
                    <Link href={`/service-crm/${ticket.id}`} className="text-blue-600 hover:underline text-xs">View</Link>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-xl">
            <div className="p-6 border-b border-gray-100">
              <h2 className="text-lg font-semibold">Create Service Ticket</h2>
            </div>
            <form onSubmit={handleCreate} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Title *</label>
                  <input required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm" />
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description *</label>
                  <textarea required rows={3} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Customer Name</label>
                  <input value={form.customerName} onChange={(e) => setForm({ ...form, customerName: e.target.value })} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Customer Phone</label>
                  <input value={form.customerPhone} onChange={(e) => setForm({ ...form, customerPhone: e.target.value })} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                  <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm">
                    {["COMPLAINT","MAINTENANCE","WARRANTY","INQUIRY"].map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
                  <select value={form.priority} onChange={(e) => setForm({ ...form, priority: e.target.value })} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm">
                    {["LOW","MEDIUM","HIGH","CRITICAL"].map(p => <option key={p} value={p}>{p}</option>)}
                  </select>
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">SLA Deadline</label>
                  <input type="datetime-local" value={form.slaDeadline} onChange={(e) => setForm({ ...form, slaDeadline: e.target.value })} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm" />
                </div>
              </div>
              <div className="flex gap-3 pt-2">
                <button type="submit" className="flex-1 bg-blue-600 text-white py-2 rounded-lg text-sm font-medium hover:bg-blue-700">Create Ticket</button>
                <button type="button" onClick={() => setShowForm(false)} className="flex-1 border border-gray-200 py-2 rounded-lg text-sm font-medium hover:bg-gray-50">Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
