import { createTRPCRouter } from "../init";

import { workflowrouter } from "@/app/features/workflows/server/routers";
export const appRouter = createTRPCRouter({
  workFlows: workflowrouter,
});
// export type definition of API
export type AppRouter = typeof appRouter;
