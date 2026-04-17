"use client";

import RefrensEmptyState from "@/components/ui/RefrensEmptyState";

export default function VoucherBooksPage() {
  return (
    <div className="min-h-screen bg-[#FDFCFD] dark:bg-[#020617] -m-8">
      <div className="p-10">
        <RefrensEmptyState 
          title="Effortless Record-Keeping With Vouchers"
          description="Track all cash/non-cash transactions with ease using Vouchers for accurate record-keeping."
          type="illustration"
          primaryAction={{
            label: "Enable Advanced Accounting",
            onAction: () => console.log("Enable")
          }}
          secondaryAction={{
            label: "Learn More",
            onAction: () => console.log("Learn More")
          }}
        />
      </div>
    </div>
  );
}
