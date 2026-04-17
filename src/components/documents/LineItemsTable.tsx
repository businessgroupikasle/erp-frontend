"use client";

import { useState } from "react";
import { Plus, Trash2, GripVertical, Image as ImageIcon, LayoutGrid } from "lucide-react";

interface LineItem {
  id: string;
  name: string;
  hsn: string;
  gstRate: number;
  quantity: number;
  rate: number;
}

export default function LineItemsTable() {
  const [items, setItems] = useState<LineItem[]>([
    { id: "1", name: "", hsn: "", gstRate: 0, quantity: 0, rate: 0 }
  ]);

  const addItem = () => {
    setItems([...items, { id: Math.random().toString(), name: "", hsn: "", gstRate: 0, quantity: 0, rate: 0 }]);
  };

  const removeItem = (id: string) => {
    if (items.length > 1) {
      setItems(items.filter(item => item.id !== id));
    }
  };

  const updateItem = (id: string, field: keyof LineItem, value: any) => {
    setItems(items.map(item => item.id === id ? { ...item, [field]: value } : item));
  };

  return (
    <div className="space-y-6 pt-10">
      <div className="overflow-x-auto rounded-xl border border-[#F0EAF0] dark:border-slate-800">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-[#7C3AED] text-white text-[11px] font-bold uppercase tracking-wider">
              <th className="px-4 py-3 w-10">Item</th>
              <th className="px-4 py-3 min-w-[300px]">Item Name / SKU Id</th>
              <th className="px-4 py-3">HSN/SAC</th>
              <th className="px-4 py-3">GST Rate</th>
              <th className="px-4 py-3">Quantity</th>
              <th className="px-4 py-3">Rate</th>
              <th className="px-4 py-3">Amount</th>
              <th className="px-4 py-3 w-10"></th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-slate-900 divide-y divide-[#F0EAF0]">
            {items.map((item, index) => {
              const amount = item.quantity * item.rate;
              return (
                <tr key={item.id} className="group hover:bg-slate-50 transition-colors">
                  <td className="px-4 py-4 align-top text-xs font-bold text-[#999]">
                    {index + 1}.
                  </td>
                  <td className="px-4 py-4 space-y-3">
                    <input 
                      type="text" 
                      placeholder="Item Name / SKU Id"
                      className="w-full p-2 bg-transparent border-b border-transparent focus:border-[#7C3AED] outline-none text-sm font-medium transition-colors"
                      value={item.name}
                      onChange={(e) => updateItem(item.id, "name", e.target.value)}
                    />
                    <div className="flex gap-4">
                       <button className="text-[10px] font-bold text-[#7C3AED] flex items-center gap-1 uppercase tracking-tight">
                          <Plus size={12} /> Add Description
                       </button>
                       <button className="text-[10px] font-bold text-[#7C3AED] flex items-center gap-1 uppercase tracking-tight">
                          <ImageIcon size={12} /> Add Image
                       </button>
                    </div>
                  </td>
                  <td className="px-4 py-4 align-top">
                    <input 
                      type="text" 
                      placeholder="#"
                      className="w-full p-2 bg-transparent border-b border-transparent focus:border-[#7C3AED] outline-none text-sm font-medium transition-colors text-center"
                      value={item.hsn}
                      onChange={(e) => updateItem(item.id, "hsn", e.target.value)}
                    />
                  </td>
                  <td className="px-4 py-4 align-top">
                    <div className="flex items-center gap-1">
                       <span className="text-xs text-[#999] font-medium">%</span>
                       <input 
                          type="number" 
                          className="w-16 p-2 bg-transparent border-b border-transparent focus:border-[#7C3AED] outline-none text-sm font-medium text-center"
                          value={item.gstRate}
                          onChange={(e) => updateItem(item.id, "gstRate", parseFloat(e.target.value))}
                       />
                    </div>
                  </td>
                  <td className="px-4 py-4 align-top">
                    <input 
                      type="number" 
                      className="w-16 p-2 bg-transparent border-b border-transparent focus:border-[#7C3AED] outline-none text-sm font-medium text-center"
                      value={item.quantity}
                      onChange={(e) => updateItem(item.id, "quantity", parseFloat(e.target.value))}
                    />
                  </td>
                  <td className="px-4 py-4 align-top">
                    <div className="flex items-center gap-1">
                       <span className="text-xs text-[#999] font-medium">₹</span>
                       <input 
                          type="number" 
                          className="w-24 p-2 bg-transparent border-b border-transparent focus:border-[#7C3AED] outline-none text-sm font-medium text-right"
                          value={item.rate}
                          onChange={(e) => updateItem(item.id, "rate", parseFloat(e.target.value))}
                       />
                    </div>
                  </td>
                  <td className="px-4 py-4 align-top text-right text-sm font-bold text-[#1A1A1A]">
                    ₹{amount.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                  </td>
                  <td className="px-4 py-4 align-top text-center">
                    <button 
                      onClick={() => removeItem(item.id)}
                      className="text-[#DDD] hover:text-red-500 transition-colors"
                    >
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="flex gap-4">
        <button 
          onClick={addItem}
          className="flex-1 py-3 bg-white border-2 border-[#F0EAF0] dark:border-slate-800 rounded-xl text-[#7C3AED] font-bold text-sm flex items-center justify-center gap-2 hover:bg-slate-50 transition-all shadow-sm"
        >
          <Plus size={18} /> Add New Line
        </button>
        <button 
          className="flex-1 py-3 bg-white border-2 border-[#F0EAF0] dark:border-slate-800 rounded-xl text-[#7C3AED] font-bold text-sm flex items-center justify-center gap-2 hover:bg-slate-50 transition-all shadow-sm"
        >
          <LayoutGrid size={18} /> Add New Group <span className="p-1 px-1.5 rounded bg-orange-100 text-orange-600 text-[9px] uppercase">Trial</span>
        </button>
      </div>
    </div>
  );
}
