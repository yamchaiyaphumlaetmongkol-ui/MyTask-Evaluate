"use client";

import { saveManagerEvalResult } from "@/api/ess/esspets04/save_manager_result";
import type { ManagerEvalSession } from "@/api/ess/esspets04/types";
import { EvalWizard } from "@/components/ess/EvalWizard";

type Props = {
  session: ManagerEvalSession;
};

export function ManagerEvalWizard({ session }: Props) {
  return (
    <EvalWizard
      mode="manager"
      employeeCode={session.employeeCode}
      employeeName={session.employeeName}
      templateName={session.templateName}
      steps={session.steps}
      scoreLabel="คะแนน (manager)"
      detailLabel="รายละเอียด (manager)"
      doneMessage="ประเมินพนักงานครบทุกหัวข้อย่อยแล้ว"
      onSave={async ({ subId, employeeCode, score, detail }) => {
        const res = await saveManagerEvalResult({
          subId,
          employeeCode,
          managerCode: session.managerCode,
          managerScore: score,
          managerDetail: detail,
        });
        return res.ok ? { ok: true } : { ok: false, error: res.error };
      }}
    />
  );
}
