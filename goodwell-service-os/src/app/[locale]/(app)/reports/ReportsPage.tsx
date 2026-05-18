"use client";

import { api } from "@/lib/trpc/react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { ClipboardList, CalendarDays, Users, Banknote } from "lucide-react";

function toNum(val: unknown): number {
  if (typeof val === "object" && val !== null && "toNumber" in val) {
    return (val as { toNumber: () => number }).toNumber();
  }
  return Number(val);
}

export function ReportsPage() {
  const { data, isLoading } = api.report.dashboard.useQuery(undefined, {
    refetchInterval: 60000,
  });

  const kpis = [
    {
      icon: ClipboardList,
      label: "Faol buyurtmalar",
      value: data?.openOrders ?? 0,
      description: "Hozirda jarayonda",
    },
    {
      icon: CalendarDays,
      label: "Bugungi buyurtmalar",
      value: data?.todayOrders ?? 0,
      description: "Bugun qabul qilingan",
    },
    {
      icon: Users,
      label: "Jami mijozlar",
      value: data?.totalCustomers ?? 0,
      description: "Ro'yxatdagi",
    },
    {
      icon: Banknote,
      label: "Oylik daromad",
      value: data ? `${toNum(data.monthRevenue).toLocaleString("uz-Latn")} so'm` : "—",
      description: "Joriy oyda",
    },
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Hisobotlar</h1>

      {/* KPI Cards */}
      <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
        {kpis.map((kpi) => {
          const Icon = kpi.icon;
          return (
            <Card key={kpi.label}>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-zinc-500 dark:text-zinc-400">
                  {kpi.label}
                </CardTitle>
                <Icon className="h-4 w-4 text-zinc-400" />
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <Skeleton className="h-8 w-20" />
                ) : (
                  <>
                    <div className="text-2xl font-bold">{kpi.value}</div>
                    <p className="text-xs text-zinc-500 mt-1">{kpi.description}</p>
                  </>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Top Masters */}
      <div>
        <h2 className="text-lg font-semibold mb-3">Top ustalar (joriy oy)</h2>
        <div className="rounded-lg border border-zinc-200 dark:border-zinc-700 overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>#</TableHead>
                <TableHead>Usta</TableHead>
                <TableHead className="text-right">Yopilgan buyurtmalar</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading &&
                Array.from({ length: 3 }).map((_, i) => (
                  <TableRow key={i}>
                    {Array.from({ length: 3 }).map((_, j) => (
                      <TableCell key={j}>
                        <Skeleton className="h-4 w-full" />
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
              {!isLoading && (!data?.topMasters || data.topMasters.length === 0) && (
                <TableRow>
                  <TableCell colSpan={3} className="text-center text-zinc-400 py-8">
                    Ma'lumot yo'q
                  </TableCell>
                </TableRow>
              )}
              {data?.topMasters?.map((master, idx) => (
                <TableRow key={master.id}>
                  <TableCell className="text-zinc-400 text-sm">{idx + 1}</TableCell>
                  <TableCell className="font-medium">{master.name}</TableCell>
                  <TableCell className="text-right font-semibold">{master.count}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}
