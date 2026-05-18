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

const METHOD_LABELS: Record<string, string> = {
  CASH: "Naqd",
  CARD: "Karta",
  BANK_TRANSFER: "Bank o'tkazmasi",
};

function toNum(val: unknown): number {
  if (typeof val === "object" && val !== null && "toNumber" in val) {
    return (val as { toNumber: () => number }).toNumber();
  }
  return Number(val);
}

export function InvoiceDetailPage({ invoiceId }: { invoiceId: string }) {
  const { data: invoice, isLoading, refetch } = api.finance.get.useQuery({ id: invoiceId });

  const recordPayment = api.finance.recordPayment.useMutation({
    onSuccess: () => {
      toast.success("To'lov qabul qilindi");
      setPayOpen(false);
      setPayAmount("");
      setPayMethod("CASH");
      setPayRef("");
      refetch();
    },
    onError: (err) => toast.error(err.message),
  });

  const [payOpen, setPayOpen] = useState(false);
  const [payAmount, setPayAmount] = useState("");
  const [payMethod, setPayMethod] = useState("CASH");
  const [payRef, setPayRef] = useState("");

  function handlePayment(e: React.FormEvent) {
    e.preventDefault();
    recordPayment.mutate({
      invoiceId,
      amount: parseFloat(payAmount),
      method: payMethod as "CASH" | "CARD" | "BANK_TRANSFER",
      reference: payRef || undefined,
    });
  }

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-4 w-48" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (!invoice) {
    return <div className="text-zinc-400">Hisob-faktura topilmadi</div>;
  }

  const totalAmount = toNum(invoice.totalAmount);
  const paidAmount = toNum(invoice.paidAmount);
  const balance = totalAmount - paidAmount;
  const status = invoice.status as InvoiceStatus;
  const canPay = !["PAID", "VOIDED"].includes(status);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-semibold font-mono">{invoice.invoiceNumber}</h1>
            <Badge variant={STATUS_VARIANT[status] ?? "default"}>
              {STATUS_LABELS[status] ?? status}
            </Badge>
          </div>
          <div className="mt-2 text-sm text-zinc-500 space-y-0.5">
            <div>
              Buyurtma:{" "}
              <span className="font-mono">{invoice.order.orderNumber}</span> —{" "}
              {invoice.order.customer.name}
            </div>
            {invoice.issuedAt && (
              <div>
                Sanasi: {new Date(invoice.issuedAt).toLocaleDateString("uz-Latn")}
              </div>
            )}
          </div>
        </div>
        {canPay && (
          <Button size="sm" onClick={() => setPayOpen(true)}>
            + To'lov qo'shish
          </Button>
        )}
      </div>

      <Separator />

      {/* Lines */}
      <div>
        <h2 className="text-sm font-semibold text-zinc-500 uppercase tracking-wide mb-3">
          Qatorlar
        </h2>
        <div className="rounded-lg border border-zinc-200 dark:border-zinc-700 overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Tavsif</TableHead>
                <TableHead className="text-right">Miqdor</TableHead>
                <TableHead className="text-right">Birlik narxi</TableHead>
                <TableHead className="text-right">Jami</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {invoice.lines.map((line) => (
                <TableRow key={line.id}>
                  <TableCell>{line.description}</TableCell>
                  <TableCell className="text-right">{line.quantity}</TableCell>
                  <TableCell className="text-right">
                    {toNum(line.unitPrice).toLocaleString("uz-Latn")}
                  </TableCell>
                  <TableCell className="text-right font-medium">
                    {toNum(line.total).toLocaleString("uz-Latn")}
                  </TableCell>
                </TableRow>
              ))}
              <TableRow className="border-t-2 border-zinc-300 dark:border-zinc-600">
                <TableCell colSpan={3} className="text-right font-bold">
                  Jami
                </TableCell>
                <TableCell className="text-right font-bold text-lg">
                  {totalAmount.toLocaleString("uz-Latn")}
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </div>
      </div>

      <Separator />

      {/* Payments */}
      <div>
        <h2 className="text-sm font-semibold text-zinc-500 uppercase tracking-wide mb-3">
          To'lovlar
        </h2>
        {invoice.payments.length === 0 ? (
          <p className="text-sm text-zinc-400">To'lovlar yo'q</p>
        ) : (
          <div className="rounded-lg border border-zinc-200 dark:border-zinc-700 overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Usul</TableHead>
                  <TableHead className="text-right">Summa</TableHead>
                  <TableHead>Izoh</TableHead>
                  <TableHead>Sana</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {invoice.payments.map((p) => (
                  <TableRow key={p.id}>
                    <TableCell>{METHOD_LABELS[p.method] ?? p.method}</TableCell>
                    <TableCell className="text-right font-medium text-green-600">
                      {toNum(p.amount).toLocaleString("uz-Latn")}
                    </TableCell>
                    <TableCell className="text-zinc-500 text-sm">{p.reference ?? "—"}</TableCell>
                    <TableCell className="text-sm text-zinc-500">
                      {new Date(p.recordedAt).toLocaleDateString("uz-Latn")}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </div>

      {/* Balance */}
      <div className="flex items-center justify-end gap-4">
        <span className="text-sm text-zinc-500">To'langan:</span>
        <span className="font-medium text-green-600">{paidAmount.toLocaleString("uz-Latn")}</span>
        <span className="text-sm text-zinc-500">Qoldiq:</span>
        <span
          className={`text-xl font-bold ${balance > 0 ? "text-red-600" : "text-green-600"}`}
        >
          {balance.toLocaleString("uz-Latn")}
        </span>
      </div>

      {/* Payment Dialog */}
      <Dialog open={payOpen} onOpenChange={setPayOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>To'lov qo'shish</DialogTitle>
          </DialogHeader>
          <form onSubmit={handlePayment} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="payAmount">Summa (so'm)</Label>
              <Input
                id="payAmount"
                type="number"
                min={0.01}
                step="0.01"
                value={payAmount}
                onChange={(e) => setPayAmount(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label>To'lov usuli</Label>
              <Select value={payMethod} onValueChange={setPayMethod}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="CASH">Naqd</SelectItem>
                  <SelectItem value="CARD">Karta</SelectItem>
                  <SelectItem value="BANK_TRANSFER">Bank o'tkazmasi</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="payRef">Izoh (ixtiyoriy)</Label>
              <Input
                id="payRef"
                value={payRef}
                onChange={(e) => setPayRef(e.target.value)}
                placeholder="Chek raqami, ..."
              />
            </div>
            <DialogFooter>
              <DialogClose asChild>
                <Button type="button" variant="outline">
                  Bekor qilish
                </Button>
              </DialogClose>
              <Button type="submit" disabled={recordPayment.isPending}>
                {recordPayment.isPending ? "Saqlanmoqda..." : "Saqlash"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
