"use client";

import * as React from "react";
import { useForm } from "@tanstack/react-form";

import { adwallConfigSchema } from "@/lib/config-schemas";
import type { AdwallCard, AdwallConfig } from "@/types/adwall";
import { Button } from "@/components/ui/button";
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
  const root = cloneJson(obj) as any;
  let cur: any = root;

  for (let i = 0; i < path.length - 1; i++) {
    const key = path[i]!;
    const nextKey = path[i + 1]!;
    const existing = cur[key];

    if (existing == null || typeof existing !== "object") {
      cur[key] = typeof nextKey === "number" ? [] : {};
    }
    cur = cur[key];
  }

  cur[path[path.length - 1]!] = value;
  return root;
}

function joinLines(arr: string[] | undefined) {
  return Array.isArray(arr) ? arr.join("\n") : "";
}

function splitLines(v: string) {
  return v
    .split("\n")
    .map((s) => s.trim())
    .filter(Boolean);
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
    logoWidth: "",
    logoHeight: "",
    creditCardImage: "",
    badgeText: "",
    badgeIcon: "",
    advertiserName: "",
  };
}

export default function AdwallConfigFormEditor(props: {
  initialDraft: unknown;
  resetKey: string;
  userRole: string;
  onDraftChange: (next: unknown) => void;
  className?: string;
}) {
  const canScripts = props.userRole === "internal_admin" || props.userRole === "superadmin";

  const parsed = React.useMemo(() => adwallConfigSchema.safeParse(props.initialDraft), [props.resetKey]);
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

  return (
    <div className={cn("space-y-6", props.className)}>
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

      <div className="bg-white border border-general-border rounded-lg overflow-hidden">
        <div className="flex items-center justify-between px-4 py-3 border-b border-general-border">
          <div className="text-sm font-medium">Cards</div>
          <Button type="button" variant="outline" onClick={addCard}>
            Add card
          </Button>
        </div>

        <Accordion type="multiple" className="divide-y divide-general-border">
          {cards.map((card, idx) => {
            const heading = card?.heading?.trim() || `Card ${idx + 1}`;
            const adv = card?.advertiserName?.trim();
            const badge = card?.badgeText?.trim();

            return (
              <AccordionItem key={idx} value={`card-${idx}`} className="px-4">
                <AccordionTrigger className="py-3">
                  <div className="min-w-0">
                    <div className="text-sm font-medium truncate">{heading}</div>
                    <div className="text-xs text-general-muted-foreground truncate">
                      {adv ? adv : "—"}
                      {badge ? ` · ${badge}` : ""}
                    </div>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="pb-4">
                  <div className="flex flex-wrap gap-2 mb-4">
                    <Button type="button" variant="outline" size="sm" onClick={() => moveCard(idx, idx - 1)} disabled={idx === 0}>
                      Move up
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => moveCard(idx, idx + 1)}
                      disabled={idx === cards.length - 1}
                    >
                      Move down
                    </Button>
                    <Button type="button" variant="outline" size="sm" onClick={() => duplicateCard(idx)}>
                      Duplicate
                    </Button>
                    <Button type="button" variant="destructive" size="sm" onClick={() => deleteCard(idx)}>
                      Delete
                    </Button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                      <Label htmlFor={`c-${idx}-features`}>Features (one per line)</Label>
                      <textarea
                        id={`c-${idx}-features`}
                        className="w-full min-h-[110px] p-3 rounded-md border border-general-border outline-none focus-visible:ring-ring/50 focus-visible:ring-[3px] font-mono text-xs"
                        value={joinLines(card.features)}
                        onChange={(e) => emitPatch(["cards", idx, "features"], splitLines(e.target.value))}
                        placeholder={"Feature 1\nFeature 2\nFeature 3"}
                      />
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

                    <div className="space-y-2">
                      <Label htmlFor={`c-${idx}-logo`}>Logo path/URL</Label>
                      <Input
                        id={`c-${idx}-logo`}
                        value={card.logo ?? ""}
                        onChange={(e) => emitPatch(["cards", idx, "logo"], e.target.value)}
                        placeholder="/logos/autoins/statefarm.avif"
                      />
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
                      <Label htmlFor={`c-${idx}-badgeIcon`}>Badge icon</Label>
                      <Input
                        id={`c-${idx}-badgeIcon`}
                        value={card.badgeIcon ?? ""}
                        onChange={(e) => emitPatch(["cards", idx, "badgeIcon"], e.target.value)}
                        placeholder="card"
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
                      <Label htmlFor={`c-${idx}-ccImg`}>Credit card image (optional)</Label>
                      <Input
                        id={`c-${idx}-ccImg`}
                        value={card.creditCardImage ?? ""}
                        onChange={(e) => emitPatch(["cards", idx, "creditCardImage"], e.target.value)}
                        placeholder="/images/card.png"
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
    </div>
  );
}

