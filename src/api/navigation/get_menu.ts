"use server";

import { buildMenuTree } from "./build-menu-tree";
import { resolveFavorites } from "./resolve-favorites";
import type { FavoriteRow, MenuConfig, MenuRow } from "./types";
import favoritesJson from "@/data/favorites.json";
import menuJson from "@/data/menu.json";

interface MenuJsonFile {
  profileLabel: string;
  rows: MenuRow[];
}

interface FavoritesJsonFile {
  rows: FavoriteRow[];
}

/**
 * โหลดเมนู + รายการโปรด — อ่าน flat rows แล้ว build tree
 * อนาคต: SELECT ... FROM menu / user_favorites ORDER BY sort_order
 */
export async function getMenu(): Promise<MenuConfig> {
  const data = menuJson as MenuJsonFile;
  const favData = favoritesJson as FavoritesJsonFile;
  const items = buildMenuTree(data.rows);
  const favorites = resolveFavorites(favData.rows, data.rows);

  return {
    profileLabel: data.profileLabel,
    rows: data.rows,
    items,
    favorites,
  };
}
