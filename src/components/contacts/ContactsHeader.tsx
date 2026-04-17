"use client";

import { ChevronRight, Plus } from "lucide-react";
import Link from "next/link";

export default function ContactsHeader() {
  return (
    <div className="space-y-6">
      {/* Breadcrumbs */}
      <nav className="flex items-center gap-2 text-xs font-bold text-[#999] uppercase tracking-widest">
        <Link href="/" className="hover:text-[#7C3AED] transition-colors">Dashboard</Link>
        <ChevronRight size={12} />
        <span className="text-[#1A1A1A]">Contacts</span>
      </nav>

      {/* Main Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-black text-[#1A1A1A] dark:text-white">Contacts</h1>
        <button className="flex items-center gap-2 px-6 py-3 bg-[#E91E63] text-white rounded-xl font-bold text-sm shadow-lg shadow-pink-200 active:scale-95 transition-all">
          <Plus size={18} /> Create New
        </button>
      </div>
    </div>
  );
}
