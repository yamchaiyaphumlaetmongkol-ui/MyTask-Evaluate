import { queryTemplateOptions } from "@/api/ess/esspets02/_queries";
import { ErpAlert } from "@/components/erp";
import { SelfEvalLauncher } from "@/components/ess/SelfEvalLauncher";
import type { RoundListFilter } from "@/lib/round-list-filter";

type Props = {
  filter: RoundListFilter;
  templateId: string;
  employeeCode: string;
};

/** รายการแบบประเมินหลังค้นหา — โหลดแยกจากฟอร์มค้นหา */
export async function Esspets02TemplatesSection({
  filter,
  templateId,
  employeeCode,
}: Props) {
  try {
    const templates = await queryTemplateOptions(filter);
    return (
      <SelfEvalLauncher
        templates={templates}
        session={null}
        templateId={templateId}
        employeeCode={employeeCode}
      />
    );
  } catch (e) {
    console.error("Esspets02TemplatesSection", e);
    return <ErpAlert>ไม่สามารถโหลดรายการแบบประเมินได้</ErpAlert>;
  }
}
