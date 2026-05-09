"use client";

import { useState, useEffect } from "react";
import { Search, Activity, Calendar, ShieldAlert } from "lucide-react";
import api from "@/lib/api";

const ACTION_COLORS: Record<string, string> = {
  CREATE: "bg-green-100 text-green-700",
  UPDATE: "bg-blue-100 text-blue-700",
  DELETE: "bg-red-100 text-red-700",
  APPROVE: "bg-emerald-100 text-emerald-700",
  REJECT: "bg-orange-100 text-orange-700",
};

export default function AuditTrailPage() {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [moduleFilter, setModuleFilter] = useState("");

  useEffect(() => {
    loadLogs();
  }, [moduleFilter]);

  async function loadLogs() {
    setLoading(true);
    try {
      const res = await api.get("/api/audit/logs", { params: { module: moduleFilter } });
      setLogs(res.data);
    } catch {}
    setLoading(false);
  }

  const filteredLogs = logs.filter(l => 
    !search || 
    l.action.toLowerCase().includes(search.toLowerCase()) || 
    l.user?.name?.toLowerCase().includes(search.toLowerCase()) ||
    l.details?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
           <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <ShieldAlert className="text-red-500 w-6 h-6" /> System Audit Trail
           </h1>
           <p className="text-sm text-gray-500 mt-1">Immutable log of critical system operations and financial events</p>
        </div>
      </div>

      <div className="flex gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input 
             value={search} 
             onChange={(e) => setSearch(e.target.value)} 
             placeholder="Search by action, user or details..." 
             className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-lg text-sm" 
          />
        </div>
        <select value={moduleFilter} onChange={(e) => setModuleFilter(e.target.value)} className="border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white">
          <option value="">All Modules</option>
          <option value="PROCUREMENT">Procurement</option>
          <option value="PURCHASE_REQUEST">Purchase Request</option>
          <option value="GRN">Goods Receipt</option>
          <option value="FINANCE">Finance</option>
          <option value="INVENTORY">Inventory</option>
          <option value="USER_MANAGEMENT">User Management</option>
        </select>
      </div>

      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-100">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Timestamp</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">User</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Module</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Action</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Entity ID</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Details</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {loading ? (
              <tr><td colSpan={6} className="px-4 py-8 text-center text-gray-400">Loading audit trail...</td></tr>
            ) : filteredLogs.length === 0 ? (
              <tr><td colSpan={6} className="px-4 py-8 text-center text-gray-400">No logs found</td></tr>
            ) : filteredLogs.map((l) => (
              <tr key={l.id} className="hover:bg-gray-50 font-mono text-xs">
                <td className="px-4 py-3 text-gray-500 flex items-center gap-1">
                   <Calendar className="w-3 h-3" />
                   {new Date(l.createdAt).toLocaleString()}
                </td>
                <td className="px-4 py-3">
                   <div className="font-medium text-gray-900">{l.user?.name || "System"}</div>
                   <div className="text-[10px] text-gray-400">{l.user?.email || "N/A"}</div>
                </td>
                <td className="px-4 py-3 font-medium text-gray-700">{l.module}</td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${ACTION_COLORS[l.action] || "bg-gray-100 text-gray-700"}`}>
                    {l.action}
                  </span>
                </td>
                <td className="px-4 py-3 text-blue-600">{l.entityId || "N/A"}</td>
                <td className="px-4 py-3 text-gray-600 max-w-md truncate" title={l.details}>
                  {l.details}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
