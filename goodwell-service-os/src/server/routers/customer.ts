import { z } from "zod";
import { createTRPCRouter, receptionistProcedure } from "@/lib/trpc/init";
import {
  createCustomerSchema,
  updateCustomerSchema,
  listCustomers,
  getCustomer,
  createCustomer,
  updateCustomer,
} from "@/server/services/customer";

export const customerRouter = createTRPCRouter({
  list: receptionistProcedure
    .input(z.object({ query: z.string().optional() }))
    .query(({ ctx, input }) => listCustomers(ctx.prisma, input.query)),

  get: receptionistProcedure
    .input(z.object({ id: z.string() }))
    .query(({ ctx, input }) => getCustomer(ctx.prisma, input.id)),

  create: receptionistProcedure
    .input(createCustomerSchema)
    .mutation(({ ctx, input }) => createCustomer(ctx.prisma, input)),

  update: receptionistProcedure
    .input(updateCustomerSchema)
    .mutation(({ ctx, input }) => {
      const { id, ...rest } = input;
      return updateCustomer(ctx.prisma, id, rest);
    }),
});
