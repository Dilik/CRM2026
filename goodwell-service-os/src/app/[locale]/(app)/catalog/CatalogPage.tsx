"use client";

import { useState } from "react";
import { useRouter } from "@/i18n/navigation";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { ChevronRight } from "lucide-react";

const CATEGORIES = [
  { value: "REFRIGERATOR", label: "Muzlatgich" },
  { value: "WASHING_MACHINE", label: "Kir yuvish mashinasi" },
  { value: "DISHWASHER", label: "Idish yuvish mashinasi" },
  { value: "OVEN", label: "Pech" },
  { value: "MICROWAVE", label: "Mikroto'lqinli pech" },
  { value: "COOKTOP", label: "Plita" },
  { value: "HOOD", label: "Havo tortgich" },
  { value: "DRYER", label: "Quritgich" },
  { value: "OTHER", label: "Boshqa" },
];

const CATEGORY_LABELS: Record<string, string> = Object.fromEntries(
  CATEGORIES.map((c) => [c.value, c.label])
);

export function CatalogPage() {
  const router = useRouter();
  const { data: models = [], isLoading, refetch } = api.catalog.model.list.useQuery();
  const createModel = api.catalog.model.create.useMutation({
    onSuccess: () => {
      toast.success("Model muvaffaqiyatli qo'shildi");
      setOpen(false);
      resetForm();
      refetch();
    },
    onError: (err) => toast.error(err.message),
  });

  const [open, setOpen] = useState(false);
  const [brand, setBrand] = useState("");
  const [modelCode, setModelCode] = useState("");
  const [nameUz, setNameUz] = useState("");
  const [nameRu, setNameRu] = useState("");
  const [category, setCategory] = useState("");

  function resetForm() {
    setBrand("");
    setModelCode("");
    setNameUz("");
    setNameRu("");
    setCategory("");
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!category) return;
    createModel.mutate({
      brand,
      modelCode,
      nameUz,
      nameRu,
      category: category as Parameters<typeof createModel.mutate>[0]["category"],
    });
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Katalog</h1>
        <Button size="sm" onClick={() => setOpen(true)}>
          + Yangi model
        </Button>
      </div>

      <div className="rounded-lg border border-zinc-200 dark:border-zinc-700 overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Brand</TableHead>
              <TableHead>Model kodi</TableHead>
              <TableHead>Nom (Uz)</TableHead>
              <TableHead>Kategoriya</TableHead>
              <TableHead className="text-right">Versiyalar soni</TableHead>
              <TableHead className="w-10" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading &&
              Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={i}>
                  {Array.from({ length: 6 }).map((_, j) => (
                    <TableCell key={j}>
                      <Skeleton className="h-4 w-full" />
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            {!isLoading && models.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} className="text-center text-zinc-400 py-10">
                  Katalog bo'sh
                </TableCell>
              </TableRow>
            )}
            {models.map((m) => (
              <TableRow
                key={m.id}
                className="cursor-pointer hover:bg-zinc-50 dark:hover:bg-zinc-800"
                onClick={() => router.push(`/catalog/${m.id}` as Parameters<typeof router.push>[0])}
              >
                <TableCell className="font-medium">{m.brand}</TableCell>
                <TableCell className="font-mono text-sm">{m.modelCode}</TableCell>
                <TableCell>{m.nameUz}</TableCell>
                <TableCell>{CATEGORY_LABELS[m.category] ?? m.category}</TableCell>
                <TableCell className="text-right">{m._count.versions}</TableCell>
                <TableCell>
                  <ChevronRight className="h-4 w-4 text-zinc-400" />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Yangi model qo'shish</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="brand">Brand</Label>
              <Input
                id="brand"
                value={brand}
                onChange={(e) => setBrand(e.target.value)}
                placeholder="Samsung"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="modelCode">Model kodi</Label>
              <Input
                id="modelCode"
                value={modelCode}
                onChange={(e) => setModelCode(e.target.value)}
                placeholder="RF-28T5F01B4"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="nameUz">Nom (Uzbekcha)</Label>
              <Input
                id="nameUz"
                value={nameUz}
                onChange={(e) => setNameUz(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="nameRu">Nom (Ruscha)</Label>
              <Input
                id="nameRu"
                value={nameRu}
                onChange={(e) => setNameRu(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label>Kategoriya</Label>
              <Select value={category} onValueChange={setCategory} required>
                <SelectTrigger>
                  <SelectValue placeholder="Kategoriyani tanlang" />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map((c) => (
                    <SelectItem key={c.value} value={c.value}>
                      {c.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <DialogFooter>
              <DialogClose asChild>
                <Button type="button" variant="outline">
                  Bekor qilish
                </Button>
              </DialogClose>
              <Button type="submit" disabled={createModel.isPending || !category}>
                {createModel.isPending ? "Saqlanmoqda..." : "Saqlash"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
