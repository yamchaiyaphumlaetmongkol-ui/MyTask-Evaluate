import { queryRoundListFilterOptions } from "@/api/_shared/round-filter-options";
import { ErpAlert, ErpPageTitle } from "@/components/erp";
import { Esspets01PageClient } from "@/components/ess/esspets01/Esspets01PageClient";
import { PageContent } from "@/components/layout/PageContent";

export default async function Esspets01Page() {
  let filterOptions: Awaited<
    ReturnType<typeof queryRoundListFilterOptions>
  > = { rounds: [], masters: [], years: [] };
  let optionsError: string | null = null;

  try {
    filterOptions = await queryRoundListFilterOptions();
  } catch (e) {
    console.error("Esspets01Page options", e);
    optionsError = "ไม่สามารถโหลดตัวเลือกค้นหาได้";
  }

  return (
    <PageContent>
      <ErpPageTitle>ค้นหาแบบประเมินตนเอง</ErpPageTitle>

      {optionsError ? (
        <ErpAlert>{optionsError}</ErpAlert>
      ) : (
        <Esspets01PageClient filterOptions={filterOptions} />
      )}
    </PageContent>
  );
}
