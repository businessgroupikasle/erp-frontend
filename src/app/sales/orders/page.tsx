"use client";

import RefrensEmptyState from "@/components/ui/RefrensEmptyState";
import { useRouter } from "next/navigation";

export default function SalesOrdersPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-[#FDFCFD] dark:bg-[#020617] -m-8">
      <div className="p-10">
        <RefrensEmptyState 
          title="Sales Order"
          description="Create, Share, and Track Sales Orders. Anticipate Future Revenues and Keep Track of Order Fulfillment."
          type="illustration"
          primaryAction={{
            label: "Create First Sales Order",
            onAction: () => console.log("Create")
          }}
          secondaryAction={{
            label: "Upload Sales Orders",
            onAction: () => console.log("Upload")
          }}
        />
      </div>
    </div>
  );
}
