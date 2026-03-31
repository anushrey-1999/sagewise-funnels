"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowUpRight, Sparkles } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { adminButtonPrimary } from "../admin-button-styles";

function sanitizeSegment(value: string): string {
  return value
    .trim()
    .replace(/^\/+|\/+$/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9-_]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

export default function CreateAdwallNav({ existingKeys }: { existingKeys: string[] }) {
  const router = useRouter();
  const [routePrefix, setRoutePrefix] = useState("");
  const [adwallType, setAdwallType] = useState("");

  const normalizedRoutePrefix = useMemo(() => sanitizeSegment(routePrefix), [routePrefix]);
  const normalizedAdwallType = useMemo(() => sanitizeSegment(adwallType), [adwallType]);
  const newKey = normalizedRoutePrefix && normalizedAdwallType ? `${normalizedRoutePrefix}/${normalizedAdwallType}` : "";
  const existingKeySet = useMemo(() => new Set(existingKeys), [existingKeys]);
  const keyAlreadyExists = !!newKey && existingKeySet.has(newKey);

  const createNew = () => {
    if (!newKey || keyAlreadyExists) return;
    router.push(`/admin/adwalls/${newKey}?create=1`);
  };

  return (
    <div className="rounded-3xl border border-general-border bg-[linear-gradient(180deg,#ffffff_0%,#f8fafc_100%)] p-5 shadow-sm">
      <div className="space-y-2">
        <div className="inline-flex items-center gap-2 rounded-full border border-general-border bg-white px-3 py-1 text-[11px] font-medium uppercase tracking-[0.18em] text-general-muted-foreground">
          <Sparkles className="h-3.5 w-3.5" />
          Adwall flow
        </div>
        <div>
          <h2 className="text-xl font-semibold text-primary-main">Create a new adwall</h2>
          <p className="mt-1 max-w-2xl text-sm text-general-muted-foreground">
            Start from a clean, form-first draft by defining the route prefix and adwall type.
          </p>
        </div>
      </div>

      <div className="mt-5 rounded-2xl border border-general-border bg-white p-5 shadow-sm">
        <div className="grid gap-3 sm:grid-cols-2">
          <Input
            value={routePrefix}
            onChange={(e) => setRoutePrefix(e.target.value)}
            placeholder='Route prefix, e.g. "mortgage"'
          />
          <Input
            value={adwallType}
            onChange={(e) => setAdwallType(e.target.value)}
            placeholder='Adwall type, e.g. "heloc"'
          />
        </div>
        <div className="mt-3 rounded-xl border border-dashed border-general-border bg-[#fafafa] px-4 py-3 text-sm text-general-muted-foreground">
          New route key: <span className="font-medium text-general-primary">{newKey || "route-prefix/type"}</span>
        </div>
        {keyAlreadyExists ? (
          <div className="mt-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-xs text-amber-700">
            A saved admin config already exists for <code>{newKey}</code>. Search for it in Saved configs instead of creating a duplicate.
          </div>
        ) : null}
        <div className="mt-4">
          <Button
            type="button"
            variant="secondary"
            className={adminButtonPrimary}
            onClick={createNew}
            disabled={!newKey || keyAlreadyExists}
          >
            Create in form editor
            <ArrowUpRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
