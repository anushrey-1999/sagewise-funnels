import "server-only";

import type { AdwallConfig } from "@/types/adwall";
import type { FormConfig } from "@/types/form";
import { getAdwallConfig as getStaticAdwallConfig } from "@/lib/adwall-loader";
import { getDemoAdwallConfig as getStaticDemoAdwallConfig } from "@/lib/demo-adwall-loader";
import { getFunnelConfig as getStaticFunnelConfig } from "@/lib/funnel-loader";
import { ensureMortgagePoorCreditBucket } from "@/lib/mortgage-ranking-defaults";
import { adwallConfigKey, getConfigRow, type ConfigKind } from "@/lib/config-service";

type ConfigResult<T> = { source: "db"; data: T } | { source: "db-missing-field"; row: true } | { source: "no-row" } | { source: "db-error" };

const MORTGAGE_CREDIT_SCORE_OPTIONS = [
  { value: "excellent", label: "Excellent (720+)" },
  { value: "good", label: "Good (680-719)" },
  { value: "fair", label: "Fair (620-679)" },
  { value: "poor", label: "Poor (580-619)" },
  { value: "bad", label: "Below 580" },
];

const MORTGAGE_LOAN_AMOUNT_OPTIONS = [
  { value: "upto-150", label: "Upto $150k" },
  { value: "100-250", label: "$100k-$250k" },
  { value: "250-400", label: "$250k-$400k" },
  { value: "400-plus", label: "$400k and up" },
];

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

function normalizeMortgageFunnelConfig(config: FormConfig): FormConfig {
  if (config.id !== "mortgage") return config;

  return {
    ...config,
    steps: config.steps.map((step) => ({
      ...step,
      fields: step.fields.map((field) =>
        field.id === "creditScore"
          ? {
              ...field,
              options: MORTGAGE_CREDIT_SCORE_OPTIONS,
            }
          : field.id === "loanAmount"
            ? {
                ...field,
                options: MORTGAGE_LOAN_AMOUNT_OPTIONS,
              }
          : field
      ),
    })),
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
    const staticConfig = getStaticFunnelConfig(resolvedId);
    return staticConfig ? normalizeMortgageFunnelConfig(staticConfig) : null;
  }
  const result = await getConfigFromDb<FormConfig>("funnel", resolvedId, opts);
  if (result.source === "db") return normalizeMortgageFunnelConfig(result.data);
  // Only fall back to static JSON when DB has no row at all (or is unavailable).
  // If a row exists the DB version is authoritative — don't show stale static data.
  if (result.source === "no-row" || result.source === "db-error") {
    const staticConfig = getStaticFunnelConfig(resolvedId);
    return staticConfig ? normalizeMortgageFunnelConfig(staticConfig) : null;
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

