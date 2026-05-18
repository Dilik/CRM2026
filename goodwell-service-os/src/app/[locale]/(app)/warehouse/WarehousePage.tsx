"use client";

import { useState } from "react";
import { api } from "@/lib/trpc/react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertTriangle } from "lucide-react";

type StockItem = {
  id: string;
  partId: string;
  part: { partCode: string; nameUz: string };
  quantity: number;
  reserved: number;
  lowStockAt: number;
  unitCost: number | { toNumber: () => number };
};

function getQuantityColor(qty: number, threshold: number) {
  if (qty < threshold) return "text-red-600 font-semibold";
  if (qty === threshold) return "text-orange-500 font-semibold";
  return "text-green-600";
}

export function WarehousePage() {
  const { data: stock = [], isLoading, refetch } = api.inventory.stock.list.useQuery();
  const { data: lowStock = [] } = api.inventory.stock.lowStock.useQuery();

  const receiveStock = api.inventory.stock.receive.useMutation({
    onSuccess: () => {
      toast.success("Qabul qilindi");
      setReceiveOpen(false);
      setReceiveQty("");
      setReceiveCost("");
      setReceiveNotes("");
      refetch();
    },
    onError: (err) => toast.error(err.message),
  });

  const adjustStock = api.inventory.stock.adjust.useMutation({
    onSuccess: () => {
      toast.success("Tuzatildi");
      setAdjustOpen(false);
      setAdjustDelta("");
      setAdjustReason("");
      refetch();
    },
    onError: (err) => toast.error(err.message),
  });

  const [receiveOpen, setReceiveOpen] = useState(false);
  const [adjustOpen, setAdjustOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<StockItem | null>(null);

  const [receiveQty, setReceiveQty] = useState("");
  const [receiveCost, setReceiveCost] = useState("");
  const [receiveNotes, setReceiveNotes] = useState("");

  const [adjustDelta, setAdjustDelta] = useState("");
  const [adjustReason, setAdjustReason] = useState("");

  function openReceive(item: StockItem) {
    setSelectedItem(item);
    setReceiveOpen(true);
  }

  function openAdjust(item: StockItem) {
    setSelectedItem(item);
    setAdjustOpen(true);
  }

  function handleReceive(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedItem) return;
    receiveStock.mutate({
      partId: selectedItem.partId,
      quantity: parseInt(receiveQty, 10),
      unitCost: parseFloat(receiveCost),
      notes: receiveNotes || undefined,
    });
  }

  function handleAdjust(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedItem || !adjustReason) return;
    adjustStock.mutate({
      partId: selectedItem.partId,
      quantity: parseInt(adjustDelta, 10),
      reason: adjustReason,
    });
  }

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">Ombor</h1>

      {lowStock.length > 0 && (
        <div className="flex items-center gap-2 rounded-lg border border-orange-200 bg-orange-50 dark:border-orange-900 dark:bg-orange-950/30 px-4 py-3 text-sm text-orange-700 dark:text-orange-300">
          <AlertTriangle className="h-4 w-4 shrink-0" />
          <span>
            <strong>{lowStock.length}</strong> ta mahsulot kam qolgan
          </span>
        </div>
      )}

      <div className="rounded-lg border border-zinc-200 dark:border-zinc-700 overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Qism kodi</TableHead>
              <TableHead>Nom</TableHead>
              <TableHead className="text-right">Miqdor</TableHead>
              <TableHead className="text-right">Band</TableHead>
              <TableHead className="text-right">Kam qolish chegarasi</TableHead>
              <TableHead className="w-32" />
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
            {!isLoading && stock.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} className="text-center text-zinc-400 py-10">
                  Ombor bo'sh
                </TableCell>
              </TableRow>
            )}
            {(stock as StockItem[]).map((item) => (
              <TableRow key={item.id}>
                <TableCell className="font-mono text-sm">{item.part.partCode}</TableCell>
                <TableCell>{item.part.nameUz}</TableCell>
                <TableCell className={`text-right ${getQuantityColor(item.quantity, item.lowStockAt)}`}>
                  {item.quantity}
                </TableCell>
                <TableCell className="text-right text-zinc-500">{item.reserved}</TableCell>
                <TableCell className="text-right text-zinc-500">{item.lowStockAt}</TableCell>
                <TableCell>
                  <div className="flex gap-1 justify-end">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => openReceive(item)}
                    >
                      Qabul
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => openAdjust(item)}
                    >
                      Tuzat
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Receive Dialog */}
      <Dialog open={receiveOpen} onOpenChange={setReceiveOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              Qabul qilish — {selectedItem?.part.nameUz}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleReceive} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="receiveQty">Miqdor</Label>
              <Input
                id="receiveQty"
                type="number"
                min={1}
                value={receiveQty}
                onChange={(e) => setReceiveQty(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="receiveCost">Birlik narxi (so'm)</Label>
              <Input
                id="receiveCost"
                type="number"
                min={0}
                step="0.01"
                value={receiveCost}
                onChange={(e) => setReceiveCost(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="receiveNotes">Izoh (ixtiyoriy)</Label>
              <Input
                id="receiveNotes"
                value={receiveNotes}
                onChange={(e) => setReceiveNotes(e.target.value)}
              />
            </div>
            <DialogFooter>
              <DialogClose asChild>
                <Button type="button" variant="outline">
                  Bekor qilish
                </Button>
              </DialogClose>
              <Button type="submit" disabled={receiveStock.isPending}>
                {receiveStock.isPending ? "Saqlanmoqda..." : "Qabul qilish"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Adjust Dialog */}
      <Dialog open={adjustOpen} onOpenChange={setAdjustOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              Tuzatish — {selectedItem?.part.nameUz}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleAdjust} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="adjustDelta">Miqdor o'zgarishi (−/+)</Label>
              <Input
                id="adjustDelta"
                type="number"
                value={adjustDelta}
                onChange={(e) => setAdjustDelta(e.target.value)}
                placeholder="-5 yoki +10"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="adjustReason">Sabab *</Label>
              <Input
                id="adjustReason"
                value={adjustReason}
                onChange={(e) => setAdjustReason(e.target.value)}
                placeholder="Inventarizatsiya, yo'qolish, ..."
                required
              />
            </div>
            <DialogFooter>
              <DialogClose asChild>
                <Button type="button" variant="outline">
                  Bekor qilish
                </Button>
              </DialogClose>
              <Button type="submit" disabled={adjustStock.isPending || !adjustReason}>
                {adjustStock.isPending ? "Saqlanmoqda..." : "Tuzatish"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
