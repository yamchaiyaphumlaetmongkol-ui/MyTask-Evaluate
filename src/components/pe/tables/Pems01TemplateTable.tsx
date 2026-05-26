"use client";

import { deleteEvaluationTemplate } from "@/api/pe/pems01/delete_template";
import type { EvaluationTemplateRow } from "@/api/pe/pems01/types";
import { formatEvaluationPeriod } from "@/lib/evaluation-period";
import { formatRoundStatus } from "@/lib/evaluation-round";
import { formatThaiDate, formatThaiDateTime } from "@/lib/format-datetime";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

type Props = {
  rows: EvaluationTemplateRow[];
  hasFilter: boolean;
  totalCount?: number;
};

export function Pems01TemplateTable({ rows, hasFilter, totalCount }: Props) {
  const router = useRouter();
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleDelete = async (row: EvaluationTemplateRow) => {
    if (!confirm(`ลบรอบประเมิน "${row.templateName}"?`)) return;
    setDeletingId(row.id);
    setError(null);
    const res = await deleteEvaluationTemplate(row.id);
    setDeletingId(null);
    if (!res.ok) {
      setError(res.error);
      return;
    }
    router.refresh();
  };

  if (rows.length === 0) {
    return (
      <p className="text-muted text-center py-4 mb-0">
        {hasFilter ? (
          <>ไม่พบแบบประเมินที่ตรงกับตัวกรอง</>
        ) : (
          <>
            ยังไม่มีแบบประเมิน —{" "}
            <Link href="/pe/pems01/form">สร้างแบบประเมิน</Link>
          </>
        )}
      </p>
    );
  }

  return (
    <>
      {error && (
        <div className="alert alert-danger py-2 small">{error}</div>
      )}

      <div className="table-responsive">
        <table className="table table-striped table-hover align-middle mb-0">
          <thead className="erp-table-head">
            <tr>
              <th className="text-center">ลำดับที่</th>
              <th>ชื่อรอบ</th>
              <th>แม่แบบ</th>
              <th className="text-center">ปี</th>
              <th>ช่วงประเมิน</th>
              <th>สถานะ</th>
              <th>วันเริ่ม</th>
              <th>วันสิ้นสุด</th>
              <th className="text-center">หัวข้อหลัก</th>
              <th>วันที่สร้าง</th>
              <th className="text-center">จัดการ</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row, index) => (
              <tr key={row.id}>
                <td className="text-center">{index + 1}</td>
                <td>{row.templateName}</td>
                <td>{row.masterName}</td>
                <td className="text-center">{row.evaluationYear}</td>
                <td>{formatEvaluationPeriod(row.evaluationPeriod)}</td>
                <td>{formatRoundStatus(row.status)}</td>
                <td>{formatThaiDate(row.startDate)}</td>
                <td>{formatThaiDate(row.endDate)}</td>
                <td className="text-center">{row.headCount}</td>
                <td>{formatThaiDateTime(row.createdAt)}</td>
                <td className="text-center">
                  <div className="d-inline-flex flex-wrap gap-1 justify-content-center">
                    <Link
                      href={`/pe/pems01/form?templateId=${encodeURIComponent(row.id)}`}
                      className="btn btn-outline-primary btn-sm"
                    >
                      แก้ไข
                    </Link>
                    <button
                      type="button"
                      className="btn btn-danger btn-sm"
                      disabled={deletingId === row.id}
                      onClick={() => handleDelete(row)}
                    >
                      {deletingId === row.id ? "..." : "ลบ"}
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {hasFilter && totalCount !== undefined && (
        <p className="text-muted small mt-2 mb-0">
          แสดง {rows.length} จาก {totalCount} แบบประเมิน
        </p>
      )}
    </>
  );
}
