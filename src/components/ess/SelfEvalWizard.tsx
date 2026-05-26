"use client";

import { saveSelfEvalResult } from "@/api/ess/esspets02/save_self_result";
import type { SelfEvalSession } from "@/api/ess/esspets02/types";
import { EvalWizard } from "@/components/ess/EvalWizard";

type Props = {
  session: SelfEvalSession;
};

export function SelfEvalWizard({ session }: Props) {
  return (
    <EvalWizard
      mode="self"
      employeeCode={session.employeeCode}
      employeeName={session.employeeName}
      templateName={session.templateName}
      steps={session.steps}
      scoreLabel="คะแนน (ประเมินตนเอง)"
      detailLabel="รายละเอียด (ประเมินตนเอง)"
      doneMessage="ประเมินตนเองครบทุกหัวข้อย่อยแล้ว"
      onSave={async ({ subId, employeeCode, score, detail }) => {
        const res = await saveSelfEvalResult({
          subId,
          employeeCode,
          selfScore: score,
          selfDetail: detail,
        });
        return res.ok
          ? { ok: true }
          : { ok: false, error: res.error };
      }}
    />
  );
}
