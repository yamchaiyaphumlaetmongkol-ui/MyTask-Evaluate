import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

type Props = {
  children: ReactNode;
  className?: string;
};

/** แถวฟอร์มหลายคอลัมน์ — align ปุ่มกับช่องล่าง */
export function ErpFormRow({ children, className }: Props) {
  return <div className={cn("row g-3 align-items-end", className)}>{children}</div>;
}
