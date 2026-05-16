import { prisma } from "@/lib/db";
import type { PrismaClient } from "@prisma/client";

export type Context = {
  prisma: PrismaClient;
  req: Request;
  // Populated by Plan 03 (auth) — null in Phase 1 wave 1
  session: null;
  user: null;
};

export async function createTRPCContext(opts: {
  req: Request;
}): Promise<Context> {
  return {
    prisma,
    req: opts.req,
    session: null,
    user: null,
  };
}
