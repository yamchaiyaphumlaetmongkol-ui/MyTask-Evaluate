import {
  ErpPageIntro,
  ErpPageTitle,
  ErpPanel,
} from "@/components/erp";

type Props = {
  username: string;
  isAdmin: boolean;
  employeeName: string | null;
  employeeCode: string | null;
  clickupEmail: string | null;
};

export function ProfileBindingCard({
  username,
  isAdmin,
  employeeName,
  employeeCode,
  clickupEmail,
}: Props) {
  return (
    <ErpPanel>
      <ErpPageTitle>โปรไฟล์การผูกตัวตน</ErpPageTitle>
      <ErpPageIntro>
        {isAdmin ? " (ผู้ดูแลระบบจัดการผ่านหน้า admin)" : ""}
      </ErpPageIntro>

      <dl className="row mb-0 small">
        <dt className="col-sm-4 text-muted">ชื่อผู้ใช้ (อีเมล)</dt>
        <dd className="col-sm-8">{username}</dd>

        {clickupEmail && clickupEmail !== username ? (
          <>
            <dt className="col-sm-4 text-muted">อีเมล ClickUp</dt>
            <dd className="col-sm-8">{clickupEmail}</dd>
          </>
        ) : null}

        <dt className="col-sm-4 text-muted">บทบาท</dt>
        <dd className="col-sm-8">
          {isAdmin ? (
            <span className="badge text-bg-secondary">ผู้ดูแลระบบ</span>
          ) : (
            <span className="badge text-bg-light border">ผู้ใช้งาน</span>
          )}
        </dd>

        <dt className="col-sm-4 text-muted">พนักงานที่ผูก</dt>
        <dd className="col-sm-8">
          {isAdmin && !employeeName ? (
            <span className="text-muted">— (บัญชี admin ไม่ผูกพนักงาน )</span>
          ) : employeeName ? (
            <>
              {employeeName}
              {employeeCode ? (
                <span className="text-muted ms-1">({employeeCode})</span>
              ) : (
                <span className="text-muted ms-1">(ยังไม่มีรหัสพนักงาน)</span>
              )}
            </>
          ) : (
            <span className="text-warning">
              ไม่พบพนักงานที่ตรงกับอีเมลนี้ — ติดต่อผู้ดูแลระบบ
            </span>
          )}
        </dd>
      </dl>
    </ErpPanel>
  );
}
