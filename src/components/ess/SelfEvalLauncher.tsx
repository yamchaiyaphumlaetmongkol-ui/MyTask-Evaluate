"use client";

import type { SelfEvalSession, TemplateOption } from "@/api/ess/esspets02/types";
import { ErpAlert, ErpPageIntro, ErpPageTitle, ErpPanel } from "@/components/erp";
import { SelfEvalWizard } from "@/components/ess/SelfEvalWizard";
import { BackLink } from "@/components/shared/BackLink";
import { SearchableSingleSelect } from "@/components/shared/SearchableSingleSelect";
import { useStoreHydrated } from "@/hooks/useStoreHydrated";
import { useCurrentUserStore } from "@/store/currentUserStore";
import Link from "next/link";
import { useMemo, useState } from "react";

type Props = {
  templates: TemplateOption[];
  session: SelfEvalSession | null;
  templateId: string;
  employeeCode: string;
};

export function SelfEvalLauncher({
  templates,
  session,
  templateId: initialTemplateId,
  employeeCode: initialEmployeeCode,
}: Props) {
  const hydrated = useStoreHydrated();
  const currentUserCode = useCurrentUserStore((s) => s.employeeCode);
  const currentUserName = useCurrentUserStore((s) => s.employeeName);
  const [templateId, setTemplateId] = useState(initialTemplateId);

  const employeeCode = hydrated
    ? (currentUserCode ?? "")
    : initialEmployeeCode;

  const templateOptions = useMemo(
    () =>
      templates.map((t) => ({
        value: t.id,
        label: t.name,
      })),
    [templates],
  );

  const startHref = `/ess/esspets02?templateId=${encodeURIComponent(templateId)}&employeeCode=${encodeURIComponent(employeeCode)}`;

  if (session) {
    return (
      <>
        <div className="mb-3 d-flex flex-wrap gap-2 align-items-center justify-content-between">
          <span className="small text-muted">
            {session.employeeName}
            {session.positionName ? ` · ${session.positionName}` : ""} ·{" "}
            {session.templateName}
          </span>
          <BackLink href="/ess/esspets01">เปลี่ยนแบบประเมิน</BackLink>
        </div>
        <SelfEvalWizard session={session} />
      </>
    );
  }

  return (
    <>
      <div className="mb-3">
        <BackLink href="/ess/esspets01">กลับเลือกแบบประเมิน</BackLink>
      </div>
      <ErpPageTitle>ประเมินตนเอง</ErpPageTitle>

      {hydrated && !currentUserCode && (
        <ErpAlert variant="warning">กรุณาเลือกผู้ใช้งานก่อนเริ่มประเมิน</ErpAlert>
      )}

      {currentUserCode && (
        <ErpPageIntro>
          ผู้ประเมิน: <span className="fw-semibold text-dark">{currentUserName}</span> (
          {currentUserCode})
        </ErpPageIntro>
      )}

      <ErpPanel className="mb-4">
        <div className="row g-3">
          <div className="col-md-6">
            <SearchableSingleSelect
              id="esspets02-template"
              label="แบบประเมิน"
              options={templateOptions}
              value={templateId}
              onChange={setTemplateId}
              emptyLabel="— เลือกแบบประเมิน —"
              searchPlaceholder="ค้นหาแบบประเมิน..."
            />
          </div>
        </div>
        <Link
          href={startHref}
          className={`btn btn-success mt-3 ${!templateId || !employeeCode ? "disabled" : ""}`}
          aria-disabled={!templateId || !employeeCode}
        >
          เริ่มประเมิน
        </Link>
      </ErpPanel>
    </>
  );
}
