import { queryPositions } from "@/api/pm/pmms03/_queries";
import { PositionFormSection } from "@/components/pm/PositionFormSection";
import { PageContent } from "@/components/layout/PageContent";

export default async function Pmms03Page() {
  const rows = await queryPositions();
  return (
    <PageContent>
      <PositionFormSection rows={rows} />
    </PageContent>
  );
}
