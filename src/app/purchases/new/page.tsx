"use client";

import DocumentHeader from "@/components/documents/DocumentHeader";
import BillingSection from "@/components/documents/BillingSection";
import LineItemsTable from "@/components/documents/LineItemsTable";
import DocumentSummary from "@/components/documents/DocumentSummary";
import DocumentOptions from "@/components/documents/DocumentOptions";
import { ChevronDown, Calendar, Plus, Warehouse, CreditCard, Tag, FileText, CheckCircle2, Package, ArrowRight, ShieldCheck, Info } from "lucide-react";
import { PurchaseOrderProvider, usePurchaseOrder } from "@/context/PurchaseOrderContext";
import { useState, useEffect } from "react";
import { clsx } from "clsx";

import VendorFormModal from "@/components/modals/VendorFormModal";
import WarehouseFormSidebar from "@/components/modals/WarehouseFormSidebar";
import { inventoryApi, purchaseOrdersApi, settingsApi } from "@/lib/api";
import GSTInvoice from "@/components/documents/GSTInvoice";
import { useRouter } from "next/navigation";
import { toast } from "react-hot-toast";

const FALLBACK_COMPANY = {
  name: "My Restaurant",
  gstin: "",
  address: "",
  phone: "",
  email: "",
  state: "Tamil Nadu"
};

