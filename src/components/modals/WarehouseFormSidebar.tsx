"use client";

import { useState, useEffect } from "react";
import { X, Warehouse, MapPin, Tag, CheckCircle2, Loader2, ArrowRight } from "lucide-react";
import { inventoryApi } from "@/lib/api";
import toast from "react-hot-toast";
import { clsx } from "clsx";

interface WarehouseFormSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (warehouse: any) => void;
  warehouseToEdit?: any;
}

export default function WarehouseFormSidebar({ isOpen, onClose, onSuccess, warehouseToEdit }: WarehouseFormSidebarProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    location: "",
    type: "MAIN"
  });

  useEffect(() => {
    if (warehouseToEdit) {
      setFormData({
        name: warehouseToEdit.name || "",
        location: warehouseToEdit.location || "",
        type: warehouseToEdit.type || "MAIN"
      });
    } else {
      setFormData({ name: "", location: "", type: "MAIN" });
    }
  }, [warehouseToEdit, isOpen]);

  // Handle ESC key to close
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [onClose]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name) {
      toast.error("Warehouse name is required");
      return;
    }

    setLoading(true);
    try {
      if (warehouseToEdit) {
        const response = await inventoryApi.updateWarehouse(warehouseToEdit.id, formData);
        toast.success("Warehouse updated successfully");
        onSuccess(response.data);
      } else {
        const response = await inventoryApi.createWarehouse(formData);
        toast.success("Warehouse created successfully");
        onSuccess(response.data);
      }
      onClose();
    } catch (error: any) {
      console.error(error);
      toast.error(error.response?.data?.error || "Failed to create warehouse");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Backdrop */}
      <div 
        className={clsx(
          "fixed inset-0 z-[100] bg-slate-900/40 backdrop-blur-[2px] transition-opacity duration-500",
          isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        )}
        onClick={onClose}
      />

      {/* Sidebar Panel */}
      <div 
        className={clsx(
          "fixed inset-y-0 right-0 z-[110] w-full max-w-md bg-white dark:bg-[#0A0D14] shadow-2xl transition-transform duration-500 ease-in-out transform border-l border-slate-100 dark:border-slate-800",
          isOpen ? "translate-x-0" : "translate-x-full"
        )}
      >
        <div className="h-full flex flex-col">
          {/* Header */}
          <div className="p-8 border-b border-slate-50 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
            <div className="flex items-center justify-between mb-8">
              <button 
                onClick={onClose}
                className="p-2 hover:bg-white dark:hover:bg-slate-800 rounded-xl transition-all text-slate-400 group"
              >
                <X size={20} className="group-hover:rotate-90 transition-transform duration-300" />
              </button>
              <div className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                <span>Warehouse Hub</span>
                <ArrowRight size={10} />
                <span className="text-purple-600">{warehouseToEdit ? "Edit Location" : "New Location"}</span>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="p-4 bg-purple-600 rounded-[1.5rem] shadow-lg shadow-purple-200 text-white">
                <Warehouse size={28} />
              </div>
              <div>
                <h2 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tight leading-none mb-1">
                  {warehouseToEdit ? "Update Warehouse" : "Add Warehouse"}
                </h2>
                <p className="text-xs text-slate-400 font-bold">
                  {warehouseToEdit ? "Modify storage or production unit details" : "Configure a new storage or production unit"}
                </p>
              </div>
            </div>
          </div>

          {/* Form Content */}
          <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-8 space-y-8">
            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                  <Tag size={12} className="text-purple-500" /> Warehouse Name *
                </label>
                <input 
                  autoFocus
                  type="text"
                  required
                  placeholder="e.g. Central Distribution Hub"
                  className="w-full text-sm font-bold bg-slate-50 dark:bg-slate-900 border-none rounded-2xl p-4 outline-none focus:ring-2 ring-purple-500/20 transition-all placeholder:text-slate-300"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                  <MapPin size={12} className="text-blue-500" /> Physical Location
                </label>
                <textarea 
                  placeholder="Street address, City, Region..."
                  className="w-full min-h-[100px] text-sm font-bold bg-slate-50 dark:bg-slate-900 border-none rounded-2xl p-4 outline-none focus:ring-2 ring-purple-500/20 transition-all placeholder:text-slate-300 resize-none"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                />
              </div>

              <div className="p-6 bg-slate-50 dark:bg-slate-900/50 rounded-3xl border border-dashed border-slate-200 dark:border-slate-800">
                <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Quick Tips</h4>
                <ul className="space-y-3">
                  <li className="flex items-start gap-3">
                    <div className="w-1.5 h-1.5 rounded-full bg-purple-500 mt-1" />
                    <p className="text-[10px] font-bold text-slate-500 leading-relaxed">Name should be unique to avoid confusion in stock transfers.</p>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-1" />
                    <p className="text-[10px] font-bold text-slate-500 leading-relaxed">Location helps in calculating lead times for procurement.</p>
                  </li>
                </ul>
              </div>
            </div>
          </form>

          {/* Footer Actions */}
          <div className="p-8 bg-slate-50 dark:bg-slate-900/50 border-t border-slate-100 dark:border-slate-800">
            <div className="flex gap-4">
              <button 
                type="button"
                onClick={onClose}
                className="flex-1 py-4 text-xs font-black text-slate-500 bg-white border border-slate-200 rounded-2xl hover:bg-slate-50 transition-all uppercase tracking-widest"
              >
                Cancel
              </button>
              <button 
                disabled={loading}
                onClick={handleSubmit}
                className="flex-[2] py-4 bg-slate-900 dark:bg-purple-600 text-white text-xs font-black rounded-2xl shadow-xl hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-2 uppercase tracking-widest disabled:opacity-50"
              >
                {loading ? (
                  <Loader2 size={18} className="animate-spin" />
                ) : (
                  <>
                    <CheckCircle2 size={18} /> {warehouseToEdit ? "Update Warehouse" : "Save Warehouse"}
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
