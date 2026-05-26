type Props = {
  rows?: number;
  columns?: number;
};

/** โหลดเฉพาะตาราง — ใช้เป็น Suspense fallback */
export function ErpTableSkeleton({ rows = 6, columns = 6 }: Props) {
  return (
    <div
      className="erp-table-skeleton card border-0 shadow-sm"
      role="status"
      aria-live="polite"
      aria-label="กำลังโหลดตาราง"
    >
      <div className="card-body p-0">
        <div className="erp-table-skeleton__head d-none d-md-grid">
          {Array.from({ length: columns }, (_, i) => (
            <span
              key={`h-${i}`}
              className="erp-table-skeleton__bar erp-table-skeleton__bar--head"
            />
          ))}
        </div>
        {Array.from({ length: rows }, (_, row) => (
          <div key={row} className="erp-table-skeleton__row">
            {Array.from({ length: columns }, (_, col) => (
              <span
                key={`${row}-${col}`}
                className="erp-table-skeleton__bar"
                style={{ width: `${55 + ((row + col) % 4) * 10}%` }}
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
