import "server-only";
import { appRouter } from "@/server/routers/_app";
import { createTRPCContext } from "./context";

export async function createServerCaller(req: Request) {
  const ctx = await createTRPCContext({ req });
  return appRouter.createCaller(ctx);
}
