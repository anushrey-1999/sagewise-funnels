"use client";

import AdsWallCards from "@/organisms/AdsWallCards";
import PlainPageHeader from "@/organisms/PlainPageHeader";
import { useSearchParams } from "next/navigation";
import { useCallback, useMemo, useState } from "react";
import { AdwallConfig } from "@/types/adwall";
import { useEqualCtaMinWidthPx } from "@/hooks/useEqualCtaMinWidthPx";
import ImpressionOnView from "@/components/ImpressionOnView";
import { sortAdwallCards } from "@/lib/generic-adwall-ranking";
import { Minus, Plus } from "lucide-react";

interface AdsWallTemplateProps {
  config: AdwallConfig;
  resolvedCity?: string | null;
  updatedAtOverride?: string | null;
  disableImpressions?: boolean;
}

/**
 * Interpolate variables in text template
 * Supports: {NAME}, {ZIP}, {CITY}, {MONTH}, {YEAR}
 * Legacy lowercase variables remain supported for older configs.
 */
function interpolateTemplate(template: string, variables: Record<string, string>): string {
  let out = template;
  for (const [key, value] of Object.entries(variables)) {
    out = out.replace(new RegExp(`\\{${key}\\}`, "g"), value ?? "");
  }
  out = out
    .replace(/\{zip\}/g, variables.ZIP ?? "")
    .replace(/\{city\}/g, variables.CITY ?? "")
    .replace(/\{month\}/g, variables.MONTH ?? "")
    .replace(/\{year\}/g, variables.YEAR ?? "");
  return out;
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

const AdsWallTemplate = ({ config, resolvedCity, updatedAtOverride, disableImpressions = false }: AdsWallTemplateProps) => {
  const [isDisclosureOpen, setIsDisclosureOpen] = useState(true);
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

  // Prepare variables for interpolation
  const templateVars = useMemo(() => ({
    NAME: name || "",
    ZIP: zip || "your city",
    CITY: resolvedCity || "your city",
    MONTH: monthName,
    YEAR: yearNumber,
  }), [name, zip, resolvedCity, monthName, yearNumber]);

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

  const visibleCards = useMemo(() => {
    const cards = config.cards?.filter((item) => !item?.isHidden) ?? [];
    
    // Extract ranking params from URL (any param starting with "rank")
    const rankingParams: Record<string, string> = {};
    for (const [key, value] of searchParams.entries()) {
      if (key.startsWith("rank") && value) {
        rankingParams[key] = cleanParam(value) || value;
      }
    }

    // If no ranking params or no ranking config, return cards as-is
    if (Object.keys(rankingParams).length === 0 || !config.rankingConfig) {
      return cards;
    }

    return sortAdwallCards(cards, config, rankingParams);
  }, [config, searchParams]);

  const visibleCardsWithRatings = useMemo(() => {
    if (!config.rankingConfig) return visibleCards;

    const seedKey = [
      config.id,
      ...visibleCards.map((card) => card.advertiserName || card.heading),
    ].join("|");
    const ratingNumbers = getOrderBasedRatingNumbers(visibleCards.length, seedKey);

    return visibleCards.map((card, index) => ({
      ...card,
      ratingsNumber: ratingNumbers[index] ?? card.ratingsNumber,
    }));
  }, [config.id, config.rankingConfig, visibleCards]);

  const disclosureCards = useMemo(() => {
    return visibleCardsWithRatings.filter((item) => item.bottomBoxHtml || item.logoText);
  }, [visibleCardsWithRatings]);

  const { containerRef: ctaRef, ctaMinWidthPx } = useEqualCtaMinWidthPx([visibleCards]);
  const containerRef = useCallback((node: HTMLDivElement | null) => {
    ctaRef.current = node;
  }, [ctaRef]);

  return (
    <div className="bg-white flex flex-col items-start min-h-screen w-full ">
      {/* Header */}
      <PlainPageHeader
        title={personalizedTitle}
        headingFont="text-[24px] text-center lg:text-[48px] font-bold text-primary-main"
        subtitle={personalizedSubtitle}
        updatedAt={updatedAtOverride ?? config.updatedAt}
      />

      {/* Cards */}
      <div className="relative z-0 flex flex-col items-center w-full px-2 sm:px-6 md:px-16 pb-6 sm:pb-8 md:pb-12">
        <div className="w-full max-w-[970px] ">
          <div ref={containerRef} className="flex flex-col gap-4">
            {visibleCardsWithRatings.map((item, index) => {
              const { impressionScript, ...cardProps } = item;
              const card = (
                <AdsWallCards
                  {...cardProps}
                  buttonText={cardProps.buttonText || "View My Rates"}
                  affiliateId={affiliateId}
                  transactionId={transactionId}
                  extraTrackingParams={ctaTrackingParams}
                  ctaMinWidthPx={ctaMinWidthPx}
                />
              );

              if (disableImpressions) {
                return <div key={index}>{card}</div>;
              }

              return (
                <ImpressionOnView
                  key={index}
                  impressionScript={impressionScript}
                  dedupeKey={`${config.id}:${index}`}
                  debugLabel={item.advertiserName || item.heading}
                >
                  {card}
                </ImpressionOnView>
              );
            })}
          </div>
        </div>
      </div>

      {/* Lender Disclosures (footer-style panel like design) */}
      {(disclosureCards.length > 0 || config.disclaimers) && (
        <div className="w-full px-2 sm:px-6 md:px-16 mb-8">
          <div className="w-full max-w-[970px] mx-auto">
            <div className="rounded-lg border border-general-border bg-white overflow-hidden">
              <button
                onClick={() => setIsDisclosureOpen((v) => !v)}
                className="w-full flex items-center justify-between px-4 py-3 text-left"
                aria-expanded={isDisclosureOpen}
              >
                <span className="text-[13px] font-semibold text-[#374151]">Lender Disclosures</span>
                {isDisclosureOpen ? (
                  <Minus className="w-4 h-4 text-[#6B7280]" aria-hidden="true" />
                ) : (
                  <Plus className="w-4 h-4 text-[#6B7280]" aria-hidden="true" />
                )}
              </button>

              {isDisclosureOpen && (
                <div className="border-t border-general-border divide-y divide-general-border">
                  {disclosureCards.map((item, index) => (
                      <div key={index} className="px-4 py-3">
                        {item.heading && (
                          <div className="text-[12px] font-semibold text-[#111827] mb-1">
                            {item.heading}
                          </div>
                        )}
                        {item.logoText && (
                          <div className="text-[11px] text-[#6B7280] leading-relaxed">
                            {item.logoText}
                          </div>
                        )}
                        {item.bottomBoxHtml && (
                          <div
                            className="text-[11px] text-[#6B7280] leading-relaxed [&_a]:text-primary-main [&_a]:underline [&_a]:underline-offset-2"
                            dangerouslySetInnerHTML={{ __html: normalizeDisclosureHtml(item.bottomBoxHtml) }}
                          />
                        )}
                      </div>
                    ))}

                  {config.disclaimers && (
                    <div
                      className="px-4 py-3 text-[11px] text-[#6B7280] leading-relaxed [&_a]:text-primary-main [&_a]:underline [&_a]:underline-offset-2 space-y-3"
                      dangerouslySetInnerHTML={{ __html: normalizeDisclosureHtml(config.disclaimers) }}
                    />
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdsWallTemplate;
