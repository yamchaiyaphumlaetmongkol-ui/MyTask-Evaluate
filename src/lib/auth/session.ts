import { SESSION_COOKIE, SESSION_MAX_AGE_DAYS } from "@/lib/auth/constants";
import { hashSessionToken, createSessionToken } from "@/lib/auth/session-token";
import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";
import type { NextResponse } from "next/server";

const MAX_AGE_SEC = SESSION_MAX_AGE_DAYS * 24 * 60 * 60;

export function sessionCookieOptions(maxAge = MAX_AGE_SEC) {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    path: "/",
    maxAge,
  };
}

/** สร้างแถว session ใน DB แล้วคืน raw token (ยังไม่ set cookie) */
export async function createSessionForUser(userId: bigint): Promise<string> {
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

  return token;
}

export function attachSessionCookie(
  response: NextResponse,
  token: string,
): void {
  response.cookies.set(SESSION_COOKIE, token, sessionCookieOptions());
}

export function clearSessionCookie(response: NextResponse): void {
  response.cookies.set(SESSION_COOKIE, "", sessionCookieOptions(0));
}

/** ใช้ใน Server Action / Server Component — set cookie ผ่าน next/headers */
export async function createAppSession(userId: bigint): Promise<string> {
  const token = await createSessionForUser(userId);
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, token, sessionCookieOptions());
  return token;
}

export async function destroyAppSession(): Promise<void> {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  if (token) {
    const tokenHash = hashSessionToken(token);
    await prisma.appSession.deleteMany({ where: { tokenHash } });
  }
  cookieStore.set(SESSION_COOKIE, "", sessionCookieOptions(0));
}

/** ลบ session ใน DB แล้ว clear cookie บน NextResponse (Route Handler) */
export async function destroyAppSessionOnResponse(
  response: NextResponse,
): Promise<void> {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  if (token) {
    const tokenHash = hashSessionToken(token);
    await prisma.appSession.deleteMany({ where: { tokenHash } });
  }
  clearSessionCookie(response);
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
