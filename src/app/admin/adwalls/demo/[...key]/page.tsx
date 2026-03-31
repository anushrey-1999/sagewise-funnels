import ConfigEditorClient from "../../../ConfigEditorClient";
import { requireAdminPage } from "@/lib/admin/require-page";
import { getConfigRow } from "@/lib/config-service";
import { getDemoAdwallConfig } from "@/lib/demo-adwall-loader";
import { getPublishedFunnelConfig } from "@/lib/published-config";
import type { AdwallConfig } from "@/types/adwall";

function buildNewDemoAdwallSkeleton(routePrefix?: string, adwallType?: string): AdwallConfig {
  const normalizedRoutePrefix = routePrefix || "route";
  const normalizedAdwallType = adwallType || "one";

  return {
    id: `demo-${normalizedRoutePrefix}-${normalizedAdwallType}`,
    funnelId: normalizedRoutePrefix,
    adwallType: normalizedAdwallType,
    title: "New Demo Adwall",
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

export default async function AdminDemoAdwallEditorPage({
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

  // Check DB first (kind = "demo-adwall")
  const existing = keyStr ? await getConfigRow("demo-adwall", keyStr) : null;

  // Fall back to bundled static demo config
  const staticFallback =
    existing || createMode || !routePrefix || !adwallType
      ? null
      : getDemoAdwallConfig(routePrefix, adwallType);

  const skeleton = buildNewDemoAdwallSkeleton(routePrefix, adwallType);

  const draft = existing?.draft ?? staticFallback ?? skeleton;

  // Prefill navbar from funnel config if not already set
  const draftAdwall = draft as AdwallConfig;
  const hasNavbarValues = !!draftAdwall?.navbar?.tagline || !!draftAdwall?.navbar?.phone;
  const funnelNavbar =
    !hasNavbarValues && draftAdwall?.funnelId
      ? (await getPublishedFunnelConfig(draftAdwall.funnelId, { useDraft: true }))?.navbar
      : null;
  const draftWithNavbar =
    !hasNavbarValues && funnelNavbar
      ? ({ ...draftAdwall, navbar: funnelNavbar } satisfies AdwallConfig)
      : draft;

  const published = existing?.published ?? null;

  const previewHref =
    routePrefix && adwallType
      ? `/adwall/demo/${encodeURIComponent(routePrefix)}/${encodeURIComponent(adwallType)}?preview=1&name=Test&zip=00000`
      : "/admin/adwalls";

  const liveHref =
    routePrefix && adwallType
      ? `/adwall/demo/${encodeURIComponent(routePrefix)}/${encodeURIComponent(adwallType)}`
      : "/admin/adwalls";

  return (
    <div className="max-w-5xl mx-auto px-6 py-10 space-y-6">
      <ConfigEditorClient
        kind="demo-adwall"
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
