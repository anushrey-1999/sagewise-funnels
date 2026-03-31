"use client";

import { useRouter } from "next/navigation";
import { LogOut, ShieldCheck } from "lucide-react";

import { Button } from "@/components/ui/button";
import { adminButtonSecondary } from "./admin-button-styles";

export default function AdminTopBar({ email, role }: { email: string; role: string }) {
  const router = useRouter();

  const logout = async () => {
    await fetch("/api/admin/auth/logout", { method: "POST" }).catch(() => {});
    router.push("/admin/login");
    router.refresh();
  };

  return (
    <div className="flex flex-col gap-3 rounded-3xl border border-general-border bg-[linear-gradient(180deg,#ffffff_0%,#fafbfd_100%)] p-5 shadow-sm sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-center gap-3">
        <div className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-[#f3f6f8] text-primary-main">
          <ShieldCheck className="h-5 w-5" />
        </div>
        <div className="text-sm text-general-muted-foreground">
          Signed in as <span className="font-medium text-general-foreground">{email}</span> ({role})
        </div>
      </div>
      <Button variant="outline" className={adminButtonSecondary} onClick={logout}>
        <LogOut className="h-4 w-4" />
        Logout
      </Button>
    </div>
  );
}

