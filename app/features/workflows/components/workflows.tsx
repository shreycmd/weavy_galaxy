"use client";
import { boolean } from "zod";
import {
  useCreateWorkflows,
  useSuspenseWorkflows,
} from "../hooks/use-workflows";
import { Workflow } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import {
  EntityContainer,
  Entityheader,
  ErrorView,
  LoadingView,
  ProjectItem,
} from "@/app/_components/entity-components";
import { usePerformSignin } from "../hooks/use-Login-check";
import { useUser } from "@clerk/nextjs";
import type { WorkFlowInfo } from "@/app/generated/prisma/client";
export const WorkFlowList = () => {
  const workflows = useSuspenseWorkflows();
  return (
    <div className="flex-1 flex  items-center justify-center">
      {workflows.data.map((wk) => (
        <div
          key={wk.id}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2"
        >
          <WorkflowItem data={wk} />
        </div>
      ))}
    </div>
  );
};
export const WorkflowsHeader = ({ disabled }: { disabled?: boolean }) => {
  const { user } = useUser();
  const title = `${user?.firstName} Workspace`;
  const createWorkflow = useCreateWorkflows();
  // const {handleError,modal}=usePerformSignin()
  const handleCreate = () => {
    createWorkflow.mutate(undefined, {
      onError: (error) => {
        // handleError(error)
        console.error(error);
      },
    });
  };
  return (
    <>
      {/* {modal} */}
      <Entityheader
        title={title ?? "Please Login to Start"}
        description={user ? "Create and mange your Project" : " "}
        onNew={handleCreate}
        newButtonLabel="New Workflow"
        disabled={disabled}
        iscreating={createWorkflow.isPending}
      />
    </>
  );
};
export const WorkFlowsContainer = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  return (
    <EntityContainer
      header={<WorkflowsHeader />}
      search={<></>}
      pagination={<></>}
    >
      {children}
    </EntityContainer>
  );
};
export const WorkFlowLoading = () => {
  return <LoadingView />;
};
export const WorkFlowError = () => {
  return <ErrorView />;
};
export const WorkflowItem = ({ data }: { data: WorkFlowInfo }) => {
  return (
    <ProjectItem
      href={`/workflows/${data.id}`}
      name={data.name}
      subtitle={`Last edited ${formatDistanceToNow(new Date(data.createdAt), {
        addSuffix: true,
      })}`}
      image={
        <div className=" flex items-center justify-center">
          <Workflow className="size-15 text-black" />
        </div>
      }
    />
  );
};
