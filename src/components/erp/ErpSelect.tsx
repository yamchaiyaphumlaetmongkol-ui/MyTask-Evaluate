import { cn } from "@/lib/utils";
import type { SelectHTMLAttributes } from "react";

export type ErpSelectOption = {
  value: string;
  label: string;
};

type Props = Omit<SelectHTMLAttributes<HTMLSelectElement>, "children"> & {
  options: ErpSelectOption[];
  emptyLabel?: string;
};

/** select มาตรฐาน — มีตัวเลือก "ทั้งหมด" */
export function ErpSelect({
  options,
  emptyLabel = "— ทั้งหมด —",
  className,
  ...props
}: Props) {
  return (
    <select className={cn("form-select", className)} {...props}>
      <option value="">{emptyLabel}</option>
      {options.map((o) => (
        <option key={o.value} value={o.value}>
          {o.label}
        </option>
      ))}
    </select>
  );
}
