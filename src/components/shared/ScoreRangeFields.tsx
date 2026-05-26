"use client";

import { NumberInput } from "@/components/ui/NumberInput";
import { cn } from "@/lib/utils";

export type ScoreRangeValue = {
  minScore: string;
  maxScore: string;
};

type Props = {
  value: ScoreRangeValue;
  onChange: (next: ScoreRangeValue) => void;
  minLabel?: string;
  maxLabel?: string;
  error?: string;
  disabled?: boolean;
  className?: string;
};

export function ScoreRangeFields({
  value,
  onChange,
  minLabel = "คะแนนต่ำสุด",
  maxLabel = "คะแนนสูงสุด",
  error,
  disabled,
  className,
}: Props) {
  return (
    <div className={cn(className)}>
      <div className="row g-3">
        <div className="col-md-6">
          <NumberInput
            integer={false}
            min={0}
            label={minLabel}
            name="minScore"
            value={value.minScore === "" ? null : Number(value.minScore)}
            disabled={disabled}
            error={error}
            onValueChange={(n) =>
              onChange({ ...value, minScore: n == null ? "" : String(n) })
            }
          />
        </div>
        <div className="col-md-6">
          <NumberInput
            integer={false}
            min={0}
            label={maxLabel}
            name="maxScore"
            value={value.maxScore === "" ? null : Number(value.maxScore)}
            disabled={disabled}
            onValueChange={(n) =>
              onChange({ ...value, maxScore: n == null ? "" : String(n) })
            }
          />
        </div>
      </div>
    </div>
  );
}
