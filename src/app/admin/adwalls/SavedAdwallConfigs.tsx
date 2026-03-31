"use client";

import { useMemo, useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowUpRight, ExternalLink, Loader2, Plus, Search, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { adminButtonPrimary } from "../admin-button-styles";

type LiveRow = {
  kind: string;
  key: string;
  version: number | null;
  publishedLabel: string;
};

type DemoRow = {
  key: string;
  previewHref: string;
  editHref: string;
  version: number | null;
  publishedLabel: string;
  isInDb: boolean;
};

function sanitizeSegment(value: string): string {
  return value
    .trim()
    .replace(/^\/+|\/+$/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9-_]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

export default function SavedAdwallConfigs({
  rows,
  demoRows,
}: {
  rows: LiveRow[];
  demoRows: DemoRow[];
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [pendingTarget, setPendingTarget] = useState<string | null>(null);

  const [activeTab, setActiveTab] = useState<"live" | "demo">("live");
  const [query, setQuery] = useState("");
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [routePrefix, setRoutePrefix] = useState("");
  const [adwallType, setAdwallType] = useState("");

  // Live tab filtering
  const filteredRows = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    if (!normalized) return rows;
    return rows.filter((row) => row.key.toLowerCase().includes(normalized));
  }, [query, rows]);

  // Demo tab filtering
  const filteredDemoRows = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    if (!normalized) return demoRows;
    return demoRows.filter((row) => row.key.toLowerCase().includes(normalized));
  }, [query, demoRows]);

  // Create modal — behaviour depends on which tab is active
  const isDemo = activeTab === "demo";
  const normalizedRoutePrefix = useMemo(() => sanitizeSegment(routePrefix), [routePrefix]);
  const normalizedAdwallType = useMemo(() => sanitizeSegment(adwallType), [adwallType]);
  const newKey = normalizedRoutePrefix && normalizedAdwallType
    ? `${normalizedRoutePrefix}/${normalizedAdwallType}`
    : "";
  const liveKeySet = useMemo(() => new Set(rows.map((row) => row.key)), [rows]);
  const demoKeySet = useMemo(() => new Set(demoRows.map((row) => row.key)), [demoRows]);
  const keyAlreadyExists = !!newKey && (isDemo ? demoKeySet.has(newKey) : liveKeySet.has(newKey));

  const closeCreateModal = () => {
    if (isPending) return;
    setIsCreateOpen(false);
    setRoutePrefix("");
    setAdwallType("");
  };

  const createNew = () => {
    if (!newKey || keyAlreadyExists) return;
    setPendingTarget("create");
    const href = isDemo
      ? `/admin/adwalls/demo/${newKey}?create=1`
      : `/admin/adwalls/${newKey}?create=1`;
    startTransition(() => {
      router.push(href);
    });
  };

  const openConfig = (href: string) => {
    setPendingTarget(href);
    startTransition(() => {
      router.push(href);
    });
  };

  return (
    <>
      <div className="overflow-hidden rounded-3xl border border-general-border bg-white shadow-sm">
        {/* Header */}
        <div className="border-b border-general-border bg-[#fcfcfd] px-5 py-4">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <div className="text-sm font-semibold text-general-primary">Saved configs</div>
              <div className="mt-1 text-xs text-general-muted-foreground">
                Browse live adwalls or preview demo configs, or create a new one from the add button.
              </div>
            </div>
            <div className="flex w-full items-center gap-2 lg:w-auto">
              <div className="relative flex-1 lg:w-[300px]">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-general-muted-foreground" />
                <Input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder='Search by key…'
                  className="pl-9"
                />
              </div>
              <Button
                type="button"
                variant="outline"
                size="icon"
                aria-label="Create new adwall"
                className="rounded-full"
                onClick={() => setIsCreateOpen(true)}
                disabled={pendingTarget === "create" && isPending}
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Live / Demo tabs */}
        <Tabs value={activeTab} onValueChange={(v) => { setActiveTab(v as "live" | "demo"); setQuery(""); }} className="gap-0">
          <div className="border-b border-general-border bg-[#fafafa] px-5 py-2.5">
            <TabsList>
              <TabsTrigger value="live">Live</TabsTrigger>
              <TabsTrigger value="demo">Demo</TabsTrigger>
            </TabsList>
          </div>

          {/* Live tab */}
          <TabsContent value="live" className="mt-0">
            <div className="grid grid-cols-12 gap-2 border-b border-general-border px-5 py-3 text-xs font-medium uppercase tracking-wide text-general-muted-foreground">
              <div className="col-span-5">Key</div>
              <div className="col-span-2">Version</div>
              <div className="col-span-3">Published</div>
              <div className="col-span-2">Preview</div>
            </div>
            {filteredRows.length ? (
              filteredRows.map((row) => (
                <button
                  key={`${row.kind}:${row.key}`}
                  type="button"
                  className="grid w-full grid-cols-12 gap-2 border-b border-general-border px-5 py-4 text-left text-sm transition-colors last:border-b-0 hover:bg-[#fafafa] disabled:opacity-60"
                  onClick={() => openConfig(`/admin/adwalls/${row.key}`)}
                  disabled={pendingTarget === `/admin/adwalls/${row.key}` && isPending}
                >
                  <div className="col-span-5 flex items-center gap-2 font-medium text-general-primary">
                    {pendingTarget === `/admin/adwalls/${row.key}` && isPending ? (
                      <Loader2 className="h-4 w-4 animate-spin text-general-muted-foreground" aria-hidden />
                    ) : null}
                    <span>{row.key}</span>
                  </div>
                  <div className="col-span-2 text-general-muted-foreground">{row.version ?? "—"}</div>
                  <div className="col-span-3 text-general-muted-foreground">{row.publishedLabel}</div>
                  <div className="col-span-2" onClick={(e) => e.stopPropagation()}>
                    <Link
                      href={`/adwall/${row.key}?preview=1`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-xs font-medium text-primary-main hover:underline underline-offset-2"
                    >
                      Preview
                      <ExternalLink className="h-3 w-3" />
                    </Link>
                  </div>
                </button>
              ))
            ) : (
              <div className="px-5 py-8 text-sm text-general-muted-foreground">
                {rows.length ? "No matching live adwalls found." : "No live adwalls yet."}
              </div>
            )}
          </TabsContent>

          {/* Demo tab */}
          <TabsContent value="demo" className="mt-0">
            <div className="grid grid-cols-12 gap-2 border-b border-general-border px-5 py-3 text-xs font-medium uppercase tracking-wide text-general-muted-foreground">
              <div className="col-span-5">Key</div>
              <div className="col-span-2">Version</div>
              <div className="col-span-3">Published</div>
              <div className="col-span-2">Preview</div>
            </div>
            {filteredDemoRows.length ? (
              filteredDemoRows.map((row) => (
                <button
                  key={row.key}
                  type="button"
                  className="grid w-full grid-cols-12 gap-2 border-b border-general-border px-5 py-4 text-left text-sm transition-colors last:border-b-0 hover:bg-[#fafafa] disabled:opacity-60"
                  onClick={() => openConfig(row.editHref)}
                  disabled={pendingTarget === row.editHref && isPending}
                >
                  <div className="col-span-5 flex items-center gap-2 font-medium text-general-primary">
                    {pendingTarget === row.editHref && isPending ? (
                      <Loader2 className="h-4 w-4 animate-spin text-general-muted-foreground" aria-hidden />
                    ) : null}
                    <span>{row.key}</span>
                  </div>
                  <div className="col-span-2 text-general-muted-foreground">{row.version ?? "—"}</div>
                  <div className="col-span-3 text-general-muted-foreground">{row.publishedLabel}</div>
                  <div className="col-span-2" onClick={(e) => e.stopPropagation()}>
                    <Link
                      href={row.previewHref}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-xs font-medium text-primary-main hover:underline underline-offset-2"
                    >
                      Preview
                      <ExternalLink className="h-3 w-3" />
                    </Link>
                  </div>
                </button>
              ))
            ) : (
              <div className="px-5 py-8 text-sm text-general-muted-foreground">
                {demoRows.length ? "No matching demo adwalls found." : "No demo adwalls configured."}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>

      {/* Create modal */}
      {isCreateOpen ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 px-4 py-8"
          onClick={closeCreateModal}
        >
          <div
            className="relative w-full max-w-xl rounded-3xl border border-general-border bg-white p-6 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {pendingTarget === "create" && isPending ? (
              <div className="absolute inset-0 z-10 flex items-center justify-center rounded-3xl bg-white/75 backdrop-blur-[1px]">
                <div className="inline-flex items-center gap-2 rounded-full border border-general-border bg-white px-4 py-2 text-sm font-medium text-general-primary shadow-sm">
                  <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
                  Opening editor...
                </div>
              </div>
            ) : null}

            <div className="flex items-start justify-between gap-4">
              <div>
                <h3 className="text-xl font-semibold text-primary-main">
                  {isDemo ? "Create a new demo adwall" : "Create a new adwall"}
                </h3>
                <p className="mt-1 text-sm text-general-muted-foreground">
                  {isDemo
                    ? "Define the route prefix and type to create a new demo config."
                    : "Define the route prefix and adwall type to start a clean form draft."}
                </p>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                aria-label="Close create adwall modal"
                className="rounded-full"
                onClick={closeCreateModal}
                disabled={pendingTarget === "create" && isPending}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              <Input
                value={routePrefix}
                onChange={(e) => setRoutePrefix(e.target.value)}
                placeholder='Route prefix, e.g. "mortgage"'
                autoFocus
              />
              <Input
                value={adwallType}
                onChange={(e) => setAdwallType(e.target.value)}
                placeholder='Adwall type, e.g. "heloc"'
              />
            </div>

            <div className="mt-3 rounded-xl border border-dashed border-general-border bg-[#fafafa] px-4 py-3 text-sm text-general-muted-foreground">
              New route key:{" "}
              <span className="font-medium text-general-primary">{newKey || "route-prefix/type"}</span>
            </div>

            {keyAlreadyExists ? (
              <div className="mt-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-xs text-amber-700">
                A {isDemo ? "demo" : ""} config already exists for <code>{newKey}</code>. Open it from the {isDemo ? "Demo" : "Live"} tab instead of creating a duplicate.
              </div>
            ) : null}

            <div className="mt-5 flex justify-end">
              <Button
                type="button"
                variant="secondary"
                className={adminButtonPrimary}
                onClick={createNew}
                disabled={!newKey || keyAlreadyExists || isPending}
              >
                {pendingTarget === "create" && isPending ? (
                  <>
                    Opening editor...
                    <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
                  </>
                ) : (
                  <>
                    Create in form editor
                    <ArrowUpRight className="h-4 w-4" />
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
