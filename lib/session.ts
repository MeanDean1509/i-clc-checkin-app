import "server-only";

import { createHmac, timingSafeEqual } from "node:crypto";

export const SESSION_COOKIE = "checkin_session";
export const SESSION_USER_COOKIE = "checkin_user";

export type SessionUser = {
  userID: number;
  userRole: string;
  name: string;
  username: string;
  phone?: string;
  email?: string;
};

const sessionSecret = process.env.CHECKIN_SESSION_SECRET ?? "local-development-secret-change-before-production";

function signature(value: string) {
  return createHmac("sha256", sessionSecret).update(value).digest("base64url");
}

export function encodeSessionUser(user: SessionUser) {
  const payload = Buffer.from(JSON.stringify(user)).toString("base64url");
  return `${payload}.${signature(payload)}`;
}

export function decodeSessionUser(value?: string): SessionUser | null {
  if (!value) return null;
  const [payload, providedSignature] = value.split(".");
  if (!payload || !providedSignature) return null;
  const expectedSignature = signature(payload);
  if (providedSignature.length !== expectedSignature.length || !timingSafeEqual(Buffer.from(providedSignature), Buffer.from(expectedSignature))) return null;
  try {
    const user = JSON.parse(Buffer.from(payload, "base64url").toString("utf8")) as SessionUser;
    return Number.isFinite(user.userID) && user.userID > 0 && user.username ? user : null;
  } catch {
    return null;
  }
}
