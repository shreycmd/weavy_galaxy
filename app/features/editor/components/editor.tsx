"use client";

import { ErrorView, LoadingView } from "@/app/_components/entity-components";
import {
  useSuspenseWorkflowone,
  useUpdateNameWorkflows,
  useUpdateWorkflows,
} from "../../workflows/hooks/use-workflows";
import { useEffect, useRef, useState } from "react";
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
  useReactFlow,
  Position,
  Handle,
  getOutgoers,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { toast } from "sonner";
import { nodeTypes } from "../../Nodes/components/Nodes";

function wouldCreateCycle(
  source: string,
  target: string,
  nodes: Node[],
  edges: Edge[],
) {
  const targetNode = nodes.find((n) => n.id === target);
  if (!targetNode) return false;

  const visited = new Set<string>();
  const stack = [targetNode];

  while (stack.length) {
    const current = stack.pop();
    if (!current) continue;

    if (current.id === source) return true;

    if (!visited.has(current.id)) {
      visited.add(current.id);
      const outgoers = getOutgoers(current, nodes, edges);
      stack.push(...outgoers);
    }
  }

  return false;
}

export const Editor = ({ workflowId }: { workflowId: string }) => {
  const { screenToFlowPosition } = useReactFlow();
  const { data: workflow } = useSuspenseWorkflowone(workflowId);
  const [nodes, setNodes] = useState<Node[]>(workflow.nodes);
  const [edges, setEdges] = useState<Edge[]>(workflow.edges);
  const saveWorkflow = useUpdateWorkflows();
  const onDragOver = (event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = "move";
  };
  const saveTimeout = useRef<NodeJS.Timeout | null>(null);

  const scheduleSave = useCallback(
    (latestNodes: Node[], latestEdges: Edge[]) => {
      if (saveTimeout.current) {
        clearTimeout(saveTimeout.current);
      }

      saveTimeout.current = setTimeout(() => {
        saveWorkflow.mutate({
          id: workflowId,
          nodes: latestNodes,
          edges: latestEdges,
        });
      }, 5000);
    },
    [workflowId, saveWorkflow],
  );

  const handleNodeDataChange = useCallback(
    (id: string, patch: Record<string, unknown>) => {
      setNodes((prev) => {
        const updated = prev.map((node) =>
          node.id === id
            ? { ...node, data: { ...(node.data || {}), ...patch } }
            : node,
        );
        scheduleSave(updated, edges);
        return updated;
      });
    },
    [edges, scheduleSave],
  );

  const onDrop = (event: React.DragEvent) => {
    event.preventDefault();

    const type = event.dataTransfer.getData("application/reactflow");
    if (!type) return;

    const position = screenToFlowPosition({
      x: event.clientX,
      y: event.clientY,
    });

    const newNode = {
      id: new Date().toString(),
      type,
      position,
      data: {},
    };

    setNodes((nds) => {
      const updated = nds.concat(newNode);
      scheduleSave(updated, edges);
      return updated;
    });
  };

  const onNodesChange = useCallback(
    (changes: NodeChange[]) => {
      setNodes((nodesSnapshot) => {
        const updated = applyNodeChanges(changes, nodesSnapshot);

        const shouldSave = changes.some(
          (change) => change.type === "position" && change.dragging === false,
        );

        if (shouldSave) {
          scheduleSave(updated, edges); // pass fresh nodes and latest edges
        }

        return updated;
      });
    },
    [scheduleSave, setNodes, edges],
  );

  const onEdgesChange = useCallback(
    (changes: EdgeChange[]) =>
      setEdges((edgesSnapshot) => {
        const updated = applyEdgeChanges(changes, edgesSnapshot);
        scheduleSave(nodes, updated);
        return updated;
      }),
    [setEdges, scheduleSave, nodes],
  );
  const onConnect = useCallback(
    (params: Connection) => {
      setEdges((eds) => {
        const sourceNode = nodes.find((n) => n.id === params.source);

        let color = "#888";

        if (sourceNode?.type === "TextInputNode") {
          color = "#22c55e"; // green
        }

        if (sourceNode?.type === "ImageInputNode") {
          color = "#3b82f6"; // blue
        }

        if (sourceNode?.type === "LLMnode") {
          color = "#a855f7"; // purple
        }
        if (sourceNode?.type === "VideoInputNode") {
          color = "#99f63b"; // blue
        }

        const newEdge = {
          ...params,
          style: { stroke: color },
          animated: true,
        };

        const updated = addEdge(newEdge, eds);
        if (wouldCreateCycle(params.source!, params.target!, nodes, updated)) {
          toast.error("Cycles are not allowed in workflow (DAG only).");
          return eds;
        }
        scheduleSave(nodes, updated);
        return updated;
      });
    },
    [nodes, setEdges, scheduleSave],
  );

  return (
    <div className="h-screen w-full ">
      <ReactFlow
        nodes={nodes.map((node) => ({
          ...node,
          data: { ...(node.data || {}), onChange: handleNodeDataChange },
        }))}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onDragOver={onDragOver}
        onDrop={onDrop}
        nodeTypes={nodeTypes}
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
  }, [name, workflowsId, UpdateName]);
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
