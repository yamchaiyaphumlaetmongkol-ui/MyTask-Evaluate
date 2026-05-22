import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

export type TaskStatusFilter = "all" | "open" | "in_progress" | "done";

interface TaskFilterState {
  status: TaskStatusFilter;
  search: string;
  setStatus: (status: TaskStatusFilter) => void;
  setSearch: (search: string) => void;
  reset: () => void;
}

const initial = { status: "all" as TaskStatusFilter, search: "" };

/**
 * Cross-screen filter state (persisted).
 * Use with useMounted() in client components before reading persisted values.
 */
export const useTaskFilterStore = create<TaskFilterState>()(
  persist(
    (set) => ({
      ...initial,
      setStatus: (status) => set({ status }),
      setSearch: (search) => set({ search }),
      reset: () => set(initial),
    }),
    {
      name: "erp-task-filter",
      storage: createJSONStorage(() => localStorage),
      partialize: (s) => ({ status: s.status, search: s.search }),
    },
  ),
);
