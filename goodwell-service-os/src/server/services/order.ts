import { z } from "zod";
import { TRPCError } from "@/lib/trpc/init";
import type { PrismaClient, OrderStatus } from "@prisma/client";
import { issueStock } from "@/server/services/inventory";

// Valid status transitions for the order state machine
const VALID_TRANSITIONS: Partial<Record<OrderStatus, OrderStatus[]>> = {
  INTAKE: ["ASSIGNED", "ON_HOLD", "CANCELLED"],
  ASSIGNED: ["DIAGNOSED", "ON_HOLD", "CANCELLED"],
  DIAGNOSED: ["PARTS_REQUESTED", "IN_REPAIR", "ON_HOLD", "CANCELLED"],
  PARTS_REQUESTED: ["IN_REPAIR", "ON_HOLD", "CANCELLED"],
  IN_REPAIR: ["READY", "ON_HOLD", "CANCELLED"],
  READY: ["CLOSED", "ON_HOLD", "CANCELLED"],
  // ON_HOLD can return to any prior status — validated at runtime via note
  ON_HOLD: ["INTAKE", "ASSIGNED", "DIAGNOSED", "PARTS_REQUESTED", "IN_REPAIR", "READY", "CANCELLED"],
};

export const createOrderSchema = z.object({
  customerId: z.string(),
  applianceId: z.string().optional(),
  problem: z.string().min(1).max(2000),
  source: z.enum(["WALK_IN", "PHONE_IN", "ONLINE"]),
  priority: z.enum(["LOW", "NORMAL", "HIGH", "URGENT"]).default("NORMAL"),
});

export const transitionOrderSchema = z.object({
  orderId: z.string(),
  toStatus: z.enum([
    "INTAKE",
    "ASSIGNED",
    "DIAGNOSED",
    "PARTS_REQUESTED",
    "IN_REPAIR",
    "READY",
    "CLOSED",
    "CANCELLED",
    "ON_HOLD",
  ]),
  note: z.string().optional(),
});

export const assignMasterSchema = z.object({
  orderId: z.string(),
  masterId: z.string(),
});

export const logPartUsageSchema = z.object({
  orderId: z.string(),
  partId: z.string(),
  quantity: z.number().int().min(1),
});

export const listOrdersFilterSchema = z.object({
  status: z
    .enum([
      "INTAKE",
      "ASSIGNED",
      "DIAGNOSED",
      "PARTS_REQUESTED",
      "IN_REPAIR",
      "READY",
      "CLOSED",
      "CANCELLED",
      "ON_HOLD",
    ])
    .optional(),
  masterId: z.string().optional(),
  search: z.string().optional(),
});

async function generateOrderNumber(prisma: PrismaClient): Promise<string> {
  const year = new Date().getFullYear();
  const prefix = `GW-${year}-`;
  const last = await prisma.serviceOrder.findFirst({
    where: { orderNumber: { startsWith: prefix } },
    orderBy: { orderNumber: "desc" },
    select: { orderNumber: true },
  });
  const seq = last ? parseInt(last.orderNumber.slice(prefix.length), 10) + 1 : 1;
  return `${prefix}${String(seq).padStart(5, "0")}`;
}

export async function listOrders(
  prisma: PrismaClient,
  filters?: z.infer<typeof listOrdersFilterSchema>
) {
  return prisma.serviceOrder.findMany({
    where: {
      ...(filters?.status ? { status: filters.status } : {}),
      ...(filters?.masterId ? { masterId: filters.masterId } : {}),
      ...(filters?.search
        ? {
            OR: [
              { orderNumber: { contains: filters.search, mode: "insensitive" } },
              { customer: { name: { contains: filters.search, mode: "insensitive" } } },
              { customer: { phone: { contains: filters.search } } },
            ],
          }
        : {}),
    },
    select: {
      id: true,
      orderNumber: true,
      status: true,
      priority: true,
      source: true,
      problem: true,
      masterId: true,
      createdAt: true,
      updatedAt: true,
      customer: { select: { id: true, name: true, phone: true } },
    },
    orderBy: { createdAt: "desc" },
  });
}

