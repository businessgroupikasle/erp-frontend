import { Suspense } from "react";
import NewQuotationClient from "@/components/modules/sales/NewQuotationClient";

export default function NewQuotationPage() {
  return (
    <Suspense fallback={<div className="p-8 text-gray-400 font-bold uppercase tracking-widest animate-pulse">Initialising Quotation Interface...</div>}>
      <NewQuotationClient />
    </Suspense>
  );
}

