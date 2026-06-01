"use client";

import RefrensEmptyState from "@/components/ui/RefrensEmptyState";

export default function RecipeCostingPage() {
  return (
    <div className="min-h-screen bg-[#FDFCFD] dark:bg-[#020617] -m-8">
      <div className="p-10">
        <RefrensEmptyState 
          title="Recipe Costing"
          description="Calculate real-time costs of your recipes based on current raw material rates and production wastage."
          type="illustration"
          primaryAction={{
            label: "Calculate Costings",
            onAction: () => console.log("Calculate Costings")
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
