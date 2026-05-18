import { z } from "zod";
import { Prisma, type PrismaClient } from "@prisma/client";

const Decimal = Prisma.Decimal;

export const masterReportInputSchema = z.object({
  masterId: z.string(),
  days: z.number().int().min(1).max(365).default(30),
});

export const partsReportInputSchema = z.object({
  days: z.number().int().min(1).max(365).default(30),
});

export const revenueByPeriodInputSchema = z.object({
  from: z.date(),
  to: z.date(),
});

export async function getDashboardKpis(prisma: PrismaClient) {
  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  const [openOrders, todayOrders, totalCustomers, monthPayments, topMastersRaw] =
    await Promise.all([
      prisma.serviceOrder.count({
        where: {
          status: {
            notIn: ["CLOSED", "CANCELLED"],
          },
        },
      }),

      prisma.serviceOrder.count({
        where: { createdAt: { gte: startOfToday } },
      }),

      prisma.customer.count(),

      prisma.payment.findMany({
        where: { recordedAt: { gte: startOfMonth } },
        select: { amount: true },
      }),

      prisma.serviceOrder.groupBy({
        by: ["masterId"],
        where: {
          masterId: { not: null },
          status: "CLOSED",
          updatedAt: { gte: startOfMonth },
        },
        _count: { id: true },
        orderBy: { _count: { id: "desc" } },
        take: 5,
      }),
    ]);

  const monthRevenue = monthPayments.reduce(
    (acc, p) => acc.add(p.amount),
    new Decimal(0)
  );

  const masterIds = topMastersRaw
    .map((r) => r.masterId)
    .filter((id): id is string => id !== null);

  const masterUsers = await prisma.user.findMany({
    where: { id: { in: masterIds } },
    select: { id: true, name: true },
  });

  const masterMap = new Map(masterUsers.map((u) => [u.id, u.name]));

  const topMasters = topMastersRaw
    .filter((r) => r.masterId !== null)
    .map((r) => ({
      id: r.masterId as string,
      name: masterMap.get(r.masterId as string) ?? "Unknown",
      count: r._count.id,
    }));

  return {
    openOrders,
    todayOrders,
    totalCustomers,
    monthRevenue,
    topMasters,
  };
}

export async function getMasterReport(
  prisma: PrismaClient,
  masterId: string,
  days = 30
) {
  const since = new Date();
  since.setDate(since.getDate() - days);

  const [completedOrders, partUsages, feedbacks] = await Promise.all([
    prisma.serviceOrder.findMany({
      where: {
        masterId,
        status: "CLOSED",
        updatedAt: { gte: since },
      },
      select: { createdAt: true, updatedAt: true },
    }),

    prisma.orderPartUsage.findMany({
      where: {
        order: { masterId, status: "CLOSED", updatedAt: { gte: since } },
      },
      select: { quantity: true, unitCost: true },
    }),

    // Feedback has no relation back to ServiceOrder — filter via orderId subquery
    prisma.$queryRaw<{ rating: number }[]>`
      SELECT f.rating
      FROM "Feedback" f
      JOIN "ServiceOrder" so ON so.id = f."orderId"
      WHERE so."masterId" = ${masterId}
        AND so."updatedAt" >= ${since}
    `,
  ]);

  const ordersCompleted = completedOrders.length;

  const avgResolutionHours =
    ordersCompleted === 0
      ? 0
      : completedOrders.reduce((acc, o) => {
          const diffMs = o.updatedAt.getTime() - o.createdAt.getTime();
          return acc + diffMs / (1000 * 60 * 60);
        }, 0) / ordersCompleted;

  const totalPartsCost = partUsages.reduce(
    (acc, u) => acc.add(new Decimal(u.quantity).mul(u.unitCost)),
    new Decimal(0)
  );

  const avgRating =
    feedbacks.length === 0
      ? null
      : feedbacks.reduce((acc, f) => acc + f.rating, 0) / feedbacks.length;

  return { masterId, ordersCompleted, avgResolutionHours, totalPartsCost, avgRating };
}

export async function getPartsReport(prisma: PrismaClient, days = 30) {
  const since = new Date();
  since.setDate(since.getDate() - days);

  const usages = await prisma.orderPartUsage.groupBy({
    by: ["partId"],
    where: { issuedAt: { gte: since } },
    _sum: { quantity: true, unitCost: true },
    orderBy: { _sum: { quantity: "desc" } },
    take: 10,
  });

  const partIds = usages.map((u) => u.partId);
  const parts = await prisma.bomPart.findMany({
    where: { id: { in: partIds } },
    select: { id: true, partCode: true, nameUz: true, nameRu: true, unit: true },
  });
  const partMap = new Map(parts.map((p) => [p.id, p]));

  return usages.map((u) => ({
    part: partMap.get(u.partId),
    usageCount: u._sum.quantity ?? 0,
    totalCost: new Decimal(u._sum.quantity ?? 0).mul(u._sum.unitCost ?? 0),
  }));
}

export async function getRevenueByPeriod(
  prisma: PrismaClient,
  from: Date,
  to: Date
) {
  // Group payments by calendar day using raw SQL for portability
  const rows = await prisma.$queryRaw<{ day: Date; total: string }[]>`
    SELECT
      DATE_TRUNC('day', "recordedAt") AS day,
      SUM(amount)::text              AS total
    FROM "Payment"
    WHERE "recordedAt" >= ${from} AND "recordedAt" <= ${to}
    GROUP BY DATE_TRUNC('day', "recordedAt")
    ORDER BY day ASC
  `;

  return rows.map((r) => ({
    day: r.day,
    total: new Decimal(r.total),
  }));
}
