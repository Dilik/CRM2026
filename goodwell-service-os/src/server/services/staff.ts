import { z } from "zod";
import type { PrismaClient, UserRole } from "@prisma/client";

export const createStaffSchema = z.object({
  phone: z.string().min(9).max(20),
  name: z.string().min(1).max(100),
  role: z.enum(["ADMIN", "RECEPTIONIST", "MASTER", "WAREHOUSE", "EXECUTIVE"]),
});

export const updateStaffSchema = z.object({
  id: z.string(),
  name: z.string().min(1).max(100).optional(),
  role: z.enum(["ADMIN", "RECEPTIONIST", "MASTER", "WAREHOUSE", "EXECUTIVE"]).optional(),
  active: z.boolean().optional(),
});

export async function listStaff(prisma: PrismaClient) {
  return prisma.user.findMany({
    select: {
      id: true,
      phone: true,
      name: true,
      role: true,
      active: true,
      createdAt: true,
    },
    orderBy: { createdAt: "desc" },
  });
}

export async function createStaff(
  prisma: PrismaClient,
  input: z.infer<typeof createStaffSchema>
) {
  const normalizedPhone = input.phone.replace(/\D/g, "");
  const existing = await prisma.user.findUnique({ where: { phone: normalizedPhone } });
  if (existing) throw new Error("PHONE_TAKEN");

  return prisma.user.create({
    data: {
      phone: normalizedPhone,
      name: input.name,
      role: input.role as UserRole,
      active: true,
      phoneVerified: false,
    },
    select: { id: true, phone: true, name: true, role: true, active: true, createdAt: true },
  });
}

export async function updateStaff(
  prisma: PrismaClient,
  input: z.infer<typeof updateStaffSchema>
) {
  const { id, ...data } = input;
  return prisma.user.update({
    where: { id },
    data,
    select: { id: true, phone: true, name: true, role: true, active: true, createdAt: true },
  });
}
