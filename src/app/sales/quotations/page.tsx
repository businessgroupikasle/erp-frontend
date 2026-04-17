"use client";

import RefrensEmptyState from "@/components/ui/RefrensEmptyState";
import { useRouter } from "next/navigation";

export default function QuotationsPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-[#FDFCFD] dark:bg-[#020617] -m-8">
      <div className="p-10">
        <RefrensEmptyState 
          title="Quotations & Estimates"
          description="Create Professional Quotations With Customisable Templates. 1-click Share via PDF, Print, or Link over WhatsApp or Email. Track When Clients View Your Quotations. And more..."
          type="illustration"
          primaryAction={{
            label: "Create First Quotation",
            onAction: () => router.push("/sales/quotations/new")
          }}
          secondaryAction={{
            label: "Upload Quotations",
            onAction: () => console.log("Upload")
          }}
        />
      </div>
    </div>
  );
}
