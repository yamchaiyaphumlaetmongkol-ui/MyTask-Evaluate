import { SESSION_COOKIE, SESSION_MAX_AGE_DAYS } from "@/lib/auth/constants";
import {
  createSignedSessionValue,
  verifySignedSessionValue,
} from "@/lib/auth/signed-session";
import { hashSessionToken } from "@/lib/auth/session-token";
import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";
import type { NextResponse } from "next/server";

const MAX_AGE_SEC = SESSION_MAX_AGE_DAYS * 24 * 60 * 60;

function isSecureCookie(): boolean {
  return (
    process.env.NODE_ENV === "production" ||
    process.env.VERCEL === "1"
  );
}

export function sessionCookieOptions(maxAge = MAX_AGE_SEC) {
  return {
    httpOnly: true,
    secure: isSecureCookie(),
    sameSite: "lax" as const,
    path: "/",
    maxAge,
  };
}

/** สร้าง session cookie (signed) + บันทึก DB ถ้าทำได้ */
export async function createSessionForUser(userId: bigint): Promise<string> {
  const value = createSignedSessionValue(userId);

  try {
    const tokenHash = hashSessionToken(value);
    const expiresAt = new Date(Date.now() + MAX_AGE_SEC * 1000);
    await prisma.appSession.create({
      data: {
        tokenHash,
        userId,
        expiresAt,
      },
    });
  } catch (e) {
    console.error("createSessionForUser db write failed", e);
  }

  return value;
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
    const userId = verifySignedSessionValue(token);
    if (userId) {
      await prisma.appSession.deleteMany({ where: { userId } }).catch(() => {});
    } else {
      const tokenHash = hashSessionToken(token);
      await prisma.appSession.deleteMany({ where: { tokenHash } }).catch(() => {});
    }
  }
  cookieStore.set(SESSION_COOKIE, "", sessionCookieOptions(0));
}

export async function destroyAppSessionOnResponse(
  response: NextResponse,
): Promise<void> {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  if (token) {
    const userId = verifySignedSessionValue(token);
    if (userId) {
      await prisma.appSession.deleteMany({ where: { userId } }).catch(() => {});
    } else {
      const tokenHash = hashSessionToken(token);
      await prisma.appSession.deleteMany({ where: { tokenHash } }).catch(() => {});
    }
  }
  clearSessionCookie(response);
}

export async function resolveSessionUserId(): Promise<bigint | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  if (!token) return null;

  const fromSignature = verifySignedSessionValue(token);
  if (fromSignature) return fromSignature;

  // legacy: random token + DB lookup
  try {
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
  } catch (e) {
    console.error("resolveSessionUserId db lookup failed", e);
    return null;
  }
}
