"use client";

import AdsWallCards from "@/organisms/AdsWallCards";
import PlainPageHeader from "@/organisms/PlainPageHeader";
import { useSearchParams } from "next/navigation";
import { useCallback, useMemo } from "react";
import { AdwallConfig } from "@/types/adwall";
import { useEqualCtaMinWidthPx } from "@/hooks/useEqualCtaMinWidthPx";
import ImpressionOnView from "@/components/ImpressionOnView";

interface AdsWallTemplateProps {
  config: AdwallConfig;
  resolvedCity?: string | null;
  updatedAtOverride?: string | null;
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

const AdsWallTemplate = ({ config, resolvedCity, updatedAtOverride }: AdsWallTemplateProps) => {
  const searchParams = useSearchParams();

  const cleanParam = (value: string | null): string | null => {
    const cleaned = value?.replace(/^["']|["']$/g, "").trim();
    return cleaned ? cleaned : null;
  };

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
    // Canonical funnel -> adwall flow uses s1/s2. Fall back to config param (e.g. sub5) for legacy links.
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

  const { containerRef: ctaRef, ctaMinWidthPx } = useEqualCtaMinWidthPx([config.cards]);
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
            {config.cards?.filter((item) => !item?.isHidden).map((item, index) => {
              const { impressionScript, ...cardProps } = item;
              return (
                <ImpressionOnView
                  key={index}
                  impressionScript={impressionScript}
                  dedupeKey={`${config.id}:${index}`}
                  debugLabel={item.advertiserName || item.heading}
                >
                  <AdsWallCards
                    {...cardProps}
                    buttonText={cardProps.buttonText || "View My Rates"}
                    affiliateId={affiliateId}
                    transactionId={transactionId}
                    extraTrackingParams={config.trackingParams?.sub3 ? { sub3: config.trackingParams.sub3 } : undefined}
                    ctaMinWidthPx={ctaMinWidthPx}
                  />
                </ImpressionOnView>
              );
            })}
          </div>
        </div>
      </div>

      {/* Mobile-only: card-level disclosures in page footer */}
      {config.cards?.some((item) => !item?.isHidden && item.bottomBoxHtml) && (
        <div className="lg:hidden w-full max-w-[970px] mx-auto px-2 sm:px-6 mb-6 flex flex-col gap-3">
          {config.cards
            .filter((item) => !item?.isHidden && item.bottomBoxHtml)
            .map((item, index) => (
              <div key={index} className="rounded-lg border border-general-border bg-white px-4 py-3 text-[10px] leading-relaxed text-[#9CA3AF] [&_a]:text-primary-main [&_a]:underline [&_a]:underline-offset-2">
                <span dangerouslySetInnerHTML={{ __html: item.bottomBoxHtml! }} />
              </div>
            ))}
        </div>
      )}

      {/* Disclaimers */}
      {config.disclaimers && (
        <div className="w-full text-general-muted-foreground text-xs leading-relaxed space-y-4 max-w-[970px] mx-auto mb-10 px-6 lg:px-0 text-left">
          <h3 className="text-base font-semibold mb-4">Full Disclaimers</h3>
          <div
            className="space-y-4 text-left"
            dangerouslySetInnerHTML={{
              __html: config.disclaimers,
            }}
          />
        </div>
      )}
    </div>
  );
};

export default AdsWallTemplate;
