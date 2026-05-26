import { queryEmployees } from "@/api/pm/pmms01/_queries";
import { PmEmployeeListSection } from "@/components/pm/PmEmployeeListSection";
import { PageContent } from "@/components/layout/PageContent";

export default async function Pmms01Page() {
  let rows: Awaited<ReturnType<typeof queryEmployees>> = [];
  let loadError: string | null = null;

  try {
    rows = await queryEmployees();
  } catch (e) {
    console.error("Pmms01Page", e);
    loadError =
      "ไม่สามารถโหลดรายชื่อพนักงานได้ — รัน script/sql/07_upgrade_pm_employee_clickup.sql";
  }

  return (
    <PageContent>
      {loadError && (
        <div className="alert alert-danger py-2">{loadError}</div>
      )}
      {!loadError && <PmEmployeeListSection rows={rows} />}
    </PageContent>
  );
}
