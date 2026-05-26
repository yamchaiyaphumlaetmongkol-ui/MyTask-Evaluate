"use client";

import {
  ErpField,
  ErpSearchActions,
  ErpSearchActionsRow,
  ErpSearchFilterCol,
  ErpSearchFilterRows,
  ErpPanel,
  ErpFilterSelect,
  ErpSearchInput,
} from "@/components/erp";
import type { ErpSelectOption } from "@/components/erp/ErpSelect";

export type ClientTableTextFilterField = {
  kind?: "text";
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
};

export type ClientTableSelectFilterField = {
  kind: "select";
  id: string;
  label: string;
  value: string;
  options: ErpSelectOption[];
  onChange: (value: string) => void;
};

export type ClientTableFilterField =
  | ClientTableTextFilterField
  | ClientTableSelectFilterField;

function isSelectField(
  field: ClientTableFilterField,
): field is ClientTableSelectFilterField {
  return field.kind === "select";
}

type Props = {
  fields: ClientTableFilterField[];
  onClear?: () => void;
  className?: string;
};

/** แถวตัวกรองตาราง client-side — พิมพ์ค้นหา (หรือ dropdown ถ้าระบุ kind: select) */
export function ClientTableFilterPanel({
  fields,
  onClear,
  className = "mb-3",
}: Props) {
  return (
    <ErpPanel className={className}>
      <div className="erp-search-panel__body p-0 pt-1">
        <ErpSearchFilterRows>
          {fields.map((f) => (
            <ErpSearchFilterCol key={f.id}>
              <ErpField label={f.label} htmlFor={f.id}>
                {isSelectField(f) ? (
                  <ErpFilterSelect
                    id={f.id}
                    options={f.options}
                    value={f.value}
                    onChange={f.onChange}
                  />
                ) : (
                  <ErpSearchInput
                    id={f.id}
                    value={f.value}
                    placeholder={f.placeholder ?? "พิมพ์เพื่อค้นหา..."}
                    onChange={(e) => f.onChange(e.target.value)}
                  />
                )}
              </ErpField>
            </ErpSearchFilterCol>
          ))}
        </ErpSearchFilterRows>

        {onClear ? (
          <ErpSearchActionsRow>
            <ErpSearchActions
              showSubmit={false}
              onClear={onClear}
              clearLabel="ล้าง"
            />
          </ErpSearchActionsRow>
        ) : null}
      </div>
    </ErpPanel>
  );
}
