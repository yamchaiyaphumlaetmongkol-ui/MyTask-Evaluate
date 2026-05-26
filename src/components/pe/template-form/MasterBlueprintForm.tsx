"use client";

import { saveMasterBlueprint } from "@/api/pe/pems01/save_master_blueprint";
import {
  emptyHeadDraft,
  type EvaluationHeadDraft,
  type MasterBlueprintFormState,
  type PeMasters,
} from "@/api/pe/pems01/types";
import { HeadFormBlock } from "@/components/pe/template-form/HeadFormBlock";
import { CreateRoundPanel } from "@/components/pe/template-form/CreateRoundPanel";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { ErpCollapsePanel } from "@/components/shared/ErpCollapsePanel";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

type Props = {
  initialState: MasterBlueprintFormState;
  masters: PeMasters;
  mode: "new" | "edit";
};

export function MasterBlueprintForm({ initialState, masters, mode }: Props) {
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
    const name = form.masterName.trim();
    if (!name) {
      setError("กรุณากรอกชื่อแม่แบบ");
      return;
    }
    if (form.heads.length === 0) {
      setError("กรุณาเพิ่มหัวข้อประเมินหลักอย่างน้อย 1 รายการ");
      return;
    }

    const payload = {
      masterId: form.masterId,
      masterName: name,
      description: form.description.trim(),
      heads: form.heads.map((h) => ({
        id: h.id,
        headTopic: h.headTopic.trim(),
        proportion: h.proportion,
        permissions: h.permissions,
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
    const res = await saveMasterBlueprint(payload);
    setSaving(false);

    if (!res.ok) {
      setError(res.error);
      return;
    }

    router.push(
      `/pe/pems01/master/form?masterId=${encodeURIComponent(res.data.masterId)}`,
    );
    router.refresh();
  };

  return (
    <>
      <div className="d-flex flex-wrap justify-content-between align-items-center gap-2 mb-4">
        <div>
          <h1 className="h4 mb-1 erp-form-page-title">
            {mode === "edit" ? "แก้ไขแม่แบบ" : "สร้างแม่แบบแบบประเมิน"}
          </h1>
          <p className="text-muted small mb-0">
            แม่แบบเก็บโครงสร้างคำถามและสิทธิ์ — เปิดรอบใหม่จะคัดลอก snapshot ไปรอบที่ใช้งานจริง
          </p>
        </div>
        <div className="d-flex gap-2">
          <Link href="/pe/pems01/masters" className="btn btn-outline-secondary">
            ยกเลิก
          </Link>
          <Button
            type="button"
            variant="success"
            disabled={saving}
            onClick={handleSave}
          >
            {saving ? "กำลังบันทึก..." : "บันทึกแม่แบบ"}
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
        title="ข้อมูลแม่แบบ"
        className="mb-4"
      >
        <Input
          label="ชื่อแม่แบบ"
          name="masterName"
          value={form.masterName}
          placeholder="เช่น แบบประเมินผลงานประจำปี"
          onChange={(e) =>
            setForm((f) => ({ ...f, masterName: e.target.value }))
          }
        />
        <div className="mb-3">
          <label htmlFor="masterDescription" className="form-label">
            คำอธิบาย (ถ้ามี)
          </label>
          <textarea
            id="masterDescription"
            className="form-control"
            rows={2}
            value={form.description}
            onChange={(e) =>
              setForm((f) => ({ ...f, description: e.target.value }))
            }
          />
        </div>
      </ErpCollapsePanel>

      {form.masterId && (
        <CreateRoundPanel
          masterId={form.masterId}
          masterName={form.masterName}
          className="mb-4"
        />
      )}

      <div className="mb-3">
        <Button type="button" variant="success" onClick={addHead}>
          + เพิ่มหัวข้อหลัก (HEAD)
        </Button>
      </div>

      {form.heads.length === 0 ? (
        <div className="alert text-center py-5 erp-panel erp-panel--head border-0">
          <p className="text-muted mb-2">ยังไม่มีหัวข้อหลักในแม่แบบนี้</p>
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
            masters={masters}
            onChange={(next) => updateHead(head.clientKey, next)}
            onRemove={() => removeHead(head.clientKey)}
          />
        ))
      )}
    </>
  );
}
