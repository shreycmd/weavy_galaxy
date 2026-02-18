# Workflow Execution – Full Architecture

This doc describes how data flows from the UI to tRPC, then to Trigger.dev, and how each layer contributes.

---

## 1. High-level flow

```
[React Flow Editor]  →  [tRPC: workFlows.execute]  →  [Trigger: execute-node]  →  [Trigger: execute-llm-node]
       (context)              (id, NodeId, context)        (workflow + context)         (Model, SystemMessage, UserMessage)
```

- **UI** builds a `context` from upstream nodes and sends it with the execute request.
- **tRPC** validates input, loads the workflow from DB, then **triggers** the task (does not run the graph itself).
- **Trigger `execute-node`** loads workflow from DB again, runs the DAG (executors + LLM task), and returns.
- **Trigger `execute-llm-node`** is a child task: it receives system/user message and model, calls the LLM, returns `{ text }`.

---

## 2. Where data is transferred to tRPC

**Entry point:** user right-clicks an LLM node and clicks **“Execute Node”**.

| Layer | File | What runs | Data in / out |
|--------|------|-----------|----------------|
| **UI** | `app/features/editor/components/editor.tsx` | `ContextMenuNode` → `handleExecute()` | Builds `context`, calls `executeNode.mutate({ id, NodeId, context })` |
| **Hook** | `app/features/workflows/hooks/use-workflows.ts` | `useExecuteWorkflow()` | Uses `trpc.workFlows.execute.mutationOptions()`; `mutate(...)` sends the object above to tRPC |
| **tRPC handler** | `app/features/workflows/server/routers.ts` | `workflowrouter.execute` | Receives `{ id, NodeId, context? }`, loads workflow from DB, calls `tasks.trigger("execute-node", { workflowId, name, NodeId, context })` |

So **all data that eventually reaches the Trigger task is transferred to tRPC** in that single mutation payload: `id`, `NodeId`, and `context`. The handler does **not** run the workflow; it only validates, loads the workflow for auth, and triggers the task with that payload (plus `workflowId`, `name`).

---

## 3. Functions and what they do

### 3.1 Frontend (Editor)

| Function | File | Role |
|----------|------|------|
| **`getUpstreamNodeIds(targetId, edges)`** | `editor.tsx` | From the executed node, walks edges **backward** (target → source) and returns the set of all upstream node ids. |
| **`buildContextFromUpstreamNodes(upstreamIds, nodes)`** | `editor.tsx` | For each upstream node, reads its current output from `node.data` and fills a single `context` object: `output_<nodeId>`, and legacy keys like `textInput`, `userMessage`, `imageUrl`, `videoUrl`. This is the **only** place the UI turns graph state into “context” for execution. |
| **`ContextMenuNode`** | `editor.tsx` | Wraps each node with a context menu. On “Execute Node” it calls `getNodes()`, `getEdges()`, then `getUpstreamNodeIds(id, edges)`, then `buildContextFromUpstreamNodes(upstreamIds, nodes)`, then `executeNode.mutate({ id: workflowId, NodeId: id, context })`. So **all data sent to tRPC is built here**. |
| **`useExecuteWorkflow()`** | `use-workflows.ts` | Returns a mutation that calls `trpc.workFlows.execute` with whatever you pass to `mutate(...)`. |

So: **data is transferred to tRPC** in the object you pass to `executeNode.mutate(...)` in `handleExecute`. That object is exactly what the tRPC handler receives as `input`.

---

### 3.2 tRPC (API layer)

| Function / export | File | Role |
|-------------------|------|------|
| **`workflowrouter`** | `routers.ts` | tRPC router; exposes `execute`, `create`, `update`, `getone`, `getMany`, etc. |
| **`workflowrouter.execute`** | `routers.ts` | **Input:** `{ id, NodeId, context? }` (Zod-validated). Loads workflow by `id` and `ctx.userId`, then calls `tasks.trigger("execute-node", { workflowId, name, NodeId, context: input.context ?? {} })`. **Does not run the graph**; only triggers the Trigger task with the same `context` (and workflow id/name) so the task can run the DAG. |

So the **complete data transfer to the tRPC handler** is: the mutation input `{ id, NodeId, context? }`. The handler then passes that data (plus DB-derived `workflowId` and `name`) into Trigger.

---

### 3.3 Trigger – main workflow task

| Function / export | File | Role |
|-------------------|------|------|
| **`getUpstreamNodes(targetNodeId, nodes, connections)`** | `trigger/executes.ts` | Same idea as the frontend: from the target node, walks **connections** backward (`toNodeId` → `fromNodeId`) and returns the list of upstream **nodes** (from DB). |
| **`topologicalsort(nodes, connections)`** | `trigger/utils.ts` | Sorts nodes so every node runs after its dependencies (DAG order). |
| **`executeNodeTask`** | `trigger/executes.ts` | **Payload:** `workflowId`, `NodeId`, `context` (and optionally `name`). Loads workflow (nodes + connections) from DB, computes upstream nodes, topo-sorts them, normalizes `payload.context` into `context`, then runs each node in order. For **LLM nodes** it uses connections to resolve system vs user message and calls the `execute-llm-node` task; for **other nodes** it uses `getExecuter(node.type)` from the execution lib and passes `{ data, NodeId, context }`, then replaces `context` with the executor’s return value. So **all data that flows between nodes** goes through this single `context` object. |

