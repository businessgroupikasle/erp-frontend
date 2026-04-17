"use client";

import RefrensEmptyState from "@/components/ui/RefrensEmptyState";
import { useRouter } from "next/navigation";

export default function PurchasesPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-[#FDFCFD] dark:bg-[#020617] -m-8">
      <div className="p-10">
        <RefrensEmptyState 
          title="Purchases and Expenses"
          description="Create, Manage, Track & Optimize Your Purchases and Expenses Instantly. Get Essential Purchase and Expense Reports within seconds."
          type="illustration"
          primaryAction={{
            label: "Create First Purchase",
            onAction: () => router.push("/purchases/new")
          }}
          secondaryAction={{
            label: "Upload Purchases",
            onAction: () => console.log("Upload")
          }}
        />
      </div>
    </div>
  );
}
