"use client";
import cuid from "cuid";
import { ErrorView, LoadingView } from "@/app/_components/entity-components";
import {
  useExecuteWorkflow,
  useSuspenseWorkflowone,
  useUpdateNameWorkflows,
  useUpdateWorkflows,
} from "../../workflows/hooks/use-workflows";
import { Brain, TrashIcon, Upload } from "lucide-react";
import { toast } from "sonner";

import { useEffect, useMemo, useRef, useState } from "react";
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
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from "@/components/ui/context-menu";
import { NodeStatusIndicator } from "@/components/node-status-indicator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

function getUpstreamNodeIds(targetId: string, edges: Edge[]): Set<string> {
  const visited = new Set<string>();
  const stack = [targetId];
  while (stack.length > 0) {
    const current = stack.pop()!;
    if (visited.has(current)) continue;
    visited.add(current);
    const incoming = edges.filter((e) => e.target === current);
    for (const e of incoming) stack.push(e.source);
  }
  visited.delete(targetId);
  return visited;
}

function buildContextFromUpstreamNodes(
  upstreamIds: Set<string>,
  nodes: Node[],
): Record<string, unknown> {
  const context: Record<string, unknown> = {};
  for (const nodeId of upstreamIds) {
    const node = nodes.find((n) => n.id === nodeId);
    if (!node?.data) continue;
    const data = node.data as Record<string, unknown>;
    if (node.type === "TextInputNode") {
      const value = data.value as string | undefined;
      if (value != null) {
        context[`output_${nodeId}`] = value;
        context.textInput = value;
        context.userMessage = value;
      }
    }
    if (node.type === "ImageInputNode") {
      const url = data.url as string | undefined;
      if (url != null) {
        context[`output_${nodeId}`] = url;
        context.imageUrl = url;
      }
    }
    if (node.type === "VideoInputNode") {
      const url = data.url as string | undefined;
      if (url != null) {
        context[`output_${nodeId}`] = url;
        context.videoUrl = url;
      }
    }
  }
  return context;
}

export const ContextMenuNode = ({
  children,
  id,
  type,
  workflowId,
}: {
  children: React.ReactNode;
  id: string;
  type?: string;
  workflowId: string;
}) => {
  const { setNodes, setEdges, getNodes, getEdges } = useReactFlow();
  const executeNode = useExecuteWorkflow();
  const handleExecute = () => {
    const nodes = getNodes();
    const edges = getEdges();
    const upstreamIds = getUpstreamNodeIds(id, edges);
    const context = buildContextFromUpstreamNodes(upstreamIds, nodes);
    executeNode.mutate({
      id: workflowId,
      NodeId: id,
      context: Object.keys(context).length > 0 ? context : undefined,
    });
  };
  const handleDelete = () => {
    setNodes((nds) => nds.filter((node) => node.id !== id));
    setEdges((eds) =>
      eds.filter((edge) => edge.source !== id && edge.target !== id),
    );
    toast.success("Node deleted");
  };
  return (
    <ContextMenu>
      <ContextMenuTrigger asChild>{children}</ContextMenuTrigger>

      <ContextMenuContent>
        {type === "LLMnode" && (
          <ContextMenuItem onClick={handleExecute}>
            Execute Node
          </ContextMenuItem>
        )}
        <ContextMenuItem variant="destructive" onClick={handleDelete}>
          <TrashIcon className="mr-2 h-4 w-4" />
          Delete
        </ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  );
};

