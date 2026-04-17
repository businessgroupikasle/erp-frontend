"use client";

import { useState, useEffect } from "react";
import {
  Plus,
  Minus,
  Trash2,
  Search,
  CreditCard,
  Banknote,
  QrCode,
  Utensils,
  User,
  Tag,
  Receipt,
  X,
  CheckCircle2,
  Percent,
  ShoppingBag,
} from "lucide-react";
import { clsx } from "clsx";
import api from "@/lib/api";

const DEMO_MENU: any[] = [
  { id: "1", name: "Chicken Biryani",     category: "Rice",    price: 280, emoji: "🍛", veg: false },
  { id: "2", name: "Veg Biryani",          category: "Rice",    price: 220, emoji: "🍚", veg: true  },
  { id: "3", name: "Paneer Tikka",         category: "Starter", price: 280, emoji: "🧀", veg: true  },
  { id: "4", name: "Chicken 65",           category: "Starter", price: 260, emoji: "🍗", veg: false },
  { id: "5", name: "Masala Dosa",          category: "Breakfast",price: 120, emoji: "🥘", veg: true  },
  { id: "6", name: "Veg Thali",            category: "Thali",   price: 150, emoji: "🍱", veg: true  },
  { id: "7", name: "Chicken Thali",        category: "Thali",   price: 200, emoji: "🍱", veg: false },
  { id: "8", name: "Butter Naan",          category: "Bread",   price: 40,  emoji: "🫓", veg: true  },
  { id: "9", name: "Garlic Roti",          category: "Bread",   price: 30,  emoji: "🫓", veg: true  },
  { id: "10", name: "Mango Lassi",         category: "Drinks",  price: 80,  emoji: "🥛", veg: true  },
  { id: "11", name: "Cold Coffee",         category: "Drinks",  price: 90,  emoji: "☕", veg: true  },
  { id: "12", name: "Gulab Jamun",         category: "Dessert", price: 60,  emoji: "🍮", veg: true  },
];

const CATEGORIES = ["All", "Rice", "Starter", "Breakfast", "Thali", "Bread", "Drinks", "Dessert"];

const COUPONS: Record<string, number> = {
  "FIRST10": 10,
  "WEEKEND20": 20,
  "VIP15": 15,
};

const GST_RATE = 0.05;

interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  emoji: string;
}

