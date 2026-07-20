import { Button } from "@/components/ui/button";
import { ChevronDown, MoveRight, Phone, X } from "lucide-react";
import Image from "next/image";
import { cn } from "@/lib/utils";
import React, { useEffect, useMemo, useRef, useState } from "react";

function toTelHref(phone: string): string {
  const digits = phone.replace(/[^\d+]/g, "");
  if (digits.startsWith("+")) return `tel:${digits}`;
  const onlyDigits = phone.replace(/[^\d]/g, "");
  if (onlyDigits.length === 11 && onlyDigits.startsWith("1")) return `tel:+${onlyDigits}`;
  return `tel:${onlyDigits}`;
}

function ScoreStar({ filled }: { filled: boolean }) {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      className={cn("h-[14px] w-[14px]", filled ? "text-[#F59E0B]" : "text-[#F59E0B]/45")}
      fill={filled ? "currentColor" : "none"}
      stroke="currentColor"
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M12 2.75l2.85 5.78 6.38.93-4.61 4.49 1.09 6.35L12 17.3l-5.71 3 1.09-6.35-4.61-4.49 6.38-.93L12 2.75z" />
    </svg>
  );
}

interface AdsWallCardsProps {
  ratings?: number;
  cardBg?: string;
  isGradientBorder?: boolean;
  isBadge?: boolean;
  isSecondaryBtn?: boolean;
  isGradientBox?: boolean;
  badgeIcon?: React.ReactNode;
  badgeText?: React.ReactNode;
  heading: string;
  description: string;
  features: string[];
  buttonLink: string;
  buttonText: string;
  ratingsNumber: string;
  ratingsCount: number;
  logo: string;
  creditCardImage: string;
  logoWidth: string;
  logoHeight: string;
  logoText?: string;
  logoSubtext?: string;
  advertiserName: string;
  affiliateId?: string | null;
  transactionId?: string | null;
  phoneNumber?: string;
  extraTrackingParams?: Record<string, string>;
  ctaMinWidthPx?: number;
  trustpilotReviews?: string;
  minCreditScore?: string;
  maxLoanAmount?: string;
  aprRange?: string;
  bottomBoxHtml?: string;
}

