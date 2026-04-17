"use client";

import RefrensEmptyState from "@/components/ui/RefrensEmptyState";

export default function LedgersReportPage() {
  return (
    <div className="min-h-screen bg-[#FDFCFD] dark:bg-[#020617] -m-8">
      <div className="p-10">
        <RefrensEmptyState 
          title="Get Complete Financial Clarity with the All Ledgers Report"
          description="Quickly access, sort, and export detailed reports for all your ledger accounts in one convenient place."
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
