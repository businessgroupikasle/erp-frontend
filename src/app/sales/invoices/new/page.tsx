import { Suspense } from "react";
import NewInvoiceClient from "@/components/modules/sales/NewInvoiceClient";

export default function NewInvoicePage() {
  return (
    <Suspense fallback={<div className="p-8 text-gray-400 font-bold uppercase tracking-widest animate-pulse">Initialising Invoice Interface...</div>}>
      <NewInvoiceClient />
    </Suspense>
  );
}

