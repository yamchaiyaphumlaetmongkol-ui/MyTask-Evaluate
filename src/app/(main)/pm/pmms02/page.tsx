import { queryRoles } from "@/api/pm/pmms02/_queries";
import { RoleFormSection } from "@/components/pm/RoleFormSection";
import { PageContent } from "@/components/layout/PageContent";

export default async function Pmms02Page() {
  const rows = await queryRoles();
  return (
    <PageContent>
      <RoleFormSection rows={rows} />
    </PageContent>
  );
}
