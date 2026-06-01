"use client";

import RefrensEmptyState from "@/components/ui/RefrensEmptyState";

export default function PackagingQueuePage() {
  return (
    <div className="min-h-screen bg-[#FDFCFD] dark:bg-[#020617] -m-8">
      <div className="p-10">
        <RefrensEmptyState 
          title="Packaging Queue"
          description="Manage batches coming out of manufacturing and assign them to cartoon and labelling lines."
          type="illustration"
          primaryAction={{
            label: "Initiate Line Run",
            onAction: () => console.log("Line run")
          }}
          secondaryAction={{
            label: "View Finished Goods",
            onAction: () => window.location.href = "/inventory/stock?type=finished"
          }}
        />
      </div>
    </div>
  );
}
