import { db } from "@/lib/db";
import { logger, task, tasks } from "@trigger.dev/sdk/v3";
import { topologicalsort } from "./utils";
import { getExecuter } from "@/app/features/execution/lib";
import { NodeType } from "@/app/generated/prisma/enums";

function getUpstreamNodes(
  targetNodeId: string,
  nodes: any[],
  connections: any[],
) {
  console.log("Running getUpstreamNodes");
  console.log("Target:", targetNodeId);

  const visited = new Set<string>();
  const stack = [targetNodeId];

  while (stack.length > 0) {
    const current = stack.pop()!;
    console.log("Visiting:", current);

    visited.add(current);

    const incoming = connections.filter((c) => c.toNodeId === current);

    console.log("Incoming for", current, incoming);

    for (const conn of incoming) {
      if (!visited.has(conn.fromNodeId)) {
        stack.push(conn.fromNodeId);
      }
    }
  }

  console.log("Visited:", Array.from(visited));
  console.log(
    "All nodes:",
    nodes.map((n) => n.id),
  );

  return nodes.filter((node) => visited.has(node.id));
}

export const executeNodeTask = task({
  id: "execute-node",
  // Set an optional maxDuration to prevent tasks from running indefinitely
  maxDuration: 300, // Stop executing after 300 secs (5 mins) of compute
  run: async (payload: any, { ctx }) => {
    const workflowId = payload.workflowId;
    const NodeId = payload.NodeId;
    const workflow = await db.workFlowInfo.findUnique({
      where: { id: workflowId },
      include: {
        nodes: true,
        connections: true,
      },
    });

    if (!workflow) {
      logger.error("Workflow not found", { workflowId });
      throw new Error("Workflow not found");
    }
    const required_nodes = getUpstreamNodes(
      NodeId,
      workflow.nodes,
      workflow.connections,
    );
    const sorted_nodes = topologicalsort(required_nodes, workflow.connections);
    console.log("payload context", payload.context);

    const rawContext = payload?.context ?? payload?.payload?.context;
    let context =
      rawContext && typeof rawContext === "object" && !Array.isArray(rawContext)
        ? (rawContext as Record<string, unknown>)
        : {};
    logger.log("Execution context received", { context });
    for (const node of sorted_nodes) {
      if (node.type === NodeType.LLMnode) {
        const data = node.data as Record<string, unknown>;
        const model = (data?.model as string) ?? "gemini-2.5-flash";
        const incomingToLlm = workflow.connections.filter(
          (c: { toNodeId: string; toInput: string | null }) =>
            c.toNodeId === node.id,
        );
        const systemConn = incomingToLlm.find(
          (c: { toInput: string | null }) => c.toInput === "system_prompt",
        );
        const userConn = incomingToLlm.find(
          (c: { toInput: string | null }) => c.toInput === "user_prompt",
        );
        const systemMessage =
          (systemConn &&
            (context[`output_${(systemConn as { fromNodeId: string }).fromNodeId}`] as string)) ??
          (data?.systemMessage as string) ??
          "You are a helpful assistant.";
        const userMessage =
          (userConn &&
            (context[`output_${(userConn as { fromNodeId: string }).fromNodeId}`] as string)) ??
          (context["textInput"] as string) ??
          (context["userMessage"] as string) ??
          (data?.userMessage as string) ??
          "";
        const result = await tasks.triggerAndWait<typeof LLMExecuter>(
          "execute-llm-node",
          {
            Model: model,
            SystemMessage: systemMessage,
            UserMessage: userMessage,
          },
        );
        const text = result.ok ? result.output.text : "";
        context = { ...context, llmOutput: text };
      } else {
        const executer = getExecuter(node.type);
        context = await executer({
          data: node.data as Record<string, unknown>,
          NodeId: node.id,
          context,
        });
      }
    }
    return {
      message: `Hello, world! ${payload.workflowId}`,
      nodes: sorted_nodes,
      connections: workflow.connections,
    };
  },
});

import { generateText } from "ai";
import { google } from "@ai-sdk/google";

export const LLMExecuter = task({
  id: "execute-llm-node",
  maxDuration: 300,
  run: async (payload: any) => {
    const { text } = await generateText({
      model: google(`${payload.Model}`),
      messages: [
        { role: "system", content: `${payload.SystemMessage}` },
        { role: "user", content: `${payload.UserMessage}` },
      ],
    });
    return { text };
  },
});

// import ffmpeg from "fluent-ffmpeg";
// import path from "node:path";
// import { writeFile, readFile, unlink } from "node:fs/promises";
// import { ApiError, Transloadit } from "@transloadit/node";
// import { prisma } from "@/server/db";

// const transloadit = new Transloadit({
//   authKey: process.env.TRANSLOADIT_KEY!,
//   authSecret: process.env.TRANSLOADIT_SECRET!,
// });

// async function downloadToTmp(url: string, outPath: string) {
//   const res = await fetch(url);
//   if (!res.ok) throw new Error("Download failed");
//   const buffer = Buffer.from(await res.arrayBuffer());
//   await writeFile(outPath, buffer);
// }

