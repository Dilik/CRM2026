import { z } from "zod";
import { publicProcedure, router } from "@/lib/trpc/init";

export const healthRouter = router({
  ping: publicProcedure
    .input(z.object({ echo: z.string().optional() }).optional())
    .query(({ input }) => {
      return {
        ok: true,
        now: new Date(),
        echo: input?.echo ?? null,
      };
    }),
});
