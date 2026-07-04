"use client";

import { PurchaseOrderProvider } from "@/context/PurchaseOrderContext";
import { NewPurchaseContent } from "@/app/purchases/new/page";

export default function EditPurchasePage({ params }: { params: { id: string } }) {
  return (
    <PurchaseOrderProvider editId={params.id}>
      <div className="min-h-full">
        <NewPurchaseContent editId={params.id} />
      </div>
    </PurchaseOrderProvider>
  );
}
