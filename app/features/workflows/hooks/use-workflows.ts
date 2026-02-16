import { useTRPC } from "@/trpc/client";
import {
  QueryClient,
  useMutation,
  useQueryClient,
  useSuspenseQuery,
} from "@tanstack/react-query";
import { useRouter } from "next/navigation";
// fetch all workflow hook
export const useSuspenseWorkflows = () => {
  const trpc = useTRPC();
  return useSuspenseQuery(trpc.workFlows.getMany.queryOptions());
};

// hook to create new workflow
export const useCreateWorkflows = () => {
  const trpc = useTRPC();
  const router = useRouter();
  const queryClient = useQueryClient();
  return useMutation(
    trpc.workFlows.create.mutationOptions({
      onSuccess: (data) => {
        console.log("wk flow crated");
        router.push(`/workflows/${data.id}`);
        queryClient.invalidateQueries(trpc.workFlows.getMany.queryOptions());
      },
      onError: () => {
        console.log("wrror while creating new worklfow");
      },
    }),
  );
};

export const useSuspenseWorkflowone = (id: string) => {
  const trpc = useTRPC();
  return useSuspenseQuery(trpc.workFlows.getone.queryOptions({ id }));
};
export const useUpdateNameWorkflows = () => {
  const trpc = useTRPC();

  const queryClient = useQueryClient();
  return useMutation(
    trpc.workFlows.updateName.mutationOptions({
      onSuccess: (data) => {
        console.log("wk flow crated");

        queryClient.invalidateQueries(trpc.workFlows.getMany.queryOptions());
        queryClient.invalidateQueries(
          trpc.workFlows.getone.queryOptions({ id: data.id }),
        );
      },
      onError: () => {
        console.log("wrror while changing the name");
      },
    }),
  );
};
