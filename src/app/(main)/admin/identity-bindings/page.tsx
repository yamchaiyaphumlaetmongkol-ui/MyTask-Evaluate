import { queryIdentityBindings, getMyIdentityBinding } from "@/api/identity/binding";
import { queryEmployeeOptions } from "@/api/_shared/employee-options";
import { PageContent } from "@/components/layout/PageContent";
import { IdentityBindingsAdminPanel } from "@/components/admin/IdentityBindingsAdminPanel";

export default async function IdentityBindingsAdminPage() {
  const [identityRes, rows, employees] = await Promise.all([
    getMyIdentityBinding(),
    queryIdentityBindings(),
    queryEmployeeOptions(),
  ]);

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

  return (
    <PageContent>
      <IdentityBindingsAdminPanel rows={rows} employees={employees} />
    </PageContent>
  );
}
