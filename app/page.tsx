import {
  EntityContainer,
  ErrorView,
} from "@/app/_components/entity-components";
import {
  WorkFlowError,
  WorkFlowList,
  WorkFlowLoading,
  WorkFlowsContainer,
} from "@/app/features/workflows/components/workflows";
import { prefethWorkflows } from "@/app/features/workflows/server/prfetch";
import { HydrateClient } from "@/trpc/server";
import { error } from "console";
import { redirect } from "next/navigation";
import React, { Suspense } from "react";
import { ErrorBoundary } from "react-error-boundary";
const Workflows = () => {
  prefethWorkflows();
  return redirect("/workflows");
  // <WorkFlowsContainer>
  //   <HydrateClient>
  //     <ErrorBoundary fallback={<WorkFlowError />}>
  //       <Suspense fallback={<WorkFlowLoading />}>
  //         <WorkFlowList />
  //       </Suspense>
  //     </ErrorBoundary>
  //   </HydrateClient>
  //   {/* <WorkFlowList /> */}
  // </WorkFlowsContainer>
};

export default Workflows;
