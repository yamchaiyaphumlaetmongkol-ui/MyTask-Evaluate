import { getMyIdentityBinding } from "@/api/identity/binding";
import { queryEmployeeOptions } from "@/api/_shared/employee-options";
import { PageContent } from "@/components/layout/PageContent";
import { ProfileBindingCard } from "@/components/profile/ProfileBindingCard";

export default async function ProfilePage() {
  const [identityRes, employees] = await Promise.all([
    getMyIdentityBinding(),
    queryEmployeeOptions(),
  ]);

  if (!identityRes.ok) {
    return (
      <PageContent>
        <div className="alert alert-danger">{identityRes.error}</div>
      </PageContent>
    );
  }

  return (
    <PageContent>
      <ProfileBindingCard
        binding={
          identityRes.data.binding
            ? {
                id: identityRes.data.binding.id,
                employeeId: identityRes.data.binding.employeeId,
                employeeCode: identityRes.data.binding.employeeCode,
                employeeName: identityRes.data.binding.employeeName,
              }
            : null
        }
        employees={employees}
      />
    </PageContent>
  );
}
