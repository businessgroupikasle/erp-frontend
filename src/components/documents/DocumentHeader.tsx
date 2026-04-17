"use client";

import { ChevronRight } from "lucide-react";
import { clsx } from "clsx";

interface DocumentHeaderProps {
  activeStep: number;
  steps: string[];
}

export default function DocumentHeader({ activeStep, steps }: DocumentHeaderProps) {
  return (
    <div className="flex items-center justify-center gap-6 py-8 border-b border-[#F0EAF0] dark:border-slate-800 bg-white dark:bg-[#020617]">
      {steps.map((step, index) => (
        <div key={index} className="flex items-center gap-6">
          <div className="flex items-center gap-3">
            <div className={clsx(
              "w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold",
              index + 1 === activeStep 
                ? "bg-[#7C3AED] text-white" 
                : "border-2 border-[#999] text-[#999]"
            )}>
              {index + 1}
            </div>
            <span className={clsx(
              "text-sm font-bold",
              index + 1 === activeStep ? "text-[#1A1A1A] dark:text-white" : "text-[#999]"
            )}>
              {step}
            </span>
          </div>
          {index < steps.length - 1 && (
            <ChevronRight size={16} className="text-[#999]" />
          )}
        </div>
      ))}
    </div>
  );
}
