"use client";

import { useState } from "react";
import SettingsLayout from "@/components/modules/settings/SettingsLayout";
import { 
  ChevronDown, 
  ChevronUp, 
  Plus, 
  Columns, 
  Pencil, 
  Copy, 
  Trash2, 
  EyeOff, 
  MoreVertical,
  Filter
} from "lucide-react";
import { clsx } from "clsx";

export default function EmailSettingsPage() {
  const [expandedSections, setExpandedSections] = useState<string[]>([
    "Emails Templates", "Email Settings", "Emails & Notifications"
  ]);

  const toggleSection = (section: string) => {
    setExpandedSections(prev => 
      prev.includes(section) ? prev.filter(s => s !== section) : [...prev, section]
    );
  };

  const templates = [
    { name: "Share Product Details", category: "Sales CRM", status: "LIVE", creator: "Ikasle Business Group", unpublished: "No", subject: "Our offerings for {{company.name}}", date: "Apr 16 2026 21:35" },
    { name: "Feedback Request For Lost Leads", category: "Sales CRM", status: "LIVE", creator: "Ikasle Business Group", unpublished: "No", subject: "Would you like to give any feedback?", date: "Apr 16 2026 21:35" },
    { name: "Take The Conversation Forward", category: "Sales CRM", status: "LIVE", creator: "Ikasle Business Group", unpublished: "No", subject: "Moving Forward: Next Steps for {{company.name}}", date: "Apr 16 2026 21:35" },
    { name: "Upcoming Meeting Reminder", category: "Sales CRM", status: "LIVE", creator: "Ikasle Business Group", unpublished: "No", subject: "Reminder: upcoming meeting with {{company.name}}", date: "Apr 16 2026 21:35" },
    { name: "Missed Meeting Check-In", category: "Sales CRM", status: "LIVE", creator: "Ikasle Business Group", unpublished: "No", subject: "{{contact.name}}, should we reschedule our meeting?", date: "Apr 16 2026 21:35" },
    { name: "Lead Inquiry Response", category: "Sales CRM", status: "LIVE", creator: "Ikasle Business Group", unpublished: "No", subject: "Regarding your requirement for {{company.name}}", date: "Apr 16 2026 21:35" },
    { name: "Lead Follow-up Email", category: "Sales CRM", status: "LIVE", creator: "Ikasle Business Group", unpublished: "No", subject: "Following up on your requirement for {{company.name}}", date: "Apr 16 2026 21:35" },
  ];

  const notificationItems = [
    { label: "New Leads WhatsApp Alert", premium: true, desc: "Sent to team members who have access to View Leads. They can opt-out via their user settings > notifications & alerts > leads notifications", enabled: true },
    { label: "Lead Follow-up Reminders", premium: true, desc: "Get notified of all upcoming lead follow-ups.", enabled: true },
    { label: "Notify Creator on Document Reassignment/Approval Move", premium: true, desc: "Notify the creator when the document is reassigned or moved for approval.", enabled: false },
    { label: "Notify Creator on Document Completion/Discard", premium: true, desc: "Notify the creator when the document is completed or discarded.", enabled: false },
    { label: "Notify Approvers on Document Assignment", premium: true, desc: "Notify approvers when a document is assigned to them.", enabled: true },
    { label: "Enable Inventory Stock Alerts for your Business", premium: true, desc: "Stay informed when items go low, critical or are overstocked", enabled: true },
    { label: "Testimonial Emails", premium: false, desc: "Collect automatic testimonials from your clients when an invoice is paid offline", enabled: false },
    { label: "Payment Receipts", premium: false, desc: "Automatically inform the client when an invoice is marked paid offline", enabled: true },
    { label: "Quotation Created Notification", premium: false, desc: "Email client when you create a quotation for their requirement", enabled: true },
    { label: "Notify Referrer after requirement is created", premium: false, desc: "Notify the person who Referred you a lead that the requirement for that lead has been created", enabled: true },
    { label: "Notify Lead that they got Referred to You", premium: false, desc: "When a Person A refers a Person B to your Business, send an email to Person B that you have received their lead via Person A's Reference.", enabled: true },
    { label: "Notify Client on Lead Comments", premium: false, desc: "Notify your client via email when you send them a message from the 'Activity History' section, i.e. from Sales Pipeline > Lead > Activity History", enabled: true },
    { label: "Lead Create Notification", premium: false, desc: "Enable this option to receive notifications for newly created leads", enabled: true },
    { label: "Lead Auto Assign Notification", premium: false, desc: "Enable this option to receive notification for automatically assigned leads to assigned team members", enabled: false },
    { label: "Get an Email when your Document is Re-Assigned or moved for Approval", premium: false, desc: "Get an email notification when your document is re-assigned or moved for approval.", enabled: true },
    { label: "Get an Email when your Document is Completed or Discarded", premium: false, desc: "Get an email notification when your document is completed or discarded.", enabled: true },
    { label: "Get an Email when a Document is assigned to you for Approval", premium: false, desc: "Get an email notification when a document is assigned to you for approval.", enabled: true },
  ];

  const SectionHeader = ({ title, icon }: { title: string, icon?: boolean }) => {
    const isExpanded = expandedSections.includes(title);
    return (
      <button 
        onClick={() => toggleSection(title)}
        className="w-full flex items-center justify-between p-5 border-b border-[#FDFCFD] dark:border-slate-800 bg-[#FAF9FA] dark:bg-slate-800/20 group"
      >
        <div className="flex items-center gap-3">
           {isExpanded ? <ChevronUp size={18} className="text-[#1A1A1A] dark:text-white" /> : <ChevronDown size={18} className="text-[#999]" />}
           <div className="space-y-0.5 text-left text-[14px] font-black font-black text-[#1A1A1A] dark:text-white">
              {title} {icon && <span className="opacity-60 ml-2">✨</span>}
           </div>
        </div>
      </button>
    );
  };

  return (
    <SettingsLayout>
      <div className="space-y-6">
        <h2 className="text-[17px] font-black text-[#1A1A1A] dark:text-white mb-6">Email Settings</h2>

        <div className="border border-[#FDFCFD] dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm">
           <SectionHeader title="Emails Templates" />
           {expandedSections.includes("Emails Templates") && (
             <div className="p-6 space-y-6 bg-white dark:bg-slate-900">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                   <h4 className="text-[15px] font-black text-[#1A1A1A] dark:text-white">All Email Templates</h4>
                   <button className="flex items-center gap-2 px-5 py-2.5 border-2 border-[#7C3AED] rounded-xl text-[12px] font-black text-[#7C3AED] hover:bg-purple-50 transition-all">
                      <Plus size={16} /> Create New Template
                   </button>
                </div>

                <div className="flex items-center justify-between text-[12px] font-bold text-[#999]">
                   <p>Showing <span className="text-[#1A1A1A]">1 to 7</span> of <span className="text-[#1A1A1A]">7</span> templates</p>
                   <button className="flex items-center gap-2 px-4 py-2 bg-[#FAF9FA] border border-[#F6F4F6] rounded-lg text-[11px] font-black text-[#666] hover:bg-slate-50">
                      <Columns size={14} /> Show/Hide Columns
                   </button>
                </div>

                <div className="overflow-x-auto border border-slate-100 rounded-xl">
                   <table className="w-full text-left min-w-[1200px]">
                     <thead>
                       <tr className="bg-[#FAF9FA]/50 border-b border-slate-100 text-[10px] text-[#999] uppercase font-bold tracking-wider">
                         <th className="p-4">Template Name</th>
                         <th className="p-4">Category</th>
                         <th className="p-4">Status</th>
                         <th className="p-4">Created By</th>
                         <th className="p-4">Unpublished changes?</th>
                         <th className="p-4">Subject <Filter size={10} className="inline ml-1 opacity-40" /></th>
                         <th className="p-4">Create</th>
                       </tr>
                     </thead>
                     <tbody className="text-[12px] font-bold text-[#444] dark:text-slate-200">
                       {templates.map((t, i) => (
                         <tr key={i} className="border-b border-slate-50 last:border-0 hover:bg-slate-50/50 group transition-colors">
                           <td className="p-4 text-[#1A1A1A] max-w-[200px] leading-tight">{t.name}</td>
                           <td className="p-4 text-[#666]">{t.category}</td>
                           <td className="p-4">
                              <span className="px-2 py-1 bg-green-50 text-green-600 text-[9px] rounded font-black">LIVE</span>
                           </td>
                           <td className="p-4 text-[#666]">{t.creator}</td>
                           <td className="p-4 text-[#666]">{t.unpublished}</td>
                           <td className="p-4 text-[#1A1A1A] italic font-medium opacity-80">{t.subject}</td>
                           <td className="p-4">
                              <div className="flex items-center gap-4 text-[#666] opacity-0 group-hover:opacity-100 transition-opacity">
                                 <button title="Edit" className="hover:text-[#7C3AED] transition-colors"><Pencil size={14} /></button>
                                 <button title="Duplicate" className="hover:text-[#7C3AED] transition-colors"><Copy size={14} /></button>
                                 <button title="Remove" className="hover:text-red-500 transition-colors"><Trash2 size={14} /></button>
                                 <button title="Mark as Inactive" className="hover:text-[#7C3AED] transition-colors"><EyeOff size={14} /></button>
                                 <button title="More" className="hover:text-[#7C3AED] transition-colors"><MoreVertical size={14} /></button>
                              </div>
                              <p className="text-[10px] text-[#999] mt-1 group-hover:hidden">{t.date}</p>
                           </td>
                         </tr>
                       ))}
                     </tbody>
                   </table>
                </div>

                <div className="flex justify-end pt-4">
                   <button className="flex items-center gap-2 px-4 py-2 bg-[#FAF9FA] border border-[#F6F4F6] rounded-lg text-[11px] font-black text-[#666] hover:bg-slate-50">
                      <Columns size={14} /> Show/Hide Columns
                   </button>
                </div>
             </div>
           )}
        </div>

        {/* Email Settings Integrations */}
        <div className="border border-[#FDFCFD] dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm">
           <SectionHeader title="Email Settings" icon />
           {expandedSections.includes("Email Settings") && (
             <div className="p-6 bg-white dark:bg-slate-900">
                <div className="p-8 bg-[#FFF5F7] border border-[#FFEBEE] rounded-3xl flex flex-col md:flex-row items-center justify-between gap-8">
                   <div className="space-y-2">
                      <h4 className="text-[15px] font-black text-[#1A1A1A] dark:text-white">Connect your Personal and Work emails</h4>
                      <p className="text-[12px] font-medium text-[#666]">Send Invoice, Quotation etc. emails from your own email address.</p>
                   </div>
                   <div className="space-y-3 w-full md:w-auto">
                      <button className="w-full md:w-64 px-6 py-2.5 bg-white border border-slate-100 rounded-xl flex items-center justify-center gap-3 text-[13px] font-bold text-[#1A1A1A] hover:shadow-md transition-shadow">
                         <img src="https://upload.wikimedia.org/wikipedia/commons/7/7e/Gmail_icon_%282020%29.svg" className="w-4 h-4" alt="Gmail" />
                         Connect To Gmail
                      </button>
                      <button className="w-full md:w-64 px-6 py-2.5 bg-white border border-slate-100 rounded-xl flex items-center justify-center gap-3 text-[13px] font-bold text-[#1A1A1A] hover:shadow-md transition-shadow">
                         <img src="https://upload.wikimedia.org/wikipedia/commons/4/44/Microsoft_logo.svg" className="w-4 h-4" alt="Outlook" />
                         Connect To Outlook
                      </button>
                      <button className="w-full md:w-64 px-6 py-2.5 bg-white border border-slate-100 rounded-xl flex items-center justify-center gap-3 text-[13px] font-bold text-[#1A1A1A] hover:shadow-md transition-shadow">
                         <span className="w-4 h-4 bg-orange-400 rounded flex items-center justify-center" />
                         Custom Domain
                      </button>
                   </div>
                </div>
             </div>
           )}
        </div>

        {/* Emails & Notifications */}
        <div className="border border-[#FDFCFD] dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm">
           <SectionHeader title="Emails & Notifications" />
           {expandedSections.includes("Emails & Notifications") && (
             <div className="p-6 bg-white dark:bg-slate-900 space-y-1">
                {notificationItems.map((item, i) => (
                   <div key={i} className="flex items-center justify-between py-6 border-b border-slate-50 last:border-0">
                      <div className="space-y-1 pr-12">
                         <div className="flex items-center gap-2">
                            <p className="text-[14px] font-black text-[#1A1A1A] dark:text-white leading-tight">{item.label}</p>
                            {item.premium && <span className="text-[12px] opacity-60">💎</span>}
                         </div>
                         <p className="text-[12px] font-medium text-[#999] leading-tight max-w-2xl">{item.desc}</p>
                      </div>
                      <div className={clsx(
                        "w-10 h-5 rounded-full relative cursor-pointer flex items-center transition-all",
                        item.enabled ? "bg-[#7C3AED]" : "bg-slate-200"
                      )}>
                         <div className={clsx(
                           "w-4 h-4 bg-white rounded-full transition-all shadow-sm",
                           item.enabled ? "ml-5.5" : "ml-0.5"
                         )} />
                      </div>
                   </div>
                ))}
             </div>
           )}
        </div>
      </div>
    </SettingsLayout>
  );
}
