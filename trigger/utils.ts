import { Connections, Node } from "@/app/generated/prisma/client";
import toposort from "toposort";

export const topologicalsort = (
  nodes: Node[],
  connections: Connections[],
): Node[] => {
  if (connections.length === 0) return nodes;
  const edges = connections.map((conn) => [conn.fromNodeId, conn.toNodeId]);
  const connectedNodeIds = new Set<string>();
  for (const conn of connections) {
    connectedNodeIds.add(conn.fromNodeId);
    connectedNodeIds.add(conn.toNodeId);
  }
  for (const node of nodes) {
    if (!connectedNodeIds.has(node.id)) {
      edges.push([node.id, node.id]);
    }
  }
  let sortedNodeIds: string[];
  try {
    sortedNodeIds = toposort(edges);
    sortedNodeIds = [...new Set(sortedNodeIds)];
  } catch (e) {
    if (e instanceof Error && e.message.includes("Cyclic")) {
      throw new Error(
        "Cyclic dependency detected in the workflow. Please check your connections.",
      );
    }
    throw e;
  }
  const nodeMap = new Map(nodes.map((n) => [n.id, n]));
  return sortedNodeIds.map((id) => nodeMap.get(id)!).filter(Boolean);
};
