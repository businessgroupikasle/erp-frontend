"use client";

import { LucideIcon, PlayCircle } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { clsx } from "clsx";

interface ActionCardProps {
  title: string;
  description: string;
  image: string;
  actionText: string;
  actionHref: string;
  demoHref?: string;
  variant?: "primary" | "secondary";
}

export default function ActionCard({
  title,
  description,
  image,
  actionText,
  actionHref,
  demoHref,
  variant = "primary"
}: ActionCardProps) {
  return (
    <div className="bg-white dark:bg-[#0A0D14] rounded-2xl border border-[#F0EAF0] dark:border-slate-800 p-6 flex flex-col hover:shadow-xl hover:shadow-purple-100/50 dark:hover:shadow-none transition-all duration-300 group">
      <div className="flex flex-col gap-2 mb-6">
        <h3 className="text-[15px] font-bold text-[#1A1A1A] dark:text-white uppercase tracking-tight">{title}</h3>
        <p className="text-[13px] text-[#666] dark:text-slate-400 font-medium leading-relaxed">
          {description}
        </p>
      </div>

      <div className="relative aspect-[16/10] bg-[#F9F7F9] dark:bg-slate-900 rounded-xl overflow-hidden border border-[#F0EAF0] dark:border-slate-800 mb-6 group-hover:scale-[1.02] transition-transform">
        <Image 
          src={image} 
          alt={title} 
          fill 
          className="object-cover opacity-90 group-hover:opacity-100 transition-opacity"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-white/10 to-transparent" />
      </div>

      <div className="mt-auto space-y-4">
        <Link 
          href={actionHref}
          className="w-full flex items-center justify-center gap-2 py-3 border-2 border-[#7C3AED] text-[#7C3AED] hover:bg-[#7C3AED] hover:text-white rounded-lg font-bold text-[13px] uppercase tracking-wide transition-all active:scale-95"
        >
          <span className="text-lg">+</span>
          {actionText}
        </Link>
        
        {demoHref && (
          <Link 
            href={demoHref}
            className="flex items-center justify-center gap-2 text-[11px] font-bold text-[#999] hover:text-[#7C3AED] transition-colors uppercase tracking-widest group"
          >
            See Demo Video 
            <PlayCircle size={14} className="group-hover:scale-110 transition-transform" />
          </Link>
        )}
      </div>
    </div>
  );
}
