import { db } from "@/lib/db";
import { generateSlug } from "random-word-slugs";
import {
  baseProcedure,
  createTRPCRouter,
  protectedProcedure,
} from "@/trpc/init";
import z from "zod";
import { NodeType } from "@/app/generated/prisma/enums";
import { Edge, Node } from "@xyflow/react";

export const workflowrouter = createTRPCRouter({
  create: protectedProcedure.mutation(({ ctx }) => {
    return db.workFlowInfo.create({
      data: {
        name: generateSlug(3),
        userId: ctx.userId,
        nodes: {
          create: {
            type: NodeType.Inital,
            position: { x: 0, y: 0 },
            name: NodeType.Inital,
          },
        },
      },
    });
  }),
  remove: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(({ ctx, input }) => {
      return db.workFlowInfo.delete({
        where: {
          id: input.id,
          userId: ctx.userId,
        },
      });
    }),
  updateName: protectedProcedure
    .input(z.object({ id: z.string(), name: z.string().min(1) }))
    .mutation(({ ctx, input }) => {
      return db.workFlowInfo.update({
        where: {
          id: input.id,
          userId: ctx.userId,
        },
        data: {
          name: input.name,
        },
      });
    }),
  getone: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const workflow = await db.workFlowInfo.findUniqueOrThrow({
        where: { id: input.id, userId: ctx.userId },
        include: { nodes: true, connections: true },
      });
      //transforming server node to react flow compatible
      const nodes: Node[] = workflow.nodes.map((node) => ({
        id: node.id,
        type: node.type,
        position: node.position as { x: number; y: number },
        data: (node.data as Record<string, unknown>) || {},
      }));
      //transforming server node to react flow compatible
      const edges: Edge[] = workflow.connections.map((conn) => ({
        id: conn.id,
        source: conn.fromNodeId,
        target: conn.toNodeId,
        sourceHandle: conn.fromOutput,
        targetHandle: conn.toInput,
      }));
      return {
        id: workflow.id,
        name: workflow.name,
        nodes,
        edges,
      };
    }),
  getMany: protectedProcedure.query(({ ctx }) => {
    return db.workFlowInfo.findMany({
      where: { userId: ctx.userId },
    });
  }),
});
