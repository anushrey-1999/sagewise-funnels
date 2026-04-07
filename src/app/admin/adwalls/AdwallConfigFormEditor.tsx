"use client";

import * as React from "react";
import Image from "next/image";
import { useForm } from "@tanstack/react-form";
import { upload } from "@vercel/blob/client";
import type { PutBlobResult } from "@vercel/blob";
import { Eye, EyeOff, Plus, Trash2 } from "lucide-react";

import { adwallConfigSchema } from "@/lib/config-schemas";
import type { AdwallCard, AdwallConfig } from "@/types/adwall";
import {
  adminIconDestructiveButton,
  adminSmallButton,
  adminSmallDestructiveButton,
  adminSmallGhostButton,
  adminTextareaInput,
} from "../admin-button-styles";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { cn } from "@/lib/utils";

const MAX_CARD_FEATURES = 3;

function normalizeTemplateVariables(value: string | undefined): string | undefined {
  if (value == null) return value;
  return value
    .replace(/\{zip\}/g, "{ZIP}")
    .replace(/\{city\}/g, "{CITY}")
    .replace(/\{month\}/g, "{MONTH}")
    .replace(/\{year\}/g, "{YEAR}");
}

function normalizeAdwallHeaderTemplates(config: AdwallConfig): AdwallConfig {
  const next = cloneJson(config);
  next.title = normalizeTemplateVariables(next.title) ?? "";
  next.subtitle = normalizeTemplateVariables(next.subtitle) ?? "";
  next.staticTitle = normalizeTemplateVariables(next.staticTitle);
  next.staticSubtitle = normalizeTemplateVariables(next.staticSubtitle);
  next.dynamicTitle = normalizeTemplateVariables(next.dynamicTitle);
  next.dynamicSubtitle = normalizeTemplateVariables(next.dynamicSubtitle);
  return next;
}

function cloneJson<T>(v: T): T {
  // Configs are JSON-compatible; prefer structuredClone when available.
  return typeof structuredClone === "function" ? structuredClone(v) : (JSON.parse(JSON.stringify(v)) as T);
}

function setIn(obj: unknown, path: (string | number)[], value: unknown): unknown {
  const getChild = (container: unknown, key: string | number): unknown => {
    if (Array.isArray(container)) return container[typeof key === "number" ? key : Number(key)];
    if (container && typeof container === "object") return (container as Record<string, unknown>)[String(key)];
    return undefined;
  };

  const setChild = (container: unknown, key: string | number, next: unknown) => {
    if (Array.isArray(container)) {
      container[typeof key === "number" ? key : Number(key)] = next;
      return;
    }
    if (container && typeof container === "object") {
      (container as Record<string, unknown>)[String(key)] = next;
      return;
    }
    throw new Error("Invalid container");
  };

  let root: unknown = cloneJson(obj);
  if (!root || typeof root !== "object") root = {};

  let cur: unknown = root;

  for (let i = 0; i < path.length - 1; i++) {
    const key = path[i]!;
    const nextKey = path[i + 1]!;
    const existing = getChild(cur, key);

    if (existing == null || typeof existing !== "object") {
      setChild(cur, key, typeof nextKey === "number" ? [] : {});
    }
    cur = getChild(cur, key);
  }

  setChild(cur, path[path.length - 1]!, value);
  return root;
}

function stopAccordionFieldKeyPropagation(e: React.KeyboardEvent<HTMLElement>) {
  const target = e.target;
  if (target instanceof HTMLInputElement || target instanceof HTMLTextAreaElement) {
    e.stopPropagation();
  }
}

function sanitizePathSegment(v: string): string {
  return v
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9-_]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 80);
}

function fileExtension(filename: string): string {
  const i = filename.lastIndexOf(".");
  if (i <= 0) return "";
  const ext = filename.slice(i + 1).toLowerCase();
  return /^[a-z0-9]+$/.test(ext) ? ext : "";
}

