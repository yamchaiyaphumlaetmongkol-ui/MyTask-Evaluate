"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";
import type { MenuConfig } from "@/api/navigation/types";
import { findExpandedIdsForPath } from "@/api/navigation/build-menu-tree";
import { SidebarFavoritesList } from "@/components/layout/SidebarFavoritesList";
import { SidebarMenuTree } from "@/components/layout/SidebarMenuTree";
import { useSidebarStore } from "@/store/sidebarStore";

interface SidebarProps {
  menu: MenuConfig;
}

export function Sidebar({ menu }: SidebarProps) {
  const pathname = usePathname();
  const collapsed = useSidebarStore((s) => s.collapsed);
  const menuTab = useSidebarStore((s) => s.menuTab);
  const setMenuTab = useSidebarStore((s) => s.setMenuTab);
  const setCollapsed = useSidebarStore((s) => s.setCollapsed);
  const ensureItemsExpanded = useSidebarStore((s) => s.ensureItemsExpanded);

  useEffect(() => {
    const ids = findExpandedIdsForPath(menu.items, pathname);
    if (ids.length) ensureItemsExpanded(ids);
  }, [pathname, menu.items, ensureItemsExpanded]);

  const closeOnMobile = () => {
    if (window.innerWidth < 992) setCollapsed(true);
  };

  return (
    <>
      <aside
        className={`erp-sidebar ${collapsed ? "is-collapsed" : ""}`}
        aria-label="เมนูหลัก"
      >
        <div className="erp-sidebar-profile">
          <i className="bi bi-person-circle fs-4 flex-shrink-0" />
          <span className="profile-label">{menu.profileLabel}</span>
        </div>

        <div className="erp-sidebar-tabs-wrap">
          <ul className="erp-sidebar-tabs nav nav-tabs border-0">
            <li className="nav-item flex-fill">
              <button
                type="button"
                className={`nav-link w-100 ${menuTab === "main" ? "active" : ""}`}
                onClick={() => setMenuTab("main")}
              >
                เมนูหลัก
              </button>
            </li>
            <li className="nav-item flex-fill">
              <button
                type="button"
                className={`nav-link w-100 ${menuTab === "favorites" ? "active" : ""}`}
                onClick={() => setMenuTab("favorites")}
              >
                รายการโปรด
              </button>
            </li>
          </ul>
        </div>

        <nav className="erp-sidebar-menu">
          {menuTab === "main" ? (
            <SidebarMenuTree
              nodes={menu.items}
              collapsed={collapsed}
              onNavigate={closeOnMobile}
            />
          ) : (
            <SidebarFavoritesList
              items={menu.favorites}
              collapsed={collapsed}
              onNavigate={closeOnMobile}
            />
          )}
        </nav>
      </aside>

      <div
        className={`erp-sidebar-backdrop d-lg-none ${collapsed ? "" : "show"}`}
        role="presentation"
        onClick={() => setCollapsed(true)}
      />
    </>
  );
}
