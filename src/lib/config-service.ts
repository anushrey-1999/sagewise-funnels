import "server-only";

import { and, desc, eq } from "drizzle-orm";

import { db } from "@/lib/db";
import { configVersions, configs } from "@/lib/db/schema";

export type ConfigKind = "funnel" | "adwall";

export function adwallConfigKey(routePrefix: string, type: string): string {
  return `${routePrefix}/${type}`;
}

export async function listConfigs(kind?: ConfigKind) {
  const q = db
    .select({
      id: configs.id,
      kind: configs.kind,
      key: configs.key,
      version: configs.version,
      updatedAt: configs.updatedAt,
      publishedAt: configs.publishedAt,
    })
    .from(configs)
    .orderBy(desc(configs.updatedAt));

  if (!kind) return q;
  return q.where(eq(configs.kind, kind));
}

export async function getConfigRow(kind: ConfigKind, key: string) {
  const rows = await db
    .select()
    .from(configs)
    .where(and(eq(configs.kind, kind), eq(configs.key, key)))
    .limit(1);
  return rows[0] ?? null;
}

export async function upsertDraftConfig(args: {
  kind: ConfigKind;
  key: string;
  draft: unknown;
  updatedBy?: string;
}) {
  const now = new Date();
  const inserted = await db
    .insert(configs)
    .values({
      kind: args.kind,
      key: args.key,
      draft: args.draft,
      updatedAt: now,
      updatedBy: args.updatedBy ?? null,
    })
    .onConflictDoUpdate({
      target: [configs.kind, configs.key],
      set: {
        draft: args.draft,
        updatedAt: now,
        updatedBy: args.updatedBy ?? null,
      },
    })
    .returning();

  return inserted[0]!;
}

export async function publishConfig(args: { kind: ConfigKind; key: string; publishedBy?: string }) {
  const row = await getConfigRow(args.kind, args.key);
  if (!row) throw new Error("Config not found");

  const nextVersion = (row.version ?? 0) + 1;
  const now = new Date();

  const [updated] = await db
    .update(configs)
    .set({
      published: row.draft,
      version: nextVersion,
      publishedAt: now,
      updatedAt: now,
      updatedBy: args.publishedBy ?? null,
    })
    .where(eq(configs.id, row.id))
    .returning();

  await db.insert(configVersions).values({
    configId: row.id,
    kind: args.kind,
    key: args.key,
    version: nextVersion,
    action: "publish",
    data: row.draft,
    createdAt: now,
    createdBy: args.publishedBy ?? null,
  });

  return updated!;
}

export async function getConfigVersionData(args: { kind: ConfigKind; key: string; version: number }) {
  const rows = await db
    .select({ data: configVersions.data })
    .from(configVersions)
    .where(
      and(
        eq(configVersions.kind, args.kind),
        eq(configVersions.key, args.key),
        eq(configVersions.version, args.version)
      )
    )
    .limit(1);
  return rows[0]?.data ?? null;
}

export async function listConfigVersions(args: { kind: ConfigKind; key: string }) {
  return db
    .select({
      version: configVersions.version,
      action: configVersions.action,
      createdAt: configVersions.createdAt,
      createdBy: configVersions.createdBy,
    })
    .from(configVersions)
    .where(and(eq(configVersions.kind, args.kind), eq(configVersions.key, args.key)))
    .orderBy(desc(configVersions.version));
}

export async function rollbackConfig(args: {
  kind: ConfigKind;
  key: string;
  toVersion: number;
  rolledBackBy?: string;
}) {
  const row = await getConfigRow(args.kind, args.key);
  if (!row) throw new Error("Config not found");

  const data = await getConfigVersionData({
    kind: args.kind,
    key: args.key,
    version: args.toVersion,
  });
  if (!data) throw new Error("Version not found");

  const nextVersion = (row.version ?? 0) + 1;
  const now = new Date();

  const [updated] = await db
    .update(configs)
    .set({
      draft: data,
      published: data,
      version: nextVersion,
      publishedAt: now,
      updatedAt: now,
      updatedBy: args.rolledBackBy ?? null,
    })
    .where(eq(configs.id, row.id))
    .returning();

  await db.insert(configVersions).values({
    configId: row.id,
    kind: args.kind,
    key: args.key,
    version: nextVersion,
    action: "rollback",
    data,
    createdAt: now,
    createdBy: args.rolledBackBy ?? null,
  });

  return updated!;
}

export async function deleteConfig(args: { kind: ConfigKind; key: string }) {
  await db.delete(configs).where(and(eq(configs.kind, args.kind), eq(configs.key, args.key)));
}

