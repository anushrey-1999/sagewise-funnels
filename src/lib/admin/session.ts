import "server-only";

import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import { and, eq, gt } from "drizzle-orm";

import { db } from "@/lib/db";
import { adminSessions, adminUsers } from "@/lib/db/schema";
import { ADMIN_SESSION_COOKIE, ADMIN_SESSION_DAYS, type AdminRole } from "@/lib/admin/constants";
import { randomToken, sha256Hex } from "@/lib/admin/security";

export type AdminUser = {
  id: string;
  email: string;
  role: AdminRole;
};

function computeExpiry(): Date {
  const d = new Date();
  d.setDate(d.getDate() + ADMIN_SESSION_DAYS);
  return d;
}

export async function createAdminSession(userId: string): Promise<{ token: string; expiresAt: Date }> {
  const token = randomToken(32);
  const tokenHash = sha256Hex(token);
  const expiresAt = computeExpiry();

  await db.insert(adminSessions).values({
    userId,
    tokenHash,
    expiresAt,
  });

  return { token, expiresAt };
}

export function setAdminSessionCookie(res: NextResponse, token: string, expiresAt: Date) {
  res.cookies.set(ADMIN_SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    expires: expiresAt,
  });
}

export function clearAdminSessionCookie(res: NextResponse) {
  res.cookies.set(ADMIN_SESSION_COOKIE, "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    expires: new Date(0),
  });
}

export async function getAdminUserFromRequest(req: NextRequest): Promise<AdminUser | null> {
  const token = req.cookies.get(ADMIN_SESSION_COOKIE)?.value;
  if (!token) return null;

  const tokenHash = sha256Hex(token);
  const now = new Date();

  const rows = await db
    .select({
      userId: adminUsers.id,
      email: adminUsers.email,
      role: adminUsers.role,
      sessionId: adminSessions.id,
      expiresAt: adminSessions.expiresAt,
    })
    .from(adminSessions)
    .innerJoin(adminUsers, eq(adminUsers.id, adminSessions.userId))
    .where(and(eq(adminSessions.tokenHash, tokenHash), gt(adminSessions.expiresAt, now)))
    .limit(1);

  const row = rows[0];
  if (!row) return null;

  return {
    id: row.userId,
    email: row.email,
    role: row.role as AdminRole,
  };
}

export async function getAdminUserFromCookies(): Promise<AdminUser | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(ADMIN_SESSION_COOKIE)?.value;
  if (!token) return null;

  const tokenHash = sha256Hex(token);
  const now = new Date();

  const rows = await db
    .select({
      userId: adminUsers.id,
      email: adminUsers.email,
      role: adminUsers.role,
      expiresAt: adminSessions.expiresAt,
    })
    .from(adminSessions)
    .innerJoin(adminUsers, eq(adminUsers.id, adminSessions.userId))
    .where(and(eq(adminSessions.tokenHash, tokenHash), gt(adminSessions.expiresAt, now)))
    .limit(1);

  const row = rows[0];
  if (!row) return null;

  return { id: row.userId, email: row.email, role: row.role as AdminRole };
}

export async function deleteAdminSessionByToken(token: string): Promise<void> {
  const tokenHash = sha256Hex(token);
  await db.delete(adminSessions).where(eq(adminSessions.tokenHash, tokenHash));
}

