"use client";

import { useEffect, useRef } from "react";

type Props = {
  filteredCount: number;
  allSelected: boolean;
  someSelected: boolean;
  onToggleAll: () => void;
  label?: string;
};

/** แถบเลือกทั้งหมดในรายการที่ filter แล้ว (ใช้คู่ TableSearchBar) */
export function FilteredSelectAllBar({
  filteredCount,
  allSelected,
  someSelected,
  onToggleAll,
  label = "เลือกทั้งหมดในผลการค้นหา",
}: Props) {
  const ref = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (ref.current) {
      ref.current.indeterminate = someSelected && !allSelected;
    }
  }, [someSelected, allSelected]);

  if (filteredCount === 0) return null;

  return (
    <label className="d-flex align-items-center gap-2 py-2 px-2 mb-0 border-bottom bg-light rounded-top user-select-none">
      <input
        ref={ref}
        type="checkbox"
        className="form-check-input mt-0"
        checked={allSelected}
        onChange={onToggleAll}
        aria-label={label}
      />
      <span className="small fw-semibold text-erp-primary">
        {label} ({filteredCount} รายการ)
      </span>
    </label>
  );
}
