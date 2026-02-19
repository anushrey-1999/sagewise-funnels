import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import { requireAdmin } from "@/lib/admin/require";
import { listConfigVersions, type ConfigKind } from "@/lib/config-service";

const querySchema = z.object({
  kind: z.enum(["funnel", "adwall"]),
  key: z.string().min(1),
});

export async function GET(req: NextRequest) {
  try {
    await requireAdmin(req, "viewer");
    const url = new URL(req.url);
    const q = querySchema.parse({
      kind: url.searchParams.get("kind"),
      key: url.searchParams.get("key"),
    });

    const versions = await listConfigVersions({ kind: q.kind as ConfigKind, key: q.key });
    return NextResponse.json({ versions }, { status: 200 });
  } catch (err: unknown) {
    const status =
      typeof err === "object" &&
      err !== null &&
      "status" in err &&
      typeof (err as { status?: unknown }).status === "number"
        ? (err as { status: number }).status
        : 500;
    const msg =
      status === 500
        ? "Failed to list versions"
        : err instanceof Error
          ? err.message
          : "Error";
    return NextResponse.json({ error: msg }, { status });
  }
}

