export type {
  MenuConfig,
  MenuItemType,
  MenuRow,
  MenuTreeNode,
} from "@/api/navigation/types";

export {
  buildMenuTree,
  collectPagePaths,
  findExpandedIdsForPath,
} from "@/api/navigation/build-menu-tree";

import type { MenuConfig, MenuTreeNode } from "@/api/navigation/types";
import { collectPagePaths } from "@/api/navigation/build-menu-tree";

/** โฟลเดอร์ระดับบนสุดที่มี path (ใช้แสดงการ์ดหน้าแรก) */
export function getRootFolders(menu: MenuConfig): MenuTreeNode[] {
  return menu.items.filter((n) => n.type === "folder");
}

export function getAllPaths(menu: MenuConfig): string[] {
  return collectPagePaths(menu.items);
}
