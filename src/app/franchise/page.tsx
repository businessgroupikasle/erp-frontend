"use client";

import { useState, useEffect } from "react";
import { 
  Building2, 
  MapPin, 
  User, 
  Phone, 
  ArrowUpRight, 
  MoreVertical, 
  Plus,
  BarChart3,
  CheckCircle2,
  Clock
} from "lucide-react";
import { clsx } from "clsx";
import api from "@/lib/api";

export default function FranchisePage() {
  const [franchises, setFranchises] = useState<any[]>([]);
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [fRes, rRes] = await Promise.all([
          api.get('/api/franchise'),
          api.get('/api/franchise/requests')
        ]);
        setFranchises(fRes.data);
        setRequests(rRes.data);
      } catch (err) {
        console.error("Failed to fetch franchise data:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  return (
    <div className="max-w-7xl mx-auto space-y-10 pb-20">
      <header className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-black text-foreground tracking-tight">Franchise Command Center</h1>
          <p className="text-muted-foreground font-medium italic">Oversee multi-branch operations, approve stock requests, and monitor growth.</p>
        </div>
        <button className="flex items-center gap-3 bg-zinc-950 text-white px-8 py-4 rounded-3xl font-black shadow-xl shadow-zinc-900/20 hover:scale-105 active:scale-95 transition-all text-sm uppercase tracking-widest">
          <Plus size={20} />
          Register New Outlet
        </button>
      </header>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-3xl border border-muted shadow-sm space-y-1">
          <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest leading-tight">Total Outlets</p>
          <h3 className="text-3xl font-black">{franchises.length} Branches</h3>
        </div>
        <div className="bg-white p-6 rounded-3xl border border-muted shadow-sm space-y-1 border-b-4 border-b-secondary">
          <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest leading-tight">Active Operations</p>
          <h3 className="text-3xl font-black text-secondary">
            {franchises.filter(f => f.status === "ACTIVE").length} / {franchises.length}
          </h3>
        </div>
        <div className="bg-white p-6 rounded-3xl border border-muted shadow-sm space-y-1 border-b-4 border-b-primary">
          <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest leading-tight">Pending Requests</p>
          <h3 className="text-3xl font-black text-primary">
             {requests.filter(r => r.status === "PENDING").length} PO
          </h3>
        </div>
        <div className="bg-white p-6 rounded-3xl border border-muted shadow-sm space-y-1">
          <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest leading-tight">Avg. Daily Sales</p>
          <h3 className="text-3xl font-black">$4,285</h3>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* Franchise List */}
        <div className="lg:col-span-2 space-y-6 text-left">
          <div className="flex items-center justify-between px-2">
            <h3 className="text-xl font-black flex items-center gap-2">
              <Building2 size={22} className="text-primary"/> 
              Branch Network
            </h3>
            <button className="text-primary text-xs font-black uppercase tracking-widest italic">View Performance Map</button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {loading ? (
               <div className="col-span-2 p-20 text-center text-muted-foreground italic">Syncing with global network...</div>
            ) : (
              franchises.map((f) => (
                <div key={f.id} className="bg-white rounded-[2rem] border border-muted shadow-sm hover:shadow-2xl hover:border-primary/20 transition-all overflow-hidden group">
                  <div className="food-gradient h-2 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  <div className="p-8 space-y-6">
                    <div className="flex justify-between items-start">
                       <div className="w-14 h-14 rounded-2xl bg-muted/30 flex items-center justify-center text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary transition-all">
                          <Building2 size={32} />
                       </div>
                       <button className="p-2 text-muted hover:text-foreground"><MoreVertical size={20}/></button>
                    </div>
                    <div>
                       <h4 className="text-xl font-black truncate">{f.name}</h4>
                       <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-1 mt-1 italic">
                          <MapPin size={12} /> {f.location}
                       </p>
                    </div>
                    <div className="pt-6 border-t border-muted flex justify-between items-center">
                       <div>
                          <p className="text-[10px] font-black text-muted-foreground uppercase tracking-tighter leading-none mb-1 text-left">Owner</p>
                          <p className="font-bold text-sm text-left">{f.ownerName}</p>
                       </div>
                       <div className="w-10 h-10 rounded-xl bg-muted/20 flex items-center justify-center text-muted">
                          <ArrowUpRight size={20} />
                       </div>
                    </div>
                  </div>
                </div>
              ))
            )}
            {franchises.length === 0 && !loading && (
               <div className="col-span-2 p-20 bg-muted/10 rounded-[2.5rem] border-2 border-dashed border-muted text-center italic text-muted-foreground">
                  No franchises registered yet. Get started by onboarding your first branch.
               </div>
            )}
          </div>
        </div>

        {/* Stock Request Sidebar */}
        <div className="space-y-6 text-left">
          <h3 className="text-xl font-black px-2 flex items-center gap-2">
            <BarChart3 size={22} className="text-primary"/>
            Critical Requests
          </h3>
          <div className="space-y-4">
            {requests.map((req) => (
              <div key={req.id} className="bg-white p-6 rounded-3xl border border-muted shadow-sm space-y-4 hover:shadow-lg transition-all border-l-4 border-l-primary">
                 <div className="flex justify-between items-start">
                    <div>
                       <h5 className="font-black text-sm italic">{req.franchise?.name}</h5>
                       <p className="text-[10px] font-bold text-muted-foreground uppercase mt-1">Order #{req.id.slice(0,6)}</p>
                    </div>
                    <div className={clsx(
                       "px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest shadow-sm",
                       req.status === "PENDING" ? "bg-amber-100 text-amber-700" : "bg-green-100 text-green-700"
                    )}>
                       {req.status}
                    </div>
                 </div>
                 <div className="space-y-2">
                    {/* Items preview logic here */}
                    <div className="flex items-center gap-2 text-xs font-bold text-muted-foreground italic">
                       <Clock size={12}/> {new Date(req.createdAt).toLocaleDateString()}
                    </div>
                 </div>
                 <button className="w-full py-3 bg-zinc-950 text-white rounded-xl font-black uppercase text-[10px] tracking-widest hover:bg-zinc-800 transition-all">
                    Review Request
                 </button>
              </div>
            ))}
            {requests.length === 0 && (
               <div className="p-10 bg-muted/5 rounded-3xl text-center italic text-muted-foreground text-sm border border-muted/30">
                  All branches are fully stocked. No pending requests.
               </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
