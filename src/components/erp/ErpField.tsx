import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

type Props = {
  label?: string;
  htmlFor?: string;
  hint?: string;
  error?: string;
  children: ReactNode;
  className?: string;
  required?: boolean;
};

/**
 * ห่อ label + control — label อยู่บนเสมอ
 * ใช้ใน grid: ใส่ภายใน col-* ไม่ต้องใส่ mb-3 ที่ control ซ้ำ
 */
export function ErpField({
  label,
  htmlFor,
  hint,
  error,
  children,
  className,
  required,
}: Props) {
  return (
    <div className={cn("erp-field", className)}>
      {label ? (
        <label htmlFor={htmlFor} className="form-label">
          {label}
          {required ? (
            <span className="text-danger ms-1" aria-hidden>
              *
            </span>
          ) : null}
        </label>
      ) : null}
      {children}
      {hint ? <div className="form-text">{hint}</div> : null}
      {error ? (
        <div className="invalid-feedback d-block">{error}</div>
      ) : null}
    </div>
  );
}
