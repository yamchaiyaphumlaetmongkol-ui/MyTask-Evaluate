import { queryRoundListFilterOptions } from "@/api/_shared/round-filter-options";
import { ErpAlert, ErpPageTitle } from "@/components/erp";
import { Pems01PageClient } from "@/components/pe/pems01/Pems01PageClient";
import { PageContent } from "@/components/layout/PageContent";
import Link from "next/link";

export default async function Pems01Page() {
  let filterOptions: Awaited<
    ReturnType<typeof queryRoundListFilterOptions>
  > = { rounds: [], masters: [], years: [] };
  let optionsError: string | null = null;

  try {
    filterOptions = await queryRoundListFilterOptions();
  } catch (e) {
    console.error("Pems01Page options", e);
    optionsError = "ไม่สามารถโหลดตัวเลือกค้นหาได้";
  }

  return (
    <PageContent>
      <div className="d-flex flex-wrap justify-content-between align-items-center gap-2 mb-4">
        <ErpPageTitle className="mb-0">รอบประเมิน</ErpPageTitle>
        <div className="d-flex flex-wrap gap-2">
          <Link href="/pe/pems01/masters" className="btn btn-outline-primary btn-lg">
            แม่แบบแบบประเมิน
          </Link>
        </div>
      </div>

      {optionsError ? (
        <ErpAlert>{optionsError}</ErpAlert>
      ) : (
        <Pems01PageClient filterOptions={filterOptions} />
      )}
    </PageContent>
  );
}
