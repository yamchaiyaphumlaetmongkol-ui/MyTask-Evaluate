import {
  queryPeMasters,
  queryTemplateFormInitial,
} from "@/api/pe/pems01/_queries";
import { BackLink } from "@/components/shared/BackLink";
import { EvaluationTemplateForm } from "@/components/pe/template-form/EvaluationTemplateForm";
import { PageContent } from "@/components/layout/PageContent";

type Props = {
  searchParams: Promise<{ templateId?: string }>;
};

export default async function Pems01FormPage({ searchParams }: Props) {
  const { templateId } = await searchParams;
  const mode = templateId ? "edit" : "new";

  let initialState: Awaited<ReturnType<typeof queryTemplateFormInitial>> = {
    templateName: "",
    evaluationPeriod: "H1",
    startDate: "",
    endDate: "",
    heads: [],
  };
  let masters: Awaited<ReturnType<typeof queryPeMasters>> = {
    roles: [],
    positions: [],
  };
  let loadError: string | null = null;

  try {
    [initialState, masters] = await Promise.all([
      queryTemplateFormInitial(templateId),
      queryPeMasters(),
    ]);
    if (templateId && !initialState.templateId) {
      loadError = "ไม่พบรอบประเมินที่ต้องการแก้ไข";
    }
  } catch (e) {
    console.error("Pems01FormPage", e);
    loadError = "ไม่สามารถโหลดข้อมูลได้ — รัน script/sql/05_upgrade_pe_evaluation_template.sql แล้ว prisma db push";
  }

  if (!templateId) {
    return (
      <PageContent>
        <div className="alert alert-info">
          สร้างรอบใหม่จากแม่แบบ — เลือกแม่แบบแล้วกด &quot;เปิดรอบประเมินใหม่&quot;
        </div>
        <BackLink href="/pe/pems01/masters">ไปที่แม่แบบแบบประเมิน</BackLink>
      </PageContent>
    );
  }

  if (loadError) {
    return (
      <PageContent>
        <div className="alert alert-danger">{loadError}</div>
        <BackLink href="/pe/pems01">กลับรายการ</BackLink>
      </PageContent>
    );
  }

  return (
    <PageContent>
      <div className="mb-3">
        <BackLink href="/pe/pems01">กลับรายการแบบประเมิน</BackLink>
      </div>
      <EvaluationTemplateForm
        initialState={initialState}
        masters={masters}
        mode={mode}
      />
    </PageContent>
  );
}
