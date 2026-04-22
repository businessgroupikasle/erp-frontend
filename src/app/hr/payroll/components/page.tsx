"use client";

import { useState, useEffect } from "react";
import { Plus, TrendingUp, TrendingDown } from "lucide-react";
import api from "@/lib/api";

export default function SalaryComponentsPage() {
  const [components, setComponents] = useState<any[]>([]);
  const [structures, setStructures] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCompForm, setShowCompForm] = useState(false);
  const [showStructForm, setShowStructForm] = useState(false);
  const [compForm, setCompForm] = useState({ name: "", type: "EARNING", calculationType: "FIXED", value: "" });
  const [structForm, setStructForm] = useState({ name: "", description: "", items: [{ componentId: "", overrideValue: "" }] });

  async function loadData() {
    setLoading(true);
    try {
      const [cRes, sRes] = await Promise.all([
        api.get("/api/payroll/components"),
        api.get("/api/payroll/structures")
      ]);
      setComponents(cRes.data);
      setStructures(sRes.data);
    } catch {}
    setLoading(false);
  }

  useEffect(() => { loadData(); }, []);

  async function handleCreateComp(e: React.FormEvent) {
    e.preventDefault();
    try {
      await api.post("/api/payroll/components", { ...compForm, value: Number(compForm.value) });
      setShowCompForm(false);
      setCompForm({ name: "", type: "EARNING", calculationType: "FIXED", value: "" });
      loadData();
    } catch {}
  }

  async function handleCreateStruct(e: React.FormEvent) {
    e.preventDefault();
    try {
      await api.post("/api/payroll/structures", {
        ...structForm,
        items: structForm.items.filter(i => i.componentId).map(i => ({ componentId: i.componentId, overrideValue: i.overrideValue ? Number(i.overrideValue) : undefined }))
      });
      setShowStructForm(false);
      setStructForm({ name: "", description: "", items: [{ componentId: "", overrideValue: "" }] });
      loadData();
    } catch {}
  }

  const earnings = components.filter(c => c.type === "EARNING");
  const deductions = components.filter(c => c.type === "DEDUCTION");

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Salary Components & Structures</h1>
          <p className="text-sm text-gray-500 mt-1">Define earnings, deductions, PF, ESI, tax etc.</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => setShowStructForm(true)} className="border border-gray-200 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-50">New Structure</button>
          <button onClick={() => setShowCompForm(true)} className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 text-sm font-medium">
            <Plus className="w-4 h-4" /> Add Component
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
          <h2 className="font-semibold text-green-700 flex items-center gap-2 mb-4"><TrendingUp className="w-4 h-4" />Earnings ({earnings.length})</h2>
          {earnings.length === 0 ? <p className="text-sm text-gray-400">No earnings defined</p> : (
            <div className="space-y-2">
              {earnings.map((c) => (
                <div key={c.id} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                  <span className="text-sm font-medium text-gray-700">{c.name}</span>
                  <span className="text-sm text-gray-500">{c.calculationType === "PERCENTAGE" ? `${c.value}%` : `₹${c.value.toLocaleString()}`}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
          <h2 className="font-semibold text-red-600 flex items-center gap-2 mb-4"><TrendingDown className="w-4 h-4" />Deductions ({deductions.length})</h2>
          {deductions.length === 0 ? <p className="text-sm text-gray-400">No deductions defined</p> : (
            <div className="space-y-2">
              {deductions.map((c) => (
                <div key={c.id} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                  <span className="text-sm font-medium text-gray-700">{c.name}</span>
                  <span className="text-sm text-gray-500">{c.calculationType === "PERCENTAGE" ? `${c.value}%` : `₹${c.value.toLocaleString()}`}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
        <h2 className="font-semibold text-gray-900 mb-4">Salary Structures ({structures.length})</h2>
        {structures.length === 0 ? <p className="text-sm text-gray-400">No structures created</p> : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {structures.map((s) => (
              <div key={s.id} className="border border-gray-100 rounded-lg p-4">
                <div className="font-semibold text-gray-900">{s.name}</div>
                {s.description && <div className="text-xs text-gray-500 mt-1">{s.description}</div>}
                <div className="text-xs text-gray-400 mt-1">{s._count?.employees || 0} employees • {s.items?.length || 0} components</div>
                <div className="mt-2 space-y-1">
                  {s.items?.slice(0, 4).map((item: any) => (
                    <div key={item.id} className="flex justify-between text-xs text-gray-600">
                      <span>{item.component.name}</span>
                      <span className={item.component.type === "EARNING" ? "text-green-600" : "text-red-500"}>
                        {item.overrideValue ? `₹${item.overrideValue}` : item.component.calculationType === "PERCENTAGE" ? `${item.component.value}%` : `₹${item.component.value}`}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {showCompForm && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-sm shadow-xl">
            <div className="p-5 border-b border-gray-100"><h2 className="text-lg font-semibold">Add Salary Component</h2></div>
            <form onSubmit={handleCreateComp} className="p-5 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
                <input required placeholder="e.g. Basic, HRA, PF, ESI" value={compForm.name} onChange={(e) => setCompForm({ ...compForm, name: e.target.value })} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                <select value={compForm.type} onChange={(e) => setCompForm({ ...compForm, type: e.target.value })} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm">
                  <option value="EARNING">Earning</option>
                  <option value="DEDUCTION">Deduction</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Calculation Type</label>
                <select value={compForm.calculationType} onChange={(e) => setCompForm({ ...compForm, calculationType: e.target.value })} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm">
                  <option value="FIXED">Fixed Amount</option>
                  <option value="PERCENTAGE">Percentage of Basic</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {compForm.calculationType === "PERCENTAGE" ? "Percentage (%)" : "Amount (₹)"} *
                </label>
                <input required type="number" step="0.01" value={compForm.value} onChange={(e) => setCompForm({ ...compForm, value: e.target.value })} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm" />
              </div>
              <div className="flex gap-3">
                <button type="submit" className="flex-1 bg-blue-600 text-white py-2 rounded-lg text-sm font-medium hover:bg-blue-700">Add</button>
                <button type="button" onClick={() => setShowCompForm(false)} className="flex-1 border border-gray-200 py-2 rounded-lg text-sm font-medium">Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showStructForm && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-xl my-4">
            <div className="p-5 border-b border-gray-100"><h2 className="text-lg font-semibold">Create Salary Structure</h2></div>
            <form onSubmit={handleCreateStruct} className="p-5 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
                <input required placeholder="e.g. Senior Developer Package" value={structForm.name} onChange={(e) => setStructForm({ ...structForm, name: e.target.value })} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Components</label>
                {structForm.items.map((item, i) => (
                  <div key={i} className="flex gap-2 mb-2">
                    <select value={item.componentId} onChange={(e) => {
                      const items = [...structForm.items];
                      items[i] = { ...items[i], componentId: e.target.value };
                      setStructForm({ ...structForm, items });
                    }} className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm">
                      <option value="">Select component...</option>
                      {components.map(c => <option key={c.id} value={c.id}>{c.name} ({c.type})</option>)}
                    </select>
                    <input type="number" placeholder="Override" value={item.overrideValue} onChange={(e) => {
                      const items = [...structForm.items];
                      items[i] = { ...items[i], overrideValue: e.target.value };
                      setStructForm({ ...structForm, items });
                    }} className="w-24 border border-gray-200 rounded-lg px-3 py-2 text-sm" />
                  </div>
                ))}
                <button type="button" onClick={() => setStructForm({ ...structForm, items: [...structForm.items, { componentId: "", overrideValue: "" }] })} className="text-blue-600 text-xs hover:underline">+ Add component</button>
              </div>
              <div className="flex gap-3">
                <button type="submit" className="flex-1 bg-blue-600 text-white py-2 rounded-lg text-sm font-medium hover:bg-blue-700">Create</button>
                <button type="button" onClick={() => setShowStructForm(false)} className="flex-1 border border-gray-200 py-2 rounded-lg text-sm font-medium">Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
