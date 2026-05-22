import packageJson from "../../package.json";

/** ค่าคงที่ของแอป — สอดคล้องกับ src/app/layout.tsx metadata */
export const APP_CONFIG = {
  name: packageJson.name,
  version: packageJson.version,
  title: "Evaluate",
  tagline: "Evaluate",
  brandTitle: "Evaluate",
  brandSub: "Evaluate",
} as const;
