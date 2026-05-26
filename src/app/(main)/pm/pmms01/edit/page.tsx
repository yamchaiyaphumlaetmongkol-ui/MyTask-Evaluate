import { queryEmployeeForEdit } from "@/api/pm/pmms01/_queries";
import { PmEmployeeEditForm } from "@/components/pm/PmEmployeeEditForm";
import { BackLink } from "@/components/shared/BackLink";
import { PageContent } from "@/components/layout/PageContent";

type Props = {
  searchParams: Promise<{ id?: string }>;
};

export default async function Pmms01EditPage({ searchParams }: Props) {
  const { id = "" } = await searchParams;

  if (!id) {
    return (
      <PageContent>
        <div className="alert alert-warning">ไม่ระบุรหัสอ้างอิงพนักงาน</div>
        <BackLink href="/pm/pmms01">กลับรายการ</BackLink>
      </PageContent>
    );
  }

  let data: Awaited<ReturnType<typeof queryEmployeeForEdit>> = null;
  let loadError: string | null = null;

  try {
    data = await queryEmployeeForEdit(id);
    if (!data) loadError = "ไม่พบพนักงาน";
  } catch (e) {
    console.error("Pmms01EditPage", e);
    loadError = "โหลดข้อมูลไม่สำเร็จ";
  }

  if (loadError || !data) {
    return (
      <PageContent>
        <div className="alert alert-danger">{loadError}</div>
        <BackLink href="/pm/pmms01">กลับรายการ</BackLink>
      </PageContent>
    );
  }

  return (
    <PageContent>
      <PmEmployeeEditForm data={data} />
    </PageContent>
  );
}
