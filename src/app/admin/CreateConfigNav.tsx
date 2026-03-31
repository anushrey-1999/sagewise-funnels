"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowUpRight, FileStack } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { adminButtonPrimary } from "./admin-button-styles";

export default function CreateConfigNav({
  basePath,
  placeholder,
}: {
  basePath: string;
  placeholder: string;
}) {
  const router = useRouter();
  const [value, setValue] = useState("");

  const go = () => {
    const v = value.trim().replace(/^\/+|\/+$/g, "");
    if (!v) return;
    router.push(`${basePath}/${v}`);
  };

  return (
    <div className="rounded-3xl border border-general-border bg-[linear-gradient(180deg,#ffffff_0%,#f8fafc_100%)] p-5 shadow-sm">
      <div className="space-y-2">
        <div className="inline-flex items-center gap-2 rounded-full border border-general-border bg-white px-3 py-1 text-[11px] font-medium uppercase tracking-[0.18em] text-general-muted-foreground">
          <FileStack className="h-3.5 w-3.5" />
          Funnel flow
        </div>
        <div>
          <div className="text-lg font-semibold text-general-primary">Create or open a funnel</div>
          <div className="mt-1 text-sm text-general-muted-foreground">
            Jump into an existing funnel key or start a new one from a clean draft.
          </div>
        </div>
      </div>

      <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:items-center">
        <Input
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder={placeholder}
          className="sm:max-w-sm"
        />
        <Button type="button" onClick={go} variant="secondary" className={adminButtonPrimary}>
          Create / Open
          <ArrowUpRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}

