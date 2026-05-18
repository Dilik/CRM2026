"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { api } from "@/lib/trpc/react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { CreateStaffDialog } from "./CreateStaffDialog";

const ROLE_LABELS: Record<string, string> = {
  ADMIN: "Admin",
  RECEPTIONIST: "Resepshionist",
  MASTER: "Usta",
  WAREHOUSE: "Omborchi",
  EXECUTIVE: "Direktor",
};

export function StaffTable() {
  const t = useTranslations("staff");
  const { data: staff = [], refetch } = api.staff.list.useQuery();
  const updateMutation = api.staff.update.useMutation({ onSuccess: () => refetch() });
  const [open, setOpen] = useState(false);

  function toggleActive(id: string, active: boolean) {
    updateMutation.mutate({ id, active });
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">{t("title")}</h1>
        <Button size="sm" onClick={() => setOpen(true)}>
          + {t("create")}
        </Button>
      </div>

      <div className="rounded-lg border border-zinc-200 dark:border-zinc-700 overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t("name")}</TableHead>
              <TableHead>{t("phone")}</TableHead>
              <TableHead>{t("role")}</TableHead>
              <TableHead>{t("active")}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {staff.map((s) => (
              <TableRow key={s.id}>
                <TableCell className="font-medium">{s.name || "—"}</TableCell>
                <TableCell className="font-mono text-sm">{s.phone ?? "—"}</TableCell>
                <TableCell>
                  <Badge variant="secondary">{ROLE_LABELS[s.role] ?? s.role}</Badge>
                </TableCell>
                <TableCell>
                  <Switch
                    checked={s.active}
                    onCheckedChange={(checked) => toggleActive(s.id, checked)}
                    disabled={updateMutation.isPending}
                  />
                </TableCell>
              </TableRow>
            ))}
            {staff.length === 0 && (
              <TableRow>
                <TableCell colSpan={4} className="text-center text-zinc-400 py-8">
                  {t("empty")}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <CreateStaffDialog open={open} onClose={() => setOpen(false)} onCreated={() => { setOpen(false); refetch(); }} />
    </div>
  );
}
