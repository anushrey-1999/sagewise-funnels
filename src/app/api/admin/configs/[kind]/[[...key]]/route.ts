import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import { requireAdmin } from "@/lib/admin/require";
import { canEditScripts } from "@/lib/admin/rbac";
import { preserveScriptFields } from "@/lib/admin/script-guard";
import { assertSameOrigin } from "@/lib/admin/security";
import { adwallConfigSchema, configUpsertSchema, funnelConfigSchema } from "@/lib/config-schemas";
import {
  deleteConfig,
  getConfigRow,
  publishConfig,
  rollbackConfig,
  type ConfigKind,
  upsertDraftConfig,
} from "@/lib/config-service";

function parseKind(kind: string): ConfigKind {
  if (kind === "funnel" || kind === "adwall") return kind;
  throw new Error("Invalid kind");
}

function joinKey(key: string[] | undefined): string {
  return (key || []).join("/").trim();
}

const actionSchema = z.discriminatedUnion("action", [
  z.object({ action: z.literal("publish") }),
  z.object({ action: z.literal("rollback"), toVersion: z.number().int().positive() }),
]);

export async function GET(req: NextRequest, ctx: { params: Promise<{ kind: string; key?: string[] }> }) {
  try {
    const user = await requireAdmin(req, "viewer");
    const { kind, key } = await ctx.params;

    const parsedKind = parseKind(kind);
    const joinedKey = joinKey(key);
    if (!joinedKey) return NextResponse.json({ error: "Missing key" }, { status: 400 });

    const row = await getConfigRow(parsedKind, joinedKey);
    return NextResponse.json(
      {
        config: row
          ? {
              kind: parsedKind,
              key: joinedKey,
              version: row.version,
              draft: row.draft,
              published: row.published,
              updatedAt: row.updatedAt,
              publishedAt: row.publishedAt,
            }
          : null,
        user,
      },
      { status: 200 }
    );
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
        ? "Failed to fetch config"
        : err instanceof Error
          ? err.message
          : "Error";
    return NextResponse.json({ error: msg }, { status });
  }
}

export async function PUT(req: NextRequest, ctx: { params: Promise<{ kind: string; key?: string[] }> }) {
  try {
    assertSameOrigin(req);

    const user = await requireAdmin(req, "client_editor");
    const { kind, key } = await ctx.params;
    const parsedKind = parseKind(kind);
    const joinedKey = joinKey(key);
    if (!joinedKey) return NextResponse.json({ error: "Missing key" }, { status: 400 });

    const body = configUpsertSchema.parse(await req.json());
    const existing = await getConfigRow(parsedKind, joinedKey);

    let draft: unknown = body.draft;
    if (!canEditScripts(user.role)) {
      const baseline = existing?.draft ?? existing?.published ?? {};
      draft = preserveScriptFields(baseline, draft);
    }

    // Validate shape
    if (parsedKind === "funnel") {
      funnelConfigSchema.parse(draft);
    } else {
      adwallConfigSchema.parse(draft);
    }

    const row = await upsertDraftConfig({
      kind: parsedKind,
      key: joinedKey,
      draft,
      updatedBy: user.id,
    });

    return NextResponse.json(
      { config: { kind: parsedKind, key: joinedKey, version: row.version, draft: row.draft, published: row.published } },
      { status: 200 }
    );
  } catch (err: unknown) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: "Validation failed", issues: err.issues }, { status: 400 });
    }
    const status =
      typeof err === "object" &&
      err !== null &&
      "status" in err &&
      typeof (err as { status?: unknown }).status === "number"
        ? (err as { status: number }).status
        : 500;
    const msg =
      status === 500
        ? "Failed to save draft"
        : err instanceof Error
          ? err.message
          : "Error";
    return NextResponse.json({ error: msg }, { status });
  }
}

export async function POST(req: NextRequest, ctx: { params: Promise<{ kind: string; key?: string[] }> }) {
  try {
    assertSameOrigin(req);

    const { kind, key } = await ctx.params;
    const parsedKind = parseKind(kind);
    const joinedKey = joinKey(key);
    if (!joinedKey) return NextResponse.json({ error: "Missing key" }, { status: 400 });

    const body = actionSchema.parse(await req.json());

    if (body.action === "publish") {
      const user = await requireAdmin(req, "client_editor");
      const row = await getConfigRow(parsedKind, joinedKey);
      if (!row) return NextResponse.json({ error: "Config not found" }, { status: 404 });

      if (parsedKind === "funnel") funnelConfigSchema.parse(row.draft);
      else adwallConfigSchema.parse(row.draft);

      const updated = await publishConfig({ kind: parsedKind, key: joinedKey, publishedBy: user.id });
      return NextResponse.json({ config: updated }, { status: 200 });
    }

    // rollback
    const user = await requireAdmin(req, "internal_admin");
    const updated = await rollbackConfig({
      kind: parsedKind,
      key: joinedKey,
      toVersion: body.toVersion,
      rolledBackBy: user.id,
    });
    return NextResponse.json({ config: updated }, { status: 200 });
  } catch (err: unknown) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: "Invalid request", issues: err.issues }, { status: 400 });
    }
    const status =
      typeof err === "object" &&
      err !== null &&
      "status" in err &&
      typeof (err as { status?: unknown }).status === "number"
        ? (err as { status: number }).status
        : 500;
    const msg =
      status === 500 ? "Failed to update config" : err instanceof Error ? err.message : "Error";
    return NextResponse.json({ error: msg }, { status });
  }
}

export async function DELETE(req: NextRequest, ctx: { params: Promise<{ kind: string; key?: string[] }> }) {
  try {
    assertSameOrigin(req);

    await requireAdmin(req, "internal_admin");
    const { kind, key } = await ctx.params;
    const parsedKind = parseKind(kind);
    const joinedKey = joinKey(key);
    if (!joinedKey) return NextResponse.json({ error: "Missing key" }, { status: 400 });

    await deleteConfig({ kind: parsedKind, key: joinedKey });
    return NextResponse.json({ ok: true }, { status: 200 });
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
        ? "Failed to delete config"
        : err instanceof Error
          ? err.message
          : "Error";
    return NextResponse.json({ error: msg }, { status });
  }
}

