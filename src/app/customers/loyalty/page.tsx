"use client";

import { useState } from "react";
import {
  Star,
  Award,
  TrendingUp,
  Users,
  Search,
  ChevronRight,
  Plus,
  Gift,
  Zap,
  ArrowRight,
  LayoutGrid,
  History,
  Settings2,
  Clock,
  Sparkles
} from "lucide-react";
import { clsx } from "clsx";

interface LoyaltyCustomer {
  id: string;
  name: string;
  points: number;
  tier: "bronze" | "silver" | "gold" | "platinum";
  lastRedemption: string;
  totalRedeemed: number;
}

const TIER_CONFIG = {
  bronze: { 
    label: "Bronze", 
    color: "text-orange-600", 
    bg: "bg-orange-100 dark:bg-orange-900/20", 
    icon: Star, 
    threshold: "0 - 500 pts",
    benefits: ["5% Cashback", "Bday Reward"]
  },
  silver: { 
    label: "Silver", 
    color: "text-gray-600", 
    bg: "bg-gray-100 dark:bg-white/10", 
    icon: Award, 
    threshold: "501 - 1500 pts",
    benefits: ["10% Cashback", "Priority Service"]
  },
  gold: { 
    label: "Gold", 
    color: "text-yellow-600", 
    bg: "bg-yellow-100 dark:bg-yellow-900/20", 
    icon: TrendingUp, 
    threshold: "1501 - 3000 pts",
    benefits: ["15% Cashback", "Free Delivery"]
  },
  platinum: { 
    label: "Platinum", 
    color: "text-violet-600", 
    bg: "bg-violet-100 dark:bg-violet-900/20", 
    icon: Zap, 
    threshold: "3000+ pts",
    benefits: ["20% Cashback", "Exclusive Previews"]
  },
};

const INITIAL_LOYALTY_CUSTOMERS: LoyaltyCustomer[] = [
  { id: "1", name: "Anil Kumar", points: 3120, tier: "platinum", lastRedemption: "2 days ago", totalRedeemed: 4500 },
  { id: "2", name: "Ravi Gupta", points: 4860, tier: "platinum", lastRedemption: "Today", totalRedeemed: 12000 },
  { id: "3", name: "Rahul Sharma", points: 1840, tier: "gold", lastRedemption: "1 week ago", totalRedeemed: 2500 },
  { id: "4", name: "Priya Mehta", points: 1260, tier: "silver", lastRedemption: "Never", totalRedeemed: 0 },
  { id: "5", name: "Kavita Rao", points: 980, tier: "silver", lastRedemption: "4 days ago", totalRedeemed: 800 },
];

