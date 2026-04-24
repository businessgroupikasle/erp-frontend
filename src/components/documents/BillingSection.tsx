import { ChevronDown, Edit3, Plus, Search, User, Phone, Wallet } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { usePurchaseOrder, Vendor } from "@/context/PurchaseOrderContext";
import { useState, useEffect } from "react";
import { vendorsApi } from "@/lib/api";

interface BillingSectionProps {
  fromLabel: string;
  fromSubLabel: string;
  toLabel: string;
  toSubLabel: string;
  targetType: "client" | "vendor";
  onAddTarget?: () => void;
}

export default function BillingSection({ 
  fromLabel, 
  fromSubLabel, 
  toLabel, 
  toSubLabel,
  targetType,
  onAddTarget 
}: BillingSectionProps) {
  const { user } = useAuth();
  const { selectedVendor, setSelectedVendor } = usePurchaseOrder();
  const [showSearch, setShowSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [loading, setLoading] = useState(false);

  const placeholderText = targetType === "client" ? "Select a Client" : "Select Vendor By Bill";
  const buttonText = targetType === "client" ? "Add New Client" : "Add New Vendor";
  const secondaryText = targetType === "client" ? "Select Client/Business from the list" : "Select Vendor/Business from the list";

  useEffect(() => {
    if (showSearch) {
      const fetchVendors = async () => {
        setLoading(true);
        try {
          const response = await vendorsApi.getAll();
          // Map to our Vendor interface
          const mappedVendors = response.data.map((v: any) => ({
            id: v.id,
            name: v.name,
            phone: v.phone || v.mobile || v.contact,
            advanceBalance: v.advanceBalance || (v.balance > 0 ? v.balance : 0),
            balanceDue: v.balanceDue || (v.balance < 0 ? Math.abs(v.balance) : 0),
            suppliedMaterials: v.suppliedMaterials || [], // { materialId, price }[]
          }));
          setVendors(mappedVendors);
        } catch (error) {
          console.error("Failed to fetch vendors", error);
        } finally {
          setLoading(false);
        }
      };
      fetchVendors();
    }
  }, [showSearch]);

  const filteredVendors = vendors.filter(v => 
    v.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 py-8">
      {/* From Section */}
      <div className="space-y-4">
        <h3 className="text-sm font-bold text-[#1A1A1A] dark:text-white flex items-center gap-2">
          {fromLabel} <span className="text-[#999] font-medium text-xs">{fromSubLabel}</span>
        </h3>
        
        <div className="p-6 bg-white dark:bg-slate-900 border border-[#F0EAF0] dark:border-slate-800 rounded-xl space-y-4">
          <div className="flex items-center justify-between p-3 border border-[#F0EAF0] rounded-lg cursor-pointer hover:border-[#7C3AED] transition-all">
             <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-md bg-[#3D3D3D] text-white flex items-center justify-center font-bold text-xs uppercase shadow-md">
                   {user?.fullName?.charAt(0) || "A"}
                </div>
                <span className="text-sm font-bold text-[#1A1A1A] dark:text-white">{user?.fullName || "Azeez"}</span>
             </div>
             <ChevronDown size={14} className="text-[#999]" />
          </div>

          <div className="space-y-4 pt-2">
             <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[#666] uppercase tracking-wider">Business details</span>
                <button className="text-[#7C3AED] text-xs font-bold flex items-center gap-1 hover:underline">
                   <Edit3 size={12} /> Edit
                </button>
             </div>
             <div className="space-y-2">
                <div className="flex justify-between items-start">
                   <span className="text-xs text-[#999]">Business Name</span>
                   <span className="text-sm font-medium text-[#1A1A1A] dark:text-slate-200">{user?.fullName || "Azeez"}</span>
                </div>
                <div className="flex justify-between items-start">
                   <span className="text-xs text-[#999]">Address</span>
                   <span className="text-sm font-medium text-[#1A1A1A] dark:text-slate-200">India</span>
                </div>
             </div>
          </div>
        </div>
      </div>

      {/* To Section */}
      <div className="space-y-4">
        <h3 className="text-sm font-bold text-[#1A1A1A] dark:text-white flex items-center gap-2">
          {toLabel} <span className="text-[#999] font-medium text-xs">{toSubLabel}</span>
        </h3>
        
        {selectedVendor ? (
          <div className="p-6 bg-white dark:bg-slate-900 border border-[#7C3AED]/30 dark:border-slate-800 rounded-xl space-y-6 relative group overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-0 group-hover:opacity-100 transition-opacity">
               <button 
                onClick={() => setSelectedVendor(null)}
                className="text-xs font-bold text-red-500 hover:underline"
               >
                 Change Vendor
               </button>
            </div>
            
            <div className="flex items-start gap-4">
               <div className="w-12 h-12 rounded-xl bg-purple-50 text-[#7C3AED] flex items-center justify-center font-black text-xl shadow-sm">
                  {selectedVendor.name.charAt(0)}
               </div>
               <div className="flex-1">
                  <h4 className="text-lg font-black text-[#1A1A1A] dark:text-white leading-tight">{selectedVendor.name}</h4>
                  <div className="flex items-center gap-2 text-[#999] text-xs font-medium mt-1">
                     <Phone size={12} />
                     <span>{selectedVendor.phone || "No phone provided"}</span>
                  </div>
               </div>
            </div>

            <div className="pt-4 border-t border-dashed border-[#F0EAF0] grid grid-cols-2 gap-4">
               <div className="space-y-1">
                  <span className="text-[10px] font-bold text-[#999] uppercase tracking-widest">Financial Context</span>
                  <div className="flex items-center gap-2">
                    {selectedVendor.advanceBalance > 0 ? (
                      <div className="flex items-center gap-1.5 px-2 py-1 bg-green-50 text-green-700 rounded-md text-[11px] font-bold">
                        <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                        ₹{selectedVendor.advanceBalance.toLocaleString()} Advance
                      </div>
                    ) : selectedVendor.balanceDue > 0 ? (
                      <div className="flex items-center gap-1.5 px-2 py-1 bg-red-50 text-red-700 rounded-md text-[11px] font-bold">
                        <div className="w-1.5 h-1.5 rounded-full bg-red-500" />
                        ₹{selectedVendor.balanceDue.toLocaleString()} Due
                      </div>
                    ) : (
                      <div className="text-[11px] font-bold text-[#666]">No outstanding balance</div>
                    )}
                  </div>
               </div>
               <div className="flex flex-col justify-end items-end">
                  <button className="text-[10px] font-bold text-[#7C3AED] uppercase tracking-widest flex items-center gap-1 hover:bg-purple-50 p-1 px-2 rounded transition-all">
                     <Wallet size={12} /> View Ledger
                  </button>
               </div>
            </div>
          </div>
        ) : (
          <div 
            className="p-6 bg-[#F9F7F9] dark:bg-slate-900/50 border border-dashed border-[#F0EAF0] dark:border-slate-800 rounded-xl flex flex-col items-center justify-center min-h-[220px] text-center gap-6 relative"
          >
            <div className="w-full relative">
              <div 
                onClick={() => setShowSearch(!showSearch)}
                className="flex items-center justify-between p-3 bg-white dark:bg-slate-950 border border-[#F0EAF0] rounded-lg cursor-pointer hover:border-[#7C3AED] transition-all"
              >
                 <span className="text-sm text-[#999]">{placeholderText}</span>
                 <ChevronDown size={14} className="text-[#999]" />
              </div>

              {showSearch && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-slate-900 border border-[#F0EAF0] dark:border-slate-800 rounded-xl shadow-xl z-50 overflow-hidden">
                   <div className="p-3 border-b border-[#F0EAF0] dark:border-slate-800 flex items-center gap-2">
                      <Search size={16} className="text-[#999]" />
                      <input 
                        autoFocus
                        type="text" 
                        placeholder="Search vendors..."
                        className="w-full text-sm outline-none bg-transparent"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                      />
                   </div>
                   <div className="max-h-60 overflow-y-auto">
                      {loading ? (
                        <div className="p-4 text-xs text-[#999] font-medium italic">Loading vendors...</div>
                      ) : filteredVendors.length > 0 ? (
                        filteredVendors.map(v => (
                          <div 
                            key={v.id}
                            onClick={() => {
                              setSelectedVendor(v);
                              setShowSearch(false);
                            }}
                            className="p-3 hover:bg-purple-50 dark:hover:bg-slate-800 cursor-pointer transition-colors flex justify-between items-center"
                          >
                             <div className="flex flex-col text-left">
                                <span className="text-sm font-bold text-[#1A1A1A] dark:text-white">{v.name}</span>
                                <span className="text-[10px] text-[#999]">{v.phone}</span>
                             </div>
                             {v.advanceBalance > 0 && (
                               <span className="text-[10px] font-bold text-green-600 bg-green-50 px-1.5 py-0.5 rounded">₹{v.advanceBalance} Adv</span>
                             )}
                          </div>
                        ))
                      ) : (
                        <div className="p-4 text-xs text-[#999] font-medium italic text-center">No vendors found</div>
                      )}
                   </div>
                </div>
              )}
            </div>

            <div className="space-y-4">
               <p className="text-xs font-medium text-[#999]">{secondaryText}</p>
               <p className="text-[10px] font-bold text-[#CCC] uppercase tracking-widest leading-none">OR</p>
               <button 
                  onClick={onAddTarget}
                  className="flex items-center gap-2 px-6 py-2.5 bg-[#7C3AED] text-white rounded-lg font-bold text-sm shadow-lg shadow-purple-200/50 transition-all active:scale-95 mx-auto"
                >
                  <Plus size={16} /> {buttonText}
               </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

