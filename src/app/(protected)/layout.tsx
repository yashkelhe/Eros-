import React from "react";
import { SidebarProvider } from "@/components/ui/sidebar"; // Ensure SidebarProvider is defined properly
import { UserButton } from "@clerk/nextjs";
import { AppSideBar } from "./app-sidebar";

type Props = {
  children: React.ReactNode;
};

const SiderBarLayout = ({ children }: Props) => {
  return (
    <SidebarProvider>
      <AppSideBar />
      <main className="m-2 w-full">
        <div className="iterm-center flex justify-center gap-2 rounded-md border border-sidebar-border bg-sidebar p-2 px-4 shadow">
          {/* <SearchBar/>*/}
          <div className="ml-auto"></div>
          <UserButton />
        </div>
        <div className="h-4"></div>
        {/* main content */}
        <div className="h-[calc(100vh-6rem)] overflow-y-scroll rounded-md border border-sidebar-border bg-sidebar p-4 shadow">
          {children}
        </div>
      </main>
    </SidebarProvider>
  );
};

export default SiderBarLayout;
