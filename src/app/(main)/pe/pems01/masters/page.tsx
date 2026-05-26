import { queryMasterBlueprintList } from "@/api/pe/pems01/_queries";
import { ErpAlert, ErpPageTitle } from "@/components/erp";
import { PageContent } from "@/components/layout/PageContent";
import { Pems01MasterTable } from "@/components/pe/tables/Pems01MasterTable";
import Link from "next/link";

export default async function Pems01MastersPage() {
  let rows: Awaited<ReturnType<typeof queryMasterBlueprintList>> = [];
  let loadError: string | null = null;

  try {
    rows = await queryMasterBlueprintList();
  } catch (e) {
    console.error("Pems01MastersPage", e);
    loadError = "ไม่สามารถโหลดรายการแม่แบบได้";
  }

  return (
    <PageContent>
      <div className="d-flex flex-wrap justify-content-between align-items-center gap-2 mb-4">
        <ErpPageTitle className="mb-0">แม่แบบแบบประเมิน</ErpPageTitle>
        <div className="d-flex flex-wrap gap-2">
          <Link href="/pe/pems01" className="btn btn-outline-secondary btn-lg">
            รอบประเมิน
          </Link>
          <Link href="/pe/pems01/master/form" className="btn btn-success btn-lg">
            + สร้างแม่แบบ
          </Link>
        </div>
      </div>

      <p className="text-muted small mb-3">
        แม่แบบคือโครงสร้างคำถามและสิทธิ์ — เมื่อเปิดรอบใหม่ ระบบจะ snapshot ไปตารางรอบ
        ผลประเมิน ESS อ้างอิงรอบ (roundId) ไม่ใช่แม่แบบโดยตรง
      </p>

      {loadError ? (
        <ErpAlert>{loadError}</ErpAlert>
      ) : (
        <Pems01MasterTable rows={rows} />
      )}
    </PageContent>
  );
}
