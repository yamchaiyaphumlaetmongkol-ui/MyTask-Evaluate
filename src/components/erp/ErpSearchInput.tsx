import { cn } from "@/lib/utils";
import type { InputHTMLAttributes } from "react";

export type ErpSearchInputProps = InputHTMLAttributes<HTMLInputElement>;

/** ช่องค้นหา — ไอคอนแว่นซ้าย พื้นขาว */
export function ErpSearchInput({ className, type = "search", ...props }: ErpSearchInputProps) {
  return (
    <div className="input-group">
      <span className="input-group-text bg-white" aria-hidden>
        <i className="bi bi-search" />
      </span>
      <input
        type={type}
        className={cn("form-control", className)}
        autoComplete="off"
        {...props}
      />
    </div>
  );
}