function isPreviewableImageSrc(src: string): boolean {
  if (!src) return false;
  if (src.startsWith("/")) return true;
  try {
    const u = new URL(src);
    return u.protocol === "http:" || u.protocol === "https:";
  } catch {
    return false;
  }
}

function ImageUploadField(props: {
  label: string;
  value: string;
  placeholder?: string;
  uploadBasePath: string;
  uploadName: string;
  onChange: (next: string) => void;
}) {
  const inputRef = React.useRef<HTMLInputElement | null>(null);
  const [isUploading, setIsUploading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const canPreview = isPreviewableImageSrc(props.value);

  const pickFile = () => inputRef.current?.click();

  const onFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    setError(null);
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const ext = fileExtension(file.name);
      const pathname = `${props.uploadBasePath}/${props.uploadName}${ext ? `.${ext}` : ""}`;

      const result: PutBlobResult = await upload(pathname, file, {
        access: "public",
        handleUploadUrl: "/api/admin/uploads/blob",
      });

      props.onChange(result.url);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setIsUploading(false);
      // allow re-uploading the same file
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between gap-2">
        <Label>{props.label}</Label>
        <div className="flex items-center gap-2">
          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={onFileChange}
          />
          <Button type="button" variant="outline" size="sm" className={adminSmallButton} onClick={pickFile} disabled={isUploading}>
            {isUploading ? "Uploading…" : "Upload"}
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className={adminSmallGhostButton}
            onClick={() => props.onChange("")}
            disabled={isUploading || !props.value}
          >
            Clear
          </Button>
        </div>
      </div>

      <Input value={props.value ?? ""} onChange={(e) => props.onChange(e.target.value)} placeholder={props.placeholder} />

      {canPreview ? (
        <div className="border border-general-border rounded-md bg-white p-2 w-full">
          <div className="relative w-full h-[88px]">
            <Image
              src={props.value}
              alt={`${props.label} preview`}
              fill
              sizes="320px"
              className="object-contain"
            />
          </div>
        </div>
      ) : null}

      {error ? <div className="text-xs text-red-600">{error}</div> : null}
    </div>
  );
}

