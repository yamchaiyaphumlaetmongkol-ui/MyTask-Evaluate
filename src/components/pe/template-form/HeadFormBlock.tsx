"use client";

import type { EvaluationHeadDraft, PeMasters } from "@/api/pe/pems01/types";
import { RolePositionPermissionFields } from "@/components/pe/RolePositionPermissionFields";
import { SubFormList } from "@/components/pe/template-form/SubFormBlock";
import { ErpCollapsePanel } from "@/components/shared/ErpCollapsePanel";
import { Button } from "@/components/ui/Button";
import { NumberInput } from "@/components/ui/NumberInput";
import { Textarea } from "@/components/ui/Textarea";

type Props = {
  head: EvaluationHeadDraft;
  index: number;
  masters: PeMasters;
  onChange: (next: EvaluationHeadDraft) => void;
  onRemove: () => void;
};

export function HeadFormBlock({
  head,
  index,
  masters,
  onChange,
  onRemove,
}: Props) {
  const badge = head.id ? (
    <span className="badge erp-badge-edit ms-2 fw-normal">แก้ไข</span>
  ) : (
    <span className="badge erp-badge-new ms-2 fw-normal">ใหม่</span>
  );

  return (
    <ErpCollapsePanel
      level="head"
      className="mb-4"
      title={<>หัวข้อหลัก (HEAD) #{index + 1}</>}
      badge={badge}
      actions={
        <Button type="button" variant="danger" size="sm" onClick={onRemove}>
          ลบหัวข้อหลัก
        </Button>
      }
    >
      <Textarea
        label="หัวข้อประเมินหลัก"
        name={`head-topic-${head.clientKey}`}
        rows={2}
        value={head.headTopic}
        placeholder="กรอกหัวข้อประเมินหลัก"
        onChange={(e) => onChange({ ...head, headTopic: e.target.value })}
      />
      <div className="row">
        <div className="col-auto">
          <NumberInput
            label="สัดส่วน (%)"
            name={`head-proportion-${head.clientKey}`}
            className="erp-input-number--sm"
            min={0}
            max={100}
            integer
            value={head.proportion}
            onValueChange={(proportion) =>
              onChange({ ...head, proportion: proportion ?? 0 })
            }
          />
        </div>
      </div>

      <RolePositionPermissionFields
        roles={masters.roles}
        positions={masters.positions}
        value={head.permissions}
        onChange={(permissions) => onChange({ ...head, permissions })}
      />

      <SubFormList head={head} onChange={onChange} />
    </ErpCollapsePanel>
  );
}
