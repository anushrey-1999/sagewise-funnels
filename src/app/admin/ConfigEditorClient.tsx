"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { ZodIssue } from "zod";
import { toast } from "sonner";
import {
  ArrowLeft,
  Eye,
  FileJson,
  History,
  LayoutTemplate,
  PencilLine,
  RefreshCcw,
  Save,
  Sparkles,
  Trash2,
  UploadCloud,
  Users,
} from "lucide-react";

import AdwallConfigFormEditor from "./adwalls/AdwallConfigFormEditor";
import {
  adminButtonPrimary,
  adminButtonSecondary,
  adminIconButton,
  adminIconDestructiveButton,
  adminSmallButton,
} from "./admin-button-styles";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { adwallConfigSchema } from "@/lib/config-schemas";
import { cn } from "@/lib/utils";

type ConfigKind = "funnel" | "adwall" | "demo-adwall";

type VersionRow = {
  version: number;
  action: string;
  createdAt: string;
  createdBy: string | null;
};

type AdwallEditorTab = "basic" | "publishers";
type AdwallContentTab = "form" | "json" | "versions";

function createEmptyPublisherCard() {
  return {
    heading: "New offer",
    description: "",
    features: [],
    buttonLink: "#",
    buttonText: "Learn more",
    ratingsNumber: "",
    ratingsCount: 5,
    logo: "",
    logoWidth: "110px",
    logoHeight: "28px",
    logoText: "",
    logoSubtext: "",
    creditCardImage: "",
    badgeText: "",
    badgeIcon: "card",
    advertiserName: "",
    isHidden: false,
    phoneNumber: "",
    bottomBoxHtml: "",
  };
}

function canEditRole(role: string): boolean {
  return role === "client_editor" || role === "internal_admin" || role === "superadmin";
}

