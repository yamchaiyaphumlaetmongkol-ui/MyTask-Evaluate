"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { FavoriteItem } from "@/api/navigation/types";

interface SidebarFavoritesListProps {
  items: FavoriteItem[];
  collapsed: boolean;
  onNavigate?: () => void;
}

export function SidebarFavoritesList({
  items,
  collapsed,
  onNavigate,
}: SidebarFavoritesListProps) {
  const pathname = usePathname();

  if (items.length === 0) {
    return (
      <p className="text-muted small px-3 py-4 menu-label mb-0">
        ยังไม่มีรายการโปรด
      </p>
    );
  }

  return (
    <>
      {items.map((item) => {
        const isActive =
          pathname === item.path ||
          (item.path !== "/" && pathname.startsWith(`${item.path}/`));

        return (
          <Link
            key={item.menuId}
            href={item.path}
            className={`erp-menu-item erp-menu-item-child ${isActive ? "is-active" : ""}`}
            title={collapsed ? item.label : undefined}
            onClick={onNavigate}
          >
            <i className={`bi ${item.icon} menu-icon`} />
            <span className="menu-label">{item.label}</span>
          </Link>
        );
      })}
    </>
  );
}
