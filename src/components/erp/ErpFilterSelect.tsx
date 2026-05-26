"use client";

import { filterBySearch } from "@/lib/filter-rows";
import { cn } from "@/lib/utils";
import { useEffect, useId, useMemo, useRef, useState } from "react";
import type { ErpSelectOption } from "./ErpSelect";

const SEARCH_THRESHOLD = 8;

export type ErpFilterSelectProps = {
  id?: string;
  name?: string;
  options: ErpSelectOption[];
  emptyLabel?: string;
  defaultValue?: string;
  value?: string;
  onChange?: (value: string) => void;
  disabled?: boolean;
  /** true = มีช่องค้นหา, false = ไม่มี, ไม่ระบุ = เปิดเมื่อรายการ ≥ 8 */
  searchable?: boolean;
  searchPlaceholder?: string;
  className?: string;
};

function resolveSearchable(
  options: ErpSelectOption[],
  searchable: boolean | undefined,
): boolean {
  if (searchable === true) return true;
  if (searchable === false) return false;
  return options.length >= SEARCH_THRESHOLD;
}

/** Dropdown ตัวกรอง — ใช้กับ ErpField, รองรับฟอร์ม GET และ client filter */
export function ErpFilterSelect({
  id: idProp,
  name,
  options,
  emptyLabel = "— ทั้งหมด —",
  defaultValue = "",
  value: valueProp,
  onChange,
  disabled = false,
  searchable,
  searchPlaceholder = "ค้นหา...",
  className,
}: ErpFilterSelectProps) {
  const autoId = useId();
  const id = idProp ?? autoId;
  const rootRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);

  const isControlled = valueProp !== undefined;
  const [internal, setInternal] = useState(defaultValue);
  const value = isControlled ? valueProp : internal;

  useEffect(() => {
    if (!isControlled) setInternal(defaultValue);
  }, [defaultValue, isControlled]);

  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");

  const withSearch = resolveSearchable(options, searchable);
  const selected = options.find((o) => o.value === value);

  const filtered = useMemo(
    () =>
      withSearch ? filterBySearch(options, search, (o) => o.label) : options,
    [options, search, withSearch],
  );

  const displayLabel = selected?.label ?? emptyLabel;

  useEffect(() => {
    if (!open || !withSearch) return;
    const t = window.setTimeout(() => searchRef.current?.focus(), 0);
    return () => window.clearTimeout(t);
  }, [open, withSearch]);

  useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) {
        setOpen(false);
        setSearch("");
      }
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, [open]);

  const pick = (next: string) => {
    if (!isControlled) setInternal(next);
    onChange?.(next);
    setOpen(false);
    setSearch("");
  };

  const toggle = () => {
    if (disabled) return;
    setOpen((o) => {
      if (o) setSearch("");
      return !o;
    });
  };

  return (
    <div
      ref={rootRef}
      className={cn(
        "erp-filter-select",
        open && "erp-filter-select--open",
        disabled && "erp-filter-select--disabled",
        className,
      )}
    >
      {name ? <input type="hidden" name={name} value={value} /> : null}

      <button
        id={id}
        type="button"
        className={cn(
          "erp-filter-select__trigger",
          !selected && "erp-filter-select__trigger--placeholder",
        )}
        aria-haspopup="listbox"
        aria-expanded={open}
        disabled={disabled}
        onClick={toggle}
        onKeyDown={(e) => {
          if (e.key === "Escape" && open) {
            e.preventDefault();
            setOpen(false);
            setSearch("");
          }
        }}
      >
        <span className="erp-filter-select__value text-truncate">
          {displayLabel}
        </span>
        <i
          className={cn(
            "bi erp-filter-select__chevron flex-shrink-0",
            open ? "bi-chevron-up" : "bi-chevron-down",
          )}
          aria-hidden
        />
      </button>

      {open && (
        <div className="erp-filter-select__menu shadow" role="listbox">
          {withSearch ? (
            <div className="erp-filter-select__search">
              <div className="input-group input-group-sm">
                <span className="input-group-text" aria-hidden>
                  <i className="bi bi-search" />
                </span>
                <input
                  ref={searchRef}
                  type="search"
                  className="form-control"
                  placeholder={searchPlaceholder}
                  value={search}
                  autoComplete="off"
                  aria-label={searchPlaceholder}
                  onChange={(e) => setSearch(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Escape") {
                      setOpen(false);
                      setSearch("");
                    }
                  }}
                />
              </div>
            </div>
          ) : null}

          <div className="erp-filter-select__list">
            <button
              type="button"
              className={cn(
                "erp-filter-select__option",
                value === "" && "erp-filter-select__option--active",
              )}
              role="option"
              aria-selected={value === ""}
              onClick={() => pick("")}
            >
              <span className="erp-filter-select__option-label">
                {emptyLabel}
              </span>
              {value === "" ? (
                <i className="bi bi-check2 erp-filter-select__check" aria-hidden />
              ) : null}
            </button>

            {filtered.length === 0 ? (
              <p className="erp-filter-select__empty">ไม่พบรายการ</p>
            ) : (
              filtered.map((o) => (
                <button
                  key={o.value}
                  type="button"
                  className={cn(
                    "erp-filter-select__option",
                    o.value === value && "erp-filter-select__option--active",
                  )}
                  role="option"
                  aria-selected={o.value === value}
                  onClick={() => pick(o.value)}
                >
                  <span className="erp-filter-select__option-label">
                    {o.label}
                  </span>
                  {o.value === value ? (
                    <i
                      className="bi bi-check2 erp-filter-select__check"
                      aria-hidden
                    />
                  ) : null}
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
