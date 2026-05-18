import { createTRPCRouter, adminProcedure } from "@/lib/trpc/init";
import { createStaffSchema, updateStaffSchema, listStaff, createStaff, updateStaff } from "@/server/services/staff";
import { TRPCError } from "@trpc/server";

export const staffRouter = createTRPCRouter({
  list: adminProcedure.query(({ ctx }) => listStaff(ctx.prisma)),

  create: adminProcedure.input(createStaffSchema).mutation(async ({ ctx, input }) => {
    try {
      return await createStaff(ctx.prisma, input);
    } catch (err) {
      if (err instanceof Error && err.message === "PHONE_TAKEN") {
        throw new TRPCError({ code: "CONFLICT", message: "Phone number already registered" });
      }
      throw err;
    }
  }),

  update: adminProcedure.input(updateStaffSchema).mutation(({ ctx, input }) =>
    updateStaff(ctx.prisma, input)
  ),
});
