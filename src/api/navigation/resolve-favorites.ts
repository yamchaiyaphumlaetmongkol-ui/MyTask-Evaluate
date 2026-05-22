import type { FavoriteItem, FavoriteRow, MenuRow } from "./types";

/**
 * แปลงแถว favorites → รายการพร้อม path/label/icon จาก menu
 * ข้ามแถวที่ menuId ไม่พบ, ไม่ใช่ page, หรือไม่มี path
 */
export function resolveFavorites(
  favoriteRows: FavoriteRow[],
  menuRows: MenuRow[],
): FavoriteItem[] {
  const menuById = new Map(menuRows.map((r) => [r.id, r]));

  return favoriteRows
    .filter((f) => f.isEnabled !== false)
    .sort((a, b) => a.sortOrder - b.sortOrder)
    .flatMap((f) => {
      const menu = menuById.get(f.menuId);
      if (!menu || menu.isEnabled === false) return [];
      if (menu.type !== "page" || !menu.path) return [];

      return [
        {
          menuId: f.menuId,
          path: menu.path,
          label: f.label ?? menu.label,
          icon: f.icon ?? menu.icon ?? "bi-file-earmark",
          sortOrder: f.sortOrder,
        },
      ];
    });
}
