"use client";

import RefrensEmptyState from "@/components/ui/RefrensEmptyState";
import { useRouter } from "next/navigation";

export default function DebitNotesPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-[#FDFCFD] dark:bg-[#020617] -m-8">
      <div className="p-10">
        <RefrensEmptyState 
          title="Debit Notes"
          description="Rectify Invoice Values With Debit Notes. Create, Share, Track, and Manage All Debit Notes In One Place."
          type="illustration"
          primaryAction={{
            label: "Create First Debit Note",
            onAction: () => console.log("Create")
          }}
          secondaryAction={{
            label: "Upload Debit Notes",
            onAction: () => console.log("Upload")
          }}
        />
      </div>
    </div>
  );
}
