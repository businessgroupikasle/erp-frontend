"use client";

import RefrensEmptyState from "@/components/ui/RefrensEmptyState";
import { useRouter } from "next/navigation";

export default function PurchaseOrdersPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-[#FDFCFD] dark:bg-[#020617] -m-8">
      <div className="p-10">
        <RefrensEmptyState 
          title="Purchase Orders"
          description="Create, Share, and Track Purchase Orders to Streamline Your Buying Process."
          type="video"
          primaryAction={{
            label: "Create First Purchase Order",
            onAction: () => console.log("Create")
          }}
          secondaryAction={{
            label: "Upload Purchase Orders",
            onAction: () => console.log("Upload")
          }}
        />
      </div>
    </div>
  );
}
