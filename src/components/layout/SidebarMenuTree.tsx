"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { MenuTreeNode } from "@/api/navigation/types";
import { useSidebarStore } from "@/store/sidebarStore";

interface SidebarMenuTreeProps {
  nodes: MenuTreeNode[];
  collapsed: boolean;
  depth?: number;
  onNavigate?: () => void;
}

function nodeOrDescendantActive(node: MenuTreeNode, pathname: string): boolean {
  if (node.type === "page" && node.path) {
    if (pathname === node.path) return true;
    if (node.path !== "/" && pathname.startsWith(`${node.path}/`)) return true;
  }
  return node.children.some((c) => nodeOrDescendantActive(c, pathname));
}

export function SidebarMenuTree({
  nodes,
  collapsed,
  depth = 0,
  onNavigate,
}: SidebarMenuTreeProps) {
  const pathname = usePathname();
  const expandedItemIds = useSidebarStore((s) => s.expandedItemIds);
  const toggleItem = useSidebarStore((s) => s.toggleItem);

  return (
    <>
      {nodes.map((node) => {
        const hasChildren = node.children.length > 0;
        const isOpen = expandedItemIds.includes(node.id);
        const collapseId = `menu-${node.id}`;

        if (node.type === "folder") {
          const isActiveBranch = nodeOrDescendantActive(node, pathname);

          return (
            <div key={node.id} className="erp-menu-group">
              <button
                type="button"
                className={`erp-menu-item erp-menu-item-parent erp-menu-folder-btn ${isActiveBranch ? "is-active-parent" : ""}`}
                style={
                  depth ? { paddingLeft: `${0.5 + depth * 0.75}rem` } : undefined
                }
                aria-expanded={hasChildren ? isOpen : undefined}
                aria-controls={hasChildren ? collapseId : undefined}
                title={collapsed ? node.label : undefined}
                onClick={() => {
                  if (hasChildren) toggleItem(node.id);
                }}
                disabled={!hasChildren}
              >
                <div className="d-flex align-items-center gap-2">
                <i className={`bi ${node.icon} menu-icon`} />
                <span className="menu-label flex-grow-1 text-start">
                  {node.label}
                </span>
                {hasChildren && !collapsed && (
                  <i
                    className={`bi ${isOpen ? "bi-chevron-down" : "bi-chevron-right"} menu-chevron`}
                  />
                )}
                </div>
              </button>

              {!collapsed && hasChildren && (
                <div id={collapseId} className={`collapse ${isOpen ? "show" : ""}`}>
                  <SidebarMenuTree
                    nodes={node.children}
                    collapsed={collapsed}
                    depth={depth + 1}
                    onNavigate={onNavigate}
                  />
                </div>
              )}
            </div>
          );
        }

        if (!node.path) return null;

        const isActivePage = pathname === node.path;

        return (
          <Link
            key={node.id}
            href={node.path}
            className={`erp-menu-item erp-menu-item-child ${isActivePage ? "is-active" : ""}`}
            style={{ paddingLeft: `${1 + depth * 0.75}rem` }}
            title={collapsed ? node.label : undefined}
            onClick={onNavigate}
          >
            <i className={`bi ${node.icon} menu-icon`} />
            <span className="menu-label">{node.label}</span>
          </Link>
        );
      })}
    </>
  );
}
