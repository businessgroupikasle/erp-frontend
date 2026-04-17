"use client";

import { useState, useEffect } from "react";
import { 
  Truck, 
  Clock, 
  CheckCircle2, 
  MapPin, 
  Phone,
  Search,
  User,
  ShieldCheck
} from "lucide-react";
import { clsx } from "clsx";
import api from "@/lib/api";

export default function DeliveryPage() {
  const [deliveries, setDeliveries] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDeliveries = async () => {
      try {
        const response = await api.get('/api/delivery/active');
        setDeliveries(response.data);
      } catch (err) {
        console.error("Failed to fetch deliveries:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchDeliveries();
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "DELIVERED": return "bg-green-100 text-green-700";
      case "IN_TRANSIT": return "bg-blue-100 text-blue-700";
      case "ASSIGNED": return "bg-amber-100 text-amber-700";
      default: return "bg-gray-100 text-gray-700";
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      <header className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Logistics & Delivery</h1>
          <p className="text-muted-foreground">Track live orders, manage riders, and verify successful handovers.</p>
        </div>
        <div className="flex gap-4">
          <div className="bg-white p-4 rounded-2xl border border-muted shadow-sm flex items-center gap-3">
             <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                <Truck size={20} />
             </div>
             <div>
                <p className="text-[10px] font-bold text-muted-foreground uppercase">Active Riders</p>
                <p className="text-lg font-bold">12 Online</p>
             </div>
          </div>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Live Tracking List */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-xl">Active Shipments</h3>
            <div className="relative w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
              <input type="text" placeholder="Search orders..." className="w-full pl-10 pr-4 py-2 bg-white border border-muted rounded-xl text-sm" />
            </div>
          </div>

          {loading ? (
             <div className="p-20 text-center text-muted-foreground">Loading deliveries...</div>
          ) : (
            <div className="space-y-4">
              {deliveries.map((order) => (
                <div key={order.id} className="bg-white p-6 rounded-3xl border border-muted hover:shadow-lg transition-all flex items-center justify-between">
                  <div className="flex items-center gap-6">
                    <div className={clsx("w-14 h-14 rounded-2xl flex items-center justify-center", getStatusColor(order.status))}>
                      {order.status === "DELIVERED" ? <ShieldCheck size={28} /> : <Truck size={28} />}
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-bold text-lg">Order #{order.transaction?.invoiceNum || order.id.slice(0,8)}</h4>
                        <span className={clsx("text-[10px] font-black px-2 py-0.5 rounded uppercase", getStatusColor(order.status))}>
                          {order.status}
                        </span>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1"><User size={14} /> {order.riderName || 'Seeking Rider'}</span>
                        <span className="flex items-center gap-1"><MapPin size={14} /> 2.4km away</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-6">
                    <div className="text-right">
                       <p className="text-xs font-bold text-muted-foreground uppercase opacity-50 mb-1">Customer</p>
                       <p className="font-bold text-sm flex items-center gap-2"><Phone size={14} className="text-primary"/> {order.customerPhone}</p>
                    </div>
                    <button className="px-6 py-3 bg-muted/30 rounded-2xl font-bold text-xs hover:bg-muted transition-all">
                      View Map
                    </button>
                  </div>
                </div>
              ))}
              {deliveries.length === 0 && (
                 <div className="p-20 bg-muted/10 rounded-3xl border-2 border-dashed border-muted text-center italic text-muted-foreground">
                    No active deliveries at the moment.
                 </div>
              )}
            </div>
          )}
        </div>

        {/* Dispatch Overview */}
        <div className="space-y-6">
           <div className="bg-zinc-950 text-white p-8 rounded-[2rem] shadow-xl space-y-6 relative overflow-hidden">
              <div className="relative z-10">
                <h3 className="text-xl font-bold mb-2">Performance</h3>
                <p className="text-zinc-400 text-sm mb-6">Real-time logistics efficiency</p>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-zinc-500">Avg. Time</span>
                    <span className="font-bold">24 mins</span>
                  </div>
                  <div className="w-full bg-zinc-800 h-1 rounded-full overflow-hidden">
                    <div className="bg-primary h-full w-[85%]"></div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-zinc-500">Success Rate</span>
                    <span className="font-bold">99.2%</span>
                  </div>
                  <div className="w-full bg-zinc-800 h-1 rounded-full overflow-hidden">
                    <div className="bg-secondary h-full w-[99%]"></div>
                  </div>
                </div>
              </div>
              <div className="absolute -right-10 -bottom-10 opacity-10">
                 <Truck size={160} />
              </div>
           </div>

           <div className="bg-white p-6 rounded-[2rem] border border-muted space-y-4">
              <h3 className="font-bold px-2">Recent Fleet Activity</h3>
              <div className="space-y-3">
                 {[1,2,3].map(i => (
                   <div key={i} className="flex items-center gap-3 p-3 hover:bg-muted/30 rounded-2xl transition-all cursor-pointer">
                      <div className="w-10 h-10 rounded-full bg-secondary/10 text-secondary flex items-center justify-center font-bold">R</div>
                      <div className="flex-1 min-w-0">
                         <p className="text-sm font-bold truncate">Rider #{i*152}</p>
                         <p className="text-[10px] text-muted-foreground font-medium uppercase">Active • 12 Orders today</p>
                      </div>
                      <ChevronRight size={16} className="text-muted" />
                   </div>
                 ))}
              </div>
           </div>
        </div>
      </div>
    </div>
  );
}

function ChevronRight({ size, className }: { size: number, className: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="m9 18 6-6-6-6"/></svg>
  );
}
