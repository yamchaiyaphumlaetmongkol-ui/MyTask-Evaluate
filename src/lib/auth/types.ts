export type AuthUser = {
  authId: string;
  username: string;
  role: "admin" | "user";
  mustChangePassword: boolean;
  employeeId: string | null;
  employeeCode: string | null;
  employeeName: string | null;
  clickupUserId: string | null;
  clickupEmail: string | null;
  profileImage: string | null;
  loginEmail: string;
  isAdmin: boolean;
};
