"use client";

import { useState, useEffect } from "react";
import { Plus, Search, ArrowRight } from "lucide-react";
import Link from "next/link";
import api from "@/lib/api";

const STATUS_COLORS: Record<string, string> = {
  DRAFT: "bg-gray-100 text-gray-600",
  SENT: "bg-blue-100 text-blue-700",
  ACCEPTED: "bg-green-100 text-green-700",
  REJECTED: "bg-red-100 text-red-700",
  EXPIRED: "bg-orange-100 text-orange-700",
  CONVERTED: "bg-purple-100 text-purple-700"
};

export default function QuotationsPage() {
  const [quotations, setQuotations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [products, setProducts] = useState<any[]>([]);
  const [form, setForm] = useState({
    customerName: "", customerPhone: "", customerEmail: "", validUntil: "",
    termsConditions: "", notes: "", discountAmount: "0",
    items: [{ productName: "", quantity: "1", unit: "pcs", rate: "", taxPercent: "0" }]
  });

  async function loadData() {
    setLoading(true);
    try {
      const [qRes, pRes] = await Promise.all([
        api.get("/api/sales/quotations", { params: { search, status: statusFilter } }),
        api.get("/api/products")
      ]);
      setQuotations(qRes.data);
      setProducts(pRes.data);
    } catch {}
    setLoading(false);
  }

  useEffect(() => { loadData(); }, [search, statusFilter]);

  function addItem() {
    setForm({ ...form, items: [...form.items, { productName: "", quantity: "1", unit: "pcs", rate: "", taxPercent: "0" }] });
  }

  function removeItem(i: number) {
    setForm({ ...form, items: form.items.filter((_, idx) => idx !== i) });
  }

  function updateItem(i: number, field: string, value: string) {
    const items = [...form.items];
    items[i] = { ...items[i], [field]: value };
    if (field === "productName") {
      const product = products.find(p => p.name === value);
      if (product) items[i] = { ...items[i], rate: String(product.basePrice), taxPercent: String(product.taxPercent || 0) };
    }
    setForm({ ...form, items });
  }

  const subTotal = form.items.reduce((s, i) => s + (Number(i.quantity) * Number(i.rate) || 0), 0);
  const taxTotal = form.items.reduce((s, i) => s + (Number(i.quantity) * Number(i.rate) * Number(i.taxPercent) / 100 || 0), 0);
  const total = subTotal + taxTotal - Number(form.discountAmount);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    try {
      await api.post("/api/sales/quotations", {
        ...form,
        discountAmount: Number(form.discountAmount),
        items: form.items.map(i => ({ productName: i.productName, quantity: Number(i.quantity), unit: i.unit, rate: Number(i.rate), taxPercent: Number(i.taxPercent) }))
      });
      setShowForm(false);
      loadData();
    } catch {}
  }

  async function handleConvert(id: string) {
    try {
      await api.post(`/api/sales/quotations/${id}/convert`);
      loadData();
    } catch {}
  }

  async function handleUpdateStatus(id: string, status: string) {
    try {
      await api.patch(`/api/sales/quotations/${id}`, { status });
      loadData();
    } catch {}
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Sales Quotations</h1>
          <p className="text-sm text-gray-500 mt-1">Create and manage customer quotations</p>
        </div>
        <div className="flex gap-2">
          <Link href="/sales/orders" className="border border-gray-200 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-50">Sales Orders</Link>
          <Link href="/sales/returns" className="border border-gray-200 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-50">Returns (RMA)</Link>
          <button onClick={() => setShowForm(true)} className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 text-sm font-medium">
            <Plus className="w-4 h-4" /> New Quotation
          </button>
        </div>
      </div>

      <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
        {["DRAFT","SENT","ACCEPTED","REJECTED","EXPIRED","CONVERTED"].map(s => (
          <div key={s} className="bg-white rounded-xl border border-gray-100 shadow-sm p-3 text-center">
            <div className="text-xl font-bold text-gray-900">{quotations.filter(q => q.status === s).length}</div>
            <div className="text-xs text-gray-500 mt-0.5">{s}</div>
          </div>
        ))}
      </div>

      <div className="flex gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search quotations..." className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-lg text-sm" />
        </div>
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="border border-gray-200 rounded-lg px-3 py-2 text-sm">
          <option value="">All Status</option>
          {["DRAFT","SENT","ACCEPTED","REJECTED","EXPIRED","CONVERTED"].map(s => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>

      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-100">
            <tr>
              {["Quotation #","Customer","Items","Amount","Valid Until","Status","Actions"].map(h => (
                <th key={h} className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wide">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {loading ? (
              <tr><td colSpan={7} className="px-4 py-8 text-center text-gray-400">Loading...</td></tr>
            ) : quotations.length === 0 ? (
              <tr><td colSpan={7} className="px-4 py-8 text-center text-gray-400">No quotations found</td></tr>
            ) : quotations.map((q) => (
              <tr key={q.id} className="hover:bg-gray-50">
                <td className="px-4 py-3 font-mono text-xs text-blue-600">{q.quotationNumber}</td>
                <td className="px-4 py-3">
                  <div className="font-medium text-gray-900">{q.customerName || q.customer?.name || "—"}</div>
                  <div className="text-xs text-gray-400">{q.customerPhone || ""}</div>
                </td>
                <td className="px-4 py-3 text-gray-600">{q.items?.length || 0}</td>
                <td className="px-4 py-3 font-semibold text-gray-900">₹{q.totalAmount?.toLocaleString()}</td>
                <td className="px-4 py-3 text-xs text-gray-500">{q.validUntil ? new Date(q.validUntil).toLocaleDateString() : "—"}</td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_COLORS[q.status] || ""}`}>{q.status}</span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex gap-2 items-center">
                    {q.status === "DRAFT" && (
                      <button onClick={() => handleUpdateStatus(q.id, "SENT")} className="text-blue-600 hover:underline text-xs">Send</button>
                    )}
                    {["SENT","DRAFT"].includes(q.status) && (
                      <button onClick={() => handleConvert(q.id)} className="text-purple-600 hover:underline text-xs flex items-center gap-0.5">
                        <ArrowRight className="w-3 h-3" />Convert to SO
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
          <div className="bg-white rounded-2xl w-full max-w-2xl shadow-xl my-4">
            <div className="p-6 border-b border-gray-100"><h2 className="text-lg font-semibold">Create Quotation</h2></div>
            <form onSubmit={handleCreate} className="p-6 space-y-5">
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Customer Name</label>
                  <input value={form.customerName} onChange={(e) => setForm({ ...form, customerName: e.target.value })} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                  <input value={form.customerPhone} onChange={(e) => setForm({ ...form, customerPhone: e.target.value })} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Valid Until</label>
                  <input type="date" value={form.validUntil} onChange={(e) => setForm({ ...form, validUntil: e.target.value })} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm" />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm font-medium text-gray-700">Items *</label>
                  <button type="button" onClick={addItem} className="text-blue-600 text-xs hover:underline">+ Add Item</button>
                </div>
                <div className="space-y-2">
                  <div className="grid grid-cols-12 gap-2 text-xs text-gray-500 font-medium px-1">
                    <div className="col-span-4">Item Name</div>
                    <div className="col-span-2">Qty</div>
                    <div className="col-span-2">Unit</div>
                    <div className="col-span-2">Rate</div>
                    <div className="col-span-1">Tax%</div>
                    <div className="col-span-1"></div>
                  </div>
                  {form.items.map((item, i) => (
                    <div key={i} className="grid grid-cols-12 gap-2 items-center">
                      <div className="col-span-4">
                        <input list="products-list" placeholder="Product name" value={item.productName} onChange={(e) => updateItem(i, "productName", e.target.value)} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm" required />
                      </div>
                      <div className="col-span-2">
                        <input type="number" placeholder="Qty" min="0.01" step="0.01" value={item.quantity} onChange={(e) => updateItem(i, "quantity", e.target.value)} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm" required />
                      </div>
                      <div className="col-span-2">
                        <input placeholder="Unit" value={item.unit} onChange={(e) => updateItem(i, "unit", e.target.value)} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm" />
                      </div>
                      <div className="col-span-2">
                        <input type="number" placeholder="Rate" min="0" step="0.01" value={item.rate} onChange={(e) => updateItem(i, "rate", e.target.value)} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm" required />
                      </div>
                      <div className="col-span-1">
                        <input type="number" placeholder="0" min="0" max="100" value={item.taxPercent} onChange={(e) => updateItem(i, "taxPercent", e.target.value)} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm" />
                      </div>
                      <div className="col-span-1 text-right">
                        {form.items.length > 1 && <button type="button" onClick={() => removeItem(i)} className="text-red-400 hover:text-red-600 text-xs font-bold">✕</button>}
                      </div>
                    </div>
                  ))}
                  <datalist id="products-list">
                    {products.map(p => <option key={p.id} value={p.name} />)}
                  </datalist>
                </div>
              </div>

              <div className="bg-gray-50 rounded-lg p-4 space-y-2 text-sm">
                <div className="flex justify-between"><span className="text-gray-500">Sub Total</span><span>₹{subTotal.toFixed(2)}</span></div>
                <div className="flex justify-between"><span className="text-gray-500">Tax</span><span>₹{taxTotal.toFixed(2)}</span></div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-500">Discount (₹)</span>
                  <input type="number" min="0" value={form.discountAmount} onChange={(e) => setForm({ ...form, discountAmount: e.target.value })} className="w-24 border border-gray-200 rounded px-2 py-1 text-sm text-right" />
                </div>
                <div className="flex justify-between font-bold border-t border-gray-200 pt-2"><span>Total</span><span>₹{total.toFixed(2)}</span></div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Terms & Conditions</label>
                <textarea rows={2} value={form.termsConditions} onChange={(e) => setForm({ ...form, termsConditions: e.target.value })} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm" />
              </div>

              <div className="flex gap-3">
                <button type="submit" className="flex-1 bg-blue-600 text-white py-2 rounded-lg text-sm font-medium hover:bg-blue-700">Create Quotation</button>
                <button type="button" onClick={() => setShowForm(false)} className="flex-1 border border-gray-200 py-2 rounded-lg text-sm font-medium hover:bg-gray-50">Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
