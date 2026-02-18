"use client";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import Image from "next/image";
import React, { useState } from "react";
import w from "@/public/download.png";
import { Brain, ImageUpIcon, Text, VideoIcon } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useUpdateNameWorkflows } from "../features/workflows/hooks/use-workflows";
import {
  ImageInputNode,
  LLMNode,
  TextInputNode,
  VideoInputNode,
} from "../features/editor/components/editor";

const itemsList = [
  {
    name: "Text Input",
    icon: Text,
    type: "TextInputNode",
  },
  {
    name: "Image Input",
    icon: ImageUpIcon,
    type: "ImageInputNode",
  },
  {
    name: "Video Input",
    icon: VideoIcon,
    type: "VideoInputNode",
  },
  {
    name: "LLM Node",
    icon: Brain,
    type: "LLMnode",
  },
];
const Editorsidebar = () => {
  const { open, setOpen } = useSidebar();
  const onDragStart = (event: React.DragEvent, type: string) => {
    console.log("frpm ondragstart", type);
    event.dataTransfer.setData("application/reactflow", type);
    event.dataTransfer.effectAllowed = "move";
  };
  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <SidebarMenu>
          {" "}
          {/* <SidebarMenuItem>
            <SidebarMenuButton asChild className="gap-x-4 h-10 px-4">
              <Link href="/">

                <span className="font-semibold text-sm">Weavy.ai</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem> */}
          <SidebarMenuItem>
            <Image src={w} width={40} height={40} alt="img" />
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <SidebarMenuItem className="px-2">
          {/* <SidebarMenuButton
            onClick={() => {
              createworkflows.mutate(undefined, {
                onError: (error) => {
                  // handleError(error)
                  console.error(error);
                },
              });
            }}
            className="gap-x-4 h-10  !bg-[#f7ffa8] text-black px-10 "
          >
            <PlusIcon className="size-3" />
            <span>Create new file</span>
          </SidebarMenuButton> */}
        </SidebarMenuItem>
        {itemsList.map((item) => {
          const Icon = item.icon;

          return (
            <SidebarMenuItem key={item.name}>
              <SidebarMenuButton
                className="gap-x-4 h-10 px-4"
                onClick={() => setOpen((open) => !open)}
              >
                <Icon className="size-4" />
                <span
                  draggable
                  onDragStart={() => onDragStart(event, item.type)}
                >
                  {item.name}
                </span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          );
        })}
      </SidebarContent>
    </Sidebar>
  );
};

export default Editorsidebar;
