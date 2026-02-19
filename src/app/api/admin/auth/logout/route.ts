import { NextRequest, NextResponse } from "next/server";

import { assertSameOrigin } from "@/lib/admin/security";
import {
  clearAdminSessionCookie,
  deleteAdminSessionByToken,
} from "@/lib/admin/session";
import { ADMIN_SESSION_COOKIE } from "@/lib/admin/constants";

export async function POST(req: NextRequest) {
  try {
    assertSameOrigin(req);

    const token = req.cookies.get(ADMIN_SESSION_COOKIE)?.value;
    if (token) {
      await deleteAdminSessionByToken(token);
    }

    const res = NextResponse.json({ ok: true }, { status: 200 });
    clearAdminSessionCookie(res);
    return res;
  } catch {
    return NextResponse.json({ error: "Failed to logout" }, { status: 500 });
  }
}

