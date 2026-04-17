"use client";

import ProfileHero from "@/components/profile/ProfileHero";
import ProfileStats from "@/components/profile/ProfileStats";
import ProfileSectionHeader from "@/components/profile/ProfileSectionHeader";
import ProfileTopBar from "@/components/profile/ProfileTopBar";
import { Plus, Globe, MapPin } from "lucide-react";

export default function AgencyProfilePage() {
  return (
    <div className="min-h-screen bg-[#FDFCFD] dark:bg-[#020617] -m-8 relative">
      {/* Sticky Management Bar */}
      <ProfileTopBar />

      {/* Profile Hero with Cover & Info */}
      <ProfileHero />

      <div className="max-w-[1200px] mx-auto px-10 py-12 space-y-16">
        
        {/* Stats Section */}
        <div className="bg-white dark:bg-slate-900 border border-[#F0EAF0] dark:border-slate-800 rounded-3xl p-8 shadow-sm">
           <h3 className="text-sm font-black text-[#1A1A1A] dark:text-white uppercase tracking-tight mb-6">Profile Stats</h3>
           <ProfileStats />
        </div>

        {/* Projects Section */}
        <div className="space-y-8">
          <ProfileSectionHeader 
            title="Projects" 
            buttonLabel="Add Project" 
            variant="add" 
          />
          <div className="py-20 flex flex-col items-center justify-center text-center space-y-2 border-b border-[#F0EAF0] dark:border-slate-800">
            <p className="text-sm font-bold text-[#666]">No Live Portfolio</p>
          </div>
        </div>

        {/* Services Section */}
        <div className="space-y-8">
          <ProfileSectionHeader 
            title="Services" 
            buttonLabel="Add Service" 
            variant="add" 
          />
          <div className="py-20 flex flex-col items-center justify-center text-center space-y-2 border-b border-[#F0EAF0] dark:border-slate-800">
            <p className="text-sm font-bold text-[#666]">No Live Service</p>
          </div>
        </div>

        {/* About Us Section */}
        <div className="space-y-12 pb-20">
          <ProfileSectionHeader 
            title="About Us" 
            buttonLabel="Edit Details" 
            variant="edit" 
          />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-20 py-10">
            {/* Left: Categories */}
            <div className="space-y-6">
               <button className="w-full md:w-fit px-8 py-3 border-2 border-dashed border-[#F0EAF0] dark:border-slate-800 rounded-xl text-xs font-bold text-[#7C3AED] hover:bg-purple-50 transition-all flex items-center justify-center gap-2">
                  <Plus size={16} /> Add Categories
               </button>
            </div>

            {/* Right: Info */}
            <div className="space-y-8">
               <div className="space-y-2">
                  <div className="flex items-center gap-2 text-[10px] font-black text-[#999] uppercase tracking-widest">
                     <MapPin size={12} /> Address
                  </div>
                  <p className="text-sm font-bold text-[#1A1A1A] dark:text-white">India</p>
               </div>

               <div className="space-y-2">
                  <div className="flex items-center gap-2 text-[10px] font-black text-[#999] uppercase tracking-widest">
                     <Globe size={12} /> Website
                  </div>
                  <a href="https://ikasleinnovations.com/" target="_blank" className="text-sm font-bold text-[#7C3AED] hover:underline flex items-center gap-1">
                     https://ikasleinnovations.com/ <span className="text-xs">↗</span>
                  </a>
               </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
