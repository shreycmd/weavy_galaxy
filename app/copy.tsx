"use client";
import { Button } from "@/components/ui/button";
import { useTRPC } from "@/trpc/client";
import { getQueryClient, trpc } from "@/trpc/server";
import {
  dehydrate,
  HydrationBoundary,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { redirect } from "next/navigation";

export default function Home() {
  // const trpc = useTRPC();
  // const queryClient = useQueryClient();
  // const { data } = useQuery(trpc.getWorkFlows.queryOptions());
  // const create = useMutation(
  //   trpc.createWorkFlow.mutationOptions({
  //     onSuccess: () => {
  //       queryClient.invalidateQueries(trpc.getWorkFlows.queryOptions());
  //     },
  //   }),
  // );
  // const aiTest = useMutation(trpc.testAi.mutationOptions());
  // const users = await prisma.user.findMany();
  // console.log(users);
  // const queryClient=getQueryClient()
  // void queryClient.prefetchQuery(trpc.)
  return (
    // <HydrationBoundary state={dehydrate(queryClient)}>

    // </HydrationBoundary>
    redirect("/workflows")
  );
}
