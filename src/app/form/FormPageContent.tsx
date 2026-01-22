"use client";

import { FormSection } from "@/components/FormSection";
import { Separator } from "@/components/ui/separator";
import Image from "next/image";
import { useSearchParams } from "next/navigation";
import { getFunnelConfig } from "@/lib/funnel-loader";
import { Typography } from "@/components/ui/typography";
import { Clock, Lock, Monitor, ShieldCheck } from "lucide-react";
import { FunnelPostContent } from "@/components/FunnelPostContent";

const INFO_BAR_ICONS = {
  monitor: Monitor,
  lock: Lock,
  clock: Clock,
  shield: ShieldCheck,
} as const;

export function FormPageContent() {
  const searchParams = useSearchParams();
  const funnelId = searchParams.get("funnel");

  // Load the appropriate funnel config
  const formConfig = getFunnelConfig(funnelId);

  // If funnel config not found, show error
  if (!formConfig) {
    return (
      <div className="bg-[#F8F8F8] flex flex-col items-center justify-center min-h-screen w-full px-4">
        <div className="text-center max-w-md">
          <h1 className="text-2xl font-semibold mb-4">Funnel Not Found</h1>
          <p className="text-muted-foreground mb-6">
            The funnel you're looking for doesn't exist. Please check the URL
            and try again.
          </p>
          <a href="/" className="text-[#204c4b] hover:underline">
            Return to Homepage
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-start w-full bg-[#F8F8F8] min-h-[90vh] pt-5">
      {/* Main Container with 64px padding - Contains form, separator, and logos */}
      <div className="flex flex-col items-start w-full pb-9 px-6 pt-6 md:pt-10 justify-between">
        <div className=" flex flex-col w-full flex-1 justify-between ">
          {/* Form Section */}
          <div className="flex flex-col  items-center justify-center w-full">
            <div className="flex flex-col gap-8 items-start w-full max-w-[890px]">
              <FormSection
                config={formConfig}
                funnelId={funnelId || formConfig.id}
              />
            </div>
          </div>

        </div>
      </div>

      <div className="w-full">
        {/* Post-form info bar (funnels only; configured per funnel JSON) */}
        {formConfig.postFormInfoBar?.items?.length ? (
          <div className="hidden sm:block w-full mt-3">
            <div className="w-full max-w-[890px] mx-auto px-6 md:px-0 pb-6 flex flex-wrap items-center justify-center gap-x-12">
              {formConfig.postFormInfoBar.items.slice(0, 3).map((item, idx) => {
                const iconKey = item.icon?.toLowerCase?.() as keyof typeof INFO_BAR_ICONS;
                const Icon = INFO_BAR_ICONS[iconKey];
                const isImage = typeof item.icon === "string" && item.icon.startsWith("/");

                return (
                  <div
                    key={`${item.text}-${idx}`}
                    className="flex items-center gap-2 text-[#6b7c7c] text-sm font-medium"
                  >
                    {isImage ? (
                      <Image
                        src={item.icon}
                        alt=""
                        width={18}
                        height={18}
                        className="h-[22px] w-[22px] object-contain"
                      />
                    ) : Icon ? (
                      <Icon className="h-[22px] w-[22px] text-green-600" aria-hidden />
                    ) : null}
                    <span className="text-general-muted-foreground text-base font-medium">{item.text}</span>
                  </div>
                );
              })}
            </div>
          </div>
        ) : null}


        {/* Provider Logos Section - Before Footer (funnels only; configured per funnel JSON) */}
        {formConfig.providerLogos?.logos?.length ? (
          <div className="w-full bg-[#F5F5F5]">
            <div className="w-full mx-auto flex flex-col gap-6 items-center px-6 md:px-0 py-7">
              <Typography
                variant="h3"
                color="text-general-foreground"
                className="font-semibold text-center"
              >
                {formConfig.providerLogos.heading ||
                  "Discover quotes from 12 providers, including:"}
              </Typography>

              <div className="hidden sm:flex gap-6 sm:gap-7 md:gap-8 items-center flex-wrap justify-center">
                {formConfig.providerLogos.logos.map((logo, index) => (
                  <div
                    key={`${logo.alt}-${index}`}
                    className="relative h-[34px] flex items-center justify-center"
                    style={{
                      width: logo.width + "px",
                    }}
                  >
                    <Image
                      src={logo.src}
                      alt={logo.alt}
                      width={logo.width}
                      height={logo.height}
                      className="h-full w-auto object-contain"
                    />
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-3 gap-4 items-center justify-items-center w-full sm:hidden">
                {formConfig.providerLogos.logos.map((logo, index) => (
                  <div
                    key={`${logo.alt}-${index}`}
                    className="h-[24px] relative flex items-center justify-center w-full"
                  >
                    <Image
                      src={logo.src}
                      alt={logo.alt}
                      width={logo.width}
                      height={logo.height}
                      className="h-full w-auto object-contain max-w-full"
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : null}

        {/* Below-logos image section (funnels only; configured per funnel JSON) */}
        {formConfig.belowLogosImage?.src ? (
          <div className="hidden sm:block w-full py-6">
            <div className="w-full max-w-[890px] mx-auto px-6 md:px-0 flex justify-center">
              <Image
                src={formConfig.belowLogosImage.src}
                alt={formConfig.belowLogosImage.alt || ""}
                width={formConfig.belowLogosImage.width}
                height={formConfig.belowLogosImage.height}
                className="h-auto w-auto max-w-full object-contain"
              />
            </div>
          </div>
        ) : null}

        {/* Post content sections (optional; configured per funnel JSON) */}
        <FunnelPostContent postContent={formConfig.postContent} />
      </div>
    </div>
  );
}

