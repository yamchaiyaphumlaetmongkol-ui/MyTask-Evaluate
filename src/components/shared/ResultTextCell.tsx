type Props = {
  text: string | null | undefined;
  maxWidth?: string;
  className?: string;
};

/** แสดงรายละเอียดผลประเมิน — ว่างแสดง — มี tooltip เต็ม */
export function ResultTextCell({
  text,
  maxWidth = "14rem",
  className = "",
}: Props) {
  const value = text?.trim();
  if (!value) {
    return <span className="text-muted">—</span>;
  }

  if (className.includes("erp-eval-matrix__reason-text")) {
    return (
      <span className={className} title={value}>
        {value}
      </span>
    );
  }

  return (
    <span
      className={`d-inline-block text-truncate align-middle ${className}`.trim()}
      style={{ maxWidth }}
      title={value}
    >
      {value}
    </span>
  );
}
