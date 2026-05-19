"use client";

import { useState } from "react";
import { X, Loader2, User, Phone, Mail, MapPin, Tag, ShieldCheck } from "lucide-react";
import { vendorsApi } from "@/lib/api";
import { useToast } from "@/context/ToastContext";

interface VendorFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (newVendor: any) => void;
}

const EMPTY_FORM = {
  name: "",
  contact: "",
  email: "",
  address: "",
  remark: "",
  gstNumber: "",
  category: "General",
  paymentTerms: "IMMEDIATE" as const,
  status: "ACTIVE" as const
};

export default function VendorFormModal({ isOpen, onClose, onSuccess }: VendorFormModalProps) {
  const { showToast } = useToast();
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);

  if (!isOpen) return null;

  const handleSave = async () => {
    if (!form.name || !form.contact) {
      showToast("Vendor name and contact are required", "error");
      return;
    }

    setSaving(true);
    try {
      const response = await vendorsApi.create(form);
      const v = response.data;
      
      // Map to context-friendly structure
      const mappedVendor = {
        id: v.id,
        name: v.name,
        phone: v.phone || v.mobile || v.contact,
        email: v.email,
        gstNumber: v.gstNumber,
        advanceBalance: v.advanceBalance || 0,
        balanceDue: v.balanceDue || 0,
        vendorCode: v.vendorCode,
        suppliedMaterials: [] 
      };

      showToast("New vendor registered successfully", "success");
      onSuccess(mappedVendor);
      onClose();
      setForm(EMPTY_FORM);
    } catch (error: any) {
      console.error("Failed to save vendor", error);
      showToast(error.response?.data?.error || "Failed to create vendor", "error");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-in fade-in duration-300">
      <div 
        className="bg-white dark:bg-[#0A0D14] rounded-[2.5rem] shadow-2xl w-full max-w-2xl overflow-hidden border border-slate-100 dark:border-white/5 animate-in zoom-in-95 duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-slate-50 dark:bg-slate-900/50 px-8 py-6 border-b border-slate-100 dark:border-white/5 flex items-center justify-between">
           <div>
              <h2 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight flex items-center gap-2">
                 <User className="text-[#7C3AED]" /> New Vendor Identity
              </h2>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Onboard a new supplier to the ERP ecosystem</p>
           </div>
           <button 
             onClick={onClose}
             className="p-2 hover:bg-white dark:hover:bg-slate-800 rounded-full text-slate-400 transition-all"
           >
              <X size={20} />
           </button>
        </div>

        {/* Form Body */}
        <div className="p-8 space-y-8">
           <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Primary Info */}
              <div className="space-y-6">
                 <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5 ml-1">
                       <User size={12} /> Vendor Legal Name
                    </label>
                    <input 
                       autoFocus
                       placeholder="e.g. Reliance Fresh"
                       value={form.name}
                       onChange={(e) => setForm({...form, name: e.target.value})}
                       className="w-full px-4 py-3 bg-slate-50 dark:bg-white/5 border border-transparent dark:border-white/10 rounded-2xl font-bold text-sm outline-none focus:ring-2 ring-[#7C3AED]/20 focus:bg-white transition-all"
                    />
                 </div>

                 <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5 ml-1">
                       <Phone size={12} /> Contact Number
                    </label>
                    <input 
                       placeholder="10 digit mobile..."
                       maxLength={10}
                       value={form.contact}
                       onChange={(e) => setForm({...form, contact: e.target.value.replace(/\D/g, "")})}
                       className="w-full px-4 py-3 bg-slate-50 dark:bg-white/5 border border-transparent dark:border-white/10 rounded-2xl font-bold text-sm outline-none focus:ring-2 ring-[#7C3AED]/20 focus:bg-white transition-all"
                    />
                 </div>

                 <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5 ml-1">
                       <Mail size={12} /> Email Address
                    </label>
                    <input 
                       placeholder="vendor@company.com"
                       value={form.email}
                       onChange={(e) => setForm({...form, email: e.target.value})}
                       className="w-full px-4 py-3 bg-slate-50 dark:bg-white/5 border border-transparent dark:border-white/10 rounded-2xl font-bold text-sm outline-none focus:ring-2 ring-[#7C3AED]/20 focus:bg-white transition-all"
                    />
                 </div>
              </div>

              {/* Advanced Info */}
              <div className="space-y-6">
                 <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5 ml-1">
                       <ShieldCheck size={12} /> GST Registration
                    </label>
                    <input 
                       placeholder="22AAAAA0000A1Z5"
                       value={form.gstNumber}
                       onChange={(e) => setForm({...form, gstNumber: e.target.value.toUpperCase()})}
                       className="w-full px-4 py-3 bg-slate-50 dark:bg-white/5 border border-transparent dark:border-white/10 rounded-2xl font-bold text-sm outline-none focus:ring-2 ring-[#7C3AED]/20 focus:bg-white transition-all"
                    />
                 </div>

                 <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5 ml-1">
                       <Tag size={12} /> Payment Cycle
                    </label>
                    <select 
                       value={form.paymentTerms}
                       onChange={(e) => setForm({...form, paymentTerms: e.target.value as any})}
                       className="w-full px-4 py-3 bg-slate-50 dark:bg-white/5 border border-transparent dark:border-white/10 rounded-2xl font-bold text-sm outline-none focus:ring-2 ring-[#7C3AED]/20 focus:bg-white transition-all"
                    >
                       <option value="IMMEDIATE">Immediate</option>
                       <option value="NET_7">Net 7 Days</option>
                       <option value="NET_30">Net 30 Days</option>
                       <option value="ADVANCE">Advance Required</option>
                    </select>
                 </div>

                 <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5 ml-1">
                       <MapPin size={12} /> Business Address
                    </label>
                    <textarea 
                       placeholder="Full registered address..."
                       rows={2}
                       value={form.address}
                       onChange={(e) => setForm({...form, address: e.target.value})}
                       className="w-full px-4 py-3 bg-slate-50 dark:bg-white/5 border border-transparent dark:border-white/10 rounded-2xl font-bold text-sm outline-none focus:ring-2 ring-[#7C3AED]/20 focus:bg-white transition-all resize-none"
                    />
                 </div>
              </div>
           </div>
        </div>

        {/* Footer Actions */}
        <div className="px-8 py-6 bg-slate-50 dark:bg-slate-900/50 border-t border-slate-100 dark:border-white/5 flex gap-4">
           <button 
             onClick={onClose}
             className="px-6 py-3 text-xs font-black text-slate-500 uppercase tracking-widest hover:bg-white rounded-xl transition-all"
           >
              Discard
           </button>
           <button 
             onClick={handleSave}
             disabled={saving}
             className="flex-1 bg-[#7C3AED] text-white py-3 rounded-2xl text-xs font-black uppercase tracking-widest shadow-xl shadow-purple-200 active:scale-95 transition-all flex items-center justify-center gap-2"
           >
              {saving ? <Loader2 size={16} className="animate-spin" /> : "Confirm Registration"}
           </button>
        </div>
      </div>
    </div>
  );
}
