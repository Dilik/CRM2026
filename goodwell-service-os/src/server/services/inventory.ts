import { z } from "zod";
import { TRPCError } from "@/lib/trpc/init";
import type { PrismaClient } from "@prisma/client";

export const receiveStockSchema = z.object({
  partId: z.string(),
  quantity: z.number().int().min(1),
  unitCost: z.number().min(0),
  notes: z.string().optional(),
});

export const issueStockSchema = z.object({
  partId: z.string(),
  quantity: z.number().int().min(1),
  orderId: z.string().optional(),
  reason: z.string().optional(),
});

export const adjustStockSchema = z.object({
  partId: z.string(),
  quantity: z.number().int(),
  reason: z.string().min(1),
});

export async function listStock(prisma: PrismaClient) {
  return prisma.stockItem.findMany({
    include: {
      part: {
        select: {
          partCode: true,
          nameUz: true,
          nameRu: true,
          unit: true,
          versionId: true,
        },
      },
    },
    orderBy: { quantity: "asc" },
  });
}

export async function receiveStock(
  prisma: PrismaClient,
  input: z.infer<typeof receiveStockSchema>,
  userId: string
) {
  const stockItem = await prisma.stockItem.upsert({
    where: { partId: input.partId },
    create: {
      partId: input.partId,
      quantity: input.quantity,
      unitCost: input.unitCost,
    },
    update: {
      quantity: { increment: input.quantity },
      unitCost: input.unitCost,
    },
  });

  await prisma.inventoryMovement.create({
    data: {
      stockItemId: stockItem.id,
      type: "RECEIVE",
      quantity: input.quantity,
      reason: input.notes,
      performedBy: userId,
    },
  });

  return stockItem;
}

export async function issueStock(
  prisma: PrismaClient,
  input: z.infer<typeof issueStockSchema>,
  userId: string
) {
  return prisma.$transaction(async (tx) => {
    const stockItem = await tx.stockItem.findUnique({
      where: { partId: input.partId },
    });

    if (!stockItem || stockItem.quantity < input.quantity) {
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: "Insufficient stock",
      });
    }

    const updated = await tx.stockItem.update({
      where: { id: stockItem.id },
      data: { quantity: { decrement: input.quantity } },
    });

    await tx.inventoryMovement.create({
      data: {
        stockItemId: stockItem.id,
        type: "ISSUE",
        quantity: input.quantity,
        reason: input.reason,
        orderId: input.orderId,
        performedBy: userId,
      },
    });

    return updated;
  });
}

export async function adjustStock(
  prisma: PrismaClient,
  input: z.infer<typeof adjustStockSchema>,
  userId: string
) {
  const stockItem = await prisma.stockItem.findUnique({
    where: { partId: input.partId },
  });

  if (!stockItem) {
    throw new TRPCError({ code: "NOT_FOUND", message: "Stock item not found" });
  }

  const updated = await prisma.stockItem.update({
    where: { id: stockItem.id },
    data: { quantity: { increment: input.quantity } },
  });

  await prisma.inventoryMovement.create({
    data: {
      stockItemId: stockItem.id,
      type: "ADJUST",
      quantity: input.quantity,
      reason: input.reason,
      performedBy: userId,
    },
  });

  return updated;
}

export async function getLowStock(prisma: PrismaClient) {
  // quantity <= lowStockAt is a column-to-column comparison; raw SQL is the only option with Prisma
  const ids = await prisma.$queryRaw<{ id: string }[]>`
    SELECT id FROM "StockItem" WHERE quantity <= "lowStockAt"
  `;
  const idList = ids.map((r) => r.id);
  if (idList.length === 0) return [];

  return prisma.stockItem.findMany({
    where: { id: { in: idList } },
    include: {
      part: {
        select: {
          partCode: true,
          nameUz: true,
          nameRu: true,
          unit: true,
        },
      },
    },
    orderBy: { quantity: "asc" },
  });
}
