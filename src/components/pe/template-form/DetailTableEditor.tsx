"use client";

import type { EvaluationDetailDraft, EvaluationSubDraft } from "@/api/pe/pems01/types";
import { emptyDetailDraft } from "@/api/pe/pems01/types";
import { NumberInput } from "@/components/ui/NumberInput";
import { Button } from "@/components/ui/Button";
import { GRADE_OPTIONS } from "@/lib/grade-options";

type Props = {
  sub: EvaluationSubDraft;
  onChange: (next: EvaluationSubDraft) => void;
};

export function DetailTableEditor({ sub, onChange }: Props) {
  const updateDetail = (key: string, patch: Partial<EvaluationDetailDraft>) => {
    onChange({
      ...sub,
      details: sub.details.map((d) =>
        d.clientKey === key ? { ...d, ...patch } : d,
      ),
    });
  };

  const removeDetail = (key: string) => {
    onChange({
      ...sub,
      details: sub.details.filter((d) => d.clientKey !== key),
    });
  };

  const addDetail = () => {
    onChange({
      ...sub,
      details: [...sub.details, emptyDetailDraft()],
    });
  };

  return (
    <div className="mt-3">
      <div className="d-flex justify-content-between align-items-center mb-2">
        <span className="fw-semibold small">เกณฑ์เกรด (แสดงใน ESS)</span>
        <Button type="button" variant="success" size="sm" onClick={addDetail}>
          + เพิ่มแถว
        </Button>
      </div>

      {sub.details.length === 0 ? (
        <p className="text-muted small mb-0">ยังไม่มีเกณฑ์เกรด — กดเพิ่มแถว</p>
      ) : (
        <div className="table-responsive border rounded erp-panel">
          <table className="table table-sm align-middle mb-0">
            <thead className="erp-table-head">
              <tr>
                <th>หัวข้อ / เงื่อนไข</th>
                <th style={{ width: "7rem" }}>ต่ำสุด</th>
                <th style={{ width: "7rem" }}>สูงสุด</th>
                <th style={{ width: "5rem" }}>เกรด</th>
                <th className="text-center" style={{ width: "4rem" }}>
                  ลบ
                </th>
              </tr>
            </thead>
            <tbody>
              {sub.details.map((row) => (
                <tr key={row.clientKey}>
                  <td>
                    <input
                      className="form-control form-control-sm"
                      value={row.detailTopic}
                      placeholder="กรอกรายละเอียด"
                      onChange={(e) =>
                        updateDetail(row.clientKey, { detailTopic: e.target.value })
                      }
                    />
                  </td>
                  <td>
                    <NumberInput
                      inline
                      integer={false}
                      min={0}
                      className="form-control-sm"
                      value={row.minScore}
                      onValueChange={(minScore) =>
                        updateDetail(row.clientKey, {
                          minScore: minScore ?? 0,
                        })
                      }
                    />
                  </td>
                  <td>
                    <NumberInput
                      inline
                      integer={false}
                      min={0}
                      className="form-control-sm"
                      value={row.maxScore}
                      onValueChange={(maxScore) =>
                        updateDetail(row.clientKey, {
                          maxScore: maxScore ?? 0,
                        })
                      }
                    />
                  </td>
                  <td>
                    <select
                      className="form-select form-select-sm"
                      value={row.grade}
                      onChange={(e) =>
                        updateDetail(row.clientKey, { grade: e.target.value })
                      }
                    >
                      <option value="">—</option>
                      {GRADE_OPTIONS.map((g) => (
                        <option key={g} value={g}>
                          {g}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="text-center">
                    <button
                      type="button"
                      className="btn btn-outline-danger btn-sm"
                      onClick={() => removeDetail(row.clientKey)}
                      aria-label="ลบแถว"
                    >
                      ×
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