function NewPurchaseContent() {
  const { 
    poNumber, setPoNumber, 
    invoiceNo, setInvoiceNo, 
    purchaseDate, setPurchaseDate, 
    dueDate, setDueDate,
    expectedDeliveryDate, setExpectedDeliveryDate,
    warehouseId, setWarehouseId,
    purchaseType, setPurchaseType,
    paymentTerms, setPaymentTerms,
    poStatus,
    internalNotes, setInternalNotes,
    vendorNotes, setVendorNotes,
    setSelectedVendor,
    isValid, errors, isSubmitting, setIsSubmitting,
    selectedVendor, items, totals, notes
  } = usePurchaseOrder();
  
  const router = useRouter();

  const [activeTab, setActiveTab] = useState<"items" | "notes" | "attachments">("items");
  const [showVendorModal, setShowVendorModal] = useState(false);
  const [showWarehouseModal, setShowWarehouseModal] = useState(false);
  const [warehouses, setWarehouses] = useState<{id: string, name: string}[]>([]);
  const [companyProfile, setCompanyProfile] = useState<any>(null);
  const [showPreview, setShowPreview] = useState(false);

  useEffect(() => {
    const fetchWarehouses = async () => {
      try {
        const response = await inventoryApi.getWarehouses();
        setWarehouses(response.data);
      } catch (error) {
        console.error("Failed to fetch warehouses", error);
      }
    };
    const fetchCompanyProfile = async () => {
      try {
        const response = await settingsApi.getCompanyProfile();
        setCompanyProfile(response.data);
      } catch (error) {
        console.error("Failed to fetch company profile", error);
      }
    };
    fetchWarehouses();
    fetchCompanyProfile();
  }, []);

  const handleCreatePO = async () => {
    if (!isValid) {
      toast.error("Please fill in all required fields and resolve errors.");
      return;
    }
    
    setIsSubmitting(true);
    try {
      const payload = {
        vendorId: selectedVendor!.id,
        advancePaid: totals.appliedAdvance,
        notes: notes || internalNotes,
        warehouseId: warehouseId,
        purchaseType: purchaseType,
        expectedDeliveryDate: expectedDeliveryDate ? new Date(expectedDeliveryDate).toISOString() : undefined,
        items: items.map(item => ({
          inventoryItemId: item.materialId,
          quantity: item.quantity,
          price: item.price
        }))
      };
      
      await purchaseOrdersApi.create(payload);
      toast.success("Purchase Order created successfully!");
      router.push("/purchases/orders");
    } catch (error) {
      console.error("Failed to Create Purchase Order", error);
      toast.error("Failed to create Purchase Order. Please check your inputs.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSaveDraft = async () => {
    if (!selectedVendor) {
      toast.error("Please select a vendor to save as draft.");
      return;
    }
    
    setIsSubmitting(true);
    try {
      const payload = {
        vendorId: selectedVendor.id,
        advancePaid: totals.appliedAdvance || 0,
        notes: notes || internalNotes || "",
        warehouseId: warehouseId || undefined,
        purchaseType: purchaseType,
        expectedDeliveryDate: expectedDeliveryDate ? new Date(expectedDeliveryDate).toISOString() : undefined,
        status: "DRAFT",
        items: items
          .filter(item => item.materialId)
          .map(item => ({
            inventoryItemId: item.materialId,
            quantity: item.quantity || 0,
            price: item.price || 0
          }))
      };
      
      await purchaseOrdersApi.create(payload);
      toast.success("Draft Purchase Order saved successfully!");
      router.push("/purchases/orders");
    } catch (error) {
      console.error("Failed to save draft", error);
      toast.error("Failed to save draft. Please check your inputs.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-[1600px] mx-auto space-y-6 pb-20">
      
      {/* Vendor Onboarding Modal */}
      <VendorFormModal 
        isOpen={showVendorModal}
        onClose={() => setShowVendorModal(false)}
        onSuccess={(vendor) => {
          setSelectedVendor(vendor);
        }}
      />

      {/* Warehouse Sidebar */}
      <WarehouseFormSidebar 
        isOpen={showWarehouseModal}
        onClose={() => setShowWarehouseModal(false)}
        onSuccess={(warehouse) => {
          setWarehouses(prev => [...prev, warehouse]);
          setWarehouseId(warehouse.id);
        }}
      />

      {/* Professional Page Header (Not Sticky) */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-2">
        <div className="flex flex-col">
          <div className="flex items-center gap-3 mb-1">
             <div className="p-2.5 bg-purple-100 dark:bg-purple-900/30 rounded-xl">
               <Package size={24} className="text-purple-600" />
             </div>
             <h1 className="text-3xl font-black text-gray-900 dark:text-white tracking-tight uppercase">
                New Purchase Order
             </h1>
             <span className={clsx(
               "px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border h-fit",
               poStatus === "DRAFT" ? "bg-slate-50 text-slate-500 border-slate-200" : "bg-purple-50 text-purple-600 border-purple-100"
             )}>
               {poStatus}
             </span>
          </div>
          <p className="text-slate-500 dark:text-slate-400 font-bold text-sm ml-14 flex items-center gap-2">
             <span>#{poNumber}</span>
             <span className="text-slate-300">|</span>
             <span>Procurement Workflow</span>
          </p>
        </div>
        
        <div className="flex items-center gap-3">
           <button 
             onClick={handleSaveDraft}
             disabled={isSubmitting}
             className="px-5 py-2.5 text-xs font-black text-slate-500 hover:bg-slate-50 rounded-xl transition-all uppercase tracking-widest disabled:opacity-50"
           >
             Save Draft
           </button>
           <button
             onClick={() => setShowPreview(true)}
             className="px-5 py-2.5 text-xs font-black text-slate-500 border border-slate-200 rounded-xl hover:bg-slate-50 transition-all flex items-center gap-2 uppercase tracking-widest"
           >
              <FileText size={14} /> Preview
           </button>
           <button 
             onClick={handleCreatePO}
             disabled={!isValid || isSubmitting}
             className="px-8 py-3 bg-[#7C3AED] text-white text-xs font-black rounded-2xl shadow-lg shadow-purple-200 hover:bg-purple-700 disabled:opacity-50 transition-all flex items-center gap-2 uppercase tracking-widest active:scale-95"
           >
              <CheckCircle2 size={16} /> {isSubmitting ? "Creating..." : "Create Purchase Order"}
           </button>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-8">
        {/* Left Main Content */}
        <div className="col-span-12 lg:col-span-9 space-y-8">
          
          {/* Section 1: Meta Information */}
          <div className="bg-white dark:bg-[#0A0D14] rounded-[2.5rem] border border-slate-100 dark:border-slate-800 p-8 shadow-sm">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                   <Tag size={12} /> Purchase Type
                </label>
                <select 
                  value={purchaseType}
                  onChange={(e) => setPurchaseType(e.target.value)}
                  className="w-full text-xs font-bold bg-slate-50 dark:bg-slate-900 border-none rounded-xl p-3 outline-none focus:ring-2 ring-purple-500/20"
                >
                   <option value="RAW_MATERIAL">Raw Material</option>
                   <option value="PACKAGING">Packaging</option>
                   <option value="ASSET">Asset</option>
                   <option value="MISC">Misc</option>
                </select>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                    <Warehouse size={12} /> Warehouse
                  </label>
                  <button 
                    onClick={() => setShowWarehouseModal(true)}
                    className="text-[10px] font-black text-purple-600 hover:text-purple-700 flex items-center gap-1 transition-all uppercase tracking-widest"
                  >
                    <Plus size={10} strokeWidth={3} /> Add New
                  </button>
                </div>
                <select 
                  value={warehouseId}
                  onChange={(e) => setWarehouseId(e.target.value)}
                  className="w-full text-xs font-bold bg-slate-50 dark:bg-slate-900 border-none rounded-xl p-3 outline-none focus:ring-2 ring-purple-500/20"
                >
                   <option value="">Select Warehouse</option>
                   {warehouses.map(w => (
                     <option key={w.id} value={w.id}>{w.name}</option>
                   ))}
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                   <Calendar size={12} /> Expected Delivery
                </label>
                <input 
                  type="date"
                  value={expectedDeliveryDate}
                  onChange={(e) => setExpectedDeliveryDate(e.target.value)}
                  className="w-full text-xs font-bold bg-slate-50 dark:bg-slate-900 border-none rounded-xl p-3 outline-none focus:ring-2 ring-purple-500/20"
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                   <CreditCard size={12} /> Payment Terms
                </label>
                <select 
                  value={paymentTerms}
                  onChange={(e) => setPaymentTerms(e.target.value)}
                  className="w-full text-xs font-bold bg-slate-50 dark:bg-slate-900 border-none rounded-xl p-3 outline-none focus:ring-2 ring-purple-500/20"
                >
                   <option value="IMMEDIATE">Immediate</option>
                   <option value="NET_7">Net 7 Days</option>
                   <option value="NET_30">Net 30 Days</option>
                   <option value="ADVANCE">Advance Required</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-8 pt-8 border-t border-slate-50 dark:border-slate-800">
               <div className="flex flex-col gap-1">
                 <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Document ID</span>
                 <span className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-widest">{poNumber}</span>
               </div>
               <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Vendor Invoice No</label>
                  <input 
                    type="text"
                    value={invoiceNo}
                    onChange={(e) => setInvoiceNo(e.target.value)}
                    placeholder="Reference #"
                    className="w-full text-xs font-bold border-b-2 border-slate-100 dark:border-slate-800 p-1 bg-transparent outline-none focus:border-purple-500 transition-all uppercase placeholder:text-slate-200"
                  />
               </div>
               <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Purchase Date</label>
                  <input 
                    type="date"
                    value={purchaseDate}
                    onChange={(e) => setPurchaseDate(e.target.value)}
                    className="w-full text-xs font-bold border-b-2 border-slate-100 dark:border-slate-800 p-1 bg-transparent outline-none focus:border-purple-500 transition-all"
                  />
               </div>
            </div>
          </div>

          {/* Section 2: Vendor Selection */}
          <BillingSection 
            fromLabel="Billed To (Entity)"
            fromSubLabel="Your Details"
            toLabel="Billed By (Vendor)"
            toSubLabel="Vendor's Details"
            targetType="vendor"
            onAddTarget={() => setShowVendorModal(true)}
          />

          {/* Section 3: Material Table & Accordions */}
          <div className="bg-white dark:bg-[#0A0D14] rounded-[2.5rem] border border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden">
             <div className="flex bg-slate-50/50 dark:bg-slate-900/50 border-b border-slate-100 dark:border-slate-800">
                <button 
                  onClick={() => setActiveTab("items")}
                  className={clsx(
                    "px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] transition-all border-b-2",
                    activeTab === "items" ? "border-[#7C3AED] text-[#7C3AED]" : "border-transparent text-slate-400 hover:text-slate-600"
                  )}
                >
                  Material Items
                </button>
                <button 
                  onClick={() => setActiveTab("notes")}
                  className={clsx(
                    "px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] transition-all border-b-2",
                    activeTab === "notes" ? "border-[#7C3AED] text-[#7C3AED]" : "border-transparent text-slate-400 hover:text-slate-600"
                  )}
                >
                  Notes & Terms
                </button>
                <button 
                  onClick={() => setActiveTab("attachments")}
                  className={clsx(
                    "px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] transition-all border-b-2",
                    activeTab === "attachments" ? "border-[#7C3AED] text-[#7C3AED]" : "border-transparent text-slate-400 hover:text-slate-600"
                  )}
                >
                  Attachments
                </button>
             </div>

             <div className="p-0">
                {activeTab === "items" && <LineItemsTable />}
                {activeTab === "notes" && (
                  <div className="p-10 space-y-10">
                     <div className="grid grid-cols-2 gap-10">
                        <div className="space-y-3">
                           <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Internal Remarks</label>
                           <textarea 
                             value={internalNotes}
                             onChange={(e) => setInternalNotes(e.target.value)}
                             placeholder="Internal collaboration notes..."
                             className="w-full min-h-[140px] p-5 bg-slate-50 dark:bg-slate-900 border-none rounded-[2rem] text-sm outline-none focus:ring-2 ring-purple-500/10"
                           />
                        </div>
                        <div className="space-y-3">
                           <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Supplier Instructions</label>
                           <textarea 
                             value={vendorNotes}
                             onChange={(e) => setVendorNotes(e.target.value)}
                             placeholder="Delivery instructions, terms, etc..."
                             className="w-full min-h-[140px] p-5 bg-slate-50 dark:bg-slate-900 border-none rounded-[2rem] text-sm outline-none focus:ring-2 ring-purple-500/10"
                           />
                        </div>
                     </div>
                  </div>
                )}
                {activeTab === "attachments" && (
                   <div className="p-20 text-center flex flex-col items-center gap-6">
                      <div className="w-20 h-20 rounded-[2rem] bg-slate-50 dark:bg-slate-900 flex items-center justify-center text-slate-300">
                         <Plus size={40} />
                      </div>
                      <div className="space-y-2">
                        <h4 className="text-base font-black text-slate-900 dark:text-white uppercase tracking-tight">Upload Documents</h4>
                        <p className="text-xs text-slate-400 font-medium">Click to upload or drag & drop Supplier Quotations, Invoices, or Specs</p>
                      </div>
                   </div>
                )}
             </div>
          </div>
        </div>

        {/* Right Sticky Sidebar */}
        <div className="col-span-12 lg:col-span-3">
          <div className="sticky top-24 space-y-8">
             <DocumentSummary />
             
             {/* Dynamic Helper Card */}
             <div className="bg-slate-900 dark:bg-[#0F172A] rounded-[2.5rem] p-8 text-white shadow-2xl shadow-slate-200 dark:shadow-none relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/10 blur-3xl rounded-full -mr-16 -mt-16" />
                <h4 className="text-[10px] font-black uppercase tracking-[0.25em] text-purple-400 mb-6 flex items-center gap-2">
                   <ShieldCheck size={12} /> Lifecycle Status
                </h4>
                <div className="space-y-4">
                   <div className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/10 cursor-pointer hover:bg-white/10 transition-all group">
                      <div className="flex items-center gap-3">
                         <div className="w-2 h-2 rounded-full bg-orange-500 group-hover:animate-ping" />
                         <span className="text-xs font-black uppercase tracking-widest">Mark Ordered</span>
                      </div>
                      <ArrowRight size={14} className="text-white/30 group-hover:text-white transition-all" />
                   </div>
                   <div className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/10 cursor-pointer hover:bg-white/10 transition-all opacity-40">
                      <div className="flex items-center gap-3">
                         <div className="w-2 h-2 rounded-full bg-slate-500" />
                         <span className="text-xs font-black uppercase tracking-widest">Pending GRN</span>
                      </div>
                      <Info size={14} className="text-white/30" />
                   </div>
                </div>
                <div className="mt-8 pt-6 border-t border-white/10 text-center">
                   <p className="text-[9px] font-black text-white/40 uppercase tracking-[0.3em]">Accounting Ready v2.0</p>
                </div>
             </div>
          </div>
        </div>
      {showPreview && (
        <GSTInvoice 
          order={{
            poNumber: poNumber || "DRAFT-00001",
            createdAt: purchaseDate ? new Date(purchaseDate).toISOString() : new Date().toISOString(),
            poItems: items.map((item, idx) => ({
              itemName: item.name || `Material #${idx + 1}`,
              quantity: item.quantity || 0,
              price: item.price || 0,
              gstRate: item.gstRate || 0,
              unit: item.unit || "unit"
            })),
            advancePaid: totals.appliedAdvance || 0,
            paid: totals.appliedAdvance || 0
          }} 
          vendor={selectedVendor || {
            name: "NO VENDOR SELECTED",
            address: "Please select a vendor in the form",
            gstin: "",
            phone: ""
          }} 
          companyDetails={companyProfile || FALLBACK_COMPANY} 
          onClose={() => setShowPreview(false)} 
        />
      )}
      </div>
    </div>
  );
}

export default function NewPurchasePage() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#020617] flex items-center justify-center">
       <div className="w-10 h-10 border-4 border-purple-500/20 border-t-purple-600 rounded-full animate-spin" />
    </div>
  );

  return (
    <PurchaseOrderProvider>
      <div className="min-h-full">
        <NewPurchaseContent />
      </div>
    </PurchaseOrderProvider>
  );
}
