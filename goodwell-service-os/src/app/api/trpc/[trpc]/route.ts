import { fetchRequestHandler } from "@trpc/server/adapters/fetch";
import { appRouter } from "@/server/routers/_app";
import { createTRPCContext } from "@/lib/trpc/context";

const handler = (req: Request) =>
  fetchRequestHandler({
    endpoint: "/api/trpc",
    req,
    router: appRouter,
    createContext: () => createTRPCContext({ req }),
    onError({ error, path }) {
      if (process.env.NODE_ENV === "development") {
        console.error(`tRPC error on ${path}:`, error);
      }
    },
  });

export { handler as GET, handler as POST };
