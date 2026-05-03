import PayslipClient from "@/components/modules/hr/PayslipClient";
import { Suspense } from "react";

export default function PayslipViewPage() {
  return (
    <Suspense fallback={<div className="p-6 text-gray-400">Loading...</div>}>
      <PayslipClient />
    </Suspense>
  );
}
