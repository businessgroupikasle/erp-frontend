"use client";

import RefrensEmptyState from "@/components/ui/RefrensEmptyState";

export default function CashFlowPage() {
  return (
    <div className="min-h-screen bg-[#FDFCFD] dark:bg-[#020617] -m-8">
      <div className="p-10">
        <RefrensEmptyState 
          title="Track liquidity with the Cashflow Statement"
          description="Track your business's ability to generate cash, pay bills, and invest in growth opportunities."
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
