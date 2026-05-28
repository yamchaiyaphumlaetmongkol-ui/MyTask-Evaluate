import {
  queryEmployeeByLoginEmail,
  queryEmployeeOptions,
} from "@/api/_shared/employee-options";
import { getMenu } from "@/api/navigation/get_menu";
import { HomeDashboard } from "@/components/home/HomeDashboard";
import { MainShell } from "@/components/layout/MainShell";
import { auth } from "@/server/auth";

export default async function RootPage() {
  const session = await auth();
  const loginEmail = session?.user?.email ?? null;
  const [menu, employees, loginEmployee] = await Promise.all([
    getMenu(),
    queryEmployeeOptions(),
    queryEmployeeByLoginEmail(loginEmail),
  ]);

  return (
    <MainShell menu={menu} employees={employees} loginEmployee={loginEmployee}>
      <main className="container-fluid py-4">
        <HomeDashboard />
      </main>
    </MainShell>
  );
}