export async function getOrder(prisma: PrismaClient, id: string) {
  return prisma.serviceOrder.findUniqueOrThrow({
    where: { id },
    include: {
      customer: true,
      appliance: {
        include: {
          model: { select: { brand: true, modelCode: true, nameUz: true, nameRu: true } },
        },
      },
      events: { orderBy: { createdAt: "asc" } },
      partUsages: {
        include: {
          part: { select: { partCode: true, nameUz: true, nameRu: true, unit: true } },
        },
      },
      invoice: { select: { id: true, invoiceNumber: true, status: true, totalAmount: true } },
    },
  });
}

export async function createOrder(
  prisma: PrismaClient,
  input: z.infer<typeof createOrderSchema>,
  userId: string
) {
  const orderNumber = await generateOrderNumber(prisma);

  return prisma.serviceOrder.create({
    data: {
      orderNumber,
      customerId: input.customerId,
      applianceId: input.applianceId,
      problem: input.problem,
      source: input.source,
      priority: input.priority,
      status: "INTAKE",
      events: {
        create: {
          toStatus: "INTAKE",
          note: "Order created",
          performedBy: userId,
        },
      },
    },
    include: {
      customer: { select: { id: true, name: true, phone: true } },
    },
  });
}

export async function transitionOrder(
  prisma: PrismaClient,
  input: z.infer<typeof transitionOrderSchema>,
  userId: string
) {
  return prisma.$transaction(async (tx) => {
    const order = await tx.serviceOrder.findUniqueOrThrow({
      where: { id: input.orderId },
      select: { id: true, status: true, version: true, invoice: { select: { id: true } } },
    });

    const allowed = VALID_TRANSITIONS[order.status] ?? [];
    if (!allowed.includes(input.toStatus)) {
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: `Cannot transition from ${order.status} to ${input.toStatus}`,
      });
    }

    // Closing an order requires an invoice to exist
    if (input.toStatus === "CLOSED" && !order.invoice) {
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: "Cannot close order without an invoice",
      });
    }

    const updated = await tx.serviceOrder.update({
      where: { id: input.orderId, version: order.version },
      data: {
        status: input.toStatus,
        version: { increment: 1 },
      },
    });

    // Optimistic lock: if no row was matched the version changed concurrently
    if (!updated) {
      throw new TRPCError({ code: "CONFLICT", message: "Order was modified concurrently" });
    }

    await tx.orderEvent.create({
      data: {
        orderId: input.orderId,
        fromStatus: order.status,
        toStatus: input.toStatus,
        note: input.note,
        performedBy: userId,
      },
    });

    return updated;
  });
}

export async function assignMaster(
  prisma: PrismaClient,
  orderId: string,
  masterId: string,
  userId: string
) {
  return prisma.$transaction(async (tx) => {
    const order = await tx.serviceOrder.findUniqueOrThrow({
      where: { id: orderId },
      select: { id: true, status: true, version: true },
    });

    if (order.status !== "INTAKE") {
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: "Can only assign master to orders in INTAKE status",
      });
    }

    const updated = await tx.serviceOrder.update({
      where: { id: orderId, version: order.version },
      data: {
        masterId,
        status: "ASSIGNED",
        version: { increment: 1 },
      },
    });

    await tx.orderEvent.create({
      data: {
        orderId,
        fromStatus: "INTAKE",
        toStatus: "ASSIGNED",
        note: `Assigned to master ${masterId}`,
        performedBy: userId,
      },
    });

    return updated;
  });
}

export async function logPartUsage(
  prisma: PrismaClient,
  input: z.infer<typeof logPartUsageSchema>,
  userId: string
) {
  // Fetch current unit cost before issuing so we record it on the usage line
  const stockItem = await prisma.stockItem.findUnique({
    where: { partId: input.partId },
    select: { unitCost: true },
  });

  // issueStock handles the atomic decrement and throws if insufficient
  await issueStock(
    prisma,
    { partId: input.partId, quantity: input.quantity, orderId: input.orderId },
    userId
  );

  return prisma.orderPartUsage.create({
    data: {
      orderId: input.orderId,
      partId: input.partId,
      quantity: input.quantity,
      unitCost: stockItem?.unitCost ?? 0,
      issuedBy: userId,
    },
  });
}