export default function ConfigEditorClient(props: {
  kind: ConfigKind;
  keyStr: string;
  initialDraftJson: string;
  initialPublishedJson: string | null;
  userRole: string;
  backHref: string;
  previewHref: string;
  liveHref: string;
}) {
  const { kind, keyStr, backHref, previewHref, liveHref } = props;
  const router = useRouter();
  const isAdwall = kind === "adwall" || kind === "demo-adwall";
  const canEdit = canEditRole(props.userRole);
  const canRollback = props.userRole === "internal_admin" || props.userRole === "superadmin";
  const canDelete = canRollback;

  const [draftText, setDraftText] = useState(props.initialDraftJson);
  const [publishedText, setPublishedText] = useState(props.initialPublishedJson);
  const [mode, setMode] = useState<"draft" | "published">("draft");
  const [draftView, setDraftView] = useState<"form" | "json">(isAdwall ? "form" : "json");
  const [draftObj, setDraftObj] = useState<unknown>(() => {
    try {
      return JSON.parse(props.initialDraftJson);
    } catch {
      return null;
    }
  });
  const draftObjRef = useRef<unknown>(draftObj);
  const [formResetNonce, setFormResetNonce] = useState(0);

  const [isSaving, setIsSaving] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [isRefreshingConfig, setIsRefreshingConfig] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [issues, setIssues] = useState<ZodIssue[] | null>(null);
  const [versions, setVersions] = useState<VersionRow[]>([]);
  const [isLoadingVersions, setIsLoadingVersions] = useState(false);
  const [isRollingBack, setIsRollingBack] = useState<number | null>(null);
  const [adwallTab, setAdwallTab] = useState<AdwallEditorTab>("basic");
  const [adwallContentTab, setAdwallContentTab] = useState<AdwallContentTab>(isAdwall ? "form" : "json");

  const apiBase = useMemo(() => `/api/admin/configs/${kind}/${keyStr}`, [kind, keyStr]);

  const reloadConfig = async () => {
    if (!keyStr) return;
    setIsRefreshingConfig(true);
    try {
      const res = await fetch(apiBase, { method: "GET" });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) return;
      const cfg = data?.config;
      if (!cfg) return;

      const nextDraft = cfg.draft ?? null;
      const nextPublished = cfg.published ?? null;

      if (nextDraft) {
        setDraftText(JSON.stringify(nextDraft, null, 2));
        if (isAdwall) {
          setDraftObj(nextDraft);
          setFormResetNonce((n) => n + 1);
        }
      }
      setPublishedText(nextPublished ? JSON.stringify(nextPublished, null, 2) : null);
    } catch {
      // non-blocking; keep existing state
    } finally {
      setIsRefreshingConfig(false);
    }
  };

  const loadVersions = async () => {
    setIsLoadingVersions(true);
    try {
      const url = new URL("/api/admin/config-versions", window.location.origin);
      url.searchParams.set("kind", kind);
      url.searchParams.set("key", keyStr);
      const res = await fetch(url.toString());
      const data = await res.json().catch(() => ({}));
      setVersions(Array.isArray(data?.versions) ? data.versions : []);
    } catch {
      setVersions([]);
    } finally {
      setIsLoadingVersions(false);
    }
  };

  useEffect(() => {
    void loadVersions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    // If server-provided JSON changes (router.refresh, navigation), sync it into local state.
    setDraftText(props.initialDraftJson);
    setPublishedText(props.initialPublishedJson);
    setAdwallTab("basic");
    setAdwallContentTab(isAdwall ? "form" : "json");
    try {
      const parsed = JSON.parse(props.initialDraftJson);
      setDraftObj(parsed);
      setFormResetNonce((n) => n + 1);
    } catch {
      setDraftObj(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [keyStr, kind, props.initialDraftJson, props.initialPublishedJson]);

  useEffect(() => {
    // When returning from Preview/Live tabs (client navigation), refresh config to avoid stale form state.
    const onFocus = () => void reloadConfig();
    const onVisibility = () => {
      if (document.visibilityState === "visible") void reloadConfig();
    };
    window.addEventListener("focus", onFocus);
    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      window.removeEventListener("focus", onFocus);
      document.removeEventListener("visibilitychange", onVisibility);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [apiBase]);

  useEffect(() => {
    draftObjRef.current = draftObj;
  }, [draftObj]);

  useEffect(() => {
    if (mode === "published") {
      setDraftView("json");
      if (isAdwall) setAdwallContentTab("json");
    }
  }, [isAdwall, mode]);

  useEffect(() => {
    if (!isAdwall) return;
    if (mode !== "draft") return;
    if (draftView !== "form") return;
    if (!draftObj) return;
    try {
      setDraftText(JSON.stringify(draftObj, null, 2));
    } catch {
      // ignore
    }
  }, [draftObj, draftView, isAdwall, mode]);

  const switchToForm = () => {
    setError(null);
    setIssues(null);
    let parsed: unknown;
    try {
      parsed = JSON.parse(draftText);
    } catch {
      setError("Draft JSON is invalid.");
      return;
    }
    const v = adwallConfigSchema.safeParse(parsed);
    if (!v.success) {
      setError("Validation failed.");
      setIssues(v.error.issues);
      return;
    }
    setDraftObj(v.data);
    setFormResetNonce((n) => n + 1);
    setDraftView("form");
    setAdwallContentTab("form");
  };

  const switchToJson = () => {
    setError(null);
    setIssues(null);
    if (draftObj) setDraftText(JSON.stringify(draftObj, null, 2));
    setDraftView("json");
    setAdwallContentTab("json");
  };

  const saveDraft = async () => {
    setError(null);
    setIssues(null);
    let parsed: unknown;
    if (isAdwall && draftView === "form") {
      parsed = draftObjRef.current;
      if (!parsed) {
        setError("Draft is missing.");
        return;
      }
    } else {
      try {
        parsed = JSON.parse(draftText);
      } catch {
        setError("Draft JSON is invalid.");
        return;
      }
    }

    if (isAdwall) {
      const v = adwallConfigSchema.safeParse(parsed);
      if (!v.success) {
        setError("Validation failed.");
        setIssues(v.error.issues);
        return;
      }
      parsed = v.data;
    }

    setIsSaving(true);
    try {
      const res = await fetch(apiBase, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ draft: parsed }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        const message = data?.error || "Failed to save draft";
        setError(message);
        setIssues(Array.isArray(data?.issues) ? data.issues : null);
        toast.error(message);
        return;
      }
      // normalize formatting as stored
      const storedDraft = data.config?.draft ?? parsed;
      setDraftText(JSON.stringify(storedDraft, null, 2));
      if (isAdwall) {
        setDraftObj(storedDraft);
        setFormResetNonce((n) => n + 1);
      }
      await loadVersions();
      toast.success("Draft saved");
    } catch {
      setError("Failed to save draft");
      toast.error("Failed to save draft");
    } finally {
      setIsSaving(false);
    }
  };

  const publish = async () => {
    setError(null);
    setIssues(null);
    setIsPublishing(true);
    try {
      const res = await fetch(apiBase, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "publish" }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        const message = data?.error || "Failed to publish";
        setError(message);
        toast.error(message);
        return;
      }
      await loadVersions();
      setMode("draft");
      toast.success("Published successfully");
    } catch {
      setError("Failed to publish");
      toast.error("Failed to publish");
    } finally {
      setIsPublishing(false);
    }
  };

  const del = async () => {
    if (!canDelete) return;
    const ok = window.confirm(`Delete ${kind} config "${keyStr}"? This cannot be undone.`);
    if (!ok) return;
    setError(null);
    setIssues(null);
    try {
      const res = await fetch(apiBase, { method: "DELETE" });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        const message = data?.error || "Failed to delete";
        setError(message);
        toast.error(message);
        return;
      }
      toast.success("Config deleted");
      router.push(backHref);
      router.refresh();
    } catch {
      setError("Failed to delete");
      toast.error("Failed to delete");
    }
  };

  const rollback = async (toVersion: number) => {
    setError(null);
    setIssues(null);
    setIsRollingBack(toVersion);
    try {
      const res = await fetch(apiBase, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "rollback", toVersion }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        const message = data?.error || "Failed to rollback";
        setError(message);
        toast.error(message);
        return;
      }
      // Refresh draft text from server
      const r2 = await fetch(apiBase);
      const d2 = await r2.json().catch(() => ({}));
      if (r2.ok && d2?.config?.draft) {
        const nextDraft = d2.config.draft;
        setDraftText(JSON.stringify(nextDraft, null, 2));
        if (isAdwall) {
          setDraftObj(nextDraft);
          setFormResetNonce((n) => n + 1);
        }
      }
      await loadVersions();
      toast.success(`Rolled back to v${toVersion}`);
    } catch {
      setError("Failed to rollback");
      toast.error("Failed to rollback");
    } finally {
      setIsRollingBack(null);
    }
  };

  const shownText = mode === "draft" ? draftText : publishedText || "";
  const showAdwallLayoutTabs = mode === "draft" && isAdwall && adwallContentTab === "form";
  const showVersionsPanel = mode === "draft" && isAdwall && adwallContentTab === "versions";
  const publisherCount = useMemo(() => {
    if (!isAdwall || !draftObj || typeof draftObj !== "object") return 0;
    const maybeCards = (draftObj as { cards?: unknown }).cards;
    return Array.isArray(maybeCards) ? maybeCards.length : 0;
  }, [draftObj, isAdwall]);
  const versionHistory = (
    <div className="rounded-2xl border border-general-border bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between gap-4">
        <div>
          <div className="text-sm font-semibold text-general-primary">Version history</div>
          <div className="text-xs text-general-muted-foreground mt-1">
            Review published changes and roll back when needed.
          </div>
        </div>
        <Button type="button" variant="outline" className={adminButtonSecondary} onClick={loadVersions} disabled={isLoadingVersions}>
          {isLoadingVersions ? "Loading…" : "Refresh"}
        </Button>
      </div>
      {versions.length ? (
        <div className="mt-4 divide-y divide-general-border">
          {versions.map((v) => (
            <div key={v.version} className="py-3 flex items-center justify-between gap-3">
              <div className="text-sm min-w-0">
                <div className="font-medium text-general-primary">v{v.version}</div>
                <div className="text-general-muted-foreground">
                  {v.action} · {new Date(v.createdAt).toLocaleString()}
                </div>
              </div>
              <Button
                type="button"
                variant="outline"
                className={adminSmallButton}
                onClick={() => rollback(v.version)}
                disabled={!canRollback || isRollingBack !== null}
              >
                {isRollingBack === v.version ? "Rolling back…" : "Rollback"}
              </Button>
            </div>
          ))}
        </div>
      ) : (
        <div className="mt-4 rounded-xl border border-dashed border-general-border bg-[#fafafa] px-4 py-6 text-sm text-general-muted-foreground">
          No published versions yet.
        </div>
      )}
    </div>
  );

  const addPublisherCard = () => {
    if (!isAdwall || !draftObj || typeof draftObj !== "object") return;
    const current = draftObj as { cards?: unknown[] };
    const next = {
      ...current,
      cards: [...(Array.isArray(current.cards) ? current.cards : []), createEmptyPublisherCard()],
    };
    draftObjRef.current = next;
    setDraftObj(next);
    setFormResetNonce((n) => n + 1);
  };

  return (
    <div className="space-y-6">
      <div className="rounded-3xl border border-general-border bg-[linear-gradient(180deg,#ffffff_0%,#f8fafc_100%)] p-6 shadow-sm">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Link
                href={backHref}
                className={cn(
                  "inline-flex h-8 w-8 items-center justify-center rounded-full border border-general-border bg-white text-primary-main transition-colors hover:bg-[#f7f8fa]",
                  adminIconButton
                )}
                aria-label="Back"
                title="Back"
              >
                <ArrowLeft className="h-4 w-4" />
              </Link>
              <div className="inline-flex items-center rounded-full border border-general-border bg-white px-3 py-1 text-[11px] font-medium uppercase tracking-[0.18em] text-general-muted-foreground">
                {kind}
              </div>
            </div>
            <div>
              <h1 className="text-3xl font-semibold text-primary-main break-all">{keyStr}</h1>
              <p className="mt-2 max-w-2xl text-sm text-general-muted-foreground">
                Keep the content polished in form mode, then preview and publish when you are confident the runtime output matches production.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2 text-sm">
              <Link
                className="inline-flex items-center gap-2 rounded-full border border-general-border bg-white px-3 py-1.5 text-primary-main transition-colors hover:bg-[#f7f8fa]"
                href={previewHref}
                target="_blank"
                rel="noreferrer"
              >
                <Eye className="h-4 w-4" />
                Preview
              </Link>
              <Link
                className="inline-flex items-center gap-2 rounded-full border border-general-border bg-white px-3 py-1.5 text-primary-main transition-colors hover:bg-[#f7f8fa]"
                href={liveHref}
                target="_blank"
                rel="noreferrer"
              >
                <Sparkles className="h-4 w-4" />
                Live
              </Link>
            </div>
          </div>

          <div className="flex w-full flex-col items-stretch gap-3 lg:w-auto lg:min-w-[220px]">
            <Tabs
              value={mode}
              onValueChange={(value) => {
                if (value === "published" && !publishedText) return;
                void reloadConfig();
                setMode(value as "draft" | "published");
              }}
              className="gap-0"
            >
              <TabsList className="w-full">
                <TabsTrigger value="draft" className="min-w-[104px] h-9 px-2.5 text-xs">
                  <PencilLine className="mr-2 h-4 w-4" />
                  Draft
                </TabsTrigger>
                <TabsTrigger value="published" className="min-w-[116px] h-9 px-2.5 text-xs" disabled={!publishedText}>
                  <FileJson className="mr-2 h-4 w-4" />
                  Published
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </div>
      </div>

      {error ? (
        <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 shadow-sm">
          {error}
        </div>
      ) : null}

      {issues?.length ? (
        <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 shadow-sm">
          <div className="font-medium mb-1">Validation issues</div>
          <ul className="list-disc pl-5 space-y-1">
            {issues.slice(0, 20).map((it, i) => (
              <li key={i}>
                <span className="font-mono text-xs">{it.path?.length ? it.path.join(".") : "(root)"}:</span>{" "}
                {it.message}
              </li>
            ))}
          </ul>
          {issues.length > 20 ? (
            <div className="mt-2 text-xs text-red-700/80">Showing first 20 of {issues.length} issues.</div>
          ) : null}
        </div>
      ) : null}

      <div className="">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center gap-3 min-w-0">
            {mode === "draft" && isAdwall ? (
              <Tabs
                value={adwallContentTab}
                onValueChange={(value) => {
                  if (value === "form") {
                    switchToForm();
                    return;
                  }
                  if (value === "json") {
                    switchToJson();
                    return;
                  }
                  setAdwallContentTab("versions");
                }}
                className="gap-0"
              >
                <TabsList>
                  <TabsTrigger value="form">
                    <LayoutTemplate className="mr-2 h-4 w-4" />
                    Form
                  </TabsTrigger>
                  <TabsTrigger value="json">
                    <FileJson className="mr-2 h-4 w-4" />
                    Advanced JSON
                  </TabsTrigger>
                  <TabsTrigger value="versions">
                    <History className="mr-2 h-4 w-4" />
                    Versions
                  </TabsTrigger>
                </TabsList>
              </Tabs>
            ) : (
              <div className="text-sm font-semibold shrink-0 text-general-primary">
                {mode === "published" ? "JSON (published)" : `JSON (${mode})`}
              </div>
            )}
          </div>

          {mode === "draft" ? (
            <TooltipProvider>
              <div className="flex flex-wrap gap-2 shrink-0">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      className={adminIconButton}
                      onClick={async () => {
                        await reloadConfig();
                        toast.success("Config refreshed");
                      }}
                      disabled={isRefreshingConfig}
                      aria-label={isRefreshingConfig ? "Refreshing config" : "Refresh config"}
                    >
                      <RefreshCcw className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>{isRefreshingConfig ? "Refreshing..." : "Refresh"}</TooltipContent>
                </Tooltip>

                {canDelete ? (
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className={adminIconDestructiveButton}
                        onClick={del}
                        aria-label="Delete config"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Delete</TooltipContent>
                  </Tooltip>
                ) : null}

                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      className={adminIconButton}
                      onClick={saveDraft}
                      disabled={!canEdit || isSaving}
                      aria-label={isSaving ? "Saving draft" : "Save draft"}
                    >
                      <Save className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>{isSaving ? "Saving..." : "Save draft"}</TooltipContent>
                </Tooltip>

                <Button
                  type="button"
                  variant="secondary"
                  className={adminButtonPrimary}
                  onClick={publish}
                  disabled={!canEdit || isPublishing}
                >
                  <UploadCloud className="h-4 w-4" />
                  {isPublishing ? "Publishing…" : "Publish"}
                </Button>
              </div>
            </TooltipProvider>
          ) : null}
        </div>

        {mode === "draft" && !canEdit ? (
          <div className="mt-2 text-xs text-general-muted-foreground">
            Your role can preview configs, but only editors can save drafts or publish changes.
          </div>
        ) : null}
      </div>

      <div className="overflow-hidden rounded-3xl border border-general-border bg-white shadow-sm">

        {showAdwallLayoutTabs ? (
          <Tabs value={adwallTab} onValueChange={(value) => setAdwallTab(value as AdwallEditorTab)} className="gap-0">
            <div className="border-b border-general-border bg-[#fafafa] px-5 py-3 flex items-center justify-between gap-3">
              <TabsList>
                <TabsTrigger value="basic">
                  <LayoutTemplate className="mr-2 h-4 w-4" />
                  Basic
                </TabsTrigger>
                <TabsTrigger value="publishers">
                  <Users className="mr-2 h-4 w-4" />
                  Publishers
                  <span className="ml-2 rounded-full bg-[#eef2f6] px-2 py-0.5 text-[11px] text-general-muted-foreground">
                    {publisherCount}
                  </span>
                </TabsTrigger>
              </TabsList>
              {adwallTab === "publishers" ? (
                <Button type="button" variant="outline" className={adminButtonSecondary} onClick={addPublisherCard}>
                  <Users className="h-4 w-4" />
                  Add Publisher
                </Button>
              ) : null}
            </div>

            <TabsContent value="basic" className="mt-0">
              <div className="bg-[#fafafa] p-5">
                <AdwallConfigFormEditor
                  initialDraft={draftObj}
                  resetKey={`${keyStr}:${formResetNonce}`}
                  userRole={props.userRole}
                  section="basic"
                  onDraftChange={(next) => {
                    draftObjRef.current = next;
                    setDraftObj(next);
                  }}
                />
              </div>
            </TabsContent>

            <TabsContent value="publishers" className="mt-0">
              <div className="bg-[#fafafa] p-5">
                <AdwallConfigFormEditor
                  initialDraft={draftObj}
                  resetKey={`${keyStr}:${formResetNonce}`}
                  userRole={props.userRole}
                  section="publishers"
                  onAddCard={addPublisherCard}
                  onDraftChange={(next) => {
                    draftObjRef.current = next;
                    setDraftObj(next);
                  }}
                />
              </div>
            </TabsContent>
          </Tabs>
        ) : null}

        {showVersionsPanel ? (
          <div className="bg-[#fafafa] p-5">{versionHistory}</div>
        ) : showAdwallLayoutTabs ? (
          null
        ) : mode === "draft" && isAdwall && draftView === "form" ? (
          <div className="bg-[#fafafa] p-5">
            <AdwallConfigFormEditor
              initialDraft={draftObj}
              resetKey={`${keyStr}:${formResetNonce}`}
              userRole={props.userRole}
              onDraftChange={(next) => {
                draftObjRef.current = next;
                setDraftObj(next);
              }}
            />
          </div>
        ) : (
          <textarea
            className={cn(
              "w-full min-h-[720px] p-4 font-mono text-xs outline-none",
              mode === "published" ? "bg-[#fafafa]" : "bg-white"
            )}
            value={shownText}
            onChange={(e) => setDraftText(e.target.value)}
            readOnly={mode === "published"}
            spellCheck={false}
          />
        )}
      </div>

      {!showAdwallLayoutTabs && !showVersionsPanel && !(mode === "draft" && isAdwall && adwallContentTab === "json")
        ? versionHistory
        : null}
    </div>
  );
}