export default function POSPage() {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [menu, setMenu] = useState<any[]>(DEMO_MENU);
  const [activeCategory, setActiveCategory] = useState("All");
  const [search, setSearch] = useState("");
  const [couponCode, setCouponCode] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState<string | null>(null);
  const [discountPct, setDiscountPct] = useState(0);
  const [orderType, setOrderType] = useState<"dine-in" | "takeaway" | "delivery">("dine-in");
  const [tableNo, setTableNo] = useState("1");
  const [customerName, setCustomerName] = useState("");
  const [showSuccess, setShowSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    api.get("/api/recipes").then((res) => {
      if (res.data?.length) setMenu(res.data.map((r: any) => ({
        id: r.id, name: r.name, category: r.category || "Main", price: r.basePrice, emoji: "🍽️", veg: true,
      })));
    }).catch(() => {});
  }, []);

  const filteredMenu = menu.filter((item) => {
    const matchCat = activeCategory === "All" || item.category === activeCategory;
    const matchSearch = item.name.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  const addToCart = (item: any) => {
    setCart((prev) => {
      const existing = prev.find((i) => i.id === item.id);
      if (existing) return prev.map((i) => i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i);
      return [...prev, { id: item.id, name: item.name, price: item.price, quantity: 1, emoji: item.emoji || "🍽️" }];
    });
  };

  const updateQty = (id: string, delta: number) => {
    setCart((prev) => prev.map((i) => {
      if (i.id !== id) return i;
      const q = i.quantity + delta;
      return q <= 0 ? null as any : { ...i, quantity: q };
    }).filter(Boolean));
  };

  const removeItem = (id: string) => setCart((prev) => prev.filter((i) => i.id !== id));

  const applyCoupon = () => {
    const pct = COUPONS[couponCode.toUpperCase()];
    if (pct) {
      setAppliedCoupon(couponCode.toUpperCase());
      setDiscountPct(pct);
    } else {
      alert("Invalid coupon code");
    }
  };

  const subtotal = cart.reduce((s, i) => s + i.price * i.quantity, 0);
  const discountAmt = Math.round(subtotal * discountPct / 100);
  const afterDiscount = subtotal - discountAmt;
  const gst = Math.round(afterDiscount * GST_RATE);
  const total = afterDiscount + gst;

  const cartQty = (id: string) => cart.find((i) => i.id === id)?.quantity || 0;

  const handleCheckout = async (mode: string) => {
    if (cart.length === 0) return;
    setLoading(true);
    try {
      await api.post("/api/pos/checkout", {
        franchiseId: "root-franchise",
        paymentMode: mode,
        orderType,
        tableNo: orderType === "dine-in" ? tableNo : undefined,
        customerName,
        subtotal,
        discountAmount: discountAmt,
        taxAmount: gst,
        totalAmount: total,
        items: cart.map((i) => ({ recipeId: i.id, quantity: i.quantity, price: i.price })),
      });
    } catch (_) {}
    setLoading(false);
    setShowSuccess(true);
    setTimeout(() => {
      setShowSuccess(false);
      setCart([]);
      setAppliedCoupon(null);
      setDiscountPct(0);
      setCouponCode("");
      setCustomerName("");
    }, 2000);
  };

  return (
    <div className="flex h-full min-h-[600px] gap-0 bg-white dark:bg-[#0f1117] rounded-3xl overflow-hidden border border-orange-100 dark:border-white/5 shadow-sm">

      {/* ── Menu Panel ───────────────────────────────── */}
      <div className="flex-1 flex flex-col overflow-hidden">

        {/* Top bar */}
        <div className="bg-white dark:bg-[#0f1117] border-b border-orange-50 dark:border-white/5 px-6 py-3 shrink-0">
          <div className="flex items-center gap-4">
            {/* Order type */}
            <div className="flex bg-gray-100 dark:bg-white/5 rounded-xl p-1 gap-1">
              {(["dine-in", "takeaway", "delivery"] as const).map((t) => (
                <button
                  key={t}
                  onClick={() => setOrderType(t)}
                  className={clsx(
                    "px-3 py-1.5 rounded-lg text-[11px] font-bold uppercase tracking-wide transition-all",
                    orderType === t
                      ? "bg-orange-500 text-white shadow-sm"
                      : "text-gray-500 dark:text-slate-400 hover:text-gray-700"
                  )}
                >
                  {t === "dine-in" ? "Dine In" : t === "takeaway" ? "Takeaway" : "Delivery"}
                </button>
              ))}
            </div>
            {/* Table / Customer */}
            {orderType === "dine-in" && (
              <select
                value={tableNo}
                onChange={(e) => setTableNo(e.target.value)}
                className="bg-orange-50 dark:bg-orange-900/10 border border-orange-200 dark:border-orange-800/30 rounded-xl px-3 py-1.5 text-[12px] font-bold text-orange-700 dark:text-orange-400 outline-none"
              >
                {Array.from({ length: 15 }, (_, i) => i + 1).map((n) => (
                  <option key={n} value={n}>Table {n}</option>
                ))}
              </select>
            )}
            {/* Search */}
            <div className="relative flex-1 max-w-xs">
              <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search items..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl text-sm outline-none focus:border-orange-300 transition-all"
              />
            </div>
          </div>
          {/* Category tabs */}
          <div className="flex gap-1.5 mt-3 overflow-x-auto hide-scrollbar pb-1">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={clsx(
                  "px-4 py-1.5 rounded-xl text-[11px] font-bold whitespace-nowrap transition-all",
                  activeCategory === cat
                    ? "bg-orange-500 text-white shadow-sm"
                    : "bg-gray-100 dark:bg-white/5 text-gray-500 dark:text-slate-400 hover:bg-orange-50 dark:hover:bg-orange-900/10 hover:text-orange-600"
                )}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Menu Grid */}
        <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
            {filteredMenu.map((item) => {
              const qty = cartQty(item.id);
              return (
                <button
                  key={item.id}
                  onClick={() => addToCart(item)}
                  className={clsx(
                    "relative bg-white dark:bg-[#0f1117] rounded-2xl border text-left p-4 flex flex-col gap-2 hover:shadow-md transition-all duration-200",
                    qty > 0
                      ? "border-orange-300 dark:border-orange-700 shadow-sm shadow-orange-100"
                      : "border-gray-100 dark:border-white/5"
                  )}
                >
                  {item.veg !== undefined && (
                    <span className={clsx("absolute top-2 right-2 w-3.5 h-3.5 rounded-sm border-2 flex items-center justify-center",
                      item.veg ? "border-green-500" : "border-red-500"
                    )}>
                      <span className={clsx("w-1.5 h-1.5 rounded-full", item.veg ? "bg-green-500" : "bg-red-500")} />
                    </span>
                  )}
                  <div className="text-2xl">{item.emoji || "🍽️"}</div>
                  <div>
                    <h4 className="text-[12px] font-bold text-gray-800 dark:text-slate-200 leading-tight">{item.name}</h4>
                    <p className="text-[13px] font-black text-orange-500 mt-1">₹{item.price}</p>
                  </div>
                  {qty > 0 && (
                    <div
                      onClick={(e) => e.stopPropagation()}
                      className="flex items-center justify-between bg-orange-50 dark:bg-orange-900/20 rounded-xl px-2 py-1"
                    >
                      <button onClick={() => updateQty(item.id, -1)} className="w-5 h-5 flex items-center justify-center text-orange-500 hover:bg-orange-100 rounded-lg transition-all">
                        <Minus size={12} />
                      </button>
                      <span className="text-[12px] font-black text-orange-600">{qty}</span>
                      <button onClick={() => updateQty(item.id, 1)} className="w-5 h-5 flex items-center justify-center text-orange-500 hover:bg-orange-100 rounded-lg transition-all">
                        <Plus size={12} />
                      </button>
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* ── Order Panel ───────────────────────────────── */}
      <div className="w-[380px] bg-white dark:bg-[#0f1117] border-l border-orange-100 dark:border-white/5 flex flex-col shadow-xl">

        {/* Header */}
        <div className="px-5 py-4 border-b border-orange-50 dark:border-white/5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShoppingBag size={18} className="text-orange-500" />
            <h3 className="text-base font-black text-gray-900 dark:text-white">Current Order</h3>
          </div>
          {cart.length > 0 && (
            <button
              onClick={() => setCart([])}
              className="text-[11px] text-red-400 hover:text-red-500 font-semibold flex items-center gap-1"
            >
              <X size={12} /> Clear
            </button>
          )}
        </div>

        {/* Customer Name */}
        <div className="px-5 py-3 border-b border-orange-50 dark:border-white/5">
          <div className="relative">
            <User size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Customer name (optional)"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              className="w-full pl-8 pr-3 py-2 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl text-[12px] outline-none focus:border-orange-300 transition-all"
            />
          </div>
        </div>

        {/* Cart Items */}
        <div className="flex-1 overflow-y-auto custom-scrollbar px-5 py-3 space-y-2">
          {cart.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full gap-3 text-gray-300 dark:text-slate-600">
              <Utensils size={40} strokeWidth={1} />
              <p className="text-sm font-medium">No items added yet</p>
              <p className="text-xs text-center">Tap a menu item to add it to the order</p>
            </div>
          ) : (
            cart.map((item) => (
              <div key={item.id} className="flex items-center gap-3 bg-orange-50/50 dark:bg-white/5 rounded-xl px-3 py-2.5">
                <span className="text-lg">{item.emoji}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-[12px] font-bold text-gray-800 dark:text-slate-200 truncate">{item.name}</p>
                  <p className="text-[11px] text-gray-500">₹{item.price} × {item.quantity}</p>
                </div>
                <div className="flex items-center gap-1.5">
                  <button onClick={() => updateQty(item.id, -1)} className="w-6 h-6 rounded-lg bg-white dark:bg-white/10 border border-gray-200 dark:border-white/10 flex items-center justify-center text-gray-500 hover:text-orange-500 transition-all">
                    <Minus size={11} />
                  </button>
                  <span className="w-5 text-center text-[12px] font-black text-gray-800 dark:text-white">{item.quantity}</span>
                  <button onClick={() => updateQty(item.id, 1)} className="w-6 h-6 rounded-lg bg-white dark:bg-white/10 border border-gray-200 dark:border-white/10 flex items-center justify-center text-gray-500 hover:text-orange-500 transition-all">
                    <Plus size={11} />
                  </button>
                </div>
                <span className="text-[12px] font-black text-gray-900 dark:text-white w-12 text-right">
                  ₹{item.price * item.quantity}
                </span>
                <button onClick={() => removeItem(item.id)} className="text-red-300 hover:text-red-500 transition-colors">
                  <Trash2 size={13} />
                </button>
              </div>
            ))
          )}
        </div>

        {/* Coupon & Bill Summary */}
        <div className="px-5 py-4 border-t border-orange-50 dark:border-white/5 space-y-3">

          {/* Coupon */}
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Tag size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Coupon code (e.g. FIRST10)"
                value={couponCode}
                onChange={(e) => setCouponCode(e.target.value)}
                disabled={!!appliedCoupon}
                className="w-full pl-8 pr-3 py-2 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl text-[11px] outline-none disabled:opacity-60"
              />
            </div>
            {appliedCoupon ? (
              <button
                onClick={() => { setAppliedCoupon(null); setDiscountPct(0); setCouponCode(""); }}
                className="px-3 py-2 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/30 text-red-500 rounded-xl text-[11px] font-bold"
              >
                Remove
              </button>
            ) : (
              <button
                onClick={applyCoupon}
                className="px-3 py-2 bg-orange-500 text-white rounded-xl text-[11px] font-bold hover:bg-orange-400 transition-all"
              >
                Apply
              </button>
            )}
          </div>

          {appliedCoupon && (
            <div className="flex items-center gap-1.5 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800/30 rounded-xl px-3 py-1.5">
              <CheckCircle2 size={13} className="text-emerald-500" />
              <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400">
                {appliedCoupon} applied · {discountPct}% off
              </span>
            </div>
          )}

          {/* Bill breakdown */}
          <div className="space-y-1.5 text-[12px]">
            <div className="flex justify-between text-gray-500 dark:text-slate-400">
              <span>Subtotal</span>
              <span>₹{subtotal}</span>
            </div>
            {discountAmt > 0 && (
              <div className="flex justify-between text-emerald-600 dark:text-emerald-400">
                <span className="flex items-center gap-1"><Percent size={11} /> Discount ({discountPct}%)</span>
                <span>-₹{discountAmt}</span>
              </div>
            )}
            <div className="flex justify-between text-gray-500 dark:text-slate-400">
              <span>GST (5%)</span>
              <span>₹{gst}</span>
            </div>
            <div className="flex justify-between font-black text-[16px] text-gray-900 dark:text-white pt-2 border-t border-orange-100 dark:border-white/10">
              <span>Total</span>
              <span className="text-orange-500">₹{total}</span>
            </div>
          </div>

          {/* Payment Buttons */}
          <div className="grid grid-cols-3 gap-2 pt-1">
            {[
              { mode: "CASH", label: "Cash", icon: Banknote, color: "bg-emerald-500 hover:bg-emerald-400" },
              { mode: "UPI",  label: "UPI",  icon: QrCode,   color: "bg-blue-500 hover:bg-blue-400" },
              { mode: "CARD", label: "Card", icon: CreditCard, color: "bg-violet-500 hover:bg-violet-400" },
            ].map(({ mode, label, icon: Icon, color }) => (
              <button
                key={mode}
                onClick={() => handleCheckout(mode)}
                disabled={cart.length === 0 || loading}
                className={clsx(
                  "flex flex-col items-center gap-1.5 py-3 rounded-xl text-white font-black text-[10px] uppercase tracking-wider transition-all active:scale-95 disabled:opacity-40",
                  color
                )}
              >
                <Icon size={18} />
                {label}
              </button>
            ))}
          </div>

          <button
            className="w-full flex items-center justify-center gap-2 py-2.5 border border-gray-200 dark:border-white/10 rounded-xl text-[12px] font-bold text-gray-600 dark:text-slate-400 hover:bg-gray-50 dark:hover:bg-white/5 transition-all"
          >
            <Receipt size={14} />
            Print Invoice (GST)
          </button>
        </div>
      </div>

      {/* ── Success Overlay ───────────────────────────── */}
      {showSuccess && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="bg-white dark:bg-[#0f1117] rounded-3xl p-10 flex flex-col items-center gap-4 shadow-2xl border border-orange-100">
            <div className="w-20 h-20 rounded-full bg-emerald-50 dark:bg-emerald-900/20 flex items-center justify-center">
              <CheckCircle2 size={44} className="text-emerald-500" />
            </div>
            <h2 className="text-2xl font-black text-gray-900 dark:text-white">Order Placed!</h2>
            <p className="text-gray-500 text-sm">Sent to kitchen · Total ₹{total}</p>
          </div>
        </div>
      )}
    </div>
  );
}
