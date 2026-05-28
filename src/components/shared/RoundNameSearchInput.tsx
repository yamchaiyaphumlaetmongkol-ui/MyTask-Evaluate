import { ErpField } from "@/components/erp";

type Props = {
  id: string;
  name?: string;
  label?: string;
  defaultValue?: string;
  placeholder?: string;
};

/** ช่องพิมพ์ค้นหาชื่อรอบ / แบบประเมิน (ค้นหาแบบ contains) */
export function RoundNameSearchInput({
  id,
  name = "roundNameQ",
  label = "ชื่อรอบ / แบบประเมิน",
  defaultValue = "",
  placeholder = "พิมพ์ชื่อรอบหรือแบบประเมิน...",
}: Props) {
  return (
    <ErpField label={label} htmlFor={id}>
      <input
        id={id}
        type="search"
        name={name}
        className="form-control"
        defaultValue={defaultValue}
        placeholder={placeholder}
        autoComplete="off"
      />
    </ErpField>
  );
}
