"use client";

import RefrensEmptyState from "@/components/ui/RefrensEmptyState";

export default function HireVendorsPage() {
  return (
    <div className="min-h-screen bg-[#FDFCFD] dark:bg-[#020617] -m-8">
      <div className="p-10">
        <RefrensEmptyState 
          title="Hire The Best Vendors"
          description="Find and hire the most qualified vendors for your business needs. This feature is coming soon to help you streamline your procurement."
          type="illustration"
          primaryAction={{
            label: "Explore Vendor Directory",
            onAction: () => console.log("Explore")
          }}
        />
      </div>
    </div>
  );
}
