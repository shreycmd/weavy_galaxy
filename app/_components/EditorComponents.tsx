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
import React from "react";
import w from "@/public/download.png";
import { ImageUpIcon, Text, VideoIcon } from "lucide-react";
import { Input } from "@/components/ui/input";

const itemsList = [
  {
    name: "Text Input",
    icon: Text,
  },
  {
    name: "Image Input",
    icon: ImageUpIcon,
  },
  {
    name: "Video Input",
    icon: VideoIcon,
  },
];
const Editorsidebar = () => {
  const { open, setOpen } = useSidebar();
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
                tooltip={item.name}
                className="gap-x-4 h-10 px-4"
                onClick={() => setOpen((open: any) => !open)}
              >
                <Icon className="size-4" />
                <span>{item.name}</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          );
        })}
      </SidebarContent>
    </Sidebar>
  );
};

export default Editorsidebar;

export const EditorName = ({ workflowsId }: { workflowsId: string }) => {
  return (
    <div className="w-fit ">
      <Input
        type="text"
        defaultValue="untitled"
        className="bg-[#212126] focus-visible:ring-0 focus-visible:ring-offset-0"
      />
    </div>
  );
};
