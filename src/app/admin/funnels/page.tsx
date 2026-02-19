import Link from "next/link";

import AdminTopBar from "../AdminTopBar";
import CreateConfigNav from "../CreateConfigNav";
import { requireAdminPage } from "@/lib/admin/require-page";
import { listConfigs } from "@/lib/config-service";

export default async function AdminFunnelsPage() {
  const user = await requireAdminPage("viewer");
  const rows = await listConfigs("funnel");

  return (
    <div className="max-w-5xl mx-auto px-6 py-10 space-y-6">
      <AdminTopBar email={user.email} role={user.role} />

      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-primary-main">Funnels</h1>
          <p className="text-sm text-general-muted-foreground mt-1">
            Keys are funnel IDs (e.g. <code>mortgage</code>, <code>cc-one</code>).
          </p>
        </div>
        <Link href="/admin" className="text-sm underline text-primary-main">
          Back
        </Link>
      </div>

      <CreateConfigNav basePath="/admin/funnels" placeholder='e.g. "mortgage" or "new-funnel-id"' />

      <div className="bg-white border border-general-border rounded-lg overflow-hidden">
        <div className="grid grid-cols-12 gap-2 px-4 py-3 text-xs font-medium text-general-muted-foreground border-b border-general-border">
          <div className="col-span-6">Key</div>
          <div className="col-span-2">Version</div>
          <div className="col-span-4">Published</div>
        </div>
        {rows.length ? (
          rows.map((r) => (
            <Link
              key={`${r.kind}:${r.key}`}
              href={`/admin/funnels/${r.key}`}
              className="grid grid-cols-12 gap-2 px-4 py-3 text-sm border-b border-general-border last:border-b-0 hover:bg-[#F8F8F8]"
            >
              <div className="col-span-6 font-medium">{r.key}</div>
              <div className="col-span-2">{r.version}</div>
              <div className="col-span-4">
                {r.publishedAt ? new Date(r.publishedAt).toLocaleString() : "—"}
              </div>
            </Link>
          ))
        ) : (
          <div className="px-4 py-6 text-sm text-general-muted-foreground">No funnels yet.</div>
        )}
      </div>
    </div>
  );
}

