import { createTRPCRouter, protectedProcedure, warehouseProcedure } from "@/lib/trpc/init";
import {
  receiveStockSchema,
  issueStockSchema,
  adjustStockSchema,
  listStock,
  receiveStock,
  issueStock,
  adjustStock,
  getLowStock,
} from "@/server/services/inventory";

export const inventoryRouter = createTRPCRouter({
  stock: createTRPCRouter({
    list: warehouseProcedure.query(({ ctx }) => listStock(ctx.prisma)),

    lowStock: warehouseProcedure.query(({ ctx }) => getLowStock(ctx.prisma)),

    receive: warehouseProcedure
      .input(receiveStockSchema)
      .mutation(({ ctx, input }) => receiveStock(ctx.prisma, input, ctx.user.id)),

    issue: protectedProcedure
      .input(issueStockSchema)
      .mutation(({ ctx, input }) => issueStock(ctx.prisma, input, ctx.user.id)),

    adjust: warehouseProcedure
      .input(adjustStockSchema)
      .mutation(({ ctx, input }) => adjustStock(ctx.prisma, input, ctx.user.id)),
  }),
});
