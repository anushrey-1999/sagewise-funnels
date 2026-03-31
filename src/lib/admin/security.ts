import "server-only";

import crypto from "node:crypto";
import { NextRequest } from "next/server";

export function sha256Hex(value: string): string {
  return crypto.createHash("sha256").update(value).digest("hex");
}

export function randomToken(bytes = 32): string {
  return crypto.randomBytes(bytes).toString("base64url");
}

export function getClientIp(req: NextRequest): string | null {
  const forwardedFor = req.headers.get("x-forwarded-for");
  if (forwardedFor) {
    const first = forwardedFor.split(",")[0]?.trim();
    if (first) return first;
  }
  const realIp = req.headers.get("x-real-ip")?.trim();
  return realIp || null;
}

/**
 * Basic CSRF protection for cookie-based auth:
 * - Allow same-origin requests
 * - Reject cross-origin POST/PUT/PATCH/DELETE if Origin/Referer don't match
 */
export function assertSameOrigin(req: NextRequest) {
  const method = req.method.toUpperCase();
  if (method === "GET" || method === "HEAD" || method === "OPTIONS") return;

  const requestOrigin = new URL(req.url).origin;
  const origin = req.headers.get("origin");
  if (origin && origin !== requestOrigin) {
    throw new Error("Cross-origin request blocked");
  }

  const referer = req.headers.get("referer");
  if (referer) {
    const refererOrigin = new URL(referer).origin;
    if (refererOrigin !== requestOrigin) {
      throw new Error("Cross-origin request blocked");
    }
  }
}

