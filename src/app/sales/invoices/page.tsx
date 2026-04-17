"use client";

import RefrensEmptyState from "@/components/ui/RefrensEmptyState";
import { useRouter } from "next/navigation";

export default function InvoicesPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-[#FDFCFD] dark:bg-[#020617] -m-8">
      <div className="p-10">
        <RefrensEmptyState 
          title="Invoices"
          description="Create Professional Invoices With Customisable Templates. 1-click Share as PDF, Print, or Link over WhatsApp or Email. Record & Track Payments. And more..."
          type="video"
          primaryAction={{
            label: "Create your first invoice",
            onAction: () => router.push("/sales/invoices/new")
          }}
          secondaryAction={{
            label: "Upload Invoices",
            onAction: () => console.log("Upload")
          }}
        />
      </div>
    </div>
  );
}
