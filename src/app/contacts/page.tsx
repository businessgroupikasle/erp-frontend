"use client";

import { useState } from "react";
import ContactsHeader from "@/components/contacts/ContactsHeader";
import ContactsFilters from "@/components/contacts/ContactsFilters";
import { DataTable } from "@/components/ui/DataTable";
import { FileText, Plus, Columns } from "lucide-react";
import { clsx } from "clsx";

export default function ContactsPage() {
  const [activeTab, setActiveTab] = useState("Active Contacts");
  const [contacts, setContacts] = useState([]); // Initial empty state as per screenshot

  const tabs = ["Active Contacts", "Inactive Contacts", "Deleted Contacts"];

  const columns = [
    { header: "First Name", accessor: "firstName" },
    { header: "Last Name", accessor: "lastName" },
    { header: "Phone", accessor: "phone" },
    { header: "Secondary Phone", accessor: "secondaryPhone" },
    { header: "Email", accessor: "email" },
    { header: "Secondary Email", accessor: "secondaryEmail" },
    { header: "Country", accessor: "country" },
    { header: "Created At", accessor: "createdAt" },
  ];

  return (
    <div className="min-h-screen bg-[#FDFCFD] dark:bg-[#020617] -m-8">
      <div className="max-w-[1400px] mx-auto p-10 space-y-10">
        
        <ContactsHeader />

        {/* Tabs Section */}
        <div className="border-b border-[#F0EAF0] dark:border-slate-800">
          <div className="flex gap-10">
            {tabs.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={clsx(
                  "pb-4 text-[13px] font-bold uppercase tracking-tight transition-all relative",
                  activeTab === tab 
                    ? "text-[#7C3AED]" 
                    : "text-[#999] hover:text-[#666]"
                )}
              >
                {tab}
                {activeTab === tab && (
                  <div className="absolute bottom-0 left-0 w-full h-0.5 bg-[#7C3AED]" />
                )}
              </button>
            ))}
          </div>
        </div>

        <ContactsFilters />

        {/* Table / Empty State Area */}
        <div className="space-y-4">
           <div className="flex justify-between items-center">
              <span className="text-[11px] font-bold text-[#999] uppercase tracking-widest">No contacts Found</span>
              <button className="flex items-center gap-2 px-4 py-2 border border-[#F0EAF0] rounded-lg text-xs font-bold text-[#7C3AED] hover:bg-slate-50 transition-all">
                 <Columns size={14} /> Show/Hide Columns
              </button>
           </div>

           {contacts.length > 0 ? (
             <DataTable 
               columns={columns as any}
               data={contacts}
               loading={false}
             />
           ) : (
             <div className="bg-white dark:bg-slate-900 border border-[#F0EAF0] dark:border-slate-800 rounded-2xl min-h-[500px] flex flex-col items-center justify-center p-20 text-center gap-8">
                <div className="p-6 bg-slate-50 dark:bg-slate-800 rounded-2xl">
                   <FileText size={48} className="text-[#CCC]" />
                </div>
                <div className="space-y-6">
                   <p className="text-sm font-bold text-[#1A1A1A] dark:text-white uppercase tracking-tight">No Contacts to show</p>
                   <button className="flex items-center gap-2 px-10 py-3 bg-[#7C3AED] text-white rounded-xl font-bold text-sm shadow-xl shadow-purple-200/50 active:scale-95 transition-all mx-auto">
                      <Plus size={18} /> Create New
                   </button>
                </div>
             </div>
           )}
        </div>

        {/* Support Footer */}
        <div className="flex flex-col md:flex-row items-center justify-center gap-8 text-[11px] font-bold text-[#999] pt-20 uppercase tracking-widest">
           <div className="flex items-center gap-2">Download our app <span className="text-[#7C3AED]">PLAY</span></div>
           <div className="flex items-center gap-2">Reach out to us for any help <span className="text-[#7C3AED]">+91 91040 43036</span></div>
           <div className="flex items-center gap-2 hover:text-[#7C3AED] transition-colors cursor-pointer">Help and Support</div>
           <div className="flex items-center gap-2 hover:text-[#7C3AED] transition-colors cursor-pointer">FAQs</div>
        </div>
      </div>
    </div>
  );
}
