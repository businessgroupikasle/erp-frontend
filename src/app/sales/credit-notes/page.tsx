"use client";

import RefrensEmptyState from "@/components/ui/RefrensEmptyState";
import { useRouter } from "next/navigation";

export default function CreditNotesPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-[#FDFCFD] dark:bg-[#020617] -m-8">
      <div className="p-10">
        <RefrensEmptyState 
          title="Credit Notes"
          description="Provide Rebates To Customers With Credit Notes. Create, Share, Track, and Manage All Credit Notes In One Place."
          type="video"
          primaryAction={{
            label: "Create First Credit Note",
            onAction: () => console.log("Create")
          }}
          secondaryAction={{
            label: "Upload Credit Notes",
            onAction: () => console.log("Upload")
          }}
        />
      </div>
    </div>
  );
}
