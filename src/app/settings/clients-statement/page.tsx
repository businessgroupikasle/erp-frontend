"use client";

import { useState } from "react";
import SettingsLayout from "@/components/modules/settings/SettingsLayout";
import { clsx } from "clsx";

export default function ClientsStatementSettingsPage() {
  const [statementItems, setStatementItems] = useState([
    { label: "Invoice", enabled: true },
    { label: "Invoice Payment", enabled: true },
    { label: "Proforma Invoice", enabled: true },
    { label: "Proforma Invoice Payment", enabled: true },
    { label: "Purchases and Expenses", enabled: true },
    { label: "Purchases and Expenses Payment", enabled: true },
    { label: "Credit Note", enabled: true },
    { label: "Credit Consumed", enabled: true },
    { label: "Debit Note", enabled: true },
    { label: "Payment Receipt", enabled: true },
  ]);

  const toggleItem = (index: number) => {
    setStatementItems(prev => prev.map((item, i) => 
      i === index ? { ...item, enabled: !item.enabled } : item
    ));
  };

  return (
    <SettingsLayout>
      <div className="space-y-6">
        <div className="space-y-1">
           <h2 className="text-[17px] font-black text-[#1A1A1A] dark:text-white">Clients Statement</h2>
           <p className="text-[12px] font-medium text-[#666]">Please select all the documents that are needed for the client statement.</p>
        </div>

        <div className="space-y-6 pt-10 max-w-4xl">
           {statementItems.map((item, i) => (
             <div key={i} className="flex items-center justify-between py-1 px-1">
                <p className="text-[14px] font-black text-[#1A1A1A] dark:text-white">{item.label}</p>
                <div 
                  onClick={() => toggleItem(i)}
                  className={clsx(
                    "w-10 h-5 rounded-full relative cursor-pointer flex items-center transition-all",
                    item.enabled ? "bg-[#7C3AED]" : "bg-slate-200"
                  )}
                >
                   <div className={clsx(
                     "w-4 h-4 bg-white rounded-full transition-all shadow-sm",
                     item.enabled ? "ml-5.5" : "ml-0.5"
                   )} />
                </div>
             </div>
           ))}
        </div>
      </div>
    </SettingsLayout>
  );
}
