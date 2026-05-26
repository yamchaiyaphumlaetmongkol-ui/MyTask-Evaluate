"use client";

import type { EvalStep } from "@/api/ess/esspets02/types";
import { Button } from "@/components/ui/Button";
import { NumberInput } from "@/components/ui/NumberInput";
import { Textarea } from "@/components/ui/Textarea";
import { useEffect, useState } from "react";

type SavePayload = {
  subId: string;
  employeeCode: string;
  score: number;
  detail: string;
};

type Props = {
  mode: "self" | "manager";
  employeeCode: string;
  employeeName: string;
  templateName: string;
  steps: EvalStep[];
  onSave: (payload: SavePayload) => Promise<{ ok: boolean; error?: string }>;
  doneMessage: string;
  scoreLabel?: string;
  detailLabel?: string;
};

export function EvalWizard({
  mode,
  employeeCode,
  employeeName,
  templateName,
  steps,
  onSave,
  doneMessage,
  scoreLabel = "คะแนน",
  detailLabel = "รายละเอียด",
}: Props) {
  const total = steps.length;
  const [index, setIndex] = useState(0);
  const [score, setScore] = useState("");
  const [detail, setDetail] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  const step = steps[index];
  const progress = total > 0 ? Math.round(((index + 1) / total) * 100) : 0;

  useEffect(() => {
    if (!step) return;
    setScore(step.savedScore != null ? String(step.savedScore) : "");
    setDetail(step.savedDetail ?? "");
    setError(null);
  }, [step]);

  const handleNext = async () => {
    if (!step) return;
    const scoreNum = Number(score);
    if (Number.isNaN(scoreNum)) {
      setError("กรุณากรอกคะแนน");
      return;
    }
    if (mode === "self" && !detail.trim()) {
      setError("กรุณากรอกรายละเอียดให้ครบ");
      return;
    }

    setSaving(true);
    setError(null);
    const res = await onSave({
      subId: step.subId,
      employeeCode,
      score: scoreNum,
      detail,
    });
    setSaving(false);

    if (!res.ok) {
      setError(res.error ?? "บันทึกไม่สำเร็จ");
      return;
    }

    if (index + 1 >= total) {
      setDone(true);
      return;
    }

    setIndex((i) => i + 1);
  };

  if (total === 0) {
    return (
      <div className="alert alert-warning">
        แบบประเมินนี้ยังไม่มีหัวข้อย่อยให้ประเมิน
      </div>
    );
  }

  if (done) {
    return (
      <div className="alert alert-success mb-0">
        <p className="mb-0 fw-semibold">{doneMessage}</p>
      </div>
    );
  }

  return (
    <div className="card erp-panel border-0">
      <div className="card-body">
        <p className="small text-muted mb-2">
          {mode === "self" ? "ผู้ประเมิน" : "ผู้ถูกประเมิน"}: {employeeName} · แบบ:{" "}
          {templateName}
        </p>

        <div className="mb-3">
          <div className="d-flex justify-content-between small text-muted mb-1">
            <span>
              หัวข้อย่อย {index + 1} / {total}
            </span>
            <span>{progress}%</span>
          </div>
          <div className="progress erp-eval-progress">
            <div
              className="progress-bar bg-success"
              role="progressbar"
              style={{ width: `${progress}%` }}
              aria-valuenow={progress}
              aria-valuemin={0}
              aria-valuemax={100}
            />
          </div>
        </div>

        <p className="small text-muted mb-1">หัวข้อหลัก: {step.headTopic}</p>
        <p className="small text-muted mb-2">สัดส่วน {step.headProportion}%</p>
        <h2 className="h5 erp-form-page-title mb-3">{step.subTopic}</h2>

        {step.gradeCriteria.length > 0 ? (
          <div className="table-responsive mb-3">
            <table className="table table-sm table-bordered mb-0">
              <thead className="erp-table-head">
                <tr>
                  <th>หัวข้อ / เงื่อนไข</th>
                  <th>เกรด</th>
                  <th>ช่วงคะแนน</th>
                </tr>
              </thead>
              <tbody>
                {step.gradeCriteria.map((c, i) => (
                  <tr key={`${c.detailTopic}-${i}`}>
                    <td>{c.detailTopic}</td>
                    <td>{c.grade ?? "—"}</td>
                    <td>
                      {c.minScore} – {c.maxScore}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <p className="text-muted small mt-2 mb-0">
              ตารางด้านบนเป็นเกณฑ์เกรด — กรอกคะแนนด้านล่าง
            </p>
          </div>
        ) : (
          <p className="text-muted small mb-3">ยังไม่มีเกณฑ์เกรดสำหรับหัวข้อนี้</p>
        )}

        <div className="row g-3">
          <div className="col-md-3">
            <NumberInput
              label={scoreLabel}
              integer={false}
              min={step.minScore}
              max={step.maxScore}
              value={score === "" ? null : Number(score)}
              hint={`ช่วงที่อนุญาต ${step.minScore} – ${step.maxScore}`}
              onValueChange={(n) => setScore(n == null ? "" : String(n))}
            />
          </div>
          <div className="col-md-9">
            <Textarea
              label={detailLabel}
              rows={4}
              value={detail}
              onChange={(e) => setDetail(e.target.value)}
            />
          </div>
        </div>

        {error && (
          <div className="alert alert-danger py-2 mt-3 small">{error}</div>
        )}

        <div className="d-flex justify-content-end mt-3">
          <Button variant="success" disabled={saving} onClick={handleNext}>
            {saving
              ? "กำลังบันทึก..."
              : index + 1 >= total
                ? "บันทึกและจบ"
                : "NEXT"}
          </Button>
        </div>
      </div>
    </div>
  );
}
