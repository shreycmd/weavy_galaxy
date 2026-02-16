import type { inferInput } from "@trpc/tanstack-react-query";
import { prefetch, trpc } from "@/trpc/server";
import { input } from "zod";
type Input = inferInput<typeof trpc.workFlows.getMany>;
//prefetch all work flows
export const prefethWorkflows = (params: Input) => {
  return prefetch(trpc.workFlows.getMany.queryOptions(params));
};

//single wkflow
export const prefethWorkflowone = (id: string) => {
  return prefetch(trpc.workFlows.getone.queryOptions({ id }));
};
