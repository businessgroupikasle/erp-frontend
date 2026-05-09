"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import {
  Plus, Minus, Trash2, Search, CreditCard, Banknote, QrCode,
  Utensils, User, X, Percent, ShoppingBag, Zap, ArrowRight,
  UserPlus, Keyboard, Printer, Save, Loader2, Tag, CheckCircle2,
} from "lucide-react";
import { clsx } from "clsx";
import { customersApi, productsApi, posApi } from "@/lib/api";

const CATEGORY_ICONS: Record<string, string> = {
  all: "🌐", components: "⚙️", equipment: "🏗️", "raw materials": "📦",
  hardware: "🔩", services: "🛠️", logistics: "🚚", office: "🖥️",
  maintenance: "🔧", safety: "🦺", electrical: "⚡",
};
const CATEGORY_COLORS: Record<string, string> = {
  all: "bg-slate-900", components: "bg-indigo-600", equipment: "bg-amber-600",
  "raw materials": "bg-emerald-600", hardware: "bg-blue-600", services: "bg-rose-600",
  logistics: "bg-violet-600", office: "bg-sky-600",
};
const getCategoryIcon = (cat: string) => CATEGORY_ICONS[cat.toLowerCase()] || "📦";
const getCategoryColor = (cat: string) => CATEGORY_COLORS[cat.toLowerCase()] || "bg-orange-500";

interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  emoji: string;
  taxPercent: number;
}

interface ReceiptData {
  orderId: string;
  customer: any;
  items: CartItem[];
  subtotal: number;
  gst: number;
  discount: number;
  total: number;
  paymentMode: string;
  orderType: string;
  timestamp: Date;
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
  const [discount, setDiscount] = useState<string>("");
  const [selectedPaymentMode, setSelectedPaymentMode] = useState<"CASH" | "UPI" | "CARD">("CASH");
  const [loading, setLoading] = useState(false);
  const [productsLoading, setProductsLoading] = useState(true);

  // Add-customer modal
  const [showAddCust, setShowAddCust] = useState(false);
  const [newCustForm, setNewCustForm] = useState({ name: "", phone: "", email: "" });
  const [addingCust, setAddingCust] = useState(false);

  // Receipt modal
  const [showReceipt, setShowReceipt] = useState(false);
  const [receiptData, setReceiptData] = useState<ReceiptData | null>(null);