const AdsWallCards = ({
  badgeIcon,
  badgeText,
  heading,
  description,
  features,
  buttonLink,
  buttonText,
  ratingsNumber,
  creditCardImage,
  ratingsCount,
  logo,
  logoWidth,
  logoHeight,
  logoText,
  logoSubtext,
  affiliateId,
  transactionId,
  phoneNumber,
  extraTrackingParams,
  trustpilotReviews,
  bottomBoxHtml,
}: AdsWallCardsProps) => {
  const [isScoreModalOpen, setIsScoreModalOpen] = useState(false);
  const [isHowWeScoreOpen, setIsHowWeScoreOpen] = useState(false);
  const [scorePopoverStyle, setScorePopoverStyle] = useState<React.CSSProperties>({});
  const scoreTriggerRef = useRef<HTMLButtonElement>(null);
  const scorePopoverRef = useRef<HTMLDivElement>(null);
  const affiliateParamName = "sub2";
  const transactionParamName = "sub1";
  const mobileLogoWidthPx = 100;
  const desktopLogoWidthPx = 140;

  const displayReviews = trustpilotReviews?.trim() || null;
  const fullStars = Math.max(0, Math.min(5, Number.isFinite(ratingsCount) ? ratingsCount : 5));
  const scoreBreakdown = useMemo(() => {
    const parsed = Number.parseFloat(ratingsNumber);
    const safeBase = Number.isFinite(parsed) ? parsed : 9.9;

    // Match the precision shown in the outer score (usually 1 decimal).
    const decimalsRaw = ratingsNumber.includes(".") ? ratingsNumber.split(".")[1]?.length ?? 1 : 0;
    const decimals = Math.max(0, Math.min(2, decimalsRaw));
    const step = decimals === 0 ? 1 : Math.pow(10, -decimals);

    const clamp10 = (v: number) => Math.max(0, Math.min(10, v));
    const roundTo = (v: number) => {
      const factor = Math.pow(10, decimals);
      return Math.round(v * factor) / factor;
    };

    // Ensure the displayed outer score is the true target for averaging.
    const target = roundTo(clamp10(safeBase));

    // Keep the breakdown values very close to the target, while keeping the average == target.
    // Default offsets: [+step, 0, 0, -step] => average == target.
    // If we're at edges (near 0/10) and can't move by `step`, fall back to all == target.
    const maxDelta = Math.min(step, 10 - target, target);
    const deltaSteps = Math.floor(maxDelta / step);
    const delta = deltaSteps > 0 ? deltaSteps * step : 0;

    const values = [
      roundTo(clamp10(target + delta)),
      roundTo(clamp10(target)),
      roundTo(clamp10(target)),
      roundTo(clamp10(target - delta)),
    ];

    const fmt = (v: number) => v.toFixed(decimals);

    return [
      { label: "Reputation", value: fmt(values[0]!) },
      { label: "Customer Reviews", value: fmt(values[1]!) },
      { label: "Funding Speed", value: fmt(values[2]!) },
      { label: "Rate Competitiveness", value: fmt(values[3]!) },
    ];
  }, [ratingsNumber]);

  useEffect(() => {
    if (!isScoreModalOpen && !isHowWeScoreOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      if (isHowWeScoreOpen) setIsHowWeScoreOpen(false);
      else setIsScoreModalOpen(false);
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [isHowWeScoreOpen, isScoreModalOpen]);

  const positionScorePopover = () => {
    const trigger = scoreTriggerRef.current;
    if (!trigger) return;

    const rect = trigger.getBoundingClientRect();
    const gutter = 8;

    // Desktop-ish: 360px wide popover; Mobile: fit to viewport
    const preferredWidth = 360;
    const width = Math.min(preferredWidth, window.innerWidth - gutter * 2);

    let left = rect.left + rect.width / 2 - width / 2;
    left = Math.max(gutter, Math.min(left, window.innerWidth - width - gutter));

    const top = rect.bottom + 8;

    setScorePopoverStyle({
      position: "fixed",
      top,
      left,
      width,
    });
  };

  useEffect(() => {
    if (!isScoreModalOpen) return;
    positionScorePopover();

    const onScrollOrResize = () => positionScorePopover();
    window.addEventListener("resize", onScrollOrResize);
    window.addEventListener("scroll", onScrollOrResize, true);

    const onPointerDown = (e: MouseEvent | TouchEvent) => {
      const target = e.target as Node;
      if (scoreTriggerRef.current?.contains(target)) return;
      if (scorePopoverRef.current?.contains(target)) return;
      setIsScoreModalOpen(false);
    };
    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("touchstart", onPointerDown);

    return () => {
      window.removeEventListener("resize", onScrollOrResize);
      window.removeEventListener("scroll", onScrollOrResize, true);
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("touchstart", onPointerDown);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isScoreModalOpen]);
  const parsedLogoWidth = Number.parseFloat(logoWidth);
  const parsedLogoHeight = Number.parseFloat(logoHeight);
  const getScaledLogoHeight = (targetWidth: number) =>
    Number.isFinite(parsedLogoWidth) && parsedLogoWidth > 0 && Number.isFinite(parsedLogoHeight) && parsedLogoHeight > 0
      ? Math.round(targetWidth * (parsedLogoHeight / parsedLogoWidth))
      : 48;
  const mobileLogoHeightPx = getScaledLogoHeight(mobileLogoWidthPx);
  const desktopLogoHeightPx = getScaledLogoHeight(desktopLogoWidthPx);

  const hasBadgeText =
    typeof badgeText === "string" ? badgeText.trim().length > 0 : Boolean(badgeText);

  const handleButtonClick = () => {
    try {
      const url = new URL(buttonLink);
      if (affiliateId) url.searchParams.set(affiliateParamName, affiliateId);
      if (transactionId) url.searchParams.set(transactionParamName, transactionId);
      if (extraTrackingParams) {
        Object.entries(extraTrackingParams).forEach(([key, value]) => {
          url.searchParams.set(key, value);
        });
      }
      window.open(url.toString(), "_blank");
    } catch {
      const separator = buttonLink.includes("?") ? "&" : "?";
      const params: string[] = [];
      if (affiliateId) params.push(`${affiliateParamName}=${encodeURIComponent(affiliateId)}`);
      if (transactionId) params.push(`${transactionParamName}=${encodeURIComponent(transactionId)}`);
      if (extraTrackingParams) {
        Object.entries(extraTrackingParams).forEach(([key, value]) => {
          params.push(`${key}=${encodeURIComponent(value)}`);
        });
      }
      const finalUrl = params.length > 0 ? `${buttonLink}${separator}${params.join("&")}` : buttonLink;
      window.open(finalUrl, "_blank");
    }
  };

  return (
    <div className="relative w-full">
      <div
        className={cn(
          "border-[1.5px] lg:border-2 relative rounded-xl w-full flex flex-col overflow-hidden bg-white gap-2 lg:gap-3 border-gray-200 transition-shadow duration-200 hover:shadow-md"
        )}
      >
        {/* ── Badge (top-left on all breakpoints) ── */}
        <div className="flex items-center self-start">
          {hasBadgeText ? (
            <div
              className={cn(
                "text-[10px] font-bold px-[10px] py-[4px] bg-primary-main flex items-center gap-1.5 uppercase text-white whitespace-nowrap tracking-wide rounded-br-xl"
              )}
            >
              {(badgeIcon ?? "card") ? (
                <div className="w-2.5 h-2.5 lg:w-3 lg:h-3 relative shrink-0">
                  <Image src={`/icons/${badgeIcon ?? "card"}.svg`} alt="" fill className="object-contain" />
                </div>
              ) : null}
              {badgeText}
            </div>
          ) : null}
        </div>

        {/* ── Mobile logo (below badge, own row) ── */}
        <div className="lg:hidden px-[14px] pt-2 pb-2">
          {logo ? (
            <div className="flex flex-col items-start">
              <div
                className="relative overflow-hidden rounded-lg"
                style={{ width: mobileLogoWidthPx, height: mobileLogoHeightPx }}
              >
                <Image src={logo} alt={heading} fill className="object-contain" />
              </div>
              {logoText && (
                <p className="text-[10px] text-general-muted-foreground mt-1">{logoText}</p>
              )}
            </div>
          ) : creditCardImage ? (
            <div className="w-[180px] h-[120px] relative overflow-hidden rounded-lg">
              <Image src={creditCardImage} alt={heading} fill className="object-cover" />
            </div>
          ) : null}
        </div>

        {/* ── Main Content ── */}
        <div className="flex flex-col lg:flex-row items-start lg:items-center gap-4 lg:gap-8 px-[14px] py-[12px]">

          {/* Desktop-only Logo */}
          <div className="hidden lg:flex shrink-0 self-center flex-col items-center justify-center gap-1">
            {logo ? (
              <div className="flex flex-col items-center">
                <div
                  className="relative overflow-hidden rounded-lg flex items-center justify-center"
                  style={{ width: desktopLogoWidthPx, height: desktopLogoHeightPx }}
                >
                  <Image src={logo} alt={heading} fill className="object-contain" />
                </div>
                {logoText && (
                  <p className="text-[10px] text-general-muted-foreground text-center mt-1">{logoText}</p>
                )}
                {logoSubtext && (
                  <p className="text-[10px] text-general-muted-foreground text-center mt-0.5">{logoSubtext}</p>
                )}
              </div>
            ) : creditCardImage ? (
              <div className="w-[200px] h-[130px] relative overflow-hidden rounded-lg">
                <Image src={creditCardImage} alt={heading} fill className="object-cover" />
              </div>
            ) : (
              <div className="w-[200px] h-[69px] rounded-lg bg-white border border-general-border flex items-center justify-center text-xs text-general-muted-foreground">
                Add a logo
              </div>
            )}
          </div>

          {/* Description + Features */}
          <div className="flex flex-col gap-2 lg:gap-3 flex-1 min-w-0">
            {/* Heading + Trustpilot (tighter vertical rhythm) */}
            {(heading || displayReviews) && (
              <div className="flex flex-col gap-0.5">
                {heading && (
                  <h3 className="text-[18px] lg:text-[20px] font-semibold text-black leading-tight">
                    {heading}
                  </h3>
                )}

                {/* Trustpilot reviews - Desktop only */}
                {displayReviews && (
                  <div className="hidden lg:flex items-center text-[13px] text-[#6B7280] leading-none">
                    <span>{displayReviews} reviews by</span>
                    <Image
                      src="/trustpilot-logo.svg"
                      alt="Trustpilot"
                      width={104}
                      height={24}
                      className="h-6 w-auto"
                    />
                  </div>
                )}
              </div>
            )}

            <div className="text-xs lg:text-base text-black">
              {description ? (
                <p
                  className="mb-1 text-[15px] lg:text-[16px] font-semibold leading-[1.4] text-black"
                  dangerouslySetInnerHTML={{ __html: description }}
                />
              ) : null}
              <ul className="list-disc ml-5 flex flex-col gap-0.5">
                {features.map((feature, index) => (
                  <li
                    key={index}
                    dangerouslySetInnerHTML={{ __html: feature }}
                  />
                ))}
              </ul>
            </div>

            {/* Stats box hidden for now per updated adwall UI.
            {(minCreditScore || maxLoanAmount || aprRange) && (
              <div
                data-stats-equalize="true"
                className="grid grid-cols-3 gap-2 lg:gap-3 w-full bg-[#f5f5f5] rounded-lg p-2.5 lg:p-3 text-center"
                style={statsMinWidthPx ? { minWidth: statsMinWidthPx } : undefined}
              >
                {minCreditScore && (
                  <div className="flex flex-col gap-0.5 items-center">
                    <p className="text-[8px] lg:text-[10px] font-medium text-general-muted-foreground tracking-wide leading-[1.3]">Min Credit Score</p>
                    <p className="text-sm lg:text-lg font-semibold text-primary-main leading-[1.2] tracking-tight">{minCreditScore}</p>
                  </div>
                )}
                {maxLoanAmount && (
                  <div className="flex flex-col gap-0.5 items-center">
                    <p className="text-[8px] lg:text-[10px] font-medium text-general-muted-foreground tracking-wide leading-[1.3]">Max Loan Amount</p>
                    <p className="text-sm lg:text-lg font-semibold text-primary-main leading-[1.2] tracking-tight">{maxLoanAmount}</p>
                  </div>
                )}
                {aprRange && (
                  <div className="flex flex-col gap-0.5 items-center">
                    <p className="text-[8px] lg:text-[10px] font-medium text-general-muted-foreground tracking-wide leading-[1.3]">APR Range</p>
                    <p className="text-sm lg:text-lg font-semibold text-primary-main leading-[1.2] tracking-tight">{aprRange}</p>
                  </div>
                )}
              </div>
            )} */}
          </div>

          {/* Rating + CTA Column */}
          <div className="flex flex-col gap-2 lg:gap-3 self-center items-center lg:items-stretch justify-center shrink-0 w-full lg:w-auto lg:min-w-[200px]">

            {/* Rating */}
            <div className="flex w-full flex-col items-start justify-center gap-1.5 border-t border-[#E5E7EB] pt-[10px] text-left lg:w-auto lg:items-center lg:border-t-0 lg:pt-0 lg:text-center">
              <div className="flex items-end justify-start gap-1 lg:justify-center">
                <p className="text-[28px] lg:text-[36px] font-semibold leading-none tracking-tight text-[#204C4B]">
                  {ratingsNumber}
                </p>
                <span className="mb-1 text-[13px] font-medium leading-none text-[#94A3B8]">/10</span>
              </div>
              <button
                type="button"
                className="inline-flex items-center gap-1 text-[11px] font-semibold leading-none text-[#9CA3AF] hover:text-[#6B7280] transition-colors"
                ref={scoreTriggerRef}
                onClick={() => {
                  // Position first so first render doesn't "jump" from top-left.
                  if (!isScoreModalOpen) positionScorePopover();
                  setIsScoreModalOpen((v) => !v);
                }}
                aria-haspopup="dialog"
                aria-expanded={isScoreModalOpen}
              >
                <span>Sagewise Score</span>
                <ChevronDown
                  className={cn("w-3.5 h-3.5 transition-transform", isScoreModalOpen ? "rotate-180" : "rotate-0")}
                  aria-hidden="true"
                />
              </button>
              <div className="flex items-center justify-start gap-0.5 lg:justify-center">
                {Array.from({ length: 5 }, (_, i) => (
                  <ScoreStar key={i} filled={i < fullStars} />
                ))}
              </div>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col gap-2 w-full pt-2 lg:pt-0">
              <Button
                variant="secondary"
                className="h-[41px] w-full rounded-lg px-3 py-0 text-[15px] font-bold text-white"
                onClick={handleButtonClick}
                icon={MoveRight}
                iconClass="w-4 h-4"
              >
                {buttonText}
              </Button>
              {phoneNumber && (
                <a
                  href={toTelHref(phoneNumber)}
                  className="flex items-center justify-center gap-2 h-[41px] w-full rounded-lg border border-[#d4d4d4] bg-white px-3 py-0 text-[15px] font-medium text-black shadow-sm transition-colors hover:bg-gray-50"
                  aria-label={`Call ${phoneNumber}`}
                >
                  <Phone className="w-3.5 h-3.5" />
                  <span>{phoneNumber}</span>
                </a>
              )}
            </div>
          </div>
        </div>

      </div>

      {isScoreModalOpen && (
        <div
          ref={scorePopoverRef}
          role="dialog"
          aria-label="Sagewise Score breakdown"
          className={cn(
            "z-[1001] rounded-2xl shadow-2xl",
            "bg-[#0B1F2A] text-white"
          )}
          style={scorePopoverStyle}
          onClick={(e) => e.stopPropagation()}
        >
            <div className="px-4 py-3 flex items-start justify-between gap-3">
              <div className="text-[13px] font-semibold leading-snug">
                {(heading || "Offer") + " — Sagewise Score breakdown"}
              </div>
            </div>

            <div className="px-4 pb-4 space-y-3">
              {scoreBreakdown.map((row) => {
                const valueNum = Number.parseFloat(row.value);
                const pct = Math.max(0, Math.min(100, (valueNum / 10) * 100));
                return (
                  <div key={row.label} className="space-y-1.5">
                    <div className="flex items-center justify-between text-[13px]">
                      <span className="font-semibold text-white/90">{row.label}</span>
                      <span className="font-semibold text-white/90">{row.value}</span>
                    </div>
                    <div className="h-1.5 rounded-full bg-white/10 overflow-hidden">
                      <div className="h-full bg-emerald-400 rounded-full" style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                );
              })}

              <div className="pt-1 border-t border-white/10 flex items-center justify-between text-[12px] text-white/70">
                <span>Weighted to your loan type.</span>
                <button
                  type="button"
                  className="text-white/90 underline underline-offset-2 hover:text-white"
                  onClick={() => {
                    setIsScoreModalOpen(false);
                    setIsHowWeScoreOpen(true);
                  }}
                >
                  How we score ›
                </button>
              </div>
            </div>
          </div>
      )}

      {isHowWeScoreOpen && (
        <>
          <div
            className="fixed inset-0 z-[1100] bg-black/50"
            aria-hidden="true"
            onClick={() => setIsHowWeScoreOpen(false)}
          />
          <div
            role="dialog"
            aria-modal="true"
            aria-label="How the Sagewise Score works"
            className={cn(
              "fixed left-1/2 top-1/2 z-[1101] -translate-x-1/2 -translate-y-1/2",
              "w-[92vw] max-w-[520px]",
              "rounded-xl bg-white shadow-2xl"
            )}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-4 px-4 py-3 border-b border-general-border">
              <div className="text-sm font-semibold text-[#111827]">How the Sagewise Score Works</div>
              <button
                type="button"
                onClick={() => setIsHowWeScoreOpen(false)}
                className="text-[#6B7280] hover:text-[#111827] transition-colors"
                aria-label="Close"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="px-4 py-3 max-h-[70vh] overflow-y-auto text-[12px] text-[#374151] space-y-4">
              <p className="leading-relaxed">
                The Sagewise Score is a 0–10 rating that combines four objective factors. We use it to rank lenders across
                different loan categories, and we periodically update scores as lender performance data changes.
              </p>

              <div>
                <div className="text-[11px] font-semibold tracking-wide text-[#6B7280] mb-2">
                  WHAT WE MEASURE
                </div>

                <div className="rounded-lg border border-general-border divide-y divide-general-border overflow-hidden">
                  <div className="px-3 py-2">
                    <div className="text-[12px] font-semibold text-[#111827]">Reputation</div>
                    <div className="text-[12px] text-[#6B7280] leading-relaxed">
                      Years in business, BBB rating, NMLS standing, and regulatory history.
                    </div>
                  </div>
                  <div className="px-3 py-2">
                    <div className="text-[12px] font-semibold text-[#111827]">Customer Reviews</div>
                    <div className="text-[12px] text-[#6B7280] leading-relaxed">
                      Aggregated ratings across major review platforms (e.g., Trustpilot, Google).
                    </div>
                  </div>
                  <div className="px-3 py-2">
                    <div className="text-[12px] font-semibold text-[#111827]">Funding Speed</div>
                    <div className="text-[12px] text-[#6B7280] leading-relaxed">
                      Time-to-close benchmarks and ease-of-process signals from borrower feedback.
                    </div>
                  </div>
                  <div className="px-3 py-2">
                    <div className="text-[12px] font-semibold text-[#111827]">Rate Competitiveness</div>
                    <div className="text-[12px] text-[#6B7280] leading-relaxed">
                      Typical APRs and advertised pricing relative to the market for similar borrower profiles.
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <div className="text-[11px] font-semibold tracking-wide text-[#6B7280] mb-2">
                  WEIGHTED TO YOUR LOAN TYPE
                </div>
                <p className="leading-relaxed text-[#6B7280]">
                  Different loan types prioritize different factors. For example, cash-out and HELOC products may weigh
                  funding speed differently than purchase loans. We adjust weights so the score best reflects what matters
                  most for that loan category.
                </p>
              </div>

              <div className="pt-2 border-t border-general-border text-[11px] text-[#9CA3AF]">
                Last updated May 2026 · Version 0.1.2
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default AdsWallCards;
