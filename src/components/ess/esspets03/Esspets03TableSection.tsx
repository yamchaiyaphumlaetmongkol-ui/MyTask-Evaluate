import { queryEvaluationStatusTemplateList } from "@/api/ess/esspets03/_queries";
import { ErpAlert } from "@/components/erp";
import { Esspets03TemplateTable } from "@/components/ess/tables/Esspets03TemplateTable";
import type { RoundListFilter } from "@/lib/round-list-filter";

type Props = {
  viewerCode: string;
  filter: RoundListFilter;
};

export async function Esspets03TableSection({ viewerCode, filter }: Props) {
  try {
    const rows = await queryEvaluationStatusTemplateList(viewerCode, filter);
    return (
      <Esspets03TemplateTable
        rows={rows}
        filter={filter}
        viewerCode={viewerCode}
      />
    );
  } catch (e) {
    console.error("Esspets03TableSection", e);
    return <ErpAlert>ไม่สามารถโหลดรายการสถานะการประเมินได้</ErpAlert>;
  }
}
