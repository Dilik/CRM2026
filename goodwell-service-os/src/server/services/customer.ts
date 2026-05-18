import { z } from "zod";
import { TRPCError } from "@/lib/trpc/init";
import type { PrismaClient } from "@prisma/client";

export const createCustomerSchema = z.object({
  phone: z.string().min(7).max(20),
  name: z.string().min(1).max(150),
  address: z.string().max(300).optional(),
  notes: z.string().max(1000).optional(),
});

export const updateCustomerSchema = z.object({
  id: z.string(),
  name: z.string().min(1).max(150).optional(),
  address: z.string().max(300).optional(),
  notes: z.string().max(1000).optional(),
});

export async function listCustomers(prisma: PrismaClient, query?: string) {
  return prisma.customer.findMany({
    where: query
      ? {
          OR: [
            { name: { contains: query, mode: "insensitive" } },
            { phone: { contains: query } },
          ],
        }
      : undefined,
    select: {
      id: true,
      phone: true,
      name: true,
      address: true,
      createdAt: true,
      _count: { select: { orders: true, appliances: true } },
    },
    orderBy: { createdAt: "desc" },
    take: 50,
  });
}

export async function getCustomer(prisma: PrismaClient, id: string) {
  return prisma.customer.findUniqueOrThrow({
    where: { id },
    include: {
      appliances: {
        include: {
          model: { select: { brand: true, modelCode: true, nameUz: true, nameRu: true } },
        },
      },
      orders: {
        select: {
          id: true,
          orderNumber: true,
          status: true,
          priority: true,
          createdAt: true,
        },
        orderBy: { createdAt: "desc" },
        take: 20,
      },
    },
  });
}

export async function createCustomer(
  prisma: PrismaClient,
  input: z.infer<typeof createCustomerSchema>
) {
  const normalizedPhone = input.phone.replace(/\s/g, "");
  const existing = await prisma.customer.findUnique({ where: { phone: normalizedPhone } });
  if (existing) throw new TRPCError({ code: "CONFLICT", message: "PHONE_TAKEN" });

  return prisma.customer.create({
    data: { ...input, phone: normalizedPhone },
  });
}

export async function updateCustomer(
  prisma: PrismaClient,
  id: string,
  input: Omit<z.infer<typeof updateCustomerSchema>, "id">
) {
  return prisma.customer.update({
    where: { id },
    data: input,
  });
}
