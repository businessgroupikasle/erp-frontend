import PayslipClient from "@/components/modules/hr/PayslipClient";

export function generateStaticParams() {
  return [{ id: "1" }];
}

export default function PayslipPage() {
  return <PayslipClient />;
}