  const searchRef = useRef<HTMLInputElement>(null);
  const cartEndRef = useRef<HTMLDivElement>(null);

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
          // per-product GST — backend may call it taxPercent, gstRate, tax, or gst
          taxPercent:
            typeof p.taxPercent === "number" ? p.taxPercent
            : typeof p.gstRate === "number" ? p.gstRate
            : typeof p.tax === "number" ? p.tax
            : typeof p.gst === "number" ? p.gst
            : 0,
        }));
        setProducts(mapped);
        const cats = Array.from(new Set(mapped.map((p: any) => p.category).filter(Boolean))) as string[];
        setCategories(["All", ...cats]);
      })
      .catch((err) => console.error("Products fetch failed", err))
      .finally(() => setProductsLoading(false));
    searchRef.current?.focus();
  }, []);

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

  const handleNewOrder = useCallback(() => {
    setShowReceipt(false);
    setReceiptData(null);
    setCart([]);
    setCustomer(null);
    setPaidAmount("");
    setCustomerSearch("");
    setDiscount("");
    setSelectedPaymentMode("CASH");
    setTimeout(() => searchRef.current?.focus(), 50);
  }, []);

  useEffect(() => {
    const handleKeys = (e: KeyboardEvent) => {
      if (showReceipt) {
        if (e.key === "Escape") { e.preventDefault(); handleNewOrder(); }
        return;
      }
      if (showAddCust) return;
      if (e.key === " " && document.activeElement?.tagName !== "INPUT") {
        e.preventDefault();
        searchRef.current?.focus();
      }
      if (e.key === "Escape") {
        setCart([]); setCustomer(null); setPaidAmount(""); setSearch(""); setCustomerSearch(""); setDiscount("");
        searchRef.current?.focus();
      }
    };
    window.addEventListener("keydown", handleKeys);
    return () => window.removeEventListener("keydown", handleKeys);
  }, [showReceipt, showAddCust, handleNewOrder]);

  useEffect(() => { cartEndRef.current?.scrollIntoView({ behavior: "smooth" }); }, [cart]);

  const addToCart = (item: any) => {
    if (item.stock !== null && item.stock <= 0) return;
    setCart((prev) => {
      const existing = prev.find((i) => i.id === item.id);
      if (existing) return prev.map((i) => i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i);
      return [...prev, { id: item.id, name: item.name, price: item.price, quantity: 1, emoji: item.emoji, taxPercent: item.taxPercent || 0 }];
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
  const gst = Math.round(cart.reduce((s, i) => s + i.price * i.quantity * ((i.taxPercent || 0) / 100), 0));
  const discountAmt = Math.max(0, parseFloat(discount) || 0);
  const total = Math.max(0, subtotal + gst - discountAmt);
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
        discountAmount: discountAmt,
        totalAmount: total,
        items: cart.map((i) => ({
          productId: i.id,
          quantity: i.quantity,
          unitPrice: i.price,
          totalPrice: i.price * i.quantity,
          taxPercent: i.taxPercent,
        })),
      });
      const orderId = res.data?.id || res.data?.orderId || "";
      setReceiptData({
        orderId,
        customer,
        items: [...cart],
        subtotal,
        gst,
        discount: discountAmt,
        total,
        paymentMode: mode,
        orderType,
        timestamp: new Date(),
      });
      setShowReceipt(true);
    } catch (err: any) {
      const msg = err?.response?.data?.message || "Checkout failed. Check backend connection.";
      alert(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleAddCustomer = async () => {
    if (!newCustForm.name.trim() || !newCustForm.phone.trim()) return;
    setAddingCust(true);
    try {
      const res = await customersApi.create({
        name: newCustForm.name.trim(),
        phone: newCustForm.phone.trim(),
        email: newCustForm.email.trim() || undefined,
      });
      const created = res.data;
      setCustomer({ id: created.id, name: created.name, phone: created.phone });
      setCustomerSearch(created.phone || created.name);
      setCustomerResults([]);
      setShowAddCust(false);
      setNewCustForm({ name: "", phone: "", email: "" });
    } catch (e: any) {
      alert(e?.response?.data?.message || "Failed to add customer.");
    } finally {
      setAddingCust(false);
    }
  };

  const handlePrintReceipt = () => {
    if (!receiptData) return;
    const w = window.open("", "_blank", "width=400,height=700");
    if (!w) return;
    const itemsHtml = receiptData.items.map(item => `
      <div class="row"><span>${item.name} × ${item.quantity}</span><span>₹${(item.price * item.quantity).toLocaleString()}</span></div>
      ${item.taxPercent > 0 ? `<div class="row sub"><span>  GST ${item.taxPercent}%</span><span>₹${Math.round(item.price * item.quantity * item.taxPercent / 100).toLocaleString()}</span></div>` : ""}
    `).join("");
    w.document.write(`<!DOCTYPE html><html><head><title>Receipt</title><style>
      *{box-sizing:border-box;margin:0;padding:0}
      body{font-family:'Courier New',monospace;max-width:300px;margin:0 auto;padding:16px;font-size:13px}
      h2{text-align:center;font-size:18px;letter-spacing:3px;margin-bottom:4px}
      .center{text-align:center;color:#666;font-size:11px;margin-bottom:2px}
      .line{border-top:1px dashed #999;margin:10px 0}
      .row{display:flex;justify-content:space-between;margin:3px 0}
      .row.sub{color:#888;font-size:11px}
      .row.total{font-weight:bold;font-size:15px;margin-top:4px}
      .row.discount{color:#16a34a}
      .footer{text-align:center;margin-top:12px;font-size:11px;color:#888}
      @media print{body{padding:0}}
    </style></head><body>
      <h2>RECEIPT</h2>
      <p class="center">Order #${receiptData.orderId ? receiptData.orderId.slice(-8).toUpperCase() : "—"}</p>
      <p class="center">${new Date(receiptData.timestamp).toLocaleString("en-IN")}</p>
      <p class="center">Type: ${receiptData.orderType.toUpperCase()}</p>
      <div class="line"></div>
      ${itemsHtml}
      <div class="line"></div>
      <div class="row"><span>Subtotal</span><span>₹${receiptData.subtotal.toLocaleString()}</span></div>
      <div class="row"><span>Tax (GST)</span><span>₹${receiptData.gst.toLocaleString()}</span></div>
      ${receiptData.discount > 0 ? `<div class="row discount"><span>Discount</span><span>− ₹${receiptData.discount.toLocaleString()}</span></div>` : ""}
      <div class="line"></div>
      <div class="row total"><span>TOTAL</span><span>₹${receiptData.total.toLocaleString()}</span></div>
      <div class="line"></div>
      <div class="row"><span>Customer</span><span>${receiptData.customer?.name || "Walk-in"}</span></div>
      ${receiptData.customer?.phone ? `<div class="row"><span>Phone</span><span>${receiptData.customer.phone}</span></div>` : ""}
      <div class="row"><span>Payment</span><span>${receiptData.paymentMode}</span></div>
      <div class="footer"><p>— Thank You! —</p></div>
    </body></html>`);
    w.document.close();
    w.print();
  };

  const filteredProducts = products.filter((item) => {
    const matchCat = activeCategory === "All" || item.category === activeCategory;
    const matchSearch = item.name.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  return (
    <div className="-m-6 flex h-[calc(100vh-3.5rem)] overflow-hidden bg-[#F8FAFC] dark:bg-[#090a0f]">

      {/* LEFT: PRODUCT AREA */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <header className="bg-white dark:bg-[#12141c] px-6 py-4 flex flex-col gap-3 border-b border-slate-200/60 dark:border-white/5 shrink-0">
          <div className="flex items-center gap-4">
            <div className="flex bg-slate-100 dark:bg-white/5 p-1 rounded-2xl gap-1 shrink-0">
              {(["counter", "wholesale", "delivery"] as const).map((t) => (
                <button key={t} onClick={() => setOrderType(t)}
                  className={clsx("px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all",
                    orderType === t ? "bg-orange-500 text-white shadow-lg shadow-orange-500/20" : "text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white")}>
                  {t}
                </button>
              ))}
            </div>
            <div className="relative flex-1 group">
              <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-orange-500 transition-colors" />
              <input ref={searchRef} type="text" placeholder="Search products (Space to focus)..."
                value={search} onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl pl-12 pr-6 py-3 text-sm font-medium outline-none focus:ring-4 focus:ring-orange-500/10 focus:border-orange-500 transition-all" />
            </div>
          </div>
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
            {categories.map((cat) => {
              const isActive = activeCategory === cat;
              return (
                <button key={cat} onClick={() => setActiveCategory(cat)}
                  className={clsx("flex items-center gap-2 px-4 py-2.5 rounded-xl whitespace-nowrap text-xs font-black uppercase tracking-wider transition-all shrink-0",
                    isActive ? clsx(getCategoryColor(cat), "text-white shadow-lg") : "bg-white dark:bg-[#1c1f2a] text-slate-600 dark:text-slate-300 border border-slate-200/60 dark:border-white/5 hover:bg-slate-50 dark:hover:bg-white/10")}>
                  <span className="text-sm">{getCategoryIcon(cat)}</span>{cat}
                </button>
              );
            })}
          </div>
        </header>

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
                  <div key={item.id} onClick={() => !isOutOfStock && addToCart(item)}
                    className={clsx("group relative bg-white dark:bg-[#12141c] rounded-2xl p-4 border transition-all duration-200 cursor-pointer select-none",
                      qtyInCart > 0 ? "border-orange-500 shadow-lg shadow-orange-500/10 ring-1 ring-orange-500"
                        : "border-slate-200/60 dark:border-white/5 hover:border-orange-300 dark:hover:border-orange-500/30 hover:shadow-md",
                      isOutOfStock && "opacity-50 grayscale cursor-not-allowed")}>
                    <div className="absolute top-3 right-3 flex items-center gap-1">
                      <span className={clsx("w-2 h-2 rounded-full", isOutOfStock ? "bg-rose-500" : "bg-emerald-500 shadow-[0_0_6px_rgba(16,185,129,0.5)]")} />
                      <span className="text-[9px] font-black uppercase tracking-tight text-slate-400">
                        {isOutOfStock ? "Out of Stock" : item.stock !== null ? `${item.stock} left` : "In Stock"}
                      </span>
                    </div>
                    <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-white/5 flex items-center justify-center mb-3 group-hover:bg-orange-50 dark:group-hover:bg-orange-500/10 transition-colors">
                      <ShoppingBag size={20} className="text-slate-400 group-hover:text-orange-500 transition-colors" />
                    </div>
                    <div className="space-y-1 pr-12">
                      <h4 className="text-xs font-black text-slate-800 dark:text-slate-100 uppercase tracking-tight leading-tight line-clamp-2 group-hover:text-orange-500 transition-colors">{item.name}</h4>
                      <p className="text-sm font-black text-orange-500">₹{item.price.toLocaleString()}</p>
                      {item.taxPercent > 0 && (
                        <p className="text-[9px] font-bold text-slate-400 uppercase">GST {item.taxPercent}%</p>
                      )}
                    </div>
                    {qtyInCart > 0 && (
                      <div onClick={(e) => e.stopPropagation()}
                        className="absolute inset-x-3 bottom-3 flex items-center justify-between bg-orange-500 rounded-xl p-1 shadow-md animate-in fade-in slide-in-from-bottom-1 duration-200">
                        <button onClick={() => updateQty(item.id, -1)} className="w-9 h-9 flex items-center justify-center text-white hover:bg-white/20 rounded-lg transition-all"><Minus size={16} strokeWidth={3} /></button>
                        <span className="text-sm font-black text-white">{qtyInCart}</span>
                        <button onClick={() => updateQty(item.id, 1)} className="w-9 h-9 flex items-center justify-center text-white hover:bg-white/20 rounded-lg transition-all"><Plus size={16} strokeWidth={3} /></button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

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
            <div className="w-9 h-9 rounded-xl bg-orange-100 dark:bg-orange-500/10 flex items-center justify-center text-orange-500"><ShoppingBag size={18} /></div>
            <div>
              <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-widest">Active Order</h3>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{cart.length} items added</p>
            </div>
          </div>
          {cart.length > 0 && (
            <button onClick={() => setCart([])} className="p-2 text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/10 rounded-xl transition-all"><Trash2 size={16} /></button>
          )}
        </div>

        {/* Customer Search */}
        <div className="p-5 border-b border-slate-200/60 dark:border-white/5 space-y-3 shrink-0">
          <div className="relative">
            <User size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
            <input type="text" placeholder="Search Customer (Phone/Name)..."
              value={customerSearch} onChange={(e) => setCustomerSearch(e.target.value)}
              className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl pl-10 pr-10 py-2.5 text-xs outline-none focus:border-orange-500 transition-all font-medium" />
            {customer && (
              <button onClick={() => { setCustomer(null); setCustomerSearch(""); }} className="absolute right-3 top-1/2 -translate-y-1/2 w-6 h-6 flex items-center justify-center bg-slate-200 dark:bg-white/10 rounded-full text-slate-500"><X size={11} /></button>
            )}
          </div>

          {customerResults.length > 0 && !customer && (
            <div className="bg-white dark:bg-[#1c1f2a] border border-slate-200/60 dark:border-white/10 rounded-xl shadow-xl overflow-hidden">
              {customerResults.slice(0, 5).map((c: any) => (
                <button key={c.id} onClick={() => { setCustomer(c); setCustomerSearch(c.phone || c.name); setCustomerResults([]); }}
                  className="w-full text-left px-4 py-2.5 hover:bg-slate-50 dark:hover:bg-white/5 flex items-center gap-3 transition-colors">
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
              <div className="w-10 h-10 rounded-xl bg-orange-500 text-white flex items-center justify-center font-black text-sm">{customer.name?.[0] || "?"}</div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-black text-slate-900 dark:text-white uppercase truncate">{customer.name}</p>
                <p className="text-[10px] font-bold text-orange-600">{customer.phone}</p>
              </div>
            </div>
          ) : (
            <div className="p-3 rounded-xl border border-dashed border-slate-300 dark:border-white/10 flex items-center justify-between">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">No customer linked</p>
              <button onClick={() => setShowAddCust(true)} className="text-[10px] font-black text-orange-500 uppercase flex items-center gap-1 hover:underline">
                <UserPlus size={11} /> Add New
              </button>
            </div>
          )}
        </div>

        {/* Cart Items */}
        <div className="flex-1 overflow-y-auto px-5 py-3 space-y-2">
          {cart.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full gap-4 text-slate-300 dark:text-slate-700">
              <div className="bg-white dark:bg-[#12141c] border border-slate-200/60 dark:border-white/5 p-8 rounded-[2rem] shadow-sm text-center flex flex-col items-center justify-center gap-2 max-w-[260px]">
                <div className="w-16 h-16 bg-slate-50 dark:bg-white/5 rounded-2xl flex items-center justify-center mb-2">
                  <ShoppingBag size={28} className="text-slate-300 dark:text-white/20" />
                </div>
                <div className="space-y-1.5">
                  <p className="text-sm font-black uppercase tracking-[0.2em] text-slate-800 dark:text-white">Ready to bill</p>
                  <p className="text-[11px] font-bold text-slate-400">Add products from the menu to generate invoice</p>
                </div>
              </div>
            </div>
          ) : (
            <>
              {cart.map((item) => (
                <div key={item.id} className="flex items-center gap-3 bg-slate-50 dark:bg-[#1c1f2a] border border-slate-200/60 dark:border-white/5 rounded-xl p-3 transition-all hover:border-orange-200 dark:hover:border-orange-500/20">
                  <div className="w-8 h-8 rounded-lg bg-orange-50 dark:bg-orange-500/10 flex items-center justify-center shrink-0"><ShoppingBag size={15} className="text-orange-500" /></div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-black text-slate-900 dark:text-white uppercase truncate">{item.name}</p>
                    <p className="text-[10px] font-black text-orange-500 mt-0.5">
                      ₹{item.price} <span className="text-slate-400">× {item.quantity}</span>
                      {item.taxPercent > 0 && <span className="text-slate-400"> · GST {item.taxPercent}%</span>}
                    </p>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <button onClick={() => updateQty(item.id, -1)} className="w-7 h-7 rounded-lg bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 flex items-center justify-center text-slate-600 hover:text-orange-500 transition-all"><Minus size={12} strokeWidth={3} /></button>
                    <span className="w-5 text-center text-xs font-black">{item.quantity}</span>
                    <button onClick={() => updateQty(item.id, 1)} className="w-7 h-7 rounded-lg bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 flex items-center justify-center text-slate-600 hover:text-orange-500 transition-all"><Plus size={12} strokeWidth={3} /></button>
                    <button onClick={() => removeItem(item.id)} className="w-7 h-7 rounded-lg flex items-center justify-center text-slate-400 hover:text-rose-500 transition-all ml-1"><X size={13} /></button>
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

          {/* Paid Amount + Change */}
          <div className="bg-white dark:bg-[#1c1f2a] rounded-2xl p-4 border border-slate-200/60 dark:border-white/5">
            <div className="flex items-center justify-between gap-4">
              <div className="flex-1">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1.5">Paid Amount</p>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-black text-sm">₹</span>
                  <input type="number" placeholder="500" value={paidAmount} onChange={(e) => setPaidAmount(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl pl-7 pr-3 py-2.5 text-base font-black outline-none focus:border-orange-500 transition-all" />
                </div>
              </div>
              <div className="text-right shrink-0">
                <p className="text-[10px] font-black text-rose-500 uppercase tracking-[0.2em] mb-1.5">Change Due</p>
                <p className={clsx("text-xl font-black", changeAmount >= 0 ? "text-emerald-500" : "text-rose-500")}>₹{Math.max(0, changeAmount).toLocaleString()}</p>
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
              <span className="flex items-center gap-1.5"><Percent size={11} className="text-orange-500" />
                Tax (GST {cart.length > 0 ? "per item" : "0%"})
              </span>
              <span className="text-slate-900 dark:text-white">₹{gst.toLocaleString()}</span>
            </div>

            {/* Discount row */}
            <div className="flex items-center justify-between gap-3">
              <span className="flex items-center gap-1.5 text-xs font-bold text-slate-500 uppercase tracking-widest">
                <Tag size={11} className="text-emerald-500" /> Discount
              </span>
              <div className="relative w-28">
                <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 font-black text-xs">₹</span>
                <input type="number" min="0" placeholder="0" value={discount} onChange={(e) => setDiscount(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-lg pl-6 pr-2 py-1.5 text-xs font-black outline-none focus:border-emerald-400 transition-all text-right" />
              </div>
            </div>

            <div className="flex justify-between items-end pt-3 border-t border-slate-200 dark:border-white/10">
              <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">Payable Total</p>
                <h2 className="text-3xl font-black text-slate-900 dark:text-white tracking-tighter">₹{total.toLocaleString()}</h2>
              </div>
            </div>
          </div>

          {/* Payment Mode */}
          <div className="grid grid-cols-3 gap-2">
            {([
              { mode: "CASH" as const, icon: Banknote, activeColor: "bg-emerald-500 text-white border-emerald-500", hoverColor: "hover:border-emerald-400" },
              { mode: "UPI" as const, icon: QrCode, activeColor: "bg-blue-500 text-white border-blue-500", hoverColor: "hover:border-blue-400" },
              { mode: "CARD" as const, icon: CreditCard, activeColor: "bg-violet-500 text-white border-violet-500", hoverColor: "hover:border-violet-400" },
            ]).map(({ mode, icon: Icon, activeColor, hoverColor }) => (
              <button key={mode} onClick={() => setSelectedPaymentMode(mode)}
                className={clsx("flex flex-col items-center gap-1.5 py-3 rounded-xl border transition-all",
                  selectedPaymentMode === mode ? activeColor : clsx("bg-white dark:bg-[#1c1f2a] border-slate-200 dark:border-white/5 text-slate-600 dark:text-slate-300", hoverColor))}>
                <Icon size={20} />
                <span className="text-[10px] font-black uppercase tracking-[0.2em]">{mode}</span>
              </button>
            ))}
          </div>

          <button onClick={() => handleCheckout(selectedPaymentMode)}
            disabled={cart.length === 0 || loading || (paidAmount !== "" && parseFloat(paidAmount) < total)}
            className="w-full h-14 bg-orange-500 hover:bg-orange-600 disabled:bg-slate-300 dark:disabled:bg-white/5 disabled:cursor-not-allowed text-white rounded-2xl font-black text-sm uppercase tracking-[0.3em] shadow-lg shadow-orange-500/20 active:scale-[0.98] transition-all flex items-center justify-center gap-3">
            {loading ? (
              <span className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Processing...
              </span>
            ) : (
              <>Confirm Payment · {selectedPaymentMode}<ArrowRight size={18} /></>
            )}
          </button>
        </div>
      </div>

      {/* ── ADD CUSTOMER MODAL ── */}
      {showAddCust && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-[#12141c] rounded-[2.5rem] shadow-2xl w-full max-w-sm p-8 space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-black text-gray-900 dark:text-white uppercase tracking-widest">New Customer</h2>
              <button onClick={() => setShowAddCust(false)} className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-white/5 text-gray-400"><X size={18} /></button>
            </div>
            <div className="space-y-4">
              {[
                { label: "Full Name *", field: "name", placeholder: "e.g. Rahul Sharma", type: "text" },
                { label: "Phone *", field: "phone", placeholder: "10-digit mobile", type: "tel" },
                { label: "Email", field: "email", placeholder: "optional", type: "email" },
              ].map(({ label, field, placeholder, type }) => (
                <div key={field}>
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1.5 block">{label}</label>
                  <input type={type} placeholder={placeholder}
                    value={(newCustForm as any)[field]}
                    onChange={(e) => setNewCustForm({ ...newCustForm, [field]: e.target.value })}
                    className="w-full px-5 py-3.5 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl font-semibold text-sm outline-none focus:border-orange-400 transition-all" />
                </div>
              ))}
            </div>
            <div className="flex gap-3">
              <button onClick={() => setShowAddCust(false)} className="flex-1 py-3.5 border border-gray-200 dark:border-white/10 rounded-2xl text-sm font-bold text-gray-500">Cancel</button>
              <button onClick={handleAddCustomer}
                disabled={addingCust || !newCustForm.name.trim() || !newCustForm.phone.trim()}
                className="flex-[2] py-3.5 bg-orange-500 hover:bg-orange-400 disabled:bg-slate-300 text-white rounded-2xl text-sm font-black flex items-center justify-center gap-2 shadow-lg shadow-orange-500/20 transition-all active:scale-95">
                {addingCust ? <Loader2 size={15} className="animate-spin" /> : <Save size={15} />}
                {addingCust ? "Saving..." : "Add & Select"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── RECEIPT MODAL ── */}
      {showReceipt && receiptData && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 backdrop-blur-xl p-4 animate-in fade-in duration-300">
          <div className="bg-white dark:bg-[#0f1117] rounded-3xl shadow-2xl w-full max-w-md border border-orange-100 dark:border-white/10 overflow-hidden animate-in zoom-in-95 duration-300">
            {/* Receipt header */}
            <div className="bg-orange-500 px-6 py-5 text-center text-white">
              <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center mx-auto mb-3">
                <CheckCircle2 size={28} className="text-white" />
              </div>
              <h2 className="text-lg font-black uppercase tracking-[0.2em]">Order Confirmed</h2>
              <p className="text-xs font-bold opacity-70 mt-1">
                {receiptData.orderId ? `#${receiptData.orderId.slice(-8).toUpperCase()}` : "—"} · {new Date(receiptData.timestamp).toLocaleString("en-IN", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" })}
              </p>
            </div>

            {/* Items */}
            <div className="max-h-[40vh] overflow-y-auto px-6 py-4 space-y-2">
              {receiptData.items.map((item) => (
                <div key={item.id} className="flex justify-between items-center py-1.5 border-b border-slate-100 dark:border-white/5">
                  <div>
                    <p className="text-[13px] font-bold text-slate-900 dark:text-white">{item.name}</p>
                    <p className="text-[11px] text-slate-400">₹{item.price} × {item.quantity}{item.taxPercent > 0 ? ` · GST ${item.taxPercent}%` : ""}</p>
                  </div>
                  <p className="text-[13px] font-black text-slate-900 dark:text-white">₹{(item.price * item.quantity).toLocaleString()}</p>
                </div>
              ))}
            </div>

            {/* Totals */}
            <div className="px-6 pb-4 space-y-1.5">
              <div className="flex justify-between text-[12px] text-slate-500">
                <span>Subtotal</span><span className="font-bold text-slate-800 dark:text-slate-200">₹{receiptData.subtotal.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-[12px] text-slate-500">
                <span>Tax (GST)</span><span className="font-bold text-slate-800 dark:text-slate-200">₹{receiptData.gst.toLocaleString()}</span>
              </div>
              {receiptData.discount > 0 && (
                <div className="flex justify-between text-[12px] text-emerald-600">
                  <span>Discount</span><span className="font-bold">− ₹{receiptData.discount.toLocaleString()}</span>
                </div>
              )}
              <div className="flex justify-between items-center pt-2 border-t border-slate-200 dark:border-white/10">
                <span className="text-sm font-black text-slate-500 uppercase tracking-widest">Total</span>
                <span className="text-2xl font-black text-orange-500">₹{receiptData.total.toLocaleString()}</span>
              </div>
            </div>

            {/* Customer + Payment info */}
            <div className="mx-6 mb-4 bg-slate-50 dark:bg-white/5 rounded-2xl p-3 grid grid-cols-3 gap-2 text-center">
              {[
                { label: "Customer", value: receiptData.customer?.name || "Walk-in" },
                { label: "Payment", value: receiptData.paymentMode },
                { label: "Type", value: receiptData.orderType },
              ].map((r) => (
                <div key={r.label}>
                  <p className="text-[9px] font-black uppercase tracking-widest text-slate-400">{r.label}</p>
                  <p className="text-[11px] font-black text-slate-900 dark:text-white capitalize mt-0.5">{r.value}</p>
                </div>
              ))}
            </div>

            {/* Action buttons */}
            <div className="px-6 pb-6 flex gap-3">
              <button onClick={handlePrintReceipt}
                className="flex-1 py-3.5 border border-slate-200 dark:border-white/10 rounded-2xl text-sm font-bold text-slate-600 dark:text-slate-300 flex items-center justify-center gap-2 hover:bg-slate-50 dark:hover:bg-white/5 transition-all">
                <Printer size={16} /> Print
              </button>
              <button onClick={handleNewOrder}
                className="flex-[2] py-3.5 bg-orange-500 hover:bg-orange-400 text-white rounded-2xl text-sm font-black flex items-center justify-center gap-2 shadow-lg shadow-orange-500/20 transition-all active:scale-95">
                <ArrowRight size={16} /> New Order
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
