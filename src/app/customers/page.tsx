"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Users, Plus, Search, Star, Phone, ShoppingBag,
  TrendingUp, Award, Calendar,
  ChevronRight, X, Save, Loader2, Trash2, RefreshCw,
} from "lucide-react";
import { clsx } from "clsx";
import { customersApi } from "@/lib/api";

interface Customer {
  id: string;
  name: string;
  phone: string;
  email?: string;
  totalOrders: number;
  totalSpend: number;
  loyaltyPoints: number;
  tier: "bronze" | "silver" | "gold" | "platinum";
  lastVisit?: string;
  createdAt?: string;
}

const TIER_CONFIG = {
  bronze:   { label: "Bronze",   color: "text-orange-600",  bg: "bg-orange-100 dark:bg-orange-900/20",  ring: "ring-orange-300" },
  silver:   { label: "Silver",   color: "text-gray-600",    bg: "bg-gray-100 dark:bg-white/10",         ring: "ring-gray-300" },
  gold:     { label: "Gold",     color: "text-yellow-600",  bg: "bg-yellow-100 dark:bg-yellow-900/20",  ring: "ring-yellow-300" },
  platinum: { label: "Platinum", color: "text-violet-600",  bg: "bg-violet-100 dark:bg-violet-900/20",  ring: "ring-violet-300" },
};

function computeTier(spend: number): Customer["tier"] {
  if (spend >= 30000) return "platinum";
  if (spend >= 15000) return "gold";
  if (spend >= 5000)  return "silver";
  return "bronze";
}

function mapCustomer(c: any): Customer {
  const spend = c.totalSpend || c.totalAmount || 0;
  return {
    id: c.id,
    name: c.name || c.fullName || "Unknown",
    phone: c.phone || c.phoneNumber || "",
    email: c.email || undefined,
    totalOrders: c.totalOrders || c.ordersCount || 0,
    totalSpend: spend,
    loyaltyPoints: c.loyaltyPoints || Math.floor(spend / 10),
    tier: c.tier || computeTier(spend),
    lastVisit: c.lastVisit || c.lastOrderAt,
    createdAt: c.createdAt,
  };
}

const EMPTY_FORM = { name: "", phone: "", email: "" };

