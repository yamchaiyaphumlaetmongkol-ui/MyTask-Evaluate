import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

type Props = {
  children: ReactNode;
  className?: string;
};

/** หัวข้อหน้าหลัก — สีและน้ำหนักตาม theme */
export function ErpPageTitle({ children, className }: Props) {
  return (
    <h1 className={cn("h4 mb-4 erp-form-page-title", className)}>{children}</h1>
  );
}
