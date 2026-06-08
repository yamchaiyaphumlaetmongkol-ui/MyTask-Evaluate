import { queryEmployeeOptions } from "@/api/_shared/employee-options";
import { getMenu } from "@/api/navigation/get_menu";
import { MainShell } from "@/components/layout/MainShell";
import { getCurrentUser } from "@/lib/auth/get-current-user";
import { redirect } from "next/navigation";
import type { ReactNode } from "react";

export default async function MainLayout({ children }: { children: ReactNode }) {
  const user = await getCurrentUser();
  if (!user) redirect("/auth/login");
  if (user.mustChangePassword) redirect("/auth/change-password");

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
