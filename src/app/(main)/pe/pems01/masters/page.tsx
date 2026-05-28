import { PageContent } from "@/components/layout/PageContent";
import Link from "next/link";

export default async function Pems01MastersPage() {
  return (
    <PageContent>
      <div className="alert alert-info">
        ระบบแม่แบบถูกยกเลิกจากการใช้งานหลักแล้ว ให้จัดการที่หน้ารอบประเมินโดยตรง
      </div>
      <Link href="/pe/pems01" className="btn btn-success">
        ไปหน้ารอบประเมิน
      </Link>
    </PageContent>
  );
}
