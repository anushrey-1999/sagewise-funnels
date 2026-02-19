import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import { db } from "@/lib/db";
import { adminUsers } from "@/lib/db/schema";
import { hashPassword } from "@/lib/admin/password";
import { assertSameOrigin } from "@/lib/admin/security";

const bootstrapSchema = z.object({
  email: z.string().email(),
  password: z.string().min(12),
});

export async function POST(req: NextRequest) {
  try {
    assertSameOrigin(req);

    const expected = process.env.ADMIN_BOOTSTRAP_TOKEN;
    const provided = req.headers.get("x-admin-bootstrap-token");
    if (!expected || !provided || provided !== expected) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const existing = await db.select({ id: adminUsers.id }).from(adminUsers).limit(1);
    if (existing.length > 0) {
      return NextResponse.json({ error: "Bootstrap already completed" }, { status: 409 });
    }

    const body = bootstrapSchema.parse(await req.json());
    const passwordHash = await hashPassword(body.password);

    const [user] = await db
      .insert(adminUsers)
      .values({
        email: body.email.toLowerCase(),
        passwordHash,
        role: "superadmin",
      })
      .returning({ id: adminUsers.id, email: adminUsers.email, role: adminUsers.role });

    return NextResponse.json({ user }, { status: 201 });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: "Invalid request", issues: err.issues }, { status: 400 });
    }
    return NextResponse.json({ error: "Failed to bootstrap admin" }, { status: 500 });
  }
}

