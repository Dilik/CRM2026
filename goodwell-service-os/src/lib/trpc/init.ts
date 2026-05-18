import { initTRPC, TRPCError } from "@trpc/server";
import superjson from "superjson";
import { ZodError } from "zod";
import type { Context } from "./context";
import type { UserRole } from "@prisma/client";

const t = initTRPC.context<Context>().create({
  transformer: superjson,
  errorFormatter({ shape, error }) {
    return {
      ...shape,
      data: {
        ...shape.data,
        zodError:
          error.cause instanceof ZodError ? error.cause.flatten() : null,
      },
    };
  },
});

const enforceAuth = t.middleware(({ ctx, next }) => {
  if (!ctx.user || !ctx.session) {
    throw new TRPCError({ code: "UNAUTHORIZED" });
  }
  if (!ctx.user.active) {
    throw new TRPCError({ code: "FORBIDDEN", message: "Account deactivated" });
  }
  return next({ ctx: { ...ctx, user: ctx.user, session: ctx.session } });
});

const enforceRoles = (roles: UserRole[]) =>
  t.middleware(({ ctx, next }) => {
    if (!ctx.user || !ctx.session) throw new TRPCError({ code: "UNAUTHORIZED" });
    if (!ctx.user.active) throw new TRPCError({ code: "FORBIDDEN", message: "Account deactivated" });
    if (!roles.includes(ctx.user.role)) throw new TRPCError({ code: "FORBIDDEN" });
    return next({ ctx: { ...ctx, user: ctx.user, session: ctx.session } });
  });

export const router = t.router;
export const createTRPCRouter = t.router;
export const publicProcedure = t.procedure;
export const protectedProcedure = t.procedure.use(enforceAuth);
export const adminProcedure = t.procedure.use(enforceRoles(["ADMIN"]));
export const receptionistProcedure = t.procedure.use(enforceRoles(["ADMIN", "RECEPTIONIST"]));
export const warehouseProcedure = t.procedure.use(enforceRoles(["ADMIN", "WAREHOUSE"]));
export const executiveProcedure = t.procedure.use(enforceRoles(["ADMIN", "EXECUTIVE"]));
export const middleware = t.middleware;
export { TRPCError };
