"use client";

import { useAuth } from "@/context/AuthContext";
import { MessageSquare } from "lucide-react";

export default function WelcomeHeader() {
  const { user } = useAuth();

  return (
    <div className="flex flex-col md:flex-row items-center justify-between gap-6 py-6 transition-all animate-in fade-in slide-in-from-top-4 duration-700">
      <div className="flex items-center gap-6 group">
        <div className="w-16 h-16 rounded-full bg-[#1F4B65] flex items-center justify-center text-white font-black text-xl shadow-xl transform transition-transform group-hover:scale-105">
           IK
        </div>
        <div className="flex flex-col">
          <h2 className="text-[#666] text-sm font-medium tracking-tight">Hello Ikasle Business Group</h2>
          <h1 className="text-3xl font-bold text-[#1A1A1A] dark:text-white flex items-center gap-2">
            Welcome to <span className="text-[#1A1A1A] dark:text-white">{user?.fullName || "Azeez"}</span>!
          </h1>
        </div>
      </div>

      <button className="flex items-center gap-2 px-6 py-3 bg-[#E91E63] hover:bg-[#D81B60] text-white rounded-lg font-bold text-sm shadow-lg shadow-pink-200/50 transition-all active:scale-95">
        <MessageSquare size={18} />
        Book A Demo
      </button>
    </div>
  );
}
