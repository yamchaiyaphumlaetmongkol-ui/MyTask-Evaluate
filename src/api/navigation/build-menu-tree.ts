import type { MenuRow, MenuTreeNode } from "./types";

function bySortOrder(a: MenuTreeNode, b: MenuTreeNode) {
  return a.sortOrder - b.sortOrder;
}

/** แปลง flat rows → tree (รองรับ folder ซ้อน folder ได้) */
export function buildMenuTree(rows: MenuRow[]): MenuTreeNode[] {
  const enabled = rows.filter((r) => r.isEnabled !== false);
  const nodeMap = new Map<string, MenuTreeNode>();

  for (const row of enabled) {
    nodeMap.set(row.id, {
      id: row.id,
      parentId: row.parentId,
      type: row.type,
      path: row.path,
      label: row.label,
      icon: row.icon ?? (row.type === "folder" ? "bi-folder2" : "bi-file-earmark"),
      code: row.code,
      sortOrder: row.sortOrder,
      children: [],
    });
  }

  const roots: MenuTreeNode[] = [];

  for (const node of nodeMap.values()) {
    if (node.parentId === null) {
      roots.push(node);
      continue;
    }
    const parent = nodeMap.get(node.parentId);
    if (parent) {
      parent.children.push(node);
    } else {
      roots.push(node);
    }
  }

  const sortRecursive = (nodes: MenuTreeNode[]) => {
    nodes.sort(bySortOrder);
    for (const n of nodes) sortRecursive(n.children);
  };
  sortRecursive(roots);

  return roots;
}

function descendantMatchesPath(node: MenuTreeNode, pathname: string): boolean {
  if (node.type === "page" && node.path) {
    if (pathname === node.path) return true;
    if (node.path !== "/" && pathname.startsWith(`${node.path}/`)) return true;
  }
  return node.children.some((c) => descendantMatchesPath(c, pathname));
}

/** รวบรวม id ของ folder ที่ต้องกางเมื่อ pathname ตรงกับ page ลูก */
export function findExpandedIdsForPath(
  nodes: MenuTreeNode[],
  pathname: string,
  acc: string[] = [],
): string[] {
  for (const node of nodes) {
    if (node.type === "folder" && descendantMatchesPath(node, pathname)) {
      acc.push(node.id);
    }
    if (node.children.length) {
      findExpandedIdsForPath(node.children, pathname, acc);
    }
  }
  return [...new Set(acc)];
}

/** รวบรวม path ทั้งหมดของ type page */
export function collectPagePaths(nodes: MenuTreeNode[]): string[] {
  const paths: string[] = [];
  const walk = (list: MenuTreeNode[]) => {
    for (const n of list) {
      if (n.type === "page" && n.path) paths.push(n.path);
      walk(n.children);
    }
  };
  walk(nodes);
  return paths;
}
