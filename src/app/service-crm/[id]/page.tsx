import ServiceTicketClient from "./ServiceTicketClient";

export function generateStaticParams() {
  return [{ id: "1" }];
}

export default function Page() {
  return <ServiceTicketClient />;
}
