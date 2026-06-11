import "server-only";

import type { AdwallConfig } from "@/types/adwall";
import type { FormConfig } from "@/types/form";
import { getAdwallConfig as getStaticAdwallConfig } from "@/lib/adwall-loader";
import { getDemoAdwallConfig as getStaticDemoAdwallConfig } from "@/lib/demo-adwall-loader";
import { getFunnelConfig as getStaticFunnelConfig } from "@/lib/funnel-loader";
import { ensureMortgagePoorCreditBucket } from "@/lib/mortgage-ranking-defaults";
import { adwallConfigKey, getConfigRow, type ConfigKind } from "@/lib/config-service";

type ConfigResult<T> = { source: "db"; data: T } | { source: "db-missing-field"; row: true } | { source: "no-row" } | { source: "db-error" };

async function getConfigFromDb<T>(
  kind: ConfigKind,
  key: string,
  opts?: { useDraft?: boolean }
): Promise<ConfigResult<T>> {
  let row: Awaited<ReturnType<typeof getConfigRow>> | null = null;
  try {
    row = await getConfigRow(kind, key);
  } catch {
    // DB unavailable — caller decides whether to use static fallback.
    return { source: "db-error" };
  }
  if (!row) return { source: "no-row" };

  if (opts?.useDraft) {
    // Preview mode: prefer draft, fall back to published
    if (row.draft != null) return { source: "db", data: row.draft as T };
    if (row.published != null) return { source: "db", data: row.published as T };
    return { source: "db-missing-field", row: true };
  }

  // Live mode: only use published. If never published, fall back to static
  // JSON so file-based updates are visible until an explicit publish happens.
  if (row.published != null) return { source: "db", data: row.published as T };
  return { source: "no-row" };
}

function normalizeAdwallConfig(config: AdwallConfig): AdwallConfig {
  if (config.funnelId !== "mortgage" || !config.rankingConfig) return config;

  return {
    ...config,
    rankingConfig: ensureMortgagePoorCreditBucket(config.rankingConfig),
  };
}

export async function getPublishedFunnelConfig(
  funnelId: string | null,
  opts?: { useDraft?: boolean }
): Promise<FormConfig | null> {
  const resolvedId = funnelId || "cc-one";
  // Dev escape-hatch: FORCE_STATIC_CONFIG=1 in .env.dev bypasses DB so
  // edits to funnel-configs/*.json are visible immediately without re-publishing.
  if (process.env.FORCE_STATIC_CONFIG === "1") {
    return getStaticFunnelConfig(resolvedId);
  }
  const result = await getConfigFromDb<FormConfig>("funnel", resolvedId, opts);
  if (result.source === "db") return result.data;
  // Only fall back to static JSON when DB has no row at all (or is unavailable).
  // If a row exists the DB version is authoritative — don't show stale static data.
  if (result.source === "no-row" || result.source === "db-error") {
    return getStaticFunnelConfig(resolvedId);
  }
  return null;
}

export async function getPublishedAdwallConfig(
  routePrefix: string,
  adwallType: string,
  opts?: { useDraft?: boolean }
): Promise<AdwallConfig | null> {
  const key = adwallConfigKey(routePrefix, adwallType);
  const result = await getConfigFromDb<AdwallConfig>("adwall", key, opts);
  if (result.source === "db") return normalizeAdwallConfig(result.data);
  if (result.source === "no-row" || result.source === "db-error") {
    const staticConfig = getStaticAdwallConfig(routePrefix, adwallType);
    return staticConfig ? normalizeAdwallConfig(staticConfig) : null;
  }
  return null;
}

export async function getPublishedDemoAdwallConfig(
  routePrefix: string,
  adwallType: string,
  opts?: { useDraft?: boolean }
): Promise<AdwallConfig | null> {
  const key = adwallConfigKey(routePrefix, adwallType);
  const result = await getConfigFromDb<AdwallConfig>("demo-adwall", key, opts);
  if (result.source === "db") return normalizeAdwallConfig(result.data);
  if (result.source === "no-row" || result.source === "db-error") {
    const staticConfig = getStaticDemoAdwallConfig(routePrefix, adwallType);
    return staticConfig ? normalizeAdwallConfig(staticConfig) : null;
  }
  return null;
}

