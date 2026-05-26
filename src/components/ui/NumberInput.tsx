"use client";

import { cn } from "@/lib/utils";
import {
  useEffect,
  useRef,
  useState,
  type FocusEvent,
  type InputHTMLAttributes,
} from "react";

export interface NumberInputProps
  extends Omit<
    InputHTMLAttributes<HTMLInputElement>,
    "type" | "value" | "onChange" | "defaultValue"
  > {
  label?: string;
  error?: string;
  hint?: string;
  value: number | null | undefined;
  onValueChange: (value: number | null) => void;
  /** จำนวนเต็ม (default) — ไม่มีจุดทศนิยม */
  integer?: boolean;
  /** ว่างได้ → ส่ง null */
  nullable?: boolean;
  /** ไม่ใส่ margin ล่าง */
  compact?: boolean;
  /** แสดงเฉพาะ input (ใช้ในตาราง) */
  inline?: boolean;
}

function formatDisplay(
  value: number | null | undefined,
  integer: boolean,
): string {
  if (value == null || Number.isNaN(value)) return "";
  return integer ? String(Math.trunc(value)) : String(value);
}

function parseText(text: string, integer: boolean): number | null {
  const trimmed = text.trim();
  if (trimmed === "") return null;
  const n = integer ? Number.parseInt(trimmed, 10) : Number.parseFloat(trimmed);
  return Number.isNaN(n) ? null : n;
}

function clampValue(
  value: number,
  min?: number | string,
  max?: number | string,
): number {
  let next = value;
  if (min != null && min !== "") next = Math.max(next, Number(min));
  if (max != null && max !== "") next = Math.min(next, Number(max));
  return next;
}

function isTypingAllowed(raw: string, integer: boolean): boolean {
  if (raw === "") return true;
  return integer ? /^\d+$/.test(raw) : /^-?\d*\.?\d*$/.test(raw);
}

export function NumberInput({
  label,
  error,
  hint,
  className,
  id,
  name,
  value,
  onValueChange,
  integer = true,
  nullable = false,
  compact = false,
  inline = false,
  min,
  max,
  onBlur,
  disabled,
  ...props
}: NumberInputProps) {
  const inputId = id ?? name;
  const editingRef = useRef(false);
  const [text, setText] = useState(() => formatDisplay(value, integer));

  useEffect(() => {
    if (editingRef.current) return;
    setText(formatDisplay(value, integer));
  }, [value, integer]);

  const commit = (raw: string) => {
    const parsed = parseText(raw, integer);
    if (parsed == null) {
      onValueChange(nullable ? null : 0);
      setText("");
      return;
    }
    const next = clampValue(parsed, min, max);
    onValueChange(next);
    setText(formatDisplay(next, integer));
  };

  const handleBlur = (e: FocusEvent<HTMLInputElement>) => {
    editingRef.current = false;
    commit(e.target.value);
    onBlur?.(e);
  };

  const inputEl = (
    <input
      id={inputId}
      name={name}
      type="text"
      inputMode={integer ? "numeric" : "decimal"}
      autoComplete="off"
      disabled={disabled}
      className={cn(
        "form-control erp-number-input",
        error && "is-invalid",
        className,
      )}
      value={text}
      onChange={(e) => {
        editingRef.current = true;
        const raw = e.target.value;
        if (!isTypingAllowed(raw, integer)) return;
        setText(raw);
      }}
      onBlur={handleBlur}
      {...props}
    />
  );

  if (inline) return inputEl;

  return (
    <div className={cn(!compact && "mb-3")}>
      {label && (
        <label htmlFor={inputId} className="form-label">
          {label}
        </label>
      )}
      {inputEl}
      {error && <div className="invalid-feedback d-block">{error}</div>}
      {!error && hint && <div className="form-text">{hint}</div>}
    </div>
  );
}
