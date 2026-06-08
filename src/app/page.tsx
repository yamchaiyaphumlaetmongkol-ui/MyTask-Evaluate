import { queryEmployeeOptions } from "@/api/_shared/employee-options";
import { getMenu } from "@/api/navigation/get_menu";
import { HomeDashboard } from "@/components/home/HomeDashboard";
import { MainShell } from "@/components/layout/MainShell";
import { getCurrentUser } from "@/lib/auth/get-current-user";
import { redirect } from "next/navigation";

export default async function RootPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/auth/login");
  if (user.mustChangePassword) redirect("/auth/change-password");

  const [menu, employees] = await Promise.all([
    getMenu(),
    queryEmployeeOptions(),
  ]);

  return (
    <MainShell menu={menu} employees={employees}>
      <main className="container-fluid py-4">
        <HomeDashboard />
      </main>
    </MainShell>
  );
}
