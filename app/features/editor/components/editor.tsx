"use client";

import { ErrorView, LoadingView } from "@/app/_components/entity-components";
import {
  useSuspenseWorkflowone,
  useUpdateNameWorkflows,
} from "../../workflows/hooks/use-workflows";
import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { useCallback } from "react";
import {
  ReactFlow,
  applyNodeChanges,
  applyEdgeChanges,
  addEdge,
  Node,
  NodeChange,
  EdgeChange,
  Edge,
  Connection,
  Background,
  Controls,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";

export const Editor = ({ workflowId }: { workflowId: string }) => {
  const { data: workflow } = useSuspenseWorkflowone(workflowId);
  const [nodes, setNodes] = useState<Node[]>(workflow.nodes);
  const [edges, setEdges] = useState<Edge[]>(workflow.edges);

  const onNodesChange = useCallback(
    (changes: NodeChange[]) =>
      setNodes((nodesSnapshot) => applyNodeChanges(changes, nodesSnapshot)),
    [],
  );
  const onEdgesChange = useCallback(
    (changes: EdgeChange[]) =>
      setEdges((edgesSnapshot) => applyEdgeChanges(changes, edgesSnapshot)),
    [],
  );
  const onConnect = useCallback(
    (params: Connection) =>
      setEdges((edgesSnapshot) => addEdge(params, edgesSnapshot)),
    [],
  );

  return (
    <div className="h-screen w-full ">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        fitView
      >
        <EditorName workflowsId={workflowId} />
        <Background />
        <Controls />
      </ReactFlow>
    </div>
  );
};
export const EditorLoading = () => {
  return <LoadingView message="Loading editor.." />;
};

export const EditorError = () => {
  return <ErrorView message="Error While loading editor.." />;
};
export const EditorName = ({ workflowsId }: { workflowsId: string }) => {
  const namec = useSuspenseWorkflowone(workflowsId);
  const UpdateName = useUpdateNameWorkflows();
  const [name, setName] = useState(namec.data.name);

  useEffect(() => {
    const time = setTimeout(async () => {
      if (!name) return;
      await UpdateName.mutateAsync({
        id: workflowsId,
        name,
      });
    }, 500);
    return () => clearTimeout(time);
  }, [name, workflowsId]);
  return (
    <div className="w-fit ">
      <Input
        type="text"
        value={name}
        className="bg-[#212126] focus-visible:ring-0 focus-visible:ring-offset-0"
        onChange={(e) => setName(e.target.value)}
      />
    </div>
  );
};
