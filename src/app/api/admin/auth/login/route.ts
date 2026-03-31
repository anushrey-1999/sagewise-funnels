import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { and, eq, gt } from "drizzle-orm";

import { db } from "@/lib/db";
import { adminLoginAttempts, adminUsers } from "@/lib/db/schema";
import { verifyPassword } from "@/lib/admin/password";
import { assertSameOrigin, getClientIp } from "@/lib/admin/security";
import { createAdminSession, setAdminSessionCookie } from "@/lib/admin/session";

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

const WINDOW_MS = 15 * 60 * 1000;
const MAX_ATTEMPTS = 10;

export async function POST(req: NextRequest) {
  try {
    assertSameOrigin(req);

    const ip = getClientIp(req);
    const now = Date.now();
    const windowStart = new Date(now - WINDOW_MS);

    if (ip) {
      const attempts = await db
        .select({ id: adminLoginAttempts.id })
        .from(adminLoginAttempts)
        .where(and(eq(adminLoginAttempts.ip, ip), gt(adminLoginAttempts.createdAt, windowStart)));

      if (attempts.length >= MAX_ATTEMPTS) {
        return NextResponse.json({ error: "Too many attempts. Try again later." }, { status: 429 });
      }
    }

    const body = loginSchema.parse(await req.json());
    const email = body.email.toLowerCase();

    const [user] = await db
      .select({
        id: adminUsers.id,
        email: adminUsers.email,
        role: adminUsers.role,
        passwordHash: adminUsers.passwordHash,
      })
      .from(adminUsers)
      .where(eq(adminUsers.email, email))
      .limit(1);

    const ok = user ? await verifyPassword(body.password, user.passwordHash) : false;
    if (!ok) {
      await db.insert(adminLoginAttempts).values({
        email,
        ip: ip ?? undefined,
      });
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
    }

    const { token, expiresAt } = await createAdminSession(user.id);
    const res = NextResponse.json(
      { user: { id: user.id, email: user.email, role: user.role } },
      { status: 200 }
    );
    setAdminSessionCookie(res, token, expiresAt);
    return res;
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: "Invalid request", issues: err.issues }, { status: 400 });
    }
    return NextResponse.json({ error: "Failed to login" }, { status: 500 });
  }
}

