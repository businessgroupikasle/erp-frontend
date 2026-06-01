"use client";

import RefrensEmptyState from "@/components/ui/RefrensEmptyState";

export default function LabelsBarcodesPage() {
  return (
    <div className="min-h-screen bg-[#FDFCFD] dark:bg-[#020617] -m-8">
      <div className="p-10">
        <RefrensEmptyState 
          title="Labels & Barcodes"
          description="Generate, customize, and print barcode labels for newly packed finished cartons."
          type="illustration"
          primaryAction={{
            label: "Generate Barcode Labels",
            onAction: () => console.log("Generate barcodes")
          }}
          secondaryAction={{
            label: "Manage SKUs",
            onAction: () => window.location.href = "/inventory/stock?type=finished"
          }}
        />
      </div>
    </div>
  );
}
