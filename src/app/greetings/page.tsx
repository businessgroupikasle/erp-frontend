"use client";

import { useState } from "react";
import { ChevronRight, Upload, Download, Share2, Plus, Info } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

export default function GreetingsPage() {
  const [greetingType, setGreetingType] = useState("New Year 2026");
  const [businessName, setBusinessName] = useState("Azeez");
  const [message, setMessage] = useState("Happy New Year!");

  const templates = [
    { id: 1, img: "https://images.unsplash.com/photo-1577003833619-76bbd391282d?w=400&q=80" }, // Placeholder for NY 2026
    { id: 2, img: "https://images.unsplash.com/photo-1546768292-fb12f6c92568?w=400&q=80" },
    { id: 3, img: "https://images.unsplash.com/photo-1512428559083-a4051d9ecb8a?w=400&q=80" },
  ];

  return (
    <div className="min-h-screen bg-[#FDFCFD] dark:bg-slate-950 font-sans p-8 pt-6">
      {/* Breadcrumbs */}
      <div className="flex items-center gap-2 text-[10px] font-bold text-[#999] uppercase tracking-widest mb-4">
        <Link href="/" className="hover:text-[#7C3AED]">Azeez</Link>
        <ChevronRight size={10} />
        <span className="text-[#666]">Generate Greetings</span>
      </div>

      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-black text-[#1A1A1A] dark:text-white">Generate Greetings</h1>
        <div className="flex items-center gap-3">
           <button className="flex items-center gap-2 px-5 py-2.5 bg-white border border-[#F0EAF0] rounded-xl text-[13px] font-black text-[#1A1A1A] hover:bg-slate-50 transition-all shadow-sm">
              <Share2 size={16} />
              Share
           </button>
           <button className="flex items-center gap-2 px-6 py-2.5 bg-white border border-[#7C3AED] rounded-xl text-[13px] font-black text-[#7C3AED] hover:bg-purple-50 transition-all shadow-sm">
              <Download size={16} />
              Download Image
           </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* Preview Column */}
        <div className="lg:col-span-7 space-y-8">
           <div className="relative w-full aspect-[16/9] bg-[#FFF8F0] rounded-2xl border border-slate-100 shadow-xl overflow-hidden flex flex-col items-center justify-center p-12 group">
              {/* Complex Greeting Mockup */}
              <div className="relative z-10 text-center space-y-4">
                 <div className="text-[120px] font-black leading-none text-[#C49B3B] drop-shadow-sm select-none">
                    20<br />26
                 </div>
                 <div className="space-y-1">
                    <p className="text-[14px] font-black tracking-[0.3em] uppercase text-[#A67C26]">Happy</p>
                    <p className="text-[28px] font-black uppercase text-[#8B651A]">New Year</p>
                 </div>
              </div>

              {/* Dynamic Overlay Text */}
              <div className="absolute bottom-10 left-10 text-[14px] font-black text-[#8B651A]">{businessName}</div>
              <div className="absolute bottom-10 right-10 text-[10px] font-bold text-[#8B651A]/60 italic tracking-widest">Proud Member of Refrens.com</div>

              {/* Sparkle effects (pseudo) */}
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_#C49B3B10_0%,_transparent_70%)] pointer-events-none" />
           </div>

           {/* Template Selector */}
           <div className="space-y-4 pt-4">
              <p className="text-[13px] font-black text-[#1A1A1A] dark:text-white uppercase tracking-wider">Select Template</p>
              <div className="flex gap-4">
                 {templates.map((tpl) => (
                    <div key={tpl.id} className="w-24 h-16 rounded-lg border-2 border-transparent hover:border-[#7C3AED] cursor-pointer overflow-hidden transition-all grayscale hover:grayscale-0 active:scale-95">
                       <img src={tpl.img} className="w-full h-full object-cover" />
                    </div>
                 ))}
              </div>
           </div>
        </div>

        {/* Form Column */}
        <div className="lg:col-span-5 space-y-10 py-2">
           <div className="space-y-6">
              <div className="space-y-1.5">
                 <label className="text-[13px] font-bold text-[#666]">Select Greeting Type<span className="text-red-500">*</span></label>
                 <select 
                   value={greetingType}
                   onChange={(e) => setGreetingType(e.target.value)}
                   className="w-full px-5 py-3.5 bg-white border border-[#F0EAF0] rounded-2xl text-[14px] font-bold appearance-none shadow-sm focus:ring-1 focus:ring-purple-400"
                 >
                    <option>New Year 2026</option>
                    <option>Diwali 2025</option>
                    <option>Eid Mubarak</option>
                 </select>
              </div>

              <div className="space-y-1.5">
                 <label className="text-[13px] font-bold text-[#666]">Your Business Name<span className="text-red-500">*</span></label>
                 <input 
                   type="text" 
                   value={businessName}
                   onChange={(e) => setBusinessName(e.target.value)}
                   className="w-full px-5 py-3.5 bg-white border border-[#F0EAF0] rounded-2xl text-[14px] font-bold shadow-sm focus:ring-1 focus:ring-purple-400" 
                 />
              </div>

              <div className="space-y-1.5">
                 <label className="text-[13px] font-bold text-[#666]">Message to be sent with the greeting<span className="text-red-500">*</span></label>
                 <input 
                   type="text" 
                   value={message}
                   onChange={(e) => setMessage(e.target.value)}
                   className="w-full px-5 py-3.5 bg-white border border-[#F0EAF0] rounded-2xl text-[14px] font-bold shadow-sm focus:ring-1 focus:ring-purple-400" 
                 />
              </div>

              <div className="space-y-1.5">
                 <label className="text-[13px] font-bold text-[#666]">Your Business Logo</label>
                 <div className="w-24 h-24 rounded-2xl border-2 border-dashed border-[#F0EAF0] flex flex-col items-center justify-center gap-2 cursor-pointer hover:bg-slate-50 transition-all text-[#999]">
                    <Plus size={24} />
                 </div>
              </div>

              <div className="flex items-center gap-3 py-2">
                 <div className="w-4 h-4 rounded border border-slate-300 pointer-events-none" />
                 <span className="text-[12px] font-bold text-[#999]">Remove Refrens Branding</span>
              </div>
           </div>

           <div className="flex items-center gap-4">
              <button className="flex-1 py-4 bg-[#7C3AED] text-white rounded-2xl font-black text-[14px] shadow-lg shadow-purple-500/20 hover:scale-[1.02] active:scale-[0.98] transition-all">
                 Update
              </button>
              <button className="flex-1 py-4 bg-white border border-[#7C3AED] text-[#7C3AED] rounded-2xl font-black text-[14px] shadow-sm flex items-center justify-center gap-2 hover:bg-purple-50 transition-all">
                 <Download size={16} />
                 Download Image
              </button>
           </div>
        </div>
      </div>
    </div>
  );
}
