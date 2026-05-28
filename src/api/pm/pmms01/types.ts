export type EmployeeRow = {
  id: string;
  employeeCode: string | null;
  titleName: string;
  firstName: string;
  lastName: string;
  email: string;
  clickupUserId: string | null;
  clickupUsername: string | null;
  clickupProfileImage: string | null;
  boundLoginEmail: string | null;
  roleCode: string | null;
  roleName: string | null;
  positionCode: string | null;
  positionName: string | null;
  displayName: string;
};

export type EmployeeEditData = {
  id: string;
  employeeCode: string | null;
  titleName: string;
  firstName: string;
  lastName: string;
  email: string;
  roleCode: string;
  positionCode: string;
  clickupUsername: string | null;
  clickupProfileImage: string | null;
  roles: { code: string; name: string }[];
  positions: { code: string; name: string }[];
};

export type ClickUpUserOption = {
  id: string;
  username: string;
  email: string | null;
  profilePicture: string | null;
  alreadyImported: boolean;
  /** รหัสพนักงานในระบบ (เมื่อนำเข้าแล้ว) */
  employeeCode?: string | null;
  /** id พนักงานในระบบ (ใช้นำออก) */
  employeeId?: string | null;
};
