import fs from "node:fs/promises";
import path from "node:path";

import type { z } from "zod";
import { and, eq } from "drizzle-orm";

import { db } from "@/lib/db";
import { configVersions, configs } from "@/lib/db/schema";
import { adwallConfigSchema, funnelConfigSchema } from "@/lib/config-schemas";

type SeedConfigKind = "funnel" | "adwall";

type FunnelConfig = z.infer<typeof funnelConfigSchema>;
type AdwallConfig = z.infer<typeof adwallConfigSchema>;

async function readJsonFiles(dir: string): Promise<unknown[]> {
  const entries = await fs.readdir(dir, { withFileTypes: true });
  const files = entries.filter((e) => e.isFile() && e.name.endsWith(".json")).map((e) => e.name);
  const out: unknown[] = [];
  for (const f of files) {
    const full = path.join(dir, f);
    const raw = await fs.readFile(full, "utf8");
    out.push(JSON.parse(raw) as unknown);
  }
  return out;
}

function routePrefixFromFunnelId(funnelId: string): string {
  return funnelId.startsWith("cc-") ? "cc" : funnelId;
}

function adwallKeyFromConfig(cfg: AdwallConfig): string {
  const routePrefix = routePrefixFromFunnelId(String(cfg.funnelId || ""));
  const type = String(cfg.adwallType || "");
  return `${routePrefix}/${type}`;
}

async function upsertPublished(kind: SeedConfigKind, key: string, data: unknown) {
  const force = process.env.SEED_FORCE === "1";

  const [existing] = await db
    .select({ id: configs.id })
    .from(configs)
    .where(and(eq(configs.kind, kind), eq(configs.key, key)))
    .limit(1);

  if (existing && !force) return;

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

    await db
      .insert(configVersions)
      .values({
        configId: row.id,
        kind,
        key,
        version: 1,
        action: "publish",
        data,
        createdAt: now,
      })
      .onConflictDoNothing();
    return;
  }

  // Force overwrite existing config (do not touch version history unless it doesn't exist)
  await db
    .update(configs)
    .set({
      draft: data,
      published: data,
      updatedAt: now,
      publishedAt: now,
    })
    .where(eq(configs.id, existing.id));
}

async function main() {
  const root = process.cwd();
  const funnelsDir = path.join(root, "src", "lib", "funnel-configs");
  const adwallsDir = path.join(root, "src", "lib", "adwall-configs");

  const funnels = await readJsonFiles(funnelsDir);
  const adwalls = await readJsonFiles(adwallsDir);

  for (const cfg of funnels) {
    const parsed: FunnelConfig = funnelConfigSchema.parse(cfg);
    await upsertPublished("funnel", parsed.id, parsed);
  }

  for (const cfg of adwalls) {
    const parsed: AdwallConfig = adwallConfigSchema.parse(cfg);
    const key = adwallKeyFromConfig(parsed);
    await upsertPublished("adwall", key, parsed);
  }

  console.log(`Seeded ${funnels.length} funnels and ${adwalls.length} adwalls.`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

