"use client";

import { exportEsspets03EvaluationExcel } from "@/api/ess/esspets03/export_evaluation_excel";
import type { EvaluationStatusTemplateDetail } from "@/api/ess/esspets03/types";
import type { ReactNode } from "react";
import { useState } from "react";
import { Esspets03MatrixTable } from "@/components/ess/tables/Esspets03MatrixTable";
import { BackLink } from "@/components/shared/BackLink";
import { formatEvaluationPeriod } from "@/lib/evaluation-period";
import { formatThaiDate } from "@/lib/format-datetime";

type Props = {
  detail: EvaluationStatusTemplateDetail;
  backHref: string;
  viewerCode: string;
};

function MetaItem({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <div className="erp-esspets03-detail__meta-item">
      <p className="erp-esspets03-detail__meta-label">{label}</p>
      <p className="erp-esspets03-detail__meta-value">{children}</p>
    </div>
  );
}

export function Esspets03DetailPanel({ detail, backHref, viewerCode }: Props) {
  const [exporting, setExporting] = useState(false);
  const canExport = detail.heads
    .flatMap((h) => h.subs)
    .every((s) => s.managerScore != null);
  return (
    <div className="erp-esspets03-detail">
      <div className="erp-esspets03-detail__actions">
        <BackLink href={backHref} className="erp-esspets03-detail__back">
          กลับรายการแบบประเมิน
        </BackLink>
        <button
          type="button"
          className="btn btn-success btn-sm erp-esspets03-detail__export-btn"
          disabled={exporting || !canExport}
          title={
            canExport
              ? undefined
              : "ยัง export ไม่ได้จนกว่าผลประเมินผู้จัดการจะครบทุกหัวข้อ"
          }
          onClick={async () => {
            setExporting(true);
            const res = await exportEsspets03EvaluationExcel({
              templateId: detail.templateId,
              employeeCode: detail.employeeCode,
              viewerCode,
            });
            setExporting(false);
            if (!res.ok) {
              alert(res.error);
              return;
            }
            const bytes = Uint8Array.from(atob(res.data.base64), (c) =>
              c.charCodeAt(0),
            );
            const blob = new Blob([bytes], { type: res.data.mimeType });
            const url = URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = res.data.fileName;
            a.click();
            URL.revokeObjectURL(url);
          }}
        >
          <i className="bi bi-file-earmark-spreadsheet me-1" />
          {exporting ? "..." : "Export Excel"}
        </button>
      </div>

      <div className="erp-esspets03-detail__summary">
        <div className="erp-esspets03-detail__meta-col">
          <MetaItem label="พนักงาน">
            {detail.employeeName}{" "}
            <span className="text-muted fw-normal">({detail.employeeCode})</span>
          </MetaItem>
          <MetaItem label="ถูกประเมินโดย">
            {detail.evaluatedByName ? (
              <>
                {detail.evaluatedByName}{" "}
                <span className="text-muted fw-normal">
                  ({detail.evaluatedByCode})
                </span>
              </>
            ) : (
              <span className="text-muted fw-normal">ยังไม่มีผู้ประเมิน</span>
            )}
          </MetaItem>
          <MetaItem label="ช่วงประเมิน">
            {formatEvaluationPeriod(detail.evaluationPeriod)}
          </MetaItem>
        </div>
        <div className="erp-esspets03-detail__meta-col">
          <MetaItem label="แบบประเมิน">{detail.templateName}</MetaItem>
          <MetaItem label="วันเริ่ม">
            {formatThaiDate(detail.startDate)}
          </MetaItem>
          <MetaItem label="วันสิ้นสุด">
            {formatThaiDate(detail.endDate)}
          </MetaItem>
        </div>
      </div>

      <h2 className="erp-esspets03-detail__section-title">
        สถานะการประเมินแต่ละหัวข้อ
      </h2>

      <div className="erp-esspets03-detail__table card erp-panel border-0">
        <div className="card-body p-0">
          <Esspets03MatrixTable heads={detail.heads} />
        </div>
      </div>
    </div>
  );
}
