"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Lock, User, Loader2 } from "lucide-react";
import Image from "next/image";
import api from "@/lib/api";
import { useAuth } from "@/context/AuthContext";

export default function LoginPage() {
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();
  const { login } = useAuth();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await api.post("/api/auth/login", { identifier, password });
      const { accessToken, refreshToken, user } = response.data;
      
      login(accessToken, refreshToken, user);
      
      // Role-Based Redirection Logic
      const role = user.role.name || user.role;
      const roleLower = role.toLowerCase();
      
      if (roleLower === 'super_admin') {
        router.push("/");
      } else if (roleLower === 'admin') {
        router.push("/");
      } else if (roleLower === 'staff') {
        router.push("/pos");
      } else {
        router.push("/");
      }
    } catch (err: any) {
      setError(err.response?.data?.message || err.response?.data?.error || "Authorization failed. Check credentials.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex shadow-inner items-center justify-center p-4">
      <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 p-8 space-y-8">
        <div className="text-center space-y-4">
          <div className="flex justify-center mb-6">
            <div className="bg-orange-500 text-white p-4 rounded-xl shadow-lg border border-orange-400 font-black italic tracking-tighter text-2xl">
               KIDDOS FOOD
            </div>
          </div>
          <h1 className="text-3xl font-black tracking-tighter text-slate-900 dark:text-white uppercase">
            Control Portal
          </h1>
          <p className="text-slate-500 dark:text-slate-400 font-medium italic">Integrated Food Enterprise Management</p>
        </div>

        {error && (
          <div className="bg-red-50 dark:bg-red-950/30 text-red-600 dark:text-red-400 p-4 rounded-xl text-sm font-bold border border-red-100 dark:border-red-900/50 italic animate-shake">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-6">
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase text-slate-400 dark:text-slate-500 tracking-[0.2em] pl-1">Identification</label>
            <div className="relative">
              <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500" size={18} />
              <input 
                type="text" 
                required
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                className="w-full pl-12 pr-4 py-4 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl focus:ring-4 focus:ring-orange-500/10 focus:border-orange-500 transition-all underline-offset-4 outline-none font-medium dark:text-white" 
                placeholder="admin@kiddosfood.com"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase text-slate-400 dark:text-slate-500 tracking-[0.2em] pl-1">Access Token</label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500" size={18} />
              <input 
                type="password" 
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-12 pr-4 py-4 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl focus:ring-4 focus:ring-orange-500/10 focus:border-orange-500 transition-all outline-none font-medium dark:text-white" 
                placeholder="••••••••" 
              />
            </div>
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="w-full py-4 bg-orange-500 dark:bg-orange-600 text-white rounded-xl font-black text-xs uppercase tracking-[0.3em] shadow-xl shadow-orange-500/20 hover:bg-orange-600 dark:hover:bg-orange-700 transform active:scale-95 transition-all flex items-center justify-center gap-2"
          >
            {loading ? <Loader2 className="animate-spin" /> : "Initiate Session"}
          </button>
        </form>

        <div className="pt-6 border-t border-slate-100 dark:border-slate-800 text-center">
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-4">Master Credentials</p>
            <div className="flex flex-wrap justify-center gap-2">
              {[
                { label: 'Admin',   email: 'admin@kiddosfood.com',   pass: 'admin123' },
                { label: 'Manager', email: 'manager@kiddosfood.com', pass: 'admin123' },
              ].map((demo) => (
                <div
                  key={demo.label}
                  onClick={() => {
                    setIdentifier(demo.email);
                    setPassword(demo.pass);
                  }}
                  className="px-4 py-2 rounded-lg bg-white dark:bg-slate-800 text-[10px] font-black text-slate-600 dark:text-slate-300 hover:border-slate-900 hover:text-slate-900 transition-all cursor-pointer border border-slate-200 dark:border-slate-700 uppercase tracking-tighter"
                >
                  {demo.label}
                </div>
              ))}
            </div>
        </div>
      </div>
    </div>
  );
}
