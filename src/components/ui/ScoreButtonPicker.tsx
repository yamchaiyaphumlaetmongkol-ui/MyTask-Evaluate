"use client";

import { cn } from "@/lib/utils";

type Props = {
  label?: string;
  value: number | null;
  onChange: (value: number | null) => void;
  min: number;
  max: number;
  disabled?: boolean;
  hint?: string;
  className?: string;
};

function isIntegerRange(min: number, max: number): boolean {
  return Number.isInteger(min) && Number.isInteger(max);
}

function buildValues(min: number, max: number): number[] {
  if (max < min) return [];
  if (isIntegerRange(min, max)) {
    const values: number[] = [];
    for (let i = min; i <= max; i += 1) values.push(i);
    return values;
  }

  // fallback for decimal ranges: 0.5 step for predictable button count
  const step = 0.5;
  const values: number[] = [];
  const guard = 500;
  for (let i = 0; i < guard; i += 1) {
    const next = Number((min + i * step).toFixed(2));
    if (next > max + 0.000001) break;
    values.push(next);
  }
  return values;
}

function formatValue(v: number): string {
  if (Number.isInteger(v)) return String(v);
  return v.toFixed(1).replace(/\.0$/, "");
}

export function ScoreButtonPicker({
  label,
  value,
  onChange,
  min,
  max,
  disabled = false,
  hint,
  className,
}: Props) {
  const values = buildValues(min, max);

  return (
    <div className={cn("erp-score-picker", className)}>
      {label && <label className="form-label mb-2">{label}</label>}

      <div className="erp-score-picker__scroll" role="group" aria-label={label ?? "คะแนน"}>
        <div className="erp-score-picker__grid">
          {values.map((v) => {
            const active = value != null && Math.abs(value - v) < 0.000001;
            return (
              <button
                key={v}
                type="button"
                className={cn(
                  "btn btn-sm erp-score-picker__btn",
                  active ? "btn-success" : "btn-outline-secondary",
                )}
                aria-pressed={active}
                onClick={() => onChange(v)}
                disabled={disabled}
              >
                {formatValue(v)}
              </button>
            );
          })}
        </div>
      </div>

      {hint ? <div className="form-text mt-2">{hint}</div> : null}
    </div>
  );
}
