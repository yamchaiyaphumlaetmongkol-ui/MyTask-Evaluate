import { queryRoundListFilterOptions } from "@/api/_shared/round-filter-options";
import {
  querySelfEvalSession,
  queryTemplateOptionById,
} from "@/api/ess/esspets02/_queries";
import { Esspets02ListClient } from "@/components/ess/esspets02/Esspets02ListClient";
import { SelfEvalLauncher } from "@/components/ess/SelfEvalLauncher";
import { SelfEvalShareGate } from "@/components/ess/SelfEvalShareGate";
import { PageContent } from "@/components/layout/PageContent";

type Props = {
  searchParams: Promise<Record<string, string | undefined>>;
};

export default async function Esspets02Page({ searchParams }: Props) {
  const params = await searchParams;
  const {
    templateId = "",
    employeeCode = "",
    share = "",
  } = params;

  const isShare = share === "1";
  const shareOnlyTemplate = isShare && templateId && !employeeCode;

  const [session, filterOptions] = await Promise.all([
    templateId && employeeCode
      ? querySelfEvalSession(templateId, employeeCode)
      : Promise.resolve(null),
    shareOnlyTemplate
      ? Promise.resolve({ rounds: [], masters: [], years: [] })
      : queryRoundListFilterOptions(),
  ]);

  const shareTemplate = shareOnlyTemplate
    ? await queryTemplateOptionById(templateId)
    : null;

  return (
    <PageContent>
      {shareOnlyTemplate && shareTemplate ? (
        <SelfEvalShareGate template={shareTemplate} />
      ) : (
        <>
          {!session && (
            <Esspets02ListClient
              filterOptions={filterOptions}
              templateId={templateId}
              employeeCode={employeeCode}
            />
          )}
          {session ? (
            <SelfEvalLauncher
              templates={[]}
              session={session}
              templateId={templateId}
              employeeCode={employeeCode}
            />
          ) : null}
        </>
      )}
    </PageContent>
  );
}
