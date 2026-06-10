import { queryEmployeeOptions } from "@/api/_shared/employee-options";
import { getMenu } from "@/api/navigation/get_menu";
import { MainShell } from "@/components/layout/MainShell";
import { getCurrentUser } from "@/lib/auth/get-current-user";
import { toSessionEmployee } from "@/lib/auth/session-employee";
import { redirect } from "next/navigation";
import type { ReactNode } from "react";

export default async function MainLayout({ children }: { children: ReactNode }) {
  const user = await getCurrentUser();
  // redirect ไป logout แทน login โดยตรง เพื่อให้ clear cookie ก่อน (ป้องกัน redirect loop)
  if (!user) redirect("/auth/logout");
  if (user.mustChangePassword) redirect("/auth/change-password");

  const [menu, employees] = await Promise.all([
    getMenu(),
    queryEmployeeOptions(),
  ]);
  return (
    <MainShell
      menu={menu}
      employees={employees}
      sessionEmployee={toSessionEmployee(user)}
    >
      {children}
    </MainShell>
  );
}
