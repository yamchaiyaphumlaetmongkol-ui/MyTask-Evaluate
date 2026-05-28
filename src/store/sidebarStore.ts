import { create } from "zustand";
import { persist } from "zustand/middleware";
import { persistLocalStorage } from "./persistStorage";

export type SidebarMenuTab = "main" | "favorites";

interface SidebarState {
  collapsed: boolean;
  /** id ของ folder ที่กางอยู่ (จาก menu row id) */
  expandedItemIds: string[];
  menuTab: SidebarMenuTab;
  toggleCollapsed: () => void;
  setCollapsed: (collapsed: boolean) => void;
  toggleItem: (itemId: string, siblingFolderIds?: string[]) => void;
  setExpandedItemIds: (ids: string[]) => void;
  ensureItemsExpanded: (ids: string[]) => void;
  setMenuTab: (tab: SidebarMenuTab) => void;
}

export const useSidebarStore = create<SidebarState>()(
  persist(
    (set, get) => ({
      collapsed: false,
      expandedItemIds: [],
      menuTab: "main",
      toggleCollapsed: () => set((s) => ({ collapsed: !s.collapsed })),
      setCollapsed: (collapsed) => set({ collapsed }),
      toggleItem: (itemId, siblingFolderIds) => {
        const { expandedItemIds } = get();
        const isOpen = expandedItemIds.includes(itemId);
        if (isOpen) {
          set({
            expandedItemIds: expandedItemIds.filter((id) => id !== itemId),
          });
          return;
        }
        const siblingSet = new Set(siblingFolderIds ?? []);
        const withoutSiblings = expandedItemIds.filter(
          (id) => !siblingSet.has(id),
        );
        set({ expandedItemIds: [...withoutSiblings, itemId] });
      },
      setExpandedItemIds: (expandedItemIds) => set({ expandedItemIds }),
      ensureItemsExpanded: (ids) => {
        const unique = [...new Set(ids)];
        const { expandedItemIds } = get();
        if (
          unique.length === expandedItemIds.length &&
          unique.every((id) => expandedItemIds.includes(id))
        ) {
          return;
        }
        set({ expandedItemIds: unique });
      },
      setMenuTab: (menuTab) => set({ menuTab }),
    }),
    {
      name: "erp-sidebar",
      storage: persistLocalStorage,
      partialize: (s) => ({
        collapsed: s.collapsed,
        expandedItemIds: s.expandedItemIds,
      }),
    },
  ),
);

/** @deprecated ใช้ expandedItemIds */
export const useExpandedModuleIds = () =>
  useSidebarStore((s) => s.expandedItemIds);
