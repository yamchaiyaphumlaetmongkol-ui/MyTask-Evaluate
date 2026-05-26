import type { ReactNode } from "react";

type Props = {
  children: ReactNode;
};

/** เนื้อหาหน้าหลัก — มี padding ไม่ชิดขอบ */
export function PageContent({ children }: Props) {
  return (
    <main className="erp-page-content">
      <div className="erp-page-inner">{children}</div>
    </main>
  );
}
