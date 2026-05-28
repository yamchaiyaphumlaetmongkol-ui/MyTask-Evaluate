import { queryRoundListFilterOptions } from "@/api/_shared/round-filter-options";
import { queryEvaluationStatusTemplateDetail } from "@/api/ess/esspets03/_queries";
import { Esspets03DetailPanel } from "@/components/ess/Esspets03DetailPanel";
import { Esspets03SearchForm } from "@/components/ess/Esspets03SearchForm";
import { Esspets03ViewerSync } from "@/components/ess/Esspets03ViewerSync";
import { Esspets03TableSection } from "@/components/ess/esspets03/Esspets03TableSection";
import { ErpAlert, ErpPageTitle, ErpTableSkeleton } from "@/components/erp";
import { PageContent } from "@/components/layout/PageContent";
import { buildFilterQuery } from "@/lib/build-filter-query";
import { roundListFilterSearchKey } from "@/lib/filter-search-key";
import { parseRoundListSearchParams } from "@/lib/parse-round-list-search-params";
import { Suspense } from "react";

type Props = {
  searchParams: Promise<Record<string, string | undefined>>;
};

function listBackHref(
  viewerCode: string,
  filter: ReturnType<typeof parseRoundListSearchParams>,
) {
  return `/ess/esspets03${buildFilterQuery({ viewerCode, ...filter })}`;
}

export default async function Esspets03Page({ searchParams }: Props) {
  const params = await searchParams;
  const {
    templateId = "",
    employeeCode = "",
    viewerCode = "",
  } = params;
  const filter = parseRoundListSearchParams(params);
  const viewer = viewerCode.trim();
  const isDetail = Boolean(templateId && employeeCode && viewer);
  const backHref = viewer ? listBackHref(viewer, filter) : "/ess/esspets03";

  let loadError: string | null = null;
  let detail: Awaited<
    ReturnType<typeof queryEvaluationStatusTemplateDetail>
  > = null;
  let filterOptions: Awaited<
    ReturnType<typeof queryRoundListFilterOptions>
  > = { rounds: [], masters: [], years: [] };

  try {
    if (isDetail) {
      detail = await queryEvaluationStatusTemplateDetail(
        templateId,
        employeeCode,
        viewer,
      );
      if (!detail) {
        loadError =
          "ไม่พบข้อมูล หรือคุณไม่มีสิทธิ์ดูสถานะแบบประเมินนี้";
      }
    } else if (templateId && (!employeeCode || !viewer)) {
      loadError =
        "กรุณาเลือกพนักงานและผู้ดูจากแถบด้านซ้ายแล้วเปิดรายละเอียดอีกครั้ง";
    } else if (viewer) {
      filterOptions = await queryRoundListFilterOptions();
    }
  } catch (e) {
    console.error("Esspets03Page", e);
    loadError = "ไม่สามารถโหลดสถานะการประเมินได้";
  }

  const tableKey = roundListFilterSearchKey(filter, { viewerCode: viewer });

  return (
    <PageContent>
      <Esspets03ViewerSync viewerCode={viewer} filter={filter} />

      <ErpPageTitle>ค้นหาและติดตามสถานะการประเมิน</ErpPageTitle>

      {loadError ? <ErpAlert>{loadError}</ErpAlert> : null}

      {isDetail && detail ? (
        <Esspets03DetailPanel
          detail={detail}
          backHref={backHref}
          viewerCode={viewer}
        />
      ) : !isDetail && !loadError ? (
        <>
          <Esspets03SearchForm
            filter={filter}
            options={filterOptions}
            viewerCode={viewer}
          />
          {viewer ? (
            <Suspense
              key={tableKey}
              fallback={<ErpTableSkeleton columns={7} />}
            >
              <Esspets03TableSection viewerCode={viewer} filter={filter} />
            </Suspense>
          ) : null}
        </>
      ) : null}
    </PageContent>
  );
}
