"use client";

import { useState } from "react";
import {
  Plus,
  Search,
  UtensilsCrossed,
  Edit3,
  ToggleLeft,
  ToggleRight,
  X,
  Save,
  Leaf,
  Drumstick,
  IndianRupee,
  Tag,
  Filter,
} from "lucide-react";
import { clsx } from "clsx";

interface MenuItem {
  id: string;
  name: string;
  category: string;
  price: number;
  tax: number;
  veg: boolean;
  enabled: boolean;
  emoji: string;
  description?: string;
}

const CATEGORIES = ["All", "Starter", "Rice", "Thali", "Bread", "Drinks", "Dessert", "Breakfast"];
const TAX_OPTIONS = [0, 5, 12, 18];

const INITIAL_MENU: MenuItem[] = [
  { id: "1",  name: "Chicken Biryani",        category: "Rice",      price: 280, tax: 5,  veg: false, enabled: true,  emoji: "🍛" },
  { id: "2",  name: "Veg Biryani",             category: "Rice",      price: 220, tax: 5,  veg: true,  enabled: true,  emoji: "🍚" },
  { id: "3",  name: "Paneer Tikka",            category: "Starter",   price: 280, tax: 5,  veg: true,  enabled: true,  emoji: "🧀" },
  { id: "4",  name: "Chicken 65",              category: "Starter",   price: 260, tax: 5,  veg: false, enabled: true,  emoji: "🍗" },
  { id: "5",  name: "Masala Dosa",             category: "Breakfast", price: 120, tax: 5,  veg: true,  enabled: true,  emoji: "🥘" },
  { id: "6",  name: "Veg Thali",               category: "Thali",     price: 150, tax: 5,  veg: true,  enabled: true,  emoji: "🍱" },
  { id: "7",  name: "Chicken Thali",           category: "Thali",     price: 200, tax: 5,  veg: false, enabled: false, emoji: "🍱" },
  { id: "8",  name: "Butter Naan",             category: "Bread",     price: 40,  tax: 5,  veg: true,  enabled: true,  emoji: "🫓" },
  { id: "9",  name: "Mango Lassi",             category: "Drinks",    price: 80,  tax: 12, veg: true,  enabled: true,  emoji: "🥛" },
  { id: "10", name: "Gulab Jamun",             category: "Dessert",   price: 60,  tax: 5,  veg: true,  enabled: true,  emoji: "🍮" },
  { id: "11", name: "Paneer Butter Masala",    category: "Starter",   price: 240, tax: 5,  veg: true,  enabled: true,  emoji: "🍛" },
  { id: "12", name: "Cold Coffee",             category: "Drinks",    price: 90,  tax: 12, veg: true,  enabled: true,  emoji: "☕" },
];

const EMOJIS = ["🍛", "🍚", "🧀", "🍗", "🥘", "🍱", "🫓", "🥛", "🍮", "☕", "🍕", "🥗", "🍔", "🌮", "🍝", "🍜", "🥩", "🍳", "🥞", "🧆"];

const EMPTY_FORM = { name: "", category: "Starter", price: 0, tax: 5, veg: true, enabled: true, emoji: "🍽️", description: "" };

