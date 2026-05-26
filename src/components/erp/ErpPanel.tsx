import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

type Props = {
  children: ReactNode;
  className?: string;
  bodyClassName?: string;
};

/** กล่องเนื้อหา — พื้นหลังขาว ขอบ theme */
export function ErpPanel({ children, className, bodyClassName }: Props) {
  return (
    <div className={cn("card erp-panel border-0", className)}>
      <div className={cn("card-body", bodyClassName)}>{children}</div>
    </div>
  );
}
