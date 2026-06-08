import { PageContent } from "@/components/layout/PageContent";
import { ProfileBindingCard } from "@/components/profile/ProfileBindingCard";
import { getCurrentUser } from "@/lib/auth/get-current-user";
import { redirect } from "next/navigation";

export default async function ProfilePage() {
  const user = await getCurrentUser();
  if (!user) redirect("/auth/login");

  return (
    <PageContent>
      <ProfileBindingCard
        username={user.username}
        isAdmin={user.isAdmin}
        employeeName={user.employeeName}
        employeeCode={user.employeeCode}
        clickupEmail={user.clickupEmail}
      />
    </PageContent>
  );
}
