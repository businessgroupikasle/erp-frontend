"use client";

import { Play, Plus, Upload, FileText, Image as ImageIcon } from "lucide-react";
import { clsx } from "clsx";

interface RefrensEmptyStateProps {
  title: string;
  description: string;
  type?: "video" | "illustration";
  primaryAction: {
    label: string;
    onAction?: () => void;
  };
  secondaryAction?: {
    label: string;
    onAction?: () => void;
  };
}

export default function RefrensEmptyState({
  title,
  description,
  type = "video",
  primaryAction,
  secondaryAction
}: RefrensEmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] px-4 animate-in fade-in duration-700">
      <div className="bg-white dark:bg-slate-900 border border-[#F0EAF0] dark:border-slate-800 rounded-3xl p-8 max-w-xl w-full text-center shadow-2xl shadow-purple-200/20 space-y-8">
        {/* Title & Description */}
        <div className="space-y-3">
          <h2 className="text-2xl font-black text-[#1A1A1A] dark:text-white uppercase tracking-tight">{title}</h2>
          <p className="text-sm text-[#666] dark:text-slate-400 font-medium leading-relaxed max-w-sm mx-auto">
            {description}
          </p>
        </div>

        {/* Media Placeholder */}
        <div className="relative w-full aspect-video rounded-2xl overflow-hidden bg-[#2D3748] shadow-lg group cursor-pointer border border-[#F0EAF0] dark:border-slate-800">
          {type === "video" ? (
             <div className="absolute inset-0 flex flex-col items-center justify-center space-y-4">
                <div className="w-16 h-16 rounded-full border-4 border-white flex items-center justify-center bg-white/10 group-hover:scale-110 transition-transform duration-300">
                   <Play size={32} className="text-white fill-white" />
                </div>
                <span className="text-sm font-bold text-white uppercase tracking-widest opacity-80 group-hover:opacity-100 transition-opacity">Watch Demo Video</span>
             </div>
          ) : (
             <div className="absolute inset-0 flex flex-col items-center justify-center space-y-4 bg-slate-50 dark:bg-slate-800">
                <ImageIcon size={64} className="text-[#DDD] dark:text-slate-700" />
                <div className="h-2 w-32 bg-slate-100 dark:bg-slate-700 rounded-full" />
                <div className="h-2 w-24 bg-slate-100 dark:bg-slate-700 rounded-full opacity-50" />
             </div>
          )}
          {/* Subtle Glow Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent group-hover:from-black/10 transition-all duration-300" />
        </div>

        {/* Actions */}
        <div className="flex flex-col items-center gap-4 pt-4">
          <button 
            onClick={primaryAction.onAction}
            className="w-full py-4 bg-[#7C3AED] text-white rounded-xl font-black text-sm shadow-xl shadow-purple-200/50 hover:bg-purple-700 transition-all active:scale-95 flex items-center justify-center gap-2"
          >
            <Plus size={18} /> {primaryAction.label}
          </button>
          
          {secondaryAction && (
             <button 
                onClick={secondaryAction.onAction}
                className="flex items-center gap-2 text-[11px] font-black text-[#999] hover:text-[#7C3AED] transition-colors uppercase tracking-[0.2em]"
             >
                <Upload size={14} /> {secondaryAction.label}
             </button>
          )}
        </div>
      </div>

      {/* Footer Branding (Optional matching Refrens style) */}
      <div className="pt-20 flex flex-col items-center gap-6 opacity-60">
         <div className="flex items-center gap-2 text-[10px] font-bold text-[#999] uppercase tracking-widest">
            Download our app 
            <div className="flex gap-1.5 ml-2">
               <div className="w-5 h-5 bg-slate-200 rounded-md" />
               <div className="w-5 h-5 bg-slate-200 rounded-md" />
            </div>
         </div>
         <div className="flex items-center gap-8 text-[11px] font-bold text-[#AAA] transition-colors uppercase tracking-[0.1em]">
            <span className="hover:text-[#7C3AED] cursor-pointer">Reach out to us for any help</span>
            <span className="hover:text-[#7C3AED] cursor-pointer underline">+91 91040 43038</span>
            <span className="hover:text-[#7C3AED] cursor-pointer flex items-center gap-1.5 underline">
               Care@Refrens.com
            </span>
            <span className="hover:text-[#7C3AED] cursor-pointer">FAQs</span>
         </div>
         <p className="text-[10px] text-[#BBB] pt-4">This site is protected by reCAPTCHA and the Google Privacy Policy and Terms of Service apply.</p>
      </div>
    </div>
  );
}
