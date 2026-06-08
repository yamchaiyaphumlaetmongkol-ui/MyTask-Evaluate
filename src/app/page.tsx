import { queryHomeDashboard } from "@/api/home/dashboard";
import { queryEmployeeOptions } from "@/api/_shared/employee-options";
import { getMenu } from "@/api/navigation/get_menu";
import { HomeDashboard } from "@/components/home/HomeDashboard";
import { MainShell } from "@/components/layout/MainShell";
import { getCurrentUser } from "@/lib/auth/get-current-user";
import { toSessionEmployee } from "@/lib/auth/session-employee";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function RootPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/auth/login");
  if (user.mustChangePassword) redirect("/auth/change-password");

  const [menu, employees] = await Promise.all([
    getMenu(),
    queryEmployeeOptions(),
  ]);

  let dashboardData: Awaited<ReturnType<typeof queryHomeDashboard>> = null;
  let dashboardError = false;

  if (user.employeeCode) {
    try {
      dashboardData = await queryHomeDashboard(user.employeeCode);
    } catch (e) {
      console.error("RootPage queryHomeDashboard", e);
      dashboardError = true;
    }
  }

  return (
    <MainShell
      menu={menu}
      employees={employees}
      sessionEmployee={toSessionEmployee(user)}
    >
      <main className="container-fluid py-4">
        <HomeDashboard
          employeeCode={user.employeeCode}
          employeeName={user.employeeName}
          initialData={dashboardData}
          loadError={dashboardError}
        />
      </main>
    </MainShell>
  );
}
