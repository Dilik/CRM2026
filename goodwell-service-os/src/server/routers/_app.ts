import { router } from "@/lib/trpc/init";
import { healthRouter } from "./health";
import { staffRouter } from "./staff";
import { catalogRouter } from "./catalog";
import { inventoryRouter } from "./inventory";
import { customerRouter } from "./customer";
import { orderRouter } from "./order";
import { financeRouter } from "./finance";
import { reportRouter } from "./report";

export const appRouter = router({
  health: healthRouter,
  staff: staffRouter,
  catalog: catalogRouter,
  inventory: inventoryRouter,
  customer: customerRouter,
  order: orderRouter,
  finance: financeRouter,
  report: reportRouter,
});

export type AppRouter = typeof appRouter;
