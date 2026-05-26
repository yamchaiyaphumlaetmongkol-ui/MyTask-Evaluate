import { queryRoundListFilterOptions } from "@/api/_shared/round-filter-options";
import { buildManagerEvalFilterOptions } from "@/api/ess/esspets04/filter-options";
import {
  queryManagerEvalQueueList,
  queryManagerEvalSession,
} from "@/api/ess/esspets04/_queries";
import type { ManagerEvalFilterOptions } from "@/api/ess/esspets04/types";
import { ErpAlert, ErpPageTitle } from "@/components/erp";
import { Esspets04ListClient } from "@/components/ess/esspets04/Esspets04ListClient";
import { ManagerEvalLauncher } from "@/components/ess/ManagerEvalLauncher";
import { PageContent } from "@/components/layout/PageContent";
import { parseManagerEvalQueueFilter } from "@/lib/manager-eval-queue-filter";

type Props = {
  searchParams: Promise<Record<string, string | undefined>>;
};

export default async function Esspets04Page({ searchParams }: Props) {
  const params = await searchParams;
  const {
    managerCode = "",
    employeeCode = "",
    templateId = "",
  } = params;
  const filter = parseManagerEvalQueueFilter(params);
  const manager = managerCode.trim();
  const employee = employeeCode.trim();
  const roundId = (filter.roundId ?? templateId).trim();

  let loadError: string | null = null;
  let session: Awaited<ReturnType<typeof queryManagerEvalSession>> = null;
  let filterOptions: ManagerEvalFilterOptions = {
    rounds: [],
    masters: [],
    years: [],
    employees: [],
  };

  try {
    if (manager) {
      const [allRows, roundOpts] = await Promise.all([
        queryManagerEvalQueueList(manager, {}),
        queryRoundListFilterOptions(),
      ]);
      filterOptions = buildManagerEvalFilterOptions(allRows, roundOpts);
    }
    if (manager && employee && roundId) {
      session = await queryManagerEvalSession(roundId, employee, manager);
      if (!session) {
        loadError =
          "ไม่พบแบบประเมิน พนักงานยังไม่ประเมินตนเอง หรือไม่มีสิทธิ์ประเมิน";
      }
    }
  } catch (e) {
    console.error("Esspets04Page", e);
    loadError = "โหลดข้อมูลไม่สำเร็จ";
  }

  return (
    <PageContent>
      {loadError ? <ErpAlert>{loadError}</ErpAlert> : null}

      {session ? (
        <ManagerEvalLauncher
          session={session}
          managerCode={manager}
          filter={filter}
        />
      ) : (
        <>
          <ErpPageTitle>ค้นหาแบบประเมินพนักงาน</ErpPageTitle>
          <Esspets04ListClient
            managerCode={manager}
            filterOptions={filterOptions}
          />
        </>
      )}
    </PageContent>
  );
}
