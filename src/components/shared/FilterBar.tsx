"use client";

export interface FilterBarOption<T extends string = string> {
  value: T;
  label: string;
}

export interface FilterBarProps<T extends string = string> {
  statusOptions: FilterBarOption<T>[];
  statusValue: T;
  onStatusChange: (value: T) => void;
  searchValue: string;
  onSearchChange: (value: string) => void;
  onReset?: () => void;
  statusLabel?: string;
  searchLabel?: string;
}

export function FilterBar<T extends string = string>({
  statusOptions,
  statusValue,
  onStatusChange,
  searchValue,
  onSearchChange,
  onReset,
  statusLabel = "สถานะ",
  searchLabel = "ค้นหา",
}: FilterBarProps<T>) {
  return (
    <div className="card mb-3">
      <div className="card-body">
        <div className="row g-3 align-items-end">
          <div className="col-md-4">
            <label className="form-label">{statusLabel}</label>
            <select
              className="form-select"
              value={statusValue}
              onChange={(e) => onStatusChange(e.target.value as T)}
            >
              {statusOptions.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </div>
          <div className="col-md-6">
            <label className="form-label">{searchLabel}</label>
            <input
              type="search"
              className="form-control"
              value={searchValue}
              onChange={(e) => onSearchChange(e.target.value)}
            />
          </div>
          {onReset && (
            <div className="col-md-2">
              <button
                type="button"
                className="btn btn-outline-secondary w-100"
                onClick={onReset}
              >
                รีเซ็ต
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
