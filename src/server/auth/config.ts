import { PrismaAdapter } from "@auth/prisma-adapter";
import { type DefaultSession, type NextAuthConfig } from "next-auth";

import { prisma } from "@/lib/prisma";
import { authConfig } from "@/server/auth/auth.config";

/**
 * Module augmentation สำหรับ TypeScript
 */
declare module "next-auth" {
  interface Session extends DefaultSession {
    user: {
      id: string;
    } & DefaultSession["user"];
  }
}

export const authOptions = {
  ...authConfig,
  adapter: PrismaAdapter(prisma),
  session: {
    strategy: "jwt",
  },
  secret: process.env.AUTH_SECRET,
  callbacks: {
    async jwt({ token, user }) {
      try {
        if (user?.id) {
          token.sub = user.id;
        }
        return token;
      } catch (error) {
        console.error("Auth jwt callback failed:", error);
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
        };
      } catch (error) {
        console.error("Auth session callback failed:", error);
        return {
          ...session,
          user: {
            ...session.user,
            id: token.sub ?? "",
          },
        };
      }
    },
  },
} satisfies NextAuthConfig;
