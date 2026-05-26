import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

type Props = {
  children: ReactNode;
  className?: string;
};

/** ข้อความอธิบายใต้หัวข้อหน้า */
export function ErpPageIntro({ children, className }: Props) {
  return <p className={cn("text-muted small mb-3", className)}>{children}</p>;
}
