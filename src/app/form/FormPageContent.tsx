"use client";

import { FormSection } from "@/components/FormSection";
import Image from "next/image";
import { useState } from "react";
import type { FormConfig } from "@/types/form";
import { Typography } from "@/components/ui/typography";
import { Clock, Lock, Monitor, ShieldCheck } from "lucide-react";
import { FunnelPostContent } from "@/components/FunnelPostContent";
import AdsWallTemplate from "@/templates/AdsWallTemplate";
import type { AdwallConfig } from "@/types/adwall";

const INFO_BAR_ICONS = {
  monitor: Monitor,
  lock: Lock,
  clock: Clock,
  shield: ShieldCheck,
} as const;

function FunnelFormPanel({
  formConfig,
  funnelId,
  onStepChange,
}: {
  formConfig: FormConfig;
  funnelId: string;
  onStepChange?: (stepIndex: number) => void;
}) {
  return (
    <div className="flex flex-col items-center justify-center w-full">
      <div className="flex flex-col gap-5 items-start w-full max-w-[890px]">
        <FormSection
          config={formConfig}
          funnelId={funnelId || formConfig.id}
          onStepChange={onStepChange}
        />
      </div>
    </div>
  );
}

function ModalFunnelPageContent({
  formConfig,
  funnelId,
  modalAdwallConfig,
}: {
  formConfig: FormConfig;
  funnelId: string;
  modalAdwallConfig: AdwallConfig;
}) {
  return (
    <div className="relative min-h-[90vh] w-full overflow-hidden bg-white">
      <div className="absolute inset-0 pointer-events-none select-none" aria-hidden="true">
        <div className="min-h-screen scale-[1.02] opacity-75 blur-sm">
          <AdsWallTemplate config={modalAdwallConfig} disableImpressions />
        </div>
        <div className="absolute inset-0 bg-white/55" />
      </div>

      <div className="relative z-10 flex min-h-[90vh] w-full items-start justify-center px-3 py-6 md:px-6 md:py-10">
        <div
          role="dialog"
          aria-modal="true"
          aria-label={formConfig.title}
          className="w-full max-w-[940px] rounded-3xl border border-general-border bg-sg-canvas px-3 py-5 shadow-2xl md:px-6 md:py-8"
        >
          <FunnelFormPanel formConfig={formConfig} funnelId={funnelId} />
        </div>
      </div>
    </div>
  );
}

export function FormPageContent({
  formConfig,
  funnelId,
  modalAdwallConfig,
}: {
  formConfig: FormConfig;
  funnelId: string;
  modalAdwallConfig?: AdwallConfig | null;
}) {
  const [currentStep, setCurrentStep] = useState(0);
  const shouldShowSupplementalContent = formConfig.id !== "autoins" || currentStep === 0;

  if (modalAdwallConfig) {
    return (
      <ModalFunnelPageContent
        formConfig={formConfig}
        funnelId={funnelId}
        modalAdwallConfig={modalAdwallConfig}
      />
    );
  }

  return (
    <div className="flex flex-col items-start w-full bg-sg-canvas min-h-[90vh] pt-2">
      {/* Main Container - Contains form, separator, and logos */}
      <div className="flex flex-col items-start w-full pb-9 px-3 md:px-6 pt-3 md:pt-5 justify-between">
        <div className=" flex flex-col w-full flex-1 justify-between ">
          {/* Form Section */}
          <FunnelFormPanel
            formConfig={formConfig}
            funnelId={funnelId}
            onStepChange={setCurrentStep}
          />

        </div>
      </div>

      {shouldShowSupplementalContent ? (
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
                        <Icon className="h-[22px] w-[22px] text-sg-primary" aria-hidden />
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
      ) : null}
    </div>
  );
}