// function getDimensions(
//   filePath: string,
// ): Promise<{ width: number; height: number }> {
//   return new Promise((resolve, reject) => {
//     ffmpeg.ffprobe(filePath, (err, metadata) => {
//       if (err) return reject(err);
//       const stream = metadata.streams.find((s) => s.width);
//       resolve({
//         width: stream!.width!,
//         height: stream!.height!,
//       });
//     });
//   });
// }

// export const cropImageTask = task({
//   id: "crop-image",

//   run: async ({
//     imageId,
//     imageUrl,
//     xPercent,
//     yPercent,
//     widthPercent,
//     heightPercent,
//   }: {
//     imageId: string;
//     imageUrl: string;
//     xPercent: number;
//     yPercent: number;
//     widthPercent: number;
//     heightPercent: number;
//   }) => {
//     await prisma.image.update({
//       where: { id: imageId },
//       data: { status: "PROCESSING" },
//     });

//     const inputPath = path.resolve("/tmp", `input-${Date.now()}.jpg`);
//     const outputPath = path.resolve("/tmp", `output-${Date.now()}.jpg`);

//     try {
//       // 1️⃣ Download original image
//       await downloadToTmp(imageUrl, inputPath);

//       // 2️⃣ Get original dimensions
//       const { width, height } = await getDimensions(inputPath);

//       // 3️⃣ Convert % → pixels
//       const cropWidth = Math.floor((widthPercent / 100) * width);
//       const cropHeight = Math.floor((heightPercent / 100) * height);
//       const cropX = Math.floor((xPercent / 100) * width);
//       const cropY = Math.floor((yPercent / 100) * height);

//       // 4️⃣ Run crop
//       await new Promise<void>((resolve, reject) => {
//         if (process.env.FFMPEG_PATH)
//           ffmpeg.setFfmpegPath(process.env.FFMPEG_PATH);

//         ffmpeg(inputPath)
//           .videoFilters(`crop=${cropWidth}:${cropHeight}:${cropX}:${cropY}`)
//           .output(outputPath)
//           .on("end", resolve)
//           .on("error", reject)
//           .run();
//       });

//       // 5️⃣ Upload cropped image to Transloadit
//       const fileBuffer = await readFile(outputPath);

//       const assembly = await transloadit.createAssembly({
//         steps: {
//           upload: {
//             robot: "/upload/handle",
//           },
//         },
//       });

//       await transloadit.addFile(assembly.assembly_id, fileBuffer, {
//         filename: `cropped-${imageId}.jpg`,
//       });

//       const result = await transloadit.waitForAssembly(assembly.assembly_id);

//       const croppedUrl = result.results.upload[0].ssl_url;

//       // 6️⃣ Update DB
//       await prisma.image.update({
//         where: { id: imageId },
//         data: {
//           croppedUrl,
//           status: "DONE",
//         },
//       });

//       return { croppedUrl };
//     } catch (error: any) {
//       await prisma.image.update({
//         where: { id: imageId },
//         data: {
//           status: "FAILED",
//           error: error.message,
//         },
//       });
//       throw error;
//     } finally {
//       await unlink(inputPath).catch(() => {});
//       await unlink(outputPath).catch(() => {});
//     }
//   },
// });

// export const extractThumbnailTask = task({
//   id: "extract-video-thumbnail",

//   run: async ({
//     videoUrl,
//     timestamp,
//   }: {
//     videoUrl: string;
//     timestamp: number; // in seconds
//   }) => {
//     const outputPath = path.resolve("/tmp", `thumbnail-${Date.now()}.jpg`);

//     try {
//       await new Promise<void>((resolve, reject) => {
//         if (process.env.FFMPEG_PATH)
//           ffmpeg.setFfmpegPath(process.env.FFMPEG_PATH);

//         ffmpeg(videoUrl)
//           .inputOptions([`-ss ${timestamp}`])
//           .frames(1)
//           .outputOptions(["-q:v 2"])
//           .output(outputPath)
//           .on("end", () => resolve())
//           .on("error", (err) => reject(err))
//           .run();
//       });

//       const buffer = await readFile(outputPath);

//       // 1️⃣ Create assembly
//       const assembly = await transloadit.createAssembly({
//         params: {
//           steps: {
//             upload: {
//               robot: "/upload/handle",
//             },
//           },
//         },
//       });

//       // 2️⃣ Upload file to returned upload URL
//       const formData = new FormData();
//       formData.append("file", new Blob([buffer]), "thumbnail.jpg");

//       await fetch(assembly.uploadUrl, {
//         method: "POST",
//         body: formData,
//       });

//       // 3️⃣ Wait for assembly to finish
//       const result = await transloadit.awaitAssemblyCompletion(
//         assembly.assembly_id,
//       );

//       // 4️⃣ Get URL
//       const imageUrl = result?.results?.upload?.[0]?.ssl_url;

//       if (!imageUrl) {
//         throw new Error("Upload failed");
//       }

//       return { imageUrl };
//     } finally {
//       await unlink(outputPath).catch(() => {});
//     }
//   },
// });
