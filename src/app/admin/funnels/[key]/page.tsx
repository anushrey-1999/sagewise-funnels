import AdminTopBar from "../../AdminTopBar";
import ConfigEditorClient from "../../ConfigEditorClient";
import { requireAdminPage } from "@/lib/admin/require-page";
import { getConfigRow } from "@/lib/config-service";
import { getFunnelConfig } from "@/lib/funnel-loader";

export default async function AdminFunnelEditorPage({ params }: { params: Promise<{ key: string }> }) {
  const user = await requireAdminPage("viewer");
  const { key } = await params;

  const existing = await getConfigRow("funnel", key);
  const fallback = existing ? null : getFunnelConfig(key);

  const draft = existing?.draft ?? fallback ?? {
    id: key,
    title: "New Funnel",
    subtitle: "",
    steps: [
      {
        id: "step-1",
        title: "Step 1",
        description: "",
        fields: [
          {
            id: "example",
            type: "text",
            label: "Example",
            required: false,
          },
        ],
      },
    ],
  };

  const published = existing?.published ?? null;

  return (
    <div className="max-w-5xl mx-auto px-6 py-10 space-y-6">
      <AdminTopBar email={user.email} role={user.role} />
      <ConfigEditorClient
        kind="funnel"
        keyStr={key}
        initialDraftJson={JSON.stringify(draft, null, 2)}
        initialPublishedJson={published ? JSON.stringify(published, null, 2) : null}
        userRole={user.role}
        backHref="/admin/funnels"
        previewHref={`/form?funnel=${encodeURIComponent(key)}&preview=1`}
        liveHref={`/form?funnel=${encodeURIComponent(key)}`}
      />
    </div>
  );
}

