"use client";

import React, { useState, useEffect } from "react";
import UserAccountLayout from "@/components/modules/settings/UserAccountLayout";
import { Camera, Pencil, Check, Loader2 } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

export default function UserProfileSettingsPage() {
  const { user, refreshUser } = useAuth();
  
  const [formData, setFormData] = useState({
    name: "Ikasle Business Group",
    email: "businessgroupikasle@gmail.com",
    phone: "78451-32962",
    country: "India",
    refrensKey: "ikasle-business-group725538"
  });

  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "success">("idle");

  useEffect(() => {
    if (user) {
      setFormData(prev => ({
        ...prev,
        name: user.fullName || prev.name,
        email: user.email || prev.email,
      }));
    }
  }, [user]);

  const handleSave = async () => {
    setIsSaving(true);
    setSaveStatus("saving");
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 800));
    
    // Update local storage for User Profile
    const updatedUser = { ...user, fullName: formData.name, email: formData.email };
    localStorage.setItem('user', JSON.stringify(updatedUser));
    
    // ALSO update Business Branding (to affect Sidebar/Home)
    const savedCompany = localStorage.getItem("erp_company_settings");
    const existingData = savedCompany ? JSON.parse(savedCompany) : {};
    
    const companySettings = {
      ...existingData,
      name: formData.name,
      email: formData.email,
      phone: formData.phone
    };
    localStorage.setItem('erp_company_settings', JSON.stringify(companySettings));
    
    // Notify all components (Sidebar, Header, etc)
    window.dispatchEvent(new Event("erp_settings_updated"));
    
    if (refreshUser) {
      await refreshUser();
    }

    setIsSaving(false);
    setSaveStatus("success");
    setTimeout(() => setSaveStatus("idle"), 3000);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  return (
    <UserAccountLayout>
      <div className="space-y-12">
        <div className="space-y-1">
           <h2 className="text-[17px] font-black text-[#1A1A1A] dark:text-white">Personal Information</h2>
        </div>

        <div className="space-y-8 max-w-5xl">
           {/* Profile Header */}
           <div className="flex items-center gap-6">
              <div className="relative w-24 h-24 bg-slate-200 rounded-full flex items-center justify-center border-4 border-white shadow-sm overflow-hidden group">
                 <div className="text-[10px] text-[#999] font-black uppercase">No Image</div>
                 <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 flex items-center justify-center cursor-pointer transition-opacity">
                    <Camera size={20} className="text-white" />
                 </div>
                 <div className="absolute bottom-1 right-1 w-6 h-6 bg-white rounded-full flex items-center justify-center shadow-md cursor-pointer border border-slate-100">
                    <Camera size={12} className="text-slate-600" />
                 </div>
              </div>
              <div className="space-y-0.5">
                 <h3 className="text-[15px] font-black text-[#1A1A1A] dark:text-white">{formData.name}</h3>
                 <p className="text-[12px] font-bold text-[#999]">{user?.role || "Super Admin"}</p>
                 <p className="text-[11px] font-medium text-[#7C3AED]">Azeez</p>
              </div>
           </div>

           {/* Form Grid */}
           <div className="grid grid-cols-2 gap-8">
              <div className="space-y-6">
                 <div className="space-y-1.5">
                    <label className="text-[12px] font-bold text-[#666]">Name</label>
                    <input 
                      type="text" 
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      className="w-full px-4 py-3 bg-white dark:bg-slate-900 border border-[#F0EAF0] dark:border-slate-800 rounded-xl text-[14px] font-medium text-[#1A1A1A] dark:text-white focus:ring-2 focus:ring-purple-400 outline-none transition-all" 
                    />
                 </div>
                 <div className="space-y-1.5">
                    <label className="text-[12px] font-bold text-[#666]">Country</label>
                    <div className="relative">
                       <select 
                         name="country"
                         value={formData.country}
                         onChange={handleChange}
                         className="w-full px-4 py-3 bg-white dark:bg-slate-900 border border-[#F0EAF0] dark:border-slate-800 rounded-xl text-[14px] font-medium text-[#1A1A1A] dark:text-white appearance-none outline-none focus:ring-2 focus:ring-purple-400 transition-all"
                       >
                          <option>India</option>
                          <option>USA</option>
                          <option>UK</option>
                       </select>
                    </div>
                 </div>
              </div>

              <div className="space-y-6">
                 <div className="space-y-1.5">
                    <label className="text-[12px] font-bold text-[#666]">Email</label>
                    <input 
                       type="email" 
                       name="email"
                       value={formData.email}
                       onChange={handleChange}
                       className="w-full px-4 py-3 bg-white dark:bg-slate-900 border border-[#F0EAF0] dark:border-slate-800 rounded-xl text-[14px] font-medium text-[#1A1A1A] dark:text-white focus:ring-2 focus:ring-purple-400 outline-none transition-all" 
                    />
                 </div>
                 <div className="space-y-1.5">
                    <label className="text-[12px] font-bold text-[#666]">Phone</label>
                    <div className="flex items-center gap-3 px-4 py-3 bg-white dark:bg-slate-900 border border-[#F0EAF0] dark:border-slate-800 rounded-xl focus-within:ring-2 focus-within:ring-purple-400 transition-all">
                       <span className="text-[14px] opacity-70">🇮🇳</span>
                       <span className="text-[14px] font-bold text-[#999] dark:text-slate-500">+91</span>
                       <input 
                         type="text" 
                         name="phone"
                         value={formData.phone}
                         onChange={handleChange}
                         className="flex-1 bg-transparent border-none p-0 text-[14px] font-medium text-[#1A1A1A] dark:text-white focus:ring-0 outline-none" 
                       />
                    </div>
                 </div>
              </div>
           </div>

           <div className="space-y-1.5">
              <label className="text-[12px] font-bold text-[#666] flex items-center gap-2">
                 Active Refrens Key 
                 <span className="w-4 h-4 rounded-full border border-slate-300 flex items-center justify-center text-[10px] text-[#999] cursor-help" title="Reference key for business identity">?</span>
              </label>
              <select 
                name="refrensKey"
                value={formData.refrensKey}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-white dark:bg-slate-900 border border-[#F0EAF0] dark:border-slate-800 rounded-xl text-[14px] font-medium text-[#1A1A1A] dark:text-white appearance-none outline-none focus:ring-2 focus:ring-purple-400 transition-all"
              >
                 <option>ikasle-business-group725538</option>
                 <option>secondary-ref-992384</option>
              </select>
           </div>

           <div className="flex justify-end pt-4">
              <button 
                onClick={handleSave}
                disabled={isSaving}
                className={`px-10 py-3 rounded-xl font-black text-[13px] transition-all flex items-center gap-2 active:scale-95 ${
                  saveStatus === "success" 
                    ? "bg-emerald-100 text-emerald-600" 
                    : "bg-[#E9D5FF] text-[#7C3AED] hover:bg-[#D8B4FE]"
                }`}
              >
                 {saveStatus === "saving" && <Loader2 size={16} className="animate-spin" />}
                 {saveStatus === "success" && <Check size={16} />}
                 {saveStatus === "saving" ? "Saving..." : saveStatus === "success" ? "Saved!" : "Save Changes"}
              </button>
           </div>

           {/* Public Identity Section */}
           <div className="pt-10 space-y-6 border-t border-[#F0EAF0] dark:border-slate-800">
              <div className="space-y-1">
                 <h4 className="text-[14px] font-black text-[#1A1A1A] dark:text-white">Your Public Identity</h4>
                 <p className="text-[11px] font-medium text-[#999]">Choose how your activity - new follows, shares and more will be shown to your followers. Hide any business association that you don't want to be shown publicly.</p>
              </div>

              <div className="flex items-center justify-between">
                 <div className="flex items-center gap-4">
                    <p className="text-[12px] font-bold text-[#666] dark:text-slate-400">Default Identity</p>
                    <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-full">
                       <div className="w-6 h-6 bg-slate-200 dark:bg-slate-700 rounded-full" />
                       <span className="text-[12px] font-black text-[#1A1A1A] dark:text-white">Ikasle</span>
                    </div>
                 </div>
                 <button className="flex items-center gap-2 text-[12px] font-bold text-[#7C3AED] group">
                    <Pencil size={14} className="group-hover:scale-110 transition-transform" />
                    Edit
                 </button>
              </div>
           </div>
        </div>
      </div>
    </UserAccountLayout>
  );
}
