import { queryEmployeeOptions } from "@/api/_shared/employee-options";
import { getMenu } from "@/api/navigation/get_menu";
import { HomeDashboard } from "@/components/home/HomeDashboard";
import { MainShell } from "@/components/layout/MainShell";

export default async function RootPage() {
  const [menu, employees] = await Promise.all([getMenu(), queryEmployeeOptions()]);

  return (
    <MainShell menu={menu} employees={employees}>
      <main className="container-fluid py-4">
        <HomeDashboard />
      </main>
    </MainShell>
  );
}
