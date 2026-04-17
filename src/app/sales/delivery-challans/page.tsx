"use client";

import RefrensEmptyState from "@/components/ui/RefrensEmptyState";
import { useRouter } from "next/navigation";

export default function DeliveryChallansPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-[#FDFCFD] dark:bg-[#020617] -m-8">
      <div className="p-10">
        <RefrensEmptyState 
          title="Delivery Challans"
          description="Create, Share, and Track Delivery Challans for Transportation or Delivery of Goods."
          type="illustration"
          primaryAction={{
            label: "Create First Delivery Challan",
            onAction: () => console.log("Create")
          }}
          secondaryAction={{
            label: "Upload Delivery Challans",
            onAction: () => console.log("Upload")
          }}
        />
      </div>
    </div>
  );
}
