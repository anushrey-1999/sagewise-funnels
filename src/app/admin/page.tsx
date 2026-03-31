import Link from "next/link";
import { ArrowRight, LayoutPanelTop, PanelsTopLeft } from "lucide-react";

import AdminTopBar from "./AdminTopBar";
import { requireAdminPage } from "@/lib/admin/require-page";

export default async function AdminHomePage() {
  const user = await requireAdminPage("viewer");

  return (
    <div className="max-w-6xl mx-auto px-6 py-10 space-y-8">
      <AdminTopBar email={user.email} role={user.role} />

      <div className="rounded-3xl border border-general-border bg-[linear-gradient(180deg,#ffffff_0%,#f8fafc_100%)] p-6 shadow-sm">
        <div className="space-y-2">
          <div className="inline-flex items-center rounded-full border border-general-border bg-white px-3 py-1 text-[11px] font-medium uppercase tracking-[0.18em] text-general-muted-foreground">
            Internal admin
          </div>
          <h1 className="text-3xl font-semibold text-primary-main">Config Studio</h1>
          <p className="max-w-2xl text-sm text-general-muted-foreground">
            Manage funnels and adwalls stored in Postgres with a cleaner draft, preview, and publish workflow.
          </p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Link
          href="/admin/funnels"
          className="group rounded-3xl border border-general-border bg-white p-6 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md"
        >
          <div className="inline-flex items-center rounded-2xl bg-[#f7f8fa] p-3 text-primary-main">
            <PanelsTopLeft className="h-5 w-5" />
          </div>
          <div className="mt-5 flex items-center justify-between gap-4">
            <div>
              <div className="text-lg font-semibold text-general-primary">Funnels</div>
              <div className="mt-1 text-sm text-general-muted-foreground">
                Edit the multi-step form experience and publish changes quickly.
              </div>
            </div>
            <ArrowRight className="h-5 w-5 text-general-muted-foreground transition-transform group-hover:translate-x-1" />
          </div>
        </Link>
        <Link
          href="/admin/adwalls"
          className="group rounded-3xl border border-general-border bg-white p-6 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md"
        >
          <div className="inline-flex items-center rounded-2xl bg-[#f7f8fa] p-3 text-primary-main">
            <LayoutPanelTop className="h-5 w-5" />
          </div>
          <div className="mt-5 flex items-center justify-between gap-4">
            <div>
              <div className="text-lg font-semibold text-general-primary">Adwalls</div>
              <div className="mt-1 text-sm text-general-muted-foreground">
                Shape publisher cards, preview the runtime output, and publish with confidence.
              </div>
            </div>
            <ArrowRight className="h-5 w-5 text-general-muted-foreground transition-transform group-hover:translate-x-1" />
          </div>
        </Link>
      </div>
    </div>
  );
}

