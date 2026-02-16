"use client";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import img from "../favicon.ico";
import { SignedOut, SignOutButton, useUser } from "@clerk/nextjs";
import {
  CreditCardIcon,
  LogOutIcon,
  StarIcon,
  KeyIcon,
  HistoryIcon,
  FolderOpenIcon,
  PlusIcon,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useRouter } from "next/navigation";
import { title } from "process";
import { cn } from "@/lib/utils";
import { useCreateWorkflows } from "../features/workflows/hooks/use-workflows";
const menuItems = [
  {
    title: "WorkFlows",
    items: [
      {
        title: "Projects",
        icon: FolderOpenIcon,
        url: "/workflows",
      },
      {
        title: "Credentials",
        icon: KeyIcon,
        url: "/credentials",
      },
      {
        title: "Executions",
        icon: HistoryIcon,
        url: "/executions",
      },
    ],
  },
];

const AppSidebar = () => {
  const router = useRouter;
  const createworkflows = useCreateWorkflows();
  const pathnaame = usePathname();
  const { user } = useUser();
  console.log("info on user ", user?.fullName, user?.imageUrl);
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
            <div className="gap-x-4 h-10 px-4 flex items-center">
              <Image
                src={user?.imageUrl ?? img}
                width={40}
                height={40}
                alt="img"
                className="rounded-full "
              />
              <div>{user?.fullName}</div>
            </div>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <SidebarMenuItem className="px-2">
          <SidebarMenuButton
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
          </SidebarMenuButton>
        </SidebarMenuItem>
        {menuItems.map((group) => (
          <SidebarGroup key={group.title}>
            <SidebarGroupContent>
              {group.items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    tooltip={item.title}
                    isActive={
                      item.url === "/"
                        ? pathnaame == "/"
                        : pathnaame.startsWith(item.url)
                    }
                    asChild
                    className="gap-x-4 h-10 px-4"
                  >
                    <Link href={item.url} prefetch>
                      <item.icon className="size-4" />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>
      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <SignOutButton redirectUrl="/signin">
              <SidebarMenuButton
                tooltip="Sign out"
                className="gap-x-4 h-10 px-4"
              >
                <LogOutIcon className="h-4 w-4" />
                <span>Log Out</span>
              </SidebarMenuButton>
            </SignOutButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
};

export default AppSidebar;
