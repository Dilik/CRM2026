import { useTranslations } from "next-intl";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ClipboardList, Users, Warehouse, Banknote } from "lucide-react";

function StatCard({ icon: Icon, label, value, sub }: { icon: React.ElementType; label: string; value: string; sub?: string }) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium text-zinc-500 dark:text-zinc-400">{label}</CardTitle>
        <Icon className="h-4 w-4 text-zinc-400" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {sub && <p className="text-xs text-zinc-500 mt-1">{sub}</p>}
      </CardContent>
    </Card>
  );
}

function DashboardClient() {
  const t = useTranslations("shell.nav");
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">{t("dashboard")}</h1>
      <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
        <StatCard icon={ClipboardList} label="Faol buyurtmalar" value="—" sub="Ma'lumot yuklanmoqda" />
        <StatCard icon={Users} label="Mijozlar" value="—" sub="Ma'lumot yuklanmoqda" />
        <StatCard icon={Warehouse} label="Qoldiq" value="—" sub="Ma'lumot yuklanmoqda" />
        <StatCard icon={Banknote} label="Daromad" value="—" sub="Ma'lumot yuklanmoqda" />
      </div>
    </div>
  );
}

export default function DashboardPage() {
  return <DashboardClient />;
}
