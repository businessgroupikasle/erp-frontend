import { Suspense } from "react";
import CRMLeadsClient from "@/components/modules/crm/CRMLeadsClient";

export default function CRMLeadsPage() {
  return (
    <Suspense fallback={<div className="p-8 text-gray-400 font-bold uppercase tracking-widest animate-pulse">Initialising Leads Ledger...</div>}>
      <CRMLeadsClient />
    </Suspense>
  );
}
