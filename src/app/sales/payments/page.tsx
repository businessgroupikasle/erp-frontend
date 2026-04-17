"use client";

import RefrensEmptyState from "@/components/ui/RefrensEmptyState";
import { useRouter } from "next/navigation";

export default function PaymentReceiptsPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-[#FDFCFD] dark:bg-[#020617] -m-8">
      <div className="p-10">
        <RefrensEmptyState 
          title="Payment Receipts"
          description="Create, edit and share receipt for the payment received from the clients."
          type="video"
          primaryAction={{
            label: "Create First Payment Receipt",
            onAction: () => console.log("Create")
          }}
        />
      </div>
    </div>
  );
}
