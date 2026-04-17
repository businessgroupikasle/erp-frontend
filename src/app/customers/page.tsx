"use client";

import { useState } from "react";
import {
  Users,
  Plus,
  Search,
  Star,
  Phone,
  ShoppingBag,
  TrendingUp,
  Award,
  MessageSquare,
  Calendar,
  Filter,
  ChevronRight,
  X,
  Save,
} from "lucide-react";
import { clsx } from "clsx";

interface Customer {
  id: string;
  name: string;
  phone: string;
  email?: string;
  totalOrders: number;
  totalSpend: number;
  loyaltyPoints: number;
  tier: "bronze" | "silver" | "gold" | "platinum";
  lastVisit: string;
  feedback?: string;
  feedbackRating?: number;
  joinedDate: string;
}

const INITIAL_CUSTOMERS: Customer[] = [
  { id: "1",  name: "Rahul Sharma",   phone: "9876543210", email: "rahul@gmail.com",   totalOrders: 42, totalSpend: 18400, loyaltyPoints: 1840, tier: "gold",     lastVisit: "Today",       feedback: "Great biryani! Very authentic taste.", feedbackRating: 5, joinedDate: "Jan 2025" },
  { id: "2",  name: "Priya Mehta",    phone: "9123456780", email: "priya@yahoo.com",   totalOrders: 28, totalSpend: 12600, loyaltyPoints: 1260, tier: "silver",   lastVisit: "Yesterday",   feedback: "Service was quick. Will visit again.", feedbackRating: 4, joinedDate: "Mar 2025" },
  { id: "3",  name: "Anil Kumar",     phone: "9988776655", email: "anil@outlook.com",  totalOrders: 67, totalSpend: 31200, loyaltyPoints: 3120, tier: "platinum", lastVisit: "Today",       joinedDate: "Nov 2024" },
  { id: "4",  name: "Sunita Patel",   phone: "8765432109", totalOrders: 15, totalSpend: 6800, loyaltyPoints: 680, tier: "bronze", lastVisit: "3 days ago", feedback: "Could improve the spice level.", feedbackRating: 3, joinedDate: "Jun 2025" },
  { id: "5",  name: "Ravi Gupta",     phone: "7654321098", email: "ravi@gmail.com",    totalOrders: 89, totalSpend: 48600, loyaltyPoints: 4860, tier: "platinum", lastVisit: "2h ago",      joinedDate: "Aug 2024" },
  { id: "6",  name: "Meena Joshi",    phone: "6543210987", totalOrders: 8,  totalSpend: 3200, loyaltyPoints: 320, tier: "bronze", lastVisit: "1 week ago", joinedDate: "Jan 2026" },
  { id: "7",  name: "Deepak Singh",   phone: "9234567801", email: "deepak@corp.com",   totalOrders: 35, totalSpend: 21000, loyaltyPoints: 2100, tier: "gold",     lastVisit: "Yesterday",   joinedDate: "Feb 2025" },
  { id: "8",  name: "Kavita Rao",     phone: "8123456790", totalOrders: 22, totalSpend: 9800, loyaltyPoints: 980, tier: "silver", lastVisit: "4 days ago", feedback: "Always consistent quality!", feedbackRating: 5, joinedDate: "Apr 2025" },
];

const TIER_CONFIG = {
  bronze:   { label: "Bronze",   color: "text-orange-600",  bg: "bg-orange-100 dark:bg-orange-900/20",  ring: "ring-orange-300" },
  silver:   { label: "Silver",   color: "text-gray-600",    bg: "bg-gray-100 dark:bg-white/10",         ring: "ring-gray-300" },
  gold:     { label: "Gold",     color: "text-yellow-600",  bg: "bg-yellow-100 dark:bg-yellow-900/20",  ring: "ring-yellow-300" },
  platinum: { label: "Platinum", color: "text-violet-600",  bg: "bg-violet-100 dark:bg-violet-900/20",  ring: "ring-violet-300" },
};

