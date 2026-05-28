import { create } from "zustand";
import { persist } from "zustand/middleware";
import { persistLocalStorage } from "./persistStorage";

interface NotificationDismissState {
  dismissedIds: string[];
  dismiss: (id: string) => void;
  clearDismissed: () => void;
}

export const useNotificationDismissStore = create<NotificationDismissState>()(
  persist(
    (set, get) => ({
      dismissedIds: [],
      dismiss: (id) => {
        if (get().dismissedIds.includes(id)) return;
        set((s) => ({ dismissedIds: [...s.dismissedIds, id] }));
      },
      clearDismissed: () => set({ dismissedIds: [] }),
    }),
    {
      name: "erp-eval-notification-dismiss",
      storage: persistLocalStorage,
    },
  ),
);
