import type { AuthUser } from "@/lib/auth/types";

export type SessionEmployee = {
  id: string;
  code: string | null;
  name: string;
  profileImage: string | null;
};

export function toSessionEmployee(user: AuthUser): SessionEmployee | null {
  if (!user.employeeId) return null;
  return {
    id: user.employeeId,
    code: user.employeeCode,
    name: user.employeeName ?? user.username,
    profileImage: user.profileImage,
  };
}
