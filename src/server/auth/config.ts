import { PrismaAdapter } from "@auth/prisma-adapter";
import type { DefaultSession, NextAuthConfig } from "next-auth";

import { env } from "@/lib/env";
import { prisma } from "@/lib/prisma";
import { authConfig } from "@/server/auth/auth.config";

declare module "next-auth" {
  interface Session extends DefaultSession {
    user: {
      id: string;
    } & DefaultSession["user"];
    accessToken?: string;
  }
}

export const authOptions = {
  ...authConfig,
  adapter: PrismaAdapter(prisma),
  session: {
    strategy: "jwt",
  },
  secret: env.AUTH_SECRET,
  callbacks: {
    async jwt({ token, user, account }) {
      try {
        if (account) {
          token.accessToken = account.access_token;
        }
        // Prisma `User.id` ต้องตรงกับ `session.user.id` — ถ้าไม่ตั้งตอน login
        // `sub` อาจเป็น OIDC subject (เช่น Keycloak)
        if (user?.id) {
          token.sub = user.id;
          return token;
        }
        const sub =
          typeof token.sub === "string" && token.sub.length > 0
            ? token.sub
            : null;
        if (sub) {
          const byId = await prisma.user.findUnique({
            where: { id: sub },
            select: { id: true },
          });
          if (byId) return token;

          const acct = await prisma.account.findFirst({
            where: { providerAccountId: sub },
            select: { userId: true },
          });
          if (acct?.userId) {
            token.sub = acct.userId;
          }
        }
        return token;
      } catch (error) {
        console.error("Auth JWT callback failed:", error);
        return token;
      }
    },
    async session({ session, token }) {
      try {
        return {
          ...session,
          user: {
            ...session.user,
            id: token.sub ?? "",
          },
          accessToken: token.accessToken as string | undefined,
        };
      } catch (error) {
        console.error("Auth session callback failed:", error);
        return {
          ...session,
          user: {
            ...session.user,
            id: token.sub ?? "",
          },
          accessToken: token.accessToken as string | undefined,
        };
      }
    },
  },
} satisfies NextAuthConfig;
