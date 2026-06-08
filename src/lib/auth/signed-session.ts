import { SESSION_MAX_AGE_DAYS } from "@/lib/auth/constants";
import { createHmac, timingSafeEqual } from "crypto";

const MAX_AGE_SEC = SESSION_MAX_AGE_DAYS * 24 * 60 * 60;

function getSessionSecret(): string {
  const secret = process.env.SESSION_SECRET?.trim();
  if (secret) return secret;

  const db = process.env.DATABASE_URL?.trim();
  if (db) {
    return createHmac("sha256", "erp-session-fallback")
      .update(db)
      .digest("hex");
  }

  if (process.env.NODE_ENV !== "production") {
    return "dev-session-secret-change-me";
  }

  throw new Error("SESSION_SECRET or DATABASE_URL is not configured");
}

function sign(payload: string): string {
  return createHmac("sha256", getSessionSecret())
    .update(payload)
    .digest("base64url");
}

/** ค่า cookie: userId.exp.signature */
export function createSignedSessionValue(userId: bigint): string {
  const exp = Math.floor(Date.now() / 1000) + MAX_AGE_SEC;
  const payload = `${userId.toString()}.${exp}`;
  return `${payload}.${sign(payload)}`;
}

export function verifySignedSessionValue(value: string): bigint | null {
  try {
    const lastDot = value.lastIndexOf(".");
    if (lastDot <= 0) return null;

    const payload = value.slice(0, lastDot);
    const sig = value.slice(lastDot + 1);
    const expected = sign(payload);

    const sigBuf = Buffer.from(sig);
    const expBuf = Buffer.from(expected);
    if (sigBuf.length !== expBuf.length) return null;
    if (!timingSafeEqual(sigBuf, expBuf)) return null;

    const [uid, expStr] = payload.split(".");
    const exp = Number(expStr);
    if (!uid || !Number.isFinite(exp)) return null;
    if (exp < Math.floor(Date.now() / 1000)) return null;

    return BigInt(uid);
  } catch {
    return null;
  }
}
