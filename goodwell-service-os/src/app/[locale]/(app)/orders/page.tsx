import { OrdersPage } from "./OrdersPage";

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ customerId?: string }>;
}) {
  const { customerId } = await searchParams;
  return <OrdersPage prefilledCustomerId={customerId} />;
}
