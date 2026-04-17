"use client";

import RefrensEmptyState from "@/components/ui/RefrensEmptyState";
import { useRouter } from "next/navigation";

export default function PayoutReceiptsPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-[#FDFCFD] dark:bg-[#020617] -m-8">
      <div className="p-10">
        <RefrensEmptyState 
          title="Payout Receipts"
          description="Create, Edit and Share receipts for Payments you made to your vendors."
          type="video"
          primaryAction={{
            label: "Create First Payout Receipt",
            onAction: () => console.log("Create")
          }}
        />
      </div>
    </div>
  );
}
