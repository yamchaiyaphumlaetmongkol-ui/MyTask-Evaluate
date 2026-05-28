import type { DefaultSession, NextAuthConfig } from "next-auth";

import { env } from "@/lib/env";
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
  secret: env.AUTH_SECRET,
  callbacks: {
    async jwt({ token, account, user }) {
      if (account?.access_token) {
        token.accessToken = account.access_token;
      }
      if (user?.id) {
        token.sub = user.id;
      } else if (!token.sub && token.email) {
        token.sub = token.email;
      }
      return token;
    },
    async session({ session, token }) {
      return {
        ...session,
        user: {
          ...session.user,
          id: token.sub ?? "",
        },
        accessToken: (token as { accessToken?: string }).accessToken,
      };
    },
  },
} satisfies NextAuthConfig;
