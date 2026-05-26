"use client";

type Props = {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  label?: string;
  className?: string;
};

/** ช่องค้นหาสำหรับหน้าที่มีตาราง — ใช้ร่วมกับ client filter */
export function TableSearchBar({
  value,
  onChange,
  placeholder = "ค้นหา...",
  label = "ค้นหา",
  className = "mb-3",
}: Props) {
  return (
    <div className={className}>
      <label className="form-label visually-hidden" htmlFor="table-search">
        {label}
      </label>
      <div className="input-group">
        <span className="input-group-text bg-white" aria-hidden>
          <i className="bi bi-search" />
        </span>
        <input
          id="table-search"
          type="search"
          className="form-control"
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          autoComplete="off"
        />
        {value ? (
          <button
            type="button"
            className="btn btn-outline-secondary"
            aria-label="ล้างคำค้นหา"
            onClick={() => onChange("")}
          >
            <i className="bi bi-x-lg" />
          </button>
        ) : null}
      </div>
    </div>
  );
}
