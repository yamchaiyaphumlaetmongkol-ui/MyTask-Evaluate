import { SESSION_COOKIE, SESSION_MAX_AGE_DAYS } from "@/lib/auth/constants";
import { hashSessionToken, createSessionToken } from "@/lib/auth/session-token";
import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";

const MAX_AGE_SEC = SESSION_MAX_AGE_DAYS * 24 * 60 * 60;

export async function createAppSession(userId: bigint): Promise<string> {
  const token = createSessionToken();
  const tokenHash = hashSessionToken(token);
  const expiresAt = new Date(Date.now() + MAX_AGE_SEC * 1000);

  await prisma.appSession.create({
    data: {
      tokenHash,
      userId,
      expiresAt,
    },
  });

  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: MAX_AGE_SEC,
  });

  return token;
}

export async function destroyAppSession(): Promise<void> {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  if (token) {
    const tokenHash = hashSessionToken(token);
    await prisma.appSession.deleteMany({ where: { tokenHash } });
  }
  cookieStore.set(SESSION_COOKIE, "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });
}

export async function resolveSessionUserId(): Promise<bigint | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  if (!token) return null;

  const tokenHash = hashSessionToken(token);
  const session = await prisma.appSession.findUnique({
    where: { tokenHash },
    select: { userId: true, expiresAt: true },
  });

  if (!session || session.expiresAt < new Date()) {
    if (session) {
      await prisma.appSession.deleteMany({ where: { tokenHash } });
    }
    return null;
  }

  return session.userId;
}
