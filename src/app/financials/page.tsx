"use client";

import { useState, useEffect } from "react";
import { 
  BarChart3, 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  PieChart, 
  ArrowUpRight, 
  ArrowDownRight,
  FileText,
  Plus
} from "lucide-react";
import { clsx } from "clsx";
import api from "@/lib/api";

export default function FinancialsPage() {
  const [report, setReport] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPL = async () => {
      try {
        const user = JSON.parse(localStorage.getItem('user') || '{}');
        const response = await api.get(`/api/finance/pl/${user.franchiseId || 'root-franchise'}`);
        setReport(response.data);
      } catch (err) {
        console.error("Failed to fetch P&L report:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchPL();
  }, []);

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-20">
      <header className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-foreground">Financial Accounting</h1>
          <p className="text-muted-foreground font-medium italic">Track every cent of revenue, expenses, and net profit across your ecosystem.</p>
        </div>
        <button className="flex items-center gap-3 bg-zinc-950 text-white px-8 py-4 rounded-2xl font-black shadow-xl shadow-zinc-900/20 hover:scale-105 active:scale-95 transition-all text-sm uppercase tracking-widest">
          <Plus size={20} />
          Add Expense
        </button>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
         {/* Net Revenue */}
         <div className="bg-white p-8 rounded-[2rem] border border-muted shadow-sm space-y-4">
            <div className="flex justify-between items-start">
               <div className="w-14 h-14 rounded-2xl bg-secondary/10 flex items-center justify-center text-secondary">
                  <TrendingUp size={28} />
               </div>
               <span className="flex items-center gap-1 text-secondary text-sm font-black">
                  +12.8% <ArrowUpRight size={14} />
               </span>
            </div>
            <div>
               <p className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] mb-1">Monthly Gross Revenue</p>
               <h3 className="text-3xl font-black text-foreground">${report?.revenue?.toLocaleString() || '12,450'}</h3>
            </div>
         </div>

         {/* Expenses */}
         <div className="bg-white p-8 rounded-[2rem] border border-muted shadow-sm space-y-4">
            <div className="flex justify-between items-start">
               <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
                  <TrendingDown size={28} />
               </div>
               <span className="flex items-center gap-1 text-primary text-sm font-black">
                  -2.4% <ArrowDownRight size={14} />
               </span>
            </div>
            <div>
               <p className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] mb-1">Operational Expenses</p>
               <h3 className="text-3xl font-black text-foreground">${report?.expenses?.toLocaleString() || '4,280'}</h3>
            </div>
         </div>

         {/* Net Profit */}
         <div className="food-gradient p-8 rounded-[2rem] text-white shadow-2xl shadow-primary/30 space-y-4 relative overflow-hidden group">
            <div className="flex justify-between items-start relative z-10">
               <div className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center text-white">
                  <DollarSign size={28} />
               </div>

            </div>
            <div className="relative z-10">
               <p className="text-[10px] font-black text-white/70 uppercase tracking-[0.2em] mb-1">Projected Net Profit</p>
               <h3 className="text-4xl font-black text-white">${report?.netProfit?.toLocaleString() || '8,170'}</h3>
            </div>
            <div className="absolute right-0 bottom-0 opacity-10 group-hover:scale-125 transition-transform duration-700">
               <PieChart size={180} />
            </div>
         </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
         {/* Expense Log */}
         <div className="bg-white rounded-[2.5rem] border border-muted shadow-sm overflow-hidden flex flex-col">
            <div className="p-8 border-b border-muted flex justify-between items-center">
               <h3 className="text-xl font-black">Recent Ledger Entries</h3>
               <button className="text-primary font-black text-xs uppercase tracking-widest flex items-center gap-2">
                  View Full Report <ArrowUpRight size={16} />
               </button>
            </div>
            <div className="p-2 flex-1 overflow-y-auto">
               {[1,2,3,4].map(i => (
                 <div key={i} className="flex items-center justify-between p-6 hover:bg-muted/30 rounded-3xl transition-all border-b border-muted/50 last:border-0 cursor-pointer group">
                    <div className="flex items-center gap-4">
                       <div className="w-12 h-12 rounded-2xl bg-muted/50 flex items-center justify-center text-muted-foreground group-hover:bg-primary group-hover:text-white transition-all">
                          <FileText size={20} />
                       </div>
                       <div>
                          <p className="font-bold text-foreground">Marketing & Ads</p>
                          <p className="text-[10px] font-bold text-muted-foreground uppercase">Social Media Campaign • April 12</p>
                       </div>
                    </div>
                    <p className="font-black text-primary text-lg">-$450.00</p>
                 </div>
               ))}
            </div>
         </div>

         {/* Financial Distribution */}
         <div className="bg-zinc-950 text-white rounded-[2.5rem] p-10 shadow-2xl relative overflow-hidden flex flex-col justify-between">
            <div className="relative z-10">
               <h3 className="text-2xl font-black mb-8 underline decoration-primary decoration-4 underline-offset-8">Cost Distribution</h3>
               <div className="space-y-8">
                  <div className="space-y-2">
                     <div className="flex justify-between items-end mb-1">
                        <span className="text-sm font-black text-zinc-500 uppercase tracking-widest leading-none">Food Cost (COGS)</span>
                        <span className="font-black text-xl">32%</span>
                     </div>
                     <div className="w-full bg-zinc-800 h-1.5 rounded-full">
                        <div className="bg-primary h-full w-[32%] rounded-full shadow-[0_0_10px_rgba(249,115,22,0.5)]"></div>
                     </div>
                  </div>
                  <div className="space-y-2">
                     <div className="flex justify-between items-end mb-1">
                        <span className="text-sm font-black text-zinc-500 uppercase tracking-widest leading-none">Labor Cost</span>
                        <span className="font-black text-xl">18%</span>
                     </div>
                     <div className="w-full bg-zinc-800 h-1.5 rounded-full">
                        <div className="bg-secondary h-full w-[18%] rounded-full shadow-[0_0_10px_rgba(34,197,94,0.5)]"></div>
                     </div>
                  </div>
                  <div className="space-y-2">
                     <div className="flex justify-between items-end mb-1">
                        <span className="text-sm font-black text-zinc-500 uppercase tracking-widest leading-none">Fixed Overheads</span>
                        <span className="font-black text-xl">12%</span>
                     </div>
                     <div className="w-full bg-zinc-800 h-1.5 rounded-full">
                        <div className="bg-accent h-full w-[12%] rounded-full shadow-[0_0_10px_rgba(234,179,8,0.5)]"></div>
                     </div>
                  </div>
               </div>
            </div>

            <div className="pt-10 relative z-10">
               <div className="bg-zinc-900 rounded-3xl p-6 border border-zinc-800/50">
                  <p className="text-xs text-zinc-500 font-bold mb-4 uppercase tracking-widest">Tax Provision (GST 5%)</p>
                  <div className="flex justify-between items-center px-2">
                     <h4 className="text-2xl font-black italic">$622.50</h4>
                     <button className="bg-primary p-2 rounded-lg text-white"><ArrowUpRight size={18} /></button>
                  </div>
               </div>
            </div>
            
            <div className="absolute -right-10 top-0 opacity-5 pointer-events-none">
               <BarChart3 size={240} />
            </div>
         </div>
      </div>
    </div>
  );
}

function CheckCircle({ size, className }: { size: number, className: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
  );
}
