"use client";

import RefrensEmptyState from "@/components/ui/RefrensEmptyState";
import { useRouter } from "next/navigation";

export default function ProformaInvoicesPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-[#FDFCFD] dark:bg-[#020617] -m-8">
      <div className="p-10">
        <RefrensEmptyState 
          title="Proforma Invoices"
          description="Create Proforma Invoices With Customisable Templates. 1-click Share via PDF, Print, or Link over WhatsApp or Email. Record & Track Payments. And more..."
          type="video"
          primaryAction={{
            label: "Create your first proforma invoice",
            onAction: () => console.log("Create")
          }}
          secondaryAction={{
            label: "Upload Proforma invoices",
            onAction: () => console.log("Upload")
          }}
        />
      </div>
    </div>
  );
}
