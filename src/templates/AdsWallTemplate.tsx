"use client";

import AdsWallCards from "@/organisms/AdsWallCards";
import PlainPageHeader from "@/organisms/PlainPageHeader";
import { useSearchParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import { AdwallCard, AdwallConfig } from "@/types/adwall";
import { useEqualCtaMinWidthPx } from "@/hooks/useEqualCtaMinWidthPx";
import AdwallOfferReveal from "@/components/AdwallOfferReveal";
import { resolveActiveRankingConfig, sortAdwallCards } from "@/lib/generic-adwall-ranking";
import { BadgeCheck, Lock, Minus, Plus, ShieldCheck } from "lucide-react";
import { createPortal } from "react-dom";
import {
  buildAdwallTemplateVars,
  interpolateTemplate,
  type AdwallTemplateVars,
} from "@/lib/adwall-template-vars";

interface AdsWallTemplateProps {
  config: AdwallConfig;
  resolvedCity?: string | null;
  updatedAtOverride?: string | null;
  /** Request-time date (ISO) from the route, so server and client render identically. */
  currentDate?: string | null;
  disableImpressions?: boolean;
}

/** Card fields authors can write copy into. Links, scripts and images stay untouched. */
const INTERPOLATED_CARD_FIELDS = [
  "heading",
  "description",
  "buttonText",
  "badgeText",
  "logoText",
  "logoSubtext",
  "advertiserName",
  "trustpilotReviews",
  "bottomBoxHtml",
  "minCreditScore",
  "maxLoanAmount",
  "aprRange",
] as const satisfies readonly (keyof AdwallCard)[];

function interpolateCard(card: AdwallCard, vars: AdwallTemplateVars): AdwallCard {
  const next: AdwallCard = { ...card };

  for (const field of INTERPOLATED_CARD_FIELDS) {
    const value = next[field];
    if (typeof value === "string") {
      next[field] = interpolateTemplate(value, vars);
    }
  }

  if (Array.isArray(next.features)) {
    next.features = next.features.map((feature) =>
      typeof feature === "string" ? interpolateTemplate(feature, vars) : feature
    );
  }

  return next;
}

function cleanParam(value: string | null): string | null {
  const cleaned = value?.replace(/^["']|["']$/g, "").trim();
  return cleaned ? cleaned : null;
}

function hashString(value: string): number {
  let hash = 2166136261;
  for (let i = 0; i < value.length; i++) {
    hash ^= value.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

function createSeededRandom(seed: number) {
  let state = seed || 1;
  return () => {
    state = (Math.imul(state, 1664525) + 1013904223) >>> 0;
    return state / 4294967296;
  };
}

function shuffleNumbers(values: number[], seed: number): number[] {
  const next = [...values];
  const random = createSeededRandom(seed);

  for (let i = next.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [next[i], next[j]] = [next[j]!, next[i]!];
  }

  return next;
}

function getOrderBasedRatingNumbers(count: number, seedKey: string): string[] {
  const decimals = count <= 21 ? 1 : 2;
  const scale = decimals === 1 ? 10 : 100;
  const min = 7.5 * scale;
  const max = 9.9 * scale;
  const pool = Array.from({ length: max - min + 1 }, (_, index) => min + index);

  return shuffleNumbers(pool, hashString(seedKey))
    .slice(0, count)
    .sort((a, b) => b - a)
    .map((value) => (value / scale).toFixed(decimals));
}

function normalizeDisclosureHtml(html: string): string {
  // Some lender configs store the URL in a separate <p> that contains only the link,
  // which makes it look like a "lonely" line. This merges a trailing "at" paragraph
  // with a following link-only paragraph: `<p>... at</p><p><a>url</a></p>` -> `<p>... at <a>url</a></p>`.
  return html.replace(
    /<p>([\s\S]*?\bat\s*)<\/p>\s*<p>\s*(<a\b[^>]*>[\s\S]*?<\/a>)\s*<\/p>/gi,
    "<p>$1$2</p>"
  );
}

const AdsWallTemplate = ({ config, resolvedCity, updatedAtOverride, currentDate, disableImpressions = false }: AdsWallTemplateProps) => {
  const [isDisclosureOpen, setIsDisclosureOpen] = useState(false);
  const [footerSlotEl, setFooterSlotEl] = useState<HTMLElement | null>(null);
  const searchParams = useSearchParams();

  // Extract and clean the IDs from URL parameters based on config
  const affiliateId = useMemo(() => {
    const paramName = config.trackingParams?.affiliateIdParam || "s1";
    // Canonical funnel -> adwall flow uses s1/s2. Fall back to config param for legacy links.
    return (
      cleanParam(searchParams.get("s1")) ??
      cleanParam(searchParams.get(paramName))
    );
  }, [searchParams, config.trackingParams?.affiliateIdParam]);

  const transactionId = useMemo(() => {
    const paramName = config.trackingParams?.transactionIdParam || "s2";
    // Canonical funnel -> adwall flow uses s1/s2. Fall back to config param for legacy links.
    return (
      cleanParam(searchParams.get("s2")) ??
      cleanParam(searchParams.get(paramName))
    );
  }, [searchParams, config.trackingParams?.transactionIdParam]);

  // Extract form data for personalization
  const name = useMemo(() => {
    const n = searchParams.get("name");
    return n?.replace(/^["']|["']$/g, "") || null;
  }, [searchParams]);

  const zip = useMemo(() => {
    const z = searchParams.get("zip");
    return z?.replace(/^["']|["']$/g, "") || null;
  }, [searchParams]);

  const isDynamicHeader = useMemo(() => searchParams.get("fromFunnel") === "1", [searchParams]);
  const offerId = useMemo(() => cleanParam(searchParams.get("oid")), [searchParams]);
  
  // Get s3 value from URL, default to "adwall" since we're on an adwall page
  const s3Value = useMemo(() => cleanParam(searchParams.get("s3")) ?? "adwall", [searchParams]);
  
  // Get sub5 value (mortgage funnel first page selection)
  const sub5Value = useMemo(() => cleanParam(searchParams.get("sub5")), [searchParams]);

  const ctaTrackingParams = useMemo(() => {
    const params: Record<string, string> = {
      sub4: s3Value,
    };
    if (offerId) {
      params.sub3 = offerId;
    }
    if (sub5Value) {
      params.sub5 = sub5Value;
    }
    return params;
  }, [offerId, s3Value, sub5Value]);

  const { monthName, yearNumber } = useMemo(() => {
    const effectiveUpdatedAt = updatedAtOverride ?? config.updatedAt ?? "";
    const match = effectiveUpdatedAt.match(/\b(January|February|March|April|May|June|July|August|September|October|November|December)\b[^0-9]*([0-9]{4})\b/);
    if (match) {
      return { monthName: match[1], yearNumber: match[2] };
    }

    const now = new Date();
    const fallbackMonth = new Intl.DateTimeFormat("en-US", { month: "long" }).format(now);
    const fallbackYear = String(now.getFullYear());
    return { monthName: fallbackMonth, yearNumber: fallbackYear };
  }, [config.updatedAt, updatedAtOverride]);

  // Prepare variables for interpolation. Date tokens prefer the server-provided
  // date so server and client markup match; MONTH/YEAR keep deferring to the
  // updatedAt string when no date is passed in.
  const templateVars = useMemo(() => {
    const parsed = currentDate ? new Date(currentDate) : null;
    const now = parsed && !Number.isNaN(parsed.getTime()) ? parsed : new Date();

    return {
      ...buildAdwallTemplateVars({ name, zip, city: resolvedCity, now }),
      MONTH: monthName,
      YEAR: yearNumber,
    };
  }, [name, zip, resolvedCity, monthName, yearNumber, currentDate]);

  const selectedTitle = isDynamicHeader
    ? (config.dynamicTitle ?? config.title)
    : (config.staticTitle ?? config.title);
  const selectedSubtitle = isDynamicHeader
    ? (config.dynamicSubtitle ?? config.subtitle)
    : (config.staticSubtitle ?? config.subtitle);

  // Interpolate title and subtitle
  const personalizedTitle = useMemo(() => {
    return interpolateTemplate(selectedTitle, templateVars);
  }, [selectedTitle, templateVars]);

  const personalizedSubtitle = useMemo(() => {
    return interpolateTemplate(selectedSubtitle, templateVars);
  }, [selectedSubtitle, templateVars]);

  const rankingParams = useMemo(() => {
    const params: Record<string, string> = {};
    for (const [key, value] of searchParams.entries()) {
      if (key.startsWith("rank") && value) {
        params[key] = cleanParam(value) || value;
      }
    }
    return params;
  }, [searchParams]);

  const activeRankingConfig = useMemo(
    () => resolveActiveRankingConfig(config, rankingParams),
    [config, rankingParams]
  );

  const rankedConfig = useMemo(
    () => (activeRankingConfig ? { ...config, rankingConfig: activeRankingConfig } : config),
    [activeRankingConfig, config]
  );

  const visibleCards = useMemo(() => {
    const cards = config.cards?.filter((item) => !item?.isHidden) ?? [];

    if (Object.keys(rankingParams).length === 0 || !rankedConfig.rankingConfig) {
      return cards;
    }

    return sortAdwallCards(cards, rankedConfig, rankingParams);
  }, [config, rankedConfig, rankingParams]);

  const visibleCardsWithRatings = useMemo(() => {
    if (!activeRankingConfig) return visibleCards;

    const seedKey = [
      config.id,
      ...visibleCards.map((card) => card.advertiserName || card.heading),
    ].join("|");
    const ratingNumbers = getOrderBasedRatingNumbers(visibleCards.length, seedKey);

    return visibleCards.map((card, index) => ({
      ...card,
      ratingsNumber: ratingNumbers[index] ?? card.ratingsNumber,
    }));
  }, [activeRankingConfig, config.id, visibleCards]);

  const personalizedCards = useMemo(
    () => visibleCardsWithRatings.map((card) => interpolateCard(card, templateVars)),
    [visibleCardsWithRatings, templateVars]
  );

  const disclosureCards = useMemo(() => {
    // Only show Optional Footer content (Offer tile Footer / bottomBoxHtml)
    return personalizedCards.filter((item) => item.bottomBoxHtml);
  }, [personalizedCards]);

  useEffect(() => {
    if (!document.documentElement.hasAttribute("data-sw-handoff")) return;

    const timeout = window.setTimeout(() => {
      document.documentElement.removeAttribute("data-sw-handoff");
    }, 500);

    return () => window.clearTimeout(timeout);
  }, []);

  const { containerRef: ctaRef, ctaMinWidthPx } = useEqualCtaMinWidthPx([visibleCards]);
  const containerRef = useCallback((node: HTMLDivElement | null) => {
    ctaRef.current = node;
  }, [ctaRef]);

  return (
    <div
      className="sw-adwall-layer bg-[#FAFAF7] flex min-h-screen w-full flex-col items-start"
    >
      {isDynamicHeader && !disableImpressions && (
        <div className="sw-interstitial-curtain" aria-hidden="true" />
      )}
      {/* Portal lender disclosures into the global footer */}
      {footerSlotEl && disclosureCards.length > 0
        ? createPortal(
            <div className="w-full">
              <div className="rounded-[var(--aw-radius-card)] border border-general-border bg-white overflow-hidden shadow-[var(--shadow-card)]">
                <button
                  onClick={() => setIsDisclosureOpen((v) => !v)}
                  className="w-full h-[39px] flex items-center justify-between px-[14px] text-left focus-visible:ring-0 focus-visible:outline-none focus-visible:shadow-[var(--focus-ring-neutral)]"
                  aria-expanded={isDisclosureOpen}
                >
                  <span className="text-[12px] font-semibold text-aw-muted">Lender Disclosures</span>
                  {isDisclosureOpen ? (
                    <Minus className="w-4 h-4 text-primary-main" aria-hidden="true" />
                  ) : (
                    <Plus className="w-4 h-4 text-primary-main" aria-hidden="true" />
                  )}
                </button>

                {isDisclosureOpen && (
                  <div className="border-t border-general-border divide-y divide-general-border">
                    {disclosureCards.map((item, index) => (
                      <div key={index} className="px-[14px] py-[11px]">
                        <div className="text-[12px] font-semibold text-primary-dark mb-1">
                          {item.advertiserName || item.heading}
                        </div>
                        {item.bottomBoxHtml && (
                          <div
                            className="text-[12px] text-primary-dark leading-relaxed [&_a]:!text-primary-dark [&_a:hover]:!text-primary-dark [&_a:visited]:!text-primary-dark [&_a]:underline [&_a]:underline-offset-2"
                            dangerouslySetInnerHTML={{ __html: normalizeDisclosureHtml(item.bottomBoxHtml) }}
                          />
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>,
            footerSlotEl
          )
        : null}

      {/* Header */}
      <PlainPageHeader
        title={personalizedTitle}
        headingFont="text-[28px] leading-[32px] mb-3 text-center lg:text-[44px] lg:leading-[48px] font-bold text-primary-dark"
        subtitle={personalizedSubtitle}
        subheadingFont="block w-full text-center font-normal text-[16px] leading-[22px] text-aw-muted lg:text-[18px] lg:leading-[28px] lg:max-w-[580px]"
      />

      {/* Mortgage-only trust strip (below header, above cards) */}
      {config.funnelId === "mortgage" && (
        <div className="w-full px-5 sm:px-6 md:px-16">
          <div className="w-full max-w-[var(--container-max)] mx-auto">
            <div className="flex flex-row flex-wrap items-center justify-center gap-x-3 gap-y-1 sm:gap-y-2 py-0 mb-1 sm:mb-4 text-[14px] text-aw-muted">
              <div className="hidden sm:flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-aw-muted" aria-hidden="true" />
                <span className="font-semibold">NMLS-verified lenders</span>
              </div>
              <span className="hidden sm:inline text-aw-border-strong" aria-hidden="true">•</span>
              <div className="hidden sm:flex items-center gap-1.5">
                <BadgeCheck className="w-4 h-4 text-aw-muted" aria-hidden="true" />
                <span className="font-semibold">No impact to your credit</span>
              </div>
              <span className="hidden sm:inline text-aw-border-strong" aria-hidden="true">•</span>
              <div className="flex items-center gap-1.5">
                <Lock className="w-4 h-4 text-aw-muted" aria-hidden="true" />
                <span className="text-[12px] sm:text-[14px] font-semibold">256-bit SSL secured</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Cards */}
      <div className="relative z-0 flex flex-col items-center w-full px-5 sm:px-6 md:px-16 pt-4 sm:pt-0 pb-3 sm:pb-8 md:pb-12">
        <div className="w-full max-w-[1152px]">
          <div ref={containerRef} className="flex flex-col gap-4">
            {personalizedCards.map((item, index) => {
              const { impressionScript, ...cardProps } = item;
              const card = (
                <AdsWallCards
                  {...cardProps}
                  buttonText={cardProps.buttonText || "View My Rates"}
                  affiliateId={affiliateId}
                  transactionId={transactionId}
                  extraTrackingParams={ctaTrackingParams}
                  ctaMinWidthPx={ctaMinWidthPx}
                  eagerLogo={index < 2}
                />
              );

              if (disableImpressions) {
                return <div key={index}>{card}</div>;
              }

              return (
                <AdwallOfferReveal
                  key={index}
                  animate={false}
                  index={index}
                  impressionScript={impressionScript}
                  dedupeKey={`${config.id}:${index}`}
                  debugLabel={item.advertiserName || item.heading}
                >
                  {card}
                </AdwallOfferReveal>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdsWallTemplate;
