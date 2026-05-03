"use client";

import { useState, useEffect } from "react";
import { Plus, Search, ArrowRight } from "lucide-react";
import api from "@/lib/api";

const STATUS_COLORS: Record<string, string> = {
  SENT: "bg-blue-100 text-blue-700",
  RESPONDED: "bg-purple-100 text-purple-700",
  ACCEPTED: "bg-green-100 text-green-700",
  REJECTED: "bg-red-100 text-red-700",
  CONVERTED: "bg-gray-100 text-gray-600"
};

export default function PurchaseRFQPage() {
  const [rfqs, setRFQs] = useState<any[]>([]);
  const [vendors, setVendors] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [converting, setConverting] = useState<string | null>(null);
  const [form, setForm] = useState({
    vendorId: "", responseDeadline: "", notes: "",
    items: [{ itemName: "", quantity: "1", unit: "pcs", notes: "" }]
  });

  async function loadData() {
    setLoading(true);
    try {
      const [rRes, vRes] = await Promise.all([
        api.get("/api/purchase/rfqs", { params: { search, status: statusFilter } }),
        api.get("/api/vendors")
      ]);
      setRFQs(rRes.data);
      setVendors(vRes.data);
    } catch {}
    setLoading(false);
  }

  useEffect(() => { loadData(); }, [search, statusFilter]);

  function addItem() { setForm({ ...form, items: [...form.items, { itemName: "", quantity: "1", unit: "pcs", notes: "" }] }); }
  function removeItem(i: number) { setForm({ ...form, items: form.items.filter((_, idx) => idx !== i) }); }
  function updateItem(i: number, field: string, value: string) {
    const items = [...form.items];
    items[i] = { ...items[i], [field]: value };
    setForm({ ...form, items });
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    try {
      await api.post("/api/purchase/rfqs", {
        ...form,
        items: form.items.map(i => ({ itemName: i.itemName, quantity: Number(i.quantity), unit: i.unit, notes: i.notes }))
      });
      setShowForm(false);
      setForm({ vendorId: "", responseDeadline: "", notes: "", items: [{ itemName: "", quantity: "1", unit: "pcs", notes: "" }] });
      loadData();
    } catch {}
  }

  async function handleConvertToPO(id: string) {
    setConverting(id);
    try {
      await api.post(`/api/purchase/rfqs/${id}/convert-to-po`);
      loadData();
    } catch {}
    setConverting(null);
  }

  async function updateStatus(id: string, status: string) {
    try {
      await api.patch(`/api/purchase/rfqs/${id}`, { status });
      loadData();
    } catch {}
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Request for Quotation (RFQ)</h1>
          <p className="text-sm text-gray-500 mt-1">Send RFQs to vendors and convert to POs</p>
        </div>
        <div className="flex gap-2">
          <a href="/purchases/returns" className="border border-gray-200 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-50">Purchase Returns</a>
          <button onClick={() => setShowForm(true)} className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 text-sm font-medium">
            <Plus className="w-4 h-4" /> New RFQ
          </button>
        </div>
      </div>

      <div className="grid grid-cols-5 gap-3">
        {["SENT","RESPONDED","ACCEPTED","REJECTED","CONVERTED"].map(s => (
          <div key={s} className="bg-white rounded-xl border border-gray-100 shadow-sm p-3 text-center">
            <div className="text-xl font-bold text-gray-900">{rfqs.filter(r => r.status === s).length}</div>
            <div className="text-xs text-gray-500 mt-0.5">{s}</div>
          </div>
        ))}
      </div>

      <div className="flex gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search RFQs..." className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-lg text-sm" />
        </div>
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="border border-gray-200 rounded-lg px-3 py-2 text-sm">
          <option value="">All Status</option>
          {["SENT","RESPONDED","ACCEPTED","REJECTED","CONVERTED"].map(s => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>

      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-100">
            <tr>
              {["RFQ #","Vendor","Items","Quoted Amount","Deadline","Status","Actions"].map(h => (
                <th key={h} className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wide">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {loading ? (
              <tr><td colSpan={7} className="px-4 py-8 text-center text-gray-400">Loading...</td></tr>
            ) : rfqs.length === 0 ? (
              <tr><td colSpan={7} className="px-4 py-8 text-center text-gray-400">No RFQs found</td></tr>
            ) : rfqs.map((r) => (
              <tr key={r.id} className="hover:bg-gray-50">
                <td className="px-4 py-3 font-mono text-xs text-blue-600">{r.rfqNumber}</td>
                <td className="px-4 py-3">
                  <div className="font-medium text-gray-900">{r.vendor?.name}</div>
                  <div className="text-xs text-gray-400">{r.vendor?.contact}</div>
                </td>
                <td className="px-4 py-3 text-gray-600">{r.items?.length || 0}</td>
                <td className="px-4 py-3 font-medium text-gray-800">{r.quotedAmount ? `₹${r.quotedAmount.toLocaleString()}` : "—"}</td>
                <td className="px-4 py-3 text-xs text-gray-500">{r.responseDeadline ? new Date(r.responseDeadline).toLocaleDateString() : "—"}</td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_COLORS[r.status] || ""}`}>{r.status}</span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex gap-2 items-center">
                    {r.status === "SENT" && (
                      <button onClick={() => updateStatus(r.id, "RESPONDED")} className="text-purple-600 hover:underline text-xs">Mark Responded</button>
                    )}
                    {["RESPONDED","SENT"].includes(r.status) && (
                      <button onClick={() => handleConvertToPO(r.id)} disabled={converting === r.id} className="flex items-center gap-0.5 text-green-600 hover:underline text-xs disabled:opacity-60">
                        <ArrowRight className="w-3 h-3" />{converting === r.id ? "Converting..." : "To PO"}
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl w-full max-w-xl shadow-xl my-4">
            <div className="p-6 border-b border-gray-100"><h2 className="text-lg font-semibold">Create RFQ</h2></div>
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
                  <label className="block text-sm font-medium text-gray-700 mb-1">Response Deadline</label>
                  <input type="date" value={form.responseDeadline} min={new Date().toISOString().split("T")[0]} onChange={(e) => setForm({ ...form, responseDeadline: e.target.value })} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm" />
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
                      <div className="col-span-1"><input placeholder="Notes" value={item.notes} onChange={(e) => updateItem(i, "notes", e.target.value)} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-xs" /></div>
                      <div className="col-span-1 text-right">{form.items.length > 1 && <button type="button" onClick={() => removeItem(i)} className="text-red-400 hover:text-red-600 text-xs font-bold">✕</button>}</div>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                <textarea rows={2} value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm" />
              </div>

              <div className="flex gap-3">
                <button type="submit" className="flex-1 bg-blue-600 text-white py-2 rounded-lg text-sm font-medium hover:bg-blue-700">Send RFQ</button>
                <button type="button" onClick={() => setShowForm(false)} className="flex-1 border border-gray-200 py-2 rounded-lg text-sm font-medium hover:bg-gray-50">Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
