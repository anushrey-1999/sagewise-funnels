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
  adminButtonDestructive,
  adminButtonSecondary,
  adminIconDestructiveButton,
  adminSmallButton,
  adminSmallDestructiveButton,
  adminSmallGhostButton,
} from "../admin-button-styles";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { cn } from "@/lib/utils";

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

function newEmptyCard(): AdwallCard {
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
    creditCardImage: "",
    badgeText: "",
    badgeIcon: "card",
    logoText: "",
    logoSubtext: "",
    advertiserName: "",
    isHidden: false,
    phoneNumber: "",
    bottomBoxHtml: "",
  };
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

  const parsed = React.useMemo(() => adwallConfigSchema.safeParse(props.initialDraft), [props.resetKey, props.initialDraft]);
  const [draft, setDraft] = React.useState<AdwallConfig | null>(parsed.success ? parsed.data : null);

  const form = useForm({
    defaultValues: (parsed.success ? parsed.data : (undefined as unknown as AdwallConfig)),
    onSubmit: async () => {},
  });

  React.useEffect(() => {
    if (parsed.success) {
      setDraft(parsed.data);
      form.reset(parsed.data);
      props.onDraftChange(parsed.data);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [props.resetKey]);

  const emitPatch = React.useCallback(
    (path: (string | number)[], value: unknown) => {
      const base = draft ?? (form.state.values as AdwallConfig);
      const next = setIn(base, path, value) as AdwallConfig;
      setDraft(next);
      props.onDraftChange(next);
    },
    [draft, form, props]
  );

  const emitNext = React.useCallback(
    (next: AdwallConfig) => {
      setDraft(next);
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

  const addCard = () => {
    const next = cloneJson(draft) as AdwallConfig;
    next.cards = [...cards, newEmptyCard()];
    emitNext(next);
  };

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
    next.cards[cardIndex]!.features = [...current, ""];
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
              <Label htmlFor="adwall-title">Title</Label>
              <Input
                id="adwall-title"
                value={values.title ?? ""}
                onChange={(e) => emitPatch(["title"], e.target.value)}
                placeholder="Compare Top Auto Insurance Rates in {zip}."
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="adwall-subtitle">Subtitle</Label>
              <textarea
                id="adwall-subtitle"
                className="w-full min-h-[90px] p-3 rounded-md border border-general-border outline-none focus-visible:ring-ring/50 focus-visible:ring-[3px]"
                value={values.subtitle ?? ""}
                onChange={(e) => emitPatch(["subtitle"], e.target.value)}
                placeholder="Drivers are saving up to…"
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
              className="w-full min-h-[90px] p-3 rounded-md border border-general-border outline-none focus-visible:ring-ring/50 focus-visible:ring-[3px]"
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
            const adv = card?.advertiserName?.trim();
            const badge = card?.badgeText?.trim();
            const hidden = !!card?.isHidden;

            return (
              <AccordionItem key={idx} value={`card-${idx}`} className="px-4">
                <AccordionTrigger className="py-3">
                  <div className="min-w-0">
                    <div className="text-sm font-medium truncate">{heading}</div>
                    <div className="text-xs text-general-muted-foreground truncate">
                      {adv ? adv : "—"}
                      {badge ? ` · ${badge}` : ""}
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
                      <Label htmlFor={`c-${idx}-heading`}>Heading</Label>
                      <Input
                        id={`c-${idx}-heading`}
                        value={card.heading ?? ""}
                        onChange={(e) => emitPatch(["cards", idx, "heading"], e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor={`c-${idx}-adv`}>Advertiser name</Label>
                      <Input
                        id={`c-${idx}-adv`}
                        value={card.advertiserName ?? ""}
                        onChange={(e) => emitPatch(["cards", idx, "advertiserName"], e.target.value)}
                      />
                    </div>
                    <div className="space-y-2 md:col-span-2">
                      <Label htmlFor={`c-${idx}-desc`}>Description</Label>
                      <textarea
                        id={`c-${idx}-desc`}
                        className="w-full min-h-[80px] p-3 rounded-md border border-general-border outline-none focus-visible:ring-ring/50 focus-visible:ring-[3px]"
                        value={card.description ?? ""}
                        onChange={(e) => emitPatch(["cards", idx, "description"], e.target.value)}
                      />
                    </div>
                    <div className="space-y-2 md:col-span-2">
                      <div className="flex items-center justify-between gap-3">
                        <Label>Features</Label>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          className={adminSmallButton}
                          onClick={() => addFeature(idx)}
                        >
                          <Plus className="h-4 w-4" />
                          Add feature
                        </Button>
                      </div>
                      <div className="space-y-2">
                        {Array.isArray(card.features) && card.features.length > 0 ? (
                          card.features.map((feature, featureIdx) => (
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
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor={`c-${idx}-btnText`}>Button text</Label>
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
                          onChange={(next) => emitPatch(["cards", idx, "logo"], next)}
                        />
                        <ImageUploadField
                          label="Credit card image (optional)"
                          value={card.creditCardImage ?? ""}
                          placeholder="/images/card.png"
                          uploadBasePath={`${uploadBasePath}/cards/${idx}`}
                          uploadName="credit-card"
                          onChange={(next) => emitPatch(["cards", idx, "creditCardImage"], next)}
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor={`c-${idx}-logoText`}>Logo text (optional)</Label>
                      <Input
                        id={`c-${idx}-logoText`}
                        value={card.logoText ?? ""}
                        onChange={(e) => emitPatch(["cards", idx, "logoText"], e.target.value)}
                        placeholder="Shown under logo if no image"
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
                      <Label htmlFor={`c-${idx}-badgeText`}>Badge text</Label>
                      <Input
                        id={`c-${idx}-badgeText`}
                        value={card.badgeText ?? ""}
                        onChange={(e) => emitPatch(["cards", idx, "badgeText"], e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Highlight border</Label>
                      <div className="flex items-center gap-3 rounded-xl border border-general-border bg-[#fafafa] px-3 py-3">
                        <Checkbox
                          id={`c-${idx}-differentBorder`}
                          checked={!!card.isDifferentBorder}
                          onCheckedChange={(checked) => emitPatch(["cards", idx, "isDifferentBorder"], checked === true)}
                        />
                        <label
                          htmlFor={`c-${idx}-differentBorder`}
                          className="text-sm text-general-primary cursor-pointer"
                        >
                          Use the highlighted border style for this publisher card
                        </label>
                      </div>
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
                    <div className="space-y-2 md:col-span-2">
                      <Label htmlFor={`c-${idx}-bottomBoxHtml`}>Bottom callout HTML (optional)</Label>
                      <textarea
                        id={`c-${idx}-bottomBoxHtml`}
                        className="w-full min-h-[110px] p-3 rounded-md border border-general-border outline-none focus-visible:ring-ring/50 focus-visible:ring-[3px] font-mono text-xs"
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
                          "w-full min-h-[110px] p-3 rounded-md border border-general-border outline-none focus-visible:ring-ring/50 focus-visible:ring-[3px] font-mono text-xs",
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

