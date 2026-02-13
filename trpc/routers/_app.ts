import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "../init";
import { db } from "@/lib/db";
import { tasks } from "@trigger.dev/sdk";
import { helloWorldTask } from "@/trigger/example";
export const appRouter = createTRPCRouter({
  getWorkFlows: protectedProcedure.query(({ ctx }) => {
    return db.workFlowInfo.findMany();
  }),
  createWorkFlow: protectedProcedure.mutation(async () => {
    await tasks.trigger<typeof helloWorldTask>("hello-world", "spandey");
    return db.workFlowInfo.create({
      data: { name: "demo data" },
    });
  }),
});
// export type definition of API
export type AppRouter = typeof appRouter;
