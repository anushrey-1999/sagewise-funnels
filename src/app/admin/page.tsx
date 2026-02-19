import Link from "next/link";

import AdminTopBar from "./AdminTopBar";
import { requireAdminPage } from "@/lib/admin/require-page";

export default async function AdminHomePage() {
  const user = await requireAdminPage("viewer");

  return (
    <div className="max-w-5xl mx-auto px-6 py-10 space-y-8">
      <AdminTopBar email={user.email} role={user.role} />

      <div className="space-y-2">
        <h1 className="text-2xl font-semibold text-primary-main">Admin</h1>
        <p className="text-sm text-general-muted-foreground">
          Manage funnels and adwalls stored in Postgres (draft/publish with version history).
        </p>
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        <Link
          href="/admin/funnels"
          className="bg-white border border-general-border rounded-lg p-5 hover:shadow-sm transition-shadow"
        >
          <div className="text-lg font-semibold">Funnels</div>
          <div className="text-sm text-general-muted-foreground mt-1">
            Edit multi-step form JSON and publish instantly.
          </div>
        </Link>
        <Link
          href="/admin/adwalls"
          className="bg-white border border-general-border rounded-lg p-5 hover:shadow-sm transition-shadow"
        >
          <div className="text-lg font-semibold">Adwalls</div>
          <div className="text-sm text-general-muted-foreground mt-1">
            Edit offer card JSON and publish instantly.
          </div>
        </Link>
      </div>
    </div>
  );
}

