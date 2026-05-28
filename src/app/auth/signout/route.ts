import { signOut } from "@/server/auth";

export async function GET() {
  return signOut({ redirectTo: "/api/auth/signin" });
}