export default function LoyaltyPage() {
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState<"ledger" | "campaigns" | "rewards">("ledger");

  const stats = [
    { label: "Total Points Issued", value: "84.2K", icon: Star, color: "text-orange-500", bg: "bg-orange-50 dark:bg-orange-900/10" },
    { label: "Active Members", value: "1,248", icon: Users, color: "text-emerald-500", bg: "bg-emerald-50 dark:bg-emerald-900/10" },
    { label: "Points Redeemed Today", value: "2,450", icon: History, color: "text-blue-500", bg: "bg-blue-50 dark:bg-blue-900/10" },
    { label: "Member Revenue", value: "₹4.2L", icon: TrendingUp, color: "text-violet-500", bg: "bg-violet-50 dark:bg-violet-900/10" },
  ];

  return (
    <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in duration-700">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
             <Star className="text-orange-500 fill-orange-500" size={18} />
             <span className="text-[10px] font-black tracking-[0.2em] text-orange-500 uppercase">Loyalty Engine</span>
          </div>
          <h1 className="text-3xl font-black tracking-tight text-slate-900 dark:text-white">Retention & Rewards</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1 font-medium italic">Transform active diners into <span className="text-orange-500 font-bold">VIP Patrons</span> through meaningful incentives.</p>
        </div>
        <div className="flex gap-3">
          <button className="flex items-center gap-2 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-2xl px-6 py-3 font-black text-[10px] uppercase tracking-widest hover:scale-105 active:scale-95 transition-all shadow-xl shadow-black/10">
            <Settings2 size={16} /> Configure Rules
          </button>
          <button className="flex items-center gap-2 bg-orange-500 text-white rounded-2xl px-6 py-3 font-black text-[10px] uppercase tracking-widest hover:scale-105 active:scale-95 transition-all shadow-xl shadow-orange-500/20">
            <Plus size={16} /> New Campaign
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        {stats.map((s, i) => (
          <div key={i} className={clsx("rounded-[32px] border border-slate-100 dark:border-white/5 p-6 flex items-center gap-4 group hover:shadow-lg transition-all", s.bg)}>
            <div className="w-12 h-12 rounded-2xl bg-white dark:bg-card flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
              <s.icon size={20} className={s.color} />
            </div>
            <div>
              <p className={clsx("text-2xl font-black tracking-tighter", s.color)}>{s.value}</p>
              <p className="text-[10px] text-slate-500 dark:text-slate-400 font-black uppercase tracking-widest">{s.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Tier Architecture */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
           <h2 className="text-sm font-black uppercase tracking-widest text-slate-400">Patron Journey Architecture</h2>
           <span className="text-[10px] font-bold text-orange-500 flex items-center gap-1"><Sparkles size={12}/> AI-Optimized Thresholds</span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {(Object.entries(TIER_CONFIG) as [keyof typeof TIER_CONFIG, any][]).map(([key, tier]) => (
            <div key={key} className={clsx("rounded-[40px] p-8 border border-muted dark:border-white/5 flex flex-col items-center text-center group hover:-translate-y-2 transition-all duration-500", tier.bg)}>
               <div className={clsx("w-16 h-16 rounded-3xl bg-white dark:bg-card flex items-center justify-center shadow-xl mb-6 group-hover:rotate-12 transition-transform", tier.color)}>
                  <tier.icon size={32} />
               </div>
               <h3 className={clsx("text-2xl font-black tracking-tight mb-1", tier.color)}>{tier.label}</h3>
               <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-6">{tier.threshold}</p>
               
               <div className="space-y-2 w-full">
                  {tier.benefits.map((b: string, i: number) => (
                    <div key={i} className="py-2.5 px-4 bg-white/50 dark:bg-white/5 rounded-2xl text-[11px] font-bold text-slate-600 dark:text-slate-400 border border-white/50 dark:border-white/5">
                      {b}
                    </div>
                  ))}
               </div>
            </div>
          ))}
        </div>
      </div>

      {/* Main Content Area */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Tabbed Interface */}
        <div className="lg:col-span-2 space-y-6">
           <div className="flex p-1.5 bg-slate-100 dark:bg-white/5 rounded-2xl w-fit">
              {[
                { id: "ledger", label: "Points Ledger", icon: LayoutGrid },
                { id: "campaigns", label: "Active Campaigns", icon: Zap },
                { id: "rewards", label: "Rewards Library", icon: Gift },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={clsx(
                    "flex items-center gap-2 px-6 py-2.5 rounded-xl text-[11px] font-black uppercase tracking-widest transition-all",
                    activeTab === tab.id 
                      ? "bg-white dark:bg-card text-orange-500 shadow-md" 
                      : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
                  )}
                >
                  <tab.icon size={14} />
                  {tab.label}
                </button>
              ))}
           </div>

           <div className="bg-white dark:bg-card rounded-[40px] border border-muted dark:border-white/5 shadow-xl shadow-black/[0.02] overflow-hidden">
              {activeTab === 'ledger' && (
                <div className="p-0">
                  <div className="p-6 border-b border-muted dark:border-white/5 flex items-center justify-between">
                    <div className="relative w-full max-w-md">
                      <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                      <input 
                        type="text" 
                        placeholder="Search patron name or phone..." 
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full pl-12 pr-6 py-3 bg-slate-50 dark:bg-white/5 border-none rounded-2xl outline-none focus:ring-2 ring-orange-500/20 text-sm font-medium"
                      />
                    </div>
                    <button className="p-3 rounded-2xl bg-slate-50 dark:bg-white/5 text-slate-400 hover:text-orange-500 transition-all">
                      <History size={20} />
                    </button>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-left">
                      <thead>
                        <tr className="border-b border-muted dark:border-white/5">
                          <th className="px-8 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Patron</th>
                          <th className="px-8 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Tier Status</th>
                          <th className="px-8 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400 text-center">Current Points</th>
                          <th className="px-8 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400 text-right">Last Activity</th>
                          <th className="px-8 py-4"></th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-muted dark:divide-white/5">
                        {INITIAL_LOYALTY_CUSTOMERS.filter(c => c.name.toLowerCase().includes(search.toLowerCase())).map((c) => {
                          const tier = TIER_CONFIG[c.tier];
                          return (
                            <tr key={c.id} className="group hover:bg-slate-50 dark:hover:bg-white/5 transition-all cursor-pointer">
                              <td className="px-8 py-5">
                                <p className="font-black text-slate-900 dark:text-white group-hover:text-orange-500 transition-colors uppercase tracking-tight">{c.name}</p>
                                <p className="text-[10px] text-slate-400 font-bold tracking-widest">ID: {c.id.padStart(4, '0')}</p>
                              </td>
                              <td className="px-8 py-5">
                                <span className={clsx("px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest flex items-center gap-1.5 w-fit", tier.bg, tier.color)}>
                                  <tier.icon size={12} />
                                  {tier.label}
                                </span>
                              </td>
                              <td className="px-8 py-5 text-center">
                                <p className="text-lg font-black text-orange-500">{c.points.toLocaleString()}</p>
                              </td>
                              <td className="px-8 py-5 text-right">
                                <div className="flex flex-col items-end">
                                  <p className="text-[11px] font-bold text-slate-600 dark:text-slate-400">{c.lastRedemption}</p>
                                  <p className="text-[9px] text-slate-400 uppercase font-black tracking-widest">Redeemed: ₹{c.totalRedeemed.toLocaleString()}</p>
                                </div>
                              </td>
                              <td className="px-8 py-5 text-right">
                                <button className="p-2 rounded-xl bg-orange-50 dark:bg-orange-900/10 text-orange-500 opacity-0 group-hover:opacity-100 transition-all">
                                  <ArrowRight size={16} />
                                </button>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {activeTab === 'campaigns' && (
                <div className="p-10 text-center space-y-4">
                   <div className="w-20 h-20 rounded-full bg-orange-50 dark:bg-orange-900/10 flex items-center justify-center text-orange-500 mx-auto">
                      <Zap size={40} className="fill-orange-500" />
                   </div>
                   <h3 className="text-xl font-black text-slate-900 dark:text-white">Active Point Multipliers</h3>
                   <p className="text-slate-500 dark:text-slate-400 max-w-sm mx-auto font-medium italic">Configure events that automatically double or triple points for specific menu items or delivery zones.</p>
                   <button className="bg-orange-500 text-white rounded-2xl px-8 py-3.5 font-black text-[10px] uppercase tracking-widest shadow-xl shadow-orange-500/20">Launch Booster Campaign</button>
                </div>
              )}

              {activeTab === 'rewards' && (
                <div className="p-10 text-center space-y-4">
                   <div className="w-20 h-20 rounded-full bg-emerald-50 dark:bg-emerald-900/10 flex items-center justify-center text-emerald-500 mx-auto">
                      <Gift size={40} className="fill-emerald-500" />
                   </div>
                   <h3 className="text-xl font-black text-slate-900 dark:text-white">Redemption Catalog</h3>
                   <p className="text-slate-500 dark:text-slate-400 max-w-sm mx-auto font-medium italic">Define how points are spent. From direct billing discounts to specialized "loyalty-only" secret menu items.</p>
                   <button className="bg-emerald-500 text-white rounded-2xl px-8 py-3.5 font-black text-[10px] uppercase tracking-widest shadow-xl shadow-emerald-500/20">Edit Rewards Catalog</button>
                </div>
              )}
           </div>
        </div>

        {/* Sidebar Cards */}
        <div className="space-y-6">
           {/* Quick Action: Redeem */}
           <div className="bg-slate-900 dark:bg-card p-8 rounded-[40px] text-white space-y-6 border border-white/5 shadow-2xl overflow-hidden relative group">
              <div className="relative z-10">
                <div className="flex items-center gap-2 mb-4">
                  <Gift size={20} className="text-orange-500" />
                  <span className="text-[10px] font-black tracking-[0.2em] text-orange-500 uppercase">IN-STORE REDEEM</span>
                </div>
                <h3 className="text-2xl font-black tracking-tight leading-tight">Instant Points <span className="text-orange-500 italic">Redemption</span></h3>
                <p className="text-slate-400 text-xs mt-3 font-bold leading-relaxed">Enter patron ID or scan QR to apply points directly to current POS session.</p>
                <div className="mt-8 space-y-3">
                   <input 
                    type="text" 
                    placeholder="Enter Patron ID / Phone" 
                    className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-6 text-sm font-bold outline-none focus:ring-2 ring-orange-500/50"
                  />
                  <button className="w-full bg-orange-500 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-orange-400 transition-all active:scale-95 shadow-lg shadow-orange-500/20">
                    Verify & Deduct Points
                  </button>
                </div>
              </div>
              <div className="absolute -right-20 -bottom-20 w-64 h-64 bg-orange-500/10 rounded-full blur-[100px] group-hover:bg-orange-500/20 transition-all duration-1000" />
           </div>

           {/* Insights Card */}
           <div className="bg-white dark:bg-card p-8 rounded-[40px] border border-muted dark:border-white/5 shadow-xl space-y-6">
              <div className="flex items-center justify-between">
                 <h4 className="text-xs font-black uppercase tracking-widest text-slate-400">Churn Risk Analysis</h4>
                 <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
              </div>
              <div className="space-y-4">
                 {[
                   { label: "Lost Revenue Risk", value: "₹24,500", color: "text-red-500" },
                   { label: "Inactive VIPs (30d)", value: "18", color: "text-amber-500" },
                 ].map((stat, i) => (
                   <div key={i} className="flex justify-between items-center bg-slate-50 dark:bg-white/5 p-4 rounded-2xl">
                      <span className="text-[11px] font-bold text-slate-500">{stat.label}</span>
                      <span className={clsx("text-lg font-black", stat.color)}>{stat.value}</span>
                   </div>
                 ))}
              </div>
              <button className="w-full group py-4 border-2 border-slate-100 dark:border-white/5 rounded-2xl text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-orange-500 hover:border-orange-500/20 transition-all flex items-center justify-center gap-2">
                 Run Win-Back Campaign <ChevronRight size={14} className="group-hover:translate-x-1 transition-transform" />
              </button>
           </div>

           {/* Quick Guide */}
           <div className="p-8 rounded-[40px] bg-orange-50 dark:bg-orange-900/10 border border-orange-100 dark:border-orange-800/20">
              <div className="flex items-center gap-3 mb-4">
                 <Clock className="text-orange-600" size={18} />
                 <h4 className="text-[10px] font-black uppercase tracking-widest text-orange-600">Quick Rules</h4>
              </div>
              <ul className="space-y-3">
                 {[
                   "₹10 Spent = 1 Loyalty Point",
                   "10 Points = ₹1 Billing Value",
                   "Points expire after 180 days",
                 ].map((rule, i) => (
                   <li key={i} className="flex items-center gap-2 text-[11px] font-bold text-orange-600/70">
                      <div className="w-1 h-1 rounded-full bg-orange-400" />
                      {rule}
                   </li>
                 ))}
              </ul>
           </div>
        </div>
      </div>
    </div>
  );
}
