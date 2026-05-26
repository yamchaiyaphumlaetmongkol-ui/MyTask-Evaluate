"use client";

import { createEvaluationRound } from "@/api/pe/pems01/create_evaluation_round";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { EVALUATION_PERIODS } from "@/lib/evaluation-period";
import { ErpCollapsePanel } from "@/components/shared/ErpCollapsePanel";
import { useRouter } from "next/navigation";
import { useState } from "react";

type Props = {
  masterId: string;
  masterName: string;
  className?: string;
};

export function CreateRoundPanel({ masterId, masterName, className }: Props) {
  const router = useRouter();
  const year = new Date().getFullYear();
  const [evaluationYear, setEvaluationYear] = useState(String(year));
  const [evaluationPeriod, setEvaluationPeriod] = useState("H1");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [status, setStatus] = useState<"draft" | "open" | "closed">("open");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleCreate = async () => {
    setError(null);
    if (!startDate.trim() || !endDate.trim()) {
      setError("กรุณาระบุวันเริ่มและวันสิ้นสุดของรอบ");
      return;
    }
    if (startDate > endDate) {
      setError("วันเริ่มต้องไม่เกินวันสิ้นสุด");
      return;
    }

    setSaving(true);
    const res = await createEvaluationRound({
      masterId,
      evaluationYear: Number(evaluationYear),
      evaluationPeriod,
      startDate: startDate.trim(),
      endDate: endDate.trim(),
      status,
    });
    setSaving(false);

    if (!res.ok) {
      setError(res.error);
      return;
    }

    router.push(
      `/pe/pems01/form?templateId=${encodeURIComponent(res.data.roundId)}`,
    );
    router.refresh();
  };

  return (
    <ErpCollapsePanel
      level="sub"
      defaultOpen={false}
      title={`เปิดรอบประเมินใหม่ — ${masterName}`}
      className={className}
    >
      {error && (
        <div className="alert alert-danger py-2 small">{error}</div>
      )}
      <div className="row g-3">
        <div className="col-md-4">
          <Input
            type="number"
            label="ปีประเมิน"
            name="evaluationYear"
            value={evaluationYear}
            onChange={(e) => setEvaluationYear(e.target.value)}
          />
        </div>
        <div className="col-md-4">
          <label htmlFor="roundPeriod" className="form-label">
            ช่วงประเมิน
          </label>
          <select
            id="roundPeriod"
            className="form-select"
            value={evaluationPeriod}
            onChange={(e) => setEvaluationPeriod(e.target.value)}
          >
            {EVALUATION_PERIODS.map((p) => (
              <option key={p.value} value={p.value}>
                {p.label}
              </option>
            ))}
          </select>
        </div>
        <div className="col-md-4">
          <label htmlFor="roundStatus" className="form-label">
            สถานะรอบ
          </label>
          <select
            id="roundStatus"
            className="form-select"
            value={status}
            onChange={(e) =>
              setStatus(e.target.value as "draft" | "open" | "closed")
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
            name="roundStart"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
          />
        </div>
        <div className="col-md-6">
          <Input
            type="date"
            label="วันสิ้นสุด"
            name="roundEnd"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
          />
        </div>
      </div>
      <p className="text-muted small mb-3">
        ระบบจะคัดลอกหัวข้อและสิทธิ์จากแม่แบบไปยังรอบใหม่ — ผลประเมินแต่ละรอบแยกกัน
      </p>
      <Button
        type="button"
        variant="primary"
        disabled={saving}
        onClick={handleCreate}
      >
        {saving ? "กำลังสร้างรอบ..." : "สร้างรอบและแก้ไขรอบ"}
      </Button>
    </ErpCollapsePanel>
  );
}
