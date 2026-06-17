import "server-only";

import { createHmac, timingSafeEqual } from "node:crypto";
import bcrypt from "bcryptjs";
import type { Result } from "~/shared/reservation-types";

export const adminSessionCookieName = "satojay_admin_session";

export interface AdminSession {
  authenticated: true;
  issuedAt: string;
}

export type AdminAuthError =
  | { type: "INVALID_PASSWORD" }
  | { type: "INVALID_SESSION" }
  | { type: "CONFIGURATION_ERROR" };

export async function verifyPassword(password: string): Promise<Result<AdminSession, AdminAuthError>> {
  const passwordHash = process.env.ADMIN_PASSWORD_HASH;
  if (!passwordHash) {
    return { ok: false, error: { type: "CONFIGURATION_ERROR" } };
  }

  const matches = await bcrypt.compare(password, passwordHash);
  if (!matches) {
    return { ok: false, error: { type: "INVALID_PASSWORD" } };
  }

  return { ok: true, value: { authenticated: true, issuedAt: new Date().toISOString() } };
}

export function createSessionCookie(session: AdminSession): Result<string, AdminAuthError> {
  const secret = process.env.ADMIN_SESSION_SECRET;
  if (!secret) {
    return { ok: false, error: { type: "CONFIGURATION_ERROR" } };
  }

  const payload = Buffer.from(JSON.stringify(session)).toString("base64url");
  const signature = sign(payload, secret);
  return { ok: true, value: `${payload}.${signature}` };
}

export function verifySession(cookieValue: string | undefined): Result<AdminSession, AdminAuthError> {
  const secret = process.env.ADMIN_SESSION_SECRET;
  if (!secret) {
    return { ok: false, error: { type: "CONFIGURATION_ERROR" } };
  }
  if (!cookieValue) {
    return { ok: false, error: { type: "INVALID_SESSION" } };
  }

  const [payload, signature] = cookieValue.split(".");
  if (!payload || !signature || !safeEqual(signature, sign(payload, secret))) {
    return { ok: false, error: { type: "INVALID_SESSION" } };
  }

  return parseSession(payload);
}

function parseSession(payload: string): Result<AdminSession, AdminAuthError> {
  try {
    const session = JSON.parse(Buffer.from(payload, "base64url").toString("utf8")) as AdminSession;
    if (session.authenticated === true && typeof session.issuedAt === "string") {
      return { ok: true, value: session };
    }
    return { ok: false, error: { type: "INVALID_SESSION" } };
  } catch {
    return { ok: false, error: { type: "INVALID_SESSION" } };
  }
}

function sign(payload: string, secret: string): string {
  return createHmac("sha256", secret).update(payload).digest("base64url");
}

function safeEqual(left: string, right: string): boolean {
  const leftBuffer = Buffer.from(left);
  const rightBuffer = Buffer.from(right);
  return leftBuffer.length === rightBuffer.length && timingSafeEqual(leftBuffer, rightBuffer);
}
