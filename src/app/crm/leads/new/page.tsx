"use client";

import { useState } from "react";
import { ChevronRight, ChevronDown, ChevronUp, Plus, User, Info, Settings } from "lucide-react";
import Link from "next/link";
import { clsx } from "clsx";

interface AccordionSectionProps {
  title: string;
  isOpen: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}

function FormAccordion({ title, isOpen, onToggle, children }: AccordionSectionProps) {
  return (
    <div className="border-b border-[#F0EAF0] last:border-0">
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between py-6 px-4 hover:bg-slate-50 transition-all rounded-xl group"
      >
        <span className="text-sm font-bold text-[#1A1A1A] group-hover:text-[#7C3AED] transition-colors">{title}</span>
        {isOpen ? <ChevronUp size={18} className="text-[#999]" /> : <ChevronDown size={18} className="text-[#999]" />}
      </button>
      {isOpen && (
        <div className="px-10 pb-10 pt-4 animate-in fade-in slide-in-from-top-2 duration-300">
          {children}
        </div>
      )}
    </div>
  );
}

export default function NewLeadPage() {
  const [openSection, setOpenSection] = useState<string | null>("Contact & Customer Details");

  const toggleSection = (section: string) => {
    setOpenSection(openSection === section ? null : section);
  };

  return (
    <div className="min-h-screen bg-[#FDFCFD] dark:bg-[#020617] -m-8">
      <div className="max-w-[1000px] mx-auto p-10 space-y-8">
        
        {/* Breadcrumbs */}
        <nav className="flex items-center gap-2 text-[11px] font-bold text-[#999] uppercase tracking-widest">
          <Link href="/crm" className="hover:text-[#7C3AED] transition-colors">Azeez</Link>
          <ChevronRight size={12} />
          <Link href="/crm/leads" className="hover:text-[#7C3AED] transition-colors">Lead Management</Link>
          <ChevronRight size={12} />
          <span className="text-[#1A1A1A]">Add New Lead</span>
        </nav>

        <h1 className="text-3xl font-black text-[#1A1A1A]">Add New Lead</h1>

        <div className="bg-white rounded-3xl border border-[#F0EAF0] shadow-2xl shadow-purple-100/20 overflow-hidden">
          
          <FormAccordion 
            title="Contact & Customer Details" 
            isOpen={openSection === "Contact & Customer Details"}
            onToggle={() => toggleSection("Contact & Customer Details")}
          >
            <div className="space-y-10">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                <div className="space-y-2">
                  <label className="text-[11px] font-bold text-[#1A1A1A] uppercase tracking-widest">Contact Name<span className="text-red-500">*</span></label>
                  <p className="text-[10px] text-[#999] font-medium">Full name of the lead contact</p>
                  <input 
                    type="text" 
                    placeholder="Enter name"
                    className="w-full px-4 py-3 bg-white border border-[#F0EAF0] rounded-xl text-sm outline-none focus:border-[#7C3AED] transition-all"
                  />
                  <p className="text-[10px] font-bold">Is it an existing contact? <span className="text-[#7C3AED] cursor-pointer hover:underline">Link Contact</span></p>
                </div>

                <div className="space-y-2">
                  <label className="text-[11px] font-bold text-[#1A1A1A] uppercase tracking-widest">Country<span className="text-red-500">*</span></label>
                  <p className="text-[10px] text-[#999] font-medium">Country of the lead</p>
                  <div className="relative">
                    <select className="w-full px-4 py-3 bg-white border border-[#F0EAF0] rounded-xl text-sm appearance-none outline-none focus:border-[#7C3AED]">
                      <option>India</option>
                      <option>United States</option>
                    </select>
                    <ChevronDown size={14} className="absolute right-4 top-1/2 -translate-y-1/2 text-[#999] pointer-events-none" />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[11px] font-bold text-[#1A1A1A] uppercase tracking-widest">City</label>
                  <input type="text" className="w-full px-4 py-3 bg-white border border-[#F0EAF0] rounded-xl text-sm outline-none" />
                </div>

                <div className="space-y-2">
                  <label className="text-[11px] font-bold text-[#1A1A1A] uppercase tracking-widest">Phone</label>
                  <div className="flex gap-2">
                    <div className="w-24 px-4 py-3 bg-white border border-[#F0EAF0] rounded-xl text-sm flex items-center justify-between">
                      <span className="text-xs">🇮🇳 +91</span>
                    </div>
                    <input type="text" className="flex-1 px-4 py-3 bg-white border border-[#F0EAF0] rounded-xl text-sm outline-none" />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[11px] font-bold text-[#1A1A1A] uppercase tracking-widest">Email</label>
                  <p className="text-[10px] text-[#999] font-medium">Email address of the lead</p>
                  <input type="text" className="w-full px-4 py-3 bg-white border border-[#F0EAF0] rounded-xl text-sm outline-none" />
                </div>

                <div className="space-y-2">
                  <label className="text-[11px] font-bold text-[#1A1A1A] uppercase tracking-widest">Designation</label>
                  <p className="text-[10px] text-[#999] font-medium">Designation, role or position of the lead</p>
                  <input type="text" className="w-full px-4 py-3 bg-white border border-[#F0EAF0] rounded-xl text-sm outline-none" />
                </div>

                <div className="space-y-2 md:col-span-2">
                  <label className="text-[11px] font-bold text-[#1A1A1A] uppercase tracking-widest">Prospect Organisation<span className="text-red-500">*</span></label>
                  <p className="text-[10px] text-[#999] font-medium">Company or organisation the lead belongs to</p>
                  <div className="relative">
                    <select className="w-full px-4 py-3 bg-white border border-[#F0EAF0] rounded-xl text-sm appearance-none outline-none focus:border-[#7C3AED]">
                      <option>Select...</option>
                    </select>
                    <ChevronDown size={14} className="absolute right-4 top-1/2 -translate-y-1/2 text-[#999] pointer-events-none" />
                  </div>
                </div>
              </div>
            </div>
          </FormAccordion>

          <FormAccordion title="Lead Details" isOpen={openSection === "Lead Details"} onToggle={() => toggleSection("Lead Details")}>
             <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                <div className="space-y-2">
                   <label className="text-[11px] font-bold text-[#1A1A1A] uppercase tracking-widest">Lead Source</label>
                   <input type="text" className="w-full px-4 py-3 bg-white border border-[#F0EAF0] rounded-xl text-sm outline-none" />
                </div>
                <div className="space-y-2">
                   <label className="text-[11px] font-bold text-[#1A1A1A] uppercase tracking-widest">Lead Stage</label>
                   <input type="text" className="w-full px-4 py-3 bg-white border border-[#F0EAF0] rounded-xl text-sm outline-none" />
                </div>
             </div>
          </FormAccordion>

          <FormAccordion title="Custom Fields" isOpen={openSection === "Custom Fields"} onToggle={() => toggleSection("Custom Fields")}>
             <button className="flex items-center gap-2 text-xs font-bold text-[#7C3AED] uppercase tracking-widest hover:underline">
                <Plus size={16} /> Add Custom Field
             </button>
          </FormAccordion>

          <div className="p-8 bg-slate-50/50 border-t border-[#F0EAF0]">
            <button className="px-12 py-3 bg-[#7C3AED] text-white rounded-xl font-bold text-sm shadow-xl shadow-purple-100 active:scale-95 transition-all">
              Add Lead
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}
