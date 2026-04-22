"use client";

import { useState, useEffect } from "react";
import { Plus, Search } from "lucide-react";
import api from "@/lib/api";

const STATUS_COLORS: Record<string, string> = {
  PENDING: "bg-yellow-100 text-yellow-700",
  APPROVED: "bg-green-100 text-green-700",
  REJECTED: "bg-red-100 text-red-700",
  COMPLETED: "bg-blue-100 text-blue-700"
};

export default function PurchaseReturnsPage() {
  const [returns, setReturns] = useState<any[]>([]);
  const [vendors, setVendors] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    vendorId: "", reason: "",
    items: [{ itemName: "", quantity: "1", unit: "pcs", rate: "" }]
  });

  async function loadData() {
    setLoading(true);
    try {
      const [rRes, vRes] = await Promise.all([
        api.get("/api/purchase/returns", { params: { search, status: statusFilter } }),
        api.get("/api/vendors")
      ]);
      setReturns(rRes.data);
      setVendors(vRes.data);
    } catch {}
    setLoading(false);
  }

  useEffect(() => { loadData(); }, [search, statusFilter]);

  function addItem() { setForm({ ...form, items: [...form.items, { itemName: "", quantity: "1", unit: "pcs", rate: "" }] }); }
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
      await api.post("/api/purchase/returns", {
        vendorId: form.vendorId,
        reason: form.reason,
        items: form.items.map(i => ({ itemName: i.itemName, quantity: Number(i.quantity), unit: i.unit, rate: Number(i.rate) }))
      });
      setShowForm(false);
      setForm({ vendorId: "", reason: "", items: [{ itemName: "", quantity: "1", unit: "pcs", rate: "" }] });
      loadData();
    } catch {}
  }

  async function updateStatus(id: string, status: string) {
    try {
      await api.patch(`/api/purchase/returns/${id}`, { status });
      loadData();
    } catch {}
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Purchase Returns</h1>
          <p className="text-sm text-gray-500 mt-1">Manage returns to vendors</p>
        </div>
        <div className="flex gap-2">
          <a href="/purchases/rfq" className="border border-gray-200 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-50">RFQ</a>
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
              {["Return #","Vendor","Items","Refund Amount","Reason","Status","Actions"].map(h => (
                <th key={h} className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wide">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {loading ? (
              <tr><td colSpan={7} className="px-4 py-8 text-center text-gray-400">Loading...</td></tr>
            ) : returns.length === 0 ? (
              <tr><td colSpan={7} className="px-4 py-8 text-center text-gray-400">No purchase returns</td></tr>
            ) : returns.map((r) => (
              <tr key={r.id} className="hover:bg-gray-50">
                <td className="px-4 py-3 font-mono text-xs text-blue-600">{r.returnNumber}</td>
                <td className="px-4 py-3">
                  <div className="font-medium text-gray-900">{r.vendor?.name}</div>
                  <div className="text-xs text-gray-400">{r.vendor?.contact}</div>
                </td>
                <td className="px-4 py-3 text-gray-600">{r.items?.length || 0}</td>
                <td className="px-4 py-3 font-semibold text-orange-600">₹{r.refundAmount?.toLocaleString()}</td>
                <td className="px-4 py-3 text-gray-600 max-w-[150px] truncate">{r.reason}</td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_COLORS[r.status] || ""}`}>{r.status}</span>
                </td>
                <td className="px-4 py-3">
                  {r.status === "PENDING" && (
                    <div className="flex gap-2">
                      <button onClick={() => updateStatus(r.id, "APPROVED")} className="text-green-600 hover:underline text-xs">Approve</button>
                      <button onClick={() => updateStatus(r.id, "REJECTED")} className="text-red-600 hover:underline text-xs">Reject</button>
                    </div>
                  )}
                  {r.status === "APPROVED" && (
                    <button onClick={() => updateStatus(r.id, "COMPLETED")} className="text-blue-600 hover:underline text-xs">Complete</button>
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
            <div className="p-6 border-b border-gray-100"><h2 className="text-lg font-semibold">Create Purchase Return</h2></div>
            <form onSubmit={handleCreate} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Vendor *</label>
                  <select required value={form.vendorId} onChange={(e) => setForm({ ...form, vendorId: e.target.value })} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm">
                    <option value="">Select vendor...</option>
                    {vendors.map((v: any) => <option key={v.id} value={v.id}>{v.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Reason *</label>
                  <input required value={form.reason} onChange={(e) => setForm({ ...form, reason: e.target.value })} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm" />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm font-medium text-gray-700">Items *</label>
                  <button type="button" onClick={addItem} className="text-blue-600 text-xs hover:underline">+ Add Item</button>
                </div>
                <div className="space-y-2">
                  {form.items.map((item, i) => (
                    <div key={i} className="grid grid-cols-10 gap-2 items-center">
                      <div className="col-span-4"><input placeholder="Item name" required value={item.itemName} onChange={(e) => updateItem(i, "itemName", e.target.value)} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm" /></div>
                      <div className="col-span-2"><input type="number" placeholder="Qty" min="0.01" step="0.01" value={item.quantity} onChange={(e) => updateItem(i, "quantity", e.target.value)} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm" required /></div>
                      <div className="col-span-2"><input placeholder="Unit" value={item.unit} onChange={(e) => updateItem(i, "unit", e.target.value)} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm" /></div>
                      <div className="col-span-1"><input type="number" placeholder="Rate" min="0" step="0.01" value={item.rate} onChange={(e) => updateItem(i, "rate", e.target.value)} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm" required /></div>
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
