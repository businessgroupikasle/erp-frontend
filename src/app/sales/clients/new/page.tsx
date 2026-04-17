"use client";

import { useState } from "react";
import { ChevronRight, ChevronDown, ChevronUp, Plus, Link as LinkIcon, Paperclip } from "lucide-react";
import Link from "next/link";
import { clsx } from "clsx";

interface AccordionSectionProps {
  title: string;
  isOptional?: boolean;
  isOpen: boolean;
  onToggle: () => void;
  children: React.ReactNode;
  badge?: string;
}

function FormAccordion({ title, isOptional, isOpen, onToggle, children, badge }: AccordionSectionProps) {
  return (
    <div className="border-b border-[#F0EAF0] dark:border-slate-800 last:border-0">
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between py-6 px-4 hover:bg-slate-50 transition-all rounded-xl group"
      >
        <div className="flex items-center gap-3">
          <span className="text-sm font-bold text-[#1A1A1A] dark:text-white group-hover:text-[#7C3AED] transition-colors">
            {title} {isOptional && <span className="text-[#999] font-medium text-xs ml-1">(optional)</span>}
          </span>
          {badge && (
            <span className="px-2 py-0.5 bg-slate-100 text-[#999] text-[10px] font-bold rounded-full">
              {badge}
            </span>
          )}
        </div>
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

export default function NewClientPage() {
  const [openSection, setOpenSection] = useState<string | null>("Basic Information");

  const toggleSection = (section: string) => {
    setOpenSection(openSection === section ? null : section);
  };

  return (
    <div className="min-h-screen bg-[#FDFCFD] dark:bg-[#020617] -m-8">
      <div className="max-w-[1000px] mx-auto p-10 space-y-8">
        
        {/* Breadcrumbs */}
        <nav className="flex items-center gap-2 text-[11px] font-bold text-[#999] uppercase tracking-widest">
          <Link href="/sales/clients" className="hover:text-[#7C3AED] transition-colors">Your Clients</Link>
          <ChevronRight size={12} />
          <span className="text-[#1A1A1A]">New</span>
          <ChevronRight size={12} />
        </nav>

        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-[#F0EAF0] dark:border-slate-800 shadow-2xl shadow-purple-100/20 overflow-hidden">
          
          <FormAccordion 
            title="Basic Information" 
            isOpen={openSection === "Basic Information"}
            onToggle={() => toggleSection("Basic Information")}
          >
            <div className="space-y-10">
              {/* Logo Upload */}
              <div className="w-full h-48 border-2 border-dashed border-[#F0EAF0] dark:border-slate-800 rounded-2xl flex flex-col items-center justify-center gap-4 cursor-pointer hover:bg-slate-50 transition-all group">
                <div className="p-3 rounded-xl bg-slate-50 group-hover:bg-[#7C3AED]/10 transition-colors">
                  <Plus size={32} className="text-[#CCC] group-hover:text-[#7C3AED]" />
                </div>
                <div className="text-center">
                  <p className="text-sm font-bold text-[#666]">Upload Logo</p>
                  <p className="text-[10px] text-[#999] mt-1">JPG or PNG, Dimensions 1080x1080px and file size up to 20MB</p>
                </div>
              </div>

              {/* Form Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                <div className="space-y-2">
                  <label className="text-[11px] font-bold text-[#1A1A1A] uppercase tracking-widest">Business Name<span className="text-red-500">*</span></label>
                  <input 
                    type="text" 
                    placeholder="Business Name (Required)" 
                    className="w-full px-4 py-3 bg-white border border-[#E8DEE8] rounded-xl text-sm focus:ring-2 focus:ring-purple-100 focus:border-[#7C3AED] outline-none transition-all"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[11px] font-bold text-[#1A1A1A] uppercase tracking-widest">Client Industry</label>
                  <div className="relative group">
                    <select className="w-full px-4 py-3 bg-white border border-[#F0EAF0] rounded-xl text-sm focus:ring-2 focus:ring-purple-100 focus:border-[#7C3AED] outline-none transition-all appearance-none cursor-pointer">
                      <option>-Select an Industry-</option>
                      <option>Technology</option>
                      <option>Manufacturing</option>
                      <option>Services</option>
                      <option>Retail</option>
                    </select>
                    <ChevronDown size={14} className="absolute right-4 top-1/2 -translate-y-1/2 text-[#999] pointer-events-none" />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-[11px] font-bold text-[#1A1A1A] uppercase tracking-widest">Select Country<span className="text-red-500">*</span></label>
                  <div className="relative group">
                    <select className="w-full px-4 py-3 bg-white border border-[#F0EAF0] rounded-xl text-sm focus:ring-2 focus:ring-purple-100 focus:border-[#7C3AED] outline-none transition-all appearance-none cursor-pointer">
                      <option>India</option>
                      <option>United States</option>
                      <option>United Kingdom</option>
                    </select>
                    <ChevronDown size={14} className="absolute right-4 top-1/2 -translate-y-1/2 text-[#999] pointer-events-none" />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-[11px] font-bold text-[#1A1A1A] uppercase tracking-widest">City/Town</label>
                  <input 
                    type="text" 
                    placeholder="City/Town Name" 
                    className="w-full px-4 py-3 bg-slate-50/50 border border-[#F0EAF0] rounded-xl text-sm focus:ring-2 focus:ring-purple-100 focus:border-[#7C3AED] outline-none transition-all placeholder:text-[#BBB]"
                  />
                </div>
              </div>
            </div>
          </FormAccordion>

          <FormAccordion title="Tax Information" isOptional isOpen={openSection === "Tax Information"} onToggle={() => toggleSection("Tax Information")}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
               <div className="space-y-2">
                  <label className="text-[11px] font-bold text-[#1A1A1A] uppercase tracking-widest">GST/VAT Number</label>
                  <input type="text" className="w-full px-4 py-3 bg-white border border-[#F0EAF0] rounded-xl text-sm outline-none" />
               </div>
               <div className="space-y-2">
                  <label className="text-[11px] font-bold text-[#1A1A1A] uppercase tracking-widest">PAN Card Number</label>
                  <input type="text" className="w-full px-4 py-3 bg-white border border-[#F0EAF0] rounded-xl text-sm outline-none" />
               </div>
            </div>
          </FormAccordion>

          <FormAccordion title="Address" isOptional isOpen={openSection === "Address"} onToggle={() => toggleSection("Address")}>
            <div className="space-y-6">
               <div className="space-y-2">
                  <label className="text-[11px] font-bold text-[#1A1A1A] uppercase tracking-widest">Street Address</label>
                  <textarea className="w-full px-4 py-3 bg-white border border-[#F0EAF0] rounded-xl text-sm outline-none resize-none h-20" />
               </div>
               <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <input type="text" placeholder="State/Province" className="w-full px-4 py-3 bg-white border border-[#F0EAF0] rounded-xl text-sm outline-none" />
                  <input type="text" placeholder="Postal Code" className="w-full px-4 py-3 bg-white border border-[#F0EAF0] rounded-xl text-sm outline-none" />
               </div>
            </div>
          </FormAccordion>

          <FormAccordion title="Linked Contacts" isOpen={openSection === "Linked Contacts"} onToggle={() => toggleSection("Linked Contacts")} badge="0">
            <div className="flex flex-col items-center justify-center p-8 text-center space-y-4 border border-dashed border-[#F0EAF0] rounded-2xl">
               <LinkIcon size={24} className="text-[#CCC]" />
               <p className="text-xs font-bold text-[#1A1A1A]">No contacts linked yet</p>
               <button className="text-[10px] font-bold text-[#7C3AED] uppercase tracking-widest hover:underline">+ Link Contact</button>
            </div>
          </FormAccordion>

          <FormAccordion title="Shipping Details" isOptional isOpen={openSection === "Shipping Details"} onToggle={() => toggleSection("Shipping Details")}>
             <label className="flex items-center gap-3 cursor-pointer group">
                <div className="w-4 h-4 border-2 border-[#E8DEE8] rounded bg-white group-hover:border-[#7C3AED] transition-all" />
                <span className="text-xs font-bold text-[#666]">Shipping address same as billing address</span>
             </label>
          </FormAccordion>

          <FormAccordion title="Additional Details" isOptional isOpen={openSection === "Additional Details"} onToggle={() => toggleSection("Additional Details")}>
             <textarea className="w-full px-4 py-3 bg-white border border-[#F0EAF0] rounded-xl text-sm outline-none resize-none h-24" placeholder="Internal notes..." />
          </FormAccordion>

          <FormAccordion title="Attachments" isOptional isOpen={openSection === "Attachments"} onToggle={() => toggleSection("Attachments")}>
             <div className="flex items-center justify-center p-8 border-2 border-dashed border-[#F0EAF0] rounded-2xl gap-3">
                <Paperclip size={18} className="text-[#999]" />
                <p className="text-xs text-[#999]">Click to upload or drag and drop</p>
             </div>
          </FormAccordion>

          <FormAccordion title="Account Details" isOptional isOpen={openSection === "Account Details"} onToggle={() => toggleSection("Account Details")}>
             <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                <div className="space-y-2">
                   <label className="text-[11px] font-bold text-[#1A1A1A] uppercase tracking-widest">Bank Holder Name</label>
                   <input type="text" className="w-full px-4 py-3 bg-white border border-[#F0EAF0] rounded-xl text-sm outline-none" />
                </div>
                <div className="space-y-2">
                   <label className="text-[11px] font-bold text-[#1A1A1A] uppercase tracking-widest">Account Number</label>
                   <input type="text" className="w-full px-4 py-3 bg-white border border-[#F0EAF0] rounded-xl text-sm outline-none" />
                </div>
             </div>
          </FormAccordion>

          <div className="p-8 bg-slate-50/50 border-t border-[#F0EAF0]">
            <button className="px-12 py-3 bg-[#7C3AED] text-white rounded-xl font-bold text-sm shadow-lg shadow-purple-100 active:scale-95 transition-all">
              Save
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}
