"use client";

import { ErpField, ErpFilterSelect } from "@/components/erp";
import type { ErpSelectOption } from "@/components/erp/ErpSelect";
import { cn } from "@/lib/utils";

export type SelectOption = ErpSelectOption;

type Props = {
  id?: string;
  label: string;
  options: SelectOption[];
  value: string;
  onChange: (value: string) => void;
  emptyLabel?: string;
  searchPlaceholder?: string;
  className?: string;
  labelClassName?: string;
  disabled?: boolean;
  name?: string;
};

/** เลือกรายการเดียว + label — ห่อ ErpFilterSelect (ค้นหาใน dropdown อัตโนมัติ) */
export function SearchableSingleSelect({
  id,
  label,
  options,
  value,
  onChange,
  emptyLabel = "— เลือก —",
  searchPlaceholder = "ค้นหา...",
  className,
  labelClassName,
  disabled = false,
  name,
}: Props) {
  return (
    <div className={cn(className)}>
      <ErpField label={label} htmlFor={id} className={labelClassName}>
        <ErpFilterSelect
          id={id}
          name={name}
          options={options}
          value={value}
          onChange={onChange}
          emptyLabel={emptyLabel}
          searchPlaceholder={searchPlaceholder}
          searchable
          disabled={disabled}
        />
      </ErpField>
    </div>
  );
}
