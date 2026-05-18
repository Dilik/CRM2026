"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { api } from "@/lib/trpc/react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const ROLES = [
  { value: "ADMIN", label: "Admin" },
  { value: "RECEPTIONIST", label: "Resepshionist" },
  { value: "MASTER", label: "Usta" },
  { value: "WAREHOUSE", label: "Omborchi" },
  { value: "EXECUTIVE", label: "Direktor" },
] as const;

type Role = (typeof ROLES)[number]["value"];

export function CreateStaffDialog({
  open,
  onClose,
  onCreated,
}: {
  open: boolean;
  onClose: () => void;
  onCreated: () => void;
}) {
  const t = useTranslations("staff");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [role, setRole] = useState<Role>("MASTER");

  const mutation = api.staff.create.useMutation({
    onSuccess: () => {
      toast.success(t("created"));
      setName(""); setPhone(""); setRole("MASTER");
      onCreated();
    },
    onError: (err) => {
      if (err.data?.code === "CONFLICT") toast.error(t("error.phoneTaken"));
      else toast.error(t("error.generic"));
    },
  });

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim() || !phone.trim()) return;
    mutation.mutate({ name: name.trim(), phone: phone.trim(), role });
  }

  return (
    <Dialog open={open} onOpenChange={(o) => { if (!o) onClose(); }}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>{t("createTitle")}</DialogTitle>
        </DialogHeader>
        <form onSubmit={onSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="staff-name">{t("name")}</Label>
            <Input id="staff-name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Ismi Familiyasi" required />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="staff-phone">{t("phone")}</Label>
            <Input id="staff-phone" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+998901234567" required />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="staff-role">{t("role")}</Label>
            <Select value={role} onValueChange={(v) => setRole(v as Role)}>
              <SelectTrigger id="staff-role"><SelectValue /></SelectTrigger>
              <SelectContent>
                {ROLES.map((r) => <SelectItem key={r.value} value={r.value}>{r.label}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>{t("cancel")}</Button>
            <Button type="submit" disabled={mutation.isPending}>{mutation.isPending ? "..." : t("save")}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
