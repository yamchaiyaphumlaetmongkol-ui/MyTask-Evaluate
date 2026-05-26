"use client";

import type { EvaluationStatusTemplateRow } from "@/api/ess/esspets03/types";
import { ErpAlert, ErpDataTable, ErpPageIntro, type ErpColumn } from "@/components/erp";
import { formatEvaluationPeriod } from "@/lib/evaluation-period";
import { formatThaiDate } from "@/lib/format-datetime";
import { buildFilterQuery } from "@/lib/build-filter-query";
import type { RoundListFilter } from "@/lib/round-list-filter";
import { hasRoundListFilter } from "@/lib/round-list-filter";
import { useCurrentUserStore } from "@/store/currentUserStore";
import Link from "next/link";

type Props = {
  rows: EvaluationStatusTemplateRow[];
  filter: RoundListFilter;
  viewerCode: string;
};

function detailHref(
  templateId: string,
  employeeCode: string,
  viewerCode: string,
  filter: RoundListFilter,
) {
  return `/ess/esspets03${buildFilterQuery({
    templateId,
    employeeCode,
    viewerCode,
    roundId: filter.roundId,
    evaluationPeriod: filter.evaluationPeriod,
    evaluationYear: filter.evaluationYear,
    dateFrom: filter.dateFrom,
    dateTo: filter.dateTo,
  })}`;
}

export function Esspets03TemplateTable({ rows, filter, viewerCode }: Props) {
  const employeeCode = useCurrentUserStore((s) => s.employeeCode);
  const employeeName = useCurrentUserStore((s) => s.employeeName);

  if (!viewerCode) {
    return (
      <p className="text-muted text-center py-4 mb-0">
        เลือกผู้ใช้งานเพื่อติดตามสถานะการประเมิน
      </p>
    );
  }

  const columns: ErpColumn<EvaluationStatusTemplateRow>[] = [
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
      key: "headCount",
      header: "หัวข้อหลัก",
      headerClassName: "text-center",
      className: "text-center",
      render: (row) => row.headCount,
    },
    {
      key: "subCount",
      header: "หัวข้อย่อย",
      headerClassName: "text-center",
      className: "text-center",
      render: (row) => row.subCount,
    },
    {
      key: "actions",
      header: "ดูสถานะ",
      headerClassName: "text-center",
      className: "text-center",
      render: (row) =>
        employeeCode ? (
          <Link
            href={detailHref(row.id, employeeCode, viewerCode, filter)}
            className="btn btn-outline-primary btn-sm"
          >
            ดูรายละเอียด
          </Link>
        ) : (
          <button
            type="button"
            className="btn btn-outline-secondary btn-sm"
            disabled
            title="เลือกผู้ใช้งาน"
          >
            ดูรายละเอียด
          </button>
        ),
    },
  ];

  return (
    <>
      {!employeeCode ? (
        <ErpAlert variant="warning" className="mb-3">
          เลือกผู้ใช้งานเพื่อดูสถานะการประเมิน
        </ErpAlert>
      ) : (
        <ErpPageIntro>
          ติดตามสถานะของ:{" "}
          <span className="fw-semibold text-dark">{employeeName}</span>
        </ErpPageIntro>
      )}

      <ErpDataTable
        columns={columns}
        data={rows}
        rowKey={(row) => row.id}
        showIndex
        emptyMessage={
          hasRoundListFilter(filter)
            ? "ไม่พบแบบประเมินที่ตรงกับตัวกรอง"
            : "ยังไม่มีแบบประเมินที่ส่ง"
        }
      />
    </>
  );
}
