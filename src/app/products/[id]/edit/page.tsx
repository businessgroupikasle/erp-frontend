import ProductEditClient from "./ProductEditClient";

export function generateStaticParams() {
  return [{ id: "1" }];
}

export default function Page() {
  return <ProductEditClient />;
}
