"use client";

import type { ManagerEvalQueueRow } from "@/api/ess/esspets04/types";
import { exportEvaluationExcel } from "@/api/ess/esspets04/export_evaluation_excel";
import { ErpDataTable, type ErpColumn } from "@/components/erp";
import { formatEvaluationPeriod } from "@/lib/evaluation-period";
import { formatManagerEvalDocumentStatus } from "@/lib/manager-eval-document-status";
import { formatThaiDate, formatThaiDateTime } from "@/lib/format-datetime";
import { buildFilterQuery } from "@/lib/build-filter-query";
import type { ManagerEvalQueueFilter } from "@/lib/manager-eval-queue-filter";
import { hasManagerEvalQueueFilter } from "@/lib/manager-eval-queue-filter";
import Link from "next/link";
import { useState } from "react";

type Props = {
  rows: ManagerEvalQueueRow[];
  managerCode: string;
  filter: ManagerEvalQueueFilter;
};

function evalHref(
  managerCode: string,
  employeeCode: string,
  templateId: string,
  filter: ManagerEvalQueueFilter,
) {
  return `/ess/esspets04${buildFilterQuery({
    managerCode,
    employeeCode,
    templateId,
    roundId: templateId,
    evaluationPeriod: filter.evaluationPeriod,
    evaluationYear: filter.evaluationYear,
    dateFrom: filter.dateFrom,
    dateTo: filter.dateTo,
    documentStatus: filter.documentStatus,
  })}`;
}

export function listHref(
  managerCode: string,
  filter: ManagerEvalQueueFilter,
) {
  return `/ess/esspets04${buildFilterQuery({
    managerCode,
    employeeCode: filter.employeeCode,
    roundId: filter.roundId,
    evaluationPeriod: filter.evaluationPeriod,
    evaluationYear: filter.evaluationYear,
    dateFrom: filter.dateFrom,
    dateTo: filter.dateTo,
    documentStatus: filter.documentStatus,
  })}`;
}

function statusBadgeClass(status: ManagerEvalQueueRow["documentStatus"]): string {
  switch (status) {
    case "completed":
      return "bg-success";
    case "incomplete":
      return "bg-warning text-dark";
    default:
      return "bg-secondary";
  }
}

export function Esspets04QueueTable({ rows, managerCode, filter }: Props) {
  const [exportingKey, setExportingKey] = useState<string | null>(null);
  if (!managerCode) {
    return (
      <p className="text-muted text-center py-4 mb-0">เลือกผู้ใช้งานก่อน</p>
    );
  }

  const columns: ErpColumn<ManagerEvalQueueRow>[] = [
    {
      key: "employeeName",
      header: "ชื่อพนักงาน",
      render: (row) => row.employeeName,
    },
    {
      key: "templateName",
      header: "ชื่อแบบประเมิน",
      render: (row) => row.templateName,
    },
    {
      key: "evaluationPeriod",
      header: "ช่วงประเมิน",
      render: (row) => formatEvaluationPeriod(row.evaluationPeriod),
    },
    {
      key: "documentStatus",
      header: "สถานะเอกสาร",
      render: (row) => (
        <span
          className={`badge ${statusBadgeClass(row.documentStatus)}`}
        >
          {formatManagerEvalDocumentStatus(row.documentStatus)}
        </span>
      ),
    },
    {
      key: "startDate",
      header: "วันเริ่ม",
      render: (row) => formatThaiDate(row.startDate),
    },
    {
      key: "endDate",
      header: "วันสิ้นสุด",
      render: (row) => formatThaiDate(row.endDate),
    },
    {
      key: "createdAt",
      header: "วันที่สร้าง",
      render: (row) => formatThaiDateTime(row.createdAt),
    },
    {
      key: "actions",
      header: "ดำเนินการ",
      headerClassName: "text-center",
      className: "text-center",
      render: (row) =>
        row.canEvaluate ? (
          <div className="d-inline-flex gap-1">
            <Link
              href={evalHref(
                managerCode,
                row.employeeCode,
                row.templateId,
                filter,
              )}
              className="btn btn-success btn-sm"
            >
              ประเมิน
            </Link>
            {row.documentStatus === "completed" ? (
              <button
                type="button"
                className="btn btn-outline-primary btn-sm"
                disabled={exportingKey === `${row.employeeCode}|${row.templateId}`}
                onClick={async () => {
                  const key = `${row.employeeCode}|${row.templateId}`;
                  setExportingKey(key);
                  const res = await exportEvaluationExcel({
                    managerCode,
                    employeeCode: row.employeeCode,
                    templateId: row.templateId,
                  });
                  setExportingKey(null);
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
                {exportingKey === `${row.employeeCode}|${row.templateId}`
                  ? "..."
                  : "Export Excel"}
              </button>
            ) : null}
          </div>
        ) : (
          <button
            type="button"
            className="btn btn-outline-secondary btn-sm"
            disabled
            title="รอให้พนักงานประเมินตนเองก่อน"
          >
            ประเมิน
          </button>
        ),
    },
  ];

  return (
    <ErpDataTable
      columns={columns}
      data={rows}
      rowKey={(row) => `${row.employeeCode}|${row.templateId}`}
      showIndex
      emptyMessage={
        hasManagerEvalQueueFilter(filter)
          ? "ไม่พบรายการที่ตรงกับตัวกรอง"
          : "ไม่มีพนักงานที่คุณมีสิทธิ์ประเมิน"
      }
    />
  );
}
