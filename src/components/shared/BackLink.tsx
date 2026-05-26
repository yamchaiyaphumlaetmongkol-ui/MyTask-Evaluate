import Link from "next/link";
import type { ReactNode } from "react";

type Props = {
  href: string;
  children: ReactNode;
  className?: string;
};

/** ลิงก์กลับ — ใช้สไตล์ปุ่ม outline ไม่ใช่ btn-link */
export function BackLink({ href, children, className = "" }: Props) {
  return (
    <Link
      href={href}
      className={`btn btn-outline-secondary btn-sm ${className}`.trim()}
    >
      ← {children}
    </Link>
  );
}
