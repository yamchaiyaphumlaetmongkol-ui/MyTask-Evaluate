"use client";

import { cn } from "@/lib/utils";
import { useEffect, useId, useRef, useState } from "react";

export type CheckboxDropdownItem = { code: string; name: string };

type Props = {
  label: string;
  items: CheckboxDropdownItem[];
  allLabel?: string;
  allChecked: boolean;
  onAllChange: (checked: boolean) => void;
  selected: string[];
  onToggle: (code: string) => void;
  disabled?: boolean;
  emptyText?: string;
};

function buildSummary(
  label: string,
  items: CheckboxDropdownItem[],
  allChecked: boolean,
  selected: string[],
  emptyText: string,
): string {
  if (items.length === 0) return emptyText;
  if (allChecked) return `${label}: ทั้งหมด`;
  if (selected.length === 0) return `${label}: — เลือก —`;
  const names = items
    .filter((i) => selected.includes(i.code))
    .map((i) => i.name);
  if (names.length <= 2) return `${label}: ${names.join(", ")}`;
  return `${label}: เลือกแล้ว ${names.length} รายการ`;
}

export function CheckboxDropdown({
  label,
  items,
  allLabel = "ทั้งหมด",
  allChecked,
  onAllChange,
  selected,
  onToggle,
  disabled,
  emptyText = "ไม่มีข้อมูล",
}: Props) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const menuId = useId();

  useEffect(() => {
    if (!open) return;
    const onDocClick = (e: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, [open]);

  const summary = buildSummary(label, items, allChecked, selected, emptyText);

  return (
    <div ref={rootRef} className={cn("dropdown w-100", open && "show")}>
      <button
        type="button"
        className="btn btn-outline-secondary dropdown-toggle w-100 text-start d-flex align-items-center justify-content-between"
        disabled={disabled || items.length === 0}
        aria-expanded={open}
        aria-controls={menuId}
        onClick={() => setOpen((v) => !v)}
      >
        <span className="text-truncate me-2">{summary}</span>
      </button>
      <div
        id={menuId}
        className={cn("dropdown-menu w-100 p-0 shadow-sm", open && "show")}
        style={{ maxHeight: "16rem", overflowY: "auto" }}
      >
        <div className="px-3 py-2 border-bottom bg-light">
          <span className="small fw-semibold text-secondary">{label}</span>
        </div>
        <div className="p-2">
          <div className="form-check border-bottom pb-2 mb-2">
            <input
              className="form-check-input"
              type="checkbox"
              id={`${menuId}-all`}
              checked={allChecked}
              disabled={disabled}
              onChange={(e) => onAllChange(e.target.checked)}
            />
            <label className="form-check-label fw-semibold" htmlFor={`${menuId}-all`}>
              {allLabel}
            </label>
          </div>
          {items.length === 0 ? (
            <p className="small text-muted mb-0 px-1">{emptyText}</p>
          ) : (
            items.map((item) => (
              <div key={item.code} className="form-check py-1">
                <input
                  className="form-check-input"
                  type="checkbox"
                  id={`${menuId}-${item.code}`}
                  checked={selected.includes(item.code)}
                  disabled={disabled || allChecked}
                  onChange={() => onToggle(item.code)}
                />
                <label className="form-check-label" htmlFor={`${menuId}-${item.code}`}>
                  {item.name}
                </label>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
