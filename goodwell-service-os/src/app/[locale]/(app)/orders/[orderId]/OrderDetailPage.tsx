"use client";

import { useState } from "react";
import { api } from "@/lib/trpc/react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { Clock, User, AlertCircle } from "lucide-react";

type OrderStatus =
  | "INTAKE"
  | "ASSIGNED"
  | "DIAGNOSED"
  | "PARTS_REQUESTED"
  | "IN_REPAIR"
  | "READY"
  | "CLOSED"
  | "CANCELLED"
  | "ON_HOLD";

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

type BadgeVariant = "default" | "secondary" | "destructive" | "outline" | "warning" | "success";

const STATUS_VARIANT: Record<string, BadgeVariant> = {
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

const PRIORITY_LABELS: Record<string, string> = {
  LOW: "Past",
  NORMAL: "Normal",
  HIGH: "Yuqori",
  URGENT: "Shoshilinch",
};

const SOURCE_LABELS: Record<string, string> = {
  WALK_IN: "Shaxsan",
  PHONE_IN: "Telefon",
  ONLINE: "Online",
};

export function OrderDetailPage({ orderId }: { orderId: string }) {
  const { data: order, isLoading, refetch } = api.order.get.useQuery({ id: orderId });
  const { data: staff = [] } = api.staff.list.useQuery();

  const transition = api.order.transition.useMutation({
    onSuccess: () => { toast.success("Holat o'zgartirildi"); refetch(); },
    onError: (err) => toast.error(err.message),
  });

  const assignMaster = api.order.assignMaster.useMutation({
    onSuccess: () => {
      toast.success("Usta tayinlandi");
      setAssignOpen(false);
      setSelectedMasterId("");
      refetch();
    },
    onError: (err) => toast.error(err.message),
  });

  const logPart = api.order.logPart.useMutation({
    onSuccess: () => {
      toast.success("Qism qo'shildi");
      setPartOpen(false);
      setPartId("");
      setPartQty("1");
      refetch();
    },
    onError: (err) => toast.error(err.message),
  });

  const [assignOpen, setAssignOpen] = useState(false);
  const [selectedMasterId, setSelectedMasterId] = useState("");
  const [partOpen, setPartOpen] = useState(false);
  const [partId, setPartId] = useState("");
  const [partQty, setPartQty] = useState("1");

  function doTransition(toStatus: OrderStatus, note?: string) {
    transition.mutate({ orderId, toStatus, note });
  }

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-4 w-48" />
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  if (!order) {
    return <div className="text-zinc-400">Buyurtma topilmadi</div>;
  }

  const status = order.status as OrderStatus;
  const hasInvoice = !!order.invoice;
  const isPending = transition.isPending || assignMaster.isPending;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-semibold font-mono">{order.orderNumber}</h1>
            <Badge variant={STATUS_VARIANT[status] ?? "default"}>
              {STATUS_LABELS[status] ?? status}
            </Badge>
          </div>
          <p className="text-lg mt-1 font-medium text-zinc-700 dark:text-zinc-300">
            {order.customer.name}
          </p>
          <div className="flex gap-4 mt-2 text-sm text-zinc-500">
            <span>{PRIORITY_LABELS[order.priority] ?? order.priority}</span>
            <span>·</span>
            <span>{SOURCE_LABELS[order.source] ?? order.source}</span>
            <span>·</span>
            <span>{new Date(order.createdAt).toLocaleString("uz-Latn")}</span>
          </div>
        </div>
      </div>

      {/* Problem */}
      <div>
        <h2 className="text-sm font-semibold text-zinc-500 uppercase tracking-wide mb-1">
          Muammo
        </h2>
        <p className="text-zinc-800 dark:text-zinc-200 whitespace-pre-wrap">{order.problem}</p>
      </div>

      <Separator />

      {/* Status Actions */}
      <div>
        <h2 className="text-sm font-semibold text-zinc-500 uppercase tracking-wide mb-3">
          Amallar
        </h2>
        <div className="flex flex-wrap gap-2">
          {status === "INTAKE" && (
            <Button
              size="sm"
              onClick={() => setAssignOpen(true)}
              disabled={isPending}
            >
              Ustaga belgilash
            </Button>
          )}
          {status === "ASSIGNED" && (
            <Button
              size="sm"
              onClick={() => doTransition("DIAGNOSED")}
              disabled={isPending}
            >
              Diagnostika tugadi
            </Button>
          )}
          {status === "DIAGNOSED" && (
            <>
              <Button
                size="sm"
                variant="outline"
                onClick={() => doTransition("PARTS_REQUESTED")}
                disabled={isPending}
              >
                Qismlar kerak
              </Button>
              <Button
                size="sm"
                onClick={() => doTransition("IN_REPAIR")}
                disabled={isPending}
              >
                Ta'mirlash boshlandi
              </Button>
            </>
          )}
          {status === "PARTS_REQUESTED" && (
            <Button
              size="sm"
              onClick={() => doTransition("IN_REPAIR")}
              disabled={isPending}
            >
              Ta'mirlash boshlandi
            </Button>
          )}
          {status === "IN_REPAIR" && (
            <Button
              size="sm"
              onClick={() => doTransition("READY")}
              disabled={isPending}
            >
              Tayyor
            </Button>
          )}
          {status === "READY" && (
            <>
              {!hasInvoice && (
                <div className="flex items-center gap-2 text-sm text-orange-600">
                  <AlertCircle className="h-4 w-4" />
                  <span>Yopishdan oldin hisob-faktura yarating</span>
                </div>
              )}
              <Button
                size="sm"
                onClick={() => doTransition("CLOSED")}
                disabled={isPending || !hasInvoice}
              >
                Yopish
              </Button>
            </>
          )}
          {!["CLOSED", "CANCELLED"].includes(status) && (
            <Button
              size="sm"
              variant="destructive"
              onClick={() => doTransition("CANCELLED")}
              disabled={isPending}
            >
              Bekor qilish
            </Button>
          )}
        </div>
      </div>

      <Separator />

      {/* Parts Used */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold text-zinc-500 uppercase tracking-wide">
            Ishlatilgan qismlar
          </h2>
          {!["CLOSED", "CANCELLED"].includes(status) && (
            <Button size="sm" variant="outline" onClick={() => setPartOpen(true)}>
              + Qism qo'shish
            </Button>
          )}
        </div>
        <div className="rounded-lg border border-zinc-200 dark:border-zinc-700 overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Qism kodi</TableHead>
                <TableHead>Nom</TableHead>
                <TableHead className="text-right">Miqdor</TableHead>
                <TableHead className="text-right">Narx</TableHead>
                <TableHead className="text-right">Jami</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {order.partUsages.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-zinc-400 py-6">
                    Qismlar yo'q
                  </TableCell>
                </TableRow>
              ) : (
                order.partUsages.map((u) => {
                  const unitCost =
                    typeof u.unitCost === "object" && u.unitCost !== null
                      ? (u.unitCost as { toNumber: () => number }).toNumber()
                      : Number(u.unitCost);
                  const total = unitCost * u.quantity;
                  return (
                    <TableRow key={u.id}>
                      <TableCell className="font-mono text-sm">{u.part.partCode}</TableCell>
                      <TableCell>{u.part.nameUz}</TableCell>
                      <TableCell className="text-right">{u.quantity}</TableCell>
                      <TableCell className="text-right">
                        {unitCost.toLocaleString("uz-Latn")}
                      </TableCell>
                      <TableCell className="text-right font-medium">
                        {total.toLocaleString("uz-Latn")}
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      <Separator />

      {/* Events Timeline */}
      <div>
        <h2 className="text-sm font-semibold text-zinc-500 uppercase tracking-wide mb-3">
          Voqealar tarixi
        </h2>
        <div className="space-y-3">
          {order.events.map((ev) => (
            <div key={ev.id} className="flex gap-3 items-start">
              <div className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-zinc-100 dark:bg-zinc-800">
                <Clock className="h-3 w-3 text-zinc-500" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 text-sm">
                  {ev.fromStatus ? (
                    <span className="text-zinc-400">
                      {STATUS_LABELS[ev.fromStatus] ?? ev.fromStatus} →
                    </span>
                  ) : null}
                  <span className="font-medium">
                    {STATUS_LABELS[ev.toStatus] ?? ev.toStatus}
                  </span>
                </div>
                {ev.note && (
                  <p className="text-xs text-zinc-500 mt-0.5">{ev.note}</p>
                )}
                <div className="flex items-center gap-1 text-xs text-zinc-400 mt-0.5">
                  <User className="h-3 w-3" />
                  <span>{ev.performedBy}</span>
                  <span>·</span>
                  <span>{new Date(ev.createdAt).toLocaleString("uz-Latn")}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Assign Master Dialog */}
      <Dialog open={assignOpen} onOpenChange={setAssignOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Ustani tanlang</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Usta</Label>
              <Select value={selectedMasterId} onValueChange={setSelectedMasterId}>
                <SelectTrigger>
                  <SelectValue placeholder="Ustani tanlang" />
                </SelectTrigger>
                <SelectContent>
                  {staff
                    .filter((s) => s.role === "MASTER" && s.active)
                    .map((s) => (
                      <SelectItem key={s.id} value={s.id}>
                        {s.name ?? s.phone}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Bekor qilish</Button>
            </DialogClose>
            <Button
              onClick={() => {
                if (!selectedMasterId) return;
                assignMaster.mutate({ orderId, masterId: selectedMasterId });
              }}
              disabled={assignMaster.isPending || !selectedMasterId}
            >
              {assignMaster.isPending ? "Tayinlanmoqda..." : "Tayinlash"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Part Dialog */}
      <Dialog open={partOpen} onOpenChange={setPartOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Qism qo'shish</DialogTitle>
          </DialogHeader>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (!partId) return;
              logPart.mutate({
                orderId,
                partId,
                quantity: parseInt(partQty, 10),
              });
            }}
            className="space-y-4"
          >
            <div className="space-y-2">
              <Label htmlFor="partId">Qism ID</Label>
              <Input
                id="partId"
                value={partId}
                onChange={(e) => setPartId(e.target.value)}
                placeholder="Qism ID yoki kodi"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="partQty">Miqdor</Label>
              <Input
                id="partQty"
                type="number"
                min={1}
                value={partQty}
                onChange={(e) => setPartQty(e.target.value)}
                required
              />
            </div>
            <DialogFooter>
              <DialogClose asChild>
                <Button type="button" variant="outline">
                  Bekor qilish
                </Button>
              </DialogClose>
              <Button type="submit" disabled={logPart.isPending || !partId}>
                {logPart.isPending ? "Qo'shilmoqda..." : "Qo'shish"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