export const LLMNode = ({ data, id }: any) => {
  return (
    <ContextMenuNode id={id} type="LLMnode" workflowId={data.workflowId}>
      <div className="bg-[#212126] border border-[#2a2a30] rounded-xl w-48 h-48 shadow-lg flex flex-col items-center justify-center gap-3 relative">
        {/* React Flow Handles */}
        <Handle type="source" id="output_llm" position={Position.Right} />
        <Handle type="target" id="user_prompt" position={Position.Left} />
        <Handle
          type="target"
          id="system_prompt"
          position={Position.Left}
          style={{ top: "10%", color: "#22c55e" }}
        />
        {/* Brain Icon */}
        <div className="bg-[#2a2a30] p-4 rounded-xl">
          <Brain className="w-8 h-8 text-white" />
        </div>
        {/* Dropdown */}
        <Select defaultValue="gemini-2.5-flash">
          <SelectTrigger className="w-36 h-8 text-xs bg-[#18181c] border-[#333]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="bg-[#18181c] border-[#333] text-white">
            <SelectItem value="gemini-2.5-flash">Gemini 2.5 Flash </SelectItem>
            <SelectItem value="gemini-2.5-nano">Gemini 2.5 Nano</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </ContextMenuNode>
  );
};
export const VideoInputNode = ({ data, id }: any) => {
  return (
    <ContextMenuNode id={id} workflowId={data.workflowId}>
      <NodeStatusIndicator status="loading" variant="border">
        <div className="relative bg-[#212126] text-white rounded-xl w-72 shadow-lg border border-[#2a2a30]">
          <div className="px-4 pt-4 pb-2 text-sm font-semibold">Video</div>

          <div
            className="relative mx-4 mb-4 h-60 rounded-lg border border-[#2a2a30]
                      bg-[linear-gradient(45deg,#2a2a30_25%,transparent_25%,transparent_75%,#2a2a30_75%),linear-gradient(45deg,#2a2a30_25%,transparent_25%,transparent_75%,#2a2a30_75%)]
                      bg-[size:20px_20px] bg-[position:0_0,10px_10px]
                      flex flex-col items-center justify-center text-sm text-gray-400 cursor-pointer"
          >
            <Upload className="mb-2 w-5 h-5 text-gray-400" />
            <p>Drag & drop or click to upload</p>

            <input
              type="file"
              accept="video/*"
              className="absolute inset-0 opacity-0 cursor-pointer"
            />
          </div>

          <Handle
            type="source"
            id="video"
            position={Position.Right}
            className="!bg-[#dca12c]"
          />
        </div>
      </NodeStatusIndicator>
    </ContextMenuNode>
  );
};

export const ImageInputNode = ({ data, id }: any) => {
  return (
    <ContextMenuNode id={id} workflowId={data.workflowId}>
      <div className="relative bg-[#212126] text-white rounded-xl w-72 shadow-lg border border-[#2a2a30]">
        <div className="px-4 pt-4 pb-2 text-sm font-semibold">Image</div>

        <div
          className="relative mx-4 mb-4 h-60 rounded-lg border border-[#2a2a30]
                      bg-[linear-gradient(45deg,#2a2a30_25%,transparent_25%,transparent_75%,#2a2a30_75%),linear-gradient(45deg,#2a2a30_25%,transparent_25%,transparent_75%,#2a2a30_75%)]
                      bg-[size:20px_20px] bg-[position:0_0,10px_10px]
                      flex flex-col items-center justify-center text-sm text-gray-400 cursor-pointer"
        >
          <Upload className="mb-2 w-5 h-5 text-gray-400" />
          <p>Drag & drop or click to upload</p>

          <input
            type="file"
            accept="image/*"
            className="absolute inset-0 opacity-0 cursor-pointer"
          />
        </div>

        <Handle
          type="source"
          id="img"
          position={Position.Right}
          className="!bg-purple-500"
        />
      </div>
    </ContextMenuNode>
  );
};

export const TextInputNode = ({ data, id }: any) => {
  const value = data?.value ?? "";

  const handleChange = (e: any) => {
    const next = e.target.value;
    if (typeof data?.onChange === "function") {
      data.onChange(id, { value: next });
    }
  };

  return (
    <ContextMenuNode id={id} workflowId={data.workflowId}>
      <div className="bg-[#212126] text-white px-2 rounded-xl w-56 shadow-lg border border-[#2a2a30]">
        <div className="text-sm font-semibold ">Prompts</div>

        <textarea
          rows={5}
          cols={10}
          placeholder="Enter text..."
          className="bg-[#1a1a1f] border border-[#333] rounded px-2 py-1 w-full outline-none text-sm"
          value={value}
          onChange={handleChange}
        />

        <Handle type="source" id="text" position={Position.Right} />
      </div>
    </ContextMenuNode>
  );
};
const nodeTypes = {
  TextInputNode: TextInputNode,
  ImageInputNode: ImageInputNode,
  VideoInputNode: VideoInputNode,
  LLMnode: LLMNode,
};

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
      id: cuid(),
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

        const shouldSave = changes.some((change) => {
          if (change.type === "remove") return true;
          if (change.type === "add") return true;
          if (change.type === "position") {
            return change.dragging === false;
          }
          return false;
        });

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
          animated: false,
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
  const nodesWithHandlers = useMemo(() => {
    return nodes.map((node) => ({
      ...node,
      data: {
        ...(node.data || {}),
        onChange: handleNodeDataChange,
        workflowId,
      },
    }));
  }, [nodes, handleNodeDataChange, workflowId]);

  return (
    <div className="h-screen w-full ">
      <ReactFlow
        nodes={nodesWithHandlers}
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
