type Props = {
  src: string | null;
  name: string;
  size?: number;
};

export function EmployeeAvatar({ src, name, size = 36 }: Props) {
  if (src) {
    return (
      <img
        src={src}
        alt=""
        width={size}
        height={size}
        className="erp-emp-avatar"
        loading="lazy"
        decoding="async"
      />
    );
  }
  const initial = name.trim().charAt(0).toUpperCase() || "?";
  return (
    <span
      className="erp-emp-avatar erp-emp-avatar--placeholder"
      style={{ width: size, height: size }}
      aria-hidden
    >
      {initial}
    </span>
  );
}
