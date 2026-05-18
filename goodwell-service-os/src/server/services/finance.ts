import { z } from "zod";
import { TRPCError } from "@/lib/trpc/init";
import { Prisma, type PrismaClient } from "@prisma/client";

const Decimal = Prisma.Decimal;

export const createInvoiceSchema = z.object({
  orderId: z.string(),
  laborCost: z.number().min(0),
  locale: z.enum(["uz_Latn", "uz_Cyrl", "ru", "en"]).default("uz_Latn"),
  notes: z.string().max(2000).optional(),
});

export const recordPaymentSchema = z.object({
  invoiceId: z.string(),
  amount: z.number().min(0.01),
  method: z.enum(["CASH", "CARD", "BANK_TRANSFER"]),
  reference: z.string().max(200).optional(),
});

export const listInvoicesFilterSchema = z.object({
  status: z.enum(["DRAFT", "ISSUED", "PARTIALLY_PAID", "PAID", "VOIDED"]).optional(),
  search: z.string().optional(),
});

async function generateInvoiceNumber(prisma: PrismaClient): Promise<string> {
  const year = new Date().getFullYear();
  const prefix = `INV-${year}-`;
  const last = await prisma.invoice.findFirst({
    where: { invoiceNumber: { startsWith: prefix } },
    orderBy: { invoiceNumber: "desc" },
    select: { invoiceNumber: true },
  });
  const seq = last ? parseInt(last.invoiceNumber.slice(prefix.length), 10) + 1 : 1;
  return `${prefix}${String(seq).padStart(5, "0")}`;
}

export async function listInvoices(
  prisma: PrismaClient,
  filters?: z.infer<typeof listInvoicesFilterSchema>
) {
  return prisma.invoice.findMany({
    where: {
      ...(filters?.status ? { status: filters.status } : {}),
      ...(filters?.search
        ? {
            OR: [
              { invoiceNumber: { contains: filters.search, mode: "insensitive" } },
              { order: { orderNumber: { contains: filters.search, mode: "insensitive" } } },
              { order: { customer: { name: { contains: filters.search, mode: "insensitive" } } } },
            ],
          }
        : {}),
    },
    select: {
      id: true,
      invoiceNumber: true,
      status: true,
      laborCost: true,
      totalAmount: true,
      paidAmount: true,
      createdAt: true,
      order: {
        select: {
          id: true,
          orderNumber: true,
          customer: { select: { id: true, name: true, phone: true } },
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });
}

export async function getInvoice(prisma: PrismaClient, id: string) {
  return prisma.invoice.findUniqueOrThrow({
    where: { id },
    include: {
      lines: true,
      payments: { orderBy: { recordedAt: "asc" } },
      order: {
        select: {
          id: true,
          orderNumber: true,
          status: true,
          problem: true,
          customer: { select: { id: true, name: true, phone: true } },
        },
      },
    },
  });
}

export async function createInvoice(
  prisma: PrismaClient,
  input: z.infer<typeof createInvoiceSchema>,
  userId: string
) {
  const existing = await prisma.invoice.findUnique({ where: { orderId: input.orderId } });
  if (existing) {
    throw new TRPCError({ code: "CONFLICT", message: "Invoice already exists for this order" });
  }

  const partUsages = await prisma.orderPartUsage.findMany({
    where: { orderId: input.orderId },
    include: { part: { select: { nameUz: true, nameRu: true, unit: true } } },
  });

  const invoiceNumber = await generateInvoiceNumber(prisma);

  const laborDecimal = new Decimal(input.laborCost);
  const partTotal = partUsages.reduce(
    (acc, u) => acc.add(new Decimal(u.quantity).mul(u.unitCost)),
    new Decimal(0)
  );
  const totalAmount = laborDecimal.add(partTotal);

  const lines: Array<{
    description: string;
    quantity: number;
    unitPrice: Prisma.Decimal;
    total: Prisma.Decimal;
  }> = [
    {
      description: "Labor / Ish haqi",
      quantity: 1,
      unitPrice: laborDecimal,
      total: laborDecimal,
    },
    ...partUsages.map((u) => ({
      description: `${u.part.nameUz} (${u.part.unit})`,
      quantity: u.quantity,
      unitPrice: u.unitCost,
      total: new Decimal(u.quantity).mul(u.unitCost),
    })),
  ];

  return prisma.invoice.create({
    data: {
      invoiceNumber,
      orderId: input.orderId,
      laborCost: laborDecimal,
      totalAmount,
      locale: input.locale,
      notes: input.notes,
      issuedBy: userId,
      status: "ISSUED",
      issuedAt: new Date(),
      lines: { create: lines },
    },
    include: { lines: true },
  });
}

export async function recordPayment(
  prisma: PrismaClient,
  input: z.infer<typeof recordPaymentSchema>,
  userId: string
) {
  return prisma.$transaction(async (tx) => {
    const invoice = await tx.invoice.findUniqueOrThrow({
      where: { id: input.invoiceId },
      select: { id: true, totalAmount: true, paidAmount: true, status: true },
    });

    if (invoice.status === "VOIDED") {
      throw new TRPCError({ code: "BAD_REQUEST", message: "Cannot record payment on a voided invoice" });
    }
    if (invoice.status === "PAID") {
      throw new TRPCError({ code: "BAD_REQUEST", message: "Invoice is already fully paid" });
    }

    const newPaid = new Decimal(invoice.paidAmount).add(new Decimal(input.amount));
    const isPaid = newPaid.gte(invoice.totalAmount);

    await tx.payment.create({
      data: {
        invoiceId: input.invoiceId,
        amount: new Decimal(input.amount),
        method: input.method,
        reference: input.reference,
        recordedBy: userId,
      },
    });

    return tx.invoice.update({
      where: { id: input.invoiceId },
      data: {
        paidAmount: newPaid,
        status: isPaid ? "PAID" : "PARTIALLY_PAID",
      },
    });
  });
}

export async function getOutstandingBalance(prisma: PrismaClient, customerId: string) {
  const invoices = await prisma.invoice.findMany({
    where: {
      order: { customerId },
      status: { in: ["ISSUED", "PARTIALLY_PAID"] },
    },
    select: { totalAmount: true, paidAmount: true },
  });

  const balance = invoices.reduce(
    (acc, inv) => acc.add(new Decimal(inv.totalAmount).sub(new Decimal(inv.paidAmount))),
    new Decimal(0)
  );

  return { customerId, outstandingBalance: balance };
}
