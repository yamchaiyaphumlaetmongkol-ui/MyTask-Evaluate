"use client";

import { AppHeader } from "@/components/layout/AppHeader";
import { Sidebar } from "@/components/layout/Sidebar";
import type { MenuConfig } from "@/api/navigation/types";
import type { ReactNode } from "react";

interface MainShellProps {
  menu: MenuConfig;
  children: ReactNode;
}

export function MainShell({ menu, children }: MainShellProps) {
  return (
    <div className="d-flex flex-column flex-grow-1 min-vh-100">
      <AppHeader />
      <div className="erp-shell-body flex-grow-1">
        <Sidebar menu={menu} />
        <div className="erp-content">{children}</div>
      </div>
    </div>
  );
}
