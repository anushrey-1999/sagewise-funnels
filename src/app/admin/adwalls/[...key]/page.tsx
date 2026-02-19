import AdminTopBar from "../../AdminTopBar";
import ConfigEditorClient from "../../ConfigEditorClient";
import { requireAdminPage } from "@/lib/admin/require-page";
import { getConfigRow } from "@/lib/config-service";
import { getAdwallConfig } from "@/lib/adwall-loader";
import type { AdwallConfig } from "@/types/adwall";

export default async function AdminAdwallEditorPage({
  params,
}: {
  params: Promise<{ key: string[] }>;
}) {
  const user = await requireAdminPage("viewer");
  const { key } = await params;
  const keyStr = (key || []).join("/").trim();

  const [routePrefix, adwallType] = key || [];
  const existing = keyStr ? await getConfigRow("adwall", keyStr) : null;
  const fallback =
    existing || !routePrefix || !adwallType ? null : getAdwallConfig(routePrefix, adwallType);

  const skeleton: AdwallConfig = {
    id: `${routePrefix || "route"}-${adwallType || "one"}`,
    funnelId: routePrefix || "funnel",
    adwallType: adwallType || "one",
    title: "New Adwall",
    subtitle: "",
    updatedAt: `Updated ${new Date().toLocaleDateString()}`,
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
        logoWidth: "100px",
        logoHeight: "20px",
        logoText: "",
        creditCardImage: "",
        badgeText: "",
        badgeIcon: "card",
        advertiserName: "",
      },
    ],
  };

  const draft =
    existing?.draft ??
    fallback ??
    skeleton;

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
      <AdminTopBar email={user.email} role={user.role} />
      <ConfigEditorClient
        kind="adwall"
        keyStr={keyStr}
        initialDraftJson={JSON.stringify(draft, null, 2)}
        initialPublishedJson={published ? JSON.stringify(published, null, 2) : null}
        userRole={user.role}
        backHref="/admin/adwalls"
        previewHref={previewHref}
        liveHref={liveHref}
      />
    </div>
  );
}

