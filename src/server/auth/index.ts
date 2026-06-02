import NextAuth from "next-auth";
import { cache } from "react";

import { authOptions } from "@/server/auth/config";

const { auth: uncachedAuth, handlers, signIn, signOut } = NextAuth(authOptions);

/** RSC / App Router — dedupe ภายในแต่ละ render */
const auth = cache(uncachedAuth);

/**
 * Pages Router API (เช่น `/api/trpc`) — ใช้ตัวนี้แทน `auth` ที่ห่อด้วย React.cache
 * เพื่อไม่ให้ session/context เพี้ยนหรือคืนค่าผิดพลาดระหว่างคำขอ HTTP
 */
export const authPagesApi = uncachedAuth;

export { auth, handlers, signIn, signOut };
