import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import { requireAdmin } from "@/lib/admin/require";
import { listConfigs, type ConfigKind } from "@/lib/config-service";

const querySchema = z.object({
  kind: z.enum(["funnel", "adwall"]).optional(),
});

export async function GET(req: NextRequest) {
  try {
    await requireAdmin(req, "viewer");

    const url = new URL(req.url);
    const parsed = querySchema.parse({
      kind: url.searchParams.get("kind") || undefined,
    });

    const rows = await listConfigs(parsed.kind as ConfigKind | undefined);
    return NextResponse.json({ configs: rows }, { status: 200 });
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
        ? "Failed to list configs"
        : err instanceof Error
          ? err.message
          : "Error";
    return NextResponse.json({ error: msg }, { status });
  }
}

