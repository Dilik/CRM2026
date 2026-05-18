import { z } from "zod";
import { createTRPCRouter, receptionistProcedure } from "@/lib/trpc/init";
import {
  createInvoiceSchema,
  recordPaymentSchema,
  listInvoicesFilterSchema,
  listInvoices,
  getInvoice,
  createInvoice,
  recordPayment,
  getOutstandingBalance,
} from "@/server/services/finance";

export const financeRouter = createTRPCRouter({
  list: receptionistProcedure
    .input(listInvoicesFilterSchema.optional())
    .query(({ ctx, input }) => listInvoices(ctx.prisma, input)),

  get: receptionistProcedure
    .input(z.object({ id: z.string() }))
    .query(({ ctx, input }) => getInvoice(ctx.prisma, input.id)),

  create: receptionistProcedure
    .input(createInvoiceSchema)
    .mutation(({ ctx, input }) => createInvoice(ctx.prisma, input, ctx.user.id)),

  recordPayment: receptionistProcedure
    .input(recordPaymentSchema)
    .mutation(({ ctx, input }) => recordPayment(ctx.prisma, input, ctx.user.id)),

  outstanding: receptionistProcedure
    .input(z.object({ customerId: z.string() }))
    .query(({ ctx, input }) => getOutstandingBalance(ctx.prisma, input.customerId)),
});