export default function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>(INITIAL_CUSTOMERS);
  const [search, setSearch] = useState("");
  const [filterTier, setFilterTier] = useState<"all" | Customer["tier"]>("all");
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [showAdd, setShowAdd] = useState(false);
  const [addForm, setAddForm] = useState({ name: "", phone: "", email: "" });

  const filtered = customers.filter((c) => {
    const matchSearch = c.name.toLowerCase().includes(search.toLowerCase()) || c.phone.includes(search);
    const matchTier = filterTier === "all" || c.tier === filterTier;
    return matchSearch && matchTier;
  });

  const stats = {
    total: customers.length,
    totalRevenue: customers.reduce((s, c) => s + c.totalSpend, 0),
    avgSpend: Math.round(customers.reduce((s, c) => s + c.totalSpend, 0) / customers.length),
    platinum: customers.filter((c) => c.tier === "platinum").length,
  };

  const addCustomer = () => {
    if (!addForm.name || !addForm.phone) return;
    setCustomers((prev) => [...prev, {
      id: Date.now().toString(),
      name: addForm.name,
      phone: addForm.phone,
      email: addForm.email || undefined,
      totalOrders: 0,
      totalSpend: 0,
      loyaltyPoints: 0,
      tier: "bronze",
      lastVisit: "Never",
      joinedDate: new Date().toLocaleDateString("en-IN", { month: "short", year: "numeric" }),
    }]);
    setShowAdd(false);
    setAddForm({ name: "", phone: "", email: "" });
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <p className="text-sm text-gray-500 dark:text-slate-400 mt-1">CRM · Order history · Loyalty points · Feedback tracking</p>
        </div>
        <button
          onClick={() => setShowAdd(true)}
          className="flex items-center gap-2 bg-orange-500 hover:bg-orange-400 text-white rounded-xl px-5 py-2.5 font-bold text-sm shadow-md shadow-orange-200 dark:shadow-orange-900/30 transition-all active:scale-95"
        >
          <Plus size={16} />
          Add Customer
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Total Customers", value: stats.total,               color: "text-orange-500", bg: "bg-orange-50 dark:bg-orange-900/10",    icon: Users },
          { label: "Total Revenue",   value: `₹${stats.totalRevenue.toLocaleString()}`, color: "text-emerald-500", bg: "bg-emerald-50 dark:bg-emerald-900/10", icon: TrendingUp },
          { label: "Avg Spend",       value: `₹${stats.avgSpend}`,       color: "text-blue-500",   bg: "bg-blue-50 dark:bg-blue-900/10",        icon: ShoppingBag },
          { label: "Platinum Members",value: stats.platinum,             color: "text-violet-500", bg: "bg-violet-50 dark:bg-violet-900/10",    icon: Award },
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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Customer List */}
        <div className="lg:col-span-2 bg-white dark:bg-card rounded-2xl border border-gray-100 dark:border-white/5 shadow-sm overflow-hidden">
          {/* Filters */}
          <div className="flex flex-wrap items-center gap-3 px-5 py-4 border-b border-gray-50 dark:border-white/5">
            <div className="relative flex-1 min-w-[180px]">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input type="text" placeholder="Search name or phone..." value={search} onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-8 pr-3 py-2 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl text-[12px] outline-none focus:border-orange-300" />
            </div>
            {(["all", "platinum", "gold", "silver", "bronze"] as const).map((tier) => (
              <button key={tier} onClick={() => setFilterTier(tier)}
                className={clsx("px-3 py-1.5 rounded-xl text-[11px] font-bold capitalize transition-all",
                  filterTier === tier ? "bg-orange-500 text-white" : "bg-gray-100 dark:bg-white/5 text-gray-500 hover:bg-orange-50"
                )}
              >
                {tier === "all" ? "All" : tier}
              </button>
            ))}
          </div>

          <div className="divide-y divide-gray-50 dark:divide-white/5">
            {filtered.map((customer) => {
              const tier = TIER_CONFIG[customer.tier];
              return (
                <button
                  key={customer.id}
                  onClick={() => setSelectedCustomer(customer)}
                  className={clsx("w-full flex items-center gap-4 px-5 py-3.5 hover:bg-orange-50/20 dark:hover:bg-white/5 transition-colors text-left",
                    selectedCustomer?.id === customer.id && "bg-orange-50/40 dark:bg-orange-900/10"
                  )}
                >
                  {/* Avatar */}
                  <div className={clsx("w-10 h-10 rounded-full flex items-center justify-center font-black text-sm ring-2 shrink-0", tier.bg, tier.color, tier.ring)}>
                    {customer.name.split(" ").map((n) => n[0]).join("").slice(0, 2)}
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
                    <p className="text-[11px] text-gray-400">{customer.lastVisit}</p>
                    <p className="text-[11px] font-bold text-yellow-500 flex items-center gap-0.5 justify-end mt-0.5">
                      <Star size={10} fill="currentColor" />{customer.loyaltyPoints} pts
                    </p>
                  </div>
                  <ChevronRight size={14} className="text-gray-300 dark:text-slate-600 shrink-0" />
                </button>
              );
            })}
          </div>
        </div>

        {/* Customer Detail Panel */}
        <div className="bg-white dark:bg-card rounded-2xl border border-gray-100 dark:border-white/5 shadow-sm p-5">
          {selectedCustomer ? (
            <div className="space-y-4">
              {/* Avatar + Name */}
              {(() => {
                const tier = TIER_CONFIG[selectedCustomer.tier];
                return (
                  <div className="text-center">
                    <div className={clsx("w-16 h-16 rounded-full flex items-center justify-center font-black text-xl ring-4 mx-auto", tier.bg, tier.color, tier.ring)}>
                      {selectedCustomer.name.split(" ").map((n) => n[0]).join("").slice(0, 2)}
                    </div>
                    <h3 className="text-base font-black text-gray-900 dark:text-white mt-2">{selectedCustomer.name}</h3>
                    <span className={clsx("inline-block px-2.5 py-0.5 rounded-lg text-[10px] font-black uppercase mt-1", tier.bg, tier.color)}>
                      {tier.label} Member
                    </span>
                  </div>
                );
              })()}

              {/* Info */}
              <div className="space-y-2.5 text-[12px]">
                {[
                  { icon: Phone, label: "Phone", value: selectedCustomer.phone },
                  { icon: Calendar, label: "Joined", value: selectedCustomer.joinedDate },
                  { icon: ShoppingBag, label: "Orders", value: selectedCustomer.totalOrders },
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

              {/* Loyalty Points */}
              <div className="bg-yellow-50 dark:bg-yellow-900/10 border border-yellow-200 dark:border-yellow-800/30 rounded-xl p-3 text-center">
                <Star size={20} className="text-yellow-500 mx-auto mb-1" fill="currentColor" />
                <p className="text-xl font-black text-yellow-600 dark:text-yellow-400">{selectedCustomer.loyaltyPoints}</p>
                <p className="text-[10px] text-yellow-600 dark:text-yellow-500 font-bold">Loyalty Points</p>
                <p className="text-[10px] text-gray-400 mt-0.5">= ₹{Math.floor(selectedCustomer.loyaltyPoints / 10)} cashback</p>
              </div>

              {/* Feedback */}
              {selectedCustomer.feedback && (
                <div className="bg-gray-50 dark:bg-white/5 rounded-xl p-3">
                  <div className="flex items-center gap-2 mb-1.5">
                    <MessageSquare size={13} className="text-orange-500" />
                    <span className="text-[11px] font-bold text-gray-700 dark:text-slate-300">Last Feedback</span>
                    <div className="flex ml-auto">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star key={i} size={10} className={i < (selectedCustomer.feedbackRating || 0) ? "text-yellow-400" : "text-gray-200"} fill="currentColor" />
                      ))}
                    </div>
                  </div>
                  <p className="text-[11px] text-gray-500 dark:text-slate-400 italic">&ldquo;{selectedCustomer.feedback}&rdquo;</p>
                </div>
              )}

              <button className="w-full py-2.5 bg-orange-500 hover:bg-orange-400 text-white rounded-xl text-[12px] font-bold transition-all active:scale-95">
                Send WhatsApp Message
              </button>
            </div>
          ) : (
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
              <button onClick={() => setShowAdd(false)} className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-white/5 text-gray-400"><X size={18} /></button>
            </div>
            <div className="p-6 space-y-4">
              {[
                { label: "Full Name *", field: "name", placeholder: "e.g. Rahul Sharma", type: "text" },
                { label: "Phone *",     field: "phone", placeholder: "10-digit mobile number", type: "tel" },
                { label: "Email",       field: "email", placeholder: "optional", type: "email" },
              ].map(({ label, field, placeholder, type }) => (
                <div key={field}>
                  <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1.5 block">{label}</label>
                  <input type={type} placeholder={placeholder} value={(addForm as any)[field]} onChange={(e) => setAddForm({ ...addForm, [field]: e.target.value })}
                    className="w-full px-4 py-2.5 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl text-sm outline-none focus:border-orange-300" />
                </div>
              ))}
              <div className="flex gap-3 pt-1">
                <button onClick={() => setShowAdd(false)} className="flex-1 py-3 border border-gray-200 dark:border-white/10 rounded-xl text-sm font-bold text-gray-500 hover:bg-gray-50 transition-all">Cancel</button>
                <button onClick={addCustomer} className="flex-[2] py-3 bg-orange-500 hover:bg-orange-400 text-white rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-all active:scale-95">
                  <Save size={15} /> Add Customer
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
