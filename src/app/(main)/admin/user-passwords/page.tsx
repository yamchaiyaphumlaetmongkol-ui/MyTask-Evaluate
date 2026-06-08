import { queryAuthUsersForAdmin } from "@/api/auth/_queries";
import { getMyIdentityBinding } from "@/api/identity/binding";
import { UserPasswordsAdminPanel } from "@/components/admin/UserPasswordsAdminPanel";
import { PageContent } from "@/components/layout/PageContent";

export default async function UserPasswordsAdminPage() {
  const identityRes = await getMyIdentityBinding();

  if (!identityRes.ok) {
    return (
      <PageContent>
        <div className="alert alert-danger">{identityRes.error}</div>
      </PageContent>
    );
  }

  if (!identityRes.data.isAdmin) {
    return (
      <PageContent>
        <div className="alert alert-danger">คุณไม่มีสิทธิ์ทำรายการนี้</div>
      </PageContent>
    );
  }

  let rows: Awaited<ReturnType<typeof queryAuthUsersForAdmin>> = [];
  let loadError: string | null = null;

  try {
    rows = await queryAuthUsersForAdmin();
  } catch (e) {
    console.error("UserPasswordsAdminPage", e);
    loadError = "โหลดรายการผู้ใช้ไม่สำเร็จ";
  }

  return (
    <PageContent>
      {loadError ? (
        <div className="alert alert-danger">{loadError}</div>
      ) : (
        <UserPasswordsAdminPanel rows={rows} />
      )}
    </PageContent>
  );
}
