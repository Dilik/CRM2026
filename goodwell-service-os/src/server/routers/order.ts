import { z } from "zod";
import { createTRPCRouter, protectedProcedure, receptionistProcedure } from "@/lib/trpc/init";
import {
  createOrderSchema,
  transitionOrderSchema,
  assignMasterSchema,
  logPartUsageSchema,
  listOrdersFilterSchema,
  listOrders,
  getOrder,
  createOrder,
  transitionOrder,
  assignMaster,
  logPartUsage,
} from "@/server/services/order";

export const orderRouter = createTRPCRouter({
  list: protectedProcedure
    .input(listOrdersFilterSchema.optional())
    .query(({ ctx, input }) => {
      // Masters only see their own orders
      const filters =
        ctx.user.role === "MASTER"
          ? { ...input, masterId: ctx.user.id }
          : input;
      return listOrders(ctx.prisma, filters);
    }),

  get: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(({ ctx, input }) => getOrder(ctx.prisma, input.id)),

  create: receptionistProcedure
    .input(createOrderSchema)
    .mutation(({ ctx, input }) => createOrder(ctx.prisma, input, ctx.user.id)),

  transition: protectedProcedure
    .input(transitionOrderSchema)
    .mutation(({ ctx, input }) => transitionOrder(ctx.prisma, input, ctx.user.id)),

  assignMaster: receptionistProcedure
    .input(assignMasterSchema)
    .mutation(({ ctx, input }) =>
      assignMaster(ctx.prisma, input.orderId, input.masterId, ctx.user.id)
    ),

  logPart: protectedProcedure
    .input(logPartUsageSchema)
    .mutation(({ ctx, input }) => logPartUsage(ctx.prisma, input, ctx.user.id)),
});
