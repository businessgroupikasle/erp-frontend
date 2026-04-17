"use client";

import { useState } from "react";
import { ChevronRight, ChevronDown, ChevronUp, Plus, Code, Settings, Share2, Eye, Layout } from "lucide-react";
import Link from "next/link";
import { clsx } from "clsx";

interface StepAccordionProps {
  number: number;
  title: string;
  isOpen: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}

function StepAccordion({ number, title, isOpen, onToggle, children }: StepAccordionProps) {
  return (
    <div className="bg-white dark:bg-slate-900 border border-[#F0EAF0] dark:border-slate-800 rounded-2xl overflow-hidden mb-4">
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between p-6 transition-all hover:bg-slate-50"
      >
        <div className="flex items-center gap-4">
          <div className={clsx(
            "w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm",
            isOpen ? "bg-[#7C3AED] text-white" : "bg-slate-100 text-[#999]"
          )}>
            {number}.
          </div>
          <span className="text-sm font-bold text-[#1A1A1A] dark:text-white uppercase tracking-wider">{title}</span>
        </div>
        {isOpen ? <ChevronUp size={18} className="text-[#999]" /> : <ChevronDown size={18} className="text-[#999]" />}
      </button>
      {isOpen && (
        <div className="px-10 pb-10 pt-4 border-t border-[#F0EAF0] dark:border-slate-800 animate-in fade-in slide-in-from-top-2 duration-300">
          {children}
        </div>
      )}
    </div>
  );
}

