"use client";

import { useState, useEffect } from "react";
import { Plus, Search } from "lucide-react";
import api from "@/lib/api";

const STATUS_COLORS: Record<string, string> = {
  PENDING: "bg-yellow-100 text-yellow-700",
  CONFIRMED: "bg-blue-100 text-blue-700",
  PROCESSING: "bg-purple-100 text-purple-700",
  SHIPPED: "bg-indigo-100 text-indigo-700",
  DELIVERED: "bg-green-100 text-green-700",
  CANCELLED: "bg-red-100 text-red-700"
};

export default function SalesOrdersPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [products, setProducts] = useState<any[]>([]);
  const [form, setForm] = useState({
    customerName: "", deliveryDate: "", deliveryAddress: "", notes: "", discountAmount: "0",
    items: [{ productName: "", quantity: "1", unit: "pcs", rate: "", taxPercent: "0" }]
  });

  async function loadData() {
    setLoading(true);
    try {
      const [oRes, pRes] = await Promise.all([
        api.get("/api/sales/orders", { params: { search, status: statusFilter } }),
        api.get("/api/products")
      ]);
      setOrders(oRes.data);
      setProducts(pRes.data);
    } catch {}
    setLoading(false);
  }

  useEffect(() => { loadData(); }, [search, statusFilter]);

  function addItem() { setForm({ ...form, items: [...form.items, { productName: "", quantity: "1", unit: "pcs", rate: "", taxPercent: "0" }] }); }
  function removeItem(i: number) { setForm({ ...form, items: form.items.filter((_, idx) => idx !== i) }); }
  function updateItem(i: number, field: string, value: string) {
    const items = [...form.items];
    items[i] = { ...items[i], [field]: value };
    if (field === "productName") {
      const p = products.find(p => p.name === value);
      if (p) items[i] = { ...items[i], rate: String(p.basePrice), taxPercent: String(p.taxPercent || 0) };
    }
    setForm({ ...form, items });
  }

  const subTotal = form.items.reduce((s, i) => s + (Number(i.quantity) * Number(i.rate) || 0), 0);
  const taxTotal = form.items.reduce((s, i) => s + (Number(i.quantity) * Number(i.rate) * Number(i.taxPercent) / 100 || 0), 0);
  const total = subTotal + taxTotal - Number(form.discountAmount);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    try {
      await api.post("/api/sales/orders", {
        ...form,
        discountAmount: Number(form.discountAmount),
        items: form.items.map(i => ({ productName: i.productName, quantity: Number(i.quantity), unit: i.unit, rate: Number(i.rate), taxPercent: Number(i.taxPercent) }))
      });
      setShowForm(false);
      loadData();
    } catch {}
  }

  async function handleUpdateStatus(id: string, status: string) {
    try {
      await api.patch(`/api/sales/orders/${id}`, { status });
      loadData();
    } catch {}
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Sales Orders</h1>
          <p className="text-sm text-gray-500 mt-1">Manage sales orders and fulfillment</p>
        </div>
        <div className="flex gap-2">
          <a href="/sales/quotations" className="border border-gray-200 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-50">Quotations</a>
          <a href="/sales/returns" className="border border-gray-200 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-50">Returns (RMA)</a>
          <button onClick={() => setShowForm(true)} className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 text-sm font-medium">
            <Plus className="w-4 h-4" /> New Sales Order
          </button>
        </div>
      </div>

      <div className="flex gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search orders..." className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-lg text-sm" />
        </div>
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="border border-gray-200 rounded-lg px-3 py-2 text-sm">
          <option value="">All Status</option>
          {["PENDING","CONFIRMED","PROCESSING","SHIPPED","DELIVERED","CANCELLED"].map(s => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>

      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-100">
            <tr>
              {["Order #","Customer","Items","Amount","Delivery Date","Status","Actions"].map(h => (
                <th key={h} className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wide">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {loading ? (
              <tr><td colSpan={7} className="px-4 py-8 text-center text-gray-400">Loading...</td></tr>
            ) : orders.length === 0 ? (
              <tr><td colSpan={7} className="px-4 py-8 text-center text-gray-400">No sales orders</td></tr>
            ) : orders.map((o) => (
              <tr key={o.id} className="hover:bg-gray-50">
                <td className="px-4 py-3 font-mono text-xs text-blue-600">{o.orderNumber}</td>
                <td className="px-4 py-3 font-medium text-gray-900">{o.customerName || o.customer?.name || "—"}</td>
                <td className="px-4 py-3 text-gray-600">{o.items?.length || 0}</td>
                <td className="px-4 py-3 font-semibold text-gray-900">₹{o.totalAmount?.toLocaleString()}</td>
                <td className="px-4 py-3 text-xs text-gray-500">{o.deliveryDate ? new Date(o.deliveryDate).toLocaleDateString() : "—"}</td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_COLORS[o.status] || ""}`}>{o.status}</span>
                </td>
                <td className="px-4 py-3">
                  <select value={o.status} onChange={(e) => handleUpdateStatus(o.id, e.target.value)} className="text-xs border border-gray-200 rounded px-1 py-0.5">
                    {["PENDING","CONFIRMED","PROCESSING","SHIPPED","DELIVERED","CANCELLED"].map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl w-full max-w-2xl shadow-xl my-4">
            <div className="p-6 border-b border-gray-100"><h2 className="text-lg font-semibold">Create Sales Order</h2></div>
            <form onSubmit={handleCreate} className="p-6 space-y-5">
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Customer Name</label>
                  <input value={form.customerName} onChange={(e) => setForm({ ...form, customerName: e.target.value })} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Delivery Date</label>
                  <input type="date" value={form.deliveryDate} onChange={(e) => setForm({ ...form, deliveryDate: e.target.value })} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Delivery Address</label>
                  <input value={form.deliveryAddress} onChange={(e) => setForm({ ...form, deliveryAddress: e.target.value })} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm" />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm font-medium text-gray-700">Items *</label>
                  <button type="button" onClick={addItem} className="text-blue-600 text-xs hover:underline">+ Add Item</button>
                </div>
                <div className="space-y-2">
                  {form.items.map((item, i) => (
                    <div key={i} className="grid grid-cols-12 gap-2 items-center">
                      <div className="col-span-4">
                        <input list="products-list2" placeholder="Product name" value={item.productName} onChange={(e) => updateItem(i, "productName", e.target.value)} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm" required />
                      </div>
                      <div className="col-span-2"><input type="number" placeholder="Qty" min="0.01" step="0.01" value={item.quantity} onChange={(e) => updateItem(i, "quantity", e.target.value)} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm" required /></div>
                      <div className="col-span-2"><input placeholder="Unit" value={item.unit} onChange={(e) => updateItem(i, "unit", e.target.value)} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm" /></div>
                      <div className="col-span-2"><input type="number" placeholder="Rate" min="0" step="0.01" value={item.rate} onChange={(e) => updateItem(i, "rate", e.target.value)} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm" required /></div>
                      <div className="col-span-1"><input type="number" placeholder="Tax%" value={item.taxPercent} onChange={(e) => updateItem(i, "taxPercent", e.target.value)} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm" /></div>
                      <div className="col-span-1 text-right">{form.items.length > 1 && <button type="button" onClick={() => removeItem(i)} className="text-red-400 hover:text-red-600 text-xs font-bold">✕</button>}</div>
                    </div>
                  ))}
                  <datalist id="products-list2">{products.map(p => <option key={p.id} value={p.name} />)}</datalist>
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

              <div className="flex gap-3">
                <button type="submit" className="flex-1 bg-blue-600 text-white py-2 rounded-lg text-sm font-medium hover:bg-blue-700">Create Order</button>
                <button type="button" onClick={() => setShowForm(false)} className="flex-1 border border-gray-200 py-2 rounded-lg text-sm font-medium hover:bg-gray-50">Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
