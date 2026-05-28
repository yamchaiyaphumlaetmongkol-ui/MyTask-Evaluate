import {
  queryEmployeeByLoginEmail,
  queryEmployeeOptions,
} from "@/api/_shared/employee-options";
import { getMenu } from "@/api/navigation/get_menu";
import { MainShell } from "@/components/layout/MainShell";
import { auth } from "@/server/auth";
import type { ReactNode } from "react";

export default async function MainLayout({ children }: { children: ReactNode }) {
  const session = await auth();
  const loginEmail = session?.user?.email ?? null;

  const [menu, employees, loginEmployee] = await Promise.all([
    getMenu(),
    queryEmployeeOptions(),
    queryEmployeeByLoginEmail(loginEmail),
  ]);
  return (
    <MainShell menu={menu} employees={employees} loginEmployee={loginEmployee}>
      {children}
    </MainShell>
  );
}
