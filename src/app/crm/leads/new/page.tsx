"use client";

import { useState, useEffect } from "react";
import { ChevronRight, ChevronDown, ChevronUp, Plus } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import api from "@/lib/api";

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

const FIELD = "w-full px-4 py-3 bg-white border border-[#F0EAF0] rounded-xl text-sm outline-none focus:border-[#7C3AED] transition-all";
const LABEL = "text-[11px] font-bold text-[#1A1A1A] uppercase tracking-widest";

export default function NewLeadPage() {
  const router = useRouter();
  const [openSection, setOpenSection] = useState<string | null>("Contact & Customer Details");
  const [pipelines, setPipelines] = useState<{ id: string; name: string }[]>([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    pipelineId: "",
    contactName: "",
    contactCountry: "India",
    customerCity: "",
    phone: "",
    email: "",
    designation: "",
    orgName: "",
    leadSource: "",
    status: "NEW" as const,
    budget: "",
    subject: "",
    followUpDate: ""
  });

  useEffect(() => {
    api.get("/api/crm/pipelines").then((res) => {
      setPipelines(res.data);
      if (res.data.length > 0) setForm((f) => ({ ...f, pipelineId: res.data[0].id }));
    }).catch(() => {});
  }, []);

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  const handleSubmit = async () => {
    if (!form.contactName.trim()) { setError("Contact name is required"); return; }
    if (!form.pipelineId) { setError("Select a pipeline"); return; }
    setSaving(true);
    setError("");
    try {
      await api.post("/api/crm/leads", {
        ...form,
        budget: form.budget ? Number(form.budget) : undefined,
        followUpDate: form.followUpDate || undefined
      });
      router.push("/crm/leads");
    } catch (e: any) {
      setError(e.response?.data?.error || "Failed to create lead");
    } finally {
      setSaving(false);
    }
  };

  const toggleSection = (section: string) =>
    setOpenSection(openSection === section ? null : section);

  return (
    <div className="min-h-screen bg-[#FDFCFD] dark:bg-[#020617] -m-8">
      <div className="max-w-[1000px] mx-auto p-10 space-y-8">

        <nav className="flex items-center gap-2 text-[11px] font-bold text-[#999] uppercase tracking-widest">
          <Link href="/crm/pipelines" className="hover:text-[#7C3AED] transition-colors">CRM</Link>
          <ChevronRight size={12} />
          <Link href="/crm/leads" className="hover:text-[#7C3AED] transition-colors">All Leads</Link>
          <ChevronRight size={12} />
          <span className="text-[#1A1A1A]">Add New Lead</span>
        </nav>

        <h1 className="text-3xl font-black text-[#1A1A1A]">Add New Lead</h1>

        {error && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-sm text-red-600 font-medium">{error}</div>
        )}

        <div className="bg-white rounded-3xl border border-[#F0EAF0] shadow-2xl shadow-purple-100/20 overflow-hidden">

          {/* Pipeline Selector */}
          <div className="px-10 py-6 border-b border-[#F0EAF0]">
            <div className="space-y-2">
              <label className={LABEL}>Sales Pipeline <span className="text-red-500">*</span></label>
              <div className="relative">
                <select value={form.pipelineId} onChange={set("pipelineId")} className={FIELD + " appearance-none"}>
                  <option value="">Select pipeline...</option>
                  {pipelines.map((p) => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>
                <ChevronDown size={14} className="absolute right-4 top-1/2 -translate-y-1/2 text-[#999] pointer-events-none" />
              </div>
            </div>
          </div>

          <FormAccordion
            title="Contact & Customer Details"
            isOpen={openSection === "Contact & Customer Details"}
            onToggle={() => toggleSection("Contact & Customer Details")}
          >
            <div className="space-y-10">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-10">

                <div className="space-y-2">
                  <label className={LABEL}>Contact Name <span className="text-red-500">*</span></label>
                  <input value={form.contactName} onChange={set("contactName")} type="text" placeholder="Enter name" className={FIELD} />
                </div>

                <div className="space-y-2">
                  <label className={LABEL}>Country <span className="text-red-500">*</span></label>
                  <div className="relative">
                    <select value={form.contactCountry} onChange={set("contactCountry")} className={FIELD + " appearance-none"}>
                      {["India", "United States", "UAE", "UK", "Canada", "Australia", "Singapore"].map((c) => (
                        <option key={c}>{c}</option>
                      ))}
                    </select>
                    <ChevronDown size={14} className="absolute right-4 top-1/2 -translate-y-1/2 text-[#999] pointer-events-none" />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className={LABEL}>City</label>
                  <input value={form.customerCity} onChange={set("customerCity")} type="text" className={FIELD} />
                </div>

                <div className="space-y-2">
                  <label className={LABEL}>Phone</label>
                  <input value={form.phone} onChange={set("phone")} type="text" placeholder="+91 XXXXX XXXXX" className={FIELD} />
                </div>

                <div className="space-y-2">
                  <label className={LABEL}>Email</label>
                  <input value={form.email} onChange={set("email")} type="email" className={FIELD} />
                </div>

                <div className="space-y-2">
                  <label className={LABEL}>Designation</label>
                  <input value={form.designation} onChange={set("designation")} type="text" className={FIELD} />
                </div>

                <div className="space-y-2 md:col-span-2">
                  <label className={LABEL}>Organisation</label>
                  <input value={form.orgName} onChange={set("orgName")} type="text" placeholder="Company or organisation" className={FIELD} />
                </div>

              </div>
            </div>
          </FormAccordion>

          <FormAccordion title="Lead Details" isOpen={openSection === "Lead Details"} onToggle={() => toggleSection("Lead Details")}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
              <div className="space-y-2">
                <label className={LABEL}>Lead Source</label>
                <div className="relative">
                  <select value={form.leadSource} onChange={set("leadSource")} className={FIELD + " appearance-none"}>
                    {["", "Website", "Referral", "Social Media", "Cold Call", "Email Campaign", "Walk-in", "Exhibition", "Other"].map((s) => (
                      <option key={s} value={s}>{s || "Select..."}</option>
                    ))}
                  </select>
                  <ChevronDown size={14} className="absolute right-4 top-1/2 -translate-y-1/2 text-[#999] pointer-events-none" />
                </div>
              </div>

              <div className="space-y-2">
                <label className={LABEL}>Lead Status</label>
                <div className="relative">
                  <select value={form.status} onChange={set("status")} className={FIELD + " appearance-none"}>
                    {[["NEW", "New"], ["OPEN", "Open"], ["CONTACTED", "Contacted"], ["PROPOSAL_SENT", "Proposal Sent"]].map(([v, l]) => (
                      <option key={v} value={v}>{l}</option>
                    ))}
                  </select>
                  <ChevronDown size={14} className="absolute right-4 top-1/2 -translate-y-1/2 text-[#999] pointer-events-none" />
                </div>
              </div>

              <div className="space-y-2">
                <label className={LABEL}>Budget (₹)</label>
                <input value={form.budget} onChange={set("budget")} type="number" placeholder="0" className={FIELD} />
              </div>

              <div className="space-y-2">
                <label className={LABEL}>Subject</label>
                <input value={form.subject} onChange={set("subject")} type="text" className={FIELD} />
              </div>

              <div className="space-y-2">
                <label className={LABEL}>Follow Up Date</label>
                <input value={form.followUpDate} onChange={set("followUpDate")} type="date" className={FIELD} />
              </div>
            </div>
          </FormAccordion>

          <FormAccordion title="Custom Fields" isOpen={openSection === "Custom Fields"} onToggle={() => toggleSection("Custom Fields")}>
            <button className="flex items-center gap-2 text-xs font-bold text-[#7C3AED] uppercase tracking-widest hover:underline">
              <Plus size={16} /> Add Custom Field
            </button>
          </FormAccordion>

          <div className="p-8 bg-slate-50/50 border-t border-[#F0EAF0] flex items-center gap-4">
            <button
              onClick={handleSubmit}
              disabled={saving}
              className="px-12 py-3 bg-[#7C3AED] text-white rounded-xl font-bold text-sm shadow-xl shadow-purple-100 active:scale-95 transition-all disabled:opacity-50"
            >
              {saving ? "Adding Lead..." : "Add Lead"}
            </button>
            <Link href="/crm/leads" className="px-6 py-3 border border-[#F0EAF0] rounded-xl font-bold text-sm text-[#666]">
              Cancel
            </Link>
          </div>

        </div>
      </div>
    </div>
  );
}
