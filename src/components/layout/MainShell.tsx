"use client";

import { AppHeader } from "@/components/layout/AppHeader";
import { CurrentUserScopeGuard } from "@/components/layout/CurrentUserScopeGuard";
import { EntryUserGate } from "@/components/layout/EntryUserGate";
import { Sidebar } from "@/components/layout/Sidebar";
import type { EmployeeOption } from "@/api/_shared/employee-options";
import type { MenuConfig } from "@/api/navigation/types";
import { Suspense, type ReactNode } from "react";

interface MainShellProps {
  menu: MenuConfig;
  employees: EmployeeOption[];
  children: ReactNode;
}

export function MainShell({ menu, employees, children }: MainShellProps) {
  return (
    <EntryUserGate employees={employees}>
      <div className="erp-app-frame d-flex flex-column flex-grow-1">
        <Suspense fallback={null}>
          <CurrentUserScopeGuard />
        </Suspense>
        <AppHeader />
        <div className="erp-shell-body flex-grow-1">
          <Sidebar menu={menu} employees={employees} />
          <div className="erp-content">{children}</div>
        </div>
      </div>
    </EntryUserGate>
  );
}