export default function CreateFormPage() {
  const [activeStep, setActiveStep] = useState(1);
  const [pipeline, setPipeline] = useState("Sales Pipeline");

  const toggleStep = (step: number) => {
    setActiveStep(activeStep === step ? 0 : step);
  };

  return (
    <div className="min-h-screen bg-[#FDFCFD] dark:bg-[#020617] -m-8">
      {/* Top Header */}
      <div className="bg-white dark:bg-slate-900 border-b border-[#F0EAF0] dark:border-slate-800 px-10 py-4 flex items-center justify-between sticky top-0 z-50">
        <div className="space-y-1">
          <nav className="flex items-center gap-2 text-[10px] font-bold text-[#999] uppercase tracking-[0.2em]">
            <Link href="/" className="hover:text-[#7C3AED]">Dashboard</Link>
            <ChevronRight size={10} />
            <Link href="/crm/forms" className="hover:text-[#7C3AED]">All Forms</Link>
            <ChevronRight size={10} />
            <span className="text-[#1A1A1A] dark:text-white">Create Form</span>
          </nav>
          <h1 className="text-xl font-black text-[#1A1A1A] dark:text-white">Create Form</h1>
        </div>
        <button className="px-8 py-3 bg-[#E91E63] text-white rounded-xl font-bold text-sm shadow-xl shadow-pink-200 hover:shadow-pink-300 active:scale-95 transition-all flex items-center gap-2">
          <Plus size={18} /> Publish Form
        </button>
      </div>

      <div className="max-w-[1600px] mx-auto p-10 grid grid-cols-1 lg:grid-cols-12 gap-10">
        
        {/* Left Column: Config */}
        <div className="lg:col-span-7 space-y-4">
          <StepAccordion 
            number={1} 
            title="Select Sales Pipeline" 
            isOpen={activeStep === 1}
            onToggle={() => toggleStep(1)}
          >
            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-xs font-bold text-[#666] uppercase tracking-wider">Select Sales Pipeline*</label>
                <div className="relative">
                  <select 
                    value={pipeline}
                    onChange={(e) => setPipeline(e.target.value)}
                    className="w-full p-4 bg-white dark:bg-slate-950 border border-[#F0EAF0] dark:border-slate-800 rounded-xl text-sm font-medium outline-none focus:border-[#7C3AED] transition-all appearance-none"
                  >
                    <option>Sales Pipeline</option>
                    <option>Marketing Pipeline</option>
                  </select>
                  <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-[#999]" size={16} />
                </div>
              </div>
              <button 
                onClick={() => setActiveStep(2)}
                className="px-8 py-3 bg-[#7C3AED] text-white rounded-xl font-bold text-sm shadow-lg shadow-purple-100 hover:shadow-purple-200 active:scale-95 transition-all"
              >
                Save & Continue
              </button>
            </div>
          </StepAccordion>

          <StepAccordion 
            number={2} 
            title="Select Fields" 
            isOpen={activeStep === 2}
            onToggle={() => toggleStep(2)}
          >
            <div className="space-y-6">
              <p className="text-sm text-[#999]">Choose the fields you want to include in your lead capture form.</p>
              <div className="grid grid-cols-2 gap-4">
                 {["Contact Name", "Email", "Phone", "Message", "Company", "Designation"].map(field => (
                    <div key={field} className="p-4 border border-[#F0EAF0] rounded-xl flex items-center justify-between group hover:border-[#7C3AED] transition-all cursor-pointer">
                       <span className="text-sm font-bold text-[#1A1A1A]">{field}</span>
                       <Plus size={14} className="text-[#CCC] group-hover:text-[#7C3AED]" />
                    </div>
                 ))}
              </div>
              <button 
                onClick={() => setActiveStep(3)}
                className="px-8 py-3 bg-[#7C3AED] text-white rounded-xl font-bold text-sm shadow-lg shadow-purple-100 hover:shadow-purple-200 active:scale-95 transition-all"
              >
                Save & Continue
              </button>
            </div>
          </StepAccordion>

          <StepAccordion 
            number={3} 
            title="Configure Form" 
            isOpen={activeStep === 3}
            onToggle={() => toggleStep(3)}
          >
            <div className="space-y-6">
               <div className="space-y-2">
                  <label className="text-xs font-bold text-[#666] uppercase tracking-wider">Form Title</label>
                  <input 
                    type="text" 
                    placeholder="e.g., Contact Us"
                    className="w-full p-4 bg-white border border-[#F0EAF0] rounded-xl text-sm font-medium outline-none focus:border-[#7C3AED]" 
                  />
               </div>
               <div className="flex items-center gap-3">
                  <div className="w-5 h-5 rounded border-2 border-[#F0EAF0] flex items-center justify-center text-white text-[10px] font-bold">✓</div>
                  <span className="text-xs font-bold text-[#666]">Enable reCAPTCHA</span>
               </div>
            </div>
          </StepAccordion>
        </div>

        {/* Right Column: Preview */}
        <div className="lg:col-span-5 space-y-6">
          {/* Share Box */}
          <div className="bg-[#FFFDFD] dark:bg-slate-900 border border-pink-100 dark:border-pink-900/30 rounded-2xl p-6 flex items-start justify-between gap-6">
            <div className="space-y-2">
               <h3 className="text-sm font-black text-[#1A1A1A] dark:text-white">Get shareable Code</h3>
               <p className="text-xs text-[#999] leading-relaxed">To embed this form, copy and paste the code below into the HTML code on your website.</p>
               <button className="text-[10px] font-black text-pink-500 uppercase tracking-widest hover:underline">Learn More</button>
            </div>
            <button className="px-4 py-2 bg-white border border-pink-200 text-pink-500 rounded-lg text-[10px] font-black uppercase tracking-widest hover:bg-pink-50 transition-colors flex items-center gap-2 whitespace-nowrap">
               <Code size={14} /> Get Code
            </button>
          </div>

          {/* Preview Canvas */}
          <div className="space-y-4">
             <div className="flex items-center gap-2">
                <Eye size={16} className="text-[#999]" />
                <span className="text-[10px] font-black text-[#999] uppercase tracking-widest">Preview</span>
             </div>
             <div className="bg-white dark:bg-slate-900 border border-[#F0EAF0] dark:border-slate-800 rounded-2xl shadow-sm p-12 text-center space-y-8 min-h-[500px] flex flex-col">
                <h2 className="text-2xl font-black text-[#1A1A1A] dark:text-white">New Form</h2>
                
                <div className="space-y-6 flex-1">
                   {[1, 2, 3].map(i => (
                      <div key={i} className="space-y-3">
                         <div className="h-2 w-20 bg-slate-100 rounded" />
                         <div className="h-12 w-full bg-slate-50 border border-slate-100 rounded-xl" />
                      </div>
                   ))}
                </div>

                <div className="space-y-4 pt-8">
                   <button className="w-full py-4 bg-[#7C3AED] text-white rounded-xl font-black text-sm shadow-xl shadow-purple-200">
                      Submit
                   </button>
                   <div className="flex items-center justify-center gap-2 text-[10px] font-bold text-[#CCC] uppercase tracking-widest">
                      Powered by <span className="text-[#BBB] flex items-center gap-1"><Layout size={10} /> Refrens</span>
                   </div>
                </div>
             </div>
          </div>
        </div>

      </div>
    </div>
  );
}
