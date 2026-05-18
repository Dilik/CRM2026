"use client";

import { useState } from "react";
import { api } from "@/lib/trpc/react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";

const CATEGORY_LABELS: Record<string, string> = {
  REFRIGERATOR: "Muzlatgich",
  WASHING_MACHINE: "Kir yuvish mashinasi",
  DISHWASHER: "Idish yuvish mashinasi",
  OVEN: "Pech",
  MICROWAVE: "Mikroto'lqinli pech",
  COOKTOP: "Plita",
  HOOD: "Havo tortgich",
  DRYER: "Quritgich",
  OTHER: "Boshqa",
};

export function ModelDetailPage({ modelId }: { modelId: string }) {
  const [activeTab, setActiveTab] = useState<"versions" | "bom">("versions");
  const [selectedVersionId, setSelectedVersionId] = useState<string>("");
  const [versionDialogOpen, setVersionDialogOpen] = useState(false);
  const [year, setYear] = useState("");
  const [piNumber, setPiNumber] = useState("");
  const [unitVolume, setUnitVolume] = useState("");

  const { data: model, isLoading, refetch } = api.catalog.model.get.useQuery({ id: modelId });
  const { data: bomParts = [], isLoading: bomLoading } = api.catalog.bomPart.list.useQuery(
    { versionId: selectedVersionId },
    { enabled: !!selectedVersionId }
  );

  const createVersion = api.catalog.version.create.useMutation({
    onSuccess: () => {
      toast.success("Versiya qo'shildi");
      setVersionDialogOpen(false);
      setYear("");
      setPiNumber("");
      setUnitVolume("");
      refetch();
    },
    onError: (err) => toast.error(err.message),
  });

  function handleVersionSubmit(e: React.FormEvent) {
    e.preventDefault();
    createVersion.mutate({
      modelId,
      year: parseInt(year, 10),
      piNumber,
      unitVolume: parseInt(unitVolume, 10) || 0,
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

  if (!model) {
    return <div className="text-zinc-400">Model topilmadi</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold">
          {model.brand} {model.modelCode}
        </h1>
        <div className="flex items-center gap-2 mt-1 text-sm text-zinc-500">
          <span>{model.nameUz}</span>
          <span>·</span>
          <Badge variant="secondary">
            {CATEGORY_LABELS[model.category] ?? model.category}
          </Badge>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-zinc-200 dark:border-zinc-700">
        <button
          onClick={() => setActiveTab("versions")}
          className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
            activeTab === "versions"
              ? "border-zinc-900 dark:border-white text-zinc-900 dark:text-white"
              : "border-transparent text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300"
          }`}
        >
          Versiyalar
        </button>
        <button
          onClick={() => setActiveTab("bom")}
          className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
            activeTab === "bom"
              ? "border-zinc-900 dark:border-white text-zinc-900 dark:text-white"
              : "border-transparent text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300"
          }`}
        >
          BOM qismlari
        </button>
      </div>

      {/* Versiyalar tab */}
      {activeTab === "versions" && (
        <div className="space-y-4">
          <div className="flex justify-end">
            <Button size="sm" onClick={() => setVersionDialogOpen(true)}>
              + Yangi versiya
            </Button>
          </div>
          <div className="rounded-lg border border-zinc-200 dark:border-zinc-700 overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Yil</TableHead>
                  <TableHead>PI raqami</TableHead>
                  <TableHead className="text-right">Hajm (litr)</TableHead>
                  <TableHead>Holat</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {model.versions.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center text-zinc-400 py-8">
                      Versiyalar yo'q
                    </TableCell>
                  </TableRow>
                )}
                {model.versions.map((v) => (
                  <TableRow key={v.id}>
                    <TableCell className="font-medium">{v.year}</TableCell>
                    <TableCell className="font-mono text-sm">{v.piNumber}</TableCell>
                    <TableCell className="text-right">{v.unitVolume}</TableCell>
                    <TableCell>
                      <Badge variant={v.active ? "default" : "secondary"}>
                        {v.active ? "Faol" : "Arxiv"}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      )}

      {/* BOM qismlari tab */}
      {activeTab === "bom" && (
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <Label className="shrink-0">Versiyani tanlang:</Label>
            <Select value={selectedVersionId} onValueChange={setSelectedVersionId}>
              <SelectTrigger className="w-64">
                <SelectValue placeholder="Versiya..." />
              </SelectTrigger>
              <SelectContent>
                {model.versions.map((v) => (
                  <SelectItem key={v.id} value={v.id}>
                    {v.year} — {v.piNumber}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {selectedVersionId && (
            <div className="rounded-lg border border-zinc-200 dark:border-zinc-700 overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Qism kodi</TableHead>
                    <TableHead>Nom (Uz)</TableHead>
                    <TableHead className="text-right">Miqdor</TableHead>
                    <TableHead>Birlik</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {bomLoading && (
                    <TableRow>
                      <TableCell colSpan={4}>
                        <Skeleton className="h-4 w-full" />
                      </TableCell>
                    </TableRow>
                  )}
                  {!bomLoading && bomParts.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center text-zinc-400 py-8">
                        BOM qismlari yo'q
                      </TableCell>
                    </TableRow>
                  )}
                  {bomParts.map((p) => (
                    <TableRow key={p.id}>
                      <TableCell className="font-mono text-sm">{p.partCode}</TableCell>
                      <TableCell>{p.nameUz}</TableCell>
                      <TableCell className="text-right">{p.quantity}</TableCell>
                      <TableCell>{p.unit}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </div>
      )}

      {/* New Version Dialog */}
      <Dialog open={versionDialogOpen} onOpenChange={setVersionDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Yangi versiya qo'shish</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleVersionSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="year">Yil</Label>
              <Input
                id="year"
                type="number"
                min={1990}
                max={2100}
                value={year}
                onChange={(e) => setYear(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="piNumber">PI raqami</Label>
              <Input
                id="piNumber"
                value={piNumber}
                onChange={(e) => setPiNumber(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="unitVolume">Hajm (litr)</Label>
              <Input
                id="unitVolume"
                type="number"
                min={0}
                value={unitVolume}
                onChange={(e) => setUnitVolume(e.target.value)}
              />
            </div>
            <DialogFooter>
              <DialogClose asChild>
                <Button type="button" variant="outline">
                  Bekor qilish
                </Button>
              </DialogClose>
              <Button type="submit" disabled={createVersion.isPending}>
                {createVersion.isPending ? "Saqlanmoqda..." : "Saqlash"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
