"use client";

import AdsWallCards from "@/organisms/AdsWallCards";
import PlainPageHeader from "@/organisms/PlainPageHeader";
import { useSearchParams } from "next/navigation";
import { useMemo } from "react";
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
 * Supports: {NAME}, {zip}, {city}, {month}, {year}
 */
function interpolateTemplate(template: string, variables: Record<string, string>): string {
  let out = template;
  for (const [key, value] of Object.entries(variables)) {
    out = out.replace(new RegExp(`\\{${key}\\}`, "g"), value ?? "");
  }
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
    zip: zip || "",
    city: resolvedCity || zip || "",
    month: monthName,
    year: yearNumber,
  }), [name, zip, resolvedCity, monthName, yearNumber]);

  // Interpolate title and subtitle
  const personalizedTitle = useMemo(() => {
    return interpolateTemplate(config.title, templateVars);
  }, [config.title, templateVars]);

  const personalizedSubtitle = useMemo(() => {
    return interpolateTemplate(config.subtitle, templateVars);
  }, [config.subtitle, templateVars]);

  const { containerRef, ctaMinWidthPx } = useEqualCtaMinWidthPx([config.cards]);

  return (
    <div className="bg-white flex flex-col items-start min-h-screen w-full ">
      {/* Header */}
      <PlainPageHeader
        title={personalizedTitle}
        headingFont="text-3xl text-center lg:text-[48px] font-bold text-primary-main"
        subtitle={personalizedSubtitle}
        updatedAt={updatedAtOverride ?? config.updatedAt}
      />

      {/* Cards */}
      <div className="relative z-0 flex flex-col items-center w-full px-6 sm:px-6 md:px-16 pb-6 sm:pb-8 md:pb-12">
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

      {/* Disclaimers */}
      {config.disclaimers && (
        <div className="text-general-muted-foreground text-xs leading-relaxed space-y-4 max-w-[970px] mx-auto mb-10 px-6 lg:px-0">
          <h3 className="text-base font-semibold mb-4">Full Disclaimers</h3>
          <div
            className="space-y-4"
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
