import { Handle, Position } from "@xyflow/react";
import { Upload } from "lucide-react";

export const LLMNode = ({ data, id }: any) => {
  const value = data?.prompt ?? "";

  const handleChange = (e: any) => {
    const next = e.target.value;
    if (typeof data?.onChange === "function") {
      data.onChange(id, { prompt: next });
    }
  };

  return (
    <ContextMenuNode>
      <div className="bg-[#212126] text-white p-4 rounded-xl w-64 shadow-lg border border-[#2a2a30]">
        <Handle
          type="source"
          id="main"
          position={Position.Right}
          className=""
        />

        <div className="text-sm font-semibold mb-2">LLM Node</div>

        <textarea
          placeholder="Enter prompt..."
          className="bg-[#18181c] border border-[#333] rounded px-2 py-1 w-full text-xs outline-none resize-none"
          rows={3}
          value={value}
          onChange={handleChange}
        />

        <div className="text-xs text-gray-400 mt-2">Model: GPT-4</div>
        <Handle type="target" id="system_prompt" position={Position.Left} />
        <Handle
          type="target"
          id="user_prompt"
          position={Position.Left}
          style={{ top: "30%" }}
        />
      </div>
    </ContextMenuNode>
  );
};
export const VideoInputNode = ({ data }: any) => {
  return (
    <ContextMenuNode>
      <div className="relative bg-[#212126] text-white rounded-xl w-72 shadow-lg border border-[#2a2a30]">
        <div className="px-4 pt-4 pb-2 text-sm font-semibold">Video</div>

        <div
          className="relative mx-4 mb-4 h-60 rounded-lg border border-[#2a2a30]
                      bg-[linear-gradient(45deg,#2a2a30_25%,transparent_25%,transparent_75%,#2a2a30_75%),linear-gradient(45deg,#2a2a30_25%,transparent_25%,transparent_75%,#2a2a30_75%)]
                      bg-size-[20px_20px] bg-position-[0_0,10px_10px]
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
          id="file"
          position={Position.Right}
          className="bg-[#dca12c]"
        />
      </div>
    </ContextMenuNode>
  );
};

export const ImageInputNode = ({ data }: any) => {
  return (
    <ContextMenuNode>
      <div className="relative bg-[#212126] text-white rounded-xl w-72 shadow-lg border border-[#2a2a30]">
        <div className="px-4 pt-4 pb-2 text-sm font-semibold">Image</div>

        <div
          className="relative mx-4 mb-4 h-60 rounded-lg border border-[#2a2a30]
                      bg-[linear-gradient(45deg,#2a2a30_25%,transparent_25%,transparent_75%,#2a2a30_75%),linear-gradient(45deg,#2a2a30_25%,transparent_25%,transparent_75%,#2a2a30_75%)]
                      bg-position-[20px_20px] bg-[:0_0,10px_10px]
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
          id="file"
          position={Position.Right}
          className="bg-purple-500"
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
    <ContextMenuNode>
      {" "}
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

        <Handle type="source" id="main" position={Position.Right} />
      </div>
    </ContextMenuNode>
  );
};
export const nodeTypes = {
  TextInputNode: TextInputNode,
  ImageInputNode: ImageInputNode,
  VideoInputNode: VideoInputNode,
  LLMnode: LLMNode,
};
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuGroup,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuTrigger,
} from "@/components/ui/context-menu";
import { PencilIcon, ShareIcon, TrashIcon } from "lucide-react";

export function ContextMenuNode({ children }: { children: React.ReactNode }) {
  return (
    <ContextMenu>
      <ContextMenuTrigger asChild>{children}</ContextMenuTrigger>
      <ContextMenuContent>
        <ContextMenuGroup>
          <ContextMenuItem variant="destructive">
            <TrashIcon />
            Delete
          </ContextMenuItem>
        </ContextMenuGroup>
      </ContextMenuContent>
    </ContextMenu>
  );
}
