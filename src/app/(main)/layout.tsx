import { getMenu } from "@/api/navigation/get_menu";
import { MainShell } from "@/components/layout/MainShell";
import type { ReactNode } from "react";

export default async function MainLayout({ children }: { children: ReactNode }) {
  const menu = await getMenu();
  return <MainShell menu={menu}>{children}</MainShell>;
}
