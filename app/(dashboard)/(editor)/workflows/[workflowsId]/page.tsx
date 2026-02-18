import { LoadingView } from "@/app/_components/entity-components";
import {
  Editor,
  EditorError,
  EditorLoading,
  EditorName,
} from "@/app/features/editor/components/editor";
import { WorkFlowError } from "@/app/features/workflows/components/workflows";
import { prefethWorkflowone } from "@/app/features/workflows/server/prfetch";
import { HydrateClient } from "@/trpc/server";
import { ReactFlowProvider } from "@xyflow/react";
import React, { Suspense } from "react";
import { ErrorBoundary } from "react-error-boundary";
interface Pageprops {
  params: Promise<{ workflowsId: string }>;
}
const WorkflowsId = async ({ params }: Pageprops) => {
  const { workflowsId } = await params;
  prefethWorkflowone(workflowsId);
  return (
    <HydrateClient>
      <ErrorBoundary fallback={<EditorError />}>
        <Suspense fallback={<EditorLoading />}>
          <ReactFlowProvider>
            <Editor workflowId={workflowsId} />
          </ReactFlowProvider>
        </Suspense>
      </ErrorBoundary>
    </HydrateClient>
  );
};

export default WorkflowsId;
