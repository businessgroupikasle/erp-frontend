"use client";

import RefrensEmptyState from "@/components/ui/RefrensEmptyState";

export default function WastagePage() {
  return (
    <div className="min-h-screen bg-[#FDFCFD] dark:bg-[#020617] -m-8">
      <div className="p-10">
        <RefrensEmptyState 
          title="Wastage Control"
          description="Log and analyze manufacturing wastage, shelf-life expirations, and damaged inventory lots."
          type="illustration"
          primaryAction={{
            label: "Log Wastage Entry",
            onAction: () => window.location.href = "/inventory/stock"
          }}
          secondaryAction={{
            label: "View Stock Alerts",
            onAction: () => window.location.href = "/alerts"
          }}
        />
      </div>
    </div>
  );
}
