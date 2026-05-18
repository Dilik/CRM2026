"use client";

import { useRouter } from "@/i18n/navigation";
import { api } from "@/lib/trpc/react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { Phone, MapPin, Wrench, Package } from "lucide-react";

const STATUS_LABELS: Record<string, string> = {
  INTAKE: "Qabul",
  ASSIGNED: "Tayinlangan",
  DIAGNOSED: "Diagnostika",
  PARTS_REQUESTED: "Qismlar kutilmoqda",
  IN_REPAIR: "Ta'mirda",
  READY: "Tayyor",
  CLOSED: "Yopilgan",
  CANCELLED: "Bekor qilingan",
  ON_HOLD: "Kutishda",
};

const STATUS_VARIANT: Record<string, "default" | "secondary" | "destructive" | "outline" | "warning" | "success"> = {
  INTAKE: "outline",
  ASSIGNED: "secondary",
  DIAGNOSED: "secondary",
  PARTS_REQUESTED: "warning",
  IN_REPAIR: "warning",
  READY: "success",
  CLOSED: "default",
  CANCELLED: "destructive",
  ON_HOLD: "secondary",
};

export function CustomerDetailPage({ customerId }: { customerId: string }) {
  const router = useRouter();
  const { data: customer, isLoading } = api.customer.get.useQuery({ id: customerId });

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (!customer) {
    return <div className="text-zinc-400">Mijoz topilmadi</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-semibold">{customer.name}</h1>
          <div className="mt-2 flex flex-col gap-1 text-sm text-zinc-500">
            <span className="flex items-center gap-1.5">
              <Phone className="h-3.5 w-3.5" />
              <span className="font-mono">{customer.phone}</span>
            </span>
            {customer.address && (
              <span className="flex items-center gap-1.5">
                <MapPin className="h-3.5 w-3.5" />
                {customer.address}
              </span>
            )}
          </div>
        </div>
        <Button
          size="sm"
          onClick={() =>
            router.push(
              `/orders?customerId=${customerId}` as Parameters<typeof router.push>[0]
            )
          }
        >
          + Yangi buyurtma
        </Button>
      </div>

      <Separator />

      {/* Orders */}
      <div>
        <h2 className="text-lg font-medium mb-3 flex items-center gap-2">
          <Wrench className="h-4 w-4" />
          Buyurtmalar tarixi
        </h2>
        {customer.orders.length === 0 ? (
          <p className="text-sm text-zinc-400">Buyurtmalar yo'q</p>
        ) : (
          <div className="space-y-2">
            {customer.orders.map((order) => (
              <div
                key={order.id}
                className="flex items-center justify-between rounded-lg border border-zinc-200 dark:border-zinc-700 px-4 py-3 hover:bg-zinc-50 dark:hover:bg-zinc-800 cursor-pointer"
                onClick={() =>
                  router.push(`/orders/${order.id}` as Parameters<typeof router.push>[0])
                }
              >
                <div>
                  <span className="font-mono text-sm font-medium">{order.orderNumber}</span>
                  <span className="ml-3 text-xs text-zinc-400">
                    {new Date(order.createdAt).toLocaleDateString("uz-Latn")}
                  </span>
                </div>
                <Badge variant={STATUS_VARIANT[order.status] ?? "default"}>
                  {STATUS_LABELS[order.status] ?? order.status}
                </Badge>
              </div>
            ))}
          </div>
        )}
      </div>

      <Separator />

      {/* Appliances */}
      <div>
        <h2 className="text-lg font-medium mb-3 flex items-center gap-2">
          <Package className="h-4 w-4" />
          Qurilmalar
        </h2>
        {customer.appliances.length === 0 ? (
          <p className="text-sm text-zinc-400">Qurilmalar yo'q</p>
        ) : (
          <div className="space-y-2">
            {customer.appliances.map((a) => (
              <div
                key={a.id}
                className="rounded-lg border border-zinc-200 dark:border-zinc-700 px-4 py-3"
              >
                <div className="font-medium">
                  {a.model.brand} {a.model.modelCode}
                </div>
                <div className="text-sm text-zinc-500">{a.model.nameUz}</div>
                {a.serialNumber && (
                  <div className="text-xs text-zinc-400 font-mono mt-1">
                    S/N: {a.serialNumber}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
