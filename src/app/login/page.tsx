"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Lock, User, Loader2, Eye, EyeOff } from "lucide-react";
import Image from "next/image";
import api from "@/lib/api";
import { useAuth } from "@/context/AuthContext";

export default function LoginPage() {
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
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
      const role = (user.role?.name || user.role || '').toUpperCase();

      if (role === 'FRANCHISE_ADMIN') {
        router.push("/franchise/dashboard");
      } else if (role === 'STAFF') {
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.1)] dark:shadow-[0_20px_50px_rgba(0,0,0,0.3)] border border-white/20 dark:border-slate-800/50 p-10 space-y-8">
        <div className="text-center space-y-6">
          <div className="flex justify-center flex-col items-center">
            <div className="relative w-48 h-20 mb-4 transform hover:scale-105 transition-transform duration-300">
              <Image
                src="/logo.png"
                alt="Kiddos Foods Logo"
                fill
                className="object-contain"
                priority
              />
            </div>
          </div>
          <div className="space-y-1">
            <h1 className="text-4xl font-black tracking-tight text-slate-900 dark:text-white">
              CONTROL <span className="text-orange-500">PORTAL</span>
            </h1>
            <p className="text-slate-500 dark:text-slate-400 font-medium text-sm tracking-wide">
              Integrated Food Enterprise Management
            </p>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 dark:bg-red-950/30 text-red-600 dark:text-red-400 p-4 rounded-xl text-sm font-bold border border-red-100 dark:border-red-900/50 italic animate-shake">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-6">
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase text-slate-400 dark:text-slate-500 tracking-widest pl-1">Identification</label>
            <div className="relative group">
              <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-orange-500 transition-colors" size={18} />
              <input
                type="text"
                required
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                className="w-full pl-12 pr-4 py-4 bg-slate-50/50 dark:bg-slate-950/50 border border-slate-200 dark:border-slate-800 rounded-2xl focus:ring-4 focus:ring-orange-500/10 focus:border-orange-500 transition-all outline-none font-medium dark:text-white"
                placeholder="admin@kiddosfood.com"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold uppercase text-slate-400 dark:text-slate-500 tracking-widest pl-1">Access Token</label>
            <div className="relative group">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-orange-500 transition-colors" size={18} />
              <input
                type={showPassword ? "text" : "password"}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-12 pr-12 py-4 bg-slate-50/50 dark:bg-slate-950/50 border border-slate-200 dark:border-slate-800 rounded-2xl focus:ring-4 focus:ring-orange-500/10 focus:border-orange-500 transition-all outline-none font-medium dark:text-white"
                placeholder="••••••••"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors focus:outline-none"
              >
                {showPassword ? <Eye size={18} /> : <EyeOff size={18} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 bg-orange-500 hover:bg-orange-600 dark:bg-orange-600 dark:hover:bg-orange-700 text-white rounded-2xl font-bold text-sm uppercase tracking-widest shadow-lg shadow-orange-500/25 hover:shadow-orange-500/40 hover:-translate-y-0.5 active:translate-y-0 transform transition-all duration-200 flex items-center justify-center gap-3"
          >
            {loading ? <Loader2 className="animate-spin" /> : (
              <>
                Initiate Session
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
