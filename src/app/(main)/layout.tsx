import { queryEmployeeOptions } from "@/api/_shared/employee-options";
import { getMenu } from "@/api/navigation/get_menu";
import { MainShell } from "@/components/layout/MainShell";
import type { ReactNode } from "react";

export default async function MainLayout({ children }: { children: ReactNode }) {
  const [menu, employees] = await Promise.all([
    getMenu(),
    queryEmployeeOptions(),
  ]);
  return (
    <MainShell menu={menu} employees={employees}>
      {children}
    </MainShell>
  );
}
