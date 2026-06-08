"use client";

import { AppHeader } from "@/components/layout/AppHeader";
import { AuthSessionBootstrap } from "@/components/layout/AuthSessionBootstrap";
import { CurrentUserScopeGuard } from "@/components/layout/CurrentUserScopeGuard";
import { Sidebar } from "@/components/layout/Sidebar";
import type { EmployeeOption } from "@/api/_shared/employee-options";
import type { MenuConfig } from "@/api/navigation/types";
import type { SessionEmployee } from "@/lib/auth/session-employee";
import { Suspense, type ReactNode } from "react";

interface MainShellProps {
  menu: MenuConfig;
  employees: EmployeeOption[];
  sessionEmployee: SessionEmployee | null;
  children: ReactNode;
}

export function MainShell({
  menu,
  employees,
  sessionEmployee,
  children,
}: MainShellProps) {
  return (
    <div className="erp-app-frame d-flex flex-column flex-grow-1">
      <AuthSessionBootstrap employee={sessionEmployee} />
      <Suspense fallback={null}>
        <CurrentUserScopeGuard />
      </Suspense>
      <AppHeader />
      <div className="erp-shell-body flex-grow-1">
        <Sidebar menu={menu} employees={employees} />
        <div className="erp-content">{children}</div>
      </div>
    </div>
  );
}
