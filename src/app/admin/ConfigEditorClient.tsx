"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { ZodIssue } from "zod";

import AdwallConfigFormEditor from "./adwalls/AdwallConfigFormEditor";
import { Button } from "@/components/ui/button";
import { adwallConfigSchema } from "@/lib/config-schemas";
import { cn } from "@/lib/utils";

type ConfigKind = "funnel" | "adwall";

type VersionRow = {
  version: number;
  action: string;
  createdAt: string;
  createdBy: string | null;
};

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
  const isAdwall = kind === "adwall";
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
    if (mode === "published") setDraftView("json");
  }, [mode]);

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
  };

  const switchToJson = () => {
    setError(null);
    setIssues(null);
    if (draftObj) setDraftText(JSON.stringify(draftObj, null, 2));
    setDraftView("json");
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
        setError(data?.error || "Failed to save draft");
        setIssues(Array.isArray(data?.issues) ? data.issues : null);
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
    } catch {
      setError("Failed to save draft");
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
        setError(data?.error || "Failed to publish");
        return;
      }
      await loadVersions();
      setMode("draft");
    } catch {
      setError("Failed to publish");
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
        setError(data?.error || "Failed to delete");
        return;
      }
      router.push(backHref);
      router.refresh();
    } catch {
      setError("Failed to delete");
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
        setError(data?.error || "Failed to rollback");
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
    } catch {
      setError("Failed to rollback");
    } finally {
      setIsRollingBack(null);
    }
  };

  const shownText = mode === "draft" ? draftText : publishedText || "";

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="text-xs uppercase tracking-wide text-general-muted-foreground">{kind}</div>
          <h1 className="text-2xl font-semibold text-primary-main break-all">{keyStr}</h1>
          <div className="text-sm text-general-muted-foreground mt-1">
            <Link className="underline text-primary-main" href={previewHref} target="_blank" rel="noreferrer">
              Preview (draft)
            </Link>
            {" · "}
            <Link className="underline text-primary-main" href={liveHref} target="_blank" rel="noreferrer">
              Live (published)
            </Link>
            {" · "}
            <Link className="underline text-primary-main" href={backHref}>
              Back
            </Link>
          </div>
        </div>
        <div className="flex flex-col items-end gap-2">
          <div className="text-xs text-general-muted-foreground">Role: {props.userRole}</div>
          <div className="flex gap-2">
            <Button
              type="button"
              variant={mode === "draft" ? "secondary" : "outline"}
              onClick={() => {
                void reloadConfig();
                setMode("draft");
              }}
            >
              Draft
            </Button>
            <Button
              type="button"
              variant={mode === "published" ? "secondary" : "outline"}
              onClick={() => {
                void reloadConfig();
                setMode("published");
              }}
              disabled={!publishedText}
            >
              Published
            </Button>
            <Button type="button" variant="outline" onClick={reloadConfig} disabled={isRefreshingConfig}>
              {isRefreshingConfig ? "Refreshing…" : "Refresh"}
            </Button>
          </div>
        </div>
      </div>

      {error ? (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 text-sm">
          {error}
        </div>
      ) : null}

      {issues?.length ? (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 text-sm">
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

      <div className="bg-white border border-general-border rounded-lg overflow-hidden">
        <div className="flex items-center justify-between gap-3 px-4 py-3 border-b border-general-border">
          <div className="flex items-center gap-3 min-w-0">
            <div className="text-sm font-medium shrink-0">
              {mode === "published"
                ? "JSON (published)"
                : isAdwall
                  ? draftView === "form"
                    ? "Form (draft)"
                    : "Advanced JSON (draft)"
                  : `JSON (${mode})`}
            </div>
            {mode === "draft" && isAdwall ? (
              <div className="flex gap-2">
                <Button type="button" variant={draftView === "form" ? "secondary" : "outline"} onClick={switchToForm}>
                  Form
                </Button>
                <Button type="button" variant={draftView === "json" ? "secondary" : "outline"} onClick={switchToJson}>
                  Advanced JSON
                </Button>
              </div>
            ) : null}
          </div>

          {mode === "draft" ? (
            <div className="flex gap-2 shrink-0">
              {canDelete ? (
                <Button type="button" variant="destructive" onClick={del}>
                  Delete
                </Button>
              ) : null}
              <Button type="button" variant="outline" onClick={saveDraft} disabled={isSaving}>
                {isSaving ? "Saving…" : "Save draft"}
              </Button>
              <Button type="button" variant="secondary" onClick={publish} disabled={isPublishing}>
                {isPublishing ? "Publishing…" : "Publish"}
              </Button>
            </div>
          ) : null}
        </div>

        {mode === "draft" && isAdwall && draftView === "form" ? (
          <div className="p-4 bg-[#fafafa]">
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
              "w-full min-h-[520px] p-4 font-mono text-xs outline-none",
              mode === "published" ? "bg-[#fafafa]" : "bg-white"
            )}
            value={shownText}
            onChange={(e) => setDraftText(e.target.value)}
            readOnly={mode === "published"}
            spellCheck={false}
          />
        )}
      </div>

      <div className="bg-white border border-general-border rounded-lg p-4">
        <div className="flex items-center justify-between">
          <div className="text-sm font-medium">Version history</div>
          <Button type="button" variant="outline" onClick={loadVersions} disabled={isLoadingVersions}>
            {isLoadingVersions ? "Loading…" : "Refresh"}
          </Button>
        </div>
        {versions.length ? (
          <div className="mt-3 divide-y divide-general-border">
            {versions.map((v) => (
              <div key={v.version} className="py-2 flex items-center justify-between gap-3">
                <div className="text-sm">
                  <span className="font-medium">v{v.version}</span>{" "}
                  <span className="text-general-muted-foreground">({v.action})</span>{" "}
                  <span className="text-general-muted-foreground">
                    {new Date(v.createdAt).toLocaleString()}
                  </span>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => rollback(v.version)}
                  disabled={!canRollback || isRollingBack !== null}
                >
                  {isRollingBack === v.version ? "Rolling back…" : "Rollback"}
                </Button>
              </div>
            ))}
          </div>
        ) : (
          <div className="mt-3 text-sm text-general-muted-foreground">No published versions yet.</div>
        )}
      </div>
    </div>
  );
}

