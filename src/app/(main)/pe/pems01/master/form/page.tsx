import {
  queryMasterFormInitial,
  queryPeMasters,
} from "@/api/pe/pems01/_queries";
import { emptyTopicPermission } from "@/api/pe/pems01/types";
import { BackLink } from "@/components/shared/BackLink";
import { MasterBlueprintForm } from "@/components/pe/template-form/MasterBlueprintForm";
import { PageContent } from "@/components/layout/PageContent";

type Props = {
  searchParams: Promise<{ masterId?: string }>;
};

export default async function Pems01MasterFormPage({ searchParams }: Props) {
  const { masterId } = await searchParams;
  const mode = masterId ? "edit" : "new";

  let initialState: Awaited<ReturnType<typeof queryMasterFormInitial>> = {
    masterName: "",
    description: "",
    permissions: emptyTopicPermission(),
    heads: [],
  };
  let masters: Awaited<ReturnType<typeof queryPeMasters>> = {
    roles: [],
    positions: [],
  };
  let loadError: string | null = null;

  try {
    [initialState, masters] = await Promise.all([
      queryMasterFormInitial(masterId),
      queryPeMasters(),
    ]);
    if (masterId && !initialState.masterId) {
      loadError = "ไม่พบแม่แบบที่ต้องการแก้ไข";
    }
  } catch (e) {
    console.error("Pems01MasterFormPage", e);
    loadError =
      "ไม่สามารถโหลดข้อมูลได้ — รัน script/sql/13_upgrade_master_round.sql แล้ว npx prisma generate";
  }

  if (loadError) {
    return (
      <PageContent>
        <div className="alert alert-danger">{loadError}</div>
        <BackLink href="/pe/pems01/masters">กลับรายการแม่แบบ</BackLink>
      </PageContent>
    );
  }

  return (
    <PageContent>
      <div className="mb-3">
        <BackLink href="/pe/pems01/masters">กลับรายการแม่แบบ</BackLink>
      </div>
      <MasterBlueprintForm
        initialState={initialState}
        masters={masters}
        mode={mode}
      />
    </PageContent>
  );
}
