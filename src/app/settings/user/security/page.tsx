"use client";

import { useState } from "react";
import UserAccountLayout from "@/components/modules/settings/UserAccountLayout";
import { useAuth } from "@/context/AuthContext";
import { ShieldCheck, Loader2, X, Eye, EyeOff } from "lucide-react";
import { userGovernanceApi } from "@/lib/api";

export default function UserSecuritySettingsPage() {
  const { user, logout } = useAuth();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  
  const [passwords, setPasswords] = useState({
    current: "",
    new: "",
    confirm: ""
  });

  const handleLogoutAll = () => {
    if (window.confirm("Are you sure you want to log out from all devices? This will end your current session too.")) {
      logout();
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (passwords.new !== passwords.confirm) {
      alert("New passwords do not match!");
      return;
    }

    if (!user?.id) {
      alert("User identification failed. Please log in again.");
      return;
    }
    
    setIsSaving(true);
    try {
      // Real API call to update password in database
      await userGovernanceApi.resetPassword(user.id, { password: passwords.new });
      
      alert("Password successfully updated in database! Please use your new password for future logins.");
      setIsModalOpen(false);
      setPasswords({ current: "", new: "", confirm: "" });
    } catch (err: any) {
      console.error("Password update failed", err);
      alert(err.response?.data?.error || "Failed to update password. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <UserAccountLayout>
      <div className="space-y-12">
        <div className="space-y-1">
           <h2 className="text-[17px] font-black text-[#1A1A1A] dark:text-white">Password & Security</h2>
        </div>

        <div className="space-y-12 max-w-5xl">
           {/* Change Password Card */}
           <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 p-8 bg-white dark:bg-slate-900 border border-[#F0EAF0] dark:border-slate-800 rounded-3xl shadow-sm transition-all hover:shadow-md">
              <div className="flex items-center gap-4">
                 <div className="w-12 h-12 rounded-2xl bg-purple-50 dark:bg-purple-900/20 flex items-center justify-center text-[#7C3AED]">
                    <ShieldCheck size={24} />
                 </div>
                 <div className="space-y-0.5">
                    <h3 className="text-[15px] font-black text-[#1A1A1A] dark:text-white">Change Password</h3>
                    <p className="text-[12px] font-medium text-[#999]">Update your password frequently to stay secure</p>
                 </div>
              </div>
              <button 
                onClick={() => setIsModalOpen(true)}
                className="px-8 py-3 bg-[#F5F1F5] dark:bg-slate-800 border border-transparent rounded-xl text-[12px] font-black text-[#7C3AED] hover:border-[#7C3AED] transition-all active:scale-95"
              >
                 Change Password
              </button>
           </div>

           {/* Logout All Card */}
           <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 p-8 bg-white dark:bg-slate-900 border border-[#F0EAF0] dark:border-slate-800 rounded-3xl shadow-sm transition-all hover:shadow-md">
              <div className="space-y-1">
                 <h3 className="text-[15px] font-black text-[#1A1A1A] dark:text-white">Logout from all devices</h3>
                 <p className="text-[12px] font-medium text-[#999]">This will log you out from all the devices you are logged in with</p>
              </div>
              <button 
                onClick={handleLogoutAll}
                className="px-8 py-3 bg-red-50 dark:bg-red-900/10 border-2 border-transparent rounded-xl text-[12px] font-black text-[#B91C1C] hover:border-red-200 transition-all active:scale-95"
              >
                 Logout
              </button>
           </div>
        </div>
      </div>

      {/* Change Password Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
           <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-[32px] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
              <div className="p-8 space-y-6">
                 <div className="flex items-center justify-between">
                    <h2 className="text-[20px] font-black text-[#1A1A1A] dark:text-white">Update Password</h2>
                    <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors text-[#999]">
                       <X size={20} />
                    </button>
                 </div>

                 <form onSubmit={handlePasswordChange} className="space-y-5">
                    <div className="space-y-1.5 text-left">
                       <label className="text-[11px] font-black text-[#999] uppercase tracking-wider ml-1">Current Password</label>
                       <div className="relative">
                          <input 
                            type={showPassword ? "text" : "password"} 
                            required
                            value={passwords.current}
                            onChange={(e) => setPasswords({...passwords, current: e.target.value})}
                            className="w-full px-6 py-4 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl text-[14px] font-bold outline-none focus:ring-2 focus:ring-[#7C3AED]/20 transition-all"
                            placeholder="Enter current password"
                          />
                       </div>
                    </div>

                    <div className="space-y-1.5 text-left">
                       <label className="text-[11px] font-black text-[#999] uppercase tracking-wider ml-1">New Password</label>
                       <div className="relative">
                          <input 
                            type={showPassword ? "text" : "password"} 
                            required
                            value={passwords.new}
                            onChange={(e) => setPasswords({...passwords, new: e.target.value})}
                            className="w-full px-6 py-4 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl text-[14px] font-bold outline-none focus:ring-2 focus:ring-[#7C3AED]/20 transition-all"
                            placeholder="Enter new password"
                          />
                          <button 
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#7C3AED]"
                          >
                             {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                          </button>
                       </div>
                    </div>

                    <div className="space-y-1.5 text-left">
                       <label className="text-[11px] font-black text-[#999] uppercase tracking-wider ml-1">Confirm New Password</label>
                       <input 
                         type={showPassword ? "text" : "password"} 
                         required
                         value={passwords.confirm}
                         onChange={(e) => setPasswords({...passwords, confirm: e.target.value})}
                         className="w-full px-6 py-4 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl text-[14px] font-bold outline-none focus:ring-2 focus:ring-[#7C3AED]/20 transition-all"
                         placeholder="Repeat new password"
                       />
                    </div>

                    <div className="pt-2">
                       <button 
                         type="submit"
                         disabled={isSaving}
                         className="w-full py-4 bg-[#7C3AED] hover:bg-[#6D28D9] text-white rounded-2xl font-black text-[14px] shadow-lg shadow-purple-200 transition-all active:scale-[0.98] flex items-center justify-center gap-2"
                       >
                          {isSaving ? <Loader2 size={18} className="animate-spin" /> : null}
                          {isSaving ? "Updating..." : "Update Security Settings"}
                       </button>
                    </div>
                 </form>
              </div>
           </div>
        </div>
      )}
    </UserAccountLayout>
  );
}
