import AppHeader from "@/app/_components/AppHeader";
import AppSidebar from "@/app/_components/AppSidebar";

// const layout = ({ children }: { children: React.ReactNode }) => {
//   return (
//     <>
//       {/* <AppHeader /> */}
//       <main className="flex-1">{children}</main>;
//     </>
//   );
// };

// export default layout;
import {
  Sidebar,
  SidebarInset,
  SidebarProvider,
} from "@/components/ui/sidebar";
import React from "react";

const layout = ({ children }: { children: React.ReactNode }) => {
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>{children}</SidebarInset>
    </SidebarProvider>
  );
};

export default layout;
