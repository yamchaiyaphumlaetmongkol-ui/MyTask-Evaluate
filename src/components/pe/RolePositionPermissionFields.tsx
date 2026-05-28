"use client";

import type { MasterPosition, MasterRole, TopicPermissionSelection } from "@/api/pe/pems01/types";
import { CheckboxDropdown } from "@/components/ui/CheckboxDropdown";

type Props = {
  roles: MasterRole[];
  positions: MasterPosition[];
  value: TopicPermissionSelection;
  onChange: (next: TopicPermissionSelection) => void;
  mastersLoading?: boolean;
};

function toggleCode(list: string[], code: string): string[] {
  return list.includes(code) ? list.filter((c) => c !== code) : [...list, code];
}

export function RolePositionPermissionFields({
  roles,
  positions,
  value,
  onChange,
  mastersLoading = false,
}: Props) {
  const patch = (partial: Partial<TopicPermissionSelection>) =>
    onChange({ ...value, ...partial });

  const disabled = mastersLoading;
  const emptyText = mastersLoading ? "กำลังโหลด..." : "ไม่มีข้อมูลในระบบ";

  return (
    <div className="pe-permission-fields">
      <fieldset className="mb-4">
        <legend className="fs-6 fw-semibold mb-3">สิทธิ์แก้ไข</legend>
        <div className="row g-3">
          <div className="col-md-6">
            <CheckboxDropdown
              label="บทบาท"
              items={roles}
              allLabel="ทั้งหมด (บทบาท)"
              allChecked={value.editAllRoles}
              onAllChange={(checked) =>
                patch({
                  editAllRoles: checked,
                  editRoleCodes: checked ? [] : value.editRoleCodes,
                })
              }
              selected={value.editRoleCodes}
              onToggle={(code) =>
                patch({ editRoleCodes: toggleCode(value.editRoleCodes, code) })
              }
              disabled={disabled}
              emptyText={emptyText}
            />
          </div>
          <div className="col-md-6">
            <CheckboxDropdown
              label="ตำแหน่ง"
              items={positions}
              allLabel="ทั้งหมด (ตำแหน่ง)"
              allChecked={value.editAllPositions}
              onAllChange={(checked) =>
                patch({
                  editAllPositions: checked,
                  editPositionCodes: checked ? [] : value.editPositionCodes,
                })
              }
              selected={value.editPositionCodes}
              onToggle={(code) =>
                patch({ editPositionCodes: toggleCode(value.editPositionCodes, code) })
              }
              disabled={disabled}
              emptyText={emptyText}
            />
          </div>
        </div>
      </fieldset>

      <fieldset>
        <legend className="fs-6 fw-semibold mb-3">
          สิทธิ์ประเมินคนอื่น (manager — ESSPETS04)
        </legend>
        <p className="text-muted small mb-3">
          กำหนด role / ตำแหน่งที่เข้ามาประเมินพนักงานที่ทำ self แล้วได้
        </p>
        <div className="row g-3">
          <div className="col-md-6">
            <CheckboxDropdown
              label="บทบาท"
              items={roles}
              allLabel="ทั้งหมด (บทบาท)"
              allChecked={value.evaluateAllRoles}
              onAllChange={(checked) =>
                patch({
                  evaluateAllRoles: checked,
                  evaluateRoleCodes: checked ? [] : value.evaluateRoleCodes,
                })
              }
              selected={value.evaluateRoleCodes}
              onToggle={(code) =>
                patch({ evaluateRoleCodes: toggleCode(value.evaluateRoleCodes, code) })
              }
              disabled={disabled}
              emptyText={emptyText}
            />
          </div>
          <div className="col-md-6">
            <CheckboxDropdown
              label="ตำแหน่ง"
              items={positions}
              allLabel="ทั้งหมด (ตำแหน่ง)"
              allChecked={value.evaluateAllPositions}
              onAllChange={(checked) =>
                patch({
                  evaluateAllPositions: checked,
                  evaluatePositionCodes: checked ? [] : value.evaluatePositionCodes,
                })
              }
              selected={value.evaluatePositionCodes}
              onToggle={(code) =>
                patch({
                  evaluatePositionCodes: toggleCode(value.evaluatePositionCodes, code),
                })
              }
              disabled={disabled}
              emptyText={emptyText}
            />
          </div>
        </div>
      </fieldset>
    </div>
  );
}
