import { z } from "zod";
import type { PrismaClient } from "@prisma/client";

export const createModelSchema = z.object({
  brand: z.string().min(1).max(100),
  modelCode: z.string().min(1).max(100),
  nameUz: z.string().min(1).max(200),
  nameRu: z.string().min(1).max(200),
  category: z.enum([
    "REFRIGERATOR",
    "WASHING_MACHINE",
    "DISHWASHER",
    "OVEN",
    "MICROWAVE",
    "COOKTOP",
    "HOOD",
    "DRYER",
    "OTHER",
  ]),
});

export const createVersionSchema = z.object({
  modelId: z.string(),
  year: z.number().int().min(1990).max(2100),
  piNumber: z.string().min(1).max(100),
  unitVolume: z.number().int().min(0).default(0),
});

export const upsertBomPartSchema = z.object({
  versionId: z.string(),
  partCode: z.string().min(1).max(100),
  nameUz: z.string().min(1).max(200),
  nameRu: z.string().min(1).max(200),
  quantity: z.number().int().min(1),
  unit: z.string().min(1).max(50).default("pcs"),
});

export async function listModels(prisma: PrismaClient) {
  const models = await prisma.applianceModel.findMany({
    where: { active: true },
    include: {
      _count: { select: { versions: true } },
    },
    orderBy: [{ brand: "asc" }, { modelCode: "asc" }],
  });
  return models.map((m) => ({
    ...m,
    versionCount: m._count.versions,
  }));
}

export async function getModel(prisma: PrismaClient, id: string) {
  const model = await prisma.applianceModel.findUniqueOrThrow({
    where: { id },
    include: {
      versions: {
        where: { active: true },
        include: {
          _count: { select: { bomParts: true } },
        },
        orderBy: { year: "desc" },
      },
    },
  });
  return {
    ...model,
    versions: model.versions.map((v) => ({
      ...v,
      bomPartsCount: v._count.bomParts,
    })),
  };
}

export async function createModel(
  prisma: PrismaClient,
  input: z.infer<typeof createModelSchema>
) {
  return prisma.applianceModel.create({ data: input });
}

export async function listVersions(prisma: PrismaClient, modelId: string) {
  return prisma.applianceModelVersion.findMany({
    where: { modelId, active: true },
    orderBy: { year: "desc" },
  });
}

export async function createVersion(
  prisma: PrismaClient,
  input: z.infer<typeof createVersionSchema>
) {
  return prisma.applianceModelVersion.create({ data: input });
}

export async function listBomParts(prisma: PrismaClient, versionId: string) {
  return prisma.bomPart.findMany({
    where: { versionId },
    orderBy: { partCode: "asc" },
  });
}

export async function upsertBomPart(
  prisma: PrismaClient,
  input: z.infer<typeof upsertBomPartSchema>
) {
  const { versionId, partCode, ...rest } = input;
  return prisma.bomPart.upsert({
    where: { versionId_partCode: { versionId, partCode } },
    create: { versionId, partCode, ...rest },
    update: { ...rest },
  });
}
