"use client";

import { useState } from "react";
import SettingsLayout from "@/components/modules/settings/SettingsLayout";
import { Upload, Mail, Phone, MapPin, Building2, Globe, Save } from "lucide-react";

export default function GeneralSettingsPage() {
  const [companyData, setCompanyData] = useState({
    name: "Kiddos Food",
    email: "contact@kiddosfood.com",
    phone: "+91 98765 43210",
    address: "123 Food Street, Industrial Area, Bangalore - 560001",
    logo: null
  });

  const [isSaving, setIsSaving] = useState(false);

  const handleSave = () => {
    setIsSaving(true);
    setTimeout(() => setIsSaving(false), 1500);
  };

  const SectionHeader = ({ title }: { title: string }) => {
    const isExpanded = expandedSections.includes(title);
    return (
      <button 
        onClick={() => toggleSection(title)}
        className="w-full flex items-center justify-between py-4 group"
      >
        <div className="flex items-center gap-3">
           {isExpanded ? <ChevronUp size={18} className="text-[#1A1A1A] dark:text-white" /> : <ChevronDown size={18} className="text-[#999]" />}
           <h3 className={clsx(
             "text-[15px] font-black transition-colors",
             isExpanded ? "text-[#1A1A1A] dark:text-white" : "text-[#666] dark:text-slate-400 group-hover:text-[#1A1A1A] dark:hover:text-white"
           )}>{title}</h3>
        </div>
      </button>
    );
  };

  return (
    <SettingsLayout categoryTitle="General Settings">
      <div className="max-w-4xl space-y-10">
        <div className="flex items-center justify-between">
           <div>
              <h2 className="text-[17px] font-black text-[#1A1A1A] dark:text-white">General Settings</h2>
              <p className="text-[12px] font-medium text-[#999] mt-1">Manage your company's public identity and contact details.</p>
           </div>
           <button 
             onClick={handleSave}
             className="px-6 py-2.5 bg-[#7C3AED] hover:bg-[#6D28D9] text-white rounded-xl font-bold text-[13px] flex items-center gap-2 transition-all active:scale-95 shadow-lg shadow-purple-200/50"
           >
              {isSaving ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Save size={16} />}
              {isSaving ? "Saving..." : "Save Changes"}
           </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
           {/* Sidebar: Logo Upload */}
           <div className="space-y-4">
              <label className="text-[11px] font-black text-[#999] uppercase tracking-widest">Company Logo</label>
              <div className="aspect-square w-full bg-slate-50 dark:bg-slate-800/50 rounded-3xl border-2 border-dashed border-[#F0EAF0] dark:border-slate-800 flex flex-col items-center justify-center p-6 group cursor-pointer hover:border-[#7C3AED]/30 transition-all">
                 <div className="w-16 h-16 rounded-2xl bg-white dark:bg-slate-900 shadow-sm flex items-center justify-center text-[#7C3AED] group-hover:scale-110 transition-transform">
                    <Upload size={24} />
                 </div>
                 <p className="text-[12px] font-bold text-[#666] mt-4">Upload Logo</p>
                 <p className="text-[10px] text-[#999] mt-1 text-center font-medium">PNG, JPG or SVG (Max. 2MB)</p>
              </div>
           </div>

           {/* Main Form Fields */}
           <div className="md:col-span-2 space-y-8">
              <div className="grid grid-cols-1 gap-6">
                 <div>
                    <label className="flex items-center gap-2 text-[11px] font-black text-[#999] uppercase tracking-widest mb-2">
                       <Building2 size={14} className="text-[#7C3AED]" /> Company Name
                    </label>
                    <input 
                      type="text" 
                      defaultValue={companyData.name}
                      className="w-full px-5 py-3.5 bg-white dark:bg-slate-900 border border-[#F0EAF0] dark:border-slate-800 rounded-2xl text-[14px] font-medium focus:ring-4 focus:ring-purple-500/5 focus:border-[#7C3AED] transition-all outline-none"
                      placeholder="Enter company name"
                    />
                 </div>

                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                       <label className="flex items-center gap-2 text-[11px] font-black text-[#999] uppercase tracking-widest mb-2">
                          <Mail size={14} className="text-[#7C3AED]" /> Email Address
                       </label>
                       <input 
                         type="email" 
                         defaultValue={companyData.email}
                         className="w-full px-5 py-3.5 bg-white dark:bg-slate-900 border border-[#F0EAF0] dark:border-slate-800 rounded-2xl text-[14px] font-medium focus:ring-4 focus:ring-purple-500/5 focus:border-[#7C3AED] transition-all outline-none"
                         placeholder="email@example.com"
                       />
                    </div>
                    <div>
                       <label className="flex items-center gap-2 text-[11px] font-black text-[#999] uppercase tracking-widest mb-2">
                          <Phone size={14} className="text-[#7C3AED]" /> Phone Number
                       </label>
                       <input 
                         type="text" 
                         defaultValue={companyData.phone}
                         className="w-full px-5 py-3.5 bg-white dark:bg-slate-900 border border-[#F0EAF0] dark:border-slate-800 rounded-2xl text-[14px] font-medium focus:ring-4 focus:ring-purple-500/5 focus:border-[#7C3AED] transition-all outline-none"
                         placeholder="+91 00000 00000"
                       />
                    </div>
                 </div>

                 <div>
                    <label className="flex items-center gap-2 text-[11px] font-black text-[#999] uppercase tracking-widest mb-2">
                       <MapPin size={14} className="text-[#7C3AED]" /> Business Address
                    </label>
                    <textarea 
                      defaultValue={companyData.address}
                      rows={4}
                      className="w-full px-5 py-3.5 bg-white dark:bg-slate-900 border border-[#F0EAF0] dark:border-slate-800 rounded-2xl text-[14px] font-medium focus:ring-4 focus:ring-purple-500/5 focus:border-[#7C3AED] transition-all outline-none resize-none"
                      placeholder="Enter full business address"
                    />
                 </div>
              </div>

              <div className="pt-6 border-t border-[#F0EAF0] dark:border-slate-800">
                 <div className="p-5 bg-blue-50/50 dark:bg-blue-900/10 rounded-2xl border border-blue-100 dark:border-blue-800/30">
                    <p className="text-[12px] font-bold text-blue-600 dark:text-blue-400">
                       💡 These details will appear on all your invoices, purchase orders, and official documents.
                    </p>
                 </div>
              </div>
           </div>
        </div>
      </div>
    </SettingsLayout>
  );
}
