import type { EssTemplateSearchRow } from "@/api/ess/esspets01/types";
import { ErpDataTable, type ErpColumn } from "@/components/erp";
import { ShareLinkButton } from "@/components/shared/ShareLinkButton";
import { formatEvaluationPeriod } from "@/lib/evaluation-period";
import { formatThaiDate, formatThaiDateTime } from "@/lib/format-datetime";
import Link from "next/link";

type Props = {
  rows: EssTemplateSearchRow[];
  hasFilter: boolean;
  totalCount?: number;
};

export function Esspets01TemplateTable({ rows, hasFilter, totalCount }: Props) {
  const columns: ErpColumn<EssTemplateSearchRow>[] = [
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
      key: "createdAt",
      header: "วันที่สร้าง",
      render: (row) => formatThaiDateTime(row.createdAt),
    },
    {
      key: "actions",
      header: "ดำเนินการ",
      headerClassName: "text-center",
      className: "text-center",
      render: (row) => (
        <div className="d-inline-flex flex-wrap gap-1 justify-content-center">
          <Link
            href={`/ess/esspets02?templateId=${row.id}&share=1`}
            className="btn btn-success btn-sm"
          >
            เริ่มประเมิน
          </Link>
          <ShareLinkButton
            url={`/ess/esspets02?templateId=${row.id}&share=1`}
          />
        </div>
      ),
    },
  ];

  return (
    <ErpDataTable
      columns={columns}
      data={rows}
      rowKey={(row) => row.id}
      showIndex
      emptyMessage={
        hasFilter
          ? "ไม่พบแบบประเมินที่ตรงกับตัวกรอง"
          : "ยังไม่มีแบบประเมินในระบบ"
      }
      footer={
        hasFilter && totalCount !== undefined ? (
          <p className="text-muted small mb-0">
            แสดง {rows.length} จาก {totalCount} แบบประเมิน
          </p>
        ) : undefined
      }
    />
  );
}
