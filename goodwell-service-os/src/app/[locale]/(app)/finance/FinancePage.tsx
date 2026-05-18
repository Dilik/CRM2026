"use client";

import { useState } from "react";
import { useRouter } from "@/i18n/navigation";
import { api } from "@/lib/trpc/react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
import { ChevronRight } from "lucide-react";

type InvoiceStatus = "DRAFT" | "ISSUED" | "PARTIALLY_PAID" | "PAID" | "VOIDED";
type BadgeVariant = "default" | "secondary" | "destructive" | "outline" | "warning" | "success";

const STATUS_LABELS: Record<InvoiceStatus, string> = {
  DRAFT: "Qoralama",
  ISSUED: "Yuborilgan",
  PARTIALLY_PAID: "Qisman to'langan",
  PAID: "To'langan",
  VOIDED: "Bekor qilingan",
};

const STATUS_VARIANT: Record<InvoiceStatus, BadgeVariant> = {
  DRAFT: "outline",
  ISSUED: "secondary",
  PARTIALLY_PAID: "warning",
  PAID: "success",
  VOIDED: "destructive",
};

function formatAmount(val: unknown): string {
  const n =
    typeof val === "object" && val !== null && "toNumber" in val
      ? (val as { toNumber: () => number }).toNumber()
      : Number(val);
  return n.toLocaleString("uz-Latn");
}

export function FinancePage() {
  const router = useRouter();
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [search, setSearch] = useState("");

  const [open, setOpen] = useState(false);
  const [orderId, setOrderId] = useState("");
  const [laborCost, setLaborCost] = useState("");
  const [locale, setLocale] = useState("uz_Latn");

  const { data: invoices = [], isLoading, refetch } = api.finance.list.useQuery({
    status: statusFilter !== "ALL" ? (statusFilter as InvoiceStatus) : undefined,
    search: search || undefined,
  });

  const createInvoice = api.finance.create.useMutation({
    onSuccess: (inv) => {
      toast.success("Hisob-faktura yaratildi");
      setOpen(false);
      setOrderId("");
      setLaborCost("");
      setLocale("uz_Latn");
      refetch();
      router.push(`/finance/${inv.id}` as Parameters<typeof router.push>[0]);
    },
    onError: (err) => toast.error(err.message),
  });

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    createInvoice.mutate({
      orderId,
      laborCost: parseFloat(laborCost),
      locale: locale as "uz_Latn" | "uz_Cyrl" | "ru" | "en",
    });
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Moliya</h1>
        <Button size="sm" onClick={() => setOpen(true)}>
          + Hisob-faktura yaratish
        </Button>
      </div>

      <div className="flex gap-3">
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-52">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">Barchasi</SelectItem>
            <SelectItem value="DRAFT">Qoralama</SelectItem>
            <SelectItem value="ISSUED">Yuborilgan</SelectItem>
            <SelectItem value="PARTIALLY_PAID">Qisman to'langan</SelectItem>
            <SelectItem value="PAID">To'langan</SelectItem>
            <SelectItem value="VOIDED">Bekor qilingan</SelectItem>
          </SelectContent>
        </Select>
        <Input
          className="flex-1"
          placeholder="Faktura raqami yoki buyurtma..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className="rounded-lg border border-zinc-200 dark:border-zinc-700 overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>№</TableHead>
              <TableHead>Buyurtma</TableHead>
              <TableHead>Holat</TableHead>
              <TableHead className="text-right">Jami</TableHead>
              <TableHead className="text-right">To'langan</TableHead>
              <TableHead className="text-right">Qoldiq</TableHead>
              <TableHead>Sana</TableHead>
              <TableHead className="w-10" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading &&
              Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={i}>
                  {Array.from({ length: 8 }).map((_, j) => (
                    <TableCell key={j}>
                      <Skeleton className="h-4 w-full" />
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            {!isLoading && invoices.length === 0 && (
              <TableRow>
                <TableCell colSpan={8} className="text-center text-zinc-400 py-10">
                  Hisob-fakturalar topilmadi
                </TableCell>
              </TableRow>
            )}
            {invoices.map((inv) => {
              const total =
                typeof inv.totalAmount === "object" && inv.totalAmount !== null
                  ? (inv.totalAmount as { toNumber: () => number }).toNumber()
                  : Number(inv.totalAmount);
              const paid =
                typeof inv.paidAmount === "object" && inv.paidAmount !== null
                  ? (inv.paidAmount as { toNumber: () => number }).toNumber()
                  : Number(inv.paidAmount);
              const balance = total - paid;
              return (
                <TableRow
                  key={inv.id}
                  className="cursor-pointer hover:bg-zinc-50 dark:hover:bg-zinc-800"
                  onClick={() =>
                    router.push(`/finance/${inv.id}` as Parameters<typeof router.push>[0])
                  }
                >
                  <TableCell className="font-mono text-sm">{inv.invoiceNumber}</TableCell>
                  <TableCell className="font-mono text-xs text-zinc-500">
                    {inv.order.orderNumber}
                  </TableCell>
                  <TableCell>
                    <Badge variant={STATUS_VARIANT[inv.status as InvoiceStatus] ?? "default"}>
                      {STATUS_LABELS[inv.status as InvoiceStatus] ?? inv.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">{formatAmount(inv.totalAmount)}</TableCell>
                  <TableCell className="text-right text-green-600">
                    {formatAmount(inv.paidAmount)}
                  </TableCell>
                  <TableCell
                    className={`text-right font-medium ${balance > 0 ? "text-red-600" : "text-zinc-400"}`}
                  >
                    {balance.toLocaleString("uz-Latn")}
                  </TableCell>
                  <TableCell className="text-sm text-zinc-500">
                    {new Date(inv.createdAt).toLocaleDateString("uz-Latn")}
                  </TableCell>
                  <TableCell>
                    <ChevronRight className="h-4 w-4 text-zinc-400" />
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Hisob-faktura yaratish</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="invoiceOrderId">Buyurtma ID</Label>
              <Input
                id="invoiceOrderId"
                value={orderId}
                onChange={(e) => setOrderId(e.target.value)}
                placeholder="Buyurtma IDsi"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="laborCost">Ish haqi (so'm)</Label>
              <Input
                id="laborCost"
                type="number"
                min={0}
                step="0.01"
                value={laborCost}
                onChange={(e) => setLaborCost(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label>Til</Label>
              <Select value={locale} onValueChange={setLocale}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="uz_Latn">O'zbek (lotin)</SelectItem>
                  <SelectItem value="ru">Русский</SelectItem>
                  <SelectItem value="en">English</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <DialogFooter>
              <DialogClose asChild>
                <Button type="button" variant="outline">
                  Bekor qilish
                </Button>
              </DialogClose>
              <Button type="submit" disabled={createInvoice.isPending}>
                {createInvoice.isPending ? "Yaratilmoqda..." : "Yaratish"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
