import { NodeType } from "@/app/generated/prisma/enums";

export type ExecutionContext = Record<string, unknown>;

export type ExecutorArgs = {
  data: Record<string, unknown>;
  NodeId: string;
  context: ExecutionContext;
};

export type Executor = (args: ExecutorArgs) => Promise<ExecutionContext>;

function textInputExecutor({
  data,
  context,
  NodeId,
}: ExecutorArgs): Promise<ExecutionContext> {
  const fromContext =
    (context[`output_${NodeId}`] as string) ??
    (context["userMessage"] as string) ??
    (context["textInput"] as string);
  const value = fromContext ?? (data["value"] as string) ?? (data["defaultValue"] as string) ?? "";
  return Promise.resolve({
    ...context,
    textInput: value,
    userMessage: value,
    [`output_${NodeId}`]: value,
  });
}

function imageInputExecutor({ data, context }: ExecutorArgs): Promise<ExecutionContext> {
  const imageUrl = context["imageUrl"] ?? context["image"];
  const fromData = (data["url"] as string) ?? "";
  return Promise.resolve({
    ...context,
    imageUrl: imageUrl ?? fromData,
  });
}

function videoInputExecutor({ data, context }: ExecutorArgs): Promise<ExecutionContext> {
  const videoUrl = context["videoUrl"] ?? context["video"];
  const fromData = (data["url"] as string) ?? "";
  return Promise.resolve({
    ...context,
    videoUrl: videoUrl ?? fromData,
  });
}

function llmExecutor(_args: ExecutorArgs): Promise<ExecutionContext> {
  throw new Error(
    "LLMnode is executed via the execute-llm-node Trigger task, not this executor.",
  );
}

function cropImageExecutor({ context }: ExecutorArgs): Promise<ExecutionContext> {
  return Promise.resolve({
    ...context,
    cropImageResult: context["imageUrl"] ?? null,
  });
}

function getFrameFromVideoExecutor({ context }: ExecutorArgs): Promise<ExecutionContext> {
  return Promise.resolve({
    ...context,
    frameResult: context["videoUrl"] ?? null,
  });
}

export const executionRegistry: Record<NodeType, Executor> = {
  [NodeType.TextInputNode]: textInputExecutor,
  [NodeType.ImageInputNode]: imageInputExecutor,
  [NodeType.VideoInputNode]: videoInputExecutor,
  [NodeType.LLMnode]: llmExecutor,
  [NodeType.CropimageNode]: cropImageExecutor,
  [NodeType.GetFrameFromVideoNode]: getFrameFromVideoExecutor,
};

export function getExecuter(type: NodeType): Executor {
  const executer = executionRegistry[type];
  if (!executer) throw new Error(`No executer found for node type ${type}`);
  return executer;
}