export default function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState("");
  const [filterTier, setFilterTier] = useState<"all" | Customer["tier"]>("all");
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [showAdd, setShowAdd] = useState(false);
  const [addForm, setAddForm] = useState(EMPTY_FORM);
  const [error, setError] = useState("");

  const fetchCustomers = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await customersApi.getAll({ take: 200 });
      const raw = res.data?.data || res.data || [];
      const arr = Array.isArray(raw) ? raw : [];
      setCustomers(arr.map(mapCustomer));
    } catch (e: any) {
      setError("Failed to load customers. Check backend connection.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchCustomers(); }, [fetchCustomers]);

  const filtered = customers.filter((c) => {
    const matchSearch = c.name.toLowerCase().includes(search.toLowerCase()) || c.phone.includes(search);
    const matchTier = filterTier === "all" || c.tier === filterTier;
    return matchSearch && matchTier;
  });

  const stats = {
    total: customers.length,
    totalRevenue: customers.reduce((s, c) => s + c.totalSpend, 0),
    avgSpend: customers.length ? Math.round(customers.reduce((s, c) => s + c.totalSpend, 0) / customers.length) : 0,
    platinum: customers.filter((c) => c.tier === "platinum").length,
  };

  const addCustomer = async () => {
    if (!addForm.name.trim() || !addForm.phone.trim()) return;
    setSaving(true);
    try {
      await customersApi.create({
        name: addForm.name.trim(),
        phone: addForm.phone.trim(),
        email: addForm.email.trim() || undefined,
      });
      setShowAdd(false);
      setAddForm(EMPTY_FORM);
      await fetchCustomers();
    } catch (e: any) {
      const msg = e?.response?.data?.message || "Failed to add customer.";
      alert(msg);
    } finally {
      setSaving(false);
    }
  };

  const deleteCustomer = async (id: string) => {
    if (!confirm("Delete this customer? This cannot be undone.")) return;
    try {
      await customersApi.delete(id);
      setCustomers(prev => prev.filter(c => c.id !== id));
      if (selectedCustomer?.id === id) setSelectedCustomer(null);
    } catch (e: any) {
      alert(e?.response?.data?.message || "Failed to delete customer.");
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <p className="text-sm text-gray-500 dark:text-slate-400 mt-1">CRM · Order history · Loyalty points · Feedback tracking</p>
        </div>
        <div className="flex gap-2">
          <button onClick={fetchCustomers} className="flex items-center gap-2 px-4 py-2.5 border border-gray-200 dark:border-white/10 rounded-xl text-sm font-bold text-gray-500 hover:bg-gray-50 dark:hover:bg-white/5 transition-all">
            <RefreshCw size={14} />
          </button>
          <button onClick={() => setShowAdd(true)} className="flex items-center gap-2 bg-orange-500 hover:bg-orange-400 text-white rounded-xl px-5 py-2.5 font-bold text-sm shadow-md shadow-orange-200 dark:shadow-orange-900/30 transition-all active:scale-95">
            <Plus size={16} /> Add Customer
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Total Customers",  value: stats.total,                                  color: "text-orange-500", bg: "bg-orange-50 dark:bg-orange-900/10",   icon: Users },
          { label: "Total Revenue",    value: `₹${stats.totalRevenue.toLocaleString()}`,    color: "text-emerald-500", bg: "bg-emerald-50 dark:bg-emerald-900/10", icon: TrendingUp },
          { label: "Avg Spend",        value: `₹${stats.avgSpend.toLocaleString()}`,        color: "text-blue-500",    bg: "bg-blue-50 dark:bg-blue-900/10",        icon: ShoppingBag },
          { label: "Platinum Members", value: stats.platinum,                               color: "text-violet-500",  bg: "bg-violet-50 dark:bg-violet-900/10",    icon: Award },
        ].map((s) => (
          <div key={s.label} className={clsx("rounded-2xl border border-gray-100 dark:border-white/5 p-4 flex items-center gap-3", s.bg)}>
            <div className="w-9 h-9 rounded-xl bg-white dark:bg-card flex items-center justify-center shadow-sm">
              <s.icon size={16} className={s.color} />
            </div>
            <div>
              <p className={clsx("text-xl font-black", s.color)}>{s.value}</p>
              <p className="text-[11px] text-gray-500 dark:text-slate-400 font-semibold">{s.label}</p>
            </div>
          </div>
        ))}
      </div>

      {error && (
        <div className="bg-rose-50 dark:bg-rose-900/20 border border-rose-200 dark:border-rose-800/30 rounded-xl px-4 py-3 text-sm text-rose-600 dark:text-rose-400">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Customer List */}
        <div className="lg:col-span-2 bg-white dark:bg-card rounded-2xl border border-gray-100 dark:border-white/5 shadow-sm overflow-hidden">
          {/* Filters */}
          <div className="flex flex-wrap items-center gap-3 px-5 py-4 border-b border-gray-50 dark:border-white/5">
            <div className="relative flex-1 min-w-[180px]">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search name or phone..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-8 pr-3 py-2 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl text-[12px] outline-none focus:border-orange-300"
              />
            </div>
            {(["all", "platinum", "gold", "silver", "bronze"] as const).map((tier) => (
              <button
                key={tier}
                onClick={() => setFilterTier(tier)}
                className={clsx("px-3 py-1.5 rounded-xl text-[11px] font-bold capitalize transition-all",
                  filterTier === tier ? "bg-orange-500 text-white" : "bg-gray-100 dark:bg-white/5 text-gray-500 hover:bg-orange-50"
                )}
              >
                {tier === "all" ? "All" : tier}
              </button>
            ))}
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="animate-spin text-orange-500" size={28} />
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-gray-300 dark:text-slate-700">
              <Users size={40} strokeWidth={1} />
              <p className="text-sm font-medium mt-3">{customers.length === 0 ? "No customers yet. Add your first customer!" : "No customers match your search."}</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-50 dark:divide-white/5">
              {filtered.map((customer) => {
                const tier = TIER_CONFIG[customer.tier];
                return (
                  <button
                    key={customer.id}
                    onClick={() => setSelectedCustomer(customer)}
                    className={clsx(
                      "w-full flex items-center gap-4 px-5 py-3.5 hover:bg-orange-50/20 dark:hover:bg-white/5 transition-colors text-left",
                      selectedCustomer?.id === customer.id && "bg-orange-50/40 dark:bg-orange-900/10"
                    )}
                  >
                    <div className={clsx("w-10 h-10 rounded-full flex items-center justify-center font-black text-sm ring-2 shrink-0", tier.bg, tier.color, tier.ring)}>
                      {customer.name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-[13px] font-bold text-gray-900 dark:text-white">{customer.name}</span>
                        <span className={clsx("px-1.5 py-0.5 rounded-md text-[9px] font-black uppercase", tier.bg, tier.color)}>
                          {tier.label}
                        </span>
                      </div>
                      <div className="flex items-center gap-3 mt-0.5 text-[11px] text-gray-400">
                        <span className="flex items-center gap-1"><Phone size={9} />{customer.phone}</span>
                        <span>·</span>
                        <span>{customer.totalOrders} orders</span>
                        <span>·</span>
                        <span className="text-orange-500 font-bold">₹{customer.totalSpend.toLocaleString()}</span>
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      {customer.lastVisit && (
                        <p className="text-[11px] text-gray-400">
                          {new Date(customer.lastVisit).toLocaleDateString("en-IN", { day: "2-digit", month: "short" })}
                        </p>
                      )}
                      <p className="text-[11px] font-bold text-yellow-500 flex items-center gap-0.5 justify-end mt-0.5">
                        <Star size={10} fill="currentColor" />{customer.loyaltyPoints} pts
                      </p>
                    </div>
                    <ChevronRight size={14} className="text-gray-300 dark:text-slate-600 shrink-0" />
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Customer Detail Panel */}
        <div className="bg-white dark:bg-card rounded-2xl border border-gray-100 dark:border-white/5 shadow-sm p-5">
          {selectedCustomer ? (() => {
            const tier = TIER_CONFIG[selectedCustomer.tier];
            return (
              <div className="space-y-4">
                <div className="flex items-start justify-between">
                  <div className="text-center flex-1">
                    <div className={clsx("w-16 h-16 rounded-full flex items-center justify-center font-black text-xl ring-4 mx-auto", tier.bg, tier.color, tier.ring)}>
                      {selectedCustomer.name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase()}
                    </div>
                    <h3 className="text-base font-black text-gray-900 dark:text-white mt-2">{selectedCustomer.name}</h3>
                    <span className={clsx("inline-block px-2.5 py-0.5 rounded-lg text-[10px] font-black uppercase mt-1", tier.bg, tier.color)}>
                      {tier.label} Member
                    </span>
                  </div>
                  <button
                    onClick={() => deleteCustomer(selectedCustomer.id)}
                    className="p-2 text-gray-300 hover:text-rose-500 transition-colors"
                    title="Delete customer"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>

                <div className="space-y-2.5 text-[12px]">
                  {[
                    { icon: Phone,      label: "Phone",    value: selectedCustomer.phone },
                    { icon: Calendar,   label: "Joined",   value: selectedCustomer.createdAt ? new Date(selectedCustomer.createdAt).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }) : "—" },
                    { icon: ShoppingBag, label: "Orders",  value: selectedCustomer.totalOrders },
                    { icon: TrendingUp, label: "Total Spend", value: `₹${selectedCustomer.totalSpend.toLocaleString()}` },
                  ].map((row) => (
                    <div key={row.label} className="flex items-center justify-between py-2 border-b border-gray-50 dark:border-white/5">
                      <div className="flex items-center gap-2 text-gray-500">
                        <row.icon size={13} />
                        <span>{row.label}</span>
                      </div>
                      <span className="font-bold text-gray-900 dark:text-white">{row.value}</span>
                    </div>
                  ))}
                </div>

                <div className="bg-yellow-50 dark:bg-yellow-900/10 border border-yellow-200 dark:border-yellow-800/30 rounded-xl p-3 text-center">
                  <Star size={20} className="text-yellow-500 mx-auto mb-1" fill="currentColor" />
                  <p className="text-xl font-black text-yellow-600 dark:text-yellow-400">{selectedCustomer.loyaltyPoints}</p>
                  <p className="text-[10px] text-yellow-600 dark:text-yellow-500 font-bold">Loyalty Points</p>
                  <p className="text-[10px] text-gray-400 mt-0.5">= ₹{Math.floor(selectedCustomer.loyaltyPoints / 10)} cashback value</p>
                </div>
              </div>
            );
          })() : (
            <div className="flex flex-col items-center justify-center h-full gap-3 text-gray-300 dark:text-slate-600 py-16">
              <Users size={40} strokeWidth={1} />
              <p className="text-sm font-medium text-center">Select a customer to view details</p>
            </div>
          )}
        </div>
      </div>

      {/* Add Customer Modal */}
      {showAdd && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-[#0f1117] rounded-3xl w-full max-w-sm shadow-2xl border border-orange-100 dark:border-white/10">
            <div className="flex items-center justify-between px-6 py-5 border-b border-orange-50 dark:border-white/5">
              <h2 className="text-base font-black text-gray-900 dark:text-white">Add Customer</h2>
              <button onClick={() => setShowAdd(false)} className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-white/5 text-gray-400">
                <X size={18} />
              </button>
            </div>
            <div className="p-6 space-y-4">
              {[
                { label: "Full Name *",  field: "name",  placeholder: "e.g. Rahul Sharma",       type: "text" },
                { label: "Phone *",      field: "phone", placeholder: "10-digit mobile number",   type: "tel" },
                { label: "Email",        field: "email", placeholder: "optional",                 type: "email" },
              ].map(({ label, field, placeholder, type }) => (
                <div key={field}>
                  <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1.5 block">{label}</label>
                  <input
                    type={type}
                    placeholder={placeholder}
                    value={(addForm as any)[field]}
                    onChange={(e) => setAddForm({ ...addForm, [field]: e.target.value })}
                    className="w-full px-4 py-2.5 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl text-sm outline-none focus:border-orange-300"
                  />
                </div>
              ))}
              <div className="flex gap-3 pt-1">
                <button onClick={() => setShowAdd(false)} className="flex-1 py-3 border border-gray-200 dark:border-white/10 rounded-xl text-sm font-bold text-gray-500 hover:bg-gray-50 transition-all">
                  Cancel
                </button>
                <button
                  onClick={addCustomer}
                  disabled={saving || !addForm.name.trim() || !addForm.phone.trim()}
                  className="flex-[2] py-3 bg-orange-500 hover:bg-orange-400 disabled:bg-slate-300 text-white rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-all active:scale-95"
                >
                  {saving ? <Loader2 size={15} className="animate-spin" /> : <Save size={15} />}
                  {saving ? "Saving..." : "Add Customer"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
