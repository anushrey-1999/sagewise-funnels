"use client";

import { FormSection } from "@/components/FormSection";
import Image from "next/image";
import { useEffect, useState } from "react";
import type { FormConfig } from "@/types/form";
import { Typography } from "@/components/ui/typography";
import { Clock, Lock, Monitor, ShieldCheck } from "lucide-react";
import { FunnelPostContent } from "@/components/FunnelPostContent";
import AdsWallTemplate from "@/templates/AdsWallTemplate";
import type { AdwallConfig } from "@/types/adwall";
import { Navbar } from "@/components/Navbar";
import { createPortal } from "react-dom";

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
  const [portalTarget, setPortalTarget] = useState<HTMLElement | null>(null);

  useEffect(() => {
    setPortalTarget(document.body);
  }, []);

  useEffect(() => {
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prevOverflow;
    };
  }, []);

  return (
    <>
      {/* Backdrop content lives in normal page flow (underlay) */}
      <div className="min-h-[90vh] w-full bg-white">
        <AdsWallTemplate config={modalAdwallConfig} disableImpressions />
      </div>

      {/* True modal overlay lives above the entire page (incl. global navbar/footer) */}
      {portalTarget
        ? createPortal(
            <div className="fixed inset-0 z-[100]">
              <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />

              <div className="absolute inset-0 overflow-y-auto">
                <div className="min-h-screen w-full px-3 py-6 md:px-6 md:py-10 flex items-center justify-center">
                  <div
                    role="dialog"
                    aria-modal="true"
                    aria-label={formConfig.title}
                    className="w-full max-w-[680px] overflow-hidden rounded-[var(--radius-panel)] shadow-[var(--shadow-panel)]"
                  >
                    <Navbar scope="modal" />
                    <div className="px-3 py-5 md:px-6 md:py-8 bg-aw-page-bg">
                      <FunnelFormPanel formConfig={formConfig} funnelId={funnelId} />
                    </div>
                  </div>
                </div>
              </div>
            </div>,
            portalTarget
          )
        : null}
    </>
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
    <div className="flex flex-col items-start w-full bg-aw-page-bg min-h-[90vh] pt-2">
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
                      className="flex items-center gap-2 text-aw-muted text-sm font-medium"
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
                      <span className="text-aw-muted text-base font-medium">{item.text}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : null}

          {/* Provider Logos Section - Before Footer (funnels only; configured per funnel JSON) */}
          {formConfig.providerLogos?.logos?.length ? (
            <div className="w-full bg-surface-metric-panel">
              <div className="w-full mx-auto flex flex-col gap-6 items-center px-6 md:px-0 py-7">
                <Typography
                  variant="h3"
                  color="text-aw-text"
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

