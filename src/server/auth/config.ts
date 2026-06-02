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
    async signIn({ user, account, profile }) {
      console.log("[auth.callback.signIn]", {
        userId: user.id,
        email: user.email ?? null,
        provider: account?.provider ?? null,
        providerAccountId: account?.providerAccountId ?? null,
        profileSub:
          profile && typeof profile === "object" && "sub" in profile
            ? String((profile as { sub?: unknown }).sub ?? "")
            : null,
      });
      return true;
    },
    async jwt({ token, user }) {
      try {
        // Keep stable subject id for middleware/session reads.
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
        console.log("[auth.callback.session]", {
          userId: token.sub ?? null,
          email: session.user?.email ?? null,
          expires: session.expires,
        });
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
  events: {
    async signIn(message) {
      console.log("[auth.event.signIn]", {
        userId: message.user.id,
        email: message.user.email ?? null,
        provider: message.account?.provider ?? null,
      });
    },
    async signOut(message) {
      const hasSession = "session" in message && !!message.session;
      console.log("[auth.event.signOut]", {
        hasSession,
        sessionExpires:
          "session" in message && message.session
            ? "expires" in message.session
              ? message.session.expires
              : null
            : null,
      });
    },
    async session(message) {
      console.log("[auth.event.session]", {
        hasSession: "session" in message,
        expires:
          "session" in message && message.session
            ? "expires" in message.session
              ? message.session.expires
              : null
            : null,
      });
    },
    async createUser(message) {
      console.log("[auth.event.createUser]", {
        userId: message.user.id,
        email: message.user.email ?? null,
      });
    },
    async linkAccount(message) {
      console.log("[auth.event.linkAccount]", {
        userId: message.user.id,
        provider: message.account.provider,
        providerAccountId: message.account.providerAccountId,
      });
    },
  },
  logger: {
    error(error: Error) {
      console.error("[auth.logger.error]", {
        name: error.name,
        message: error.message,
        stack: error.stack,
      });
    },
    warn(code: string) {
      console.warn("[auth.logger.warn]", { code });
    },
    debug(code: string, metadata?: unknown) {
      console.log("[auth.logger.debug]", { code, metadata });
    },
  },
} satisfies NextAuthConfig;
