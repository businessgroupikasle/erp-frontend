"use client";

import RefrensEmptyState from "@/components/ui/RefrensEmptyState";

export default function TrialBalancePage() {
  return (
    <div className="min-h-screen bg-[#FDFCFD] dark:bg-[#020617] -m-8">
      <div className="p-10">
        <RefrensEmptyState 
          title="Validate Financial Records with Trial Balance"
          description="Regularly review all ledger balances to maintain up-to-date and reliable financial records."
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