export default function AdwallConfigFormEditor(props: {
  initialDraft: unknown;
  resetKey: string;
  userRole: string;
  section?: "basic" | "publishers";
  onAddCard?: () => void;
  onDraftChange: (next: unknown) => void;
  className?: string;
}) {
  const canScripts = props.userRole === "internal_admin" || props.userRole === "superadmin";

  const parsed = React.useMemo(() => adwallConfigSchema.safeParse(props.initialDraft), [props.initialDraft]);
  const [draft, setDraft] = React.useState<AdwallConfig | null>(parsed.success ? parsed.data : null);
  const draftRef = React.useRef<AdwallConfig | null>(draft);

  const form = useForm({
    defaultValues: (parsed.success ? parsed.data : (undefined as unknown as AdwallConfig)),
    onSubmit: async () => {},
  });

  React.useEffect(() => {
    if (parsed.success) {
      const normalized = normalizeAdwallHeaderTemplates(parsed.data);
      setDraft(normalized);
      draftRef.current = normalized;
      form.reset(normalized);
      props.onDraftChange(normalized);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [props.resetKey]);

  // Keep internal draft in sync when the parent's draft changes (e.g. the
  // other section tab edited a field). Without this, each section's internal
  // `draft` can go stale and overwrite changes made in the other tab.
  // We skip the update when this instance was the one that emitted the change
  // to avoid unnecessary re-parses and potential loops.
  const selfEmittedRef = React.useRef<unknown>(null);
  React.useEffect(() => {
    if (props.initialDraft === selfEmittedRef.current) return;
    const reParsed = adwallConfigSchema.safeParse(props.initialDraft);
    if (reParsed.success) {
      const normalized = normalizeAdwallHeaderTemplates(reParsed.data);
      setDraft(normalized);
      draftRef.current = normalized;
    }
  }, [props.initialDraft]);

  const emitPatch = React.useCallback(
    (path: (string | number)[], value: unknown) => {
      const base = draftRef.current ?? (form.state.values as AdwallConfig);
      const normalizedValue =
        typeof value === "string" &&
        path.length >= 1 &&
        ["title", "subtitle", "staticTitle", "staticSubtitle", "dynamicTitle", "dynamicSubtitle"].includes(String(path[path.length - 1]))
          ? normalizeTemplateVariables(value)
          : value;
      const next = setIn(base, path, normalizedValue) as AdwallConfig;
      setDraft(next);
      draftRef.current = next;
      selfEmittedRef.current = next;
      props.onDraftChange(next);
    },
    [form, props]
  );

  const emitNext = React.useCallback(
    (next: AdwallConfig) => {
      setDraft(next);
      draftRef.current = next;
      selfEmittedRef.current = next;
      props.onDraftChange(next);
    },
    [props]
  );

  if (!parsed.success || !draft) {
    return (
      <div className={cn("bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 text-sm", props.className)}>
        This draft can’t be shown in the form editor yet. Fix the validation errors in Advanced JSON, then return to Form.
      </div>
    );
  }

  const values = draft;
  const cards = Array.isArray(draft.cards) ? draft.cards : [];
  const uploadBasePath = `adwall/${sanitizePathSegment(values.funnelId ?? "") || "funnel"}/${
    sanitizePathSegment(values.adwallType ?? "") || "type"
  }`;

  const deleteCard = (idx: number) => {
    const next = cloneJson(draft) as AdwallConfig;
    next.cards = cards.filter((_, i) => i !== idx);
    emitNext(next);
  };

  const duplicateCard = (idx: number) => {
    const next = cloneJson(draft) as AdwallConfig;
    const copy = cloneJson(cards[idx]) as AdwallCard;
    next.cards = [...cards.slice(0, idx + 1), copy, ...cards.slice(idx + 1)];
    emitNext(next);
  };

  const moveCard = (from: number, to: number) => {
    if (to < 0 || to >= cards.length) return;
    const next = cloneJson(draft) as AdwallConfig;
    const arr = [...cards];
    const [item] = arr.splice(from, 1);
    arr.splice(to, 0, item!);
    next.cards = arr;
    emitNext(next);
  };

  const addFeature = (cardIndex: number) => {
    const next = cloneJson(draft) as AdwallConfig;
    const current = Array.isArray(next.cards[cardIndex]?.features) ? next.cards[cardIndex]!.features : [];
    if (current.length >= MAX_CARD_FEATURES) return;
    next.cards[cardIndex]!.features = [...current, ""];
    emitNext(next);
  };

  const updateCardMedia = (cardIndex: number, field: "logo" | "creditCardImage", value: string) => {
    const next = cloneJson(draftRef.current ?? draft) as AdwallConfig;
    if (!next?.cards?.[cardIndex]) return;
    next.cards[cardIndex]![field] = value;
    if (value) {
      const alternateField = field === "logo" ? "creditCardImage" : "logo";
      next.cards[cardIndex]![alternateField] = "";
    }
    emitNext(next);
  };

  const updateFeature = (cardIndex: number, featureIndex: number, value: string) => {
    emitPatch(["cards", cardIndex, "features", featureIndex], value);
  };

  const removeFeature = (cardIndex: number, featureIndex: number) => {
    const next = cloneJson(draft) as AdwallConfig;
    const current = Array.isArray(next.cards[cardIndex]?.features) ? next.cards[cardIndex]!.features : [];
    next.cards[cardIndex]!.features = current.filter((_, idx) => idx !== featureIndex);
    emitNext(next);
  };

  const toggleCardHidden = (cardIndex: number) => {
    const next = cloneJson(draft) as AdwallConfig;
    const currentHidden = !!next.cards[cardIndex]?.isHidden;
    next.cards[cardIndex]!.isHidden = !currentHidden;
    emitNext(next);
  };

  return (
    <div className={cn("space-y-6", props.className)}>
      {props.section !== "publishers" ? (
        <div className="bg-white border border-general-border rounded-lg p-4 space-y-4">
          <div className="text-sm font-medium">Adwall details</div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="adwall-id">ID</Label>
              <Input
                id="adwall-id"
                value={values.id ?? ""}
                onChange={(e) => emitPatch(["id"], e.target.value)}
                placeholder="autoins-one"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="adwall-funnelId">Funnel ID</Label>
              <Input
                id="adwall-funnelId"
                value={values.funnelId ?? ""}
                onChange={(e) => emitPatch(["funnelId"], e.target.value)}
                placeholder="autoins"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="adwall-type">Adwall type</Label>
              <Input
                id="adwall-type"
                value={values.adwallType ?? ""}
                onChange={(e) => emitPatch(["adwallType"], e.target.value)}
                placeholder="one"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="adwall-updatedAt">Updated at</Label>
              <Input
                id="adwall-updatedAt"
                value={values.updatedAt ?? ""}
                onChange={(e) => emitPatch(["updatedAt"], e.target.value)}
                placeholder='Updated January 23, 2026'
              />
            </div>
          </div>

          <Separator />

          <div className="grid grid-cols-1 gap-4">
            <div className="space-y-2">
              <Label htmlFor="adwall-static-title">Static title</Label>
              <div className="text-xs text-general-muted-foreground">
                This will be visible if user comes directly to adwall.
              </div>
              <Input
                id="adwall-static-title"
                value={values.staticTitle ?? values.title ?? ""}
                onChange={(e) => emitPatch(["staticTitle"], e.target.value)}
                placeholder="Compare Top Auto Insurance Rates in {ZIP}."
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="adwall-static-subtitle">Static subtitle</Label>
              <div className="text-xs text-general-muted-foreground">
                This will be visible if user comes directly to adwall.
              </div>
              <textarea
                id="adwall-static-subtitle"
                className={cn(adminTextareaInput, "min-h-[90px]")}
                value={values.staticSubtitle ?? values.subtitle ?? ""}
                onChange={(e) => emitPatch(["staticSubtitle"], e.target.value)}
                placeholder="Drivers are saving up to…"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="adwall-dynamic-title">Dynamic title</Label>
              <div className="text-xs text-general-muted-foreground">
                This will be visible if user comes from the funnel.
              </div>
              <Input
                id="adwall-dynamic-title"
                value={values.dynamicTitle ?? values.title ?? ""}
                onChange={(e) => emitPatch(["dynamicTitle"], e.target.value)}
                placeholder="{NAME}, we found matches for you in {ZIP}."
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="adwall-dynamic-subtitle">Dynamic subtitle</Label>
              <div className="text-xs text-general-muted-foreground">
                This will be visible if user comes from the funnel.
              </div>
              <textarea
                id="adwall-dynamic-subtitle"
                className={cn(adminTextareaInput, "min-h-[90px]")}
                value={values.dynamicSubtitle ?? values.subtitle ?? ""}
                onChange={(e) => emitPatch(["dynamicSubtitle"], e.target.value)}
                placeholder="Compare top-rated offers in {CITY}."
              />
            </div>
          </div>

          <Separator />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="meta-title">Metadata title</Label>
              <Input
                id="meta-title"
                value={values.metadata?.title ?? ""}
                onChange={(e) => emitPatch(["metadata", "title"], e.target.value)}
                placeholder="Page title for SEO"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="meta-desc">Metadata description</Label>
              <Input
                id="meta-desc"
                value={values.metadata?.description ?? ""}
                onChange={(e) => emitPatch(["metadata", "description"], e.target.value)}
                placeholder="Description for SEO"
              />
            </div>
          </div>

          <Separator />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="nav-tagline">Navbar tagline</Label>
              <Input
                id="nav-tagline"
                value={values.navbar?.tagline ?? ""}
                onChange={(e) => emitPatch(["navbar", "tagline"], e.target.value)}
                placeholder="Speak to a licensed agent:"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="nav-phone">Navbar phone</Label>
              <Input
                id="nav-phone"
                value={values.navbar?.phone ?? ""}
                onChange={(e) => emitPatch(["navbar", "phone"], e.target.value)}
                placeholder="1-800-000-0000"
              />
            </div>
          </div>

          <Separator />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="track-aff">Tracking affiliateIdParam</Label>
              <Input
                id="track-aff"
                value={values.trackingParams?.affiliateIdParam ?? ""}
                onChange={(e) => emitPatch(["trackingParams", "affiliateIdParam"], e.target.value)}
                placeholder="s1"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="track-txn">Tracking transactionIdParam</Label>
              <Input
                id="track-txn"
                value={values.trackingParams?.transactionIdParam ?? ""}
                onChange={(e) => emitPatch(["trackingParams", "transactionIdParam"], e.target.value)}
                placeholder="s2"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="track-sub3">sub3 value (optional)</Label>
              <Input
                id="track-sub3"
                value={values.trackingParams?.sub3 ?? ""}
                onChange={(e) => emitPatch(["trackingParams", "sub3"], e.target.value)}
                placeholder="e.g. 128"
              />
            </div>
          </div>

          <Separator />

          <div className="space-y-2">
            <Label htmlFor="disclaimers">Disclaimers</Label>
            <textarea
              id="disclaimers"
              className={cn(adminTextareaInput, "min-h-[90px]")}
              value={values.disclaimers ?? ""}
              onChange={(e) => emitPatch(["disclaimers"], e.target.value)}
              placeholder="Optional disclaimer text"
            />
          </div>
        </div>
      ) : null}

      {props.section !== "basic" ? (
        <div className="bg-white border border-general-border rounded-lg overflow-hidden">
          <Accordion type="multiple" className="divide-y divide-general-border">
          {cards.map((card, idx) => {
            const heading = card?.heading?.trim() || `Card ${idx + 1}`;
            const badge = card?.badgeText?.trim();
            const hidden = !!card?.isHidden;

            return (
              <AccordionItem key={idx} value={`card-${idx}`} className="px-4">
                <AccordionTrigger className="py-3">
                  <div className="min-w-0">
                    <div className="text-sm font-medium truncate">{heading}</div>
                    <div className="text-xs text-general-muted-foreground truncate">
                      {badge ? badge : "—"}
                      {hidden ? " · Hidden" : ""}
                    </div>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="pb-4">
                  <div className="flex flex-wrap gap-2 mb-4">
                    <Button type="button" variant="outline" size="sm" className={adminSmallButton} onClick={() => moveCard(idx, idx - 1)} disabled={idx === 0}>
                      Move up
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className={adminSmallButton}
                      onClick={() => moveCard(idx, idx + 1)}
                      disabled={idx === cards.length - 1}
                    >
                      Move down
                    </Button>
                    <Button type="button" variant="outline" size="sm" className={adminSmallButton} onClick={() => duplicateCard(idx)}>
                      Duplicate
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className={adminSmallButton}
                      onClick={() => toggleCardHidden(idx)}
                    >
                      {hidden ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                      {hidden ? "Unhide" : "Hide"}
                    </Button>
                    <Button
                      type="button"
                      variant="destructive"
                      size="sm"
                      className={adminSmallDestructiveButton}
                      onClick={() => deleteCard(idx)}
                    >
                      Delete
                    </Button>
                  </div>

                  <div
                    className="grid grid-cols-1 md:grid-cols-2 gap-4"
                    onKeyDownCapture={stopAccordionFieldKeyPropagation}
                  >
                    <div className="space-y-2">
                      <Label htmlFor={`c-${idx}-heading`}>Title</Label>
                      <Input
                        id={`c-${idx}-heading`}
                        value={card.heading ?? ""}
                        onChange={(e) => emitPatch(["cards", idx, "heading"], e.target.value)}
                      />
                    </div>
                    <div className="space-y-2 md:col-span-2">
                      <Label htmlFor={`c-${idx}-desc`}>Headline</Label>
                      <textarea
                        id={`c-${idx}-desc`}
                        className={cn(adminTextareaInput, "min-h-[80px]")}
                        value={card.description ?? ""}
                        onChange={(e) => emitPatch(["cards", idx, "description"], e.target.value)}
                      />
                    </div>
                    <div className="space-y-2 md:col-span-2">
                      <div className="flex items-center justify-between gap-3">
                        <Label>Sub-bullets</Label>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          className={adminSmallButton}
                          onClick={() => addFeature(idx)}
                          disabled={(card.features?.length ?? 0) >= MAX_CARD_FEATURES}
                        >
                          <Plus className="h-4 w-4" />
                          Add feature
                        </Button>
                      </div>
                      <div className="space-y-2">
                        {Array.isArray(card.features) && card.features.length > 0 ? (
                          card.features.slice(0, MAX_CARD_FEATURES).map((feature, featureIdx) => (
                            <div key={featureIdx} className="flex items-center gap-2">
                              <Input
                                value={feature ?? ""}
                                onChange={(e) => updateFeature(idx, featureIdx, e.target.value)}
                                placeholder={`Feature ${featureIdx + 1}`}
                              />
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                className={adminIconDestructiveButton}
                                onClick={() => removeFeature(idx, featureIdx)}
                                aria-label={`Remove feature ${featureIdx + 1}`}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          ))
                        ) : (
                          <div className="rounded-xl border border-dashed border-general-border bg-[#fafafa] px-4 py-3 text-sm text-general-muted-foreground">
                            No features added yet. Click <span className="font-medium text-general-primary">Add feature</span> to create the first item.
                          </div>
                        )}
                        {Array.isArray(card.features) && card.features.length >= MAX_CARD_FEATURES ? (
                          <div className="text-xs text-general-muted-foreground">
                            You can add up to {MAX_CARD_FEATURES} bullet points per card.
                          </div>
                        ) : null}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor={`c-${idx}-btnText`}>Button label</Label>
                      <Input
                        id={`c-${idx}-btnText`}
                        value={card.buttonText ?? ""}
                        onChange={(e) => emitPatch(["cards", idx, "buttonText"], e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor={`c-${idx}-btnLink`}>Button link</Label>
                      <Input
                        id={`c-${idx}-btnLink`}
                        value={card.buttonLink ?? ""}
                        onChange={(e) => emitPatch(["cards", idx, "buttonLink"], e.target.value)}
                      />
                    </div>

                    <div className="space-y-2 md:col-span-2">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <ImageUploadField
                          label="Logo path/URL"
                          value={card.logo ?? ""}
                          placeholder="/logos/autoins/statefarm.avif"
                          uploadBasePath={`${uploadBasePath}/cards/${idx}`}
                          uploadName="logo"
                          onChange={(next) => updateCardMedia(idx, "logo", next)}
                        />
                        <ImageUploadField
                          label="Credit card image (optional)"
                          value={card.creditCardImage ?? ""}
                          placeholder="/images/card.png"
                          uploadBasePath={`${uploadBasePath}/cards/${idx}`}
                          uploadName="credit-card"
                          onChange={(next) => updateCardMedia(idx, "creditCardImage", next)}
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor={`c-${idx}-logoText`}>Logo Bottom Text (optional)</Label>
                      <Input
                        id={`c-${idx}-logoText`}
                        value={card.logoText ?? ""}
                        onChange={(e) => emitPatch(["cards", idx, "logoText"], e.target.value)}
                        placeholder="NMLS ID"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor={`c-${idx}-logoW`}>Logo width</Label>
                      <Input
                        id={`c-${idx}-logoW`}
                        value={card.logoWidth ?? ""}
                        onChange={(e) => emitPatch(["cards", idx, "logoWidth"], e.target.value)}
                        placeholder="110px"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor={`c-${idx}-logoH`}>Logo height</Label>
                      <Input
                        id={`c-${idx}-logoH`}
                        value={card.logoHeight ?? ""}
                        onChange={(e) => emitPatch(["cards", idx, "logoHeight"], e.target.value)}
                        placeholder="20px"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor={`c-${idx}-badgeText`}>Banner text</Label>
                      <Input
                        id={`c-${idx}-badgeText`}
                        value={card.badgeText ?? ""}
                        onChange={(e) => emitPatch(["cards", idx, "badgeText"], e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor={`c-${idx}-rating`}>Rating number</Label>
                      <Input
                        id={`c-${idx}-rating`}
                        value={card.ratingsNumber ?? ""}
                        onChange={(e) => emitPatch(["cards", idx, "ratingsNumber"], e.target.value)}
                        placeholder="4.8"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor={`c-${idx}-ratingCount`}>Rating count (stars)</Label>
                      <Input
                        id={`c-${idx}-ratingCount`}
                        type="number"
                        value={String(card.ratingsCount ?? 5)}
                        onChange={(e) =>
                          emitPatch(["cards", idx, "ratingsCount"], Number.isFinite(Number(e.target.value)) ? Number(e.target.value) : 5)
                        }
                        placeholder="5"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor={`c-${idx}-phone`}>Phone number (optional)</Label>
                      <Input
                        id={`c-${idx}-phone`}
                        value={card.phoneNumber ?? ""}
                        onChange={(e) => emitPatch(["cards", idx, "phoneNumber"], e.target.value)}
                        placeholder="1-800-000-0000"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor={`c-${idx}-trustpilotReviews`}>Trustpilot reviews (optional)</Label>
                      <Input
                        id={`c-${idx}-trustpilotReviews`}
                        value={card.trustpilotReviews ?? ""}
                        onChange={(e) => emitPatch(["cards", idx, "trustpilotReviews"], e.target.value)}
                        placeholder="18,267"
                      />
                    </div>
                    <div className="space-y-2 md:col-span-2">
                      <Label htmlFor={`c-${idx}-bottomBoxHtml`}>Offer tile Footer (optional)</Label>
                      <textarea
                        id={`c-${idx}-bottomBoxHtml`}
                        className={cn(adminTextareaInput, "min-h-[110px] font-mono text-xs")}
                        value={card.bottomBoxHtml ?? ""}
                        onChange={(e) => emitPatch(["cards", idx, "bottomBoxHtml"], e.target.value)}
                        placeholder="<p>Optional disclosure, licensing, or lender details.</p>"
                        spellCheck={false}
                      />
                    </div>

                    <div className="space-y-2 md:col-span-2">
                      <Label htmlFor={`c-${idx}-impression`}>
                        Impression script {canScripts ? "" : "(internal only)"}
                      </Label>
                      <textarea
                        id={`c-${idx}-impression`}
                        className={cn(
                          adminTextareaInput,
                          "min-h-[110px] font-mono text-xs",
                          !canScripts && "bg-[#fafafa]"
                        )}
                        value={card.impressionScript ?? ""}
                        onChange={(e) => emitPatch(["cards", idx, "impressionScript"], e.target.value)}
                        placeholder="<script>…</script>"
                        readOnly={!canScripts}
                        spellCheck={false}
                      />
                      {!canScripts ? (
                        <div className="text-xs text-general-muted-foreground">
                          Your role can’t edit script fields. They will be preserved from the existing config.
                        </div>
                      ) : null}
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>
            );
          })}
          </Accordion>
        </div>
      ) : null}
    </div>
  );
}

