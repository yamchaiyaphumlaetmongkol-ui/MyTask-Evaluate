import packageJson from "../../package.json";

/** ค่าคงที่ของแอป — สอดคล้องกับ src/app/layout.tsx metadata */
export const APP_CONFIG = {
  name: packageJson.name,
  version: packageJson.version,
  title: "SS-Evaluate",
  tagline: "ระบบประเมิน",
  brandTitle: "กกน.",
  brandSub: "ระบบประเมิน",
  adminEmails: ["laetmongkol_y@softsquaregroup.com"],
} as const;

export function isAdminEmail(email: string | null | undefined): boolean {
  if (!email) return false;
  const normalized = email.trim().toLowerCase();
  return APP_CONFIG.adminEmails.some(
    (adminEmail) => adminEmail.toLowerCase() === normalized,
  );
}