export default function MenuPage() {
  const [items, setItems] = useState<MenuItem[]>(INITIAL_MENU);
  const [activeCategory, setActiveCategory] = useState("All");
  const [search, setSearch] = useState("");
  const [vegFilter, setVegFilter] = useState<"all" | "veg" | "nonveg">("all");
  const [showModal, setShowModal] = useState(false);
  const [editItem, setEditItem] = useState<MenuItem | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);

  const filtered = items.filter((item) => {
    const matchCat = activeCategory === "All" || item.category === activeCategory;
    const matchSearch = item.name.toLowerCase().includes(search.toLowerCase());
    const matchVeg = vegFilter === "all" || (vegFilter === "veg" ? item.veg : !item.veg);
    return matchCat && matchSearch && matchVeg;
  });

  const toggleEnabled = (id: string) => {
    setItems((prev) => prev.map((i) => i.id === id ? { ...i, enabled: !i.enabled } : i));
  };

  const openAdd = () => {
    setEditItem(null);
    setForm(EMPTY_FORM as any);
    setShowModal(true);
  };

  const openEdit = (item: MenuItem) => {
    setEditItem(item);
    setForm({ name: item.name, category: item.category, price: item.price, tax: item.tax, veg: item.veg, enabled: item.enabled, emoji: item.emoji, description: item.description || "" });
    setShowModal(true);
  };

  const saveItem = () => {
    if (!form.name || !form.price) return;
    if (editItem) {
      setItems((prev) => prev.map((i) => i.id === editItem.id ? { ...i, ...form } : i));
    } else {
      setItems((prev) => [...prev, { ...form, id: Date.now().toString() } as MenuItem]);
    }
    setShowModal(false);
  };

  const stats = {
    total: items.length,
    veg: items.filter((i) => i.veg).length,
    nonveg: items.filter((i) => !i.veg).length,
    enabled: items.filter((i) => i.enabled).length,
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-gray-900 dark:text-white flex items-center gap-2">
            <UtensilsCrossed size={24} className="text-orange-500" />
            Menu Management
          </h1>
          <p className="text-sm text-gray-500 dark:text-slate-400 mt-1">Define what you sell · Set prices & taxes · Enable/disable items</p>
        </div>
        <button
          onClick={openAdd}
          className="flex items-center gap-2 bg-orange-500 hover:bg-orange-400 text-white rounded-xl px-5 py-2.5 font-bold text-sm shadow-md shadow-orange-200 dark:shadow-orange-900/30 transition-all active:scale-95"
        >
          <Plus size={16} />
          Add Menu Item
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Total Items", value: stats.total, color: "text-orange-500", bg: "bg-orange-50 dark:bg-orange-900/10" },
          { label: "Veg Items", value: stats.veg, color: "text-emerald-500", bg: "bg-emerald-50 dark:bg-emerald-900/10" },
          { label: "Non-Veg Items", value: stats.nonveg, color: "text-red-500", bg: "bg-red-50 dark:bg-red-900/10" },
          { label: "Active Items", value: stats.enabled, color: "text-blue-500", bg: "bg-blue-50 dark:bg-blue-900/10" },
        ].map((s) => (
          <div key={s.label} className={clsx("rounded-2xl border border-gray-100 dark:border-white/5 p-4", s.bg)}>
            <p className={clsx("text-2xl font-black", s.color)}>{s.value}</p>
            <p className="text-[11px] text-gray-500 dark:text-slate-400 font-semibold mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3 bg-white dark:bg-card rounded-2xl border border-gray-100 dark:border-white/5 p-4">
        <div className="relative flex-1 min-w-[200px]">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search items..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl text-sm outline-none focus:border-orange-300"
          />
        </div>
        <div className="flex gap-1.5">
          {(["all", "veg", "nonveg"] as const).map((v) => (
            <button
              key={v}
              onClick={() => setVegFilter(v)}
              className={clsx("px-3 py-2 rounded-xl text-[11px] font-bold transition-all flex items-center gap-1",
                vegFilter === v ? "bg-orange-500 text-white" : "bg-gray-100 dark:bg-white/5 text-gray-500 hover:bg-orange-50"
              )}
            >
              {v === "veg" ? <><Leaf size={11} /> Veg</> : v === "nonveg" ? <><Drumstick size={11} /> Non-Veg</> : "All"}
            </button>
          ))}
        </div>
        <div className="flex gap-1.5 overflow-x-auto hide-scrollbar">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={clsx("px-3 py-2 rounded-xl text-[11px] font-bold whitespace-nowrap transition-all",
                activeCategory === cat ? "bg-orange-500 text-white" : "bg-gray-100 dark:bg-white/5 text-gray-500 hover:bg-orange-50"
              )}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Menu Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {filtered.map((item) => (
          <div
            key={item.id}
            className={clsx(
              "bg-white dark:bg-card rounded-2xl border p-4 transition-all duration-200 hover:shadow-md",
              item.enabled ? "border-gray-100 dark:border-white/5" : "border-gray-200 dark:border-white/5 opacity-60"
            )}
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-2">
                <span className="text-2xl">{item.emoji}</span>
                <span className={clsx("w-3 h-3 rounded-sm border-2 flex items-center justify-center shrink-0",
                  item.veg ? "border-green-500" : "border-red-500"
                )}>
                  <span className={clsx("w-1.5 h-1.5 rounded-full", item.veg ? "bg-green-500" : "bg-red-500")} />
                </span>
              </div>
              <button
                onClick={() => toggleEnabled(item.id)}
                className={clsx("transition-colors", item.enabled ? "text-emerald-500" : "text-gray-300 dark:text-slate-600")}
                title={item.enabled ? "Disable item" : "Enable item"}
              >
                {item.enabled ? <ToggleRight size={24} /> : <ToggleLeft size={24} />}
              </button>
            </div>

            <h3 className="text-[13px] font-bold text-gray-900 dark:text-white leading-tight">{item.name}</h3>
            <span className="inline-block mt-1 px-2 py-0.5 bg-orange-50 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400 text-[10px] font-bold rounded-lg">
              {item.category}
            </span>

            <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-50 dark:border-white/5">
              <div>
                <p className="text-[12px] font-black text-orange-500">₹{item.price}</p>
                <p className="text-[10px] text-gray-400">GST {item.tax}%</p>
              </div>
              <button
                onClick={() => openEdit(item)}
                className="flex items-center gap-1 px-3 py-1.5 bg-gray-50 dark:bg-white/5 hover:bg-orange-50 dark:hover:bg-orange-900/10 rounded-xl text-[11px] font-bold text-gray-500 hover:text-orange-600 transition-all"
              >
                <Edit3 size={12} /> Edit
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-[#0f1117] rounded-3xl w-full max-w-lg shadow-2xl border border-orange-100 dark:border-white/10">
            <div className="flex items-center justify-between px-6 py-5 border-b border-orange-50 dark:border-white/5">
              <h2 className="text-base font-black text-gray-900 dark:text-white">
                {editItem ? "Edit Item" : "Add Menu Item"}
              </h2>
              <button onClick={() => setShowModal(false)} className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-white/5 text-gray-400 transition-all">
                <X size={18} />
              </button>
            </div>

            <div className="p-6 space-y-4">
              {/* Emoji picker */}
              <div>
                <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2 block">Icon</label>
                <div className="flex flex-wrap gap-2">
                  {EMOJIS.map((e) => (
                    <button
                      key={e}
                      onClick={() => setForm({ ...form, emoji: e })}
                      className={clsx("w-8 h-8 rounded-xl text-lg flex items-center justify-center transition-all",
                        form.emoji === e ? "bg-orange-100 dark:bg-orange-900/30 ring-2 ring-orange-400" : "bg-gray-50 dark:bg-white/5 hover:bg-orange-50"
                      )}
                    >
                      {e}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1.5 block">Item Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Chicken Biryani"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    className="w-full px-4 py-2.5 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl text-sm outline-none focus:border-orange-300"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1.5 block">Category</label>
                  <select
                    value={form.category}
                    onChange={(e) => setForm({ ...form, category: e.target.value })}
                    className="w-full px-4 py-2.5 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl text-sm outline-none focus:border-orange-300"
                  >
                    {CATEGORIES.filter((c) => c !== "All").map((c) => <option key={c}>{c}</option>)}
                  </select>
                </div>

                <div>
                  <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1.5 block">Price (₹) *</label>
                  <input
                    type="number"
                    min={0}
                    value={form.price}
                    onChange={(e) => setForm({ ...form, price: Number(e.target.value) })}
                    className="w-full px-4 py-2.5 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl text-sm outline-none focus:border-orange-300"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1.5 block">GST %</label>
                  <select
                    value={form.tax}
                    onChange={(e) => setForm({ ...form, tax: Number(e.target.value) })}
                    className="w-full px-4 py-2.5 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl text-sm outline-none focus:border-orange-300"
                  >
                    {TAX_OPTIONS.map((t) => <option key={t} value={t}>{t}%</option>)}
                  </select>
                </div>

                <div>
                  <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1.5 block">Type</label>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setForm({ ...form, veg: true })}
                      className={clsx("flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-[11px] font-bold border-2 transition-all",
                        form.veg ? "border-green-400 bg-green-50 text-green-600" : "border-gray-200 dark:border-white/10 text-gray-400"
                      )}
                    >
                      <Leaf size={12} /> Veg
                    </button>
                    <button
                      onClick={() => setForm({ ...form, veg: false })}
                      className={clsx("flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-[11px] font-bold border-2 transition-all",
                        !form.veg ? "border-red-400 bg-red-50 text-red-600" : "border-gray-200 dark:border-white/10 text-gray-400"
                      )}
                    >
                      <Drumstick size={12} /> Non-Veg
                    </button>
                  </div>
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => setShowModal(false)}
                  className="flex-1 py-3 border border-gray-200 dark:border-white/10 rounded-xl text-sm font-bold text-gray-500 hover:bg-gray-50 dark:hover:bg-white/5 transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={saveItem}
                  className="flex-[2] py-3 bg-orange-500 hover:bg-orange-400 text-white rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-all active:scale-95"
                >
                  <Save size={15} />
                  {editItem ? "Save Changes" : "Add to Menu"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
