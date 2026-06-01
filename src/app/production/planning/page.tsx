"use client";

import RefrensEmptyState from "@/components/ui/RefrensEmptyState";

export default function ProductionPlanningPage() {
  return (
    <div className="min-h-screen bg-[#FDFCFD] dark:bg-[#020617] -m-8">
      <div className="p-10">
        <RefrensEmptyState 
          title="Production Planning"
          description="Plan your factory operations, allocate raw materials, and schedule batches for upcoming shifts."
          type="illustration"
          primaryAction={{
            label: "Schedule New Batch",
            onAction: () => window.location.href = "/production/batches"
          }}
          secondaryAction={{
            label: "View Operational Dashboard",
            onAction: () => window.location.href = "/production"
          }}
        />
      </div>
    </div>
  );
}
