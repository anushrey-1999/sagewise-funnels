import "server-only";

import type { AdwallConfig } from "@/types/adwall";
import type { FormConfig } from "@/types/form";
import { getAdwallConfig as getStaticAdwallConfig } from "@/lib/adwall-loader";
import { getFunnelConfig as getStaticFunnelConfig } from "@/lib/funnel-loader";
import { adwallConfigKey, getConfigRow, type ConfigKind } from "@/lib/config-service";

async function getConfigData<T>(
  kind: ConfigKind,
  key: string,
  opts?: { useDraft?: boolean }
): Promise<T | null> {
  let row: Awaited<ReturnType<typeof getConfigRow>> | null = null;
  try {
    row = await getConfigRow(kind, key);
  } catch {
    // If DB tables aren't migrated yet (or DB is temporarily unavailable),
    // fall back to bundled JSON configs instead of crashing the public site.
    return null;
  }
  if (!row) return null;
  if (opts?.useDraft) return (row.draft as T) ?? null;
  return (row.published as T) ?? null;
}

export async function getPublishedFunnelConfig(
  funnelId: string | null,
  opts?: { useDraft?: boolean }
): Promise<FormConfig | null> {
  const resolvedId = funnelId || "cc-one";
  const fromDb = await getConfigData<FormConfig>("funnel", resolvedId, opts);
  if (fromDb) return fromDb;
  return getStaticFunnelConfig(resolvedId);
}

export async function getPublishedAdwallConfig(
  routePrefix: string,
  adwallType: string,
  opts?: { useDraft?: boolean }
): Promise<AdwallConfig | null> {
  const key = adwallConfigKey(routePrefix, adwallType);
  const fromDb = await getConfigData<AdwallConfig>("adwall", key, opts);
  if (fromDb) return fromDb;
  return getStaticAdwallConfig(routePrefix, adwallType);
}

