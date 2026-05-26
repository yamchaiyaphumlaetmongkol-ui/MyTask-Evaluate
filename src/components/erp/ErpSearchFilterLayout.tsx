import { Children, type ReactNode } from "react";

/** 1 ช่องในกริดค้นหา — แถวละ 6 คอลัมน์บนจอใหญ่ (ตาม mockup) */
export const ERP_SEARCH_FILTER_COL = "col-6 col-md-4 col-lg-2";

export function ErpSearchFilterCol({ children }: { children: ReactNode }) {
  return <div className={ERP_SEARCH_FILTER_COL}>{children}</div>;
}

/** แถวปุ่มค้นหา/ล้าง — กึ่งกลางใต้กริด */
export function ErpSearchActionsRow({ children }: { children: ReactNode }) {
  return (
    <div className="row g-3 erp-search-actions-row">
      <div className="col-12 d-flex justify-content-center">
        {children}
      </div>
    </div>
  );
}

/** แบ่งช่องกรองเป็นหลายแถว แถวละไม่เกิน 6 คอลัมน์ */
export function ErpSearchFilterRows({ children }: { children: ReactNode }) {
  const rows: ReactNode[][] = [];
  const flat = Children.toArray(children).filter(Boolean);
  for (let i = 0; i < flat.length; i += 6) {
    rows.push(flat.slice(i, i + 6));
  }
  return (
    <>
      {rows.map((row, index) => (
        <div key={index} className="row g-3 align-items-end">
          {row}
        </div>
      ))}
    </>
  );
}
