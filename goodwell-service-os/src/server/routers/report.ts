import { createTRPCRouter, protectedProcedure, executiveProcedure } from "@/lib/trpc/init";
import {
  masterReportInputSchema,
  partsReportInputSchema,
  revenueByPeriodInputSchema,
  getDashboardKpis,
  getMasterReport,
  getPartsReport,
  getRevenueByPeriod,
} from "@/server/services/report";

export const reportRouter = createTRPCRouter({
  dashboard: protectedProcedure.query(({ ctx }) => getDashboardKpis(ctx.prisma)),

  master: executiveProcedure
    .input(masterReportInputSchema)
    .query(({ ctx, input }) => getMasterReport(ctx.prisma, input.masterId, input.days)),

  parts: executiveProcedure
    .input(partsReportInputSchema)
    .query(({ ctx, input }) => getPartsReport(ctx.prisma, input.days)),

  revenue: executiveProcedure
    .input(revenueByPeriodInputSchema)
    .query(({ ctx, input }) => getRevenueByPeriod(ctx.prisma, input.from, input.to)),
});
