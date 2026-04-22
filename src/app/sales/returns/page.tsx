"use client";

import { useState, useEffect } from "react";
import { Plus, Search, Check, X } from "lucide-react";
import api from "@/lib/api";

const STATUS_COLORS: Record<string, string> = {
  PENDING: "bg-yellow-100 text-yellow-700",
  APPROVED: "bg-green-100 text-green-700",
  REJECTED: "bg-red-100 text-red-700",
  COMPLETED: "bg-blue-100 text-blue-700"
};

export default function ReturnOrdersPage() {
  const [returns, setReturns] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    customerName: "", reason: "", refundMethod: "CASH",
    items: [{ productName: "", quantity: "1", rate: "", condition: "GOOD" }]
  });

  async function loadData() {
    setLoading(true);
    try {
      const res = await api.get("/api/sales/returns", { params: { search, status: statusFilter } });
      setReturns(res.data);
    } catch {}
    setLoading(false);
  }

  useEffect(() => { loadData(); }, [search, statusFilter]);

  function addItem() { setForm({ ...form, items: [...form.items, { productName: "", quantity: "1", rate: "", condition: "GOOD" }] }); }
  function removeItem(i: number) { setForm({ ...form, items: form.items.filter((_, idx) => idx !== i) }); }
  function updateItem(i: number, field: string, value: string) {
    const items = [...form.items];
    items[i] = { ...items[i], [field]: value };
    setForm({ ...form, items });
  }

  const refundTotal = form.items.reduce((s, i) => s + (Number(i.quantity) * Number(i.rate) || 0), 0);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    try {
      await api.post("/api/sales/returns", {
        reason: form.reason,
        refundMethod: form.refundMethod,
        items: form.items.map(i => ({ productName: i.productName, quantity: Number(i.quantity), rate: Number(i.rate), condition: i.condition }))
      });
      setShowForm(false);
      setForm({ customerName: "", reason: "", refundMethod: "CASH", items: [{ productName: "", quantity: "1", rate: "", condition: "GOOD" }] });
      loadData();
    } catch {}
  }

  async function handleApprove(id: string, status: string) {
    try {
      await api.patch(`/api/sales/returns/${id}`, { status });
      loadData();
    } catch {}
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Return Management (RMA)</h1>
          <p className="text-sm text-gray-500 mt-1">Handle sales returns and refunds</p>
        </div>
        <div className="flex gap-2">
          <a href="/sales/quotations" className="border border-gray-200 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-50">Quotations</a>
          <a href="/sales/orders" className="border border-gray-200 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-50">Sales Orders</a>
          <button onClick={() => setShowForm(true)} className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 text-sm font-medium">
            <Plus className="w-4 h-4" /> New Return
          </button>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-4">
        {["PENDING","APPROVED","REJECTED","COMPLETED"].map(s => (
          <div key={s} className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 text-center">
            <div className="text-2xl font-bold text-gray-900">{returns.filter(r => r.status === s).length}</div>
            <div className="text-xs text-gray-500 mt-1">{s}</div>
          </div>
        ))}
      </div>

      <div className="flex gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search returns..." className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-lg text-sm" />
        </div>
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="border border-gray-200 rounded-lg px-3 py-2 text-sm">
          <option value="">All Status</option>
          {["PENDING","APPROVED","REJECTED","COMPLETED"].map(s => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>

      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-100">
            <tr>
              {["Return #","Reason","Items","Refund Amount","Method","Status","Actions"].map(h => (
                <th key={h} className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wide">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {loading ? (
              <tr><td colSpan={7} className="px-4 py-8 text-center text-gray-400">Loading...</td></tr>
            ) : returns.length === 0 ? (
              <tr><td colSpan={7} className="px-4 py-8 text-center text-gray-400">No return orders</td></tr>
            ) : returns.map((r) => (
              <tr key={r.id} className="hover:bg-gray-50">
                <td className="px-4 py-3 font-mono text-xs text-blue-600">{r.returnNumber}</td>
                <td className="px-4 py-3 text-gray-600 max-w-[150px] truncate">{r.reason}</td>
                <td className="px-4 py-3 text-gray-600">{r.items?.length || 0}</td>
                <td className="px-4 py-3 font-semibold text-orange-600">₹{r.refundAmount?.toLocaleString()}</td>
                <td className="px-4 py-3 text-gray-600">{r.refundMethod || "—"}</td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_COLORS[r.status] || ""}`}>{r.status}</span>
                </td>
                <td className="px-4 py-3">
                  {r.status === "PENDING" && (
                    <div className="flex gap-2">
                      <button onClick={() => handleApprove(r.id, "APPROVED")} className="p-1 bg-green-50 text-green-600 rounded hover:bg-green-100" title="Approve">
                        <Check className="w-3 h-3" />
                      </button>
                      <button onClick={() => handleApprove(r.id, "REJECTED")} className="p-1 bg-red-50 text-red-600 rounded hover:bg-red-100" title="Reject">
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  )}
                  {r.status === "APPROVED" && (
                    <button onClick={() => handleApprove(r.id, "COMPLETED")} className="text-blue-600 hover:underline text-xs">Complete</button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl w-full max-w-xl shadow-xl my-4">
            <div className="p-6 border-b border-gray-100"><h2 className="text-lg font-semibold">Create Return Order (RMA)</h2></div>
            <form onSubmit={handleCreate} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Reason for Return *</label>
                  <textarea required rows={2} value={form.reason} onChange={(e) => setForm({ ...form, reason: e.target.value })} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Refund Method</label>
                  <select value={form.refundMethod} onChange={(e) => setForm({ ...form, refundMethod: e.target.value })} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm">
                    <option value="CASH">Cash</option>
                    <option value="BANK_TRANSFER">Bank Transfer</option>
                    <option value="CREDIT_NOTE">Credit Note</option>
                    <option value="UPI">UPI</option>
                  </select>
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm font-medium text-gray-700">Return Items *</label>
                  <button type="button" onClick={addItem} className="text-blue-600 text-xs hover:underline">+ Add Item</button>
                </div>
                <div className="space-y-2">
                  {form.items.map((item, i) => (
                    <div key={i} className="grid grid-cols-10 gap-2 items-center">
                      <div className="col-span-4">
                        <input placeholder="Product name" value={item.productName} onChange={(e) => updateItem(i, "productName", e.target.value)} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm" required />
                      </div>
                      <div className="col-span-2"><input type="number" placeholder="Qty" min="0.01" step="0.01" value={item.quantity} onChange={(e) => updateItem(i, "quantity", e.target.value)} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm" required /></div>
                      <div className="col-span-2"><input type="number" placeholder="Rate" min="0" step="0.01" value={item.rate} onChange={(e) => updateItem(i, "rate", e.target.value)} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm" required /></div>
                      <div className="col-span-1">
                        <select value={item.condition} onChange={(e) => updateItem(i, "condition", e.target.value)} className="w-full border border-gray-200 rounded-lg px-1 py-2 text-xs">
                          <option value="GOOD">Good</option>
                          <option value="DAMAGED">Damaged</option>
                          <option value="DEFECTIVE">Defective</option>
                        </select>
                      </div>
                      <div className="col-span-1 text-right">{form.items.length > 1 && <button type="button" onClick={() => removeItem(i)} className="text-red-400 hover:text-red-600 text-xs font-bold">✕</button>}</div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-orange-50 rounded-lg px-4 py-3 flex items-center justify-between text-sm font-semibold">
                <span className="text-gray-700">Total Refund</span>
                <span className="text-orange-600">₹{refundTotal.toFixed(2)}</span>
              </div>

              <div className="flex gap-3">
                <button type="submit" className="flex-1 bg-blue-600 text-white py-2 rounded-lg text-sm font-medium hover:bg-blue-700">Submit Return</button>
                <button type="button" onClick={() => setShowForm(false)} className="flex-1 border border-gray-200 py-2 rounded-lg text-sm font-medium hover:bg-gray-50">Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
