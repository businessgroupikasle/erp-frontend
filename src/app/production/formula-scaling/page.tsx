"use client";

import RefrensEmptyState from "@/components/ui/RefrensEmptyState";

export default function FormulaScalingPage() {
  return (
    <div className="min-h-screen bg-[#FDFCFD] dark:bg-[#020617] -m-8">
      <div className="p-10">
        <RefrensEmptyState 
          title="Formula Scaling"
          description="Scale your recipes and formulations automatically based on batch sizes or ingredient availability."
          type="illustration"
          primaryAction={{
            label: "Create Scaling Plan",
            onAction: () => console.log("Create Plan")
          }}
          secondaryAction={{
            label: "View Recipes",
            onAction: () => window.location.href = "/production/recipes"
          }}
        />
      </div>
    </div>
  );
}
