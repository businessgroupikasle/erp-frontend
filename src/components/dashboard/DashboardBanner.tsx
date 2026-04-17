"use client";

import { X, Sparkles } from "lucide-react";
import { useState } from "react";

export default function DashboardBanner() {
  const [isVisible, setIsVisible] = useState(true);

  if (!isVisible) return null;

  return (
    <div className="relative w-full bg-[#522A7F] text-white py-2 px-4 flex items-center justify-center gap-4 group transition-all">
      <div className="flex items-center gap-2 overflow-hidden whitespace-nowrap">
        <span className="text-[10px] font-black uppercase tracking-widest bg-white/20 px-2 py-0.5 rounded shadow-sm">Offer Ending Soon</span>
        <span className="text-xs font-bold tracking-tight">
          <span className="text-[#FFEB3B]">25% off</span> on Quarterly/Annual Plans • Use Code: <span className="font-mono bg-black/20 px-1.5 py-0.5 rounded">INDIAFRESH25</span>
        </span>
      </div>
      
      <button className="bg-white text-[#522A7F] text-[10px] font-black uppercase tracking-widest px-4 py-1 rounded-md hover:bg-slate-100 transition-colors shadow-lg active:scale-95">
        Upgrade Now
      </button>

      <button 
        onClick={() => setIsVisible(false)}
        className="absolute right-4 text-white/60 hover:text-white transition-colors"
      >
        <X size={16} />
      </button>
    </div>
  );
}
