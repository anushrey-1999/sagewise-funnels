/**
 * Sync local JSON config files into the database.
 *
 * Reads adwall (and optionally funnel) JSON files, validates them, and
 * upserts both `draft` and `published` columns so the changes are
 * immediately visible on the live site AND in the admin panel.
 *
 * Usage:
 *   # Sync all configs (skip existing rows unless SEED_FORCE=1)
 *   pnpm sync:configs:dev
 *
 *   # Force-overwrite ALL configs from local JSON
 *   SEED_FORCE=1 pnpm sync:configs:dev
 *
 *   # Sync only specific adwall keys (comma-separated)
 *   SYNC_KEYS=mortgage/heloc,mortgage/refi pnpm sync:configs:dev
 *
 *   # Sync only adwalls (skip funnels)
 *   SYNC_KIND=adwall pnpm sync:configs:dev
 */

import fs from "node:fs/promises";
import path from "node:path";

import { and, eq } from "drizzle-orm";

import { db } from "@/lib/db";
import { configVersions, configs } from "@/lib/db/schema";
import { adwallConfigSchema, funnelConfigSchema } from "@/lib/config-schemas";
import type { z } from "zod";

type ConfigKind = "funnel" | "adwall";
type AdwallConfig = z.infer<typeof adwallConfigSchema>;
type FunnelConfig = z.infer<typeof funnelConfigSchema>;

const force = process.env.SEED_FORCE === "1";
const syncKeys = process.env.SYNC_KEYS
  ? new Set(process.env.SYNC_KEYS.split(",").map((k) => k.trim()))
  : null;
const syncKind = process.env.SYNC_KIND as ConfigKind | undefined;

async function readJsonFiles(dir: string): Promise<unknown[]> {
  const entries = await fs.readdir(dir, { withFileTypes: true });
  const files = entries.filter((e) => e.isFile() && e.name.endsWith(".json")).map((e) => e.name);
  const out: unknown[] = [];
  for (const f of files) {
    const raw = await fs.readFile(path.join(dir, f), "utf8");
    out.push(JSON.parse(raw));
  }
  return out;
}

function adwallKey(cfg: AdwallConfig): string {
  const routePrefix = String(cfg.funnelId || "").startsWith("cc-")
    ? "cc"
    : String(cfg.funnelId || "");
  return `${routePrefix}/${cfg.adwallType}`;
}

async function upsert(kind: ConfigKind, key: string, data: unknown) {
  if (syncKeys && !syncKeys.has(key)) return "skipped-filter";

  const [existing] = await db
    .select({ id: configs.id, version: configs.version })
    .from(configs)
    .where(and(eq(configs.kind, kind), eq(configs.key, key)))
    .limit(1);

  if (existing && !force) return "skipped-exists";

  const now = new Date();

  if (!existing) {
    const [row] = await db
      .insert(configs)
      .values({
        kind,
        key,
        draft: data,
        published: data,
        version: 1,
        updatedAt: now,
        publishedAt: now,
      })
      .returning();

    await db.insert(configVersions).values({
      configId: row.id,
      kind,
      key,
      version: 1,
      action: "publish",
      data,
      createdAt: now,
      createdBy: null,
    });

    return "created";
  }

  const nextVersion = (existing.version ?? 0) + 1;

  await db
    .update(configs)
    .set({
      draft: data,
      published: data,
      version: nextVersion,
      updatedAt: now,
      publishedAt: now,
    })
    .where(eq(configs.id, existing.id));

  await db
    .insert(configVersions)
    .values({
      configId: existing.id,
      kind,
      key,
      version: nextVersion,
      action: "publish",
      data,
      createdAt: now,
      createdBy: null,
    })
    .onConflictDoNothing();

  return "updated";
}

async function main() {
  const root = process.cwd();
  const results: { kind: string; key: string; status: string }[] = [];

  if (!syncKind || syncKind === "funnel") {
    const funnelsDir = path.join(root, "src", "lib", "funnel-configs");
    const funnels = await readJsonFiles(funnelsDir);
    for (const cfg of funnels) {
      const parsed: FunnelConfig = funnelConfigSchema.parse(cfg);
      const status = await upsert("funnel", parsed.id, parsed);
      results.push({ kind: "funnel", key: parsed.id, status });
    }
  }

  if (!syncKind || syncKind === "adwall") {
    const adwallsDir = path.join(root, "src", "lib", "adwall-configs");
    const adwalls = await readJsonFiles(adwallsDir);
    for (const cfg of adwalls) {
      const parsed: AdwallConfig = adwallConfigSchema.parse(cfg);
      const key = adwallKey(parsed);
      const status = await upsert("adwall", key, parsed);
      results.push({ kind: "adwall", key, status });
    }
  }

  const created = results.filter((r) => r.status === "created").length;
  const updated = results.filter((r) => r.status === "updated").length;
  const skipped = results.filter((r) => r.status.startsWith("skipped")).length;

  console.log("\nSync results:");
  console.log("─".repeat(60));
  for (const r of results) {
    const icon =
      r.status === "created" ? "✅" :
      r.status === "updated" ? "🔄" :
      r.status === "skipped-filter" ? "⏭️ " : "⏩";
    console.log(`  ${icon}  ${r.kind}/${r.key} → ${r.status}`);
  }
  console.log("─".repeat(60));
  console.log(`  Created: ${created}  |  Updated: ${updated}  |  Skipped: ${skipped}`);
  console.log("");
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error("Sync failed:", err);
    process.exit(1);
  });
