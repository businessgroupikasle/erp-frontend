"use client";

import { useState, useEffect, useRef, useCallback } from "react";
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
  Receipt,
  X,
  CheckCircle2,
  Percent,
  ShoppingBag,
  Zap,
  ArrowRight,
  UserPlus,
  Keyboard,
} from "lucide-react";
import { clsx } from "clsx";
import { customersApi, productsApi, posApi } from "@/lib/api";

const CATEGORY_ICONS: Record<string, string> = {
  "all": "🌐",
  "components": "⚙️",
  "equipment": "🏗️",
  "raw materials": "📦",
  "hardware": "🔩",
  "services": "🛠️",
  "logistics": "🚚",
  "office": "🖥️",
  "maintenance": "🔧",
  "safety": "🦺",
  "electrical": "⚡",
};

const CATEGORY_COLORS: Record<string, string> = {
  "all": "bg-slate-900",
  "components": "bg-indigo-600",
  "equipment": "bg-amber-600",
  "raw materials": "bg-emerald-600",
  "hardware": "bg-blue-600",
  "services": "bg-rose-600",
  "logistics": "bg-violet-600",
  "office": "bg-sky-600",
};

function getCategoryIcon(cat: string) {
  return CATEGORY_ICONS[cat.toLowerCase()] || "📦";
}
function getCategoryColor(cat: string) {
  return CATEGORY_COLORS[cat.toLowerCase()] || "bg-purple-500";
}

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
  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<string[]>(["All"]);
  const [activeCategory, setActiveCategory] = useState("All");
  const [search, setSearch] = useState("");
  const [orderType, setOrderType] = useState<"counter" | "wholesale" | "delivery">("counter");
  const [customer, setCustomer] = useState<any>(null);
  const [customerSearch, setCustomerSearch] = useState("");
  const [customerResults, setCustomerResults] = useState<any[]>([]);
  const [paidAmount, setPaidAmount] = useState<string>("");
  const [selectedPaymentMode, setSelectedPaymentMode] = useState<"CASH" | "UPI" | "CARD">("CASH");
  const [loading, setLoading] = useState(false);
  const [productsLoading, setProductsLoading] = useState(true);
  const [showSuccess, setShowSuccess] = useState(false);
  const [lastOrderId, setLastOrderId] = useState("");
  const [lastOrderTotal, setLastOrderTotal] = useState(0);

  const searchRef = useRef<HTMLInputElement>(null);
  const cartEndRef = useRef<HTMLDivElement>(null);

  // Fetch products from backend
  useEffect(() => {
    setProductsLoading(true);
    productsApi.getAll({ take: 200 })
      .then((res) => {
        const data = res.data?.data || res.data || [];
        const mapped = data.map((p: any) => ({
          id: p.id,
          name: p.name,
          price: p.basePrice || p.price || 0,
          emoji: p.emoji || "🍽️",
          category: p.category || p.categoryName || "Other",
          stock: typeof p.currentStock === "number" ? p.currentStock : (p.stock ?? null),
        }));
        setProducts(mapped);

        // Build dynamic categories from backend data
        const cats = Array.from(
          new Set(mapped.map((p: any) => p.category).filter(Boolean))
        ) as string[];
        setCategories(["All", ...cats]);
      })
      .catch((err) => console.error("Products fetch failed", err))
      .finally(() => setProductsLoading(false));

    searchRef.current?.focus();
  }, []);

  // Customer search
  useEffect(() => {
    if (customerSearch.length >= 2) {
      customersApi.search(customerSearch)
        .then(res => {
          const data = res.data?.data || res.data || [];
          setCustomerResults(Array.isArray(data) ? data : []);
        })
        .catch(() => setCustomerResults([]));
    } else {
      setCustomerResults([]);
    }
  }, [customerSearch]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeys = (e: KeyboardEvent) => {
      if (e.key === " " && document.activeElement?.tagName !== "INPUT") {
        e.preventDefault();
        searchRef.current?.focus();
      }
      if (e.key === "Escape") {
        setCart([]);
        setCustomer(null);
        setPaidAmount("");
        setSearch("");
        setCustomerSearch("");
        searchRef.current?.focus();
      }
    };
    window.addEventListener("keydown", handleKeys);
    return () => window.removeEventListener("keydown", handleKeys);
  }, []);

  useEffect(() => {
    cartEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [cart]);

  const addToCart = (item: any) => {
    if (item.stock !== null && item.stock <= 0) return;
    setCart((prev) => {
      const existing = prev.find((i) => i.id === item.id);
      if (existing) return prev.map((i) => i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i);
      return [...prev, { id: item.id, name: item.name, price: item.price, quantity: 1, emoji: item.emoji }];
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

  const subtotal = cart.reduce((s, i) => s + i.price * i.quantity, 0);
  const gst = Math.round(subtotal * GST_RATE);
  const total = subtotal + gst;
  const changeAmount = paidAmount ? parseFloat(paidAmount) - total : 0;

  const handleCheckout = async (mode: "CASH" | "UPI" | "CARD") => {
    if (cart.length === 0) return;
    setLoading(true);
    try {
      const res = await posApi.checkout({
        customerId: customer?.id,
        customerName: customer ? customer.name : "Walk-in Customer",
        customerPhone: customer?.phone,
        paymentMode: mode,
        orderType,
        subtotal,
        taxAmount: gst,
        totalAmount: total,
        items: cart.map((i) => ({
          productId: i.id,
          quantity: i.quantity,
          unitPrice: i.price,
          totalPrice: i.price * i.quantity,
        })),
      });
      const orderId = res.data?.id || res.data?.orderId || "";
      setLastOrderId(orderId);
      setLastOrderTotal(total);
      setShowSuccess(true);
      setTimeout(() => {
        setShowSuccess(false);
        setCart([]);
        setCustomer(null);
        setPaidAmount("");
        setCustomerSearch("");
        setSelectedPaymentMode("CASH");
      }, 2500);
    } catch (err: any) {
      const msg = err?.response?.data?.message || "Checkout failed. Check backend connection.";
      alert(msg);
    } finally {
      setLoading(false);
    }
  };

  const filteredProducts = products.filter((item) => {
    const matchCat = activeCategory === "All" || item.category === activeCategory;
    const matchSearch = item.name.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  return (
    // -m-6 cancels the parent layout's p-6; h-[calc(100vh-3.5rem)] fills remaining space (header = h-14)
    <div className="-m-6 flex h-[calc(100vh-3.5rem)] overflow-hidden bg-[#F8FAFC] dark:bg-[#090a0f]">

      {/* LEFT: PRODUCT AREA */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">

        {/* Top bar */}
        <header className="bg-white dark:bg-[#12141c] px-6 py-4 flex flex-col gap-3 border-b border-slate-200/60 dark:border-white/5 shrink-0">
          <div className="flex items-center gap-4">
            <div className="flex bg-slate-100 dark:bg-white/5 p-1 rounded-2xl gap-1 shrink-0">
              {(["counter", "wholesale", "delivery"] as const).map((t) => (
                <button
                  key={t}
                  onClick={() => setOrderType(t)}
                  className={clsx(
                    "px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all",
                    orderType === t
                      ? "bg-orange-500 text-white shadow-lg shadow-orange-500/20"
                      : "text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                  )}
                >
                  {t}
                </button>
              ))}
            </div>

            <div className="relative flex-1 group">
              <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-orange-500 transition-colors" />
              <input
                ref={searchRef}
                type="text"
                placeholder="Search products (Space to focus)..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl pl-12 pr-6 py-3 text-sm font-medium outline-none focus:ring-4 focus:ring-orange-500/10 focus:border-orange-500 transition-all"
              />
            </div>
          </div>

          {/* Dynamic Category Tabs */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
            {categories.map((cat) => {
              const isActive = activeCategory === cat;
              const icon = getCategoryIcon(cat);
              const color = getCategoryColor(cat);
              return (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={clsx(
                    "flex items-center gap-2 px-4 py-2.5 rounded-xl whitespace-nowrap text-xs font-black uppercase tracking-wider transition-all shrink-0",
                    isActive
                      ? clsx(color, "text-white shadow-lg")
                      : "bg-white dark:bg-[#1c1f2a] text-slate-600 dark:text-slate-300 border border-slate-200/60 dark:border-white/5 hover:bg-slate-50 dark:hover:bg-white/10"
                  )}
                >
                  <span className="text-sm">{icon}</span>
                  {cat}
                </button>
              );
            })}
          </div>
        </header>

        {/* Product Grid */}
        <div className="flex-1 overflow-y-auto p-6 bg-slate-50/50 dark:bg-[#090a0f]">
          {productsLoading ? (
            <div className="flex items-center justify-center h-full text-slate-400">
              <div className="text-center space-y-3">
                <div className="w-10 h-10 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto" />
                <p className="text-sm font-bold uppercase tracking-widest">Loading products...</p>
              </div>
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="flex items-center justify-center h-full text-slate-400">
              <p className="text-sm font-bold uppercase tracking-widest">No products found</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
              {filteredProducts.map((item) => {
                const qtyInCart = cart.find(i => i.id === item.id)?.quantity || 0;
                const isOutOfStock = item.stock !== null && item.stock <= 0;

                return (
                  <div
                    key={item.id}
                    onClick={() => !isOutOfStock && addToCart(item)}
                    className={clsx(
                      "group relative bg-white dark:bg-[#12141c] rounded-2xl p-4 border transition-all duration-200 cursor-pointer select-none",
                      qtyInCart > 0
                        ? "border-orange-500 shadow-lg shadow-orange-500/10 ring-1 ring-orange-500"
                        : "border-slate-200/60 dark:border-white/5 hover:border-orange-300 dark:hover:border-orange-500/30 hover:shadow-md",
                      isOutOfStock && "opacity-50 grayscale cursor-not-allowed"
                    )}
                  >
                    {/* Stock badge */}
                    <div className="absolute top-3 right-3 flex items-center gap-1">
                      <span className={clsx(
                        "w-2 h-2 rounded-full",
                        isOutOfStock ? "bg-rose-500" : "bg-emerald-500 shadow-[0_0_6px_rgba(16,185,129,0.5)]"
                      )} />
                      <span className="text-[9px] font-black uppercase tracking-tight text-slate-400">
                        {isOutOfStock
                          ? "Out of Stock"
                          : item.stock !== null
                            ? `${item.stock} left`
                            : "In Stock"}
                      </span>
                    </div>

                    <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-white/5 flex items-center justify-center mb-3 group-hover:bg-orange-50 dark:group-hover:bg-orange-500/10 transition-colors">
                      <Utensils size={20} className="text-slate-400 group-hover:text-orange-500 transition-colors" />
                    </div>

                    <div className="space-y-1 pr-12">
                      <h4 className="text-xs font-black text-slate-800 dark:text-slate-100 uppercase tracking-tight leading-tight line-clamp-2 group-hover:text-orange-500 transition-colors">{item.name}</h4>
                      <p className="text-sm font-black text-orange-500">₹{item.price.toLocaleString()}</p>
                    </div>

                    {qtyInCart > 0 && (
                      <div
                        onClick={(e) => e.stopPropagation()}
                        className="absolute inset-x-3 bottom-3 flex items-center justify-between bg-orange-500 rounded-xl p-1 shadow-md animate-in fade-in slide-in-from-bottom-1 duration-200"
                      >
                        <button onClick={() => updateQty(item.id, -1)} className="w-9 h-9 flex items-center justify-center text-white hover:bg-white/20 rounded-lg transition-all">
                          <Minus size={16} strokeWidth={3} />
                        </button>
                        <span className="text-sm font-black text-white">{qtyInCart}</span>
                        <button onClick={() => updateQty(item.id, 1)} className="w-9 h-9 flex items-center justify-center text-white hover:bg-white/20 rounded-lg transition-all">
                          <Plus size={16} strokeWidth={3} />
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <footer className="bg-white dark:bg-[#12141c] border-t border-slate-200/60 dark:border-white/5 py-3 px-6 flex items-center justify-between shrink-0">
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
            {filteredProducts.length} products · {cart.length} in cart
          </p>
          <div className="flex items-center gap-2 text-slate-400">
            <Keyboard size={13} />
            <span className="text-[10px] font-black uppercase tracking-widest">[Esc] Clear · [Space] Search</span>
          </div>
        </footer>
      </div>

      {/* RIGHT: ORDER PANEL */}
      <div className="w-[400px] bg-white dark:bg-[#0f1117] border-l border-slate-200/60 dark:border-white/5 flex flex-col shrink-0">

        {/* Cart Header */}
        <div className="p-5 border-b border-slate-200/60 dark:border-white/5 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-orange-100 dark:bg-orange-500/10 flex items-center justify-center text-orange-500">
              <ShoppingBag size={18} />
            </div>
            <div>
              <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-widest">Active Order</h3>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{cart.length} items added</p>
            </div>
          </div>
          {cart.length > 0 && (
            <button onClick={() => setCart([])} className="p-2 text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/10 rounded-xl transition-all">
              <Trash2 size={16} />
            </button>
          )}
        </div>

        {/* Customer Search */}
        <div className="p-5 border-b border-slate-200/60 dark:border-white/5 space-y-3 shrink-0">
          <div className="relative">
            <User size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search Customer (Phone/Name)..."
              value={customerSearch}
              onChange={(e) => setCustomerSearch(e.target.value)}
              className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl pl-10 pr-10 py-2.5 text-xs outline-none focus:border-orange-500 transition-all font-medium"
            />
            {customer && (
              <button onClick={() => { setCustomer(null); setCustomerSearch(""); }} className="absolute right-3 top-1/2 -translate-y-1/2 w-6 h-6 flex items-center justify-center bg-slate-200 dark:bg-white/10 rounded-full text-slate-500">
                <X size={11} />
              </button>
            )}
          </div>

          {customerResults.length > 0 && !customer && (
            <div className="bg-white dark:bg-[#1c1f2a] border border-slate-200/60 dark:border-white/10 rounded-xl shadow-xl overflow-hidden">
              {customerResults.slice(0, 5).map((c: any) => (
                <button
                  key={c.id}
                  onClick={() => { setCustomer(c); setCustomerSearch(c.phone || c.name); setCustomerResults([]); }}
                  className="w-full text-left px-4 py-2.5 hover:bg-slate-50 dark:hover:bg-white/5 flex items-center gap-3 transition-colors"
                >
                  <div className="w-7 h-7 rounded-full bg-orange-100 flex items-center justify-center text-orange-600 font-bold text-xs">{c.name?.[0] || "?"}</div>
                  <div>
                    <p className="text-xs font-black text-slate-900 dark:text-white">{c.name}</p>
                    <p className="text-[10px] text-slate-400 font-bold">{c.phone}</p>
                  </div>
                </button>
              ))}
            </div>
          )}

          {customer ? (
            <div className="bg-orange-50 dark:bg-orange-500/5 rounded-xl p-3 border border-orange-200/60 dark:border-orange-500/10 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-orange-500 text-white flex items-center justify-center font-black text-sm">
                {customer.name?.[0] || "?"}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-black text-slate-900 dark:text-white uppercase truncate">{customer.name}</p>
                <p className="text-[10px] font-bold text-orange-600">{customer.phone}</p>
              </div>
            </div>
          ) : (
            <div className="p-3 rounded-xl border border-dashed border-slate-300 dark:border-white/10 flex items-center justify-between">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">No customer linked</p>
              <button className="text-[10px] font-black text-orange-500 uppercase flex items-center gap-1 hover:underline">
                <UserPlus size={11} /> Add New
              </button>
            </div>
          )}
        </div>

        {/* Cart Items */}
        <div className="flex-1 overflow-y-auto px-5 py-3 space-y-2">
          {cart.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full gap-4 text-slate-300 dark:text-slate-700">
              <div className="w-20 h-20 rounded-full border-4 border-dashed border-current flex items-center justify-center">
                <Utensils size={36} strokeWidth={1} />
              </div>
              <div className="space-y-1 text-center">
                <p className="text-sm font-black uppercase tracking-[0.2em]">Kitchen is ready</p>
                <p className="text-xs font-medium max-w-[180px]">Waiting for item selection from the product grid</p>
              </div>
            </div>
          ) : (
            <>
              {cart.map((item) => (
                <div key={item.id} className="flex items-center gap-3 bg-slate-50 dark:bg-[#1c1f2a] border border-slate-200/60 dark:border-white/5 rounded-xl p-3 transition-all hover:border-orange-200 dark:hover:border-orange-500/20">
                  <div className="w-8 h-8 rounded-lg bg-orange-50 dark:bg-orange-500/10 flex items-center justify-center shrink-0">
                    <Utensils size={15} className="text-orange-500" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-black text-slate-900 dark:text-white uppercase truncate">{item.name}</p>
                    <p className="text-[10px] font-black text-orange-500 mt-0.5">₹{item.price} <span className="text-slate-400">× {item.quantity}</span></p>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <button onClick={() => updateQty(item.id, -1)} className="w-7 h-7 rounded-lg bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 flex items-center justify-center text-slate-600 hover:text-orange-500 transition-all">
                      <Minus size={12} strokeWidth={3} />
                    </button>
                    <span className="w-5 text-center text-xs font-black">{item.quantity}</span>
                    <button onClick={() => updateQty(item.id, 1)} className="w-7 h-7 rounded-lg bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 flex items-center justify-center text-slate-600 hover:text-orange-500 transition-all">
                      <Plus size={12} strokeWidth={3} />
                    </button>
                    <button onClick={() => removeItem(item.id)} className="w-7 h-7 rounded-lg flex items-center justify-center text-slate-400 hover:text-rose-500 transition-all ml-1">
                      <X size={13} />
                    </button>
                  </div>
                  <div className="text-right ml-1 shrink-0">
                    <p className="text-xs font-black text-slate-900 dark:text-white">₹{(item.price * item.quantity).toLocaleString()}</p>
                  </div>
                </div>
              ))}
              <div ref={cartEndRef} />
            </>
          )}
        </div>

        {/* Summary & Checkout */}
        <div className="bg-slate-50/50 dark:bg-[#12141c] p-5 border-t border-slate-200/60 dark:border-white/5 space-y-4 shrink-0">

          {/* Change Calculator */}
          <div className="bg-white dark:bg-[#1c1f2a] rounded-2xl p-4 border border-slate-200/60 dark:border-white/5">
            <div className="flex items-center justify-between gap-4">
              <div className="flex-1">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1.5">Paid Amount</p>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-black text-sm">₹</span>
                  <input
                    type="number"
                    placeholder="500"
                    value={paidAmount}
                    onChange={(e) => setPaidAmount(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl pl-7 pr-3 py-2.5 text-base font-black outline-none focus:border-orange-500 transition-all"
                  />
                </div>
              </div>
              <div className="text-right shrink-0">
                <p className="text-[10px] font-black text-rose-500 uppercase tracking-[0.2em] mb-1.5">Change Due</p>
                <p className={clsx("text-xl font-black", changeAmount >= 0 ? "text-emerald-500" : "text-rose-500")}>
                  ₹{Math.max(0, changeAmount).toLocaleString()}
                </p>
              </div>
            </div>
          </div>

          {/* Totals */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs font-bold text-slate-500 uppercase tracking-widest">
              <span className="flex items-center gap-1.5"><Zap size={11} className="text-orange-500" /> Subtotal</span>
              <span className="text-slate-900 dark:text-white">₹{subtotal.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-xs font-bold text-slate-500 uppercase tracking-widest">
              <span className="flex items-center gap-1.5"><Percent size={11} className="text-orange-500" /> Tax (GST 5%)</span>
              <span className="text-slate-900 dark:text-white">₹{gst.toLocaleString()}</span>
            </div>
            <div className="flex justify-between items-end pt-3 border-t border-slate-200 dark:border-white/10">
              <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">Payable Total</p>
                <h2 className="text-3xl font-black text-slate-900 dark:text-white tracking-tighter">₹{total.toLocaleString()}</h2>
              </div>
              <button className="text-[10px] font-black text-orange-500 uppercase flex items-center gap-1 hover:underline">
                <Receipt size={13} /> Add Tax ID
              </button>
            </div>
          </div>

          {/* Payment Mode Selection */}
          <div className="grid grid-cols-3 gap-2">
            {([
              { mode: "CASH" as const, icon: Banknote, activeColor: "bg-emerald-500 text-white border-emerald-500", hoverColor: "hover:border-emerald-400" },
              { mode: "UPI" as const, icon: QrCode, activeColor: "bg-blue-500 text-white border-blue-500", hoverColor: "hover:border-blue-400" },
              { mode: "CARD" as const, icon: CreditCard, activeColor: "bg-violet-500 text-white border-violet-500", hoverColor: "hover:border-violet-400" },
            ]).map(({ mode, icon: Icon, activeColor, hoverColor }) => (
              <button
                key={mode}
                onClick={() => setSelectedPaymentMode(mode)}
                className={clsx(
                  "flex flex-col items-center gap-1.5 py-3 rounded-xl border transition-all",
                  selectedPaymentMode === mode
                    ? activeColor
                    : clsx("bg-white dark:bg-[#1c1f2a] border-slate-200 dark:border-white/5 text-slate-600 dark:text-slate-300", hoverColor)
                )}
              >
                <Icon size={20} />
                <span className="text-[10px] font-black uppercase tracking-[0.2em]">{mode}</span>
              </button>
            ))}
          </div>

          <button
            onClick={() => handleCheckout(selectedPaymentMode)}
            disabled={cart.length === 0 || loading || (paidAmount !== "" && parseFloat(paidAmount) < total)}
            className="w-full h-14 bg-orange-500 hover:bg-orange-600 disabled:bg-slate-300 dark:disabled:bg-white/5 disabled:cursor-not-allowed text-white rounded-2xl font-black text-sm uppercase tracking-[0.3em] shadow-lg shadow-orange-500/20 active:scale-[0.98] transition-all flex items-center justify-center gap-3"
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Processing...
              </span>
            ) : (
              <>
                Confirm Payment · {selectedPaymentMode}
                <ArrowRight size={18} />
              </>
            )}
          </button>
        </div>
      </div>

      {/* SUCCESS OVERLAY */}
      {showSuccess && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-xl animate-in fade-in duration-300">
          <div className="bg-white dark:bg-[#0f1117] rounded-3xl p-12 flex flex-col items-center text-center gap-6 shadow-2xl border border-orange-100/20 max-w-sm w-full mx-4 animate-in zoom-in-95 duration-400">
            <div className="w-20 h-20 rounded-full bg-emerald-500 flex items-center justify-center text-white shadow-lg shadow-emerald-500/40">
              <CheckCircle2 size={44} strokeWidth={2.5} />
            </div>
            <div>
              <h2 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tight mb-1">Order Confirmed</h2>
              {lastOrderId && <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px]">Order #{lastOrderId.slice(-6).toUpperCase()}</p>}
            </div>
            <div className="w-full bg-slate-50 dark:bg-white/5 rounded-2xl p-4 flex justify-between items-center">
              <span className="text-xs font-black uppercase tracking-widest text-slate-400">Total Billed</span>
              <span className="text-lg font-black text-slate-900 dark:text-white">₹{lastOrderTotal.toLocaleString()}</span>
            </div>
            <p className="text-xs font-bold text-emerald-500">Payment received via {selectedPaymentMode}</p>
          </div>
        </div>
      )}
    </div>
  );
}
