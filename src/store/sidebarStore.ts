import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

export type SidebarMenuTab = "main" | "favorites";

interface SidebarState {
  collapsed: boolean;
  /** id ของ folder ที่กางอยู่ (จาก menu row id) */
  expandedItemIds: string[];
  menuTab: SidebarMenuTab;
  toggleCollapsed: () => void;
  setCollapsed: (collapsed: boolean) => void;
  toggleItem: (itemId: string) => void;
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
      toggleItem: (itemId) => {
        const { expandedItemIds } = get();
        const next = expandedItemIds.includes(itemId)
          ? expandedItemIds.filter((id) => id !== itemId)
          : [...expandedItemIds, itemId];
        set({ expandedItemIds: next });
      },
      setExpandedItemIds: (expandedItemIds) => set({ expandedItemIds }),
      ensureItemsExpanded: (ids) => {
        const { expandedItemIds } = get();
        const merged = [...new Set([...expandedItemIds, ...ids])];
        if (merged.length !== expandedItemIds.length) {
          set({ expandedItemIds: merged });
        }
      },
      setMenuTab: (menuTab) => set({ menuTab }),
    }),
    {
      name: "erp-sidebar",
      storage: createJSONStorage(() => localStorage),
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
