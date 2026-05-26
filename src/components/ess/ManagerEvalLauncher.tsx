"use client";

import type { ManagerEvalSession } from "@/api/ess/esspets04/types";
import { ManagerEvalWizard } from "@/components/ess/ManagerEvalWizard";
import { listHref } from "@/components/ess/tables/Esspets04QueueTable";
import type { ManagerEvalQueueFilter } from "@/lib/manager-eval-queue-filter";
import Link from "next/link";

type Props = {
  session: ManagerEvalSession;
  managerCode: string;
  filter: ManagerEvalQueueFilter;
};

export function ManagerEvalLauncher({ session, managerCode, filter }: Props) {
  return (
    <>
      <div className="mb-3 d-flex flex-wrap gap-2 align-items-center">
        <span className="small text-muted">
          ผู้ประเมิน: {session.managerName} · ผู้ถูกประเมิน:{" "}
          {session.employeeName}
          {session.positionName ? ` · ${session.positionName}` : ""} ·{" "}
          {session.templateName}
        </span>
        <Link
          href={listHref(managerCode, filter)}
          className="btn btn-outline-secondary btn-sm"
        >
          กลับรายการ
        </Link>
      </div>
      <ManagerEvalWizard session={session} />
    </>
  );
}