So the **data that was transferred to tRPC** (`id`, `NodeId`, `context`) is what the handler forwards to Trigger; the task then receives it as `payload` and uses `payload.context` (with a small fallback for nested `payload.payload.context`) as the initial `context` for the DAG.

---

### 3.4 Trigger – LLM child task

| Export | File | Role |
|--------|------|------|
| **`LLMExecuter`** | `trigger/executes.ts` | Task id: `execute-llm-node`. **Payload:** `Model`, `SystemMessage`, `UserMessage`. Calls `generateText` with Google model and returns `{ text }`. Used only from inside `executeNodeTask` when the current node is an LLM node. |

So the **only** data this task gets is what `executeNodeTask` passes: model name and the two strings (system and user message) derived from `context` and connections.

---

### 3.5 Execution lib (node logic, non-LLM)

| Function / export | File | Role |
|--------------------|------|------|
| **`getExecuter(type)`** | `app/features/execution/lib.ts` | Returns the executor function for a given `NodeType`. **Never used for LLM nodes** in the main task; LLM is handled by the Trigger task above. |
| **`textInputExecutor`** | `app/features/execution/lib.ts` | Reads from `context` (`output_<NodeId>`, `userMessage`, `textInput`) or `data.value` / `data.defaultValue`; returns updated `context` with `output_<NodeId>`, `textInput`, `userMessage` set. |
| **`imageInputExecutor`** | `app/features/execution/lib.ts` | Puts `imageUrl` (from context or `data.url`) into `context`. |
| **`videoInputExecutor`** | `app/features/execution/lib.ts` | Puts `videoUrl` (from context or `data.url`) into `context`. |
| **`llmExecutor`** | `app/features/execution/lib.ts` | Stub; throws. LLM is run only via the `execute-llm-node` Trigger task. |
| **`cropImageExecutor`** / **`getFrameFromVideoExecutor`** | `app/features/execution/lib.ts` | Pass-through / placeholders using `context.imageUrl` / `context.videoUrl`. |

So **data flow between nodes** (except LLM) is: **one shared `context` object** passed into each executor; each executor returns an updated `context` that the next node receives.

---

## 4. End-to-end data flow (execute one LLM node)

1. **Editor**  
   User runs “Execute Node” on an LLM node.  
   - `getUpstreamNodeIds(id, edges)` → e.g. `[textNode1, textNode2]`.  
   - `buildContextFromUpstreamNodes(...)` → e.g. `{ output_textNode1: "System...", output_textNode2: "User...", textInput: "...", userMessage: "..." }`.  
   - `executeNode.mutate({ id: workflowId, NodeId: id, context })`.

2. **tRPC**  
   - Receives `input = { id, NodeId, context }`.  
   - Loads workflow by `id` and `userId`.  
   - Calls `tasks.trigger("execute-node", { workflowId, name, NodeId, context: input.context ?? {} })`.  
   So **the same `context` (and NodeId, workflow id) is what gets transferred to the tRPC handler and then to Trigger.**

3. **Trigger `execute-node`**  
   - Receives `payload = { workflowId, NodeId, context, ... }`.  
   - Loads workflow (nodes + connections) from DB.  
   - `getUpstreamNodes(NodeId, nodes, connections)` → upstream nodes.  
   - `topologicalsort(...)` → execution order.  
   - Initial `context` = normalized `payload.context`.  
   - For each node in order:  
     - If **LLM**: find connections to `system_prompt` / `user_prompt`, read `context["output_<fromNodeId>"]` (and fallbacks) for system and user message, then `tasks.triggerAndWait("execute-llm-node", { Model, SystemMessage, UserMessage })`, then set `context.llmOutput = result.output.text`.  
     - Else: `context = await getExecuter(node.type)({ data: node.data, NodeId: node.id, context })`.

4. **Trigger `execute-llm-node`**  
   - Receives `{ Model, SystemMessage, UserMessage }`, calls LLM, returns `{ text }`.  
   - Parent task writes that into `context.llmOutput` and continues.

So: **the only place we “transfer” the full execution data to our tRPC handlers is the execute mutation input.** The handler then forwards that (plus IDs) to Trigger; Trigger runs the graph and uses the same `context` for the whole DAG (and for LLM, only the two resolved strings are sent to the child task).

---

## 5. Summary table

| What | Where it happens | Data |
|------|-------------------|------|
| Build execution context from graph | `editor.tsx`: `buildContextFromUpstreamNodes` | `context`: `output_<nodeId>`, `textInput`, `userMessage`, `imageUrl`, `videoUrl` |
| Send to API | `editor.tsx`: `handleExecute` → `executeNode.mutate(...)` | `{ id, NodeId, context }` |
| tRPC receive | `routers.ts`: `workflowrouter.execute` | Same as above (`input`) |
| tRPC → Trigger | `routers.ts`: `tasks.trigger("execute-node", ...)` | `{ workflowId, name, NodeId, context }` |
| Run DAG & pass context | `executes.ts`: `executeNodeTask` | Same `context` object updated by each node |
| Resolve system/user for LLM | `executes.ts`: inside `executeNodeTask` | Connections `system_prompt` / `user_prompt` → `context["output_<fromNodeId>"]` |
| Call LLM | `executes.ts`: `LLMExecuter` | `{ Model, SystemMessage, UserMessage }` → `{ text }` |

So: **the complete data transfer to our tRPC handlers is the execute mutation payload.** Everything else (DB workflow, Trigger payload, and the single `context` object inside the task) is built from that or from the DB.
