"use client";

import type { EvaluationHeadDraft, EvaluationSubDraft } from "@/api/pe/pems01/types";
import { emptySubDraft } from "@/api/pe/pems01/types";
import { DetailTableEditor } from "@/components/pe/template-form/DetailTableEditor";
import { ErpCollapsePanel } from "@/components/shared/ErpCollapsePanel";
import { Button } from "@/components/ui/Button";
import { Textarea } from "@/components/ui/Textarea";

type Props = {
  head: EvaluationHeadDraft;
  sub: EvaluationSubDraft;
  index: number;
  onChange: (next: EvaluationHeadDraft) => void;
  onRemove: () => void;
};

export function SubFormBlock({ head, sub, index, onChange, onRemove }: Props) {
  const updateSub = (next: EvaluationSubDraft) => {
    onChange({
      ...head,
      subs: head.subs.map((s) => (s.clientKey === sub.clientKey ? next : s)),
    });
  };

  return (
    <ErpCollapsePanel
      level="sub"
      title={<>หัวข้อย่อย (SUB) #{index + 1}</>}
      actions={
        <Button type="button" variant="danger" size="sm" onClick={onRemove}>
          ลบหัวข้อย่อย
        </Button>
      }
    >
      <Textarea
        label="ชื่อหัวข้อย่อย"
        name={`sub-${sub.clientKey}`}
        rows={2}
        value={sub.subTopic}
        placeholder="กรอกหัวข้อย่อย"
        onChange={(e) => updateSub({ ...sub, subTopic: e.target.value })}
      />
      <DetailTableEditor sub={sub} onChange={updateSub} />
    </ErpCollapsePanel>
  );
}

type SubListProps = {
  head: EvaluationHeadDraft;
  onChange: (next: EvaluationHeadDraft) => void;
};

export function SubFormList({ head, onChange }: SubListProps) {
  const addSub = () => {
    onChange({ ...head, subs: [...head.subs, emptySubDraft()] });
  };

  const removeSub = (key: string) => {
    onChange({ ...head, subs: head.subs.filter((s) => s.clientKey !== key) });
  };

  return (
    <div className="mt-3 ps-2">
      <div className="d-flex justify-content-between align-items-center mb-2">
        <span className="fw-semibold text-erp-primary">หัวข้อย่อยภายใต้หัวข้อหลักนี้</span>
        <Button type="button" variant="success" size="sm" onClick={addSub}>
          + เพิ่มหัวข้อย่อย
        </Button>
      </div>

      {head.subs.length === 0 ? (
        <p className="text-muted small">ยังไม่มีหัวข้อย่อย — กดเพิ่มหัวข้อย่อย</p>
      ) : (
        head.subs.map((sub, i) => (
          <SubFormBlock
            key={sub.clientKey}
            head={head}
            sub={sub}
            index={i}
            onChange={onChange}
            onRemove={() => removeSub(sub.clientKey)}
          />
        ))
      )}
    </div>
  );
}
