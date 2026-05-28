import type { EmployeeOption } from "@/api/_shared/employee-options";
import { create } from "zustand";
import { persist } from "zustand/middleware";
import { persistLocalStorage } from "./persistStorage";

interface CurrentUserState {
  employeeId: string;
  employeeCode: string | null;
  employeeName: string;
  profileImage: string | null;
  setCurrentUser: (employee: EmployeeOption) => void;
  clearCurrentUser: () => void;
}

export const useCurrentUserStore = create<CurrentUserState>()(
  persist(
    (set) => ({
      employeeId: "",
      employeeCode: null,
      employeeName: "",
      profileImage: null,
      setCurrentUser: (employee) =>
        set({
          employeeId: employee.id,
          employeeCode: employee.code,
          employeeName: employee.name,
          profileImage: employee.profileImage,
        }),
      clearCurrentUser: () =>
        set({
          employeeId: "",
          employeeCode: null,
          employeeName: "",
          profileImage: null,
        }),
    }),
    {
      name: "erp-current-user",
      storage: persistLocalStorage,
      partialize: (s) => ({
        employeeId: s.employeeId,
        employeeCode: s.employeeCode,
        employeeName: s.employeeName,
        profileImage: s.profileImage,
      }),
    },
  ),
);
