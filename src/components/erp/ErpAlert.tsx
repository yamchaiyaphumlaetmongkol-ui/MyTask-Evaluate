import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

type Variant = "danger" | "warning" | "success" | "info";

type Props = {
  children: ReactNode;
  variant?: Variant;
  className?: string;
};

/** แถบแจ้งเตือนมาตรฐ — padding เท่ากันทุกหน้า */
export function ErpAlert({ children, variant = "danger", className }: Props) {
  return (
    <div
      className={cn(
        "alert",
        `alert-${variant}`,
        "py-2",
        "mb-3",
        className,
      )}
      role="alert"
    >
      {children}
    </div>
  );
}
