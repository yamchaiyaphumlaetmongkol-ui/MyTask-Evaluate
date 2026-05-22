import Link from "next/link";
import { getMenu } from "@/api/navigation/get_menu";
import { MainShell } from "@/components/layout/MainShell";
import { getRootFolders } from "@/lib/navigation";

export default async function RootPage() {
  const menu = await getMenu();
  const folders = getRootFolders(menu);

  return (
    <MainShell menu={menu}>
      <main className="container-fluid py-4">
        <h1>Home page</h1>
      </main>
    </MainShell>
  );
}
