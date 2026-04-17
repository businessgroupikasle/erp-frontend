"use client";

import RefrensEmptyState from "@/components/ui/RefrensEmptyState";

export default function BalanceSheetPage() {
  return (
    <div className="min-h-screen bg-[#FDFCFD] dark:bg-[#020617] -m-8">
      <div className="p-10">
        <RefrensEmptyState 
          title="Analyze Financial Health Balance Sheet"
          description="Assess what your business owns and owes at a specific point in time to understand your company's financial position and stability."
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
