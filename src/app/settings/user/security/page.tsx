"use client";

import { useState } from "react";
import UserAccountLayout from "@/components/modules/settings/UserAccountLayout";
import api from "@/lib/api";
import { toast } from "react-hot-toast";
import { Eye, EyeOff } from "lucide-react";

export default function UserSecuritySettingsPage() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleUpdatePassword = async () => {
    if (!password) return toast.error("Please enter a new password");
    if (password !== confirmPassword) return toast.error("Passwords do not match");
    if (password.length < 6) return toast.error("Password must be at least 6 characters");

    setLoading(true);
    try {
      await api.patch("/api/me/password", { password });
      toast.success("Password updated successfully");
      setPassword("");
      setConfirmPassword("");
    } catch (error: any) {
      toast.error(error.response?.data?.error || "Failed to update password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <UserAccountLayout>
      <div className="space-y-12">
        <div className="space-y-1">
           <h2 className="text-[17px] font-black text-[#1A1A1A] dark:text-white">Password & Security</h2>
        </div>

        <div className="space-y-12 max-w-5xl">
           {/* Change Password */}
           <div className="flex flex-col gap-6 p-8 bg-white dark:bg-slate-900 border border-[#FDFCFD] dark:border-slate-800 rounded-3xl shadow-sm">
              <div className="space-y-1">
                 <h3 className="text-[15px] font-black text-[#1A1A1A] dark:text-white">Change Password</h3>
                 <p className="text-[12px] font-medium text-[#999]">Update your password frequently to stay secure</p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-600 dark:text-slate-400 uppercase tracking-widest ml-1">New Password</label>
                  <div className="relative">
                    <input 
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full px-4 py-3 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-purple-500/10 focus:border-purple-500 transition-all pr-12"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-purple-600 transition-colors"
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-600 dark:text-slate-400 uppercase tracking-widest ml-1">Confirm Password</label>
                  <div className="relative">
                    <input 
                      type={showConfirmPassword ? "text" : "password"}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full px-4 py-3 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-purple-500/10 focus:border-purple-500 transition-all pr-12"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-purple-600 transition-colors"
                    >
                      {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>
              </div>

              <div className="flex justify-start">
                <button 
                  onClick={handleUpdatePassword}
                  disabled={loading}
                  className="px-8 py-3 bg-[#7C3AED] text-white rounded-xl text-[12px] font-black hover:bg-[#6D28D9] transition-all disabled:opacity-50"
                >
                  {loading ? "Updating..." : "Update Password"}
                </button>
              </div>
           </div>

           {/* Logout All */}
           {/* <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 p-8 bg-white dark:bg-slate-900 border border-[#FDFCFD] dark:border-slate-800 rounded-3xl shadow-sm">
              <div className="space-y-1">
                 <h3 className="text-[15px] font-black text-[#1A1A1A] dark:text-white">Logout from all devices</h3>
                 <p className="text-[12px] font-medium text-[#999]">This will log you out from all the devices you are logged in with</p>
              </div>
              <button className="px-8 py-3 bg-white dark:bg-slate-800 border-2 border-[#FEE2E2] rounded-xl text-[12px] font-black text-[#B91C1C] hover:bg-red-50 transition-all">
                 Logout
              </button>
           </div> */}
        </div>
      </div>
    </UserAccountLayout>
  );
}
