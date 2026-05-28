"use client";

import { saveEvaluationTemplateBundle } from "@/api/pe/pems01/save_template_bundle";
import {
  emptyHeadDraft,
  type EvaluationHeadDraft,
  type EvaluationTemplateFormState,
  type PeMasters,
} from "@/api/pe/pems01/types";
import { RolePositionPermissionFields } from "@/components/pe/RolePositionPermissionFields";
import { HeadFormBlock } from "@/components/pe/template-form/HeadFormBlock";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { NumberInput } from "@/components/ui/NumberInput";
import { EVALUATION_PERIODS } from "@/lib/evaluation-period";
import { ErpCollapsePanel } from "@/components/shared/ErpCollapsePanel";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

type Props = {
  initialState: EvaluationTemplateFormState;
  masters: PeMasters;
  mode: "new" | "edit";
};

export function EvaluationTemplateForm({ initialState, masters, mode }: Props) {
  const router = useRouter();
  const [form, setForm] = useState(initialState);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const addHead = () => {
    setForm((f) => ({ ...f, heads: [...f.heads, emptyHeadDraft()] }));
  };

  const updateHead = (key: string, next: EvaluationHeadDraft) => {
    setForm((f) => ({
      ...f,
      heads: f.heads.map((h) => (h.clientKey === key ? next : h)),
    }));
  };

  const removeHead = (key: string) => {
    setForm((f) => ({
      ...f,
      heads: f.heads.filter((h) => h.clientKey !== key),
    }));
  };

  const handleSave = async () => {
    setError(null);
    const name = form.templateName.trim();
    if (!name) {
      setError("กรุณากรอกชื่อแบบประเมิน");
      return;
    }
    if (!form.startDate.trim()) {
      setError("กรุณาระบุวันเริ่ม");
      return;
    }
    if (!form.endDate.trim()) {
      setError("กรุณาระบุวันสิ้นสุด");
      return;
    }
    if (form.startDate > form.endDate) {
      setError("วันเริ่มต้องไม่เกินวันสิ้นสุด");
      return;
    }
    if (form.heads.length === 0) {
      setError("กรุณาเพิ่มหัวข้อประเมินหลักอย่างน้อย 1 รายการ");
      return;
    }

    if (!form.evaluationPeriod) {
      setError("กรุณาเลือกช่วงประเมิน (ครึ่งแรก/ครึ่งหลัง)");
      return;
    }
    if (!Number.isFinite(form.evaluationYear) || form.evaluationYear < 2000) {
      setError("กรุณาระบุปีประเมิน (ค.ศ.) ให้ถูกต้อง");
      return;
    }

    const payload = {
      templateId: form.templateId,
      templateName: name,
      evaluationYear: form.evaluationYear,
      evaluationPeriod: form.evaluationPeriod,
      startDate: form.startDate.trim(),
      endDate: form.endDate.trim(),
      heads: form.heads.map((h) => ({
        id: h.id,
        headTopic: h.headTopic.trim(),
        proportion: h.proportion,
        permissions: form.permissions,
        subs: h.subs.map((s) => ({
          id: s.id,
          subTopic: s.subTopic.trim(),
          details: s.details.map((d) => ({
            id: d.id,
            detailTopic: d.detailTopic.trim(),
            grade: d.grade.trim(),
            minScore: d.minScore,
            maxScore: d.maxScore,
          })),
        })),
      })),
    };

    setSaving(true);
    const res = await saveEvaluationTemplateBundle(payload);
    setSaving(false);

    if (!res.ok) {
      setError(res.error);
      return;
    }

    router.push("/pe/pems01");
    router.refresh();
  };

  return (
    <>
      <div className="d-flex flex-wrap justify-content-between align-items-center gap-2 mb-4">
        <div>
          <h1 className="h4 mb-1 erp-form-page-title">
            {mode === "edit" ? "แก้ไขรอบประเมิน" : "สร้างรอบประเมิน"}
          </h1>
          <p className="text-muted small mb-0">
            จัดการโครงสร้างรอบประเมินโดยตรง และสามารถใช้ปุ่ม Duplicate จากหน้ารายการได้
          </p>
        </div>
        <div className="d-flex gap-2">
          <Link href="/pe/pems01" className="btn btn-outline-secondary">
            ยกเลิก
          </Link>
          <Button
            type="button"
            variant="success"
            disabled={saving}
            onClick={handleSave}
          >
            {saving ? "กำลังบันทึก..." : "บันทึกทั้งหมด"}
          </Button>
        </div>
      </div>

      {error && (
        <div className="alert alert-danger py-2" role="alert">
          {error}
        </div>
      )}

      <ErpCollapsePanel
        level="head"
        defaultOpen
        title="ข้อมูลแบบประเมิน"
        className="mb-4"
      >
        <Input
          label="ชื่อแบบประเมิน"
          name="templateName"
          value={form.templateName}
          placeholder="เช่น แบบประเมินผลงานประจำปี 2568"
          onChange={(e) =>
            setForm((f) => ({ ...f, templateName: e.target.value }))
          }
        />
        <div className="row g-3 mb-3">
          <div className="col-md-4">
            <NumberInput
              label="ปีประเมิน (ค.ศ.)"
              name="evaluationYear"
              className="erp-input-number--sm"
              min={2000}
              max={2100}
              integer
              value={form.evaluationYear}
              onValueChange={(evaluationYear) =>
                setForm((f) => ({
                  ...f,
                  evaluationYear: evaluationYear ?? new Date().getFullYear(),
                }))
              }
            />
            <p className="text-muted small mb-0">
              กำหนดปีที่แสดงในคอลัมน์ &quot;ปี&quot; ของรายการรอบ — ไม่ต้องพึ่งวันเริ่มอย่างเดียว
            </p>
          </div>
          <div className="col-md-8">
            <label htmlFor="evaluationPeriod" className="form-label">
              ช่วงประเมิน
            </label>
            <select
              id="evaluationPeriod"
              name="evaluationPeriod"
              className="form-select"
              value={form.evaluationPeriod}
              onChange={(e) =>
                setForm((f) => ({ ...f, evaluationPeriod: e.target.value }))
              }
            >
              {EVALUATION_PERIODS.map((p) => (
                <option key={p.value} value={p.value}>
                  {p.label}
                </option>
              ))}
            </select>
          </div>
        </div>
        <div className="row g-3">
          <div className="col-md-6">
            <Input
              type="date"
              label="วันเริ่ม"
              name="startDate"
              value={form.startDate}
              onChange={(e) =>
                setForm((f) => ({ ...f, startDate: e.target.value }))
              }
            />
          </div>
          <div className="col-md-6">
            <Input
              type="date"
              label="วันสิ้นสุด"
              name="endDate"
              value={form.endDate}
              onChange={(e) =>
                setForm((f) => ({ ...f, endDate: e.target.value }))
              }
            />
          </div>
        </div>
        <hr className="my-4" />
        <RolePositionPermissionFields
          roles={masters.roles}
          positions={masters.positions}
          value={form.permissions}
          onChange={(permissions) => setForm((f) => ({ ...f, permissions }))}
        />
        <p className="text-muted small mb-0">
          สิทธิ์ด้านบนใช้ร่วมกันทุกหัวข้อหลัก — หัวข้อประเมินหลัก (HEAD) อยู่ด้านล่าง
        </p>
      </ErpCollapsePanel>

      <div className="mb-3">
        <Button type="button" variant="success" onClick={addHead}>
          + เพิ่มหัวข้อหลัก (HEAD)
        </Button>
      </div>

      {form.heads.length === 0 ? (
        <div className="alert text-center py-5 erp-panel erp-panel--head border-0">
          <p className="text-muted mb-2">ยังไม่มีหัวข้อหลักในแบบประเมินนี้</p>
          <Button type="button" variant="success" onClick={addHead}>
            เพิ่มหัวข้อหลักแรก
          </Button>
        </div>
      ) : (
        form.heads.map((head, index) => (
          <HeadFormBlock
            key={head.clientKey}
            head={head}
            index={index}
            onChange={(next) => updateHead(head.clientKey, next)}
            onRemove={() => removeHead(head.clientKey)}
          />
        ))
      )}
    </>
  );
}
