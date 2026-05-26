import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

type Props = {
  children: ReactNode;
  className?: string;
};

/** แถวปุ่มล่างฟอร์ม — ชิดขวา gap เท่ากัน */
export function ErpFormActions({ children, className }: Props) {
  return (
    <div
      className={cn(
        "d-flex flex-wrap gap-2 justify-content-end mt-3",
        className,
      )}
    >
      {children}
    </div>
  );
}
