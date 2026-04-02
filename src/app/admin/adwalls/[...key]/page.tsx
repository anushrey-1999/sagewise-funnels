import ConfigEditorClient from "../../ConfigEditorClient";
import { requireAdminPage } from "@/lib/admin/require-page";
import { getConfigRow } from "@/lib/config-service";
import { getAdwallConfig } from "@/lib/adwall-loader";
import { getPublishedFunnelConfig } from "@/lib/published-config";
import type { AdwallCard, AdwallConfig } from "@/types/adwall";

/**
 * When a config is loaded from the DB, optional fields added to the file config after the last save
 * won't be present in the DB draft. This fills those gaps from the matching file card so the
 * admin form shows pre-populated values for newly added fields.
 * Only fills fields that are `undefined` in the DB card — empty string is respected as intentional.
 */
const OPTIONAL_CARD_FIELDS: Array<keyof AdwallCard> = [
  "trustpilotReviews",
  "minCreditScore",
  "maxLoanAmount",
  "aprRange",
];

function mergeFileCardIntoDbCard(dbCard: AdwallCard, fileCard: AdwallCard): AdwallCard {
  const result: AdwallCard = { ...dbCard };
  for (const field of OPTIONAL_CARD_FIELDS) {
    if (result[field] === undefined && fileCard[field] !== undefined) {
      (result as Record<string, unknown>)[field] = fileCard[field];
    }
  }
  return result;
}

function buildNewAdwallSkeleton(routePrefix?: string, adwallType?: string): AdwallConfig {
  const normalizedRoutePrefix = routePrefix || "route";
  const normalizedAdwallType = adwallType || "one";

  return {
    id: `${normalizedRoutePrefix}-${normalizedAdwallType}`,
    funnelId: normalizedRoutePrefix,
    adwallType: normalizedAdwallType,
    title: "New Adwall",
    subtitle: "",
    updatedAt: `Updated ${new Date().toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    })}`,
    trackingParams: {
      affiliateIdParam: "s1",
      transactionIdParam: "s2",
    },
    cards: [
      {
        heading: "Offer 1",
        description: "Description",
        features: ["Feature 1"],
        buttonLink: "https://example.com",
        buttonText: "Learn more",
        ratingsNumber: "9.0",
        ratingsCount: 5,
        logo: "",
        logoWidth: "110px",
        logoHeight: "28px",
        logoText: "",
        logoSubtext: "",
        creditCardImage: "",
        badgeText: "",
        badgeIcon: "card",
        advertiserName: "",
        phoneNumber: "",
        bottomBoxHtml: "",
      },
    ],
  };
}

export default async function AdminAdwallEditorPage({
  params,
  searchParams,
}: {
  params: Promise<{ key: string[] }>;
  searchParams?: Promise<{ create?: string }>;
}) {
  const user = await requireAdminPage("viewer");
  const { key } = await params;
  const query = (await searchParams) || {};
  const keyStr = (key || []).join("/").trim();
  const createMode = query.create === "1";

  const [routePrefix, adwallType] = key || [];
  const existing = keyStr ? await getConfigRow("adwall", keyStr) : null;
  const fallback =
    existing || createMode || !routePrefix || !adwallType ? null : getAdwallConfig(routePrefix, adwallType);

  const skeleton = buildNewAdwallSkeleton(routePrefix, adwallType);

  const draft =
    existing?.draft ??
    fallback ??
    skeleton;

  // For DB drafts, fill in any optional card fields that are absent but present in the
  // corresponding file config (e.g. fields added after the last save).
  if (existing?.draft && fallback == null && routePrefix && adwallType) {
    const fileConfig = getAdwallConfig(routePrefix, adwallType);
    const draftTyped = draft as AdwallConfig;
    if (fileConfig && Array.isArray(draftTyped.cards)) {
      const fileCards = Array.isArray(fileConfig.cards) ? fileConfig.cards : [];
      draftTyped.cards = draftTyped.cards.map((dbCard) => {
        const fileCard = fileCards.find(
          (f) => f.advertiserName === dbCard.advertiserName || f.heading === dbCard.heading
        );
        return fileCard ? mergeFileCardIntoDbCard(dbCard, fileCard) : dbCard;
      });
    }
  }

  // Prefill navbar fields for consistency with the public site:
  // Public Navbar uses /api/navbar which falls back to funnel.navbar when adwall.navbar is missing.
  // By merging that fallback here, the form shows the values and saving/publishing persists them into the adwall config.
  const draftAdwall = draft as AdwallConfig;
  const hasNavbarValues = !!draftAdwall?.navbar?.tagline || !!draftAdwall?.navbar?.phone;
  const funnelNavbar =
    !hasNavbarValues && draftAdwall?.funnelId
      ? (await getPublishedFunnelConfig(draftAdwall.funnelId, { useDraft: true }))?.navbar
      : null;
  const draftWithNavbar = !hasNavbarValues && funnelNavbar ? ({ ...draftAdwall, navbar: funnelNavbar } satisfies AdwallConfig) : draft;

  const published = existing?.published ?? null;

  const previewHref =
    routePrefix && adwallType
      ? `/adwall/${encodeURIComponent(routePrefix)}/${encodeURIComponent(
          adwallType
        )}?preview=1&name=Test&zip=00000`
      : "/admin/adwalls";

  const liveHref =
    routePrefix && adwallType
      ? `/adwall/${encodeURIComponent(routePrefix)}/${encodeURIComponent(adwallType)}`
      : "/admin/adwalls";

  return (
    <div className="max-w-5xl mx-auto px-6 py-10 space-y-6">
      <ConfigEditorClient
        kind="adwall"
        keyStr={keyStr}
        initialDraftJson={JSON.stringify(draftWithNavbar, null, 2)}
        initialPublishedJson={published ? JSON.stringify(published, null, 2) : null}
        userRole={user.role}
        backHref="/admin/adwalls"
        previewHref={previewHref}
        liveHref={liveHref}
      />
    </div>
  );
}

