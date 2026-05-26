import type { EvaluationStatusTemplateDetail } from "@/api/ess/esspets03/types";
import type { ReactNode } from "react";
import { Esspets03MatrixTable } from "@/components/ess/tables/Esspets03MatrixTable";
import { BackLink } from "@/components/shared/BackLink";
import { formatEvaluationPeriod } from "@/lib/evaluation-period";
import { formatThaiDate } from "@/lib/format-datetime";

type Props = {
  detail: EvaluationStatusTemplateDetail;
  backHref: string;
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

export function Esspets03DetailPanel({ detail, backHref }: Props) {
  return (
    <div className="erp-esspets03-detail">
      <BackLink href={backHref} className="erp-esspets03-detail__back">
        กลับรายการแบบประเมิน
      </BackLink>

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
