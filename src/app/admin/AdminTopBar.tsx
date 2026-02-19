"use client";

import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";

export default function AdminTopBar({ email, role }: { email: string; role: string }) {
  const router = useRouter();

  const logout = async () => {
    await fetch("/api/admin/auth/logout", { method: "POST" }).catch(() => {});
    router.push("/admin/login");
    router.refresh();
  };

  return (
    <div className="flex items-center justify-between gap-3">
      <div className="text-sm text-general-muted-foreground">
        Signed in as <span className="font-medium text-general-foreground">{email}</span> ({role})
      </div>
      <Button variant="outline" onClick={logout}>
        Logout
      </Button>
    </div>
  );
}

