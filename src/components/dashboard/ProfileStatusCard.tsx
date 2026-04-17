"use client";

import Link from "next/link";
import Image from "next/image";

export default function ProfileStatusCard() {
  return (
    <div className="bg-white dark:bg-[#0A0D14] rounded-2xl border border-[#F0EAF0] dark:border-slate-800 p-8 flex flex-col md:flex-row gap-8 items-center max-w-4xl hover:shadow-xl transition-all duration-500">
      <div className="flex-1 space-y-4">
        <h3 className="text-lg font-bold text-[#1A1A1A] dark:text-white">Complete Your Profile</h3>
        <p className="text-sm text-[#666] dark:text-slate-400 font-medium leading-relaxed max-w-sm">
          Showcase your expertise by completing your profile for a strong professional presence.
        </p>
        
        <div className="pt-4 space-y-4">
          <Link 
            href="/settings/profile"
            className="inline-block px-10 py-3 border-2 border-[#7C3AED] text-[#7C3AED] hover:bg-[#7C3AED] hover:text-white rounded-lg font-bold text-[13px] uppercase tracking-wide transition-all active:scale-95"
          >
            Complete Your Profile
          </Link>
          
          <Link 
            href="#"
            className="flex items-center gap-2 text-[11px] font-bold text-[#999] hover:text-[#7C3AED] transition-colors uppercase tracking-widest"
          >
            See How 
             <span className="text-lg">↗</span>
          </Link>
        </div>
      </div>

      <div className="w-full md:w-80 aspect-[4/3] relative rounded-2xl overflow-hidden border border-[#F0EAF0] dark:border-slate-800 shadow-2xl shadow-purple-200/20">
        <Image 
          src="/Complete Your Profile.webp" 
          alt="Profile Preview" 
          fill 
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-transparent" />
      </div>
    </div>
  );
}
