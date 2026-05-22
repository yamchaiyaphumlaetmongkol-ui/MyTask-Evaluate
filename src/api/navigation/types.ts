/**
 * ตัวแทนตาราง menu ใน DB (flat rows) → build เป็น tree สำหรับ Sidebar
 */

export type MenuItemType = "folder" | "page";

/** แถวในตาราง menu — ใส่ใน menu.json แบบ flat */
export interface MenuRow {
  id: string;
  parentId: string | null;
  type: MenuItemType;
  /** page: route ที่เปิดได้ | folder: ไม่นำทาง ใส่ null — กดแล้วหุบ/กาง children เท่านั้น */
  path: string | null;
  label: string;
  icon?: string;
  code?: string;
  sortOrder: number;
  isEnabled?: boolean;
}

/** โหนดหลัง build tree */
export interface MenuTreeNode {
  id: string;
  parentId: string | null;
  type: MenuItemType;
  path: string | null;
  label: string;
  icon: string;
  code?: string;
  sortOrder: number;
  children: MenuTreeNode[];
}

/** แถวในตาราง favorites — อ้างอิง menu.id (ต้องเป็น type page ที่มี path) */
export interface FavoriteRow {
  menuId: string;
  /** ถ้าไม่ใส่ ใช้ label จาก menu */
  label?: string;
  icon?: string;
  sortOrder: number;
  isEnabled?: boolean;
}

/** รายการโปรดหลัง resolve กับ menu — ใช้แสดงใน Sidebar */
export interface FavoriteItem {
  menuId: string;
  path: string;
  label: string;
  icon: string;
  sortOrder: number;
}

export interface MenuConfig {
  profileLabel: string;
  /** แถวดิบ (เหมือน SELECT * FROM menu) — ใช้ sync/แก้ใน JSON */
  rows: MenuRow[];
  /** โหนดระดับบนสุด (parentId = null) พร้อม children ซ้อนได้ */
  items: MenuTreeNode[];
  /** รายการโปรดจาก favorites.json */
  favorites: FavoriteItem[];
}
