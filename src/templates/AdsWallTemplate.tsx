"use client";

import AdsWallCards from "@/organisms/AdsWallCards";
import PlainPageHeader from "@/organisms/PlainPageHeader";
import { useSearchParams } from "next/navigation";
import { useMemo } from "react";
import { AdwallConfig } from "@/types/adwall";

interface AdsWallTemplateProps {
  config: AdwallConfig;
}

/**
 * Interpolate variables in text template
 * Supports: {NAME}, {zip}
 */
function interpolateTemplate(template: string, variables: Record<string, string>): string {
  return template
    .replace(/\{NAME\}/g, variables.NAME || "")
    .replace(/\{zip\}/g, variables.zip || "");
}

function stripHtml(input: string): string {
  return input.replace(/<[^>]*>/g, "");
}

const AdsWallTemplate = ({ config }: AdsWallTemplateProps) => {
  const searchParams = useSearchParams();

  // Extract and clean the IDs from URL parameters based on config
  const affiliateId = useMemo(() => {
    const paramName = config.trackingParams?.affiliateIdParam || "s1";
    const id = searchParams.get(paramName);
    return id?.replace(/^["']|["']$/g, "") || null;
  }, [searchParams, config.trackingParams?.affiliateIdParam]);

  const transactionId = useMemo(() => {
    const paramName = config.trackingParams?.transactionIdParam || "s2";
    const id = searchParams.get(paramName);
    return id?.replace(/^["']|["']$/g, "") || null;
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

  // Prepare variables for interpolation
  const templateVars = useMemo(() => ({
    NAME: name || "",
    zip: zip || "",
  }), [name, zip]);

  // Interpolate title and subtitle
  const personalizedTitle = useMemo(() => {
    return interpolateTemplate(config.title, templateVars);
  }, [config.title, templateVars]);

  const personalizedSubtitle = useMemo(() => {
    return interpolateTemplate(config.subtitle, templateVars);
  }, [config.subtitle, templateVars]);

  // Make all CTA buttons the same width (based on the largest label on the page)
  const ctaMinWidthCh = useMemo(() => {
    const lengths = (config.cards || []).map((c) => stripHtml(c.buttonText || "").trim().length);
    const maxLen = lengths.length ? Math.max(...lengths) : 0;
    // Add a little buffer for padding/icon. Clamp to avoid extreme widths.
    return Math.min(32, Math.max(14, maxLen + 6));
  }, [config.cards]);

  return (
    <div className="bg-white flex flex-col items-start min-h-screen w-full ">
      {/* Header */}
      <PlainPageHeader
        title={personalizedTitle}
        headingFont="text-3xl text-center lg:text-[48px] font-bold text-primary-main"
        subtitle={personalizedSubtitle}
        updatedAt={config.updatedAt}
      />

      {/* Cards */}
      <div className="flex flex-col items-center w-full px-6 sm:px-6 md:px-16 pb-6 sm:pb-8 md:pb-12">
        <div className="w-full max-w-[970px] ">
          <div className="flex flex-col gap-4">
            {config.cards?.map((item, index) => (
              <AdsWallCards
                key={index}
                {...item}
                affiliateId={affiliateId}
                transactionId={transactionId}
                ctaMinWidthCh={ctaMinWidthCh}
              />
            ))}
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
