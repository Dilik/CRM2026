"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "@/i18n/navigation";
import { api } from "@/lib/trpc/react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
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

export function OrdersPage({ prefilledCustomerId }: { prefilledCustomerId?: string }) {
  const router = useRouter();
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [open, setOpen] = useState(false);
  const [phone, setPhone] = useState("");
  const [resolvedCustomerId, setResolvedCustomerId] = useState(prefilledCustomerId ?? "");
  const [problem, setProblem] = useState("");
  const [source, setSource] = useState("WALK_IN");
  const [priority, setPriority] = useState("NORMAL");

  // Phone lookup for customer
  const { data: customerResults = [] } = api.customer.list.useQuery(
    { query: phone },
    { enabled: phone.length >= 7 }
  );
  const foundCustomer = customerResults[0] ?? null;

  useEffect(() => {
    if (foundCustomer) {
      setResolvedCustomerId(foundCustomer.id);
    }
  }, [foundCustomer]);

  // Auto-open dialog when navigated with customerId
  useEffect(() => {
    if (prefilledCustomerId) {
      setResolvedCustomerId(prefilledCustomerId);
      setOpen(true);
    }
  }, [prefilledCustomerId]);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => setDebouncedSearch(search), 300);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [search]);

  const { data: orders = [], isLoading, refetch } = api.order.list.useQuery({
    status: statusFilter !== "ALL" ? (statusFilter as OrderStatus) : undefined,
    search: debouncedSearch || undefined,
  });

  const createOrder = api.order.create.useMutation({
    onSuccess: (order) => {
      toast.success("Buyurtma yaratildi");
      setOpen(false);
      resetForm();
      refetch();
      router.push(`/orders/${order.id}` as Parameters<typeof router.push>[0]);
    },
    onError: (err) => toast.error(err.message),
  });

  function resetForm() {
    setPhone("");
    setResolvedCustomerId("");
    setProblem("");
    setSource("WALK_IN");
    setPriority("NORMAL");
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!resolvedCustomerId) {
      toast.error("Mijoz topilmadi");
      return;
    }
    createOrder.mutate({
      customerId: resolvedCustomerId,
      problem,
      source: source as "WALK_IN" | "PHONE_IN" | "ONLINE",
      priority: priority as "LOW" | "NORMAL" | "HIGH" | "URGENT",
    });
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Buyurtmalar</h1>
        <Button size="sm" onClick={() => setOpen(true)}>
          + Yangi buyurtma
        </Button>
      </div>

      <div className="flex gap-3">
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-48">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">Barchasi</SelectItem>
            <SelectItem value="INTAKE">Qabul</SelectItem>
            <SelectItem value="ASSIGNED">Tayinlangan</SelectItem>
            <SelectItem value="DIAGNOSED">Diagnostika</SelectItem>
            <SelectItem value="PARTS_REQUESTED">Qismlar kutilmoqda</SelectItem>
            <SelectItem value="IN_REPAIR">Ta'mirda</SelectItem>
            <SelectItem value="READY">Tayyor</SelectItem>
            <SelectItem value="CLOSED">Yopilgan</SelectItem>
            <SelectItem value="CANCELLED">Bekor qilingan</SelectItem>
          </SelectContent>
        </Select>
        <Input
          className="flex-1"
          placeholder="Raqam yoki mijoz ismi..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className="rounded-lg border border-zinc-200 dark:border-zinc-700 overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>№</TableHead>
              <TableHead>Mijoz</TableHead>
              <TableHead>Holat</TableHead>
              <TableHead>Ustuvorlik</TableHead>
              <TableHead>Sana</TableHead>
              <TableHead className="w-10" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading &&
              Array.from({ length: 6 }).map((_, i) => (
                <TableRow key={i}>
                  {Array.from({ length: 6 }).map((_, j) => (
                    <TableCell key={j}>
                      <Skeleton className="h-4 w-full" />
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            {!isLoading && orders.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} className="text-center text-zinc-400 py-10">
                  Buyurtmalar topilmadi
                </TableCell>
              </TableRow>
            )}
            {orders.map((o) => (
              <TableRow
                key={o.id}
                className="cursor-pointer hover:bg-zinc-50 dark:hover:bg-zinc-800"
                onClick={() => router.push(`/orders/${o.id}` as Parameters<typeof router.push>[0])}
              >
                <TableCell className="font-mono text-sm">{o.orderNumber}</TableCell>
                <TableCell className="font-medium">{o.customer.name}</TableCell>
                <TableCell>
                  <Badge variant={STATUS_VARIANT[o.status] ?? "default"}>
                    {STATUS_LABELS[o.status] ?? o.status}
                  </Badge>
                </TableCell>
                <TableCell className="text-sm text-zinc-500">
                  {PRIORITY_LABELS[o.priority] ?? o.priority}
                </TableCell>
                <TableCell className="text-sm text-zinc-500">
                  {new Date(o.createdAt).toLocaleDateString("uz-Latn")}
                </TableCell>
                <TableCell>
                  <ChevronRight className="h-4 w-4 text-zinc-400" />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) resetForm(); }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Yangi buyurtma</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="orderPhone">Mijoz telefon raqami</Label>
              <Input
                id="orderPhone"
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+998901234567"
              />
              {phone.length >= 7 && foundCustomer && (
                <p className="text-xs text-green-600">
                  Topildi: {foundCustomer.name}
                </p>
              )}
              {phone.length >= 7 && !foundCustomer && (
                <p className="text-xs text-zinc-400">Mijoz topilmadi</p>
              )}
              {prefilledCustomerId && !phone && (
                <p className="text-xs text-green-600">Mijoz tanlangan</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="problem">Muammo tavsifi</Label>
              <Textarea
                id="problem"
                value={problem}
                onChange={(e) => setProblem(e.target.value)}
                rows={3}
                required
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label>Manba</Label>
                <Select value={source} onValueChange={setSource}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="WALK_IN">Shaxsan</SelectItem>
                    <SelectItem value="PHONE_IN">Telefon</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Ustuvorlik</Label>
                <Select value={priority} onValueChange={setPriority}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="LOW">Past</SelectItem>
                    <SelectItem value="NORMAL">Normal</SelectItem>
                    <SelectItem value="HIGH">Yuqori</SelectItem>
                    <SelectItem value="URGENT">Shoshilinch</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <DialogClose asChild>
                <Button type="button" variant="outline">
                  Bekor qilish
                </Button>
              </DialogClose>
              <Button
                type="submit"
                disabled={createOrder.isPending || !resolvedCustomerId}
              >
                {createOrder.isPending ? "Yaratilmoqda..." : "Yaratish"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
