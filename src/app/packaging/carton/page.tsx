"use client";

import RefrensEmptyState from "@/components/ui/RefrensEmptyState";

export default function CartonPackingPage() {
  return (
    <div className="min-h-screen bg-[#FDFCFD] dark:bg-[#020617] -m-8">
      <div className="p-10">
        <RefrensEmptyState 
          title="Carton Packing"
          description="Consolidate items into primary and secondary cartons, assign lot numbers, and seal packages for transit dispatch."
          type="illustration"
          primaryAction={{
            label: "Create Carton Lot",
            onAction: () => console.log("Create carton lot")
          }}
          secondaryAction={{
            label: "View Delivery Challans",
            onAction: () => window.location.href = "/sales/delivery-challan"
          }}
        />
      </div>
    </div>
  );
}
