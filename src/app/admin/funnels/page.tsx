import Link from "next/link";
import { ArrowLeft, FileStack } from "lucide-react";

import CreateConfigNav from "../CreateConfigNav";
import { requireAdminPage } from "@/lib/admin/require-page";
import { listConfigs } from "@/lib/config-service";

export default async function AdminFunnelsPage() {
  const user = await requireAdminPage("viewer");
  const rows = await listConfigs("funnel");

  return (
    <div className="max-w-6xl mx-auto px-6 py-10 space-y-6">
      <div className="rounded-3xl border border-general-border bg-[linear-gradient(180deg,#ffffff_0%,#f8fafc_100%)] p-6 shadow-sm">
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 rounded-full border border-general-border bg-white px-3 py-1 text-[11px] font-medium uppercase tracking-[0.18em] text-general-muted-foreground">
              <FileStack className="h-3.5 w-3.5" />
              Funnel library
            </div>
            <div>
              <h1 className="text-3xl font-semibold text-primary-main">Funnels</h1>
              <p className="mt-1 text-sm text-general-muted-foreground">
                Keys are funnel IDs like <code>mortgage</code> or <code>cc-one</code>.
              </p>
            </div>
          </div>
          <Link
            href="/admin"
            className="inline-flex items-center gap-2 rounded-full border border-general-border bg-white px-3 py-1.5 text-sm text-primary-main transition-colors hover:bg-[#f7f8fa]"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </Link>
        </div>
      </div>

      <CreateConfigNav basePath="/admin/funnels" placeholder='e.g. "mortgage" or "new-funnel-id"' />

      <div className="overflow-hidden rounded-3xl border border-general-border bg-white shadow-sm">
        <div className="border-b border-general-border bg-[#fcfcfd] px-5 py-4">
          <div className="text-sm font-semibold text-general-primary">Saved configs</div>
          <div className="mt-1 text-xs text-general-muted-foreground">
            Browse all saved funnels and reopen one to continue editing.
          </div>
        </div>
        <div className="grid grid-cols-12 gap-2 px-5 py-3 text-xs font-medium uppercase tracking-wide text-general-muted-foreground border-b border-general-border">
          <div className="col-span-6">Key</div>
          <div className="col-span-2">Version</div>
          <div className="col-span-4">Published</div>
        </div>
        {rows.length ? (
          rows.map((r) => (
            <Link
              key={`${r.kind}:${r.key}`}
              href={`/admin/funnels/${r.key}`}
              className="grid grid-cols-12 gap-2 px-5 py-4 text-sm border-b border-general-border last:border-b-0 transition-colors hover:bg-[#fafafa]"
            >
              <div className="col-span-6 font-medium text-general-primary">{r.key}</div>
              <div className="col-span-2 text-general-muted-foreground">{r.version}</div>
              <div className="col-span-4 text-general-muted-foreground">
                {r.publishedAt ? new Date(r.publishedAt).toLocaleString() : "—"}
              </div>
            </Link>
          ))
        ) : (
          <div className="px-5 py-8 text-sm text-general-muted-foreground">No funnels yet.</div>
        )}
      </div>
    </div>
  );
}

