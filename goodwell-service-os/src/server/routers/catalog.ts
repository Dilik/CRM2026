import { z } from "zod";
import { createTRPCRouter, protectedProcedure, adminProcedure } from "@/lib/trpc/init";
import {
  createModelSchema,
  createVersionSchema,
  upsertBomPartSchema,
  listModels,
  getModel,
  createModel,
  listVersions,
  createVersion,
  listBomParts,
  upsertBomPart,
} from "@/server/services/catalog";

export const catalogRouter = createTRPCRouter({
  model: createTRPCRouter({
    list: protectedProcedure.query(({ ctx }) => listModels(ctx.prisma)),

    get: protectedProcedure
      .input(z.object({ id: z.string() }))
      .query(({ ctx, input }) => getModel(ctx.prisma, input.id)),

    create: adminProcedure
      .input(createModelSchema)
      .mutation(({ ctx, input }) => createModel(ctx.prisma, input)),
  }),

  version: createTRPCRouter({
    list: protectedProcedure
      .input(z.object({ modelId: z.string() }))
      .query(({ ctx, input }) => listVersions(ctx.prisma, input.modelId)),

    create: adminProcedure
      .input(createVersionSchema)
      .mutation(({ ctx, input }) => createVersion(ctx.prisma, input)),
  }),

  bomPart: createTRPCRouter({
    list: protectedProcedure
      .input(z.object({ versionId: z.string() }))
      .query(({ ctx, input }) => listBomParts(ctx.prisma, input.versionId)),

    upsert: adminProcedure
      .input(upsertBomPartSchema)
      .mutation(({ ctx, input }) => upsertBomPart(ctx.prisma, input)),
  }),
});
