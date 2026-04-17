"use client";

import { useState } from "react";
import SettingsLayout from "@/components/modules/settings/SettingsLayout";
import { 
  ChevronDown, 
  ChevronUp, 
  Plus, 
  Settings, 
  Check, 
  AlertCircle,
  FileText,
  Workflow
} from "lucide-react";
import { clsx } from "clsx";

export default function AccountingSettingsPage() {
  const [expandedSections, setExpandedSections] = useState<string[]>([
    "Taxation and Billing", "Customized RFI/RFQ", "GST Configuration", "KYC Details", "Custom Labels and fields", "Experimental", "Add QR Codes to Documents", "Document Acceptance"
  ]);

  const toggleSection = (section: string) => {
    setExpandedSections(prev => 
      prev.includes(section) ? prev.filter(s => s !== section) : [...prev, section]
    );
  };

  const SectionHeader = ({ title, icon }: { title: string, icon?: boolean }) => {
    const isExpanded = expandedSections.includes(title);
    return (
      <button 
        onClick={() => toggleSection(title)}
        className="w-full flex items-center justify-between py-5 border-b border-[#F0EAF0] dark:border-slate-800 last:border-0 group"
      >
        <div className="flex items-center gap-3">
           {isExpanded ? <ChevronUp size={18} className="text-[#1A1A1A] dark:text-white" /> : <ChevronDown size={18} className="text-[#999]" />}
           <h3 className={clsx(
             "text-[15px] font-black transition-colors flex items-center gap-2",
             isExpanded ? "text-[#1A1A1A] dark:text-white" : "text-[#666] dark:text-slate-400 group-hover:text-[#1A1A1A] dark:hover:text-white"
           )}>
             {title} {icon && <span className="text-sm opacity-60">✨</span>}
           </h3>
        </div>
      </button>
    );
  };

  const gstFields = [
    { type: "E-Invoices", field: "IRN Number", active: true },
    { type: "E-Invoices", field: "Acknowledgement Number", active: false },
    { type: "E-Invoices", field: "Acknowledgement Date", active: false },
    { type: "E-Invoices", field: "IRN Cancelled Date", active: false },
    { type: "E-way Bills", field: "E-way Bill No.", active: true },
    { type: "E-way Bills", field: "E-way Bill Date", active: true },
    { type: "E-way Bills", field: "E-way Bill Valid Till", active: true },
    { type: "E-way Bills", field: "E-way Bill Cancelled Date", active: false },
  ];

  return (
    <SettingsLayout>
      <div className="space-y-2">
        <h2 className="text-[17px] font-black text-[#1A1A1A] dark:text-white mb-6">Accounting</h2>

        {/* Taxation and Billing */}
        <div>
           <SectionHeader title="Taxation and Billing" />
           {expandedSections.includes("Taxation and Billing") && (
             <div className="py-8 space-y-8 max-w-4xl">
                <div className="flex items-start justify-between">
                   <div className="space-y-1">
                      <p className="text-[13px] font-black text-[#1A1A1A] dark:text-white">Default Due Date</p>
                      <p className="text-[11px] font-medium text-[#999]">Automatically set a due after 15 days from invoice date</p>
                   </div>
                   <input type="text" defaultValue="15" className="w-64 px-4 py-2 bg-white dark:bg-slate-800 border border-[#F0EAF0] dark:border-slate-800 rounded-lg text-[13px] font-bold" />
                </div>

                <div className="flex items-start justify-between">
                   <div className="space-y-1">
                      <p className="text-[13px] font-black text-[#1A1A1A] dark:text-white">Select Tax Type</p>
                      <p className="text-[11px] font-medium text-[#999]">Set your tax system based on your region</p>
                   </div>
                   <select className="w-64 px-4 py-2 bg-white dark:bg-slate-800 border border-[#F0EAF0] dark:border-slate-800 rounded-lg text-[13px] font-medium appearance-none">
                      <option>GST (India)</option>
                   </select>
                </div>

                <div className="flex items-start justify-between">
                   <div className="space-y-1">
                      <p className="text-[13px] font-black text-[#1A1A1A] dark:text-white">Additional Cess</p>
                      <p className="text-[11px] font-medium text-[#999]">Add/Edit Cess for your business</p>
                   </div>
                   <button className="flex items-center gap-2 px-5 py-2 border border-[#F0EAF0] dark:border-slate-800 rounded-lg text-[12px] font-bold text-[#666] hover:bg-slate-50 transition-all">
                      <Settings size={14} /> Configure
                   </button>
                </div>

                <div className="flex items-start justify-between">
                   <div className="space-y-1">
                      <p className="text-[13px] font-black text-[#1A1A1A] dark:text-white">Add Default Tax Rate ( in % )</p>
                      <p className="text-[11px] font-medium text-[#999]">Set your default tax rate for all products/services</p>
                   </div>
                   <input type="text" placeholder="Enter Tax Rate" className="w-64 px-4 py-2 bg-white dark:bg-slate-800 border border-[#F0EAF0] dark:border-slate-800 rounded-lg text-[13px] font-medium" />
                </div>

                <div className="flex items-center justify-between">
                   <div className="space-y-1">
                      <p className="text-[13px] font-black text-[#1A1A1A] dark:text-white">Record Tax Deducted At Source (TDS)</p>
                      <p className="text-[11px] font-medium text-[#999]">Record TDS while receiving and making payments</p>
                   </div>
                   <div className="w-10 h-5 bg-[#7C3AED] rounded-full relative">
                      <div className="absolute right-0.5 top-0.5 w-4 h-4 bg-white rounded-full" />
                   </div>
                </div>

                <div className="flex items-start justify-between pt-10 border-t border-slate-50">
                   <div className="space-y-1">
                      <p className="text-[13px] font-black text-[#1A1A1A] dark:text-white">Financial Year</p>
                      <p className="text-[11px] font-medium text-[#999]">Set the start date of the financial year for your business</p>
                   </div>
                   <button className="flex items-center gap-2 px-5 py-2 border border-[#F0EAF0] dark:border-slate-800 rounded-lg text-[12px] font-bold text-[#666] hover:bg-slate-50 transition-all">
                      <FileText size={14} /> Update Financial Year
                   </button>
                </div>

                <div className="flex justify-end pt-4">
                   <button className="px-5 py-2.5 bg-[#7C3AED] text-white rounded-lg font-black text-[12px] uppercase tracking-widest hover:bg-[#6D28D9] transition-all">
                      Add
                   </button>
                </div>
             </div>
           )}
        </div>

        {/* Customized RFI/RFQ */}
        <div>
           <SectionHeader title="Customized RFI/RFQ" icon />
           {expandedSections.includes("Customized RFI/RFQ") && (
             <div className="py-8 space-y-6">
                <div className="flex items-center justify-end">
                   <button className="px-4 py-2 border border-[#7C3AED] rounded-lg text-[13px] font-bold text-[#7C3AED] flex items-center gap-2 hover:bg-purple-50 transition-all">
                      <Plus size={16} /> Create New Link
                   </button>
                </div>
                
                <div className="bg-white dark:bg-slate-900 border border-[#F0EAF0] dark:border-slate-800 rounded-2xl overflow-hidden min-h-[300px]">
                   <table className="w-full text-left">
                     <thead>
                       <tr className="bg-[#FAF9FA] dark:bg-slate-800/50 border-b border-[#F0EAF0] dark:border-slate-800">
                         <th className="p-4 text-[11px] font-bold text-[#999] uppercase tracking-wider">Name</th>
                         <th className="p-4 text-[11px] font-bold text-[#999] uppercase tracking-wider">Bill Type</th>
                         <th className="p-4 text-[11px] font-bold text-[#999] uppercase tracking-wider">Status</th>
                         <th className="p-4 text-[11px] font-bold text-[#999] uppercase tracking-wider">Created By</th>
                       </tr>
                     </thead>
                     <tbody>
                       <tr>
                         <td colSpan={4} className="py-20 text-center">
                            <div className="flex flex-col items-center gap-4 opacity-30">
                               <div className="w-16 h-16 rounded-3xl bg-slate-100 flex items-center justify-center">
                                  <Workflow size={32} />
                               </div>
                               <p className="text-[14px] font-black text-[#1A1A1A]">No Data</p>
                            </div>
                         </td>
                       </tr>
                     </tbody>
                   </table>
                </div>
             </div>
           )}
        </div>

        {/* GST Configuration */}
        <div>
           <SectionHeader title="GST Configuration" />
           {expandedSections.includes("GST Configuration") && (
             <div className="py-8 space-y-8 max-w-4xl">
                <div className="space-y-6">
                   <div className="flex items-center justify-between">
                      <div className="space-y-1">
                         <p className="text-[13px] font-black text-[#1A1A1A] dark:text-white">Enable E-commerce invoices</p>
                         <p className="text-[11px] font-medium text-[#999]">Add your E-commerce operators in the invoice and file GSTR-1 reports.</p>
                      </div>
                      <div className="w-10 h-5 bg-slate-200 dark:bg-slate-700 rounded-full cursor-not-allowed"></div>
                   </div>

                   <div className="flex items-center justify-between">
                      <div className="space-y-1">
                         <p className="text-[13px] font-black text-[#1A1A1A] dark:text-white">Choose IRN location on your documents</p>
                      </div>
                      <select className="w-64 px-4 py-2 bg-white dark:bg-slate-800 border border-[#F0EAF0] dark:border-slate-800 rounded-lg text-[13px] font-bold appearance-none">
                         <option>In Invoice Details (Old Method)</option>
                      </select>
                   </div>
                </div>

                <div className="space-y-4 pt-6 text-[12px] font-black text-[#1A1A1A]">
                   <p>Choose E-invoice and E-way Bill fields on public invoices</p>
                   <div className="bg-white dark:bg-slate-900 border border-[#F0EAF0] dark:border-slate-800 rounded-xl overflow-hidden">
                      <table className="w-full text-left">
                         <thead>
                            <tr className="bg-[#FAF9FA] dark:bg-slate-800/50 border-b border-[#F0EAF0] dark:border-slate-800 text-[10px] text-[#999] uppercase font-bold">
                               <th className="p-3">Type</th>
                               <th className="p-3">Field</th>
                               <th className="p-3">Show in Invoice</th>
                            </tr>
                         </thead>
                         <tbody className="text-[12px] font-medium text-[#444] dark:text-slate-300">
                            {gstFields.map((f, i) => (
                               <tr key={i} className="border-b border-[#FDFCFD] dark:border-slate-800 last:border-0">
                                  <td className="p-3">{f.type}</td>
                                  <td className="p-3">{f.field}</td>
                                  <td className="p-3">
                                     <div className={clsx(
                                       "w-4 h-4 rounded border-2 flex items-center justify-center transition-all cursor-pointer",
                                       f.active ? "bg-[#7C3AED] border-[#7C3AED]" : "border-slate-200"
                                     )}>
                                        {f.active && <Check size={10} strokeWidth={4} className="text-white" />}
                                     </div>
                                  </td>
                               </tr>
                            ))}
                         </tbody>
                      </table>
                   </div>
                </div>
             </div>
           )}
        </div>

        {/* KYC Details */}
        <div>
           <SectionHeader title="KYC Details" />
           {expandedSections.includes("KYC Details") && (
             <div className="py-8 space-y-8">
                <div className="p-4 bg-orange-50 border border-orange-100 rounded-xl flex items-center gap-3 text-orange-800 text-[12px] font-bold">
                   <AlertCircle size={16} />
                   The payment process is on hold for new sellers due to a change in regulations
                </div>

                <div className="flex items-center gap-12 text-[13px] font-bold">
                   <label className="flex items-center gap-3 cursor-pointer group">
                      <div className="w-5 h-5 rounded-full border-2 border-[#7C3AED] flex items-center justify-center">
                         <div className="w-2.5 h-2.5 bg-[#7C3AED] rounded-full" />
                      </div>
                      <span className="text-[#444] dark:text-slate-300">KYC for Individuals</span>
                   </label>
                   <label className="flex items-center gap-3 cursor-pointer group opacity-50">
                      <div className="w-5 h-5 rounded-full border-2 border-slate-300"></div>
                      <span className="text-[#666]">KYC for Businesses</span>
                   </label>
                   <div className="flex-1 text-right">
                      <button className="px-6 py-2 bg-[#E9D5FF] text-[#7C3AED] rounded-lg font-black text-[12px] hover:bg-[#D8B4FE] transition-all">
                         Add Kyc Details
                      </button>
                   </div>
                </div>

                <div className="space-y-4 text-[13px] font-bold text-[#666] dark:text-slate-400 pl-2">
                   <p>A. Proof of Address :- Recent bank statement or <span className="underline cursor-pointer">Utility Bill (Aadhaar for Indian Users)</span></p>
                   <p>B. Owner details with ID (Preferably Passport/ PAN mandatory for Indian users)</p>
                   <p className="text-[11px] font-medium text-[#999] pt-2"> - Foreign ID document submitted must fulfill the following criteria:</p>
                   <ul className="pl-6 space-y-1 text-[11px] font-medium text-[#999]">
                      <li>1) Photo ID</li>
                      <li>2) Full Name including Aliases</li>
                      <li>3) Unique Identification Number</li>
                      <li>4) Nationality</li>
                   </ul>
                </div>
             </div>
           )}
        </div>

        {/* Custom Labels and fields */}
        <div>
           <SectionHeader title="Custom Labels and fields" />
           {expandedSections.includes("Custom Labels and fields") && (
             <div className="py-8 space-y-8 max-w-4xl">
                <div className="flex items-center justify-between">
                   <div className="space-y-1">
                      <p className="text-[13px] font-black text-[#1A1A1A] dark:text-white">Hide # in all Document Number series</p>
                      <p className="text-[11px] font-medium text-[#999]">Disable to show # from all Document Serial Numbers</p>
                   </div>
                   <div className="w-10 h-5 bg-[#7C3AED] rounded-full relative">
                      <div className="absolute right-0.5 top-0.5 w-4 h-4 bg-white rounded-full" />
                   </div>
                </div>

                <div className="flex items-start justify-between">
                   <div className="space-y-1">
                      <p className="text-[13px] font-black text-[#1A1A1A] dark:text-white">Reset Document Serial Numbers</p>
                      <p className="text-[11px] font-medium text-[#999]">Resetting will reset serial numbers for all future invoices and documents</p>
                   </div>
                   <button className="px-5 py-2 bg-[#7C3AED] text-white rounded-lg font-black text-[11px] uppercase tracking-widest hover:bg-[#6D28D9] transition-all">
                      Reset Series
                   </button>
                </div>

                <div className="flex items-start justify-between">
                   <div className="space-y-1">
                      <p className="text-[13px] font-black text-[#1A1A1A] dark:text-white">Manage Document Labels</p>
                      <p className="text-[11px] font-medium text-[#999]">Edit Labels for key input fields in accounting documents</p>
                   </div>
                   <button className="px-5 py-2 bg-[#7C3AED] text-white rounded-lg font-black text-[11px] uppercase tracking-widest hover:bg-[#6D28D9] transition-all">
                      Manage
                   </button>
                </div>
             </div>
           )}
        </div>

        {/* Experimental */}
        <div>
           <SectionHeader title="Experimental" />
           {expandedSections.includes("Experimental") && (
             <div className="py-8 space-y-8 max-w-4xl">
                <div className="flex items-center justify-between">
                   <div className="space-y-1">
                      <p className="text-[13px] font-black text-[#1A1A1A] dark:text-white">Optimize Invoice Performance with Scrollable Line Items</p>
                      <p className="text-[11px] font-medium text-[#999]">Handle large numbers of line items effortlessly. Enable for a smoother performance.</p>
                   </div>
                   <div className="w-10 h-5 bg-[#7C3AED] rounded-full relative">
                      <div className="absolute right-0.5 top-0.5 w-4 h-4 bg-white rounded-full" />
                   </div>
                </div>

                <div className="flex items-center justify-between">
                   <div className="space-y-1">
                      <p className="text-[13px] font-black text-[#1A1A1A] dark:text-white">Enable javascript for Invoices and other documents during PDF Downloads</p>
                      <p className="text-[11px] font-medium text-[#999]">Enable to include tables in your invoices descriptions.</p>
                   </div>
                   <div className="w-10 h-5 bg-[#7C3AED] rounded-full relative">
                      <div className="absolute right-0.5 top-0.5 w-4 h-4 bg-white rounded-full" />
                   </div>
                </div>

                <div className="flex items-center justify-between">
                   <div className="space-y-1">
                      <p className="text-[13px] font-black text-[#1A1A1A] dark:text-white">Visibility of GST & PAN</p>
                      <p className="text-[11px] font-medium text-[#999]">Configure when you want to show GST No. and PAN</p>
                   </div>
                   <button className="flex items-center gap-2 px-5 py-2 border border-[#F0EAF0] dark:border-slate-800 rounded-lg text-[12px] font-bold text-[#666] hover:bg-slate-50 transition-all">
                      <Settings size={14} /> Configure
                   </button>
                </div>
             </div>
           )}
        </div>

        {/* Add QR Codes to Documents */}
        <div>
           <SectionHeader title="Add QR Codes to Documents" />
           {expandedSections.includes("Add QR Codes to Documents") && (
             <div className="py-8 space-y-6 max-w-4xl">
                <div className="flex items-center justify-between">
                   <div className="space-y-1">
                      <p className="text-[14px] font-black text-[#1A1A1A] dark:text-white">Add and display QR codes on your accounting documents.</p>
                      <p className="text-[12px] font-medium text-[#999]">Enable this to display QR codes on your accounting documents.</p>
                   </div>
                   <div className="w-10 h-5 bg-slate-200 dark:bg-slate-700 rounded-full relative cursor-pointer">
                      <div className="absolute left-0.5 top-0.5 w-4 h-4 bg-white rounded-full shadow-sm" />
                   </div>
                </div>
             </div>
           )}
        </div>

        {/* Document Acceptance */}
        <div>
           <SectionHeader title="Document Acceptance" />
           {expandedSections.includes("Document Acceptance") && (
             <div className="py-8 space-y-6 max-w-4xl">
                <div className="flex items-center justify-between">
                   <div className="space-y-1">
                      <p className="text-[14px] font-black text-[#1A1A1A] dark:text-white">Enable your clients/vendors to accept shared documents</p>
                      <p className="text-[12px] font-medium text-[#999]">Enable your clients or vendors to formally accept documents, adding an extra layer of confirmation to your business transactions. When activated, clients can accept documents directly through our platform, with options for email verification and a brief undo period.</p>
                   </div>
                   <div className="w-10 h-5 bg-slate-200 dark:bg-slate-700 rounded-full relative cursor-pointer">
                      <div className="absolute left-0.5 top-0.5 w-4 h-4 bg-white rounded-full shadow-sm" />
                   </div>
                </div>
             </div>
           )}
        </div>
      </div>
    </SettingsLayout>
  );
}
