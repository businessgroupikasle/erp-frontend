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
      const role = user.role.toLowerCase();
      if (role === 'admin') {
        router.push("/admin/users");
      } else if (role === 'manager') {
        router.push("/");
      } else if (role === 'franchisee') {
        router.push("/franchise");
      } else if (role === 'staff') {
        router.push("/pos");
      } else {
        router.push("/");
      }
    } catch (err: any) {
      setError(err.response?.data?.message || "Authorization failed. Check security credentials.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex shadow-inner items-center justify-center p-4">
      <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 p-8 space-y-8">
        <div className="text-center space-y-4">
          <div className="flex justify-center mb-6">
            <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-100">
               <Image 
                src="/logo.png" 
                alt="Kiddos Logo" 
                width={140} 
                height={50} 
                className="h-12 w-auto object-contain"
                priority
              />
            </div>
          </div>
          <h1 className="text-3xl font-black tracking-tighter text-slate-900 dark:text-white uppercase">
            Command Center
          </h1>
          <p className="text-slate-500 dark:text-slate-400 font-medium italic">Sign in to Kiddos ERP</p>
        </div>

        {error && (
          <div className="bg-red-50 dark:bg-red-950/30 text-red-600 dark:text-red-400 p-4 rounded-xl text-sm font-bold border border-red-100 dark:border-red-900/50 italic animate-shake">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-6">
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase text-slate-400 dark:text-slate-500 tracking-[0.2em] pl-1">Email or Phone</label>
            <div className="relative">
              <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500" size={18} />
              <input 
                type="text" 
                required
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                className="w-full pl-12 pr-4 py-4 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all underline-offset-4 outline-none font-medium dark:text-white" 
                placeholder="Manager@fooderp.com" 
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase text-slate-400 dark:text-slate-500 tracking-[0.2em] pl-1">Security Key</label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500" size={18} />
              <input 
                type="password" 
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-12 pr-4 py-4 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all outline-none font-medium dark:text-white" 
                placeholder="••••••••" 
              />
            </div>
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="w-full py-4 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-xl font-black text-xs uppercase tracking-[0.3em] shadow-xl hover:bg-slate-800 dark:hover:bg-slate-100 transform active:scale-95 transition-all flex items-center justify-center gap-2"
          >
            {loading ? <Loader2 className="animate-spin" /> : "Authorize Access"}
          </button>
        </form>

        <div className="pt-6 border-t border-slate-100 dark:border-slate-800 text-center">
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-4">Quick Demo Auth</p>
            <div className="flex flex-wrap justify-center gap-2">
              {['Admin', 'Manager', 'Staff'].map((role) => (
                <div 
                  key={role}
                  onClick={() => {
                    setIdentifier(`${role.toLowerCase()}@fooderp.com`);
                    setPassword(`12345678`);
                  }}
                  className="px-4 py-2 rounded-lg bg-slate-100 dark:bg-slate-800 text-[10px] font-black text-slate-600 dark:text-slate-300 hover:bg-primary/20 hover:text-primary transition-all cursor-pointer border border-slate-200 dark:border-slate-700 uppercase tracking-tighter"
                >
                  {role}
                </div>
              ))}
            </div>
        </div>
      </div>
    </div>
  );
}
