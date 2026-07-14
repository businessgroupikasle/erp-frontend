"use client";

import { useState, useEffect } from "react";
import { PurchaseOrderProvider } from "@/context/PurchaseOrderContext";
import { NewPurchaseContent } from "@/components/modules/purchases/PurchaseFormContent";

export default function NewPurchasePage() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#020617] flex items-center justify-center">
       <div className="w-10 h-10 border-4 border-orange-500/20 border-t-orange-500 rounded-full animate-spin" />
    </div>
  );

  return (
    <PurchaseOrderProvider editId={undefined}>
      <div className="min-h-full">
        <NewPurchaseContent />
      </div>
    </PurchaseOrderProvider>
  );
}
