import { z } from "zod";

import { createTRPCRouter, protectedProcedure } from "../init";
import { db } from "@/lib/db";
import { tasks } from "@trigger.dev/sdk";
import { helloWorldTask } from "@/trigger/example";

import { execute } from "@/trigger/ai";
export const appRouter = createTRPCRouter({
  getWorkFlows: protectedProcedure.query(({ ctx }) => {
    return db.workFlowInfo.findMany();
  }),
  testAi: protectedProcedure.mutation(async () => {
    await tasks.trigger<typeof execute>("execute-ai", "555");
    return { success: true, message: "jobqueued" };
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
