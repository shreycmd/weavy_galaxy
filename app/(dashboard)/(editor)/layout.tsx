import AppSidebar from "@/app/_components/AppSidebar";
import Editorsidebar from "@/app/_components/EditorComponents";
import {
  Sidebar,
  SidebarInset,
  SidebarProvider,
} from "@/components/ui/sidebar";

import React from "react";

const layout = ({ children }: { children: React.ReactNode }) => {
  return (
    <SidebarProvider defaultOpen={false}>
      <Editorsidebar />
      <SidebarInset>
        <main className="flex flex-1 flex-col p-6">{children}</main>
      </SidebarInset>
    </SidebarProvider>
  );
};

export default layout;
