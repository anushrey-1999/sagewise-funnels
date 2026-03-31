import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import SavedAdwallConfigs from "./SavedAdwallConfigs";
import { requireAdminPage } from "@/lib/admin/require-page";
import { listConfigs } from "@/lib/config-service";
import { getAvailableDemoAdwalls } from "@/lib/demo-adwall-loader";

export default async function AdminAdwallsPage() {
  const user = await requireAdminPage("viewer");
  const rows = await listConfigs("adwall");
  const savedRows = rows.map((row) => ({
    kind: row.kind,
    key: row.key,
    version: row.version,
    publishedLabel: row.publishedAt ? new Date(row.publishedAt).toLocaleString() : "—",
  }));

  // DB-saved demo configs
  const demoDbRows = await listConfigs("demo-adwall");
  const demoDbKeySet = new Set(demoDbRows.map((r) => r.key));

  // Merge: DB rows first, then static-only entries not yet saved in DB
  const demoRows = [
    ...demoDbRows.map((row) => ({
      key: row.key,
      previewHref: `/adwall/demo/${row.key}`,
      editHref: `/admin/adwalls/demo/${row.key}`,
      version: row.version,
      publishedLabel: row.publishedAt ? new Date(row.publishedAt).toLocaleString() : "—",
      isInDb: true,
    })),
    ...getAvailableDemoAdwalls()
      .filter(({ key }) => !demoDbKeySet.has(key))
      .map(({ key, routePrefix, adwallType }) => ({
        key,
        previewHref: `/adwall/demo/${routePrefix}/${adwallType}`,
        editHref: `/admin/adwalls/demo/${routePrefix}/${adwallType}`,
        version: null,
        publishedLabel: "—",
        isInDb: false,
      })),
  ];

  return (
    <div className="max-w-6xl mx-auto px-6 py-10 space-y-6">
      <div className="space-y-4">
        <div className="flex items-start gap-3">
          <Link
            href="/admin"
            aria-label="Back to admin"
            className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-general-border bg-white text-primary-main transition-colors hover:bg-[#f7f8fa]"
          >
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <div>
            <h2 className="text-lg font-semibold text-general-primary">Manage adwalls</h2>
            <p className="text-sm text-general-muted-foreground">
              Search existing configs or create a new route from the add button.
            </p>
          </div>
        </div>
      </div>

      <SavedAdwallConfigs rows={savedRows} demoRows={demoRows} />
    </div>
  );
}

