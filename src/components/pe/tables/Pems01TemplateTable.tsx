"use client";

import { deleteEvaluationTemplate } from "@/api/pe/pems01/delete_template";
import { duplicateEvaluationTemplate } from "@/api/pe/pems01/duplicate_template";
import { updateEvaluationRoundStatus } from "@/api/pe/pems01/update_round_status";
import type { EvaluationTemplateRow } from "@/api/pe/pems01/types";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Modal } from "@/components/ui/Modal";
import { EVALUATION_PERIODS } from "@/lib/evaluation-period";
import { formatEvaluationPeriod } from "@/lib/evaluation-period";
import {
  effectiveRoundStatus,
  formatRoundStatus,
  isPastRoundEndDate,
  nextRoundStatus,
  roundStatusButtonClass,
  type EvaluationRoundStatus,
} from "@/lib/evaluation-round";
import { formatThaiDate, formatThaiDateTime } from "@/lib/format-datetime";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

type Props = {
  rows: EvaluationTemplateRow[];
  hasFilter: boolean;
  totalCount?: number;
};

function stripRoundPeriodSuffix(name: string): string {
  return name.replace(/\s*\(\d{4}\s*·\s*ครึ่ง(?:แรก|หลัง)\)\s*$/u, "").trim();
}

export function Pems01TemplateTable({ rows, hasFilter, totalCount }: Props) {
  const router = useRouter();
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [statusUpdatingId, setStatusUpdatingId] = useState<string | null>(null);
  const [duplicatingId, setDuplicatingId] = useState<string | null>(null);
  const [sourceRound, setSourceRound] = useState<EvaluationTemplateRow | null>(null);
  const [duplicateName, setDuplicateName] = useState("");
  const [duplicateYear, setDuplicateYear] = useState(String(new Date().getFullYear()));
  const [duplicatePeriod, setDuplicatePeriod] = useState<"H1" | "H2">("H1");
  const [duplicateStartDate, setDuplicateStartDate] = useState("");
  const [duplicateEndDate, setDuplicateEndDate] = useState("");
  const [duplicateStatus, setDuplicateStatus] = useState<"draft" | "open" | "closed">(
    "draft",
  );
  const [error, setError] = useState<string | null>(null);

  const closeDuplicateModal = () => {
    setSourceRound(null);
    setDuplicatingId(null);
  };

  const openDuplicateModal = (row: EvaluationTemplateRow) => {
    setSourceRound(row);
    setDuplicateName(stripRoundPeriodSuffix(row.templateName));
    setDuplicateYear(String(row.evaluationYear));
    setDuplicatePeriod((row.evaluationPeriod === "H1" ? "H1" : "H2") as "H1" | "H2");
    setDuplicateStartDate(row.startDate ?? "");
    setDuplicateEndDate(row.endDate ?? "");
    setDuplicateStatus("draft");
    setError(null);
  };

  const handleDuplicate = async () => {
    if (!sourceRound) return;
    if (!duplicateName.trim()) {
      setError("กรุณากรอกชื่อรอบใหม่");
      return;
    }
    if (!duplicateStartDate || !duplicateEndDate) {
      setError("กรุณาระบุวันเริ่มและวันสิ้นสุด");
      return;
    }
    if (duplicateStartDate > duplicateEndDate) {
      setError("วันเริ่มต้องไม่เกินวันสิ้นสุด");
      return;
    }

    setDuplicatingId(sourceRound.id);
    setError(null);
    const res = await duplicateEvaluationTemplate({
      sourceRoundId: sourceRound.id,
      templateName: duplicateName.trim(),
      evaluationYear: Number(duplicateYear),
      evaluationPeriod: duplicatePeriod,
      startDate: duplicateStartDate,
      endDate: duplicateEndDate,
      status: duplicateStatus,
    });
    setDuplicatingId(null);
    if (!res.ok) {
      setError(res.error);
      return;
    }
    closeDuplicateModal();
    router.push(`/pe/pems01/form?templateId=${encodeURIComponent(res.data.templateId)}`);
    router.refresh();
  };

  const handleStatusChange = async (
    row: EvaluationTemplateRow,
    status: EvaluationRoundStatus,
  ) => {
    if (effectiveRoundStatus(row.status, row.endDate) === status) return;

    setStatusUpdatingId(row.id);
    setError(null);
    const res = await updateEvaluationRoundStatus({ roundId: row.id, status });
    setStatusUpdatingId(null);
    if (!res.ok) {
      setError(res.error);
      return;
    }
    router.refresh();
  };

  const handleCycleStatus = (row: EvaluationTemplateRow) => {
    if (isPastRoundEndDate(row.endDate)) return;
    const current = effectiveRoundStatus(row.status, row.endDate);
    const next = nextRoundStatus(current);
    void handleStatusChange(row, next);
  };

  const handleDelete = async (row: EvaluationTemplateRow) => {
    if (
      !confirm(
        `ลบรอบ "${row.templateName}" ถาวร?\n\nการลบนี้จะลบข้อมูลที่เชื่อมกันทั้งหมดในฐานข้อมูล และไม่สามารถกู้คืนได้`,
      )
    ) {
      return;
    }
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
            {rows.map((row, index) => {
              const displayStatus = effectiveRoundStatus(row.status, row.endDate);
              const nextStatus = nextRoundStatus(displayStatus);
              const expired = isPastRoundEndDate(row.endDate);
              const rowBusy =
                statusUpdatingId === row.id ||
                Boolean(duplicatingId) ||
                deletingId === row.id;

              return (
              <tr key={row.id}>
                <td className="text-center">{index + 1}</td>
                <td>{row.templateName}</td>
                <td className="text-center">{row.evaluationYear}</td>
                <td>{formatEvaluationPeriod(row.evaluationPeriod)}</td>
                <td>
                  <span
                    className={
                      displayStatus === "open"
                        ? "badge text-bg-success"
                        : displayStatus === "closed"
                          ? "badge text-bg-secondary"
                          : "badge text-bg-warning"
                    }
                  >
                    {formatRoundStatus(displayStatus)}
                  </span>
                  {expired && displayStatus === "closed" ? (
                    <span className="small text-muted d-block mt-1">
                      หมดเวลาประเมิน
                    </span>
                  ) : null}
                </td>
                <td>{formatThaiDate(row.startDate)}</td>
                <td>{formatThaiDate(row.endDate)}</td>
                <td className="text-center">{row.headCount}</td>
                <td>{formatThaiDateTime(row.createdAt)}</td>
                <td className="text-center">
                  <div className="d-inline-flex flex-wrap gap-1 justify-content-center align-items-center">
                    <button
                      type="button"
                      className={`btn btn-sm ${roundStatusButtonClass(nextStatus)}`}
                      style={{ minWidth: "6.5rem" }}
                      disabled={rowBusy || expired}
                      title={
                        expired
                          ? "หมดเวลาประเมินแล้ว — ปิดรอบอัตโนมัติ"
                          : `คลิกเพื่อเปลี่ยนเป็น ${formatRoundStatus(nextStatus)}`
                      }
                      aria-label={`เปลี่ยนสถานะรอบ ${row.templateName} เป็น ${formatRoundStatus(nextStatus)}`}
                      onClick={() => handleCycleStatus(row)}
                    >
                      {statusUpdatingId === row.id
                        ? "..."
                        : formatRoundStatus(nextStatus)}
                    </button>
                    <Link
                      href={`/pe/pems01/form?templateId=${encodeURIComponent(row.id)}`}
                      className="btn btn-outline-primary btn-sm"
                    >
                      แก้ไข
                    </Link>
                    <button
                      type="button"
                      className="btn btn-outline-secondary btn-sm"
                      disabled={Boolean(duplicatingId)}
                      onClick={() => openDuplicateModal(row)}
                    >
                      ทำสำเนา
                    </button>
                    <button
                      type="button"
                      className="btn btn-danger btn-sm"
                      disabled={deletingId === row.id}
                      onClick={() => handleDelete(row)}
                    >
                      {deletingId === row.id ? "..." : "นำออก"}
                    </button>
                  </div>
                </td>
              </tr>
            );
            })}
          </tbody>
        </table>
      </div>

      {hasFilter && totalCount !== undefined && (
        <p className="text-muted small mt-2 mb-0">
          แสดง {rows.length} จาก {totalCount} แบบประเมิน
        </p>
      )}

      <Modal
        open={Boolean(sourceRound)}
        title="ทำสำเนารอบประเมิน"
        onClose={closeDuplicateModal}
        size="lg"
        footer={
          <>
            <Button
              variant="secondary"
              onClick={closeDuplicateModal}
              disabled={Boolean(duplicatingId)}
            >
              ยกเลิก
            </Button>
            <Button variant="success" onClick={handleDuplicate} disabled={Boolean(duplicatingId)}>
              {duplicatingId ? "กำลังทำสำเนา..." : "สร้างสำเนา"}
            </Button>
          </>
        }
      >
        <p className="text-muted small">
          ต้นฉบับ: <strong>{sourceRound?.templateName}</strong>
        </p>
        <Input
          label="ชื่อรอบใหม่"
          name="duplicateName"
          value={duplicateName}
          onChange={(e) => setDuplicateName(e.target.value)}
        />
        <div className="row g-3">
          <div className="col-md-4">
            <Input
              type="number"
              label="ปีประเมิน"
              name="duplicateYear"
              value={duplicateYear}
              onChange={(e) => setDuplicateYear(e.target.value)}
            />
          </div>
          <div className="col-md-4">
            <label className="form-label" htmlFor="duplicatePeriod">
              ช่วงประเมิน
            </label>
            <select
              id="duplicatePeriod"
              className="form-select"
              value={duplicatePeriod}
              onChange={(e) => setDuplicatePeriod(e.target.value as "H1" | "H2")}
            >
              {EVALUATION_PERIODS.map((period) => (
                <option key={period.value} value={period.value}>
                  {period.label}
                </option>
              ))}
            </select>
          </div>
          <div className="col-md-4">
            <label className="form-label" htmlFor="duplicateStatus">
              สถานะรอบ
            </label>
            <select
              id="duplicateStatus"
              className="form-select"
              value={duplicateStatus}
              onChange={(e) =>
                setDuplicateStatus(e.target.value as "draft" | "open" | "closed")
              }
            >
              <option value="draft">ร่าง</option>
              <option value="open">เปิดประเมิน</option>
              <option value="closed">ปิดรอบ</option>
            </select>
          </div>
          <div className="col-md-6">
            <Input
              type="date"
              label="วันเริ่ม"
              name="duplicateStartDate"
              value={duplicateStartDate}
              onChange={(e) => setDuplicateStartDate(e.target.value)}
            />
          </div>
          <div className="col-md-6">
            <Input
              type="date"
              label="วันสิ้นสุด"
              name="duplicateEndDate"
              value={duplicateEndDate}
              onChange={(e) => setDuplicateEndDate(e.target.value)}
            />
          </div>
        </div>
      </Modal>
    </>
  );
}
